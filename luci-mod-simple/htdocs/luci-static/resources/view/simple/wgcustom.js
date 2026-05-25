'use strict';
'require view';
'require rpc';
'require ui';
'require dom';

var callUciGet = rpc.declare({
	object: 'uci',
	method: 'get',
	params: ['config'],
	expect: { values: {} }
});

var callUciSet = rpc.declare({
	object: 'uci',
	method: 'set',
	params: ['config', 'section', 'values']
});

var callUciCommit = rpc.declare({
	object: 'uci',
	method: 'commit',
	params: ['config']
});

var callNetDump = rpc.declare({
	object: 'network.interface',
	method: 'dump',
	expect: { 'interface': [] }
});

var callExec = rpc.declare({
	object: 'file',
	method: 'exec',
	params: ['command', 'params'],
	expect: { stdout: '' }
});

var SVG = {
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.54-3.12 8.78-7 9.88-3.88-1.1-7-5.34-7-9.88V6.3l7-3.12z"/><path d="M10 12.5l-2-2-1.41 1.41L10 15.32l7-7-1.41-1.41z"/></svg>',
	power: '<svg viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42A6.92 6.92 0 0119 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.05.88-3.9 2.29-5.18l-1.42-1.42A8.96 8.96 0 003 12c0 4.97 4.03 9 9 9s9-4.03 9-9a8.96 8.96 0 00-2.17-5.83z"/></svg>',
	paste: '<svg viewBox="0 0 24 24"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
	key: '<svg viewBox="0 0 24 24"><path d="M12.65 10A5.99 5.99 0 007 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 005.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
	firewall: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
	code: '<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>'
};

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (Array.isArray(children)) children.forEach(function(c) { if (c) e.appendChild(c); });
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function formatBytes(b) {
	b = parseInt(b) || 0;
	if (b < 1024) return b + ' B';
	if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
	if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB';
	return (b / 1073741824).toFixed(2) + ' GB';
}

function parseWgConfig(text) {
	if (!text) return null;
	var ifBlock = text.match(/\[Interface\]([\s\S]*?)\[Peer\]/);
	if (!ifBlock) return null;
	var iface = ifBlock[1];
	var peer = text.match(/\[Peer\]([\s\S]*)$/);
	if (!peer) return null;
	peer = peer[1];

	var get = function(src, key) {
		var m = src.match(new RegExp(key + '\\s*=\\s*(.+)'));
		return m ? m[1].trim() : '';
	};

	var endpoint = get(peer, 'Endpoint');
	var epHost = '', epPort = '';
	if (endpoint) {
		var parts = endpoint.match(/^([^:]+):(\d+)$/);
		if (parts) { epHost = parts[1]; epPort = parts[2]; }
	}

	return {
		privateKey: get(iface, 'PrivateKey'),
		address: get(iface, 'Address'),
		listenPort: get(iface, 'ListenPort'),
		mtu: get(iface, 'MTU'),
		dns: get(iface, 'DNS'),
		publicKey: get(peer, 'PublicKey'),
		allowedIPs: get(peer, 'AllowedIPs'),
		endpointHost: epHost,
		endpointPort: epPort,
		persistentKeepalive: get(peer, 'PersistentKeepalive')
	};
}

return view.extend({
	load: function() {
		return Promise.all([
			callUciGet('tgwireguard_cfg'),
			callNetDump()
		]);
	},

	render: function(data) {
		var cfg = data[0] || {};
		var ifaces = data[1] || [];
		var self = this;

		var settings = null;
		for (var k in cfg) {
			if (cfg[k] && cfg[k]['.type'] === 'wgconfig') {
				settings = cfg[k];
				break;
			}
		}
		if (!settings) settings = {};

		var wgIface = null;
		for (var i = 0; i < ifaces.length; i++) {
			if (ifaces[i].interface === 'wg' || ifaces[i].proto === 'wireguard') {
				wgIface = ifaces[i];
				break;
			}
		}

		var isConnected = wgIface && wgIface.up;
		var vpnIP = '';
		if (wgIface && wgIface['ipv4-address'] && wgIface['ipv4-address'].length)
			vpnIP = wgIface['ipv4-address'][0].address;

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero status ── */
		var hero = el('div', 'tg-hero');
		if (isConnected)
			hero.style.background = 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)';

		var shield = el('div', 'tg-shield ' + (isConnected ? 'connected' : 'disconnected'), SVG.shield);
		hero.appendChild(shield);
		hero.appendChild(el('div', 'tg-status-text', isConnected ? 'Connected' : 'Disconnected'));

		var subText = '';
		if (isConnected && vpnIP) subText = 'Tunnel IP: ' + vpnIP;
		else if (settings.TGWG_ENABLED === 'yes') subText = 'VPN enabled but tunnel is down';
		else subText = 'Paste your WireGuard config to get started';
		hero.appendChild(el('div', 'tg-status-sub', subText));

		var powerBtn = el('button', 'tg-power-btn' + (isConnected ? ' stop' : ''));
		powerBtn.innerHTML = SVG.power + (isConnected ? ' Disconnect' : ' Connect');
		powerBtn.addEventListener('click', function() {
			self.handlePower(powerBtn, isConnected);
		});
		hero.appendChild(powerBtn);

		if (isConnected && wgIface && wgIface.data) {
			var stats = el('div', 'tg-stats');
			var dlStat = el('div', 'tg-stat');
			dlStat.appendChild(el('div', 'tg-stat-val', formatBytes(wgIface.data.rx_bytes || 0)));
			dlStat.appendChild(el('div', 'tg-stat-label', '\u2193 Download'));
			stats.appendChild(dlStat);
			var ulStat = el('div', 'tg-stat');
			ulStat.appendChild(el('div', 'tg-stat-val', formatBytes(wgIface.data.tx_bytes || 0)));
			ulStat.appendChild(el('div', 'tg-stat-label', '\u2191 Upload'));
			stats.appendChild(ulStat);
			hero.appendChild(stats);
		}

		root.appendChild(hero);

		/* ── Config paste card ── */
		var configCard = el('div', 'tg-config');
		var configTitle = el('div', 'tg-config-title', SVG.code + ' WireGuard Configuration');
		configCard.appendChild(configTitle);

		var hint = el('div', 'wgc-hint');
		hint.innerHTML = 'Paste your WireGuard configuration file below. The <code>[Interface]</code> and <code>[Peer]</code> sections will be automatically parsed.';
		configCard.appendChild(hint);

		var textWrap = el('div', 'wgc-textarea-wrap');
		var textarea = el('textarea', 'wgc-textarea');
		textarea.id = 'wg-config-text';
		textarea.rows = 14;
		textarea.spellcheck = false;
		textarea.placeholder = '[Interface]\nPrivateKey = your_private_key\nAddress = 10.x.x.x/32\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = server_public_key\nAllowedIPs = 0.0.0.0/0\nEndpoint = server:port\nPersistentKeepalive = 25';
		textarea.value = settings.wgconfig || '';
		textWrap.appendChild(textarea);
		configCard.appendChild(textWrap);

		var previewBox = el('div', 'wgc-preview');
		previewBox.id = 'wg-preview';
		this.updatePreview(previewBox, textarea.value);
		configCard.appendChild(previewBox);

		textarea.addEventListener('input', function() {
			self.updatePreview(previewBox, textarea.value);
		});

		root.appendChild(configCard);

		/* ── Settings card ── */
		var settingsCard = el('div', 'tg-config');
		var settingsTitle = el('div', 'tg-config-title', SVG.firewall + ' Settings');
		settingsCard.appendChild(settingsTitle);

		var enableRow = el('div', 'inet-field-row');
		enableRow.appendChild(el('span', 'inet-field-label', 'Enable WireGuard'));
		var enableSel = el('select', 'wgc-select');
		enableSel.id = 'wg-enabled';
		enableSel.innerHTML = '<option value="yes">Yes</option><option value="no">No</option>';
		enableSel.value = settings.TGWG_ENABLED || 'no';
		enableRow.appendChild(enableSel);
		settingsCard.appendChild(enableRow);

		var fwRow = el('div', 'inet-field-row');
		fwRow.appendChild(el('span', 'inet-field-label', 'Firewall Zone'));
		var fwSel = el('select', 'wgc-select');
		fwSel.id = 'wg-fwzone';
		fwSel.innerHTML = '<option value="wan">wan (Remote VPN IP)</option><option value="lan">lan (Local VPN Gateway)</option>';
		fwSel.value = settings.TG_MODE || 'wan';
		fwRow.appendChild(fwSel);
		settingsCard.appendChild(fwRow);

		var fwNote = el('div', 'wgc-note');
		fwNote.innerHTML = SVG.warning + '<span><strong>wan</strong> = routes all traffic through VPN &nbsp;|&nbsp; <strong>lan</strong> = VPN acts as local gateway</span>';
		settingsCard.appendChild(fwNote);

		root.appendChild(settingsCard);

		/* ── Save button ── */
		var saveWrap = el('div', '');
		saveWrap.style.cssText = 'text-align:center;padding:8px 0 24px';
		var saveBtn = el('button', 'simple-btn simple-btn-primary');
		saveBtn.id = 'wg-save-btn';
		saveBtn.textContent = 'Save & Apply';
		saveBtn.style.cssText = 'padding:12px 48px;font-size:15px';
		saveBtn.addEventListener('click', function() { self.handleSave(saveBtn); });
		saveWrap.appendChild(saveBtn);
		root.appendChild(saveWrap);

		return root;
	},

	updatePreview: function(box, text) {
		var parsed = parseWgConfig(text);
		if (!parsed || !parsed.privateKey) {
			box.innerHTML = '<div class="wgc-preview-empty">Waiting for valid WireGuard configuration\u2026</div>';
			return;
		}
		var mask = function(s) {
			if (!s || s.length < 8) return s || '';
			return s.substring(0, 4) + '\u2022'.repeat(Math.min(s.length - 8, 20)) + s.substring(s.length - 4);
		};
		var rows = [
			['Private Key', mask(parsed.privateKey), 'key'],
			['Address', parsed.address, 'addr'],
			['Public Key', mask(parsed.publicKey), 'key'],
			['Endpoint', parsed.endpointHost + ':' + parsed.endpointPort, 'endpoint'],
			['Allowed IPs', parsed.allowedIPs, 'route']
		];
		if (parsed.dns) rows.push(['DNS', parsed.dns, 'dns']);
		if (parsed.persistentKeepalive) rows.push(['Keepalive', parsed.persistentKeepalive + 's', 'keepalive']);

		var html = '<div class="wgc-preview-title">' + SVG.check + ' Configuration Parsed</div><div class="wgc-preview-grid">';
		rows.forEach(function(r) {
			html += '<div class="wgc-pv-row"><span class="wgc-pv-label">' + r[0] + '</span><span class="wgc-pv-value">' + r[1] + '</span></div>';
		});
		html += '</div>';
		box.innerHTML = html;
	},

	handlePower: function(btn, wasConnected) {
		btn.disabled = true;
		btn.innerHTML = '<span class="tg-spinner"></span> ' + (wasConnected ? 'Stopping...' : 'Starting...');
		var action = wasConnected ? 'stop' : 'start';
		callExec('/etc/init.d/tgwireguard', [action]).then(function() {
			setTimeout(function() { window.location.reload(); }, 4000);
		}).catch(function() {
			btn.innerHTML = 'Error \u2014 try again';
			btn.disabled = false;
		});
	},

	handleSave: function(btn) {
		var textarea = document.getElementById('wg-config-text');
		var enabled = document.getElementById('wg-enabled');
		var fwzone = document.getElementById('wg-fwzone');
		if (!textarea) return;

		var configText = textarea.value;
		var parsed = parseWgConfig(configText);

		var vals = {
			wgconfig: configText,
			TGWG_ENABLED: enabled ? enabled.value : 'no',
			TG_MODE: fwzone ? fwzone.value : 'wan'
		};

		if (parsed && parsed.privateKey) {
			vals.TGWG_PRIVKEY = parsed.privateKey;
			vals.TGWG_ADDR = parsed.address;
			vals.TGWG_PUBKEY = parsed.publicKey;
			vals.TGWG_ENDHOST = parsed.endpointHost;
			vals.TGWG_ENDPORT = parsed.endpointPort;
			vals.TGWG_ALLOWEDIP = parsed.allowedIPs;
		}

		btn.disabled = true;
		btn.textContent = 'Saving...';

		callUciSet('tgwireguard_cfg', 'settings', vals).then(function() {
			return callUciCommit('tgwireguard_cfg');
		}).then(function() {
			btn.textContent = '\u2713 Saved';
			btn.style.background = '#22c55e';
			setTimeout(function() {
				btn.textContent = 'Save & Apply';
				btn.style.background = '';
				btn.disabled = false;
			}, 2000);
		}).catch(function() {
			btn.textContent = 'Save Failed';
			btn.style.background = '#ef4444';
			btn.disabled = false;
		});
	}
});
