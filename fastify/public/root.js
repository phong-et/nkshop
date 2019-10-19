

'use strict'

module.exports = function (fastify, opts, next) {
    fastify.get('/', function (req, reply) {
        reply.sendFile('index.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
    })
    next()
}