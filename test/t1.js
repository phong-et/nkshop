let rp = require('request-promise'),
  request = require('request'),
  cfg = require('../nk.cfg.js'),
  log = console.log,
  headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
  }
request = request.defaults({jar: true})
fetchProductsByCity(cfg.productUrl, cfg.cities[0], 1000, 5)
async function fetchProductsByCity(productUrl, cityCode, minPrice, minReviewCount) {
    try {
        var qs = {
            cityCode: cityCode,
            mode: 'directory',
            offset: '0',
            orderBy: 'byPriceDesc'
        }
        var jar = request.jar()
        var arrayCookie = ['__cfduid=d52b81aaa898d3d011f8753cdd3cc68661563605269; cf_clearance=a4907656ed76cea4a850de5893d3095a6f805d17-1563605274-604800-150; 06cb36fc0e9a783099b7974a96a6d0c0=r1c794u6lc5mgapm4est7g1kr0']
        arrayCookie.forEach((cookies) => {
            cookies.split(';').forEach((cookie) => {
                jar.setCookie(request.cookie(cookie.trim()), productUrl)
            })
        })
        var options = {
            url: productUrl,
            headers: headers,
            qs: qs,
            jar: jar
        }
        log(options)
        request(options, (e, r, body) => {
            log(r.headers)
            log(r.statusCode)
            log(body)
        })
    } catch (error) {
        log(error.message)
    }
}