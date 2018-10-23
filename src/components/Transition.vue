<template>
  <div class="transition">
    <div class="expander" v-html="expanded?'-':'+'"></div>
    <div class="prev">{{ prev }}</div>
    <div class="route">{{ route }}</div>
    <div class="current">{{ state }}</div>
    <div class="handlerIndex">{{ handlerIndex === -1 ? '' : handlerIndex }}</div>
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

        @Prop handlerIndex = p({
            type: Number,
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

  .expander, .prev, .route {
    display: inline-block;
  }

  .prev, .route, .current, .handlerIndex {
    padding: 0 10px;
    flex: +1;
    text-align: center;
  }

  .prev, .route, .current {
    border-right: solid 1px #444;
  }

  .prev {
    color: #888;
    flex: 2
  }

  .route {
    flex: +3;
  }

  .current {
    flex: 2
  }

  .handlerIndex {
  }

</style>
