import { createHash } from 'crypto'
import { Address, AddressType } from '@lay2/pw-core'
import { getAddressByPubkey, getDataFromSignString } from '../utils/utils'

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

export function encodeMessage() {
  const message = {
    timestamp: Date.now(),
  }
  const messageHash = createHash('SHA256')
    .update(JSON.stringify(message))
    .digest('hex')
    .toString()
  // return { sig, timestamp: message.timestamp, messageHash }
  return { messageHash, timestamp: message.timestamp }
}

export function authHaveTargetNFT(
  list: NFT[][],
  targetArgs: string,
  targetTokenID: number,
) {
  const targetTypeArgs = targetArgs.slice(2)
  const targetIssuerID = targetTypeArgs.slice(0, 40)
  const targetClassID = targetTypeArgs.slice(40, 48)
  let ticketId = 0
  let pass = false
  const list2 = []
  const nfts = []
  for (const items of list) {
    list2.push(...items)
  }

  for (const item of list2) {
    const typeArgs = item.nftTypeArgs.slice(2)
    const issuerId = typeArgs.slice(0, 40)
    const classId = typeArgs.slice(40, 48)
    const tokenId = parseInt(typeArgs.slice(48, 56), 16)

    if (issuerId !== targetIssuerID) continue
    if (classId !== targetClassID) continue
    if (targetTokenID > 0) {
      if (tokenId !== targetTokenID) continue
      pass = true
      ticketId = tokenId
    }
    pass = true
    ticketId = tokenId
    nfts.push(item)
    break
  }
  return { pass, ticketId, nfts }
}

export function authAdrress(signStr: string, address: string): boolean {
  const { masterkey } = getDataFromSignString(signStr)
  const pushAddress = new Address(address, AddressType.ckb)
  const pubkeyAddressStr = getAddressByPubkey(masterkey)
  const pubkeyAddress = new Address(pubkeyAddressStr, AddressType.ckb)
  if (pubkeyAddress.lockArgs !== pushAddress.lockArgs) return false
  return true
}
