<template>
  <div id="page-ticket">
    <div class="page-title">NFT 验票</div>
    <right @clear="init" />
    <div class="card-box">
      <div class="card">
        <div class="check" :class="status">
          <template v-if="status === 'success'">
            <img class="icon" src="~/assets/img/success.svg" />
            <div class="status">#{{ ticketId }}，验票成功</div>
            <div class="tip">
              验票时间：{{ dayjs().format('YYYY年M月D日 HH:mm') }}
            </div>
          </template>
          <template v-else-if="status === 'fail'">
            <img class="icon" src="~/assets/img/fail.svg" />
            <div class="status">验票失败</div>
            <div class="tip">
              验票时间：{{ dayjs().format('YYYY年M月D日 HH:mm') }}
            </div>
          </template>
          <template v-else>
            <div class="status">{{ tips }}</div>
            <el-button
              v-if="btnText"
              round
              type="primary"
              :loading="loading"
              @click="bindCheck"
            >
              {{ btnText }}
            </el-button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import right from '~/components/right.vue'
export default {
  components: { right },
  data() {
    const { key, id } = this.$route.query
    Sea.localStorage('key', key)
    return {
      loading: false,
      card: {
        nft: {},
      },
      key,
      id,
      token: '',
      provider: {},
      status: '',
      targetArgs: '',
      targetTokenId: -1,
      authData: null,
      result: null,
      ticketId: '',
      tips: '',
      btnText: '',
    }
  },
  async created() {
    const data = await Sea.SaveDataByUrl()
    if (data) {
      await this.getToken()
    }
    const { key, id } = this.$route.query
    this.key = key
    this.id = id
    const provider = Sea.localStorage('provider')
    if (provider) {
      this.provider = provider
      const token = Sea.localStorage('token')
      if (!token) {
        this.getToken()
      } else {
        this.token = token.token
        this.targetArgs = token.nftTypeArgs
        this.start()
      }
    } else {
      this.init()
    }
  },
  methods: {
    dayjs,
    // get data
    async getShortKeyInfoData() {
      const res = await Sea.Ajax({
        url: '/ticket/vierfiy',
        method: 'get',
        data: {
          key: this.key,
          token: this.token,
        },
      })
      if (res.code === 200) {
        return res
      } else {
        this.tips = '当前地址无验票权限'
        this.btnText = ''
        this.token = false
        this.loading = false
      }
    },

    async init() {
      this.loading = true
      const provider = await Sea.login()
      if (provider) {
        this.$store.state.provider = provider
        this.provider = provider
      }
      this.loading = false
    },
    async bindLogin() {
      if (this.token) {
        return
      }
      this.loading = true
      Sea.localStorage('token', null)
      await Sea.login(true)
      this.loading = false
    },
    start() {
      this.tips = '待验票'
      this.btnText = '开始验票'
      this.loading = false
    },
    async getToken() {
      this.loading = true
      const provider = Sea.localStorage('provider')
      const address = provider._address.addressString
      const token = await Sea.getToken(address, this.id)
      if (!token) {
        this.tips = '当前地址无验票权限'
        this.btnText = ''
        this.token = false
        this.loading = false
        return
      }
      Sea.localStorage('token', token)
      this.token = token.token
      this.targetArgs = token.nftTypeArgs
      this.start()
    },
    // start verifiy
    async startVerifiyQRData(authData) {
      if (!this.targetArgs || !authData) {
        this.loading = false
        return
      }
      const data = await Sea.getAssetsAndAuthNFT(
        authData.address,
        this.targetArgs,
        authData.targetTokenId,
        authData.sig,
        authData.messageHash,
      )
      this.loading = false
      return data
    },

    async bindCheck() {
      this.loading = true
      // todo get auth data from key
      const authData = await this.getShortKeyInfoData()
      const { pass, ticketId } = await this.startVerifiyQRData(authData)
      this.ticketId = ticketId
      const res = await Sea.Ajax({
        url: '/ticket/vierfiy',
        data: {
          pass,
          key: this.key,
          token: this.token,
        },
        method: 'patch',
      })
      const code = res.code
      // 200 有权限
      // 400 没权限
      // 403 没权限
      // 410 已验票
      if (code === 200) {
        this.status = pass ? 'success' : 'fail'
      } else if (code === 410) {
        this.tips = '该门票已被使用'
        this.btnText = ''
      } else {
        this.tips = '无权限'
      }
      this.loading = false
    },
    formatDate: Sea.formatDate,
  },
}
</script>
<style lang="stylus">
#page-ticket {
  background-color: rgba(247, 248, 249, 1);
  min-height: 100vh;
  display: flex;
  align-items: center;
  flex-direction: column;

  .page-title {
    padding-top: 8px;
    font-size: 16px;
    text-align: center;
    color: rgba(16, 16, 16, 100);
    height: 35px;
    line-height: 35px;
  }

  .box.password {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    padding: 14px 12px;
    margin-top: 31px;

    span {
      align-self: flex-start;
    }

    /* Chrome/Opera/Safari */
    input::-webkit-input-placeholder {
      color: rgba(210, 123, 48, 0.6);
    }

    /* Firefox 19+ */
    input::-moz-placeholder {
      color: rgba(210, 123, 48, 0.6);
    }

    /* IE 10+ */
    input:-ms-input-placeholder {
      color: rgba(210, 123, 48, 0.6);
    }

    /* Firefox 18- */
    input:-moz-placeholder {
      color: rgba(210, 123, 48, 0.6);
    }

    .tip {
      font-size: 12px;
    }
  }

  .card-box {
    flex: 1;
    display: flex;
    align-items: center;

    .card {
      margin: 20px 0;
      overflow: hidden;
      width: 91.2vw;
      border-radius: 16px;
      background-color: rgba(255, 255, 255, 1);
      box-shadow: 0px 0px 24px 0px rgba(61, 135, 234, 0.25);
      position: relative;
      color: rgba(0, 0, 0, 0.85);

      .banner {
        border-radius: 16px 16px 0 0;
        width: 100%;
        object-fit: cover;
      }

      .content {
        padding: 12px 16px 28px;
        border-bottom: 3px dashed rgba(210, 210, 210, 1);

        .name {
          color: rgba(0, 0, 0, 1);
          font-size: 20px;
          font-weight: bold;
        }

        .description {
          margin-top: 10px;
          color: rgba(0, 0, 0, 0.65);
        }

        .date {
          margin-top: 8px;
        }

        .address {
          margin-top: 8px;
        }
      }

      .check {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100vm;
        height: 65vh;
        justify-content: center;
        position: relative;

        .status {
          margin-top: 28px;
          font-weight: bold;
          color: rgba(255, 164, 0, 100);
          font-size: 30px;
        }

        .tip {
          margin-top: 8px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 20px;
        }

        .el-button {
          width: 160px;
          height: 40px;
          border: 0;
          margin-top: 24px;
          background-image: linear-gradient(to right, #69C0FF, #2A65C4);
        }
      }

      .check.success {
        .status {
          color: #3BC200;
        }

        .tip {
          margin-top: 16px;
        }

        .show {
          color: rgba(0, 0, 0, 0.85);
          margin-top: 16px;
        }
      }

      .check.fail {
        .status {
          color: #f00;
        }

        .tip {
          margin-top: 16px;
        }

        .show {
          color: rgba(0, 0, 0, 0.85);
          margin-top: 16px;
        }
      }

      .icon {
        margin-top: 16px;
        width: 100px;
        height: 100px;
      }

      svg g polyline {
        stroke: red;
      }
    }
  }
}
</style>
