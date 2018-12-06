<style lang="less" scoped>
</style>

<template>
  <IEcharts ref="sent" style="height: 380px;" :option="option" :loading="loading" @ready="onReady" @click="onClick"></IEcharts>
</template>

<script>
import IEcharts from "vue-echarts-v3";
// import IEcharts from "vue-echarts-v3/src/lite.js";
// import 'echarts/lib/component/title';
// import 'echarts/lib/component/tooltip';
// import 'echarts/lib/component/legend';
// import 'echarts/lib/component/dataZoom';
// import "echarts/lib/chart/bar";
export default {
  components: {
    IEcharts
  },
  data: () => ({
    loading: false,
    option: {
      title: {
        text: "调拨单完成情况",
        textStyle: {
          fontSize: 15
        }
      },
      tooltip: {
        trigger: "axis",
        confine: true,
        extraCssText: "text-align: left;",
        formatter: function(params) {
          let str = "";
          str = `${params[0].name}<br/>
            调拨总量：${params[0].value + params[1].value} 吨<br/>
            已完成量：${params[0].value} 吨<br/>
            未完成量：${params[1].value} 吨`
          return str;
        }
      },
      color: [
        "#5BB9ED",
        "#5BB9ED",
      ],
      legend: {
        selectedMode: false,
        itemWidth: 14,
        data: ["已完成"],
        x: "left",
        y: "36px"
      },
      calculable: true,
      xAxis: [
        {
          type: "category",
          data: ["调拨单01","调拨单02","调拨单03","调拨单04"],
          axisLabel: {
            color: "#000"
          },
          axisLine: {
            lineStyle: {
              color: "#ccc"
            }
          }
        }
      ],
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
      series: [
        {
          name: "已完成",
          type: "bar",
          stack: "已完成",
          barMaxWidth: 40,
          data: [20000,30000,80000,50000]
        },
        {
          name: "未完成",
          type: "bar",
          stack: "已完成",
          barMaxWidth: 40,
          itemStyle: {
            normal: {
              opacity: 0.3
            }
          },
          data: [6000,30000,8000,10000]
        }
      ]
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