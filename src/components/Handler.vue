<template>
  <div :class="[odd?'odd':'even', 'handler-group', 'list-group-item']">
    <div class="controls-area">
      <div class="index" v-html="index + 1"></div>
      <div class="icons">
        <span class="icon" @click="toggleVisible()">
          <font-awesome-icon :icon="visible?'eye':'eye-slash'" size="xs" />
        </span>
        <span class="icon" @click="$emit('test')">
          <font-awesome-icon icon="vial" size="xs" />
        </span>
        <span class="icon" @click="$emit('remove')">
          <font-awesome-icon icon="times-circle" size="xs" />
        </span>
      </div>
    </div>
    <div class="route">
      <input :class="['event', eventValid?'':'error']"
        v-model="event"
        placeholder="event" />
      <span class="hash">
          <font-awesome-icon icon="hashtag" size="xs" />
      </span>
      <input class="context "
        v-model="context"
        placeholder="context" />
      <span class="hash">
          <font-awesome-icon icon="hashtag" size="xs" />
      </span>
      <input class="prev "
        v-model="state"
        placeholder="state" />
    </div>
    <CodeEditor
      class="handler"
      placeholder="handler"
      language="javascript"
      v-model="handler" />
  </div>
</template>

<script lang="ts">
    import { Component, Lifecycle, p, Prop, Watch } from "av-ts";
    import Vue from "vue";
    import CodeEditor from "./CodeEditor";

    const HANDLER: RegExp = /\[([^,]+),(.*)]/;

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
        components: {
            CodeEditor
        }
    })
    export default class Handler extends Vue {
        event = ""

        context = ""

        state = ""

        route = ""

        handler = ""

        visible = true

        collapsed = false

        @Prop
        value = p({
            type: String,
            default: ""
        });

        @Prop
        index = p({type: Number})

        @Prop
        odd = p({
            type: Boolean,
            default: false
        });

        @Lifecycle
        created() {
            this.valueChanged();
        }

        @Watch("value")
        watchValue() {
            this.valueChanged();
        }

        @Watch("event")
        watchEvent() {
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

        updateRoute() {
            this.route = "\""
                + [this.event, this.context, this.state].join("#")
                + "\"";
        }

        valueChanged(): void {
            let match = HANDLER.exec(this.value);
            if (match && match.length >= 3) {
                this.handler = match[2].trimLeft();

                let route = match[1].replace(/['"]/g, "").trim();
                let parts = route.split("#");
                this.event = parts[0];
                this.context = parts[1];
                this.state = parts[2];
            }
        }

        emitHandler() {
            const value = `[${this.route}, ${this.handler}]`;
            this.$emit("input", value);
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
  @import '../styles/theme';

  $bg_color: lighten($dark, 10%);

  input, textarea {
    border: solid 1px $bg_color;
    &:focus {
      border: solid 1px $highlight_color;
      box-shadow: inset 0 0 7px $highlight_color;
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
  .prev {
    height: 32px;
    line-height: 32px;
    font-size: 17px;
    text-align: center;
    background-color: $code_bg;
    color: $text_color;
  }

  .event,
  .prev {
    width: 100px;
  }

  .context {
    flex-grow: 1;
  }

  .hash {
    line-height: 30px;
    color: $less_neutral;
    font-weight: 200;
    width: 30px;
    text-align: center;
    background: $darkest;
    border-bottom: solid 1px $bg_color;
    border-top: solid 1px $bg_color;
  }

  .handler {
    width: 100%;
    resize: none;
    background-color: $code_bg;
    color: $text_color;
    border-radius: 0;
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
    border: none;
    border-radius: 0 !important;
    background: $bg_color;
  }

  .controls-area {
    font-family: $display_font;
    height: 25px;
    padding: 0 20px;
    line-height: 20px;
    margin-top: 5px;
  }

  .index,
  .controls {
    font-size: 16px;
    font-weight: bold;
    color: $darkest;
    float: left;
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
</style>
