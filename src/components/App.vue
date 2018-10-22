<template>
  <div class="app">
    <button v-on:click="run()">Run</button>
    <div class="row">
      <div class="col">
        <div class="handlers list-group" ref="handlers">
          <Handler class="handler"
            v-for="h in sortedHandlers"
            :key="h.id"
            :index="h.index"
            :odd="h.index%2 === 1"
            v-model="h.handler"></Handler>
        </div>
        <button v-on:click="addHandler()">Add Handler</button>
      </div>
      <div class="col">
        <label for="events">Events</label>
        <textarea
          v-model="events"
          id="events"
          placeholder="Events"
          v-resize-on-value
          v-resize-on-input
          :class="['events' ]">
        </textarea>

        <label for="initialData">Initial Data</label>
        <textarea
          v-model="initialData"
          id="initialData"
          placeholder="Initial Data"
          v-resize-on-value
          v-resize-on-input
          :class="['initialData' ]">
        </textarea>

        <label for="output">Output</label>
        <textarea
          v-model="output"
          readonly
          id="output"
          placeholder="Output"
          v-resize-on-value
          v-resize-on-input
          :class="['output' ]">
        </textarea>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
    import { Component, Lifecycle } from "av-ts";
    import { State } from "gen-statem";
    import { SortableEvent } from "sortablejs";
    import Vue from 'vue';
    import VueResizeOnEvent from '../../../vue-resize-on-event/src/VueResizeOnEvent'
    import sm from '../templates/sm'
    import Handler from './Handler.vue';

    const vm = require('vm')
    const Sortable = require('sortablejs')
    const genStatem = require('gen-statem')
    const uniqid = require('uniqid')
    const inspect = require('object-inspect')

    @Component({
        name: 'App',
        components: {
            Handler
        },
        directives: {
            ...VueResizeOnEvent('value'),
            ...VueResizeOnEvent('input'),
        }
    })
    export default class App extends Vue {
        handlers: { id: string; index: number; handler: string }[] = [
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
            return '[' + this.sortedHandlers.map(x => x.handler).join(',') + ']'
        }

        onInitialDataChanged(value: string) {
            this.initialData = value
        }

        onEventsChanged(value: string) {
            this.events = value
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
                afterEvent: (fn: string, args: Array<any>, status: [State, any]) => {
                    let prompt = `${this.counter++}>`
                    let a = args.length === 0 ? '' : inspect(...args)
                    let res = [prompt,
                        `${fn}(${a})`,
                        `state:'${status[0]}',`,
                        `data:${inspect(status[1])}`,
                    ]
                    this.output += res.join(' ') + '\n'
                },
                step: true,
            })
        }
    }
</script>

<style lang="scss">
  #handlers {
    width: 100%;
    height: 100%;
  }

  .events, .initialData, .output {
    width: 100%;
    resize: none;
    background-color: #272822;
    color: #F8F8F2;
    border: none;
    border-radius: 0;
    padding: 10px;
  }

  .output {
    height: 100%;
  }

  .handlers {
    margin: 10px 0;
  }

  .handler {
    /*border-top: solid 1px #888;*/
  }


</style>
