<template>
  <div>
    test
    <button @click="login">login</button>
    <button @click="getActivity">getActivityList</button>
    <!-- <button @click="askVerifiy">askVerifiy</button> -->

    <div>
      <button @click="createCardInfo">签名生成二维码数据</button>
      <div>二维码信息 address：</div>
      <div>{{ address }}</div>
      <div>二维码信息 timestamp：</div>
      <div>{{ timestamp }}</div>
      <div>二维码信息 signature</div>
      <div>{{ sig }}</div>
      <div>
        <button @click="getShortUrlKeyInfo">获取生成二维码短链key</button>
        <div>{{ key }}</div>
      </div>
      <div>
        <button @click="getShortUrlKeyInfo">通过短链key获取验证数据</button>
        <div>扫码信息 address：</div>
        <div>{{ address1 }}</div>
        <div>扫码信息 timestamp：</div>
        <div>{{ timestamp1 }}</div>
        <div>扫码信息 signature</div>
        <div>{{ sig1 }}</div>
      </div>
    </div>

    <div>
      <input v-model="targetArgs" placeholder="输入待验证的NFTargs" />
      <button @click="startVerifiyQRData">开始验证</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Test',
  data() {
    return {
      provider: null,
      targetArgs: '',
      targetTokenId: -1,
      authData: null,
      address: '',
      timestamp: '',
      sig: '',
      address1: '',
      timestamp1: '',
      sig1: '',
      key: '',
    }
  },
  mounted() {
    const provider = Sea.checkLogin()
    if (provider) {
      this.provider = provider
    } else {
      this.login()
    }
  },
  methods: {
    async login() {
      console.log('login')
      await Sea.login()
    },
    async getActivity() {
      const data = await Sea.getActivity()
      for (const item of data) {
        console.log(item)
        this.targetArgs = item.nftTypeArgs
        this.tokenId = item.tokenId
      }
    },

    async getAssets() {
      console.log(this.provider._address.addressString)
      const data = await Sea.getAssets(this.provider._address.addressString)
      this.authData = data
    },

    async createCardInfo() {
      console.log('createCardInfo')
      const data = await Sea.createSignMessage()
      this.address = this.provider._address.addressString
      this.sig = data.sig
      this.timestamp = data.timestamp
      console.log('this.address', this.address)
      console.log('this.address', this.sig)
      console.log('this.address', this.timestamp)
    },

    async startVerifiyQRData() {
      console.log('createCardInfo', this.address)
      if (!this.targetArgs) return
      const data = await Sea.getAssetsAndAuthNFT(
        this.address,
        this.targetArgs,
        this.targetTokenId,
      )
      console.log('createCardInfo', data)
    },

    // save data to server get short url
    async getShortUrlKeyInfo() {
      console.log('[getShortUrlKeyInfo]')
      const data = await Sea.getShortUrlKeyInfo({
        address: this.address,
        sig: this.sig,
        timestamp: this.timestamp,
      })
      this.key = data
      console.log('[getShortUrlKeyInfo]', data)
    },

    // save data from short key
    async getShortKeyInfoData() {
      console.log('[getShortUrlKeyInfo]')
      const data = await Sea.getShortKeyInfoData({
        key: this.key,
      })
      this.key = data
      console.log('[getShortUrlKeyInfo]', data)
    },
  },
}
</script>
