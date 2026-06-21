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
        this.router.get(
            "/aste",
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getAste()
                    .then((aste: any) => res.status(200).json(aste))
                    .catch((error: any) => next(error));
            });

        this.router.get(
            "/aste/:astaId",
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getAsta(parseInt(req.params.astaId))
                    .then((aste: any) => res.status(200).json(aste))
                    .catch((error: any) => next(error));
            });

        this.router.get(
            "/aste/:astaId/players/:role",
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller
                    .getPlayers(parseInt(req.params.astaId), req.params.role)
                    .then((aste: any) => res.status(200).json(aste))
                    .catch((error: any) => next(error));
            });
    }
}

export default AstaRoutes;
