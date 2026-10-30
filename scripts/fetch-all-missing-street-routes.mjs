import fs from 'fs';
import path from 'path';
import https from 'https';
import createJiti from 'jiti';

const jiti = createJiti(path.join(process.cwd(), 'index.js'));
const { SINGAPORE_CITY, TOKYO_CITY, NEW_YORK_CITY } = jiti('./src/lib/cityData');
const { lookupStreetRoute } = jiti('./src/lib/pathfinding');

function fetchRoute(fromLng, fromLat, toLng, toLat) {
  return new Promise((resolve) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    https.get(url, { headers: { 'User-Agent': 'RoboFlow-OSRM-Fetcher/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 'Ok' && json.routes && json.routes[0]) {
            const coords = json.routes[0].geometry.coordinates.map(c => [+c[1].toFixed(5), +c[0].toFixed(5)]);
            resolve(coords);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Starting OSRM street route fetcher for missing edges...');
  const cities = [SINGAPORE_CITY, TOKYO_CITY, NEW_YORK_CITY];
  const newRoutes = {};

  for (const city of cities) {
    console.log(`\nChecking city: ${city.name}...`);
    const seen = new Set();
    for (const n of city.roadNodes) {
      for (const nbId of n.neighbors) {
        const nb = city.roadNodes.find(x => x.id === nbId);
        if (!nb) continue;
        const pairKey = [n.id, nb.id].sort().join('<->');
        if (seen.has(pairKey)) continue;
        seen.add(pairKey);

        const existing = lookupStreetRoute(n.lat, n.lng, nb.lat, nb.lng);
        if (!existing || existing.length === 0) {
          process.stdout.write(`  Fetching ${n.id} (${n.name}) <-> ${nb.id} (${nb.name})... `);
          const forwardCoords = await fetchRoute(n.lng, n.lat, nb.lng, nb.lat);
          if (forwardCoords && forwardCoords.length > 0) {
            const forwardKey = `${n.lat.toFixed(4)},${n.lng.toFixed(4)}->${nb.lat.toFixed(4)},${nb.lng.toFixed(4)}`;
            const reverseKey = `${nb.lat.toFixed(4)},${nb.lng.toFixed(4)}->${n.lat.toFixed(4)},${n.lng.toFixed(4)}`;
            newRoutes[forwardKey] = forwardCoords;
            newRoutes[reverseKey] = [...forwardCoords].reverse();
            console.log(`✅ ${forwardCoords.length} pts`);
          } else {
            console.log(`⚠️ Failed`);
          }
          await sleep(150); // Be respectful to public OSRM server
        }
      }
    }
  }

  const newKeyCount = Object.keys(newRoutes).length;
  console.log(`\n🎉 Total new street route keys collected: ${newKeyCount}`);

  if (newKeyCount > 0) {
    console.log('Appending new routes to src/lib/streetGeometry.ts...');
    const geomFilePath = path.join(process.cwd(), 'src/lib/streetGeometry.ts');
    let geomContent = fs.readFileSync(geomFilePath, 'utf8');

    // Find the end of PRECOMPUTED_STREET_ROUTES object: '};\n'
    const lastBraceIdx = geomContent.lastIndexOf('};');
    if (lastBraceIdx > 0) {
      let appendStr = '';
      for (const [key, coords] of Object.entries(newRoutes)) {
        appendStr += `,\n  "${key}": ${JSON.stringify(coords)}`;
      }
      geomContent = geomContent.slice(0, lastBraceIdx) + appendStr + '\n' + geomContent.slice(lastBraceIdx);
      fs.writeFileSync(geomFilePath, geomContent, 'utf8');
      console.log('✅ src/lib/streetGeometry.ts successfully updated with full OSRM road geometry!');
    } else {
      console.error('❌ Could not locate closing brace of PRECOMPUTED_STREET_ROUTES in streetGeometry.ts');
    }
  }
}

run();
