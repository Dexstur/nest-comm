import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryDto } from 'src/dto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CategoryDto) {
    try {
      const category = await this.prisma.category.create({
        data: {
          name: data.name,
        },
      });
      return {
        message: 'Category created',
        data: category,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException('Category already exists');
        }
      } else {
        throw new Error(err.message);
      }
    }
  }

  async list() {
    try {
      const categories = await this.prisma.category.findMany();
      return {
        message: 'Categories retrieved',
        data: categories,
      };
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
  }

  async get(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: {
          id: id,
        },
        include: {
          products: true,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return {
        message: 'Category retrieved',
        data: category,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      console.error(err);
      throw new Error(err.message);
    }
  }

  async update(dto: CategoryDto, id: string) {
    try {
      const category = await this.prisma.category.update({
        where: {
          id: id,
        },
        data: {
          name: dto.name,
        },
      });
      return {
        message: 'Category updated',
        data: category,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException('Category already exists');
        }
      } else {
        throw new Error(err.message);
      }
    }
  }
}
