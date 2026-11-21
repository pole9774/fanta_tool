import { useState } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Player from "../entities/player";
import SortableCard from './SortableCard';

function PlayerList(props: any) {

  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [assigningPlayerId, setAssigningPlayerId] = useState<number | null>(null);
  const [assigningPlayerName, setAssigningPlayerName] = useState<string>("");
  const [assignCrediti, setAssignCrediti] = useState<number>(1);
  const [assignFantallenatoreId, setAssignFantallenatoreId] = useState<number>();
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  const handleAssignClick = (player: Player) => {
    setAssigningPlayerId(player.id);
    setAssigningPlayerName(player.name);
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
        setAssigningPlayerName("");
        setAssignFantallenatoreId(undefined);
        setAssignCrediti(1);
        props.setDirty(true);
      } else {
        showToast.error("Failed to assign the player");
      }
    } catch (error) {
      showToast.error("Failed to assign the player");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditNotes(player.notes);
    setAssigningPlayerId(null);
    setAssigningPlayerName("");
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      showToast.error("Failed to update Player index");
    } finally {
      props.setDirty(true);
    }
  };

  // Props comuni alle card delle due liste
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
              <SortableCard key={player.id} player={player} sortable={true} {...cardProps} />
            ))
          }
        </SortableContext>

        {/* Non classificati: senza posizione, non trascinabili */}
        <h6 className="mt-4 mb-2 text-secondary">Non classificati ({unclassifiedPlayers.length})</h6>
        {
          unclassifiedPlayers.map((player: Player) => (
            <SortableCard key={player.id} player={player} sortable={false} {...cardProps} />
          ))
        }
      </DndContext>
    </div>
  );
}

export default PlayerList;
