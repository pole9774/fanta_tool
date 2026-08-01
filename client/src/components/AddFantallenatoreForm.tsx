import { useState } from 'react';
import { Button, Form, Card } from "react-bootstrap";
import { showToast } from '../utilities/toast';
import API from "../API/API";

function AddFantallenatoreForm(props: any) {

  const [nameFantallenatore, setNameFantallenatore] = useState<string>("");
  const [maxCreditiFantallenatore, setMaxCreditiFantallenatore] = useState<number>(1000);
  const [classicP, setClassicP] = useState<number>(3);
  const [classicD, setClassicD] = useState<number>(8);
  const [classicC, setClassicC] = useState<number>(8);
  const [classicA, setClassicA] = useState<number>(6);
  const [mantraPorMin, setMantraPorMin] = useState<number>(2);
  const [mantraPorMax, setMantraPorMax] = useState<number>(4);
  const [mantraMovMin, setMantraMovMin] = useState<number>(20);
  const [mantraMovMax, setMantraMovMax] = useState<number>(26);

  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await API.addFantallenatore(Number(props.asta_id), nameFantallenatore, maxCreditiFantallenatore, classicP, classicD, classicC, classicA, mantraPorMin, mantraPorMax, mantraMovMin, mantraMovMax);

      if (response && response.ok) {
        showToast.success("Fantallenatore created successfully");
        setNameFantallenatore("");
        setMaxCreditiFantallenatore(1000);
        props.setDirty(true);
      } else {
        showToast.error("Failed to create the Fantallenatore");
      }
    } catch (error) {
      showToast.error("Failed to create the Fantallenatore");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="mt-5">
      <Card.Header as="h5" className="bg-primary text-white">
        Aggiungi Fantallenatore
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              placeholder="Inserisci nome fantallenatore"
              value={nameFantallenatore}
              onChange={(e) => setNameFantallenatore(e.target.value)}
              required
              disabled={isCreating}
            />
          </Form.Group>
          <Form.Group controlId="n_fantallenatori" className="mb-3">
            <Form.Label>Max Crediti</Form.Label>
            <Form.Control
              type="number"
              placeholder="Inserisci max crediti"
              step={1}
              value={maxCreditiFantallenatore}
              onChange={(e) => setMaxCreditiFantallenatore(Number(e.target.value))}
              required
            />
          </Form.Group>
          {
            props.asta.type == "classic" ?
              <>
                <Form.Group controlId="classic_p" className="mb-3">
                  <Form.Label>Numero Portieri</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Inserisci numero portieri"
                    step={1}
                    value={classicP}
                    onChange={(e) => setClassicP(Number(e.target.value))}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="classic_d" className="mb-3">
                  <Form.Label>Numero Difensori</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Inserisci numero difensori"
                    step={1}
                    value={classicD}
                    onChange={(e) => setClassicD(Number(e.target.value))}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="classic_c" className="mb-3">
                  <Form.Label>Numero Centrocampisti</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Inserisci numero centrocampisti"
                    step={1}
                    value={classicC}
                    onChange={(e) => setClassicC(Number(e.target.value))}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="classic_a" className="mb-3">
                  <Form.Label>Numero Attaccanti</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Inserisci numero attaccanti"
                    step={1}
                    value={classicA}
                    onChange={(e) => setClassicA(Number(e.target.value))}
                    required
                  />
                </Form.Group>
              </>
              :
              <>
                <Form.Group controlId="mantra_por_min" className="mb-3">
                  <Form.Label>Numero minimo Portieri</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Inserisci numero minimo portieri"
                    step={1}
                    value={mantraPorMin}
                    onChange={(e) => setMantraPorMin(Number(e.target.value))}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="mantra_por_max" className="mb-3">
                  <Form.Label>Numero massimo Portieri</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Inserisci numero massimo portieri"
                    step={1}
                    value={mantraPorMax}
                    onChange={(e) => setMantraPorMax(Number(e.target.value))}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="mantra_mov_min" className="mb-3">
                  <Form.Label>Numero minimo Giocatori Movimento</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Inserisci numero minimo giocatori movimento"
                    step={1}
                    value={mantraMovMin}
                    onChange={(e) => setMantraMovMin(Number(e.target.value))}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="mantra_mov_max" className="mb-3">
                  <Form.Label>Numero massimo Giocatori Movimento</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Inserisci numero massimo giocatori movimento"
                    step={1}
                    value={mantraMovMax}
                    onChange={(e) => setMantraMovMax(Number(e.target.value))}
                    required
                  />
                </Form.Group>
              </>
          }
          <Button
            variant="primary"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Creando..." : "Crea Fantallenatore"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default AddFantallenatoreForm;
