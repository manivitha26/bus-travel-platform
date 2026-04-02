/* ============================================================
   ROUTES — Interactive Route Planner with Leaflet Maps
   ============================================================ */

const RoutePlanner = {
  map: null,
  routeLayer: null,
  markers: [],
  waypoints: [],
  selectedRoute: null,
  routeResults: [],

  init() {
    this.render();
  },

  render() {
    const page = document.getElementById('page-routes');
    if (!page) return;

    const savedRoutes = Utils.store.get('savedUserRoutes', []);

    page.innerHTML = `
      <div class="container page-section">
        <h1 class="mb-8 animate-fade-in" data-i18n="routes.title">${I18n.t('routes.title')}</h1>
        <div class="route-planner-layout">
          <!-- Left Panel -->
          <div class="route-panel">
            <div class="card animate-slide-up">
              <div class="route-inputs" id="route-inputs">
                <div class="route-input-group">
                  <div class="route-input-dot start"></div>
                  <input class="form-input" id="route-start" placeholder="${I18n.t('routes.start_placeholder')}" data-i18n-placeholder="routes.start_placeholder">
                </div>
                <div class="route-connector"></div>
                <div id="waypoints-container"></div>
                <div class="route-input-group">
                  <div class="route-input-dot end"></div>
                  <input class="form-input" id="route-end" placeholder="${I18n.t('routes.dest_placeholder')}" data-i18n-placeholder="routes.dest_placeholder">
                </div>
              </div>
              <div class="flex gap-2 mt-4">
                <button class="btn btn-ghost btn-sm" onclick="RoutePlanner.addWaypoint()">
                  ➕ <span data-i18n="routes.add_waypoint">${I18n.t('routes.add_waypoint')}</span>
                </button>
              </div>
              <div class="flex gap-3 mt-4">
                <button class="btn btn-primary btn-block" onclick="RoutePlanner.findRoutes()">
                  🔍 <span data-i18n="routes.find_routes">${I18n.t('routes.find_routes')}</span>
                </button>
                <button class="btn btn-secondary" onclick="RoutePlanner.clearRoute()">
                  <span data-i18n="routes.clear">${I18n.t('routes.clear')}</span>
                </button>
              </div>
            </div>

            <!-- Traffic Info -->
            <div class="card animate-slide-up" id="traffic-info" style="display:none">
              <h5 class="mb-3">🚦 <span data-i18n="routes.live_traffic">${I18n.t('routes.live_traffic')}</span></h5>
              <div id="traffic-details"></div>
            </div>

            <!-- Route Results -->
            <div id="route-results-panel" style="display:none">
              <h5 class="mb-3" data-i18n="routes.suggested_routes">${I18n.t('routes.suggested_routes')}</h5>
              <div class="route-results" id="route-results"></div>
              <div class="flex gap-2 mt-4">
                <button class="btn btn-accent btn-sm btn-block" onclick="RoutePlanner.saveCurrentRoute()">
                  💾 <span data-i18n="routes.save_route">${I18n.t('routes.save_route')}</span>
                </button>
              </div>
            </div>

            <!-- Saved Routes -->
            <div class="card animate-slide-up">
              <h5 class="mb-3" data-i18n="routes.saved_routes">${I18n.t('routes.saved_routes')}</h5>
              <div class="saved-routes-list" id="saved-routes-list">
                ${savedRoutes.length === 0
                  ? `<p class="text-sm text-muted" data-i18n="routes.no_saved">${I18n.t('routes.no_saved')}</p>`
                  : savedRoutes.map(r => `
                    <div class="saved-route-item" onclick="RoutePlanner.loadSavedRoute('${r.id}')">
                      <div>
                        <div class="font-medium">${Utils.escapeHTML(r.from)} → ${Utils.escapeHTML(r.to)}</div>
                        <div class="text-xs text-muted">${r.distance} · ${r.duration}</div>
                      </div>
                      <button class="btn btn-ghost btn-icon btn-sm" onclick="event.stopPropagation();RoutePlanner.deleteSavedRoute('${r.id}')">🗑️</button>
                    </div>`).join('')}
              </div>
            </div>
          </div>

          <!-- Map -->
          <div class="map-container animate-scale-in">
            <div id="route-map"></div>
          </div>
        </div>
      </div>
    `;

    // Init map after DOM is ready
    setTimeout(() => this.initMap(), 100);
  },

  initMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const mapEl = document.getElementById('route-map');
    if (!mapEl) return;

    try {
      this.map = L.map('route-map').setView([39.8283, -98.5795], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.map);

      this.routeLayer = L.layerGroup().addTo(this.map);

      // Add click-to-place markers
      this.map.on('click', (e) => {
        const startInput = document.getElementById('route-start');
        const endInput = document.getElementById('route-end');
        if (startInput && !startInput.value) {
          startInput.value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
        } else if (endInput && !endInput.value) {
          endInput.value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
        }
      });
    } catch (e) {
      console.warn('Map initialization error:', e);
    }
  },

  addWaypoint() {
    const container = document.getElementById('waypoints-container');
    if (!container) return;
    const idx = this.waypoints.length;
    this.waypoints.push('');

    const wpDiv = document.createElement('div');
    wpDiv.className = 'route-input-group animate-slide-up';
    wpDiv.id = `waypoint-${idx}`;
    wpDiv.innerHTML = `
      <div class="route-input-dot waypoint"></div>
      <input class="form-input" placeholder="${I18n.t('routes.waypoint')} ${idx + 1}" onchange="RoutePlanner.waypoints[${idx}]=this.value">
      <button class="btn btn-ghost btn-icon btn-sm" onclick="RoutePlanner.removeWaypoint(${idx})">✕</button>
    `;

    const connector = document.createElement('div');
    connector.className = 'route-connector';
    connector.id = `wp-connector-${idx}`;

    container.appendChild(wpDiv);
    container.appendChild(connector);
  },

  removeWaypoint(idx) {
    const wp = document.getElementById(`waypoint-${idx}`);
    const conn = document.getElementById(`wp-connector-${idx}`);
    if (wp) wp.remove();
    if (conn) conn.remove();
    this.waypoints[idx] = null;
  },

  findRoutes() {
    const start = document.getElementById('route-start')?.value;
    const end = document.getElementById('route-end')?.value;

    if (!start || !end) {
      Utils.showToast(I18n.t('common.warning'), 'Please enter start and destination', 'warning');
      return;
    }

    // Generate simulated routes
    this.routeResults = this.generateRouteOptions(start, end);
    this.selectedRoute = 0;

    // Show results
    const panel = document.getElementById('route-results-panel');
    if (panel) panel.style.display = 'block';

    this.renderRouteResults();
    this.drawRouteOnMap(this.routeResults[0]);
    this.showTrafficInfo();
  },

  generateRouteOptions(start, end) {
    const baseDist = 15 + Math.floor(Math.random() * 80);
    const baseTime = Math.floor(baseDist * 1.5) + Math.floor(Math.random() * 20);
    const traffics = ['low', 'medium', 'high'];

    return [
      {
        id: 'route-opt-1',
        name: I18n.t('routes.fastest'),
        from: start, to: end,
        distance: `${baseDist} km`,
        duration: `${baseTime} min`,
        traffic: traffics[Math.floor(Math.random() * 2)],
        color: '#6366f1',
        points: this.generateRoutePoints(start, end, 0)
      },
      {
        id: 'route-opt-2',
        name: I18n.t('routes.shortest'),
        from: start, to: end,
        distance: `${Math.floor(baseDist * 0.85)} km`,
        duration: `${Math.floor(baseTime * 1.15)} min`,
        traffic: traffics[Math.floor(Math.random() * 3)],
        color: '#22c55e',
        points: this.generateRoutePoints(start, end, 1)
      },
      {
        id: 'route-opt-3',
        name: I18n.t('routes.scenic'),
        from: start, to: end,
        distance: `${Math.floor(baseDist * 1.3)} km`,
        duration: `${Math.floor(baseTime * 1.4)} min`,
        traffic: traffics[0],
        color: '#f97316',
        points: this.generateRoutePoints(start, end, 2)
      }
    ];
  },

  generateRoutePoints(start, end, variant) {
    // Parse coordinates or generate random ones
    let startLat, startLng, endLat, endLng;

    const parseCoords = (str) => {
      const parts = str.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts;
      // Generate from string hash
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      return [35 + (Math.abs(hash) % 15), -75 - (Math.abs(hash >> 8) % 50)];
    };

    [startLat, startLng] = parseCoords(start);
    [endLat, endLng] = parseCoords(end);

    // Generate curved path with variant offset
    const points = [];
    const steps = 8;
    const offsets = [0.02, -0.03, 0.04];
    const off = offsets[variant] || 0;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = startLat + (endLat - startLat) * t + Math.sin(t * Math.PI) * off * (variant + 1);
      const lng = startLng + (endLng - startLng) * t + Math.cos(t * Math.PI) * off * (variant + 1) * 0.5;
      points.push([lat, lng]);
    }
    return points;
  },

  renderRouteResults() {
    const container = document.getElementById('route-results');
    if (!container) return;

    container.innerHTML = this.routeResults.map((r, i) => `
      <div class="route-option ${i === this.selectedRoute ? 'selected' : ''}" onclick="RoutePlanner.selectRoute(${i})">
        <div class="route-option-header">
          <span class="route-option-name" style="color:${r.color}">● ${r.name}</span>
          <span class="badge badge-${r.traffic === 'low' ? 'success' : r.traffic === 'medium' ? 'warning' : 'danger'} route-option-badge">
            ${I18n.t('routes.traffic_' + r.traffic)}
          </span>
        </div>
        <div class="route-option-details">
          <div class="route-detail-item">📏 ${r.distance}</div>
          <div class="route-detail-item">⏱️ ${r.duration}</div>
          <div class="traffic-indicator traffic-${r.traffic}">
            <span class="traffic-dot"></span>
            ${I18n.t('routes.traffic')}: ${I18n.t('routes.traffic_' + r.traffic)}
          </div>
        </div>
      </div>
    `).join('');
  },

  selectRoute(idx) {
    this.selectedRoute = idx;
    this.renderRouteResults();
    this.drawRouteOnMap(this.routeResults[idx]);
  },

  drawRouteOnMap(route) {
    if (!this.map || !this.routeLayer) return;
    this.routeLayer.clearLayers();
    this.markers.forEach(m => m.remove());
    this.markers = [];

    // Draw all routes faintly, selected route bold
    this.routeResults.forEach((r, i) => {
      const polyline = L.polyline(r.points, {
        color: r.color,
        weight: i === this.selectedRoute ? 5 : 2,
        opacity: i === this.selectedRoute ? 0.9 : 0.3,
        dashArray: i === this.selectedRoute ? null : '8, 8'
      });
      this.routeLayer.addLayer(polyline);
    });

    // Add markers for start and end
    const startIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:20px;height:20px;background:#22c55e;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [20, 20]
    });
    const endIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:20px;height:20px;background:#ef4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [20, 20]
    });

    const points = route.points;
    if (points.length > 0) {
      const startMarker = L.marker(points[0], { icon: startIcon }).addTo(this.map).bindPopup('Start: ' + route.from);
      const endMarker = L.marker(points[points.length - 1], { icon: endIcon }).addTo(this.map).bindPopup('End: ' + route.to);
      this.markers.push(startMarker, endMarker);

      // Fit map to bounds
      const bounds = L.latLngBounds(points);
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  },

  showTrafficInfo() {
    const info = document.getElementById('traffic-info');
    const details = document.getElementById('traffic-details');
    if (!info || !details) return;

    info.style.display = 'block';
    const trafficData = [
      { segment: 'Central Area', level: 'high', delay: '+8 min' },
      { segment: 'Highway Section', level: 'low', delay: '+0 min' },
      { segment: 'Suburb Zone', level: 'medium', delay: '+3 min' }
    ];

    details.innerHTML = trafficData.map(t => `
      <div class="flex justify-between items-center" style="padding:0.5rem 0;border-bottom:1px solid var(--border-light)">
        <span class="text-sm">${t.segment}</span>
        <div class="traffic-indicator traffic-${t.level}">
          <span class="traffic-dot"></span>
          ${t.delay}
        </div>
      </div>
    `).join('');
  },

  saveCurrentRoute() {
    if (!this.routeResults.length || this.selectedRoute === null) return;
    const route = this.routeResults[this.selectedRoute];
    const savedRoutes = Utils.store.get('savedUserRoutes', []);

    savedRoutes.push({
      id: Utils.uid(),
      from: route.from,
      to: route.to,
      distance: route.distance,
      duration: route.duration,
      savedAt: new Date().toISOString()
    });

    Utils.store.set('savedUserRoutes', savedRoutes);
    Utils.showToast(I18n.t('common.success'), I18n.t('routes.route_saved'), 'success');
    this.render();
  },

  loadSavedRoute(id) {
    const savedRoutes = Utils.store.get('savedUserRoutes', []);
    const route = savedRoutes.find(r => r.id === id);
    if (!route) return;

    const startInput = document.getElementById('route-start');
    const endInput = document.getElementById('route-end');
    if (startInput) startInput.value = route.from;
    if (endInput) endInput.value = route.to;
    this.findRoutes();
  },

  deleteSavedRoute(id) {
    let savedRoutes = Utils.store.get('savedUserRoutes', []);
    savedRoutes = savedRoutes.filter(r => r.id !== id);
    Utils.store.set('savedUserRoutes', savedRoutes);
    this.render();
  },

  clearRoute() {
    const startInput = document.getElementById('route-start');
    const endInput = document.getElementById('route-end');
    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';
    this.waypoints = [];
    this.routeResults = [];
    this.selectedRoute = null;

    const container = document.getElementById('waypoints-container');
    if (container) container.innerHTML = '';
    const panel = document.getElementById('route-results-panel');
    if (panel) panel.style.display = 'none';
    const info = document.getElementById('traffic-info');
    if (info) info.style.display = 'none';

    if (this.routeLayer) this.routeLayer.clearLayers();
    this.markers.forEach(m => m.remove());
    this.markers = [];
    if (this.map) this.map.setView([39.8283, -98.5795], 4);
  }
};
