'use strict'
let log = console.log,
    ProductDetail = require('../../models/productDetail'),
    Review = require('../../models/review'),
    District = require('../../models/district'),
    cfg = require('../../../nk.cfg'),
    nk = require('../../../nk'),
    rimraf = require('rimraf')

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
                currentReviewIds = await nk.fetchReviewListOfProduct(cfg.reviewUrl, productId, product.ratingCount),
                newReviewIds = currentReviewIds.filter(value => !oldReviewIds.includes(value)),
                totalReviewIds = currentReviewIds.concat(oldReviewIds)

            totalReviewIds = [...new Set(totalReviewIds)]
            ProductDetail.update(productId, product, totalReviewIds.length)
            nk.fetchImagesOfProduct(product)
            log(`oldReviewIds : ${JSON.stringify(oldReviewIds)}`)
            log(`currentReviewIds: ${JSON.stringify(currentReviewIds)}`)
            log(`newReviewIds: ${JSON.stringify(newReviewIds)}`)
            if (newReviewIds.length > 0) {
                // newReviewIds.forEach(async reviewId => {
                //     let reviewJson = await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId, true, true)
                //     Review.insert(reviewJson)
                // });
                log(`Update images & json ${newReviewIds.length} review`)
                let reviews = await Promise.all(newReviewIds.map(async reviewId => {
                    try {
                        let review = await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId, true, true)
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
                currentReviewIds = await nk.fetchReviewListOfProduct(cfg.reviewUrl, productId, product.ratingCount)
            ProductDetail.update(productId, product, currentReviewIds.length)
            nk.fetchImagesOfProduct(product)
            log(`currentReviewIds: ${JSON.stringify(currentReviewIds)}`)
            if (currentReviewIds.length > 0) {
                log(`Fetch all images ${currentReviewIds.length} reviews`)
                await Promise.all(currentReviewIds.map(async reviewId => {
                    try {
                        await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId, true, true)
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

    fastify.get('/products/add', async function (request, reply) {
        try {
            let listId = JSON.parse(request.query['listId'])
            log(listId)

            reply.send({ success: true })
        } catch (error) {
            log(error)
            reply.send({ success: false, msg: error.message })
        }
    })

    fastify.get('/products/new/listid', async function (_, reply) {
        try {

            reply.send({ success: true })
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