"# nkshop" 

**Future in Future**

    - Server RESTful API to fetch, statistic product by multi-conditions
    - Client Single Page to view, filter, statistic product
    - Server GraphQL to insert delete update product, review

**Server RESTful API**

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
    