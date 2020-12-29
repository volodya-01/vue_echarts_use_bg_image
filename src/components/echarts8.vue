<template>
  <div class="chart"></div>
</template>
<script>
import Bus from "@/utils/bus.js";
import { debounce } from "@/utils";
export default {
  name: "echarts8",
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
      this.setOptions(this.chartData);
      this.chart.on("click", function (a) {
        alert(a);
        console.log("this.chart.mouseover");
      });
      // this.chart.on("mouseover", function(a) {
      //   console.log("this.chart.mouseover");
      // });
      // this.chart.on("mouseout", function() {
      //   emphasis();
      // });
    },

    setOptions(chartData) {
      this.chart.setOption({
        tooltip: {
          trigger: "axis",
          // axisPointer: {
          //   type: "cross",
          //   label: {
          //     backgroundColor: "#6a7985",
          //   },
          // },
        },

        xAxis: {
          type: "value",
          axisLine: {
            show: false,
          },

          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },

          splitLine: {
            show: false,
          },
        },
        yAxis: [
          {
            type: "category",
            data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            axisLine: {
              show: false,
            },

            axisTick: {
              show: false,
            },
          },
          {
            type: "category",
            data: ["10", "20", "30", "40", "50", "60", "70"],
            position: "right",
            offset: 20,
            axisLine: {
              show: false,
            },

            axisTick: {
              show: false,
            },

            axisLabel: {
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            type: "bar",
            showBackground: true,
            backgroundStyle: {
              color: "#0D2541",
            },
            barWidth: 20,
            //barCategoryGap: '40%',
            itemStyle: {
              color: "#76DCF9",
              opacity: 1,
            },
            emphasis: {
              itemStyle: {
                // color: "#7a7ab9",
                opacity: 1,
              },
            },
            data: [
              120,
              {
                value: 200,
                itemStyle: {
                  color: "#DA2F2F",
                },
              },
              150,
              80,
              70,
              110,
              130,
            ],
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
  margin-top: 10px;
  width: 100%;
  height: 460px;
}
</style>
