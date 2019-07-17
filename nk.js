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
    log('fetchReviewListOfProduct:')
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

var isUsedCookie = false,
  jar
async function fetchProductsByCity(productUrl, cityCode, minPrice, minReviewCount) {
  try {
    var qs = {
      cityCode: encodeURI(cityCode),
      mode: 'directory',
      offset: '0',
      orderBy: 'byPriceDesc'
    }
    var options = {
      url: productUrl,
      headers: headers,
      qs: qs
    }
    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
        log(json)
      }
      else {
        log(response.headers)
        log(response.statusCode)
        if (!isUsedCookie) {
          jar = request.jar()
          var arrayCookie = ['__cfduid=dfea12d33ef91eeba002fbdec124e2cc01561876504; cf_clearance=19ae0c872ccde7e6768229e5fb65261b126fa86a-1561876508-604800-150; 06cb36fc0e9a783099b7974a96a6d0c0=40euic29k024onc4u8qb8f4n31; base_language_id=2; __utma=159633447.272160313.1561876512.1561876512.1561876512.1; __utmc=159633447; __utmz=159633447.1561876512.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)']
          arrayCookie.forEach((cookies) => {
            cookies.split(';').forEach((cookie) => {
              jar.setCookie(request.cookie(cookie.trim()), productUrl)
            })
          })
          isUsedCookie = true;
          options['jar'] = jar
          log(options)
          request(options, (e, r, body) => {
            log(r.headers)
            log(r.statusCode)
            log(body)
          })
        }
      }
    });
  } catch (error) {
    log(error.message)
  }
}

// Recursive load all pages
function fetchProductsSGByPriceDescOnePage(page, callback) {
  let offset = page == 1 ? 0 : page * 20
  log(`offset = ${offset} || page = ${page}`);
  request(cfg.productUrl + '?cityCode=' + cfg.cities[0] + '&mode=directory&offset=' + offset + '&orderBy=byPriceDesc', function (error, response, body) {
    //log('error:', error);
    //log('statusCode:', response && response.statusCode);
    //log('headers:', response && response.headers);
    //console.log('body:', body);
    callback(body);
  })
}
// Test OnePage
// fetchProductsSGByPriceDescOnePage(0, (data) => {
//   writeProductsCity('P1', 'SGBPD/', data)
// })

let page = 2,
  nkProducts = []
function fetchProductsSGByPriceDescAllPage(i) {
  try {
    fetchProductsSGByPriceDescOnePage(i, (data) => {
      //log(data);
      nkProducts = nkProducts.concat(JSON.parse(data))
      writeProductsCity('P' + i, 'SGBPD/', data)
      i = i + 1
      if (i <= page) {
        setTimeout(() => {
          fetchProductsSGByPriceDescAllPage(i)
        }, 1000)
      }
      else {
        log('ProductIds is leaded')
        log(nkProducts.length);
        var nkProductIds = nkProducts.map(product => product.id)
        log(nkProductIds);
        fetchProducts(cfg.productUrl, nkProductIds)
        writeProductsCity('P_ALL', 'SGBPD/', JSON.stringify(nkProducts))
      }
    })
  } catch (error) {
    log('fetchProductsSGByPriceDescAllPage')
    log(error)
  }
}
fetchProductsSGByPriceDescAllPage(2)


module.exports = {
  downloadImage: downloadImage
}