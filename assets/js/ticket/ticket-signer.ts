import {
  Blake2bHasher,
  Hasher,
  Message,
  normalizers,
  Provider,
  Reader,
  SerializeCellInput,
  SerializeCellOutput,
  SerializeWitnessArgs,
  Transaction,
  transformers,
  WitnessArgs,
} from '@lay2/pw-core'

export class TicketSigner {
  providers: Provider[] = []
  hasher: Hasher

  constructor(providers: Provider[] | Provider) {
    this.hasher = new Blake2bHasher()
    if (Array.isArray(providers)) {
      this.providers = providers
    } else {
      this.providers = [providers]
    }
  }

  async signMessages(messages: Message[]): Promise<string[]> {
    const sigs = []

    for (const message of messages) {
      let matched = false
      for (const provider of this.providers) {
        console.log(
          'unipass-signer',
          provider.address.toLockScript().toHash(),
          message.lock.toHash(),
          provider.address,
          message,
        )
        if (
          provider.address.toLockScript().toHash() === message.lock.toHash()
        ) {
          console.log('unipass-signer', message.message)
          sigs.push(await provider.sign(message.message))

          matched = true
          break
        }
      }

      if (!matched) {
        sigs.push('0x')
      }
    }
    return sigs
  }

  async sign(tx: Transaction): Promise<Transaction> {
    const messages = this.toMessages(tx)
    const witnesses = await this.signMessages(messages)
    for (let i = 0; i < messages.length; i++) {
      const { index } = messages[i]
      if (
        index < tx.witnessArgs.length &&
        typeof tx.witnessArgs[index] !== 'string'
      ) {
        witnesses[i] = new Reader(
          SerializeWitnessArgs(
            normalizers.NormalizeWitnessArgs({
              ...(tx.witnessArgs[index] as WitnessArgs),
              lock: witnesses[i],
            }),
          ),
        ).serializeJson()
      }
    }
    tx = FillSignedWitnesses(tx, messages, witnesses)
    return tx
  }

  /**
   * digest open transaction tx
   * digestMessage = blake2b(otxHash, groupedWitnesses)
   *
   * @param otx simple open transaction
   */
  public toMessages(tx: Transaction): Message[] {
    tx.validate()

    if (tx.raw.inputs.length !== tx.raw.inputCells.length) {
      throw new Error('Input number does not match!')
    }

    // const txHash = new Blake2bHasher().hash(
    //   new Reader(
    //     SerializeRawTransaction(normalizers.NormalizeRawTransaction(transformers.TransformRawTransaction(tx.raw)))
    //   )
    // );
    const otxHash = this.calculateOtxHash(tx)

    const messages = []
    const used = tx.raw.inputs.map((_input) => false)
    for (let i = 0; i < tx.raw.inputs.length; i++) {
      if (used[i]) {
        continue
      }
      if (i >= tx.witnesses.length) {
        throw new Error(
          `Input ${i} starts a new script group, but witness is missing!`,
        )
      }
      used[i] = true
      this.hasher.update(otxHash)
      const firstWitness = new Reader(tx.witnesses[i])
      this.hasher.update(serializeBigInt(firstWitness.length()))
      this.hasher.update(firstWitness)
      for (
        let j = i + 1;
        j < tx.raw.inputs.length && j < tx.witnesses.length;
        j++
      ) {
        if (tx.raw.inputCells[i].lock.sameWith(tx.raw.inputCells[j].lock)) {
          used[j] = true
          const currentWitness = new Reader(tx.witnesses[j])
          this.hasher.update(serializeBigInt(currentWitness.length()))
          this.hasher.update(currentWitness)
        }
      }
      messages.push({
        index: i,
        message: this.hasher.digest().serializeJson(), // hex string
        lock: tx.raw.inputCells[i].lock,
      })

      this.hasher.reset()
    }
    return messages
  }

  /**
   * calculate otx hash, otxHash = blake2b(inputs + first_output + first_output_data)
   *
   * @param otx
   */
  calculateOtxHash(otx: Transaction): Reader {
    const myHasher: Hasher = new Blake2bHasher()

    for (const input of otx.raw.inputs) {
      myHasher.update(
        SerializeCellInput(
          normalizers.NormalizeCellInput(
            transformers.TransformCellInput(input),
          ),
        ),
      )
    }

    myHasher.update(
      SerializeCellOutput(
        normalizers.NormalizeCellOutput(
          transformers.TransformCellOutput(otx.raw.outputs[0]),
        ),
      ),
    )
    myHasher.update(new Reader(otx.raw.outputsData[0]))

    return myHasher.digest()
  }
}

function FillSignedWitnesses(
  tx: Transaction,
  messages: Message[],
  witnesses: string[],
) {
  if (messages.length !== witnesses.length) {
    throw new Error('Invalid number of witnesses!')
  }
  for (let i = 0; i < messages.length; i++) {
    tx.witnesses[messages[i].index] = witnesses[i]
  }
  return tx
}

function serializeBigInt(i: number) {
  const view = new DataView(new ArrayBuffer(8))
  view.setUint32(0, i, true)
  return view.buffer
}
