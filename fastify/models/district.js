const db = require('../db')
const dbURL = require('../../nk.cfg').dbUrl
const Schema = db.Schema
const log = console.log
const COLLECTION_NAME = 'districts'
const districtSchema = new Schema({
    _id: Number,
    id: Number,
    name: String,
    cityId: Number,
})
const District = db.model('district', districtSchema, COLLECTION_NAME);
async function fetchDistricts(cityId) {
    var query = {
        '$where': 'this.cityId == ' + cityId
    }
    //log(`find district of city with query : ${JSON.stringify(query)}`)
    db.connect(dbURL, { useNewUrlParser: true });
    try {
        let districts = await District.find(
            query,
            'id name'
        )
            .exec()
        log('districts.length=%s', districts.length)
        //log(districts)
        await db.connection.close()
        return districts
    } catch (error) {
        log(error)
    }
}
module.exports = {
    fetchDistricts: fetchDistricts
};
// (async function () { await fetchDistricts(2) }())