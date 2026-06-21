import AstaDAO from "../dao/astaDAO";

class AstaController {
    private astaDAO: AstaDAO;

    constructor() {
        this.astaDAO = new AstaDAO();
    }

    async getAste(): Promise<any> {
        return this.astaDAO.getAste();
    }

    async getAsta(astaId: number): Promise<any> {
        return this.astaDAO.getAsta(astaId);
    }

    async getPlayers(astaId: number, role: string): Promise<any> {
        return this.astaDAO.getPlayers(astaId, role);
    }
}

export default AstaController;
