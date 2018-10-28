<!--suppress JSMethodCanBeStatic, TypeScriptValidateTypes -->
<template>
  <div class="app">

    <b-modal id="load"
             title="Load State Machine"
             v-model="showLoad"
             :x-bus="bus">
      <MultiSelect @select="load" :options="savedFileNames()" />
    </b-modal>

    <ShowCode name="showCode"
              :value="theCode"
              title="State Machine Code"
              :x-bus="bus" />

    <div>
      <b-modal id="delete"
               @ok="deleteFile"
               v-model="showDelete"
               title="Delete State Machine?">
        Are you sure you want to delete {{ name }}?
      </b-modal>
    </div>

    <div class="main">
      <div class="row">
        <div class="col">
          <div class="app-controls">
            <div class="icons">

              <div class="icon" @click="create()" title="Create">
                <v-icon name="regular/file" />
              </div>
              <div class="icon" v-b-modal.load title="Load">
                <v-icon name="file" />
              </div>

              <div class="separator"></div>

              <div class="icon" v-b-modal.delete title="Delete">
                <v-icon name="trash-alt" />
              </div>

              <div class="icon" @click="onShowCode" title="Show Code">
                <v-icon name="code" />
              </div>
              <div :class="['icon', dirty?'dirty':'']"
                   @click="save()"
                   title="Save">
                <v-icon name="save" />
              </div>

              <LabelEdit class="name" v-model="name" placeholder="Name..." />
            </div>
          </div>
        </div>
      </div>

      <div class="row">

        <div class="col left">
          <b-tabs v-model="stateTab">
            <b-tab title="Initial State" active>
              <VueCodeMirror v-model="initialState"
                             ref="initialState"
                             name="initialData"
                             mode="javascript"
                             theme="midnight"
                             :x-bus="bus"
                             @blur="sanitize"
                             :lineNumbers="true" />
            </b-tab>
            <b-tab title="Current State">
              <VueCodeMirror v-model="currentState"
                             ref="currentState"
                             name="currentState"
                             mode="javascript"
                             theme="midnight"
                             :x-bus="bus"
                             :read-only="true"
                             :lineNumbers="true" />
            </b-tab>
          </b-tabs>
          <b-tabs v-model="dataTab">
            <b-tab title="Initial Data" active>
              <VueCodeMirror v-model="initialData"
                             ref="initialData"
                             name="initialData"
                             mode="javascript"
                             theme="midnight"
                             :x-bus="bus"
                             :lineNumbers="true" />
            </b-tab>
            <b-tab title="Current Data">
              <VueCodeMirror v-model="currentData"
                             ref="currentData"
                             name="currentData"
                             mode="javascript"
                             theme="midnight"
                             :x-bus="bus"
                             :lineNumbers="true" />
            </b-tab>
          </b-tabs>
          <div class="header">
            <label>Initial Code</label>
          </div>
          <VueCodeMirror v-model="initialCode"
                         ref="initialCode"
                         name="initialCode"
                         mode="javascript"
                         theme="midnight"
                         @blur="formatCode"
                         :x-bus="bus"
                         :lineNumbers="true" />
          <div class="header">State Transitions</div>
          <Transition class="transition" :transitions="transitions" />

        </div>
        <div class="col right">

          <div class="header">
            <label>State Machine Rules</label>
            <span class="icons">
              <span class="icon" @click="addHandler">
                <font-awesome-icon icon="plus" size="sm" />
              </span>
            </span>
          </div>

          <div class="handlers list-group" id="handlers" ref="handlers">
            <VueHandler v-for="h in sortedHandlers"
                        :key="h.id"
                        :index="h.index"
                        :odd="h.index%2 === 1"
                        v-on:remove="removeHandler(h.index)"
                        :x-bus="bus"
                        :name="`handler-${h.index}`"
                        v-model="h.handler" />
          </div>
        </div>

      </div>
    </div>

    <div class="repl-outer">
      <div class="header">REPL</div>
      <div class="repl-inner">
        <VueTerm class="repl"
                 @input="onInput"
                 :value="result"
                 :pending="cmdPending"
                 :x-bus="bus"
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
    import Vue from 'vue';
    import MultiSelect from 'vue-multiselect'
    import { Store } from "vuex";
    import LabelEdit from '../../../label-edit/src/LabelEdit.vue'
    import { SmSim } from "../SmSim";
    import { IndexedHandler, SmState, StateTransition } from "../types";
    import { format, quote } from '../util'
    import BModal2 from './BootstrapModal.vue'
    import VueHandler from './Handler.vue';
    import ShowCode from './ShowCode.vue'
    import Transition from "./Transition.vue";
    import VueCodeMirror from './VueCodeMirror.vue'
    import VueTerm from './VueTerm.vue'
    import * as LocalStore from 'store'

    const Sortable = require('sortablejs')
    const stringify = require("json-stringify-pretty-compact")

    @Component({
        name: 'App',
        components: {
            ShowCode,
            Transition, VueHandler,
            VueCodeMirror,
            VueTerm,
            LabelEdit,
            MultiSelect,
            'b-modal': BModal,
            'b-modal2': BModal2,
            'b-btn': BButton,
            'b-tabs': BTabs,
            'b-tab': BTab,
        },
        directives: {
            'b-modal': BModalDirective,
        }
    })
    export default class App extends Vue {
        bus = new Vue()

        stateTab = 0

        dataTab = 0

        showLoad: boolean = false

        showDelete: boolean = false

        result = ''

        cmdPending = false

        sim = new SmSim()

        // noinspection JSUnusedGlobalSymbols
        $store!: Store<SmState>

        // noinspection JSUnusedGlobalSymbols
        // noinspection JSAnnotator
        $refs!: {
            handlers: HTMLElement,
            load: BModal,
            initialState: VueCodeMirror,
            currentState: VueCodeMirror,
        }

        get handlers(): Array<IndexedHandler> {
            return this.$store.state.handlers
        }

        get initialState(): string {
            return this.$store.state.initialState
        }

        get initialData(): string {
            return this.$store.state.initialData
        }

        get initialCode(): string {
            return this.$store.state.initialCode
        }

        get currentState(): string {
            return this.$store.state.currentState
        }

        get currentData(): string {
            return this.$store.state.currentData
        }

        get name(): string {
            return this.$store.state.name
        }

        get dirty(): boolean {
            return this.$store.state.dirty
        }

        get transitions(): StateTransition[] {
            return this.$store.state.transitions
        }

        get revision(): number {
            return this.$store.state.revision
        }

        get formatVersion(): number {
            return this.$store.state.formatVersion
        }

        get theCode(): string {
            return this.$store.getters.code
        }

        set initialData(value: string) {
            this.$store.commit('setInitialData', value)
        }

        set initialState(value: string) {
            this.$store.commit('setInitialState', value)
        }

        set initialCode(value: string) {
            this.$store.commit('setInitialCode', value)
        }

        set currentData(value: string) {
            this.$store.commit('setCurrentData', value)
        }

        set currentState(value: string) {
            this.$store.commit('setCurrentState', value)
        }

        set name(value: string) {
            this.$store.commit('setName', value)
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
            this.sim.stateListener =
                (state: State, prev: State, data: any, event: Event,
                    handlerIndex: number) => {
                    self.currentData = stringify(data, {maxLength: 40})
                    self.currentState = stateRoute(state)
                    self.transitions.push(
                        {state, prev, data, event, handlerIndex})
                    self.stateTab = 1
                    self.dataTab = 1
                }

            this.sim.errorListener = console.log

            this.createNew()
            this.sanitize()
            this.clearDirty()
        }


        @Watch('stateTab')
        stateTabChanged() {
            this.bus.$emit('refresh')
        }

        @Watch('dataTab')
        dataTabChanged() {
            this.bus.$emit('refresh')
        }

        clearDirty() {
            this.$store.commit('clearDirty')
        }

        onShowCode() {
            this.bus.$emit('showCode:show')
        }

        get sortedTransitions() {
            return [...this.transitions].reverse()
        }

        get sortedHandlers() {
            return this.handlers.sort((a, b) => a.index - b.index)
        }

        sanitize() {
            this.initialState = quote(this.initialState)
        }

        savedFileNames(): string[] {
            let list: string[] = []
            LocalStore.each((v: any, k: string) => {
                if (k.startsWith('sm-')) {
                    list.push(k.substring(3))
                }
            })
            return list
        }

        formatCode() {
            this.initialCode = format(this.initialCode)
        }

        onInput(line: string) {
            let result = ''
            if (line.length != 0) {
                switch (line) {
                    case 'clear':
                        this.clear()
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
            result = result === undefined ? '' : String(result)
            this.bus.$emit('repl:result', result)
        }

        get fileName(): string {
            return `sm-${this.name}`
        }

        async load(name: string) {
            await this.$store.dispatch('load', name)
            this.showLoad = false
        }

        save() {
            this.$store.dispatch('save')
        }

        deleteFile() {
            this.$store.dispatch('deleteFile')
        }

        createNew() {
            this.$store.dispatch('initialize')
        }

        removeHandler(index: number) {
            this.$store.commit('removeHandler', index)
        }

        reindex() {
            this.$store.commit('reindex')
        }

        addHandler() {
            this.$store.dispatch('createHandler')
        }

        clear() {
            this.bus.$emit('repl:clear')
            this.bus.$emit('transitions:clear')
        }

        initSim() {
            this.sanitize()
            this.clear()
            this.sim.init(this.theCode)
        }
    }
</script>


<style lang="scss" scoped>

  @import '../styles/theme';

  .app {
    padding: 0 15px;
    position: relative;
  }

  .main {
    padding-bottom: 150px;
  }

  .app-controls {
    width: 100%;
    margin-bottom: 10px;
    & > .icons {
      display: inline-block;
      & > .icon {
        display: inline;
        height: 30px;
        line-height: 30px;
        margin-right: 10px;
      }
      .separator {
        vertical-align: middle;
        margin: 0 20px 0 10px;
        border-left: solid 1px $darker;
        border-right: solid 1px $neutral;
        height: 25px;
        width: 1px;
        display: inline-block;
      }
    }
  }

  .dirty {
    color: $lighter;
  }

  .name {
    color: $lighter;
    display: inline-block;
    font-family: $display_font;
    font-size: 25px;
    text-transform: uppercase;
    font-weight: 200;
    line-height: 30px;
    vertical-align: middle;
    margin-right: 20px;
  }

  input.vlabeledit-input {
    text-transform: uppercase;
    font-weight: 200;
    height: 30px;
    border: none;
  }

  .left, .right {
    max-width: 50%;
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
    text-transform: uppercase;
    font-weight: 200;
    height: 30px;
    background: $less_neutral;
    border: solid 1px $dark;
    border-top: solid 1px $bg_color;
    &:focus {
      box-shadow: inset 0 0 6px $highlight_color;
      border: none;
    }
  }

  #load {
    color: $lightest;
    font-family: $display_font;
  }

  .app {
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

  .nav-tabs {
    border-bottom: solid 1px $dark;
    height: 40px;
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

  .cm-s-initialCode,
  .cm-s-initialData,
  .cm-s-currentData,
  .cm-s-currentState,
  .cm-s-showCode,
  .cm-s-events {
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
