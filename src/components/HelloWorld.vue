<template>
  <div class="hello">
    <div class="echartsbox">
      <div class="echartsbox_Title">1.填充图片背景1</div>
      <echarts1 />
    </div>
    <div class="echartsbox">
     <div class="echartsbox_Title">2.填充图片背景2</div>
      <echarts2 />
    </div>
    <div class="echartsbox">
  <div class="echartsbox_Title">3.填充图片背景3</div>
      <echarts3 />
    </div>
    <div class="echartsbox">
     <div class="echartsbox_Title">4.柱状图每个柱子单独设置颜色</div>
      <echarts4 />
    </div>
    <div class="echartsbox">
       <div class="echartsbox_Title">5.多坐标系联动1</div>
      <echarts5 />
    </div>
    <div class="echartsbox">
     <div class="echartsbox_Title">6.多坐标系联动2</div>
      <echarts6 />
    </div>
    <div class="echartsbox">
       <div class="echartsbox_Title">7.水泵流量压力曲线</div>
      <echarts7 />
    </div>
    <div class="echartsbox">
      <div class="echartsbox_Title">72.水泵曲线</div>
      <echarts72 />
    </div>
    <div class="echartsbox">
       <div class="echartsbox_Title">8.柱状图左右都有标签</div>
      <echarts8 />
    </div>
    <div class="echartsbox">
         <div class="echartsbox_Title">9.象形图</div>
      <echarts9 />
    </div>
    <div class="echartsbox">
          <div class="echartsbox_Title">10.网格线</div>
      <echarts10 />
    </div>
    <div class="echartsbox">
       <div class="echartsbox_Title">11.组合立体柱状图</div>
      <echarts11 />
    </div>
    <div class="echartsbox">
       <div class="echartsbox_Title">12.组合立体柱状图</div>
      <echarts12 />
    </div>
  </div>
</template>

<script>
import Bus from "@/utils/bus.js";
import echarts1 from "./echarts1";
import echarts2 from "./echarts2";
import echarts3 from "./echarts3";
import echarts4 from "./echarts4";
import echarts5 from "./echarts5";
import echarts6 from "./echarts6";
import echarts7 from "./echarts7";
import echarts72 from "./echarts72";
import echarts8 from "./echarts8";
import echarts9 from "./echarts9";
import echarts10 from "./echarts10";
import echarts11 from "./echarts11";
import echarts12 from "./echarts12";

export default {
  name: "HelloWorld",
  components: {
    echarts1,
    echarts2,
    echarts3,
    echarts4,
    echarts5,
    echarts6,
    echarts7,
    echarts72,
    echarts8,
    echarts9,
    echarts10,
    echarts11,
    echarts12,
  },
  mounted() {
    this.WaterworksDispatchCurveData();
  },
  methods: {
    WaterworksDispatchCurveData() {
      this.$axios
        .post("/api/WaterworksDispatchCurveData", {
          headers: { "Content-Type": "application/json;" },
        })
        .then((res) => {
          console.log("3.	获取调度对比曲线 WaterworksDispatchCurveData ", res);
          let ActualMaxData = res.data.ActualMaxData;
          let OptimalMaxData = res.data.OptimalMaxData;
          let ActualDispatchData = []; //当前
          let OptimalDispatchData = []; //调度
          //FlowData PressureData PumpCurveData
          //当前
          let Actual_Time = [];
          let Actual_FlowData = [];
          let Actual_PressureData = [];
          let Actual_PumpCurveData = [];
          let PumpNoArray = [];
          res.data.ActualDispatchData.FlowData.map((ele) => {
            Actual_Time.push(ele.Time);
            Actual_FlowData.push(ele.Data);
          });
          //水泵
          res.data.ActualDispatchData.PressureData.map((ele) => {
            Actual_PressureData.push(ele.Data);
          });
          /*  */
          //  res.data.ActualDispatchData.PumpCurveData.forEach(ele=>{

          //   ele.PumpData.map((el) => {
          //    el.Data=(el.Data+6)*60
          //   })

          //   }
          // )
          /*  */
          res.data.ActualDispatchData.PumpCurveData.map((ele) => {
            PumpNoArray.push(ele.PumpNo);
            let PumpData = [];
            let PumpDataNull = [];
            let Time = [];
            ele.PumpData.map((el) => {
              PumpData.push(Number(el.Data) < 0 ? "" : el.Data);
              PumpDataNull.push(Number(el.Data) < 0 ? el.Data : "");
              Time.push(el.Time);
            });
            Actual_PumpCurveData.push({
              PumpData,
              Time,
              PumpNo: ele.PumpNo,
              PumpDataNull,
            });
          });
          console.log("Actual_PumpCurveData", Actual_PumpCurveData);

          let ActualData = {
            Actual_FlowData,
            Actual_PressureData,
            Actual_PumpCurveData,
            Actual_Time,
          };
          /*  */
          Bus.$emit("WaterworksDispatchCurveDataTo", ActualData);
        })
        .catch((error) => {});
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.echartsbox {
  width: 60%;
  height: 760px;
  margin: 60px 220px;
  .echartsbox_Title {
    font: bold 24px "微软雅黑";
    padding: 20px 0;
    width: 100%;
    text-align: start;
  }
}
</style>
