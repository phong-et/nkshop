'use strict'
require('dotenv').config()
var Sequelize = require('sequelize')
const Op = Sequelize.Op
var aliases = {
  $in: Op.in,
  $gt: Op.gt,
}

module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    dialect: 'mysql',
    operatorsAliases: aliases,
    pool: {
      port: 3306,
      max: 50,
      min: 1,
      accquire: 60000,
      idle: 15000,
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    operatorsAliases: aliases,
    pool: {
      port: 3306,
      max: 5,
      min: 1,
      accquire: 60000,
      idle: 20000,
    },
  },
}
