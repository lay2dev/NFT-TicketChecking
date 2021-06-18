import NodeRSA from 'node-rsa'

export function pubkeyToNodeRsaKey(pubkey: string) {
  const key = new NodeRSA()

  const pubkeyBuffer = Buffer.from(pubkey.replace('0x', ''), 'hex')

  const e = pubkeyBuffer.slice(4, 8).readUInt32LE()
  const n = pubkeyBuffer.slice(8).reverse()

  key.importKey(
    {
      e,
      n,
    },
    'components-public',
  )

  key.setOptions({ signingScheme: 'pkcs1-sha256' })

  return key
}
