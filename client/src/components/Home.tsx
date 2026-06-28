import { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import API from "../API/API";
import Asta from "../entities/asta";

function Home(props: any) {

  const [aste, setAste] = useState<Asta[]>([]);

  const [dirty, setDirty] = useState<boolean>(false);

  useEffect(() => {
    const loadAste = async () => {
      try {
        const aste = await API.getAste();
        setAste(aste);
      } catch (error) {

      }
    };

    loadAste();
  }, [dirty]);

  return (
    <Container className="my-5">
      {
        aste.map((asta) => (
          <p>{asta.id}, {asta.name}, {asta.type}, {asta.max_crediti}</p>
        ))
      }
    </Container>
  );
}

export default Home;
