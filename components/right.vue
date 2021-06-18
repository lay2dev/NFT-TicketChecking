<template>
  <div id="component-back">
    <div class="right" @click="bindBack">
      <el-button round type="primary" :loading="loading" @click="clear">切换验证</el-button>
    </div>
    <div class="right">
      <slot />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    stop: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    clear() {
      this.$emit('clear')
    },
  },
}
</script>
<style lang="stylus">
#component-back {
  > .left {
    cursor: pointer;
    position: fixed;
    top: 8px;
    left: 0px;
    width: 35px;
    height: 35px;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 17px;
      height: 17px;
    }
  }

  > div.right {
    cursor: pointer;
    position: fixed;
    top: 8px;
    right: 12px;
    height: 35px;
    font-size: 15px;
    display: flex;
    align-items: center;
    font-weight: bold;
    z-index: 100;

    a {
      color: #000;
    }
  }
}
</style>
