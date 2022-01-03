const ApplicationError = require('./index')
const assert = require('assert')

/**
 * @type {typeof CompiledError}
 */
let EntityNotExistsError = null

describe('Default', function() {
  it('Compile', function() {
    EntityNotExistsError = ApplicationError.compile(
      {httpCode: 404},
      {error: 'EntityNotExistsError', message: 'Entity not exists'}
    )
  })
  it('Instanceof Error', function() {
    assert.equal(new EntityNotExistsError() instanceof Error, true)
  })
  it('Instanceof BaseClass', function() {
    assert.equal(new EntityNotExistsError() instanceof ApplicationError.BaseError, true)
  })
  it('Default instance values', function() {
    const instanceEntityNotExistsError = new EntityNotExistsError()

    assert.equal(instanceEntityNotExistsError.code, 0)
    assert.equal(instanceEntityNotExistsError.message, 'Entity not exists')
    assert.equal(instanceEntityNotExistsError.error, 'EntityNotExistsError')
    assert.equal(instanceEntityNotExistsError.httpCode(), 404)
  })
  it('Redefinition instance values', function() {
    const instanceEntityNotExistsError = new EntityNotExistsError({code: 200, message: 'test'})

    assert.equal(instanceEntityNotExistsError.code, 200)
    assert.equal(instanceEntityNotExistsError.message, 'test')
    assert.equal(instanceEntityNotExistsError.error, 'EntityNotExistsError')
    assert.equal(instanceEntityNotExistsError.httpCode(), 404)
  })
  it('Equal schema', function() {
    assert.deepEqual(EntityNotExistsError.schema(), {
      title: 'EntityNotExistsError',
      type: 'object',
      properties: {
        code: {
          type: 'integer',
          default: 0
        },
        message: {
          type: 'string',
          default: 'Entity not exists'
        },
        error: {
          type: 'string',
          default: 'EntityNotExistsError'
        }
      },
      required: ['message', 'code', 'error'],
      additionalProperties: false
    }, 'Not equal schemas')
  })
})

describe('Extends. Change title and default values', function() {
  /**
   * @type {typeof CompiledError}
   */
  let UserNotExistsError = null

  it('Extends', function() {
    UserNotExistsError = EntityNotExistsError.extends(
      {
        title: 'UserNotExistsError',
        properties: {
          userId: {
            type: 'integer'
          }
        }
      },
      {code: 2000, message: 'test'}
    )
  })
  it('Instanceof Error', function() {
    assert.equal(new UserNotExistsError() instanceof Error, true)
  })
  it('Instanceof BaseClass', function() {
    assert.equal(new UserNotExistsError() instanceof ApplicationError.BaseError, true)
  })
  it('Instanceof pre class', function() {
    assert.equal(new UserNotExistsError() instanceof EntityNotExistsError, true)
  })
  it('Default instance values', function() {
    const instanceUserNotExistsError = new UserNotExistsError({userId: 1})

    assert.equal(instanceUserNotExistsError.code, 2000)
    assert.equal(instanceUserNotExistsError.message, 'test')
    assert.equal(instanceUserNotExistsError.error, 'UserNotExistsError')
    assert.equal(instanceUserNotExistsError.additional.userId, 1)
    assert.equal(instanceUserNotExistsError.httpCode(), 404)
  })
  it('Redefinition instance values', function() {
    const instanceUserNotExistsError = new UserNotExistsError({code: 200, message: 'test', userId: 2})

    assert.equal(instanceUserNotExistsError.code, 200)
    assert.equal(instanceUserNotExistsError.message, 'test')
    assert.equal(instanceUserNotExistsError.error, 'UserNotExistsError')
    assert.equal(instanceUserNotExistsError.additional.userId, 2)
    assert.equal(instanceUserNotExistsError.httpCode(), 404)
  })
  it('Equal schema', function() {
    assert.deepEqual(UserNotExistsError.schema(), {
      title: 'UserNotExistsError',
      type: 'object',
      properties: {
        code: {
          type: 'integer',
          default: 2000
        },
        message: {
          type: 'string',
          default: 'test'
        },
        error: {
          type: 'string',
          default: 'UserNotExistsError'
        },
        userId: {
          type: 'integer'
        }
      },
      required: ['message', 'code', 'error'],
      additionalProperties: false
    }, 'Not equal schemas')
  })
})