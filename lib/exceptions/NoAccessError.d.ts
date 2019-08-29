import BaseError from './BaseError';
export default class NoAccessError extends BaseError {
    constructor(message?: string);
}
