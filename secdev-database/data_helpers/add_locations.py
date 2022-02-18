'''
- open datafiles/hti_adm3.csv
- add admin2Name_en, andmin2Pcode to commune & return commune_id
- add admin3_clean, admin3Pcode, commune_id to sub_commune & return sub_commune_id
- output sub_commune_id, admin3_clean, admin3Pcode, commune_id, admin2Name_en, admin2Pcode as new csv
'''

import configparser
import os

import pandas as pd
import psycopg2

import loggers

logger = loggers.create_logger('add_locations')

datafile = os.path.join('datafiles', 'hti_admin3.csv')
# get this directory's path
init_dir = os.path.dirname(os.path.realpath(__file__))
# get full filepath
filepath = os.path.join(init_dir, datafile)

config = configparser.ConfigParser(interpolation=None)
configpath = os.path.join(init_dir, 'config.ini')
config.read(configpath)

db_conf = config['frontend']

# get db variables from config
db_host = db_conf['db_host']
db_port = 5432
db_name = db_conf['db_name']
db_username = db_conf['db_username']
db_password = db_conf['db_password']

# initialize database connection
conn = psycopg2.connect(
            f"host={db_host} port={db_port} dbname={db_name} user={db_username} password={db_password}")
cur = conn.cursor()
conn.autocommit = True

# open file and iterate thru, creating two lists
df = pd.read_csv(filepath)

# get list of unique commune names
commune_list = df.drop_duplicates(['admin2Name_en'])
commune_list = commune_list[['admin2Name_en', 'admin2Pcode']]
logger.debug(commune_list)

commune_ids = {}

def get_commune_id(cur, row):
    com_sql = f'''SELECT gid FROM haiti_commune WHERE lower(adm2_pcode) = '{row['admin2Pcode'].lower()}' '''
    try:
        cur.execute(com_sql)
        return cur.fetchone()[0]
    except Exception as e:
        logger.error(e)

def get_subcommune_id(cur, row):
    subcom_sql = f'''SELECT gid FROM haiti_subcommune WHERE lower(adm3_en) = '{row['admin3Name_en'].lower().replace("'", "''")}' '''
    try:
        cur.execute(subcom_sql)
        return cur.fetchone()[0]
    except Exception as e:
        logger.error(e)

for index, row in commune_list.iterrows():

    commune_id = get_commune_id(cur, row)
    commune_ids[row['admin2Pcode']] = commune_id

    com_sql = f''' INSERT INTO commune (commune_id, name, admin2pcode) 
                VALUES ('{commune_id}', '{row['admin2Name_en']}', '{row['admin2Pcode']}')
                ON CONFLICT DO NOTHING '''
    logger.info(f"Adding {row['admin2Name_en']}, {row['admin2Pcode']} to database")
    cur.execute(com_sql)

df['commune_id'] = df['admin2Pcode'].map(commune_ids)
subcommune_list = df[['admin3_clean','admin3Name_en','admin3Pcode','commune_id']]
logger.debug(subcommune_list)

subcommune_ids = {}
for index, row in subcommune_list.iterrows():
    sub_commune_id = get_subcommune_id(cur, row)
    subcommune_ids[row['admin3Pcode']] = sub_commune_id

    subcom_sql = f'''
                INSERT INTO sub_commune (sub_commune_id, name, commune_id, admin3pcode, admin3name_en)
                VALUES ('{sub_commune_id}','{row['admin3_clean'].replace("'", "''")}', '{row['commune_id']}', '{row['admin3Pcode']}', '{row['admin3Name_en'].replace("'", "''")}')
                ON CONFLICT DO NOTHING
                '''
    try:
        cur.execute(subcom_sql)
    except Exception as e:
        logger.error(e)

logger.debug(subcommune_ids)
