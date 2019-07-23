const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/nk', { useNewUrlParser: true });
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productSchema = new Schema({
    _id: ObjectId,
    id: String,
    name: String,
    price: Number,
    locationId: String,
    status: 1,
    expirationDate: Date,
    userId: Number,
    lastUpdateStamp: String,
    meta: String,
    lat: String,
    lng: String,
    districtId: Number,
    cityId: Number,
    cover: {
        type: Map,
        of: String
    },
    ratingScore: mongoose.Decimal128,
    ratingCount: Number,
    ratingAvg: mongoose.Decimal128,
    photoCount: Number,
    timestamp: String,
    viewCount: Number,
    address: String,
    slug: String
});
const productModel = mongoose.model('product', productSchema);
productModel.find({id:"23229"},(err, data) => {
    console.log(data);
});