class Asta {
    id: number;
    name: string;
    type: string;
    max_crediti: number;
    n_fantallenatori: number;

    constructor (
        id: number,
        name: string,
        type: string,
        max_crediti: number,
        n_fantallenatori: number
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.max_crediti = max_crediti;
        this.n_fantallenatori = n_fantallenatori;
    }
}

export default Asta;
