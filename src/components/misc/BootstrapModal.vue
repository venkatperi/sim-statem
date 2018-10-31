<!-- // Copyright 2018, Venkat Peri. -->
<!-- // -->
<!-- // Permission is hereby granted, free of charge, to any person obtaining a -->
<!-- // copy of this software and associated documentation files (the -->
<!-- // "Software"), to deal in the Software without restriction, including -->
<!-- // without limitation the rights to use, copy, modify, merge, publish, -->
<!-- // distribute, sublicense, and/or sell copies of the Software, and to permit -->
<!-- // persons to whom the Software is furnished to do so, subject to the -->
<!-- // following conditions: -->
<!-- // -->
<!-- // The above copyright notice and this permission notice shall be included -->
<!-- // in all copies or substantial portions of the Software. -->
<!-- // -->
<!-- // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS -->
<!-- // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF -->
<!-- // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN -->
<!-- // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, -->
<!-- // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR -->
<!-- // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE -->
<!-- // USE OR OTHER DEALINGS IN THE SOFTWARE. -->

<template>
  <div>
    <b--modal v-bind="$attrs" v-model="showModal">
      <slot></slot>
    </b--modal>
  </div>
</template>

<script>
  import BModal from 'bootstrap-vue/src/components/modal/modal'
  import Vue from 'vue'
  import Bussed from '../../traits/Bussed';
  import Named from '../../traits/Named';

  export default Vue.extend( {
    name: 'BootstrapModal',
    mixins: [
      Named,
      Bussed,
    ],

    components: {
      'b--modal': BModal,
    },

    data: function () {
      return {
        showModal: false,
      }
    },

    mounted() {
      let self = this
      if ( this.bus ) {
        this.bus.$on( `${this.name}:hide`, () => self.hide() )
        this.bus.$on( `${this.name}:show`, () => self.show() )
      }
    },

    methods: {
      show() {
        this.showModal = true
        if ( this.bus )
          this.bus.$emit( `${this.name}:refresh` )
      },

      hide() {
        this.showModal = false
      },
    },
  } )

</script>

<style lang="scss" scoped>

</style>
