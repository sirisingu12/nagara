import test from 'node:test'
import assert from 'node:assert/strict'
import { createParameterizedQueryRepository } from '../src/repositories/examples/parameterizedQueryRepository.js'

test('example repository sends user values through SQL placeholders', async () => {
  const calls = []
  const repository = createParameterizedQueryRepository({
    async execute(sql, parameters) {
      calls.push({ sql, parameters })
      return [[{ value: parameters[0] }]]
    },
  })

  const result = await repository.selectValue('sample')

  assert.deepEqual(calls, [
    { sql: 'SELECT ? AS value', parameters: ['sample'] },
  ])
  assert.deepEqual(result, { value: 'sample' })
})
