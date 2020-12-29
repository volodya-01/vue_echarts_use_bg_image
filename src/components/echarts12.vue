<template>
  <div class="chart"></div>
</template>
<script>
import Bus from "@/utils/bus.js";
import { debounce } from "@/utils";
export default {
  name: "echarts11",
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
    var color1 = new this.$echarts.graphic.LinearGradient(
      0,
      1,
      0,
      0,
      [
        { offset: 0, color: "#38a0d6" },
        { offset: 1, color: "#6dcde6" },
      ],
      false
    );
    var color2 = new this.$echarts.graphic.LinearGradient(
      0,
      1,
      0,
      0,
      [
        { offset: 0, color: "#4366f3" },
        { offset: 1, color: "#1d43f3" },
      ],
      false
    );
    var color3 = new this.$echarts.graphic.LinearGradient(
      0,
      1,
      0,
      0,
      [
        { offset: 0, color: "#4721ca" },
        { offset: 1, color: "#8651f4" },
      ],
      false
    );
    var color4 = new this.$echarts.graphic.LinearGradient(
      0,
      1,
      0,
      0,
      [
        { offset: 0, color: "#9837dd" },
        { offset: 1, color: "#e23af5" },
      ],
      false
    );
    var color5 = new this.$echarts.graphic.LinearGradient(
      0,
      1,
      0,
      0,
      [
        { offset: 0, color: "#ff934c" },
        { offset: 1, color: "#fc686f" },
      ],
      false
    );

    var option = {
      color: [color1, color2, color3, color4, color5], //控制主要渐变色用
      color2: ["#38a0d6", "#4366f3", "#4721ca", "#9837dd", "#ff934c"], //背景色不需要渐变，后面改透明度即可
      tooltip: { axisPointer: { type: "shadow" } },
      xAxis: { type: "category", axisLabel: { margin: 20 }, data: [] },
      yAxis: { type: "value", axisLabel: { margin: 20 } },
      grid: { top: "3%", left: "7%", right: "7%" },
      series: [
        {
          name: "标签",
          type: "pictorialBar",
          symbol: "rect",
          symbolSize: ["50", "100%"],
          data: [],
          z: 2,
          symbolOffset: ["0", "-15"],
        },
        {
          name: "b",
          stack: "amount",
          tooltip: { show: false },
          type: "pictorialBar",
          symbol: "diamond",
          symbolSize: ["50", "30"],
          symbolOffset: ["0", "-29"],
          symbolPosition: "end",
          data: [],
          z: 3,
        },
        {
          name: "c",
          stack: "amount",
          tooltip: { show: false },
          type: "pictorialBar",
          symbol: "diamond",
          symbolSize: ["50", "30"],
          symbolPosition: "start",
          data: [],
          z: 3,
        },
        {
          name: "d",
          tooltip: { show: false },
          type: "pictorialBar",
          symbol: "rect",
          symbolSize: ["50", "100%"],
          data: [],
          z: 0,
          symbolOffset: ["0", "-15"],
        },
        {
          name: "e",
          stack: "amount",
          tooltip: { show: false },
          type: "pictorialBar",
          symbol: "diamond",
          symbolSize: ["50", "30"],
          symbolOffset: ["0", "-28.4"],
          symbolPosition: "end",
          data: [],
          z: 0,
        },
        {
          name: "f",
          stack: "amount",
          tooltip: { show: false },
          type: "pictorialBar",
          symbol: "triangle",
          symbolSize: ["50", "15"],
          symbolOffset: ["0", "-28.4"],
          symbolPosition: "end",
          data: [],
          z: 0,
        },
      ],
    };
    //假数据如下开始
    option.series[0].name = "数量";
    var data = [
      { name: "周一", value: 280, maxvalue: 1000 },
      { name: "周二", value: 1000, maxvalue: 1000 },
      { name: "周三", value: 560, maxvalue: 1000 },
      { name: "周四", value: 400, maxvalue: 1000 },
      { name: "周五", value: 800, maxvalue: 1000 },
    ];
    for (var i = 0; i < data.length; i++) {
      option.xAxis.data.push(data[i].name);
      option.series[0].data.push({
        value: data[i].value,
        itemStyle: { color: option.color[4] },
        animation: false,
      });
      option.series[0].data.push({
        value: data[i].value + 4.5,
        itemStyle: { color: option.color[4] },
        animation: false,
      });
      option.series[2].data.push({
        value: 4.5,
        itemStyle: { color: option.color2[i % option.color2.length] },
        animation: false,
      });
      option.series[3].data.push({
        value: data[i].maxvalue,
        itemStyle: {
          color: "#ff934c",
          opacity: 0.3,
        },
        emphasis: {
          itemStyle: { color: "#ff934c" },
        },
        animation: false,
      });
      option.series[4].data.push({
        value: data[i].maxvalue + 4.5,
        itemStyle: {
          color: "#ff934c",
          opacity: 0.3,
        },
        emphasis: {
          itemStyle: { color: "#ff934c" },
        },
        animation: false,
      });
      option.series[5].data.push({
        value: data[i].maxvalue + 4.5,
        itemStyle: {
          color: "#ff934c",
          opacity: 0.3,
        },
        emphasis: {
          itemStyle: { color: "#ff934c" },
        },
        animation: false,
      });
    }
    let a = { option, Theme: "halloween" };
    this.chartData = a;
    //初始化echarts
    // var mychart = echarts.init(document.getElementById('chart1'),"halloween"); //halloween是我的theme，根据你们的需要可以不写
    // mychart.setOption(option);
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
    func(x) {
      x /= 10;
      return Math.sin(x) * Math.cos(x * 2 + 1) * Math.sin(x * 3 + 2) * 50;
    },
    generateData() {
      let data = [];
      for (let i = -200; i <= 200; i += 0.1) {
        data.push([i, this.func(i)]);
      }
      return data;
    },
    /* *********** */
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
      this.chart.setOption(chartData.option);
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
