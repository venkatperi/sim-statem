<template>
  <b-modal :name="name"
           :x-bus="bus"
           :title="title"
           size="lg">
    <!--suppress CheckEmptyScriptTag -->
    <VueCodeMirror :value="value"
                   :name="name"
                   mode="javascript"
                   theme="midnight"
                   :read-only="true"
                   :x-bus="bus"
                   :lineNumbers="true" />
  </b-modal>
</template>

<script lang="ts">
    import { Component, Mixin, p, Prop } from "av-ts";
    import Bussed from "../traits/Bussed";
    import Named from "../traits/Named";
    import Valued from "../traits/Valued";
    import BModal from './BootstrapModal.vue'
    import VueCodeMirror from './VueCodeMirror.vue'

    @Component({
        name: 'ShowCode',
        components: {
            VueCodeMirror,
            'b-modal': BModal
        },
    })
    export default class ShowCode extends Mixin(Named, Bussed, Valued) {
        @Prop title = p({
            type: String,
            required: true
        })
    }
</script>

<style lang="scss" scoped>

</style>
