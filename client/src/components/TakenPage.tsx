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
                    <Card.Body>
                      <Card.Title>
                        {player.name}
                      </Card.Title>
                      <Card.Subtitle>
                        {player.team}, {props.asta.type == "classic" ? player.role : player.role_mantra}
                      </Card.Subtitle>
                      <Card.Text>
                        Crediti: {player.crediti}
                      </Card.Text>
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
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
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
                          </>
                          :
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
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
                    </Card.Body>
                  </Card>
                  : <></>
              ))
            }
          </div>
        ))
      }
      <AddFantallenatoreForm setDirty={props.setDirty} asta_id={props.asta_id} />
    </>
  );
}

export default TakenPage;
