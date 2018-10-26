<template>
  <div class="transitions">
    <div class="row header">
      <div class="index">#</div>
      <div class="prev">From</div>
      <div class="route">Route</div>
      <div class="current">To</div>
      <div class="handlerIndex">Handler</div>
    </div>
    <div :class="['row', index%2?'odd':'even']"
      v-for="(t, index) in sortedTransitions"
      :key="index">
      <div class="index"v-html="sortedTransitions.length - index"></div>
      <div class="prev" v-html="t.state"></div>
      <div class="route" v-html="t.event?t.event.toRoute(t.prev || ''):'<initial>'"></div>
      <div class="current" v-html="t.state"></div>
      <div class="handlerIndex"
        v-html="t.handlerIndex === -1 ? '' : t.handlerIndex">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
    import { Component, p, Prop } from "av-ts";
    import Vue from "vue";

    @Component({
        name: "Transition",
    })
    export default class Transition extends Vue {
        @Prop transitions = p({
            type: Array,
        })

        get sortedTransitions() {
            let t = this.transitions as Array<Transition>
            return [...t].reverse()
        }
    }
</script>

<style scoped lang="scss">

  @import '../styles/theme';

  .transitions {
    width: 100%;
    display: table;
    font-weight: 200;
    font-size: 14px;
  }

  .row {
    width: 100%;
    font-family: $code_font;
    background: $code_bg;
    color: $neutral;
    line-height: 30px;
    padding: 0 10px;
    display: table-row;
    justify-content: center;
    &.header {
      font-family: $display_font;
      background: lighten($code_bg, 5%);
      text-transform: uppercase;
    }
    &.even{
      background: darken($code_bg, 10%);
    }
  }

  .index, .prev, .route, .current, .handlerIndex {
    display: table-cell;
    padding: 0 10px;
    flex: 1;
    text-align: center;
    border-bottom: solid 1px $dark;
  }

  .index, .prev, .route, .current {
    border-right: solid 1px $dark;
  }

</style>
