import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from "react-router";
import './index.css'
import App from './App.jsx'
import Login from "./pages/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import { ThemeProvider } from "./context/ThemeContext.jsx"

import Home from "./pages/Home.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        element: <ProtectedRoute />, // Wrap protected routes
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          }
        ]
      }
    ],
  }
])

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ThemeProvider>
)
