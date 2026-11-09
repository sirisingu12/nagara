import { getDatabasePool } from '../../config/database.js'

export function createParameterizedQueryRepository(executor = getDatabasePool()) {
  return {
    async selectValue(value) {
      const [rows] = await executor.execute('SELECT ? AS value', [value])
      return rows[0]
    },
  }
}
