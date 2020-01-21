const db = require('../db')
const mongoose = db.mongoose
const Schema = mongoose.Schema
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
const Review = mongoose.model('review', reviewSchema, COLLECTION_NAME);

async function insert(jsonReview) {
    try {
        connect()
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
        db.connect()
        await Review.insertMany(jsonReviews)
        log("Saved all to %s collection.", Review.collection.name);
        await db.close()
    } catch (error) {
        log(error)
    }
}
async function fetchReviewIdsOfProduct(productId) {
    var query = {
        '$where': 'this.productId == ' + productId
    }
    log(`==> fetch Old Review Ids Of Product : ${JSON.stringify(query)}`)
    db.connect()
    try {
        let reviews = await Review.find(
            query,
            'id productId'
        )
            .sort({ timeStamp: -1 })
            .exec()
        log('reviews.length=%s', reviews.length)
        await db.close()
        return reviews.map(review => review.id)
    } catch (error) {
        log(error)
    }
}

async function fetchProductIdByReviewDay(reviewDay) {
    try {
        log(reviewDay)
        var query = {
            '$where': `new Date(this.timeStamp).toJSON().indexOf("${reviewDay}") >- 1`
        }
        log(query)
        db.connect()
        let reviews = await Review.find(query, 'id productId').exec()
        await db.close()
        log(reviews)
        return reviews.map(review => review.productId);
    } catch (error) {
        log(error)
        return []
    }
}
async function fetchReviewsOfProduct(productId) {
    var query = {
        '$where': 'this.productId == ' + productId
    }
    log(`fetch review of product with query : ${JSON.stringify(query)}`)
    db.connect()
    try {
        let reviews = await Review.find(
            query,
            'id productId author timeStamp userId'
        )
            .sort({ timeStamp: -1 })
            .exec()
        log('reviews.length=%s', reviews.length)
        await db.close()
        return reviews
    } catch (error) {
        log(error)
    }
}
module.exports = {
    insert: insert,
    insertMany: insertMany,
    fetchReviewIdsOfProduct: fetchReviewIdsOfProduct,
    fetchReviewsOfProduct: fetchReviewsOfProduct,
    fetchProductIdByReviewDay: fetchProductIdByReviewDay
};
// (async function () {
//     var reviews = await fetchProductIdByReviewDay('2019-10-24')
//     log(reviews.length)
// }())