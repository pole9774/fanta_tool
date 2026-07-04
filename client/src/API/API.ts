import Asta from "../entities/asta";
import Player from "../entities/player";
import Fantallenatore from "../entities/fantallenatore";
import PlayerTaken from "../entities/playerTaken";

const baseURL = "http://localhost:3001/api/";

async function getAste() {
    const response = await fetch(baseURL + "asta/");

    if (response.ok) {
        const aste: Asta[] = await response.json();
        return aste;
    } else {
        const errDetail = await response.json();
        if (errDetail.error) throw errDetail.error;
        if (errDetail.message) throw errDetail.message;
        throw new Error("Error. Please reload the page");
    }
}

async function getAsta(id: number) {
    const response = await fetch(baseURL + `asta/${id}/`);

    if (response.ok) {
        const asta: Asta = await response.json();
        return asta;
    } else {
        const errDetail = await response.json();
        if (errDetail.error) throw errDetail.error;
        if (errDetail.message) throw errDetail.message;
        throw new Error("Error. Please reload the page");
    }
}

async function getPlayers(asta_id: number, role: string) {
    const response = await fetch(baseURL + `asta/${asta_id}/players/${role}/`);

    if (response.ok) {
        const players: Player[] = await response.json();
        return players;
    } else {
        const errDetail = await response.json();
        if (errDetail.error) throw errDetail.error;
        if (errDetail.message) throw errDetail.message;
        throw new Error("Error. Please reload the page");
    }
}

async function addAsta(name: string, type: string, max_crediti: number, n_fantallenatori: number) {
    const response = await fetch(baseURL + "asta/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, type, max_crediti, n_fantallenatori }),
    });

    return response;
}

async function addPlayer(
    asta_id: number,
    name: string,
    team: string,
    role: string,
    role_mantra: string,
    notes: string
) {
    const response = await fetch(baseURL + `asta/${asta_id}/players/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            team,
            role,
            role_mantra,
            notes,
            taken: 0
        }),
    });

    return response;
}

async function updatePlayerIndex(asta_id: number, player_id: number, role: string, new_index_role: number) {
    const response = await fetch(baseURL + `asta/${asta_id}/players/${player_id}/`, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, new_index_role }),
    });

    return response;
}

async function addFantallenatore(asta_id: number, name: string) {
    const response = await fetch(baseURL + `asta/${asta_id}/fantallenatori/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    });

    return response;
}

async function getFantallenatori(asta_id: number) {
    const response = await fetch(baseURL + `asta/${asta_id}/fantallenatori/`);

    if (response.ok) {
        const fantallenatori: Fantallenatore[] = await response.json();
        return fantallenatori;
    } else {
        const errDetail = await response.json();
        if (errDetail.error) throw errDetail.error;
        if (errDetail.message) throw errDetail.message;
        throw new Error("Error. Please reload the page");
    }
}

async function assignPlayer(
    asta_id: number,
    player_id: number,
    player_name: string,
    fantallenatore_id: number,
    crediti: number
) {
    const response = await fetch(baseURL + `asta/${asta_id}/assign-player/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ player_id, player_name, fantallenatore_id, crediti }),
    });

    return response;
}

async function getPlayersTaken(asta_id: number) {
    const response = await fetch(baseURL + `asta/${asta_id}/players-taken/`);

    if (response.ok) {
        const playersTaken: PlayerTaken[] = await response.json();
        return playersTaken;
    } else {
        const errDetail = await response.json();
        if (errDetail.error) throw errDetail.error;
        if (errDetail.message) throw errDetail.message;
        throw new Error("Error. Please reload the page");
    }
}

async function getCreditiSpent(fantallenatore_id: number) {
    const response = await fetch(baseURL + `asta/fantallenatore/${fantallenatore_id}/crediti-spent/`);

    if (response.ok) {
        const crediti: any = await response.json();
        return crediti;
    } else {
        const errDetail = await response.json();
        if (errDetail.error) throw errDetail.error;
        if (errDetail.message) throw errDetail.message;
        throw new Error("Error. Please reload the page");
    }
}

async function reassignPlayer(taken_id: number, fantallenatore_id: number) {
    const response = await fetch(baseURL + `asta/re-assign/${taken_id}/fantallenatore/${fantallenatore_id}/`, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        },
    });

    return response;
}

async function updateNotes(asta_id: number, player_id: number, player_name: string, notes: string) {
    const response = await fetch(baseURL + `asta/${asta_id}/players/${player_id}/notes/`, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ player_name, notes }),
    });

    return response;
}

const API = {
    getAste,
    getAsta,
    getPlayers,
    addAsta,
    addPlayer,
    updatePlayerIndex,
    addFantallenatore,
    getFantallenatori,
    assignPlayer,
    getPlayersTaken,
    getCreditiSpent,
    reassignPlayer,
    updateNotes
};

export default API;
