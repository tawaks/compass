import dotenv from "dotenv";
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  throw dotenvResult.error;
}
import express from "express";
import * as http from "http";
import corsWhitelist from "./common/middleware/cors.middleware";
import helmet from "helmet";

import { CommonRoutesConfig } from "@backend/common/common.routes.config";
import { AuthRoutes } from "@backend/auth/auth.routes.config";
import { EventRoutes } from "@backend/event/event.routes.config";
import { PriorityRoutes } from "@backend/priority/priority.routes.config";
import { SyncRoutes } from "@backend/sync/sync.routes.config";
import { DevRoutes } from "@backend/dev/dev.routes.config";
import { CalendarRoutes } from "@backend/calendar/calendar.routes.config";
import mongoService from "@backend/common/services/mongo.service";
import expressLogger from "@backend/common/logger/express.logger";
import { Logger } from "@backend/common/logger/common.logger";
import {
  catchUndefinedSyncErrors,
  catchSyncErrors,
  promiseMiddleware,
} from "@backend/common/middleware/promise.middleware";
import { isDev } from "./common/helpers/common.helpers";

/* Misc Configuration */
const logger = Logger("app:root");
mongoService;

/* Express Configuration */
const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3000;
const routes: Array<CommonRoutesConfig> = [];

app.use(corsWhitelist);
app.use(helmet());
app.use(expressLogger);
app.use(express.json());

// initialize this middleware before routes, because
// the routes depend on its custome promise handling
app.use(promiseMiddleware());

routes.push(new AuthRoutes(app));
routes.push(new PriorityRoutes(app));
routes.push(new EventRoutes(app));
routes.push(new SyncRoutes(app));
routes.push(new CalendarRoutes(app));

if (isDev()) {
  routes.push(new DevRoutes(app));
}

// app.use(catchUndefinedSyncErrors);
app.use(catchSyncErrors);

/* Express Start */
server.listen(port, () => {
  logger.info(`Server running on port: ${port}`);
});