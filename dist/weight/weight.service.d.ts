import { Repository } from 'typeorm';
import { CreateWeightDto } from './dto/create-weight.dto';
import { UpdateWeightDto } from './dto/update-weight.dto';
import { Weight } from './entities/weight.entity';
export declare class WeightService {
    private readonly weightRepository;
    constructor(weightRepository: Repository<Weight>);
    create(createWeightDto: CreateWeightDto): Promise<Weight>;
    findAll(): Promise<Weight[]>;
    findOne(id: number): Promise<Weight>;
    update(id: number, updateWeightDto: UpdateWeightDto): Promise<Weight>;
    remove(id: number): Promise<void>;
}
