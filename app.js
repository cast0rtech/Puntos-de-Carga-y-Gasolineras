/**
 * ============================================================================
 * EcoRoute Analytics - Application Core (app.js)
 * Step 2: Open Charge Map API Connection & Geographic Clustering Algorithm
 * ============================================================================
 */

// Global Application State
const state = {
  apiKey: '',
  country: 'ES',
  type: 'electric',
  highway: '',
  stations: [],
  filteredStations: [],
  isLoading: false,
  rawPoiCount: 0,
  clusteredCount: 0
};

// Residual distance threshold for clustering (meters)
// Points with distance <= 35m or identical coordinates are unified into a single physical Station
const CLUSTER_THRESHOLD_METERS = 35;

// Sample Raw Open Charge Map POI Dataset for testing & fallback demonstration
const SAMPLE_RAW_OCM_POIS = [
  // Two distinct connectors at the exact same location in Paterna (identical coordinates)
  {
    ID: 101,
    OperatorInfo: { Title: 'Tesla Supercharger' },
    AddressInfo: {
      Title: 'Tesla Supercharger Paterna Bay A',
      AddressLine1: 'Centro Comercial Heron City, Pista de Ademuz Salida 6-7',
      Town: 'Paterna',
      StateOrProvince: 'Valencia',
      Latitude: 39.521800,
      Longitude: -0.443100,
      AccessComments: 'Ubicado junto al parking A-7'
    },
    Connections: [
      { ConnectionType: { Title: 'CCS (Type 2)' }, PowerKW: 250, Quantity: 4 }
    ],
    NumberOfPoints: 4,
    StatusType: { Title: 'Operativo', IsOperational: true }
  },
  {
    ID: 102,
    OperatorInfo: { Title: 'Tesla Supercharger' },
    AddressInfo: {
      Title: 'Tesla Supercharger Paterna Bay B',
      AddressLine1: 'Centro Comercial Heron City, Pista de Ademuz Salida 6-7',
      Town: 'Paterna',
      StateOrProvince: 'Valencia',
      Latitude: 39.521800,
      Longitude: -0.443100,
      AccessComments: 'Ubicado junto al parking A-7'
    },
    Connections: [
      { ConnectionType: { Title: 'CCS (Type 2)' }, PowerKW: 250, Quantity: 4 }
    ],
    NumberOfPoints: 4,
    StatusType: { Title: 'Operativo', IsOperational: true }
  },
  // Two close points at Sagunto service area (within 15 meters)
  {
    ID: 201,
    OperatorInfo: { Title: 'Iberdrola Clientes' },
    AddressInfo: {
      Title: 'Iberdrola Sagunto A-7 Norte',
      AddressLine1: 'Área de Servicio A-7 Km 302, Margen Derecho',
      Town: 'Sagunto',
      StateOrProvince: 'Valencia',
      Latitude: 39.679100,
      Longitude: -0.278500,
      AccessComments: 'Autovía A-7 Sentido Castellón'
    },
    Connections: [
      { ConnectionType: { Title: 'CCS (Type 2)' }, PowerKW: 150, Quantity: 2 },
      { ConnectionType: { Title: 'CHAdeMO' }, PowerKW: 50, Quantity: 1 }
    ],
    NumberOfPoints: 3,
    StatusType: { Title: 'Operativo', IsOperational: true }
  },
  {
    ID: 202,
    OperatorInfo: { Title: 'Iberdrola' },
    AddressInfo: {
      Title: 'Iberdrola Sagunto A-7 Poste 2',
      AddressLine1: 'Área de Servicio A-7 Km 302',
      Town: 'Sagunto',
      StateOrProvince: 'Valencia',
      Latitude: 39.679190, // ~10 meters difference
      Longitude: -0.278480,
      AccessComments: 'Autovía A-7'
    },
    Connections: [
      { ConnectionType: { Title: 'Type 2 (Mennekes)' }, PowerKW: 22, Quantity: 2 }
    ],
    NumberOfPoints: 2,
    StatusType: { Title: 'Operativo', IsOperational: true }
  },
  // Repsol Petrol + Electric Hub (Alzira)
  {
    ID: 301,
    OperatorInfo: { Title: 'Repsol' },
    AddressInfo: {
      Title: 'Estación Repsol Alzira',
      AddressLine1: 'Autovía del Mediterráneo A-7, Km 372',
      Town: 'Alzira',
      StateOrProvince: 'Valencia',
      Latitude: 39.1524,
      Longitude: -0.4356,
      AccessComments: 'A-7 Salida Alzira'
    },
    Connections: [
      { ConnectionType: { Title: 'CCS (Type 2)' }, PowerKW: 50, Quantity: 2 }
    ],
    NumberOfPoints: 2,
    StatusType: { Title: 'Operativo', IsOperational: true }
  },
  // Endesa X Way (Alicante)
  {
    ID: 401,
    OperatorInfo: { Title: 'Endesa X Way' },
    AddressInfo: {
      Title: 'Endesa Hub Alicante',
      AddressLine1: 'Av. de Dénia 135 (Acceso A-70 / A-7)',
      Town: 'Alicante',
      StateOrProvince: 'Alicante',
      Latitude: 38.3614,
      Longitude: -0.4729,
      AccessComments: 'Salida A-7'
    },
    Connections: [
      { ConnectionType: { Title: 'CCS (Type 2)' }, PowerKW: 300, Quantity: 4 }
    ],
    NumberOfPoints: 4,
    StatusType: { Title: 'Operativo', IsOperational: true }
  },
  // Ionity Vila-real (Three separate posts at same coordinates)
  {
    ID: 501,
    OperatorInfo: { Title: 'Ionity' },
    AddressInfo: {
      Title: 'Ionity Vila-real Post 1',
      AddressLine1: 'Área de Descanso AP-7 / A-7 Km 447',
      Town: 'Vila-real',
      StateOrProvince: 'Castellón',
      Latitude: 39.937200,
      Longitude: -0.101200,
      AccessComments: 'Autovía AP-7 / A-7'
    },
    Connections: [
      { ConnectionType: { Title: 'CCS (Type 2)' }, PowerKW: 350, Quantity: 2 }
    ],
    NumberOfPoints: 2,
    StatusType: { Title: 'Operativo', IsOperational: true }
  },
  {
    ID: 502,
    OperatorInfo: { Title: 'Ionity' },
    AddressInfo: {
      Title: 'Ionity Vila-real Post 2',
      AddressLine1: 'Área de Descanso AP-7 / A-7 Km 447',
      Town: 'Vila-real',
      StateOrProvince: 'Castellón',
      Latitude: 39.937200,
      Longitude: -0.101200,
      AccessComments: 'Autovía AP-7 / A-7'
    },
    Connections: [
      { ConnectionType: { Title: 'CCS (Type 2)' }, PowerKW: 350, Quantity: 2 }
    ],
    NumberOfPoints: 2,
    StatusType: { Title: 'Operativo', IsOperational: true }
  },
  // Cepsa Fuel Station (Torrent)
  {
    ID: 601,
    OperatorInfo: { Title: 'Cepsa' },
    AddressInfo: {
      Title: 'Cepsa Torrent',
      AddressLine1: 'Autovía A-7 Km 344, Sentido Alicante',
      Town: 'Torrent',
      StateOrProvince: 'Valencia',
      Latitude: 39.4215,
      Longitude: -0.4820,
      AccessComments: 'A-7'
    },
    Connections: [],
    NumberOfPoints: 0,
    isFuel: true,
    StatusType: { Title: 'Operativo', IsOperational: true }
  },
  // Wenea Lorca
  {
    ID: 701,
    OperatorInfo: { Title: 'Wenea' },
    AddressInfo: {
      Title: 'Wenea La Hoya',
      AddressLine1: 'Autovía A-7 Km 591, Estación de Servicio La Hoya',
      Town: 'Lorca',
      StateOrProvince: 'Murcia',
      Latitude: 37.7123,
      Longitude: -1.6389,
      AccessComments: 'Salida A-7'
    },
    Connections: [
      { ConnectionType: { Title: 'CCS (Type 2)' }, PowerKW: 100, Quantity: 2 }
    ],
    NumberOfPoints: 2,
    StatusType: { Title: 'Operativo', IsOperational: true }
  }
];

// Sample Raw OpenStreetMap Fuel Nodes for demonstration & fallback of Step 3
const SAMPLE_RAW_OSM_FUELS = [
  {
    id: 21812709,
    lat: 39.152400,
    lon: -0.435600,
    tags: {
      amenity: 'fuel',
      brand: 'Repsol',
      name: 'Repsol Alzira',
      'addr:city': 'Alzira',
      'addr:street': 'Autovía del Mediterráneo A-7, Km 372',
      'fuel:diesel': 'yes',
      'fuel:octane_95': 'yes',
      'fuel:lpg': 'yes'
    }
  },
  {
    id: 22554715,
    lat: 39.421500,
    lon: -0.482000,
    tags: {
      amenity: 'fuel',
      brand: 'Cepsa',
      name: 'Cepsa Torrent',
      'addr:city': 'Torrent',
      'addr:street': 'Autovía A-7 Km 344, Sentido Alicante',
      'fuel:diesel': 'yes',
      'fuel:octane_95': 'yes'
    }
  },
  {
    id: 23991044,
    lat: 39.678900,
    lon: -0.278200,
    tags: {
      amenity: 'fuel',
      brand: 'BP',
      name: 'BP Estación Sagunto',
      'addr:city': 'Sagunto',
      'addr:street': 'Área de Servicio A-7 Km 302',
      'fuel:diesel': 'yes',
      'fuel:octane_95': 'yes',
      'fuel:octane_98': 'yes'
    }
  },
  {
    id: 24510982,
    lat: 39.522100,
    lon: -0.442900,
    tags: {
      amenity: 'fuel',
      brand: 'Galp',
      name: 'Galp Heron City',
      'addr:city': 'Paterna',
      'addr:street': 'Pista de Ademuz Salida 6-7 (Acceso A-7)',
      'fuel:diesel': 'yes',
      'fuel:octane_95': 'yes'
    }
  },
  {
    id: 25118763,
    lat: 39.937500,
    lon: -0.101500,
    tags: {
      amenity: 'fuel',
      brand: 'Shell',
      name: 'Shell Vila-real',
      'addr:city': 'Vila-real',
      'addr:street': 'Área de Descanso AP-7 / A-7 Km 447',
      'fuel:diesel': 'yes',
      'fuel:octane_95': 'yes',
      'fuel:lpg': 'yes'
    }
  },
  {
    id: 26883190,
    lat: 38.361900,
    lon: -0.472500,
    tags: {
      amenity: 'fuel',
      brand: 'Plenoil',
      name: 'Plenoil Alicante Norte',
      'addr:city': 'Alicante',
      'addr:street': 'Av. de Dénia 140 (Enlace A-70 / A-7)',
      'fuel:diesel': 'yes',
      'fuel:octane_95': 'yes'
    }
  }
];

// DOM Elements Cache
const DOM = {
  apiKeyInput: document.getElementById('apiKeyInput'),
  toggleApiKeyBtn: document.getElementById('toggleApiKeyBtn'),
  toggleApiKeyIcon: document.getElementById('toggleApiKeyIcon'),
  rememberApiKeyCheckbox: document.getElementById('rememberApiKeyCheckbox'),
  apiStatusBadge: document.getElementById('apiStatusBadge'),
  apiStatusText: document.getElementById('apiStatusText'),

  countrySelect: document.getElementById('countrySelect'),
  stationTypeSelect: document.getElementById('stationTypeSelect'),
  highwayInput: document.getElementById('highwayInput'),
  btnSearch: document.getElementById('btnSearch'),
  btnResetFilters: document.getElementById('btnResetFilters'),

  stationCountDisplay: document.getElementById('stationCountDisplay'),
  operatorCountDisplay: document.getElementById('operatorCountDisplay'),
  topOperatorDisplay: document.getElementById('topOperatorDisplay'),
  activeFilterDisplay: document.getElementById('activeFilterDisplay'),

  operatorStatsContainer: document.getElementById('operatorStatsContainer'),
  statsOperatorBadge: document.getElementById('statsOperatorBadge'),

  tableFilterInput: document.getElementById('tableFilterInput'),
  tableCounterBadge: document.getElementById('tableCounterBadge'),
  stationsTableBody: document.getElementById('stationsTableBody'),
  tableSummaryText: document.getElementById('tableSummaryText'),

  btnExportCSV: document.getElementById('btnExportCSV'),
  btnExportExcel: document.getElementById('btnExportExcel'),
  toastContainer: document.getElementById('toastContainer')
};

/* --------------------------------------------------------------------------
   Initialization
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initApiKeyManagement();
  bindFilterEvents();
  bindExportEvents();

  // Load and cluster initial demo dataset so UI is immediately rich & informative
  processAndDisplayData(SAMPLE_RAW_OCM_POIS, false);
});

/* --------------------------------------------------------------------------
   API Key Management
   -------------------------------------------------------------------------- */
function initApiKeyManagement() {
  const savedKey = localStorage.getItem('ocm_api_key');
  if (savedKey) {
    DOM.apiKeyInput.value = savedKey;
    DOM.rememberApiKeyCheckbox.checked = true;
    state.apiKey = savedKey;
    updateApiStatus(true);
  }

  DOM.toggleApiKeyBtn.addEventListener('click', () => {
    const isPassword = DOM.apiKeyInput.type === 'password';
    DOM.apiKeyInput.type = isPassword ? 'text' : 'password';
    DOM.toggleApiKeyIcon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  });

  DOM.apiKeyInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    state.apiKey = value;

    if (DOM.rememberApiKeyCheckbox.checked) {
      if (value) {
        localStorage.setItem('ocm_api_key', value);
      } else {
        localStorage.removeItem('ocm_api_key');
      }
    }
    updateApiStatus(!!value);
  });

  DOM.rememberApiKeyCheckbox.addEventListener('change', (e) => {
    if (e.target.checked && DOM.apiKeyInput.value.trim()) {
      localStorage.setItem('ocm_api_key', DOM.apiKeyInput.value.trim());
      showToast('API Key guardada en localStorage', 'info');
    } else {
      localStorage.removeItem('ocm_api_key');
    }
  });
}

function updateApiStatus(isConfigured) {
  if (isConfigured) {
    DOM.apiStatusBadge.classList.add('active');
    DOM.apiStatusText.textContent = 'API Key Configurada';
  } else {
    DOM.apiStatusBadge.classList.remove('active');
    DOM.apiStatusText.textContent = 'Configurar API Key';
  }
}

/* --------------------------------------------------------------------------
   Step 2: Geographic Clustering Algorithm & Open Charge Map Fetcher
   -------------------------------------------------------------------------- */

/**
 * Calculates Great-Circle distance between two coordinates in meters (Haversine formula).
 */
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const R = 6371000; // Earth radius in meters
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Extracts highway / motorway reference (e.g. A-7, AP-7, N-340, M-30) from text strings.
 */
function extractHighway(text) {
  if (!text) return '';
  const match = text.match(/\b(A|AP|N|M|B|C|SE|R|V|EX|CM|MA|CA|GR|SG|VA|TO|SA|SO|LE|ZA)[-\s]?\d{1,4}\b/i);
  if (!match) return '';
  const clean = match[0].toUpperCase().replace(/\s+/g, '-');
  return clean.includes('-') ? clean : clean.replace(/([A-Z]+)(\d+)/, '$1-$2');
}

/**
 * Normalizes and standardizes operator names from raw OCM feeds.
 */
function normalizeOperatorName(rawName, fallbackTitle = '') {
  const name = (rawName || '').trim();
  if (!name || name.toLowerCase().includes('(business owner)') || name.toLowerCase() === 'unknown operator') {
    // Attempt extracting from fallback Title (e.g. "Repsol Paterna")
    if (fallbackTitle) {
      if (/repsol/i.test(fallbackTitle)) return 'Repsol';
      if (/cepsa|moeve/i.test(fallbackTitle)) return 'Cepsa';
      if (/bp/i.test(fallbackTitle)) return 'BP';
      if (/galp/i.test(fallbackTitle)) return 'Galp';
      if (/shell/i.test(fallbackTitle)) return 'Shell';
      if (/plenoil/i.test(fallbackTitle)) return 'Plenoil';
      if (/ballenoil/i.test(fallbackTitle)) return 'Ballenoil';
      if (/petroprix/i.test(fallbackTitle)) return 'Petroprix';
      if (/campsa/i.test(fallbackTitle)) return 'Campsa';
      if (/petronor/i.test(fallbackTitle)) return 'Petronor';
      if (/avia/i.test(fallbackTitle)) return 'Avia';
      if (/disa/i.test(fallbackTitle)) return 'Disa';
      if (/iberdrola/i.test(fallbackTitle)) return 'Iberdrola';
      if (/tesla/i.test(fallbackTitle)) return 'Tesla Supercharger';
      if (/endesa/i.test(fallbackTitle)) return 'Endesa X Way';
      if (/ionity/i.test(fallbackTitle)) return 'Ionity';
      if (/wenea/i.test(fallbackTitle)) return 'Wenea';
      if (/total/i.test(fallbackTitle)) return 'TotalEnergies';
      if (/eni|agip/i.test(fallbackTitle)) return 'Eni';
      if (/zunder/i.test(fallbackTitle)) return 'Zunder';
    }
    return 'Operador Independiente';
  }

  // Major Fuel Brands
  if (/repsol/i.test(name)) return 'Repsol';
  if (/cepsa|moeve/i.test(name)) return 'Cepsa';
  if (/bp/i.test(name)) return 'BP';
  if (/galp/i.test(name)) return 'Galp';
  if (/shell/i.test(name)) return 'Shell';
  if (/plenoil/i.test(name)) return 'Plenoil';
  if (/ballenoil/i.test(name)) return 'Ballenoil';
  if (/petroprix/i.test(name)) return 'Petroprix';
  if (/campsa/i.test(name)) return 'Campsa';
  if (/petronor/i.test(name)) return 'Petronor';
  if (/avia/i.test(name)) return 'Avia';
  if (/disa/i.test(name)) return 'Disa';
  if (/eni|agip/i.test(name)) return 'Eni';

  // Major EV Operators
  if (/tesla/i.test(name)) return 'Tesla Supercharger';
  if (/iberdrola/i.test(name)) return 'Iberdrola';
  if (/endesa/i.test(name)) return 'Endesa X Way';
  if (/ionity/i.test(name)) return 'Ionity';
  if (/wenea/i.test(name)) return 'Wenea';
  if (/edp/i.test(name)) return 'EDP';
  if (/totalenergies|total/i.test(name)) return 'TotalEnergies';
  if (/zunder/i.test(name)) return 'Zunder';

  return name;
}

/**
 * CLUSTERING ALGORITHM (CRITICAL BUSINESS RULE)
 * Groups individual charging connectors/points with identical coordinates
 * or residual minimum geographic distance (< thresholdMeters) into a single physical Station object.
 *
 * @param {Array} rawPoiList - Raw points of interest from Open Charge Map
 * @param {number} thresholdMeters - Distance limit in meters to cluster (default: 35m)
 * @returns {Array} Array of unified physical Station objects
 */
function clusterChargingPoints(rawPoiList, thresholdMeters = CLUSTER_THRESHOLD_METERS) {
  if (!Array.isArray(rawPoiList) || rawPoiList.length === 0) {
    return [];
  }

  // Intermediate cluster groups: each element holds array of POIs grouped together
  const clusterGroups = [];

  rawPoiList.forEach((poi) => {
    const addr = poi.AddressInfo;
    if (!addr) return;

    const lat = typeof addr.Latitude === 'number' ? addr.Latitude : parseFloat(addr.Latitude);
    const lon = typeof addr.Longitude === 'number' ? addr.Longitude : parseFloat(addr.Longitude);

    if (isNaN(lat) || isNaN(lon) || lat === null || lon === null) {
      return; // Skip records without valid coordinates
    }

    // Search for an existing cluster within the threshold distance
    let targetCluster = null;
    let minDistance = Infinity;

    for (const cluster of clusterGroups) {
      const dist = haversineDistanceMeters(lat, lon, cluster.centroidLat, cluster.centroidLon);
      if (dist <= thresholdMeters && dist < minDistance) {
        minDistance = dist;
        targetCluster = cluster;
      }
    }

    if (targetCluster) {
      // Add POI to existing cluster & recalculate centroid
      targetCluster.pois.push(poi);
      const n = targetCluster.pois.length;
      targetCluster.centroidLat = ((targetCluster.centroidLat * (n - 1)) + lat) / n;
      targetCluster.centroidLon = ((targetCluster.centroidLon * (n - 1)) + lon) / n;
    } else {
      // Start a new cluster
      clusterGroups.push({
        centroidLat: lat,
        centroidLon: lon,
        pois: [poi]
      });
    }
  });

  // Consolidate each cluster group into a single Physical Station object
  const unifiedStations = clusterGroups.map((group, index) => {
    const pois = group.pois;
    const primaryPoi = pois[0];
    const primaryAddr = primaryPoi.AddressInfo || {};

    // Determine representative Operator (most frequent or primary)
    const operatorVotes = {};
    pois.forEach(p => {
      const opName = normalizeOperatorName(p.OperatorInfo?.Title, p.AddressInfo?.Title);
      operatorVotes[opName] = (operatorVotes[opName] || 0) + 1;
    });
    const topOperator = Object.entries(operatorVotes).sort((a, b) => b[1] - a[1])[0][0];

    // Determine Town & Address
    const town = primaryAddr.Town || primaryAddr.StateOrProvince || 'Municipio no especificado';
    
    // Choose the longest / most descriptive address
    let bestAddress = primaryAddr.AddressLine1 || primaryAddr.Title || 'Ubicación sin dirección postal';
    for (const p of pois) {
      const line = p.AddressInfo?.AddressLine1;
      if (line && line.length > bestAddress.length) {
        bestAddress = line;
      }
    }

    // Detect Highway from address, access comments, or title
    let detectedHighway = '';
    for (const p of pois) {
      const a = p.AddressInfo || {};
      const hw = extractHighway(a.AddressLine1) || extractHighway(a.AccessComments) || extractHighway(a.Title);
      if (hw) {
        detectedHighway = hw;
        break;
      }
    }

    // Aggregate physical connectors & maximum power kW
    let totalConnectors = 0;
    let maxPowerKW = 0;
    const connectorTypesSet = new Set();

    pois.forEach(p => {
      if (Array.isArray(p.Connections) && p.Connections.length > 0) {
        p.Connections.forEach(conn => {
          const qty = (typeof conn.Quantity === 'number' && conn.Quantity > 0) ? conn.Quantity : 1;
          totalConnectors += qty;

          if (conn.PowerKW && conn.PowerKW > maxPowerKW) {
            maxPowerKW = conn.PowerKW;
          }

          if (conn.ConnectionType?.Title) {
            connectorTypesSet.add(conn.ConnectionType.Title);
          }
        });
      } else if (typeof p.NumberOfPoints === 'number' && p.NumberOfPoints > 0) {
        totalConnectors += p.NumberOfPoints;
      } else {
        totalConnectors += 1;
      }
    });

    // Detect fuel vs electric
    const isFuelStation = pois.some(p => p.isFuel || (p.Connections && p.Connections.length === 0 && !p.NumberOfPoints));

    return {
      id: primaryPoi.ID || `cluster-${index + 1}`,
      clusterId: index + 1,
      operator: topOperator,
      town: town,
      address: bestAddress,
      highway: detectedHighway,
      lat: Number(group.centroidLat.toFixed(6)),
      lon: Number(group.centroidLon.toFixed(6)),
      type: isFuelStation ? 'fuel' : 'electric',
      connectorsCount: totalConnectors,
      maxPowerKW: maxPowerKW,
      connectorTypes: Array.from(connectorTypesSet),
      poiCount: pois.length, // Number of individual POIs merged into this station
      rawPoiIds: pois.map(p => p.ID),
      status: pois.some(p => p.StatusType?.IsOperational === false) ? 'Mantenimiento' : 'Operativo'
    };
  });

  return unifiedStations;
}

/**
 * Executes fetch to Open Charge Map API for charging stations.
 */
async function fetchOpenChargeMapData(apiKey, countryCode = 'ES', maxResults = 500) {
  const endpoint = new URL('https://api.openchargemap.io/v3/poi/');
  endpoint.searchParams.append('output', 'json');
  endpoint.searchParams.append('countrycode', countryCode);
  endpoint.searchParams.append('maxresults', maxResults.toString());
  endpoint.searchParams.append('compact', 'false');
  endpoint.searchParams.append('verbose', 'false');
  endpoint.searchParams.append('key', apiKey);

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(`API Key de Open Charge Map inválida o sin autorización (HTTP ${response.status}). Revisa la clave.`);
    }
    if (response.status === 429) {
      throw new Error('Límite de solicitudes de Open Charge Map alcanzado (Rate Limit). Espera un momento.');
    }
    throw new Error(`Error en el servidor de Open Charge Map: HTTP ${response.status} (${response.statusText})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Formato de respuesta inesperado de Open Charge Map.');
  }

  return data;
}

/**
 * Main coordinator to fetch data from API (or demo fallback) and execute clustering.
 */
async function loadAndProcessElectricStations() {
  const apiKey = state.apiKey.trim();

  // If no API Key is provided, guide user and cluster demo data
  if (!apiKey) {
    showToast('Introduce tu API Key para consultar datos reales en vivo. Mostrando datos de demostración con clustering.', 'warning');
    processAndDisplayData(SAMPLE_RAW_OCM_POIS, true);
    DOM.apiKeyInput.focus();
    return;
  }

  setLoadingState(true);

  try {
    showToast(`Consultando Open Charge Map (${state.country})...`, 'info');
    const rawData = await fetchOpenChargeMapData(apiKey, state.country, 500);

    state.rawPoiCount = rawData.length;
    processAndDisplayData(rawData, true);

    showToast(
      `Descargados ${state.rawPoiCount} puntos. Agrupados en ${state.clusteredCount} estaciones físicas mediante clustering.`,
      'success'
    );
  } catch (error) {
    console.error('Error al obtener datos de Open Charge Map:', error);
    showToast(error.message, 'error');
    // Fallback gracefully to demo clustering so the interface remains operational
    processAndDisplayData(SAMPLE_RAW_OCM_POIS, true);
  } finally {
    setLoadingState(false);
  }
}

/**
 * ============================================================================
 * Step 3: OpenStreetMap Overpass API Connection & Fuel Stations Handler
 * ============================================================================
 */

/**
 * Maps an OpenStreetMap node (amenity=fuel) directly to a unified Station object.
 * NOTE (Step 3 Business Rule): Each OSM node already represents a physical station.
 * Clustering is deliberately omitted here.
 */
function mapOsmFuelNodeToStation(node, index) {
  const tags = node.tags || {};

  // Determine Operator
  const rawBrand = tags.brand || tags.operator || tags.name || '';
  const operator = normalizeOperatorName(rawBrand, tags.name);

  // Town / Municipality
  const town = tags['addr:city'] ||
    tags['addr:municipality'] ||
    tags['addr:town'] ||
    tags['addr:province'] ||
    tags['addr:suburb'] ||
    tags['addr:place'] ||
    tags['is_in'] ||
    'Municipio no especificado';

  // Address
  let address = '';
  if (tags['addr:street']) {
    address = tags['addr:street'];
    if (tags['addr:housenumber']) {
      address += `, ${tags['addr:housenumber']}`;
    }
  } else if (tags['addr:full']) {
    address = tags['addr:full'];
  } else if (tags.name && tags.name !== operator) {
    address = tags.name;
  } else if (tags.description) {
    address = tags.description;
  } else {
    address = `Estación de Servicio ${operator} (${Number(node.lat).toFixed(4)}, ${Number(node.lon).toFixed(4)})`;
  }

  // Highway extraction from ref, street, name, description
  let detectedHighway = '';
  if (tags.ref) {
    detectedHighway = extractHighway(tags.ref);
  }
  if (!detectedHighway && tags['addr:street']) {
    detectedHighway = extractHighway(tags['addr:street']);
  }
  if (!detectedHighway && tags.name) {
    detectedHighway = extractHighway(tags.name);
  }
  if (!detectedHighway && tags.description) {
    detectedHighway = extractHighway(tags.description);
  }

  // Fuel types available
  const fuelTypes = [];
  if (tags['fuel:diesel'] === 'yes' || tags['fuel:diesel'] === 'true') fuelTypes.push('Diésel');
  if (tags['fuel:octane_95'] === 'yes' || tags['fuel:octane_95'] === 'true') fuelTypes.push('Gasolina 95');
  if (tags['fuel:octane_98'] === 'yes' || tags['fuel:octane_98'] === 'true') fuelTypes.push('Gasolina 98');
  if (tags['fuel:lpg'] === 'yes' || tags['fuel:autogas'] === 'yes') fuelTypes.push('GLP / AutoGas');
  if (tags['fuel:cng'] === 'yes') fuelTypes.push('GNC');
  if (tags['fuel:adblue'] === 'yes') fuelTypes.push('AdBlue');

  const lat = typeof node.lat === 'number' ? node.lat : parseFloat(node.lat);
  const lon = typeof node.lon === 'number' ? node.lon : parseFloat(node.lon);

  return {
    id: `osm-${node.id}`,
    osmId: node.id,
    operator: operator,
    town: town,
    address: address,
    highway: detectedHighway,
    lat: Number(lat.toFixed(6)),
    lon: Number(lon.toFixed(6)),
    type: 'fuel',
    connectorsCount: 0,
    maxPowerKW: 0,
    fuelTypes: fuelTypes,
    poiCount: 1, // Single physical station from OSM (omits clustering as per Step 3 requirement)
    rawPoiIds: [node.id],
    status: tags.opening_hours ? `Horario: ${tags.opening_hours}` : 'Operativo'
  };
}

/**
 * Connects to the OpenStreetMap Overpass API searching for nodes with amenity=fuel
 * in the designated country.
 */
async function fetchOverpassFuelStations(countryCode = 'ES', maxResults = 250) {
  // Normalize ISO 3166-1 country code (UK -> GB in OSM standard)
  const isoCode = countryCode === 'UK' ? 'GB' : countryCode;

  const query = `
    [out:json][timeout:25];
    area["ISO3166-1"="${isoCode}"][admin_level=2]->.countryArea;
    node["amenity"="fuel"](area.countryArea);
    out body ${maxResults};
  `.trim();

  // Primary & fallback endpoints for high availability
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.osm.ch/api/interpreter'
  ];

  let lastError = null;

  for (const baseUrl of endpoints) {
    try {
      const url = `${baseUrl}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} en ${baseUrl}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.elements)) {
        throw new Error('Estructura de respuesta inválida desde Overpass');
      }

      return data.elements;
    } catch (err) {
      lastError = err;
      console.warn(`Intento de conexión a Overpass en ${baseUrl} no disponible:`, err.message);
    }
  }

  throw lastError || new Error('No se pudo conectar con los servidores de Overpass API.');
}

/**
 * Main coordinator to fetch fuel stations from Overpass API (OpenStreetMap)
 * and map them directly into Station objects without clustering.
 */
async function loadAndProcessFuelStations() {
  setLoadingState(true, 'Consultando Overpass API (OpenStreetMap) para gasolineras...');

  try {
    showToast(`Consultando gasolineras (amenity=fuel) en ${state.country} vía Overpass API...`, 'info');
    const rawElements = await fetchOverpassFuelStations(state.country, 250);

    // Direct mapping: each OSM node is a unique station (no clustering)
    const fuelStations = rawElements.map((node, index) => mapOsmFuelNodeToStation(node, index));

    state.rawPoiCount = fuelStations.length;
    state.clusteredCount = fuelStations.length;
    state.stations = fuelStations;

    applyFilters();

    showToast(
      `Obtenidas ${fuelStations.length} gasolineras desde OpenStreetMap (estaciones únicas, sin clustering).`,
      'success'
    );
  } catch (error) {
    console.error('Error al consultar Overpass API:', error);
    showToast(`Aviso Overpass API: ${error.message}. Cargando gasolineras de respaldo.`, 'warning');

    // Graceful fallback to rich sample OSM dataset
    const fallbackStations = SAMPLE_RAW_OSM_FUELS.map((node, index) => mapOsmFuelNodeToStation(node, index));
    state.rawPoiCount = fallbackStations.length;
    state.clusteredCount = fallbackStations.length;
    state.stations = fallbackStations;
    applyFilters();
  } finally {
    setLoadingState(false);
  }
}

/**
 * Coordinator for mixed infrastructure (electric + fuel stations)
 */
async function loadAndProcessHybridStations() {
  const apiKey = state.apiKey.trim();
  setLoadingState(true, 'Consultando infraestructura mixta (OCM + Overpass)...');

  try {
    showToast(`Cargando estaciones de recarga y gasolineras para ${state.country}...`, 'info');

    // 1. Electric stations (with clustering)
    let electricStations = [];
    if (apiKey) {
      try {
        const rawOcm = await fetchOpenChargeMapData(apiKey, state.country, 300);
        electricStations = clusterChargingPoints(rawOcm, CLUSTER_THRESHOLD_METERS);
      } catch (err) {
        console.warn('OCM error, usando datos demo:', err);
        electricStations = clusterChargingPoints(SAMPLE_RAW_OCM_POIS, CLUSTER_THRESHOLD_METERS);
      }
    } else {
      electricStations = clusterChargingPoints(SAMPLE_RAW_OCM_POIS, CLUSTER_THRESHOLD_METERS);
    }

    // 2. Fuel stations from Overpass (without clustering)
    let fuelStations = [];
    try {
      const rawOsm = await fetchOverpassFuelStations(state.country, 200);
      fuelStations = rawOsm.map((node, index) => mapOsmFuelNodeToStation(node, index));
    } catch (err) {
      console.warn('Overpass error, usando datos demo:', err);
      fuelStations = SAMPLE_RAW_OSM_FUELS.map((node, index) => mapOsmFuelNodeToStation(node, index));
    }

    const combined = [...electricStations, ...fuelStations];
    state.rawPoiCount = electricStations.reduce((acc, s) => acc + s.poiCount, 0) + fuelStations.length;
    state.clusteredCount = combined.length;
    state.stations = combined;

    applyFilters();
    showToast(`Infraestructura mixta cargada: ${electricStations.length} electrolineras y ${fuelStations.length} gasolineras.`, 'success');
  } catch (error) {
    showToast(`Error: ${error.message}`, 'error');
  } finally {
    setLoadingState(false);
  }
}

/**
 * Applies clustering and updates interface state & components
 */
function processAndDisplayData(rawPois, applyCurrentFilters = true) {
  state.rawPoiCount = rawPois.length;
  
  // EXECUTE CLUSTERING ALGORITHM
  const clustered = clusterChargingPoints(rawPois, CLUSTER_THRESHOLD_METERS);
  
  state.stations = clustered;
  state.clusteredCount = clustered.length;

  if (applyCurrentFilters) {
    applyFilters();
  } else {
    state.filteredStations = [...clustered];
    updateKPIs(clustered);
    renderOperatorStats(clustered);
    renderTable(clustered);
  }
}

function setLoadingState(isLoading, message = 'Consultando API...') {
  state.isLoading = isLoading;
  if (isLoading) {
    DOM.btnSearch.classList.add('is-loading');
    DOM.btnSearch.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>${escapeHtml(message)}</span>`;
    DOM.stationsTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">
          <div class="loading-overlay">
            <div class="loading-spinner-circle"></div>
            <p>${escapeHtml(message)}</p>
          </div>
        </td>
      </tr>
    `;
  } else {
    DOM.btnSearch.classList.remove('is-loading');
    DOM.btnSearch.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> <span>Consultar Datos</span>`;
  }
}

/* --------------------------------------------------------------------------
   Filter & Search Events
   -------------------------------------------------------------------------- */
function bindFilterEvents() {
  DOM.countrySelect.addEventListener('change', (e) => {
    state.country = e.target.value;
  });

  const handleSearchAction = () => {
    if (state.type === 'electric') {
      loadAndProcessElectricStations();
    } else if (state.type === 'fuel') {
      loadAndProcessFuelStations();
    } else if (state.type === 'hybrid') {
      loadAndProcessHybridStations();
    }
  };

  DOM.stationTypeSelect.addEventListener('change', (e) => {
    state.type = e.target.value;
    // If table has no items of the newly selected type, automatically load them
    const hasCurrentType = state.stations.some(s => s.type === state.type);
    if (!hasCurrentType) {
      handleSearchAction();
    } else {
      applyFilters();
    }
  });

  // Step 4: Dynamic Highway Filter & Search Action
  DOM.highwayInput.addEventListener('input', (e) => {
    state.highway = e.target.value.trim();
    applyFilters(); // Dynamically updates total counter & brand stats in real-time
  });

  // Search button triggers appropriate API fetcher
  DOM.btnSearch.addEventListener('click', handleSearchAction);

  DOM.highwayInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSearchAction();
    }
  });

  DOM.btnResetFilters.addEventListener('click', () => {
    DOM.countrySelect.value = 'ES';
    DOM.stationTypeSelect.value = 'electric';
    DOM.highwayInput.value = '';
    DOM.tableFilterInput.value = '';

    state.country = 'ES';
    state.type = 'electric';
    state.highway = '';

    applyFilters();
    showToast('Filtros restablecidos al estado inicial', 'info');
  });

  // Step 4: Live Table Search Filtering updates visible counts & brand stats dynamically
  DOM.tableFilterInput.addEventListener('input', () => {
    applyFilters();
  });
}

/**
 * Step 4: Intelligent highway text filter matching function.
 * Matches user query against station highway code, address, and related text.
 * Tolerates with/without hyphen (e.g. 'A-7' <-> 'A7', 'AP-7' <-> 'AP7', 'N-340' <-> 'N340').
 */
function matchesHighway(station, highwayQuery) {
  if (!highwayQuery) return true;
  const q = highwayQuery.trim();
  if (!q) return true;

  // Exact or word-bounded match for highway identifiers (e.g., A-7, A7, AP-7, N-340, M-30)
  const prefixMatch = q.match(/^([A-Z]{1,3})[-\s]?(\d{1,4})$/i);
  if (prefixMatch) {
    const letters = prefixMatch[1];
    const digits = prefixMatch[2];
    const regex = new RegExp(`(^|[^A-Z0-9])${letters}[-\\s]?${digits}([^0-9]|$)`, 'i');

    if (station.highway && regex.test(station.highway)) return true;
    if (station.address && regex.test(station.address)) return true;
    return false;
  }

  // Fallback for general text search in highway or address
  const qClean = q.toUpperCase().replace(/[-\s]/g, '');
  const hwClean = (station.highway || '').toUpperCase().replace(/[-\s]/g, '');
  const addrClean = (station.address || '').toUpperCase().replace(/[-\s]/g, '');

  return hwClean.includes(qClean) || addrClean.includes(qClean);
}

/**
 * Step 4: Applies text filters (type, highway, table search) and dynamically updates
 * the total counter, brand statistics, and table results based strictly on visible items.
 */
function applyFilters() {
  let results = [...state.stations];

  // 1. Filter by Infrastructure Type
  if (state.type === 'electric') {
    results = results.filter(s => s.type === 'electric');
  } else if (state.type === 'fuel') {
    results = results.filter(s => s.type === 'fuel');
  }

  // 2. Filter by Highway (Step 4: text filter on highway)
  if (state.highway) {
    results = results.filter(s => matchesHighway(s, state.highway));
  }

  // 3. Live in-table text search filter
  const term = DOM.tableFilterInput ? DOM.tableFilterInput.value.toLowerCase().trim() : '';
  if (term) {
    results = results.filter(st =>
      (st.operator && st.operator.toLowerCase().includes(term)) ||
      (st.town && st.town.toLowerCase().includes(term)) ||
      (st.address && st.address.toLowerCase().includes(term)) ||
      (st.highway && st.highway.toLowerCase().includes(term))
    );
  }

  state.filteredStations = results;

  // Step 4: Dynamically update total counter, brand/operator statistics, and results table
  updateKPIs(results);
  renderOperatorStats(results);
  renderTable(results);
}

/* --------------------------------------------------------------------------
   Step 4: Dynamic KPI Calculations & UI Rendering
   -------------------------------------------------------------------------- */
function updateKPIs(data) {
  const total = data.length;
  DOM.stationCountDisplay.textContent = total;

  const operators = [...new Set(data.map(d => d.operator))];
  DOM.operatorCountDisplay.textContent = operators.length;

  if (operators.length > 0) {
    const counts = {};
    data.forEach(d => { counts[d.operator] = (counts[d.operator] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    DOM.topOperatorDisplay.textContent = `${top[0]} (${top[1]})`;
  } else {
    DOM.topOperatorDisplay.textContent = '-';
  }

  const typeOption = DOM.stationTypeSelect.options[DOM.stationTypeSelect.selectedIndex];
  const typeText = typeOption ? typeOption.text.split(' ')[1] : 'Todas';
  let filterDesc = typeText;
  if (state.highway) {
    filterDesc += ` · ${state.highway.toUpperCase()}`;
  }
  DOM.activeFilterDisplay.textContent = filterDesc;
}

/* --------------------------------------------------------------------------
   Step 4: Dynamic Brand & Operator Statistics Component
   -------------------------------------------------------------------------- */
function renderOperatorStats(data) {
  if (!data || data.length === 0) {
    DOM.operatorStatsContainer.innerHTML = `
      <div class="empty-stats-msg">
        <i class="fa-solid fa-chart-pie"></i>
        <p>No hay estaciones disponibles para la autovía o filtros seleccionados.</p>
      </div>
    `;
    DOM.statsOperatorBadge.textContent = '0 marcas';
    return;
  }

  const operatorMap = {};
  data.forEach(item => {
    operatorMap[item.operator] = (operatorMap[item.operator] || 0) + 1;
  });

  const sortedOperators = Object.entries(operatorMap).sort((a, b) => b[1] - a[1]);
  DOM.statsOperatorBadge.textContent = `${sortedOperators.length} marcas visibles`;

  const total = data.length;

  const html = sortedOperators.map(([operator, count]) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
    return `
      <div class="op-stat-card">
        <div class="op-stat-top">
          <span class="op-stat-name" title="${escapeHtml(operator)}">${escapeHtml(operator)}</span>
          <span class="op-stat-count">${count} <small style="font-size: 0.75em; color: var(--text-muted);">(${percentage}%)</small></span>
        </div>
        <div class="op-stat-bar-bg">
          <div class="op-stat-bar-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');

  DOM.operatorStatsContainer.innerHTML = html;
}

/* --------------------------------------------------------------------------
   Results Table Component with Clustering Indicators
   -------------------------------------------------------------------------- */
function renderTable(data) {
  DOM.tableCounterBadge.textContent = `${data.length} estaciones físicas`;
  
  const rawInfo = state.rawPoiCount > 0 ? ` (agrupadas de ${state.rawPoiCount} puntos API)` : '';
  DOM.tableSummaryText.textContent = `Mostrando ${data.length} de ${state.stations.length} estaciones físicas${rawInfo}`;

  if (!data || data.length === 0) {
    DOM.stationsTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">
          <div class="empty-state">
            <i class="fa-solid fa-map-location-dot"></i>
            <p>No se encontraron estaciones físicas con los filtros actuales.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const rows = data.map((item, index) => {
    const isElectric = item.type === 'electric';
    const typeBadge = isElectric
      ? `<span class="badge-tag badge-electric"><i class="fa-solid fa-bolt"></i> EV</span>`
      : `<span class="badge-tag badge-fuel"><i class="fa-solid fa-gas-pump"></i> Gasolinera</span>`;

    // Connector & Fuel info badge
    let connectorBadge = '';
    if (isElectric && item.connectorsCount > 0) {
      const kwInfo = item.maxPowerKW > 0 ? ` · ${item.maxPowerKW} kW` : '';
      connectorBadge = `
        <span class="badge-connectors" title="${item.connectorTypes ? item.connectorTypes.join(', ') : ''}">
          <i class="fa-solid fa-plug"></i> ${item.connectorsCount} conectores${kwInfo}
        </span>
      `;
    } else if (!isElectric) {
      const fuelList = (item.fuelTypes && item.fuelTypes.length > 0) ? item.fuelTypes.join(' · ') : 'Carburantes estándar';
      connectorBadge = `
        <span class="badge-fuel-types" title="Carburantes disponibles en la estación">
          <i class="fa-solid fa-gas-pump"></i> ${escapeHtml(fuelList)}
        </span>
      `;
    }

    // Clustering badge for EV vs Single Station badge for OSM Gas Stations
    let clusterBadge = '';
    if (isElectric && item.poiCount > 1) {
      clusterBadge = `
        <span class="badge-cluster" title="Agrupados ${item.poiCount} puntos/conectores en la misma ubicación geográfica">
          <i class="fa-solid fa-layer-group"></i> ${item.poiCount} agrupados
        </span>
      `;
    } else if (!isElectric) {
      clusterBadge = `
        <span class="badge-single-node" title="Estación física única de OpenStreetMap (omite clustering)">
          <i class="fa-solid fa-location-dot"></i> Estación única
        </span>
      `;
    }

    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`;

    return `
      <tr>
        <td style="color: var(--text-muted); font-size: 0.8rem;">${index + 1}</td>
        <td>
          <span class="operator-tag">
            <i class="fa-solid fa-${isElectric ? 'charging-station text-primary' : 'gas-pump text-amber'}"></i>
            ${escapeHtml(item.operator)}
          </span>
        </td>
        <td>${escapeHtml(item.town)}</td>
        <td style="max-width: 320px; font-size: 0.825rem; color: var(--text-secondary);">
          ${escapeHtml(item.address)}
          ${item.highway ? `<span style="display:inline-block; margin-left:4px; font-size:0.75rem; color:var(--accent); font-weight:600;">[${escapeHtml(item.highway)}]</span>` : ''}
        </td>
        <td>
          <div class="coords-cell">
            <span>${item.lat.toFixed(4)}, ${item.lon.toFixed(4)}</span>
            <button class="btn-copy-coords" onclick="copyCoordinates(${item.lat}, ${item.lon})" title="Copiar coordenadas">
              <i class="fa-regular fa-copy"></i>
            </button>
          </div>
        </td>
        <td>
          <div class="station-type-col">
            <div style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
              ${typeBadge}
              ${clusterBadge}
            </div>
            ${connectorBadge}
          </div>
        </td>
        <td>
          <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-icon" title="Abrir en Google Maps">
            <i class="fa-solid fa-arrow-up-right-from-square text-accent"></i>
          </a>
        </td>
      </tr>
    `;
  }).join('');

  DOM.stationsTableBody.innerHTML = rows;
}

/* --------------------------------------------------------------------------
   Step 5: Export Features - Dynamic File Naming, Native Blob CSV & SheetJS Excel
   -------------------------------------------------------------------------- */

/**
 * Step 5: Generates dynamic filenames according to selected Country, Type, and Highway.
 * Example: estaciones_ES_electricas_A-7_2026-09-12.csv
 *          estaciones_ES_gasolineras_todas-vias_2026-09-12.xlsx
 */
function generateExportFilename(country, type, highway, extension) {
  const typeMap = {
    electric: 'electricas',
    fuel: 'gasolineras',
    hybrid: 'mixtas'
  };

  const cCode = (country || 'ES').toUpperCase();
  const tSlug = typeMap[type] || type || 'infraestructura';
  const hSlug = highway ? highway.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '') : 'todas-vias';
  const dateStr = new Date().toISOString().slice(0, 10);

  return `estaciones_${cCode}_${tSlug}_${hSlug}_${dateStr}.${extension}`;
}

function bindExportEvents() {
  DOM.btnExportCSV.addEventListener('click', exportToCSV);
  DOM.btnExportExcel.addEventListener('click', exportToExcel);
}

/**
 * Step 5: CSV Export using Native JavaScript Blob with UTF-8 BOM.
 * Accurately escapes special characters and quotes, naming files dynamically.
 */
function exportToCSV() {
  const data = state.filteredStations;
  if (!data || data.length === 0) {
    showToast('No hay datos disponibles para exportar con los filtros actuales.', 'warning');
    return;
  }

  const headers = [
    'ID Estación',
    'Operador',
    'Localidad',
    'Dirección',
    'Autovía / Vía',
    'Latitud',
    'Longitud',
    'Tipo',
    'Conectores / Carburantes',
    'Potencia Máx (kW)',
    'Puntos Agrupados (Clustering)',
    'Estado',
    'Enlace Google Maps'
  ];

  const rows = data.map(item => {
    const isElectric = item.type === 'electric';
    const detailInfo = isElectric
      ? (item.connectorsCount ? `${item.connectorsCount} conectores` : '-')
      : (item.fuelTypes && item.fuelTypes.length > 0 ? item.fuelTypes.join('; ') : 'Carburantes estándar');

    const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`;

    return [
      item.id,
      `"${(item.operator || '').replace(/"/g, '""')}"`,
      `"${(item.town || '').replace(/"/g, '""')}"`,
      `"${(item.address || '').replace(/"/g, '""')}"`,
      `"${(item.highway || '').replace(/"/g, '""')}"`,
      item.lat,
      item.lon,
      isElectric ? 'Eléctrico (EV)' : 'Gasolinera (OSM)',
      `"${detailInfo.replace(/"/g, '""')}"`,
      item.maxPowerKW || 0,
      item.poiCount || 1,
      `"${(item.status || 'Operativo').replace(/"/g, '""')}"`,
      `"${gmapsLink}"`
    ];
  });

  // UTF-8 BOM (\uFEFF) ensures Excel and text readers open UTF-8 without garbled characters
  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  // Native JavaScript Blob for CSV export
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = generateExportFilename(state.country, state.type, state.highway, 'csv');
  downloadFile(blob, filename);

  showToast(`Archivo CSV "${filename}" descargado con éxito (${data.length} estaciones)`, 'success');
}

/**
 * Step 5: Excel Export using the SheetJS (XLSX) library.
 * Formats custom column widths, sets sheet names, and names files dynamically.
 */
function exportToExcel() {
  const data = state.filteredStations;
  if (!data || data.length === 0) {
    showToast('No hay datos disponibles para exportar con los filtros actuales.', 'warning');
    return;
  }

  if (typeof XLSX === 'undefined') {
    showToast('La librería SheetJS no se ha cargado correctamente.', 'error');
    return;
  }

  const excelRows = data.map((item, index) => {
    const isElectric = item.type === 'electric';
    const detailInfo = isElectric
      ? (item.connectorsCount ? `${item.connectorsCount} conectores` : '-')
      : (item.fuelTypes && item.fuelTypes.length > 0 ? item.fuelTypes.join(' · ') : 'Carburantes estándar');

    return {
      '#': index + 1,
      'ID Estación': item.id,
      'Operador / Marca': item.operator,
      'Localidad / Municipio': item.town,
      'Dirección': item.address,
      'Autovía / Vía': item.highway || '-',
      'Latitud': item.lat,
      'Longitud': item.lon,
      'Tipo Infraestructura': isElectric ? 'Eléctrico (EV)' : 'Gasolinera (OSM)',
      'Conectores / Carburantes': detailInfo,
      'Potencia Máx (kW)': item.maxPowerKW ? `${item.maxPowerKW} kW` : '-',
      'Puntos Agrupados': item.poiCount || 1,
      'Estado': item.status || 'Operativo',
      'Google Maps': `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  worksheet['!cols'] = [
    { wch: 5 },   // #
    { wch: 16 },  // ID
    { wch: 24 },  // Operador
    { wch: 22 },  // Localidad
    { wch: 45 },  // Dirección
    { wch: 14 },  // Autovía
    { wch: 12 },  // Latitud
    { wch: 12 },  // Longitud
    { wch: 18 },  // Tipo
    { wch: 26 },  // Conectores / Carburantes
    { wch: 18 },  // Potencia Máx
    { wch: 16 },  // Puntos Agrupados
    { wch: 14 },  // Estado
    { wch: 40 }   // Google Maps
  ];

  const workbook = XLSX.utils.book_new();
  const sheetTitle = state.type === 'fuel' ? 'Gasolineras' : (state.type === 'electric' ? 'Electrolineras' : 'Estaciones');
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);

  // Dynamic filename via SheetJS writeFile
  const filename = generateExportFilename(state.country, state.type, state.highway, 'xlsx');
  XLSX.writeFile(workbook, filename);

  showToast(`Archivo Excel "${filename}" generado con éxito con SheetJS (${data.length} estaciones)`, 'success');
}

/* --------------------------------------------------------------------------
   Helpers & Utilities
   -------------------------------------------------------------------------- */
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.copyCoordinates = function(lat, lon) {
  const text = `${lat}, ${lon}`;
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Coordenadas copiadas: ${text}`, 'info');
  }).catch(() => {
    showToast('Error al copiar al portapapeles', 'error');
  });
};

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'fa-solid fa-circle-check text-primary',
    info: 'fa-solid fa-circle-info text-accent',
    warning: 'fa-solid fa-triangle-exclamation text-amber',
    error: 'fa-solid fa-circle-exclamation text-rose'
  };

  toast.innerHTML = `
    <i class="${iconMap[type] || iconMap.info}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
