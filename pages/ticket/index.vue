<template>
  <div id="page-ticket">
    <back />
    <div class="page-title">{{ card.title }}</div>
    <div class="card-box">
      <el-carousel
        class="cards"
        ref="carousel"
        :height="`${height}px`"
        trigger="click"
        :autoplay="false"
        :loop="false"
        indicator-position="none"
        @change="bindChange"
      >
        <template v-if="nfts.length">
          <el-carousel-item
            v-for="(nft, i) in nfts"
            :key="i"
            :name="String(nft.tokenId)"
          >
            <div class="card" ref="card">
              <imgs class="banner" :src="card.banner" />
              <div class="content">
                <div class="name">{{ nft.name }}</div>
                <div class="description">{{ nft.description }}</div>
                <div class="date">活动时间：{{ formatDate(card) }}</div>
                <div class="address">活动地点：{{ card.describe }}</div>
                <div class="token">门票编号：#{{ nft.tokenId }}</div>
              </div>
              <div class="check">
                <div class="cricle left"></div>
                <div class="cricle right"></div>
                <template v-if="nft.rqState === 1">
                  <div class="status">待验票</div>
                  <div class="tip">您需要持有图中指定 NFT，才能通过验证。</div>
                  <el-button
                    round
                    type="primary"
                    :loading="loading"
                    @click="bindCheck(nft)"
                  >
                    发起验票
                  </el-button>
                </template>
                <template v-else-if="nft.rqState === 2">
                  <img class="qrcode" :src="nft.QRCode" />
                  <div class="tip">
                    验票时间：{{ dayjs().format('YYYY年M月D日 HH:mm') }}
                  </div>
                  <div class="show">请向工作人员出示此二维码</div>
                </template>
                <template v-else-if="nft.rqState === 5">
                  <div class="status">已使用</div>
                  <div class="tip">此 NFT 已使用，无法再次兑票。</div>
                </template>
                <template v-else-if="nft.rqState >= 3">
                  <img class="qrcode" :src="nft.QRCode" />
                  <div class="tip">
                    验票时间：{{
                      nft.rqVerifyTime
                        ? dayjs(nft.rqVerifyTime).format('YYYY年M月D日 HH:mm')
                        : '-'
                    }}
                  </div>
                  <div class="show">该二维码已被使用</div>
                </template>
              </div>
            </div>
          </el-carousel-item>
        </template>
        <template v-else>
          <div class="card" ref="card" v-loading="loading">
            <imgs class="banner" :src="card.banner" />
            <div class="content">
              <div class="name">{{ card.nft.name }}</div>
              <div class="description">{{ card.nft.description }}</div>
              <div class="date">活动时间：{{ formatDate(card) }}</div>
              <div class="address">活动地点：{{ card.describe }}</div>
              <div class="token">门票编号：#{{ card.nft.tokenId }}</div>
            </div>
            <div class="check">
              <div class="cricle left"></div>
              <div class="cricle right"></div>
              <div class="status">暂无门票</div>
              <div class="tip">您需要持有图中指定 NFT，才能通过验证。</div>
            </div>
          </div>
        </template>
      </el-carousel>
    </div>
  </div>
</template>
<script>
import { getTargetNFTs } from '~/assets/js/ticket/auth'
import QRCode from 'qrcode'
import dayjs from 'dayjs'
import back from '~/components/back.vue'
export default {
  components: { back },
  data() {
    return {
      loading: true,
      card: {
        nft: [],
      },
      nfts: [],
      provider: {},
      status: '',
      height: 600,
    }
  },
  async created() {
    const card = Sea.localStorage('card')
    const provider = Sea.localStorage('provider')
    if (card && provider) {
      this.card = card
      this.provider = provider
      this.init()
      const data = await Sea.SaveDataByUrl()
      if (data) {
        if (data.info) {
          this.$message.warning(data.info)
        } else {
          this.bindCheckNext(data)
        }
      }
    } else {
      this.$router.replace('/')
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initHeight()
    })
  },
  methods: {
    bindChange(i) {
      const nft = this.nfts[i]
      console.log('🌊', nft.QRCodeUrl)
      if (this.loading) {
        //
      } else {
        Sea.params('token-id', nft.tokenId)
      }
    },
    async init() {
      this.loading = true
      const address = this.provider._address.addressString
      let nfts = await Sea.Ajax({
        url: '/ckb',
        method: 'get',
        data: {
          address,
          page: 0,
          limit: 1000,
        },
      })
      const activity = this.card.id
      nfts = getTargetNFTs(nfts, this.card.nftTypeArgs)
      const tokens = nfts.map((e) => e.tokenId)
      const status = await Sea.GetNftQrStateFromTokenIds(
        activity,
        address,
        tokens,
      )
      this.loading = false
      for (const nft of nfts) {
        for (const state of status) {
          if (String(nft.tokenId) === String(state.tokenId)) {
            const { rqState, short, rqVerifyTime } = state
            nft.rqState = rqState
            nft.short = short
            nft.rqVerifyTime = rqVerifyTime
            // 0: '初始化',
            // 1: '生成二维码',
            // 2: '生成二维码未验票',
            // 3: '已验票',
            // 4: '已验票',
            // 5: '此 NFT 已使用，无法再次兑票',
            if (rqState >= 2 && short) {
              const url = `${window.location.origin}/check/?key=${short}&id=${this.card.id}`
              let dark = '#000000'
              if (rqState !== 2) {
                dark = '#00000073'
              }
              nft.QRCodeUrl = url
              nft.QRCode = await QRCode.toDataURL(url, {
                type: 'image/png',
                width: 240,
                margin: 2,
                color: {
                  dark,
                  light: '#FFFFFF',
                },
              })
            }
          }
        }
      }
      this.nfts = nfts
      this.$nextTick(() => {
        this.initHeight()
        const id = this.$route.query['token-id']
        if (id) {
          this.$refs.carousel.setActiveItem(id)
        }
      })
    },
    initHeight() {
      const card = this.$refs.card
      if (!card) {
        return
      }
      let h = 0
      if (Array.isArray(card)) {
        for (const dom of card) {
          if (dom.clientHeight > h) {
            h = dom.clientHeight
          }
        }
      } else {
        h = card.clientHeight
      }
      this.height = h + 46
    },
    async getShortUrlKeyByInfo(data) {
      const req = {
        address: data.address,
        sig: data.sig,
        messageHash: data.messageHash,
        tokenId: data.tokenId,
        activity: data.activity,
      }
      const res = await Sea.getShortUrlKeyInfo(req)
      if (!res[0]) return res[1]
      return res[1]
    },
    dayjs,
    bindCheck(nft) {
      this.$confirm(
        '一张NFT门票仅能兑换一次二维码门票，兑换后请不要再转让此NFT，否则可能会导致验票失败。',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
        },
      )
        .then(async () => {
          this.loading = true
          const address = this.provider._address.addressString
          await Sea.getTicketSignData(
            address,
            this.card.nftTypeArgs,
            nft.tokenId,
            this.card.id,
          )
          this.loading = false
          // sign message
        })
        .catch(() => {
          this.$message('取消验票')
        })
    },
    async bindCheckNext(data) {
      const address = this.provider._address.addressString
      const activity = this.card.id
      Object.assign(data, { address, activity })
      this.loading = true
      const res = await this.getShortUrlKeyByInfo(data)
      this.loading = false
      if (!res) {
        this.$message.error('当前地址上没有指定验证的NFT')
        return
      }
      const key = res.key
      if (!key || key == 'undefined') {
        this.$message.error('二维码已验证')
        return
      }
      this.init()
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
    width: 100%;

    .cards {
      width: 100%;

      .card {
        margin: 20px auto;
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

          .token {
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
            text-align: center;
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

          .qrcode {
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
}
</style>
