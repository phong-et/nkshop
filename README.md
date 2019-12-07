"# nkshop" 

# Features in Future

- Server RESTful API to fetch, statistic product by multi-conditions
- Client Single Page to view, filter, statistic product
- Server GraphQL to insert delete update product, review

# Server RESTful API

- fetchProductByPriceAndReviewCount 
    - input range of page to statistic
    - data json return :
        ```js
        {
            productId:1234,
            Price:'100$',
            ratringCount:5
            title:'Product title'
        }
        ``` 

# Server GraphQL
 - Don't use Sequelize. Because It's a promise-based ORM(Object Relational Mapping). Examples of ORMs are nHibernate, Entity Framework, Dapper and more...
 - Mongodb is a ODM (Object Document Mapper) so we can't apply ORM tool to Mongodb

# Knowledge

# Bypass cloudflare JS challenge
    This site was built using [GitHub Pages](https://pages.github.com/).

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