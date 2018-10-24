<template>
  <VueTerm />
</template>

<script lang="ts">
    import { Component } from "av-ts";
    import Vue from 'vue';
    import VueTerm from 'vue-term'

    @Component({
        name: 'VueXTerm',
        components: {
            VueTerm
        }
    })
    export default class VueXTerm extends Vue {

    }
</script>

<style scoped>

</style>
