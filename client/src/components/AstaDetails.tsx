import { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card, ButtonGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Asta from "../entities/asta";
import Player from "../entities/player";
import PlayerTaken from "../entities/playerTaken";
import Fantallenatore from '../entities/fantallenatore';
import DisplayedRoleSelection from './DisplayedRoleSelection';
import AddPlayerForm from './AddPlayerForm';
import PlayerList from './PlayerList';
import TakenPage from './TakenPage';

function AstaDetails(props: any) {

  const { asta_id } = useParams();

  const [asta, setAsta] = useState<Asta>();
  const [currentRole, setCurrentRole] = useState<string>("P");
  const [players, setPlayers] = useState<Player[]>();
  const [playersTaken, setPlayersTaken] = useState<PlayerTaken[]>();
  const [fantallenatoriAsta, setFantallenatoriAsta] = useState<Fantallenatore[]>();

  const [isTakenPage, setIsTakenPage] = useState<boolean>(false);

  const [dirty, setDirty] = useState<boolean>(false);

  useEffect(() => {
    const loadAsta = async () => {
      try {
        const asta = await API.getAsta(Number(asta_id));
        setAsta(asta);
      } catch (error) {
        showToast.error('Failed to load Asta information');
      }
    };

    loadAsta();
  }, [asta_id]);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const p = await API.getPlayers(Number(asta_id), currentRole);
        const sortedPlayers = p.sort((a, b) => a.index_role - b.index_role);
        setPlayers(sortedPlayers);
        setDirty(false);
      } catch (error) {
        showToast.error('Failed to load Players');
      }
    };

    loadPlayers();
  }, [asta_id, dirty, currentRole]);

  useEffect(() => {
    const loadPlayersTaken = async () => {
      try {
        const pTaken = await API.getPlayersTaken(Number(asta_id));
        setPlayersTaken(pTaken);
        setDirty(false);
      } catch(error) {
        showToast.error('Failed to load Players Taken');
      }
    }

    loadPlayersTaken();
  }, [asta_id, dirty]);

  useEffect(() => {
    const loadFantallenatori = async () => {
      try {
        const f = await API.getFantallenatori(Number(asta_id));
        setFantallenatoriAsta(f);
        setDirty(false);
      } catch (error) {
        showToast.error('Failed to load Fantallenatori');
      }
    }

    loadFantallenatori();
  }, [asta_id, dirty]);

  return (
    <Container className="my-5">
      <h3>Asta ID: {asta_id}</h3>
      {
        // Info asta selezionata
        asta ?
        <p>
          {asta.name} - {asta.type} - n.fantallenatori: {asta.n_fantallenatori}
        </p>
        : <></>
      }
      {
        // Selezione ruolo
        (asta && !isTakenPage) ?
        <DisplayedRoleSelection asta={asta} currentRole={currentRole} setCurrentRole={setCurrentRole}/>
        : <></>
      }
      {
        // Bottone switch player list -> taken e viceversa
        isTakenPage ?
        <Button
          variant="primary"
          onClick={() => setIsTakenPage(false)}
        >
          Go to Players
        </Button>
        :
        <Button
          variant="primary"
          onClick={() => setIsTakenPage(true)}
        >
          Go to Taken
        </Button>
      }
      {
        // Player List
        (asta && players && !isTakenPage) ?
        <PlayerList players={players}/>
        : <></>
      }
      {
        // Add Player
        (asta && !isTakenPage) ?
        <AddPlayerForm asta_id={asta_id} asta={asta} setDirty={setDirty}/>
        : <></>
      }
      {
        // Pagina Taken
        (isTakenPage && playersTaken && fantallenatoriAsta) ?
        <TakenPage playersTaken={playersTaken} fantallenatoriAsta={fantallenatoriAsta}/>
        : <></>
      }
    </Container>
  );
}

export default AstaDetails;
