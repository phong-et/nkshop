import {Statistic, District, sequelize} from '../../models'
import _d from 'lodash'
const resolvers = {
  RootQuery: {
    async fetchStatisticDistrictByMonth(_, {input}) {
      return await Statistic.findAll({
        include: [Statistic, District],
        where: {createdAt: input.month, districtId: input.districtId},
      })
    },
    async fetchStatisticDistrictsByMonth(_, {input}) {
      return await Statistic.findAll({
        include: [Statistic, District],
        where: {createdAt: input},
      })
    },
  },
  RootMutation: {
    async appendStatistic(_, {input}) {
      return sequelize.transaction(t => {
        return Statistic.create(input, {transaction: t}).then(appendedStatistic => appendedStatistic.get('id'))
      })
    },
  },
}
export default resolvers
