import express from "express";

import {
  Body_Watch_Gcal_Start,
  Body_Watch_Gcal_Stop,
  Request_Sync_Gcal,
} from "@core/types/sync.types";
import { ReqBody, Res } from "@core/types/express.types";

import { Logger } from "@backend/common/logger/common.logger";
import { getGcal } from "@backend/auth/services/google.auth.service";

import syncService from "../services/sync.service";
import { hasExpectedHeaders } from "../services/sync.helpers";
import { BaseError } from "@core/errors/errors.base";
import { Status } from "@core/errors/status.codes";

const logger = Logger("app:sync.gcal");
class GcalSyncController {
  handleNotification = async (req: express.Request, res: express.Response) => {
    if (hasExpectedHeaders(req.headers)) {
      const params = {
        channelId: req.headers["x-goog-channel-id"],
        resourceId: req.headers["x-goog-resource-id"],
        resourceState: req.headers["x-goog-resource-state"],
        expiration: req.headers["x-goog-channel-expiration"],
      } as Request_Sync_Gcal;

      const notifResponse = await syncService.handleGcalNotification(params);

      res.promise(Promise.resolve(notifResponse));
    } else {
      const msg = `Notification request has invalid headers:\n${JSON.stringify(
        req.headers
      )}`;
      logger.error(msg);
      const err = new BaseError("Bad Headers", msg, Status.BAD_REQUEST, true);
      res.promise(Promise.resolve(err));
    }
  };

  startWatching = async (req: ReqBody<Body_Watch_Gcal_Start>, res: Res) => {
    try {
      const userId = res.locals.user.id;
      const calendarId = req.body.calendarId;
      const channelId = req.body.channelId;

      const gcal = await getGcal(userId);
      const watchResult = await syncService.startWatchingChannel(
        gcal,
        userId,
        calendarId,
        channelId
      );

      res.promise(Promise.resolve(watchResult));
    } catch (e) {
      res.promise(Promise.reject(e));
    }
  };

  stopWatching = async (req: ReqBody<Body_Watch_Gcal_Stop>, res: Res) => {
    try {
      const userId = res.locals.user.id;
      const channelId = req.body.channelId;
      const resourceId = req.body.resourceId;

      const stopResult = await syncService.stopWatchingChannel(
        userId,
        channelId,
        resourceId
      );
      res.promise(Promise.resolve(stopResult));
    } catch (e) {
      res.promise(Promise.reject(e));
    }
  };
}

export default new GcalSyncController();