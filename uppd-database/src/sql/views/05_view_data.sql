

-- this table is a temporary table used in an API.
Create table sub_commune_group_count_map (sub_commune_id int primary key,group_count int,group_list INT[],group_details jsonb  );


-- this is an extra coulumn needed for the date in format  like dd-mm-yyyy.
alter table event_info add publication_date_fmt varchar(20); 

-- this is coulmn needed for grouping the data by month.
alter table event_info add column pub_month varchar(20) ;
update event_info set pub_month =  split_part(publication_date,'-',2)||'-'||split_part(publication_date,'-',3) ;




