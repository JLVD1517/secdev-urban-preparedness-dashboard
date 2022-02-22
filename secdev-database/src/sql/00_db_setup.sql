CREATE SCHEMA secdev;
ALTER SCHEMA secdev OWNER TO postgres;
ALTER DATABASE secdev_data SET search_path to secdev, public;

CREATE ROLE admin SUPERUSER;
CREATE ROLE readwrite;
CREATE ROLE read;

CREATE USER secdevadmin WITH ENCRYPTED PASSWORD 'changeMe';
CREATE USER secdevread WITH ENCRYPTED PASSWORD 'changeMe';
CREATE USER secdevreadwrite WITH ENCRYPTED PASSWORD 'changeMe';

ALTER USER postgres WITH ENCRYPTED PASSWORD 'changeMe';

GRANT admin TO secdevadmin;
GRANT readwrite TO secdevreadwrite;
GRANT read TO secdevread;

GRANT USAGE ON SCHEMA secdev to admin;
GRANT USAGE ON SCHEMA secdev to readwrite;
GRANT USAGE ON SCHEMA secdev to read;

ALTER DEFAULT PRIVILEGES IN SCHEMA secdev
  GRANT SELECT ON TABLES TO secdevread;
ALTER DEFAULT PRIVILEGES IN SCHEMA secdev
  GRANT SELECT ON SEQUENCES TO secdevread;
ALTER DEFAULT PRIVILEGES IN SCHEMA secdev
  GRANT SELECT, INSERT, UPDATE ON TABLES TO secdevreadwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA secdev
  GRANT SELECT, UPDATE ON SEQUENCES TO secdevreadwrite;



--- Related Tables Creation

CREATE TYPE secdev.LANGUAGE AS ENUM (
  'english',
  'french'
);

CREATE TYPE secdev.EVENT_CATEGORY AS ENUM (
  'general',
  'news'
);


CREATE TYPE secdev.ACTIVITIES AS ENUM (
  'Assassination',
  'Electioneering',
  'Execution',
  'Extortion',
  'Kidnapping',
  'Private security',
  'Protection',
  'Theft/Banditry',
  'Relation politique'
  );

CREATE TYPE secdev.GROUP_TYPE AS ENUM (
  'Organized gang',
  'Local baz',
  'Vigilance brigade',
  'cambrioleur',
  'Petty criminal'
);

CREATE TABLE secdev.commune (
  "commune_id" SERIAL PRIMARY KEY,
  "adm2_pcode" text,
  "name" text
);

CREATE TABLE secdev.sub_commune (
  "sub_commune_id" SERIAL PRIMARY KEY,
  "adm3_pcode" text,
  "commune_id" int,
  "name" text
);

CREATE TABLE secdev.groups (
  "group_id" int PRIMARY KEY,
  "name" text
);

CREATE TABLE secdev.group_records (
  "group_record_id" SERIAL PRIMARY KEY,
  "group_id" int,
  "name" text,
  "type" secdev.GROUP_TYPE,
  "leader_name" text,
  "base_commune_id" int,
  "base_sub_commune_id" int,
  "sub_commune_influence" int[],
  "key_activities" secdev.ACTIVITIES[],
  "group_size" int,
  "alliance_groups" text[],
  "rival_groups" text[],
  "affiliation" text,
  "connection" text[],
  "additional_notes" text,
  "date_of_collection" timestamp,
  "month_number" int,
  "year" int
);

CREATE TABLE secdev.events (
  "event_id" SERIAL PRIMARY KEY,
  "type" text UNIQUE
);

CREATE TABLE secdev.event_info (
  "event_info_id" SERIAL PRIMARY KEY,
  "event_id" int,
  "pub_date" text,
  "source" text,
  "title" text,
  "category" secdev.EVENT_CATEGORY,
  "summary" text,
  "tone" int,
  "url" text,
  "compound" int,
  "language" secdev.LANGUAGE,
  "commune_id" int
);

CREATE TABLE secdev.sub_commune_group_count_map (
    sub_commune_id integer PRIMARY KEY,
    group_count integer,
    group_list integer[],
    group_details jsonb
);

CREATE TABLE secdev.group_sub_commune_map (
    sub_commune_id integer PRIMARY KEY,
    group_id integer,
    group_details jsonb
);

ALTER TABLE secdev.event_info ADD CONSTRAINT fk_commune_id FOREIGN KEY (commune_id) REFERENCES secdev.commune ("commune_id");

ALTER TABLE secdev.group_records ADD CONSTRAINT fk_sub_commune_id FOREIGN KEY ("base_sub_commune_id") REFERENCES secdev.sub_commune ("sub_commune_id");

ALTER TABLE secdev.event_info ADD CONSTRAINT fk_event_id FOREIGN KEY (event_id) REFERENCES secdev.events ("event_id");

ALTER TABLE secdev.sub_commune ADD CONSTRAINT fk_sub_to_commune_id FOREIGN KEY ("commune_id") REFERENCES secdev.commune ("commune_id");

ALTER TABLE secdev.group_records ADD CONSTRAINT fk_group_id FOREIGN KEY ("group_id") REFERENCES secdev.groups ("group_id");



ALTER  TABLE secdev.event_info alter column event_id set not null ;
ALTER  TABLE secdev.event_info alter column tone set not null ;
ALTER  TABLE secdev.event_info alter column source set not null ;
ALTER  TABLE secdev.event_info alter column language set not null ;
ALTER  TABLE secdev.event_info alter column pub_date set not null ;
ALTER  TABLE secdev.event_info alter column title set not null ;
ALTER  TABLE secdev.event_info alter column url set not null ;
ALTER  TABLE secdev.event_info alter column summary set not null ;
ALTER  TABLE secdev.event_info alter column compound set not null ;
ALTER  TABLE secdev.event_info alter column commune_id set not null ;
ALTER  TABLE secdev.event_info alter column category set not null ;




ALTER  TABLE secdev.group_records alter column month_number set not null ;
ALTER  TABLE secdev.group_records alter column year set not null ;
ALTER  TABLE secdev.group_records alter column sub_commune_influence set not null ;
ALTER  TABLE secdev.group_records alter column name set not null ;
ALTER  TABLE secdev.group_records alter column type set not null ;
ALTER  TABLE secdev.group_records alter column leader_name set not null ;
ALTER  TABLE secdev.group_records alter column key_activities set not null ;
ALTER  TABLE secdev.group_records alter column group_size set not null ;
ALTER  TABLE secdev.group_records alter column affiliation set not null ;
