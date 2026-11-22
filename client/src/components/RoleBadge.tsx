import { getRoleColor, splitMantraRoles } from "../utilities/roles";

interface RoleBadgeProps {
  astaType: string;
  role: string;
  size?: "sm" | "md";
}

// Pallino (ruolo di una lettera) o pill (ruoli mantra di due lettere) colorato in base al ruolo
function RoleBadge(props: RoleBadgeProps) {
  const px = props.size == "sm" ? 14 : 17;

  return (
    <span
      className={`role-badge bg-${getRoleColor(props.astaType, props.role)}`}
      style={{ minWidth: px, height: px, fontSize: props.size == "sm" ? "0.62rem" : "0.7rem" }}
    >
      {props.role}
    </span>
  );
}

interface PlayerRolesProps {
  astaType: string;
  role: string;
  roleMantra: string;
  size?: "sm" | "md";
}

// Ruoli di un giocatore: in classic il ruolo della riga, in mantra tutti i ruoli di role_mantra
export function PlayerRoles(props: PlayerRolesProps) {
  const roles = props.astaType == "classic" ? [props.role] : splitMantraRoles(props.roleMantra);

  return (
    <span className="d-inline-flex align-items-center flex-shrink-0" style={{ gap: 2 }}>
      {roles.map((r) => (
        <RoleBadge key={r} astaType={props.astaType} role={r} size={props.size} />
      ))}
    </span>
  );
}

export default RoleBadge;
