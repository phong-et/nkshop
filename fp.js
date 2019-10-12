var nk = require('./nk');
var cfg = require('./nk.cfg')
// nk.fetchProducts(cfg.productUrl,
//   [
//     24855
//   ])

nk.fetchProductDetailByListId(cfg.productUrl, [
  25736,
  // 23229,
  // 25409
])
//nk.fetchProductsSGByPriceDescAllPage(1,15);

// nk.fetchProductsByIdRange(
//   cfg.productUrl, 
//   23000,
//   24000, 
//   //25146,
//   //25728, 
//   { price: 500, ratingCount: 3 }
// )

// nk.fetchProductsByIdRange(
//   cfg.productUrl, 
//   25817,
//   24000,
// )

//nk.fetchJsonOfProduct(cfg.productUrl, id)

/**
 * internal/streams/legacy.js:57
      throw er; // Unhandled stream error in pipe.
      ^
Error: connect ETIMEDOUT ip
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1097:14)
Error: connect ETIMEDOUT ip
    
Error: read ECONNRESET
downloadImage.request.head:Error: connect ETIMEDOUT 104.25.90.6:443
*/
