

-- this table is a temporary table used in an API.
Create table sub_commune_group_count_map (sub_commune_id int primary key,group_count int,group_list INT[],group_details jsonb  );


-- this is coulmn needed for grouping the data by month.
alter table event_info add column pub_month varchar(20) ;




