import { calculateUpdatedEntries } from '../../src/utils/calculate'
import { RateLimiterError } from '../../src/error/error'

describe('calculate.ts', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('Should return new entries when user has not hit limit', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2019/11/24').getTime());
    process.env.MAX_REQUESTS = '3'
    process.env.TIME_INTERVAL = '1'
    process.env.INDIVIDUAL_TIME_SLOT = '5'
    const requestInfo=[
      {
          timestamp: 1574510399,
          count: 2
        }
    ]
    const result = calculateUpdatedEntries(requestInfo);
    expect(result).toEqual([{ timestamp: 1574510399, count: 2 }, { timestamp: 1574514000, count: 1 }])
  })

  it('Should append to existing entry when user has not hit limit', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2019/11/24').getTime());
    process.env.MAX_REQUESTS = '3'
    process.env.TIME_INTERVAL = '1'
    process.env.INDIVIDUAL_TIME_SLOT = '5'
    const requestInfo=[
      {
          timestamp: 1574514001,
          count: 2
        }
    ]
    const result = calculateUpdatedEntries(requestInfo);
    expect(result).toEqual([{ timestamp: 1574514001, count: 3 }])
  })
  
  it('Should throw error when limit is exceeded', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2019/11/24').getTime());
    process.env.MAX_REQUESTS = '3'
    process.env.TIME_INTERVAL = '1'
    process.env.INDIVIDUAL_TIME_SLOT = '5'
    const requestInfo=[
      {
          timestamp: 1574514001,
          count: 3
        }
    ]
    expect(() => {
      calculateUpdatedEntries(requestInfo);
    }).toThrow(new RateLimiterError('Rate limit exceeded. Try again in 301 seconds.'));
  })
})
