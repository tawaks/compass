// @ts-nocheck
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { BaseError } from "@core/errors/errors.base";
import { Status } from "@core/errors/status.codes";
import { Origin } from "@core/core.constants";
import { Logger } from "@core/logger/winston.logger";
import {
  CombinedLogin_Google,
  GoogleUser,
  Params_AfterOAuth,
  Result_OauthUrl,
  Result_TokenRefresh,
} from "@core/types/auth.types";
import { ENV } from "@backend/common/constants/env.constants";

import googleOauthService from "../services/google.auth.service";
import CompassAuthService from "../services/compass.auth.service";
import { loginCompleteHtml } from "../services/login.complete";

const logger = Logger("app:auth.controller");

const jwtSecret: string | undefined = process.env["JWT_SECRET"];
const tokenExpirationInSeconds = 36000;

// eventually split up for each provider (google, outlook, email+pw)
class AuthController {
  async demoCreateJWT(req: express.Request, res: express.Response) {
    try {
      const refreshId = req.body.userId + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(16));
      const hash = crypto
        .createHmac("sha512", salt)
        .update(refreshId)
        .digest("base64");
      req.body.refreshKey = salt.export();
      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationInSeconds,
      });
      return res.status(201).send({ accessToken: token, refreshToken: hash });
    } catch (err) {
      logger.error("createJWT error: %O", err);
      return res.status(500).send();
    }
  }

  checkOauthStatus = async (req: express.Request, res: express.Response) => {
    const integration: string = req.query["integration"];
    if (integration === Origin.Google) {
      const status = await new googleOauthService().checkOauthStatus(req);
      res.promise(Promise.resolve(status));
    } else {
      res.promise(
        new BaseError(
          "Not Supported",
          `${integration} is not supported`,
          Status.BAD_REQUEST,
          true
        )
      );
    }
  };

  getOauthUrl = (
    req: express.Request,
    res: express.Response
  ): Promise<Result_OauthUrl> => {
    if (req.query["integration"] === Origin.Google) {
      const authState = uuidv4();
      const authUrl = new googleOauthService().generateAuthUrl(authState);
      res.promise(Promise.resolve({ authUrl, authState }));
    }
  };

  loginWithPassword(req: express.Request, res: express.Response) {
    res.promise(
      new BaseError(
        "Not Implemented",
        "do this once adding user+pw support",
        500,
        true
      )
    );
  }

  loginAfterOauthSucceeded = async (
    req: express.Request,
    res: express.Response
  ) => {
    const _integration = Origin.Google;
    if (_integration === Origin.Google) {
      const query: Params_AfterOAuth = req.query;

      const gAuthService = new googleOauthService();
      await gAuthService.setTokens(query.code, null);
      const gUser: GoogleUser = await gAuthService.getUser();

      // TODO use query.state to start watching for that channel
      // via gcal.service

      const compassLoginData: CombinedLogin_Google = {
        user: gUser,
        oauth: Object.assign(
          {},
          { state: query.state },
          { tokens: gAuthService.getTokens() }
        ),
      };
      const compassAuthService = new CompassAuthService();
      const loginResp = await compassAuthService.loginToCompass(
        compassLoginData
      );
      //TODO validate resp

      res.promise(Promise.resolve(loginCompleteHtml));
    }
  };

  refreshJwt(
    req: express.Request,
    res: express.Response
  ): Promise<Result_TokenRefresh> {
    const accessToken = req.headers.authorization
      .split("Bearer ")
      .join("")
      .trim();

    const payload = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET);

    const newToken = jwt.sign({ _id: payload._id }, ENV.ACCESS_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: ENV.ACCESS_TOKEN_LIFE,
    });

    res.promise(Promise.resolve({ token: newToken }));
  }
}

export default new AuthController();
