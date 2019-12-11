import Vue from 'vue';
// import 'leaflet/dist/leaflet.css'
import { LControlScale, LPolyline, LMap, LCircleMarker } from "vue2-leaflet";
import Vue2LeafletAxesGrid from "vue2-leaflet-axesgrid";

const VueLeaflet = {

  install(Vue, options) {
    Vue.component('l-map', LMap)
    Vue.component('l-circle-marker', LCircleMarker)
    Vue.component('l-control-scale', LControlScale)
    Vue.component('l-polyline', LPolyline)
    Vue.component('v-axesgrid', Vue2LeafletAxesGrid)
  }

};

Vue.use(VueLeaflet);

export default VueLeaflet;