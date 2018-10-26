<template>
  <div>
    <b-modal
      v-bind="$attrs"
      v-model="display">
      <slot></slot>
    </b-modal>
  </div>
</template>

<script lang="ts">
    import { Component, p, Prop, Watch } from "av-ts";
    import BButton from 'bootstrap-vue/src/components/button/button'
    import BModal from 'bootstrap-vue/src/components/modal/modal'
    import BModalDirective from 'bootstrap-vue/src/directives/modal/modal'
    import Vue from 'vue';

    @Component({
        name: 'BootstrapModal.vue',
        inheritAttrs: false,
        components: {
            'b-modal': BModal,
            'b-btn': BButton,
        },
        directives: {
            'b-modal': BModalDirective,
        }
    })
    export default class BootstrapModal extends Vue {
        @Prop display = p(Boolean)

        @Watch('display')
        displayChanged() {
            this.$emit('input', this.display)
        }
    }
</script>

<style lang="scss" scoped>

</style>
