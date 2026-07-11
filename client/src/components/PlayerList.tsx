import Player from "../entities/player";

function PlayerList(props: any) {

  return (
    <>
      {
        props.players.map((player: Player) => (
          <p key={player.id}>{player.name} - {player.role} - {player.index_role}</p>
        ))
      }
    </>
  );
}

export default PlayerList;
