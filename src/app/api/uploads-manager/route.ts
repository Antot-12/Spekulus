
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Note: No need for dotenv.config(). Next.js handles .env files.
// The custom `env.txt` is loaded by the hosting platform's build process.

// This helper function ensures Cloudinary is configured for every API call.
const configureCloudinary = () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary credentials are not configured in environment variables.');
    }
    
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });
};

export async function GET(request: NextRequest) {
  try {
    configureCloudinary();
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || 'spekulus';

    // Fetch all resources (files)
    const resourcesResponse = await cloudinary.api.resources({
      type: 'upload',
      prefix: path,
      max_results: 500
    });

    // Fetch all subfolders
    const subfoldersResponse = await cloudinary.api.sub_folders(path);
    
    const files = resourcesResponse.resources.map((file: any) => ({
      ...file,
      isDirectory: false,
      name: file.public_id.split('/').pop(),
      path: file.public_id,
    }));

    const folders = subfoldersResponse.folders.map((folder: any) => ({
      ...folder,
      isDirectory: true,
      bytes: 0,
      created_at: new Date().toISOString(),
      asset_id: folder.path
    }));

    const combined = [...folders, ...files]
      .filter(item => {
          const itemPath = item.path.endsWith('/') ? item.path.slice(0, -1) : item.path;
          const directParent = itemPath.substring(0, itemPath.lastIndexOf('/'));
          const requestedPath = path.endsWith('/') ? path.slice(0, -1) : path;
          // Handle root case where directParent would be empty string
          if (requestedPath === 'spekulus' && !directParent.includes('/')) {
            return true;
          }
          return directParent === requestedPath;
      });

    return NextResponse.json({ success: true, files: combined });
  } catch (error: any) {
    console.error('Error fetching Cloudinary resources:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch files.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    configureCloudinary();
    const body = await request.json();
    const { path, folderName } = body;

    if (!folderName || typeof folderName !== 'string' || folderName.includes('/') || folderName.includes('\\') || folderName === '..') {
      return NextResponse.json({ success: false, error: 'Invalid folder name.' }, { status: 400 });
    }

    const newFolderPath = path ? `${path}/${folderName}` : folderName;

    await cloudinary.api.create_folder(newFolderPath);
    
    return NextResponse.json({ success: true, message: `Folder '${folderName}' created.` });
  } catch (error: any) {
    console.error('Error creating Cloudinary folder:', error);
     if (error.http_code === 409) {
      return NextResponse.json({ success: false, error: 'A folder with that name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create directory.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    configureCloudinary();
    const body = await request.json();
    const { public_id, resource_type } = body;

    if (!public_id) {
      return NextResponse.json({ success: false, error: 'File public_id is required.' }, { status: 400 });
    }
    
    if (resource_type === 'folder') {
        // Note: delete_folder also deletes all contents.
        await cloudinary.api.delete_folder(public_id);
    } else {
        await cloudinary.uploader.destroy(public_id, {
          resource_type: resource_type || 'image'
        });
    }
    
    return NextResponse.json({ success: true, message: 'Item deleted successfully.' });

  } catch (error: any) {
    console.error('Error deleting Cloudinary item:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete item.' }, { status: 500 });
  }
}
