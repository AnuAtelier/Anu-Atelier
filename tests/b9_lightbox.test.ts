import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_PRODUCTS } from '../src/constants';

describe('Craft Gallery and Image Assets Integrity', () => {
  it('every initial product has accessible images in the public directory or valid remote URLs', () => {
    const publicDir = path.resolve(__dirname, '../public');

    for (const product of INITIAL_PRODUCTS) {
      const allImages = [
        product.image,
        ...(product.images || []),
      ];

      for (const imgUrl of allImages) {
        if (!imgUrl) continue;
        if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
          expect(imgUrl).toMatch(/^https?:\/\//);
        } else if (imgUrl.startsWith('/')) {
          const filePath = path.join(publicDir, imgUrl.slice(1));
          const exists = fs.existsSync(filePath);
          expect(
            exists,
            `Expected public file to exist for product "${product.name}": ${filePath}`
          ).toBe(true);
        }
      }
    }
  });

  it('verifies baby ganesha craft has valid local images in public directory', () => {
    const ganeshaProd = INITIAL_PRODUCTS.find((p) => p.id === 'prod_13');
    expect(ganeshaProd).toBeDefined();
    expect(ganeshaProd?.images?.length).toBeGreaterThanOrEqual(1);

    const publicDir = path.resolve(__dirname, '../public');
    for (const img of ganeshaProd?.images || []) {
      if (img.startsWith('/')) {
        const filePath = path.join(publicDir, img.slice(1));
        expect(fs.existsSync(filePath), `Missing image file: ${filePath}`).toBe(true);
      }
    }
  });
});
