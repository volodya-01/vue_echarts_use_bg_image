<template>
  <div class="chart"></div>
</template>
<script>
import Bus from "@/utils/bus.js";
import { debounce } from "@/utils";
export default {
  name: "echarts9",
  data() {
    return {
      autoResize: {
        type: Boolean,
        default: true,
      },
      chart: null,
      sidebarElm: null,
      chartData: {},
      imgtest: require("../assets/组 38 拷贝 2.png"),
      fullImage: "",
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    if (this.autoResize) {
      window.removeEventListener("resize", this.__resizeHandler);
    }

    this.sidebarElm &&
      this.sidebarElm.removeEventListener(
        "transitionend",
        this.sidebarResizeHandler
      );

    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      this.chart = this.$echarts.init(this.$el, "macarons");
      this.chart.clear();
      this.CreatImgfun();
      this.setOptions(this.chartData);
      // this.chart.on("mouseover", function(a) {
      //   console.log("this.chart.mouseover");
      // });
      // this.chart.on("mouseout", function() {
      //   emphasis();
      // });
    },
    CreatImgfun() {
      var img = new Image();
      img.src = this.imgtest;
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.width = this.chart.getWidth() * window.devicePixelRatio;
      canvas.height = this.chart.getHeight() * window.devicePixelRatio;
      var fullImage = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        fullImage.src = canvas.toDataURL();
        setTimeout(function () {
          if (this.autoResize) {
            window.removeEventListener("resize", this.__resizeHandler);
          }
        }, 100);
      };
      this.fullImage = fullImage;
    },
    setOptions(chartData) {
      this.chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "none",
          },
          formatter: function (params) {
            return params[0].name + ": " + params[0].value;
          },
        },
        xAxis: {
          data: [
            "驯鹿",
            "火箭",
            "飞机",
            "高铁",
            "轮船",
            "汽车",
            "跑步",
            "步行",
          ],
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            color: "#e54035",
            padding: [20, 5]
          },
        },
        yAxis: {
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false },
        },
        color: ["#e54035"],
        series: [
          {
            name: "hill",
            type: "pictorialBar",
            barCategoryGap: "30%",
            symbol: `image://${this.imgtest}`,
            //symbol:'path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5C17.6,3.5,6.8,14.4,6.8,27.6c0,13.3,10.8,24.1,24.101,24.1C44.2,51.7,55,40.9,55,27.6C54.9,14.4,44.1,3.5,30.9,3.5z M36.9,35.8c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H36c0.5,0,0.9,0.4,0.9,1V35.8z M27.8,35.8 c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H27c0.5,0,0.9,0.4,0.9,1L27.8,35.8L27.8,35.8z',
            // symbolSize: ["200%", "105%"],
            // symbolPosition: "end",
           // symbolRepeat: true,
            //symbolSize: ["130%", "20%"],
            symbolSize: ["120%", "62.5%"],
            symbolOffset: [0, 10],
            symbolMargin: "-30%",
            animationDelay: function (dataIndex, params) {
              return params.index * 30;
            },
            itemStyle: {
              opacity: 1,
            },
            emphasis: {
              itemStyle: {
                opacity: 1,
              },
            },
            data: [103, 60, 25, 18, 12, 9, 2, 1],
            z: 10,
          },
        ],
      });
    },
    sidebarResizeHandler(e) {
      if (e.propertyName === "width") {
        this.__resizeHandler();
      }
    },
    //窗口改变执行方法
    resetSizefun() {
      if (this.autoResize) {
        this.__resizeHandler = debounce(() => {
          if (this.chart) {
            this.chart.resize();
          }
        }, 100);
        window.addEventListener("resize", this.__resizeHandler);
      }

      // 监听侧边栏的变化
      this.sidebarElm = document.getElementsByClassName("sidebar-container")[0];
      this.sidebarElm &&
        this.sidebarElm.addEventListener(
          "transitionend",
          this.sidebarResizeHandler
        );
    },
  },
};
</script>
<style lang="scss" scoped>
.chart {
  // border: 1px #B4C5D4 solid;
  // background: #D9E5EF;
  margin-top: vh(10);
  width: 100%;
  height: 460px;
}
</style>
