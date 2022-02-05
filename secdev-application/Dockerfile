FROM node:16-alpine as build

LABEL maintainer="Mason Banning <Mason@rs21.io>"

RUN apk update && apk add python3 make g++

WORKDIR /build
COPY ./ /build

ARG BUILD_MODE=production
ENV BUILD_MODE ${BUILD_MODE}

RUN cd /build
RUN npm i
RUN export NODE_OPTIONS=--max_old_space_size=4000 && npm run build

FROM httpd:2.4-alpine

ENV APP_DIR /usr/local/apache2/htdocs

WORKDIR $APP_DIR

# copy production code (built in node image)
COPY --from=build /build/build/ ./

# copy the apache config file
COPY ./apache.conf /usr/local/apache2/conf/httpd.conf
