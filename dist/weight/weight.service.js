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
exports.WeightService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const weight_entity_1 = require("./entities/weight.entity");
let WeightService = class WeightService {
    weightRepository;
    constructor(weightRepository) {
        this.weightRepository = weightRepository;
    }
    create(createWeightDto) {
        const weight = this.weightRepository.create(createWeightDto);
        return this.weightRepository.save(weight);
    }
    findAll() {
        return this.weightRepository.find({
            order: { date: 'DESC', time: 'DESC' },
        });
    }
    async findOne(id) {
        const weight = await this.weightRepository.findOne({ where: { id } });
        if (!weight) {
            throw new common_1.NotFoundException(`Weight #${id} não encontrado`);
        }
        return weight;
    }
    async update(id, updateWeightDto) {
        const weight = await this.weightRepository.preload({
            id,
            ...updateWeightDto,
        });
        if (!weight) {
            throw new common_1.NotFoundException(`Weight #${id} não encontrado`);
        }
        return this.weightRepository.save(weight);
    }
    async remove(id) {
        const result = await this.weightRepository.delete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException(`Weight #${id} não encontrado`);
        }
    }
};
exports.WeightService = WeightService;
exports.WeightService = WeightService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(weight_entity_1.Weight)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WeightService);
//# sourceMappingURL=weight.service.js.map