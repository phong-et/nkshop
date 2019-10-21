'use strict'
let log = console.log,
    productDetail = require('../../models/productDetail'),
    Review = require('../../models/review'),
    cfg = require('../../../nk.cfg'),
    nk = require('../../../nk')
module.exports = async function (fastify, opts, next) {
    fastify.get('/product/findConditions', function (request, reply) {
        log('----request.query----')
        log(request.query['query'])
        try {
            productDetail.findProductByConditions(JSON.parse(request.query['query']), products => {
                log(products.length)
                reply.send(products)
            })
        } catch (error) {
            reply.send(error)
        }
    })
    fastify.get('/product/openFolder/:productId', function (request, reply) {
        log('------ request.params ------------')
        log(request.params)
        require('child_process').exec('start ' + cfg.productFolder + '\\' + request.params.productId)
        reply.send(true)
    })

    fastify.get('/product/updateReviews/:productId', async function (request, reply) {
        log('----request.query----')
        log(request.params)
        try {
            let productId = request.params.productId,
                oldReviewIds = await Review.findReviewsOfProduct(productId),
                product = await nk.fetchJsonOfProduct(cfg.productUrl, productId),
                currentReviewIds = await nk.fetchReviewListOfProduct(cfg.reviewUrl, productId, product.ratingCount),
                newReviewIds = currentReviewIds.filter(value => !oldReviewIds.includes(value))
            //newReviewIds2 = oldReviewIds.filter(value => !currentReviewIds.includes(value))
            log(oldReviewIds)
            log(currentReviewIds)
            log(newReviewIds)
            //log(newReviewIds2)
            if (newReviewIds.length > 0) {
                newReviewIds.forEach(async reviewId => {
                    await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId, true, true)
                });
            }
            oldReviewIds.sort((a, b) => a - b)
            currentReviewIds.sort((a, b) => a - b)
            newReviewIds.sort((a, b) => a - b)
            reply.send({ oldReviewIds: oldReviewIds, currentReviewIds: currentReviewIds, newReviewIds: newReviewIds })
        } catch (error) {
            reply.send({error})
        }
    })



    next()
}

