import { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card, ButtonGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Asta from "../entities/asta";
import Player from "../entities/player";
import PlayerTaken from "../entities/playerTaken";
import Fantallenatore from '../entities/fantallenatore';

function AstaDetails(props: any) {

  const { asta_id } = useParams();

  const [asta, setAsta] = useState<Asta>();
  const [currentRole, setCurrentRole] = useState<string>("P");
  const [players, setPlayers] = useState<Player[]>();
  const [playersTaken, setPlayersTaken] = useState<PlayerTaken[]>();
  const [fantallenatoriAsta, setFantallenatoriAsta] = useState<Fantallenatore[]>();

  const [playerName, setPlayerName] = useState<string>("");
  const [playerTeam, setPlayerTeam] = useState<string>("");
  const [playerRole1, setPlayerRole1] = useState<string>("");
  const [playerRole2, setPlayerRole2] = useState<string>("");
  const [playerRole3, setPlayerRole3] = useState<string>("");
  const [playerRoleMantra, setPlayerRoleMantra] = useState<string>("");
  const [playerNotes, setPlayerNotes] = useState<string>("");

  const [isCreating, setIsCreating] = useState<boolean>(false);

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

  useEffect(() => {
    if (!asta || asta.type !== "mantra") return;

    if (playerRole1 == "") {
      if (playerRole2) setPlayerRole2("");
      if (playerRole3) setPlayerRole3("");
      if (playerRoleMantra) setPlayerRoleMantra("");
      return;
    }

    if (playerRole2 == "" && playerRole3 != "") {
      setPlayerRole3("");
      return;
    }

    const mantra = [playerRole1, playerRole2, playerRole3]
      .filter(Boolean)
      .join("/");

    if (mantra !== playerRoleMantra) {
      setPlayerRoleMantra(mantra);
    }
  }, [playerRole1, playerRole2, playerRole3]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      if (playerRole1 != "") {
        const response1 = await API.addPlayer(Number(asta_id), playerName, playerTeam, playerRole1, playerRoleMantra, playerNotes);

        if (response1 && response1.ok) {
          if (playerRole2 != "") {
            const response2 = await API.addPlayer(Number(asta_id), playerName, playerTeam, playerRole2, playerRoleMantra, playerNotes);

            if (response2 && response2.ok) {
              if (playerRole3 != "") {
                const response3 = await API.addPlayer(Number(asta_id), playerName, playerTeam, playerRole3, playerRoleMantra, playerNotes);

                if (response3 && response3.ok) {
                  showToast.success("Player created successfully");
                  setPlayerName("");
                  setPlayerTeam("");
                  setPlayerNotes("");
                  setPlayerRole1("");
                  setPlayerRole2("");
                  setPlayerRole3("");
                  setPlayerRoleMantra("");
                  setDirty(true);
                } else {
                  showToast.error("Failed to create the Player");
                }
              } else {
                showToast.success("Player created successfully");
                setPlayerName("");
                setPlayerTeam("");
                setPlayerNotes("");
                setPlayerRole1("");
                setPlayerRole2("");
                setPlayerRole3("");
                setPlayerRoleMantra("");
                setDirty(true);
              }
            } else {
              showToast.error("Failed to create the Player");
            }
          } else {
            showToast.success("Player created successfully");
            setPlayerName("");
            setPlayerTeam("");
            setPlayerNotes("");
            setPlayerRole1("");
            setPlayerRole2("");
            setPlayerRole3("");
            setPlayerRoleMantra("");
            setDirty(true);
          }
        } else {
          showToast.error("Failed to create the Player");
        }
      }
    } catch (error) {
      showToast.error("Failed to create the Player");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Container className="my-5">
      <h3>Asta ID: {asta_id}</h3>
      {
        asta ?
        <p>
          {asta.name} - {asta.type} - n.fantallenatori: {asta.n_fantallenatori}
        </p>
        : <></>
      }
      {
        // Selezione ruolo
        (asta && !isTakenPage) ?
        <>
          {
            asta.type == "classic" ?
            <ButtonGroup>
              <Button
                variant={currentRole == "P" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("P")}
              >
                P
              </Button>
              <Button
                variant={currentRole == "D" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("D")}
              >
                D
              </Button>
              <Button
                variant={currentRole == "C" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("C")}
              >
                C
              </Button>
              <Button
                variant={currentRole == "A" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("A")}
              >
                A
              </Button>
            </ButtonGroup>
            : 
            <ButtonGroup>
              <Button
                variant={currentRole == "P" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("P")}
              >
                P
              </Button>
              <Button
                variant={currentRole == "Dc" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("Dc")}
              >
                Dc
              </Button>
              <Button
                variant={currentRole == "B" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("B")}
              >
                B
              </Button>
              <Button
                variant={currentRole == "Dd" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("Dd")}
              >
                Dd
              </Button>
              <Button
                variant={currentRole == "Ds" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("Ds")}
              >
                Ds
              </Button>
              <Button
                variant={currentRole == "E" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("E")}
              >
                E
              </Button>
              <Button
                variant={currentRole == "M" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("M")}
              >
                M
              </Button>
              <Button
                variant={currentRole == "C" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("C")}
              >
                C
              </Button>
              <Button
                variant={currentRole == "T" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("T")}
              >
                T
              </Button>
              <Button
                variant={currentRole == "W" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("W")}
              >
                W
              </Button>
              <Button
                variant={currentRole == "A" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("A")}
              >
                A
              </Button>
              <Button
                variant={currentRole == "Pc" ? "primary" : "outline-primary"}
                onClick={() => setCurrentRole("Pc")}
              >
                Pc
              </Button>
            </ButtonGroup>
          }
        </>
        : <></>
      }
      {
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
        // Players
        (asta && players && !isTakenPage) ?
        <>
          {
            players.map((player) => (
              <p key={player.id}>{player.name} - {player.role} - {player.index_role}</p>
            ))
          }
        </>
        : <></>
      }
      {
        // Add Player
        (asta && !isTakenPage) ?
        <Card>
          <Card.Header as="h5" className="bg-primary text-white">
            Create Player
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter player name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                  disabled={isCreating}
                />
              </Form.Group>
              <Form.Group controlId="team" className="mb-3">
                <Form.Label>Team</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter player team"
                  value={playerTeam}
                  onChange={(e) => setPlayerTeam(e.target.value)}
                  required
                  disabled={isCreating}
                />
              </Form.Group>
              <Form.Group controlId="notes" className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Enter player notes"
                  rows={3}
                  value={playerNotes}
                  onChange={(e) => setPlayerNotes(e.target.value)}
                  required
                  disabled={isCreating}
                />
              </Form.Group>
              {
                asta.type == "classic" ?
                <Form.Group controlId="role_classic" className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={playerRole1}
                    onChange={(e) => {
                      setPlayerRole1(e.target.value);
                      setPlayerRoleMantra("-");
                    }}
                  >
                    <option value="">-</option>
                    <option value="P">P</option>
                    <option value="D">D</option>
                    <option value="C">C</option>
                    <option value="A">A</option>
                  </Form.Select>
                </Form.Group>
                :
                <>
                  <Form.Group controlId="role_mantra_1" className="mb-3">
                    <Form.Label>Role 1</Form.Label>
                    <Form.Select
                      value={playerRole1}
                      onChange={(e) => {
                        setPlayerRole1(e.target.value);
                      }}
                    >
                      <option value="">-</option>
                      <option value="P">P</option>
                      <option value="Dc">Dc</option>
                      <option value="B">B</option>
                      <option value="Dd">Dd</option>
                      <option value="Ds">Ds</option>
                      <option value="E">E</option>
                      <option value="M">M</option>
                      <option value="C">C</option>
                      <option value="T">T</option>
                      <option value="W">W</option>
                      <option value="A">A</option>
                      <option value="Pc">Pc</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId="role_mantra_2" className="mb-3">
                    <Form.Label>Role 2</Form.Label>
                    <Form.Select
                      value={playerRole2}
                      onChange={(e) => {
                        setPlayerRole2(e.target.value);
                      }}
                    >
                      <option value="">-</option>
                      <option value="P">P</option>
                      <option value="Dc">Dc</option>
                      <option value="B">B</option>
                      <option value="Dd">Dd</option>
                      <option value="Ds">Ds</option>
                      <option value="E">E</option>
                      <option value="M">M</option>
                      <option value="C">C</option>
                      <option value="T">T</option>
                      <option value="W">W</option>
                      <option value="A">A</option>
                      <option value="Pc">Pc</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId="role_mantra_3" className="mb-3">
                    <Form.Label>Role 3</Form.Label>
                    <Form.Select
                      value={playerRole3}
                      onChange={(e) => {
                        setPlayerRole3(e.target.value);
                      }}
                    >
                      <option value="">-</option>
                      <option value="P">P</option>
                      <option value="Dc">Dc</option>
                      <option value="B">B</option>
                      <option value="Dd">Dd</option>
                      <option value="Ds">Ds</option>
                      <option value="E">E</option>
                      <option value="M">M</option>
                      <option value="C">C</option>
                      <option value="T">T</option>
                      <option value="W">W</option>
                      <option value="A">A</option>
                      <option value="Pc">Pc</option>
                    </Form.Select>
                  </Form.Group>
                </>
              }
              <Button
                variant="primary"
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? "Submitting..." : "Create Player"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
        : <></>
      }
      {
        // Pagina Taken
        (isTakenPage && playersTaken && fantallenatoriAsta) ?
        <>
          <h1>Players Taken:</h1>
          {
            playersTaken.map((playerTaken) => (
              <p key={playerTaken.id}>{playerTaken.asta_id} - {playerTaken.player_id} - {playerTaken.name} - {playerTaken.fantallenatore_id}</p>
            ))
          }
          <h1>Fantallenatori:</h1>
          {
            fantallenatoriAsta.map((fantallenatore) => (
              <p key={fantallenatore.id}>{fantallenatore.name}</p>
            ))
          }
        </>
        : <></>
      }
    </Container>
  );
}

export default AstaDetails;
