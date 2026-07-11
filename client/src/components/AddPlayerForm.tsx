import { useState, useEffect } from 'react';
import { Button, Form, Card } from "react-bootstrap";
import { showToast } from '../utilities/toast';
import API from "../API/API";

function AddPlayerForm(props: any) {

  const [playerName, setPlayerName] = useState<string>("");
  const [playerTeam, setPlayerTeam] = useState<string>("");
  const [playerRole1, setPlayerRole1] = useState<string>("");
  const [playerRole2, setPlayerRole2] = useState<string>("");
  const [playerRole3, setPlayerRole3] = useState<string>("");
  const [playerRoleMantra, setPlayerRoleMantra] = useState<string>("");
  const [playerNotes, setPlayerNotes] = useState<string>("");

  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      if (playerRole1 != "") {
        const response1 = await API.addPlayer(Number(props.asta_id), playerName, playerTeam, playerRole1, playerRoleMantra, playerNotes);

        if (response1 && response1.ok) {
          if (playerRole2 != "") {
            const response2 = await API.addPlayer(Number(props.asta_id), playerName, playerTeam, playerRole2, playerRoleMantra, playerNotes);

            if (response2 && response2.ok) {
              if (playerRole3 != "") {
                const response3 = await API.addPlayer(Number(props.asta_id), playerName, playerTeam, playerRole3, playerRoleMantra, playerNotes);

                if (response3 && response3.ok) {
                  showToast.success("Player created successfully");
                  setPlayerName("");
                  setPlayerTeam("");
                  setPlayerNotes("");
                  setPlayerRole1("");
                  setPlayerRole2("");
                  setPlayerRole3("");
                  setPlayerRoleMantra("");
                  props.setDirty(true);
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
                props.setDirty(true);
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
            props.setDirty(true);
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

  useEffect(() => {
    if (!props.asta || props.asta.type !== "mantra") return;

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

  return (
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
            props.asta.type == "classic" ?
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
  );
}

export default AddPlayerForm;
