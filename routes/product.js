let express = require('express'),
  router = express.Router(),
  log = console.log,
  ProductDetail = require('../models/productDetail'),
  //ProductLog = require('../models/productLog'),
  Review = require('../models/review'),
  District = require('../models/district'),
  City = require('../models/city'),
  cfg = require('../nk.cfg'),
  nk = require('../nk'),
  rimraf = require('rimraf')
function fetchProductsByCTByPageRange(cityId, orderBy, fromPage, toPage, productIds, callback) {
  try {
    return nk.fetchProductByCTOnePage(cityId, orderBy, fromPage, products => {
      //log(products)
      if (products === 503) { callback(503); return; }
      productIds = productIds.concat(products.map(product => parseInt(product.id)))
      //log('products:%s', products.length)
      //log(products.map(product => product.id))
      fromPage++
      if (fromPage <= toPage) {
        log('====> Current page = ', fromPage)
        return fetchProductsByCTByPageRange(cityId, orderBy, fromPage, toPage, productIds, callback)
      }
      else {
        log(`Fetched ${productIds.length} products in ${toPage}`)
        log(JSON.stringify(productIds))
        callback(productIds)
      }
    })
  } catch (error) {
    log('fetchProductsByCTByPageRange')
    log(error)
  }
}
async function fetchProductsDetailByListId(url, productIdList, acceptedMinPrice) {
  try {
    for (let i = 0; i < productIdList.length; i++) {
      let productId = productIdList[i]
      await nk.delay(nk.wait('product', i, productId))
      var jsonProduct = await nk.fetchJsonOfProduct(url, productId)
      if (jsonProduct && jsonProduct.ratingCount) {
        log(`price:${jsonProduct.price} || ratingCount:${jsonProduct.ratingCount}`)
        await ProductDetail.insert(jsonProduct)
        let reviewsJson = await nk.fetchReviewsOfProduct(cfg.reviewUrl, productId, jsonProduct.ratingCount)
        await Review.insertMany(reviewsJson)
        if (jsonProduct.price >= acceptedMinPrice) {
          nk.fetchImagesOfProduct(jsonProduct)
          reviewsJson.forEach(reviewJson => nk.fetchImagesOfReview(reviewJson.photos, productId))
        }
        else
          log(`Rejected => Price: ${jsonProduct.price}`)
      }
      else
        log('Product is NULL')
    }
  } catch (error) {
    log(error.message)
  }
}
/* GET users listing. */
router.get('/findConditions', async function (req, res) {
  try {
    let query = JSON.parse(req.query['query']),
      reviewDay = req.query['reviewDay'],
      productIdsOfReview
    if (reviewDay)
      productIdsOfReview = await Review.fetchProductIdByReviewDay(reviewDay)
    let products = await ProductDetail.findProductByConditions(query, productIdsOfReview)
    log(products.length)
    res.send(products)
  } catch (error) {
    res.send(error)
  }
})
router.get('/configurations', async function (req, res) {
  //log(req.path)
  res.send({
    statuses: cfg.statuses,
    productDetailUrl: cfg.productDetailUrl,
    authorUrl: cfg.authorUrl,
    chart: cfg.chart,
    errors: cfg.errors,
    coverUrl: cfg.coverUrl,
    regions: cfg.attributes["68"],
    minPriceFetchImage: cfg.minPriceFetchImage
  })
})

module.exports = router;
