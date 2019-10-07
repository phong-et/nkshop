var cfg = require('../nk.cfg.js')
const mongoose = require('mongoose');
mongoose.connect(cfg.dbUrl, { useNewUrlParser: true });
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const productSchema = new Schema({
    _id: ObjectId,
    id: String,
    name: String,
    price: String,
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
const productModel = mongoose.model('product', productSchema);
// productModel.find({'$where':'parseInt(this.price) == 1000'}, 'id name price',(err, data) => {
//     console.log(data);
//     mongoose.connection.close();
// });

// productModel.find({ $and: [{ ratingCount: { $gte: 3 } }, { $where: () => parseInt(this.price) >= 1000 }] }, 'id name price ratingCount', (err, data) => {
//     //console.log(err)
//     console.log(data.length);
//     console.log(data);
//     mongoose.connection.close();
// });

productModel.find({ $where: function () { return this.price >= 2000 && this.ratingCount >=10} }, 'id name price ratingCount', (err, data) => {
    console.log(data.length);
    console.log(data).id;
    mongoose.connection.close();
});
// productModel.findOne({}, 'id name price ratingCount').sort({id:-1}).exec((err, data) => {
//     console.log(data.length);
//     console.log(data);
//     mongoose.connection.close();
// });
