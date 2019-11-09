const db = require('../db')
const dbURL = require('../../nk.cfg').dbUrl
const Schema = db.Schema
const log = console.log
const COLLECTION_NAME = 'cities'
const citySchema = new Schema({
    _id: Number,
    id: Number,
    name: String,
    countryId: Number,
})
const City = db.model('city', citySchema, COLLECTION_NAME);
async function fetchCities(countryId) {
    var query = {
        '$where': 'this.countryId == ' + countryId
    }
    db.connect(dbURL, { useNewUrlParser: true });
    try {
        let cities = await City.find(
            query,
            'id name'
        )
            .exec()
        log('cities.length=%s', cities.length)
        //log(districts)
        await db.connection.close()
        return cities
    } catch (error) {
        log(error)
    }
}
module.exports = {
    fetchCities: fetchCities
}
// ;(async function () { await fetchCities(1) }())