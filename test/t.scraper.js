var cloudscraper = require('cloudscraper')
var cfg = require('./nk.cfg');
(async function () {
    var a = await cloudscraper.get(cfg.cloudScraperTestUrl)
    // .then(function (htmlString) {
    //     console.log(htmlString)
    // })
    // .catch(function (err) {
    // });
    console.log(a)
})()
