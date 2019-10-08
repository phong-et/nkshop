const db = require('../db')
const log = console.log
const Schema = db.Schema;
const ObjectId = Schema.ObjectId;
const productSchema = new Schema({
  _id: ObjectId,
  id: Number,
  name: String,
  price: Number,
  phone: String,
  locationId: String,
  status: Number,
  expirationDate: String,
  lastUpdateStamp: Number,
  meta: {
    locId: Number,
    address: String
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
        height: Number
      }, 
      original:{
        file: String,
        width: Number,
        height: Number
      },
      thumbnail: {
        file: String,
        width: Number,
        height: Number
      }
    }
  },
  ratingScore: Number,
  ratingCount: Number,
  ratingAvg: Number,
  photoCount: Number,
  timestamp: Number,
  viewCount: Number,
  photos: [],
  author: {
    userId: Number,
    username: String,
    url: String,
    displayName: String,
    online: Boolean
  },
  bookmarked: Boolean,
  attributes: {
    70: String,
    42: Number,
    46: Number,
    48: Number,
    49: Number,
    50: Number,
    51: Number,
    68: Number,
    69: Number,
    67: Number,
    64: Number,
    47: String,
    56: String,
    57: String,
    58: String
  },
  slug: String
})
// function convertStringToNumber(obj) {
//   for (var prop in obj) {
//     if (Object.prototype.hasOwnProperty.call(obj, prop)) {
//       switch (prop) {
//         case "id":
//         case "price":
//         case "status":
//         case "lastUpdateStamp":
//         case "locId":
//         case "districtId":
//         case "cityId":
//         case "width":
//         case "height":
//         case "locId":
//         case "ratingScore":
//         case "ratingCount":
//         case "ratingAvg":
//         case "photoCount":
//         case "timestamp":
//         case "viewCount":

//         case "entityId":
//         case "userId":
//         case "stamp":
//           obj[prop] = parseInt(obj[prop])
//           break;
//       }
//     }
//   }
// }

function convertStringToNumber(obj) {
  for (var prop in obj) {
    if (typeof obj[prop] === 'object')
      convertStringToNumber(obj[prop])
    else if(typeof obj[prop] instanceof Array)
      obj[prop].forEach(element => {
        convertStringToNumber(element)
      })
    else
      switch (prop) {
        case "id":
        case "price":
        case "status":
        case "lastUpdateStamp":
        case "locId":
        case "districtId":
        case "cityId":
        case "width":
        case "height":
        case "locId":
        case "ratingScore":
        case "ratingCount":
        case "ratingAvg":
        case "photoCount":
        case "timestamp":
        case "viewCount":

        case "entityId":
        case "userId":
        case "stamp":
          obj[prop] = parseInt(obj[prop])
          break;
      }
  }
}
function insert(jsonProductDetail) {
  var ProductDetail = db.model('ProductDetail', productSchema, 'product_details');
  convertStringToNumber(jsonProductDetail)
  productDetail = new ProductDetail(jsonProductDetail)
  productDetail.save(function (err, productDetail) {
    if (err) return console.error(err);
    log(productDetail.name + " saved to product_details collection.");
    db.connection.close()
  });
}

module.exports = {
  insert:insert
}
