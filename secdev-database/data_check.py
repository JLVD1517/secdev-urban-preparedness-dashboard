#!/usr/bin/python3

"""
Must be run from the root dir of uppd-database. Requires pandas.

Traverses the files in /docker/data/ and checks them against the
requirements. Notifies user in stdout and will alter files accordingly
if possible.

If a filename or column name starts with a number or underscore, the numerical characters
will be relocated to the end of the filename
    - eg. 12_monkeys.csv would become monkeys_12.csv

General rules:
    - Filenames and column names should be lowercase and only include
    letters, numbers, and underscores. Cannot start with a number.
    - Location coordinates - EPGS:4326(wgs84) projection
    - Decimals should use `.` 
    - Thousands separator should not exist (`,`)

/docker/data/shapefile/city_geography.shp
    - must exist
    - must contain a column called tractce TODO
    - may have to rename a column called tractceYY where Y is a number TODO
/docker/data/csv/assets/*.csv
    - file names must all be lowercase, can only include letters, 
    numbers, and underscores. Must not start with a number.
    - must have latitude and longitude columns TODO
/docker/data/csv/indices/*.csv
    - current year (2021) should be called current_indices.csv
    - other years of data should be named historical_yyyy_indices.csv. TODO
    - Columns must match in all files to be ingested TODO
    - headers can only contain lowercase letters, numbers, and underscores

    
"""

import os
import re
import csv
import sys
import shutil
import fileinput
import logging
import itertools
import string

import pandas as pd


# print as logs to command line to support future sentry integration
logger = logging.getLogger('default')
logger.addHandler(logging.StreamHandler(sys.stdout))


def has_bad_chars(name):
    """Check name for invalid characters

    :param name: The file or column name to check
    :type name: str
    :return: True if there are unacceptable characters that must be removed manually
    :rtype: Boolean
    """
    # Note: will error on capital letters, check for lowercase first
    good_chars = set(string.ascii_lowercase + string.digits + "_.")

    if any(char not in good_chars for char in name):
        logger.error(f'Unacceptable character: {name}. User must manually rename.')
        return True
    
    return False


def num_start(name):
    """If name begins with a number, collect all numbers and move to the end
    of the file name

    :param name: The file or column name to check for numbers
    :type name: str
    :return: The file or column name with any starting numbers moved to the end
    :rtype: str
    """

    old_name = name
    if name[0].isdigit():
        logger.warning(f'Cannot begin with a number: {name}')
        num = ''.join(itertools.takewhile(str.isdigit, name))
        name = name[len(num):]

        name = name.lstrip("_")
        
        if num.strip():
            if name.endswith('.csv'):
                name = name[:-4]
                name = f"{name}_{num}.csv"
            else:
                name = f"{name}_{num}"
    
    return name


def check_filenames(cur_dir):
    """Check file names in csv files in cur_dir for invalid characters or naming patterns.
    File names are used to generate the database schema.
    This method will move numbers to the end of the file name and warn for characters
    that should be manually removed

    :param cur_dir: Current working directory. Will walk through all inner files
    :type cur_dir: str
    """
    logger.info(f"{cur_dir} - Checking data files")

    for root, directories, files in os.walk(cur_dir, topdown=False):
        for name in files:
            path = os.path.join(root, name)
            if name.endswith('.csv'):
                old_name = name
                name = name.lower()

                name = num_start(name)
                new_path = os.path.join(root, name)
                if name != old_name:
                    logger.info(f'Renaming {old_name} to {name}')
                    os.rename(path, new_path)
                    old_name = name

                if not has_bad_chars(name):
                    logger.info(f'{name} passes the filename tests')


def check_column_names(cur_dir):
    """Check column names in csv files in cur_dir for invalid characters or naming patterns.
    Column names are used to generate the database schema.
    The method will move numbers to the end of the column name and warn for characters
    that should be manually removed

    :param cur_dir: Current working directory. Will walk through all inner files
    :type cur_dir: str
    """
    logger.info(f'{cur_dir} - checking column names')

    for root, directories, files in os.walk(cur_dir, topdown=False):
        for file in files:

            path = os.path.join(root, file)

            if file.endswith('.csv'):
                
                df = pd.read_csv(path, nrows=0)  # read only the header row

                df.reset_index(drop=True, inplace=True)  # make sure there's no index added

                renamed_cols = {}
                for col in df.columns:
                    old_col = col

                    col = col.lower()
                    col = num_start(col)

                    if old_col != col:
                        renamed_cols[old_col] = col

                    if has_bad_chars(col):
                        logger.error(f'Invalid char in {col} from {file}, needs to be removed manually')
                
                if renamed_cols:
                    logger.info(f'Replacing header row in {file}')

                    # replace cols
                    df.rename(columns=renamed_cols, inplace=True)

                    # construct new header, including columns that were not renamed
                    header = ','.join(df.columns)
                    logger.info(f'New header row:\n{header}')
      
                    # replace the header row;
                    for line in fileinput.input(path, inplace=True):
                        # the following print functions write to the fileinput
                        if fileinput.isfirstline():
                            print(header)  # no qa
                        else:
                            print(line, end='')  # no qa



def check_numbers(file):
    """ Check the csv file for numbers with invalid characters.
    This method will replace values ending in % and commas used as thousands separators.
    This method will create errors if the data files use commas as decimal points, as is the norm
    in some regions.

    :param file: Full filepath for the csv file to check
    :type file: str
    """

    df = pd.read_csv(file, dtype=str)

    replaced_vals = False
    for i, row_series in df.iterrows():
        
        for key, value in row_series.items():
            value = str(value)
            if '%' in value and value[0].isdigit():
                value = value.rstrip('%','')  # remove percentage sign from end of value

                df.at[i, key] = value
                replaced_vals = True

            try:
                if ',' in value and all(char.isdigit() or char==',' for char in value):
                    value = value.replace(',', '')

                    # replace value
                    df.at[i, key] = value
                    replaced_vals = True
            except TypeError: 
                pass
        
            if 'date' not in key and value[0].isdigit() and not all(char.isdigit() or char=='.' for char in value):
                logger.error(f"Invalid character in numerical value {value} at {i}, {key} of {file}")
    
    if replaced_vals:
        logger.info(f'{file} has been modified to remove commas and/or percentage signs from numeric values')
        df.to_csv(file, index=False)


if __name__ == '__main__':

    os.chdir('docker/data')
    cur_dir = os.getcwd()

    shapefile = 'shapefile/city_geography.shp'

    if not os.path.exists(shapefile):
        logger.error(f'No shapefile found at {cur_dir}/{shapefile}')
    
    check_filenames(cur_dir)

    os.chdir('csv')
    cur_dir = os.getcwd()
    check_column_names(cur_dir)

    for root, directories, files in os.walk(cur_dir, topdown=False):
        for file in files:
            path = os.path.join(root, file)
            if file.endswith('csv'):
                check_numbers(path)

    logger.info('Data checks complete')


            

            
