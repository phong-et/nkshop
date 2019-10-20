
const db = require('../db')
const dbURL = require('../../nk.cfg').dbUrl
const Schema = db.Schema
const log = console.log
const common = require('./common')
const COLLECTION_NAME = 'reviews'
const reviewSchema = new Schema({
    photos: [],
    productId: Number,
    title: String,
    entityId: Number,
    userId: Number,
    score: Number,
    timeStamp: Number,
    active: Number,
    message: String,
    upVoteCount: Number,
    downVoteCount: Number,
    survey: Schema.Types.Mixed,
    id: Number,
    phone: String,
    visiteTime: Number,
    location: String,
    author: {
        urlInfo: {
            routeName: String,
            vars: {
                username: String
            }
        },
        userId: Number,
        src: String,
        url: String,
        title: String,
        label: String,
        labelColor: String
    }
})
const Review = db.model('review', reviewSchema, COLLECTION_NAME);
async function insert(jsonReview) {
    try {
        db.connect(dbURL, { useNewUrlParser: true });
        common.convertStringToNumber(jsonReview)
        let review = new Review(jsonReview)
        await review.save()
        await db.connection.close()
        log("Saved to %s collection.", review.collection.name);
    } catch (error) {
        log(error)
    }
}
// can not apply auto increment id
async function insertMany(jsonReviews) {
    try {
        db.connect(dbURL, { useNewUrlParser: true });
        await Review.insertMany(jsonReviews)
        log("Saved all to %s collection.", Review.collection.name);
        await db.connection.close()
    } catch (error) {
        log(error)
    }
}
async function findReviewsOfProduct(productId) {
    var query = {
        '$where': 'this.productId == ' + productId
    }
    log(query)
    db.connect(dbURL, { useNewUrlParser: true });
    try {
        let reviews = await Review.find(
            query,
            'id productId'
            //userId phone timeStamp'
        )
        .sort({ timeStamp: -1 })
        .exec()
        log('data.length=%s', reviews.length)
        let reviewIds = []
        reviews.forEach(e => {
            e.timeStamp = new Date(e.timeStamp * 1000).toLocaleDateString()
            reviewIds.push(e.id)
        })
        //log(reviews)
        db.connection.close()
        return reviewIds
    } catch (error) {
        log(error)
    }

}
module.exports = {
    insert: insert,
    insertMany: insertMany,
    findReviewsOfProduct: findReviewsOfProduct
};
//(async function () { await findReviewsOfProduct(24842) }())
