import { Aperture, LucideCamera, RefreshCcwDot } from "lucide-react";
import { RefObject, useEffect, useState } from "react";
import { CameraType, Camera as ReactCameraPro } from "react-camera-pro";

interface CameraProps {
  cameraRef: RefObject<CameraType | null>;
  onCapture: (image: string | null) => void;
}

function Camera({ cameraRef, onCapture }: CameraProps) {
  const [number, setNumber] = useState(0)
  async function handleCapture() {
    if (!cameraRef.current || !onCapture) return
    const imageUrl = await cropAndLoadImage(cameraRef.current.takePhoto('base64url') as string)

    onCapture(imageUrl)
  }
  async function cropAndLoadImage(base64URL: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = async () => {
        const width = img.width;
        const height = img.height;

        const cropWidth = width / 2;
        const cropHeight = height / 2;

        const startX = width / 4;  // Start x-coordinate for cropping (1/4 of the width)
        const startY = height / 4; // Start y-coordinate for cropping (1/4 of the height)

        // Offscreen canvas for cropping
        const offscreenCanvas = new OffscreenCanvas(cropWidth, cropHeight);
        const offscreenCtx = offscreenCanvas.getContext('2d');

        offscreenCtx!.drawImage(
          img,
          startX,
          startY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        // Get the cropped image data as a Blob (or use toDataURL if needed)
        const croppedBlob = await offscreenCanvas.convertToBlob();

        // Load the cropped image onto the main canvas

        resolve(URL.createObjectURL(croppedBlob));

      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = base64URL;
    });
  }

  return <>
    <div className="relative w-full h-full">
      <ReactCameraPro
        ref={cameraRef}
        facingMode={"environment"}
        errorMessages={{
          noCameraAccessible: "No camera accessible",
          permissionDenied: "Permission denied",
          switchCamera: "Switch camera",
          canvas: "Canvas error"

        }}
        numberOfCamerasCallback={setNumber}

      />

      <div className="absolute z-10 w-1/2 h-1/2 top-0 left-0 transform translate-x-1/2 translate-y-1/2 border-2 border-red-200">

      </div>

      <div className="absolute z-10 w-full bottom-0 ">
        <div className="relative w-full h-10">

          <div className="absolute z-10 flex gap-2 items-center justify-center w-full">
            <button className="z-10 text-white font-bold py-2 px-4 rounded active:animate-spin active:scale-105"
              onClick={handleCapture}
            ><Aperture className="w-4 h-4" /></button>

          </div>

          <div className="absolute right-0 flex z-20 gap-2  ">
            <button
              className="z-10 text-white font-bold py-2 px-4 rounded hover:scale-105 hover:cursor-pointer"
              hidden={number <= 1}
              onClick={() => {
                cameraRef.current?.switchCamera();
              }}
            >
              <RefreshCcwDot className="w-4 h-4" />

            </button>


          </div>
        </div>



      </div>

    </div >
  </>

}

export default Camera
