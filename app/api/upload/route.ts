import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define types for metadata
interface Metadata {
  image_path: string;
  category_name: string;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get('file') as Blob;
    const type = data.get('type') as string;

    if (!file || !type) {
      return NextResponse.json({ error: 'No file or type provided' }, { status: 400 });
    }

    // Define the upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate a file name and save the image
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Node.js Buffer
    const fileName = `${Date.now()}-${type}.png`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, new Uint8Array(buffer)); // Write the buffer directly as Uint8Array

    // Read the existing metadata file
    const metadataPath = path.join(uploadDir, 'metadata.json');
    let metadata: Metadata[] = [];
    try {
      const metadataFile = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(metadataFile);
    } catch (error) {
      console.log('Metadata file not found, creating new one');
    }

    // Append new data to metadata
    metadata.push({ image_path: fileName, category_name: type });

    // Save the updated metadata
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
