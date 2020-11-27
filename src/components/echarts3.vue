<template>
  <div class="chart"></div>
</template>
<script>
import Bus from "@/utils/bus.js";
import { debounce } from "@/utils";
export default {
  name: "echarts3",
  data() {
    return {
      autoResize: {
        type: Boolean,
        default: true,
      },
      chart: null,
      sidebarElm: null,
      chartData: {},
      imgtest: require("../assets/test2.jpg"),
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
      var img2 = new Image();
      img2.src = this.imgtest;
       img2.width = "100%";
      img2.height = "460px";
      this.fullImage = img2;
    },
    setOptions(chartData) {
      this.chart.setOption({
        grid: {
          left: "3%",
          right: "4%",
          bottom: "5%",
          containLabel: false,
          show: true,
          backgroundColor: {
            type: "pattern",
            repeat: "repeat",
            image: this.fullImage
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },

        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },

        xAxis: [
          {
            boundaryGap: false,
            data: ["1", "2", "3", "4", "5", "6", "7"],
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            max: 660,
            // min: -300,
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              formatter: function (value, index) {
                console.log("value, index", value, index);

                return value - 300;
              },
            },
          },
        ],
        series: [
          {
            name: "液位",
            type: "line",
            symbol: "none",
            lineStyle: {
              color: "blue",
              opacity: 1,
              width: 2,
            },
            data: [400, 400, 400, 400, 400, 400, 400],
            zlevel: 10,
          },

          {
            name: "管道",
            type: "line",
            symbol: "none",
            lineStyle: {
              color: "#7a7ab9",
              opacity: 1,
              width: 2,
            },
            data: [60, 60, 60, 60, 60, 60, 60],
            zlevel: 4,
          },

          {
            name: "水井1",
            type: "bar",
            barWidth: 20,
            barGap: "-100%",
            //barCategoryGap: '40%',
            itemStyle: {
              color: "#7a7ab9",
              opacity: 1,
            },
            emphasis: {
              itemStyle: {
                color: "#7a7ab9",
                opacity: 1,
              },
            },
            data: ["", 488, 488, 488, 488, 488, ""],
            zlevel: 16,
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
