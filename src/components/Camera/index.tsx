import { Aperture, ImagesIcon, LucideCamera } from "lucide-react";
import { RefObject, useRef, useState } from "react";
import { CameraType, Camera as ReactCameraPro } from "react-camera-pro";
import useCaptureSupport from "../../hooks/captureSupport";

interface CameraProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onCapture: (image: string | null) => void;
}

function Camera({ inputRef, onCapture }: CameraProps) {
  const [mediaSource, setMediaSource] = useState<'undecided' | 'camera' | 'file' | 'directCamera'>('undecided'); // 'undecided', 'camera', 'file'
  const cameraRef = useRef<CameraType>(null);
  const captureSupport = useCaptureSupport();

  async function handleCaptureFromFile(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.files?.[0];
    if (!value) return;

    // **1. Image Type Validation:**
    if (!value.type.startsWith('image/')) {
      console.error("Selected file is not an image.");
      return;
    }

    // **2. Read File with FileReader and Convert to Base64 (using Promise):**
    const base64Url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64Result = reader.result;
        if (typeof base64Result === 'string') {
          resolve(base64Result);
        } else {
          reject("FileReader result is not a string (Base64 error)");
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(value); // Read as Base64
    });

    if (!base64Url) {
      console.error("Failed to read image as base64.");
      return;
    }

    try {
      onCapture(base64Url);

    } catch (error) {
      console.error("Error during cropping or loading image:", error);
    }
  }

  //async function cropAndLoadImage(base64URL: string): Promise<string> {
  //  return new Promise((resolve, reject) => {
  //    const img = new Image();
  //
  //    img.onload = async () => {
  //      const width = img.width;
  //      const height = img.height;
  //
  //      const cropWidth = width / 2;
  //      const cropHeight = height / 2;
  //
  //      const startX = width / 4;
  //      const startY = height / 4;
  //
  //      const offscreenCanvas = new OffscreenCanvas(cropWidth, cropHeight);
  //      const offscreenCtx = offscreenCanvas.getContext('2d');
  //
  //      offscreenCtx!.drawImage(
  //        img,
  //        startX,
  //        startY,
  //        cropWidth,
  //        cropHeight,
  //        0,
  //        0,
  //        cropWidth,
  //        cropHeight
  //      );
  //
  //      const croppedBlob = await offscreenCanvas.convertToBlob();
  //      resolve(URL.createObjectURL(croppedBlob));
  //    };
  //
  //    img.onerror = (error) => {
  //      reject(error);
  //    };
  //
  //    img.src = base64URL;
  //  });
  //}

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const photo = cameraRef.current.takePhoto('base64url');
      //const croppedImageUrl = await cropAndLoadImage(photo);
      onCapture(photo as string);
    }
  };

  const chooseCamera = () => {
    setMediaSource('camera');
  };

  const chooseFile = () => {
    setMediaSource('file');
  };


  return <>
    <div className="relative w-full h-full flex flex-col gap-2">

      {(
        <div className="flex justify-around mb-4">
          <button
            onClick={chooseCamera}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-700 text-white font-bold"
          >
            <LucideCamera className="inline-block mr-2" size={16} /> Take Photo
          </button>
          <button
            onClick={chooseFile}
            className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-700 text-white font-bold"
          >
            <ImagesIcon className="inline-block mr-2" size={16} /> Upload Image
          </button>
        </div>
      )}


      <label className="relative h-max flex-grow">
        {mediaSource === 'camera' && !captureSupport ? (
          <div className="w-full h-full">
            <ReactCameraPro errorMessages={{
              noCameraAccessible: "No camera accessible",
              permissionDenied: "Permission denied",
              switchCamera: "Switch camera",
              canvas: "Canvas error"


            }} ref={cameraRef} aspectRatio="cover" facingMode="environment" />
            <button
              onClick={handleTakePhoto}
              className="absolute z-10  bottom-4 left-1/2 transform -translate-x-1/2 text-white font-bold py-2 px-4 rounded-full"
            >
              <Aperture className="inline-block align-middle" size={20} />
            </button>
          </div>
        ) :
          mediaSource === 'camera' && captureSupport ? (

            <>
              <input ref={inputRef} onChange={handleCaptureFromFile} type="file" accept="image/*" capture="environment" hidden />
              <div className="z-10 w-full h-full flex justify-center items-center border-1 border-dashed border-gray-500 rounded-md cursor-pointer">
                <div className="flex items-center justify-center gap-4">
                  <span> Upload  Image</span>
                  <ImagesIcon />
                </div>
              </div>
            </>

          ) : null}


        {mediaSource === 'file' && (
          <>
            <input ref={inputRef} onChange={handleCaptureFromFile} type="file" accept="image/*" hidden />
            <div className="z-10 w-full h-full flex justify-center items-center border-1 border-dashed border-gray-500 rounded-md cursor-pointer">
              <div className="flex items-center justify-center gap-4">
                <span> Upload from files</span>
                <ImagesIcon />
              </div>
            </div>
          </>
        )}
      </label>

    </div >
  </>
}

export default Camera
