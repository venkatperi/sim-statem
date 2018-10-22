<template>
  <div class="transition">
    <div class="expander" v-html="expanded?'-':'+'"></div>
    <div class="state">{{ prev }}</div>
    <div class="route">{{ route }}</div>
    <div class="prev">{{ state }}</div>
  </div>
</template>

<script lang="ts">
    import { Component, p, Prop } from "av-ts";
    import Vue from "vue";

    @Component({
        name: "Transition",
    })
    export default class Transition extends Vue {
        expanded = false

        @Prop state = p({
            type: String,
            required: true
        })

        @Prop prev = p({
            type: String,
            default: 'initial'
        })

        @Prop data = p({
            type: Object,
            default: undefined
        })

        @Prop event = p({
            type: Object,
            default: undefined
        })

        @Prop route = p({
            type: String,
            required: true
        })

    }
</script>

<style scoped lang="scss">

  .transition {
    background: #353535;
    color: #eee;
    line-height: 30px;
    padding: 0 10px;
    display: flex;
    border-bottom: solid 1px #545454;
  }

  .expander {
    color: #aaa;
    font-size: 18px;
  }

  .expander, .state, .route {
    display: inline-block;
  }

  .state, .route, .prev {
    padding: 0 10px;
    flex: +1;
  }

  .state, .route {
    border-right: solid 1px #444;
  }

  .state {
    text-align: right;
    color: #888;
  }

  .route {
    text-align: center;
    flex: +2;
  }

  .prev {
    text-align: left;
  }

</style>
