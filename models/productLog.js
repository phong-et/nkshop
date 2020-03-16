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
async function fetchProductIdInLogs(date) {
  try {
    log('fetchProductIdInLogs:')
    var query = {
      '$where': `new Date(this.date).toJSON().indexOf("${date}") >- 1`
    }
    log(query)
    db.connect()
    let logs = await ProductLog.find(query, 'id productId').exec()
    await db.close()
    log('logs.length = %s', logs.length)
    return logs.map(log => log.productId);
  } catch (error) {
    log(error)
    return []
  }
}
///////////////////////////////// Export part /////////////////////////////////
module.exports = {
  insertMany: insertMany,
  fetchProductIdInLogs: fetchProductIdInLogs
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