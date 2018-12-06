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
// import "echarts/lib/chart/pie";
export default {
  components: {
    IEcharts
  },
  data: () => ({
    loading: false,
    option: {
      title: {
        text: "今日运输煤种统计",
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: "item",
        confine: true,
        formatter: "{b}<br/>数量：{c}吨<br/>占比：{d}%",
        extraCssText: "text-align: left;"
      },
      color: ["#4bcc61", "#fe546c", "#ffc24d", "#eeeeee"],
      legend: {
        top: 40,
        itemWidth: 15,
        x: "left",
        data: ["精煤", "中煤", "劣煤"]
      },
      series: [
        {
          name: "煤种运输",
          type: "pie",
          radius: ["37%", "50%"],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false,
              position: "center"
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: "14",
                fontWeight: "bold"
              }
            }
          },
          data: [
            { value: 20000, name: "精煤" },
            { value: 25300, name: "中煤" },
            { value: 15000, name: "劣煤" }
          ]
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