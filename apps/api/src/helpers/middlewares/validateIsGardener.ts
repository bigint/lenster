import { UNLEASH_API_TOKEN } from "@hey/data/constants";
import { Errors } from "@hey/data/errors";
import { FeatureFlag } from "@hey/data/feature-flags";
import parseJwt from "@hey/helpers/parseJwt";
import axios from "axios";
import type { NextFunction, Request, Response } from "express";
import catchedError from "../catchedError";
import { HEY_USER_AGENT, UNLEASH_API_URL } from "../constants";

/**
 * Middleware to validate if the account is gardener
 * @param req Incoming request
 * @param res Response
 * @param next Next function
 */
const validateIsGardener = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idToken = req.headers["x-id-token"] as string;
  if (!idToken) {
    return catchedError(res, new Error(Errors.Unauthorized), 401);
  }

  try {
    const payload = parseJwt(idToken);

    const { data } = await axios.get(UNLEASH_API_URL, {
      headers: {
        Authorization: UNLEASH_API_TOKEN,
        "User-Agent": HEY_USER_AGENT
      },
      params: {
        appName: "production",
        environment: "production",
        userId: payload.act.sub
      }
    });

    const flags = data.toggles;
    const gardenerToggle = flags.find(
      (toggle: any) => toggle.name === FeatureFlag.Gardener
    );

    if (gardenerToggle?.enabled && gardenerToggle?.variant?.featureEnabled) {
      return next();
    }

    return catchedError(res, new Error(Errors.Unauthorized), 401);
  } catch {
    return catchedError(res, new Error(Errors.SomethingWentWrong));
  }
};

export default validateIsGardener;
