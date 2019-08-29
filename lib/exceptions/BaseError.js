"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseError extends Error {
    constructor(message, status = 200, errors) {
        super(message);
        // status = 
        this.status = 200;
        // this.status = status;
        this.status = status;
        this.errors = errors || [];
    }
}
exports.default = BaseError;
;
