// fetch product include product(save to disk), image product, review(save to disk), image review
let productIdList = [
    // fill ids here
],
nk = require('./nk'),
cfg = require('./nk.cfg')

nk.fetchProductDetailByListId(cfg.productUrl, productIdList)