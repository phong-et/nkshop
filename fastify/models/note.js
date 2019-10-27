const db = require('../db')
const dbURL = require('../../nk.cfg').dbUrl
const Schema = db.Schema
const log = console.log
const COLLECTION_NAME = 'notes'
const noteSchema = new Schema({
    _id:Number,
    productId: [],
    noteType: Number,
    noteContent: String,
})
const Note = db.model('note', noteSchema, COLLECTION_NAME);
async function insert(jsonNote) {
    try {
        db.connect(dbURL, { useNewUrlParser: true });
        let note = new Note(jsonnote)
        await note.save()
        await db.connection.close()
        log("Saved to %s collection.", note.collection.name);
    } catch (error) {
        log(error)
    }
}
async function findNotesOfProduct(productId) {
    var query = {
        '$where': 'this.productId == ' + productId
    }
    log(`find note of product with query : ${JSON.stringify(query)}`)
    db.connect(dbURL, { useNewUrlParser: true });
    try {
        let notes = await Note.find(
                query,
                'productId noteType noteContent'
            )
            .sort({ timeStamp: -1 })
            .exec()
        log('notes.length=%s', notes.length)
        await db.connection.close()
        return notes
    } catch (error) {
        log(error)
    }
}
module.exports = {
    insert: insert,
    findNotesOfProduct: findNotesOfProduct
};
//(async function () { await findNotesOfProduct(24842) }())