import { Request } from 'express';
import sharp from 'sharp';
import { Prisma } from '@prisma/client';
import AppError from '@/libs/appError';

export type ImageInput = { data: Buffer; isPrimary?: boolean };
export type VariantsCreate = Prisma.ProductCreateInput['Variants'] | undefined;

export function getUploadedFiles(req: Request) {
  return (
    (req.files as Express.Multer.File[] | undefined) ??
    (req.file ? [req.file as Express.Multer.File] : undefined)
  );
}

// Converts every upload to PNG. On create the first image becomes primary.
export async function processImages(
  files: Express.Multer.File[] | undefined,
  firstIsPrimary: boolean,
) {
  const imagesCreate: ImageInput[] = [];
  for (let i = 0; i < (files?.length ?? 0); i++) {
    const f = files![i];
    let inputBuffer: Buffer | undefined = f.buffer;
    if (!inputBuffer && f.path) {
      const fs = await import('fs');
      inputBuffer = fs.readFileSync(f.path as string);
    }
    if (!inputBuffer)
      throw new AppError('Uploaded file buffer not available', 400);
    const processed = await sharp(inputBuffer).png().toBuffer();
    imagesCreate.push({
      data: processed,
      isPrimary: firstIsPrimary && i === 0,
    });
  }
  return imagesCreate;
}

export function parseVariantsCreate(variant: unknown): VariantsCreate {
  let variantsCreate: VariantsCreate = undefined;
  if (variant) {
    try {
      const parsed =
        typeof variant === 'string' ? JSON.parse(variant) : variant;
      if (Array.isArray(parsed) && parsed.length > 0) {
        variantsCreate = {
          create: parsed.map((v: any) => ({
            variant: String(v.variant ?? v.name ?? ''),
            stock: Number(v.stock ?? 0),
          })),
        };
      }
    } catch (err) {
      throw new AppError('Invalid variant format; expected JSON array', 400);
    }
  }

  // validate duplicates in variantsCreate payload (if any)
  if (variantsCreate && Array.isArray(variantsCreate.create)) {
    const names = (variantsCreate.create as any[]).map((x) =>
      String(x.variant).trim(),
    );
    const dup = names.find((n, i) => names.indexOf(n) !== i);
    if (dup)
      throw new AppError(`Duplicate variant name in payload: ${dup}`, 400);
  }
  return variantsCreate;
}

// Multipart bodies send arrays as JSON strings; JSON bodies send them as-is.
export function parseJsonField<T>(raw: unknown, message: string) {
  if (!raw) return undefined;
  try {
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as T;
  } catch (err) {
    throw new AppError(message, 400);
  }
}

export async function assertCategoryExists(
  tx: Prisma.TransactionClient,
  categoryId: unknown,
) {
  if (!categoryId) return;
  const category = await tx.category.findUnique({
    where: { id: String(categoryId) },
  });
  if (!category) throw new AppError('Category not found', 404);
}
