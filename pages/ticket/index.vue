<template>
  <div>
    test
    <button @click="login">login</button>
    <button @click="getActivity">getActivityList</button>
    <button @click="askVerifiy">askVerifiy</button>
    <button @click="postVerifiyData">postVerifiyData</button>
    <button @click="getAssets">getAssets</button>
    <button @click="sign">sign</button>
  </div>
</template>

<script>
export default {
  name: "test",
  setup() {
    return {
      provider: null
    };
  },
  mounted() {
    const provider = Sea.checkLogin();
    if (provider) {
      this.provider = provider;
    } else {
      this.login();
    }
  },
  methods: {
    async login() {
      console.log("login");
      await Sea.login();
    },
    async getActivity() {
      await Sea.getActivity();
    },
    async askVerifiy() {
      await Sea.askVerifiy(this.provider._address.addressString, 1);
    },
    async postVerifiyData() {
      const data = {
        address: "111",
        tokenId: 1,
        activity: 11,
        pass: true
      };
      await Sea.postVerifiyData(data);
    },
    async getAssets() {
      console.log(this.provider._address.addressString);
      await Sea.getAssets(this.provider._address.addressString);
    },
    sign() {
      console.log("sign");
    }
  }
};
</script>
