<!--suppress TypeScriptValidateTypes -->
<template>
  <div :class="['handler-group', 'list-group-item']">
    <div class="controls-area" @dblclick="toggleCollapse">
      <span class="expander icon" @click="toggleCollapse">
        <v-icon :name="collapsed?'caret-right':'caret-down'" scale="1.3" />
      </span>
      <span class="index" v-html="index + 1"></span>
      <div class="icons">
        <span class="icon" @click="toggleVisible()">
          <v-icon name="eye-slash" />
        </span>
        <span class="icon" @click="$emit('test')">
          <v-icon name="vial" />
        </span>
        <span class="icon" @click="remove">
          <v-icon name="times-circle" />
        </span>
      </div>
    </div>

    <div :class="['route', collapsed?'hide':'']">
      <input :class="['event', eventValid?'':'error']"
             v-model="event"
             placeholder="event"
             v-resize-on-input
             v-resize-on-value />

      <span class="hash">

        <v-icon name="hashtag" />
      </span>
      <input class="context " v-model="context" placeholder="context" />

      <span class="hash">
        <v-icon name="hashtag" />
      </span>
      <input class="state" v-model="state" placeholder="state" />
    </div>
    <div :class="[collapsed?'hide':'']">
      <CodeMirror v-model="handler"
                  ref="handler"
                  :name="name"
                  mode="javascript"
                  theme="midnight"
                  :x-bus="bus"
                  @blur="format"
                  :gutters='[ "errors", "CodeMirror-linenumbers"]'
                  :lineNumbers="true" />
    </div>
  </div>
</template>

<script lang="ts">
    import { Component, Lifecycle, Mixin, p, Prop, Watch } from "av-ts";
    import Vue from 'vue'
    import { Handler } from "../../store/sm/Handler";
    import Bussed from "../../traits/Bussed";
    import Named from "../../traits/Named";
    import { format, handlerRoute } from '../../util'
    import VueErrorMarker from '../misc/ErrorMarker.vue'
    import CodeMirror from '../misc/VueCodeMirror.vue'

    const events: string[] = [
        "cast",
        "eventTimeout",
        "stateTimeout",
        "genericTimeout",
        "enter",
        "internal"
    ];

    const validateEvent = (e: string) => {
        return events.indexOf(e) >= 0 || e.startsWith("call");
    };


    @Component({
        name: "Handler",
        inheritAttrs: false,
        components: {
            CodeMirror
        }
    })
    export default class VueHandler extends Mixin(Named, Bussed) {
        bus!: Vue

        name!: string

        event = ""

        context = ""

        state = ""

        route = ""

        handler = ""

        visible = true

        collapsed = false

        $messageBox!: (title: string, message: string) => Promise<any>

        @Prop value = p({
            type: Object,
            required: true
        });

        @Prop index = p({type: Number})

        @Prop odd = p({
            type: Boolean,
            default: false
        });

        @Lifecycle
        created() {
            this.valueChanged();
            this.bus.$on('handler:collapse', () => this.collapsed = true)
        }

        @Watch("value")
        watchValue() {
            this.valueChanged();
        }

        @Watch("event")
        watchEvent() {
            this.updateRoute();
        }

        @Watch("context")
        contextChanged() {
            this.updateRoute();
        }

        @Watch("state")
        stateChanged() {
            this.updateRoute();
        }

        @Watch("route")
        watchRoute() {
            this.emitHandler();
        }

        @Watch("handler")
        watchHandler() {
            this.emitHandler();
        }

        get eventValid(): boolean {
            return validateEvent(this.event)
        }

        async remove() {
            try {
                let res = await this.$messageBox('Delete Handler',
                    `Are you sure you want to delete handler #${this.index}`)
                this.$emit('remove')
            } catch (e) {

            }
        }

        format() {
            try {
                this.handler = format(this.handler)
                this.bus.$emit(`${this.name}:clearGutter`, 'errors')
            } catch (e) {
                console.log(this.name)
                let marker = new VueErrorMarker({
                    propsData: {title: e.message}
                })
                marker.$mount()
                console.log(marker)
                this.bus.$emit(`${this.name}:addMarker`,
                    Number(e.loc.start.line) - 1, "errors",
                    // errorMarker(e.message))
                    marker.$el)
            }
        }

        updateRoute() {
            this.route = handlerRoute(this)
        }

        valueChanged(): void {
            let v = this.value as Handler
            this.event = v.event
            this.context = v.context
            this.state = v.state
            this.handler = v.handler
        }

        emitHandler() {
            this.$emit("input", {
                event: this.event,
                context: this.context,
                state: this.state,
                handler: this.handler
            });
        }

        toggleVisible() {
            this.visible = !this.visible
            this.$emit('visible', this.visible)
        }

        toggleCollapse() {
            this.collapsed = !this.collapsed
        }
    }
</script>

<style type="scss" scoped>
  @import '../../styles/theme';

  input {
    border: none;
    &:focus {
      box-shadow: inset 0 0 6px $highlight_color;
    }
  }

  .route {
    margin-top: 0;
    width: 100%;
    display: flex;
    border: none;
  }

  input.error {
    border: solid 1px red;
  }

  .event,
  .context,
  .state {
    font-family: $code_font, monospace;
    font-weight: 500;
    font-size: 0.9rem;
    height: 32px;
    line-height: 32px;
    text-align: center;
    background-color: $code_bg;
    color: lighten(#736D90, 10%);
    flex-grow: 1;
  }

  .event,
  .state {
    width: 100px;
  }

  .event {
    border-left: solid 1px $code_bg;
  }

  .state {
    border-right: solid 1px $code_bg;
  }

  .context {
    /*flex-grow: 1;*/
  }

  .hash {
    line-height: 30px;
    color: $less_neutral;
    font-weight: 200;
    width: 30px;
    text-align: center;
    background: $darkest;
    border-bottom: solid 1px $dark;
    border-top: solid 1px $bg_color;
  }

  .handler {
    width: 100%;
    resize: none;
    background-color: $code_bg;
    color: $text_color;
    border-top-left-radius: 15px;
    padding: 10px 20px;
  }

  .handler-wrapper {
    height: auto;
    width: auto;
  }

  .handler-group {
    padding: 0;
    width: auto;
    height: auto;
    background: $bg_color;
    border-radius: 0 !important;
    border: none;
    border-top: solid 1px $neutral;
    border-bottom: solid 1px $dark;
    &:last-child {
      border-bottom: solid 1px $dark;
    }
  }

  .controls-area {
    font-family: $display_font;
    height: 25px;
    padding: 0 20px;
    line-height: 20px;
    margin-top: 5px;
    border: none;
    border-radius: 0 !important;
  }

  .index,
  .controls {
    font-size: 16px;
    font-weight: bold;
    color: $darkest;
  }

  .icons {
    float: right;
    font-size: 1.1em;
  }

  .icon {
    color: $darkest;
    &:hover {
      color: $lighter;
    }
  }

  .expander {
    width: 20px;
    height: 25px;
    display: inline-block;
  }

  .hide {
    display: none;
    visibility: collapse;
  }

</style>

<style lang="scss">
  @import '../../styles/theme';

  #handlers .CodeMirror {
    @extend %codemirror-common;

    &.CodeMirror-focused {
      box-shadow: inset 0 0 6px $highlight_color;
    }
  }

</style>
