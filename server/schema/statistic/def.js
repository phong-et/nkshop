const statistic = `
  type Statistic {
    id: Int
    districtId: Int
    productCount: Int
    createdAt: Date
  }
  input StatisticInput {
    districtId: Int!
    productCount: Int!
  }
`
export default statistic
