import {
  Body,
  Controller,
  Post,
  HttpCode,
  Delete,
  UseGuards,
  Get,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { ItemDto, RemoveItemDto } from 'src/dto';
import { ItemService } from './item.service';
import { Request } from 'express';

@Controller('item')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Post('supply/:id')
  @UseGuards(JwtGuard, new RoleGuard(2))
  supply(
    @Body() dto: ItemDto,
    @Param('id') orderId: string,
    @Req() request: Request,
  ) {
    const userId = request.user.id;
    return this.itemService.supply(dto, orderId, userId);
  }

  @Post('order/:id')
  @UseGuards(JwtGuard, new RoleGuard(0))
  order(
    @Body() dto: ItemDto,
    @Param('id') orderId: string,
    @Req() request: Request,
  ) {
    const userId = request.user.id;
    return this.itemService.order(dto, orderId, userId);
  }

  @Delete('action/:id')
  @UseGuards(JwtGuard, new RoleGuard(0))
  remove(
    @Param('id') id: string,
    @Body() dto: RemoveItemDto,
    @Req() request: Request,
  ) {
    const userId = request.user.id;
    return this.itemService.remove(id, dto.id, userId);
  }
}
