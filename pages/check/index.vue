<template>
  <div id="page-ticket">
    <back />
    <div class="page-title">{{ card.title }}</div>
    <div class="card-box">
      <div class="card">
        <el-image class="banner" :src="card.banner" alt="card" />
        <div class="content">
          <div class="name">{{ card.nft.name }}</div>
          <div class="description">{{ card.nft.description }}</div>
          <div class="date">活动时间：{{ formatDate(card) }}</div>
          <div class="address">活动地点：{{ card.describe }}</div>
        </div>
        <div class="check" :class="status">
          <div class="cricle left"></div>
          <div class="cricle right"></div>
          <template v-if="status === 'success'">
            <div class="status">恭喜您，验票成功！</div>
            <div class="tip">
              验票时间：{{ dayjs().format('YYYY年M月D日 HH:mm') }}
            </div>
            <div class="show">请对工作人员出示此页面</div>
          </template>
          <template v-if="status === 'qrcode'">
            <img :src="QRCode" alt="QRCode" />
            <div class="tip">
              验票时间：{{ dayjs().format('YYYY年M月D日 HH:mm') }}
            </div>
            <div class="show">请向工作人员出示此二维码</div>
          </template>
          <template v-else>
            <div class="status">待验票</div>
            <div class="tip">您需要持有图中指定 NFT，才能通过验证。</div>
            <el-button
              round
              type="primary"
              :loading="loading"
              @click="bindCheck"
            >
              发起验票
            </el-button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import QRCode from 'qrcode'
import dayjs from 'dayjs'
import back from '~/components/back.vue'
export default {
  components: { back },
  data() {
    return {
      loading: false,
      card: {
        nft: {},
      },
      provider: {},
      status: '',
      QRCode: '',
    }
  },
  created() {
    const card = Sea.localStorage('ticket')
    console.log('🌊', card)
    // const card = this.$store.state.card
    // const provider = this.$store.state.provider
    // if (card && provider) {
    //   this.card = card
    //   this.provider = provider
    // } else {
    //   this.$router.replace('/')
    // }
  },
  methods: {
    dayjs,
    async bindCheck() {
      this.loading = true
      const data = await Sea.createSignMessage()
      const { sig, timestamp } = data
      const address = this.provider._address.addressString
      console.log('check', sig, timestamp, address)
      const url = `${window.location.origin}/check/addressString`
      this.QRCode = await QRCode.toDataURL(url, {
        type: 'image/png',
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      this.status = 'qrcode'
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
        height: 51.2vw;
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
        width: 100%;
        min-height: 178px;
        position: relative;

        .cricle {
          box-shadow: inset 0px 0px 24px 0px rgba(61, 135, 234, 0.25);
          position: absolute;
          top: -16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f7f8f9;
        }

        .cricle.left {
          left: -16px;
        }

        .cricle.right {
          right: -16px;
        }

        .status {
          margin-top: 28px;
          font-weight: bold;
          color: rgba(255, 164, 0, 100);
          font-size: 20px;
        }

        .tip {
          margin-top: 8px;
          color: rgba(0, 0, 0, 0.45);
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
    }
  }
}
</style>
