import {
  Controller,
  Post,
  Get,
  HttpCode,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { OrderService } from './order.service';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

const context = new ExecutionContextHost([]);

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  request = context.switchToHttp().getRequest();
  @Post('create')
  @UseGuards(JwtGuard, new RoleGuard(0))
  @HttpCode(201)
  create() {
    const userId = this.request.user.id;
    return this.orderService.create(userId);
  }

  @Delete('action/:id')
  @UseGuards(JwtGuard, new RoleGuard(0))
  destroy(@Param('id') id: string) {
    return this.orderService.destroy(id);
  }
}
