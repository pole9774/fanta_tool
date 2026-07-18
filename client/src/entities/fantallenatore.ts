class Fantallenatore {
    id: number;
    asta_id: number;
    name: string;
    max_crediti: number;
    crediti_spent: number;

    constructor (
        id: number,
        asta_id: number,
        name: string,
        max_crediti: number,
        crediti_spent: number
    ) {
        this.id = id;
        this.asta_id = asta_id;
        this.name = name;
        this.max_crediti = max_crediti;
        this.crediti_spent = crediti_spent;
    }
}

export default Fantallenatore;
