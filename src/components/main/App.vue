<!-- // Copyright 2018, Venkat Peri. --><!-- // --><!-- // Permission is hereby granted, free of charge, to any person obtaining a --><!-- // copy of this software and associated documentation files (the --><!-- // "Software"), to deal in the Software without restriction, including --><!-- // without limitation the rights to use, copy, modify, merge, publish, --><!-- // distribute, sublicense, and/or sell copies of the Software, and to permit --><!-- // persons to whom the Software is furnished to do so, subject to the --><!-- // following conditions: --><!-- // --><!-- // The above copyright notice and this permission notice shall be included --><!-- // in all copies or substantial portions of the Software. --><!-- // --><!-- // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS --><!-- // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF --><!-- // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN --><!-- // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, --><!-- // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR --><!-- // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE --><!-- // USE OR OTHER DEALINGS IN THE SOFTWARE. -->

<!--suppress JSMethodCanBeStatic, TypeScriptValidateTypes -->
<template>
  <div class="app">

    <b-modal id="load"
             title="Load State Machine"
             v-model="showLoad"
             :x-bus="bus">
      <MultiSelect @select="load" :options="fileNames" />
    </b-modal>

    <Login id="login" />

    <ShowCode name="showCode"
              :value="theCode"
              title="State Machine Code"
              :x-bus="bus" />

    <b-modal id="delete"
             @ok="deleteFile"
             v-model="showDelete"
             title="Delete State Machine?">
      Are you sure you want to delete {{ name }}?
    </b-modal>

    <div class="main">
      <div class="row">
        <div class="col">
          <div class="app-controls">
            <div class="icons">
              <div class="icon" @click="createNew" title="Create">
                <v-icon name="regular/file" />
              </div>

              <div class="icon" @click="onLoadDialog" title="Load">
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

            <div class="icons float-right">
              <div v-if="!isAuthenticated"
                   class="icon"
                   v-b-modal.login
                   title="Login">
                <v-icon name="sign-in-alt" />
              </div>
              <div v-else>
                <span>{{ userName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">

        <div class="col">
          <section>
            <b-tabs v-model="stateTab">
              <b-tab title="Initial State" active>
                <VueCodeMirror v-model="initialState"
                               ref="initialState"
                               name="initialState"
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
          </section>

          <section>
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
          </section>

          <section>
            <div class="header">State Transitions</div>
            <Transition class="transition" :transitions="transitions" />
          </section>

        </div>
        <div class="col">

          <section>
            <div class="header" @dblclick="toggleAllCollapsed">
              <label>State Machine Rules</label>
              <span class="icons">
                <span class="icon" @click="addHandler">
                  <v-icon name="plus" />
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
          </section>

          <section class="initial-code">
            <div class="header"><label>Initial Code</label></div>
            <VueCodeMirror v-model="initialCode"
                           ref="initialCode"
                           name="initialCode"
                           mode="javascript"
                           theme="midnight"
                           @blur="formatCode"
                           :x-bus="bus"
                           :lineNumbers="true" />
          </section>
        </div>

      </div>
    </div>

    <div class="repl-outer">
      <div class="header">REPL
        <b-btn v-for="(b, index) in buttons"
               :key="index"
               size="sm"
               variant="primary"
               @click="exec(b.command)"> {{b.name}}
        </b-btn>
      </div>
      <div class="repl-inner">
        <VueTerm class="repl"
                 :input-handler="onCommand"
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
    import * as LocalStore from 'store'
    import Vue from 'vue';
    import MultiSelect from 'vue-multiselect'
    import { Store } from "vuex";
    import LabelEdit from '../../../../label-edit/src/LabelEdit.vue'
    import { SimButton, SmSim } from "../../SmSim";
    import { AppState } from "../../store/AppState";
    import { IndexedHandler } from "../../store/sm/IndexedHandler";
    import { StateTransition } from "../../store/sm/StateTransition";
    import { format, quote } from '../../util'
    import ShowCode from '../misc/ShowCode.vue'
    import VueCodeMirror from '../misc/VueCodeMirror.vue'
    import VueTerm from '../misc/VueTerm.vue'
    import Login from '../user/Login.vue'
    import VueHandler from './Handler.vue';
    import Transition from "./Transition.vue";

    const Sortable = require('sortablejs')
    const stringify = require("json-stringify-pretty-compact")

    @Component({
        name: 'App',
        components: {
            ShowCode, Transition, VueHandler, VueCodeMirror, VueTerm,
            LabelEdit, MultiSelect,
            'b-modal': BModal,
            'b-btn': BButton,
            'b-tabs': BTabs,
            'b-tab': BTab,
            Login,
        },
        directives: {
            'b-modal': BModalDirective,
        }
    })
    export default class App extends Vue {
        bus = new Vue()

        theCode = ''

        fileNames: string[] = []

        stateTab = 0

        dataTab = 0

        showLoad: boolean = false

        showDelete: boolean = false

        sim = new SmSim()

        // noinspection JSUnusedGlobalSymbols
        $store!: Store<AppState>

        // noinspection JSUnusedGlobalSymbols
        // noinspection JSAnnotator
        $refs!: {
            handlers: HTMLElement,
            load: BModal,
            initialState: VueCodeMirror,
            currentState: VueCodeMirror,
        }

        get isAuthenticated(): boolean {
            return !!this.$store.state.user.uid
        }

        get userName(): string {
            let user = this.$store.state.user
            console.log(user)
            return user.name || ''
        }

        get handlers(): Array<IndexedHandler> {
            return this.$store.state.sm.handlers
        }

        get initialState(): string {
            return this.$store.state.sm.initialState
        }

        get initialData(): string {
            return this.$store.state.sm.initialData
        }

        get initialCode(): string {
            return this.$store.state.sm.initialCode
        }

        get currentState(): string {
            return this.$store.state.sm.currentState
        }

        get currentData(): string {
            return this.$store.state.sm.currentData
        }

        get name(): string {
            return this.$store.state.sm.name
        }

        get dirty(): boolean {
            return this.$store.state.sm.dirty
        }

        get transitions(): StateTransition[] {
            return this.$store.state.sm.transitions
        }

        get revision(): number {
            return this.$store.state.sm.revision
        }

        get formatVersion(): number {
            return this.$store.state.sm.formatVersion
        }

        getSource(): string {
            return this.$store.getters.code
        }

        set initialData(value: string) {
            this.$store.commit('sm/setInitialData', value)
        }

        set initialState(value: string) {
            this.$store.commit('sm/setInitialState', value)
        }

        set initialCode(value: string) {
            this.$store.commit('sm/setInitialCode', value)
        }

        set currentData(value: string) {
            this.$store.commit('sm/setCurrentData', value)
        }

        set currentState(value: string) {
            this.$store.commit('sm/setCurrentState', value)
        }

        set name(value: string) {
            this.$store.commit('sm/setName', value)
        }

        get buttons(): SimButton[] {
            return this.sim.get('buttons')
        }

        get sortedTransitions() {
            return [...this.transitions].reverse()
        }

        get sortedHandlers() {
            return this.handlers.sort((a, b) => a.index - b.index)
        }

        get fileName(): string {
            return `sm-${this.name}`
        }

        @Watch('stateTab')
        stateTabChanged() {
            this.bus.$emit('refresh')
        }

        @Watch('dataTab')
        dataTabChanged() {
            this.bus.$emit('refresh')
        }


        @Lifecycle mounted() {
            new Sortable(this.$refs.handlers, {
                onEnd: this.swapHandlers.bind(this),
            })
            let self = this
            this.sim.stateListener = this.stateListener.bind(this)
            this.sim.errorListener = console.log
            this.sim.cmdListener = (cmd) => self.onCommand(cmd, true)

            this.createNew()
            this.clearDirty()
            this.initSim()
        }

        login() {

        }

        swapHandlers(e: SortableEvent) {
            let a = this.handlers.find(x => x.index === e.oldIndex)
            let b = this.handlers.find(x => x.index === e.newIndex)
            if (a && b) {
                let x = a.index
                a.index = b.index
                b.index = x
            }
        }

        stateListener(state: State, prev: State, data: any,
            event: Event, handlerIndex: number) {
            this.currentData = stringify(data, {maxLength: 40})
            this.currentState = stateRoute(state)
            this.$store.dispatch('sm/addTransition',
                {state, prev, data, event, handlerIndex})
            this.showCurrentTabs()
        }

        showCurrentTabs() {
            this.stateTab = 1
            this.dataTab = 1
        }

        clearDirty() {
            this.$store.commit('sm/clearDirty')
        }

        onLoadDialog() {
            this.fileNames = this.getFileNames()
            this.showLoad = true
        }

        onShowCode() {
            this.theCode = this.getSource()
            this.bus.$emit('showCode:show')
        }

        sanitize() {
            let s = quote(this.initialState)
            if (s !== this.initialState) {
                this.initialState = s
            }
        }

        getFileNames(): string[] {
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

        async onCommand(cmd: string, print = false) {
            if (print) {
                this.bus.$emit('repl:print', cmd)
            }
            let result = ''

            if (cmd.length != 0) {
                switch (cmd) {
                    case 'clear':
                        this.clear()
                        break;

                    case 'init':
                        this.initSim()
                        break;

                    default:
                        try {
                            result = this.sim.exec(cmd)
                        }
                        catch (e) {
                            console.log(e)
                            result = e.message
                        }
                }
            }
            result = result === undefined ? '' : String(result)
            return result
        }

        exec(cmd: string) {
            this.sim.exec(cmd)
        }

        async load(name: string) {
            await this.$store.dispatch('sm/load', name)
            this.showLoad = false
            this.initSim()
        }

        save() {
            this.$store.dispatch('sm/save')
        }

        deleteFile() {
            this.$store.dispatch('sm/deleteFile')
        }

        createNew() {
            this.$store.dispatch('sm/initialize')
        }

        removeHandler(index: number) {
            this.$store.commit('sm/removeHandler', index)
        }

        addHandler() {
            this.$store.dispatch('sm/createHandler')
        }

        clear() {
            this.$store.dispatch('sm/clearTransitions')
            this.bus.$emit('repl:clear')
            this.bus.$emit('transitions:clear')
        }

        initSim() {
            this.sanitize()
            this.clear()
            this.sim.init(this.getSource())
        }

        toggleAllCollapsed() {
            this.bus.$emit('handler:collapse')
        }
    }
</script>


<style lang="scss" scoped>

  @import '../../styles/theme';

  section.initial-code {
    margin-top: 20px;
  }

  .app {
    padding: 0 15px;
    position: relative;
  }

  .main {
    padding-bottom: 210px;
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
    color: $neutral;
    display: inline-block;
    font-family: $display_font;
    font-size: 1.4rem;
    text-transform: uppercase;
    font-weight: 400;
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

  .events, .initialData, .output, .currentData {
    /*width: 100%;*/
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

  .header {
    font-family: $display_font;
    font-size: 0.9rem;
    font-weight: 400;
    text-transform: uppercase;
    width: 100%;
    background: $heading_bg;
    color: $heading_color;
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
          color: $complementary2;
        }
      }
    }
  }

  .handlers {
    border-radius: 0;
  }


</style>

<style lang="scss">
  @import "../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css";
  @import '../../styles/theme';

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
  }

  .nav-tabs {
    background: $heading_bg;
    border: none;
    border-bottom: solid 1px $dark;
    height: 40px;
  }

  .nav-tabs .nav-link {
    border: none;
    height: 40px;
    border-bottom: solid 1px $dark;
    &:hover {
      border: none;
      border-bottom: solid 1px $dark;
    }
  }

  .nav-tabs .nav-item {
    font-family: $display_font;
    font-size: 0.9rem;
    font-weight: 400;
    text-transform: uppercase;
    color: $heading_color;
    background: $code_bg;
    border: none;
    border-radius: 0;
  }

  .nav-tabs .nav-item .active {
    border-radius: 0;
    background: lighten($code_bg, 10%);
    color: lighten($text_color, 20%);
    border: none;
    border-bottom: solid 1px $dark;
    &:hover {
      border: none;
      border-bottom: solid 1px $dark;
    }
  }

  .cm-s-initialCode,
  .cm-s-initialData,
  .cm-s-currentData,
  .cm-s-currentState,
  .cm-s-showCode,
  .cm-s-events {
    @extend %codemirror-common;
    margin-bottom: 20px;
  }

  .repl-outer {
    z-index: 10;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: black;
    box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.75);
    button {
      &:first-child {
        margin-left: 20px;
      }
      margin: 2px 10px 2px 2px;
      padding: 2px 5px;
    }
  }

  .repl-inner {
    padding: 20px;
    height: 150px;
  }

</style>
