
let log = console.log, fs = require('fs')
function filterProductByPriceAndRatingCount(price, ratingCount, sourceJSONFileName) {
  filteredProducts = []
  try {
    log('filterProductByPriceAndRatingCount')
    let products = JSON.parse(fs.readFileSync(__dirname + sourceJSONFileName, 'utf-8'))
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
async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
function exportProductToRobo3TFormat(destinationJSONFileName, product, productIndex, callback) {
  //log(productIndex)
  fs.appendFile(__dirname + destinationJSONFileName, JSON.stringify(product), function (err) {
    if (err) throw err;
    log(`[${productIndex}] ${product.id} saved`);
    callback()
  });
}
function exportProductsToRobo3TFormat(destinationJSONFileName, products, currentIndexProduct, limitedIndexProduct) {
  try {
    var product = products[currentIndexProduct]
    // convert string to number some fields
    product.id = parseInt(product.id)
    product.price = parseInt(product.price)
    product.viewCount = parseInt(product.viewCount)
    product.timestamp = parseInt(product.timestamp)
    product.lastUpdateStamp = parseInt(product.lastUpdateStamp)
    product.userId = parseInt(product.userId)
    product.districtId = parseInt(product.districtId)
    product.cityId = parseInt(product.cityId)
    product.status = parseInt(product.status)
    product.ratingCount = parseInt(product.ratingCount)
    product.ratingScore = parseFloat(product.ratingScore)
    product.ratingAvg = parseFloat(product.ratingAvg)
    exportProductToRobo3TFormat(destinationJSONFileName, product, currentIndexProduct, () => {
      currentIndexProduct = currentIndexProduct + 1
      var limitNumber = limitedIndexProduct || products.length
      if (currentIndexProduct < limitNumber) {
        exportProductsToRobo3TFormat(destinationJSONFileName, products, currentIndexProduct, limitNumber)
      }
      else {
        log('======> Done ALL %s products', currentIndexProduct)
      }
    })
  } catch (error) {
    log(error)
  }
}
function exportToRobo3TFormat(sourceJSONFileName, destinationJSONFileName) {
  let products = JSON.parse(fs.readFileSync(__dirname + sourceJSONFileName, 'utf-8'))
  log(`products.length = ${products.length}`)
  //log(products[0])
  exportProductsToRobo3TFormat(destinationJSONFileName, products, 0)
}


function checkDuplicateData(sourceJSONFileName) {
  try {
    let products = JSON.parse(fs.readFileSync(__dirname + sourceJSONFileName, 'utf-8'))
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


var sourceJSONFileName = '/products/SGBPD/P_ALL_1_500.json',
  destinationJSONFileName = '/products/SGBPD/_Robo3T.json'
//filterProductByPriceAndRatingCount(1000, 5, sourceJSONFileName)
exportToRobo3TFormat(sourceJSONFileName, destinationJSONFileName)
//checkDuplicateData(sourceJSONFileName)
