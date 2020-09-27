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

jest.mock('../../src/config', () => ({
  config: {
    redis: {
      host: 'some-host',
      port: '1234'
    }
  }
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
    await connect()
    expect(getClient()).not.toBeNull()
    close()
  })

  it('Should call get with correct parameters', async () => {
    await get('some-value')
    expect(mockGet).toHaveBeenCalledWith('some-value')
    close()
  })

  it('Should call set with correct parameters', async () => {
    await set('some-key', 'some-value')
    expect(mockSet).toHaveBeenCalledWith('some-key', 'some-value')
    close()
  })

  it('Should not create client when error thrown', async () => {
    jest.spyOn(redis, 'createClient').mockImplementation(() => { throw new Error('some-error')})
    try {
      await connect()
    } catch (e) {
      expect(e).not.toBeNull()
    }
  })
  
})