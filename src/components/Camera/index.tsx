import { RefreshCcwDot } from "lucide-react";
import { RefObject, useEffect, useState } from "react";
import { CameraType, Camera as ReactCameraPro } from "react-camera-pro";

interface CameraProps {
  cameraRef: RefObject<CameraType | null>;
}

function Camera({ cameraRef }: CameraProps) {
  const [number, setNumber] = useState(0)

  return <>
    <div className="relative w-full h-full">
      <ReactCameraPro
        ref={cameraRef}
        errorMessages={{
          noCameraAccessible: "No camera accessible",
          permissionDenied: "Permission denied",
          switchCamera: "Switch camera",
          canvas: "Canvas error"

        }}
        numberOfCamerasCallback={setNumber}

      />
      <button
        className="absolute z-10 h-4 w-4 right-5 bottom-5  text-white font-bold py-2 px-4 rounded hover:scale-105 hover:cursor-pointer"
        hidden={number <= 1}
        onClick={() => {
          cameraRef.current?.switchCamera();
        }}
      >
        <RefreshCcwDot />
      </button>

    </div>
  </>

}

export default Camera
