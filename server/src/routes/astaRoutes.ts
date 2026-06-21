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
                    .then((aste: any) => res.status(200).json(aste))
                    .catch((error: any) => next(error));
            }
        );

        // Ritorna un'asta dato l'id
        this.router.get(
            "/:asta_id",
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getAsta(parseInt(req.params.asta_id))
                    .then((aste: any) => res.status(200).json(aste))
                    .catch((error: any) => next(error));
            }
        );

        // Ritorna tutti i giocatori di un dato ruolo
        this.router.get(
            "/:asta_id/players/:role",
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getPlayers(parseInt(req.params.asta_id), req.params.role)
                    .then((aste: any) => res.status(200).json(aste))
                    .catch((error: any) => next(error));
            }
        );

        // Crea un'asta
        this.router.post(
            "/",
            body("name").notEmpty().isString(),
            body("type").notEmpty().isString(),
            body("max_crediti").isInt(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .createAsta(
                        req.body.name,
                        req.body.type,
                        req.body.max_crediti
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
    }
}

export default AstaRoutes;
