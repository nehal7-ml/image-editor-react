import { RefObject } from "react";

export interface CropDemoProps {
  image: string;
  cropButton: RefObject<HTMLButtonElement | null>;
  onCrop: (croppedImg: string) => void;
}

