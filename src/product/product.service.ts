import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductDto, UpdateProductDto } from 'src/dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(dto: ProductDto, img: Express.Multer.File, id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: {
          id: id,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const existing = await this.prisma.product.findFirst({
        where: {
          name: dto.name,
          categoryId: id,
        },
      });

      if (existing) {
        throw new ConflictException('Product already exists');
      }
      const image = await this.cloudinary.UploadImage(img);
      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          price: Number(dto.price),
          stock: 0,
          image: image.secure_url,
          categoryId: id,
        },
      });

      return {
        message: 'Product created',
        data: product,
      };
    } catch (err) {
      console.log(err);
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      } else {
        throw new Error(err.message);
      }
    }
  }

  async listByCategory(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: {
          id: id,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const products = await this.prisma.product.findMany({
        where: {
          categoryId: id,
        },
      });

      return {
        message: 'Products found',
        data: products,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else {
        throw new Error(err.message);
      }
    }
  }

  async update(dto: UpdateProductDto, id: string, img?: Express.Multer.File) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const image = img ? await this.cloudinary.UploadImage(img) : null;

    for (const field in dto) {
      if (!dto[field]) {
        delete dto[field];
      }
    }

    const updated = image
      ? await this.prisma.product.update({
          where: { id },
          data: {
            ...dto,
            image: image.secure_url,
          },
        })
      : await this.prisma.product.update({
          where: { id },
          data: {
            ...dto,
          },
        });

    return {
      message: 'Product updated',
      data: updated,
    };
  }
}
