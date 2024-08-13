import React from 'react'
import ReactDOM from 'react-dom/client'
import './scss/index.scss'
import Navbar from "./components/navbar.tsx";
import Home from "./components/home.tsx";
import Contact from "./components/contact.tsx";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/contact",
    element: <Contact/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Navbar/>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
