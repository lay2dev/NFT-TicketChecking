import '~/assets/js/utils/bigsea'
import dayjs from 'dayjs'
import PWCore, { ChainID, IndexerCollector } from '@lay2/pw-core'
import UnipassProvider from '~/assets/js/unipass/UnipassProvider.ts'
import { authNFT } from '~/assets/js/ticket/auth'

Sea.Ajax.HOST = process.env.NFT_GIFT_API_URL

Sea.checkLogin = () => {
  const provider = Sea.localStorage('provider')
  if (provider && provider._address) {
    const passed = dayjs().diff(dayjs(provider._time || 0), 'hour')
    if (passed > 6) {
      Sea.localStorage('provider', '')
    } else {
      provider._time = Date.now()
      Sea.localStorage('provider', provider)
      return provider
    }
  }
  return null
}

Sea.login = async () => {
  let provider
  provider = await Sea.checkLogin()
  if (provider) {
    return provider
  }
  const url = {
    NODE_URL: process.env.CKB_NODE_URL,
    INDEXER_URL: process.env.CKB_INDEXER_URL,
    CHAIN_ID:
      process.env.CKB_CHAIN_ID === '0' ? ChainID.ckb : ChainID.ckb_testnet,
  }
  console.log(url)
  await new PWCore(url.NODE_URL).init(
    new UnipassProvider(process.env.UNIPASS_URL),
    new IndexerCollector(url.INDEXER_URL),
    url.CHAIN_ID,
  )
  provider = PWCore.provider
  if (provider && provider._address) {
    provider._time = Date.now()
    Sea.localStorage('provider', provider)
    return provider
  }
  return null
}

Sea.getActivity = async () => {
  console.log('getActivity')
  const res = await Sea.Ajax({
    url: '/ticket/activity',
    method: 'get',
  })
  console.log('[getActivity]', res)
  return res
}

Sea.askVerifiy = async (address, activity) => {
  console.log('askVerifiy')
  const res = await Sea.Ajax({
    url: '/ticket/vierfiy',
    method: 'get',
    data: {
      address,
      activity,
    },
  })
  console.log('[askVerifiy]', res)
  return res
}

Sea.postVerifiyData = async ({
  address,
  activity,
  targetTokenID,
  list,
  targetArgs,
}) => {
  const authData = await authNFT(list, targetArgs, targetTokenID)
  console.log(authData)
  console.log('askVerifiy', targetArgs)
  if (!authData || authData.sig === 'N/A' || authData.sig === '0x01N/A') {
    return { pass: false }
  }

  const data = {
    address,
    activity,
    ...authData,
  }
  console.log('[askVerifiy]', data)
  const res = await Sea.Ajax({
    url: '/ticket/vierfiy',
    method: 'post',
    data,
  })
  console.log('[askVerifiy]', res)
  return res
}

Sea.getAssets = async (address) => {
  console.log('getAssets', address)
  const res = await Sea.Ajax({
    url: '/ckb',
    data: {
      address,
    },
  })
  console.log('[getAssets]', res)
  return res
}
