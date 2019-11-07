'use strict'
let log = console.log,
    ProductDetail = require('../../models/productDetail'),
    Review = require('../../models/review'),
    District = require('../../models/district'),
    cfg = require('../../../nk.cfg'),
    nk = require('../../../nk'),
    rimraf = require('rimraf'),
    newProductIds = []
function fetchProductsByCTByPageRange(cityId, orderBy, fromPage, toPage, productIds, callback) {
    try {
        return nk.fetchProductByCTOnePage(cityId, orderBy, fromPage, products => {
            productIds = productIds.concat(products.map(product => parseInt(product.id)))
            log('products:%s', products.length)
            //log(products.map(product => product.id))
            fromPage++
            if (fromPage <= toPage) {
                log('====> Current page = ', fromPage)
                return fetchProductsByCTByPageRange(cityId, orderBy, fromPage, toPage, productIds, callback)
            }
            else {
                log('Done fetching product all %s page', toPage)
                log(`Products :${productIds.length}`)
                //log(JSON.stringify(productIds))
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
            await nk.delay(nk.wait('product', i, productIdList[i]))
            var jsonProduct = await nk.fetchJsonOfProduct(url, productIdList[i])
            if (jsonProduct && jsonProduct.price >= acceptedMinPrice) {
                log(`price:${jsonProduct.price} || ratingCount:${jsonProduct.ratingCount}`)
                await ProductDetail.insert(jsonProduct)
                await nk.fetchProduct(url, productIdList[i], jsonProduct)
                await Review.insertMany(await nk.fetchReviewsOfProduct(cfg.reviewUrl, jsonProduct.id, jsonProduct.ratingCount))
            }
            else
                log(`Rejected Product Price: ${jsonProduct.price || 'NULL'}`)
        }
    } catch (error) {
        log(error.message)
    }
}
module.exports = async function (fastify, opts, next) {
    fastify.get('/products/districts/:cityId', async function (request, reply) {
        log('----request.query----')
        let cityId = request.params.cityId
        log(cityId)
        try {
            reply.send(await District.fetchDistricts(cityId))
        } catch (error) {
            reply.send(error)
        }
    })

    fastify.get('/products/findConditions', function (request, reply) {
        log('----request.query----')
        log(request.query['query'])
        try {
            ProductDetail.findProductByConditions(JSON.parse(request.query['query']), products => {
                log(products.length)
                reply.send(products)
            })
        } catch (error) {
            reply.send(error)
        }
    })

    fastify.get('/products/openFolder/:productId', function (request, reply) {
        log('------ request.params ------------')
        log(request.params)
        require('child_process').exec('start ' + cfg.productFolder + '\\' + request.params.productId)
        reply.send(true)
    })

    fastify.get('/products/configurations/', function (_, reply) {
        log('/products/configurations/')
        reply.send({ productDetailUrl: cfg.productDetailUrl, authorUrl: cfg.authorUrl })
    })

    fastify.get('/products/updateReview/:productId', async function (request, reply) {
        log('----request.query----')
        log(request.params)
        try {
            let productId = request.params.productId,
                oldReviewIds = await Review.findReviewsOfProduct(productId),
                product = await nk.fetchJsonOfProduct(cfg.productUrl, productId),
                currentReviewIds = await nk.fetchReviewIdsOfProduct(cfg.reviewUrl, productId, product.ratingCount),
                newReviewIds = currentReviewIds.filter(value => !oldReviewIds.includes(value)),
                totalReviewIds = currentReviewIds.concat(oldReviewIds)

            totalReviewIds = [...new Set(totalReviewIds)]
            ProductDetail.update(productId, product, totalReviewIds.length)
            nk.fetchImagesOfProduct(product)
            log(`oldReviewIds : ${JSON.stringify(oldReviewIds)}`)
            log(`currentReviewIds: ${JSON.stringify(currentReviewIds)}`)
            log(`newReviewIds: ${JSON.stringify(newReviewIds)}`)
            if (newReviewIds.length > 0) {
                log(`Update images & json ${newReviewIds.length} review`)
                let reviews = await Promise.all(newReviewIds.map(async reviewId => {
                    try {
                        let review = await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId)
                        review.data.review["productId"] = productId
                        return review.data.review
                    } catch (error) {
                        log(error)
                    }
                }))
                Review.insertMany(reviews)
            }
            oldReviewIds.sort((a, b) => a - b)
            currentReviewIds.sort((a, b) => a - b)
            newReviewIds.sort((a, b) => a - b)
            reply.send({
                oldReviewIds: oldReviewIds,
                currentReviewIds: currentReviewIds,
                newReviewIds: newReviewIds
            })
        } catch (error) {
            reply.send({
                error
            })
        }
    })

    fastify.get('/products/currentreviews/:productId', async function (request, reply) {
        log('----request.query----')
        log(request.params)
        try {
            let productId = request.params.productId,
                product = await nk.fetchJsonOfProduct(cfg.productUrl, productId),
                currentReviewIds = await nk.fetchReviewIdsOfProduct(cfg.reviewUrl, productId, product.ratingCount)
            ProductDetail.update(productId, product, currentReviewIds.length)
            nk.fetchImagesOfProduct(product)
            log(`currentReviewIds: ${JSON.stringify(currentReviewIds)}`)
            if (currentReviewIds.length > 0) {
                log(`Fetch all images ${currentReviewIds.length} reviews`)
                await Promise.all(currentReviewIds.map(async reviewId => {
                    try {
                        await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId)
                    } catch (error) {
                        log(error)
                    }
                }))
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

    fastify.get('/products/latest/', function (_, reply) {
        log('fetch latest product')
        let product = ProductDetail.fetchLatestProduct()
        reply.send({ product: product })
    })

    fastify.get('/products/add/:id', async function (request, reply) {
        try {
            let id = request.params.id
            log(id)
            nk.fetchProduct()
            fetchProductsDetailByListId(cfg.productUrl, listId, parseInt(acceptedMinPrice))
            reply.send({ success: true })
        } catch (error) {
            log(error)
            reply.send({ success: false, msg: error.message })
        }
    })
    fastify.get('/products/adds/', async function (request, reply) {
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
                let newIds = []
                ids.forEach(id => {
                    if (id > latestId)
                        newIds.push(id)
                })
                reply.send(newIds.sort((a, b) => a - b))
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
            var pathFolder = cfg.productFolder + productId
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

    next()
}