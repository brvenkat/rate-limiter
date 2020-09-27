import { calculateUpdatedEntries } from '../../src/utils/calculate'
import { RateLimiterError } from '../../src/error/error'

jest.mock('../../src/config', () => ({
  config: {
    rl: {
      timeLimit: 1,
      maxCount: 3,
      timeSlotSize: 5
    }
  }
}))

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
