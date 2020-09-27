import redis, { RedisClient } from 'redis'
import { promisify } from 'util'
import { config } from '../config'

let client: RedisClient;

export const connect = async (): Promise<RedisClient> => {
  try {
    client = redis.createClient(config.redis.port, config.redis.host);
    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client);
    client.get = getAsync;
    client.set = setAsync;
    client.on('error', err => {
      // tslint:disable-next-line:no-console
      console.log('Error when setting up redis client ',err)
      throw err;
    })
    return client;
  } catch(e) {
    client = null;
    throw new Error('Could not create a redis client')
  }
}

export const getClient = () => client;

export const set = async (key: string, value: string) => getClient().set(key, value);

// Redisclient hardcodes type as boolean and therefore using "any" as return type  
export const get = async (key: string): Promise<any> => getClient().get(key);

export const close = async () => getClient().quit()
