let express = require('express'),
  router = express.Router()
const Review = require('../models/review')

router.get('/products/:productIds', async function (req, res) {
  log(req.params)
  try {
    let productIds = req.params.productIds,
      jsonProduct = await nk.fetchJsonOfProduct(cfg.productUrl, productIds),
      coverUrl = nk.fetchCoverImagesOfProduct(jsonProduct)
    log(coverUrl)
    res.send({
      coverUrl
    })
  } catch (error) {
    res.send({
      error
    })
  }
})

router.get('/last', async function (req, res) {
  let reviews = await Review.fetchReviewsByDate(new Date().toJSON().substr(0,10))
  res.send(reviews)
  //reply.send(`this is latest reviews of ${request.params.day} `)
})

router.get('/:day', async function (req, res) {
  let reviews = await Review.fetchReviewsByDate(req.params.day)
  res.send(reviews)
})

module.exports = router;

