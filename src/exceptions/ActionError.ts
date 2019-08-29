import BaseError from './BaseError';

export default class ActionError extends BaseError {
  constructor (message: any) {
    super(message, 400);
  }
};

