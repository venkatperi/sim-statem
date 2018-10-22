<template>
  <div class="app">
    <div class="row">
      <div class="col">
        <label for="handlers">State Machine Rules</label>
        <div class="handlers list-group" id="handlers" ref="handlers">
          <Handler class="handler"
            v-for="h in sortedHandlers"
            :key="h.id"
            :index="h.index"
            :odd="h.index%2 === 1"
            v-on:remove="removeHandler(h.index)"
            v-model="h.handler"></Handler>
        </div>
        <button v-on:click="addHandler()">+</button>
      </div>
      <div class="col">

        <label for="initialData">Initial Data</label>
        <textarea
          v-model="initialData"
          id="initialData"
          placeholder="Initial Data"
          v-resize-on-value
          v-resize-on-input
          :class="['initialData' ]">
        </textarea>

        <label for="events">Events</label>
        <textarea
          v-model="events"
          id="events"
          placeholder="Events"
          v-resize-on-value
          v-resize-on-input
          :class="['events' ]">
        </textarea>

        <div class="controls">
          <button v-on:click="run()">Run</button>
        </div>

        <label for="transitions">State Transitions</label>
        <div id="transitions">
          <Transition
            class="transition"
            v-for="(t, index) in transitions"
            :key="index"
            :state="t.state"
            :prev="t.prev"
            :event="t.event"
            :route="t.event?t.event.toRoute(t.prev || t.state):'<initial>'"
          ></Transition>
        </div>


      </div>
    </div>
  </div>
</template>

<script lang="ts">
    import { Component, Lifecycle } from "av-ts";
    import { Event, State } from "gen-statem";
    import { SortableEvent } from "sortablejs";
    import Vue from 'vue';
    import VueResizeOnEvent from '../../../vue-resize-on-event/src/VueResizeOnEvent'
    import sm from '../templates/sm'
    import { HandlerType, StateTransition } from "../types";
    import Handler from './Handler.vue';
    import Transition from "./Transition";

    const vm = require('vm')
    const Sortable = require('sortablejs')
    const genStatem = require('gen-statem')
    const uniqid = require('uniqid')

    @Component({
        name: 'App',
        components: {
            Transition,
            Handler
        },
        directives: {
            ...VueResizeOnEvent('value'),
            ...VueResizeOnEvent('input'),
        }
    })
    export default class App extends Vue {
        handlers: Array<HandlerType> = [
            {
                id: uniqid(),
                index: 0,
                handler: '[\'cast#flip#off\', \'on\']',
            },
            {
                id: uniqid(),
                index: 1,
                handler: '[\'cast#flip#on\', \'off\']',
            },
        ]

        events = 'cast(\'flip\')'

        initialData = '{}'

        initialState = 'off'

        output = ''

        transitions: Array<StateTransition> = []

        counter = 1

        $refs!: { handlers: HTMLElement }

        @Lifecycle mounted() {
            new Sortable(this.$refs.handlers, {
                onEnd: (e: SortableEvent) => {
                    let a = this.handlers.find(x => x.index === e.oldIndex)
                    let b = this.handlers.find(x => x.index === e.newIndex)
                    if (a && b) {
                        let x = a.index
                        a.index = b.index
                        b.index = x
                    }
                },
            })
        }

        get sortedHandlers() {
            return this.handlers.sort((a, b) => a.index - b.index)
        }

        get handlerCode() {
            return '['
                + this.sortedHandlers.map(x => x.handler).join(',')
                + ']'
        }

        removeHandler(index: number) {
            this.handlers.splice(index, 1)
            this.reindex()
        }

        reindex() {
            this.handlers.forEach((h, i) => h.index = i)
        }

        addHandler() {
            this.handlers.push({
                id: uniqid(),
                index: this.handlers.length,
                handler: '[\'cast#*_#*_\', \'<state>\']',
            })
        }

        reset() {
            this.counter = 0
            this.output = ''
            this.transitions = []
        }

        run() {
            const code = sm({
                handlers: this.handlerCode,
                initialData: this.initialData,
                initialState: this.initialState,
                events: this.events,
            })

            this.reset()

            vm.runInThisContext(code)({
                genStatem,

                onState: (state: State, prev: State, data: any, event: Event) => {
                    this.transitions.push({state, prev, data, event})
                },

            })
        }
    }
</script>

<style lang="scss" scoped>

  .events, .initialData, .output {
    width: 100%;
    resize: none;
    background-color: #272822;
    color: #F8F8F2;
    border: none;
    border-radius: 0;
    padding: 10px 20px;
  }

  .initialData {
    margin-bottom: 10px;
  }

  #transitions {
    background-color: #272822;
    min-height: 75px;
    width: 100%;
  }

  .transition {
  }

  label {
    width: 100%;
    background: #444;
    display: block;
    height: 34px;
    line-height: 34px;
    padding: 0 20px;
    color: #ccc;
    margin: 0;
    font-size: 18px;
    border-bottom: solid 1px #888;
  }

  .controls {
  }

  button {
    font-size: 18px;
    padding: 5px 15px;
    margin: 10px 0 15px;
  }


</style>
