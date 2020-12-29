<template>
  <div class="chart"></div>
</template>
<script>
import Bus from "@/utils/bus.js";
import { debounce } from "@/utils";
export default {
  name: "echarts7",
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
    Bus.$on("WaterworksDispatchCurveDataTo", (e) => {
      //Actual_FlowData,Actual_PressureData,Actual_PumpCurveData
      console.log("传过来的数据7", e);
      let Actual_FlowData = e.Actual_FlowData,
        Actual_PressureData = e.Actual_PressureData,
        Actual_Time = e.Actual_Time;
      let colorList = [
        "#c23531",
        "#2f4554",
        "#61a0a8",
        "#d48265",
        "#91c7ae",
        "#749f83",
        "#ca8622",
        "#bda29a",
        "#6e7074",
        "#546570",
        "#c4ccd3",
      ];
      //PumpData Time PumpNo
      let gridIndexArray = [];
      let newxAxis = [];
      let newyAxis = [];
      let newgrid = [];
      let newseries = [];
      let PumpNoArray = [];
      e.Actual_PumpCurveData.map((ele, index) => {
        gridIndexArray.push(index);
        PumpNoArray.push(ele.PumpNo);
        newxAxis.push(
          index !== e.length - 1
            ? {
                type: "category",
                gridIndex: index,
                data: ele.Time,
                boundaryGap: false,
                axisLine: { lineStyle: { color: "#777" } },
                axisTick: { show: false },
                axisLabel: {
                   show: false,
                  formatter: function (value) {
                    return ""
                  },
                },
                // min: 'dataMin',
                // max: 'dataMax',
                axisPointer: {
                  show: true,
                  label: { show: false },
                },
              }
            : {
                type: "category",
                gridIndex: index,
                data: ele.Time,
                scale: true,
                boundaryGap: false,
                splitLine: { show: false },
                axisLabel: { show: false },
                axisTick: { show: false },
                axisLine: { lineStyle: { color: "#777" } },
                //  splitNumber: 20,
                // min: 'dataMin',
                // max: 'dataMax',
                axisPointer: {
                  type: "shadow",
                  label: { show: true },
                  triggerTooltip: true,
                  handle: {
                    show: true,
                    margin: 30,
                    color: "#B80C00",
                  },
                },
              }
        );
        newyAxis.push({
          scale: true,
          gridIndex: index,
          max: 1,
          min: -1,
          // splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        });
        newgrid.push({
          left: 60,
          right: 120,
          top: 55 * (index+1),
         bottom: 60,
          height: 40,
        });
        newseries.push(
          {
           // name: e.PumpNo, //PumpDataNull
            type: "line",
            symbol: "none",
            id: `series${index}`,
            data: ele.PumpData,
            xAxisIndex: index,
            yAxisIndex: index,
            itemStyle: {
              color: colorList[index],
            },
            emphasis: {
              itemStyle: {
                color: colorList[index],
              },
            },
            areaStyle: {
              normal: {
                color: colorList[index],
              },
            },
            lineStyle: {
              color: colorList[index],
              // width: 2
            },
            markLine: {
              data: [{ type: "average", name: "平均值" }],
              symbol: ["none", "none"],
              label: {
                show: true,
                formatter: `${index + 1}#`,
                distance: [20, 0],
              },
              lineStyle: {
                color: colorList[index],
                width: 0,
              },
            },
          },
          {
            //name: gridIndexArray[index],//
            type: "line",
            symbol: "none",
            data: ele.PumpDataNull,
            xAxisIndex: index,
            yAxisIndex: index,
            tooltip: { show: false },
            itemStyle: {
              color: "#000",
            },
            emphasis: {
              itemStyle: {
                color: "#000",
              },
            },
            areaStyle: {
              normal: {
                color: "#000",
              },
            },
            lineStyle: {
              color: "#000",
              // width: 2
            },
          }
        );
        /*  */
      });
      /*test  */

      newxAxis.push(
        {
          type: "category",
          gridIndex: gridIndexArray.length,
          data: Actual_Time,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#777" } },
          axisLabel: {
            formatter: function (value) {
               return value.split(":")[0]
            },
          },
          // min: 'dataMin',
          // max: 'dataMax',
          axisPointer: {
            show: true,
            label: { show: false },
          },
        },
        {
          type: "category",
          gridIndex: gridIndexArray.length + 1,
          data: Actual_Time,
          scale: true,
          boundaryGap: false,
          splitLine: { show: false },
          axisLabel: { show: false },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "#777" } },
          //  splitNumber: 20,
          // min: 'dataMin',
          // max: 'dataMax',
          axisPointer: {
            type: "shadow",
            label: { show: true },
            triggerTooltip: true,
            handle: {
              show: true,
              margin: 30,
              color: "#B80C00",
            },
          },
        }
      );
      newyAxis.push(
        {
          scale: true,
          gridIndex: gridIndexArray.length,
          // max: 1,
          // min: -1,
          // splitNumber: 2,
          axisLabel: { show: true },
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
        {
          scale: true,
          gridIndex: gridIndexArray.length + 1,
          position: "right",
          offset: 0,
          // max: 1,
          // min: -1,
          // splitNumber: 2,
          axisLabel: { show: true },
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        }
      );
      newgrid.push(
        {
          left: 60,
          right: 60,
          top: 60,
          bottom: 60,
          height: 60 * (gridIndexArray.length - 1),
        },
        {
          left: 60,
          right: 60,
          top: 60,
          bottom: 60,
          height: 60 * (gridIndexArray.length - 1),
        }
      );
      newseries.push(
        {
          name: "流量", //PumpDataNull
          type: "line",
          symbol: "none",
          id: `flow`,
          data: Actual_FlowData,
          xAxisIndex: gridIndexArray.length,
          yAxisIndex: gridIndexArray.length,
          itemStyle: {
           color:"#3399CC"// colorList[gridIndexArray.length],
          },
          emphasis: {
            itemStyle: {
              color:"#3399CC"// colorList[gridIndexArray.length],
            },
          },

          lineStyle: {
            color:"#3399CC"// colorList[gridIndexArray.length],
            // width: 2
          },
        },
        {
          name: "压力", //PumpDataNull
          type: "line",
          symbol: "none",
          id: `Pressure`,
          data: Actual_PressureData,
          xAxisIndex: gridIndexArray.length + 1,
          yAxisIndex: gridIndexArray.length + 1,
          itemStyle: {
            color: "#666699"//colorList[gridIndexArray.length + 1],
          },
          emphasis: {
            itemStyle: {
             color: "#666699"//colorList[gridIndexArray.length + 1],
            },
          },

          lineStyle: {
           color: "#666699"//colorList[gridIndexArray.length + 1],
            // width: 2
          },
        }
      );
      /* test */
      gridIndexArray.push(gridIndexArray.length, gridIndexArray.length + 1);
      PumpNoArray.push("流量", "压力");
      let Option = {
        animation: false,
        legend: {
          top: 10,
          bottom: 60,
          z: 200,
          data: PumpNoArray,
        },
        tooltip: {
          // triggerOn: "none",
          transitionDuration: 0,
          confine: true,
          bordeRadius: 4,
          borderWidth: 1,
          borderColor: "#333",
          backgroundColor: "rgba(255,255,255,0.9)", //
          //formatter: '{a}: {c1}',
          formatter: (params) => {
            console.log(params);
            //seriesId
            var res = "<div> <p> 时间：" + params[0].name + " </p> </div>";
            for (var i = 0; i < params.length; i++) {
              // //console.log(params[i].seriesId)
              // console.log(params[i].seriesId.substring(0, 6));
              // console.log(params[i].seriesId.substring(7));
              if (params[i].seriesId.substring(0, 6) === "series") {
                res += `<p>
                  ${params[i].marker}${params[i].seriesIndex / 2 + 1}#:${
                  params[i].data
                }
                  </p>`;
              } else if (params[i].seriesName === "流量") {
                res += `<p>
                  ${params[i].marker}${params[i].seriesName}:${params[i].data}
                  </p>`;
              } else if (params[i].seriesName === "压力") {
                res += `<p>
                  ${params[i].marker}${params[i].seriesName}:${params[i].data}
                  </p>`;
              }
            }
            return res;
          },
          textStyle: {
            fontSize: 12,
            color: "#333",
          },
          //   position: function (pos, params, el, elRect, size) {
          //     var obj = {
          //       top: 60,
          //     };
          //     obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 5;
          //     return obj;
          //   },
        },
        axisPointer: {
          link: [
            {
              xAxisIndex: gridIndexArray,
            },
          ],
        },

        dataZoom: [
          {
            type: "slider",
            xAxisIndex: gridIndexArray,
            realTime: false,
            start: 0,
            end: 100,
            bottom: 45,
            height: 20,
            handleIcon:
              "path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
            handleSize: "120%",
          },
          {
            type: "inside",
            xAxisIndex: gridIndexArray,
            start: 0,
            end: 100,
            bottom:45,
            height: 20,
          },
        ],
        xAxis: newxAxis,

        yAxis: newyAxis,
        grid: newgrid,
        series: newseries,
        /*  */
      };
      /*  */
      this.chartData = Option;
      this.$nextTick(() => {
        setTimeout(() => {
          this.initChart();
        }, 500);
      });
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
      this.chart.setOption(chartData);
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
  height: 760px;
}
</style>
