import { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Asta from "../entities/asta";

function Home(props: any) {

  const [aste, setAste] = useState<Asta[]>([]);

  const [nameAsta, setNameAsta] = useState<string>("");
  const [typeAsta, setTypeAsta] = useState<string>("classic");
  const [nFantallenatoriAsta, setNFantallenatoriAsta] = useState<number>(10);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [dirty, setDirty] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await API.addAsta(nameAsta, typeAsta, nFantallenatoriAsta);

      if (response && response.ok) {
        showToast.success("Asta created successfully");
        setNameAsta("");
        setTypeAsta("classic");
        setDirty(true);
      } else {
        showToast.error("Failed to create the Asta");
      }
    } catch (error) {
      showToast.error("Failed to create the Asta");
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const loadAste = async () => {
      try {
        const aste = await API.getAste();
        setAste(aste);
        setDirty(false);
      } catch (error) {
        showToast.error('Failed to load the Aste');
      }
    };

    loadAste();
  }, [dirty]);

  return (
    <Container className="my-5">
      <div className="mb-5">
        <ListGroup className="mb-3">
          {aste.map((asta) => (
            <ListGroup.Item
              key={asta.id}
              action
              onClick={() => navigate(`/asta/${asta.id}`)}
              className="d-flex flex-wrap gap-2"
            >
              <strong>{asta.id}</strong>
              <span>{asta.name}</span>
              <span>{"("}{asta.type}, {asta.n_fantallenatori}{")"}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      <Card>
        <Card.Header as="h5" className="bg-primary text-white">
          Create Asta
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text"
                placeholder="Enter name asta"
                value={nameAsta}
                onChange={(e) => setNameAsta(e.target.value)}
                required
                disabled={isCreating}
              />
            </Form.Group>
            <Form.Group controlId="type" className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Check
                type="radio"
                name="typeAsta"
                id="classic"
                label="Classic"
                value="classic"
                checked={typeAsta === "classic"}
                onChange={(e) => setTypeAsta(e.target.value)}
                required
              />
              <Form.Check
                type="radio"
                name="typeAsta"
                id="mantra"
                label="Mantra"
                value="mantra"
                checked={typeAsta === "mantra"}
                onChange={(e) => setTypeAsta(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="n_fantallenatori" className="mb-3">
              <Form.Label>N. Fantallenatori</Form.Label>
              <Form.Control
                type="number"
                placeholder="Insert number of fantallenatori"
                step={1}
                value={nFantallenatoriAsta}
                onChange={(e) => setNFantallenatoriAsta(Number(e.target.value))}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? "Submitting..." : "Create Asta"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Home;
