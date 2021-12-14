
export type CompileSchema = {
  title?: string,
  httpCode?: number,
  type?: 'object',
  properties?: {
    message?: {
      type?: 'string',
      default?: string,
      [key: string]: any
    },
    code?: {
      type?: 'integer',
      default?: number,
      [key: string]: any
    },
    error?: {
      type?: 'string',
      default?: string,
      [key: string]: any
    },
    [key: string]: any
  },
  additionalProperties?: boolean,
  required?: string[],
  [key: string]: any
}

export type DefaultValues = {
  message?: string,
  code?: number,
  error?: string,
  [key: string]: any
}

type Schema = {
  title: string,
  type: 'object',
  properties: {
    message: {
      type: 'string',
      default: string,
      [key: string]: any
    },
    code: {
      type: 'integer',
      default: number,
      [key: string]: any
    },
    error: {
      type: 'string',
      default: string,
      [key: string]: any
    },
    [key: string]: any
  },
  additionalProperties: boolean,
  required: string[],
  [key: string]: any
}

type JSONError = {
  message: string,
  code: number,
  error: string,
  [key: string]: any
}

export class BaseError extends Error {
  static schema(): Schema

  static httpCode(): number

  static extends(overrideSchema: CompileSchema, defaultValues: DefaultValues): typeof CompiledError

  message: string
  code: number
  error: string
  additional: {[key: string]: any}

  constructor(error?: DefaultValues)

  schema(): Schema

  httpCode(): number

  toJSON(): JSONError
}


export declare function compile(schema: CompileSchema, defaultValues: DefaultValues): typeof CompiledError

