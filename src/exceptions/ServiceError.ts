import BaseError from './BaseError';

export default class ServiceError extends BaseError {
  constructor (message?: string) {
    super(message || 'Service Error', 500);
  }
};