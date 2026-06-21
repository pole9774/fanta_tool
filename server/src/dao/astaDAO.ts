import db from "../db/db";

class AstaDAO {
    async getAste(): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            const sql = `
                SELECT 
                    A.id,
                    A.name,
                    A.type,
                    A.max_crediti
                FROM Aste A
            `;

            db.all(sql, [], (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(err);
                }

                const aste = rows.map((row) => ({
                    id: row.id,
                    name: row.name,
                    type: row.type,
                    max_crediti: row.max_crediti
                }));

                resolve(aste);
            });
        });
    }

    async getAsta(astaId: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const sql = `
                SELECT 
                    A.id,
                    A.name,
                    A.type,
                    A.max_crediti
                FROM Aste A
                WHERE A.id = ?
                GROUP BY A.id
            `;

            db.get(sql, [astaId], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }

                if (!row) {
                    return resolve(null);
                }

                const asta = {
                    id: row.id,
                    name: row.name,
                    type: row.type,
                    max_crediti: row.max_crediti
                };

                resolve(asta);
            });
        });
    }

    async getPlayers(astaId: number, role: string): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            const sql = `
                SELECT 
                    P.id,
                    P.asta_id,
                    P.name,
                    P.team,
                    P.role,
                    P.index_role,
                    P.role_mantra,
                    P.notes,
                    P.taken
                FROM Players P
                WHERE P.asta_id = ? AND P.role = ?
            `;

            db.all(sql, [astaId, role], (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(err);
                }

                const players = rows.map((row) => ({
                    id: row.id,
                    asta_id: row.asta_id,
                    name: row.name,
                    team: row.team,
                    role: row.role,
                    index_role: row.index_role,
                    role_mantra: row.role_mantra,
                    notes: row.notes,
                    taken: row.taken
                }));

                resolve(players);
            });
        });
    }
}

export default AstaDAO;
