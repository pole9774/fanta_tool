class PlayerTaken {
    id: number;
    asta_id: number;
    player_id: number;
    fantallenatore_id: number;
    crediti: number;
    name: string;
    team: string;
    role: string;
    role_mantra: string;

    constructor (
        id: number,
        asta_id: number,
        player_id: number,
        fantallenatore_id: number,
        crediti: number,
        name: string,
        team: string,
        role: string,
        role_mantra: string
    ) {
        this.id = id;
        this.asta_id = asta_id;
        this.player_id = player_id;
        this.fantallenatore_id = fantallenatore_id;
        this.crediti = crediti;
        this.name = name;
        this.team = team;
        this.role = role;
        this.role_mantra = role_mantra;
    }
}

export default PlayerTaken;
