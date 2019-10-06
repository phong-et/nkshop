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
    status: Number,
    expirationDate: Date,
    userId: Number,
    lastUpdateStamp: Number,
    meta:{
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
const productModel = db.model('product', productSchema);
// productModel.find({
//     $and: [
//         { '$where': 'this.price >= 1000' },
//         { ratingCount: "5" }
//     ]
// }, 'id name price', (err, data) => {
//     console.log(data)
//     db.connection.close()
// })

productModel.findOne({}).sort({id:-1}).exec((err, data) => {
    console.log(data.length)
    console.log(data)
    mongoose.connection.close()
})

// productModel.find({ $where: function () { return this.price >= 1200 && this.ratingCount >=7} }, 'id name price ratingCount', (err, data) => {
//     console.log(data.length)
//     console.log(data)
//     db.connection.close()
// })

productModel.find({ $where: function () { return this.price >= 2000 && this.ratingCount >=10} }, 'id name price ratingCount lastUpdateStamp').sort({lastUpdateStamp:-1}).exec((err, data) => {
    console.log('data.length=%s', data.length)
    // data.forEach(e => {
    //     var e1 = {...e}
    //     e1.lastUpdateStamp = new Date(e.lastUpdateStamp).toString()
    //     console.log(e1)
    // })
    data.forEach(e => {
        console.log(e.id)
    })
    db.connection.close()
})