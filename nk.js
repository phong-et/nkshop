let cfg = require('./nk.cfg.js'),
    log = console.log,
    shell = require("shelljs"),
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
    },
    rp = cfg.activedCF ? require('cloudscraper') : require('request-promise'),
    request = require('request'),
    fs = require('fs')
const DIR_PRODUCTS = __dirname + cfg.productFolder + '/'
const DIR_REVIEWS = 'reviews/'

//////////////////////////////////////////// UTIL ///////////////////////////////////////////
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

async function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

function wait(label, i, val) {
    var seconds = Array(1000, 2000, 3000, 1500)
    second = seconds[Math.floor(Math.random() * seconds.length)]
    log('%sId[%s] = %s, wait : ', label, i, val, second)
    return second
}


///////////////////////// PRODUCT /////////////////////////
async function fetchJsonOfProduct(url, productId) {
    try {
        var options = {
            url: url + '/' + productId,
            headers: headers,
        }
        log(`==> Fetched json of product id = ${productId} `)
        return JSON.parse(await rp(options))
    } catch (error) {
        throw error
    }
}
async function fetchProduct(url, productId, jsonProduct) {
    try {
        if (jsonProduct === undefined)
            jsonProduct = await fetchJsonOfProduct(url, productId)
        //writeProduct(productId, jsonProduct)
        shell.mkdir("-p", DIR_PRODUCTS + productId)
        fetchImagesOfProduct(jsonProduct)
        let reviewIds = await fetchReviewIdsOfProduct(cfg.reviewUrl, productId, jsonProduct.ratingCount)
        await fetchReviewsOfProduct(cfg.reviewUrl, productId, reviewIds)
    } catch (error) {
        log('error at fetchProduct')
        log(error.message)
    }
}

async function fetchImagesOfProduct(productJson) {
    try {
        productJson.photos.forEach(e => {
            let productId = productJson.id,
                dir = DIR_PRODUCTS + productId + '/',
                url = e.data.dimensions.original.url,
                fileName = dir + url.substring(url.lastIndexOf('/') + 1)

            shell.mkdir("-p", dir);
            downloadImage(fileName, url, () => { })
            // download cover image
            if (e.type === 'cover') {
                let productId = productJson.id,
                    dir = DIR_PRODUCTS + productId + '/',
                    url = e.data.dimensions.small.url,
                    fileName = dir + url.substring(url.lastIndexOf('/') + 1)
                //log(fileName)
                log('Downloaded cover')
                downloadImage(fileName, url, () => { })
            }
        })
    } catch (error) {
        log(error)
    }
}
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

///////////////////////// REVIEW /////////////////////////
function fetchImagesOfReview(reviewJsonPhotos, productId) {
    try {
        let dir = DIR_PRODUCTS + productId + '/' + DIR_REVIEWS
        shell.mkdir("-p", dir);
        //reviewJson.data.review.photos
        reviewJsonPhotos.forEach(e => {
            let url = e.data.dimensions.original.url
            //// new review url
            let encodeUrl = url.substring(0, url.lastIndexOf('review-of-') + 1) + encodeURIComponent(url.substring(url.lastIndexOf('review-of-') + 1, url.length))
            //// old review url
            // let domainTemp = cfg.reviewImageUrl
            // let encodeUrl = domainTemp + encodeURIComponent(url.substring(url.lastIndexOf('review-of-'), url.length))

            log(encodeUrl)
            let fileName = dir + url.substring(url.lastIndexOf('/') + 1)
            downloadImage(fileName, encodeUrl, () => { })
        })
    } catch (error) {
        log('fetchImagesOfReview:')
        log(error)
    }
}

async function fetchReviewIdsOfProduct(url, productId, reviewPerPageNumber) {
    try {
        log(`Fetching productId=${productId} reviewPerPageNumber=${reviewPerPageNumber} ...`)
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
        reviewIds = JSON.parse(json).map(review => parseInt(review.id))
        // log(reviewIds);
        log('reviewIds.length = %s', reviewIds.length)
        return reviewIds
    } catch (error) {
        log('fetchReviewIdsOfProduct:')
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
        // disabled -> moved to fetchImagesOfReview()
        //shell.mkdir("-p", DIR_PRODUCTS + productId + '/' + DIR_REVIEWS);
        let reviewJson = JSON.parse(json)
        // locked
        //fetchImagesOfReview(reviewJson, productId)
        //log(reviewJson)
        return reviewJson
    } catch (error) {
        log('fetchReviewOfProduct:')
        log(error.message)
    }
}

// Fetch All Reivew without json and save image safe don't miss
async function fetchReviewsOfProductSafe(url, productId, reviewIds) {
    try {
        for (let i = 0; i < reviewIds.length; i++) {
            await delay(wait('review', i, reviewIds[i]))
            let reviewJson = await fetchReviewOfProduct(url, reviewIds[i], productId)
            fetchImagesOfReview(reviewJson.data.review.photos, productId)
        }
    } catch (error) {
        log('fetchReviewsOfProduct:')
        log(error.message)
    }
}
async function fetchReviewsOfProduct(url, productId, reviewPerPageNumber) {
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
        let reviews = JSON.parse(json)
        // FOREACH can not apply async await
        // reviews.forEach( async review => {
        //   review.survey = JSON.parse(review.survey)
        //   review.productId = productId
        //   let reviewDetail = await fetchReviewOfProduct(url, review.id, productId)
        //   review.photos = [];
        //   review.photos = review.photos.concat(reviewDetail.data.review.photos)
        //   //log(review.photos)
        // })

        await Promise.all(reviews.map(async review => {
            review.survey = JSON.parse(review.survey)
            review.productId = productId
            let reviewDetail = await fetchReviewOfProduct(url, review.id, productId)
            review.photos = reviewDetail.data.review.photos
        }))
        log('reviews.length = %s', reviews.length)
        return reviews
    } catch (error) {
        log(error.message)
    }
}


/////////////////////// Recursive load all pages ///////////////////////
// function fetchProductsSGByPriceDescOnePage(pageNumber, callback) {
//     let offset = pageNumber == 1 ? 0 : pageNumber * 20
//     log(`offset = ${offset} || pageNumber = ${pageNumber}`);
//     request(cfg.productUrl + '?cityCode=' + cfg.cities[0] + '&mode=directory&offset=' + offset + '&orderBy=byPriceDesc', function (error, response, body) {
//         //log('error:', error);
//         log('statusCode:', response && response.statusCode);
//         log('headers:', response && response.headers);
//         //console.log('body:', body);
//         //writeProduct('fetchProductsSGByPriceDescOnePage' + new Date().getTime(), body)
//         if (response && response.statusCode === 503) {
//             requestChkJschl(body, response.headers['set-cookie'])
//         } else {
//             callback(body);
//         }
//     })
// }
// let nkProducts = []
// function fetchProductsSGByPriceDescAllPage(fromPage, toPage) {
//     var startPage = fromPage
//     try {
//         fetchProductsSGByPriceDescOnePage(fromPage, (data) => {
//             //log(data);
//             nkProducts = nkProducts.concat(JSON.parse(data))
//             writeProductsCity('P' + fromPage, 'SGBPD/', data)
//             fromPage = fromPage + 1
//             log('fromPage=%s toPage=%s', fromPage, toPage)
//             if (fromPage <= toPage) {
//                 setTimeout(() => {
//                     fetchProductsSGByPriceDescAllPage(fromPage, toPage)
//                 }, 1000)
//             } else {
//                 log('ProductIds is loaded')
//                 log(nkProducts.length);
//                 var nkProductIds = nkProducts.map(product => product.id)
//                 log(nkProductIds);
//                 //fetchProducts(cfg.productUrl, nkProductIds)
//                 writeProductsCity('P_ALL_' + startPage + '_' + toPage, 'SGBPD/', JSON.stringify(nkProducts))
//             }
//         })
//     } catch (error) {
//         log('fetchProductsSGByPriceDescAllPage')
//         log(error)
//     }
// }

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
                        log(`price:${price} || ratingCount:${ratingCount}`)
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

function fetchProductByCTOnePage(cityId, orderBy, currentPage, callback) {
    let offset = currentPage == 1 ? 0 : currentPage * 20
    log(`offset = ${offset} || currentPage = ${currentPage}`)

    /////////////// Request-native (success) ///////////////
    var url = cfg.productUrl + '?cityCode=' + cityId + '&mode=directory&offset=' + offset + '&orderBy=' + orderBy
    log(url)
    request(url, function (error, response, body) {
        if (error)
            log(error)
        log('statusCode:', response && response.statusCode);
        log('headers:', response && response.headers);
        if (response && response.statusCode === 503) {
            callback(503)
        } else {
            callback(JSON.parse(body));
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
function createJar(cookies, request, url) {
    let jar = request.jar()
    cookies.forEach((e, i) => {
        if (i == 0)
            e.split(';').forEach(cookie => {
                jar.setCookie(request.cookie(cookie.trim()), url)
            })
    })
    return jar
}
module.exports = {
    fetchProduct: fetchProduct,
    fetchProducts: fetchProducts,
    fetchJsonOfProduct: fetchJsonOfProduct,
    fetchImagesOfProduct: fetchImagesOfProduct,
    fetchProductsByIdRange: fetchProductsByIdRange,
    fetchProductByCTOnePage: fetchProductByCTOnePage,

    fetchImagesOfReview: fetchImagesOfReview,
    fetchReviewOfProduct: fetchReviewOfProduct,
    fetchReviewsOfProduct: fetchReviewsOfProduct,
    fetchReviewIdsOfProduct: fetchReviewIdsOfProduct,
    fetchReviewsOfProductSafe: fetchReviewsOfProductSafe,

    wait: wait,
    delay: delay,
    downloadImage: downloadImage
};
// (async function () {
//   //{"data":null,"type":"exception","message":"review not found"}
//   //await fetchReviewOfProduct(cfg.reviewUrl, 89009, 24842)
//   //fetchProductByCTOnePageCookie(cfg.cities[0], cfg.orderBy[0], 1, 1, function(){})
// }())