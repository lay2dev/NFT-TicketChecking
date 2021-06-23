<template>
  <div id="page-index" v-loading="loading">
    <back />
    <div class="page-title">NFT 验票</div>
    <div class="cards">
      <div
        v-for="(card, i) in cards"
        :key="i"
        class="card"
        :class="`status${card.status}`"
        @click="bindCard(card)"
      >
        <div class="status">{{ statusDict[card.status] }}</div>
        <div class="mask"></div>
        <img :src="card.banner" alt="card" />
        <div class="content">
          <div class="date">活动时间：{{ formatDate(card) }}</div>
          <div class="address">活动地点：{{ card.describe }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import back from '~/components/back.vue'
export default {
  components: { back },
  data() {
    return {
      loading: true,
      statusDict: {
        0: '进行中',
        1: '未开始',
        2: '已结束',
      },
      cards: [],
    }
  },
  created() {
    const { address, email, phone } = this.$route.query
    Sea.SaveDataByUrl(address, email || phone)
    this.init()
  },
  methods: {
    bindCard(card) {
      Sea.saveData('card', card)
      this.$router.push('/ticket')
    },
    formatDate: Sea.formatDate,
    async init() {
      this.loading = true
      const provider = await Sea.login()
      if (provider) {
        this.$store.state.provider = provider
        await this.initList()
      }
      this.loading = false
    },
    async initList() {
      const cards = await Sea.getActivity()
      this.cards = cards || []
    },
  },
}
</script>
<style lang="stylus">
#page-index {
  background-color: rgba(247, 248, 249, 1);
  min-height: 100vh;

  .page-title {
    padding-top: 8px;
    font-size: 16px;
    text-align: center;
    color: rgba(16, 16, 16, 100);
    height: 35px;
    line-height: 35px;
  }

  .cards {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-bottom: 60px;
    min-height: 500px;

    .card {
      cursor: pointer;
      width: 91.2vw;
      border-radius: 16px;
      background-color: rgba(255, 255, 255, 1);
      box-shadow: 0px 0px 24px 0px rgba(61, 135, 234, 0.25);
      position: relative;
      margin-top: 60px;
      color: rgba(0, 0, 0, 0.85);

      .status {
        position: absolute;
        top: -36px;
        left: 0px;
      }

      .mask {
        display: none;
        border-radius: 16px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.6);
      }

      img {
        border-radius: 16px 16px 0 0;
        width: 100%;
        height: 51.2vw;
        object-fit: cover;
      }

      .content {
        padding: 12px 16px;

        .date {
        }

        .address {
          margin-top: 8px;
        }
      }
    }

    .card.status2 {
      cursor: no-drop;

      .status {
        color: rgba(0, 0, 0, 0.65);
      }

      .mask {
        display: block;
      }
    }
  }
}
</style>
