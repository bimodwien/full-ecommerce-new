import { Request, Response, NextFunction } from 'express';
import ProductService from '@/services/product.service';
import ProductBusinessService from '@/services/product.business.service';

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getAllProducts(req);
      res.status(200).json({ message: 'Get products success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getProductsByCategory(req);
      res
        .status(200)
        .json({ message: 'Get products by category success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductBusinessService.createProduct(req);
      res.status(201).json({ message: 'create product success', product });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductBusinessService.updateProduct(req);
      res.status(200).json({ message: 'update product success', product });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductBusinessService.deleteProduct(req);
      res.status(200).json({ message: 'delete product success', product });
    } catch (error) {
      next(error);
    }
  }

  async render(req: Request, res: Response, next: NextFunction) {
    try {
      const { buffer, updatedAt, contentType } =
        await ProductService.render(req);
      const etag = `"${updatedAt.getTime()}"`;
      res.setHeader('ETag', etag);
      res.setHeader('Last-Modified', updatedAt.toUTCString());
      res.setHeader(
        'Cache-Control',
        'public, max-age=3600, stale-while-revalidate=86400',
      );
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }
      res.setHeader('Content-Type', contentType || 'image/png');
      res.status(200).send(Buffer.from(buffer));
    } catch (error) {
      next(error);
    }
  }
}
