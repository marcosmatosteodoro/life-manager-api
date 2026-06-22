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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeightController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_weight_dto_1 = require("./dto/create-weight.dto");
const update_weight_dto_1 = require("./dto/update-weight.dto");
const weight_entity_1 = require("./entities/weight.entity");
const weight_service_1 = require("./weight.service");
let WeightController = class WeightController {
    weightService;
    constructor(weightService) {
        this.weightService = weightService;
    }
    create(createWeightDto) {
        return this.weightService.create(createWeightDto);
    }
    findAll() {
        return this.weightService.findAll();
    }
    findOne(id) {
        return this.weightService.findOne(id);
    }
    update(id, updateWeightDto) {
        return this.weightService.update(id, updateWeightDto);
    }
    remove(id) {
        return this.weightService.remove(id);
    }
};
exports.WeightController = WeightController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cria um registro de peso' }),
    (0, swagger_1.ApiOkResponse)({ type: weight_entity_1.Weight }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_weight_dto_1.CreateWeightDto]),
    __metadata("design:returntype", void 0)
], WeightController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista os registros de peso' }),
    (0, swagger_1.ApiOkResponse)({ type: weight_entity_1.Weight, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WeightController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Busca um registro de peso por id' }),
    (0, swagger_1.ApiOkResponse)({ type: weight_entity_1.Weight }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Registro não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WeightController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza parcialmente um registro de peso' }),
    (0, swagger_1.ApiOkResponse)({ type: weight_entity_1.Weight }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Registro não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_weight_dto_1.UpdateWeightDto]),
    __metadata("design:returntype", void 0)
], WeightController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove um registro de peso' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Removido com sucesso' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Registro não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WeightController.prototype, "remove", null);
exports.WeightController = WeightController = __decorate([
    (0, swagger_1.ApiTags)('weight'),
    (0, common_1.Controller)('weight'),
    __metadata("design:paramtypes", [weight_service_1.WeightService])
], WeightController);
//# sourceMappingURL=weight.controller.js.map