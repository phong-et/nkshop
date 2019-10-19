
let log = console.log, fs = require('fs')
function filterProductByPriceAndReport(price, ratingCount) {
    filteredProducts = []
    try {
      log('filterProductByPriceAndReport')
      let products = JSON.parse(fs.readFileSync(__dirname + '/products/SGBPD/20190720/P_ALL_0_400.json', 'utf-8'))
      log(`products.length = ${products.length}`)
      products.map(product => {
        let productPrice = parseInt(product.price),
          productRatingCount = parseInt(product.ratingCount)
        if (productPrice >= price && productRatingCount >= ratingCount) {
          log(`price = ${productPrice} || ratingCount = ${productRatingCount}`)
          filteredProducts.push(product.id)
        }
      });
      log(`filteredProducts.length = ${filteredProducts.length}`)
      log(filteredProducts)
    } catch (error) {
      log(error)
    }
    return filteredProducts;
  }
  //filterProductByPriceAndReport(1000, 5)
  
  
  function importTORobo3T() {  
    try {
      let products = JSON.parse(fs.readFileSync(__dirname + '/products/SGBPD/20190720/P_ALL_0_400.json', 'utf-8'))
      log(`products,.length = ${products.length}`)
      products.forEach((product, index) => {
          fs.appendFile(__dirname + '/products/SGBPD/20190720/Robo3T.json', JSON.stringify(product), function (err) {
            if (err) throw err;
            log(product.id + ' saved');
          });
      })
    } catch (error) {
      log(error)
    }
  }
  importTORobo3T()
  
  
  function checkDuplicateData() {  
    try {
      let products = JSON.parse(fs.readFileSync(__dirname + '/products/SGBPD/20190720/P_ALL_0_400.json', 'utf-8'))
      log(`products.length = ${products.length}`)
      var productIds = []
      products.forEach((product, index) => {
         productIds.push(product.id)
      })
      log(`productIds.length = ${productIds.length}`)
      var newProductIds = [...new Set(productIds)];
      log(`newProductIds.length = ${newProductIds.length}`)
    } catch (error) {
      log(error)
    }
  }
  checkDuplicateData()