
// fetch all reviews of each product without images (save to db)
let nk = require('./nk'),
cfg = require('./nk.cfg'),
Review = require('./api/model/review');,
products = [
    // fill product here 
    // {id, ratingCount}
];
async function insertReviewListOfAllProduct(currentProductIndex, products){
    if(currentProductIndex < products.length){
       let product = products[currentProductIndex]
       console.log('product[%s].id = %s', currentProductIndex, product.id)
       await Review.insertMany(await nk.fetchReviewListOfProductSaveDb(cfg.reviewUrl, product.id, product.ratingCount))
       currentProductIndex++
       await insertReviewListOfAllProduct(currentProductIndex, products)
    }
    else
       console.log('Done insert all review of products')
 }
 (async function () {
    insertReviewListOfAllProduct(0, products)
 })()