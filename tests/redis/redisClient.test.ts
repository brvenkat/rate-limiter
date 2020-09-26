import { connect, getClient, close, get, set } from '../../src/redis/redisClient'
import redis from 'redis'

const mockGet = jest.fn()
const mockSet = jest.fn()

jest.mock('util', () => ({
  promisify: jest.fn().mockImplementation(func => ({
    bind: jest.fn().mockReturnValue(func)
  }))
}))

jest.mock('redis', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    get: mockGet,
    set: mockSet,
    on: jest.fn(),
    quit: jest.fn()
  }))
}))

describe('RedisClient', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('Should create a redis client with no errors', async () => {
    process.env.REDIS_PORT = '1234'
    process.env.REDIS_HOST = 'some-host'
    await connect()
    expect(getClient()).not.toBeNull()
    close()
  })

  it('Should call get with correct parameters', async () => {
    process.env.REDIS_PORT = '1234'
    process.env.REDIS_HOST = 'some-host'
    await get('some-value')
    expect(mockGet).toHaveBeenCalledWith('some-value')
    close()
  })

  it('Should call set with correct parameters', async () => {
    process.env.REDIS_PORT = '1234'
    process.env.REDIS_HOST = 'some-host'
    await set('some-key', 'some-value')
    expect(mockSet).toHaveBeenCalledWith('some-key', 'some-value')
    close()
  })

  it('Should not create client when error thrown', async () => {
    process.env.REDIS_PORT = '1234'
    process.env.REDIS_HOST = 'some-host'
    jest.spyOn(redis, 'createClient').mockImplementation(() => { throw new Error('some-error')})
    try {
      await connect()
    } catch (e) {
      expect(e).not.toBeNull()
    }
  })
  
})