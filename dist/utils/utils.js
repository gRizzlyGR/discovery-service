"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNumber = void 0;
const parseNumber = (raw, defaultValue) => {
    const parsed = Number(raw);
    if (isNaN(parsed)) {
        return defaultValue;
    }
    return parsed;
};
exports.parseNumber = parseNumber;
