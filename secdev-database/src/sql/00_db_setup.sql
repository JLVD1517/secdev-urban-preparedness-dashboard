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

CREATE TYPE secdev.LANGUAGE AS ENUM (
  'english',
  'french'
);

CREATE TYPE secdev.EVENT_CATEGORY AS ENUM (
  'general',
  'news'
);

CREATE TYPE secdev.EVENT_TYPE AS ENUM (
  'Violence mortelle',
  'Violence électorale',
  'Violence interpersonnelle',
  'Violence criminelle',
  'Violence organisée',
  'Troubles sociaux',
  'Violence contre les femmes et les filles',
  'Enlèvement et rançon',
  'Implication du groupe armé',
  'Violence de lÉtat',
  'Lethal violence',
  'Election violence',
  'Interpersonal violence',
  'Criminal violence',
  'Organized violence',
  'Social unrest',
  'Violence against women and girls',
  'Kidnapping and ransom',
  'Armed group involvement',
  'State violence'
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
  "type" secdev.EVENT_TYPE
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