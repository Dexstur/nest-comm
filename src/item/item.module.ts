import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ItemController],
  providers: [ItemService, JwtService],
})
export class ItemModule {}
