import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const newOrder = await this.prisma.order.create({
        data: {
          userId: userId,
          completed: false,
        },
      });
      return {
        message: 'Order created',
        data: newOrder,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else {
        throw new Error(err.message);
      }
    }
  }

  async destroy(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          id: id,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.completed) {
        throw new ForbiddenException('Order already completed');
      }

      await this.prisma.orderItem.deleteMany({
        where: {
          orderId: id,
        },
      });

      await this.prisma.order.delete({
        where: {
          id: id,
        },
      });

      return {
        message: 'Order deleted',
        data: null,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ForbiddenException) {
        throw new ForbiddenException(err.message);
      } else {
        throw new Error(err.message);
      }
    }
  }
}
