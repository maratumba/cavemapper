export function degToRad(deg){
  return deg * Math.PI / 180;
}

export function sphToCart(r,th,ph){
  var dx = r * Math.cos(degToRad(ph)) * Math.sin(degToRad(th))
  var dy = r * Math.cos(degToRad(ph)) * Math.cos(degToRad(th))
  var dz = r * Math.sin(degToRad(ph))
  return {dx, dy, dz}
}

export function distPtoL(P1, P2, p){
  var [x1, y1] = P1;
  var [x2, y2] = P2;
  var [xp, yp] = p;

}
// source: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) + sqr(v.z - w.z) }
function distToSegmentSquared(p, v, w) {
var l2 = dist2(v, w);
if (l2 == 0) return dist2(p, v);
var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)+ (p.z - v.z) * (w.z - v.z)) / l2;
t = Math.max(0, Math.min(1, t));
return dist2(p, { x: v.x + t * (w.x - v.x),
                  y: v.y + t * (w.y - v.y),
                  z: v.z + t * (w.z - v.z),
               });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }


function proj2Segment(p, v, w){
  
}