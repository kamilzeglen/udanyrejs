"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
var typeorm_1 = require("typeorm");
var company_1 = require("../../interfaces/company");
var Offer = function () {
    var _classDecorators = [(0, typeorm_1.Entity)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _startDate_decorators;
    var _startDate_initializers = [];
    var _startDate_extraInitializers = [];
    var _endDate_decorators;
    var _endDate_initializers = [];
    var _endDate_extraInitializers = [];
    var _shipName_decorators;
    var _shipName_initializers = [];
    var _shipName_extraInitializers = [];
    var _pdfPath_decorators;
    var _pdfPath_initializers = [];
    var _pdfPath_extraInitializers = [];
    var _imagePath_decorators;
    var _imagePath_initializers = [];
    var _imagePath_extraInitializers = [];
    var _company_decorators;
    var _company_initializers = [];
    var _company_extraInitializers = [];
    var _price_decorators;
    var _price_initializers = [];
    var _price_extraInitializers = [];
    var Offer = _classThis = /** @class */ (function () {
        function Offer_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.startDate = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
            this.endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
            this.shipName = (__runInitializers(this, _endDate_extraInitializers), __runInitializers(this, _shipName_initializers, void 0));
            this.pdfPath = (__runInitializers(this, _shipName_extraInitializers), __runInitializers(this, _pdfPath_initializers, void 0));
            this.imagePath = (__runInitializers(this, _pdfPath_extraInitializers), __runInitializers(this, _imagePath_initializers, void 0));
            this.company = (__runInitializers(this, _imagePath_extraInitializers), __runInitializers(this, _company_initializers, void 0));
            this.price = (__runInitializers(this, _company_extraInitializers), __runInitializers(this, _price_initializers, void 0));
            __runInitializers(this, _price_extraInitializers);
        }
        return Offer_1;
    }());
    __setFunctionName(_classThis, "Offer");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _name_decorators = [(0, typeorm_1.Column)()];
        _startDate_decorators = [(0, typeorm_1.Column)({ type: 'date' })];
        _endDate_decorators = [(0, typeorm_1.Column)({ type: 'date' })];
        _shipName_decorators = [(0, typeorm_1.Column)()];
        _pdfPath_decorators = [(0, typeorm_1.Column)()];
        _imagePath_decorators = [(0, typeorm_1.Column)()];
        _company_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: company_1.Company,
            })];
        _price_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: function (obj) { return "startDate" in obj; }, get: function (obj) { return obj.startDate; }, set: function (obj, value) { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
        __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: function (obj) { return "endDate" in obj; }, get: function (obj) { return obj.endDate; }, set: function (obj, value) { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
        __esDecorate(null, null, _shipName_decorators, { kind: "field", name: "shipName", static: false, private: false, access: { has: function (obj) { return "shipName" in obj; }, get: function (obj) { return obj.shipName; }, set: function (obj, value) { obj.shipName = value; } }, metadata: _metadata }, _shipName_initializers, _shipName_extraInitializers);
        __esDecorate(null, null, _pdfPath_decorators, { kind: "field", name: "pdfPath", static: false, private: false, access: { has: function (obj) { return "pdfPath" in obj; }, get: function (obj) { return obj.pdfPath; }, set: function (obj, value) { obj.pdfPath = value; } }, metadata: _metadata }, _pdfPath_initializers, _pdfPath_extraInitializers);
        __esDecorate(null, null, _imagePath_decorators, { kind: "field", name: "imagePath", static: false, private: false, access: { has: function (obj) { return "imagePath" in obj; }, get: function (obj) { return obj.imagePath; }, set: function (obj, value) { obj.imagePath = value; } }, metadata: _metadata }, _imagePath_initializers, _imagePath_extraInitializers);
        __esDecorate(null, null, _company_decorators, { kind: "field", name: "company", static: false, private: false, access: { has: function (obj) { return "company" in obj; }, get: function (obj) { return obj.company; }, set: function (obj, value) { obj.company = value; } }, metadata: _metadata }, _company_initializers, _company_extraInitializers);
        __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: function (obj) { return "price" in obj; }, get: function (obj) { return obj.price; }, set: function (obj, value) { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Offer = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Offer = _classThis;
}();
exports.Offer = Offer;
