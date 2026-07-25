import { Button, Form, Container, Row, Col, Card, ButtonGroup } from "react-bootstrap";
import { useState, useEffect } from 'react';
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
      `Are you sure you want to cancel assign for ${player.name}?`
    );
    if (!confirmed) return;

    try {
      const response = await API.cancelAssign(Number(props.asta_id), player.id, player.name);

      if (response && response.ok) {
        showToast.success("Player cancel assigned successfully");
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
    lines.push(`Type: ${props.asta?.type ?? "-"}`);
    lines.push(`Generated at: ${new Date().toLocaleString()}`);
    lines.push("");

    props.fantallenatoriAsta.forEach((f: Fantallenatore, index: number) => {
      lines.push(`${index + 1}. ${f.name}`);
      lines.push(`   Max crediti: ${f.max_crediti}`);
      lines.push(`   Crediti spent: ${f.crediti_spent}`);

      const players = props.playersTaken.filter(
        (p: PlayerTaken) => p.fantallenatore_id === f.id
      );

      if (players.length === 0) {
        lines.push(`   Players: none`);
      } else {
        lines.push(`   Players (${players.length}):`);
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
      {
        props.fantallenatoriAsta.map((fantallenatore: Fantallenatore) => (
          <div className="mb-4">
            <h3>{fantallenatore.name}</h3>
            <p>Max crediti: {fantallenatore.max_crediti} - Crediti spent: {fantallenatore.crediti_spent}</p>
            {
              props.playersTaken.map((player: PlayerTaken) => (
                player.fantallenatore_id == fantallenatore.id ?
                  <Card className="mb-1" border={getCardColor(player.role)}>
                    <Card.Body className="py-1 px-3">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div className="flex-grow-1">
                          <Card.Title>
                            {player.name}
                          </Card.Title>
                          <Card.Subtitle>
                            {props.asta.type == "classic" ? player.role : player.role_mantra} | {player.team}
                          </Card.Subtitle>
                          <Card.Text>
                            Crediti: {player.crediti}
                          </Card.Text>
                        </div>
                        <div style={{ minWidth: 220 }} className="d-flex flex-column align-items-end">
                          {
                            player.id == assigningPlayerId ?
                              <>
                                <Form.Group controlId={`assign-fantallenatore-${player.id}`} className="mb-3">
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
                                <Form.Group controlId={`assign-crediti-${player.id}`} className="mb-3">
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
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleSaveAssign(player.id, assignFantallenatoreId ?? 0, assignCrediti)}
                                    disabled={isAssigning}
                                  >
                                    {isAssigning ? "Assigning..." : "Assign"}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setAssigningPlayerId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </>
                              :
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="mb-1"
                                  onClick={() => handleAssignClick(player)}
                                >
                                  Reassign
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleCancelAssign(player)}
                                >
                                  Cancel Assign
                                </Button>
                              </>
                          }
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                  : <></>
              ))
            }
          </div>
        ))
      }
      <AddFantallenatoreForm setDirty={props.setDirty} asta_id={props.asta_id} />
      <Button
        variant="secondary"
        className="mt-5"
        onClick={handleExportFantallenatoriWithPlayersTxt}
      >
        Export Asta
      </Button>
    </>
  );
}

export default TakenPage;
