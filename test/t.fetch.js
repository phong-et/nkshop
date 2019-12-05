// fetch product include product(save to disk), image product, review(save to disk), image review
let productIdList = [
],
    nk = require('../nk'),
    cfg = require('../nk.cfg'),
    ProductDetail = require('../fastify/models/productDetail'),
    Review = require('../fastify/models/review'),
    log = console.log

async function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

function wait(label, i, val) {
    var seconds = Array(1000, 500, 1500, 500)
    second = seconds[Math.floor(Math.random() * seconds.length)]
    log('%sId[%s] = %s, wait : ', label, i, val, second)
    return second
}
async function fetchProductDetailByListId(url, productIdList) {
    try {
        for (let i = 0; i < productIdList.length; i++) {
            await delay(wait('product', i, productIdList[i]))
            var jsonProduct = await nk.fetchJsonOfProduct(url, productIdList[i])
            if (jsonProduct) {
                log(`price:${jsonProduct.price} || ratingCount:${jsonProduct.ratingCount}`)
                await ProductDetail.insert(jsonProduct)
                await nk.fetchProduct(url, productIdList[i], jsonProduct)
                await Review.insertMany(await nk.fetchReviewListOfProductSaveDb(cfg.reviewUrl, jsonProduct.id, jsonProduct.ratingCount))
            }
            else
                log('Product is null')
        }
    } catch (error) {
        log(error.message)
    }
}

(async function () {
    fetchProductDetailByListId(cfg.productUrl, productIdList)
})()