import PlayerTaken from "../entities/playerTaken";
import Fantallenatore from '../entities/fantallenatore';

function TakenPage(props: any) {

  return (
    <>
      <h1>Players Taken:</h1>
      {
        props.playersTaken.map((playerTaken: PlayerTaken) => (
          <p key={playerTaken.id}>{playerTaken.asta_id} - {playerTaken.player_id} - {playerTaken.name} - {playerTaken.fantallenatore_id}</p>
        ))
      }
      <h1>Fantallenatori:</h1>
      {
        props.fantallenatoriAsta.map((fantallenatore: Fantallenatore) => (
          <p key={fantallenatore.id}>{fantallenatore.name}</p>
        ))
      }
    </>
  );
}

export default TakenPage;
