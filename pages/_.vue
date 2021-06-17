<template>
  <div id="page-error" @click="bindBack">Not found page</div>
</template>

<script>
export default {
  name: 'Error',
  data() {
    return {}
  },
  mounted() {
    this.bindBack()
  },
  methods: {
    bindBack() {
      this.$alert('找不到该页面', '抱歉', {
        type: 'error',
        confirmButtonText: '去首页',
      })
        .then(() => {
          this.$router.push('/')
        })
        .catch(() => {})
    },
  },
}
</script>
<style lang="stylus">
#page-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
