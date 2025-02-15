import React, { useState, useRef } from "react";
import type { CameraType, } from "react-camera-pro";
import CropDemo from "./components/Crop";
import Camera from "./components/Camera";

function App() {
  const camera = useRef<HTMLInputElement | null>(null);
  const cropButton = useRef<HTMLButtonElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);


  return <>

    <div className="flex gap-5 flex-col items-center justify-center my-5">
      <div className="relative w-96 h-96 overflow-hidden rounded-lg">
        {image ?
          <CropDemo image={image} onCrop={setCroppedImage} cropButton={cropButton} />
          :
          <Camera
            onCapture={setImage}
            inputRef={camera}

          ></Camera>}

      </div>
      <div className="flex gap-5 items-center justify-center">

        {image ? <div className="flex gap-5 items-center justify-center">
          <button
            onClick={() => setImage(null)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Recapture
          </button>
          <button ref={cropButton} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Crop</button>
        </div> :
          null

        }

      </div>

      <div>
        {croppedImage ? <img src={croppedImage} alt="cropped image" className="w-full h-full object-cover" /> : null}

      </div>

    </div>
  </>



}

export default App

