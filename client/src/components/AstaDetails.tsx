import { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card, ButtonGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from '../utilities/toast';
import API from "../API/API";
import Asta from "../entities/asta";
import Player from "../entities/player";

function AstaDetails(props: any) {

  const { asta_id } = useParams();

  const [asta, setAsta] = useState<Asta>();
  const [currentRole, setCurrentRole] = useState<string>("P");
  const [players, setPlayers] = useState<Player[]>();

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
        const players = await API.getPlayers(Number(asta_id), currentRole);
        const sortedPlayers = players.sort((a, b) => a.index_role - b.index_role);
        setPlayers(sortedPlayers);
        setDirty(false);
      } catch (error) {
        showToast.error('Failed to load Players');
      }
    };

    loadPlayers();
  }, [asta_id, dirty, currentRole]);

  return (
    <Container className="my-5">
      <h3>Asta ID: {asta_id}</h3>
      {
        asta ?
        <p>
          {asta.name} - {asta.type} - max crediti: {asta.max_crediti} - n.fantallenatori: {asta.n_fantallenatori}
        </p>
        : <></>
      }
      {
        // Selezione ruolo
        asta ?
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
        : <p>Information not loaded</p>
      }
      {
        // Players
        (asta && players) ?
        <>
          {
            players.map((player) => (
              <p key={player.id}>{player.name} - {player.role} - {player.index_role}</p>
            ))
          }
        </>
        : <p>Information not loaded</p>
      }
      {
        // Add Player
        
      }
    </Container>
  );
}

export default AstaDetails;
