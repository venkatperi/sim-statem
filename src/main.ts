import { library } from "@fortawesome/fontawesome-svg-core";
import { faGithub, faWikipediaW } from "@fortawesome/free-brands-svg-icons";
import {
    faEye, faEyeSlash, faFile, faHashtag, faLink, faPlus, faSave, faTimesCircle,
    faVial
} from "@fortawesome/free-solid-svg-icons";
import Vue from "vue";
import VueRouter from "vue-router";
import { vueResizeDirective } from '../../vue-resize-on-event/src/VueResizeOnEvent'
import App from "./components/App.vue";
import AppCore from "./components/AppCore.vue";
import AppFooter from "./components/AppFooter.vue";
import AppMenu from "./components/AppMenu.vue";

const {FontAwesomeIcon} = require("@fortawesome/vue-fontawesome");

library.add(faGithub, faWikipediaW, faLink, faTimesCircle, faPlus, faVial,
    faSave, faFile, faHashtag, faEye, faEyeSlash);
Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.config.productionTip = false;

for (let event of ['input', 'value']) {
    Vue.directive(`resize-on-${event}`, vueResizeDirective(event))
}

const appComponents = {
    core: AppCore,
    header: AppMenu,
    main: App,
    footer: AppFooter
};

let router = new VueRouter({
    routes: [{path: "/:args*", components: appComponents}]
});

Vue.use(VueRouter);

new Vue({
    router,
    el: "#app"
});
