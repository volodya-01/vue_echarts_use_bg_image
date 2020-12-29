<template>
  <div class="hello">
    <div class="echartsbox">
      <div>1</div>
      <echarts1 />
    </div>
    <div class="echartsbox">
      <div>2</div>
      <echarts2 />
    </div>
    <div class="echartsbox">
      <div>3</div>
      <echarts3 />
    </div>
     <div class="echartsbox">
       <div>4</div>
      <echarts4 />
    </div>
     <div class="echartsbox">
       <div>5</div>
      <echarts5 />
    </div>
     <div class="echartsbox">
       <div>6</div>
      <echarts6 />
    </div>
      <div class="echartsbox">
        <div>7</div>
      <echarts7 />
    </div>
     <div class="echartsbox">
       <div>72</div>
      <echarts72 />
    </div>
     <div class="echartsbox">
       <div>8</div>
      <echarts8 />
    </div>
    <div class="echartsbox">
      <div>9</div>
      <echarts9 />
    </div>
     <div class="echartsbox">
       <div>10</div>
      <echarts10 />
    </div>
     <div class="echartsbox">
       <div>11</div>
      <echarts11 />
    </div>
     <div class="echartsbox">
       <div>12</div>
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
    echarts12
  },
  mounted(){
    this.WaterworksDispatchCurveData()
  },
  methods:{
   WaterworksDispatchCurveData(){
          this.$axios.post("/api/WaterworksDispatchCurveData",
          {
            headers: { "Content-Type": "application/json;" },
          }
        )
        .then((res) => {
          console.log("3.	获取调度对比曲线 WaterworksDispatchCurveData ", res);
           let ActualMaxData= res.data.ActualMaxData
            let OptimalMaxData= res.data.OptimalMaxData
           let ActualDispatchData =[]//当前
             let OptimalDispatchData=[]//调度
            //FlowData PressureData PumpCurveData
            //当前
            let Actual_Time=[]
            let Actual_FlowData=[]
            let Actual_PressureData=[]
            let Actual_PumpCurveData=[]
            let PumpNoArray=[]
            res.data.ActualDispatchData.FlowData.map(ele=>{
              Actual_Time.push(ele.Time)
              Actual_FlowData.push(ele.Data)
              }
            )
            //水泵
            res.data.ActualDispatchData.PressureData.map(ele=>{
              Actual_PressureData.push(ele.Data)
              }
            )
            /*  */
            //  res.data.ActualDispatchData.PumpCurveData.forEach(ele=>{
             
            //   ele.PumpData.map((el) => {
            //    el.Data=(el.Data+6)*60
            //   })
              
            //   }
            // )
            /*  */
             res.data.ActualDispatchData.PumpCurveData.map(ele=>{
               PumpNoArray.push(ele.PumpNo)
              let PumpData=[]
              let PumpDataNull=[]
              let Time=[]
              ele.PumpData.map((el) => {
                PumpData.push(Number(el.Data)<0?"":el.Data)
                PumpDataNull.push(Number(el.Data)<0?el.Data:"")
                Time.push(el.Time)
              })
                Actual_PumpCurveData.push({
                  PumpData,
                  Time,
                  PumpNo:ele.PumpNo,
                  PumpDataNull
                  
                })
              }
            )
            console.log("Actual_PumpCurveData",Actual_PumpCurveData)
         
                  let ActualData={Actual_FlowData,Actual_PressureData,Actual_PumpCurveData,Actual_Time}
/*  */
         Bus.$emit("WaterworksDispatchCurveDataTo", ActualData);
        })
        .catch((error) => {});
   }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.echartsbox {
  width: 60%;
  height: 760px;
  margin: 60px 220px;
}
</style>
