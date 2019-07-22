'use strict';
module.exports = (sequelize, DataTypes) => {
  const Statistic = sequelize.define('Statistic', {
    date: DataTypes.DATE,
    districtId: DataTypes.INTEGER,
    productCount: DataTypes.INTEGER
  }, {});
  Statistic.associate = function(models) {
    // associations can be defined here
  };
  return Statistic;
};