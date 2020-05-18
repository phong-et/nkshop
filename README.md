"# nkshop" 

# Features in Future
- Sync review
- Latest review page
- Fetch new product
- Statistic charts
- Admin page (desktop)
- User page (mobile)
- Encrypt 
    - key start server.
        - only release one time when server start 
            if(!key) = await requestKey('url')
        - only 
    - encrypt request param & response data
- Authenticate admin user

# Server RESTful API
- Server RESTful API
    - products/
        - /review/update/:productId
        - /currentreviews/:productId
        - /latest
        - /add
        - /new/listid/:pageRange
        ...

# Knowledge
    - Don't use Sequelize. Because It's a promise-based ORM(Object Relational Mapping). Examples of ORMs are nHibernate, Entity Framework, Dapper and more...
    - Mongodb is a ODM (Object Document Mapper) so we can't apply ORM tool to Mongodb
    - Bypass cloudflare JS challenge
    - Recursive return value
    - Recursive delete all files and folders.
    - Clean code 
    - Design pattern
        - Core lib
        - Each function is one task.
    - fastify vs express 
        - fastify : don't work with ip and linux 
        - express is more better

# Test output all date functions
    d.toLocaleDateString() => 11/14/2019
    d.toLocaleTimeString() => 8:49:40 PM
    d.toLocaleString() => 11/14/2019, 8:49:40 PM
    d.toDateString() => Thu Nov 14 2019
    d.toTimeString() => 20:49:40 GMT+0700 (Indochina Time)
    d.toISOString() => 2019-11-14T13:49:40.346Z
    d.toUTCString() => Thu, 14 Nov 2019 13:49:40 GMT
    d.toString() => Thu Nov 14 2019 20:49:40 GMT+0700 (Indochina Time)
    d.toJSON() => 2019-11-14T13:49:40.346Z

# Error Note 
    [24891]  : substr
    [23836]  
    [27151]
    [27096]
    http://prntscr.com/s2yxe8 mongodb transaction error
    31306 error cloudfire scaper

# Export data mongodb
mongoexport --db nkshop --collection products --out products.json
mongoimport --db nkshop --collection products ^
    --authenticationDatabase admin --username <user> --password <password> ^
    --drop --file ~\downloads\products.json

    mongoimport --db nkshop --collection reviews ^
    --drop --file storage/downloads/nkshop/data/reviews.json

$ mongod -dbpath /storage/downloads/data

# Run service on android 
- Mongodb server
- Express web server
-  

# Note 
[{
    id:31921,
    type:'ff',
    url:'',
    note:'cover ff',
},{
    id: 32116 ,
    type:'nwm',
    note:'product ff',
}]

# WhiteList 
32124 
32150 
