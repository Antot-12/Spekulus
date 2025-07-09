
import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, unlink, mkdir, rm } from 'fs/promises';
import { join } from 'path';

const UPLOADS_DIR = join(process.cwd(), 'public/uploads');

type FileInfo = {
  name: string;
  path: string;
  size: number;
  mtime: number;
  isDirectory: boolean;
  children?: FileInfo[];
};

async function getFilesRecursively(dir: string, relativePath: string = ''): Promise<FileInfo[]> {
  let dirents: any[];
  try {
    dirents = await readdir(dir, { withFileTypes: true });
  } catch(e: any) {
    if (e.code === 'ENOENT') {
      await mkdir(dir, { recursive: true });
      dirents = [];
    } else {
        throw e;
    }
  }

  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const fullPath = join(dir, dirent.name);
      const currentRelativePath = join(relativePath, dirent.name);
      const stats = await stat(fullPath);

      if (dirent.isDirectory()) {
        return {
          name: dirent.name,
          path: currentRelativePath,
          size: stats.size,
          mtime: stats.mtime.getTime(),
          isDirectory: true,
          children: await getFilesRecursively(fullPath, currentRelativePath),
        };
      } else {
        return {
          name: dirent.name,
          path: currentRelativePath,
          size: stats.size,
          mtime: stats.mtime.getTime(),
          isDirectory: false,
        };
      }
    })
  );
  return files.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export async function GET(request: NextRequest) {
  try {
    const files = await getFilesRecursively(UPLOADS_DIR);
    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return NextResponse.json({ success: false, error: 'Failed to read uploads directory.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, folderName } = body;

    if (!folderName || typeof folderName !== 'string' || folderName.includes('/') || folderName.includes('\\') || folderName === '..') {
      return NextResponse.json({ success: false, error: 'Invalid folder name.' }, { status: 400 });
    }

    const currentDirectory = join(UPLOADS_DIR, path || '');
    if (!currentDirectory.startsWith(UPLOADS_DIR)) {
      return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
    }

    const newFolderPath = join(currentDirectory, folderName);
    
    await mkdir(newFolderPath);
    
    return NextResponse.json({ success: true, message: `Folder '${folderName}' created.` });
  } catch (error: any) {
    if (error.code === 'EEXIST') {
      return NextResponse.json({ success: false, error: 'A folder with that name already exists.' }, { status: 409 });
    }
    console.error('Error creating directory:', error);
    return NextResponse.json({ success: false, error: 'Failed to create directory.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: relativePath, isDirectory } = body;

    if (!relativePath || typeof relativePath !== 'string') {
      return NextResponse.json({ success: false, error: 'File or folder path is required.' }, { status: 400 });
    }
    
    const finalPath = join(UPLOADS_DIR, relativePath);
    
    if (!finalPath.startsWith(UPLOADS_DIR)) {
        return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
    }

    if (isDirectory) {
        await rm(finalPath, { recursive: true, force: true });
    } else {
        await unlink(finalPath);
    }
    
    return NextResponse.json({ success: true, message: 'Item deleted successfully.' });

  } catch (error: any) {
    console.error('Error deleting item:', error);
    if(error.code === 'ENOENT'){
      return NextResponse.json({ success: false, error: 'Item not found. It may have already been deleted.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete item.' }, { status: 500 });
  }
}
