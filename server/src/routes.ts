import express from "express";
import { Application, Request, Response } from "express";
import AstaRoutes from "./routes/astaRoutes";
const morgan = require("morgan");

function initRoutes(app: Application): void {
  app.use(morgan("dev"));
  app.use(express.json());

  const astaRoutes = new AstaRoutes();

  app.use(`/api/asta`, astaRoutes.getRouter());
}

export default initRoutes;
