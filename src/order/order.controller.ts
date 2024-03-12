import {
  Controller,
  Post,
  Get,
  Put,
  HttpCode,
  UseGuards,
  Param,
  Delete,
  Req,
  ExecutionContext,
  Query,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { OrderService } from './order.service';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Request } from 'express';

// const context = new ExecutionContextHost([]);

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('create')
  @UseGuards(JwtGuard, new RoleGuard(0))
  @HttpCode(201)
  create(@Req() request: Request) {
    const userId = request.user.id;
    return this.orderService.create(userId);
  }

  @Delete('action/:id')
  @UseGuards(JwtGuard, new RoleGuard(0))
  destroy(@Param('id') id: string) {
    return this.orderService.destroy(id);
  }

  @Put('checkout/:id')
  @UseGuards(JwtGuard, new RoleGuard(0))
  checkout(@Param('id') id: string, @Req() request: Request) {
    const userId = request.user.id;
    return this.orderService.checkout(id, userId);
  }

  @Get('view')
  @UseGuards(JwtGuard, new RoleGuard(0))
  view(@Req() request: Request, @Query('id') id: string) {
    const userId = request.user.id;
    return this.orderService.view(id, userId);
  }

  @Get('admin/view')
  @UseGuards(JwtGuard, new RoleGuard(2))
  adminView(@Req() request: Request, @Query('id') id: string) {
    const userId = request.user.id;
    return this.orderService.adminView(id);
  }
}
