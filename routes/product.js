let express = require('express'),
  router = express.Router(),
  log = console.log,
  ProductDetail = require('../models/productDetail'),
  ProductLog = require('../models/productLog'),
  Review = require('../models/review'),
  cfg = require('../nk.cfg'),
  nk = require('../nk'),
  rimraf = require('rimraf')
const DELETED = 99

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
        nk.downloadCoverProduct(nk.findCoverUrl(jsonProduct))
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
router.get('/findConditions', async function (req, res) {
  try {
    //log(req.query)
    let productIds,
      query = JSON.parse(req.query['query']),
      expandedQuery = req.query['expandedQuery']
    if (expandedQuery) {
      expandedQuery = JSON.parse(req.query['expandedQuery'])
      let date = expandedQuery['date']
      switch (expandedQuery['collection']) {
        case 'review':
          productIds = await Review.fetchProductIdInReivews(date)
          break;
        case 'log':
          productIds = await ProductLog.fetchProductIdInLogs(date)
          break;
        // todo, union two array
        case 'review-log':
          productIds = Array.from(new Set([...await Review.fetchProductIdInReivews(date), ...await ProductLog.fetchProductIdInLogs(date)]))
          break;
      }
    }
    //log('productIds:%s', productIds.length)
    let products = await ProductDetail.fetchProductByConditions(query, productIds)
    log(products.length)
    res.send(products)
  } catch (error) {
    log(error)
    res.send(error)
  }
})

router.get('/openFolder/:productId', function (req, res) {
  //log('------ req.params --------')
  log(req.params)
  let path = require('path');
  let pathFolder = path.dirname(require.main.filename).split(path.sep)
  pathFolder.pop()
  //pathFolder.pop()
  require('child_process').exec('start ' + pathFolder.join('/') + cfg.productFolder + '/' + req.params.productId)
  res.send(true)
})

router.get('/configurations', async function (_, res) {
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

router.get('/review/update/:productId', async function (req, res) {
  log(`==> /products/review/update/${req.params.productId}`)
  //let isFetchImageProduct = JSON.parse(req.query.isFetchImageProduct.toLowerCase()),
  //isFetchImageReview = JSON.parse(req.query.isFetchImageReview.toLowerCase())
  //log(`isFetchImageProduct = ${isFetchImageProduct}`)
  try {
    let productId = req.params.productId,
      oldReviewIds = await Review.fetchReviewIdsOfProduct(productId),
      jsonProduct = await nk.fetchJsonOfProduct(cfg.productUrl, productId)
    // Update status = DELETED
    if (jsonProduct === null) {
      let productDetailObject = await ProductDetail.fetchProductById(productId)
      productDetailObject.status = DELETED
      let productDetailJson = JSON.stringify(productDetailObject)
      productDetailJson = JSON.parse(productDetailJson)
      delete productDetailJson._id
      delete productDetailJson.__v
      //log(productDetailJson)
      await ProductDetail.update(productId, productDetailJson)
      log('ProductId=%s was DELETED', productId)
      res.send({
        newReviewIds: [],
        status: DELETED
      })
    }
    else {
      let currentReviewIds = await nk.fetchReviewIdsOfProduct(cfg.reviewUrl, productId, jsonProduct.ratingCount),
        //newReviewIds = oldReviewIds.length > 0 ? currentReviewIds.filter(value => !oldReviewIds.includes(value)) : [],
        newReviewIds = currentReviewIds.filter(value => !oldReviewIds.includes(value)),
        totalReviewIds = currentReviewIds.concat(oldReviewIds)

      totalReviewIds = [...new Set(totalReviewIds)]
      await ProductDetail.updateRatingCount(productId, jsonProduct, totalReviewIds.length)
      //if (isFetchImageProduct) nk.fetchImagesOfProduct(jsonProduct)
      //if (jsonProduct.price >= cfg.minPriceFetchImage && isFetchImageProduct) await nk.fetchImagesOfProduct(jsonProduct)
      let coverUrl = nk.findCoverUrl(jsonProduct), coverName = ""
      if (coverUrl && !nk.isExistedCover(coverUrl)) nk.downloadCoverProduct(coverUrl)
      if (coverUrl) coverName = 'covers/' + coverUrl.substring(coverUrl.lastIndexOf('/') + 1)
      log(`oldReviewIds : ${JSON.stringify(oldReviewIds)}`)
      log(`currentReviewIds: ${JSON.stringify(currentReviewIds)}`)
      log(`newReviewIds: ${JSON.stringify(newReviewIds)}`)
      if (newReviewIds.length > 0) {
        log(`Update images & json ${newReviewIds.length} review`)
        let reviews = await Promise.all(newReviewIds.map(async reviewId => {
          try {
            let review = await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId)
            //log(review.data)
            //if (isFetchImageReview) nk.fetchImagesOfReview(review.data.review.photos, productId)
            if (jsonProduct.price >= cfg.minPriceFetchImage)
              await nk.fetchImagesOfReview(review.data.review.photos, productId)
            review.data.review["productId"] = productId
            // fixed missing out author field 3/2/2019 from (1/10/2019)
            review.data.review["author"] = review.data.author
            return review.data.review
          } catch (error) {
            log(error)
          }
        }))
        let filteredReviews = reviews.filter(review => {
          if (review.timeStamp != undefined)
            return reviews
        })
        if (filteredReviews.length > 0)
          await Review.insertMany(filteredReviews)
      }

      res.send({
        newReviewIds: newReviewIds,
        status: (jsonProduct.meta && jsonProduct.meta.onLeave) ? 3 : jsonProduct.status,
        coverName: coverName
      })
    }
  } catch (error) {
    log(error)
    res.send(error)
  }
})
router.get('/currentreviews/:productId', async function (req, res) {
  try {
    let productId = req.params.productId,
      jsonProduct = await nk.fetchJsonOfProduct(cfg.productUrl, productId),
      currentReviewIds = await nk.fetchReviewIdsOfProduct(cfg.reviewUrl, productId, jsonProduct.ratingCount)
    await ProductDetail.updateRatingCount(productId, jsonProduct, currentReviewIds.length)
    //nk.fetchImagesOfProduct(jsonProduct)
    log(`currentReviewIds: ${JSON.stringify(currentReviewIds)}`)
    if (currentReviewIds.length > 0) {
      log(`Fetch all images ${currentReviewIds.length} reviews`)
      // await Promise.all(currentReviewIds.map(async (reviewId, index) => {
      //     try {
      //         await nk.delay(nk.wait('reivew', index, reviewId))
      //         await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId)
      //     } catch (error) {
      //         log(error)
      //     }
      // }))
      nk.fetchReviewsOfProductSafe(cfg.reviewUrl, productId, currentReviewIds)
    }
    currentReviewIds.sort((a, b) => a - b)
    res.send({
      currentReviewIds: currentReviewIds,
    })
  } catch (error) {
    res.send({ error })
  }
})

router.get('/latest/', async function (_, res) {
  let productId = await ProductDetail.fetchLatestProductId()
  res.send(productId.toString())
})

router.get('/add/', async function (req, res) {
  try {
    let listId = JSON.parse(req.query['listId']).map(id => parseInt(id)),
      acceptedMinPrice = req.query['acceptedMinPrice']
    log(listId)
    fetchProductsDetailByListId(cfg.productUrl, listId, parseInt(acceptedMinPrice))
    res.send({ success: true })
  } catch (error) {
    log(error)
    res.send({ success: false, msg: error.message })
  }
})

router.get('/new/listid/:pageRange', async function (req, res) {
  try {
    let latestId = await ProductDetail.fetchLatestProductId(),
      pageRange = req.params.pageRange.split(','),
      fromPage = pageRange[0], toPage = pageRange[1]
    fetchProductsByCTByPageRange(cfg.cities[0], cfg.orderBy[0], fromPage, toPage, [], ids => {
      if (ids === 503)
        res.send(503)
      else {
        let newIds = []
        ids.forEach(id => {
          if (id > latestId)
            newIds.push(id)
        })
        res.send(newIds.sort((a, b) => a - b))
      }
    })
  } catch (error) {
    log(error)
    res.send({ success: false, msg: error.message })
  }
})

router.get('/delete/:productId', async function (req, res) {
  try {
    let productId = req.params.productId
    log('delete productId = ' + productId)
    let path = require('path');
    let pathFolder = path.dirname(require.main.filename).split(path.sep)
    pathFolder.pop()
    pathFolder = pathFolder.join('/') + cfg.productFolder + productId
    log('pathFolder', pathFolder)
    rimraf(pathFolder, e => log(e))
    if (req.query.isDeleteAtDatabase) {
      await ProductDetail.deleteProduct(productId)
    }
    res.send({ success: true })
  } catch (error) {
    log(error)
    res.send({ success: false, msg: error.message })
  }
})

router.get('/review/:productId', async function (req, res) {
  log('----req.query----')
  log(req.params)
  try {
    let productId = req.params.productId,
      reviews = await Review.fetchReviewsOfProduct(productId)
    res.send({ reviews: reviews, })
  } catch (error) {
    res.send({ error })
  }
})
router.get('/update/cover/:productId', async function (req, res) {
  log(req.params)
  try {
    let productId = req.params.productId,
      jsonProduct = await nk.fetchJsonOfProduct(cfg.productUrl, productId),
      coverUrl = nk.findCoverUrl(jsonProduct)
    nk.downloadCoverProduct(coverUrl)
    let coverName = coverUrl.substring(coverUrl.lastIndexOf('/') + 1)
    coverName = 'covers/' + coverName
    res.send({ coverName })
  } catch (error) {
    res.send({ error })
  }
})
router.post('/update/logs', async function (req, res) {
  log(req.body.logs)
  try {
    let logs = JSON.parse(req.body.logs)
    log(logs)
    await ProductLog.insertMany(logs)
    res.send({ success: true })
  } catch (error) {
    log(error)
    res.send({ error })
  }
})
module.exports = router;
