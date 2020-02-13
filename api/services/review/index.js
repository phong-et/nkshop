'use strict'
let Review = require('../../models/review')
module.exports = function (fastify, opts, next) {
  fastify.get('/review', function (request, reply) {
    reply.send('this is review home page')
  })
  fastify.get('/review/last', function (request, reply) {
    reply.send('this is latest reviews')
  })
  fastify.get('/review/last/:day', async function (request, reply) {
    let reviews = await Review.fetchReviewsByDate(request.params.day)
    reply.send(reviews)
    //reply.send(`this is latest reviews of ${request.params.day} `)
  })


  next()
}

// If you prefer async/await, use the following
//
// module.exports = async function (fastify, opts) {
//   fastify.get('/example', async function (request, reply) {
//     return 'this is an example'
//   })
// }
