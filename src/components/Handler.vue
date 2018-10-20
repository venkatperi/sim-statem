<template>
  <div :class="[odd?'odd':'even', 'handler-group', 'list-group-item']">
    <div class="index" v-html="index + 1"></div>
    <div class="controls">x</div>
    <div class="route">
      <input class="event ace-monokai" v-model="event" />
      <span class="hash">#</span>
      <input class="context ace-monokai" v-model="context" />
      <span class="hash">#</span>
      <input class="state ace-monokai" v-model="state" />
    </div>
    <AceEditor
      class="handler"
      :name="name"
      :fontSize="fontSize"
      :mode="mode"
      :minLines="minLines"
      :maxLines="maxLines"
      :editorProps="editorProps()"
      :onChange="e => this.handler = e"
      :value="handler"
      theme="monokai"></AceEditor>
  </div>
</template>

<script>
  const HANDLER = /\[([^,]+),(.*)]/
  // import {Ace as AceEditor} from 'vue2-brace-editor';
  import {Ace as AceEditor} from '../../../vue2-brace-editor/src/index';
  import editorProps from './editorProps'

  const uniqid = require( 'uniqid' )

  export default {
    name: 'Handler',

    components: {
      AceEditor,
    },

    props: Object.assign( {}, editorProps, {
      value: String,
      index: Number,
      odd: { type: Boolean, default: false },
    } ),

    data: function () {
      return {
        name: uniqid(),
        event: '',
        context: '',
        state: '',
        route: '',
        handler: '',
      }
    },

    created() {
      this.valueChanged()
    },

    watch: {
      value() {
        this.valueChanged()
      },

      event() {
        this.updateRoute()
      },

      context() {
        this.updateRoute()
      },

      state() {
        this.updateRoute()
      },

      route() {
        this.emitHandler()
      },

      handler( v ) {
        this.emitHandler()
      },
    },

    methods: {
      updateRoute() {
        this.route = '"' + [this.event, this.context, this.state].join( '#' ) + '"'
      },

      valueChanged() {
        let match = HANDLER.exec( this.value )
        if ( match && match.length > 1 ) {
          this.handler = match[2].trim()

          let route = match[1].replace( /['"]/g, '' ).trim()
          let parts = route.split( '#' )
          this.event = parts[0]
          this.context = parts[1]
          this.state = parts[2]
        }
      },

      emitHandler: function () {
        const value = `[${this.route}, ${this.handler}]`
        this.$emit( 'input', value )
      },

      editorProps() {
        return {
          $blockScrolling: Infinity,
        }
      },
    },
  }
</script>

<style type="scss" scoped>

  .route {
    margin-bottom: 6px;
  }

  .event, .context, .state {
    width: 120px;
    font-size: 16px;
    padding: 0 10px;
  }

  .context {
    width: 195px;
  }

  .hash {
    font-size: 28px;
    color: #888;
  }

  .handler {
    width: 400px;
  }

  .handler-group {
    padding: 10px 0 20px 20px;
    width: 540px;
    position: relative;
  }

  .odd {
    background: #aaa;
  }

  .even {
    background: #ccc;
  }

  .index {
    font-size: 18px;
    color: #808080;
    font-weight: bold;
    line-height: 14px;
  }

  .controls {
    position: absolute;
    right: 20px;
    top: 2px;
  }

</style>
