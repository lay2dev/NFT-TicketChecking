import NodeRSA from 'node-rsa'

export function pubkeyToNodeRsaKey(pubkey: string) {
  const key = new NodeRSA()

  const pubkeyBuffer = Buffer.from(pubkey.replace('0x', ''), 'hex')

  const e = new DataView(toArrayBuffer(pubkeyBuffer.slice(4, 8))).getUint32(
    0,
    true,
  )

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

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}
