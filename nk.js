let rp = require('request-promise'),
  request = require('request'),
  cheerio = require('cheerio'),
  fs = require('fs'),
  cfg = require('./nk.cfg.js'),
  log = console.log,
  headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
  }
const DIR_PRODUCTS = 'products/'
const DIR_REVIEWS = 'reviews/'

function appendFile(fileName, content) {
  return new Promise((resolve, reject) => {
    fs.appendFile(fileName, content, function (err) {
      if (err) reject(err)
      var statusText = 'write file > ' + fileName + ' success'
      log(statusText)
      resolve(statusText)
    })
  })
}

///////////////////////// FETCH PRODUCT /////////////////////////
async function fetchProductList(url, params) {
  var options = {
    url: url,
    qs: params,
    headers: headers,
  }
  let json = await rp(options)
  log(json)
  return json
}
// Test 0

async function fetchDirectories(url) { }

///////////////////////// WRITE FILE /////////////////////////////
function writeProduct(productId, content) {
  content = JSON.stringify(content)
  return new Promise((resolve, reject) => {
    let dir = DIR_PRODUCTS + productId,
      fileName = dir + '/' + productId + '.json'

    if (!fs.existsSync(DIR_PRODUCTS)) {
      fs.mkdirSync(DIR_PRODUCTS)
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    fs.writeFile(fileName, content, function (err) {
      if (err) reject(err)
      var statusText = 'write file > ' + fileName + ' success'
      //log(statusText)
      resolve(statusText)
    })
  })
}
// folder = SGBP/
function writeProductsCity(fileName, folder, content) {
  return new Promise((resolve, reject) => {
    let dir = DIR_PRODUCTS + folder
    fileName = dir + '/' + fileName + '.json'

    if (!fs.existsSync(DIR_PRODUCTS)) {
      fs.mkdirSync(DIR_PRODUCTS)
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    fs.writeFile(fileName, content, function (err) {
      if (err) reject(err)
      var statusText = 'write file > ' + fileName + ' success'
      //log(statusText)
      resolve(statusText)
    })
  })
}
function writeReviews(productId, content) {
  return new Promise((resolve, reject) => {
    let dir = DIR_PRODUCTS + productId + '/' + DIR_REVIEWS,
      fileName = dir + productId + '.json'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    fs.writeFile(fileName, content, function (err) {
      if (err) reject(err)
      var statusText = 'write file > ' + fileName + ' success'
      //log(statusText)
      resolve(statusText)
    })
  })
}
function writeReview(productId, reviewId, content) {
  return new Promise((resolve, reject) => {
    let dir = DIR_PRODUCTS + productId + '/' + DIR_REVIEWS,
      fileName = dir + reviewId + '.json'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    fs.writeFile(fileName, content, function (err) {
      if (err) reject(err)
      var statusText = 'write file > ' + fileName + ' success'
      //log(statusText)
      resolve(statusText)
    })
  })
}
///////////////////////// FETCH Product /////////////////////////
async function fetchJsonOfProduct(url, productId) {
  try {
    var options = {
      url: url + '/' + productId,
      headers: headers,
    }
    return JSON.parse(await rp(options))
  } catch (error) {
    throw error
  }
}
async function fetchProduct(url, productId, jsonProduct) {
  try {
    // var options = {
    //   url: url + '/' + productId,
    //   headers: headers,
    // }
    // let json = await rp(options)
    if (jsonProduct === undefined)
      jsonProduct = await fetchJsonOfProduct(url, productId)
    writeProduct(productId, jsonProduct)
    fetchImagesOfProduct(jsonProduct)
    let reviewIds = await fetchReviewListOfProduct(cfg.reviewUrl, productId, jsonProduct.ratingCount)
    await fetchReviewsOfProduct(cfg.reviewUrl, productId, reviewIds)
  } catch (error) {
    log('error at fetchProduct')
    log(error.message)
  }
}

///////////////////////// FETCH Image Product Detail /////////////////////////
async function fetchImagesOfProduct(nkJson) {
  try {
    nkJson.photos.forEach(e => {
      let productId = nkJson.id,
        dir = DIR_PRODUCTS + productId + '/',
        url = e.data.dimensions.original.url,
        fileName = dir + url.substring(url.lastIndexOf('/') + 1)
      downloadImage(fileName, url, () => { })
    })
  } catch (error) {
    log(error)
  }
}
async function fetchImagesOfReview(nkJson, productId) {
  try {
    nkJson.data.review.photos.forEach(e => {
      let dir = DIR_PRODUCTS + productId + '/' + DIR_REVIEWS
      let url = e.data.dimensions.original.url
      let encodeUrl = url.substring(0, url.lastIndexOf('review-of-') + 1) + encodeURIComponent(url.substring(url.lastIndexOf('review-of-') + 1, url.length))
      //log(encodeUrl);
      let fileName = dir + url.substring(url.lastIndexOf('/') + 1)
      downloadImage(fileName, encodeUrl, () => { })
    })
  } catch (error) {
    log('fetchImagesOfReview:')
    log(error)
  }
}

function downloadImage(fileName, url, callback) {
  request.head(url, (error, response, body) => {
    if (error) log('downloadImage.request.head:' + error)
    else {
      try {
        request(url, (error, response, body) => {
          try {
            if (error) log('downloadImage.request.head.request:' + error)
          } catch (error) {
            log('downloadImage.request.head.request.catch:' + error)
          }
        })
          .pipe(fs.createWriteStream(fileName)
            .on("error", (err) => log('downloadImage.request.head.request.fs.createWriteStream' + err))
          )
          .on("error", (err) => log('downloadImage.request.head.request.pipe' + err))
          .on('close', callback)
      } catch (error) {
        log('downloadImage %s error fs.createWriteStream :%s', fileName, error.message)
        log(error)
      }
    }
  })
}

async function fetchReviewListOfProduct(url, productId, reviewPerPageNumber) {
  try {
    var options = {
      url: url,
      headers: headers,
      qs: {
        entityId: productId,
        entityType: 'product',
        includeAuthor: true,
        orderBy: 'latest',
        page: 1,
        plugin: 'escort',
        rpp: reviewPerPageNumber,
      },
    }
    let json = await rp(options)
    writeReviews(productId, json)
    reviewIds = JSON.parse(json).map(review => review.id)
    // log(reviewIds);
    log('reviewIds.length = %s', reviewIds.length)
    return reviewIds
  } catch (error) {
    log('fetchReviewListOfProduct:')
    log(error.message)
  }
}

async function fetchReviewListOfProductSaveDb(url, productId, reviewPerPageNumber) {
  try {
    var options = {
      url: url,
      headers: headers,
      qs: {
        entityId: productId,
        entityType: 'product',
        includeAuthor: true,
        orderBy: 'latest',
        page: 1,
        plugin: 'escort',
        rpp: reviewPerPageNumber,
      },
    }
    let json = await rp(options)
    let arrReview = JSON.parse(json)
    //log(options)
    //log(arrReview)
    arrReview.forEach(review => {
      review.survey = JSON.parse(review.survey)
      review.productId = productId
    })
    log('arrReview.length = %s', arrReview.length)
    return arrReview
  } catch (error) {
    log(error.message)
  }
}

async function fetchReviewOfProduct(url, reviewId, productId) {
  try {
    var options = {
      url: url + '/' + reviewId,
      headers: headers,
    }
    let json = await rp(options)
    writeReview(productId, reviewId, json)
    await fetchImagesOfReview(JSON.parse(json), productId)
  } catch (error) {
    log('fetchReviewOfProduct:')
    log(error.message)
  }
}
// Test 2

async function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
function wait(label, i, val) {
  var seconds = Array(1000, 2000, 1500, 500)
  second = seconds[Math.floor(Math.random() * seconds.length)]
  log('%sId[%s] = %s, wait : ', label, i, val, second)
  return second
}
async function fetchReviewsOfProduct(url, productId, reviewIds) {
  try {
    for (let i = 0; i < reviewIds.length; i++) {
      await delay(wait('review', i, reviewIds[i]))
      await fetchReviewOfProduct(url, reviewIds[i], productId)
    }
  } catch (error) {
    log('fetchReviewsOfProduct:')
    log(error.message)
  }
}
// Test 3

/////////////////  MAIN /////////////
async function fetchProducts(url, productIds) {
  try {
    for (let i = 0; i < productIds.length; i++) {
      await delay(wait('product', i, productIds[i]))
      await fetchProduct(url, productIds[i])
    }
  } catch (error) {
    log(error.message)
  }
}
async function fetchProductsByIdRange(url, fromProductId, toProductId, condition) {
  try {
    for (let i = fromProductId; i <= toProductId; i++) {
      await delay(wait('product', i, i))
      if (condition) {
        var jsonProduct = await fetchJsonOfProduct(url, i)
        try {
          if (Boolean(jsonProduct.price) && Boolean(jsonProduct.ratingCount)) {
            log(`Product[${i}] price:${jsonProduct.price} || ratingCount:${jsonProduct.ratingCount}`)
            var price = parseInt(jsonProduct.price)
            var ratingCount = parseInt(jsonProduct.ratingCount)
            log(`price:${price} || ratingCount:${jsonProduct.ratingCount}`)
            if (price >= condition.price)
              await fetchProduct(url, i, jsonProduct)
            else
              log('price low')
          } else {
            log('JSON Product failed')
          }
        } catch (error) {
          log(error)
        }
      }
    }
  } catch (error) {
    log(error.message)
  }
}
let ProductDetail = require('./api/model/productDetail')
async function fetchProductDetailByListId(url, productIdList) {
  try {
    for (let i = 0; i < productIdList.length; i++) {
      await delay(wait('product', i, productIdList[i]))
      var jsonProduct = await fetchJsonOfProduct(url, productIdList[i])
      if (jsonProduct) {
        log(`price:${jsonProduct.price} || ratingCount:${jsonProduct.ratingCount}`)
        await ProductDetail.insert(jsonProduct)       
        await fetchProduct(url, productIdList[i], jsonProduct)
      }
      else
        log('Product is null')
    }
  } catch (error) {
    log(error.message)
  }
}

// save file to disk
function fetchProductsSGByPriceDescOnePage(pageNumber, callback) {
  let offset = pageNumber == 1 ? 0 : pageNumber * 20
  log(`offset = ${offset} || pageNumber = ${pageNumber}`);
  request(cfg.productUrl + '?cityCode=' + cfg.cities[0] + '&mode=directory&offset=' + offset + '&orderBy=byPriceDesc', function (error, response, body) {
    //log('error:', error);
    log('statusCode:', response && response.statusCode);
    log('headers:', response && response.headers);
    //console.log('body:', body);
    //writeProduct('fetchProductsSGByPriceDescOnePage' + new Date().getTime(), body)
    if (response && response.statusCode === 503) {
      requestChkJschl(body, response.headers['set-cookie'])
    }
    else {
      callback(body);
    }
  })
}

// Test OnePage
// fetchProductsSGByPriceDescOnePage(0, (data) => {
//   writeProductsCity('P1', 'SGBPD/', data)
// })

/////////////////////// Recursive load all pages ///////////////////////
let nkProducts = []
function fetchProductsSGByPriceDescAllPage(fromPage, toPage) {
  var startPage = fromPage
  try {
    fetchProductsSGByPriceDescOnePage(fromPage, (data) => {
      //log(data);
      nkProducts = nkProducts.concat(JSON.parse(data))
      writeProductsCity('P' + fromPage, 'SGBPD/', data)
      fromPage = fromPage + 1
      log('fromPage=%s toPage=%s', fromPage, toPage)
      if (fromPage <= toPage) {
        setTimeout(() => {
          fetchProductsSGByPriceDescAllPage(fromPage, toPage)
        }, 1000)
      }
      else {
        log('ProductIds is loaded')
        log(nkProducts.length);
        var nkProductIds = nkProducts.map(product => product.id)
        log(nkProductIds);
        //fetchProducts(cfg.productUrl, nkProductIds)
        writeProductsCity('P_ALL_' + startPage + '_' + toPage, 'SGBPD/', JSON.stringify(nkProducts))
      }
    })
  } catch (error) {
    log('fetchProductsSGByPriceDescAllPage')
    log(error)
  }
}
// fetchProductsSGByPriceDescOnePage(1,()=> {})
// fetchProductsSGByPriceDescAllPage(251,500)

// save to db version 
async function fetchProductByCTOnePage(cityId, orderBy, currentPage, callback){
  let offset = currentPage == 1 ? 0 : currentPage * 20
  log(`offset = ${offset} || currentPage = ${currentPage}`)

  /////////////// Request-native (success) ///////////////
  var url = cfg.productUrl + '?cityCode=' + cityId + '&mode=directory&offset=' + offset + '&orderBy=' + orderBy
  log(url)
  request(url, function (error, response, body) {
    if(error) log(error);
    log('statusCode:', response && response.statusCode);
    //log('headers:', response && response.headers);
    //log('body:', body);
    //writeProduct('fetchProductsSGByPriceDescOnePage' + new Date().getTime(), body)
    if (response && response.statusCode === 503) {
      callback(503)
    }
    else {
      callback(body);
    }
  })
  /////////////// Request promise (failed) ///////////////
  // var options = {
  //   url: cfg.productUrl,
  //   //headers: headers,
  //   qs: {
  //     cityCode: cityId,
  //     mode: 'directory',
  //     offset: offset,
  //     orderBy: orderBy
  //   }
  // }
  // log(options)
  // let products = await rp(options)
  // .catch(function (err) {
  //   console.log(err)
  // })
  // log(products)
  // return products
}
module.exports = {
  downloadImage: downloadImage,
  fetchProducts: fetchProducts,
  fetchProductsSGByPriceDescAllPage: fetchProductsSGByPriceDescAllPage,
  fetchProductsByIdRange: fetchProductsByIdRange,
  fetchProductDetailByListId: fetchProductDetailByListId,
  fetchProductByCTOnePage: fetchProductByCTOnePage,
  fetchReviewListOfProductSaveDb: fetchReviewListOfProductSaveDb
  //fetchJsonOfProduct: fetchJsonOfProduct
  // requestChkJschl: requestChkJschl,
  // fetchProductsSGByPriceDescOnePage: fetchProductsSGByPriceDescOnePage
}
