import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamify from 'streamifier';

@Injectable()
export class CloudinaryService {
  async UploadImage(image: Express.Multer.File) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      if (!image || !image.buffer) {
        reject(new Error('No image provided'));
        return;
      }

      const upStream = cloudinary.uploader.upload_stream((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result as UploadApiResponse);
      });

      streamify.createReadStream(image.buffer).pipe(upStream);
    });
  }
}
