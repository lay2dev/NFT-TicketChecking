import { createHash } from 'crypto'
import UnipassProvider from '../unipass/UnipassProvider'

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

export async function authNFT(
  list: NFT[],
  targetArgs: string,
  targetTokenID: number,
): Promise<PushData> {
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
  if (pass) {
    const data = { pass, nftArgs, outPoint: JSON.stringify(outPoint) }
    return await decodeAuth(JSON.stringify(outPoint), data)
  }
  return { pass, nftArgs, outPoint: JSON.stringify(outPoint) }
}

async function decodeAuth(outPoint: string, data: PushData): Promise<PushData> {
  const now = Date.now()
  const message = {
    now,
    outPoint,
  }
  const messageHash = createHash('SHA256')
    .update(JSON.stringify(message))
    .digest('hex')
    .toString()
  console.log(message)
  data.messageHash = messageHash
  const sig = await new UnipassProvider(process.env.UNIPASS_URL).sign(
    messageHash,
  )
  console.log(sig)
  data.sig = sig

  return data
}
