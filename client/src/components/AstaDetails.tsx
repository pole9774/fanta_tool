import { useState, useEffect } from 'react';
import { Button, Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
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
      } catch (error) {
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

  const handleExportPlayersTxt = () => {
    const lines: string[] = [];

    lines.push(`Asta: ${asta?.name ?? asta_id}`);
    lines.push(`Tipo: ${asta?.type ?? "-"}`);
    lines.push(`Tipo: ${currentRole ?? "-"}`);
    lines.push(`Generated at: ${new Date().toLocaleString()}`);
    lines.push("");

    players?.forEach((p: Player, index: number) => {
      const role = asta?.type == "classic" ? p.role : p.role_mantra;
      lines.push(`${index + 1}. ${p.name} - ${role}`);
    });

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `players_asta_${asta_id}_${currentRole}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <Container fluid className="my-4 px-4">
      {
        // Info asta selezionata
        asta ?
          <h5>
            <span
              className={`d-inline-flex align-items-center justify-content-center rounded-circle text-white mx-2`}
              style={{ width: 25, height: 25, fontSize: "0.92rem", backgroundColor: "#494949" }}
            >
              {asta_id}
            </span>
            {asta.name} {"(" + asta.type}, {asta.n_fantallenatori + " partecipanti)"}
          </h5>
          : <></>
      }
      <div className="d-flex align-items-center gap-2">
        {
          // Selezione ruolo
          (asta && !isTakenPage) ?
            <DisplayedRoleSelection asta={asta} currentRole={currentRole} setCurrentRole={setCurrentRole} />
            : <></>
        }
        {
          // Bottone switch player list -> taken e viceversa
          isTakenPage ?
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => setIsTakenPage(false)}
            >
              {"◂ " + "Lista Giocatori"}
            </Button>
            :
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => setIsTakenPage(true)}
            >
              {"Acquisti" + " ▸"}
            </Button>
        }
      </div>
      <div className="mt-4">
        {
          // Player List
          (asta && players && !isTakenPage) ?
            <PlayerList asta_id={asta_id} asta={asta} players={players} currentRole={currentRole} fantallenatoriAsta={fantallenatoriAsta} setDirty={setDirty} />
            : <></>
        }
        {
          // Add Player form
          (asta && !isTakenPage) ?
            <AddPlayerForm asta_id={asta_id} asta={asta} setDirty={setDirty} />
            : <></>
        }
        {
          // Pagina Taken
          (isTakenPage && playersTaken && fantallenatoriAsta) ?
            <TakenPage playersTaken={playersTaken} fantallenatoriAsta={fantallenatoriAsta} setDirty={setDirty} asta_id={asta_id} asta={asta} />
            : <></>
        }
      </div>
      {
        (players && asta && !isTakenPage) ?
          <Button
            variant="secondary"
            className="mt-5"
            onClick={() => handleExportPlayersTxt()}
          >
            Esporta Giocatori
          </Button>
          : <></>
      }
    </Container>
  );
}

export default AstaDetails;
