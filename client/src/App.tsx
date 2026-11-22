import { useEffect } from 'react';
import { Route, Routes, Link } from "react-router-dom";
import { Container, Navbar } from "react-bootstrap";
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

      <Navbar className="app-navbar py-2">
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/">
            Fanta Tool
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/asta/:asta_id" element={<AstaDetails />} />
      </Routes>
    </>
  )
}

export default App;
