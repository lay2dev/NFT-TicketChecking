<template>
  <div id="page-index">
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
      provider: {},
      statusDict: {
        0: '进行中',
        1: '未开始',
        2: '已结束',
      },
      cards: [
        {
          id: 8,
          title: '我是中文标题',
          banner: 'https://cdn.sea.team/lay2/2.png',
          nftTypeArgs:
            '0xcbdd0b6b31c77f63b51f776f1a58a8924ae6fa7c0000000400000007',
          tokenId: -1,
          startTime: '2021-06-17T02:00:00.000Z',
          endTime: '2021-06-18T12:00:00.000Z',
          describe: '我是活动地点',
          describePicture: 'https://cdn.sea.team/lay2/1.png',
          status: 0,
          nft: {
            total: 9,
            issued: 9,
            name: 'Do you understand？',
            description: 'Game of Thrones',
            renderer: 'https://i.loli.net/2021/04/30/1UAvKyawNjCMgHQ.gif',
            issuerName: 'stitch',
            issuerAvatarUrl:
              'https://images.669pic.com/element_min_new_pic/74/45/47/87/35527c466c113c635dac7ffe63844024.png',
          },
        },
        {
          id: 4,
          title: 'action title',
          banner: 'https://cdn.sea.team/lay2/2.png',
          nftTypeArgs:
            '0xcbdd0b6b31c77f63b51f776f1a58a8924ae6fa7c0000000300000006',
          tokenId: -1,
          startTime: '2021-06-19T02:00:00.000Z',
          endTime: '2021-06-19T12:00:00.000Z',
          describe: 'action  start place',
          describePicture: 'https://cdn.sea.team/lay2/1.png',
          status: 1,
          nft: {
            total: 9,
            issued: 9,
            name: 'Keep quite',
            description: 'Game of Thrones',
            renderer:
              'https://missfayealexander.files.wordpress.com/2015/02/cersei.gif',
            issuerName: 'stitch',
            issuerAvatarUrl:
              'https://images.669pic.com/element_min_new_pic/74/45/47/87/35527c466c113c635dac7ffe63844024.png',
          },
        },
        {
          id: 5,
          title: 'action title 22',
          banner: 'https://cdn.sea.team/lay2/2.png',
          nftTypeArgs: '0xcbdd0b6b31c77f63b51f776f1a58a8924ae6fa7c0000000f',
          tokenId: -1,
          startTime: '2021-06-18T02:00:00.000Z',
          endTime: '2021-06-18T12:00:00.000Z',
          describe: 'action  start place 22',
          describePicture: 'https://cdn.sea.team/lay2/1.png',
          status: 1,
          nft: {
            total: 0,
            issued: 23,
            name: '海贼王',
            description: '海贼王',
            renderer:
              'https://goldenlegend.oss-cn-hangzhou.aliyuncs.com/production/ef6bd3a4-7e6b-4761-8d84-2a85bdbe901c.jpg',
            issuerName: 'stitch',
            issuerAvatarUrl:
              'https://images.669pic.com/element_min_new_pic/74/45/47/87/35527c466c113c635dac7ffe63844024.png',
          },
        },
        {
          id: 6,
          title: '我是中文标题',
          banner: 'https://cdn.sea.team/lay2/2.png',
          nftTypeArgs: '0xcbdd0b6b31c77f63b51f776f1a58a8924ae6fa7c0000000f',
          tokenId: -1,
          startTime: '2021-06-18T02:00:00.000Z',
          endTime: '2021-06-18T12:00:00.000Z',
          describe: 'action  start place 22',
          describePicture: 'https://cdn.sea.team/lay2/1.png',
          status: 1,
          nft: {
            total: 0,
            issued: 23,
            name: '海贼王',
            description: '海贼王',
            renderer:
              'https://goldenlegend.oss-cn-hangzhou.aliyuncs.com/production/ef6bd3a4-7e6b-4761-8d84-2a85bdbe901c.jpg',
            issuerName: 'stitch',
            issuerAvatarUrl:
              'https://images.669pic.com/element_min_new_pic/74/45/47/87/35527c466c113c635dac7ffe63844024.png',
          },
        },
        {
          id: 7,
          title: '我是中文标题',
          banner: 'https://cdn.sea.team/lay2/2.png',
          nftTypeArgs:
            '0xcbdd0b6b31c77f63b51f776f1a58a8924ae6fa7c0000000400000007',
          tokenId: -1,
          startTime: '2021-06-18T02:00:00.000Z',
          endTime: '2021-06-18T12:00:00.000Z',
          describe: '我是活动地点',
          describePicture: 'https://cdn.sea.team/lay2/1.png',
          status: 1,
          nft: {
            total: 9,
            issued: 9,
            name: 'Do you understand？',
            description: 'Game of Thrones',
            renderer: 'https://i.loli.net/2021/04/30/1UAvKyawNjCMgHQ.gif',
            issuerName: 'stitch',
            issuerAvatarUrl:
              'https://images.669pic.com/element_min_new_pic/74/45/47/87/35527c466c113c635dac7ffe63844024.png',
          },
        },
        {
          id: 3,
          title: 'ddd',
          banner: 'https://cdn.sea.team/lay2/2.png',
          nftTypeArgs: '0xcbdd0b6b31c77f63b51f776f1a58a8924ae6fa7c0000000f',
          tokenId: -1,
          startTime: '2021-06-15T07:00:00.000Z',
          endTime: '2021-06-16T15:00:00.000Z',
          describe: 'ddd',
          describePicture: 'https://cdn.sea.team/lay2/1.png',
          status: 2,
          nft: {
            total: 0,
            issued: 23,
            name: '海贼王',
            description: '海贼王',
            renderer:
              'https://goldenlegend.oss-cn-hangzhou.aliyuncs.com/production/ef6bd3a4-7e6b-4761-8d84-2a85bdbe901c.jpg',
            issuerName: 'stitch',
            issuerAvatarUrl:
              'https://images.669pic.com/element_min_new_pic/74/45/47/87/35527c466c113c635dac7ffe63844024.png',
          },
        },
      ],
    }
  },
  mounted() {
    // this.init()
  },
  methods: {
    bindCard(card) {
      this.$store.state.card = card
      this.$router.push('/ticket')
    },
    formatDate: Sea.formatDate,
    async init() {
      const provider = await Sea.login()
      if (provider) {
        this.provider = provider
        this.initList()
      } else {
        this.login()
      }
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
