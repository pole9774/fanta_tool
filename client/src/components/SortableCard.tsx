import { Card, Button, Form } from "react-bootstrap";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from "react";
import Fantallenatore from '../entities/fantallenatore';

function SortableCard(props: any) {

  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});

  const toggleNotes = (playerId: number) => {
    setExpandedNotes((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: props.player.taken == 0 ? "#212529" : "#323335",
    color: props.player.taken == 0 ? "#fff" : "#5c5c5c"
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
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-1"
    >
      <Card.Body className="py-1 px-3">
        <div className="d-flex align-items-start gap-3">
          <div style={{ flex: "0 0 200px" }}>
            <Card.Title className="d-flex align-items-center gap-2 fs-5 mt-1">
              <span
                className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-secondary text-white`}
                style={{ width: 20, height: 20, fontSize: "0.75rem" }}
              >
                {props.player.index_role}
              </span>
              {
                <span>{props.player.name}</span>
              }
            </Card.Title>
            <Card.Subtitle className="fs-6">
              {
                props.asta.type == "classic" ?
                  <span
                    className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getCardColor(props.player.role)} text-white`}
                    style={{ width: 20, height: 20, fontSize: "0.75rem" }}
                  >
                    {props.player.role}
                  </span>
                  : (
                    props.player.role_mantra
                      .split("/")
                      .map((r: string) => r.trim())
                      .filter(Boolean)
                      .map((r: string) => (
                        <span
                          key={`${props.player.id}-${r}`}
                          className={`d-inline-flex align-items-center justify-content-center rounded-pill bg-${getCardColor(r)} text-white px-2`}
                          style={{ minHeight: 20, fontSize: "0.75rem" }}
                        >
                          {r}
                        </span>
                      ))
                  )
              }
              {
                <span className="mx-1"> {props.player.team}</span>
              }
            </Card.Subtitle>
          </div>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            {
              props.editingPlayerId == props.player.id ?
                <Form.Group controlId={`edit-notes-${props.player.id}`} className="mb-2">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={props.editNotes}
                    onChange={(e) => props.setEditNotes(e.target.value)}
                    required
                  />
                </Form.Group>
                :
                <>
                  {
                    <Card.Text
                      className="mb-1"
                      style={
                        expandedNotes[props.player.id]
                          ? { whiteSpace: "pre-wrap" }
                          : {
                            whiteSpace: "pre-wrap",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }
                      }
                    >
                      {props.player.notes}
                    </Card.Text>
                  }

                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none"
                    onClick={() => toggleNotes(props.player.id)}
                  >
                    {expandedNotes[props.player.id] ? "Nascondi" : "Mostra tutto"}
                  </Button>
                </>
            }
          </div>
          <div
            style={{ flex: "0 0 220px" }}
            className="d-flex flex-column align-items-end gap-1"
          >
            <div
              {...attributes}
              {...listeners}
              style={{
                cursor: 'grab',
                paddingBottom: '2px',
                paddingLeft: '5px',
                paddingRight: '5px',
                fontSize: '16px',
              }}
              title="Drag to reorder"
            >
              ⠿
            </div>
            <div className="d-flex flex-wrap justify-content-end gap-1">
              {
                props.editingPlayerId == props.player.id ?
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-1"
                      onClick={() => props.onSaveEdit(props.player.id, props.player.name)}
                      disabled={props.isUpdating}
                    >
                      {props.isUpdating ? "Salvando..." : "Salva"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="me-1"
                      onClick={() => props.onCancelEdit()}
                    >
                      Annulla
                    </Button>
                    {
                      props.player.taken == 0 ?
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => props.onDeletePlayer(props.player.id, props.player.name)}
                        >
                          Elimina
                        </Button>
                        : <></>
                    }
                  </>
                  :
                  <>
                    {
                      props.assigningPlayerId != props.player.id ?
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-1"
                          onClick={() => props.onEditClick(props.player)}
                        >
                          Edit
                        </Button>
                        : <></>
                    }
                  </>
              }
              {
                (props.assigningPlayerId == props.player.id && props.player.taken == 0) ?
                  <>
                    <Form.Group controlId={`assign-fantallenatore-${props.player.id}`} className="mb-3">
                      <Form.Select
                        value={props.assignFantallenatoreId}
                        onChange={(e) => props.setAssignFantallenatoreId(Number(e.target.value))}
                      >
                        {
                          <>
                            <option value={undefined}>-</option>
                            {
                              props.fantallenatoriAsta.map((fantallenatore: Fantallenatore) => (
                                <option value={fantallenatore.id}>{fantallenatore.name}</option>
                              ))
                            }
                          </>
                        }
                      </Form.Select>
                    </Form.Group>
                    <Form.Group controlId={`assign-crediti-${props.player.id}`} className="mb-3">
                      <Form.Control
                        type="number"
                        placeholder="Insert crediti"
                        step={1}
                        value={props.assignCrediti}
                        onChange={(e) => props.setAssignCrediti(Number(e.target.value))}
                        required
                      />
                    </Form.Group>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => props.onSaveAssign(props.player.id, props.player.name, props.assignFantallenatoreId, props.assignCrediti)}
                      disabled={props.isAssigning}
                    >
                      {props.isAssigning ? "Salvando..." : "Salva"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={props.onCancelAssign}
                    >
                      Annulla
                    </Button>
                  </>
                  :
                  <>
                    {
                      props.player.taken == 0 && props.editingPlayerId != props.player.id ?
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => props.onAssignClick(props.player)}
                        >
                          Assegna
                        </Button>
                        : <></>
                    }
                  </>
              }
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default SortableCard;
