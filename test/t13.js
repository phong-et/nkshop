let nk = require('../nk')
let cfg = require('../nk.cfg')
let Review = require('../api/model/review')
var arrReview = [{
    "title": "",
    "entityId": "",
    "userId": "",
    "score": "",
    "timeStamp": "",
    "active": "",
    "message": "",
    "upVoteCount": "4",
    "downVoteCount": "0",
    "survey": "",
    "id": "",
    "phone": "",
    "visiteTime": "",
    "location": "",
    "author": {
        "urlInfo": {
            "routeName": "",
            "vars": {
                "username": ""
            }
        },
        "userId": "",
        "src": "",
        "url": "",
        "title": "",
        "label": "",
        "labelColor": ""
    }
}];
// arrReview.forEach(review => {
//     review.survey = JSON.parse(review.survey)
//     review.productId = productId
// })
// Review.insertMany(
//     arrReview
// )

(async function () {
   Review.insertMany(await nk.fetchReviewListOfProductSaveDb(cfg.reviewUrl, 10334, 280))
})()



