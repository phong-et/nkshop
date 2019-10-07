var nk = require('./nk');
var cfg = require('./nk.cfg')
nk.fetchProducts(cfg.productUrl,
  [
    
  ])
//nk.fetchProductsSGByPriceDescAllPage(1,15);
nk.fetchProductsByIdRange(
  cfg.productUrl, 
  0, 
  //25147,
  //25728, 
  { price: 100, ratingCount: 10 }
);
//nk.fetchJsonOfProduct(cfg.productUrl, id)

/**
 * internal/streams/legacy.js:57
      throw er; // Unhandled stream error in pipe.
      ^
Error: connect ETIMEDOUT ip
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1097:14)
Error: connect ETIMEDOUT ip
    */
