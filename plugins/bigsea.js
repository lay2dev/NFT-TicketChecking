import 'bigsea'
import dayjs from 'dayjs'
import PWCore, { ChainID } from '@lay2/pw-core'
import { ActionType } from 'assets/js/url/interface'
import {
  restoreState,
  getDataFromUrl,
  getPubkey,
  saveState,
  generateUnipassUrl,
} from 'assets/js/url/state-data'
import { getTicketSignCallback } from 'assets/js/ticket/transfer'
import { authHaveTargetNFT, authAdrress } from '~/assets/js/ticket/auth'
import { verifier } from '~/assets/js/ticket/verifier'

Sea.Ajax.HOST = process.env.NFT_GIFT_API_URL
PWCore.chainId =
  process.env.CKB_CHAIN_ID === '0' ? ChainID.ckb : ChainID.ckb_testnet

Sea.SaveDataByUrl = async () => {
  const pageState = restoreState(true)
  let action = ActionType.Init
  if (pageState) action = pageState.action
  if (action === ActionType.Init) {
    getDataFromUrl(ActionType.Login)
  } else if (action === ActionType.SignMsg) {
    const info = getDataFromUrl(ActionType.SignMsg)
    return Sea.getSignData(info)
  } else if (action === ActionType.SendTx) {
    const info = getDataFromUrl(ActionType.SignMsg)
    return await Sea.getTxSignData(info)
  } else {
    getDataFromUrl(ActionType.Login)
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

Sea.login = async (change) => {
  const provider = await Sea.checkLogin()
  if (provider && !change) {
    return provider
  }
  const host = process.env.UNIPASS_URL
  // eslint-disable-next-line camelcase
  const success_url = new URL(window.location.href).href
  const url = generateUnipassUrl(host, 'login', { success_url })
  saveState(ActionType.Init)
  window.location.href = url
}

Sea.getToken = async (address, key) => {
  const res = await Sea.Ajax({
    url: '/ticket/token',
    data: {
      address,
      key,
    },
    method: 'get',
  })
  if (res.code !== 200) return false
  return res
}

Sea.pushVerifyData = async (pass, key, token) => {
  const res = await Sea.Ajax({
    url: '/ticket/vierfiy',
    data: {
      pass,
      key,
      token,
    },
    method: 'patch',
  })
  if (res.code !== 200) return false
  return res
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
  if (res.code !== 200) return false
  return res
}

Sea.getShortUrlKeyInfo = async (data) => {
  const res = await Sea.Ajax({
    url: '/ticket/vierfiy',
    method: 'post',
    data,
  })
  console.log(res)

  if (res.code === 410) return [true, true]
  if (res.code !== 200) return [false, false]
  return [true, res]
}

Sea.getShortKeyInfoData = async ({ key, token }) => {
  const res = await Sea.Ajax({
    url: '/ticket/vierfiy',
    method: 'get',
    data: {
      key,
      token,
    },
  })
  if (res.code !== 200) return [false, false]
  if (res.code === 200) return [true, res]
  if (res.code !== 403) return [false, true]
}

Sea.createSignMessage = (message, tokenId) => {
  const pubkey = getPubkey()
  if (!pubkey) return
  const host = process.env.UNIPASS_URL
  saveState(ActionType.SignMsg, JSON.stringify({ message, tokenId }))
  const successUrl = new URL(window.location.href).href
  const _url = generateUnipassUrl(host, 'sign', {
    success_url: successUrl,
    pubkey,
    message,
  })
  window.location.href = _url
}

Sea.getSignData = (info) => {
  const pageState = restoreState()
  const extraObj = pageState.extraObj
  if (extraObj && pageState.data.signature) {
    const { message, tokenId } = JSON.parse(extraObj)
    const data = {
      messageHash: message,
      sig: pageState.data.signature,
      tokenId,
    }
    console.log(data)
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

Sea.getTicketSignData = async (
  address,
  targetArgs,
  targetTokenID,
  activity,
) => {
  console.log({ address, targetArgs, targetTokenID, activity })
  const res = await Sea.Ajax({
    url: '/ckb',
    method: 'get',
    data: {
      address,
      page: 0,
      limit: 1000,
    },
  })
  const data = await authHaveTargetNFT(res, targetArgs, targetTokenID)
  if (!data.pass) return false
  await Sea.getSignMessage(
    activity,
    data.ticketId,
    address,
    targetArgs,
    data.args,
  )
  return true
}

Sea.getTxSignData = (info) => {
  const pageState = restoreState()
  const extraObj = pageState.extraObj

  if (extraObj && pageState.data.signature) {
    const { tokenId, messages } = JSON.parse(extraObj)
    const txBody = getTicketSignCallback(pageState.data.signature, extraObj)
    return {
      txBody: JSON.stringify(txBody),
      sign: pageState.data.signature,
      messages,
      tokenId,
    }
  }
  return { info }
}

Sea.getSignMessage = async (
  activity,
  tokenId,
  address,
  classArgs,
  typeArgs,
) => {
  const data = {
    activity,
    tokenId,
    address,
    classArgs,
    typeArgs,
  }
  console.log(data)
  const res = await Sea.Ajax({
    url: '/ticket/message',
    method: 'post',
    data,
  })
  if (res.messageHash) {
    Sea.createSignMessage(res.messageHash, tokenId)
  }

  return true
}

Sea.getAssetsAndAuthNFT = async (
  address,
  targetArgs,
  targetTokenID,
  sig,
  messageHash,
) => {
  try {
    const pass = verifier(messageHash, sig)
    if (!pass) return { pass }
  } catch (e) {
    console.log('[getAssets-e]', e)
  }

  const res = await Sea.Ajax({
    url: '/ckb',
    method: 'get',
    data: {
      address,
      page: 0,
      limit: 200,
    },
  })
  const data = await authHaveTargetNFT(res, targetArgs, targetTokenID)
  if (!data.pass) return data

  const pass = authAdrress(sig, address)
  if (!pass) return data

  return data
}
Sea.GetNftQrStateFromTokenIds = async (activity, address, token) => {
  const data = {
    address,
    activity,
    token,
  }
  try {
    const res = await Sea.Ajax({
      url: '/ticket/state',
      method: 'post',
      data,
    })
    return res
  } catch (e) {
    return []
  }
}
