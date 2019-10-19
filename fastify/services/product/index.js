'use strict'
let log = console.log,
    productDetail = require('../../models/productDetail')
module.exports = async function (fastify, opts) {
    fastify.get('/product/', async function (request, reply) {
        //log('----request.query----')
        //log(request.query['query'])
        productDetail.findProductByConditions(request.query['query'].split(','), products => {
            log(products.length)
            reply.send(products)
        })
    })
}
