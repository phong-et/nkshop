const db = require('../db')
const dbURL = require('../../nk.cfg').dbUrl
const Schema = db.Schema
const log = console.log
const autoIncrement = require('mongoose-sequence')(db)
const common = require('./common')
const COLLECTION_NAME = 'product_details'
const _ = require('lodash')
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
    address: String,
    badgeLabel: String,
    badgeStyle: String,
    leaveNotice: String,
    notificationTime: String,
    onLeave: Boolean,
    registered: Boolean
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
    //delete jsonProductDetail.phone
    await ProductDetail.findOneAndUpdate({ id: productId }, jsonProductDetail)
    await db.connection.close()
    log(productId + " Updated to %s collection.", COLLECTION_NAME)
  } catch (error) {
    log(error)
  }
}
async function deleteProduct(productId) {
  try {
    db.connect(dbURL, { useNewUrlParser: true });
    await ProductDetail.findOneAndDelete({ id: productId })
    await db.connection.close()
    log(productId + " Delete to %s collection.", COLLECTION_NAME)
  } catch (error) {
    log(error)
  }
}
async function fetchProductByIds(ids) {
  try {
    log(ids)
    var query = {
      id: { $in: ids }
    }
    log(query)
    db.connect(dbURL, { useNewUrlParser: true });
    let products = await ProductDetail.find(query, 'id name price ratingCount ratingScore lastUpdateStamp status attributes phone districtId cover ratingCountTotal author').exec()
    await db.connection.close()
    log(products.length)
    return products
  } catch (error) {
    log(error)
    return []
  }
}
async function findProductByConditions(conditions, productIds) {
  try {
    //productIds = [26871, 26470]
    var query = {
      '$where': conditions.map(condition => {
        if (condition.indexOf('new') > -1)
          return condition
        return 'this.' + condition
      }).join(' && ')
      //, $and: [{ id: { $in: productIds } }]
    }
    if (productIds) {
      if (productIds.length === 0)
        return []

      if (conditions.length > 0)
        query['$and'] = [{ id: { $in: productIds } }]
      else
        query = { id: { $in: productIds } }
    }
    log(JSON.stringify(query))
    await db.connect(dbURL, { useNewUrlParser: true });
    let products = await ProductDetail.find(
      query,
      'id name price ratingCount ratingScore lastUpdateStamp status attributes phone districtId cover ratingCountTotal author'
    ).exec()
    await db.connection.close()
    return products
  } catch (error) {
    log(error)
    return []
  }
}
async function fetchLatestProductId() {
  try {
    db.connect(dbURL, { useNewUrlParser: true });
    let products = await ProductDetail.find({}, 'id').exec()
    await db.connection.close()
    return _.maxBy(products, 'id').id
  } catch (error) {
    log(error)
  }
}

///////////////////////////////// Export part /////////////////////////////////
module.exports = {
  insert: insert,
  findProductByConditions: findProductByConditions,
  fetchLatestProductId: fetchLatestProductId,
  update: update,
  deleteProduct: deleteProduct,
  fetchProductByIds: fetchProductByIds
};

///////////////////////////////// Testing part /////////////////////////////////
//moved t.14
// (async function () {
//   log(await fetchProductByIds([8181, 25869]))
// }())