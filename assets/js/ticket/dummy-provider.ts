import { Provider } from '@lay2/pw-core'

export class DummyProvider extends Provider {
  async init(): Promise<Provider> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sign(message: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  close() {
    throw new Error('Method not implemented.')
  }
}
