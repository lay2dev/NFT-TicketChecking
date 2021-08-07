import { Message } from '@lay2/pw-core'

export interface UnipassURLData {
  data: {
    email?: string
    pubkey?: string
    recovery?: string
    sig?: string
  }
  info: string
  code: number
}
export interface NFT {
  classTypeArgs: string
  nftTypeArgs: string
  tokenId: string
  outPoint: {
    txHash: string
    index: string
  }
}

export enum ActionType {
  Init,
  Login,
  SignMsg,
  SendTx,
}
export interface PageData {
  signature: string
  pubkey: string
}

export interface PageState {
  action: ActionType
  data: PageData
  extraObj: string
}

export interface SendTxState {
  txObj: any
  messages: Message[]
}

export const KEY = 'unipass'
export const PAGESTATE = 'page_state'
export const PROVIDER = 'provider'

export interface UnipassData {
  email: string
  address: string
  pubkey: string
  sig?: string
}

export enum RQStatus {
  Init = 0,
  NotIssued,
  Issued,
  Verified,
  VerifiedSuccess,
  VerifiedFail,
}
