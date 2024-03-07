import {
  Body,
  Controller,
  Post,
  HttpCode,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from 'src/dto';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('create')
  @UseGuards(JwtGuard, new RoleGuard(2))
  @HttpCode(201)
  create(@Body() dto: CategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get('list')
  list() {
    return this.categoryService.list();
  }

  @Get('detail')
  get(@Query('id') id: string) {
    return this.categoryService.get(id);
  }
}
