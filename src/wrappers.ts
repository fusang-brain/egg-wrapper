import { Application, Context, Controller } from 'egg';
import { ServiceError, ValidateError } from './exceptions';
import { 
  params as _params,
} from 'egg-swagger-decorator';


import { 
  responses as _responses,
  tags as _tags 
} from 'egg-swagger-decorator';

export {
  desc,
  formData,
  description,
  request,
  summary,
} from 'egg-swagger-decorator';

export type TypeOptions = ('mobile'|'string'|'int'|'integer'|'number'|'date'|'dateTime'|'datetime'|'id'|'boolean'|'ObjectId'|'bool'|'string'|'email'|'password'|'url'|'enum'|'object'|'array');
export interface FieldRule {
  type?: TypeOptions;
  required?: boolean;
  default?: any;
  description?: string;
  nameStorage?: string;
  properties?: Properties;
  items?: FieldRule;
  [key: string]: any;
}

export interface Properties {
  [key: string]: FieldRule;
}

export interface Response {
  status?: number,
  message?: string,
  schema?: FieldRule,
}

interface Query {
  [key: string]: any;
}

interface RuleItem {
  type: TypeOptions;
  required?: boolean;
  description?: string;
  nameStorage?: string;
  convertType?: ('int'|'number'|'string'|'boolean');
  default?: any;
  max?: number;
  min?: number;
  allowEmpty?: boolean;
  format?: any;
  trim?: boolean;
  compare?: string;
  values?: Array<any>;
  rule?: RuleOptions;
  itemType?: TypeOptions;
}

export interface RuleOptions {
  [key: string]: RuleItem|TypeOptions;
}

const PageSchema: FieldRule = {
  type: 'object',
  properties: {
    total: {
      type: 'string',
      description: '总数',
    },
    list: {
      type: 'array',
      items: {
        type: 'object',
        description: '对象'
      },
      description: '列表',
    },
    page: {
      type: 'number',
      description: '当前页'
    },
    pageSize: {
      type: 'number',
      description: '当前分页',
    }
  }
}

export const pagerParameters: Properties = {
  page: {
    default: 1, description: '页数',
  },
  pageSize: {
    default: 15, description: '分页',
  },
}

export const pagerResponses = [
  { status: 200, message: 'ok', schema: PageSchema},
]

export function buildResponses(vals: Array<Response|FieldRule>): any {
  const resps: {
    [key: string]: any;
  } = {};
  for (const val of vals) {
    let status: number = 200;
    let message: string = 'ok';
    let schema: FieldRule|Properties;

    if (val['status']) {
      status = val['status']; 
      message = val['message'];
      schema = val['schema'];
    } else {
      schema = val as any;
    }

    resps[status] = {
      description: message,
      schema,
    }
  }

  resps[422] = {
    description: '参数错误',
    schema: {
      type: 'object',
      properties: {
        details: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: { type: 'string', description: '错误详情' },
              field: { type: 'string', description: '错误字段' },
              code: { type: 'string', description: '错误码' },
            }
          },
          description: '错误列表'
        },
        error: {
          type: 'string',
          description: '错误信息',
        }
      },
    } as FieldRule
  }
  return resps;
}

export function tags(t: string[]) {
  return _tags(t);
}

export function tag(t: string) {
  return tags([t]);
}

export const responses = (options: Array<Response|FieldRule>) => {
  return _responses(buildResponses(options));
}

function rulesToProperties(rules: RuleOptions): Properties {
  const properties: Properties = {};
  for (const key of Object.keys(rules)) {
    const rule = rules[key];

    if (typeof rule === 'string') {
      properties[key] = {
        type: rule,
      }
    } else {
      if (rule.type === 'array') {
        properties[key] = {
          type: 'array',
          items: {
            type: rule.itemType,
            properties: rulesToProperties(rule.rule || {}),
          }
        }
      } else {
        properties[key] = {
          type: rule.type,
          required: rule.required,
          default: rule.default,
          description: rule.description,
          nameStorage: rule.nameStorage,
          properties: rulesToProperties(rule.rule || {}),
        }
      }
    }

  }

  return properties;
}


/**
 * 
 * @param rules 
 */
export function params(type: string, rules?: RuleOptions) {

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    const method: () => Promise<void> = descriptor.value;
    async function doValidate (this: Controller) {
      
      const app = (this.app as (Application&{[key: string]: any}));
      const ctx = (this.ctx as Context);

      if (!app.validator) {
        throw new ServiceError('请开启 egg-validate 插件');
      }

      let defaultRules = null;

      if (rules) {
        defaultRules = rules;
      }

      let data = null;

      const dataGetter = {
        query: ctx.request.query,
        path: ctx.params,
        body: ctx.request.body,
      } as {
        [key: string]: any
      }

      data = dataGetter[type] || {};

      const queriesInvalid = app['validator'].validate(defaultRules, data);

      if (queriesInvalid) {
        // ctx.throw(422, { errors: queriesInvalid });
        throw new ValidateError(queriesInvalid);
      }
      
      await method.call(this);
    }
    descriptor.value = doValidate;
    
    _params(type)(rulesToProperties(rules || {}))(target, propertyKey, descriptor);
    return descriptor;
  }  
}

/**
 * 通过 {rules} 验证 query 并生成文档
 * @param rules 
 */
export const query = (rules?: RuleOptions) => params('query', rules);

/**
 * 通过 {rules} 验证 path 并生成文档
 * @param rules 
 */
export const path = (rules?: RuleOptions) => params('query', rules);

/**
 * 通过 {rules} 验证 body 并生成文档
 * @param rules 
 */
export const body = (rules?: RuleOptions) => params('query', rules);

/**
 * 查询字符串信息校验
 */
export const queryValidationRule: RuleOptions = {
  page: {
    type: 'int',
    min: 1,
    required: false,
  },
  pageSize: {
    type: 'int',
    min: 10,
    max: 100,
    required: false,
  },
  order: {
    type: 'string',
    required: false,
  },
  sort: {
    type: 'string',
    required: false,
  },
};

export function defaultQuery(): Query {
  return {
    page: 1,
    pageSize: 20,
    order: 'asc',
  };
}

/**
 * 验证 {Request} 中的 {Query}, 并且处理分页的默认参数 
 * @param rules 
 * @param throwError 
 */
export function queryWithPager(rules?: RuleOptions, throwError?:boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method: () => Promise<void> = descriptor.value;
    async function doValidate(this: Controller) {
      const app = (this.app as Application&{[key: string]: any});
      const ctx = (this.ctx as Context);

      const queries: Query = ctx.request.query;

      if (queries.page) {
        queries['page'] = +queries.page;
      } 
      if (queries.pageSize) {
        queries['pageSize'] = +queries.pageSize;
      }

      const queriesInvalid = app.validator.validate(queryValidationRule, queries);
      // console.log(queriesInvalid, '==== quer invalid');
      const pagerQueries = queriesInvalid ? defaultQuery() : queries;

      if (!pagerQueries.page) {
        pagerQueries.page = defaultQuery().page;
      }
      if (!pagerQueries.pageSize) {
        pagerQueries.pageSize = defaultQuery().pageSize;
      }

      const invalid = app.validator.validate(rules || {}, queries);

      if (invalid) {
        // ctx.throw(422, { errors: invalid });
        throw new ValidateError(invalid);
      }

      ctx.query = {
        ...queries,
        ...pagerQueries,
      };

      await method.call(this);
    }

    descriptor.value = doValidate;
    _params('query')(rulesToProperties({
      ...rules,
      ...queryValidationRule,
    } || {}))(target, propertyKey, descriptor);
    return descriptor;
  }
}