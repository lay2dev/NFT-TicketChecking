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
  console.log('[targetArgs]', targetArgs)
  const targetTypeArgs = targetArgs.slice(2)
  const targetIssuerID = targetTypeArgs.slice(0, 40)
  const targetClassID = targetTypeArgs.slice(40, 48)
  let ticketId = 0
  let pass = false
  const list2 = []
  for (const items of list) {
    list2.push(...items)
  }

  for (const item of list2) {
    console.log(item)
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
    break
  }
  return { pass, ticketId }
}

export function authAdrress(signStr: string, address: string): boolean {
  console.log('[authAdrress]')
  const { masterkey } = getDataFromSignString(signStr)
  const pushAddress = new Address(address, AddressType.ckb)
  const pubkeyAddressStr = getAddressByPubkey(masterkey)
  const pubkeyAddress = new Address(pubkeyAddressStr, AddressType.ckb)
  console.log('[authAdrress]-pubkeyAddress.lockArgs', pubkeyAddress.lockArgs)
  console.log('[authAdrress]-pushAddress.lockArgs', pushAddress.lockArgs)
  if (pubkeyAddress.lockArgs !== pushAddress.lockArgs) return false
  return true
}
