class Fantallenatore {
    id: number;
    asta_id: number;
    name: string;
    max_crediti: number;
    crediti_spent: number;
    classic_p: number;
    classic_d: number;
    classic_c: number;
    classic_a: number;
    mantra_por_min: number;
    mantra_por_max: number;
    mantra_mov_min: number;
    mantra_mov_max: number;

    constructor (
        id: number,
        asta_id: number,
        name: string,
        max_crediti: number,
        crediti_spent: number,
        classic_p: number,
        classic_d: number,
        classic_c: number,
        classic_a: number,
        mantra_por_min: number,
        mantra_por_max: number,
        mantra_mov_min: number,
        mantra_mov_max: number
    ) {
        this.id = id;
        this.asta_id = asta_id;
        this.name = name;
        this.max_crediti = max_crediti;
        this.crediti_spent = crediti_spent;
        this.classic_p = classic_p;
        this.classic_d = classic_d;
        this.classic_c = classic_c;
        this.classic_a = classic_a;
        this.mantra_por_min = mantra_por_min;
        this.mantra_por_max = mantra_por_max;
        this.mantra_mov_min = mantra_mov_min;
        this.mantra_mov_max = mantra_mov_max;
    }
}

export default Fantallenatore;
