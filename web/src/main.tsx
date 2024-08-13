import React from 'react'
import ReactDOM from 'react-dom/client'
import './scss/index.scss'
import Navbar from "./components/navbar.tsx";
import Home from "./components/home.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Navbar/>
    <Home/>
  </React.StrictMode>,
)
