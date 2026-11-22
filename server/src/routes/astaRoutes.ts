import express, { Router } from "express";
import { body, param, query } from "express-validator";
import AstaController from "../controllers/astaController";
import ErrorHandler from "../helper";

class AstaRoutes {
    private router: Router;
    private errorHandler: ErrorHandler;
    private controller: AstaController;

    constructor() {
        this.router = express.Router();
        this.errorHandler = new ErrorHandler();
        this.controller = new AstaController();
        this.initRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    initRoutes() {

        // Ritorna tutte le aste
        this.router.get(
            "/",
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getAste()
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Ritorna un'asta dato l'id
        this.router.get(
            "/:asta_id",
            param("asta_id").isInt({ min: 1 }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getAsta(parseInt(req.params.asta_id))
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Ritorna tutti i giocatori di un'asta di un dato ruolo
        this.router.get(
            "/:asta_id/players/:role",
            param("asta_id").isInt({ min: 1 }),
            param("role").notEmpty().isString(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getPlayers(parseInt(req.params.asta_id), req.params.role)
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Crea un'asta
        this.router.post(
            "/",
            body("name").notEmpty().isString(),
            body("type").notEmpty().isString(),
            body("n_fantallenatori").isInt(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .createAsta(
                        req.body.name,
                        req.body.type,
                        req.body.n_fantallenatori
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Modifica nome e numero partecipanti di un'asta (il tipo non è modificabile)
        this.router.patch(
            "/:asta_id",
            param("asta_id").isInt({ min: 1 }),
            body("name").isString().trim().notEmpty(),
            body("n_fantallenatori").isInt({ min: 1 }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .updateAsta(
                        parseInt(req.params.asta_id),
                        req.body.name,
                        parseInt(req.body.n_fantallenatori)
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Conteggi di un'asta (giocatori, fantallenatori, acquisti), mostrati prima dell'eliminazione
        this.router.get(
            "/:asta_id/counts",
            param("asta_id").isInt({ min: 1 }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getAstaCounts(parseInt(req.params.asta_id))
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Elimina un'asta con tutti i suoi giocatori, fantallenatori e acquisti
        this.router.delete(
            "/:asta_id",
            param("asta_id").isInt({ min: 1 }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .deleteAsta(parseInt(req.params.asta_id))
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Crea un giocatore
        this.router.post(
            "/:asta_id/players",
            param("asta_id").isInt({ min: 1 }),
            body("name").notEmpty().isString(),
            body("team").notEmpty().isString(),
            body("role").notEmpty().isString(),
            body("role_mantra").notEmpty().isString(),
            body("notes").isString(),
            body("taken").isInt(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .createPlayer(
                        req.params.asta_id,
                        req.body.name,
                        req.body.team,
                        req.body.role,
                        req.body.role_mantra,
                        req.body.notes,
                        req.body.taken
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Importa in blocco una lista di giocatori (es. da file Excel); con dry_run restituisce solo il riepilogo
        this.router.post(
            "/:asta_id/players/import",
            param("asta_id").isInt({ min: 1 }),
            body("players").isArray({ min: 1 }),
            body("players.*.name").isString().notEmpty(),
            body("players.*.team").isString().notEmpty(),
            body("players.*.role_mantra").isString().notEmpty(),
            body("players.*.roles").isArray({ min: 1, max: 3 }),
            body("players.*.roles.*").isString().notEmpty(),
            body("dry_run").optional().isBoolean({ strict: true }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .importPlayers(
                        parseInt(req.params.asta_id),
                        req.body.players,
                        req.body.dry_run === true
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Scrive le statistiche di una stagione (es. da file Excel) nelle note dei giocatori che non hanno note;
        // con dry_run restituisce solo il riepilogo
        this.router.post(
            "/:asta_id/players/notes/stats",
            param("asta_id").isInt({ min: 1 }),
            body("season").isIn(["2026-27", "2025-26", "2024-25"]),
            body("stats").isArray({ min: 1 }),
            body("stats.*.name").isString().notEmpty(),
            body(["stats.*.pv", "stats.*.g", "stats.*.gs", "stats.*.a"]).isInt({ min: 0 }),
            body(["stats.*.mv", "stats.*.fm"]).isFloat({ min: 0 }),
            body("dry_run").optional().isBoolean({ strict: true }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .importStatsNotes(
                        parseInt(req.params.asta_id),
                        req.body.season,
                        req.body.stats,
                        req.body.dry_run === true
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Aggiorna index_role di un giocatore
        this.router.patch(
            "/:asta_id/players/:player_id",
            param("asta_id").isInt({ min: 1 }),
            param("player_id").isInt({ min: 1 }),
            body("role").notEmpty().isString(),
            body("new_index_role").isInt(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .updatePlayerIndexRole(
                        req.params.asta_id,
                        req.params.player_id,
                        req.body.role,
                        req.body.new_index_role,
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Sposta un giocatore (singola riga-ruolo) tra classificati e non classificati
        this.router.patch(
            "/:asta_id/players/:player_id/classification",
            param("asta_id").isInt({ min: 1 }),
            param("player_id").isInt({ min: 1 }),
            body("classified").isBoolean({ strict: true }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .setPlayerClassified(
                        parseInt(req.params.asta_id),
                        parseInt(req.params.player_id),
                        req.body.classified === true
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Aggiunge fantallenatore ad un'asta
        this.router.post(
            "/:asta_id/fantallenatori",
            param("asta_id").isInt({ min: 1 }),
            body("name").notEmpty().isString(),
            body("max_crediti").isInt(),
            body("classic_p").isInt(),
            body("classic_d").isInt(),
            body("classic_c").isInt(),
            body("classic_a").isInt(),
            body("mantra_por_min").isInt(),
            body("mantra_por_max").isInt(),
            body("mantra_mov_min").isInt(),
            body("mantra_mov_max").isInt(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .createFantallenatore(
                        parseInt(req.params.asta_id),
                        req.body.name,
                        req.body.max_crediti,
                        req.body.classic_p,
                        req.body.classic_d,
                        req.body.classic_c,
                        req.body.classic_a,
                        req.body.mantra_por_min,
                        req.body.mantra_por_max,
                        req.body.mantra_mov_min,
                        req.body.mantra_mov_max
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Ritorna i fantallenatori di un'asta
        this.router.get(
            "/:asta_id/fantallenatori",
            param("asta_id").isInt({ min: 1 }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getFantallenatori(parseInt(req.params.asta_id))
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Modifica nome, crediti massimi e limiti per ruolo di un fantallenatore
        this.router.patch(
            "/:asta_id/fantallenatori/:fantallenatore_id",
            param("asta_id").isInt({ min: 1 }),
            param("fantallenatore_id").isInt({ min: 1 }),
            body("name").notEmpty().isString(),
            body("max_crediti").isInt({ min: 0 }),
            body("classic_p").isInt({ min: 0 }),
            body("classic_d").isInt({ min: 0 }),
            body("classic_c").isInt({ min: 0 }),
            body("classic_a").isInt({ min: 0 }),
            body("mantra_por_min").isInt({ min: 0 }),
            body("mantra_por_max").isInt({ min: 0 })
                .custom((value, { req }) => Number(req.body.mantra_por_min) <= Number(value))
                .withMessage("mantra_por_min must be <= mantra_por_max"),
            body("mantra_mov_min").isInt({ min: 0 }),
            body("mantra_mov_max").isInt({ min: 0 })
                .custom((value, { req }) => Number(req.body.mantra_mov_min) <= Number(value))
                .withMessage("mantra_mov_min must be <= mantra_mov_max"),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .updateFantallenatore(
                        parseInt(req.params.asta_id),
                        parseInt(req.params.fantallenatore_id),
                        req.body.name,
                        parseInt(req.body.max_crediti),
                        parseInt(req.body.classic_p),
                        parseInt(req.body.classic_d),
                        parseInt(req.body.classic_c),
                        parseInt(req.body.classic_a),
                        parseInt(req.body.mantra_por_min),
                        parseInt(req.body.mantra_por_max),
                        parseInt(req.body.mantra_mov_min),
                        parseInt(req.body.mantra_mov_max)
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Elimina un fantallenatore (solo se non ha giocatori acquistati)
        this.router.delete(
            "/:asta_id/fantallenatori/:fantallenatore_id",
            param("asta_id").isInt({ min: 1 }),
            param("fantallenatore_id").isInt({ min: 1 }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .deleteFantallenatore(
                        parseInt(req.params.asta_id),
                        parseInt(req.params.fantallenatore_id)
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Assegna giocatore a fantallenatore
        this.router.post(
            "/:asta_id/assign-player",
            param("asta_id").isInt({ min: 1 }),
            body("player_id").isInt({ min: 1 }),
            body("player_name").notEmpty().isString(),
            body("fantallenatore_id").isInt({ min: 1 }),
            body("crediti").isInt({ min: 1 }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .assignPlayer(
                        parseInt(req.params.asta_id),
                        parseInt(req.body.player_id),
                        req.body.player_name,
                        parseInt(req.body.fantallenatore_id),
                        parseInt(req.body.crediti)
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Ritorna i giocatori acquistati di un'asta
        this.router.get(
            "/:asta_id/players-taken",
            param("asta_id").isInt({ min: 1 }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getPlayersTaken(parseInt(req.params.asta_id))
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Ri-assegna un giocatore acquistato
        this.router.patch(
            "/re-assign/:taken_id/fantallenatore/:fantallenatore_id",
            param("taken_id").isInt({ min: 1 }),
            param("fantallenatore_id").isInt({ min: 1 }),
            body("crediti").isInt({ min: 1 }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .reassignPlayer(
                        parseInt(req.params.taken_id),
                        parseInt(req.params.fantallenatore_id),
                        req.body.crediti
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // Aggiorna note di un giocatore
        this.router.patch(
            "/:asta_id/players/:player_id/notes",
            param("asta_id").isInt({ min: 1 }),
            param("player_id").isInt({ min: 1 }),
            body("player_name").notEmpty().isString(),
            body("notes").isString(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .updateNotes(
                        parseInt(req.params.asta_id),
                        parseInt(req.params.player_id),
                        req.body.player_name,
                        req.body.notes
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // annulla assign giocatore
        this.router.delete(
            "/:asta_id/cancel-assign/:taken_id",
            param("asta_id").isInt({ min: 1 }),
            param("taken_id").isInt({ min: 1 }),
            body("taken_name").notEmpty().isString(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .cancelAssign(
                        parseInt(req.params.asta_id),
                        parseInt(req.params.taken_id),
                        req.body.taken_name
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );

        // elimina giocatore
        this.router.delete(
            "/:asta_id/delete-player/:player_id",
            body("player_name").notEmpty().isString(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .deletePlayer(
                        parseInt(req.params.asta_id),
                        parseInt(req.params.player_id),
                        req.body.player_name
                    )
                    .then((data: any) => res.status(200).json(data))
                    .catch((error: any) => next(error));
            }
        );
    }
}

export default AstaRoutes;
