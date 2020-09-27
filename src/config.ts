export const config = (() => ({
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10)
  },
  rl: {
    timeLimit: parseInt(process.env.TIME_INTERVAL, 10),
    maxCount: parseInt(process.env.MAX_REQUESTS, 10),
    timeSlotSize: parseInt(process.env.INDIVIDUAL_TIME_SLOT, 10)
  }
}))()