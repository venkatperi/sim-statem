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
      </div>
      <div class="col">
        <label for="initialData">Initial Data</label>
        <AceEditor
          id="initialData"
          name="initialData"
          :maxLines=10
          :minLines=10
          :fontSize=14
          mode="mode"
          :editorProps="editorProps()"
          :value="initialData"
          :onChange="onInitialDataChanged"
          theme="monokai"></AceEditor>

        <label for="events">Events</label>
        <AceEditor
          id="events"
          name="events"
          :fontSize=14
          mode="mode"
          :value="events"
          :editorProps="editorProps()"
          :onChange="onEventsChanged"
          theme="monokai"></AceEditor>
      </div>
    </div>
  </div>
</template>

<script>
  const genStatem = require( 'gen-statem' )
  import Sortable from 'sortablejs'
  import {Ace as AceEditor} from '../../../vue2-brace-editor/src/index';
  import editorProps from './editorProps'
  import Handler from './Handler';

  const vm = require( 'vm' );

  const uniqid = require( 'uniqid' )
  require( 'brace/mode/javascript' );
  require( 'brace/theme/monokai' );

  export default {
    name: 'app',

    props: Object.assign( {}, editorProps, {} ),

    components: {
      Handler,
      AceEditor,
    },

    data: function () {
      return {
        handlers: [
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
        ],
        events: 'cast(\'flip\')',
        initialData: '{}',
        initialState: 'off',
      };
    },

    mounted() {
      new Sortable( this.$refs.handlers, {
        onEnd: ( e ) => {
          let a = this.handlers.find( x => x.index === e.oldIndex )
          let b = this.handlers.find( x => x.index === e.newIndex )
          if ( a && b ) {
            let x = a.index
            a.index = b.index
            b.index = x
          }
        },
      } )
    },

    watch: {},

    computed: {
      sortedHandlers: function () {
        return this.handlers.sort( ( a, b ) => a.index - b.index )
      },

      handlerCode: function () {
        return '[' + this.sortedHandlers.map( x => x.handler ).join( ',' ) + ']'
      },
    },

    methods: {
      onInitialDataChanged( value ) {
        this.initialData = value
      },

      onEventsChanged( value ) {
        this.events = value
      },

      editorProps() {
        return {
          $blockScrolling: Infinity,
        }
      },

      run() {
        const code = `
        ((opts) => {
const {StateMachine, nextState, keepState, repeatState} = opts.genStatem;

const sm = new StateMachine({
  handlers: ${this.handlerCode},
  initialState: '${this.initialState}',
  initialData: ${this.initialData}
  })

const cast = sm.cast.bind(sm)
const call = sm.call.bind(sm)

sm.on('state', opts.onState)
sm.startSM()

${this.events}
})
        `
        console.log( code )
        vm.runInThisContext( code )( {
          genStatem,
          onState: console.log,
        } )
      },
    },
  };
</script>

<style lang="scss">
  #handlers,
  #events {
    width: 100%;
    height: 100%;
    min-height: 100%;
  }

  #initialData {
    margin-bottom: 20px;
  }

  .handlers {
    margin: 10px 0;
  }

  .handler {
    border-bottom: solid 1px #888;
  }

  .handler:first-child {
    border-top: solid 1px #888;
  }

</style>
