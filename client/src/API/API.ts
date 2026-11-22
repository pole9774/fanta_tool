import Asta from "../entities/asta";
import Player from "../entities/player";
import Fantallenatore from "../entities/fantallenatore";
import PlayerTaken from "../entities/playerTaken";
import type { ImportedPlayer } from "../utilities/excelPlayers";
import type { PlayerStats } from "../utilities/excelStats";

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

async function addAsta(name: string, type: string, n_fantallenatori: number) {
    const response = await fetch(baseURL + "asta/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, type, n_fantallenatori }),
    });

    return response;
}

// Modifica nome e numero partecipanti di un'asta
async function updateAsta(asta_id: number, name: string, n_fantallenatori: number) {
    const response = await fetch(baseURL + `asta/${asta_id}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, n_fantallenatori }),
    });

    return response;
}

// Quanti giocatori, fantallenatori e acquisti ha un'asta
async function getAstaCounts(asta_id: number) {
    const response = await fetch(baseURL + `asta/${asta_id}/counts/`);

    if (response.ok) {
        const counts: { players: number, fantallenatori: number, players_taken: number } = await response.json();
        return counts;
    } else {
        throw new Error("Error. Please reload the page");
    }
}

// Elimina un'asta con tutti i suoi giocatori, fantallenatori e acquisti
async function deleteAsta(asta_id: number) {
    const response = await fetch(baseURL + `asta/${asta_id}/`, {
        method: "DELETE",
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

// Sposta un giocatore (singola riga-ruolo) tra classificati (true) e non classificati (false)
async function setPlayerClassified(asta_id: number, player_id: number, classified: boolean) {
    const response = await fetch(baseURL + `asta/${asta_id}/players/${player_id}/classification/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ classified }),
    });

    return response;
}

async function addFantallenatore(
    asta_id: number,
    name: string,
    max_crediti: number,
    classic_p: number,
    classic_d: number,
    classic_c: number,
    classic_a: number,
    mantra_por_min: number,
    mantra_por_max: number,
    mantra_mov_min: number,
    mantra_mov_max: number
) {
    const response = await fetch(baseURL + `asta/${asta_id}/fantallenatori/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            name,
            max_crediti,
            classic_p,
            classic_d,
            classic_c,
            classic_a,
            mantra_por_min,
            mantra_por_max,
            mantra_mov_min,
            mantra_mov_max
        }),
    });

    return response;
}

async function updateFantallenatore(
    asta_id: number,
    fantallenatore_id: number,
    fields: {
        name: string,
        max_crediti: number,
        classic_p: number,
        classic_d: number,
        classic_c: number,
        classic_a: number,
        mantra_por_min: number,
        mantra_por_max: number,
        mantra_mov_min: number,
        mantra_mov_max: number
    }
) {
    const response = await fetch(baseURL + `asta/${asta_id}/fantallenatori/${fantallenatore_id}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
    });

    return response;
}

// Elimina un fantallenatore; il server rifiuta se ha giocatori acquistati
async function deleteFantallenatore(asta_id: number, fantallenatore_id: number) {
    const response = await fetch(baseURL + `asta/${asta_id}/fantallenatori/${fantallenatore_id}/`, {
        method: "DELETE",
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

async function reassignPlayer(taken_id: number, fantallenatore_id: number, crediti: number) {
    const response = await fetch(baseURL + `asta/re-assign/${taken_id}/fantallenatore/${fantallenatore_id}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ crediti }),
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

async function cancelAssign(asta_id: number, taken_id: number, taken_name: string) {
    const response = await fetch(baseURL + `asta/${asta_id}/cancel-assign/${taken_id}/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ asta_id, taken_id, taken_name }),
    });

    return response;
}

async function deletePlayer(asta_id: number, player_id: number, player_name: string) {
    const response = await fetch(baseURL + `asta/${asta_id}/delete-player/${player_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ player_name }),
    });

    return response;
}

// Import in blocco di giocatori (es. da Excel). dry_run = true: solo riepilogo (da importare / già presenti), nessuna scrittura
async function importPlayers(asta_id: number, players: ImportedPlayer[], dry_run: boolean) {
    const response = await fetch(baseURL + `asta/${asta_id}/players/import/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ players, dry_run }),
    });

    return response;
}

// Statistiche di una stagione nelle note dei giocatori senza note. dry_run = true: solo riepilogo, nessuna scrittura
async function importStatsNotes(asta_id: number, season: string, stats: PlayerStats[], dry_run: boolean) {
    const response = await fetch(baseURL + `asta/${asta_id}/players/notes/stats/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ season, stats, dry_run }),
    });

    return response;
}

const API = {
    getAste,
    getAsta,
    getPlayers,
    addAsta,
    updateAsta,
    getAstaCounts,
    deleteAsta,
    addPlayer,
    updatePlayerIndex,
    setPlayerClassified,
    addFantallenatore,
    updateFantallenatore,
    deleteFantallenatore,
    getFantallenatori,
    assignPlayer,
    getPlayersTaken,
    reassignPlayer,
    updateNotes,
    cancelAssign,
    deletePlayer,
    importPlayers,
    importStatsNotes
};

export default API;
