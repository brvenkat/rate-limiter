
import { config } from '../src/config'
describe('config', () => {
  it('Should return a valid config object', () => {
    expect(config.redis).toBeTruthy()
    expect(config.rl).toBeTruthy()
  })
})