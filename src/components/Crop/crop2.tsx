import { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from './utils';
import Knob from './Controls/knob';
interface CropDemoProps {
  image: string;
  cropButton: RefObject<HTMLButtonElement | null>;
  onCrop: (croppedImg: string) => void;
}
const styles = () => ({
  cropContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    background: '#333',
  },
  cropButton: {
    flexShrink: 0,
    marginLeft: 16,
  },
  controls: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  sliderContainer: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
  },
  sliderLabel: {
  },
  slider: {
    padding: '22px 0px',
    marginLeft: 32,
  },
})



const CropDemo2 = ({ image, onCrop, cropButton }: CropDemoProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const [rotation, setRotation] = useState(0)
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    console.log(croppedArea, croppedAreaPixels)
    setCroppedAreaPixels(croppedAreaPixels)

  }
  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      )
      console.log('donee', { croppedImage })
      onCrop(croppedImage as string)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (cropButton.current) {
      cropButton.current.addEventListener('click', showCroppedImage)
    }
    return () => {
      cropButton.current?.removeEventListener('click', showCroppedImage)
    }
  })



  return (
    <div className=''>
      {image && <Cropper
        style={{
          containerStyle: {
            width: '100%',
            height: '100%',
          }
        }}

        image={image as string}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={4 / 3}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
      />}
      {/*<div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-bold py-2 px-4 rounded-full'>
        <Knob size='w-10 h-10' onChange={setRotation} initialDegrees={rotation} />
      </div> */}
    </div>
  )
}

export default CropDemo2
