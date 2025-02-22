import { RefObject, useEffect, useRef, useState } from 'react'
//import ReactCrop, { centerCrop, makeAspectCrop, PixelCrop, type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
//import { canvasPreview } from './canvasPreview';
//import CropDemo2 from './crop2';
import CropDemo3 from './crop3';
import CropDemo4 from './crop4';
interface CropDemoProps {
  image: string;
  cropButton: RefObject<HTMLButtonElement | null>;
  onCrop: (croppedImg: string) => void;
}


function CropDemo({ image, cropButton, onCrop }: CropDemoProps) {



  return (
    <>

      <CropDemo4 image={image} onCrop={onCrop} cropButton={cropButton} />

    </>

  )
}


export default CropDemo
