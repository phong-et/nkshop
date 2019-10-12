let nk = require('../nk')
let cfg = require('../nk.cfg')
let Product = require('../api/model/product')
const log = console.log

// Test Ok
// nk.fetchProductByCTOnePage(cfg.cities[0], cfg.orderBy[0],1, products =>{
//     Product.insertMany(JSON.parse(products))
// })


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
// save data to mongodb
fetchProductByCTAllPage(cfg.cities[0], cfg.orderBy[0], 1, 500)