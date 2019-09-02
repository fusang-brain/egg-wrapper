"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exceptions_1 = require("./exceptions");
const egg_swagger_decorator_1 = require("egg-swagger-decorator");
const egg_swagger_decorator_2 = require("egg-swagger-decorator");
var egg_swagger_decorator_3 = require("egg-swagger-decorator");
exports.desc = egg_swagger_decorator_3.desc;
exports.formData = egg_swagger_decorator_3.formData;
exports.description = egg_swagger_decorator_3.description;
const PageSchema = {
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
};
exports.pagerParameters = {
    page: {
        default: 1, description: '页数',
    },
    pageSize: {
        default: 15, description: '分页',
    },
};
exports.pagerResponses = [
    { status: 200, message: 'ok', schema: PageSchema },
];
function buildResponses(vals) {
    const resps = {};
    for (const val of vals) {
        let status = 200;
        let message = 'ok';
        let schema;
        if (val['status']) {
            status = val['status'];
            message = val['message'];
            schema = val['schema'];
        }
        else {
            schema = val;
        }
        resps[status] = {
            description: message,
            schema,
        };
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
        }
    };
    return resps;
}
exports.buildResponses = buildResponses;
function tags(t) {
    return egg_swagger_decorator_2.tags(t);
}
exports.tags = tags;
function tag(t) {
    return tags([t]);
}
exports.tag = tag;
exports.responses = (options) => {
    return egg_swagger_decorator_2.responses(buildResponses(options));
};
function rulesToProperties(rules) {
    const properties = {};
    for (const key of Object.keys(rules)) {
        const rule = rules[key];
        if (typeof rule === 'string') {
            properties[key] = {
                type: rule,
            };
        }
        else {
            if (rule.type === 'array') {
                properties[key] = {
                    type: 'array',
                    items: {
                        type: rule.itemType,
                        properties: rulesToProperties(rule.rule || {}),
                    }
                };
            }
            else {
                properties[key] = {
                    type: rule.type,
                    required: rule.required,
                    default: rule.default,
                    description: rule.description,
                    nameStorage: rule.nameStorage,
                    properties: rulesToProperties(rule.rule || {}),
                };
            }
        }
    }
    return properties;
}
/**
 *
 * @param rules
 */
function params(type, rules) {
    return function (target, propertyKey, descriptor) {
        const method = descriptor.value;
        async function doValidate() {
            const app = this.app;
            const ctx = this.ctx;
            if (!app.validator) {
                throw new exceptions_1.ServiceError('请开启 egg-validate 插件');
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
            };
            data = dataGetter[type] || {};
            const queriesInvalid = app['validator'].validate(defaultRules, data);
            if (queriesInvalid) {
                // ctx.throw(422, { errors: queriesInvalid });
                throw new exceptions_1.ValidateError(queriesInvalid);
            }
            await method.call(this);
        }
        descriptor.value = doValidate;
        egg_swagger_decorator_1.params(type)(rulesToProperties(rules || {}))(target, propertyKey, descriptor);
        return descriptor;
    };
}
exports.params = params;
/**
 * 通过 {rules} 验证 query 并生成文档
 * @param rules
 */
exports.query = (rules) => params('query', rules);
/**
 * 通过 {rules} 验证 path 并生成文档
 * @param rules
 */
exports.path = (rules) => params('path', rules);
/**
 * 通过 {rules} 验证 body 并生成文档
 * @param rules
 */
exports.body = (rules) => params('body', rules);
exports.request = (method, path) => egg_swagger_decorator_1.request(method.toUpperCase(), path);
exports.summary = (msg) => egg_swagger_decorator_2.summary(msg);
/**
 * 查询字符串信息校验
 */
exports.queryValidationRule = {
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
function defaultQuery() {
    return {
        page: 1,
        pageSize: 20,
        order: 'asc',
    };
}
exports.defaultQuery = defaultQuery;
/**
 * 验证 {Request} 中的 {Query}, 并且处理分页的默认参数
 * @param rules
 * @param throwError
 */
function queryWithPager(rules, throwError) {
    return function (target, propertyKey, descriptor) {
        const method = descriptor.value;
        async function doValidate() {
            const app = this.app;
            const ctx = this.ctx;
            const queries = ctx.request.query;
            if (queries.page) {
                queries['page'] = +queries.page;
            }
            if (queries.pageSize) {
                queries['pageSize'] = +queries.pageSize;
            }
            const queriesInvalid = app.validator.validate(exports.queryValidationRule, queries);
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
                throw new exceptions_1.ValidateError(invalid);
            }
            ctx.query = Object.assign(Object.assign({}, queries), pagerQueries);
            await method.call(this);
        }
        descriptor.value = doValidate;
        egg_swagger_decorator_1.params('query')(rulesToProperties(Object.assign(Object.assign({}, rules), exports.queryValidationRule) || {}))(target, propertyKey, descriptor);
        return descriptor;
    };
}
exports.queryWithPager = queryWithPager;
