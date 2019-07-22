sequelize model:generate --name City --attributes name:string
sequelize model:generate --name District --attributes name:string,cityId:integer
sequelize model:generate --name Statistic --attributes date:Date,districtId:integer,productCount:integer
