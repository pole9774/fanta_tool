interface TeamLogoProps {
  team: string;
  size?: number;
}

// Logo squadra da /public/teams/<team>.png, con default.png se manca
function TeamLogo(props: TeamLogoProps) {
  const size = props.size ?? 16;

  return (
    <img
      src={`/teams/${props.team}.png`}
      alt={props.team}
      title={props.team}
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      className="flex-shrink-0"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/teams/default.png";
      }}
    />
  );
}

export default TeamLogo;
