<template>
  <div class="app">
    <div>
      <b-modal id="load" title="Load State Machine" v-model="showLoad">
        <MultiSelect @select="load" :options="savedFileNames()"></MultiSelect>
      </b-modal>
    </div>


    <div class="row">
      <div class="col">
        <div class="app-controls">
          <div class="icons">
          <span class="icon" @click="create()">
            <v-icon name="regular/file" scale="1.4" />
          </span>
            <span :class="['icon', dirty?'dirty':'']" @click="save()">
            <v-icon name="save" scale="1.5" />
          </span>
            <span class="icon" v-b-modal.load>
            <v-icon name="file" scale="1.3" />
          </span>
          </div>
          <LabelEdit
            class="name"
            type="text"
            placeholder="Name..."
            v-model="name" />
        </div>
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
            v-model="h.handler" />
        </div>
      </div>
      <div class="col">

        <b-tabs>
          <b-tab title="Initial State" active>
            <VueCodeMirror
              v-model="initialState"
              name="initialData"
              mode="javascript"
              theme="midnight"
              :lineNumbers="true" />
          </b-tab>
          <b-tab title="Current State">
            <VueCodeMirror
              v-model="currentState"
              name="currentState"
              mode="javascript"
              theme="midnight"
              :lineNumbers="true" />
          </b-tab>
        </b-tabs>

        <b-tabs>
          <b-tab title="Initial Data" active>
            <VueCodeMirror
              v-model="initialData"
              name="initialData"
              mode="javascript"
              theme="midnight"
              :lineNumbers="true" />
          </b-tab>
          <b-tab title="Current Data">
            <VueCodeMirror
              v-model="currentData"
              name="currentData"
              mode="javascript"
              theme="midnight"
              :lineNumbers="true" />
          </b-tab>
        </b-tabs>

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
            :route="t.event?t.event.toRoute(t.prev || ''):'<initial>'" />
        </div>
      </div>
    </div>

    <div class="repl-outer">
      <div class="header">REPL</div>
      <div class="repl-inner">
        <VueTerm
          class="repl"
          @input="onInput"
          :value="result"
          :pending="cmdPending"
          prompt="> " />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
    import { Component, Lifecycle, Watch } from "av-ts";
    import BButton from 'bootstrap-vue/src/components/button/button'
    import BModal from 'bootstrap-vue/src/components/modal/modal'
    import BTab from 'bootstrap-vue/src/components/tabs/tab'
    import BTabs from 'bootstrap-vue/src/components/tabs/tabs'
    import BModalDirective from 'bootstrap-vue/src/directives/modal/modal'
    import { Event, State } from "gen-statem";
    import { stateRoute } from "gen-statem/dist/src/State";
    import { SortableEvent } from "sortablejs";
    import * as store from 'store'
    import Vue from 'vue';
    import MultiSelect from 'vue-multiselect'
    import LabelEdit from '../../../label-edit/src/LabelEdit.vue'
    import VueResizeOnEvent from '../../../vue-resize-on-event/src/VueResizeOnEvent'
    import { SmSim } from "../SmSim";
    import { HandlerType, SmData, StateTransition } from "../types";
    import Handler from './Handler.vue';
    import Transition from "./Transition";
    import VueCodeMirror from './VueCodeMirror.vue'
    import VueTerm from './VueTerm.vue'

    const Sortable = require('sortablejs')
    const uniqid = require('uniqid')

    @Component({
        name: 'App',
        components: {
            Transition,
            Handler,
            VueCodeMirror,
            VueTerm,
            LabelEdit,
            MultiSelect,
            'b-modal': BModal,
            'b-btn': BButton,
            'b-tabs': BTabs,
            'b-tab': BTab
        },
        directives: {
            'b-modal': BModalDirective,
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

        showLoad: boolean = false

        result = ''

        cmdPending = false

        sim = new SmSim()

        initialData = '{}'

        currentData = '123'

        initialState = '\'off\''

        currentState = ''

        output = ''

        transitions: Array<StateTransition> = []

        counter = 1

        name = 'Untitled'

        dirty = false

        // noinspection JSUnusedGlobalSymbols
        $refs!: {
            handlers: HTMLElement,
            load: BModal
        }

        @Lifecycle mounted() {
            // noinspection JSUnusedGlobalSymbols
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
            let self = this
            this.sim.stateListener = (state: State, prev: State, data: any, event: Event, handlerIndex: number) => {
                self.currentData = JSON.stringify(data, null, 2)
                self.currentState = stateRoute(state)
                self.transitions.push({state, prev, data, event, handlerIndex})
            }
            this.initSim()
            this.dirty = false
        }

        @Watch('handlers')
        handlersChanged() {
            this.dirty = true
        }

        @Watch('initialState')
        initialStateChanged() {
            this.dirty = true
        }

        @Watch('initialData')
        initialDataChanged() {
            this.dirty = true
        }

        get sortedHandlers() {
            return this.handlers.sort((a, b) => a.index - b.index)
        }

        get handlerCode() {
            return '['
                + this.sortedHandlers.map(x => x.handler).join(',')
                + ']'
        }

        savedFileNames(): string[] {
            let list: string[] = []
            store.each((v: any, k: string) => {
                if (k.startsWith('sm-')) {
                    list.push(k.substring(3))
                }
            })
            return list
        }

        nameChanged(v: string) {
            console.log(v)
            this.name = v
        }

        onInput(line: string) {
            let result = ''
            if (line.length != 0) {
                switch (line) {
                    case 'clear':
                        this.transitions = []
                        break;

                    case 'init':
                        this.initSim()
                        break;

                    default:
                        try {
                            result = this.sim.exec(line)
                        }
                        catch (e) {
                            console.log(e)
                            result = e.message
                        }
                }
            }
            this.$emit('result', result)
        }

        load(name: string) {
            console.log(name)
            let data = store.get(`sm-${name}`)
            console.log(data)
            this.fromObject(data)
            this.showLoad = false
            this.name = name
            this.dirty = false
            this.initSim()
        }

        save(n?: string) {
            let name = n || this.name
            console.log(`saving ${name}`)
            store.set(`sm-${name}`, this.toObject())
            this.dirty = false
        }

        fromObject(obj: SmData) {
            this.handlers = obj.handlers
            this.initialState = obj.initialState
            this.initialData = obj.initialData
        }

        toObject(): SmData {
            return {
                handlers: this.handlers,
                initialState: this.initialState,
                initialData: this.initialData,
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

  .app-controls {
    width: 100%;
    margin-bottom: 10px;
    & > .icons {
      display: inline-block;
      & > .icon {
        margin-right: 10px;
      }
      border-right: solid 3px $neutral;
    }
  }

  .dirty {
    color: $lighter;
  }

  .name {
    display: inline-block;
    font-family: $display_font;
    font-size: 20px;

  }

  input.vlabeledit-input {
    height: 30px;
    border: none;
  }

  .events, .initialData, .output, .currentData {
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

  /*.initialData, .currentData {*/
  /*margin-bottom: 10px;*/
  /*}*/

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


</style>

<style lang="scss">
  @import "../../node_modules/vue-multiselect/dist/vue-multiselect.min.css";
  @import '../styles/theme';

  .name > input.vlabeledit-input {
    height: 30px;
    background: $less_neutral;
    border: solid 1px $dark;
    border-top: solid 1px $bg_color;
    &:focus {
      box-shadow: inset 0 0 6px $highlight_color;
    }
  }

  #load {
    color: $lightest;
    font-family: $display_font;
    .modal-title {
      font-size: 16px;
      font-weight: 400;
      text-transform: uppercase;
    }
    .modal-content {
      background: $bg_color;
    }
    .modal-header {
      border-bottom: solid 1px $darker;
    }
    .modal-footer {
      border-top: solid 1px $less_neutral;
    }
    .modal-body {
      border-top: solid 1px $less_neutral;
      border-bottom: solid 1px $darker;
    }
  }

  .nav-tabs .nav-item {
    font-family: $display_font;
    font-size: 16px;
    font-weight: 400;
    text-transform: uppercase;
    color: lighten($text_color, 20%);
    background: $heading_bg;
    border: none;
    border-radius: 0;
  }

  .nav-tabs .nav-item .active {
    border-radius: 0;
    background: lighten($heading_bg, 20%);
    color: lighten($text_color, 20%);
    border: none;
  }

  .cm-s-initialData, .cm-s-currentData, .cm-s-currentState, .cm-s-events {
    font-family: $code_font, monospace;
    font-weight: 300;
    font-size: 16px;
    height: auto;
    margin-bottom: 20px;
  }

  .repl-outer {
    z-index: 10;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: black;
  }

  .repl-inner {
    padding: 20px;
    height: 150px;
  }

</style>
