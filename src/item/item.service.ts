import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItemDto } from 'src/dto';

interface CheckArg {
  item: ItemDto;
  orderId: string;
  userId: string;
  supply: boolean;
}
@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  private async check({ item, orderId, userId, supply }: CheckArg) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
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

    const product = await this.prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (supply) {
      if (!item.supply && !item.unitCost) {
        throw new BadRequestException('Invalid supply request');
      }

      return product;
    } else {
      return product;
    }
  }
  async order(item: ItemDto, orderId: string, userId: string) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      const product = await this.check({
        item,
        orderId,
        userId,
        supply: item.supply,
      });

      // Update order item quantity and total
      let orderItem = await prisma.orderItem.findFirst({
        where: {
          orderId: orderId,
          productId: item.productId,
          supply: false,
        },
        include: {
          product: true,
        },
      });

      let depletion = 0;
      if (orderItem) {
        const newTotal = item.quantity * product.price;
        depletion = item.quantity - orderItem.quantity;

        if (product.stock < depletion) {
          throw new BadRequestException('Not enough stock');
        }
        await prisma.orderItem.update({
          where: {
            id: orderItem.id,
          },
          data: {
            quantity: item.quantity,
            total: newTotal,
            unitCost: product.price,
          },
          include: {
            product: true,
          },
        });
      } else {
        // Create new order item
        depletion = item.quantity;
        await prisma.orderItem.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            supply: false,
            unitCost: product.price,
            orderId: orderId,
            total: item.quantity * product.price,
          },
          include: {
            product: true,
          },
        });
      }

      // Update product stock
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: product.stock - depletion },
      });
    });

    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        orderId: orderId,
        productId: item.productId,
        supply: false,
      },
      include: {
        product: true,
      },
    });

    return {
      message: 'Ordered item',
      data: orderItem,
    };
  }

  async supply(item: ItemDto, orderId: string, userId: string) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      await this.check({
        item,
        orderId,
        userId,
        supply: item.supply,
      });

      // Update order item quantity and total
      let orderItem;
      if (
        (orderItem = await prisma.orderItem.findFirst({
          where: {
            orderId: orderId,
            productId: item.productId,
            supply: true,
          },
          include: {
            product: true,
          },
        }))
      ) {
        const newTotal = item.quantity * orderItem.unitCost;
        await prisma.orderItem.update({
          where: {
            id: orderItem.id,
          },
          data: {
            quantity: item.quantity,
            total: newTotal,
          },
          include: {
            product: true,
          },
        });
      } else {
        // Create new order item
        await prisma.orderItem.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            supply: true,
            unitCost: item.unitCost,
            orderId: orderId,
            total: item.quantity * item.unitCost,
          },
          include: {
            product: true,
          },
        });
      }
    });

    const supplyItem = await this.prisma.orderItem.findFirst({
      where: {
        orderId: orderId,
        productId: item.productId,
        supply: true,
      },
      include: {
        product: true,
      },
    });

    return {
      message: 'Supplied item',
      data: supplyItem,
    };
  }

  async remove(orderId: string, productId: string, userId: string) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (userId !== order.userId.toString()) {
        throw new ForbiddenException('Unauthorized');
      }

      const orderItem = await prisma.orderItem.findFirst({
        where: {
          orderId: orderId,
          productId: productId,
        },
        include: {
          product: true,
        },
      });
      if (!orderItem) {
        throw new NotFoundException('Order item not found');
      }

      // Remove order item
      await prisma.orderItem.delete({
        where: {
          id: orderItem.id,
        },
      });

      // Update product stock
      await prisma.product.update({
        where: { id: productId },
        data: { stock: orderItem.product.stock + orderItem.quantity },
      });
    });

    return {
      message: 'Removed item',
      data: null,
    };
  }
}
