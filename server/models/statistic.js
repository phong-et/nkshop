'use strict';
module.exports = (sequelize, DataTypes) => {
  const statistic = sequelize.define('statistic', {
    districtId: DataTypes.INTEGER,
    productCount: DataTypes.INTEGER
  }, {});
  statistic.associate = function(models) {
    // associations can be defined here
  };
  return statistic;
};
