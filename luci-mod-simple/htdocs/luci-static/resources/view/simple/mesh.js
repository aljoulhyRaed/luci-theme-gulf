'use strict';
'require view';
'require dom';
'require rpc';
'require uci';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });

var SVG = {
	mesh: '<svg viewBox="0 0 24 24"><path d="M17 16l-4-4V8.82C14.16 8.4 15 7.3 15 6c0-1.66-1.34-3-3-3S9 4.34 9 6c0 1.3.84 2.4 2 2.82V12l-4 4H3v5h5v-3.05l4-4.2 4 4.2V21h5v-5h-4z"/></svg>',
	wifi: '<svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
	server: '<svg viewBox="0 0 24 24"><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.68 1.5 1.5S7.83 8.5 7 8.5z"/></svg>',
	node: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
	lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>',
	settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
	warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
	info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
	eye: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
	eyeOff: '<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"/></svg>'
};

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (Array.isArray(children)) children.forEach(function(c) { if (c) e.appendChild(c); });
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function icon(svg, size, color) {
	return svg.replace('<svg ', '<svg style="width:' + (size||14) + 'px;height:' + (size||14) + 'px;fill:' + (color||'currentColor') + '" ');
}

return view.extend({
	load: function() {
		return L.resolveDefault(callFileExec('/bin/sh', ['-c',
			"[ -f /etc/config/easymesh ] || printf \"config easymesh 'config'\\n\\toption enabled '0'\\n\" > /etc/config/easymesh; [ -f /etc/config/wireless ] || printf \"\" > /dev/null; echo OK"
		]), {}).then(function() {
			return Promise.all([
				L.resolveDefault(uci.load('easymesh'), null),
				L.resolveDefault(uci.load('wireless'), null),
				L.resolveDefault(callFileExec('/bin/sh', ['-c',
					"batctl n 2>/dev/null | grep -E '^[0-9a-fA-F]{2}:' | wc -l"
				]), {}),
				L.resolveDefault(callFileExec('/bin/sh', ['-c',
					"batctl n 2>/dev/null | tail -n +3 | grep -E '^[0-9a-fA-F]'"
				]), {})
			]);
		});
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	getRadios: function() {
		var radios = [];
		try {
			uci.sections('wireless', 'wifi-device', function(s) {
				radios.push({ name: s['.name'], type: s.type || '', band: s.band || '', channel: s.channel || 'auto' });
			});
		} catch(e) {}
		return radios;
	},

	parseNeighbors: function(stdout) {
		var neighbors = [];
		(stdout || '').trim().split('\n').forEach(function(line) {
			line = line.trim().replace(/\s+/g, ' ');
			if (!line) return;
			var m = line.match(/(\S+)\s+(\S+)\s+\((.+?)\)\s+\[(\S+)\]/);
			if (m) {
				neighbors.push({ mac: m[1], lastSeen: m[2], speed: m[3], iface: m[4] });
			}
		});
		return neighbors;
	},

	showGuide: function() {
		var old = document.querySelector('.mesh-guide-overlay');
		if (old) old.remove();

		var overlay = el('div', 'mesh-guide-overlay');
		overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

		var modal = el('div', 'mesh-guide-modal');

		var header = el('div', 'mesh-guide-header');
		header.appendChild(el('span', 'mesh-guide-title', 'Mesh Setup Guide'));
		var closeBtn = el('button', 'mesh-guide-close', '\u00d7');
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		header.appendChild(closeBtn);
		modal.appendChild(header);

		var body = el('div', 'mesh-guide-body');
		body.innerHTML =
			'<h3>How to Setup a Basic Mesh Network</h3>' +
			'<p class="mesh-guide-sub">1 Server + 2 Nodes</p>' +

			'<div class="mesh-guide-step">' +
				'<div class="mesh-guide-step-num">Step 1</div>' +
				'<div class="mesh-guide-step-title">Setup the Mesh Server</div>' +
			'</div>' +
			'<ol class="mesh-guide-list">' +
				'<li>Disable or delete any active wireless networks <em>(Go to Wi-Fi \u2192 Networks and use the toggle to disable or the "Remove Network" button to delete)</em>.</li>' +
				'<li>Go to <strong>Wi-Fi \u2192 Mesh</strong> (this page).</li>' +
				'<li>Select <strong>"Server (Gateway)"</strong> for Mesh Mode.</li>' +
				'<li>Enter your <strong>WiFi SSID</strong> \u2014 this is the main Wi-Fi network all devices will connect to.</li>' +
				'<li>Select the <strong>Regular AP Radio</strong>. <em>(Recommended: Use a different radio than the mesh backhaul for best performance.)</em></li>' +
				'<li>Select the <strong>Mesh Backhaul Radio</strong> and enter a separate <strong>Mesh SSID</strong>. <em>(The system will automatically append <code>-mesh</code> to your mesh SSID.)</em></li>' +
				'<li>Enable <strong>Password Protection</strong>, enter a Mesh Password, and click <strong>Save &amp; Apply</strong>.</li>' +
				'<li>Click <strong>"Reapply Mesh"</strong> to deploy the APs and activate mesh networking.</li>' +
			'</ol>' +
			'<div class="mesh-guide-verify">' +
				'<strong>Verify Setup:</strong>' +
				'<ul>' +
					'<li>Go to <em>Wi-Fi \u2192 Networks</em> to check that the Wi-Fi networks were added.</li>' +
					'<li>Go to <em>Network \u2192 Interfaces</em> to confirm the Batman (<code>bat0</code>) device and <code>mesh_batman</code> interface were added.</li>' +
				'</ul>' +
			'</div>' +

			'<div class="mesh-guide-step">' +
				'<div class="mesh-guide-step-num">Step 2</div>' +
				'<div class="mesh-guide-step-title">Setup a Mesh Node</div>' +
			'</div>' +
			'<ol class="mesh-guide-list">' +
				'<li>Go to <strong>Wi-Fi \u2192 Mesh</strong> on the <em>second</em> router.</li>' +
				'<li>Select <strong>"Client"</strong> for Mesh Mode.</li>' +
				'<li>Enter the <strong>same WiFi SSID, Mesh SSID, and Password</strong> as the server.</li>' +
				'<li>Ensure you select the <strong>same WiFi radio type</strong> (AX, AC, b/g/n) for both WiFi SSID and Mesh SSID.</li>' +
				'<li>Click <strong>Save &amp; Apply</strong>, then click <strong>"Reapply Mesh"</strong>.</li>' +
				'<li>Scroll to <strong>Dumb AP / Node Mode</strong> and select a hostname (e.g. <code>node2</code>, <code>node3</code>).</li>' +
				'<li>Set IP Mode to <strong>DHCP</strong> (recommended) or configure a Static IP in the same range as your Mesh Server.</li>' +
				'<li>Click <strong>"Enable Dumb AP Mode"</strong>.</li>' +
			'</ol>' +

			'<div class="mesh-guide-step">' +
				'<div class="mesh-guide-step-num">Step 3</div>' +
				'<div class="mesh-guide-step-title">Repeat for Additional Nodes</div>' +
			'</div>' +
			'<ul class="mesh-guide-list">' +
				'<li>Use the <strong>same WiFi SSID, Mesh SSID, and Password</strong> for every node.</li>' +
				'<li>Ensure all nodes use the <strong>same WiFi radio type</strong> (AX, AC, b/g/n).</li>' +
				'<li>Each node should have a <strong>unique hostname</strong> (node2, node3, etc.).</li>' +
			'</ul>';

		modal.appendChild(body);
		overlay.appendChild(modal);
		document.body.appendChild(overlay);
	},

	render: function(data) {
		var self = this;
		var nodeCount = data[2] && data[2].stdout ? parseInt(data[2].stdout.trim()) || 0 : 0;
		var neighbors = this.parseNeighbors(data[3] ? data[3].stdout : '');
		var radios = this.getRadios();

		var cfg = null;
		try { uci.sections('easymesh', 'easymesh', function(s) { if (!cfg) cfg = s; }); } catch(e) {}
		var cfgName = cfg ? cfg['.name'] : 'config';

		var enabled = cfg ? cfg.enabled === '1' : false;
		var role = cfg ? (cfg.role || 'server') : 'server';
		var meshId = cfg ? (cfg.mesh_id || 'easymesh_AC') : 'easymesh_AC';
		var wifiId = cfg ? (cfg.wifi_id || 'easymesh_AC') : 'easymesh_AC';
		var wifiRadio = cfg ? (cfg.wifi_radio || 'radio1') : 'radio1';
		var apRadio = cfg ? (cfg.apRadio || 'radio0') : 'radio0';
		var encryption = cfg ? cfg.encryption === '1' : false;
		var key = cfg ? (cfg.key || '') : '';
		var kvr = cfg ? cfg.kvr !== '0' : true;
		var mobilityDomain = cfg ? (cfg.mobility_domain || '4f57') : '4f57';
		var rssiVal = cfg ? (cfg.rssi_val || '-60') : '-60';
		var lowRssiVal = cfg ? (cfg.low_rssi_val || '-88') : '-88';

		var root = el('div', 'simple-page');
		var cssLink = el('link'); cssLink.rel = 'stylesheet'; cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = enabled
			? 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)'
			: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var iconDiv = el('div', 'tg-shield ' + (enabled ? 'connected' : 'disconnected'));
		iconDiv.innerHTML = icon(SVG.mesh, 40, '#fff');
		iconDiv.style.background = enabled ? 'rgba(16,185,129,0.3)' : 'rgba(67,56,202,0.3)';
		iconDiv.style.boxShadow = enabled
			? '0 0 24px rgba(16,185,129,0.4)' : '0 0 24px rgba(67,56,202,0.4)';
		hero.appendChild(iconDiv);

		hero.appendChild(el('div', 'tg-status-text', enabled ? 'Mesh Active' : 'Mesh Disabled'));
		hero.appendChild(el('div', 'tg-status-sub', enabled
			? 'Role: ' + role.charAt(0).toUpperCase() + role.slice(1) + ' &bull; SSID: ' + meshId
			: 'Enable mesh networking to extend Wi-Fi coverage with batman-adv'));

		if (enabled) {
			var stats = el('div', 'tg-stats');
			var s1 = el('div', 'tg-stat');
			s1.appendChild(el('div', 'tg-stat-val', String(nodeCount)));
			s1.appendChild(el('div', 'tg-stat-label', 'Active Nodes'));
			stats.appendChild(s1);
			var s2 = el('div', 'tg-stat');
			s2.appendChild(el('div', 'tg-stat-val', role.charAt(0).toUpperCase() + role.slice(1)));
			s2.appendChild(el('div', 'tg-stat-label', 'Mode'));
			stats.appendChild(s2);
			var s3 = el('div', 'tg-stat');
			s3.appendChild(el('div', 'tg-stat-val', encryption ? 'SAE' : 'Open'));
			s3.appendChild(el('div', 'tg-stat-label', 'Encryption'));
			stats.appendChild(s3);
			hero.appendChild(stats);
		}
		root.appendChild(hero);

		/* ── Mesh Status Card (when enabled) ── */
		if (enabled) {
			var statusCard = el('div', 'tg-config stor-card');
			var statusHdr = el('div', 'stor-card-hdr');
			statusHdr.innerHTML = icon(SVG.node, 20, 'var(--simple-accent)');
			statusHdr.appendChild(el('span', 'stor-card-title', 'Mesh Neighbors'));
			statusCard.appendChild(statusHdr);

			if (neighbors.length === 0) {
				var emptyBody = el('div', 'fw-empty');
				emptyBody.innerHTML = icon(SVG.mesh, 48, 'rgba(100,100,120,0.15)');
				emptyBody.appendChild(el('div', 'fw-empty-title', 'No Neighbor Nodes'));
				emptyBody.appendChild(el('div', 'fw-empty-text', 'No mesh neighbors detected yet. Make sure other nodes are configured with the same Mesh SSID and are within range.'));
				statusCard.appendChild(emptyBody);
			} else {
				var hdr = el('div', 'fw-table-hdr');
				hdr.appendChild(el('span', 'fw-col fw-col-name', 'Neighbor MAC'));
				hdr.appendChild(el('span', 'fw-col fw-col-proto', 'Interface'));
				hdr.appendChild(el('span', 'fw-col fw-col-ext', 'Speed'));
				hdr.appendChild(el('span', 'fw-col fw-col-ip', 'Last Seen'));
				statusCard.appendChild(hdr);

				neighbors.forEach(function(n) {
					var row = el('div', 'fw-table-row');
					row.appendChild(el('span', 'fw-col fw-col-name fw-mono', n.mac));
					var ifCell = el('span', 'fw-col fw-col-proto');
					ifCell.appendChild(el('span', 'fw-proto-badge', n.iface));
					row.appendChild(ifCell);
					row.appendChild(el('span', 'fw-col fw-col-ext fw-mono', n.speed));
					row.appendChild(el('span', 'fw-col fw-col-ip', n.lastSeen));
					statusCard.appendChild(row);
				});
			}
			root.appendChild(statusCard);
		}

		/* ── Basic Setup Card ── */
		var setupCard = el('div', 'tg-config stor-card');
		var setupHdr = el('div', 'stor-card-hdr');
		setupHdr.innerHTML = icon(SVG.wifi, 20, 'var(--simple-accent)');
		setupHdr.appendChild(el('span', 'stor-card-title', 'Mesh Setup'));
		var helpBtn = el('button', 'mesh-help-btn', '?');
		helpBtn.title = 'Mesh Setup Guide';
		helpBtn.addEventListener('click', function() { self.showGuide(); });
		setupHdr.appendChild(helpBtn);
		setupCard.appendChild(setupHdr);

		var setupBody = el('div', 'sys-card-body');

		/* Enable toggle */
		var enRow = el('div', 'stor-share-row');
		enRow.style.padding = '0 0 14px'; enRow.style.borderBottom = '1px solid var(--simple-card-border)';
		var enLeft = el('div', 'stor-share-info');
		enLeft.appendChild(el('div', 'stor-share-name', 'Enable Mesh Networking'));
		enLeft.appendChild(el('div', 'stor-share-desc', 'Activate mesh Wi-Fi using batman-adv on this router'));
		enRow.appendChild(enLeft);
		var enToggle = el('label', 'dev-toggle');
		var enInput = E('input', { type: 'checkbox' });
		enInput.checked = enabled;
		enToggle.appendChild(enInput);
		enToggle.appendChild(el('span', 'dev-toggle-slider'));
		enRow.appendChild(enToggle);
		setupBody.appendChild(enRow);

		/* Role */
		var roleRow = el('div', 'fw-form-row');
		roleRow.appendChild(el('label', 'fw-form-label', 'Mesh Mode'));
		var roleSelect = document.createElement('select');
		roleSelect.className = 'fw-form-input';
		[{ v: 'server', l: 'Server (Gateway)' }, { v: 'off', l: 'Node (Repeater)' }, { v: 'client', l: 'Client' }].forEach(function(o) {
			var opt = document.createElement('option');
			opt.value = o.v; opt.textContent = o.l;
			if (o.v === role) opt.selected = true;
			roleSelect.appendChild(opt);
		});
		roleRow.appendChild(roleSelect);
		setupBody.appendChild(roleRow);

		/* WiFi SSID */
		var wifiIdRow = el('div', 'fw-form-row');
		wifiIdRow.appendChild(el('label', 'fw-form-label', 'WiFi Network SSID'));
		var wifiIdInput = E('input', { type: 'text', 'class': 'fw-form-input', value: wifiId, placeholder: 'e.g. MyNetwork' });
		wifiIdRow.appendChild(wifiIdInput);
		setupBody.appendChild(wifiIdRow);

		/* Regular AP Radio */
		var wifiRadioRow = el('div', 'fw-form-row');
		wifiRadioRow.appendChild(el('label', 'fw-form-label', 'Regular AP Radio'));
		var wifiRadioSelect = document.createElement('select');
		wifiRadioSelect.className = 'fw-form-input';
		radios.forEach(function(r) {
			var opt = document.createElement('option');
			opt.value = r.name;
			opt.textContent = r.name + ' (' + (r.band || r.type || '') + ', ch ' + r.channel + ')';
			if (r.name === wifiRadio) opt.selected = true;
			wifiRadioSelect.appendChild(opt);
		});
		wifiRadioRow.appendChild(wifiRadioSelect);
		setupBody.appendChild(wifiRadioRow);

		/* Mesh Radio */
		var apRadioRow = el('div', 'fw-form-row');
		apRadioRow.appendChild(el('label', 'fw-form-label', 'Mesh Backhaul Radio'));
		var apRadioSelect = document.createElement('select');
		apRadioSelect.className = 'fw-form-input';
		radios.forEach(function(r) {
			var opt = document.createElement('option');
			opt.value = r.name;
			opt.textContent = r.name + ' (' + (r.band || r.type || '') + ', ch ' + r.channel + ')';
			if (r.name === apRadio) opt.selected = true;
			apRadioSelect.appendChild(opt);
		});
		apRadioRow.appendChild(apRadioSelect);
		setupBody.appendChild(apRadioRow);

		/* Mesh SSID */
		var meshIdRow = el('div', 'fw-form-row');
		meshIdRow.appendChild(el('label', 'fw-form-label', 'Mesh Network SSID'));
		var meshIdInput = E('input', { type: 'text', 'class': 'fw-form-input', value: meshId, placeholder: 'Must match across all nodes' });
		meshIdRow.appendChild(meshIdInput);
		setupBody.appendChild(meshIdRow);

		/* Encryption */
		var encRow = el('div', 'stor-share-row');
		encRow.style.padding = '14px 0 0'; encRow.style.borderTop = '1px solid var(--simple-card-border)';
		var encLeft = el('div', 'stor-share-info');
		encLeft.appendChild(el('div', 'stor-share-name', 'Password Protection'));
		encLeft.appendChild(el('div', 'stor-share-desc', 'Require a password to join the mesh network (SAE encryption)'));
		encRow.appendChild(encLeft);
		var encToggle = el('label', 'dev-toggle');
		var encInput = E('input', { type: 'checkbox' });
		encInput.checked = encryption;
		encToggle.appendChild(encInput);
		encToggle.appendChild(el('span', 'dev-toggle-slider'));
		encRow.appendChild(encToggle);
		setupBody.appendChild(encRow);

		/* Password */
		var keyRow = el('div', 'fw-form-row mesh-key-row');
		keyRow.style.display = encryption ? '' : 'none';
		keyRow.appendChild(el('label', 'fw-form-label', 'Mesh Password'));
		var keyWrap = el('div', 'pw-field-wrap');
		var keyInput = E('input', { type: 'password', 'class': 'fw-form-input', value: key, placeholder: 'Min 8 characters' });
		keyWrap.appendChild(keyInput);
		var eyeBtn = el('button', 'pw-eye-btn');
		eyeBtn.type = 'button';
		eyeBtn.innerHTML = icon(SVG.eye, 18, 'var(--simple-text-sub)');
		var eyeShowing = false;
		eyeBtn.addEventListener('click', function() {
			eyeShowing = !eyeShowing;
			keyInput.type = eyeShowing ? 'text' : 'password';
			eyeBtn.innerHTML = icon(eyeShowing ? SVG.eyeOff : SVG.eye, 18, 'var(--simple-text-sub)');
		});
		keyWrap.appendChild(eyeBtn);
		keyRow.appendChild(keyWrap);
		setupBody.appendChild(keyRow);

		encInput.addEventListener('change', function() {
			keyRow.style.display = this.checked ? '' : 'none';
		});

		setupCard.appendChild(setupBody);

		/* Save + Apply */
		var setupActions = el('div', 'sys-card-actions');
		var saveBtn = el('button', 'fw-save-btn');
		saveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Save & Apply';
		saveBtn.addEventListener('click', function() {
			uci.set('easymesh', cfgName, 'enabled', enInput.checked ? '1' : '0');
			uci.set('easymesh', cfgName, 'role', roleSelect.value);
			uci.set('easymesh', cfgName, 'wifi_id', wifiIdInput.value.trim());
			uci.set('easymesh', cfgName, 'wifi_radio', wifiRadioSelect.value);
			uci.set('easymesh', cfgName, 'apRadio', apRadioSelect.value);
			uci.set('easymesh', cfgName, 'mesh_id', meshIdInput.value.trim());
			uci.set('easymesh', cfgName, 'encryption', encInput.checked ? '1' : '0');
			if (encInput.checked && keyInput.value.trim()) {
				uci.set('easymesh', cfgName, 'key', keyInput.value.trim());
			}

			uci.save().then(function() { return uci.apply(); }).then(function() {
				self.showToast('Mesh settings saved! Applying...');
				return L.resolveDefault(callFileExec('/bin/sh', ['-c', '/easymesh/easymesh.sh &']), {});
			}).then(function() {
				self.showToast('EasyMesh configuration applied');
				setTimeout(function() { window.location.reload(); }, 5000);
			});
		});
		setupActions.appendChild(saveBtn);

		var reapplyBtn = el('button', 'fw-add-btn');
		reapplyBtn.innerHTML = icon(SVG.play, 14, '#fff') + ' Reapply Mesh';
		reapplyBtn.addEventListener('click', function() {
			self.showToast('Reapplying mesh config...');
			L.resolveDefault(callFileExec('/bin/sh', ['-c', '/easymesh/easymesh.sh &']), {}).then(function() {
				self.showToast('EasyMesh reapplied');
				setTimeout(function() { window.location.reload(); }, 5000);
			});
		});
		setupActions.appendChild(reapplyBtn);

		setupCard.appendChild(setupActions);
		root.appendChild(setupCard);

		/* ── Advanced Settings Card ── */
		var advCard = el('div', 'tg-config stor-card');
		var advHdr = el('div', 'stor-card-hdr');
		advHdr.innerHTML = icon(SVG.settings, 20, 'var(--simple-accent)');
		advHdr.appendChild(el('span', 'stor-card-title', 'Advanced Settings'));
		advCard.appendChild(advHdr);

		var advBody = el('div', 'sys-card-body');

		var advHint = el('div', 'fw-hint');
		advHint.style.margin = '0 0 16px'; advHint.style.borderRadius = '10px';
		advHint.innerHTML = icon(SVG.info, 14, 'var(--simple-accent)') + ' These settings control 802.11r fast roaming. Leave at defaults unless you know what you\'re doing.';
		advBody.appendChild(advHint);

		/* K/V/R toggle */
		var kvrRow = el('div', 'stor-share-row');
		kvrRow.style.padding = '0 0 14px';
		var kvrLeft = el('div', 'stor-share-info');
		kvrLeft.appendChild(el('div', 'stor-share-name', '802.11k/v/r Fast Roaming'));
		kvrLeft.appendChild(el('div', 'stor-share-desc', 'Enables seamless client handoff between mesh nodes'));
		kvrRow.appendChild(kvrLeft);
		var kvrToggle = el('label', 'dev-toggle');
		var kvrInput = E('input', { type: 'checkbox' });
		kvrInput.checked = kvr;
		kvrToggle.appendChild(kvrInput);
		kvrToggle.appendChild(el('span', 'dev-toggle-slider'));
		kvrRow.appendChild(kvrToggle);
		advBody.appendChild(kvrRow);

		var mdRow = el('div', 'fw-form-row');
		mdRow.appendChild(el('label', 'fw-form-label', 'Mobility Domain (hex)'));
		var mdInput = E('input', { type: 'text', 'class': 'fw-form-input', value: mobilityDomain, placeholder: '4-char hex e.g. 4f57' });
		mdRow.appendChild(mdInput);
		advBody.appendChild(mdRow);

		var rssiRow = el('div', 'fw-form-row');
		rssiRow.appendChild(el('label', 'fw-form-label', 'Good RSSI Threshold (dBm)'));
		var rssiInput = E('input', { type: 'text', 'class': 'fw-form-input', value: rssiVal });
		rssiRow.appendChild(rssiInput);
		advBody.appendChild(rssiRow);

		var lowRssiRow = el('div', 'fw-form-row');
		lowRssiRow.appendChild(el('label', 'fw-form-label', 'Bad RSSI Threshold (dBm)'));
		var lowRssiInput = E('input', { type: 'text', 'class': 'fw-form-input', value: lowRssiVal });
		lowRssiRow.appendChild(lowRssiInput);
		advBody.appendChild(lowRssiRow);

		advCard.appendChild(advBody);

		var advActions = el('div', 'sys-card-actions');
		var advSaveBtn = el('button', 'fw-save-btn');
		advSaveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Save Advanced';
		advSaveBtn.addEventListener('click', function() {
			uci.set('easymesh', cfgName, 'kvr', kvrInput.checked ? '1' : '0');
			uci.set('easymesh', cfgName, 'mobility_domain', mdInput.value.trim());
			uci.set('easymesh', cfgName, 'rssi_val', rssiInput.value.trim());
			uci.set('easymesh', cfgName, 'low_rssi_val', lowRssiInput.value.trim());
			uci.save().then(function() { return uci.apply(); }).then(function() {
				self.showToast('Advanced settings saved!');
			});
		});
		advActions.appendChild(advSaveBtn);
		advCard.appendChild(advActions);
		root.appendChild(advCard);

		/* ── AP Mode Card (for nodes) ── */
		var apCard = el('div', 'tg-config stor-card');
		var apHdr = el('div', 'stor-card-hdr');
		apHdr.innerHTML = icon(SVG.server, 20, 'var(--simple-accent)');
		apHdr.appendChild(el('span', 'stor-card-title', 'Dumb AP / Node Mode'));
		apCard.appendChild(apHdr);

		var apBody = el('div', 'sys-card-body');

		var apWarn = el('div', 'fw-hint');
		apWarn.style.margin = '0 0 16px'; apWarn.style.borderRadius = '10px';
		apWarn.innerHTML = icon(SVG.warning, 14, '#f59e0b') + ' <strong>Warning:</strong> Enabling Dumb AP mode will change this device\'s IP address and disable routing services. You may lose access to this UI. Only use this on mesh nodes, not the gateway.';
		apBody.appendChild(apWarn);

		var hnRow = el('div', 'fw-form-row');
		hnRow.appendChild(el('label', 'fw-form-label', 'Node Hostname'));
		var hnSelect = document.createElement('select');
		hnSelect.className = 'fw-form-input';
		['node2','node3','node4','node5','node6','node7','node8','node9'].forEach(function(n) {
			var opt = document.createElement('option');
			opt.value = n; opt.textContent = n;
			if (cfg && cfg.hostname === n) opt.selected = true;
			hnSelect.appendChild(opt);
		});
		hnRow.appendChild(hnSelect);
		apBody.appendChild(hnRow);

		var ipModeRow = el('div', 'fw-form-row');
		ipModeRow.appendChild(el('label', 'fw-form-label', 'IP Mode'));
		var ipModeSelect = document.createElement('select');
		ipModeSelect.className = 'fw-form-input';
		[{ v: 'dhcp', l: 'DHCP (Automatic)' }, { v: 'static', l: 'Static IP' }].forEach(function(o) {
			var opt = document.createElement('option');
			opt.value = o.v; opt.textContent = o.l;
			if (cfg && cfg.ipmode === o.v) opt.selected = true;
			ipModeSelect.appendChild(opt);
		});
		ipModeRow.appendChild(ipModeSelect);
		apBody.appendChild(ipModeRow);

		var staticFields = el('div', 'mesh-static-fields');
		staticFields.style.display = (cfg && cfg.ipmode === 'static') ? '' : 'none';

		var fields = [
			{ name: 'ipaddr', label: 'Static IP Address', val: cfg ? (cfg.ipaddr || '192.168.8.3') : '192.168.8.3' },
			{ name: 'gateway', label: 'Gateway IP', val: cfg ? (cfg.gateway || '192.168.8.1') : '192.168.8.1' },
			{ name: 'netmask', label: 'Netmask', val: cfg ? (cfg.netmask || '255.255.255.0') : '255.255.255.0' },
			{ name: 'dns', label: 'DNS Server', val: cfg ? (cfg.dns || '192.168.8.1') : '192.168.8.1' }
		];
		var staticInputs = {};
		fields.forEach(function(f) {
			var r = el('div', 'fw-form-row');
			r.appendChild(el('label', 'fw-form-label', f.label));
			var inp = E('input', { type: 'text', 'class': 'fw-form-input', value: f.val });
			r.appendChild(inp);
			staticFields.appendChild(r);
			staticInputs[f.name] = inp;
		});
		apBody.appendChild(staticFields);

		ipModeSelect.addEventListener('change', function() {
			staticFields.style.display = this.value === 'static' ? '' : 'none';
		});

		apCard.appendChild(apBody);

		var apActions = el('div', 'sys-card-actions');
		var apEnableBtn = el('button', 'stor-eject-btn');
		apEnableBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
		apEnableBtn.innerHTML = icon(SVG.play, 14, '#fff') + ' Enable Dumb AP Mode';
		apEnableBtn.addEventListener('click', function() {
			if (!confirm('WARNING: This will change this node\'s IP address and you may lose access to this UI. Continue?')) return;
			uci.set('easymesh', cfgName, 'hostname', hnSelect.value);
			uci.set('easymesh', cfgName, 'ipmode', ipModeSelect.value);
			if (ipModeSelect.value === 'static') {
				for (var k in staticInputs) {
					uci.set('easymesh', cfgName, k, staticInputs[k].value.trim());
				}
			}
			uci.save().then(function() { return uci.apply(); }).then(function() {
				self.showToast('Applying Dumb AP mode...');
				return L.resolveDefault(callFileExec('/bin/sh', ['-c', '/easymesh/easymesh.sh dumbap &']), {});
			}).then(function() {
				self.showToast('Dumb AP mode applied. Device will reboot shortly.');
			});
		});
		apActions.appendChild(apEnableBtn);
		apCard.appendChild(apActions);
		root.appendChild(apCard);

		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
