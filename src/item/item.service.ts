import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItemDto } from 'src/dto';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async add(item: ItemDto, orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userId !== order.userId.toString()) {
      throw new ForbiddenException('Unauthorized');
    }

    const product = await this.prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!item.supply && product.stock < item.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const existing = await this.prisma.orderItem.findFirst({
      where: {
        orderId: orderId,
        productId: item.productId,
        supply: item.supply,
      },
      include: {
        product: true,
      },
    });

    if (existing) {
    }
  }
}
