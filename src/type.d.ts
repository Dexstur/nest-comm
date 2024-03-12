// types.ts

import { Express, Request } from 'express';

export type File = Express.Multer.File;

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        authority: number;
      };
    }
  }
}
