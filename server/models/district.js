'use strict';
module.exports = (sequelize, DataTypes) => {
  const District = sequelize.define('District', {
    name: DataTypes.STRING,
    cityId: DataTypes.INTEGER
  }, {});
  District.associate = function(models) {
    // associations can be defined here
    District.belongsTo(models.City, {
      foreignKey: 'cityId',
    })
  };
  return District;
};
