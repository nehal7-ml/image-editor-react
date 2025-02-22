import React, { useEffect, useRef, useState } from "react";
import { FabricImage, Canvas, Point, filters } from "fabric";
import { DotIcon, SquareDashed } from "lucide-react";
import PolygonCrop from "./Controls/PolygonCrop";


interface ResponsiveCanvasProps {
  image: string;
  onCrop: (image: string) => void;
  cropButton: React.MutableRefObject<HTMLButtonElement | null>;
}

const ResponsiveCanvas: React.FC<ResponsiveCanvasProps> = ({ image, onCrop, cropButton }) => {
  const fabricCanvasRef = useRef<Canvas>(null);
  const fabricImageRef = React.useRef<FabricImage>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cropMode, setCropMode] = useState<'none' | 'polygon' | 'square'>('none')



  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);


  // For pinch-to-zoom, store the initial distance, scale, and offset.
  const [pinchInitialDistance, setPinchInitialDistance] = useState<number | null>(null);
  const [pinchInitialScale, setPinchInitialScale] = useState<number | null>(null);
  const [pinchInitialOffset, setPinchInitialOffset] = useState<{ x: number; y: number } | null>(null);




  // Load the image once on mount.
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return
    const displayImage = new Image()
    displayImage.crossOrigin = "anonymous"
    displayImage.src = image
    const canvas = fabricCanvasRef.current = new Canvas(canvasRef.current, {
      backgroundColor: ""
    })



    displayImage.onload = () => {
      if (!containerRef.current || !canvas) return
      if (canvas.disposed) return
      const scaleX = containerRef.current.clientWidth / (displayImage.width + 10);
      const scaleY = containerRef.current.clientHeight / (displayImage.height + 10);

      const scale = Math.min(scaleX, scaleY, 1);
      const left = (containerRef.current.clientWidth - displayImage.width * scale) / 2;
      const top = (containerRef.current.clientHeight - displayImage.height * scale) / 2;

      const Resize = filters.Resize;

      const fabricImage = fabricImageRef.current = new FabricImage(displayImage, {
        centeredScaling: true,
        resizeFilter: new Resize({
          resizeType: 'lanczos',

        }),
        scaleX: scale,
        scaleY: scale,
        left,
        top,
      })
      canvas.add(fabricImage)
      canvas.setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight })


    }

    return () => {
      displayImage.remove()
      fabricImageRef.current = null
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [image]);


  useEffect(() => {
    if (!fabricImageRef.current || !fabricCanvasRef.current) return

    console.debug("scale", scale, 'offset', offset)

    fabricImageRef.current.scale(scale);
    fabricImageRef.current.setXY(new Point(offset.x, offset.y));


    return () => {
    }
  }, [scale, offset])


  useEffect(() => {
    const container = containerRef.current
    if (containerRef.current) {
      containerRef.current.addEventListener('wheel', handleWheel, { passive: false })
      containerRef.current.addEventListener('touchstart', handleTouchStart, { passive: false })
      containerRef.current.addEventListener('touchmove', handleTouchMove, { passive: false })
      containerRef.current.addEventListener('touchend', handleTouchEnd, { passive: false })

    }
    return () => {
      if (container) {

        container.removeEventListener('wheel', handleWheel)
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  })


  // Zoom function
  function zoomAtPoint(pointer: Point, zoomFactor: number) {
    const activeObject = fabricImageRef.current; // Get the selected object (image)
    const canvas = fabricCanvasRef.current; // Get the canvas
    if (!activeObject || !canvas) return;
    activeObject.setControlsVisibility({ mtr: false, mt: false, ml: false, mr: false, mb: false, bl: false, br: false, tl: false, tr: false });
    canvas.renderAll();

    console.log('zooming image')

    // Get the current scale and position of the object
    const oldScaleX = activeObject.scaleX;
    const oldScaleY = activeObject.scaleY;
    const oldLeft = activeObject.left;
    const oldTop = activeObject.top;

    // Calculate the new scale
    const newScaleX = oldScaleX * zoomFactor;
    const newScaleY = oldScaleY * zoomFactor;

    // Calculate the mouse position relative to the object
    const mouseX = (pointer.x - oldLeft) / oldScaleX;
    const mouseY = (pointer.y - oldTop) / oldScaleY;

    // Calculate the new position to keep the mouse point fixed
    const newLeft = pointer.x - mouseX * newScaleX;
    const newTop = pointer.y - mouseY * newScaleY;

    // Apply the new scale and position
    activeObject.set({
      scaleX: newScaleX,
      scaleY: newScaleY,
      left: newLeft,
      top: newTop,
    });


    activeObject.setControlsVisibility({ mtr: true, mt: true, ml: true, mr: true, mb: true, bl: true, br: true, tl: true, tr: true });
    canvas.renderAll();
  }

  // Handle zooming using mouse wheel.
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const delta = e.deltaY; // Get the scroll direction
    const zoomFactor = delta > 0 ? 0.9 : 1.1; // Zoom out if scrolling down, zoom in if scrolling up
    const pointer = canvas.getScenePoint(e); // Get the mouse position

    zoomAtPoint(pointer, zoomFactor); // Zoom the canvas

  };

  // Handle touch start.
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Start pinch-to-zoom.
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const distance = Math.hypot(dx, dy);
      setPinchInitialDistance(distance);
      setDragging(false);
      setLastPos(null);
    }
  };

  // Handle touch move.
  // Handle touch move
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && pinchInitialDistance) {
      e.preventDefault();

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const distance = Math.hypot(dx, dy);

      // Calculate the pinch center in screen coordinates
      const centerXScreen = (touch1.clientX + touch2.clientX) / 2;
      const centerYScreen = (touch1.clientY + touch2.clientY) / 2;

      // Calculate the new scale based on the pinch distance
      const newScale = Math.max((distance / pinchInitialDistance), 0.1);

      // Calculate the zoom factor
      const zoomFactor = newScale > 1 ? 1.002 : 0.998;

      console.debug('Touch move running', newScale, zoomFactor)
      // Apply the zoom at the pinch center
      zoomAtPoint(new Point(centerXScreen, centerYScreen), zoomFactor);
    }
  };
  // Handle touch end.
  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      setPinchInitialDistance(null);
      setPinchInitialScale(null);
      setPinchInitialOffset(null);
    }
    if (e.touches.length === 0) {
      setDragging(false);
      setLastPos(null);
    }
  };



  return (<>
    <div className="w-full h-full flex flex-col border-gray-500 ">
      <div
        className="border-3 border-dashed h-[85%]"
        ref={containerRef}
      >
        <canvas
          ref={canvasRef}
        >
        </canvas>
      </div>
      <div className="w-full h-12 flex justify-center items-center gap-2 flex-wrap ">
        <PolygonCrop fabricCanvasRef={fabricCanvasRef} fabricImageRef={fabricImageRef} handleCrop={onCrop} cropButton={cropButton} />
        <button
          onClick={() => { setCropMode('square') }}
          className="bg-gray-500/80 hover:bg-gray-700 cursor-pointer text-white font-bold p-2 rounded ">
          <SquareDashed />
        </button>
      </div>
    </div>
  </>
  );
};

export default ResponsiveCanvas;
