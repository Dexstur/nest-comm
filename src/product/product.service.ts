import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductDto } from 'src/dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(dto: ProductDto, img: Express.Multer.File, id: string) {
    try {
      const image = await this.cloudinary.UploadImage(img);
      const category = await this.prisma.category.findUnique({
        where: {
          id: id,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          price: Number(dto.price),
          stock: Number(dto.stock),
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
      } else {
        throw new Error(err.message);
      }
    }
  }
}
