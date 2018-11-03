<template>
  <div class="row menu p-0 m-0 mb-1">
    <div class="col-auto float-left align-middle pl-2">
      <Login id="login" />
      <div class="brand">
        GEN-StateM SIM
      </div>
    </div>

    <div class="col ">
      <div class="controls">
        <div class="control" title="Show Code">
          <v-icon name="code" />
          <label>Code</label>
        </div>
        <div class="control" title="Save">
          <v-icon name="regular/save" />
          <label>Save</label>
        </div>
      </div>

      <div class="float-right controls">
        <div v-if="!isAuthenticated"
             class="control"
             v-b-modal.login
             title="Login">
          <v-icon name="sign-in-alt" />
          <label>Sign in</label>
        </div>
        <div v-else>
          <span>{{ userName }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
    import { Component } from "av-ts";
    import Vue from 'vue'
    import Login from './user/Login.vue'

    @Component({
        name: 'app-menu',
        components: {
            Login,
        },
    })
    export default class AppMenu extends Vue {
        get isAuthenticated(): boolean {
            return !!this.$store.state.user.uid
        }

        get userName(): string {
            let user = this.$store.state.user
            console.log(user)
            return user.name || ''
        }

    }

</script>


<style lang="scss" scoped>

  @import '../styles/theme';

  $height: 60px;

  .menu {
    font-family: $display_font, sans-serif;
    height: $height;
    box-shadow: 0 0 5px rgba(28, 33, 40, 0);
    background: #1c2128;
  }

  .brand {
    display: inline-block;
    color: darken(#619ee6, 20%);
    margin-bottom: 0;
    font-weight: 400;
    font-size: 1.1em;
    line-height: $height;
    text-transform: uppercase;
  }

  .controls {
    font-size: 0.9em;
    display: inline-block;
    svg {
      position: relative;
      top: -1px;
      color: $lighter;
    }
  }

  .control {
    display: inline-block;
    vertical-align: middle;
    height: $height;
    line-height: $height;
    margin-right: 10px;
    &:hover {
      border-bottom: solid 1px #0084ff;
    }
  }

</style>
