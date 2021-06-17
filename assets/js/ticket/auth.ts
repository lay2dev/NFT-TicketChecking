interface NFT {
  classTypeArgs: string
  nftTypeArgs: string
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
  let nftArgs = ''
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
    }
    pass = true
    nftArgs = item.classTypeArgs
    break
  }
  return { pass, nftArgs }
}
