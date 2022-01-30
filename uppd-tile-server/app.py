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
import json

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
    global con
    pool = await asyncpg.create_pool(
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "changeMe"),
        database=os.getenv("DATABASE", "uppd_data"),
        host="localhost", #os.getenv("localhost"),
        port=5432,
    )
    con = await asyncpg.connect(
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "changeMe"),
        database=os.getenv("DATABASE", "uppd_data"),
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
    print("Tile server has started")
    await db_connection_pool()

# commune_query_template = Template(
#     """
#     SELECT ST_AsMVT(tile, 'tile')
#     FROM (
#         SELECT count(ei.event_id) as no_of_articles,
#             c.commune_id,
#             ST_AsMVTGeom(ST_Transform(ST_SetSRID(hc.geom,4326), 3857),
#             ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
#                 4096, 0, false) AS gs
#         FROM    events e inner join event_info ei on e.event_id = ei.event_id inner join  commune  c on ei.commune_id = c.commune_id inner join  haiti_commune  hc on c.commune_id = hc.gid where ei.tone between  ${start_tone} and ${end_tone} AND ei.publication_date between '${start_date}' and '${end_date}' and ei.language = '${language}' group by (c.commune_id,hc.geom)
#     ) AS tile;
#     """   
# )
commune_query_template = Template(
    """
    SELECT ST_AsMVT(tile, 'tile')
    FROM (
        SELECT count(ei.event_id) as no_of_articles,
            c.commune_id,
            ST_AsMVTGeom(ST_Transform(ST_SetSRID(hc.geom,4326), 3857),
            ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
                4096, 0, false) AS gs
        FROM    events e inner join event_info ei on e.event_id = ei.event_id inner join  commune  c on ei.commune_id = c.commune_id inner join  haiti_commune  hc on c.commune_id = hc.gid where ${cond_str} AND ei.publication_date between '${start_date}' and '${end_date}' and ei.language = '${language}' group by (c.commune_id,hc.geom)
    ) AS tile;
    """   
)

async def get_commune(request):
    """Parse request parameters and get tile"""
    #fields = request.query_params.get("fields", "gid")
    #fields = ",".join([f'"{field}"' for field in fields.split(",")])
    x = request.path_params["x"]
    y = request.path_params["y"]
    z = request.path_params["z"]
    start_date = request.path_params['start_date']
    end_date = request.path_params['end_date']
    language=request.path_params['language']
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    #s1 = str()
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            print('hai')
            cond_str = cond_str + ' and tone between '+request.query_params['tone_start_range'] + ' and '+ request.query_params['tone_end_range'] 
        elif  url_str.find(param) != -1 :
            cond_str = cond_str + f' and {param} = '+"'"+request.query_params[param]+"'" 
    print(cond_str)        
    return await get_commune_tile(x, y, z, start_date,end_date,language,cond_str)

async def get_commune_tile(x, y, z,start_date,end_date,language, cond_str):
    """Retrieve the year tile from the database or cache"""
    #tilepath = f"{CACHE_DIR}/{z}/{x}/{y}.pbf"
    xmin, xmax, ymin, ymax = tile_extent(x, y, z)
    query = commune_query_template.substitute(
        xmin=xmin,
        xmax=xmax,
        ymin=ymin,
        ymax=ymax,
        cond_str =cond_str,
        start_date = start_date,
        end_date=end_date,
        language=language
    )
    print("commun equery",query)
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
    print("innn")
    month_query = query_template2.substitute(
        month_number=month_number,
        year=year
    )
    print(month_query) 
    dict_new = dict()
    dict_group_count = dict()
    dict_group_details = dict()
    async with pool.acquire() as conn:
        #print("conn",conn)
        tile12 = await conn.fetch(month_query)
        all_sub_commune = [i for i in range(1,35)]
        print(all_sub_commune)
        for i in all_sub_commune:
            l = []
            final_group_details = {}
            for r in iter(tile12):
                print(r['group_id'])
                arr = r['sub_commune_influence'].split('[')[1].split(']')[0]
                sc_list = list(map(int, arr.split(",")))
                temp_group_details = {}
                temp_group_details['name'] = r['name']
                temp_group_details['type'] = r['type']
                temp_group_details['leader_name'] = r['leader_name']
                temp_group_details['key_activities'] = r['key_activities']
                temp_group_details['group_size'] = int(r['group_size'])
                temp_group_details['affiliation'] = r['affiliation'] 
                temp_group_details['alliance_groups'] = r['alliance_groups']
                temp_group_details['rival_groups'] = r['rival_groups']
                print("influence array:",sc_list,"sub commune id ",i)
                if sc_list.count(i) > 0:
                    print("done")
                    if l.count(r['group_id']) == 0:
                        l.append(int(r['group_id']))
                    final_group_details[int(r['group_id'])] = temp_group_details
            dict_new[i] = l
            dict_group_details[i] = final_group_details
            dict_group_count[i] = len(dict_new[i])
        print(dict_group_count)
    for s in all_sub_commune:
        query2 = query_template3.substitute(
            sub_commune_id=s,
            group_count=dict_group_count[s],
            group_list = dict_new[s],
            group_details = json.dumps(dict_group_details[s])
        ) 
        print("query2",query2)
        async with pool.acquire() as conn:
            await conn.execute(query2)   

    return Response("success")       


async def get_subcommune(request):
    """Parse request parameters and get tile"""
    fields = request.query_params.get("fields", "gid")
    print("args:::",fields)
    fields = ",".join([f'"{field}"' for field in fields.split(",")])
    x = request.path_params["x"]
    y = request.path_params["y"]
    z = request.path_params["z"]
    month_number = request.path_params['month_number']
    year = request.path_params['year']
    await get_temp_res(month_number,year)
    return await get_subcommune_tile(x, y, z, fields,month_number,year)

async def get_subcommune_tile(x, y, z, fields="gid",month_number=12,year=2021):

    """Retrieve the year tile from the database or cache"""
    #tilepath = f"{CACHE_DIR}/{month_number}/{year}/{z}/{x}/{y}.pbf"
    xmin, xmax, ymin, ymax = tile_extent(x, y, z)
    query = subcommune_query_template1.substitute(
        xmin=xmin,
        xmax=xmax,
        ymin=ymin,
        ymax=ymax,
    )
    async with pool.acquire() as conn:
        tile = await conn.fetchval(query)  
        print("tile:",tile)
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
    select ei.pub_month , e.type  as event_type , count(ei.event_info_id) as no_of_articles from event_info ei left join events e on e.event_id = ei.event_id  where ${cond_str} and ei.publication_date between '${start_date}' and '${end_date}' and  ei.language = '${language}'  group by (ei.pub_month,e.type) ;
    """
)

async def articles_per_event(request):
    print(request.path_params['language'])
    language = request.path_params['language']
    start_date =request.path_params['start_date']
    end_date= request.path_params['end_date']
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    #s1 = str()
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            print('hai')
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
    #print(query_res)
    async with pool.acquire() as conn:
            data_res = await conn.fetch(query)
            print("tile:",data_res)
            #data1 = json.loads(tile)
            #print(data1)
            data = []
            for record in iter(data_res):
                #print(d)
                obj = dict()
                obj['pub_month'] = record['pub_month']
                obj['event_type'] = record['event_type']
                obj['no_of_articles'] = record['no_of_articles']
                data.append(obj)
    return JSONResponse({"success":"true","data":data})

query_template5 = Template(
    """
    select ei.pub_month , count(ei.event_info_id) as no_of_articles, avg(ei.tone) as avg_tone from event_info ei left join events e on e.event_id = ei.event_id  where ${cond_str} and ei.publication_date between '${start_date}' and '${end_date}' and  ei.language = '${language}'  group by ei.pub_month ;
    """
)


async def avg_tone(request):
    language = request.path_params['language']
    start_date =request.path_params['start_date']
    end_date= request.path_params['end_date']
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    #s1 = str()
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            print('hai')
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
    async with pool.acquire() as conn:
            data_res = await conn.fetch(query)
            print("tile:",data_res)
            #data1 = json.loads(tile)
            #print(data1)
            data = []
            for record in iter(data_res):
                #print(d)
                obj = dict()
                obj['pub_month'] = record['pub_month']
                obj['no_of_articles'] = record['no_of_articles']
                obj['avg_tone'] = record['avg_tone']
                data.append(obj)
            print("asass",data)

    return JSONResponse({"success":"true","data":data})


query_template6 = Template(
    """
    select ei.pub_month , ei.commune_id , count(ei.event_info_id) as  no_of_articles from event_info ei left join events e on e.event_id = ei.event_id  where ${cond_str} and ei.publication_date between '${start_date}' and '${end_date}' and  ei.language = '${language}'  group by (ei.pub_month,ei.commune_id) ;
    """
)

async def articles_per_commune(request):
    language = request.path_params['language']
    start_date =request.path_params['start_date']
    end_date= request.path_params['end_date']
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    #s1 = str()
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            print('hai')
            cond_str = cond_str + ' and tone between '+request.query_params['tone_start_range'] + ' and '+ request.query_params['tone_end_range'] 
        elif  url_str.find(param) != -1 :
            cond_str = cond_str + f' and {param} = '+"'"+request.query_params[param]+"'" 
    print(cond_str)  
    query = query_template6.substitute(
        start_date=start_date,
        end_date=end_date,
        language=language,
        cond_str=cond_str
    )
    async with pool.acquire() as conn:
            data_res = await conn.fetch(query)
            print("tile:",data_res)
            data = []
            for record in iter(data_res):
                #print(d)
                obj = dict()
                obj['pub_month'] = record['pub_month']
                obj['no_of_articles'] = record['no_of_articles']
                obj['commune_id'] = record['commune_id']
                data.append(obj)
            print("asass",data)
    return JSONResponse({"success":"true","data":data})

articles_query = Template (
    """
    select * from event_info ei inner join events e on ei.event_id = e.event_id  where ${cond_str} and ei.publication_date between '${start_date}' and '${end_date}' and   ei.language = '${language}' 
    """
)

async def get_articles(request):
    language = request.path_params['language']
    start_date =request.path_params['start_date']
    end_date= request.path_params['end_date']
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    #s1 = str()
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            print('hai')
            cond_str = cond_str + ' and tone between '+request.query_params['tone_start_range'] + ' and '+ request.query_params['tone_end_range'] 
        elif  url_str.find(param) != -1 :
            cond_str = cond_str + f' and {param} = '+"'"+request.query_params[param]+"'" 
    print(cond_str)      
    
    query = articles_query.substitute(
        start_date=start_date,
        end_date=end_date,
        language=language,
        cond_str=cond_str
    )
   
    async with pool.acquire() as conn:
        print(query)
        data_res = await conn.fetch(query)
        print(data_res)
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

test_query = Template(
    """
    select * from event_info where ${condition}
    """
)

async  def test(request):
    #l = request.json()
    param_list = ['tone_start_range','source','type']
    url_str = str(request.query_params)
    #s1 = str()
    cond_str = ' 1=1 '
    for param in param_list:
        if url_str.find(param) != -1 and param == 'tone_start_range':
            print('hai')
            cond_str = cond_str + ' and tone between '+request.query_params['tone_start_range'] + ' and '+ request.query_params['tone_end_range'] 
        elif  url_str.find(param) != -1 :
            cond_str = cond_str + f' and {param} = '+"'"+request.query_params[param]+"'"    
            
            
    print(cond_str)        


    print("st", )
    #print(request.url.params)
    print(request.query_params)

    d  = decimal.Decimal('10')
    print(type(int(d)))
    obj = {}
    obj['a'] = 10
    obj['b'] = 20
    print(type(obj))
    
    async with pool.acquire() as conn:
        #print("conn",conn)
        month_query = 'select * from sub_commune_group_count_map'
        tile12 = await conn.fetch(month_query)
        print(type(tile12[33]['group_details']))
        print(json.loads(tile12[33]['group_details']))
        jdata =  json.loads(tile12[33]['group_details'])
        #print(jdata['2']['name'])
    return JSONResponse({"sucess":"true","data":"tile12"})



routes = [
    Route("/", index),
    Route("/get-commune/{start_date:str}/{end_date:str}/{language:str}/{z:int}/{x:int}/{y:int}",get_commune),
    Route("/get-subcommune/{month_number:int}/{year:int}/{z:int}/{x:int}/{y:int}",get_subcommune),
    Route("/get-articles/{start_date:str}/{end_date:str}/{language:str}",get_articles),
    Route("/data/articles-per-event/{start_date:str}/{end_date:str}/{language:str}",articles_per_event),
    Route("/data/avg-tone/{start_date:str}/{end_date:str}/{language:str}",avg_tone),
    Route("/data/articles-per-commune/{start_date:str}/{end_date:str}/{language:str}",articles_per_commune),
    Route("/test",test)
]

middleware = [
    Middleware(CORSMiddleware, allow_origins=["*"])
    ]
app = Starlette(routes=routes, middleware=middleware, on_startup=[on_startup])

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)