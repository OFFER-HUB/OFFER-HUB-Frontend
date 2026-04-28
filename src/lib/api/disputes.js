"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDisputes = listDisputes;
exports.getDisputeById = getDisputeById;
exports.cancelDispute = cancelDispute;
var api_1 = require("@/config/api");
function listDisputes(token, filters) {
    return __awaiter(this, void 0, void 0, function () {
        var query, response, error, responseData, paginatedResult;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    query = new URLSearchParams();
                    if (filters === null || filters === void 0 ? void 0 : filters.status)
                        query.append("status", filters.status);
                    if (filters === null || filters === void 0 ? void 0 : filters.page)
                        query.append("page", String(filters.page));
                    if (filters === null || filters === void 0 ? void 0 : filters.limit)
                        query.append("limit", String(filters.limit));
                    return [4 /*yield*/, fetch("".concat(api_1.API_URL, "/disputes?").concat(query.toString()), {
                            headers: { Authorization: "Bearer ".concat(token !== null && token !== void 0 ? token : "") },
                        })];
                case 1:
                    response = _c.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    error = _c.sent();
                    throw new Error(((_a = error.error) === null || _a === void 0 ? void 0 : _a.message) || "Failed to fetch disputes");
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    responseData = _c.sent();
                    paginatedResult = responseData.data;
                    return [2 /*return*/, {
                            data: (paginatedResult === null || paginatedResult === void 0 ? void 0 : paginatedResult.data) || [],
                            hasMore: (_b = paginatedResult === null || paginatedResult === void 0 ? void 0 : paginatedResult.hasMore) !== null && _b !== void 0 ? _b : false,
                        }];
            }
        });
    });
}
function getDisputeById(token, disputeId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error, data;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("".concat(api_1.API_URL, "/disputes/").concat(disputeId), {
                        headers: { Authorization: "Bearer ".concat(token !== null && token !== void 0 ? token : "") },
                    })];
                case 1:
                    response = _b.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    error = _b.sent();
                    throw new Error(((_a = error.error) === null || _a === void 0 ? void 0 : _a.message) || "Failed to fetch dispute");
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _b.sent();
                    return [2 /*return*/, data.data || data];
            }
        });
    });
}
function cancelDispute(token, disputeId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error, data;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("".concat(api_1.API_URL, "/disputes/").concat(disputeId, "/cancel"), {
                        method: "POST",
                        headers: { Authorization: "Bearer ".concat(token !== null && token !== void 0 ? token : "") },
                    })];
                case 1:
                    response = _b.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    error = _b.sent();
                    throw new Error(((_a = error.error) === null || _a === void 0 ? void 0 : _a.message) || "Failed to cancel dispute");
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _b.sent();
                    return [2 /*return*/, data.data || data];
            }
        });
    });
}
