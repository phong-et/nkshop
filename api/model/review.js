const fs = require('fs')
const db = require('../db')
const dbURL = require('../../nk.cfg').dbUrl
const Schema = db.Schema
const log = console.log
const autoIncrement = require('mongoose-sequence')(db);
const common = require('./common')
const COLLECTION_NAME = 'reviews'
const reviewSchema = new Schema({
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

module.exports = {
    insert: insert,
    insertMany: insertMany,
}