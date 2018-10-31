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
    import Bussed from "../../traits/Bussed";
    import Named from "../../traits/Named";
    import Valued from "../../traits/Valued";
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
