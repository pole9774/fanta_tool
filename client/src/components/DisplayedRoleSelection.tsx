import { Button, ButtonGroup } from "react-bootstrap";
import Asta from "../entities/asta";
import { getRoles, getRoleColor } from "../utilities/roles";

interface DisplayedRoleSelectionProps {
  asta: Asta;
  currentRole: string;
  setCurrentRole: (role: string) => void;
}

// Selettore del ruolo di cui mostrare la lista; il ruolo attivo prende il colore del ruolo
function DisplayedRoleSelection(props: DisplayedRoleSelectionProps) {

  return (
    <ButtonGroup size="sm">
      {
        getRoles(props.asta.type).map((role) => (
          <Button
            key={role}
            variant={props.currentRole == role ? getRoleColor(props.asta.type, role) : "outline-secondary"}
            className={props.currentRole == role ? "text-white fw-semibold" : ""}
            style={{ minWidth: 38 }}
            onClick={() => props.setCurrentRole(role)}
          >
            {role}
          </Button>
        ))
      }
    </ButtonGroup>
  );
}

export default DisplayedRoleSelection;
