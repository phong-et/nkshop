var express = require('express')
var router = express.Router()
var nk = require('../../nk')
/* GET all products. Default at cities[0]. */

router.get('/', function (req, res, next) {
    res.send('product')
    //res.send(nk.filterProductByPriceAndReport(req.params.price, req.params.ratingCount));
});
router.get('/xyz', function (req, res, next) {
    res.send('xyz')
    //res.send(nk.filterProductByPriceAndReport(req.params.price, req.params.ratingCount));
});
router.get('/:price/:ratingCount', function (req, res, next) {
    //res.send(req.params.price +'||' + req.params.ratingCount)
    console.log(req.params.price +'||' + req.params.ratingCount)
    res.send(nk.filterProductByPriceAndReport(req.params.price, req.params.ratingCount));
});

module.exports = router;
