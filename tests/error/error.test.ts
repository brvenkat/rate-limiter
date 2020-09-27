import { RateLimiterError } from '../../src/error/error'

describe('RateLimiterError', () => {
  it('Should create valid instance of rate limiter error', () => {
    const error = new RateLimiterError('some-message')
    expect(error.message).toEqual('some-message')
  })
})