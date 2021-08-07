<template>
  <el-image
    class="imgs"
    :src="srcFormat"
    :fit="fit"
    v-bind="$attrs"
    v-on="$listeners"
  ></el-image>
</template>
<script>
export default {
  props: {
    src: {
      type: String,
      default: '',
    },
    fit: {
      type: String,
      default: 'cover',
    },
    h: {
      type: [String, Number],
      default: 420,
    },
  },
  data() {
    return {
      list: ['aliyuncs.com', 'oss.jinse.cc'],
    }
  },
  computed: {
    srcFormat() {
      const src = new URL(this.src)
      for (const white of this.list) {
        if (src.hostname.endsWith(white)) {
          src.searchParams.set(
            'x-oss-process',
            `image/resize,h_${this.h},m_lfit`,
          )
        }
      }
      return src.href
    },
  },
}
</script>
