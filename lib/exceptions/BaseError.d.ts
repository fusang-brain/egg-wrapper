export default class BaseError extends Error {
    status: number;
    errors: Array<any>;
    constructor(message: any, status?: number, errors?: Array<any>);
}
