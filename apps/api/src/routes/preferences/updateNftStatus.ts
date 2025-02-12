import prisma from "@hey/db/prisma/db/client";
import logger from "@hey/helpers/logger";
import parseJwt from "@hey/helpers/parseJwt";
import type { Request, Response } from "express";
import catchedError from "src/helpers/catchedError";
import { rateLimiter } from "src/helpers/middlewares/rateLimiter";
import validateLensAccount from "src/helpers/middlewares/validateLensAccount";

export const post = [
  rateLimiter({ requests: 50, within: 1 }),
  validateLensAccount,
  async (req: Request, res: Response) => {
    try {
      const idToken = req.headers["x-id-token"] as string;
      const payload = parseJwt(idToken);

      const membershipNft = await prisma.membershipNft.upsert({
        create: { dismissedOrMinted: true, accountAddress: payload.act.sub },
        update: { dismissedOrMinted: true },
        where: { accountAddress: payload.act.sub }
      });
      logger.info(`Updated membership nft status for ${payload.act.sub}`);

      return res.status(200).json({ result: membershipNft, success: true });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];
