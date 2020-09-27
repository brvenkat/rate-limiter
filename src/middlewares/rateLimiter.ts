import { get, set } from '../redis/redisClient'
import moment from 'moment'
import { Request, Response } from 'express';
import { calculateUpdatedEntries } from '../utils/calculate'
import { RateLimiterError } from '../error/error'

export interface RequestInfo {
  timestamp: number
  count: number
}

export const rateLimiter = async (req: Request, res: Response, next: () => void) => {
  let ip = req.ip;
  if (ip.substr(0, 7) === "::ffff:") {
    ip = ip.substr(7)
  }
  try {
    const requestData = await get(ip);
    const currentTime = moment().unix()
    if (!requestData) {
      set(ip, JSON.stringify([{
        timestamp: currentTime,
        count: 1
      }]))
    } else {
      const parsedArrayEntries: RequestInfo[] = JSON.parse(requestData);
      const newEntries = calculateUpdatedEntries(parsedArrayEntries)
      set(ip, JSON.stringify(newEntries)) 
    }
    return next()

  } catch(e) {
    if (e instanceof RateLimiterError) {
      res.status(429).send(e.message)
      return;
    }
    throw e;
  }
}
