import {
  Module,
  Logger,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {} from '@nestjs/platform-express';
import * as cors from 'cors';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { JwtStrategy } from './auth/strategy';
import { JwtGuard } from './auth/guards/auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { v2 as cloudinary } from 'cloudinary';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { ItemModule } from './item/item.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    PrismaModule,
    AuthModule,
    CategoryModule,
    CloudinaryModule,
    ProductModule,
    OrderModule,
    ItemModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger, JwtGuard, JwtService],
})
export class AppModule {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_KEY,
      api_secret: process.env.CLOUD_SECRET,
    });
  }
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(cors({ origin: '*' }))
  //     .forRoutes({ path: '*', method: RequestMethod.ALL });
  // }
}
