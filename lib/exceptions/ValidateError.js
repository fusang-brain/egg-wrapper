"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = __importDefault(require("./BaseError"));
class ValidateError extends BaseError_1.default {
    constructor(errors) {
        super('参数错误', 422, errors);
    }
}
exports.default = ValidateError;
;
