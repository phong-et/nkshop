

'use strict'

module.exports = function (fastify, opts, next) {
    fastify.get('/', function (req, reply) {
        log(req.params)
        reply.sendFile('index.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
    })

    fastify.get('/products/:productId/:fileName', function (req, reply) {
        log(req.params.productId)
        log(req.params.fileName)
        reply.sendFile(`../products/${req.params.productId}/${req.params.fileName}`) // serving path.join(__dirname, 'public', 'myHtml.html') directly
    })
    next()
}