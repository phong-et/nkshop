'use strict'
let log = console.log,
    productDetail = require('../../models/productDetail'),
    Review = require('../../models/review'),
    cfg = require('../../../nk.cfg'),
    nk = require('../../../nk')
module.exports = async function(fastify, opts, next) {
    fastify.get('/product/findConditions', function(request, reply) {
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
    fastify.get('/product/openFolder/:productId', function(request, reply) {
        log('------ request.params ------------')
        log(request.params)
        require('child_process').exec('start ' + cfg.productFolder + '\\' + request.params.productId)
        reply.send(true)
    })

    fastify.get('/product/updateReview/:productId', async function(request, reply) {
        log('----request.query----')
        log(request.params)
        try {
            let productId = request.params.productId,
                oldReviewIds = await Review.findReviewsOfProduct(productId),
                product = await nk.fetchJsonOfProduct(cfg.productUrl, productId),
                currentReviewIds = await nk.fetchReviewListOfProduct(cfg.reviewUrl, productId, product.ratingCount),
                newReviewIds = currentReviewIds.filter(value => !oldReviewIds.includes(value))
                //newReviewIds2 = oldReviewIds.filter(value => !currentReviewIds.includes(value))
            log(`oldReviewIds : ${JSON.stringify(oldReviewIds)}`)
            log(`currentReviewIds: ${JSON.stringify(currentReviewIds)}`)
            log(`newReviewIds: ${JSON.stringify(newReviewIds)}`)
                //log(newReviewIds2)
            if (newReviewIds.length > 0) {
                // newReviewIds.forEach(async reviewId => {
                //     let reviewJson = await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId, true, true)
                //     Review.insert(reviewJson)
                // });
                let reviews = await Promise.all(newReviewIds.map(async reviewId => {
                        let review = await nk.fetchReviewOfProduct(cfg.reviewUrl, reviewId, productId, true, true)
                        review.data.reivew.productId = productId
                        log(JSON.stringify(review.data))
                        return review
                    }))
                    //log(reviews)
                Review.insertMany(reviews.map(review => review.data.review))
            }
            oldReviewIds.sort((a, b) => a - b)
            currentReviewIds.sort((a, b) => a - b)
            newReviewIds.sort((a, b) => a - b)
            reply.send({ oldReviewIds: oldReviewIds, currentReviewIds: currentReviewIds, newReviewIds: newReviewIds })
        } catch (error) {
            reply.send({ error })
        }
    })

    next()
}