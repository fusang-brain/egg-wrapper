export { desc, formData, description, } from 'egg-swagger-decorator';
export declare type TypeOptions = ('mobile' | 'string' | 'int' | 'integer' | 'number' | 'date' | 'dateTime' | 'datetime' | 'id' | 'boolean' | 'ObjectId' | 'bool' | 'string' | 'email' | 'password' | 'url' | 'enum' | 'object' | 'array');
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
    status?: number;
    message?: string;
    schema?: FieldRule;
}
interface Query {
    [key: string]: any;
}
interface RuleItem {
    type: TypeOptions;
    required?: boolean;
    description?: string;
    nameStorage?: string;
    convertType?: ('int' | 'number' | 'string' | 'boolean');
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
    [key: string]: RuleItem | TypeOptions;
}
export declare const pagerParameters: Properties;
export declare const pagerResponses: {
    status: number;
    message: string;
    schema: FieldRule;
}[];
export declare function buildResponses(vals: Array<Response | FieldRule>): any;
export declare function tags(t: string[]): (target: any, name: any, descriptor: any) => any;
export declare function tag(t: string): (target: any, name: any, descriptor: any) => any;
export declare const responses: (options: (FieldRule | Response)[]) => (target: any, name: any, descriptor: any) => any;
/**
 *
 * @param rules
 */
export declare function params(type: string, rules?: RuleOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 通过 {rules} 验证 query 并生成文档
 * @param rules
 */
export declare const query: (rules?: RuleOptions | undefined) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 通过 {rules} 验证 path 并生成文档
 * @param rules
 */
export declare const path: (rules?: RuleOptions | undefined) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 通过 {rules} 验证 body 并生成文档
 * @param rules
 */
export declare const body: (rules?: RuleOptions | undefined) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const request: (method: "head" | "get" | "connect" | "post" | "put" | "delete" | "options" | "trace", path: string) => (target: any, name: any, descriptor: any) => any;
export declare const summary: (msg: string) => (target: any, name: any, descriptor: any) => any;
/**
 * 查询字符串信息校验
 */
export declare const queryValidationRule: RuleOptions;
export declare function defaultQuery(): Query;
/**
 * 验证 {Request} 中的 {Query}, 并且处理分页的默认参数
 * @param rules
 * @param throwError
 */
export declare function queryWithPager(rules?: RuleOptions, throwError?: boolean): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
