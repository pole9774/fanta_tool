import { useState, useEffect } from 'react';
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const newIndex = props.players.findIndex((player: Player) => player.id === over.id);
    const newPos = props.players[newIndex].index_role;

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

  return (
    <div className="mb-4">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={props.players.map((player: Player) => player.id)}
          strategy={verticalListSortingStrategy}
        >
          {
            props.players.map((player: Player) => (
              <SortableCard
                key={player.id}
                asta={props.asta}
                player={player}
                editingPlayerId={editingPlayerId}
                editNotes={editNotes}
                isUpdating={isUpdating}
                onEditClick={handleEditClick}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditingPlayerId(null)}
                setEditNotes={setEditNotes}
                assigningPlayerId={assigningPlayerId}
                assignCrediti={assignCrediti}
                setAssignCrediti={setAssignCrediti}
                assignFantallenatoreId={assignFantallenatoreId}
                setAssignFantallenatoreId={setAssignFantallenatoreId}
                isAssigning={isAssigning}
                onAssignClick={handleAssignClick}
                onSaveAssign={handleSaveAssign}
                onCancelAssign={() => setAssigningPlayerId(null)}
                fantallenatoriAsta={props.fantallenatoriAsta}
              />
            ))
          }
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default PlayerList;
