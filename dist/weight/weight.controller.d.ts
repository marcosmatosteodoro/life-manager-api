import { CreateWeightDto } from './dto/create-weight.dto';
import { UpdateWeightDto } from './dto/update-weight.dto';
import { WeightListResponseDto } from './dto/weight-list-response.dto';
import { Weight } from './entities/weight.entity';
import { WeightService } from './weight.service';
export declare class WeightController {
    private readonly weightService;
    constructor(weightService: WeightService);
    create(createWeightDto: CreateWeightDto): Promise<Weight>;
    findAll(): Promise<WeightListResponseDto>;
    findOne(id: number): Promise<Weight>;
    update(id: number, updateWeightDto: UpdateWeightDto): Promise<Weight>;
    remove(id: number): Promise<void>;
}
