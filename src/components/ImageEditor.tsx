import { Canvas, Rect, Image as FabricImage, Point, Polygon } from 'fabric'; // browsermport { fabric } from 'fabric';
import { RefObject, useEffect, useRef, useState } from 'react';
type ImageEditorProps = {
  image: string;
  cropButton: RefObject<HTMLButtonElement | null>
  onCrop: (croppedImg: string) => void;
}

// Image Editor Component
function ImageEditor({
  image,
  cropButton,
  onCrop
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);
  const polygonRef = useRef<Polygon | null>(null);
  const imgRef = useRef<FabricImage | null>(null);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    fabricCanvas.current = new Canvas(canvasRef.current, {
      selection: false,
      preserveObjectStacking: true,
    });

    FabricImage.fromURL(image).then(img => {
      if (!img || !fabricCanvas.current) return;

      imgRef.current = img;
      fabricCanvas.current.setDimensions({
        width: img.width!,
        height: img.height!
      });

      img.set({
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      });

      fabricCanvas.current.add(img);
      fabricCanvas.current.backgroundImage = img;

      // Create polygon
      const points = [
        new Point(img.width! * 0.25, img.height! * 0.25),
        new Point(img.width! * 0.75, img.height! * 0.25),
        new Point(img.width! * 0.75, img.height! * 0.75),
        new Point(img.width! * 0.25, img.height! * 0.75),
      ];

      const polygon = new Polygon(points, {
        fill: 'rgba(0,0,0,0)',
        stroke: '#ff0000',
        strokeWidth: 2,
        objectCaching: false,
        transparentCorners: false,
        cornerColor: '#00ff00',
        cornerSize: 12,
        hasControls: true,
        hasBorders: false,
        lockScalingX: false,
        lockScalingY: false,
      });

      fabricCanvas.current.add(polygon);
      polygonRef.current = polygon;
      fabricCanvas.current.requestRenderAll();
    });

    return () => {
      fabricCanvas.current?.dispose();
      fabricCanvas.current = null;
    };
  }, [image]);

  // Crop functionality
  useEffect(() => {
    const handleCrop = async () => {
      if (!polygonRef.current || !imgRef.current || !fabricCanvas.current) return;

      try {
        if (!polygonRef.current || !imgRef.current) return;

        // Compute polygon points in the image coordinate space.
        // (Assuming your polygon’s position/points are defined relative to the image.)

        // Get the underlying canvas element from Fabric.
        const sourceCanvas = fabricCanvas.current.getElement(); // or fabricCanvas.current.lowerCanvasEl

        // Extract the cropped image using our helper function.
        const croppedDataUrl = cropCanvasWithPolygon(sourceCanvas, polygonRef.current);
        onCrop(croppedDataUrl);
      } catch (error) {
        console.error('Cropping failed:', error);
      }
    };

    cropButton.current?.addEventListener('click', handleCrop);
    return () => cropButton.current?.removeEventListener('click', handleCrop);
  }, [onCrop, image, cropButton]);

  // Perspective warp using canvas transform
  // Helper function to load image
  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });


  return (
    <div className="flex flex-col justify-center w-96 h-96 overflow-hidden rounded-lg">
      <canvas ref={canvasRef} className='w-full' />

    </div>
  );
};


/**
// Perspec/**
 * Extracts the cropped region defined by the polygon's oCoords from the given canvas.
 *
 * @param sourceCanvas - The HTMLCanvasElement from which to extract the image.
 * @param polygon - The Fabric polygon object with its `oCoords` property.
 * @returns A data URL representing the cropped image.
 */
function cropCanvasWithPolygon(
  sourceCanvas: HTMLCanvasElement,
  polygon: { oCoords: Record<string, { x: number, y: number }> }
): string {
  // Destructure the oCoords that contain the actual canvas coordinates.
  const { tl, tr, br, bl } = polygon.oCoords;

  // Build an array of points for convenience.
  const points = [tl, tr, br, bl];

  // Calculate the bounding box around the polygon.
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const width = maxX - minX;
  const height = maxY - minY;

  // Create an offscreen canvas that exactly covers the bounding box.
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  const ctx = offscreenCanvas.getContext('2d')!;

  // Set up a clipping path based on the polygon.
  // Since our offscreen canvas starts at (0,0) but the polygon is in canvas coordinates,
  // translate the polygon points relative to (minX, minY).
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl.x - minX, tl.y - minY);
  ctx.lineTo(tr.x - minX, tr.y - minY);
  ctx.lineTo(br.x - minX, br.y - minY);
  ctx.lineTo(bl.x - minX, bl.y - minY);
  ctx.closePath();
  ctx.clip();

  // Draw the source canvas onto the offscreen canvas,
  // offsetting so that the bounding box region aligns at (0,0).
  ctx.drawImage(sourceCanvas, minX, minY, width, height, 0, 0, width, height);
  ctx.restore();

  // Return the resulting cropped image as a data URL.
  return offscreenCanvas.toDataURL('image/png');
}

export default ImageEditor;
