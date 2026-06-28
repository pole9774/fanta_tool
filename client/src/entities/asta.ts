class Asta {
    id: number;
    name: string;
    type: string;
    max_crediti: number;

    constructor (
        id: number,
        name: string,
        type: string,
        max_crediti: number,
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.max_crediti = max_crediti;
    }
}

export default Asta;
