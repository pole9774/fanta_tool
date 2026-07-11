import PlayerTaken from "../entities/playerTaken";
import Fantallenatore from '../entities/fantallenatore';
import AddFantallenatoreForm from "./AddFantallenatoreForm";

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
      <AddFantallenatoreForm setDirty={props.setDirty} asta_id={props.asta_id}/>
    </>
  );
}

export default TakenPage;
