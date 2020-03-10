let express = require('express'),
  router = express.Router()
const Review = require('../models/review')
const ProductDetail = require('../models/productDetail')

async function fetchReviews(date){
  let reviews = await Review.fetchReviewsByDate(date),
  productIds = reviews.map(review => review.productId),
  products = await ProductDetail.fetchProductsByIds(productIds)
  return {reviews, products}
}
router.get('/last', async function (_, res) {
  let reviews =  await fetchReviews(new Date().toJSON().substr(0,10))
  res.send(reviews)
})

router.get('/:date', async function (req, res) {
  let reviews =  await fetchReviews(req.params.date)
  res.send(reviews)
})

module.exports = router;

