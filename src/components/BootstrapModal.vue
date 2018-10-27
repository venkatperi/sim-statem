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
  import Bussed from '../traits/Bussed';
  import Named from '../traits/Named';

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
      this.bus.$on( `${this.name}:hide`, () => self.hide() )
      this.bus.$on( `${this.name}:show`, () => self.show() )
    },

    methods: {
      show() {
        this.showModal = true
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
