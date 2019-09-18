var cfg = require('../nk.cfg.js')
const mongoose = require('mongoose');
const db = require('../api/db')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const productSchema = new Schema({
    _id: ObjectId,
    id: Number,
    name: String,
    price: Number,
    locationId: String,
    status: String,
    expirationDate: Date,
    userId: String,
    lastUpdateStamp: String,
    meta: String,
    lat: String,
    lng: String,
    districtId: String,
    cityId: String,
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
    ratingScore: String,
    ratingCount: Number,
    ratingAvg: String,
    photoCount: String,
    timestamp: String,
    viewCount: String,
    address: String,
    slug: String
});
const productModel = db.model('product', productSchema);
// productModel.find({
//     $and: [
//         { '$where': 'this.price >= 1000' },
//         { ratingCount: "5" }
//     ]
// }, 'id name price', (err, data) => {
//     console.log(data);
//     db.connection.close();
// });
productModel.find({}, 'id name price ratingCount').sort({id:1}).exec((err, data) => {
    console.log(data.length);
    console.log(data);
    mongoose.connection.close();
});