import type { IRequest } from 'itty-router';

import { getMeta } from '../helper/metadata';
import type { Env } from '../types';

export default async (request: IRequest, env: Env) => {
  try {
    const url = request.query.url as string;
    const data = await getMeta(url as string);

    return new Response(
      JSON.stringify({ success: true, snapshotted: false, iframely: data })
    );
  } catch (error) {
    console.error('Failed to get iframely data', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong!' })
    );
  }
};
