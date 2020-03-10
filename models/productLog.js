const db = require('../db')
const mongoose = db.mongoose
const Schema = mongoose.Schema
const log = console.log
const COLLECTION_NAME = 'product_logs'
const productLogSchema = new Schema({
  productId: Number,
  status: Number,
  date: String
})
const ProductLog = mongoose.model('ProductLog', productLogSchema, COLLECTION_NAME)
async function insertMany(jsonProductLogs) {
  try {
    db.connect()
    await ProductLog.insertMany(jsonProductLogs)
    await db.close()
    log('saved to %s collection.', COLLECTION_NAME)
  } catch (error) {
    log(error)
  }
}
///////////////////////////////// Export part /////////////////////////////////
module.exports = {
  insertMany: insertMany,
};

///////////////////////////////// Testing part /////////////////////////////////
// (async function () {
//   await insertMany([{
//     productId:1234,
//     status:2,
//     date: new Date().toJSON()
//   },{
//     productId:1234,
//     status:2,
//     date: new Date().toJSON()
//   },{
//     productId:1234,
//     status:2,
//     date: new Date().toJSON()
//   }])
// }())