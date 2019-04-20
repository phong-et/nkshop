let rp = require('request-promise'),
  request = require('request'),
  fs = require('fs'),
  cfg = require('./nk.cfg.js'),
  log = console.log,
  headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
  }
const DIR_PRODUCTS = 'products/'
const DIR_REVIEWS = 'reviews/'

function appendFile(fileName, content) {
  return new Promise((resolve, reject) => {
    fs.appendFile(fileName, content, function(err) {
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

async function fetchDirectories(url) {}

///////////////////////// WRITE FILE /////////////////////////////
function writeProduct(productId, content) {
  return new Promise((resolve, reject) => {
    let dir = DIR_PRODUCTS + productId,
      fileName = dir + '/' + productId + '.json'

    if (!fs.existsSync(DIR_PRODUCTS)) {
      fs.mkdirSync(DIR_PRODUCTS)
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    fs.writeFile(fileName, content, function(err) {
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
    fs.writeFile(fileName, content, function(err) {
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
    fs.writeFile(fileName, content, function(err) {
      if (err) reject(err)
      var statusText = 'write file > ' + fileName + ' success'
      //log(statusText)
      resolve(statusText)
    })
  })
}
///////////////////////// FETCH Product /////////////////////////
async function fetchProduct(url, productId) {
  try {
    var options = {
      url: url + '/' + productId,
      headers: headers,
    }
    let json = await rp(options)
    writeProduct(productId, json)
    let nkJson = JSON.parse(json)
    await fetchImagesOfProduct(nkJson)
    let reviewIds = await fetchReviewListOfProduct(cfg.reviewUrl, productId, nkJson.ratingCount)
    await fetchReviewsOfProduct(cfg.reviewUrl, productId, reviewIds)
  } catch (error) {
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
      downloadImage(fileName, url, () => {})
    })
  } catch (error) {
    log(error)
  }
}
async function fetchImagesOfReview(nkJson, productId) {
  try {
    nkJson.data.review.photos.forEach(e => {
      ;(dir = DIR_PRODUCTS + productId + '/' + DIR_REVIEWS),
        (url = e.data.dimensions.original.url),
        (fileName = dir + url.substring(url.lastIndexOf('/') + 1))
      downloadImage(fileName, url, () => {})
    })
  } catch (error) {
    log(error)
  }
}

function downloadImage(fileName, url, callback) {
  try {
    request.head(url, () => {
      try {
        request(url)
          .pipe(fs.createWriteStream(fileName))
          .on('close', callback)
      } catch (error) {
        log(error)
      }
    })
  } catch (error) {
    log('downloadImage %s error :%s', fileName, error.message)
  }
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
    log(error.message)
  }
}
// Test 1

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
  var seconds = Array(1111, 2222, 3333, 4444)
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
fetchProducts(cfg.productUrl, cfg.nkProductIds)
