import { createHash } from 'crypto'
import { Address, AddressType } from '@lay2/pw-core'
import UnipassProvider from '../unipass/UnipassProvider'
import { getAddressByPubkey } from '../utils/utils'

interface NFT {
  classTypeArgs: string
  nftTypeArgs: string
  outPoint: {
    txHash: string
    index: string
  }
}

export interface PushData {
  pass: boolean
  nftArgs: string
  outPoint: string
  messageHash?: string
  sig?: string
}

export async function encodeMessage() {
  const message = {
    timestamp: Date.now(),
  }
  const messageHash = createHash('SHA256')
    .update(JSON.stringify(message))
    .digest('hex')
    .toString()
  console.log('[encodeMessage]', message)
  const sig = await new UnipassProvider(process.env.UNIPASS_URL).sign(
    messageHash,
  )
  console.log('[encodeMessage]', sig)
  return { sig, timestamp: message.timestamp }
}

export function authNFT(
  list: NFT[],
  targetArgs: string,
  targetTokenID: number,
) {
  console.log('[targetArgs]', targetArgs)
  const targetTypeArgs = targetArgs.slice(2)
  const targetIssuerID = targetTypeArgs.slice(0, 40)
  const targetClassID = targetTypeArgs.slice(40, 48)

  let pass = false
  let nftArgs = '-'
  let outPoint = {}
  for (const item of list) {
    const typeArgs = item.nftTypeArgs.slice(2)
    const issuerId = typeArgs.slice(0, 40)
    const classId = typeArgs.slice(40, 48)
    const tokenId = parseInt(typeArgs.slice(48, 56), 16)

    if (issuerId !== targetIssuerID) continue
    if (classId !== targetClassID) continue
    if (targetTokenID > 0) {
      if (tokenId !== targetTokenID) continue
      pass = true
      nftArgs = item.classTypeArgs
      outPoint = item.outPoint
    }
    pass = true
    nftArgs = item.classTypeArgs
    outPoint = item.outPoint
    break
  }
  return { pass, nftArgs, outPoint: JSON.stringify(outPoint) }
}

export function authAdrress(masterkey: string, address: string): boolean {
  const pushAddress = new Address(address, AddressType.ckb)
  const pubkeyAddressStr = getAddressByPubkey(masterkey)
  const pubkeyAddress = new Address(pubkeyAddressStr, AddressType.ckb)
  if (pubkeyAddress.lockArgs !== pushAddress.lockArgs) return false
  return true
}
