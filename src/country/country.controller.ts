import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CountryService } from './country.service';
import { CountryListResponseDto } from './dto/country-list-response.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';

@ApiTags('country')
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um país' })
  @ApiOkResponse({ type: Country })
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os países' })
  @ApiOkResponse({ type: CountryListResponseDto })
  findAll() {
    return this.countryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um país por id' })
  @ApiOkResponse({ type: Country })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.countryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um país' })
  @ApiOkResponse({ type: Country })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.countryService.update(id, updateCountryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um país' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.countryService.remove(id);
  }
}
