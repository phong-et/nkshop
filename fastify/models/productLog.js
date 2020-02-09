const db = require('../db')
const mongoose = db.mongoose
const Schema = mongoose.Schema
const log = console.log
const common = require('./common')
const COLLECTION_NAME = 'product_logs'
const _ = require('lodash')
const productLogSchema = new Schema({
  id: Number,
  name: String,
  price: Number,
  status: Number,
  lastUpdateStamp: Number,
  districtId: Number,
  cityId: Number,
  ratingCount: Number,
  ratingCountTotal: Number,
  date: Number
})
const ProductLog = mongoose.model('ProductLog', productLogSchema, COLLECTION_NAME)
async function insert(json) {
  try {
    db.connect()
    common.convertStringToNumber(json)
    let productLog = new ProductLog(json)
    productLog = await productLog.save()
    db.close()
    log(productLog.id + " saved to %s collection.", COLLECTION_NAME)
  } catch (error) {
    log(error)
  }
}
///////////////////////////////// Export part /////////////////////////////////
module.exports = {
  insert: insert,
};

///////////////////////////////// Testing part /////////////////////////////////
// (async function () {
//   log(await insert({
//     id: 1234,
//     name: 'String',
//     price: 1234,
//     status: 1,
//     lastUpdateStamp: 12345,
//     districtId: 30,
//     cityId: 1,
//     ratingCount: 1,
//     ratingCountTotal: 1,
//   }))
// }())