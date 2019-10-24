const fs = require('fs')
const db = require('../db')
const dbURL = require('../../nk.cfg').dbUrl
const Schema = db.Schema
const log = console.log
const common = require('./common')
const COLLECTION_NAME = 'products'
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
const Product = db.model('product', productSchema, COLLECTION_NAME);
function findProductByPRC(price, ratingCount) {
    var query = {
        '$where': 'this.price >= ' + price + ' && this.ratingCount >= ' + ratingCount
    }
    db.connect(dbURL, { useNewUrlParser: true });
    return Product.find(
        query,
        'id name price ratingCount lastUpdateStamp')
        .sort({ lastUpdateStamp: -1 })
        .exec((err, data) => {
            if (err) log(err)
            log('data.length=%s', data.length)
            data.forEach(e => {
                e.lastUpdateStamp = new Date(e.lastUpdateStamp * 1000).toLocaleDateString()
            })
            log(data)
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
        log("Saved to %s collection.", product.collection.name);
    } catch (error) {
        log(error)
    }
}
// can not apply auto increment id
function insertMany(jsonProducts, callback) {
    try {
        db.connect(dbURL, { useNewUrlParser: true });
        Product.insertMany(jsonProducts, function (err) {
            if (err) return error(err);
            log("Saved all to %s collection.", Product.collection.name);
            db.connection.close()
            callback()
        });
    } catch (error) {
        log(error)
    }
}
function saveAllProductIdToFile(fileName) {
    db.connect(dbURL, { useNewUrlParser: true });
    products = Product.find(
        {},
        'id ratingCount')
        .sort({ id: -1 })
        .exec((err, products) => {
            if (err) log(err)
            log('data.length=%s', products.length)
            let pathFileName = './' + fileName + '.json'
            let arrProductId = []
            products.forEach(product => {
                if (product.ratingCount > 0)
                    arrProductId.push({ id: product.id, ratingCount: product.ratingCount })
            })
            fs.writeFile(pathFileName, '[' + JSON.stringify(arrProductId) + ']', function (err) {
                if (err) reject(err)
                var statusText = 'write file > ' + fileName + ' success'
                log(statusText)
            })
            db.connection.close()
        })
}
function getLatestProductId(callback) {
    db.connect(dbURL, { useNewUrlParser: true });
    Product.findOne({}).sort({ id: -1 }).exec((err, data) => {
        if (err) log(err)
        log(data.id)
        db.connection.close()
        callback(data.id)
    })
}

module.exports = {
    findProductByPRC: findProductByPRC,
    insert: insert,
    insertMany: insertMany,
    saveAllProductIdToFile: saveAllProductIdToFile,
    getLatestProductId:getLatestProductId
}

//saveAllProductIdToFile('ids');
//getLatestProductId(()=>{})