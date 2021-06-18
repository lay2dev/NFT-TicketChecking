import { pubkeyToNodeRsaKey } from './rsakey'

class Verifier {
  verify(messageHex: string, unipassSig: string) {
    let buffer = Buffer.from(unipassSig.replace('0x', ''), 'hex')
    buffer = buffer.slice(1)

    const masterPubkey = buffer.slice(0, 256 + 4 + 4)
    buffer = buffer.slice(256 + 4 + 4)

    const auth = buffer.slice(0, 256)
    buffer = buffer.slice(256)

    const localPubkey = buffer.slice(0, 256 + 4 + 4)
    buffer = buffer.slice(256 + 4 + 4)

    const sig = buffer.slice(0, 256)

    const ret1 = this.verifyRsaSig(
      masterPubkey,
      localPubkey.toString('hex'),
      auth,
    )

    const ret2 = this.verifyRsaSig(localPubkey, messageHex, sig)

    return ret1 && ret2
  }

  verifyRsaSig(pubKey: Buffer, messageHex: string, sig: Buffer) {
    const key = pubkeyToNodeRsaKey(pubKey.toString('hex'))
    return key.verify(Buffer.from(messageHex.replace('0x', ''), 'hex'), sig)
  }
}

export function verifier(messageHash: string, sig: string) {
  if (sig.length < 2083) return false
  const verifier = new Verifier()
  return verifier.verify(messageHash, sig)
}
