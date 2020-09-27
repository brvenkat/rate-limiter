import { rateLimiter } from '../../src/middlewares/rateLimiter'
import * as redisClient from '../../src/redis/redisClient'
import { partialOf } from 'jest-helpers'
import { Request, Response } from 'express'
import * as calculate from '../../src/utils/calculate'
import { RateLimiterError } from '../../src/error/error'

describe('rateLimter', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = partialOf<Request>({
      ip: '12345'
    })
    res = partialOf<Response>({})
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2019/11/24').getTime());
  })

  afterEach(() => jest.resetAllMocks())

  it('Should add an entry if ip does not exist', async () => {
    const getSpy = jest.spyOn(redisClient, 'get').mockResolvedValue(null)
    const setSpy = jest.spyOn(redisClient, 'set').mockResolvedValue(true)
    await rateLimiter(req, res, () => null)
    expect(getSpy).toHaveBeenCalledWith('12345')
    expect(setSpy).toHaveBeenCalledWith('12345', JSON.stringify([{
      timestamp: 1574514000,
      count: 1
    }]))
  })

  it('Should update existing entry if one exists', async () => {
    const getSpy = jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify([{
      timestamp: 1574514000,
      count: 2
    }]))
    const setSpy = jest.spyOn(redisClient, 'set').mockResolvedValue(true)
    const calculateSpy = jest.spyOn(calculate, 'calculateUpdatedEntries').mockReturnValue([{
      timestamp: 1574514000,
      count: 3
    }])
    await rateLimiter(req, res, () => null)
    expect(getSpy).toHaveBeenCalledWith('12345')
    expect(calculateSpy).toHaveBeenCalledWith([{
      timestamp: 1574514000,
      count: 2
    }])
    expect(setSpy).toHaveBeenCalledWith('12345', JSON.stringify([{
      timestamp: 1574514000,
      count: 3
    }]))
  })
  
  it('Should throw error when rate limiter errors', async () => {
    const getSpy = jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify([{
      timestamp: 1574514000,
      count: 2
    }]))
    const setSpy = jest.spyOn(redisClient, 'set').mockResolvedValue(true)
    const calculateSpy = jest.spyOn(calculate, 'calculateUpdatedEntries').mockImplementation(() => { throw new RateLimiterError('some-error') })
    res = partialOf<Response>({
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    })
    try {
      await rateLimiter(req, res, () => null)
    } catch(e) {
      expect(e.message).toEqual('some-error')
    }
    expect(getSpy).toHaveBeenCalledWith('12345')
    expect(calculateSpy).toHaveBeenCalledWith([{
      timestamp: 1574514000,
      count: 2
    }])
    expect(setSpy).not.toHaveBeenCalled()
  })
})