const cors = require("cors");
import express, { Application, Request, Response } from "express";
import initRoutes from "./routes";

const app: Application = express();
const PORT: number = 3001;

const corsOptions = {
  origin: "http://localhost:5173"
};

app.use(cors(corsOptions));
initRoutes(app);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

export { app };
