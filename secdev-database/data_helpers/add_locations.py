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

commune_ids = {'HT0113': 1, 'HT0117': 2, 'HT0134': 3, 'HT0131': 4, 
        'HT0112': 5, 'HT0135': 6, 'HT0133': 7, 'HT0116': 8, 
        'HT0115': 9, 'HT0114': 10, 'HT0111': 11, 'HT0118': 12, 
        'HT0132': 13}


# Uncomment to initialize commune table
for index, row in commune_list.iterrows():
    com_sql = f''' INSERT INTO commune (name, adm2_pcode) 
                VALUES ('{row['admin2Name_en']}', '{row['admin2Pcode']}')
                RETURNING commune_id'''
    logger.info(f"Adding {row['admin2Name_en']}, {row['admin2Pcode']} to database")
    cur.execute(com_sql)
    commune_id = cur.fetchone()[0]
    commune_ids[row['admin2Pcode']] = commune_id

logger.debug(commune_ids)

df['commune_id'] = df['admin2Pcode'].map(commune_ids)
subcommune_list = df[['admin3_clean','admin3Pcode','commune_id']]
logger.debug(subcommune_list)

subcommune_ids = {}
for index, row in subcommune_list.iterrows():
    subcom_sql = f'''
                INSERT INTO sub_commune (name, commune_id, adm3_pcode)
                VALUES ('{row['admin3_clean']}', '{row['commune_id']}', '{row['admin3Pcode']}')
                RETURNING sub_commune_id
                '''
    cur.execute(subcom_sql)
    subcommune_id = cur.fetchone()[0]
    subcommune_ids[row['admin3Pcode']] = subcommune_id

logger.debug(subcommune_ids)