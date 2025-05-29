import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import VideoSlider from './slider'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <VideoSlider/>
    </>
  )
}

export default App
