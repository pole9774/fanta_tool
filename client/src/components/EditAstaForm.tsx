import { useEffect, useState } from 'react';
import { Button, Form, Modal } from "react-bootstrap";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Asta from '../entities/asta';
import AstaTypeBadge from './AstaTypeBadge';

interface EditAstaFormProps {
  asta: Asta;
  setDirty: (dirty: boolean) => void;
  onClose: () => void;
}

interface AstaCounts {
  players: number;
  fantallenatori: number;
  players_taken: number;
}

// Modal (aperto dalla card in Home) per modificare nome e numero partecipanti di un'asta, o per eliminarla
// insieme a tutti i suoi giocatori, fantallenatori e acquisti (conferma scrivendo il nome dell'asta)
function EditAstaForm(props: EditAstaFormProps) {

  const [name, setName] = useState<string>(props.asta.name);
  const [nFantallenatori, setNFantallenatori] = useState<number>(props.asta.n_fantallenatori);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [counts, setCounts] = useState<AstaCounts | null>(null);
  const [confirmName, setConfirmName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    API.getAstaCounts(props.asta.id)
      .then(setCounts)
      .catch(() => showToast.error("Failed to load the Asta counts"));
  }, [props.asta.id]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (name.trim() == "") {
      showToast.error("Il nome non può essere vuoto");
      return;
    }
    if (!Number.isInteger(nFantallenatori) || nFantallenatori < 1) {
      showToast.error("Il numero di partecipanti deve essere almeno 1");
      return;
    }

    setIsSaving(true);

    try {
      const response = await API.updateAsta(props.asta.id, name.trim(), nFantallenatori);

      if (response && response.ok) {
        showToast.success("Asta updated successfully");
        props.setDirty(true);
        props.onClose();
      } else {
        showToast.error("Failed to update the Asta");
      }
    } catch {
      showToast.error("Failed to update the Asta");
    } finally {
      setIsSaving(false);
    }
  };

  const canDelete = confirmName == props.asta.name;

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);

    try {
      const response = await API.deleteAsta(props.asta.id);

      if (response && response.ok) {
        showToast.success("Asta deleted successfully");
        props.setDirty(true);
        props.onClose();
      } else {
        showToast.error("Failed to delete the Asta");
      }
    } catch {
      showToast.error("Failed to delete the Asta");
    } finally {
      setIsDeleting(false);
    }
  };

  const busy = isSaving || isDeleting;

  return (
    <Modal show onHide={props.onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modifica asta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* form di modifica separato dalla sezione di eliminazione: Invio nel campo di conferma non salva */}
        <Form onSubmit={handleSave}>
          <div className="d-grid gap-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
            <Form.Group controlId={`edit-asta-name-${props.asta.id}`}>
              <Form.Label className="mb-1 small text-secondary">Nome</Form.Label>
              <Form.Control
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
              />
            </Form.Group>
            <Form.Group controlId={`edit-asta-n-${props.asta.id}`}>
              <Form.Label className="mb-1 small text-secondary">Partecipanti</Form.Label>
              <Form.Control
                type="number"
                min={1}
                step={1}
                value={nFantallenatori}
                onChange={(e) => setNFantallenatori(Number(e.target.value))}
                disabled={busy}
              />
            </Form.Group>
          </div>
          <div className="small text-secondary mt-2">
            Formato: <AstaTypeBadge type={props.asta.type} /> (non modificabile)
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" onClick={props.onClose} disabled={busy}>
              Annulla
            </Button>
            <Button variant="success" type="submit" disabled={busy}>
              {isSaving ? "Salvando..." : "Salva"}
            </Button>
          </div>
        </Form>

        <hr className="my-4" />

        {/* Eliminazione: irreversibile, si conferma scrivendo il nome dell'asta */}
        <h6 className="text-danger mb-2"><i className="bi bi-exclamation-triangle me-1"></i>Elimina asta</h6>
        <p className="small mb-2">
          {
            counts ?
              <>
                Verranno eliminati <strong>{counts.players}</strong> giocatori, <strong>{counts.fantallenatori}</strong> fantallenatori
                e <strong>{counts.players_taken}</strong> acquisti. L&apos;operazione non è reversibile.
              </>
              : "Verranno eliminati tutti i giocatori, i fantallenatori e gli acquisti dell'asta. L'operazione non è reversibile."
          }
        </p>
        <Form.Group controlId={`delete-asta-confirm-${props.asta.id}`} className="mb-2">
          <Form.Label className="mb-1 small text-secondary">
            Scrivi <strong className="text-body">{props.asta.name}</strong> per confermare
          </Form.Label>
          <Form.Control
            type="text"
            autoComplete="off"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            disabled={busy}
          />
        </Form.Group>
        <div className="d-flex justify-content-end">
          <Button variant="danger" onClick={handleDelete} disabled={!canDelete || busy}>
            <i className="bi bi-trash me-1"></i>{isDeleting ? "Eliminando..." : "Elimina definitivamente"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default EditAstaForm;
