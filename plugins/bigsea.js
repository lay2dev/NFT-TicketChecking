import '~/assets/js/utils/bigsea'
import dayjs from 'dayjs'
import PWCore, { ChainID } from '@lay2/pw-core'
import { ActionType } from 'assets/js/url/interface'
import {
  restoreState,
  getDataFromUrl,
  getPubkey,
  saveState,
} from 'assets/js/url/state-data'
import {
  authHaveTargetNFT,
  encodeMessage,
  authAdrress,
} from '~/assets/js/ticket/auth'
import { verifier } from '~/assets/js/ticket/verifier'

Sea.Ajax.HOST = process.env.NFT_GIFT_API_URL
PWCore.chainId =
  process.env.CKB_CHAIN_ID === '0' ? ChainID.ckb : ChainID.ckb_testnet

Sea.SaveDataByUrl = () => {
  const pageState = restoreState(true)
  let action = ActionType.Init
  if (pageState) action = pageState.action
  if (action === ActionType.Init) {
    const info = getDataFromUrl(ActionType.Login)
    return info
  } else if (action === ActionType.SignMsg) {
    const info = getDataFromUrl(ActionType.SignMsg)
    return Sea.getSignData(info)
  }
}

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
  const provider = await Sea.checkLogin()
  if (provider) {
    return provider
  }
  const host = process.env.UNIPASS_URL
  const successUrl = new URL(window.location.href).href
  const failUrl = new URL(window.location.href).href
  const url = `${host}?success_url=${successUrl}&fail_url=${failUrl}/#login`
  saveState(ActionType.Init)
  window.location.href = url
}

Sea.getActivity = async () => {
  console.log('getActivity')
  const res = await Sea.Ajax({
    url: '/ticket/activity',
    method: 'get',
  })
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

Sea.getShortUrlKeyInfo = async ({ address, sig, messageHash }) => {
  const data = {
    address,
    sig,
    messageHash,
    activity: 0,
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

Sea.getAssetsAndAuthNFT = async (
  address,
  targetArgs,
  targetTokenID,
  sig,
  messageHash,
) => {
  console.log('[getAssets]', messageHash, sig.length)
  try {
    const pass = verifier(messageHash, sig)
    console.log('[getAssets]-verifierSign:', pass)
    if (!pass) return { pass }
  } catch (e) {
    console.log('[getAssets-e]', e)
  }

  const res = await Sea.Ajax({
    url: '/ckb',
    method: 'get',
    data: {
      address,
    },
  })
  console.log('[getAssets]- nft len is', res.length)
  const data = await authHaveTargetNFT(res, targetArgs, targetTokenID)
  console.log('[getAssets]- have  target nft', data)
  if (!data.pass) return data

  const pass = authAdrress(sig, address)
  if (!pass) return data

  return data
}

Sea.createSignMessage = async (address) => {
  console.log('createSignMessage', address)
  // todo
  const pubkey = getPubkey()
  if (!pubkey) return
  const host = process.env.UNIPASS_URL
  const successUrl = new URL(window.location.href).href
  const failUrl = new URL(window.location.href).href

  const { messageHash, timestamp } = await encodeMessage()
  console.log('[createSignMessage]', messageHash, timestamp)
  saveState(ActionType.SignMsg, JSON.stringify({ messageHash, timestamp }))
  const _url = `${host}?success_url=${successUrl}&fail_url=${failUrl}&pubkey=${pubkey}&message=${messageHash}/#sign`
  window.location.href = _url
}

Sea.getSignData = (info) => {
  const pageState = restoreState()
  const extraObj = pageState.extraObj
  console.log('[[[[pageState]]]]', pageState)
  if (extraObj && pageState.data.signature) {
    const { messageHash, timestamp } = JSON.parse(extraObj)
    const data = {
      messageHash,
      timestamp,
      sig: pageState.data.signature,
    }
    return data
  }
  return { info }
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

Sea.getClassArgs = () => {
  const classArgs = Sea.localStorage('classArgs')
  return classArgs
}

Sea.saveClassArgs = (classArgs) => {
  Sea.localStorage('classArgs', classArgs)
}

Sea.saveData = (key, data) => {
  Sea.localStorage(key, data)
}
Sea.getData = (key) => {
  return Sea.localStorage(key)
}
