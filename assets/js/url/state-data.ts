import { Address, AddressType } from '@lay2/pw-core'

import urlencode from 'urlencode'
import { pubkeyToAddress } from '../unipass/UnipassProvider'

import {
  ActionType,
  PageData,
  PAGESTATE,
  PageState,
  PROVIDER,
  UnipassURLData,
} from './interface'
export function saveData(key: string, data: string) {
  window.localStorage.setItem(key, data)
}

export function getData(key: string): string {
  return window.localStorage.getItem(key) as string
}

function removeData(key: string) {
  window.localStorage.removeItem(key)
}

export function saveState(action: ActionType, extraObj = '', data?: PageData) {
  let pageState = JSON.parse(getData(PAGESTATE)) as PageState
  if (pageState) {
    pageState.action = action
    pageState.extraObj = extraObj
    if (!pageState.data.pubkey) {
      pageState.data = {
        signature: '',
        pubkey: '',
      }
    }
  } else {
    if (!data) {
      data = {
        signature: '',
        pubkey: '',
      }
    }
    pageState = {
      action,
      extraObj,
      data,
    }
  }

  // save local store
  saveData(PAGESTATE, JSON.stringify(pageState))
}

export function restoreState(sign: boolean): PageState | undefined {
  const pageState = JSON.parse(getData(PAGESTATE)) as PageState
  if (!pageState) return undefined
  if (!sign) removeData(PAGESTATE)
  return pageState
}

export function getPubkey(): string | undefined {
  const provider = JSON.parse(getData(PROVIDER))
  if (!provider) return undefined
  return provider._pubkey
}

export function getDataFromUrl(action: number): void {
  const url = new URL(window.location.href)
  let data = ''
  try {
    data = url.searchParams.get('unipass_ret') as string
  } catch (e) {
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const unipassStr = urlencode.decode(data, 'utf-8')
  console.log('unipassStr', unipassStr)
  const unipassData = JSON.parse(unipassStr) as UnipassURLData

  if (!unipassData) return
  console.log(unipassData)
  if (unipassData.code === 200) {
    if (unipassData.data.pubkey) {
      const ckbAddress = pubkeyToAddress(unipassData.data.pubkey)
      let pageState = JSON.parse(getData(PAGESTATE)) as PageState
      console.log('---pageState')
      if (pageState) {
        pageState.data.signature = unipassData.data.sig as string
        pageState.data.pubkey = unipassData.data.pubkey as string
      } else {
        pageState = {
          action,
          extraObj: '',
          data: {
            signature: '',
            pubkey: '',
          },
        }
      }
      console.log('[==pageState]', pageState)
      saveData(PAGESTATE, JSON.stringify(pageState))

      const provider = {
        _time: Date.now(),
        _address: new Address(ckbAddress, AddressType.ckb),
        _email: unipassData.data.email,
        _pubkey: unipassData.data.pubkey,
      }
      saveData(PROVIDER, JSON.stringify(provider))
    }
  }
  url.searchParams.delete('unipass_ret')
  history.replaceState('', '', url.href)
  console.log('url.href', url.href)
}
