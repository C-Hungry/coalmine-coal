<style lang="less" scoped>
</style>

<template>
  <IEcharts ref="sent" style="height: 400px;" :option="option" :loading="loading" @ready="onReady" @click="onClick"></IEcharts>
</template>

<script>
import IEcharts from "vue-echarts-v3";
// import IEcharts from "vue-echarts-v3/src/lite.js";
// import 'echarts/lib/component/title';
// import 'echarts/lib/component/tooltip';
// import 'echarts/lib/component/legend';
// import "echarts/lib/chart/line";
export default {
  components: {
    IEcharts
  },
  data: () => ({
    loading: false,
    option: {
      title: {
        text: "当月完成车数统计",
        textStyle: {
          fontSize: 15
        }
      },
      color: [
        "#fe546c",
        "#fe546c",
      ],
      tooltip: {
        trigger: "axis",
        confine: true,
        formatter: "{b}<br/>完成车数：{c} 趟",
        extraCssText: "text-align: left;"
      },
      xAxis: {
        type: 'category',
        data: ['09-24', '09-25', '09-26','09-27', '09-28', '09-29', '09-30']
      },
      legend: {
        data: ["完成车数"],
        top: 40,
        x: "left"
      },
      yAxis: [
        {
          type: "value",
          axisLabel: {
            color: "#000"
          },
          axisLine: {
            lineStyle: {
              color: "#ccc"
            }
          },
          splitLine: {
            lineStyle: {
              color: "#ddd"
            }
          }
        }
      ],
      grid: {
        top: 90,
        left: "3%",
        right: "3%",
        height: 260,
        containLabel: true
      },
      dataZoom: [
        {
          type: "inside",
          startValue: 0,
          endValue: 4
        }
      ],
      series: [{
        name: "完成车数",
        data: [8, 9, 21, 34, 12, 13, 20],
        type: 'line'
      }]
    }
  }),
  methods: {
    // doRandom() {
    //   const that = this;
    //   let data = [];
    //   for (let i = 0, min = 5, max = 99; i < 6; i++) {
    //     data.push(Math.floor(Math.random() * (max + 1 - min) + min));
    //   }
    //   that.loading = !that.loading;
    //   that.bar.series[0].data = data;
    // },
    onReady(instance) {
      // console.log(instance);
    },
    onClick(event, instance, echarts) {
      console.log(arguments);
    }
  }
};
</script>