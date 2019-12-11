<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn depressed color="primary" text>Export PLY</v-btn>
        <v-btn depressed text color="primary">Import</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" xs="12">
        <table @paste.prevent="pasteText" id="data-table" cellspacing="0" class="font-weight-regular">
          <thead>
            <th class="font-weight-light text-left" v-for="(h,i) in headers" :key="`header-${h.name}`">{{h.text}}</th>
          </thead>
          <tbody>
            <tr v-for="(v,i) in sVectors" :key="`${v.f}-${v.t}`">
              <td :class="{'has-error': !h.v(v[h.name])}" v-for="(h,j) in headers" :key="h.name">
                <input :ref="'data'" :tabindex="`${i*headers.length + j + 1}`" v-model="v[h.name]" />
              </td>
            </tr>
            <tr>
              <td :class="{'has-error': !h.v(v0[h.name])}" v-for="(h,i) in headers" :key="`v0-${h.name}`">
                <input
                  :ref="'data'"
                  @keydown="addVectorOnTabIfLastCol($event,i)"
                  v-model="v0[h.name]"
                  :tabindex="`${sVectors.length*headers.length + i + 1}`"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </v-col>
      <v-col md="6" xs="12">
        <client-only>
          <mapp :lines="latlngs" :points="wallPoints"></mapp>
        </client-only>
        <table id="point-table" cellspacing="0">
          <thead>
            <tr>
              <th class="font-weight-light">x</th>
              <th class="font-weight-light">y</th>
              <th class="font-weight-light">z</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p,i) in wallPoints" :key="i">
              <td>{{Math.round(p.x*1000)/1000}}</td>
              <td>{{Math.round(p.y*1000)/1000}}</td>
              <td>{{Math.round(p.z*1000)/1000}}</td>
            </tr>
          </tbody>
        </table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { sphToCart } from "~/assets/utils/survey";
import Mapp from "~/components/Mapp.vue";
import ImportTable from "~/components/ImportTable.vue";

export default {
  name: "EditTable",
  components: {
    Mapp,
    ImportTable
  },
  data: function() {
    return {
      baseTabIndex: 100,
      showImportDialog: true,
      importedData: null,
      dimStation: "f",
      sVectors: [],
      stations: {},
      latlngs: [],
      headers: [
        { name: "f", type:'string', text: "From", maxWidthFr: "3", v: v => true },
        { name: "t", type:'string', text: "To", maxWidthFr: "3", v: v => true },
        { name: "r", type:'float', text: "Dist", maxWidthFr: "4", v: v => !isNaN(parseFloat(v)) && parseFloat(v) > 0},
        { name: "th", type:'float', text: "Comp", maxWidthFr: "4", v: v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0 && parseFloat(v)<=360},
        { name: "ph", type:'float', text: "Inc", maxWidthFr: "4", v: v => !isNaN(parseFloat(v)) && parseFloat(v) >= -90 && parseFloat(v)<=90 },
        { name: "U", type:'float', text: "Up", maxWidthFr: "4", v: v => !v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0) },
        { name: "D", type:'float', text: "Down", maxWidthFr: "4", v: v => !v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0) },
        { name: "L", type:'float', text: "Left", maxWidthFr: "4", v: v => !v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0) },
        { name: "R", type:'float', text: "Right", maxWidthFr: "4", v: v =>!v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0) },
      ],
      v0: []
    };
  },
  computed: {
    colWidths: function(h) {
      var sum = this.headers.reduce(
        (acc, h) => acc + parseFloat(h.maxWidthFr),
        0
      );
      return this.headers.map(h => `${(h.maxWidthFr / sum) * 100}%`);
    },
    cVectors: function() {
      if (!Array.isArray(this.sVectors)) return [];
      var cVectors = [];
      this.sVectors.forEach(v => {
        var V = {...v}
        for(var h of this.headers) {
          if(h.type==='float') V[h.name] = parseFloat(V[h.name])
        };
        var dv = this.sphToCart(V);
        if (dv) cVectors.push({ ...V, ...dv });
      });
      return cVectors;
    },
    baseStation: function() {
      return this.sVectors.length > 0
        ? this.sVectors[0][this.dimStation]
        : null;
    },
    wallShots: function() {
      let wallShots = this.cVectors.filter(v => v.f && !v.t);
      return wallShots ? wallShots : [];
    },
    wallVectors: function() {
      if (!Array.isArray(this.cVectors)) return [];
      var udlr = [];
      var udlrV = null;
      this.cVectors.forEach(v => {
        for (let w of ["U", "D", "L", "R"]) {
          if(v[w]){
            udlrV = this.udlrVector(v, w);
            if (udlrV) udlr.push(udlrV);
          }
        }
      });
      return this.wallShots.concat(udlr);
      // return udlr;
    },
    wallPoints: function() {
      if (!Array.isArray(this.wallVectors)) return [];
      return this.wallVectors.map(v => {
        let x = this.stations[v.f].x + v.dx;
        let y = this.stations[v.f].y + v.dy;
        let z = this.stations[v.f].z + v.dz;
        return { x, y, z };
      });
    }
  },
  watch: {
    cVectors: function() {
      this.stations = this.createStationDict();
      this.calcStationCoordsRec(this.baseStation);
      // console.log('watch the watchers');
      console.log(JSON.stringify(this.stations))
      this.latlngs = this.calcLatlngs();
      console.log(this.latlngs)
    }
  },
  methods: {
    dataAreValid: function(val, i){
      this.sVectors.reduce( (acc,v) => acc && v.isValid, true)
    },
    vectorIsValid: function(v){
      return this.headers.reduce( (acc,h) => acc && h.v(v[h.name]), true);
    },
    arrayToVector: function(a){
      return a.reduce( (acc,c,i) => {
        if(c){
          acc[this.headers[i].name] = c
        }
        return acc;
      },{})
    },
    pasteText: function(ev){
      var text = ev.clipboardData.getData('text');
      var lines = text.split('\n')
      var importedData = []
      lines.forEach( l => {
        var vars = l.split('\t');
        var v = this.arrayToVector(vars)
        if(this.vectorIsValid(v)){
          this.sVectors.push(v)
        }
      })
      // console.log(this.sVectors);
      // text.split
    },
    udlrVector(V, dir) {
      var v = { ...V };
      // if (!V[dir]) return;
      if (dir === "U") {
        v.ph = 90;
        v.r = v.U;
      }
      if (dir === "D") {
        v.ph = -90;
        v.r = v.D;
      }
      if (dir === "L") {
        v.th = (v.th - 90 + 360) % 360;
        v.ph = 0;
        v.r = v.L;
      }
      if (dir === "R") {
        v.th = (v.th + 90) % 360;
        v.ph = 0;
        v.r = v.R;
      }
      v.n = dir;
      v.t = v.U = v.D = v.L = v.R = v.dx = v.dy = v.dz = null;
      v = this.addDv(v);
      // console.log('V,dir,v')
      // console.log(V,dir,v)
      return v;
    },
    calcLatlngs: function() {
      var latlngs = [];
      for (const v of this.cVectors) {
        // console.log(v.f, v.t)
        // console.log(this.stations)
        latlngs.push([
          [this.stations[v.f].y, this.stations[v.f].x],
          [this.stations[v.t].y, this.stations[v.t].x]
        ]);
      }
      return latlngs;
    },
    calcStationCoordsRec: function(st1) {
      if (!this.baseStation || !this.stations[st1]) return;
      if (this.baseStation === st1) {
        this.stations[st1].x = 0;
        this.stations[st1].y = 0;
        this.stations[st1].z = 0;
      }
      if (!this.stations[st1].children) return;
      for (const st2 of this.stations[st1].children) {
        // console.log(this.stations[st1])
        // console.log(st1, st2)
        // console.log(this.cVectors.find(vv => vv.f === st1 && vv.t === st2));
        var v = this.cVectors.find(vv => vv.f === st1 && vv.t === st2);
        // console.log("v");
        // console.log(v);
        this.stations[st2].x = this.stations[st1].x + v.dx; // should use vue.set
        this.stations[st2].y = this.stations[st1].y + v.dy; // should use vue.set
        this.stations[st2].z = this.stations[st1].z + v.dz; // should use vue.set
        this.calcStationCoordsRec(st2);
      }
    },
    createStationDict: function() {
      var stations = {};
      this.cVectors.forEach(v => {
        if (stations[v.f] && stations[v.f].children) {
          stations[v.f].children.push(v.t);
        } else {
          stations[v.f] = { children: [v.t] };
        }

        if (!stations[v.t]) {
          // leaf node
          stations[v.t] = {};
        }
      });
      return stations;
    },
    sphToCart: function(v) {
      // wrapper around util function
      if (isNaN(v.r) || isNaN(v.th) || isNaN(v.ph)) return;
      return sphToCart(parseFloat(v.r), parseFloat(v.th), parseFloat(v.ph));
    },
    addDv: function(v) {
      var dv = this.sphToCart(v);
      return { ...v, ...dv };
    },
    addVector: function() {
      this.sVectors.push({ ...this.v0 });
      this.v0 = this.emptyVector(this.headers);
    },
    addVectorOnTabIfLastCol: function(event, i) {
      if (
        i === this.headers.length - 1 &&
        (event.key === "Tab" || event.key === "Enter")
      ) {
        this.addVector();
        event.preventDefault();
        var lastLineRefI = this.sVectors.length * this.headers.length + 1
        this.$refs.data[lastLineRefI].focus();
      }
    },
    emptyVector: function(headers) {
      if (Array.isArray(headers))
        var v0 = headers.reduce((acc, h) => {
          acc[h.name] = null;
          return acc;
        }, {});
      return v0;
    }
  },
  mounted: function() {
    this.v0 = this.emptyVector(this.headers);
    console.log(this.$refs)
  }
};
</script>

<style lang="scss">
table#point-table{
  table-layout: fixed;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  td {
    border: solid rgba(100, 100, 100, 0.2) 1px;
    height: 2em;
  }
}

table#data-table {
  table-layout: fixed;
  width: 100%;
  border-spacing: 0px;
  border-collapse: collapse;
    th{
      padding-left: 5px;
    }
  tr {
    padding: 0px;
    margin: 0px;
    td {
      border: solid rgba(100, 100, 100, 0.2) 1px;
      height: 2em;
      // padding: 2px;
      //   margin: 0px;
      input {
        margin-left: 5px;
        margin-right: 5px;
        border: 0;
        padding: 0px;
        max-width: 90%;

      }
    }
    td.has-error {
      border-color: red;
      border-width: 2px;
      color: red;
    }
  }
}
</style>
