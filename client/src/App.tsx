import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import { showToast } from './utilities/toast';
import Home from "./components/Home";
import AstaDetails from "./components/AstaDetails";

function App() {

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
