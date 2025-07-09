
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat } from 'fs/promises';
import { join } from 'path';

async function directoryExists(path: string) {
    try {
        await stat(path);
        return true;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const subdirectoryParam: string | null = data.get('subdirectory') as string | null;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Sanitize subdirectory to prevent path traversal attacks.
  const safeSubdirectory = subdirectoryParam ? join(...subdirectoryParam.split(/[/\\]/).filter(p => p && p !== '..')) : null;

  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const uploadDir = join(process.cwd(), 'public/uploads');
  const finalUploadDir = safeSubdirectory ? join(uploadDir, safeSubdirectory) : uploadDir;
  
  const path = join(finalUploadDir, filename);
  
  try {
    if (!(await directoryExists(finalUploadDir))) {
        await mkdir(finalUploadDir, { recursive: true });
    }
    
    await writeFile(path, buffer);
    const fileUrl = safeSubdirectory ? `/uploads/${safeSubdirectory}/${filename}` : `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file.' }, { status: 500 });
  }
}
