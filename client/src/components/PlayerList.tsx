import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Player from "../entities/player";
import SortableCard from './SortableCard';

function PlayerList(props: any) {

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
                player={player}
              />
            ))
          }
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default PlayerList;
