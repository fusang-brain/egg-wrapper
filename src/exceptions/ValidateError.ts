import BaseError from './BaseError';

export default class ValidateError extends BaseError {
  constructor (errors: Array<any>) {
    super('参数错误', 422, errors);
  }
};

