class BaseError extends Error {
  constructor() {
    super()
  }
}

/**
 * @template T
 * @param {T} target
 * @returns {T}
 */
function copyDeep(target) {
  if (typeof target !== 'object' || typeof target === 'object' && !target) {
    return target
  }
  if (Array.isArray(target)) {
    return target.map(value => copyDeep(value))
  } else {
    const result = {}
    Object.entries(target).forEach(([name, value]) => result[name] = copyDeep(value))
    return result
  }
}

function replaceDeep(source, target) {
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (key in target) {
        if (typeof target[key] === 'object' && !Array.isArray(target[key])) {
          replaceDeep(source[key], target[key])
        } else {
          target[key] = source[key]
        }
      } else {
        target[key] = source[key]
      }
    } else {
      target[key] = value
    }
  }

  return target
}

function createSchema(schema = {}, defaultValues = {}, overrideSchema = {}) {
  const defaultSchema = {
    httpCode: 400,
    type: 'object',
    properties: {
      message: {
        type: 'string',
        default: 'Error message'
      },
      code: {
        type: 'integer',
        default: 0
      },
      error: {
        type: 'string'
      }
    },
    additionalProperties: false
  }

  schema = replaceDeep(schema, defaultSchema)
  schema = replaceDeep(overrideSchema, schema)

  for (const [key, value] of Object.entries(defaultValues)) {
    if (key in schema.properties) {
      schema.properties[key].default = value
    }
  }

  const title = schema.title
    || schema.properties.error.default
    || 'DefaultError'

  schema.title = title
  schema.properties.error.default = title

  if (!Array.isArray(schema.required)) {
    schema.required = ['message', 'code', 'error']
  } else {
    const required = new Set(schema.required)
    ;['message', 'code', 'error'].forEach(name => required.add(name))
    schema.required = Array.from(required)
  }

  return schema
}

function copyDefault(schema, sourceDefaultValues) {
  const defaultValues = {}

  for (const key of Object.keys(schema.properties)) {
    if (key in sourceDefaultValues) {
      defaultValues[key] = sourceDefaultValues[key]
    } else if ('default' in schema.properties[key]) {
      defaultValues[key] = schema.properties[key].default
    }
  }

  return defaultValues
}


/**
 * @typedef {Object<String, any>} CompileSchema
 * @type {Object}
 * @property {Number} [httpCode]
 * @property {String} [title]
 * @property {Object<String, Object<String, any>>} [properties]
 * @property {String[]} [required]
 * @property {Boolean} additionalProperties
 */

/**
 * @param {CompileSchema} schema
 * @param {Object<String, any>} defaultValues
 * @returns {typeof CompiledError}
 */
function compile(schema = {}, defaultValues = {}) {
  schema = createSchema(schema, defaultValues)
  defaultValues = copyDefault(schema, defaultValues)

  const {httpCode} = schema
  delete schema.httpCode

  const keys = new Set(Object.keys(schema.properties))

  keys.delete('code')
  keys.delete('message')
  keys.delete('error')

  class CompiledError extends BaseError {
    static schema() {
      return copyDeep(schema)
    }

    /**
     * @returns {Number}
     */
    static httpCode() {
      return httpCode
    }

    static extends(overrideSchema, defaultValues) {
      schema.httpCode = httpCode
      return compile(createSchema(schema, defaultValues, overrideSchema), defaultValues)
    }

    constructor(error = {}) {
      super()
      this.message = error.message ?? schema.properties.message.default
      this.code = error.code ?? schema.properties.code.default
      this.error = this.constructor.name
      this.additional = {}

      for (const key of keys) {
        if (keys.has(key)) {
          if (key in error) {
            this.additional[key] = error[key]
          } else if (key in defaultValues) {
            this.additional[key] = defaultValues[key]
          }
        }
      }
    }

    schema() {
      return copyDeep(schema)
    }

    /**
     * @returns {Number}
     */
    httpCode() {
      return httpCode
    }

    /**
     * @returns {{message: String, code: Number, error: String} & Object<String, any>}
     */
    toJSON() {
      return {
        message: this.message,
        code: this.code,
        error: this.error,
        ...this.additional
      }
    }
  }

  Object.defineProperty(CompiledError, 'name', {value: schema.title})

  return CompiledError
}


module.exports.BaseError = BaseError
module.exports.compile = compile