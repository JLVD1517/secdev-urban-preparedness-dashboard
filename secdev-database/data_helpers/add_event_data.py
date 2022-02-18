'''
takes event data from the events database and puts it into the front end database
'''
import argparse
import configparser
import os
import datetime

import psycopg2
import psycopg2.extras

import loggers

logger = loggers.create_logger('add_event_data')

def get_events(config, date_str):
    '''
    Connect to the events database, grab all events after date_str, and return the data as a list of dicts
    config - config object. 
        expects a section called 'events' with db_host, db_name, db_username and db_password
    date_str - a date string in format YYYY-MM-DD. Events after this date (non-inclusive) will be added to the database.
    '''

    db_conf = config['events']

    # get db variables from config
    db_host = db_conf['db_host']
    db_port = 5432
    db_name = db_conf['db_name']
    db_username = db_conf['db_username']
    db_password = db_conf['db_password']

    sql = f''' SELECT tone, source, language, pubdate, title, url, summary, compound, place,
            category, eventtype FROM events_nlp WHERE pubdate > '{date_str}'::date'''
    
    # initialize database connection and query for data
    try:
        conn = psycopg2.connect(
                    f"host={db_host} port={db_port} dbname={db_name} user={db_username} password={db_password}")
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql)
        results = cur.fetchall()
        logger.debug(f'first result: {results[0]}')
        conn.close()
        return results
    except Exception as e:
        logger.error(f'Could not get events data. Exception:\n{e}')

def add_events(config, data):
    '''
    Connect to the front end database and add the events data

    config - config file values
        expects a section called 'frontend' with db_host, db_name, db_username and db_password
    data - a list of tuples returned from the events database
    '''

    db_conf = config['frontend']

    # get db variables from config
    db_host = db_conf['db_host']
    db_port = 5432
    db_name = db_conf['db_name']
    db_username = db_conf['db_username']
    db_password = db_conf['db_password']

    # get_commune_ids will return in order name, commune_id
    commune_ids = dict(get_commune_ids(config))

    # initialize database connection
    try:
        conn = psycopg2.connect(
                        f"host={db_host} port={db_port} dbname={db_name} user={db_username} password={db_password}")
        cur = conn.cursor()
        conn.autocommit = True
    except Exception as e:
        logger.debug(f'Could not connect to frontend database')
        raise e

    eventtypes = {}

    for each in data:

        event_type = each['eventtype'].lower().replace("'", "''")

        # check the event_type exists and get its id
        if event_type not in eventtypes.keys():
            # add to database and list
            sql = f''' INSERT INTO events (type, language) VALUES ('{event_type}', '{each["language"].lower()}') 
                        ON CONFLICT DO NOTHING RETURNING event_id'''
            try:
                cur.execute(sql)
                result = cur.fetchone()
                if result:
                    eventtypes[event_type] = result[0]
                else:
                    sql = f''' SELECT event_id from events where type = '{event_type}' '''
                    try:
                        cur.execute(sql)
                        result = cur.fetchone()
                        if result:
                            eventtypes[event_type] = result[0]
                    except Exception as e:
                        logger.error(f'Could not find {event_type} in events table')
            except Exception as e:
                logger.error(f'Could not add {event_type} to events table')
                sql = f''' SELECT event_id from events where type = '{event_type}' '''
                try:
                    cur.execute(sql)
                    result = cur.fetchone()
                    if result:
                        eventtypes[event_type] = result[0]
                except Exception as e:
                    logger.error(f'Could not find {event_type} in events table')

        each['event_id'] = eventtypes.get(event_type)

        # remove apostrophes
        for key, val in each.items():
            if "'" in str(val):
                each[key] = val.replace("'", "")
            if key == 'pubdate':
                # make date fit format DD-MM-YYYY
                # TODO change this when app format requirements are updated
                if str(val):  # if a date is available
                    val_list = str(val).split('-')
                    new_val =  '-'.join(val_list[::-1])
                    logger.debug(f'DD-MM-YYYY date: {new_val}')
                    each[key] = new_val

        # get the commune_ids
        try:
            each['commune_id'] = commune_ids[each['place'].lower()]
        except KeyError:
            logger.error(f'Could not find a commune_id for {each["place"]}')
            logger.warning(f'This means the event with url {each["url"]} will not be added to the front end')
            continue

        # if an id value is returned, insert into event_info table
        info_sql = f'''INSERT INTO event_info (
                    event_id, tone, source, language,
                    pub_date, title, url, summary, compound, 
                    commune_id, category
                    ) VALUES (
                        '{each.get("event_id")}',
                        '{each.get("tone")}', 
                        '{each.get("source")}',
                        '{each.get("language").lower()}',
                        '{each.get("pubdate")}',
                        '{each.get("title")}',
                        '{each.get("url")}',
                        '{each.get("summary")}',
                        '{each.get("compound")}',   
                        '{each.get("commune_id")}',
                        '{each.get("category")}'
                    ) ON CONFLICT DO NOTHING'''
        try:
            print(info_sql)
            #cur.execute(info_sql)
        except Exception as e:
            logger.error(f'Could not add event with url {each["url"]}')
            logger.error(e)
    else:
        logger.error(f'Could not find or generate an id for event with url {each["url"]}')
    conn.close()

def get_commune_ids(config):
    '''
    Connect to the frontend database, grab commune names and ids, and return the data
    config - config object
    '''

    db_conf = config['frontend']

    # get db variables from config
    db_host = db_conf['db_host']
    db_port = 5432
    db_name = db_conf['db_name']
    db_username = db_conf['db_username']
    db_password = db_conf['db_password']

    sql = ''' SELECT LOWER(name), commune_id FROM commune '''
    
    # initialize database connection and query for data
    try:
        conn = psycopg2.connect(
                    f"host={db_host} port={db_port} dbname={db_name} user={db_username} password={db_password}")
        cur = conn.cursor()
        cur.execute(sql)
        results = cur.fetchall()
        logger.debug(f'first result: {results[0]}')
        conn.close()
        return results
    except Exception as e:
        logger.error('Could not get commune data')
        raise e

def get_event_types(config):
    '''
    TODO merge with previous function

    Connect to the frontend database, grab event_types and ids, and return the data
    config - config object
    '''

    db_conf = config['frontend']

    # get db variables from config
    db_host = db_conf['db_host']
    db_port = 5432
    db_name = db_conf['db_name']
    db_username = db_conf['db_username']
    db_password = db_conf['db_password']

    sql = ''' SELECT LOWER(type), event_id FROM events '''
    
    # initialize database connection and query for data
    try:
        conn = psycopg2.connect(
                    f"host={db_host} port={db_port} dbname={db_name} user={db_username} password={db_password}")
        cur = conn.cursor()
        cur.execute(sql)
        results = cur.fetchall()
        logger.debug(f'first result: {results[0]}')
        conn.close()
        return results
    except Exception as e:
        logger.error('Could not get commune data')
        raise e


if __name__ == '__main__':
    # get this directory's path
    init_dir = os.path.dirname(os.path.realpath(__file__))

    config = configparser.ConfigParser(interpolation=None)
    configpath = os.path.join(init_dir, 'config.ini')
    config.read(configpath)

    date_format = '%Y-%m-%d'
    default_time = datetime.date.today() - datetime.timedelta(days=2)
    default_time_str = default_time.strftime(date_format)

    parser = argparse.ArgumentParser(description='Take data from the events database and add it to the front end')
    parser.add_argument('--date', '-d', default=default_time_str,
                    help='Collect events after this date (not inclusive)')
    args = parser.parse_args()

    try:
        datetime.datetime.strptime(args.date, date_format)
    except ValueError:
        print('Incorrect date format, must be YYYY-MM-DD')

    logger.info('Selecting events from event database')
    events = get_events(config, args.date)
    logger.info('Adding events to frontend database')
    add_events(config, events)
    logger.info('Add_event_data complete')