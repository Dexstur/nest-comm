import { Module } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ProductController],
  providers: [ProductService, CloudinaryService, JwtService],
})
export class ProductModule {}
