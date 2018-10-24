<template>
  <div class="app">
    <div class="row">
      <div class="col">
        <div class="app-controls">
          <span class="icon">
            <font-awesome-icon icon="file" size="1x" />
          </span>
          <span class="icon">
            <font-awesome-icon icon="save" size="1x" />
          </span>
        </div>
        <span class="name">{{ name }}</span>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div class="header">
          <label>State Machine Rules</label>
          <span class="icons">
            <span class="icon" @click="addHandler">
              <font-awesome-icon icon="plus" size="sm" />
            </span>
          </span>
        </div>
        <div class="handlers list-group" id="handlers" ref="handlers">
          <Handler
            v-for="h in sortedHandlers"
            :key="h.id"
            :index="h.index"
            :odd="h.index%2 === 1"
            v-on:remove="removeHandler(h.index)"
            v-model="h.handler"></Handler>
        </div>
      </div>
      <div class="col">

        <div class="header">Initial State</div>
        <VueCodeMirror
          v-model="initialState"
          name="initialData"
          mode="javascript"
          theme="midnight"
          :lineNumbers="true"
        />

        <div class="header">Initial Data</div>
        <VueCodeMirror
          v-model="initialData"
          name="initialData"
          mode="javascript"
          theme="midnight"
          :lineNumbers="true"
        />

        <div class="header">Events</div>
        <VueCodeMirror
          v-model="events"
          mode="javascript"
          theme="midnight"
          :lineNumbers="true"
          name="events"
          :readOnly="processing"
        />

        <div class="controls">
          <button v-on:click="run()">Run</button>
        </div>

        <div class="header">State Transitions</div>
        <div id="transitions">
          <Transition
            class="transition"
            v-for="(t, index) in transitions"
            :key="index"
            :state="t.state"
            :prev="t.prev"
            :event="t.event"
            :handlerIndex="t.handlerIndex"
            :route="t.event?t.event.toRoute(t.prev || ''):'<initial>'"
          ></Transition>
        </div>
      </div>
    </div>

    <VueTerm
      class="xterm"
      @input="onInput"
      :value="result"
      :pending="cmdPending"
      prompt="> "
    />
  </div>
</template>

<script lang="ts">

    import { Component, Lifecycle } from "av-ts";
    import { Event, State } from "gen-statem";
    import { SortableEvent } from "sortablejs";
    import { ITypedWorker } from "typed-web-workers";
    import Vue from 'vue';
    import VueResizeOnEvent from '../../../vue-resize-on-event/src/VueResizeOnEvent'
    import VueTerm from '../../../vue-term/src'
    import { SmSim } from "../SmSim";
    import { HandlerType, SmData, StateTransition, VmData } from "../types";
    import Handler from './Handler.vue';
    import Transition from "./Transition";
    import VueCodeMirror from './VueCodeMirror.vue'

    const Sortable = require('sortablejs')
    const uniqid = require('uniqid')
    const store = require('store')


    @Component({
        name: 'App',
        components: {
            Transition,
            Handler,
            VueCodeMirror,
            VueTerm,
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

        result = ''

        cmdPending = false

        sim = new SmSim()

        events = 'cast(\'flip\')'

        initialData = '{}'

        initialState = '\'off\''

        output = ''

        transitions: Array<StateTransition> = []

        counter = 1

        name = 'Untitled'

        command = ''

        processing = false

        worker?: ITypedWorker<VmData, any>

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
            this.sim.stateHandler = (state: State, prev: State, data: any, event: Event, handlerIndex: number) => {
                this.transitions.push({state, prev, data, event, handlerIndex})
            }
            this.initSim()
        }

        get sortedHandlers() {
            return this.handlers.sort((a, b) => a.index - b.index)
        }

        get handlerCode() {
            return '['
                + this.sortedHandlers.map(x => x.handler).join(',')
                + ']'
        }

        onInput(line: string) {
            let result = ''
            if (line.length != 0) {
                switch (line) {
                    case 'clear':
                        this.transitions = []
                        break;
                    default:
                        try {
                            result = this.sim.exec(line)
                        }
                        catch (e) {
                            result = e.message
                        }
                }
            }
            this.$emit('result', result)
        }

        load(name: string) {
            this.fromObject(store.get(`sm-${name}`))
        }

        save(n?: string) {
            let name = n || this.name
            store.set(`sm-${name}`, this.toObject())
        }

        fromObject(obj: SmData) {
            this.handlers = obj.handlers
            this.initialState = obj.initialState
            this.initialData = obj.initialData
            this.events = obj.events
        }

        toObject(): SmData {
            return {
                handlers: this.handlers,
                initialState: this.initialState,
                initialData: this.initialData,
                events: this.events
            }
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
                handler: '[\'cast#*_#*_\', () => keepState()]',
            })
        }

        reset() {
            this.counter = 0
            this.output = ''
            this.transitions = []
        }

        initSim() {
            this.sim.init(this.toObject())
        }

        run() {
            // this.initSim()
        }


    }
</script>

<style lang="scss" scoped>

  @import '../styles/theme';

  .app {
    padding: 0 15px;
    position: relative;
  }

  .events, .initialData, .output {
    width: 100%;
    resize: none;
    background-color: $code_bg;
    color: $text_color;
    border: solid 1px $bg_color;
    border-top: solid 4px $bg_color;
    border-top-left-radius: 15px;
    padding: 10px 20px;
    &:focus {
      border: solid 1px $highlight_color;
      border-top: solid 4px $highlight_color;
      box-shadow: inset 0 0 15px $highlight_color;
    }
  }

  .initialData {
    margin-bottom: 10px;
  }

  #transitions {
    background-color: $code_bg;
    min-height: 75px;
    width: 100%;
    color: $text_color;
  }

  .transition {
  }

  .header {
    font-family: $display_font;
    font-size: 16px;
    font-weight: 400;
    text-transform: uppercase;
    color: lighten($text_color, 20%);
    width: 100%;
    background: $heading_bg;
    height: 40px;
    line-height: 40px;
    padding: 0 20px;
    margin: 0;
    border-bottom: solid 1px $dark;
    .icons {
      float: right;
      font-size: 0.8rem;
      line-height: 40px;
      .icon {
        color: $text_color;
        &:hover {
          color: $lighter;
        }
      }
    }
  }

  button {
    font-size: 18px;
    padding: 5px 15px;
    margin: 10px 0 15px;
    color: #555;
  }

  .handlers {
    border-radius: 0;
  }

  .xterm {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    padding: 20px 0;
    background: $code_bg;
  }

</style>

<style lang="scss">
  @import '../styles/theme';

  .cm-s-initialData, .cm-s-events {
    font-family: $code_font, monospace;
    font-weight: 300;
    font-size: 16px;
    height: auto;
    margin-bottom: 20px;
  }

</style>
