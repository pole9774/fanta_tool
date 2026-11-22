import { Button, Form } from "react-bootstrap";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from "react";
import Asta from "../entities/asta";
import Player from "../entities/player";
import Fantallenatore from '../entities/fantallenatore';
import { PlayerRoles } from "./RoleBadge";
import TeamLogo from "./TeamLogo";

// Chi ha acquistato il giocatore e per quanto
export interface PlayerOwner {
  fantallenatoreName: string;
  crediti: number;
}

interface SortableCardProps {
  player: Player;
  asta: Asta;
  // false per i giocatori non classificati: niente drag&drop
  sortable: boolean;
  owner?: PlayerOwner;

  editingPlayerId: number | null;
  editNotes: string;
  isUpdating: boolean;
  setEditNotes: (notes: string) => void;
  onEditClick: (player: Player) => void;
  onSaveEdit: (playerId: number, playerName: string) => void;
  onCancelEdit: () => void;
  onDeletePlayer: (playerId: number, playerName: string) => void;
  onToggleClassified: (player: Player) => void;

  assigningPlayerId: number | null;
  assignCrediti: number;
  setAssignCrediti: (crediti: number) => void;
  assignFantallenatoreId: number | undefined;
  setAssignFantallenatoreId: (id: number | undefined) => void;
  isAssigning: boolean;
  onAssignClick: (player: Player) => void;
  onSaveAssign: (playerId: number, playerName: string, fantallenatoreId: number, crediti: number) => void;
  onCancelAssign: () => void;
  fantallenatoriAsta: Fantallenatore[];
  // puntata massima per fantallenatore (id -> crediti)
  maxBidById: Record<number, number>;
}

// Riga della lista giocatori: posizione, nome, ruoli, squadra, note e azioni (assegna / modifica)
function SortableCard(props: SortableCardProps) {

  const player = props.player;
  const isTaken = player.taken != 0;
  const isEditing = props.editingPlayerId == player.id;
  const isAssigning = props.assigningPlayerId == player.id && !isTaken;

  const [notesExpanded, setNotesExpanded] = useState<boolean>(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id, disabled: !props.sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  const handleSubmitAssign = (event: React.FormEvent) => {
    event.preventDefault();
    if (props.assignFantallenatoreId == undefined) return;
    props.onSaveAssign(player.id, player.name, props.assignFantallenatoreId, props.assignCrediti);
  };

  const selectedMaxBid = props.assignFantallenatoreId != undefined ? props.maxBidById[props.assignFantallenatoreId] : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`player-row d-flex align-items-center gap-2 ${isTaken && !isEditing ? "taken" : ""}`}
    >
      {/* maniglia drag&drop; per i non classificati resta solo come spazio invisibile, per allineare le righe */}
      <span
        {...(props.sortable ? attributes : {})}
        {...(props.sortable ? listeners : {})}
        className="drag-handle flex-shrink-0"
        style={{ visibility: props.sortable ? 'visible' : 'hidden' }}
        title={props.sortable ? "Trascina per riordinare" : undefined}
      >
        <i className="bi bi-grip-vertical"></i>
      </span>

      <span className="rank flex-shrink-0">{player.index_role ?? "–"}</span>

      {/* nome, ruoli, squadra */}
      <div className="flex-shrink-0" style={{ width: 230, minWidth: 0 }}>
        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
          <span className="fw-semibold text-truncate" title={player.name}>{player.name}</span>
          <PlayerRoles astaType={props.asta.type} role={player.role} roleMantra={player.role_mantra} />
          {isTaken && !isEditing ? <TeamLogo team={player.team} size={14} /> : <></>}
        </div>
        {
          !isTaken || isEditing ?
            <div className="d-flex align-items-center gap-1 small text-secondary">
              <TeamLogo team={player.team} size={14} />
              <span className="text-truncate">{player.team}</span>
            </div>
            : <></>
        }
      </div>

      {/* note */}
      <div className="flex-grow-1 small" style={{ minWidth: 0 }}>
        {
          isEditing ?
            <Form.Control
              as="textarea"
              rows={3}
              size="sm"
              autoFocus
              placeholder="Note"
              value={props.editNotes}
              onChange={(e) => props.setEditNotes(e.target.value)}
            />
            :
            (player.notes ?? "") != "" ?
              <div
                className={`notes ${notesExpanded ? "" : isTaken ? "clamped-1" : "clamped"}`}
                title={notesExpanded ? "Clicca per ridurre" : "Clicca per espandere"}
                onClick={() => setNotesExpanded((e) => !e)}
              >
                {player.notes}
              </div>
              : <></>
        }
      </div>

      {/* acquirente */}
      {
        isTaken && props.owner && !isEditing ?
          <span className="owner-badge flex-shrink-0" title="Acquistato da">
            <i className="bi bi-arrow-right-short"></i>{props.owner.fantallenatoreName} · {props.owner.crediti}
          </span>
          : <></>
      }

      {/* azioni */}
      <div className="d-flex align-items-center justify-content-end gap-1 flex-shrink-0">
        {
          isEditing ?
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => props.onSaveEdit(player.id, player.name)}
                disabled={props.isUpdating}
              >
                {props.isUpdating ? "Salvando..." : "Salva"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => props.onCancelEdit()}>
                Annulla
              </Button>
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => props.onToggleClassified(player)}
              >
                {player.index_role == null ? "▲ Classifica" : "▼ Non classificato"}
              </Button>
              {
                !isTaken ?
                  <Button
                    variant="outline-danger"
                    size="sm"
                    title="Elimina giocatore"
                    onClick={() => props.onDeletePlayer(player.id, player.name)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                  : <></>
              }
            </>
            :
            isAssigning ?
              <Form onSubmit={handleSubmitAssign} className="d-flex align-items-center gap-1">
                <Form.Select
                  size="sm"
                  style={{ width: 170 }}
                  aria-label="Fantallenatore"
                  value={props.assignFantallenatoreId ?? ""}
                  onChange={(e) => props.setAssignFantallenatoreId(e.target.value == "" ? undefined : Number(e.target.value))}
                >
                  <option value="">Fantallenatore...</option>
                  {
                    props.fantallenatoriAsta.map((f: Fantallenatore) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))
                  }
                </Form.Select>
                <Form.Control
                  size="sm"
                  type="number"
                  aria-label="Crediti"
                  placeholder="Crediti"
                  min={0}
                  step={1}
                  style={{ width: 80 }}
                  value={props.assignCrediti}
                  onChange={(e) => props.setAssignCrediti(Number(e.target.value))}
                  required
                />
                {
                  selectedMaxBid != undefined ?
                    <span className="max-bid small mx-1" title="Puntata massima del fantallenatore">max {selectedMaxBid}</span>
                    : <></>
                }
                <Button
                  variant="success"
                  size="sm"
                  type="submit"
                  title="Conferma acquisto"
                  disabled={props.isAssigning || props.assignFantallenatoreId == undefined}
                >
                  {props.isAssigning ? "..." : <i className="bi bi-check-lg"></i>}
                </Button>
                <Button variant="secondary" size="sm" title="Annulla" onClick={props.onCancelAssign}>
                  <i className="bi bi-x-lg"></i>
                </Button>
              </Form>
              :
              <>
                {
                  !isTaken ?
                    <Button variant="outline-success" size="sm" onClick={() => props.onAssignClick(player)}>
                      <i className="bi bi-hammer me-1"></i>Assegna
                    </Button>
                    : <></>
                }
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="icon-btn"
                  title="Modifica note / classificazione"
                  onClick={() => props.onEditClick(player)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>
              </>
        }
      </div>
    </div>
  );
}

export default SortableCard;
