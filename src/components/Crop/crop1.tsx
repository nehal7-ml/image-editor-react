import { RefObject, useEffect, useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, PixelCrop, type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { canvasPreview } from './canvasPreview';


function CropDemo({ image, cropButton, onCrop }: CropDemoProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imageRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [aspect, setAspect] = useState<number>(1)

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 50,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }


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

    if (previewCanvasRef.current) return
    const canvas = document.createElement('canvas')
    previewCanvasRef.current = canvas
  })

  useEffect(() => {
    if (cropButton.current) {
      cropButton.current.addEventListener('click', handleCrop)
    }
    return () => {
      cropButton.current?.removeEventListener('click', handleCrop)
    }
  })

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imageRef.current) return
    canvasPreview(imageRef.current, previewCanvasRef.current, completedCrop)
  }, [completedCrop, crop])



  return (
    <>

      <div className='relative w-96 h-96 flex justify-center items-center'>
        <ReactCrop
          className='max-h-96 max-w-96'
          onComplete={handleCrop}
          onChange={setCrop}


        >
          <img ref={imageRef} src={image} onLoad={onImageLoad} className='object-center object-contain' />
        </ReactCrop>

      </div>

    </>

  )
}


export default CropDemo

