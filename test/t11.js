let nk = require('./nk')
let cfg = require('./nk.cfg')
let Product = require('../fastify/models/product')
const log = console.log

// Test Ok
// nk.fetchProductByCTOnePage(cfg.cities[0], cfg.orderBy[0],1, products =>{
//     Product.insertMany(JSON.parse(products))
// })

// customize to save db
async function fetchProductByCTAllPage(cityId, orderBy, fromPage, toPage) {
    try {
        nk.fetchProductByCTOnePage(cityId, orderBy, fromPage, (products) => {
            Product.insertMany(JSON.parse(products), () => {
                fromPage = fromPage + 1
                if (fromPage <= toPage) {
                    setTimeout(() => {
                        log('====> Current page = ', fromPage)
                        fetchProductByCTAllPage(cityId, orderBy, fromPage, toPage)
                    }, 1000)
                }
                else {
                    log('Done fetching product all %s page', toPage)
                }
            })
        })
    } catch (error) {
        log('fetchProductByCTAllPage')
        log(error)
    }
}
var productIds = []
async function fetchProductByCTAllPageGetNewProducts(cityId, orderBy, fromPage, toPage) {
    try {
        //var productIds = []
        return nk.fetchProductByCTOnePage(cityId, orderBy, fromPage, (products) => {
            productIds = productIds.concat(products.map(product => parseInt(product.id)))
            log('products:%s', products.length)
            //log(products.map(product => product.id))
            fromPage++
            if (fromPage <= toPage) {
                setTimeout(() => {
                    log('====> Current page = ', fromPage)
                    fetchProductByCTAllPageGetNewProducts(cityId, orderBy, fromPage, toPage)
                }, 1000)
            }
            else {
                log('Done fetching product all %s page', toPage)
                log(productIds.length)
                log(JSON.stringify(productIds))
                //return productIds
            }
        })
    } catch (error) {
        log('fetchProductByCTAllPage')
        log(error)
    }
}
// save data to mongodb
//fetchProductByCTAllPage(cfg.cities[0], cfg.orderBy[0], 1, 500)
(async () => {
    log(await fetchProductByCTAllPageGetNewProducts(cfg.cities[0], cfg.orderBy[0], 1, 10))
})()
