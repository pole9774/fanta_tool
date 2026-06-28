class Player {
    id: number;
    asta_id: number;
    name: string;
    team: string;
    role: string;
    index_role: string;
    role_mantra: string;
    notes: string;
    taken: number;

    constructor (
        id: number,
        asta_id: number,
        name: string,
        team: string,
        role: string,
        index_role: string,
        role_mantra: string,
        notes: string,
        taken: number
    ) {
        this.id = id;
        this.asta_id = asta_id;
        this.name = name;
        this.team = team;
        this.role = role;
        this.index_role = index_role;
        this.role_mantra = role_mantra;
        this.notes = notes;
        this.taken = taken;
    }
}

export default Player;
