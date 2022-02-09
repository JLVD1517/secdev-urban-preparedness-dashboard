import logging
import os
import sys
import datetime as dt

def create_logger(name):
    logger = logging.getLogger(name)
    logs_dir = 'logs'
    log_name = dt.datetime.now().strftime("%Y-%m-%dT%H.%M.%S")

    os.makedirs(logs_dir, exist_ok=True)
    debug_log = os.path.join(logs_dir, f'{log_name}-debug.log')
    err_log = os.path.join(logs_dir, f'{log_name}-err.log')

    debug = logging.FileHandler(debug_log, encoding='utf-8')
    debug.setLevel(logging.DEBUG)

    err = logging.FileHandler(err_log, encoding='utf-8')
    err.setLevel(logging.ERROR)

    stream = logging.StreamHandler(sys.stdout)
    stream.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        '{levelname} | {lineno} | {asctime} || {message}', style='{')
    debug.setFormatter(formatter)
    err.setFormatter(formatter)
    stream.setFormatter(formatter)

    # add all handlers to log
    logger.addHandler(debug)
    logger.addHandler(err)
    logger.addHandler(stream)

    return logger