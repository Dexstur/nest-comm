import { Module, ExecutionContext } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

@Module({
  controllers: [OrderController],
  providers: [OrderService, JwtService],
})
export class OrderModule {}
