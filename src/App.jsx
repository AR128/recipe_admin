import { Outlet } from "react-router";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Outlet />
    </div>
  )
}

export default App