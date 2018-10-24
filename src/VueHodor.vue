<template>
  <div>Hodor</div>
</template>

<script lang="ts">
    import { Component, p, Prop, Watch } from "av-ts";
    import Vue from 'vue';

    @Component({
        name: 'VueHodor',
    })
    export default class Hodor extends Vue {
        @Prop value = p(String)

        @Watch('value')
        valueChanged() {
        }
    }
</script>

