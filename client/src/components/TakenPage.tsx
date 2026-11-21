import { Button, Form, Card } from "react-bootstrap";
import { useState, useEffect, useRef } from 'react';
import { showToast } from '../utilities/toast';
import API from "../API/API";
import PlayerTaken from "../entities/playerTaken";
import Fantallenatore from '../entities/fantallenatore';
import AddFantallenatoreForm from "./AddFantallenatoreForm";
import EditFantallenatoreForm from "./EditFantallenatoreForm";

// Larghezza minima (px) di una colonna fantallenatore: sotto questa soglia gli elenchi vengono divisi su due file
const MIN_COLUMN_WIDTH = 150;
const GRID_GAP = 4;

function TakenPage(props: any) {

  // Colonne della griglia: tutti i fantallenatori su una fila se c'è spazio, altrimenti due file (es. 5 + 5)
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState<number>(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => setGridWidth(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nFantallenatori: number = props.fantallenatoriAsta.length;
  const fitsOneRow = gridWidth == 0 || (gridWidth - GRID_GAP * (nFantallenatori - 1)) / nFantallenatori >= MIN_COLUMN_WIDTH;
  const columns = Math.max(fitsOneRow ? nFantallenatori : Math.ceil(nFantallenatori / 2), 1);

  const [assigningPlayerId, setAssigningPlayerId] = useState<number | null>(null);
  const [assignCrediti, setAssignCrediti] = useState<number>(1);
  const [assignFantallenatoreId, setAssignFantallenatoreId] = useState<number>();
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Fantallenatore di cui è aperto il form di modifica (nome, crediti massimi, limiti per ruolo)
  const [editingFantallenatoreId, setEditingFantallenatoreId] = useState<number | null>(null);

  const toggleEditFantallenatore = (fantallenatoreId: number) => {
    setEditingFantallenatoreId((current) => current == fantallenatoreId ? null : fantallenatoreId);
  };

  const editFantallenatoreTriggerProps = (fantallenatoreId: number) => ({
    role: "button",
    title: "Modifica fantallenatore",
    style: { cursor: "pointer" },
    onClick: () => toggleEditFantallenatore(fantallenatoreId),
  });

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
    } catch (error) {
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
    } catch (error) {
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

  type MainType = "classic" | "mantra";
  type CardColor = "warning" | "success" | "primary" | "info" | "danger" | "secondary";

  type ClassicRole = "P" | "D" | "C" | "A";
  type MantraRole = "P" | "Dc" | "B" | "Dd" | "Ds" | "E" | "M" | "C" | "T" | "W" | "A" | "Pc";
  type Role = ClassicRole | MantraRole;

  const colorMap: Record<MainType, Partial<Record<Role, CardColor>>> = {
    classic: {
      P: "warning",
      D: "success",
      C: "primary",
      A: "danger",
    },
    mantra: {
      P: "warning",
      Dc: "success",
      B: "success",
      Dd: "success",
      Ds: "success",
      E: "primary",
      M: "primary",
      C: "info",
      T: "info",
      W: "danger",
      A: "danger",
      Pc: "danger",
    },
  };

  function getCardColor(playerRole: string): CardColor {
    const type = props.asta.type as MainType;
    const role = playerRole as Role;
    return colorMap[type]?.[role] ?? "secondary";
  }

  function getRoleTakenNumber(fantallenatore: Fantallenatore, role: string): number {
    var count: number = 0;
    
    for (const player of props.playersTaken) {
      if (player.fantallenatore_id == fantallenatore.id) {
        if (props.asta.type == "classic") {
          if (player.role == role) {
            count++;
          }
        } else {
          if (role == "P") {
            if (player.role == "P") {
              count++;
            }
          } else {
            if (player.role != "P") {
              count++;
            }
          }
        }
      }
    }

    return count;
  }

  return (
    <>
      <div
        ref={gridRef}
        className="pb-2"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: GRID_GAP,
        }}
      >
        {
          props.fantallenatoriAsta.map((fantallenatore: Fantallenatore) => (
            <Card
              key={fantallenatore.id}
              className="mb-0 px-0"
              style={{ minWidth: 0 }}
            >
              <Card.Body className="px-1 pt-2">
                <Card.Title className="fs-4 px-1 fw-semibold text-truncate" title={fantallenatore.name}>{fantallenatore.name}</Card.Title>
                <p className="mb-3 px-1" {...editFantallenatoreTriggerProps(fantallenatore.id)}>
                  {fantallenatore.max_crediti - fantallenatore.crediti_spent}🪙 {"(tot. " + fantallenatore.max_crediti + ")"}
                </p>
                {
                  props.playersTaken
                    .filter((player: PlayerTaken) => player.fantallenatore_id == fantallenatore.id)
                    .map((player: PlayerTaken) => (
                      <Card key={player.id} className="mb-0">
                        <Card.Body className="py-1 px-1">
                          {/* riga unica: nome, ruoli, logo squadra, crediti (cliccabili per modificare l'acquisto) */}
                          <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.78rem", lineHeight: 1.2 }}>
                            <span
                              className="text-truncate fw-semibold flex-grow-1"
                              style={{ minWidth: 0 }}
                              title={player.name}
                            >
                              {player.name}
                            </span>
                            <span className="d-inline-flex align-items-center flex-shrink-0" style={{ gap: 1 }}>
                              {
                                props.asta.type == "classic" ?
                                  <span
                                    className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor(player.role)} text-white`}
                                    style={{ width: 14, height: 14, fontSize: "0.62rem" }}
                                  >
                                    {player.role}
                                  </span>
                                  : (
                                    player.role_mantra
                                      .split("/")
                                      .map((r: string) => r.trim())
                                      .filter(Boolean)
                                      .map((r: string) => (
                                        <span
                                          key={`${player.id}-${r}`}
                                          className={`d-inline-flex align-items-center justify-content-center rounded-pill bg-${getCardColor(r)} text-white`}
                                          style={{ minHeight: 14, fontSize: "0.62rem", paddingLeft: 3, paddingRight: 3 }}
                                        >
                                          {r}
                                        </span>
                                      ))
                                  )
                              }
                            </span>
                            <img
                              src={`/teams/${player.team}.png`}
                              alt={player.team}
                              title={player.team}
                              style={{ width: 14, height: 14, objectFit: "contain" }}
                              className="flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = "/teams/default.png";
                              }}
                            />
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-decoration-none text-end flex-shrink-0"
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
                                    onClick={() => handleCancelAssign(player)}
                                  >
                                    ✕
                                  </Button>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleSaveAssign(player.id, assignFantallenatoreId ?? 0, assignCrediti)}
                                    disabled={isAssigning}
                                  >
                                    {isAssigning ? "..." : "✓"}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setAssigningPlayerId(null)}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              </div>
                              : <></>
                          }
                        </Card.Body>
                      </Card>
                    ))
                }
                {
                  props.asta.type == "classic" ?
                    <p className="mb-0 mt-4 px-1 small" {...editFantallenatoreTriggerProps(fantallenatore.id)}>
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("P")} text-white me-2`}
                        style={{ width: 16, height: 16, fontSize: "0.70rem" }}
                      >
                        P
                      </span>
                      {getRoleTakenNumber(fantallenatore, "P") + " / " + fantallenatore.classic_p}
                      <br />
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("D")} text-white me-2`}
                        style={{ width: 16, height: 16, fontSize: "0.70rem" }}
                      >
                        D
                      </span>
                      {getRoleTakenNumber(fantallenatore, "D") + " / " + fantallenatore.classic_d}
                      <br />
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("C")} text-white me-2`}
                        style={{ width: 16, height: 16, fontSize: "0.70rem" }}
                      >
                        C
                      </span>
                      {getRoleTakenNumber(fantallenatore, "C") + " / " + fantallenatore.classic_c}
                      <br />
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("A")} text-white me-2`}
                        style={{ width: 16, height: 16, fontSize: "0.70rem" }}
                      >
                        A
                      </span>
                      {getRoleTakenNumber(fantallenatore, "A") + " / " + fantallenatore.classic_a}
                    </p>
                    :
                    <p className="mb-0 mt-4 px-1 small" {...editFantallenatoreTriggerProps(fantallenatore.id)}>
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("P")} text-white me-1`}
                        style={{ width: 16, height: 16, fontSize: "0.70rem" }}
                      >
                        P
                      </span>
                      {getRoleTakenNumber(fantallenatore, "P") + " (min " + fantallenatore.mantra_por_min}; max {fantallenatore.mantra_por_max + ")"}
                      <br />
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-pill bg-${"success"} text-white px-1 me-1`}
                        style={{ minHeight: 16, fontSize: "0.70rem" }}
                      >
                        M
                      </span>
                      {getRoleTakenNumber(fantallenatore, "mov") + " (min " + fantallenatore.mantra_mov_min}; max {fantallenatore.mantra_mov_max + ")"}
                    </p>
                }
                {
                  editingFantallenatoreId == fantallenatore.id ?
                    <EditFantallenatoreForm
                      key={`edit-${fantallenatore.id}`}
                      asta={props.asta}
                      asta_id={props.asta_id}
                      fantallenatore={fantallenatore}
                      setDirty={props.setDirty}
                      onClose={() => setEditingFantallenatoreId(null)}
                    />
                    : <></>
                }
              </Card.Body>
            </Card>
          ))
        }
      </div>
      <AddFantallenatoreForm setDirty={props.setDirty} asta_id={props.asta_id} asta={props.asta} />
      <Button
        variant="secondary"
        className="my-5"
        onClick={handleExportFantallenatoriWithPlayersTxt}
      >
        Esporta Acquisti
      </Button>
    </>
  );
}

export default TakenPage;
