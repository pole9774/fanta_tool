import { Button, Form, Card } from "react-bootstrap";
import { useState } from 'react';
import { showToast } from '../utilities/toast';
import { getFantallenatoreStats, quotaTitle } from '../utilities/fantallenatoreStats';
import { useBalancedColumns } from '../hooks/useBalancedColumns';
import API from "../API/API";
import Asta from '../entities/asta';
import PlayerTaken from "../entities/playerTaken";
import Fantallenatore from '../entities/fantallenatore';
import AddFantallenatoreForm from "./AddFantallenatoreForm";
import EditFantallenatoreForm from "./EditFantallenatoreForm";
import RoleBadge, { PlayerRoles } from "./RoleBadge";
import TeamLogo from "./TeamLogo";

// Larghezza minima (px) di una colonna fantallenatore: sotto questa soglia gli elenchi vengono divisi su due file
const MIN_COLUMN_WIDTH = 150;
const GRID_GAP = 6;

interface TakenPageProps {
  asta: Asta;
  asta_id: string | undefined;
  playersTaken: PlayerTaken[];
  fantallenatoriAsta: Fantallenatore[];
  setDirty: (dirty: boolean) => void;
}

function TakenPage(props: TakenPageProps) {

  // Colonne della griglia: tutti i fantallenatori su una fila se c'è spazio, altrimenti due file (es. 5 + 5)
  const { ref: gridRef, columns } = useBalancedColumns(props.fantallenatoriAsta.length, MIN_COLUMN_WIDTH, GRID_GAP);

  const [assigningPlayerId, setAssigningPlayerId] = useState<number | null>(null);
  const [assignCrediti, setAssignCrediti] = useState<number>(1);
  const [assignFantallenatoreId, setAssignFantallenatoreId] = useState<number>();
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  const [showAddFantallenatore, setShowAddFantallenatore] = useState<boolean>(false);
  // Fantallenatore di cui è aperto il modal di modifica (nome, crediti massimi, limiti per ruolo)
  const [editingFantallenatore, setEditingFantallenatore] = useState<Fantallenatore | null>(null);

  const handleAssignClick = (player: PlayerTaken) => {
    setAssigningPlayerId(player.id);
    setAssignFantallenatoreId(player.fantallenatore_id);
    setAssignCrediti(player.crediti);
  };

  const handleSaveAssign = async (playerId: number, fantallenatoreId: number, crediti: number) => {
    setIsAssigning(true);

    try {
      const response = await API.reassignPlayer(playerId, fantallenatoreId, crediti);

      if (response && response.ok) {
        showToast.success("Player reassigned successfully");
        setAssigningPlayerId(null);
        props.setDirty(true);
      } else {
        showToast.error("Failed to reassign the player");
      }
    } catch {
      showToast.error("Failed to reassign the player");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCancelAssign = async (player: PlayerTaken) => {
    const confirmed = window.confirm(
      `Cancellare l'acquisto di ${player.name}?`
    );
    if (!confirmed) return;

    try {
      const response = await API.cancelAssign(Number(props.asta_id), player.id, player.name);

      if (response && response.ok) {
        showToast.success("Player cancel assigned successfully");
        setAssigningPlayerId(null);
        props.setDirty(true);
      } else {
        showToast.error("Failed to cancel assign the player");
      }
    } catch {
      showToast.error("Failed to cancel assign the player");
    }
  };

  const handleExportFantallenatoriWithPlayersTxt = () => {
    const lines: string[] = [];

    lines.push(`Asta: ${props.asta?.name ?? props.asta_id}`);
    lines.push(`Tipo: ${props.asta?.type ?? "-"}`);
    lines.push(`Generated at: ${new Date().toLocaleString()}`);
    lines.push("");

    props.fantallenatoriAsta.forEach((f: Fantallenatore, index: number) => {
      lines.push(`${index + 1}. ${f.name}`);
      lines.push(`   Max crediti: ${f.max_crediti}`);
      lines.push(`   Crediti spesi: ${f.crediti_spent}`);

      if (props.asta.type == "classic") {
        lines.push(`   Acquistabili: P ${f.classic_p}, D ${f.classic_d}, C ${f.classic_c}, A ${f.classic_a}`);
      } else {
        lines.push(`   Acquistabili: P min ${f.mantra_por_min}, P max ${f.mantra_por_max}, mov min ${f.mantra_mov_min}, mov max ${f.mantra_mov_max}`);
      }

      const players = props.playersTaken.filter(
        (p: PlayerTaken) => p.fantallenatore_id === f.id
      );

      if (players.length === 0) {
        lines.push(`   Giocatori: -`);
      } else {
        lines.push(`   Giocatori (${players.length}):`);
        players.forEach((p: PlayerTaken, i: number) => {
          const roleLabel = props.asta?.type === "classic" ? p.role : p.role_mantra;
          lines.push(
            `     ${i + 1}) ${p.name} - ${p.team} - ${roleLabel} - Crediti: ${p.crediti}`
          );
        });
      }

      lines.push("");
    });

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `fantallenatori_players_asta_${props.asta_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <span className="text-secondary small">Clicca sull'intestazione di un fantallenatore per modificarlo, sui crediti di un giocatore per modificarne l'acquisto.</span>
        <div className="ms-auto d-flex gap-2">
          <Button variant="success" size="sm" onClick={() => setShowAddFantallenatore(true)}>
            <i className="bi bi-person-plus me-1"></i>Fantallenatore
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={handleExportFantallenatoriWithPlayersTxt}>
            <i className="bi bi-download me-1"></i>Esporta acquisti
          </Button>
        </div>
      </div>

      {
        props.fantallenatoriAsta.length == 0 ?
          <p className="text-secondary">Nessun fantallenatore. Aggiungine uno con "Fantallenatore".</p>
          : <></>
      }

      <div
        ref={gridRef}
        className="pb-4"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: GRID_GAP,
        }}
      >
        {
          props.fantallenatoriAsta.map((fantallenatore: Fantallenatore) => {
            const stats = getFantallenatoreStats(fantallenatore, props.playersTaken, props.asta.type);
            const players = props.playersTaken.filter((player: PlayerTaken) => player.fantallenatore_id == fantallenatore.id);

            return (
              <Card key={fantallenatore.id} className="mb-0" style={{ minWidth: 0 }}>
                <Card.Body className="p-1">
                  {/* Intestazione: nome, crediti, puntata massima, quote. Cliccabile per modificare il fantallenatore */}
                  <div
                    className="taken-column-header mb-1"
                    role="button"
                    title="Modifica fantallenatore"
                    onClick={() => setEditingFantallenatore(fantallenatore)}
                  >
                    <div className="d-flex align-items-center gap-1">
                      <span className="fs-5 fw-semibold text-truncate flex-grow-1" style={{ minWidth: 0 }} title={fantallenatore.name}>
                        {fantallenatore.name}
                      </span>
                      <i className="bi bi-pencil text-secondary small flex-shrink-0"></i>
                    </div>
                    <div className="d-flex align-items-baseline flex-wrap column-gap-2">
                      <span className="fs-4 fw-bold">
                        {stats.remaining}<i className="bi bi-coin ms-1 text-warning" style={{ fontSize: "0.9rem" }}></i>
                      </span>
                      <span className="small text-secondary">tot. {fantallenatore.max_crediti}</span>
                      <span className="small max-bid" title="Puntata massima: crediti residui meno 1 per ogni altro giocatore ancora da acquistare">
                        max {stats.maxBid}
                      </span>
                    </div>
                    <div className="d-flex flex-wrap align-items-center column-gap-2 row-gap-1 small mt-1">
                      {
                        stats.quotas.map((q) => (
                          <span key={q.role} className="d-inline-flex align-items-center gap-1 text-nowrap" title={quotaTitle(q)}>
                            <RoleBadge astaType={props.asta.type} role={q.role} size="sm" />
                            {q.taken}/{q.max}
                            {q.min != undefined ? <span className="text-secondary">(min {q.min})</span> : <></>}
                          </span>
                        ))
                      }
                    </div>
                  </div>

                  {
                    players.map((player: PlayerTaken) => (
                      <div key={player.id} className="taken-row">
                        {/* riga unica: nome, ruoli, logo squadra, crediti (cliccabili per modificare l'acquisto) */}
                        <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.78rem", lineHeight: 1.2 }}>
                          <span
                            className="text-truncate fw-semibold flex-grow-1"
                            style={{ minWidth: 0 }}
                            title={player.name}
                          >
                            {player.name}
                          </span>
                          <PlayerRoles astaType={props.asta.type} role={player.role} roleMantra={player.role_mantra} size="sm" />
                          <TeamLogo team={player.team} size={14} />
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none text-end flex-shrink-0 fw-semibold"
                            style={{ minWidth: "2.1em", fontSize: "inherit", lineHeight: "inherit" }}
                            title="Modifica acquisto"
                            onClick={() =>
                              player.id == assigningPlayerId ? setAssigningPlayerId(null) : handleAssignClick(player)
                            }
                          >
                            {player.crediti}
                          </Button>
                        </div>
                        {
                          player.id == assigningPlayerId ?
                            <div className="mt-2">
                              <Form.Group controlId={`assign-fantallenatore-${player.id}`} className="mb-1">
                                <Form.Select
                                  size="sm"
                                  value={assignFantallenatoreId}
                                  onChange={(e) => setAssignFantallenatoreId(Number(e.target.value))}
                                >
                                  {
                                    props.fantallenatoriAsta.map((f: Fantallenatore) => (
                                      <option key={f.id} value={f.id}>{f.name}</option>
                                    ))
                                  }
                                </Form.Select>
                              </Form.Group>
                              <Form.Group controlId={`assign-crediti-${player.id}`} className="mb-1">
                                <Form.Control
                                  size="sm"
                                  type="number"
                                  placeholder="Insert crediti"
                                  step={1}
                                  value={assignCrediti}
                                  onChange={(e) => setAssignCrediti(Number(e.target.value))}
                                  required
                                />
                              </Form.Group>
                              <div className="d-flex flex-row gap-1 justify-content-end mb-1">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  title="Annulla l'acquisto (il giocatore torna disponibile)"
                                  onClick={() => handleCancelAssign(player)}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                                <Button
                                  variant="success"
                                  size="sm"
                                  title="Salva"
                                  onClick={() => handleSaveAssign(player.id, assignFantallenatoreId ?? 0, assignCrediti)}
                                  disabled={isAssigning}
                                >
                                  {isAssigning ? "..." : <i className="bi bi-check-lg"></i>}
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  title="Chiudi"
                                  onClick={() => setAssigningPlayerId(null)}
                                >
                                  <i className="bi bi-x-lg"></i>
                                </Button>
                              </div>
                            </div>
                            : <></>
                        }
                      </div>
                    ))
                  }
                  {
                    players.length == 0 ?
                      <div className="taken-row small text-secondary">Nessun acquisto</div>
                      : <></>
                  }
                </Card.Body>
              </Card>
            );
          })
        }
      </div>

      <AddFantallenatoreForm
        show={showAddFantallenatore}
        onHide={() => setShowAddFantallenatore(false)}
        setDirty={props.setDirty}
        asta_id={props.asta_id}
        asta={props.asta}
      />
      {
        editingFantallenatore ?
          <EditFantallenatoreForm
            key={`edit-${editingFantallenatore.id}`}
            asta={props.asta}
            asta_id={props.asta_id ?? ""}
            fantallenatore={editingFantallenatore}
            nPlayersTaken={props.playersTaken.filter((p: PlayerTaken) => p.fantallenatore_id == editingFantallenatore.id).length}
            setDirty={props.setDirty}
            onClose={() => setEditingFantallenatore(null)}
          />
          : <></>
      }
    </>
  );
}

export default TakenPage;
