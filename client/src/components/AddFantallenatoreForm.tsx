import { useState } from 'react';
import { Button, Form, Modal } from "react-bootstrap";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Asta from '../entities/asta';

interface AddFantallenatoreFormProps {
  show: boolean;
  onHide: () => void;
  asta: Asta;
  asta_id: string | undefined;
  setDirty: (dirty: boolean) => void;
}

// Modal per aggiungere un fantallenatore all'asta
function AddFantallenatoreForm(props: AddFantallenatoreFormProps) {

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await API.addFantallenatore(Number(props.asta_id), nameFantallenatore, maxCreditiFantallenatore, classicP, classicD, classicC, classicA, mantraPorMin, mantraPorMax, mantraMovMin, mantraMovMax);

      if (response && response.ok) {
        showToast.success("Fantallenatore created successfully");
        setNameFantallenatore("");
        setMaxCreditiFantallenatore(1000);
        props.setDirty(true);
        props.onHide();
      } else {
        showToast.error("Failed to create the Fantallenatore");
      }
    } catch {
      showToast.error("Failed to create the Fantallenatore");
    } finally {
      setIsCreating(false);
    }
  };

  const numberField = (id: string, label: string, value: number, setValue: (v: number) => void) => (
    <Form.Group controlId={id}>
      <Form.Label className="mb-1 small text-secondary">{label}</Form.Label>
      <Form.Control
        type="number"
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        required
      />
    </Form.Group>
  );

  return (
    <Modal show={props.show} onHide={props.onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi fantallenatore</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
            <Form.Group controlId="add-fantallenatore-name">
              <Form.Label className="mb-1 small text-secondary">Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Inserisci nome fantallenatore"
                value={nameFantallenatore}
                onChange={(e) => setNameFantallenatore(e.target.value)}
                required
                autoFocus
                disabled={isCreating}
              />
            </Form.Group>
            {numberField("add-fantallenatore-max-crediti", "Max crediti", maxCreditiFantallenatore, setMaxCreditiFantallenatore)}
          </div>
          <hr />
          {
            props.asta.type == "classic" ?
              <div className="d-grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                {numberField("classic_p", "Portieri", classicP, setClassicP)}
                {numberField("classic_d", "Difensori", classicD, setClassicD)}
                {numberField("classic_c", "Centrocampisti", classicC, setClassicC)}
                {numberField("classic_a", "Attaccanti", classicA, setClassicA)}
              </div>
              :
              <div className="d-grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {numberField("mantra_por_min", "Portieri min", mantraPorMin, setMantraPorMin)}
                {numberField("mantra_por_max", "Portieri max", mantraPorMax, setMantraPorMax)}
                {numberField("mantra_mov_min", "Movimento min", mantraMovMin, setMantraMovMin)}
                {numberField("mantra_mov_max", "Movimento max", mantraMovMax, setMantraMovMax)}
              </div>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide} disabled={isCreating}>
            Annulla
          </Button>
          <Button variant="success" type="submit" disabled={isCreating}>
            {isCreating ? "Creando..." : "Crea Fantallenatore"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AddFantallenatoreForm;
