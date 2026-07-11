import { useState } from 'react';
import { Button, Form, Card } from "react-bootstrap";
import { showToast } from '../utilities/toast';
import API from "../API/API";

function AddFantallenatoreForm(props: any) {

  const [nameFantallenatore, setNameFantallenatore] = useState<string>("");
  const [maxCreditiFantallenatore, setMaxCreditiFantallenatore] = useState<number>(1000);

  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await API.addFantallenatore(Number(props.asta_id), nameFantallenatore, maxCreditiFantallenatore);

      if (response && response.ok) {
        showToast.success("Fantallenatore created successfully");
        setNameFantallenatore("");
        setMaxCreditiFantallenatore(1000);
        props.setDirty(true);
      } else {
        showToast.error("Failed to create the Fantallenatore");
      }
    } catch (error) {
      showToast.error("Failed to create the Fantallenatore");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <Card.Header as="h5" className="bg-primary text-white">
        Create Fantallenatore
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter fantallenatore name"
              value={nameFantallenatore}
              onChange={(e) => setNameFantallenatore(e.target.value)}
              required
              disabled={isCreating}
            />
          </Form.Group>
          <Form.Group controlId="n_fantallenatori" className="mb-3">
            <Form.Label>Max Crediti</Form.Label>
            <Form.Control
              type="number"
              placeholder="Insert max crediti"
              step={1}
              value={maxCreditiFantallenatore}
              onChange={(e) => setMaxCreditiFantallenatore(Number(e.target.value))}
              required
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Submitting..." : "Create Fantallenatore"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default AddFantallenatoreForm;
