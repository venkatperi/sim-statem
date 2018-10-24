<template>
  <div class="container-fluid menu p-0 m-0 mb-1">
    <div class="row">
      <div class="brand col-auto float-left align-middle pl-5">
        gen-statem State Machine Simulator
      </div>

      <div class="col icon2 float-right text-right">
        <a class="icon" href="https://github.com/venkatperi/vue-flickr-app" target="_blank">
          <font-awesome-icon :icon="['fab', 'github']" size="1x" />
        </a>
      </div>

    </div>
  </div>
</template>

<script>
  import GithubLogo from '../images/github.svg';

  export default {
    name: 'app-menu',
    components: {
      GithubLogo,
    },
  }

</script>


<style lang="scss" scoped>

  @import '../styles/theme';

  .icon2 {
    margin-top: 5px;
  }

  .menu, .icon {
    color: lighten(#416CB6, 10%);
  }

  .menu {
    background: $darkest;
  }

  .brand {
    margin-bottom: 0;
    font-family: $display_font, sans-serif;
    font-weight: 200;
    font-size: 1.3em;
    line-height: 50px;
    text-transform: uppercase;
  }

  .nav-masthead {
    .nav-link {
      padding: .25rem 0;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.5);
      background-color: transparent;
      border-bottom: .25rem solid transparent;
      &:hover, &:focus {
      }
      + .nav-link {
        margin-left: 1rem;
      }
    }
    .active {
      color: #fff;
      border-bottom-color: #fff;
    }
  }

  .masthead-brand, .nav-masthead {
    text-align: center;
  }

  @media (min-width: 30rem) {
    .masthead-brand {
      float: left;
    }
    .nav-masthead {
      float: right;
    }
  }

</style>
