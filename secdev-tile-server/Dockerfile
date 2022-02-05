FROM python:3.7-slim

LABEL maintainer="James Arnold <james@rs21.io>"

WORKDIR /src/

COPY requirements.txt /src/
COPY /html/index.html /src/html/
RUN apt-get update
RUN apt-get -y install gcc
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py /src/

ENTRYPOINT ["/usr/local/bin/uvicorn", "app:app", "--workers", "4", "--host", "0.0.0.0"]