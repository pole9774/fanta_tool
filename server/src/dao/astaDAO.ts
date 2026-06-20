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

    async getPlayers(astaId: number): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            const sql = `
                SELECT 
                    P.id,
                    P.asta_id,
                    P.name,
                    P.team,
                    P.role_classic,
                    P.role_mantra_1,
                    P.role_mantra_2,
                    P.role_mantra_3,
                    P.index_classic,
                    P.index_mantra_1,
                    P.index_mantra_2,
                    P.index_mantra_3,
                    P.notes,
                    P.taken
                FROM Players P
                WHERE P.asta_id = ?
            `;

            db.all(sql, [astaId], (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(err);
                }

                const players = rows.map((row) => ({
                    id: row.id,
                    asta_id: row.asta_id,
                    name: row.name,
                    team: row.team,
                    role_classic: row.role_classic,
                    role_mantra_1: row.role_mantra_1,
                    role_mantra_2: row.role_mantra_2,
                    role_mantra_3: row.role_mantra_3,
                    index_classic: row.index_classic,
                    index_mantra_1: row.index_mantra_1,
                    index_mantra_2: row.index_mantra_2,
                    index_mantra_3: row.index_mantra_3,
                    notes: row.notes,
                    taken: row.taken
                }));

                resolve(players);
            });
        });
    }
}

export default AstaDAO;
