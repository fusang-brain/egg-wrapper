import BaseError from './BaseError';
export default class ValidateError extends BaseError {
    constructor(errors: Array<any>);
}
