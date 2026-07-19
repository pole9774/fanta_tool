import { Card, Button, Form } from "react-bootstrap";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Player from "../entities/player";
import Fantallenatore from '../entities/fantallenatore';

function SortableCard(props: any) {

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

  function getCardColor(): CardColor {
    const type = props.asta.type as MainType;
    const role = props.player.role as Role;
    return colorMap[type]?.[role] ?? "secondary";
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-1"
      border={getCardColor()}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <Card.Title>{props.player.index_role} - {props.player.name}</Card.Title>
            <Card.Subtitle>{props.player.team}</Card.Subtitle>
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
                <Card.Text>{props.player.notes}</Card.Text>
            }
            {
              props.editingPlayerId == props.player.id ?
                <>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => props.onSaveEdit(props.player.id, props.player.name)}
                    disabled={props.isUpdating}
                  >
                    {props.isUpdating ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={props.onCancelEdit}
                  >
                    Cancel
                  </Button>
                </>
                :
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => props.onEditClick(props.player)}
                >
                  Edit Notes
                </Button>
            }
            {
              props.player.taken == 0 ?
                <Card.Text className="mt-2">NOT TAKEN</Card.Text>
                :
                <Card.Text className="mt-2">TAKEN</Card.Text>
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
                    {props.isAssigning ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={props.onCancelAssign}
                  >
                    Cancel
                  </Button>
                </>
                :
                <>
                  {
                    props.player.taken == 0 ?
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => props.onAssignClick(props.player)}
                      >
                        Assign
                      </Button>
                      : <></>
                  }
                </>

            }
          </div>
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: 'grab',
              padding: '8px',
              fontSize: '20px',
            }}
            title="Drag to reorder"
          >
            ⠿
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default SortableCard;
