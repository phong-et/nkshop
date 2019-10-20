'use strict'
let log = console.log,
    productDetail = require('../../models/productDetail')
module.exports = function (fastify, opts, next) {
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
    })


    next()
}

