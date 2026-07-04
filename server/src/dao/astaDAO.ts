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

    async getAsta(asta_id: number): Promise<any> {
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

            db.get(sql, [asta_id], (err: Error | null, row: any) => {
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

    async getPlayers(asta_id: number, role: string): Promise<any[]> {
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

            db.all(sql, [asta_id, role], (err: Error | null, rows: any[]) => {
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

    async createAsta(name: string, type: string, max_crediti: number) {
        return new Promise<any>((resolve, reject) => {
            try {
                const sql = `
                    INSERT INTO Aste (name, type, max_crediti)
                    VALUES (?, ?, ?)
                `;

                db.run(sql, [name, type, max_crediti], function (err: Error | null) {
                    if (err) {
                        return reject(err);
                    }

                    resolve({ name, type, max_crediti });
                });
            }
            catch (error: any) {
                reject(error);
            }
        });
    }

    async createPlayer(asta_id: number, name: string, team: string, role: string, role_mantra: string, notes: string, taken: number) {
        return new Promise<any>((resolve, reject) => {
            try {
                const sql = `
                    INSERT INTO Players (asta_id, name, team, role, index_role, role_mantra, notes, taken)
                    VALUES (?, ?, ?, ?, COALESCE((SELECT MAX(index_role) FROM Players WHERE role = ? AND asta_id = ?), 0) + 1, ?, ?, ?)
                `;

                db.run(sql, [asta_id, name, team, role, role, asta_id, role_mantra, notes, taken], function (err: Error | null) {
                    if (err) {
                        return reject(err);
                    }

                    resolve({ asta_id, name, team, role, role_mantra });
                });
            }
            catch (error: any) {
                reject(error);
            }
        });
    }

    async updatePlayerIndexRole(asta_id: number, player_id: number, role: string, newIndexRole: number) {
        return new Promise<any>((resolve, reject) => {
            const get_current_sql = `
                SELECT
                    (SELECT index_role FROM Players WHERE id = ?) as current_index_role,
                    (SELECT MAX(index_role) FROM Players WHERE asta_id = ? AND role = ?) as max_index_role
            `;

            db.get(get_current_sql, [player_id, asta_id, role], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }

                if (!row || row.current_index_role == null) {
                    return reject(new Error("Player not found"));
                }

                const old_index_role = row.current_index_role;
                const max_index_role = row.max_index_role;
                const new_index_role = Math.max(1, Math.min(newIndexRole, max_index_role));

                if (new_index_role == old_index_role) {
                    return resolve({ player_id, old_index_role, new_index_role });
                }

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");

                    if (new_index_role < old_index_role) {
                        db.run(`UPDATE Players SET index_role = index_role + 1 WHERE index_role >= ? AND index_role < ? AND asta_id = ? AND role = ?`,
                            [new_index_role, old_index_role, asta_id, role]
                        );
                    } else {
                        db.run(`UPDATE Players SET index_role = index_role - 1 WHERE index_role > ? AND index_role <= ? AND asta_id = ? AND role = ?`,
                            [old_index_role, new_index_role, asta_id, role]
                        );
                    }

                    db.run(`UPDATE Players SET index_role = ? WHERE id = ?`, [new_index_role, player_id]);

                    db.run("COMMIT", (err: Error | null) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve({ player_id, old_index_role, new_index_role });
                    });
                });
            });
        });
    }

    async createFantallenatore(asta_id: number, name: string) {
        return new Promise<any>((resolve, reject) => {
            try {
                const sql = `
                    INSERT INTO Fantallenatori (asta_id, name)
                    VALUES (?, ?)
                `;

                db.run(sql, [asta_id, name], function (err: Error | null) {
                    if (err) {
                        return reject(err);
                    }

                    resolve({ asta_id, name });
                });
            }
            catch (error: any) {
                reject(error);
            }
        });
    }

    async getFantallenatori(asta_id: number) {
        return new Promise<any[]>((resolve, reject) =>  {
            const sql = `
                SELECT
                    F.id,
                    F.asta_id,
                    F.name
                FROM Fantallenatori F
                WHERE F.asta_id = ?
            `;

            db.all(sql, [asta_id], (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(err);
                }

                const fantallenatori = rows.map((row) => ({
                    id: row.id,
                    asta_id: row.asta_id,
                    name: row.name,
                    crediti_spent: row.crediti_spent
                }));

                resolve(fantallenatori);
            });
        });
    }

    async assignPlayer(asta_id: number, player_id: number, player_name: string, fantallenatore_id: number, crediti: number) {
        return new Promise<any>((resolve, reject) => {
            try {
                const insert_sql = `
                    INSERT INTO PlayersTaken (asta_id, player_id, fantallenatore_id, crediti, index_taken)
                    VALUES (?, ?, ?, ?, COALESCE((SELECT MAX(index_taken) FROM PlayersTaken WHERE fantallenatore_id = ?), 0) + 1)
                `;

                const mark_taken_sql = `
                    UPDATE Players SET taken = 1
                    WHERE name = ? AND asta_id = ?
                `;

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");

                    db.run(insert_sql, [asta_id, player_id, fantallenatore_id, crediti, fantallenatore_id]);

                    db.run(mark_taken_sql, [player_name, asta_id]);

                    db.run("COMMIT", (err: Error | null) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve({ player_id, player_name, fantallenatore_id, crediti });
                    });
                });
            }
            catch (error: any) {
                reject(error);
            }
        });
    }

    async getPlayersTaken(asta_id: number) {
        return new Promise<any[]>((resolve, reject) => {
            const sql = `
                SELECT 
                    T.id,
                    T.asta_id,
                    T.player_id,
                    T.fantallenatore_id,
                    T.crediti,
                    T.index_taken,
                    P.name,
                    P.team,
                    P.role,
                    P.role_mantra
                FROM PlayersTaken T, Players P
                WHERE T.player_id = P.id and T.asta_id = ?
            `;

            db.all(sql, [asta_id], (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(err);
                }

                const players = rows.map((row) => ({
                    id: row.id,
                    asta_id: row.asta_id,
                    player_id: row.player_id,
                    fantallenatore_id: row.fantallenatore_id,
                    crediti: row.crediti,
                    index_taken: row.index_taken,
                    name: row.name,
                    team: row.team,
                    role: row.role,
                    role_mantra: row.role_mantra
                }));

                resolve(players);
            });
        });
    }

    async getCreditiSpent(fantallenatore_id: number) {
        return new Promise<any>((resolve, reject) =>  {
            const sql = `
                SELECT COALESCE(SUM(crediti), 0) AS crediti_spent
                FROM PlayersTaken
                WHERE fantallenatore_id = ?
            `;

            db.get(sql, [fantallenatore_id], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }

                if (!row) {
                    return resolve(null);
                }

                const crediti_spent = {
                    crediti_spent: row.crediti_spent
                };

                resolve(crediti_spent);
            });
        });
    }

    async reassignPlayer(taken_id: number, fantallenatore_id: number) {
        return new Promise<any>((resolve, reject) => {
            const sql = `
                UPDATE PlayersTaken
                SET fantallenatore_id = ?
                WHERE id = ?
            `;

            db.run(sql, [fantallenatore_id, taken_id], function (err: Error | null) {
                if (err) {
                    return reject(err);
                }

                resolve({ taken_id, fantallenatore_id });
            });
        });
    }

    async updateNotes(asta_id: number, player_id: number, player_name: string, notes: string) {
        return new Promise<any>((resolve, reject) => {
            const sql = `
                UPDATE Players
                SET notes = ?
                WHERE asta_id = ? AND name = ?
            `;

            db.run(sql, [notes, asta_id, player_name], function (err: Error | null) {
                if (err) {
                    return reject(err);
                }

                resolve({ asta_id, player_id, player_name, notes });
            });
        });
    }
}

export default AstaDAO;
