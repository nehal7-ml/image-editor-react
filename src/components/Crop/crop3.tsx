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
    <div className='relative flex justify-center items-center'>
      <div>
        <img ref={imageRef} src={image} className='' />

      </div>
      <div className="flex flex-col justify-self-center justify-center items-center gap-2 m-1 bg-zinc-700/60">
        <button className='text-white font-bold py-2 px-2 rounded-full'
          onClick={() => cropperRef.current?.rotate(-5)}>
          <RotateCcwIcon />

        </button>
        <button className="text-white font-bold py-2 px-2 rounded-full"
          onClick={() => cropperRef.current?.rotate(5)}>
          <RotateCwIcon />
        </button>
        <button >
          <Plus />
        </button>
      </div>
    </div>
  );
};

export default CropDemo3;

