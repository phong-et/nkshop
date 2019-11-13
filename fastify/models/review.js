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
async function fetchReviewIdsOfProduct(productId) {
    var query = {
        '$where': 'this.productId == ' + productId
    }
    log(`find review ids of product with query : ${JSON.stringify(query)}`)
    db.connect(dbURL, { useNewUrlParser: true });
    try {
        let reviews = await Review.find(
            query,
            'id productId'
        )
        .sort({ timeStamp: -1 })
        .exec()
        log('reviews.length=%s', reviews.length)
        db.connection.close()
        return reviews.map(review => review.id)
    } catch (error) {
        log(error)
    }
}

async function fetchReviewsOfProduct(productId) {
    var query = {
        '$where': 'this.productId == ' + productId
    }
    log(`fetch review of product with query : ${JSON.stringify(query)}`)
    db.connect(dbURL, { useNewUrlParser: true });
    try {
        let reviews = await Review.find(
            query,
            'id productId author timeStamp userId'
        )
        .sort({ timeStamp: -1 })
        .exec()
        log('reviews.length=%s', reviews.length)
        db.connection.close()
        return reviews
    } catch (error) {
        log(error)
    }
}
module.exports = {
    insert: insert,
    insertMany: insertMany,
    fetchReviewIdsOfProduct: fetchReviewIdsOfProduct,
    fetchReviewsOfProduct: fetchReviewsOfProduct
};
//(async function () { await fetchReviewIdsOfProduct(24842) }())