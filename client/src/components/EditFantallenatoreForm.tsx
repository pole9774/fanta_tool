import { useState } from 'react';
import { Button, Form } from "react-bootstrap";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Fantallenatore from '../entities/fantallenatore';
import Asta from '../entities/asta';

interface EditFantallenatoreFormProps {
  asta: Asta;
  asta_id: string | number;
  fantallenatore: Fantallenatore;
  setDirty: (dirty: boolean) => void;
  onClose: () => void;
}

// Form compatto (dentro la card del fantallenatore in TakenPage) per modificare nome, crediti massimi e limiti per ruolo
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

  // Campo numerico piccolo con etichetta corta, per le griglie 2x2
  const numberField = (id: string, label: string, value: number, setValue: (v: number) => void) => (
    <Form.Group controlId={`edit-${id}-${f.id}`} className="mb-1">
      <Form.Label className="mb-0 small text-muted">{label}</Form.Label>
      <Form.Control
        size="sm"
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </Form.Group>
  );

  return (
    <div className="mt-3 px-1">
      <Form.Group controlId={`edit-name-${f.id}`} className="mb-1">
        <Form.Label className="mb-0 small text-muted">Nome</Form.Label>
        <Form.Control
          size="sm"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Group>
      {numberField("max-crediti", "Max crediti", maxCrediti, setMaxCrediti)}
      {
        props.asta.type == "classic" ?
          <div className="d-grid gap-1" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {numberField("classic-p", "P", classicP, setClassicP)}
            {numberField("classic-d", "D", classicD, setClassicD)}
            {numberField("classic-c", "C", classicC, setClassicC)}
            {numberField("classic-a", "A", classicA, setClassicA)}
          </div>
          :
          <div className="d-grid gap-1" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {numberField("mantra-por-min", "P min", mantraPorMin, setMantraPorMin)}
            {numberField("mantra-por-max", "P max", mantraPorMax, setMantraPorMax)}
            {numberField("mantra-mov-min", "Mov min", mantraMovMin, setMantraMovMin)}
            {numberField("mantra-mov-max", "Mov max", mantraMovMax, setMantraMovMax)}
          </div>
      }
      <div className="d-flex flex-row gap-1 justify-content-end mt-1">
        <Button
          variant="success"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "..." : "✓"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={props.onClose}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}

export default EditFantallenatoreForm;
