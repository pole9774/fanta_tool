import { Button, ButtonGroup } from "react-bootstrap";

function DisplayedRoleSelection(props: any) {

  return (
    <>
      {
        props.asta.type == "classic" ?
          <ButtonGroup>
            <Button
              variant={props.currentRole == "P" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("P")}
            >
              P
            </Button>
            <Button
              variant={props.currentRole == "D" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("D")}
            >
              D
            </Button>
            <Button
              variant={props.currentRole == "C" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("C")}
            >
              C
            </Button>
            <Button
              variant={props.currentRole == "A" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("A")}
            >
              A
            </Button>
          </ButtonGroup>
          :
          <ButtonGroup>
            <Button
              variant={props.currentRole == "P" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("P")}
            >
              P
            </Button>
            <Button
              variant={props.currentRole == "Dc" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("Dc")}
            >
              Dc
            </Button>
            <Button
              variant={props.currentRole == "B" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("B")}
            >
              B
            </Button>
            <Button
              variant={props.currentRole == "Dd" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("Dd")}
            >
              Dd
            </Button>
            <Button
              variant={props.currentRole == "Ds" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("Ds")}
            >
              Ds
            </Button>
            <Button
              variant={props.currentRole == "E" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("E")}
            >
              E
            </Button>
            <Button
              variant={props.currentRole == "M" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("M")}
            >
              M
            </Button>
            <Button
              variant={props.currentRole == "C" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("C")}
            >
              C
            </Button>
            <Button
              variant={props.currentRole == "T" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("T")}
            >
              T
            </Button>
            <Button
              variant={props.currentRole == "W" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("W")}
            >
              W
            </Button>
            <Button
              variant={props.currentRole == "A" ? "primary" : "outline-primary"}
              onClick={() => props.setCurrentRole("A")}
            >
              A
            </Button>
            <Button
              variant={props.currentRole == "Pc" ? "primary" : "outline-primary"}
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
