"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Weight = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const decimal_transformer_1 = require("../../common/transformers/decimal.transformer");
let Weight = class Weight {
    id;
    value;
    date;
    time;
    createdAt;
    updatedAt;
    creatorId;
};
exports.Weight = Weight;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Weight.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 6,
        scale: 2,
        nullable: false,
        transformer: decimal_transformer_1.decimalTransformer,
    }),
    (0, swagger_1.ApiProperty)({ example: 81.55 }),
    __metadata("design:type", Number)
], Weight.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-22' }),
    (0, typeorm_1.Column)({ type: 'date', nullable: false }),
    __metadata("design:type", String)
], Weight.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '08:30:00', nullable: true }),
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", Object)
], Weight.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Weight.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Weight.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, nullable: true }),
    (0, typeorm_1.Column)({ name: 'creator_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Weight.prototype, "creatorId", void 0);
exports.Weight = Weight = __decorate([
    (0, typeorm_1.Entity)('weight')
], Weight);
//# sourceMappingURL=weight.entity.js.map