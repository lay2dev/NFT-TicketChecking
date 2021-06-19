<template>
  <div id="page-ticket">
    <div class="page-title">NFT验票</div>
    <right @clear="open" />
    <div class="card-box">
      <div class="card">
        <div class="check" :class="status">
          <template v-if="status === 'success'">
            <img class="icon" src="~/assets/img/success.svg" />
            <div class="status">#{{ ticketId }}，验票成功!</div>
            <div class="tip">验票时间：{{ dayjs().format('YYYY年M月D日 HH:mm') }}</div>
          </template>
          <template v-else-if="status === 'fail'">
            <img class="icon" src="~/assets/img/fail.svg" />
            <div class="status">验票失败!</div>
            <div class="tip">验票时间：{{ dayjs().format('YYYY年M月D日 HH:mm') }}</div>
          </template>
          <template v-else>
            <div class="status">待验票中</div>
            <el-button round type="primary" :loading="loading">验票中。。</el-button>
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
    const { key } = this.$route.query
    console.log(this.$route.query, key)
    return {
      loading: false,
      card: {
        nft: {},
      },
      key,
      provider: {},
      status: '',
      targetArgs: '',
      targetTokenId: -1,
      authData: null,
      result: null,
      ticketId: '',
    }
  },
  created() {
    const targetArgs = Sea.localStorage('classArgs')
    if (targetArgs) {
      this.targetArgs = targetArgs
      this.bindCheck()
    } else if (!targetArgs) {
      this.open()
    }
  },
  methods: {
    dayjs,
    // get data
    async getShortKeyInfoData() {
      console.log('[getShortUrlKeyInfo]', this.key)
      const authData = await Sea.getShortKeyInfoData({
        key: this.key,
      })
      // auth datat
      this.authData = authData
      console.log('[getShortUrlKeyInfo]', authData)
    },

    // start verifiy
    async startVerifiyQRData() {
      console.log('[startVerifiyQRData]', this.authData.address)
      if (!this.targetArgs) return
      const data = await Sea.getAssetsAndAuthNFT(
        this.authData.address,
        this.targetArgs,
        this.authData.targetTokenId,
        this.authData.sig,
        this.authData.messageHash,
      )
      console.log('[startVerifiyQRData]', data)
      this.loading = false
      return data
    },

    async bindCheck() {
      this.loading = true
      // todo get auth data from key
      await this.getShortKeyInfoData()
      const { pass, ticketId } = await this.startVerifiyQRData()
      console.log('[bindCheck]', pass, ticketId)
      pass ? (this.status = 'success') : (this.status = 'fail')
      this.loading = false
      console.log('[bindCheck]', this.status)
      this.ticketId = ticketId
    },
    formatDate: Sea.formatDate,

    open() {
      this.$prompt('请输入要验证的NFT信息', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: this.targetArgs,
        closeOnClickModal: false,
      })
        .then(({ value }) => {
          this.targetArgs = value
          Sea.localStorage('classArgs', this.targetArgs)
          this.$message({
            type: 'success',
            message: '输入要验证的NFT信息是: ' + value,
          })
          this.bindCheck()
        })
        .catch(() => {})
    },
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

      .check.qrcode {
        img {
          margin-top: 16px;
          width: 120px;
          height: 120px;
        }

        .show {
          margin-top: 12px;
          margin-bottom: 16px;
        }
      }

      .icon {
        margin-top: 16px;
        width: 40%;
        height: 40%;
      }

      svg g polyline {
        stroke: red;
      }
    }
  }
}
</style>
