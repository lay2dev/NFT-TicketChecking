import { RPC, transformers } from '@lay2/pw-core'
import { deserializeTransaction } from './lib'

export async function deserializeTx(rpc: RPC, txJson: any) {
  const tx = await deserializeTransaction(txJson, [], rpc)

  const serializedTx1 = transformers.TransformTransaction(tx)
  const serializedTx2 = transformers.TransformTransaction(txJson)

  if (JSON.stringify(serializedTx1) !== JSON.stringify(serializedTx2)) {
    throw new Error(`deserialize tx for pwcore failed`)
  }

  return tx
}
