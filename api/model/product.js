const db = require('../db')
const dbURL = require('../../nk.cfg').dbUrl
const Schema = db.Schema
const log = console.log
const autoIncrement = require('mongoose-sequence')(db);
const common = require('./common')
const productSchema = new Schema({
    _id: Number,
    id: Number,
    name: String,
    price: Number,
    locationId: String,
    status: Number,
    expirationDate: Date,
    userId: Number,
    lastUpdateStamp: String,
    meta: {
        locId: Number,
        address: String,
        onLeave: Boolean,
        leaveNotice: String,
        notificationTime: Number
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
                height: Number,
                url: String
            },
            original: {
                file: String,
                width: Number,
                height: Number,
                url: String
            },
            thumbnail: {
                file: String,
                width: Number,
                height: Number,
                url: String
            }
        }
    },
    ratingScore: Number,
    ratingCount: Number,
    ratingAvg: Number,
    photoCount: Number,
    timestamp: Number,
    viewCount: Number,
    address: String,
    slug: String
});
productSchema.plugin(autoIncrement, { inc_field: '_id' })
const Product = db.model('product', productSchema, 'product_new');
function findProductByPRC(price, ratingCount) {
    var query = {
        '$where': 'this.price >= ' + price + ' && this.ratingCount >= ' + ratingCount
    }
    return productModel.find(
        query,
        'id name price ratingCount lastUpdateStamp')
        .sort({ lastUpdateStamp: -1 })
        .exec((err, data) => {
            console.log('data.length=%s', data.length)
            data.forEach(e => {
                e.lastUpdateStamp = new Date(e.lastUpdateStamp * 1000).toLocaleDateString()
            })
            console.log(data)
            db.connection.close()
        })
}
async function insert(jsonProduct) {
    try {
        db.connect(dbURL, { useNewUrlParser: true });
        common.convertStringToNumber(jsonProduct)
        let product = new Product(jsonProduct)
        await product.save()
        await db.connection.close()
        log(savedProduct.name + " saved to %s collection.", product.collection.name);
    } catch (error) {
        log(error)
    }
}
// can not apply auto increment id
function insertMany(jsonProducts) {
    try {
        db.connect(dbURL, { useNewUrlParser: true });
        Product.insertMany(jsonProducts, function (err) {
            if (err) return console.error(err);
            log("saved all to %s collection.", Product.collection.name);
            db.connection.close()
        });
    } catch (error) {
        log(error)
    }
}
module.exports = {
    findProductByPRC: findProductByPRC,
    insert: insert,
    insertMany: insertMany
}