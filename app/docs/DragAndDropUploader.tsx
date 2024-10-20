// components/DragAndDropUploader.tsx
"use client"; 
import React, { useState, DragEvent, ChangeEvent } from 'react';
import { Card, Image } from '@nextui-org/react';

interface ImageFile extends File {
  preview?: string;
}

const DragAndDropUploader: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/')) as ImageFile[];
    imageFiles.forEach(file => (file.preview = URL.createObjectURL(file)));
    setImages(prevImages => [...prevImages, ...imageFiles]);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/')) as ImageFile[];
    imageFiles.forEach(file => (file.preview = URL.createObjectURL(file)));
    setImages(prevImages => [...prevImages, ...imageFiles]);
  };

  return (
    <div className='min-h-screen'>
      <div className='border-2 border-dashed rounded-md text-center'>
        <p>Blank</p>
      </div>
    </div>
    // <div>
    //   <div
    //     className="p-20 border-2 border-dashed border-gray-300 text-center cursor-pointer mb-5 rounded-md"
    //     onDrop={handleDrop}
    //     onDragOver={handleDragOver}
    //   >
    //     <input
    //       type="file"
    //       multiple
    //       accept="image/*"
    //       className="hidden"
    //       id="file-upload"
    //       onChange={handleFileSelect}
    //     />
    //     <label htmlFor="file-upload" className="cursor-pointer">
    //       <span className="text-gray-500">Drag & Drop images here, or click to upload</span>
    //     </label>
    //   </div>

    //   {images.length > 0 && (
    //     <div>
    //       <span className="text-lg font-semibold">Uploaded Images:</span>
    //       <div className="flex flex-wrap gap-4 mt-4">
    //         {images.map((image, index) => (
    //           <div key={index} className="p-2 border">
    //             <Image
    //               src={image.preview}
    //               alt={image.name}
    //               width={100}
    //               height={100}
    //               className="object-cover"
    //             />
    //             <span className="block text-sm text-gray-500 mt-2">{image.name}</span>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   )}
    // </div>
  );
};

export default DragAndDropUploader;
