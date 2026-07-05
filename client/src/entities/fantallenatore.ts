class Fantallenatore {
    id: number;
    asta_id: number;
    name: string;
    max_crediti: number;

    constructor (
        id: number,
        asta_id: number,
        name: string,
        max_crediti: number
    ) {
        this.id = id;
        this.asta_id = asta_id;
        this.name = name;
        this.max_crediti = max_crediti;
    }
}

export default Fantallenatore;
