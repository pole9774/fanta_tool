import { Button, ButtonGroup } from "react-bootstrap";

function DisplayedRoleSelection(props: any) {

  return (
    <>
      {
        props.asta.type == "classic" ?
          <ButtonGroup className="mt-3 me-4">
            <Button
              variant={props.currentRole == "P" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("P")}
            >
              P
            </Button>
            <Button
              variant={props.currentRole == "D" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("D")}
            >
              D
            </Button>
            <Button
              variant={props.currentRole == "C" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("C")}
            >
              C
            </Button>
            <Button
              variant={props.currentRole == "A" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("A")}
            >
              A
            </Button>
          </ButtonGroup>
          :
          <ButtonGroup className="mt-3 me-3">
            <Button
              variant={props.currentRole == "P" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("P")}
            >
              P
            </Button>
            <Button
              variant={props.currentRole == "Dc" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("Dc")}
            >
              Dc
            </Button>
            <Button
              variant={props.currentRole == "B" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("B")}
            >
              B
            </Button>
            <Button
              variant={props.currentRole == "Dd" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("Dd")}
            >
              Dd
            </Button>
            <Button
              variant={props.currentRole == "Ds" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("Ds")}
            >
              Ds
            </Button>
            <Button
              variant={props.currentRole == "E" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("E")}
            >
              E
            </Button>
            <Button
              variant={props.currentRole == "M" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("M")}
            >
              M
            </Button>
            <Button
              variant={props.currentRole == "C" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("C")}
            >
              C
            </Button>
            <Button
              variant={props.currentRole == "T" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("T")}
            >
              T
            </Button>
            <Button
              variant={props.currentRole == "W" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("W")}
            >
              W
            </Button>
            <Button
              variant={props.currentRole == "A" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("A")}
            >
              A
            </Button>
            <Button
              variant={props.currentRole == "Pc" ? "secondary" : "outline-secondary"}
              onClick={() => props.setCurrentRole("Pc")}
            >
              Pc
            </Button>
          </ButtonGroup>
      }
    </>
  );
}

export default DisplayedRoleSelection;
