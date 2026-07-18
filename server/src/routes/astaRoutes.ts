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

        // Crea un giocatore
        this.router.post(
            "/:asta_id/players",
            param("asta_id").isInt({ min: 1 }),
            body("name").notEmpty().isString(),
            body("team").notEmpty().isString(),
            body("role").notEmpty().isString(),
            body("role_mantra").notEmpty().isString(),
            body("notes").notEmpty().isString(),
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

        // Aggiunge fantallenatore ad un'asta
        this.router.post(
            "/:asta_id/fantallenatori",
            param("asta_id").isInt({ min: 1 }),
            body("name").notEmpty().isString(),
            body("max_crediti").isInt(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .createFantallenatore(
                        parseInt(req.params.asta_id),
                        req.body.name,
                        req.body.max_crediti
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
            body("notes").notEmpty().isString(),
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
    }
}

export default AstaRoutes;
