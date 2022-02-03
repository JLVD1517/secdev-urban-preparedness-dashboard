import aiofiles
import asyncio
import asyncpg
import datetime
import decimal
import json
import os
import tempfile
import zipfile
from starlette.applications import Starlette
from starlette.datastructures import URL, QueryParams
from starlette.responses import (
    FileResponse,
    HTMLResponse,
    Response,
    JSONResponse as StarletteJSONResponse,
)
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from string import Template
from tenacity import retry, stop_after_attempt, wait_fixed
import uvicorn
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(BASE_DIR, "cache")
pool = None

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            # wanted a simple yield str(o) in the next line,
            # but that would mean a yield on the line with super(...),
            # which wouldn't work (see my comment below), so...
            return (str(o) for o in [o])
        return super(DecimalEncoder, self).default(o)


class ResponseEncoder(json.JSONEncoder):
    def default(_, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        elif isinstance(obj, datetime.date):
            return obj.isoformat()
        return super().default(obj)


class JSONResponse(StarletteJSONResponse):
    def render(_, content):
        return json.dumps(content, cls=ResponseEncoder).encode()


@retry(
    wait=wait_fixed(int(os.getenv("RETRY_WAIT", 5))),
    stop=stop_after_attempt(int(os.getenv("RETRY_COUNT", 12))),
)
async def db_connection_pool():
    """Create a database connection pool"""
    global pool
    pool = await asyncpg.create_pool(
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "changeMe"),
        database=os.getenv("DATABASE", "secdev_data"),
        host="localhost", #os.getenv("localhost"),
        port=5432,
    )
    



def tile_extent(x, y, z):
    """Calculate the extent of the tile"""
    # Width of world in EPSG:3857 aka Web Mercator
    webMercMax = 20037508.3427892
    webMercMin = -1 * webMercMax
    webMercSize = webMercMax - webMercMin
    # Width in tiles
    webTileSize = 2 ** z
    # Tile width in EPSG:3857
    tileSize = webMercSize / webTileSize
    # Calculate geographic bounds from tile coordinates
    # XYZ tile coordinates are in "image space" so origin is
    # top-left, not bottom right
    xmin = webMercMin + tileSize * x
    xmax = webMercMin + tileSize * (x + 1)
    ymin = webMercMax - tileSize * (y + 1)
    ymax = webMercMax - tileSize * (y)
    return xmin, xmax, ymin, ymax


async def on_startup():
    """Operations to perform when application starts up"""
    await db_connection_pool()

commune_query_template = Template(
    """
    SELECT ST_AsMVT(tile, 'tile')
    FROM (
        SELECT * FROM (
            SELECT ST_AsMVTGeom(ST_Transform(ST_SetSRID(geom,4326), 3857),
            ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
                4096, 0, false) AS g ,
                 gid,
                 ${commune_name}
                  FROM haiti_commune  ) AS hc left join  ( 
        SELECT count(ei.event_id) as no_of_articles,
            avg(ei.tone) as avg_tone,
            c.commune_id
        FROM    events e inner join event_info ei on e.event_id = ei.event_id inner join  commune  c on ei.commune_id = c.commune_id  where ${cond_str} AND TO_DATE(ei.publication_date,'dd-mm-yyyy') >= TO_DATE('${start_date}','dd-mm-yyyy') and TO_DATE(ei.publication_date,'dd-mm-yyyy') <= TO_DATE('${end_date}','dd-mm-yyyy') and ei.language = '${language}' group by (c.commune_id)  ) as d on d.commune_id = hc.gid 
    ) AS tile;
    """   
)


async def get_commune(request):
    """Parse request parameters and get tile"""
    x = request.path_params["x"]
    y = request.path_params["y"]
    z = request.path_params["z"]
    start_date = request.path_params['start_date']
    end_date = request.path_params['end_date']
    language=request.path_params['language']
    commune_name = 'adm2_en'
    if language == 'FRENCH':
        commune_name = 'adm2_fr'
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            cond_str = cond_str + ' and tone between '+request.query_params['tone_start_range'] + ' and '+ request.query_params['tone_end_range'] 
        elif  url_str.find(param) != -1 :
            cond_str = cond_str + f' and {param} = '+"'"+request.query_params[param]+"'" 
    return await get_commune_tile(x, y, z, start_date,end_date,language,cond_str,commune_name)

async def get_commune_tile(x, y, z,start_date,end_date,language, cond_str,commune_name):
    """Retrieve the year tile from the database or cache"""
    xmin, xmax, ymin, ymax = tile_extent(x, y, z)
    query = commune_query_template.substitute(
        xmin=xmin,
        xmax=xmax,
        ymin=ymin,
        ymax=ymax,
        cond_str =cond_str,
        start_date = start_date,
        end_date=end_date,
        language=language,
        commune_name=commune_name
    )
    async with pool.acquire() as conn:
        tile = await conn.fetchval(query)
    response = Response(tile, media_type="application/x-protobuf")
    return response


subcommune_query_template1 = Template(
    """
    SELECT ST_AsMVT(tile, 'tile')
    FROM (
        SELECT scgc.group_count AS no_of_groups,
            hsb.gid,
            hsb.adm3_en,
            scgc.group_list,
            scgc.group_details::json,
            ST_AsMVTGeom(ST_Transform(ST_SetSRID(hsb.geom,4326), 3857),
            ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
                4096, 0, false) AS g
        FROM sub_commune_group_count_map as scgc inner join haiti_subcommune AS hsb on  scgc.sub_commune_id = hsb.gid 
    ) AS tile;
    """    
)


query_template2 = Template(
    """
        SELECT * 
        FROM group_records where month_number = ${month_number} and year = ${year} order by group_record_id asc 
    """
)
query_template3 = Template(
    """
        insert into sub_commune_group_count_map values(${sub_commune_id},${group_count},ARRAY${group_list}::INT[],'${group_details}') on conflict(sub_commune_id) do  update set group_count = ${group_count},group_list = ARRAY${group_list}::INT[],group_details='${group_details}'
    """   
)


#async def get_temp_res(request):
async def get_temp_res(month_number,year):
    month_query = query_template2.substitute(
        month_number=month_number,
        year=year
    )
    dict_new = dict()
    dict_group_count = dict()
    dict_group_details = dict()
    async with pool.acquire() as conn:
        tile_res = await conn.fetch(month_query)
        all_sub_commune = [i for i in range(1,35)]
        for i in all_sub_commune:
            group_list_arr = []
            final_group_details = {}
            for record in iter(tile_res):
                arr = record['sub_commune_influence'].split('[')[1].split(']')[0]
                sc_list = list(map(int, arr.split(",")))
                temp_group_details = {}
                temp_group_details['name'] = record['name']
                temp_group_details['type'] = record['type']
                temp_group_details['leader_name'] = record['leader_name']
                temp_group_details['key_activities'] = record['key_activities']
                temp_group_details['group_size'] = int(record['group_size'])
                temp_group_details['affiliation'] = record['affiliation'] 
                temp_group_details['alliance_groups'] = record['alliance_groups']
                temp_group_details['rival_groups'] = record['rival_groups']
                if sc_list.count(i) > 0:
                    if group_list_arr.count(record['group_id']) == 0:
                        group_list_arr.append(int(record['group_id']))
                    final_group_details[int(record['group_id'])] = temp_group_details
            dict_new[i] = group_list_arr
            dict_group_details[i] = final_group_details
            dict_group_count[i] = len(dict_new[i])
    for sid in all_sub_commune:
        query2 = query_template3.substitute(
            sub_commune_id=sid,
            group_count=dict_group_count[sid],
            group_list = dict_new[sid],
            group_details = json.dumps(dict_group_details[sid])
        ) 
        async with pool.acquire() as conn:
            await conn.execute(query2)   

    return Response("success")     

subcommune_group_query_template = Template(
    """
    SELECT ST_AsMVT(tile, 'tile')
    FROM (
        SELECT 
            hsb.gid,
            hsb.adm3_en,
            gscm.group_details::json,
            ST_AsMVTGeom(ST_Transform(ST_SetSRID(hsb.geom,4326), 3857),
            ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
                4096, 0, false) AS g
        FROM group_sub_commune_map as gscm inner join haiti_subcommune AS hsb on  gscm.sub_commune_id = hsb.gid 
    ) AS tile;
    """    
)


group_template = Template(
    """
        SELECT * 
        FROM group_records where month_number = ${month_number} and year = ${year} and group_id = ${group_id} order by group_record_id asc 
    """
)
group_query_template = Template(
    """
        insert into group_sub_commune_map values(${sub_commune_id},${group_id},'${group_details}') on conflict(sub_commune_id) do  update set group_id = ${group_id}, group_details='${group_details}'
    """ 
)

async def get_temp_group_res(month_number,year,group_id):
    group_query = group_template.substitute(
        month_number=month_number,
        year=year,
        group_id=group_id,
    )
    async with pool.acquire() as conn:
        group_res = await conn.fetch(group_query)
        print(group_res)
        sub_commune_list = []
        group_details = {}
        for record in iter(group_res):
            print("innnnnnnn")
            arr = record['sub_commune_influence'].split('[')[1].split(']')[0]
            sc_list = list(map(int, arr.split(",")))
            temp_group_details = {}
            temp_group_details['name'] = record['name']
            temp_group_details['type'] = record['type']
            temp_group_details['leader_name'] = record['leader_name']
            temp_group_details['key_activities'] = record['key_activities']
            temp_group_details['group_size'] = int(record['group_size'])
            temp_group_details['affiliation'] = record['affiliation'] 
            temp_group_details['alliance_groups'] = record['alliance_groups']
            temp_group_details['rival_groups'] = record['rival_groups']
            for sid in sc_list:
                print("sid",sid)
                if sub_commune_list.count(sid) == 0:
                    sub_commune_list.append(sid)
                group_details[group_id] = temp_group_details
    for sid in sub_commune_list:
        group_table_query = group_query_template.substitute(
            sub_commune_id=sid,
            group_id=group_id,
            group_details = json.dumps({group_id:group_details[group_id]})
        ) 
        print(group_table_query)
        async with pool.acquire() as conn:
            await conn.execute(group_table_query)            
    return Response("success")        



async def get_subcommune_group_tile(x,y,z,fields='gid'):
    """Retrieve the year tile from the database or cache"""
    xmin, xmax, ymin, ymax = tile_extent(x, y, z)
    query = subcommune_group_query_template.substitute(
        xmin=xmin,
        xmax=xmax,
        ymin=ymin,
        ymax=ymax,
    )
    async with pool.acquire() as conn:
        tile = await conn.fetchval(query)  
    response = Response(tile, media_type="application/x-protobuf")
    return response



async def get_subcommune(request):
    """Parse request parameters and get tile"""
    fields = request.query_params.get("fields", "gid")
    fields = ",".join([f'"{field}"' for field in fields.split(",")])
    x = request.path_params["x"]
    y = request.path_params["y"]
    z = request.path_params["z"]
    month_number = request.path_params['month_number']
    year = request.path_params['year']
    url_str = str(request.query_params)
    if url_str.find('group_id') != -1:
        group_id = request.query_params['group_id']
        await get_temp_group_res(month_number,year,group_id)
        return await get_subcommune_group_tile(x, y, z, fields)
    else:     
        await get_temp_res(month_number,year)
        return await get_subcommune_tile(x, y, z, fields)

async def get_subcommune_tile(x, y, z, fields="gid"):

    """Retrieve the year tile from the database or cache"""
    xmin, xmax, ymin, ymax = tile_extent(x, y, z)
    query = subcommune_query_template1.substitute(
        xmin=xmin,
        xmax=xmax,
        ymin=ymin,
        ymax=ymax,
    )
    async with pool.acquire() as conn:
        tile = await conn.fetchval(query)  
    response = Response(tile, media_type="application/x-protobuf")
    return response

async def index(request):
    """Serve test index.html to help with debugging"""
    if pool is None:
        await db_connection_pool()
    async with aiofiles.open(
        os.path.join(BASE_DIR, "html", "index.html"), mode="r"
    ) as f:
        html = await f.read()
    return HTMLResponse(html)

query_template4 = Template(
    """
    select  e.type  as event_type , count(ei.event_info_id) as no_of_articles from event_info ei left join events e on e.event_id = ei.event_id  where ${cond_str} and TO_DATE(ei.publication_date,'dd-mm-yyyy') >= TO_DATE('${start_date}','dd-mm-yyyy') and TO_DATE(ei.publication_date,'dd-mm-yyyy') <= TO_DATE('${end_date}','dd-mm-yyyy') and  ei.language = '${language}'  group by (e.type) ;
    """
)

async def articles_per_event(request):
    print(request.path_params['language'])
    language = request.path_params['language']
    start_date =request.path_params['start_date']
    end_date= request.path_params['end_date']
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            cond_str = cond_str + ' and tone between '+request.query_params['tone_start_range'] + ' and '+ request.query_params['tone_end_range'] 
        elif  url_str.find(param) != -1 :
            cond_str = cond_str + f' and {param} = '+"'"+request.query_params[param]+"'" 
    print(cond_str)  
    query = query_template4.substitute(
        start_date=start_date,
        end_date=end_date,
        language=language,
        cond_str=cond_str
    )
    async with pool.acquire() as conn:
            data_res = await conn.fetch(query)
            data = []
            for record in iter(data_res):
                obj = dict()
                obj['event_type'] = record['event_type']
                obj['no_of_articles'] = record['no_of_articles']
                data.append(obj)
    return JSONResponse({"success":"true","data":data})

query_template5 = Template(
    """
    select ei.pub_month , count(ei.event_info_id) as no_of_articles, avg(ei.tone) as avg_tone from event_info ei left join events e on e.event_id = ei.event_id  where ${cond_str} and TO_DATE(ei.publication_date,'dd-mm-yyyy') >= TO_DATE('${start_date}','dd-mm-yyyy') and TO_DATE(ei.publication_date,'dd-mm-yyyy') <= TO_DATE('${end_date}','dd-mm-yyyy') and  ei.language = '${language}'  group by ei.pub_month ;
    """
)


async def avg_tone(request):
    language = request.path_params['language']
    start_date =request.path_params['start_date']
    end_date= request.path_params['end_date']
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            cond_str = cond_str + ' and tone between '+request.query_params['tone_start_range'] + ' and '+ request.query_params['tone_end_range'] 
        elif  url_str.find(param) != -1 :
            cond_str = cond_str + f' and {param} = '+"'"+request.query_params[param]+"'" 
    print(cond_str)  
    query = query_template5.substitute(
        start_date=start_date,
        end_date=end_date,
        language=language,
        cond_str=cond_str
    )
    pub_month_query = "update event_info set pub_month =  split_part(publication_date,'-',2)||'-'||split_part(publication_date,'-',3) "
    async with pool.acquire() as conn:
        await conn.fetch(pub_month_query)
        data_res = await conn.fetch(query)
        data = []
        for record in iter(data_res):
            obj = dict()
            obj['pub_month'] = record['pub_month']
            obj['no_of_articles'] = record['no_of_articles']
            obj['avg_tone'] = record['avg_tone']
            data.append(obj)
    return JSONResponse({"success":"true","data":data})


query_template6 = Template(
    """
    select ei.pub_month , ei.commune_id , count(ei.event_info_id) as  no_of_articles from event_info ei left join events e on e.event_id = ei.event_id  where ${cond_str} and TO_DATE(ei.publication_date,'dd-mm-yyyy') >= TO_DATE('${start_date}','dd-mm-yyyy') and TO_DATE(ei.publication_date,'dd-mm-yyyy') <= TO_DATE('${end_date}','dd-mm-yyyy') and  ei.language = '${language}'  group by (ei.pub_month,ei.commune_id) ;
    """
)

async def articles_per_commune(request):
    language = request.path_params['language']
    start_date =request.path_params['start_date']
    end_date= request.path_params['end_date']
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            cond_str = cond_str + ' and tone between '+request.query_params['tone_start_range'] + ' and '+ request.query_params['tone_end_range'] 
        elif  url_str.find(param) != -1 :
            cond_str = cond_str + f' and {param} = '+"'"+request.query_params[param]+"'"   
    query = query_template6.substitute(
        start_date=start_date,
        end_date=end_date,
        language=language,
        cond_str=cond_str
    )
    pub_month_query = "update event_info set pub_month =  split_part(publication_date,'-',2)||'-'||split_part(publication_date,'-',3) "
    async with pool.acquire() as conn:
            await conn.fetch(pub_month_query)
            data_res = await conn.fetch(query)
            data = []
            for record in iter(data_res):
                obj = dict()
                obj['pub_month'] = record['pub_month']
                obj['no_of_articles'] = record['no_of_articles']
                obj['commune_id'] = record['commune_id']
                data.append(obj)
    return JSONResponse({"success":"true","data":data})

articles_query = Template (
    """
    select * from event_info ei inner join events e on ei.event_id = e.event_id  where ${cond_str} and TO_DATE(ei.publication_date,'dd-mm-yyyy') >= TO_DATE('${start_date}','dd-mm-yyyy') and TO_DATE(ei.publication_date,'dd-mm-yyyy') <= TO_DATE('${end_date}','dd-mm-yyyy') and ei.language = '${language}'
    """
)

async def get_articles(request):
    language = request.path_params['language']
    start_date =request.path_params['start_date']
    end_date= request.path_params['end_date']
    param_list = ['tone_start_range','source','type', "commune_id"]
    url_str = str(request.query_params)
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            cond_str = cond_str + ' and tone between '+request.query_params['tone_start_range'] + ' and '+ request.query_params['tone_end_range'] 
        elif  url_str.find(param) != -1 :
            cond_str = cond_str + f' and {param} = '+"'"+request.query_params[param]+"'"       
    
    query = articles_query.substitute(
        start_date=start_date,
        end_date=end_date,
        language=language,
        cond_str=cond_str
    )
   
    async with pool.acquire() as conn:
        data_res = await conn.fetch(query)
        data_arr = []
        for data in iter(data_res):
            obj = {}
            obj['event_info_id'] = int(data['event_info_id'])
            obj['publication_date'] = data['publication_date']
            obj['source']= data['source'] 
            obj['title']=data['title'] 
            obj['url']=data['url'] 
            obj['summary']=data['summary'] 
            obj['tone']= int(data['tone']) 
            obj['compound']= int(data['compound']) 
            obj['commune_id']=int(data['commune_id'])
            obj['language']=data['language']
            obj['category'] = data['category']
            obj['event_type'] = data['type'] 
            data_arr.append(obj)
    return JSONResponse({"success":"true","data":data_arr})

async def get_event_type(request):
    query = 'select distinct(type) from events '
    async with pool.acquire() as conn:
        data_res = await conn.fetch(query)
        data = []
        for val in iter(data_res):
            data.append(val['type'])
    return JSONResponse({"success":"true","data":data})


routes = [
    Route("/", index),
    Route("/get-commune/{start_date:str}/{end_date:str}/{language:str}/{z:int}/{x:int}/{y:int}",get_commune),
    Route("/get-subcommune/{month_number:int}/{year:int}/{z:int}/{x:int}/{y:int}",get_subcommune),
    Route("/get-articles/{start_date:str}/{end_date:str}/{language:str}",get_articles),
    Route("/data/articles-per-event/{start_date:str}/{end_date:str}/{language:str}",articles_per_event),
    Route("/data/avg-tone/{start_date:str}/{end_date:str}/{language:str}",avg_tone),
    Route("/data/articles-per-commune/{start_date:str}/{end_date:str}/{language:str}",articles_per_commune),
    Route("/get-event-type",get_event_type)
]

middleware = [
    Middleware(CORSMiddleware, allow_origins=["*"])
    ]
app = Starlette(routes=routes, middleware=middleware, on_startup=[on_startup])

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)