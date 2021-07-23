import {
  BuilderOption,
  Cell,
  normalizers,
  OutPoint,
  Reader,
  RPC,
  SerializeWitnessArgs,
  transformers,
  WitnessArgs,
} from '@lay2/pw-core'
import { getPubkey, splicingURL } from '../url/state-data'
import { ActionType, NFT, SendTxState } from '../url/interface'
import { UnipassIndexerCollector } from './unipass-indexer-collector'
import { TicketProvider } from './ticket-provider'
import { TicketBuilder } from './ticket-builder'
import { TicketSigner } from './ticket-signer'
import { getCellDeps } from './cellDepsApi'

const rpc = new RPC(process.env.CKB_NODE_URL as string)

export function getOutPoint(nfts: NFT[]): OutPoint[] {
  const outpoints: OutPoint[] = []
  for (const item of nfts) {
    const outPoint = new OutPoint(item.outPoint.txHash, item.outPoint.index)
    outpoints.push(outPoint)
  }
  return outpoints
}

export async function getTicketSignMessage(nfts: NFT[], tokenId: number) {
  const masterPubkey = getPubkey()
  if (!masterPubkey) return false

  const outpoints = getOutPoint(nfts)

  const collector = new UnipassIndexerCollector(
    process.env.CKB_INDEXER_URL as string,
  )
  const provider = new TicketProvider(masterPubkey)
  const address = provider.address

  const cells = await Promise.all(
    outpoints.map((x) => Cell.loadFromBlockchain(rpc, x)),
  )
  const nftCells = cells.filter((x) => !!x.type).slice(0, 1)

  const lockLen = (1 + (8 + 256 * 2) * 2) * 2
  const builderOption: BuilderOption = {
    witnessArgs: {
      lock: '0x' + '0'.repeat(lockLen),
      input_type: '',
      output_type: '',
    },
    collector,
  }

  const cellDeps = await getCellDeps()
  const otxBuilder = new TicketBuilder(
    address,
    nftCells,
    builderOption,
    cellDeps,
  )

  const otx = await otxBuilder.build()
  console.log('[getTicketSignMessage-otx]', otx)
  // sign a otx
  const otxSigner = new TicketSigner([provider])
  const messages = otxSigner.toMessages(otx)

  console.log('[getTicketSignMessage-messages]', messages)
  const txObj = transformers.TransformTransaction(otx)

  const data = JSON.stringify({ txObj, messages: messages[0].message, tokenId })

  console.log('to unipass', data, messages[0].message)
  splicingURL(
    ActionType.SendTx,
    data,
    'sign',
    masterPubkey,
    messages[0].message,
  )
}

export function getTicketSignCallback(sig: string, extraObj: string) {
  if (!extraObj) return false
  console.log('getTicketSignCallback sig', sig)
  console.log('getTicketSignCallback extraObj', extraObj)
  const { txObj } = JSON.parse(extraObj) as SendTxState
  const witnessArgs: WitnessArgs = {
    lock: '0x04' + sig.replace('0x', ''),
    input_type: '',
    output_type: '',
  }

  const witness = new Reader(
    SerializeWitnessArgs(normalizers.NormalizeWitnessArgs(witnessArgs)),
  ).serializeJson()

  txObj.witnesses[0] = witness

  const serializedTx = transformers.TransformTransaction(txObj)
  console.log('serializedTx', serializedTx)
  return serializedTx
}
