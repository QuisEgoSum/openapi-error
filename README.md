## Introduction

Generating error classes from openapi schemas.

- [Create classes](#create-classes);
- [Extends schemas](#extends-classes);
- [Get HTTP code](#get-http-code);
- [Get schemas](#get-schemas);
- [Instanceof error](#instanceof-error).


## Create classes

Compile params:
  - `schema` - specification of the error object;
  - `defaultValues` - an object with default values when creating an error.

````javascript
const OpenApiError = require('openapi-error')

const EntityNotExistsError = OpenApiError.compile(
  {
    httpCode: 404,
    properties: {
      message: {
        type: 'string',
        default: 'Entity not exists' // Replace default "Error message"
      },
      code: {
        type: 'integer',
        default: 1 // Replace default 0
      },
      error: {
        type: 'string',
        default: 'EntityNotExistsError' // Replace default "DefaultError"
      }
    },
    required: ['message', 'code', 'error'],
    additionalProperties: false
  }
)
````

Or the same thing, but shorter:

````javascript
const EntityNotExistsError = OpenApiError.compile(
  {
    httpCode: 404
  },
  {
    message: 'Entity not exists', // Replace default "Error message"
    code: 1, // Replace default 0
    error: 'EntityNotExistsError' // Replace default "DefaultError"
  }
)
````

The scheme value `properties.error.default` and the default parameter values `error`
are interchangeable and overwrite each other:
````javascript
//For the scheme above
console.log(new EntityNotExistsError().error) // EntityNotExistsError
//Schema title always corresponds to this value
console.log(new EntityNotExistsError().title) // EntityNotExistsError

// Or
const ForbiddenError = OpenApiError.compile(
  {
    httpCode: 403,
    properties: {
      error: {
        type: 'string',
        default: 'ForbiddenError' // Replace default "DefaultError"
      }
    }
  },
  {
    code: 3,
    message: 'Forbidden'
  }
)

console.log(new UnauthorizedError().error) // ForbiddenError
````


## Extends classes

Extends params:
- `overrideSchema` - a scheme that complements the original one with the replacement of properties;
- `defaultValues` - an object that complements or replaces the default values when creating an error.

Schema extension with the addition of a new property:
````javascript
const UserNotExistsError = EntityNotExistsError.extends(
  {
    properties: {
      userId: {
        type: 'integer',
        minimum: 1,
        example: 101
      }
    },
    /**
     * The absence of the specified property in "required" when passing an argument
     * to the error constructor will not cause an error
     */
    required: ['userId']
  },
  {
    message: 'User not found',
    code: 1001,
    error: 'UserNotExistsError'
  }
)

````
The properties, except `message`, `code` and `error` are in the `additional` object
of the error:
````javascript
const userNotExistsError = new UserNotExistsError({userId: 1})

console.log(userNotExistsError.message) // User not found
console.log(userNotExistsError.code) // 1001
console.log(userNotExistsError.error) // UserNotExistsError
console.log(userNotExistsError.additional) // {userId: 1}

const userNotExistsJSON = userNotExistsError.toJSON()

console.log(userNotExistsJSON)
// {message: 'User not found', code: 1001, error: 'UserNotExistsError', userId: 1}
````


## Get HTTP code

````javascript
console.log(UserNotExistsError.httpCode()) // Static method
console.log(new UserNotExistsError().httpCode()) // Instance method
````


## Get schemas

````javascript
console.log(UserNotExistsError.schema()) // Static method
console.log(new UserNotExistsError().schema()) // Instance method

/**
 * {
 *   title: 'UserNotExistsError',
 *   properties: {
 *     message: {
 *       type: 'string',
 *       default: 'User not found'
 *     },
 *     code: {
 *       type: 'integer',
 *       default: 1001
 *     },
 *     error: {
 *       type: 'integer',
 *       default: 'UserNotExistsError'
 *     },
 *     userId: {
 *       type: 'integer',
 *       minimum: 1,
 *       example: 101
 *     }
 *   },
 *   required: ['userId', 'message', 'code', 'error'],
 *   additionalProperties: false
 * }
 */
````

## Instanceof error


````javascript
const userNotExistsError = new UserNotExistsError({userId: 1})

console.log(userNotExistsError instanceof Error) // true
console.log(userNotExistsError instanceof OpenApiError.BaseError) // true
console.log(userNotExistsError instanceof EntityNotExistsError) // true
````


