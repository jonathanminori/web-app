"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: string[];
  className?: string;
}

export function PhotoGallery({ photos, className }: PhotoGalleryProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);

  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-md">
        <p className="text-muted-foreground">No photos available</p>
      </div>
    );
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  const toggleFullScreen = () => {
    setShowFullScreen((prev) => !prev);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main Gallery */}
      <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
        <Image
          src={photos[currentPhotoIndex]}
          alt={`Property photo ${currentPhotoIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover cursor-pointer"
          onClick={toggleFullScreen}
          priority={currentPhotoIndex === 0}
        />
        
        {/* Photo Navigation */}
        <button
          onClick={prevPhoto}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
          aria-label="Previous photo"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={nextPhoto}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
          aria-label="Next photo"
        >
          <ChevronRight size={20} />
        </button>
        
        {/* Photo Counter */}
        <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
          {currentPhotoIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-2 grid grid-cols-5 gap-2">
        {photos.slice(0, 5).map((photo, index) => (
          <button
            key={index}
            onClick={() => setCurrentPhotoIndex(index)}
            className={cn(
              "relative aspect-square rounded overflow-hidden border-2",
              currentPhotoIndex === index
                ? "border-primary"
                : "border-transparent"
            )}
          >
            <Image
              src={photo}
              alt={`Thumbnail ${index + 1}`}
              fill
              sizes="(max-width: 768px) 20vw, 10vw"
              className="object-cover"
            />
          </button>
        ))}
        {photos.length > 5 && (
          <button
            onClick={() => setCurrentPhotoIndex(5)}
            className="relative aspect-square rounded overflow-hidden bg-muted flex items-center justify-center text-sm font-medium"
          >
            +{photos.length - 5} more
          </button>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullScreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={toggleFullScreen}
            className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Close fullscreen view"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={photos[currentPhotoIndex]}
              alt={`Property photo ${currentPhotoIndex + 1} fullscreen`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
            
            <button
              onClick={prevPhoto}
              className="absolute left-4 z-10 bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={nextPhoto}
              className="absolute right-4 z-10 bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight size={24} />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded text-white">
              {currentPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
