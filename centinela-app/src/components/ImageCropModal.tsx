import React, { useState, useRef, useCallback } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';

interface ImageCropModalProps {
  isVisible: boolean;
  onClose: () => void;
  imageFile: File;
  onCropComplete: (croppedImageUrl: string) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isVisible,
  onClose,
  imageFile,
  onCropComplete
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 300, height: 300 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image when modal opens
  React.useEffect(() => {
    if (isVisible && imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [isVisible, imageFile]);

  // Handle image load to set initial crop area
  const handleImageLoad = useCallback(() => {
    if (imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      // Calculate display size maintaining aspect ratio
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let displayWidth, displayHeight;
      
      if (aspectRatio > 1) {
        // Landscape
        displayWidth = Math.min(containerWidth, img.naturalWidth);
        displayHeight = displayWidth / aspectRatio;
      } else {
        // Portrait or square
        displayHeight = Math.min(containerHeight, img.naturalHeight);
        displayWidth = displayHeight * aspectRatio;
      }
      
      setImageSize({ width: displayWidth, height: displayHeight });
      
      // Center crop area
      const cropSize = Math.min(displayWidth, displayHeight, 200);
      setCropArea({
        x: (displayWidth - cropSize) / 2,
        y: (displayHeight - cropSize) / 2,
        width: cropSize,
        height: cropSize
      });
    }
  }, []);

  // Handle mouse down on crop area
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y
    });
  };

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragStart.x;
      const newY = e.clientY - rect.top - dragStart.y;
      
      // Constrain to image bounds
      const maxX = imageSize.width - cropArea.width;
      const maxY = imageSize.height - cropArea.height;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      }));
    }
  }, [isDragging, dragStart, imageSize, cropArea.width, cropArea.height]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle crop completion
  const handleCropComplete = async () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageRef.current;
    
    // Set canvas size to desired output size (200x200)
    canvas.width = 200;
    canvas.height = 200;
    
    // Calculate scale factor from display size to natural size
    const scaleX = img.naturalWidth / imageSize.width;
    const scaleY = img.naturalHeight / imageSize.height;
    
    // Draw cropped image
    ctx.drawImage(
      img,
      cropArea.x * scaleX, // source x
      cropArea.y * scaleY, // source y
      cropArea.width * scaleX, // source width
      cropArea.height * scaleY, // source height
      0, // dest x
      0, // dest y
      200, // dest width
      200  // dest height
    );
    
    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        // Create object URL for immediate use
        const imageUrl = URL.createObjectURL(blob);
        console.log('🖼️ Imagen cropeada creada:', imageUrl.substring(0, 50) + '...');
        
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          console.log('📸 Base64 generado:', base64String.substring(0, 100) + '...');
          onCropComplete(base64String);
          onClose();
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-black rounded-3xl w-full max-w-md"
        style={{ 
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
          >
            <X size={20} color="#FFFFFF" />
          </button>
          <h2 
            className="text-white text-xl font-normal"
            style={{ 
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontWeight: 400
            }}
          >
            ajustar imagen.
          </h2>
          <button
            onClick={handleCropComplete}
            className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center"
          >
            <Check size={20} color="#FFFFFF" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-6">
          <div 
            ref={containerRef}
            className="relative mx-auto bg-gray-900 rounded-2xl overflow-hidden"
            style={{ 
              width: '300px', 
              height: '300px',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            {imageUrl && (
              <>
                {/* Image */}
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Crop preview"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${imageSize.width}px`,
                    height: `${imageSize.height}px`,
                    maxWidth: 'none'
                  }}
                  onLoad={handleImageLoad}
                  draggable={false}
                />
                
                {/* Overlay */}
                <div 
                  className="absolute inset-0 bg-black/50"
                  style={{
                    clipPath: `polygon(0% 0%, 0% 100%, ${cropArea.x}px 100%, ${cropArea.x}px ${cropArea.y}px, ${cropArea.x + cropArea.width}px ${cropArea.y}px, ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px, ${cropArea.x}px ${cropArea.y + cropArea.height}px, ${cropArea.x}px 100%, 100% 100%, 100% 0%)`
                  }}
                />
                
                {/* Crop Area */}
                <div
                  className="absolute border-2 border-white rounded-full cursor-move"
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {/* Corner handles */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </>
            )}
          </div>
          
          {/* Instructions */}
          <p 
            className="text-gray-400 text-center mt-4"
            style={{ fontSize: '14px' }}
          >
            Arrastra el círculo para ajustar tu foto de perfil
          </p>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageCropModal;