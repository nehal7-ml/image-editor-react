import { useState, useEffect, useRef } from 'react';

// Create the input element *once* in module scope
const captureInput = document.createElement('input');
captureInput.setAttribute('type', 'file');

// Optimized isCaptureSupported function - reuses the module-scoped input
function isCaptureSupported(): boolean {
  return 'capture' in captureInput;
}

function useCaptureSupport(): boolean {
  const [captureSupported, setCaptureSupported] = useState(false);
  const hasChecked = useRef(false); // Ref to track if check has been performed

  useEffect(() => {
    if (!hasChecked.current) { // Only run the check once
      setCaptureSupported(isCaptureSupported());
      hasChecked.current = true; // Mark check as performed
    }
  }, []);

  return captureSupported;
}

export default useCaptureSupport;
