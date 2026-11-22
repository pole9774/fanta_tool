import Asta from "../entities/asta";
import Fantallenatore from "../entities/fantallenatore";
import PlayerTaken from "../entities/playerTaken";
import { getFantallenatoreStats, quotaTitle } from "../utilities/fantallenatoreStats";
import { useBalancedColumns } from "../hooks/useBalancedColumns";
import RoleBadge from "./RoleBadge";

// Larghezza minima (px) di una chip: sotto questa soglia le chip vanno su due file
const MIN_CHIP_WIDTH = 170;
const CHIP_GAP = 6;

interface FantallenatoriSummaryProps {
  asta: Asta;
  fantallenatori: Fantallenatore[];
  playersTaken: PlayerTaken[];
}

// Riepilogo compatto dei fantallenatori sopra la lista giocatori: crediti residui, puntata massima, quote per ruolo
function FantallenatoriSummary(props: FantallenatoriSummaryProps) {

  const { ref, columns } = useBalancedColumns(props.fantallenatori.length, MIN_CHIP_WIDTH, CHIP_GAP);

  return (
    <div
      ref={ref}
      style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: CHIP_GAP }}
    >
      {
        props.fantallenatori.map((f) => {
          const stats = getFantallenatoreStats(f, props.playersTaken, props.asta.type);

          return (
            <div key={f.id} className="summary-chip">
              <div className="d-flex align-items-baseline gap-2">
                <span className="fw-semibold text-truncate flex-grow-1" style={{ minWidth: 0 }} title={f.name}>{f.name}</span>
                <span className="credits" title={`Crediti residui (tot. ${f.max_crediti})`}>
                  {stats.remaining}<i className="bi bi-coin ms-1 text-warning" style={{ fontSize: "0.75rem" }}></i>
                </span>
              </div>
              <div className="d-flex flex-wrap align-items-center column-gap-2 row-gap-1 mt-1">
                {
                  stats.quotas.map((q) => (
                    <span key={q.role} className="d-inline-flex align-items-center gap-1 text-nowrap" title={quotaTitle(q)}>
                      <RoleBadge astaType={props.asta.type} role={q.role} size="sm" />
                      <span>{q.taken}/{q.max}</span>
                    </span>
                  ))
                }
                <span className="max-bid ms-auto" title="Puntata massima: crediti residui meno 1 per ogni altro giocatore ancora da acquistare">
                  max {stats.maxBid}
                </span>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

export default FantallenatoriSummary;
