import db from "../db/db";

// Ricompatta gli index_role dei giocatori classificati di un'asta (1..N per ruolo, senza buchi, mantenendo l'ordine).
// I giocatori non classificati (index_role NULL) restano NULL. Parametro: asta_id
const COMPACT_INDEXES_SQL = `
    UPDATE Players
    SET index_role = R.rn
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY role ORDER BY index_role, id) AS rn
        FROM Players
        WHERE asta_id = ? AND index_role IS NOT NULL
    ) AS R
    WHERE Players.id = R.id AND Players.index_role <> R.rn
`;

class AstaDAO {
    async getAste(): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            const sql = `
                SELECT 
                    A.id,
                    A.name,
                    A.type,
                    A.n_fantallenatori
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
                    n_fantallenatori: row.n_fantallenatori
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
                    A.n_fantallenatori
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
                    n_fantallenatori: row.n_fantallenatori
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

    async createAsta(name: string, type: string, n_fantallenatori: number) {
        return new Promise<any>((resolve, reject) => {
            try {
                const sql = `
                    INSERT INTO Aste (name, type, n_fantallenatori)
                    VALUES (?, ?, ?)
                `;

                db.run(sql, [name, type, n_fantallenatori], function (err: Error | null) {
                    if (err) {
                        return reject(err);
                    }

                    resolve({ name, type, n_fantallenatori });
                });
            }
            catch (error: any) {
                reject(error);
            }
        });
    }

    // Modifica nome e numero partecipanti di un'asta (il tipo classic/mantra non è modificabile)
    async updateAsta(asta_id: number, name: string, n_fantallenatori: number) {
        return new Promise<any>((resolve, reject) => {
            const sql = `UPDATE Aste SET name = ?, n_fantallenatori = ? WHERE id = ?`;

            db.run(sql, [name, n_fantallenatori, asta_id], function (this: any, err: Error | null) {
                if (err) {
                    return reject(err);
                }

                if (this.changes === 0) {
                    return reject(new Error("Asta not found"));
                }

                resolve({ asta_id, name, n_fantallenatori });
            });
        });
    }

    // Quanti giocatori (nomi distinti), fantallenatori e acquisti ha un'asta: mostrati prima dell'eliminazione
    async getAstaCounts(asta_id: number) {
        return new Promise<any>((resolve, reject) => {
            const sql = `
                SELECT
                    (SELECT COUNT(DISTINCT name) FROM Players WHERE asta_id = ?) AS players,
                    (SELECT COUNT(*) FROM Fantallenatori WHERE asta_id = ?) AS fantallenatori,
                    (SELECT COUNT(*) FROM PlayersTaken WHERE asta_id = ?) AS players_taken
            `;

            db.get(sql, [asta_id, asta_id, asta_id], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }

                resolve({ asta_id, players: row.players, fantallenatori: row.fantallenatori, players_taken: row.players_taken });
            });
        });
    }

    // Elimina un'asta e, a cascata, i suoi acquisti, giocatori e fantallenatori (il DB non ha foreign key)
    async deleteAsta(asta_id: number) {
        return new Promise<any>((resolve, reject) => {
            let firstError: Error | null = null;
            const trackError = (err: Error | null) => {
                if (err && !firstError) firstError = err;
            };
            const deleted = { players_taken: 0, players: 0, fantallenatori: 0, aste: 0 };

            db.serialize(() => {
                db.run("BEGIN TRANSACTION", trackError);

                db.run("DELETE FROM PlayersTaken WHERE asta_id = ?", [asta_id], function (this: any, err: Error | null) {
                    trackError(err);
                    if (!err) deleted.players_taken = this.changes;
                });
                db.run("DELETE FROM Players WHERE asta_id = ?", [asta_id], function (this: any, err: Error | null) {
                    trackError(err);
                    if (!err) deleted.players = this.changes;
                });
                db.run("DELETE FROM Fantallenatori WHERE asta_id = ?", [asta_id], function (this: any, err: Error | null) {
                    trackError(err);
                    if (!err) deleted.fantallenatori = this.changes;
                });
                db.run("DELETE FROM Aste WHERE id = ?", [asta_id], function (this: any, err: Error | null) {
                    trackError(err);
                    if (!err) deleted.aste = this.changes;

                    if (!firstError && deleted.aste === 0) {
                        firstError = new Error("Asta not found");
                    }

                    if (firstError) {
                        const error = firstError;
                        return db.run("ROLLBACK", () => reject(error));
                    }

                    db.run("COMMIT", (commitErr: Error | null) => {
                        if (commitErr) {
                            return db.run("ROLLBACK", () => reject(commitErr));
                        }
                        resolve({ asta_id, deleted });
                    });
                });
            });
        });
    }

    // I nuovi giocatori nascono non classificati (index_role NULL)
    async createPlayer(asta_id: number, name: string, team: string, role: string, role_mantra: string, notes: string, taken: number) {
        return new Promise<any>((resolve, reject) => {
            try {
                const sql = `
                    INSERT INTO Players (asta_id, name, team, role, index_role, role_mantra, notes, taken)
                    VALUES (?, ?, ?, ?, NULL, ?, ?, ?)
                `;

                db.run(sql, [asta_id, name, team, role, role_mantra, notes, taken], function (err: Error | null) {
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
                    return reject(new Error("Player not found or not classified"));
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

    async createFantallenatore(
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
        return new Promise<any>((resolve, reject) => {
            try {
                const sql = `
                    INSERT INTO Fantallenatori (asta_id, name, max_crediti, classic_p, classic_d, classic_c, classic_a, mantra_por_min, mantra_por_max, mantra_mov_min, mantra_mov_max)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.run(sql, [asta_id, name, max_crediti, classic_p, classic_d, classic_c, classic_a, mantra_por_min, mantra_por_max, mantra_mov_min, mantra_mov_max], function (err: Error | null) {
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

    async updateFantallenatore(
        asta_id: number,
        fantallenatore_id: number,
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
        return new Promise<any>((resolve, reject) => {
            const sql = `
                UPDATE Fantallenatori
                SET name = ?, max_crediti = ?,
                    classic_p = ?, classic_d = ?, classic_c = ?, classic_a = ?,
                    mantra_por_min = ?, mantra_por_max = ?, mantra_mov_min = ?, mantra_mov_max = ?
                WHERE id = ? AND asta_id = ?
            `;

            db.run(sql, [name, max_crediti, classic_p, classic_d, classic_c, classic_a, mantra_por_min, mantra_por_max, mantra_mov_min, mantra_mov_max, fantallenatore_id, asta_id], function (this: any, err: Error | null) {
                if (err) {
                    return reject(err);
                }

                if (this.changes === 0) {
                    return reject(new Error("Fantallenatore not found"));
                }

                resolve({ asta_id, fantallenatore_id, name });
            });
        });
    }

    // Elimina un fantallenatore solo se non ha giocatori acquistati (controllo e cancellazione in un'unica istruzione)
    async deleteFantallenatore(asta_id: number, fantallenatore_id: number) {
        return new Promise<any>((resolve, reject) => {
            const delete_sql = `
                DELETE FROM Fantallenatori
                WHERE id = ? AND asta_id = ?
                    AND NOT EXISTS (SELECT 1 FROM PlayersTaken WHERE fantallenatore_id = ?)
            `;

            db.run(delete_sql, [fantallenatore_id, asta_id, fantallenatore_id], function (this: any, err: Error | null) {
                if (err) {
                    return reject(err);
                }

                if (this.changes > 0) {
                    return resolve({ asta_id, fantallenatore_id });
                }

                // nessuna riga eliminata: il fantallenatore non esiste oppure ha giocatori acquistati
                db.get(
                    "SELECT id FROM Fantallenatori WHERE id = ? AND asta_id = ?",
                    [fantallenatore_id, asta_id],
                    (selectErr: Error | null, row: any) => {
                        if (selectErr) return reject(selectErr);
                        reject(new Error(row ? "Fantallenatore has players taken" : "Fantallenatore not found"));
                    }
                );
            });
        });
    }

    async getFantallenatori(asta_id: number) {
        return new Promise<any[]>((resolve, reject) => {
            const sql = `
                SELECT
                    F.id,
                    F.asta_id,
                    F.name,
                    F.max_crediti,
                    COALESCE(SUM(PT.crediti), 0) AS crediti_spent,
                    F.classic_p,
                    F.classic_d,
                    F.classic_c,
                    F.classic_a,
                    F.mantra_por_min,
                    F.mantra_por_max,
                    F.mantra_mov_min,
                    F.mantra_mov_max
                FROM Fantallenatori F
                LEFT JOIN PlayersTaken PT
                    ON PT.fantallenatore_id = F.id
                    AND PT.asta_id = F.asta_id
                WHERE F.asta_id = ?
                GROUP BY
                    F.id, F.asta_id, F.name, F.max_crediti
                ORDER BY F.id;
            `;

            db.all(sql, [asta_id], (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(err);
                }

                const fantallenatori = rows.map((row) => ({
                    id: row.id,
                    asta_id: row.asta_id,
                    name: row.name,
                    max_crediti: row.max_crediti,
                    crediti_spent: row.crediti_spent,
                    classic_p: row.classic_p,
                    classic_d: row.classic_d,
                    classic_c: row.classic_c,
                    classic_a: row.classic_a,
                    mantra_por_min: row.mantra_por_min,
                    mantra_por_max: row.mantra_por_max,
                    mantra_mov_min: row.mantra_mov_min,
                    mantra_mov_max: row.mantra_mov_max
                }));

                resolve(fantallenatori);
            });
        });
    }

    async assignPlayer(asta_id: number, player_id: number, player_name: string, fantallenatore_id: number, crediti: number) {
        return new Promise<any>((resolve, reject) => {
            try {
                const insert_sql = `
                    INSERT INTO PlayersTaken (asta_id, player_id, fantallenatore_id, crediti)
                    VALUES (?, ?, ?, ?)
                `;

                const mark_taken_sql = `
                    UPDATE Players SET taken = 1
                    WHERE name = ? AND asta_id = ?
                `;

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");

                    db.run(insert_sql, [asta_id, player_id, fantallenatore_id, crediti]);

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
                    name: row.name,
                    team: row.team,
                    role: row.role,
                    role_mantra: row.role_mantra
                }));

                resolve(players);
            });
        });
    }

    async reassignPlayer(taken_id: number, fantallenatore_id: number, crediti: number) {
        return new Promise<any>((resolve, reject) => {
            const sql = `
                UPDATE PlayersTaken
                SET fantallenatore_id = ?, crediti = ?
                WHERE id = ?
            `;

            db.run(sql, [fantallenatore_id, crediti, taken_id], function (err: Error | null) {
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

    async cancelAssign(asta_id: number, taken_id: number, taken_name: string) {
        return new Promise<any>((resolve, reject) => {
            const delete_taken_sql = `
                DELETE FROM PlayersTaken WHERE id = ?
            `;

            const update_players_sql = `
                UPDATE Players
                SET taken = 0
                WHERE asta_id = ? AND name = ?
            `;

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                db.run(delete_taken_sql, [taken_id]);

                db.run(update_players_sql, [asta_id, taken_name]);

                db.run("COMMIT", (err: Error | null) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ asta_id, taken_id, taken_name });
                });
            });
        });
    }

    async deletePlayer(asta_id: number, player_id: number, player_name: string) {
        return new Promise<any>((resolve, reject) => {
            const delete_player_sql = `
                DELETE FROM Players WHERE asta_id = ? AND name = ?
            `;

            let firstError: Error | null = null;
            const trackError = (err: Error | null) => {
                if (err && !firstError) firstError = err;
            };

            db.serialize(() => {
                db.run("BEGIN TRANSACTION", trackError);

                db.run(delete_player_sql, [asta_id, player_name], trackError);

                db.run(COMPACT_INDEXES_SQL, [asta_id], (err: Error | null) => {
                    trackError(err);

                    if (firstError) {
                        const error = firstError;
                        return db.run("ROLLBACK", () => reject(error));
                    }

                    db.run("COMMIT", (commitErr: Error | null) => {
                        if (commitErr) {
                            return db.run("ROLLBACK", () => reject(commitErr));
                        }
                        resolve({ asta_id, player_id, player_name });
                    });
                });
            });
        });
    }

    // Sposta una singola riga-ruolo tra classificati e non classificati.
    // classified = true: la riga va in fondo alla lista del suo ruolo (MAX + 1).
    // classified = false: index_role diventa NULL e la lista del ruolo viene ricompattata.
    async setPlayerClassified(asta_id: number, player_id: number, classified: boolean) {
        return new Promise<any>((resolve, reject) => {
            const get_sql = `SELECT role, index_role FROM Players WHERE id = ? AND asta_id = ?`;

            db.get(get_sql, [player_id, asta_id], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }

                if (!row) {
                    return reject(new Error("Player not found"));
                }

                const isClassified = row.index_role != null;
                if (isClassified == classified) {
                    return resolve({ asta_id, player_id, classified, index_role: row.index_role });
                }

                if (classified) {
                    const classify_sql = `
                        UPDATE Players
                        SET index_role = COALESCE((SELECT MAX(index_role) FROM Players WHERE asta_id = ? AND role = ?), 0) + 1
                        WHERE id = ? AND asta_id = ? AND index_role IS NULL
                    `;

                    return db.run(classify_sql, [asta_id, row.role, player_id, asta_id], function (err: Error | null) {
                        if (err) {
                            return reject(err);
                        }
                        resolve({ asta_id, player_id, classified });
                    });
                }

                let firstError: Error | null = null;
                const trackError = (err: Error | null) => {
                    if (err && !firstError) firstError = err;
                };

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION", trackError);

                    db.run(`UPDATE Players SET index_role = NULL WHERE id = ? AND asta_id = ?`, [player_id, asta_id], trackError);

                    db.run(COMPACT_INDEXES_SQL, [asta_id], (err: Error | null) => {
                        trackError(err);

                        if (firstError) {
                            const error = firstError;
                            return db.run("ROLLBACK", () => reject(error));
                        }

                        db.run("COMMIT", (commitErr: Error | null) => {
                            if (commitErr) {
                                return db.run("ROLLBACK", () => reject(commitErr));
                            }
                            resolve({ asta_id, player_id, classified });
                        });
                    });
                });
            });
        });
    }

    // Import in blocco (es. da file Excel). Ogni giocatore diventa una riga per ruolo, non classificata (index_role NULL).
    // I giocatori il cui nome esiste già nell'asta vengono saltati. Con dry_run calcola solo il riepilogo senza scrivere.
    async importPlayers(
        asta_id: number,
        players: { name: string, team: string, role_mantra: string, roles: string[] }[],
        dry_run: boolean
    ) {
        return new Promise<any>((resolve, reject) => {
            db.all(`SELECT DISTINCT name FROM Players WHERE asta_id = ?`, [asta_id], (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(err);
                }

                const existing = new Set(rows.map((row) => row.name));
                const seen = new Set<string>();
                const toImport: typeof players = [];
                const skipped: string[] = [];

                for (const player of players) {
                    if (existing.has(player.name) || seen.has(player.name)) {
                        skipped.push(player.name);
                    } else {
                        seen.add(player.name);
                        toImport.push(player);
                    }
                }

                if (dry_run || toImport.length == 0) {
                    return resolve({ dry_run, to_import: toImport.length, imported: 0, rows_inserted: 0, skipped });
                }

                const insert_sql = `
                    INSERT INTO Players (asta_id, name, team, role, index_role, role_mantra, notes, taken)
                    VALUES (?, ?, ?, ?, NULL, ?, '', 0)
                `;

                let firstError: Error | null = null;
                const trackError = (err: Error | null) => {
                    if (err && !firstError) firstError = err;
                };
                let rowsInserted = 0;

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION", trackError);

                    const stmt = db.prepare(insert_sql, trackError);
                    for (const player of toImport) {
                        for (const role of player.roles) {
                            stmt.run([asta_id, player.name, player.team, role, player.role_mantra], (err: Error | null) => {
                                trackError(err);
                                if (!err) rowsInserted++;
                            });
                        }
                    }

                    stmt.finalize((err: Error | null) => {
                        trackError(err);

                        if (firstError) {
                            const error = firstError;
                            return db.run("ROLLBACK", () => reject(error));
                        }

                        db.run("COMMIT", (commitErr: Error | null) => {
                            if (commitErr) {
                                return db.run("ROLLBACK", () => reject(commitErr));
                            }
                            resolve({ dry_run, to_import: toImport.length, imported: toImport.length, rows_inserted: rowsInserted, skipped });
                        });
                    });
                });
            });
        });
    }

    // Scrive le statistiche di una stagione nelle note dei giocatori che non hanno ancora note (vuote o solo spazi).
    // Abbinamento per nome; il portiere si riconosce da una riga con role = 'P' nell'asta.
    // Con dry_run calcola solo il riepilogo (con qualche esempio di nota) senza scrivere.
    async importStatsNotes(
        asta_id: number,
        season: string,
        stats: { name: string, pv: number, mv: number, fm: number, g: number, gs: number, a: number }[],
        dry_run: boolean
    ) {
        return new Promise<any>((resolve, reject) => {
            const summary_sql = `
                SELECT name,
                    MAX(CASE WHEN role = 'P' THEN 1 ELSE 0 END) AS is_gk,
                    MAX(CASE WHEN notes IS NULL OR TRIM(notes) = '' THEN 1 ELSE 0 END) AS empty_notes
                FROM Players
                WHERE asta_id = ?
                GROUP BY name
            `;

            db.all(summary_sql, [asta_id], (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(err);
                }

                const statsByName = new Map<string, typeof stats[number]>();
                for (const s of stats) {
                    statsByName.set(s.name.trim(), s);
                }

                const astaNames = new Set<string>(rows.map((row) => row.name));
                const toUpdate: { name: string, notes: string }[] = [];
                let skippedWithNotes = 0;
                let notInFile = 0;

                for (const row of rows) {
                    const s = statsByName.get(row.name);
                    if (!s) {
                        notInFile++;
                    } else if (row.empty_notes != 1) {
                        skippedWithNotes++;
                    } else {
                        const tail = `- ${Number(s.mv).toFixed(2)}mv ${Number(s.fm).toFixed(2)}fm`;
                        const notes = row.is_gk == 1
                            ? `Stagione ${season}: ${s.pv}pv ${s.gs}gs ${tail}`
                            : `Stagione ${season}: ${s.pv}pv ${s.g}g ${s.a}a ${tail}`;
                        toUpdate.push({ name: row.name, notes });
                    }
                }

                const fileNotInAsta = [...statsByName.keys()].filter((name) => !astaNames.has(name)).length;

                const result = {
                    dry_run,
                    season,
                    to_update: toUpdate.length,
                    skipped_with_notes: skippedWithNotes,
                    not_in_file: notInFile,
                    file_not_in_asta: fileNotInAsta,
                    examples: toUpdate.slice(0, 3),
                    updated: 0,
                    rows_updated: 0,
                };

                if (dry_run || toUpdate.length == 0) {
                    return resolve(result);
                }

                // la condizione sulle note vuote è ripetuta: una nota scritta nel frattempo non viene sovrascritta
                const update_sql = `
                    UPDATE Players SET notes = ?
                    WHERE asta_id = ? AND name = ? AND (notes IS NULL OR TRIM(notes) = '')
                `;

                let firstError: Error | null = null;
                const trackError = (err: Error | null) => {
                    if (err && !firstError) firstError = err;
                };
                let updated = 0;
                let rowsUpdated = 0;

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION", trackError);

                    const stmt = db.prepare(update_sql, trackError);
                    for (const player of toUpdate) {
                        stmt.run([player.notes, asta_id, player.name], function (this: any, err: Error | null) {
                            trackError(err);
                            if (!err && this.changes > 0) {
                                updated++;
                                rowsUpdated += this.changes;
                            }
                        });
                    }

                    stmt.finalize((err: Error | null) => {
                        trackError(err);

                        if (firstError) {
                            const error = firstError;
                            return db.run("ROLLBACK", () => reject(error));
                        }

                        db.run("COMMIT", (commitErr: Error | null) => {
                            if (commitErr) {
                                return db.run("ROLLBACK", () => reject(commitErr));
                            }
                            resolve({ ...result, updated, rows_updated: rowsUpdated });
                        });
                    });
                });
            });
        });
    }
}

export default AstaDAO;
