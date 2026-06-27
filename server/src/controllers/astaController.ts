import AstaDAO from "../dao/astaDAO";

class AstaController {
    private astaDAO: AstaDAO;

    constructor() {
        this.astaDAO = new AstaDAO();
    }

    async getAste(): Promise<any> {
        return this.astaDAO.getAste();
    }

    async getAsta(asta_id: number): Promise<any> {
        return this.astaDAO.getAsta(asta_id);
    }

    async getPlayers(asta_id: number, role: string): Promise<any> {
        return this.astaDAO.getPlayers(asta_id, role);
    }

    async createAsta(name: string, type: string, max_crediti: number) {
        return this.astaDAO.createAsta(name, type, max_crediti);
    }

    async createPlayer(asta_id: number, name: string, team: string, role: string, role_mantra: string, notes: string, taken: number) {
        return this.astaDAO.createPlayer(asta_id, name, team, role, role_mantra, notes, taken);
    }

    async updatePlayerIndexRole(asta_id: number, player_id: number, role: string, newIndexRole: number) {
        return this.astaDAO.updatePlayerIndexRole(asta_id, player_id, role, newIndexRole);
    }

    async createFantallenatore(asta_id: number, name: string) {
        return this.astaDAO.createFantallenatore(asta_id, name);
    }

    async getFantallenatori(asta_id: number) {
        return this.astaDAO.getFantallenatori(asta_id);
    }

    async assignPlayer(asta_id: number, player_id: number, player_name: string, fantallenatore_id: number, crediti: number) {
        return this.astaDAO.assignPlayer(asta_id, player_id, player_name, fantallenatore_id, crediti);
    }

    async getPlayersTaken(asta_id: number) {
        return this.astaDAO.getPlayersTaken(asta_id);
    }
}

export default AstaController;
