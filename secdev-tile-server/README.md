# uppd-tile-server

Tile server for the Haiti Community Violence Monitor project.

## requests
```
/
```
Shows a basic interactive map with several layers on it. Can be tweaked via `/html/index.html`.

NOTE: A valid mapbox API key is required for the index.html to work properly. Simply insert it in the place of `<INSERT MAPBOX TOKEN HERE>` in the file. 

---
```
/get-commune/{start_date:str}/{end_date:str}/{language:str}/{z:int}/{x:int}/{y:int}
```
Returns commune tiles filtered by a range of date and language 

---
```
/get-subcommune/{month_number:int}/{year:int}/{z:int}/{x:int}/{y:int}
```
Returns sub commune tiles filtered by month number and year 
---
```
/get-articles/{start_date:str}/{end_date:str}/{language:str}/{commune_id:int}
```
Returns the articles filtered by a range of dates and language

---
```
/data/articles-per-event/{start_date:str}/{end_date:str}/{language:str}
```
Returns the articles for every event type filtered by a range of dates and language

---
```
/data/avg-tone/{start_date:str}/{end_date:str}/{language:str}
```
Returns the average tone of articles filtered by a range of dates and language

---

```
/data/articles-per-commune/{start_date:str}/{end_date:str}/{language:str}
```
Returns the  articles for every commune filtered by a range of dates and language

---

```
/get-event-type
```
Returns the distinct event types.

----



