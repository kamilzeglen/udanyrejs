import React from 'react'
import ReactDOM from 'react-dom/client'
import './scss/index.scss'
import Navbar from "./components/navbar.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Navbar />
  </React.StrictMode>,
)
