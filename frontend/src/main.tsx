import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Homepage} from "./Homepage.tsx";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Homepage activeTab={"homepage"}/>
    },
    {
        path: "/sweepLine",
        element: <Homepage activeTab={"sweepLine"}/>
    },
    {
        path: "/vertexCover",
        element: <Homepage activeTab={"vertexCover"}/>
    },
    {
        path: "/suffixArray",
        element: <Homepage activeTab={"suffixArray"}/>
    },
    {
        path: "/ehrlichSwaps",
        element: <Homepage activeTab={"ehrlichSwaps"}/>
    }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={router}/>
  </StrictMode>,
)
