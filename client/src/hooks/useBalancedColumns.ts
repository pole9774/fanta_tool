import { useEffect, useRef, useState } from "react";

// Numero di colonne per una griglia di n elementi: tutti su una fila se ogni colonna resta larga almeno minWidth px,
// altrimenti su due file (es. 10 -> 5 + 5). Il ref va messo sul contenitore della griglia.
export function useBalancedColumns(n: number, minWidth: number, gap: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fitsOneRow = width == 0 || (width - gap * (n - 1)) / n >= minWidth;
  const columns = Math.max(fitsOneRow ? n : Math.ceil(n / 2), 1);

  return { ref, columns };
}
