<template>
  <div>
      <l-map
        style="height: 400px; width: 100%"
        :zoom="zoom"
        :center="center"
        :options="{zoomControl: false}"
        :crs="crs"
        :minZoom="-10"
        ref="map"
      >
        <l-control-scale position="topright" :imperial="false" :metric="true"></l-control-scale>
        <v-axesgrid :options="opts"></v-axesgrid>
        <l-polyline :lat-lngs="[[-1,0],[1,0]]" color="green"></l-polyline>
        <l-polyline :lat-lngs="[[0,-1],[0,1]]" color="green"></l-polyline>
        <template v-for="(latlngs,i) in lines">
          <l-polyline :lat-lngs="latlngs" 
          :key="i" 
          color="blue"
          :weight="1"
          :opacity="0.6"
          ></l-polyline>
        </template>
        <template v-for="(latlng,j) in markers">
          <l-circle-marker 
          :lat-lng="latlng" 
          :key="`p_${j}`" 
          fillColor="green"
          :weight="1"
          :fillOpacity="1"
          :stroke="false"
          :radius="3"
          ></l-circle-marker>
        </template>
      </l-map>
  </div>
</template>

<script>
// if (process.client) {
//   // require('vue2-leaflet')
//   const Vue2LeafletAxesGrid = require('vue2-leaflet-axesgrid');
//   const { LControlScale, LGridLayer, LPolyline, LMap, LTileLayer, LMarker, LCircleMarker } = require("vue2-leaflet");
// }
// import { LControlScale, LGridLayer, LPolyline, LMap, LTileLayer, LMarker, LCircleMarker } from "vue2-leaflet";
// import Vue2LeafletAxesGrid from "vue2-leaflet-axesgrid";
// import "leaflet.axesgrid";

export default {
  name: "Mapp",
  props: ["lines", "points"],
  components: {
    // LMap,
    // // LTileLayer,
    // // LGridLayer,
    // LPolyline,
    // // "v-axesgrid": Vue2LeafletAxesGrid,
    // LControlScale,
    // LCircleMarker
    // LMarker,
  },
  computed: {
    markers: function() {
      return this.points.map(p => [p.y, p.x]);
    }
  },
  data: function() {
    return {
      url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
      zoom: 4,
      crs: L.CRS.Simple,
      center: [0, 0],
      opts: {
        cells: 20,
        showLabel: true,
        axesWidth: 10,
        axesColor: "red",
        label: {
          scale: 1,
          unit: "m",
          color: "green",
          size: 13
        }
      }
    };
  },
  mounted: function() {
    // this.$nextTick(() => {
    //   console.log(this.$refs.map)
    //   L.axesGrid({
    //     cells: 20,
    //     showLabel: true,
    //     axesWidth: 10,
    //     axesColor: 'red',
    //     label: {
    //       scale: 1,
    //       unit: "m",
    //       color: "green",
    //       size: 13,
    //     },
    //   }).addTo(this.$refs.map.mapObject);
    // })
  }
};
</script>

<style>
</style>