'use strict'

var GoogleSpreadsheet = require('google-spreadsheet')
var _d = require('lodash')
var creds = require('../NKSHOP-204503-d0f45f50664e.json')
var doc = new GoogleSpreadsheet('1_zZAxM2IHrVLxmnVeiwVCkOPybgyxCVwBKuhygPfqbo')
function getData() {
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, function(err) {
      doc.getRows(1, function(err, rows) {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  })
}
module.exports = {
  async up(queryInterface, Sequelize) {
    var data = await getData().catch(err => console.log(err))
    return queryInterface.bulkInsert('districts', _d.map(data, row => _d.pick(row, 'id', 'name')), {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('districts', null, {})
  },
}
