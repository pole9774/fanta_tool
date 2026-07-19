import { useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Home from "./components/Home";
import AstaDetails from "./components/AstaDetails";

function App() {

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }, []);

  return (
    <>
      <Toaster position="top-center" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/asta/:asta_id" element={<AstaDetails />} />
      </Routes>
    </>
  )
}

export default App;
