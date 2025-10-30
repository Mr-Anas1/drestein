import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine resource type based on MIME or filename
        const mime = file.type || '';
        const name = typeof file.name === 'string' ? file.name : '';
        const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
        const isImage = mime.startsWith('image/');
        const isDoc = ['pdf', 'ppt', 'pptx'].includes(ext) ||
                      ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(mime);

        const uploadOptions = isImage
          ? {
              resource_type: 'image',
              folder: 'drestein-events',
              transformation: [
                { width: 800, height: 600, crop: 'fill' },
                { quality: 'auto' },
                { format: 'auto' }
              ]
            }
          : {
              resource_type: 'raw',
              folder: 'drestein-files',
              use_filename: true,
              unique_filename: true,
              overwrite: false,
            };

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        const responsePayload = {
          url: result.secure_url,
          public_id: result.public_id,
        };
        if (isImage) {
          responsePayload.width = result.width;
          responsePayload.height = result.height;
        }

        return NextResponse.json(responsePayload);

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
          { error: 'Upload failed', details: error.message },
          { status: 500 }
        );
    }
}
