import { useState } from 'react';
import { Button, Form, Modal } from "react-bootstrap";
import { showToast } from '../utilities/toast';
import { CLASSIC_ROLES, MANTRA_ROLES } from '../utilities/roles';
import API from "../API/API";
import Asta from '../entities/asta';

interface AddPlayerFormProps {
  show: boolean;
  onHide: () => void;
  asta: Asta;
  asta_id: string | undefined;
  setDirty: (dirty: boolean) => void;
}

// Modal per aggiungere un giocatore. In mantra crea una riga per ogni ruolo (fino a 3), tutte con lo stesso role_mantra
function AddPlayerForm(props: AddPlayerFormProps) {

  const [playerName, setPlayerName] = useState<string>("");
  const [playerTeam, setPlayerTeam] = useState<string>("");
  const [playerRole1, setPlayerRole1] = useState<string>("");
  const [playerRole2, setPlayerRole2] = useState<string>("");
  const [playerRole3, setPlayerRole3] = useState<string>("");
  const [playerNotes, setPlayerNotes] = useState<string>("");

  const [isCreating, setIsCreating] = useState<boolean>(false);

  const resetFields = () => {
    setPlayerName("");
    setPlayerTeam("");
    setPlayerNotes("");
    setPlayerRole1("");
    setPlayerRole2("");
    setPlayerRole3("");
  };

  // Ruoli scelti, in ordine. Un ruolo successivo vale solo se quelli precedenti sono scelti
  const selectedRoles = [playerRole1, playerRole2, playerRole3].filter((r) => r != "");
  // role_mantra: "-" in classic, ruoli separati da "/" in mantra (es. "Dc/B")
  const playerRoleMantra = props.asta.type == "classic" ? "-" : selectedRoles.join("/");

  const changeRole1 = (role: string) => {
    setPlayerRole1(role);
    if (role == "") {
      setPlayerRole2("");
      setPlayerRole3("");
    }
  };

  const changeRole2 = (role: string) => {
    setPlayerRole2(role);
    if (role == "") setPlayerRole3("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (playerRole1 == "") {
      showToast.error("Scegli almeno un ruolo");
      return;
    }

    setIsCreating(true);

    try {
      // una POST per ruolo, in ordine; ci si ferma al primo errore
      let ok = true;
      for (const role of selectedRoles) {
        const response = await API.addPlayer(Number(props.asta_id), playerName, playerTeam, role, playerRoleMantra, playerNotes);
        if (!response || !response.ok) {
          ok = false;
          break;
        }
      }

      if (ok) {
        showToast.success("Player created successfully");
        resetFields();
        props.setDirty(true);
        props.onHide();
      } else {
        showToast.error("Failed to create the Player");
      }
    } catch {
      showToast.error("Failed to create the Player");
    } finally {
      setIsCreating(false);
    }
  };

  const roleOptions = (roles: readonly string[]) => (
    <>
      <option value="">-</option>
      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
    </>
  );

  return (
    <Modal show={props.show} onHide={props.onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi giocatore</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-3 mb-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Form.Group controlId="add-player-name">
              <Form.Label className="mb-1 small text-secondary">Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Inserisci nome giocatore"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                autoFocus
                disabled={isCreating}
              />
            </Form.Group>
            <Form.Group controlId="add-player-team">
              <Form.Label className="mb-1 small text-secondary">Squadra</Form.Label>
              <Form.Control
                type="text"
                placeholder="Inserisci squadra giocatore"
                value={playerTeam}
                onChange={(e) => setPlayerTeam(e.target.value)}
                required
                disabled={isCreating}
              />
            </Form.Group>
          </div>
          {
            props.asta.type == "classic" ?
              <Form.Group controlId="role_classic" className="mb-3" style={{ maxWidth: 200 }}>
                <Form.Label className="mb-1 small text-secondary">Ruolo</Form.Label>
                <Form.Select
                  value={playerRole1}
                  onChange={(e) => setPlayerRole1(e.target.value)}
                  required
                >
                  {roleOptions(CLASSIC_ROLES)}
                </Form.Select>
              </Form.Group>
              :
              <div className="d-grid gap-3 mb-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <Form.Group controlId="role_mantra_1">
                  <Form.Label className="mb-1 small text-secondary">Ruolo 1</Form.Label>
                  <Form.Select value={playerRole1} onChange={(e) => changeRole1(e.target.value)} required>
                    {roleOptions(MANTRA_ROLES)}
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="role_mantra_2">
                  <Form.Label className="mb-1 small text-secondary">Ruolo 2</Form.Label>
                  <Form.Select value={playerRole2} onChange={(e) => changeRole2(e.target.value)} disabled={playerRole1 == ""}>
                    {roleOptions(MANTRA_ROLES)}
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="role_mantra_3">
                  <Form.Label className="mb-1 small text-secondary">Ruolo 3</Form.Label>
                  <Form.Select value={playerRole3} onChange={(e) => setPlayerRole3(e.target.value)} disabled={playerRole2 == ""}>
                    {roleOptions(MANTRA_ROLES)}
                  </Form.Select>
                </Form.Group>
              </div>
          }
          <Form.Group controlId="add-player-notes">
            <Form.Label className="mb-1 small text-secondary">Note</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Inserisci note giocatore"
              rows={3}
              value={playerNotes}
              onChange={(e) => setPlayerNotes(e.target.value)}
              disabled={isCreating}
            />
          </Form.Group>
          <p className="small text-secondary mt-2 mb-0">Il giocatore viene aggiunto tra i non classificati.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide} disabled={isCreating}>
            Annulla
          </Button>
          <Button variant="success" type="submit" disabled={isCreating}>
            {isCreating ? "Creando..." : "Crea Giocatore"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AddPlayerForm;
