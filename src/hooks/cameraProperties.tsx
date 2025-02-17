import { useState, useEffect } from 'react';

interface CameraSize {
  width: number | null;
  height: number | null;
  error: string | null;
  loading: boolean;
}

function useCameraProperties(): CameraSize {
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let videoElement: HTMLVideoElement | null = null;

    const getCameraResolution = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement = document.createElement('video');
        videoElement.style.display = 'none'; // Keep it hidden
        document.body.appendChild(videoElement); // Append to DOM to load metadata
        videoElement.srcObject = stream;

        await new Promise((resolve) => {
          videoElement!.onloadedmetadata = () => {
            resolve(videoElement);
          };
        });

        setWidth(videoElement.videoWidth);
        setHeight(videoElement.videoHeight);

      } catch (err: any) {
        setError(err.message || 'Failed to access camera or get resolution.');
        setWidth(null);
        setHeight(null);
      } finally {
        setLoading(false);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (videoElement) {
          document.body.removeChild(videoElement); // Clean up video element
        }
      }
    };

    getCameraResolution();

    return () => {
      // Cleanup function to stop the stream when the component unmounts or hook re-runs
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        document.body.removeChild(videoElement);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return {
    width,
    height,
    error,
    loading,
  };
}

export default useCameraProperties;
