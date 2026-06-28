import Asta from "../entities/asta";
import Player from "../entities/player";

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
    const response = await fetch(baseURL + `asta/${asta_id}/players/${role}/`)

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

const API = {
    getAste,
    getAsta,
    getPlayers
};

export default API;
