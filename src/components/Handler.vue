<template>
  <div :class="[odd?'odd':'even', 'handler-group', 'list-group-item']">
    <div class="top">
      <div class="index" v-html="index + 1"></div>
      <div class="controls">x</div>
    </div>
    <div class="route">
      <input class="event ace-monokai"
        v-model="event"
        placeholder="event" />
      <span class="hash">#</span>
      <input class="context ace-monokai"
        v-model="context"
        placeholder="context" />
      <span class="hash">#</span>
      <input class="state ace-monokai"
        v-model="state"
        placeholder="state" />
    </div>
    <textarea
      v-model="handler"
      placeholder="handler"
      v-resize-on-value
      v-resize-on-input
      :class="['handler' ]">
      </textarea>
  </div>
</template>

<script>
  import VueResizeOnEvent from 'vue-resize-on-event'

  const HANDLER = /\[([^,]+),(.*)]/

  export default {
    name: 'Handler',

    mixins: [
      VueResizeOnEvent( 'value' ),
      VueResizeOnEvent( 'input' ),
    ],

    props: {
      value: String,
      index: Number,
      odd: { type: Boolean, default: false },
    },

    data: function () {
      return {
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

    },
  }
</script>

<style type="scss" scoped>

  .route {
    margin-top: 6px;
    margin-bottom: 6px;
    width: 100%;
    display: flex;
  }

  .event, .context, .state {
    height: 30px;
    font-size: 16px;
    text-align: center;
    background-color: #272822;
    color: #F8F8F2;
  }

  .event, .state {
    width: 100px;
  }

  .context {
    flex-grow: 1;
  }

  .hash {
    font-size: 20px;
    line-height: 30px;
    color: #777;
    font-weight: 200;
    width: 30px;
    text-align: center;
    background: #000;
    border-left: solid 1px #333;
    border-right: solid 1px #333;
  }

  textarea.handler {
    width: 100%;
    resize: none;
    background-color: #272822;
    color: #F8F8F2;
    border: none;
    border-radius: 0;
    padding: 10px;
  }

  .handler-group {
    padding: 10px 15px 15px;
    width: auto;
    height: auto;
    position: relative;
  }

  .odd {
    color: #222;
    background: #aaa;
  }

  .even {
    color: #444;
    background: #ccc;
  }

  .top {
    height: 20px;
  }

  .index, .controls {
    font-size: 18px;
    line-height: 18px;
    float: left;
  }

  .controls {
    float: right;
  }


</style>
