import { Badge } from "react-bootstrap";

// Badge "classic" / "mantra"
function AstaTypeBadge(props: { type: string }) {
  return (
    <Badge bg={props.type == "classic" ? "primary" : "info"} className="text-uppercase" style={{ letterSpacing: "0.04em" }}>
      {props.type}
    </Badge>
  );
}

export default AstaTypeBadge;
