import { Card, Button, Form } from "react-bootstrap";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Player from "../entities/player";

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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-3 shadow-sm"
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <Card.Title>{props.player.name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              Index: {props.player.index_role}
            </Card.Subtitle>
            <Card.Text>{props.player.notes}</Card.Text>
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
