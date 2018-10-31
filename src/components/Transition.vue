<template>
  <div class="transitions">
    <div class="row header">
      <div class="index">#</div>
      <div class="prev">From</div>
      <div class="current">To</div>
      <div class="route">Event & Route</div>
      <div class="handlerIndex">RULE</div>
    </div>
    <div :class="['row', index%2?'odd':'even']"
         v-for="(t, index) in sortedTransitions"
         :key="index">
      <div class="index" v-html="sortedTransitions.length - index"></div>
      <div class="prev" v-html="stateRoute(t.prev) || 'x'"></div>
      <div class="current" v-html="stateRoute(t.state)"></div>
      <div class="route"
           v-html="t.event?t.event.toRoute(t.prev || ''):'<initial>'"></div>
      <div class="handlerIndex"
           v-html="t.handlerIndex === -1 ? '*' : t.handlerIndex"></div>
    </div>
  </div>
</template>

<script lang="ts">
    import { Component, p, Prop } from "av-ts";
    import { State, stateRoute } from "gen-statem/dist/src/State";
    import Vue from "vue";
    import { StateTransition } from "../types";


    @Component({
        name: "Transition",
    })
    export default class Transition extends Vue {
        @Prop transitions = p({
            type: Array,
        })

        get sortedTransitions(): StateTransition[] {
            let t = this.transitions as Array<StateTransition>
            return [...(t.filter(x => !!x.event))].reverse()
        }

        stateRoute(s: State): string {
            return stateRoute(s)
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

  .list {
    width: 100%;
  }

  .row {
    width: 100%;
    max-width: 100%;
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
    &.even {
      background: darken($code_bg, 10%);
    }
  }

  .index, .prev, .route, .current, .handlerIndex {
    display: table-cell;
    padding: 0 5px;
    text-align: center;
    border-bottom: solid 1px $dark;
  }

  .index, .prev, .route, .current {
    border-right: solid 1px $dark;
  }

  .prev, .current {
    width: 25%;
  }

  .route {
    overflow-wrap: break-word;
    -webkit-hyphens: auto;
    -moz-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
    word-break: break-word;
  }

</style>
