import { useState } from 'react';
import { Button, Form, Modal } from "react-bootstrap";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Fantallenatore from '../entities/fantallenatore';
import Asta from '../entities/asta';

interface EditFantallenatoreFormProps {
  asta: Asta;
  asta_id: string | number;
  fantallenatore: Fantallenatore;
  // giocatori acquistati dal fantallenatore: se > 0 non può essere eliminato
  nPlayersTaken: number;
  setDirty: (dirty: boolean) => void;
  onClose: () => void;
}

// Modal (aperto da TakenPage) per modificare nome, crediti massimi e limiti per ruolo di un fantallenatore,
// o per eliminarlo se non ha ancora acquistato giocatori
function EditFantallenatoreForm(props: EditFantallenatoreFormProps) {

  const f: Fantallenatore = props.fantallenatore;

  const [name, setName] = useState<string>(f.name);
  const [maxCrediti, setMaxCrediti] = useState<number>(f.max_crediti);
  const [classicP, setClassicP] = useState<number>(f.classic_p);
  const [classicD, setClassicD] = useState<number>(f.classic_d);
  const [classicC, setClassicC] = useState<number>(f.classic_c);
  const [classicA, setClassicA] = useState<number>(f.classic_a);
  const [mantraPorMin, setMantraPorMin] = useState<number>(f.mantra_por_min);
  const [mantraPorMax, setMantraPorMax] = useState<number>(f.mantra_por_max);
  const [mantraMovMin, setMantraMovMin] = useState<number>(f.mantra_mov_min);
  const [mantraMovMax, setMantraMovMax] = useState<number>(f.mantra_mov_max);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const canDelete = props.nPlayersTaken == 0;

  const handleDelete = async () => {
    if (!canDelete) return;
    const confirmed = window.confirm(`Eliminare il fantallenatore ${f.name}?`);
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await API.deleteFantallenatore(Number(props.asta_id), f.id);

      if (response && response.ok) {
        showToast.success("Fantallenatore deleted successfully");
        props.setDirty(true);
        props.onClose();
      } else {
        showToast.error("Failed to delete the Fantallenatore");
      }
    } catch {
      showToast.error("Failed to delete the Fantallenatore");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (name.trim() == "") {
      showToast.error("Il nome non può essere vuoto");
      return;
    }

    if (props.asta.type != "classic" && (mantraPorMin > mantraPorMax || mantraMovMin > mantraMovMax)) {
      showToast.error("Il minimo non può superare il massimo");
      return;
    }

    setIsSaving(true);

    try {
      const response = await API.updateFantallenatore(Number(props.asta_id), f.id, {
        name: name.trim(),
        max_crediti: maxCrediti,
        classic_p: classicP,
        classic_d: classicD,
        classic_c: classicC,
        classic_a: classicA,
        mantra_por_min: mantraPorMin,
        mantra_por_max: mantraPorMax,
        mantra_mov_min: mantraMovMin,
        mantra_mov_max: mantraMovMax
      });

      if (response && response.ok) {
        showToast.success("Fantallenatore updated successfully");
        props.setDirty(true);
        props.onClose();
      } else {
        showToast.error("Failed to update the Fantallenatore");
      }
    } catch {
      showToast.error("Failed to update the Fantallenatore");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSave();
  };

  // Campo numerico con etichetta corta, per le griglie 2x2
  const numberField = (id: string, label: string, value: number, setValue: (v: number) => void) => (
    <Form.Group controlId={`edit-${id}-${f.id}`}>
      <Form.Label className="mb-1 small text-secondary">{label}</Form.Label>
      <Form.Control
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </Form.Group>
  );

  return (
    <Modal show onHide={props.onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Modifica fantallenatore</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
            <Form.Group controlId={`edit-name-${f.id}`}>
              <Form.Label className="mb-1 small text-secondary">Nome</Form.Label>
              <Form.Control
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            {numberField("max-crediti", "Max crediti", maxCrediti, setMaxCrediti)}
          </div>
          <hr />
          {
            props.asta.type == "classic" ?
              <div className="d-grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                {numberField("classic-p", "Portieri", classicP, setClassicP)}
                {numberField("classic-d", "Difensori", classicD, setClassicD)}
                {numberField("classic-c", "Centrocampisti", classicC, setClassicC)}
                {numberField("classic-a", "Attaccanti", classicA, setClassicA)}
              </div>
              :
              <div className="d-grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {numberField("mantra-por-min", "Portieri min", mantraPorMin, setMantraPorMin)}
                {numberField("mantra-por-max", "Portieri max", mantraPorMax, setMantraPorMax)}
                {numberField("mantra-mov-min", "Movimento min", mantraMovMin, setMantraMovMin)}
                {numberField("mantra-mov-max", "Movimento max", mantraMovMax, setMantraMovMax)}
              </div>
          }
          {
            !canDelete ?
              <p className="small text-secondary mt-3 mb-0">
                Ha {props.nPlayersTaken} giocatori acquistati: non può essere eliminato.
              </p>
              : <></>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-danger"
            className="me-auto"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting || isSaving}
            title={canDelete ? "Elimina fantallenatore" : "Non eliminabile: ha giocatori acquistati"}
          >
            <i className="bi bi-trash me-1"></i>{isDeleting ? "Eliminando..." : "Elimina"}
          </Button>
          <Button variant="secondary" onClick={props.onClose} disabled={isSaving}>
            Annulla
          </Button>
          <Button variant="success" type="submit" disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salva"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditFantallenatoreForm;
