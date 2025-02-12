import { RefObject, useEffect, useRef, useState } from 'react'
import ReactCrop, { PixelCrop, type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { canvasPreview } from './canvasPreview';
interface CropDemoProps {
  image: string;
  cropButton: RefObject<HTMLButtonElement | null>;
  onCrop: (croppedImg: string) => void;
}


function CropDemo({ image, cropButton, onCrop }: CropDemoProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imageRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  async function handleCrop() {
    const image = imageRef.current
    const previewCanvas = previewCanvasRef.current
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist')
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    )
    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      throw new Error('No 2d context')
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height,
    )
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    })
    const cropUrl = URL.createObjectURL(blob)




    onCrop(cropUrl)

  }
  useEffect(() => {
    if (cropButton.current) {
      cropButton.current.addEventListener('click', handleCrop)
    }
    return () => {
      cropButton.current?.removeEventListener('click', handleCrop)
    }
  })

  useEffect(() => {
    if (previewCanvasRef.current) return
    const canvas = document.createElement('canvas')
    previewCanvasRef.current = canvas
  })

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imageRef.current) return
    canvasPreview(imageRef.current, previewCanvasRef.current, completedCrop)
  }, [completedCrop, crop])


  return (
    <div>
      <ReactCrop crop={crop}

        onChange={c => setCrop(c)} minHeight={25} minWidth={25}
        onComplete={c => setCompletedCrop(c)}
      >

        <img ref={imageRef} src={image} />
      </ReactCrop>

    </div>

  )
}


export default CropDemo
