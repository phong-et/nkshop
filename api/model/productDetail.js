const db = require('../db')
const Schema = db.Schema
const log = console.log
const autoIncrement = require('mongoose-sequence')(db);
const common = require('./common')
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
      original:{
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
productDetailSchema.plugin(autoIncrement, {inc_field:'_id'})
const ProductDetail = db.model('ProductDetail', productDetailSchema, 'product_details');
function insert(jsonProductDetail) {
  common.convertStringToNumber(jsonProductDetail)
  productDetail = new ProductDetail(jsonProductDetail)
  productDetail.save(function (err, productDetail) {
    if (err) return console.error(err);
    log(productDetail.name + " saved to product_details collection.");
    db.connection.close()
  });
}

module.exports = {
  insert:insert
}
