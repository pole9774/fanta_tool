import { useState } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { showToast } from '../utilities/toast';
import { getFantallenatoreStats } from '../utilities/fantallenatoreStats';
import API from "../API/API";
import Asta from '../entities/asta';
import Player from "../entities/player";
import PlayerTaken from '../entities/playerTaken';
import Fantallenatore from '../entities/fantallenatore';
import SortableCard, { type PlayerOwner } from './SortableCard';

interface PlayerListProps {
  asta_id: string | undefined;
  asta: Asta;
  players: Player[];
  currentRole: string;
  fantallenatoriAsta: Fantallenatore[];
  playersTaken: PlayerTaken[];
  setDirty: (dirty: boolean) => void;
}

function PlayerList(props: PlayerListProps) {

  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [assigningPlayerId, setAssigningPlayerId] = useState<number | null>(null);
  const [assignCrediti, setAssignCrediti] = useState<number>(1);
  const [assignFantallenatoreId, setAssignFantallenatoreId] = useState<number>();
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  const handleAssignClick = (player: Player) => {
    setAssigningPlayerId(player.id);
    setEditingPlayerId(null);
    setEditNotes("");
  };

  const handleSaveAssign = async (playerId: number, playerName: string, fantallenatoreId: number, crediti: number) => {
    setIsAssigning(true);

    try {
      const response = await API.assignPlayer(Number(props.asta_id), playerId, playerName, fantallenatoreId, crediti);

      if (response && response.ok) {
        showToast.success("Player assigned successfully");
        setAssigningPlayerId(null);
        setAssignFantallenatoreId(undefined);
        setAssignCrediti(1);
        props.setDirty(true);
      } else {
        showToast.error("Failed to assign the player");
      }
    } catch {
      showToast.error("Failed to assign the player");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditNotes(player.notes);
    setAssigningPlayerId(null);
    setAssignCrediti(1);
    setAssignFantallenatoreId(undefined);
  };

  const handleSaveEdit = async (playerId: number, playerName: string) => {
    setIsUpdating(true);

    try {
      const response = await API.updateNotes(Number(props.asta_id), playerId, playerName, editNotes);

      if (response && response.ok) {
        showToast.success("Player updated successfully");
        setEditingPlayerId(null);
        props.setDirty(true);
      } else {
        showToast.error("Failed to update the player");
      }
    } catch {
      showToast.error("Failed to update the player");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePlayer = async (playerId: number, playerName: string) => {
    const confirmed = window.confirm(
      `Eliminare il giocatore ${playerName}?`
    );
    if (!confirmed) return;

    try {
      const response = await API.deletePlayer(Number(props.asta_id), playerId, playerName);

      if (response && response.ok) {
        showToast.success("Player deleted successfully");
        setEditingPlayerId(null);
        props.setDirty(true);
      } else {
        showToast.error("Failed to delete the player");
      }
    } catch {
      showToast.error("Failed to delete the player");
    }
  };

  // Classificati: ordinati per index_role (drag&drop). Non classificati: per squadra e poi per nome, alfabetico
  const classifiedPlayers: Player[] = props.players
    .filter((player: Player) => player.index_role != null)
    .sort((a: Player, b: Player) => (a.index_role ?? 0) - (b.index_role ?? 0));

  const unclassifiedPlayers: Player[] = props.players
    .filter((player: Player) => player.index_role == null)
    .sort((a: Player, b: Player) =>
      a.team.localeCompare(b.team, "it", { sensitivity: "base" }) ||
      a.name.localeCompare(b.name, "it", { sensitivity: "base" })
    );

  // Acquirente di ogni giocatore preso (identità per nome: vale per tutte le righe-ruolo del giocatore)
  const fantallenatoreNames = new Map<number, string>(props.fantallenatoriAsta.map((f) => [f.id, f.name]));
  const ownersByName = new Map<string, PlayerOwner>(
    props.playersTaken.map((p) => [p.name, { fantallenatoreName: fantallenatoreNames.get(p.fantallenatore_id) ?? "?", crediti: p.crediti }])
  );

  const maxBidById: Record<number, number> = Object.fromEntries(
    props.fantallenatoriAsta.map((f) => [f.id, getFantallenatoreStats(f, props.playersTaken, props.asta.type).maxBid])
  );

  const handleToggleClassified = async (player: Player) => {
    const classify = player.index_role == null;

    try {
      const response = await API.setPlayerClassified(Number(props.asta_id), player.id, classify);

      if (response && response.ok) {
        showToast.success(classify ? "Player moved to classified" : "Player moved to unclassified");
        setEditingPlayerId(null);
        props.setDirty(true);
      } else {
        showToast.error("Failed to move the player");
      }
    } catch {
      showToast.error("Failed to move the player");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const newIndex = classifiedPlayers.findIndex((player: Player) => player.id === over.id);
    if (newIndex < 0) {
      return;
    }
    const newPos = classifiedPlayers[newIndex].index_role ?? 1;

    try {
      const response = await API.updatePlayerIndex(Number(props.asta_id), Number(active.id), props.currentRole, newPos);

      if (response && response.ok) {
        showToast.success("Player index updated");
      } else {
        showToast.error("Failed to update Player index");
      }
    } catch {
      showToast.error("Failed to update Player index");
    } finally {
      props.setDirty(true);
    }
  };

  // Props comuni alle righe delle due liste
  const cardProps = {
    asta: props.asta,
    editingPlayerId,
    editNotes,
    isUpdating,
    onEditClick: handleEditClick,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: () => setEditingPlayerId(null),
    onDeletePlayer: handleDeletePlayer,
    onToggleClassified: handleToggleClassified,
    setEditNotes,
    assigningPlayerId,
    assignCrediti,
    setAssignCrediti,
    assignFantallenatoreId,
    setAssignFantallenatoreId,
    isAssigning,
    onAssignClick: handleAssignClick,
    onSaveAssign: handleSaveAssign,
    onCancelAssign: () => setAssigningPlayerId(null),
    fantallenatoriAsta: props.fantallenatoriAsta,
    maxBidById,
  };

  return (
    <div className="mb-5">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={classifiedPlayers.map((player: Player) => player.id)}
          strategy={verticalListSortingStrategy}
        >
          {
            classifiedPlayers.map((player: Player) => (
              <SortableCard key={player.id} player={player} sortable={true} owner={ownersByName.get(player.name)} {...cardProps} />
            ))
          }
        </SortableContext>
        {
          classifiedPlayers.length == 0 ?
            <p className="text-secondary small my-2">Nessun giocatore classificato in questo ruolo.</p>
            : <></>
        }

        {/* Non classificati: senza posizione, non trascinabili */}
        <div className="section-divider">Non classificati ({unclassifiedPlayers.length})</div>
        {
          unclassifiedPlayers.map((player: Player) => (
            <SortableCard key={player.id} player={player} sortable={false} owner={ownersByName.get(player.name)} {...cardProps} />
          ))
        }
      </DndContext>
    </div>
  );
}

export default PlayerList;
