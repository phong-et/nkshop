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
  ratingCountTotal: Number,
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
const ProductDetail = db.model('ProductDetail', productDetailSchema, COLLECTION_NAME)

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
async function updateByModelId(id, jsonProductDetail, ratingCountTotal) {
  try {
    db.connect(dbURL, { useNewUrlParser: true });
    common.convertStringToNumber(jsonProductDetail)
    jsonProductDetail.ratingCountTotal = ratingCountTotal
    await ProductDetail.findByIdAndUpdate(id, jsonProductDetail)
    await db.connection.close()
    log(id + " Updated to %s collection.", COLLECTION_NAME)
  } catch (error) {
    log(error)
  }
}
async function update(productId, jsonProductDetail, ratingCountTotal) {
  try {
    db.connect(dbURL, { useNewUrlParser: true });
    common.convertStringToNumber(jsonProductDetail)
    jsonProductDetail.ratingCountTotal = ratingCountTotal
    await ProductDetail.findOneAndUpdate({ id: productId }, jsonProductDetail)
    await db.connection.close()
    log(productId + " Updated to %s collection.", COLLECTION_NAME)
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
    'id name price ratingCount lastUpdateStamp status attributes phone districtId')
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
async function getLatestProductId() {
  try {
    db.connect(dbURL, { useNewUrlParser: true });
    let product = await ProductDetail.findOne({}).sort({ id: -1 }).exec()
    await db.connection.close()
    return product.id
  } catch (error) {
    log(error)
  }
}

///////////////////////////////// Export part /////////////////////////////////
module.exports = {
  insert: insert,
  findProductByConditions: findProductByConditions,
  getLatestProductId: getLatestProductId,
  update: update
};

///////////////////////////////// Testing part /////////////////////////////////
//moved t.14