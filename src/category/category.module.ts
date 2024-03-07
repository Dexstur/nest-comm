import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from 'src/auth/guards/auth.guard';

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [CategoryService, JwtService, JwtGuard],
})
export class CategoryModule {}
