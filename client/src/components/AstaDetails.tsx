import { useState, useEffect } from 'react';
import { Button, Container, Nav } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Asta from "../entities/asta";
import Player from "../entities/player";
import PlayerTaken from "../entities/playerTaken";
import Fantallenatore from '../entities/fantallenatore';
import DisplayedRoleSelection from './DisplayedRoleSelection';
import AddPlayerForm from './AddPlayerForm';
import ImportPlayersForm from './ImportPlayersForm';
import ImportStatsForm from './ImportStatsForm';
import PlayerList from './PlayerList';
import TakenPage from './TakenPage';
import FantallenatoriSummary from './FantallenatoriSummary';
import AstaTypeBadge from './AstaTypeBadge';

function AstaDetails() {

  const { asta_id } = useParams();

  const [asta, setAsta] = useState<Asta>();
  const [currentRole, setCurrentRole] = useState<string>("P");
  const [players, setPlayers] = useState<Player[]>();
  const [playersTaken, setPlayersTaken] = useState<PlayerTaken[]>();
  const [fantallenatoriAsta, setFantallenatoriAsta] = useState<Fantallenatore[]>();

  const [isTakenPage, setIsTakenPage] = useState<boolean>(false);
  const [showAddPlayer, setShowAddPlayer] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showImportStats, setShowImportStats] = useState<boolean>(false);

  const [dirty, setDirty] = useState<boolean>(false);

  useEffect(() => {
    const loadAsta = async () => {
      try {
        const asta = await API.getAsta(Number(asta_id));
        setAsta(asta);
      } catch {
        showToast.error('Failed to load Asta information');
      }
    };

    loadAsta();
  }, [asta_id]);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        // l'ordinamento (classificati per index_role, non classificati per squadra/nome) lo fa PlayerList
        const p = await API.getPlayers(Number(asta_id), currentRole);
        setPlayers(p);
        setDirty(false);
      } catch {
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
      } catch {
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
      } catch {
        showToast.error('Failed to load Fantallenatori');
      }
    }

    loadFantallenatori();
  }, [asta_id, dirty]);

  return (
    <Container fluid className="my-3 px-4">
      {/* Header: info asta, scelta vista (alla lista delle aste si torna dal titolo nella navbar) */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        {
          asta ?
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h4 className="mb-0">{asta.name}</h4>
              <AstaTypeBadge type={asta.type} />
              <span className="text-secondary small">
                <i className="bi bi-people-fill me-1"></i>{asta.n_fantallenatori} partecipanti
              </span>
            </div>
            : <></>
        }
        <Nav
          variant="pills"
          className="ms-auto"
          activeKey={isTakenPage ? "acquisti" : "giocatori"}
          onSelect={(key) => setIsTakenPage(key == "acquisti")}
        >
          <Nav.Item>
            <Nav.Link eventKey="giocatori"><i className="bi bi-list-ol me-1"></i>Giocatori</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="acquisti">
              <i className="bi bi-bag-check me-1"></i>Acquisti
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {
        // Vista Giocatori
        (asta && !isTakenPage) ?
          <>
            {/* Blocco fisso in alto: riepilogo fantallenatori + toolbar */}
            <div className="sticky-panel mb-3">
              {
                (fantallenatoriAsta && playersTaken && fantallenatoriAsta.length > 0) ?
                  <FantallenatoriSummary
                    asta={asta}
                    fantallenatori={fantallenatoriAsta}
                    playersTaken={playersTaken}
                  />
                  : <></>
              }
              <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
                <DisplayedRoleSelection asta={asta} currentRole={currentRole} setCurrentRole={setCurrentRole} />
                <div className="ms-auto d-flex gap-2">
                  <Button variant="success" size="sm" onClick={() => setShowAddPlayer(true)}>
                    <i className="bi bi-person-plus me-1"></i>Giocatore
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={() => setShowImport(true)}>
                    <i className="bi bi-file-earmark-spreadsheet me-1"></i>Importa Excel
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={() => setShowImportStats(true)}>
                    <i className="bi bi-bar-chart me-1"></i>Importa statistiche
                  </Button>
                </div>
              </div>
            </div>

            {
              players ?
                <PlayerList
                  asta_id={asta_id}
                  asta={asta}
                  players={players}
                  currentRole={currentRole}
                  fantallenatoriAsta={fantallenatoriAsta ?? []}
                  playersTaken={playersTaken ?? []}
                  setDirty={setDirty}
                />
                : <></>
            }

            <AddPlayerForm
              show={showAddPlayer}
              onHide={() => setShowAddPlayer(false)}
              asta_id={asta_id}
              asta={asta}
              setDirty={setDirty}
            />
            <ImportPlayersForm
              show={showImport}
              onHide={() => setShowImport(false)}
              asta_id={asta_id ?? ""}
              asta={asta}
              setDirty={setDirty}
            />
            <ImportStatsForm
              show={showImportStats}
              onHide={() => setShowImportStats(false)}
              asta_id={asta_id ?? ""}
              setDirty={setDirty}
            />
          </>
          : <></>
      }

      {
        // Vista Acquisti
        (asta && isTakenPage && playersTaken && fantallenatoriAsta) ?
          <TakenPage playersTaken={playersTaken} fantallenatoriAsta={fantallenatoriAsta} setDirty={setDirty} asta_id={asta_id} asta={asta} />
          : <></>
      }
    </Container>
  );
}

export default AstaDetails;
