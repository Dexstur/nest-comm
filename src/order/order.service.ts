import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
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

  async checkout(id: string, userId: string) {
    await this.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.findUnique({
        where: { id: id },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (order.completed) {
        throw new ConflictException('Order already completed');
      }

      if (userId !== order.userId.toString()) {
        throw new ForbiddenException('Unauthorized');
      }

      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: id,
        },
        include: {
          product: true,
        },
      });

      if (orderItems.length === 0) {
        throw new BadRequestException('Order is empty');
      }

      const supplies = orderItems.filter((item) => item.supply);

      const promises = supplies.map(async (item) => {
        return prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: item.product.stock + item.quantity,
          },
        });
      });

      await Promise.all(promises);

      await prisma.order.update({
        where: { id: id },
        data: { completed: true },
      });
    });

    const order = await this.prisma.order.findUnique({
      where: {
        id: id,
      },
      include: {
        orderItems: true,
      },
    });

    if (order.completed) {
      return {
        message: 'Order completed',
        data: order,
      };
    } else {
      throw new InternalServerErrorException('Failed to complete order');
    }
  }

  async view(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userId !== order.userId.toString()) {
      throw new ForbiddenException('Unauthorized');
    }

    return {
      message: 'Order retrieved',
      data: order,
    };
  }

  async adminView(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, completed: true },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order retrieved',
      data: order,
    };
  }
}
