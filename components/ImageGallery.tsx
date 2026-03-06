
import React from 'react';

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  if (images.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <h2 className="text-xl font-bold text-slate-800">Your Masterpieces</h2>
        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
          {images.length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="group relative bg-white p-2 rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-2xl"
          >
            <img 
              src={img} 
              alt={`Generated story scene ${idx + 1}`} 
              className="w-full h-auto rounded-xl object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <a 
                href={img} 
                download={`story-image-${idx}.png`}
                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
