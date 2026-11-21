const ALLOWED_STATIONS = new Set([
  'EIDW', 'KBOS', 'MMUN', 'KORD', 'KCLE', 'KBDL', 'KIND', 'KLAX', 'KMIA', 'KBNA',
  'KJFK', 'KEWR', 'KMCO', 'KPHL', 'KPIT', 'KRDU', 'KSFO', 'KSEA', 'CYYZ', 'KIAD'
]);

export async function onRequestGet({ request }) {
  const requestedIds = new URL(request.url).searchParams.get('ids')
    ?.split(',').map(id => id.trim().toUpperCase()).filter(Boolean) || [];
  const stationIds = [...new Set(requestedIds)];

  if (!stationIds.length || stationIds.length > 2 || stationIds.some(id => !ALLOWED_STATIONS.has(id))) {
    return json({ error: 'Select a supported origin and destination airport.' }, 400, 'no-store');
  }

  const apiUrl = new URL('https://aviationweather.gov/api/data/metar');
  apiUrl.searchParams.set('ids', stationIds.join(','));
  apiUrl.searchParams.set('format', 'json');
  apiUrl.searchParams.set('hours', '3');

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AerKit flight weather display'
      },
      cf: { cacheTtl: 300, cacheEverything: true }
    });

    if (response.status === 204) return json({ observations: [] }, 200, 'public, max-age=60');
    if (!response.ok) return json({ error: 'Airport weather is temporarily unavailable.' }, 502, 'no-store');

    const upstream = await response.json();
    if (!Array.isArray(upstream)) return json({ error: 'Airport weather data could not be read.' }, 502, 'no-store');

    const observations = upstream
      .filter(item => stationIds.includes(String(item.icaoId || '').toUpperCase()))
      .map(item => ({
        icaoId: item.icaoId,
        name: item.name,
        reportTime: item.reportTime,
        obsTime: item.obsTime,
        temperatureC: item.temp,
        dewpointC: item.dewp,
        windDirection: item.wdir,
        windSpeedKt: item.wspd,
        windGustKt: item.wgst,
        visibilityMiles: item.visib,
        weather: item.wxString,
        cloudCover: item.cover,
        clouds: Array.isArray(item.clouds) ? item.clouds.map(layer => ({ cover: layer.cover, base: layer.base })) : []
      }));

    return json({ observations }, 200, 'public, max-age=300, s-maxage=300');
  } catch {
    return json({ error: 'Airport weather is temporarily unavailable.' }, 502, 'no-store');
  }
}

function json(body, status, cacheControl) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl
    }
  });
}
