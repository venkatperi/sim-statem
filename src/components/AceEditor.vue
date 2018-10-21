<template>
  <div :id="name"></div>
</template>

<script>
  const ace = require( 'brace' )
  const uniqid = require( 'uniqid' )

  const props = ['theme', 'mode', 'value']

  const watch = {}
  props.forEach( ( p ) =>
    watch[p] = function ( v ) {
      this.editor[p] = v
    } )

  export default {
    name: 'AceEditor',

    props: {
      name: {
        type: String,
        default: () => uniqid(),
      },
      theme: String,
      mode: String,
      value: {
        type: String,
        default: '',
      },
    },

    data: function () {
      return {
        editor: {
          ace: undefined,
          theme: undefined,
          mode: undefined,
          value: '',
        },
      }
    },

    computed: {
      ace() {
        return this.editor.ace
      },

      session() {
        return this.ace.session
      },
    },

    watch: Object.assign( {}, watch, {
      'editor.theme': function ( v ) {
        this.ace.setTheme( `ace/theme/${v}` )
      },

      'editor.mode': function ( v ) {
        this.session.setMode( `ace/mode/${v}` )
      },

      'editor.value': function ( v ) {
        this.setValue( v, 1 )
      },
    } ),

    mounted() {
      this.init()
    },

    methods: {
      init: function () {
        this.editor.ace = ace.edit( this.name )
        this.ace.$blockScrolling = Infinity //fix annoying warning

        props.forEach( ( p ) => {
          this.editor[p] = this[p]
        } )
      },

    },
  }
</script>

<style scoped>

</style>
