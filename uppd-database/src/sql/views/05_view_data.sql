-- ALTER TABLE group_activities
-- RENAME COLUMN tractce10 to tractce;



-- CREATE VIEW group_view_data AS
-- SELECT *
-- FROM gang AS g, group_activities AS ga, sub_commune AS sb, haiti_subcommune AS hsb
-- WHERE g.group_id = ga.group_id AND ga.sub_commune_id = sb.sub_commune_id AND hsb.gid = sb.sub_commune_id ;



-- CREATE VIEW event_view_data AS
-- SELECT *
-- FROM    events AS e , event_info AS ei , commune AS c, haiti_commune AS hc
-- WHERE e.event_id = ei.event_id AND ei.commune_id = c.commune_id AND c.commune_id = hc.gid ;

Create table sub_commune_group_count_map (sub_commune_id int primary key,group_count int,column group_list INT[],column group_details jsonb  );

-- alter table sub_commune_group_count_map add column group_list INT[] ;
-- ALTER TABLE sub_commune_group_count_map add column group_details jsonb ;

alter table event_info add column pub_month varchar(20) ;
update event_info set pub_month =  split_part(publication_date,'-',2)||'-'||split_part(publication_date,'-',3) ;