var cfg = require('./nk.cfg.js')
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
    cover : {
        baseName : String,
        dimensions : {
            small : {
                file : String,
                width : Number,
                height : Number,
                url : String
            },
            original : {
                file : String,
                width : Number,
                height : Number,
                url : String
            },
            thumbnail : {
                file : String,
                width : Number,
                height : Number,
                url : String
            }
        }
    },
    ratingScore: String,
    ratingCount: String,
    ratingAvg: String,
    photoCount: String,
    timestamp: String,
    viewCount: String,
    address: String,
    slug: String
});
const productModel = mongoose.model('product', productSchema);
productModel.find({'$where':'parseInt(this.price) >= 100$'}, 'id name price',(err, data) => {
    console.log(data);
    mongoose.connection.close();
});