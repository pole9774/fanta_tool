class Fantallenatore {
    id: number;
    asta_id: number;
    name: string;

    constructor (
        id: number,
        asta_id: number,
        name: string
    ) {
        this.id = id;
        this.asta_id = asta_id;
        this.name = name;
    }
}

export default Fantallenatore;
