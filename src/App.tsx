import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CameraCapture from './components/Camera'
function App() {


  return (
    <>
      <div className="flex flex-col items-center justify-center my-10">
        <CameraCapture />
      </div>

    </>
  )
}

export default App
