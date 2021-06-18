import '~/assets/js/utils/bigsea'
import dayjs from 'dayjs'
import PWCore, { ChainID, IndexerCollector } from '@lay2/pw-core'
import UnipassProvider from '~/assets/js/unipass/UnipassProvider.ts'
import { authHaveTargetNFT, encodeMessage } from '~/assets/js/ticket/auth'

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

Sea.getShortUrlKeyInfo = async ({ address, sig, timestamp }) => {
  const data = {
    address,
    sig,
    timestamp,
  }
  console.log('[getShortUrlKeyInfo]', data)
  const res = await Sea.Ajax({
    url: '/ticket/vierfiy',
    method: 'post',
    data,
  })
  console.log('[getShortUrlKeyInfo]', res)
  return res
}

Sea.getShortKeyInfoData = async ({ key }) => {
  const data = {
    key,
  }
  console.log('[getShortKeyInfoData]', data)
  const res = await Sea.Ajax({
    url: '/ticket/vierfiy',
    method: 'get',
    data,
  })
  console.log('[getShortKeyInfoData]', res)
  return res
}

Sea.getAssetsAndAuthNFT = async (address, targetArgs, targetTokenID) => {
  console.log('[getAssets]', address)
  const res = await Sea.Ajax({
    url: '/ckb',
    data: {
      address:
        'ckt1qsfy5cxd0x0pl09xvsvkmert8alsajm38qfnmjh2fzfu2804kq47dkkf0uhnam8s995auftst7vu3j2067rpz28mx7v',
    },
  })
  console.log('[getAssets]', targetArgs)
  await authHaveTargetNFT(res, targetArgs, targetTokenID)
  return res
}

Sea.createSignMessage = async (address) => {
  console.log('createSignMessage', address)
  const data = await encodeMessage()
  console.log('[createSignMessage]', data)
  return data
}

Sea.formatDate = (card) => {
  const startDate = dayjs(card.startTime)
  const endDate = dayjs(card.endTime)
  const isSameDay = startDate.isSame(endDate, 'day')
  const isSameMonth = startDate.isSame(endDate, 'month')
  const isSameYear = startDate.isSame(endDate, 'year')
  const start = startDate.format('YYYY年M月D日 HH:mm')
  let end = endDate.format('YYYY年M月D日 HH:mm')
  if (isSameDay) {
    end = endDate.format('HH:mm')
  } else if (isSameMonth) {
    end = endDate.format('D日 HH:mm')
  } else if (isSameYear) {
    end = endDate.format('M月D日 HH:mm')
  }
  return `${start} - ${end}`
}
