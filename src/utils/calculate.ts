import { RequestInfo } from '../middlewares/rateLimiter'
import moment from 'moment'
import { RateLimiterError } from '../error/error'
import { config } from '../config'

const customSorter = (first: RequestInfo, second:RequestInfo) => second.timestamp - first.timestamp;

/**
 * This function takes in the data that is currently available in Redis Cache. It then checks the data to see if the number of requests
 * exceeds the allowed value and if so, throw an error. If not, it sorts the redis cache data the current time and decides if the current
 * request count needs to be added to the recent slot or if a new entry needs to be created
 * @param entries 
 */
export const calculateUpdatedEntries = (entries: RequestInfo[]) => {
  let newEntries = entries;
  const { timeLimit, maxCount, timeSlotSize } = config.rl
  const currentTime = moment().unix()
  const lastOneHour = moment().subtract(timeLimit, 'hour').unix();
  const requestsInOneHour = entries.filter((entry: RequestInfo) => entry.timestamp > lastOneHour);
  const totalRequests = 1 + requestsInOneHour.reduce((sum: number, value: RequestInfo) => sum + value.count, 0)
  const sortedCacheData = entries.sort(customSorter)
  const latestTimeStamp = Array.isArray(sortedCacheData) && sortedCacheData.length > 0 && sortedCacheData[0].timestamp;

  if (totalRequests > maxCount) {
    const newIntervalTime = (moment.unix(latestTimeStamp).add(timeSlotSize, 'minutes')).unix()
    throw new RateLimiterError(`Rate limit exceeded. Try again in ${(newIntervalTime - currentTime)} seconds.`)
  }

  if (currentTime > moment.unix(latestTimeStamp).add(timeSlotSize, 'minutes').unix()) {
    newEntries = newEntries.concat({
      timestamp: currentTime,
      count: 1
    })
  } else {
    const lastEntry = newEntries[newEntries.length-1];
    lastEntry.count++;
    newEntries[newEntries.length-1] = lastEntry
  }

  return newEntries
}
