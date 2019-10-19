const db = require('../db')
const dbURL = require('../../nk.cfg').dbUrl
const Schema = db.Schema
const log = console.log
const autoIncrement = require('mongoose-sequence')(db);
const common = require('./common')
const COLLECTION_NAME = 'product_details'
const productDetailSchema = new Schema({
  _id: Number,
  id: Number,
  name: String,
  price: Number,
  phone: String,
  locationId: String,
  status: Number,
  expirationDate: String,
  lastUpdateStamp: Number,
  meta: {
    locId: Number,
    address: String
  },
  lat: String,
  lng: String,
  districtId: Number,
  cityId: Number,
  cover: {
    baseName: String,
    dimensions: {
      small: {
        file: String,
        width: Number,
        height: Number
      },
      original: {
        file: String,
        width: Number,
        height: Number
      },
      thumbnail: {
        file: String,
        width: Number,
        height: Number
      }
    }
  },
  ratingScore: Number,
  ratingCount: Number,
  ratingAvg: Number,
  photoCount: Number,
  timestamp: Number,
  viewCount: Number,
  photos: [],
  author: {
    userId: Number,
    username: String,
    url: String,
    displayName: String,
    online: Boolean
  },
  bookmarked: Boolean,
  attributes: {
    70: String,
    42: Number,
    46: Number,
    48: Number,
    49: Number,
    50: Number,
    51: Number,
    68: Number,
    69: Number,
    67: Number,
    64: Number,
    47: String,
    56: String,
    57: String,
    58: String
  },
  slug: String
})
productDetailSchema.plugin(autoIncrement, { inc_field: '_id' })
const ProductDetail = db.model('ProductDetail', productDetailSchema, COLLECTION_NAME);
async function insert(jsonProductDetail) {
  try {
    db.connect(dbURL, { useNewUrlParser: true });
    common.convertStringToNumber(jsonProductDetail)
    productDetail = new ProductDetail(jsonProductDetail)
    productDetail = await productDetail.save()
    await db.connection.close()
    log(productDetail.id + " saved to %s collection.", COLLECTION_NAME)
  } catch (error) {
    log(error)
  }
}
function findProductByConditions(conditions, callback) {
  var query = {
    '$where': conditions.map(condition => {
      if (condition.indexOf('new') > -1)
        return condition
      return 'this.' + condition
    }).join(' && ')
  }
  log(query)
  db.connect(dbURL, { useNewUrlParser: true });
  return ProductDetail.find(
    query,
    'id name price ratingCount lastUpdateStamp status attributes')
    //.sort({ lastUpdateStamp: -1 })
    .exec((err, data) => {
      if (err) log(err)
      log('data.length=%s', data.length)
      data.forEach(e => {
        e.lastUpdateStamp = new Date(e.lastUpdateStamp * 1000).toLocaleDateString()
      })
      db.connection.close()
      callback(data)
    })
}
var rimraf = require('rimraf');
function deleteFolderImages(index, productIds) {
  if (index < productIds.length) {
     //var pathFolder = './products/' + productIds[index];
     var pathFolder = 'D:\\VSCode\\nk\\products\\' + productIds[index];
    rimraf(pathFolder, function () {
      log(`[${index}] deleted ' + ${pathFolder}`)
      index++
      deleteFolderImages(index, productIds)
    })
  }
  else {
    log('Done all')
  }
}
///////////////////////////////// Export part /////////////////////////////////
module.exports = {
  insert: insert,
  findProductByConditions: findProductByConditions
}

///////////////////////////////// Testing part /////////////////////////////////
findProductByConditions([
  "price >= ",
  //"ratingCount === 0",
  "status === 2",
  //"meta !== undefined",
  //"meta.onLeave === true",
  //"photos.length <= 0",
  //"parseInt(new Date(this.lastUpdateStamp * 1000).toJSON().slice(0,4)) <= ",
  //"attributes !== undefined",
  // "attributes['51'] >= ",
  // "attributes['49'] >= ",
  "new Date(this.attributes['42']*1000).getFullYear() >= "
], products => {
  try {
    log(products.length)
  } catch (error) {
    log(error)
  }
  //var productIds = products.map(product => product.id)
  //log('productIds.length = ' + productIds.length )
  //deleteFolderImages(0,productIds)
})

// deleteFolderImages(0, [18030,
//   18290,
//   17723])

