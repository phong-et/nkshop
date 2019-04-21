import {makeExecutableSchema} from 'graphql-tools'

import statisticDef from './statistic/def'
import statisticRes from './customer/res'

const SchemaDefinition = `
  schema {
    query: RootQuery,
    mutation: RootMutation
  }
`

const RootQuery = `
  type RootQuery {
    fetchStatisticDistrictByMonth(input:Int): Statistic
    fetchStatisticDistrictsByMonth(input:Int) [Statistic]
  }
`

const RootMutation = `
  type RootMutation {
    appendStatistic(input:StatisticInput): Int
  }
`

export default makeExecutableSchema({
  typeDefs: [
    SchemaDefinition,
    RootQuery,
    RootMutation,
    statisticDef,
  ],
  resolvers: [
    statisticRes,
  ],
})
