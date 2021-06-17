<template>
  <div>
    test
    <button @click="login">login</button>
    <button @click="getActivity">getActivityList</button>
    <button @click="askVerifiy">askVerifiy</button>
    <button @click="getAssets">getAssets</button>
    <button @click="postVerifiyData">postVerifiyData</button>
  </div>
</template>

<script>
export default {
  name: 'Test',
  setup() {
    return {
      provider: null,
      targetArgs: '',
      targetTokenId: -1,
      pass: false,
      ntfArgs: '',
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
    async askVerifiy() {
      console.log('[address]', this.provider._address.addressString)
      let address = this.provider._address.addressString
      if (!address)
        address =
          'ckt1qsfy5cxd0x0pl09xvsvkmert8alsajm38qfnmjh2fzfu2804kq47dusc6l0nlyv80d3dn78qtd8e4kryxgtj5e7mdh6'
      await Sea.askVerifiy(address, 4)
    },
    async postVerifiyData() {
      const data = {
        address: this.provider._address.addressString,
        ntfArgs: this.ntfArgs,
        activity: 4,
        pass: this.pass,
      }
      await Sea.postVerifiyData(data)
    },
    async getAssets() {
      console.log(this.provider._address.addressString)
      const data = await Sea.getAssets(
        this.provider._address.addressString,
        this.targetArgs,
        this.targetTokenId,
      )
      this.pass = data.pass
      this.ntfArgs = data.nftArgs
    },
  },
}
</script>
