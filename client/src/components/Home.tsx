import { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Asta from "../entities/asta";
import AstaTypeBadge from './AstaTypeBadge';
import EditAstaForm from './EditAstaForm';

function Home() {

  const [aste, setAste] = useState<Asta[]>([]);

  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [nameAsta, setNameAsta] = useState<string>("");
  const [typeAsta, setTypeAsta] = useState<string>("classic");
  const [nFantallenatoriAsta, setNFantallenatoriAsta] = useState<number>(10);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Asta di cui è aperto il modal di modifica / eliminazione
  const [editingAsta, setEditingAsta] = useState<Asta | null>(null);

  const [dirty, setDirty] = useState<boolean>(false);

  const navigate = useNavigate();

  const closeCreate = () => {
    setShowCreate(false);
    setNameAsta("");
    setTypeAsta("classic");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await API.addAsta(nameAsta, typeAsta, nFantallenatoriAsta);

      if (response && response.ok) {
        showToast.success("Asta created successfully");
        closeCreate();
        setDirty(true);
      } else {
        showToast.error("Failed to create the Asta");
      }
    } catch {
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
      } catch {
        showToast.error('Failed to load the Aste');
      }
    };

    loadAste();
  }, [dirty]);

  return (
    <Container fluid className="my-4 px-4">

      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="mb-0">Le tue aste</h4>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <i className="bi bi-plus-lg me-1"></i>Nuova asta
        </Button>
      </div>

      {/* selezione asta */}
      {
        aste.length == 0 ?
          <p className="text-secondary">Nessuna asta. Creane una con "Nuova asta".</p>
          :
          <Row xs={1} sm={2} lg={3} xxl={4} className="g-3">
            {aste.map((asta) => (
              <Col key={asta.id}>
                <Card className="asta-card h-100" onClick={() => navigate(`/asta/${asta.id}`)}>
                  <Card.Body className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <Card.Title className="mb-0 fs-5">{asta.name}</Card.Title>
                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        <span className="text-secondary small">#{asta.id}</span>
                        {/* stopPropagation: il clic sulla matita non apre l'asta */}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="icon-btn"
                          title="Modifica asta"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAsta(asta);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-auto">
                      <AstaTypeBadge type={asta.type} />
                      <span className="text-secondary small">
                        <i className="bi bi-people-fill me-1"></i>{asta.n_fantallenatori} partecipanti
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
      }

      {/* modifica / eliminazione asta */}
      {
        editingAsta ?
          <EditAstaForm
            key={editingAsta.id}
            asta={editingAsta}
            setDirty={setDirty}
            onClose={() => setEditingAsta(null)}
          />
          : <></>
      }

      {/* creazione asta */}
      <Modal show={showCreate} onHide={closeCreate} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Nuova asta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Inserisci nome asta"
                value={nameAsta}
                onChange={(e) => setNameAsta(e.target.value)}
                required
                autoFocus
                disabled={isCreating}
              />
            </Form.Group>
            <Form.Group controlId="type" className="mb-3">
              <Form.Label className="d-block">Formato</Form.Label>
              <Form.Check
                inline
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
                inline
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
            <Form.Group controlId="n_fantallenatori">
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeCreate} disabled={isCreating}>
              Annulla
            </Button>
            <Button variant="primary" type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crea Asta"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Home;
