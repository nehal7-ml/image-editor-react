import React, { useState, createRef, useEffect, useRef } from "react";
//import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { CropDemoProps } from "./types";
import Cropper from "cropperjs";
import { RotateCcwIcon, RotateCwIcon } from "lucide-react";
const CropDemo3: React.FC<CropDemoProps> = ({ image, onCrop, cropButton }: CropDemoProps) => {
  const options: Cropper.Options = {
    initialAspectRatio: 1,
    viewMode: 1,
    autoCrop: true,
    autoCropArea: 0.5,
    guides: true,
    highlight: true,
    toggleDragModeOnDblclick: true,
    restore: false,
    background: false
  }

  const [rotate, setRotate] = useState(45)
  const cropperRef = useRef<Cropper>(undefined);
  const imageRef = useRef<HTMLImageElement>(null);


  const getCropData = () => {
    if (typeof cropperRef.current !== "undefined") {
      const imageUrl = cropperRef.current.getCroppedCanvas().toDataURL()
      onCrop(imageUrl)

    }
  };
  useEffect(() => {
    const button = cropButton.current
    if (cropButton.current) {
      cropButton.current.addEventListener('click', getCropData)

    }
    return () => {
      button?.removeEventListener('click', getCropData)
    }
  })


  useEffect(() => {
    if (imageRef.current) {
      const cropper = new Cropper(imageRef.current, options)
      cropperRef.current = cropper

    }

    return () => { cropperRef.current?.destroy() }
  })
  return (
    <div className='relative w-96 h-96 flex justify-center items-center'>
      <img style={{ transform: `rotate(${rotate}deg)` }} ref={imageRef} src={image} className='w-full h-full object-contain' />
      <div className="flex flex-col justify-self-center justify-center items-center gap-2 m-5">
        <button onClick={() => cropperRef.current?.rotate(-5)}><RotateCcwIcon /></button>
        <button onClick={() => cropperRef.current?.rotate(5)}><RotateCwIcon /></button>

      </div>
    </div>
  );
};

export default CropDemo3;

