import {
  Body,
  Controller,
  Post,
  HttpCode,
  UseGuards,
  Get,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { ProductDto } from 'src/dto';
import { ProductService } from './product.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('create/:id')
  @UseGuards(JwtGuard, new RoleGuard(2))
  @UseInterceptors(FileInterceptor('img'))
  @HttpCode(201)
  create(
    @Body() dto: ProductDto,
    @Param('id') id: string,
    @UploadedFile() img: Express.Multer.File,
  ) {
    return this.productService.create(dto, img, id);
  }

  @Get('category')
  categoryList(@Query('id') id: string) {
    return this.productService.listByCategory(id);
  }
}
