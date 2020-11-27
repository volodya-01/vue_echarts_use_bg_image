<template>
  <div class="hello">
    <div class="echartsbox">
      <echarts1 />
    </div>
    <div class="echartsbox">
      <echarts2 />
    </div>
 <div class="echartsbox">
      <echarts3 />
    </div>
  </div>
</template>

<script>
import echarts1 from "./echarts1";
import echarts2 from "./echarts2";
import echarts3 from "./echarts3";

export default {
  name: "HelloWorld",
  components: {
    echarts1,
    echarts2,
    echarts3
  
  },

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.echartsbox {
  width: 100%;
  height: 760px;
}

</style>
