"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_swagger_decorator_1 = require("egg-swagger-decorator");
exports.default = (app, options) => {
    egg_swagger_decorator_1.wrapper(app, options);
};
