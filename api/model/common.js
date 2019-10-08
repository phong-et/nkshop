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
  
  module.exports = {
      convertStringToNumber:convertStringToNumber
  }