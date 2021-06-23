import {
  Address,
  AddressType,
  Blake2bHasher,
  getDefaultPrefix,
  HashType,
  Platform,
  Provider,
  Script,
} from '@lay2/pw-core'
import { getAddressByPubkey } from '~/assets/js/utils/utils'

type UP_ACT =
  | 'UP-READY'
  | 'UP-LOGIN'
  | 'UP-SIGN'
  | 'UP-CLOSE'
  | 'UP-BIND'
  | 'UP-RECOVERY'

export interface UnipassAccount {
  pubkey: string
  email: string
  recovery?: boolean
}
export interface UnipassSign {
  pubkey: string
  sign: string
}
export interface UnipassMessage {
  upact: UP_ACT
  payload?: string | UnipassAccount | UnipassSign
}

export default class UnipassProvider extends Provider {
  private _email: string | undefined
  private _recovery: boolean | undefined
  private msgHandler:
    | ((this: Window, event: MessageEvent) => unknown)
    | undefined

  get email() {
    return this._email
  }

  get recovery() {
    return this._recovery
  }

  constructor(
    private readonly UNIPASS_BASE = process.env.UNIPASS_URL as string,
  ) {
    super(Platform.ckb)
  }

  init(): Promise<UnipassProvider> {
    return new Promise((resolve) => {
      const { uniFrame } = openIframe(
        'login',
        `${this.UNIPASS_BASE}/#/login`,
        () => {
          const msg: UnipassMessage = {
            upact: 'UP-LOGIN',
          }
          uniFrame.contentWindow &&
            uniFrame.contentWindow.postMessage(msg, this.UNIPASS_BASE)
        },
      )

      this.msgHandler = (event) => {
        if (typeof event.data === 'object' && 'upact' in event.data) {
          const msg = event.data as UnipassMessage
          if (msg.upact === 'UP-LOGIN') {
            const { pubkey, email } = msg.payload as UnipassAccount
            const ckbAddress = pubkeyToAddress(pubkey)
            this.address = new Address(ckbAddress, AddressType.ckb)
            this._email = email
            this.msgHandler &&
              window.removeEventListener('message', this.msgHandler)
            uniFrame && closeFrame(uniFrame)
            resolve(this)
          } else if (msg.upact === 'UP-CLOSE') {
            uniFrame && closeFrame(uniFrame)
            resolve(this)
          }
        }
      }
      window.addEventListener('message', this.msgHandler, false)
      // this._email = data.email
      // this.address = new Address(data.address, AddressType.ckb)
      // resolve(this)
    })
  }

  recover(): Promise<UnipassProvider> {
    return new Promise((resolve) => {
      const { uniFrame } = openIframe(
        'login',
        `${this.UNIPASS_BASE}/#/login`,
        () => {
          const msg: UnipassMessage = {
            upact: 'UP-RECOVERY',
          }
          uniFrame.contentWindow &&
            uniFrame.contentWindow.postMessage(msg, this.UNIPASS_BASE)
        },
      )
      this.msgHandler = (event) => {
        if (typeof event.data === 'object' && 'upact' in event.data) {
          const msg = event.data as UnipassMessage
          if (msg.upact === 'UP-LOGIN') {
            const { pubkey, email, recovery } = msg.payload as UnipassAccount
            const ckbAddress = pubkeyToAddress(pubkey)
            this.address = new Address(ckbAddress, AddressType.ckb)
            this._email = email
            this._recovery = recovery as boolean
            this.msgHandler &&
              window.removeEventListener('message', this.msgHandler)
            uniFrame && closeFrame(uniFrame)
            resolve(this)
          } else if (msg.upact === 'UP-CLOSE') {
            uniFrame && closeFrame(uniFrame)
            resolve(this)
          }
        }
      }
      window.addEventListener('message', this.msgHandler, false)
    })
  }

  sign(message: string): Promise<string> {
    return new Promise((resolve) => {
      const { uniFrame } = openIframe('sign', `${this.UNIPASS_BASE}/#/sign`)
      this.msgHandler = (event) => {
        if (typeof event.data === 'object' && 'upact' in event.data) {
          const msg = event.data as UnipassMessage
          if (msg.upact === 'UP-SIGN') {
            let signature
            if (typeof msg.payload === 'string') {
              signature = msg.payload
            } else {
              signature = JSON.stringify(msg.payload)
            }
            this.msgHandler &&
              window.removeEventListener('message', this.msgHandler)
            uniFrame && closeFrame(uniFrame)
            if (typeof msg.payload === 'string') {
              resolve(`0x01${signature.replace('0x', '')}`)
            } else {
              resolve(signature)
            }
          } else if (msg.upact === 'UP-READY') {
            const msg: UnipassMessage = {
              upact: 'UP-SIGN',
              payload: message,
            }
            uniFrame.contentWindow &&
              uniFrame.contentWindow.postMessage(msg, this.UNIPASS_BASE)
          } else if (msg.upact === 'UP-LOGIN') {
            const { pubkey, email } = msg.payload as UnipassAccount
            const ckbAddress = pubkeyToAddress(pubkey)
            this.address = new Address(ckbAddress, AddressType.ckb)
            // saveData({ email, pubkey, address: ckbAddress })
            this._email = email
            this.msgHandler &&
              window.removeEventListener('message', this.msgHandler)
            uniFrame && closeFrame(uniFrame)
            // window.location.reload();
            resolve('0x')
          } else if (msg.upact === 'UP-CLOSE') {
            uniFrame && closeFrame(uniFrame)
            resolve('N/A')
          }
        }
      }

      window.addEventListener('message', this.msgHandler, false)
    })
  }

  close() {
    this.msgHandler && window.removeEventListener('message', this.msgHandler)
  }
}

let uniFrame: HTMLIFrameElement

function openIframe(
  title: string,
  url: string,
  onload?: (this: GlobalEventHandlers, ev: Event) => unknown,
) {
  if (uniFrame) closeFrame(uniFrame)
  document.title = title
  document.body.style.margin = '0'
  document.body.style.height = '100%'
  document.body.style.overflow = 'hidden'

  uniFrame = document.createElement('iframe')
  uniFrame.src = url
  uniFrame.style.width = '100%'
  uniFrame.style.height = '100%'
  uniFrame.style.zIndex = '2147483649'
  uniFrame.style.position = 'absolute'
  uniFrame.style.backgroundColor = 'rgba(0,0,0,.65)'
  const { left, top } = document.documentElement.getBoundingClientRect()
  uniFrame.style.left = `${left}px`
  uniFrame.style.top = `${-top}px`
  uniFrame.setAttribute('scrolling', 'no')
  uniFrame.setAttribute('frameborder', 'no')
  onload && (uniFrame.onload = onload)

  document.body.appendChild(uniFrame)
  return { uniFrame }
}

function closeFrame(frame: HTMLIFrameElement) {
  frame.remove()
  document.body.style.removeProperty('overflow')
}

export function pubkeyToAddress(pubkey: string): string {
  getAddressByPubkey(pubkey)
  const pubKeyBuffer = Buffer.from(pubkey.replace('0x', ''), 'hex')
  const hashHex = new Blake2bHasher()
    .update(pubKeyBuffer.buffer)
    .digest()
    .serializeJson()
    .slice(0, 42)
  // const isLina = localStorage.getItem('lina')
  // const isTest = localStorage.getItem('test')
  // const script: Script
  const script = new Script(
    process.env.UNIPASS_TYPE_ID as string,
    hashHex,
    HashType.type,
  )

  return script.toAddress(getDefaultPrefix()).toCKBAddress()
}
