import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
