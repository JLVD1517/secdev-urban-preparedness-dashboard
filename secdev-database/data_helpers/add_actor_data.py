'''
TODO many edits, remove hardcoding

- each group takes exactly 5 rows 
    - possible extra data in the following columns:
        - Commune "influence"
        - Sub-commune "influence"
        - Key activities

- then the following columns are comma separated lists that may use ' et ':
    - Positive connection  avec d'autres groupes armés [Nom du Groupe] 
    - Opposition to other armed group(s) [name group(s)] 
    - (DON'T ADD) Known connections to political/economic actors [name actor]

- Effcetif de membres dans le groupe may have variable values, take first whole number

- Affiliation to a “federation” (e.g. G9, G20 or GPEP) - list
    - if 'aucune' in there, leave blank
    - remove 'Affiliation'
'''
import configparser
import os

import loggers

import pandas as pd
import psycopg2

datafile = 'datafiles/groups_dec.xlsx'

logger = loggers.create_logger('add_actor_data')

# get this file's path
init_dir = os.path.dirname(os.path.realpath(__file__))

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

def connect_to_db():
    # initialize database connection
    conn = psycopg2.connect(
            f"host={db_host} port={db_port} dbname={db_name} user={db_username} password={db_password}")
    cur = conn.cursor()
    conn.autocommit = True
    return conn, cur

filepath = os.path.join(init_dir, datafile)
# open file and turn into dataframe
df = pd.read_excel(filepath)

# navigate dataframe 5 rows at a time to handle extra data on additional lines
multiline_cols = ['Key activities', 'Sub-commune "influence"']
max = len(df)

actor_list = []
i = 0
while i < max:
    row = df.iloc[i].copy()
    end_i = i+5
    if end_i > max: end_i = max

    # turn multiline cols into a list
    for col in multiline_cols:
        col_list = df.iloc[i:end_i][col].dropna().tolist()
        row[col] = col_list

    actor_list.append(row)
    i = end_i

actor_df = pd.DataFrame(actor_list)
print(actor_df.head())

# clean column names
for col in actor_df.columns:
    new_col = str(col).strip()
    if 'é' in new_col:
        new_col = new_col.replace('é', 'e')
    if new_col != col:
        actor_df[new_col] = actor_df[col]

# replace na with empty string
actor_df.fillna('', inplace=True)

# turn string based lists that use commas and 'et' into lists
str2list_cols = [
                "Positive connection  avec d'autres groupes armes [Nom du Groupe]",
                'Opposition to other armed group(s) [name group(s)]'
                ]

def create_list(x):
    ''' turn a comma separated string that may contain 'et' into a list 
        turn values containing the word 'aucune' (none) into empty strings
    '''
    if x:
        if 'aucune' in x.lower():  # none
            return ''
        val = x.replace(' et', ',')
        val = val.split(', ')
        return val
    return x

for col in str2list_cols:
    actor_df[col] = actor_df[col].apply(create_list)

# TODO in future versions this should be done automatically, but we will hopefully have better input format then
def handle_date(x):
    list = x.split()
    val = None
    if list:
        val = list[0]
        if 'dec' in datafile:
            val = f'2021-12-{list[0]}'
        if 'jan' in datafile:
            val = f'2022-01-{list[0]}'
        return val
    if 'dec' in datafile:
        val = f'2021-12-30'
    if 'jan' in datafile:
        val = f'2022-01-30'
    return val
    

# date handling - turn into YYYY-MM-DD format
actor_df['Date de collecte'] = actor_df['Date de collecte'].apply(handle_date)

if 'dec' in datafile:
    actor_df['month_number'] = 12
    actor_df['year'] = 2021

if 'jan' in datafile:
    actor_df['month_number'] = 1
    actor_df['year'] = 2022

col_map = {
    'Date de collecte': 'date_of_collection',   # also need to use for 'month_number' and 'year'
    'month_number': 'month_number',
    'year': 'year',
    'Nom du Groupe': 'name',
    'Groupe Type': 'type',
    'Nom du Chef du Groupemn Arme': 'leader_name',
    'Effcetif de membres dans le groupe': 'group_size',
    "Zone d'installation": 'base_commune_id',
    'Sub-commune "influence"': 'sub_commune_influence',  # separate line list
    'Key activities': 'key_activities',  # separate line list
    "Positive connection  avec d'autres groupes armes [Nom du Groupe]": 'alliance_groups',  # list
    'Affiliation to a “federation” (e.g. G9, G20 or GPEP) - list': 'affiliation',  # single val
    'Opposition to other armed group(s) [name group(s)]': 'rival_groups',  # list
    'Additional notes': 'additional_notes'
}

# replace column names with db names and remove unneeded columns
actor_df.rename(columns=col_map, inplace=True)
actor_df = actor_df[col_map.values()]

def num_check(x):
    x_str = str(x)
    if x_str.isdigit():
        return x
    # take first num
    if '-' in x_str:
        l = x_str.split('-')
        if l[0].isdigit():
            return l[0]
    if x_str.strip().isdigit():
        return x
    return ''
    
actor_df['group_size'] = actor_df['group_size'].apply(num_check)

# initialize db connection
conn, cur = connect_to_db()

# clean column strings
actor_df['name'] = actor_df['name'].str.strip()
actor_df['type'] = actor_df['type'].str.strip()
actor_df['affiliation'] = actor_df['affiliation'].str.strip()

# add groups to the group list if not already added
for i, row in actor_df.iterrows():
    group_sql = f'''
                INSERT INTO groups (name) VALUES ('{row['name']}')
                ON CONFLICT (name) DO NOTHING
                '''
    cur.execute(group_sql)

# get group ids
cur.execute("SELECT * FROM groups")
# stores as a dict in format id: name
ids = dict(cur.fetchall())
# flip the dict order
ids = dict((v,k) for k,v in ids.items())
# assign ids to each row
actor_df['group_id'] = actor_df['name'].apply(lambda x: ids[x])

# get commune and sub-commune ids
def commune_id(x):
    x = str(x).replace('é', 'e')
    ids = {'Carrefour': 1,
        'Cite Soleil': 2,
        'Cornillon / Grand Bois': 3,
        'Croix-Des-Bouquets': 4,
        'Delmas': 5,
        'Fonds-Verrettes': 6,
        'Ganthier': 7,
        'Gressier': 8,
        'Kenscoff': 9,
        'Petion-Ville': 10,
        'Port-au-Prince': 11,
        'Tabarre': 12,
        'Thomazeau': 13
        }
    return ids[x]

def subcommune_id(x):
    if x == []:
        return x
    
    id_list = []
    for each in x:
        each = str(each).replace('é', 'e')
        each = each.replace("'", "")

        if ' - ' in each:
            commune, each = each.split(' - ')
        sql = f"SELECT sub_commune_id FROM sub_commune WHERE name = '{each}'"
        cur.execute(sql)
        result = cur.fetchone()
        if result:
            id_list.append(result[0])
    return id_list

actor_df['base_commune_id'] = actor_df['base_commune_id'].apply(commune_id)
actor_df['sub_commune_influence'] = actor_df['sub_commune_influence'].apply(subcommune_id)

columns = actor_df.columns.tolist()

for i, row in actor_df.iterrows():
    dict_row = row.to_dict()
    new_row = {}

    # remove empty items
    for key, val in dict_row.items():
        if str(val).lower() not in ['', 'nan', 'na', 'aucune', '[]']:
            new_row[key] = val

    # lowercase for group type
    for key, val in new_row.items():
        if key == 'type':
            new_row[key] = str(val).lower()
    # handle string concatenation for sql query
    for key, val in new_row.items():
        if type(val) is list:
            if type(val[0]) is str:
                val = ', '.join('"' + str(x).replace("'", '') + '"' for x in val)
            else:
                val = ', '.join(str(x) for x in val)
            val = "'{" + val + "}'"
        else:
            val = "'" + str(val).replace("'", "") + "'"
        
        new_row[key] = val
    
    columns = ', '.join(new_row.keys())
    values = ', '.join(new_row.values())
    sql = "INSERT INTO %s ( %s ) VALUES ( %s );" % ('group_records', columns, values)
    print(sql)
    try:
        cur.execute(sql)
    except Exception as e:
        print(e)

conn.close()


