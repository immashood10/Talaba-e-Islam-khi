import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { isAdminRequest } from '@/lib/auth';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const UPLOAD_KINDS = {
  image: {
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5 * 1024 * 1024,
    typeError: 'Only JPG, PNG, WEBP or GIF images are allowed',
    sizeError: 'File must be smaller than 5MB',
  },
  document: {
    types: ['application/pdf'],
    maxSize: 5 * 1024 * 1024,
    typeError: 'Only PDF files are allowed',
    sizeError: 'File must be smaller than 5MB',
  },
  video: {
    types: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSize: 50 * 1024 * 1024,
    typeError: 'Only MP4, WEBM or MOV videos are allowed',
    sizeError: 'Video must be smaller than 50MB',
  },
} as const;

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  const kindParam = formData?.get('kind');
  const kind = kindParam === 'document' || kindParam === 'video' ? kindParam : 'image';
  const { types: allowedTypes, maxSize, typeError, sizeError } = UPLOAD_KINDS[kind];

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Please choose a file to upload' }, { status: 400 });
  }
  if (!(allowedTypes as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: typeError }, { status: 400 });
  }
  if (file.size > maxSize) {
    return NextResponse.json({ error: sizeError }, { status: 400 });
  }

  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

  const extension = path.extname(file.name) || `.${file.type.split('/')[1]}`;
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}`, originalName: file.name }, { status: 201 });
}
