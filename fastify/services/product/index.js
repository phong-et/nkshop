'use strict'

// module.exports = function (fastify, opts, next) {
//   fastify.get('/example', function (request, reply) {
//     reply.send('this is an example')
//   })

//   next()
// }

// If you prefer async/await, use the following
//
var log = console.log
module.exports = async function (fastify, opts) {
  fastify.get('/product/', async function (request, reply) {
    log(request.query)
    reply.send(request.query)
  })
}
