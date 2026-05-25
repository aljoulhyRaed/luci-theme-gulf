'use strict';
'require view';
'require rpc';
'require ui';
'require dom';
'require poll';

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

var callExec = rpc.declare({
	object: 'file',
	method: 'exec',
	params: ['command', 'params'],
	expect: { stdout: '' }
});

var SVG = {
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.54-3.12 8.78-7 9.88-3.88-1.1-7-5.34-7-9.88V6.3l7-3.12z"/><path d="M10 12.5l-2-2-1.41 1.41L10 15.32l7-7-1.41-1.41z"/></svg>',
	power: '<svg viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42A6.92 6.92 0 0119 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.05.88-3.9 2.29-5.18l-1.42-1.42A8.96 8.96 0 003 12c0 4.97 4.03 9 9 9s9-4.03 9-9a8.96 8.96 0 00-2.17-5.83z"/></svg>',
	settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.611 3.611 0 0112 15.6z"/></svg>',
	search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
	lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>',
	tune: '<svg viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>',
	key: '<svg viewBox="0 0 24 24"><path d="M12.65 10A5.99 5.99 0 007 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 005.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
	globe: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	log: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-4h8v2H8v-2zm0 8h5v2H8v-2z"/></svg>'
};

var SERVERS = [
	{ region: 'Americas', servers: [
		{ name: 'Argentina', host: 'ar.torguard.com', cc: 'ar' },
		{ name: 'Brazil 1', host: 'br.torguard.com', cc: 'br' },
		{ name: 'Brazil 2', host: 'br2.torguard.com', cc: 'br' },
		{ name: 'Canada Toronto', host: 'ca.torguard.com', cc: 'ca' },
		{ name: 'Canada Vancouver', host: 'cavan.torguard.com', cc: 'ca' },
		{ name: 'Chile', host: 'ch.torguard.com', cc: 'cl' },
		{ name: 'Mexico', host: 'mx.torguard.com', cc: 'mx' },
		{ name: 'USA Atlanta', host: 'us-atl.torguard.com', cc: 'us' },
		{ name: 'USA Chicago', host: 'us-chi.torguard.com', cc: 'us' },
		{ name: 'USA Dallas', host: 'us-dal.torguard.com', cc: 'us' },
		{ name: 'USA LA', host: 'us-la.torguard.com', cc: 'us' },
		{ name: 'USA Las Vegas', host: 'us-lv.torguard.com', cc: 'us' },
		{ name: 'USA Miami', host: 'us-fl.torguard.com', cc: 'us' },
		{ name: 'USA New Jersey', host: 'us-nj.torguard.com', cc: 'us' },
		{ name: 'USA New York', host: 'us-ny.torguard.com', cc: 'us' },
		{ name: 'USA Salt Lake City', host: 'us-slc.torguard.com', cc: 'us' },
		{ name: 'USA San Francisco', host: 'us-sf.torguard.com', cc: 'us' },
		{ name: 'USA Seattle', host: 'us-sa.torguard.com', cc: 'us' }
	]},
	{ region: 'Europe', servers: [
		{ name: 'Austria', host: 'aus.torguard.com', cc: 'at' },
		{ name: 'Belgium', host: 'bg.torguard.com', cc: 'be' },
		{ name: 'Bulgaria', host: 'bul.torguard.com', cc: 'bg' },
		{ name: 'Czech Republic', host: 'cz.torguard.com', cc: 'cz' },
		{ name: 'Denmark', host: 'dn.torguard.com', cc: 'dk' },
		{ name: 'Finland', host: 'fn.torguard.com', cc: 'fi' },
		{ name: 'France', host: 'fr.torguard.com', cc: 'fr' },
		{ name: 'Germany', host: 'ger.torguard.com', cc: 'de' },
		{ name: 'Greece', host: 'gre.torguard.com', cc: 'gr' },
		{ name: 'Hungary', host: 'hg.torguard.com', cc: 'hu' },
		{ name: 'Iceland', host: 'ice.torguard.com', cc: 'is' },
		{ name: 'Ireland', host: 'ire.torguard.com', cc: 'ie' },
		{ name: 'Italy', host: 'it.torguard.com', cc: 'it' },
		{ name: 'Luxembourg', host: 'lux.torguard.com', cc: 'lu' },
		{ name: 'Moldova', host: 'md.torguard.com', cc: 'md' },
		{ name: 'Netherlands', host: 'nl.torguard.com', cc: 'nl' },
		{ name: 'Norway', host: 'no.torguard.com', cc: 'no' },
		{ name: 'Poland', host: 'pl.torguard.com', cc: 'pl' },
		{ name: 'Portugal', host: 'pg.torguard.com', cc: 'pt' },
		{ name: 'Romania', host: 'ro.torguard.com', cc: 'ro' },
		{ name: 'Russia', host: 'ru.torguard.com', cc: 'ru' },
		{ name: 'Slovakia', host: 'slk.torguard.com', cc: 'sk' },
		{ name: 'Spain', host: 'sp.torguard.com', cc: 'es' },
		{ name: 'Sweden', host: 'swe.torguard.com', cc: 'se' },
		{ name: 'Switzerland', host: 'swiss.torguard.com', cc: 'ch' },
		{ name: 'Turkey', host: 'tk.torguard.com', cc: 'tr' },
		{ name: 'UK London', host: 'uk.torguard.com', cc: 'gb' },
		{ name: 'UK Manchester', host: 'uk.man.torguard.com', cc: 'gb' },
		{ name: 'Ukraine', host: 'ukr.torguard.com', cc: 'ua' }
	]},
	{ region: 'Asia Pacific', servers: [
		{ name: 'Australia Sydney', host: 'au.torguard.com', cc: 'au' },
		{ name: 'Hong Kong', host: 'hk.torguard.com', cc: 'hk' },
		{ name: 'India Mumbai', host: 'in.torguard.com', cc: 'in' },
		{ name: 'Indonesia', host: 'id.torguard.com', cc: 'id' },
		{ name: 'Japan', host: 'jp.torguard.com', cc: 'jp' },
		{ name: 'New Zealand', host: 'nz.torguard.com', cc: 'nz' },
		{ name: 'Singapore', host: 'sg.torguard.com', cc: 'sg' },
		{ name: 'South Korea', host: 'sk.torguard.com', cc: 'kr' },
		{ name: 'Taiwan', host: 'tw.torguard.com', cc: 'tw' },
		{ name: 'Thailand', host: 'th.torguard.com', cc: 'th' }
	]},
	{ region: 'Middle East & Africa', servers: [
		{ name: 'Israel Tel Aviv', host: 'isr-loc1.torguard.com', cc: 'il' },
		{ name: 'South Africa', host: 'sa.torguard.com', cc: 'za' },
		{ name: 'UAE', host: 'uae.torguard.com', cc: 'ae' }
	]}
];

var PORTS = [
	{ value: '1912|SHA256', label: '1912 (SHA256)' },
	{ value: '1195|SHA256', label: '1195 (SHA256)' },
	{ value: '53|SHA256',   label: '53 (SHA256)' },
	{ value: '1198|SHA256', label: '1198 (SHA256)' },
	{ value: '9201|SHA256', label: '9201 (SHA256)' },
	{ value: '501|SHA256',  label: '501 (SHA256)' },
	{ value: '1194|SHA1',   label: '1194 (SHA1)' },
	{ value: '995|SHA1',    label: '995 (SHA1)' },
	{ value: '1215|SHA512', label: '1215 (SHA512)' },
	{ value: '389|SHA512',  label: '389 (SHA512)' },
	{ value: '80|SHA1',     label: '80 (SHA1)' },
	{ value: '443|SHA1',    label: '443 (SHA1)' }
];

var CIPHERS = ['AES-128-CBC', 'AES-256-CBC', 'AES-128-GCM', 'AES-256-GCM', 'BF-CBC'];

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (Array.isArray(children)) children.forEach(function(c) { if (c) e.appendChild(c); });
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function flagImg(cc) {
	var img = document.createElement('img');
	img.src = L.resource('view/simple/flags/' + cc + '.svg');
	img.alt = cc;
	img.className = 'flag-icon';
	img.style.cssText = 'width:24px;height:18px;object-fit:cover;border-radius:2px;flex-shrink:0;box-shadow:0 0 0 1px rgba(0,0,0,.12)';
	return img;
}

function formatBytes(b) {
	b = parseInt(b) || 0;
	if (b < 1024) return b + ' B';
	if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
	if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB';
	return (b / 1073741824).toFixed(2) + ' GB';
}

function serverLabel(host) {
	for (var r = 0; r < SERVERS.length; r++)
		for (var s = 0; s < SERVERS[r].servers.length; s++)
			if (SERVERS[r].servers[s].host === host) {
				var srv = SERVERS[r].servers[s];
				return '<img src="' + L.resource('view/simple/flags/' + srv.cc + '.svg') + '" style="width:20px;height:15px;object-fit:cover;border-radius:2px;vertical-align:middle;margin-right:6px;box-shadow:0 0 0 1px rgba(0,0,0,.12)">' + srv.name;
			}
	return host;
}

function icon(svg, size, fill) {
	return svg.replace('<svg ', '<svg style="width:' + (size||16) + 'px;height:' + (size||16) + 'px;fill:' + (fill||'currentColor') + ';flex-shrink:0" ');
}

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callUciGet('tgopenvpn_cfg'), {}),
			L.resolveDefault(callExec('/bin/sh', ['-c', 'ip link show tun0 2>/dev/null && echo TUN_UP || echo TUN_DOWN']), ''),
			L.resolveDefault(callExec('/bin/sh', ['-c',
				'cat /sys/class/net/tun0/statistics/rx_bytes 2>/dev/null || echo 0; ' +
				'cat /sys/class/net/tun0/statistics/tx_bytes 2>/dev/null || echo 0'
			]), '')
		]);
	},

	showToast: function(msg, isError) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' + (isError ? ' error' : '') }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	render: function(data) {
		var cfg = data[0] || {};
		var tunStatus = (data[1] || '').trim();
		var trafficRaw = (data[2] || '').trim();
		var self = this;

		var settings = null;
		for (var k in cfg) {
			if (cfg[k] && cfg[k]['.type'] === 'ovpnconfig') {
				settings = cfg[k];
				break;
			}
		}
		if (!settings) settings = {};

		var isConnected = tunStatus.indexOf('TUN_UP') !== -1;
		var rxBytes = 0, txBytes = 0;
		if (isConnected && trafficRaw) {
			var parts = trafficRaw.split('\n');
			rxBytes = parseInt(parts[0]) || 0;
			txBytes = parseInt(parts[1]) || 0;
		}

		var selectedServer = settings.server || '';
		var curProtocol = settings.protocol || 'tcp';
		var curPort = settings.port || '1912|SHA256';
		var curCipher = settings.cipher || 'AES-256-GCM';
		var curDedicated = settings.dedicated || 'NO';

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		if (isConnected)
			hero.style.background = 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)';

		var shield = el('div', 'tg-shield ' + (isConnected ? 'connected' : 'disconnected'), SVG.shield);
		hero.appendChild(shield);

		hero.appendChild(el('div', 'tg-status-text', isConnected ? 'Connected' : 'Disconnected'));

		var subText = '';
		if (isConnected) {
			subText = serverLabel(selectedServer);
			subText += '  \u2022  OpenVPN ' + curProtocol.toUpperCase();
		} else {
			subText = settings.status === 'yes' ? 'OpenVPN enabled but tunnel is down' : 'OpenVPN is not enabled';
		}
		hero.appendChild(el('div', 'tg-status-sub', subText));

		var powerBtn = el('button', 'tg-power-btn' + (isConnected ? ' stop' : ''));
		powerBtn.innerHTML = SVG.power + (isConnected ? ' Disconnect' : ' Connect');
		powerBtn.addEventListener('click', function() {
			self.handlePower(powerBtn, isConnected);
		});
		hero.appendChild(powerBtn);

		if (isConnected) {
			var stats = el('div', 'tg-stats');
			var dlStat = el('div', 'tg-stat');
			dlStat.appendChild(el('div', 'tg-stat-val', formatBytes(rxBytes)));
			dlStat.appendChild(el('div', 'tg-stat-label', '\u2193 Download'));
			stats.appendChild(dlStat);
			var ulStat = el('div', 'tg-stat');
			ulStat.appendChild(el('div', 'tg-stat-val', formatBytes(txBytes)));
			ulStat.appendChild(el('div', 'tg-stat-label', '\u2191 Upload'));
			stats.appendChild(ulStat);
			hero.appendChild(stats);
		}

		root.appendChild(hero);

		/* ── Account Settings Card ── */
		var credsCard = el('div', 'tg-config');
		credsCard.appendChild(el('div', 'tg-config-title', icon(SVG.key, 18) + ' Account Settings'));

		credsCard.appendChild(this.makeFieldRow('VPN Username', 'text', settings.username || '', 'ovpn-user'));
		credsCard.appendChild(this.makeFieldRow('VPN Password', 'password', settings.password || '', 'ovpn-pass'));

		root.appendChild(credsCard);

		/* ── Connection Settings Card ── */
		var connCard = el('div', 'tg-config');
		connCard.appendChild(el('div', 'tg-config-title', icon(SVG.tune, 18) + ' Connection Settings'));

		var protoRow = el('div', 'inet-field-row');
		protoRow.appendChild(el('span', 'inet-field-label', 'Protocol'));
		var protoWrap = el('div', 'ovpn-toggle-group');
		['udp', 'tcp'].forEach(function(p) {
			var btn = el('button', 'ovpn-toggle-btn' + (curProtocol === p ? ' active' : ''), p.toUpperCase());
			btn.addEventListener('click', function() {
				protoWrap.querySelectorAll('.ovpn-toggle-btn').forEach(function(b) { b.classList.remove('active'); });
				btn.classList.add('active');
				self._selectedProto = p;
			});
			protoWrap.appendChild(btn);
		});
		protoRow.appendChild(protoWrap);
		connCard.appendChild(protoRow);
		this._selectedProto = curProtocol;

		connCard.appendChild(this.makeSelectRow('Port / Auth', PORTS.map(function(p) { return { value: p.value, label: p.label }; }), curPort, 'ovpn-port'));
		connCard.appendChild(this.makeSelectRow('Cipher', CIPHERS.map(function(c) { return { value: c, label: c }; }), curCipher, 'ovpn-cipher'));

		var dediRow = el('div', 'inet-field-row');
		dediRow.appendChild(el('span', 'inet-field-label', 'Dedicated IP'));
		var dediToggle = el('div', 'ovpn-toggle-group');
		var dediField = el('div', 'ovpn-dedi-field');
		dediField.style.display = curDedicated === 'YES' ? 'block' : 'none';

		['NO', 'YES'].forEach(function(v) {
			var btn = el('button', 'ovpn-toggle-btn' + (curDedicated === v ? ' active' : ''), v);
			btn.addEventListener('click', function() {
				dediToggle.querySelectorAll('.ovpn-toggle-btn').forEach(function(b) { b.classList.remove('active'); });
				btn.classList.add('active');
				self._selectedDedi = v;
				dediField.style.display = v === 'YES' ? 'block' : 'none';
			});
			dediToggle.appendChild(btn);
		});
		dediRow.appendChild(dediToggle);
		connCard.appendChild(dediRow);
		this._selectedDedi = curDedicated;

		var dediInput = el('input', 'tg-server-search');
		dediInput.type = 'text';
		dediInput.id = 'ovpn-dediserver';
		dediInput.placeholder = 'e.g. dedicated.torguard.com';
		dediInput.value = settings.dediserver || '';
		dediInput.style.width = '100%';
		dediInput.style.marginTop = '8px';
		dediField.appendChild(dediInput);
		connCard.appendChild(dediField);

		root.appendChild(connCard);

		/* ── Server Selection Card ── */
		var svrCard = el('div', 'tg-config');
		svrCard.appendChild(el('div', 'tg-config-title', icon(SVG.globe, 18) + ' Server Location'));

		var searchWrap = el('div', 'tg-server-search-wrap');
		searchWrap.innerHTML = SVG.search;
		var searchInput = el('input', 'tg-server-search');
		searchInput.type = 'text';
		searchInput.placeholder = 'Search servers...';
		searchWrap.appendChild(searchInput);
		svrCard.appendChild(searchWrap);

		var serverList = el('div', 'tg-server-list');
		this.renderServerList(serverList, selectedServer, '');
		svrCard.appendChild(serverList);

		searchInput.addEventListener('input', function() {
			self.renderServerList(serverList, self.selectedServer || selectedServer, this.value);
		});

		this.selectedServer = selectedServer;
		root.appendChild(svrCard);

		/* ── Log Card ── */
		var logCard = el('div', 'tg-config');
		logCard.appendChild(el('div', 'tg-config-title', icon(SVG.log, 18) + ' Connection Log'));

		var logBox = el('pre', 'ovpn-log-box');
		logBox.textContent = 'Click "Show Log" to view OpenVPN connection log.';
		logCard.appendChild(logBox);

		var logActions = el('div', 'ovpn-log-actions');
		var logBtn = el('button', 'inet-scan-btn-v2');
		logBtn.innerHTML = icon(SVG.log, 14) + ' Show Log';
		logBtn.addEventListener('click', function() {
			logBtn.disabled = true;
			logBtn.innerHTML = '<span class="tg-spinner"></span> Loading...';
			L.resolveDefault(callExec('/bin/sh', ['-c', 'tail -50 /tmp/openvpn.log 2>/dev/null || echo "No log file found."']), '').then(function(out) {
				logBox.textContent = out.trim() || 'Log is empty.';
				logBox.scrollTop = logBox.scrollHeight;
				logBtn.disabled = false;
				logBtn.innerHTML = icon(SVG.log, 14) + ' Refresh Log';
			});
		});
		logActions.appendChild(logBtn);
		logCard.appendChild(logActions);

		root.appendChild(logCard);

		/* ── Save Button ── */
		var saveWrap = el('div', '');
		saveWrap.style.textAlign = 'center';
		saveWrap.style.padding = '8px 0 24px';
		var saveBtn = el('button', 'simple-btn simple-btn-primary');
		saveBtn.textContent = 'Save Settings';
		saveBtn.style.padding = '12px 48px';
		saveBtn.style.fontSize = '15px';
		saveBtn.addEventListener('click', function() {
			self.doSave(saveBtn);
		});
		saveWrap.appendChild(saveBtn);
		root.appendChild(saveWrap);

		return root;
	},

	makeFieldRow: function(label, type, value, id) {
		var row = el('div', 'inet-field-row');
		row.appendChild(el('span', 'inet-field-label', label));
		var input = el('input', 'tg-server-search');
		input.type = type;
		input.value = value;
		input.id = id;
		input.style.width = '280px';
		input.style.maxWidth = '100%';
		row.appendChild(input);
		return row;
	},

	makeSelectRow: function(label, options, current, id) {
		var row = el('div', 'inet-field-row');
		row.appendChild(el('span', 'inet-field-label', label));
		var sel = document.createElement('select');
		sel.className = 'ovpn-select';
		sel.id = id;
		options.forEach(function(o) {
			var opt = document.createElement('option');
			opt.value = o.value;
			opt.textContent = o.label;
			if (o.value === current) opt.selected = true;
			sel.appendChild(opt);
		});
		row.appendChild(sel);
		return row;
	},

	renderServerList: function(container, selectedHost, filter) {
		container.innerHTML = '';
		var self = this;
		var lc = (filter || '').toLowerCase();

		SERVERS.forEach(function(region) {
			var filtered = region.servers.filter(function(s) {
				return !lc || s.name.toLowerCase().indexOf(lc) !== -1 || s.host.toLowerCase().indexOf(lc) !== -1;
			});
			if (!filtered.length) return;

			container.appendChild(el('div', 'tg-server-region', region.region));
			filtered.forEach(function(s) {
				var item = el('div', 'tg-server-item' + (s.host === selectedHost ? ' selected' : ''));
				item.appendChild(flagImg(s.cc));
				item.appendChild(el('span', 'server-name', s.name));
				item.appendChild(el('span', 'server-host', s.host));
				item.dataset.host = s.host;
				item.addEventListener('click', function() {
					container.querySelectorAll('.tg-server-item').forEach(function(el) { el.classList.remove('selected'); });
					item.classList.add('selected');
					self.selectedServer = s.host;
				});
				container.appendChild(item);
			});
		});
	},

	handlePower: function(btn, wasConnected) {
		btn.disabled = true;
		btn.innerHTML = '<span class="tg-spinner"></span> ' + (wasConnected ? 'Stopping...' : 'Starting...');

		var action = wasConnected ? 'stop' : 'start';

		callExec('/etc/init.d/tgopenvpn', [action]).then(function() {
			setTimeout(function() { window.location.reload(); }, 5000);
		}).catch(function() {
			btn.innerHTML = 'Error \u2014 try again';
			btn.disabled = false;
		});
	},

	doSave: function(btn) {
		var user = document.getElementById('ovpn-user');
		var pass = document.getElementById('ovpn-pass');
		var port = document.getElementById('ovpn-port');
		var cipher = document.getElementById('ovpn-cipher');
		var dediserver = document.getElementById('ovpn-dediserver');

		if (!user || !pass) return;

		var vals = {
			username: user.value,
			password: pass.value,
			server: this.selectedServer || '',
			protocol: this._selectedProto || 'tcp',
			port: port ? port.value : '1912|SHA256',
			cipher: cipher ? cipher.value : 'AES-256-GCM',
			dedicated: this._selectedDedi || 'NO',
			dediserver: dediserver ? dediserver.value : '',
			status: 'yes'
		};

		btn.disabled = true;
		btn.textContent = 'Saving...';

		callUciSet('tgopenvpn_cfg', 'settings', vals).then(function() {
			return callUciCommit('tgopenvpn_cfg');
		}).then(function() {
			btn.textContent = '\u2713 Saved';
			btn.style.background = '#22c55e';
			setTimeout(function() {
				btn.textContent = 'Save Settings';
				btn.style.background = '';
				btn.disabled = false;
			}, 2000);
		}).catch(function() {
			btn.textContent = 'Save Failed';
			btn.style.background = '#ef4444';
			btn.disabled = false;
		});
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
