import { Canvas, Circle, FabricImage, Point, Polygon, Polyline, TPointerEvent, TPointerEventInfo, util } from "fabric";
import { DotIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PolygonCropProps {
  fabricCanvasRef: React.MutableRefObject<Canvas | null>;
  fabricImageRef: React.MutableRefObject<FabricImage | null>;
  handleCrop: (image: string) => void;
  cropButton: React.MutableRefObject<HTMLButtonElement | null>;
}

const PolygonCrop: React.FC<PolygonCropProps> = ({ fabricCanvasRef, fabricImageRef, handleCrop, cropButton }) => {
  const [cropMode, setCropMode] = useState<'none' | 'polygon' | 'square'>('none');
  const polygon = useRef<Polyline | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const pointCircles = useRef<Circle[]>([]);

  const handleMouseDown = useCallback(
    (mouseEvent: TPointerEventInfo<TPointerEvent>, canvas: Canvas) => {
      const pointer = canvas.getScenePoint(mouseEvent.e);
      if (polygon.current) {
        canvas.remove(polygon.current);
        polygon.current.dispose();
      }
      const pointCircle = new Circle({
        left: pointer.x - 3,
        top: pointer.y - 3,
        radius: 3,
        fill: "#55fa02",
        hasControls: false,
        selectable: false
      })


      const poly = polygon.current = new Polyline(
        [...points, pointer],
        {
          stroke: '#020ffa',
          hasControls: false,
          hasBorders: false,
          fill: "",
          backgroundColor: ""
        });
      canvas.add(poly)
      canvas.add(pointCircle)
      canvas.bringObjectToFront(pointCircle)
      canvas.bringObjectToFront(poly)
      setPoints([...points, pointer])
    },
    [points]
  );

  useEffect(() => {
    if (!fabricImageRef.current || !fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const image = fabricImageRef.current;
    let disposer: VoidFunction;

    if (cropMode === 'polygon') {
      image.setControlsVisibility({
        mtr: false, mt: false, ml: false, mr: false,
        mb: false, bl: false, br: false, tl: false, tr: false
      });
      canvas.setCursor('crosshair');
      image.selectable = false;

      disposer = canvas.on('mouse:down', (mouseEvent) => handleMouseDown(mouseEvent, canvas));
    }




    return () => {
      if (image) image.setControlsVisibility({
        mtr: true, mt: true, ml: true, mr: true,
        mb: true, bl: true, br: true, tl: true, tr: true
      });

      if (canvas && !canvas.disposed) canvas.setCursor('default');
      if (disposer) disposer();
    };
  }, [cropMode, fabricCanvasRef, fabricImageRef, handleMouseDown, handleCrop]);




  useEffect(() => {
    function saveCrop() {
      const canvas = fabricCanvasRef.current;
      const image = fabricImageRef.current;

      if (polygon.current && canvas && image) {
        const canvasPoints = polygon.current.get('points');
        if (canvasPoints && canvasPoints.length >= 3) {
          const matrix = image.calcTransformMatrix();
          const inverseMatrix = util.invertTransform(matrix);
          const localPoints = canvasPoints.map(p =>
            util.transformPoint(p, inverseMatrix)
          );


          const clipPolygon = new Polygon(localPoints, {
            stroke: null,
            fill: null,
            selectable: false,
            evented: false,
          });
          image.clipPath = clipPolygon;
          image.clipPath.absolutePositioned = false;
          image.dirty = true;
          handleCrop(image.toDataURL());
        }
        canvas.remove(polygon.current);
        polygon.current.dispose();
        polygon.current = null;
        setPoints([]);
      }

    }

    cropButton.current?.addEventListener('click', saveCrop)


    return () => {
      cropButton.current?.removeEventListener('click', saveCrop)
    }
  }, [cropButton, fabricCanvasRef, fabricImageRef, handleCrop])


  return (
    <button
      onClick={() => setCropMode(current => current === 'none' ? 'polygon' : 'none')}
      className={`${cropMode === 'polygon' ? 'bg-gray-700' : 'bg-gray-500/80'} hover:bg-gray-700 cursor-pointer text-white font-bold p-2 rounded`}
    >
      <DotIcon />
    </button>
  );
};

export default PolygonCrop;
