import { Controller, Application, Context } from 'egg';
import { RuleOptions } from './wrappers';
import { ServiceError, ValidateError } from './exceptions';
type ValidateType = ('query'|'body'|'path');

/**
 * 
 * @param rules 
 */
export function validate(type: ValidateType, rules?: RuleOptions) {

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
    return descriptor;
  } 
}