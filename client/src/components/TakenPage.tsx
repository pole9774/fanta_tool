import { Button, Form, Card } from "react-bootstrap";
import { useState } from 'react';
import { showToast } from '../utilities/toast';
import API from "../API/API";
import PlayerTaken from "../entities/playerTaken";
import Fantallenatore from '../entities/fantallenatore';
import AddFantallenatoreForm from "./AddFantallenatoreForm";

function TakenPage(props: any) {

  const [assigningPlayerId, setAssigningPlayerId] = useState<number | null>(null);
  const [assignCrediti, setAssignCrediti] = useState<number>(1);
  const [assignFantallenatoreId, setAssignFantallenatoreId] = useState<number>();
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

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

  return (
    <>
      <div
        className="d-flex flex-row flex-nowrap gap-2 overflow-auto pb-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {
          props.fantallenatoriAsta.map((fantallenatore: Fantallenatore) => (
            <Card
              key={fantallenatore.id}
              className="mb-0 px-0"
              style={{
                width: "250px",
                flex: "0 0 250px",
              }}
            >
              <Card.Body className="px-2">
                <Card.Title className="fs-3 px-1">{fantallenatore.name}</Card.Title>
                {
                  props.asta.type == "classic" ?
                    <p className="mb-3 px-1">
                      {fantallenatore.max_crediti - fantallenatore.crediti_spent} / {fantallenatore.max_crediti} crediti rimanenti
                    </p>
                    :
                    <p className="mb-3 px-1">
                      {fantallenatore.max_crediti - fantallenatore.crediti_spent} / {fantallenatore.max_crediti} crediti rimanenti
                    </p>
                }
                {
                  props.playersTaken.map((player: PlayerTaken) => (
                    player.fantallenatore_id == fantallenatore.id ?
                      <Card className="mb-1">
                        <Card.Body className="py-2 px-2">
                          <div className="d-flex justify-content-between align-items-start gap-3">
                            <div className="flex-grow-1">
                              <Card.Title>
                                {player.name}
                              </Card.Title>
                              <Card.Subtitle>
                                {
                                  props.asta.type == "classic" ?
                                    <span
                                      className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor(player.role)} text-white`}
                                      style={{ width: 20, height: 20, fontSize: "0.75rem" }}
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
                                            className={`d-inline-flex align-items-center justify-content-center rounded-pill bg-${getCardColor(r)} text-white px-2`}
                                            style={{ minHeight: 20, fontSize: "0.75rem" }}
                                          >
                                            {r}
                                          </span>
                                        ))
                                    )
                                }
                                <span>
                                  {" " + player.team + " | " + player.crediti}🪙
                                </span>
                              </Card.Subtitle>
                              {
                                player.id == assigningPlayerId ?
                                  <div className="mt-3">
                                    <Form.Group controlId={`assign-fantallenatore-${player.id}`} className="mb-2">
                                      <Form.Select
                                        value={assignFantallenatoreId}
                                        onChange={(e) => setAssignFantallenatoreId(Number(e.target.value))}
                                      >
                                        {
                                          props.fantallenatoriAsta.map((fantallenatore: Fantallenatore) => (
                                            <option value={fantallenatore.id}>{fantallenatore.name}</option>
                                          ))
                                        }
                                      </Form.Select>
                                    </Form.Group>
                                    <Form.Group controlId={`assign-crediti-${player.id}`} className="mb-2">
                                      <Form.Control
                                        type="number"
                                        placeholder="Insert crediti"
                                        step={1}
                                        value={assignCrediti}
                                        onChange={(e) => setAssignCrediti(Number(e.target.value))}
                                        required
                                      />
                                    </Form.Group>
                                    <div className="d-flex flex-row gap-2 justify-content-end">
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
                                        {isAssigning ? "Assegnando..." : "Assegna"}
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setAssigningPlayerId(null)}
                                      >
                                        Annulla
                                      </Button>
                                    </div>
                                  </div>
                                  : <></>
                              }
                            </div>
                            <div style={{ width: 30 }} className="d-flex flex-column align-items-end">
                              {
                                player.id != assigningPlayerId ?
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => handleAssignClick(player)}
                                  >
                                    ✎
                                  </Button>
                                  :
                                  <></>
                              }
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                      : <></>
                  ))
                }
                {
                  props.asta.type == "classic" ?
                    <p className="mb-1 mt-3 px-1">
                      Limiti:
                      {" " + fantallenatore.classic_p}
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("P")} text-white mx-1`}
                        style={{ width: 20, height: 20, fontSize: "0.75rem" }}
                      >
                        P
                      </span>
                      {"| " + fantallenatore.classic_d}
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("D")} text-white mx-1`}
                        style={{ width: 20, height: 20, fontSize: "0.75rem" }}
                      >
                        D
                      </span>
                      {"| " + fantallenatore.classic_c}
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("C")} text-white mx-1`}
                        style={{ width: 20, height: 20, fontSize: "0.75rem" }}
                      >
                        C
                      </span>
                      {"| " + fantallenatore.classic_a}
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("A")} text-white mx-1`}
                        style={{ width: 20, height: 20, fontSize: "0.75rem" }}
                      >
                        A
                      </span>
                    </p>
                    :
                    <p className="mb-1 mt-3 px-1">
                      Limiti:
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor("P")} text-white mx-1`}
                        style={{ width: 20, height: 20, fontSize: "0.75rem" }}
                      >
                        P
                      </span>
                      {fantallenatore.mantra_por_min} - {fantallenatore.mantra_por_max} |
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-pill bg-${"success"} text-white px-2 mx-1`}
                        style={{ minHeight: 20, fontSize: "0.75rem" }}
                      >
                        Mov
                      </span>
                      {fantallenatore.mantra_mov_min} - {fantallenatore.mantra_mov_max}
                    </p>
                }
              </Card.Body>
            </Card>
          ))
        }
      </div>
      <AddFantallenatoreForm setDirty={props.setDirty} asta_id={props.asta_id} asta={props.asta} />
      <Button
        variant="secondary"
        className="mt-5"
        onClick={handleExportFantallenatoriWithPlayersTxt}
      >
        Esporta Asta
      </Button>
    </>
  );
}

export default TakenPage;
