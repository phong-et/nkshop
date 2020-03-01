'use strict'
let log = console.log,
    ProductDetail = require('../../models/productDetail'),
    //ProductLog = require('../../models/productLog'),
    Review = require('../../models/review'),
    District = require('../../models/district'),
    City = require('../../models/city'),
    cfg = require('../../nk.cfg'),
    nk = require('../../nk'),
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
module.exports = async function (fastify, opts, next) {
    fastify.get('/products/cities/:countryId', async function (request, reply) {
        //log('----request.query----')
        let countryId = request.params.countryId
        log(`countryId: ${countryId}`)
        try {
            reply.send(await City.fetchCities(countryId))
        } catch (error) {
            reply.send(error)
        }
    })
    fastify.get('/products/districts/:cityId', async function (request, reply) {
        //log('----request.query----')
        let cityId = request.params.cityId
        log(`cityId: ${cityId}`)
        try {
            reply.send(await District.fetchDistricts(cityId))
        } catch (error) {
            reply.send(error)
        }
    })

    fastify.get('/products/findConditions', async function (request, reply) {
        //log('----request.query----')
        try {
            let query = JSON.parse(request.query['query']),
                reviewDay = request.query['reviewDay'],
                productIdsOfReview
            if (reviewDay)
                productIdsOfReview = await Review.fetchProductIdByReviewDay(reviewDay)
            let products = await ProductDetail.findProductByConditions(query, productIdsOfReview)
            log(products.length)
            reply.send(products)
        } catch (error) {
            reply.send(error)
        }
    })

    fastify.get('/products/openFolder/:productId', function (request, reply) {
        //log('------ request.params --------')
        log(request.params)
        let path = require('path');
        let pathFolder = path.dirname(require.main.filename).split(path.sep)
        pathFolder.pop()
        pathFolder.pop()
        require('child_process').exec('start ' + pathFolder.join('/') +  cfg.productFolder + '/' + request.params.productId)
        reply.send(true)
    })

    fastify.get('/products/configurations/', function (_, reply) {
        log('/products/configurations/')
        reply.send({
            statuses: cfg.statuses,
            productDetailUrl: cfg.productDetailUrl,
            authorUrl: cfg.authorUrl,
            chart: cfg.chart,
            errors: cfg.errors,
            coverUrl: cfg.coverUrl,
            regions: cfg.attributes["68"],
            minPriceFetchImage:cfg.minPriceFetchImage
        })
    })

    fastify.get('/products/review/update/:productId', async function (request, reply) {
        log(`==> /products/review/update/${request.params.productId}`)
        //log(request.params)
        let isFetchImageProduct = JSON.parse(request.query.isFetchImageProduct.toLowerCase())
        //,
        //     isFetchImageReview = JSON.parse(request.query.isFetchImageReview.toLowerCase())
        //log(`isFetchImageProduct = ${isFetchImageProduct}`)
        try {
            let productId = request.params.productId,
                oldReviewIds = await Review.fetchReviewIdsOfProduct(productId),
                product = await nk.fetchJsonOfProduct(cfg.productUrl, productId),
                currentReviewIds = await nk.fetchReviewIdsOfProduct(cfg.reviewUrl, productId, product.ratingCount),
                //newReviewIds = oldReviewIds.length > 0 ? currentReviewIds.filter(value => !oldReviewIds.includes(value)) : [],
                newReviewIds = currentReviewIds.filter(value => !oldReviewIds.includes(value)), 
                totalReviewIds = currentReviewIds.concat(oldReviewIds)

            totalReviewIds = [...new Set(totalReviewIds)]
            await ProductDetail.update(productId, product, totalReviewIds.length)
            //if (isFetchImageProduct) nk.fetchImagesOfProduct(product)
            if (product.price >= cfg.minPriceFetchImage && isFetchImageProduct) await nk.fetchImagesOfProduct(product)
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
                        if (product.price >= cfg.minPriceFetchImage)
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
            // write log onleave and off 
            // if ((product.meta && product.onLeave) || product.status !== 1)
            //     await ProductLog.insert({ id: product.id, date: new Date().getTime() })
            reply.send({
                //oldReviewIds: oldReviewIds,
                //currentReviewIds: currentReviewIds,
                newReviewIds: newReviewIds,
                status: (product.meta && product.meta.onLeave) ? 3 : product.status
            })
        } catch (error) {
            reply.send(error)
        }
    })

    /**
     * Only fetch images without json 
     */
    fastify.get('/products/currentreviews/:productId', async function (request, reply) {
        log('----request.query----')
        log(request.params)
        try {
            let productId = request.params.productId,
                product = await nk.fetchJsonOfProduct(cfg.productUrl, productId),
                currentReviewIds = await nk.fetchReviewIdsOfProduct(cfg.reviewUrl, productId, product.ratingCount)
            await ProductDetail.update(productId, product, currentReviewIds.length)
            //nk.fetchImagesOfProduct(product)
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
            reply.send({
                currentReviewIds: currentReviewIds,
            })
        } catch (error) {
            reply.send({
                error
            })
        }
    })

    fastify.get('/products/latest/', async function (_, reply) {
        log('fetch latest product')
        let productId = await ProductDetail.fetchLatestProductId()
        reply.send(productId)
    })

    // fastify.get('/products/add/:id', async function (request, reply) {
    //     try {
    //         let id = request.params.id
    //         log(id)
    //         nk.fetchProduct()
    //         fetchProductsDetailByListId(cfg.productUrl, listId, parseInt(acceptedMinPrice))
    //         reply.send({ success: true })
    //     } catch (error) {
    //         log(error)
    //         reply.send({ success: false, msg: error.message })
    //     }
    // })
    fastify.get('/products/add/', async function (request, reply) {
        try {
            let listId = JSON.parse(request.query['listId']).map(id => parseInt(id)),
                acceptedMinPrice = request.query['acceptedMinPrice']
            log(listId)
            fetchProductsDetailByListId(cfg.productUrl, listId, parseInt(acceptedMinPrice))
            reply.send({ success: true })
        } catch (error) {
            log(error)
            reply.send({ success: false, msg: error.message })
        }
    })

    fastify.get('/products/new/listid/:pageRange', async function (request, reply) {
        try {
            let latestId = await ProductDetail.fetchLatestProductId(),
                pageRange = request.params.pageRange.split(','),
                fromPage = pageRange[0], toPage = pageRange[1]
            fetchProductsByCTByPageRange(cfg.cities[0], cfg.orderBy[0], fromPage, toPage, [], ids => {
                if (ids === 503)
                    reply.send(503)
                else {
                    let newIds = []
                    ids.forEach(id => {
                        if (id > latestId)
                            newIds.push(id)
                    })
                    reply.send(newIds.sort((a, b) => a - b))
                }
            })
        } catch (error) {
            log(error)
            reply.send({ success: false, msg: error.message })
        }
    })

    fastify.get('/products/delete/:productId', async function (request, reply) {
        try {
            let productId = request.params.productId
            log('delete productId = ' + productId)
            let path = require('path');
            let pathFolder = path.dirname(require.main.filename).split(path.sep)
            pathFolder.pop()
            pathFolder.pop()
            pathFolder = pathFolder.join('/') + cfg.productFolder + productId
            log('pathFolder', pathFolder)
            rimraf(pathFolder, function (e) {
                log(e)
            })
            log(request.query.isDeleteAtDatabase)
            if (request.query.isDeleteAtDatabase) {
                await ProductDetail.deleteProduct(productId)
            }
            reply.send({ success: true })
        } catch (error) {
            log(error)
            reply.send({ success: false, msg: error.message })
        }
    })

    fastify.get('/products/review/:productId', async function (request, reply) {
        log('----request.query----')
        log(request.params)
        try {
            let productId = request.params.productId,
                reviews = await Review.fetchReviewsOfProduct(productId)
            reply.send({
                reviews: reviews,
            })
        } catch (error) {
            reply.send({
                error
            })
        }
    })

    next()
}