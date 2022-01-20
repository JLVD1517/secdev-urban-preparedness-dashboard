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


async def get_tile(table, x, y, z, fields="gid"):
    """Retrieve the tile from the database or cache"""
    tilepath = f"{CACHE_DIR}/{table}/{z}/{x}/{y}.pbf"
    if not os.path.exists(tilepath):
        xmin, xmax, ymin, ymax = tile_extent(x, y, z)
        query = query_template.substitute(
            table=table, xmin=xmin, xmax=xmax, ymin=ymin, ymax=ymax, fields=fields
        )
        async with pool.acquire() as conn:
            tile = await conn.fetchval(query)
        if not os.path.exists(os.path.dirname(tilepath)):
            os.makedirs(os.path.dirname(tilepath))
        async with aiofiles.open(tilepath, mode="wb") as f:
            await f.write(tile)
        response = Response(tile, media_type="application/x-protobuf")
    else:
        response = FileResponse(tilepath, media_type="application/x-protobuf")
    return response


async def tile(request):
    """Parse request parameters and get tile"""
    fields = request.query_params.get("fields", "gid")
    fields = ",".join([f'"{field}"' for field in fields.split(",")])
    table = request.path_params["table"]
    x = request.path_params["x"]
    y = request.path_params["y"]
    z = request.path_params["z"]
    return await get_tile(table, x, y, z, fields)


async def get_year_tile(data_year, x, y, z, fields="gid"):
    """Retrieve the year tile from the database or cache"""
    tilepath = f"{CACHE_DIR}/{data_year}/{z}/{x}/{y}.pbf"
    if not os.path.exists(tilepath):
        xmin, xmax, ymin, ymax = tile_extent(x, y, z)
        query = year_query_template.substitute(
            data_year=data_year,
            xmin=xmin,
            xmax=xmax,
            ymin=ymin,
            ymax=ymax,
            fields=fields,
        )
        async with pool.acquire() as conn:
            tile = await conn.fetchval(query)
        if not os.path.exists(os.path.dirname(tilepath)):
            os.makedirs(os.path.dirname(tilepath))
        async with aiofiles.open(tilepath, mode="wb") as f:
            await f.write(tile)
        response = Response(tile, media_type="application/x-protobuf")
    else:
        response = FileResponse(tilepath, media_type="application/x-protobuf")
    return response


async def year_tile(request):
    """Parse request parameters and get tile"""
    fields = request.query_params.get("fields", "gid")
    fields = ",".join([f'"{field}"' for field in fields.split(",")])
    data_year = request.path_params["data_year"]
    x = request.path_params["x"]
    y = request.path_params["y"]
    z = request.path_params["z"]
    return await get_year_tile(data_year, x, y, z, fields)


async def insert_geometry(path):
    """Insert file into PostGIS table"""
    table_name = os.path.splitext(os.path.basename(path))[0]
    user = os.getenv("DB_USER", "postgres")
    password = (os.getenv("DB_PASSWORD", "changeMe"),)
    database = (os.getenv("DATABASE", "uppd_data"),)
    host = "0.0.0.0", #os.getenv("DB_HOST", "localhost")
    port = 5432
    cmd = f'ogr2ogr \
            -f "PostgreSQL" PG:"host={host} port={port} dbname={database} user={user} password={password}" \
            -lco GEOMETRY_NAME=geom \
            -lco FID=gid \
            -nlt PROMOTE_TO_MULTI \
            "{path}"'
    proc = await asyncio.create_subprocess_shell(
        cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise ValueError(f"\n{stderr.decode()}")


async def unzip(form, dest):
    # Hack because SpooledTemporaryFile doesn't implement seekable
    form["file"].file.seekable = lambda: True
    z = zipfile.ZipFile(form["file"].file)
    z.extractall(dest)
    # Check that all of the necessary files are present
    required_files = [False, False, False]
    for f in os.listdir(dest):
        if f.endswith(".shp"):
            required_files[0] = True
            shp_file = os.path.join(dest, f)
        elif f.endswith(".dbf"):
            required_files[1] = True
        elif f.endswith(".prj"):
            required_files[2] = True
    if not all(required_files):
        raise ValueError("Missing required file")
    return shp_file


async def upload(request):
    """Upload a zipped Shapefile into PostGIS"""
    form = await request.form()
    temp_dir = tempfile.mkdtemp()
    if form["file"].filename.endswith(".zip"):
        try:
            path = await unzip(form, temp_dir)
        except Exception as e:
            return Response(str(e), status_code=400)
    else:
        path = os.path.join(temp_dir, form["file"].filename)
        with open(path, "wb") as f:
            f.write(form["file"].file.read())
    try:
        await insert_geometry(path)
        table_name = os.path.splitext(os.path.basename(path))[0]
        if request.url.port is not None:
            url = f"{request.url.scheme}://{request.url.hostname}:{request.url.port}/layers/{table_name}"
        else:
            url = f"{request.url.scheme}://{request.url.hostname}/layers/{table_name}"
        return Response(f"Upload successful, layer can be accessed at {url}")
    except Exception as e:
        return Response(f"Error inserting geometry: {e}", status_code=500)
    finally:
        # Clean up temporary files
        for f in os.listdir(temp_dir):
            os.remove(os.path.join(temp_dir, f))
        os.rmdir(temp_dir)


async def fields(request):
    """List fields for the layer"""
    table = request.path_params["table"]
    query = f"SELECT * FROM {table} WHERE true LIMIT 1;"
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(query)
        except asyncpg.exceptions.UndefinedTableError:
            return JSONResponse(
                {"error": f"Table {table} does not exist"}, status_code=404
            )
    fields = [k for k in row.keys() if k != "geom"]
    return JSONResponse({"fields": fields, "error": None})


async def data_years(request):
    """Get the years of data available"""
    query = "SELECT DISTINCT data_year FROM view_data WHERE data_year IS NOT NULL ORDER BY data_year;"
    
    print("arr",[i for i in [1,2,3,4,5]])
    async with pool.acquire() as conn:
        rows = await conn.fetch(query)
        return JSONResponse({"years": [row[0] for row in rows], "error": None})


async def get_column(request):
    """Retrieve column data from a table"""
    column = request.path_params["column"]
    year = request.path_params["year"]
    query = f"SELECT {column} FROM view_data WHERE data_year = {year};"
    async with pool.acquire() as conn:
        try:
            rows = await conn.fetch(query)
            return JSONResponse({"data": [row[0] for row in rows]})
        except asyncpg.exceptions.UndefinedColumnError:
            return JSONResponse(
                {"error": f"Column {column} in view_data does not exist"},
                status_code=404,
            )
        except Exception as e:
            return JSONResponse({"error": str(e)}, status_code=500)


async def on_startup():
    """Operations to perform when application starts up"""
    variable = 'haha'
    print("server is started by sanjay",variable)
    await db_connection_pool()


query_template = Template(
    """
    SELECT ST_AsMVT(tile, 'tile')
    FROM (
        SELECT ${fields},
            ST_AsMVTGeom(ST_Transform(ST_SetSRID(geom,4326), 3857),
            ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
                4096, 0, false) AS g
        FROM ${table}
        WHERE (geom &&
            ST_Transform(ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857), 4326))
    ) AS tile;
    """
)


year_query_template = Template(
    """
    SELECT ST_AsMVT(tile, 'tile')
    FROM (
        SELECT ${fields},
            ST_AsMVTGeom(ST_Transform(ST_SetSRID(geom,4326), 3857),
            ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
                4096, 0, false) AS g
        FROM view_data
        WHERE (geom &&
            ST_Transform(ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857), 4326))
        AND data_year = ${data_year}
    ) AS tile;
    """
)
# commune_query_template = Template(
#     """
#     SELECT ST_AsMVT(tile, 'tile')
#     FROM (
#         SELECT gid,
#             ST_AsMVTGeom(ST_Transform(ST_SetSRID(geom,4326), 3857),
#             ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
#                 4096, 0, false) AS g
#         FROM haiti_commune
#         WHERE (geom &&
#             ST_Transform(ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857), 4326))
#     ) AS tile;
#     """
    
# )



# subcommune_query_template = Template(
#     """
#     SELECT ST_AsMVT(tile, 'tile')
#     FROM (
#         SELECT gid,
#             ST_AsMVTGeom(ST_Transform(ST_SetSRID(geom,4326), 3857),
#             ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
#                 4096, 0, false) AS g
#         FROM haiti_subcommune
#         WHERE (geom &&
#             ST_Transform(ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857), 4326))
#     ) AS tile;
#     """
    
# )

subcommune_query_template = Template(
    """
    SELECT tile
    FROM (
        SELECT ${fields},
            ST_AsMVTGeom(ST_Transform(ST_SetSRID(geom,4326), 3857),
            ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
                4096, 0, false) AS g
        FROM gang AS g, group_activities AS ga, sub_commune AS sb, haiti_subcommune AS hsb
                WHERE g.group_id = ga.group_id AND ga.sub_commune_id = sb.sub_commune_id AND hsb.gid = sb.sub_commune_id
        WHERE (geom &&
            ST_Transform(ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857), 4326))
    ) AS tile;
    """
    
)
commune_query_template = Template(
    """
    SELECT tile
    FROM (
        SELECT ${fields},
            ST_AsMVTGeom(ST_Transform(ST_SetSRID(geom,4326), 3857),
            ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),
                4096, 0, false) AS g
        FROM    events AS e , event_info AS ei , commune AS c, haiti_commune AS hc
                WHERE e.event_id = ei.event_id AND ei.commune_id = c.commune_id AND c.commune_id = hc.gid ;)
        WHERE (geom &&
            ST_Transform(ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857), 4326))
    ) AS tile;
    """
    
)

async def get_commune(request):
    """Parse request parameters and get tile"""
    fields = request.query_params.get("fields", "gid")
    fields = ",".join([f'"{field}"' for field in fields.split(",")])
    x = request.path_params["x"]
    y = request.path_params["y"]
    z = request.path_params["z"]
    return await get_commune_tile(x, y, z, fields)

async def get_commune_tile(x, y, z, fields="gid"):
    """Retrieve the year tile from the database or cache"""
    tilepath = f"{CACHE_DIR}/{z}/{x}/{y}.pbf"
    if not os.path.exists(tilepath):
        xmin, xmax, ymin, ymax = tile_extent(x, y, z)
        query = commune_query_template.substitute(
            xmin=xmin,
            xmax=xmax,
            ymin=ymin,
            ymax=ymax,
            fields=fields,
        )
        async with pool.acquire() as conn:
            tile = await conn.fetchval(query)
        if not os.path.exists(os.path.dirname(tilepath)):
            os.makedirs(os.path.dirname(tilepath))
        async with aiofiles.open(tilepath, mode="wb") as f:
            await f.write(tile)
        response = Response(tile, media_type="application/x-protobuf")
    else:
        response = FileResponse(tilepath, media_type="application/x-protobuf")
    return response

async def get_subcommune(request):
    """Parse request parameters and get tile"""
    fields = request.query_params.get("fields", "gid")
    fields = ",".join([f'"{field}"' for field in fields.split(",")])
    x = request.path_params["x"]
    y = request.path_params["y"]
    z = request.path_params["z"]
    return await get_subcommune_tile(x, y, z, fields)

async def get_subcommune_tile(x, y, z, fields="gid"):
    """Retrieve the year tile from the database or cache"""
    tilepath = f"{CACHE_DIR}/{z}/{x}/{y}.pbf"
    if not os.path.exists(tilepath):
        xmin, xmax, ymin, ymax = tile_extent(x, y, z)
        query = subcommune_query_template.substitute(
            xmin=xmin,
            xmax=xmax,
            ymin=ymin,
            ymax=ymax,
            fields=fields,
        )
        async with pool.acquire() as conn:
            tile = await conn.fetchval(query)
        if not os.path.exists(os.path.dirname(tilepath)):
            os.makedirs(os.path.dirname(tilepath))
        async with aiofiles.open(tilepath, mode="wb") as f:
            await f.write(tile)
        response = Response(tile, media_type="application/x-protobuf")
    else:
        response = FileResponse(tilepath, media_type="application/x-protobuf")
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

async def name(request):
    return JSONResponse("sanjay")

routes = [
    Route("/", index),
    Route("/layers/assets/{table:str}/{z:int}/{x:int}/{y:int}", tile),
    Route("/layers/indices/{data_year:int}/{z:int}/{x:int}/{y:int}", year_tile),
    Route("/layers/{table:str}/fields", fields),
    Route("/upload", upload, methods=["POST"]),
    Route("/data-years", data_years),
    Route("/{column:str}/{year:int}", get_column),
    Route("/name",name),
    Route("/get-commune/{z:int}/{x:int}/{y:int}",get_commune),
    Route("/get-subcommune/{z:int}/{x:int}/{y:int}",get_subcommune)
]
middleware = [
    Middleware(CORSMiddleware, allow_origins=["*"])
    ]
app = Starlette(routes=routes, middleware=middleware, on_startup=[on_startup])

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)