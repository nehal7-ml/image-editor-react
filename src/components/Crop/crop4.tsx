import React from "react";
import { CropDemoProps } from "./types";
import ResponsiveCanvas from "./ResponsiveCanvas";


function CropDemo4({ image, onCrop, cropButton }: CropDemoProps) {






  return (

    <>
      <div className='relative w-lvw h-[80vh] flex justify-center items-center px-2'>
        <ResponsiveCanvas onCrop={onCrop} image={image} cropButton={cropButton} />

      </div>
    </>


  )
}

export default CropDemo4
