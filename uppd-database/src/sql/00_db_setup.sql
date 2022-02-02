CREATE SCHEMA secdev;
ALTER SCHEMA secdev OWNER TO postgres;
ALTER DATABASE secdev_data SET search_path to secdev, public;

CREATE ROLE admin SUPERUSER;
CREATE ROLE readwrite;
CREATE ROLE read;
 
CREATE USER uppdadmin WITH ENCRYPTED PASSWORD 'changeMe';
CREATE USER uppdread WITH ENCRYPTED PASSWORD 'changeMe';
CREATE USER uppdreadwrite WITH ENCRYPTED PASSWORD 'changeMe';

ALTER USER postgres WITH ENCRYPTED PASSWORD 'changeMe';
 
GRANT admin TO uppdadmin;
GRANT readwrite TO uppdreadwrite;
GRANT read TO uppdread;

GRANT USAGE ON SCHEMA secdev to admin;
GRANT USAGE ON SCHEMA secdev to readwrite;
GRANT USAGE ON SCHEMA secdev to read;

ALTER DEFAULT PRIVILEGES IN SCHEMA secdev
  GRANT SELECT ON TABLES TO uppdread;
ALTER DEFAULT PRIVILEGES IN SCHEMA secdev
  GRANT SELECT ON SEQUENCES TO uppdread;
ALTER DEFAULT PRIVILEGES IN SCHEMA secdev
  GRANT SELECT, INSERT, UPDATE ON TABLES TO uppdreadwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA secdev
  GRANT SELECT, UPDATE ON SEQUENCES TO uppdreadwrite;



--- Realed Tables Creation


CREATE TABLE secdev.commune (
    commune_id numeric NOT NULL,
    name character varying NOT NULL
);


CREATE TABLE secdev.event_info (
    event_info_id numeric NOT NULL,
    event_id numeric NOT NULL,
    publication_date character varying NOT NULL,
    source character varying NOT NULL,
    title character varying NOT NULL,
    category character varying NOT NULL,
    summary character varying NOT NULL,
    tone numeric NOT NULL,
    url character varying NOT NULL,
    compound numeric NOT NULL,
    language character varying NOT NULL,
    commune_id numeric NOT NULL,
    pub_month character varying(20)
);


CREATE TABLE secdev.events (
    event_id numeric NOT NULL,
    type character varying NOT NULL
);


CREATE TABLE secdev.group_records (
    group_record_id numeric NOT NULL,
    group_id numeric NOT NULL,
    base_sub_commune_id numeric NOT NULL,
    name character varying NOT NULL,
    date_of_collection character varying NOT NULL,
    month_number numeric NOT NULL,
    year numeric NOT NULL,
    sub_commune_id numeric NOT NULL,
    type character varying NOT NULL,
    leader_name character varying NOT NULL,
    base_commune_id numeric NOT NULL,
    sub_commune_influence character varying NOT NULL,
    key_activities character varying NOT NULL,
    group_size numeric NOT NULL,
    alliance_groups character varying NOT NULL,
    rival_groups character varying NOT NULL,
    affiliation character varying NOT NULL,
    connection character varying NOT NULL,
    additional_notes character varying NOT NULL
);


CREATE TABLE secdev.groups (
    group_id numeric NOT NULL,
    name character varying NOT NULL
);


CREATE TABLE secdev.sub_commune (
    sub_commune_id numeric NOT NULL,
    name character varying NOT NULL,
    commune_id numeric NOT NULL
);


CREATE TABLE secdev.sub_commune_group_count_map (
    sub_commune_id integer NOT NULL,
    group_count integer,
    group_list integer[],
    group_details jsonb
);

