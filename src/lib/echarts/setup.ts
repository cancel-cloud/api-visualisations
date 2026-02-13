import * as echarts from "echarts";
import worldGeoJson from "geojson-world-map/lib/world.js";

let worldRegistered = false;

export function ensureWorldMap() {
  if (worldRegistered || echarts.getMap("world")) {
    worldRegistered = true;
    return true;
  }

  try {
    echarts.registerMap("world", worldGeoJson as unknown as never);
    worldRegistered = Boolean(echarts.getMap("world"));
    return worldRegistered;
  } catch {
    return false;
  }
}

ensureWorldMap();
