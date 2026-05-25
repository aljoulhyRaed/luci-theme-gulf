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
	settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.611 3.611 0 0112 15.6z"/></svg>',
	search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
	download: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
	upload: '<svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
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
		{ name: 'USA Chicago 2', host: 'us-chi-loc2.torguard.com', cc: 'us' },
		{ name: 'USA Dallas', host: 'us-dal.torguard.com', cc: 'us' },
		{ name: 'USA Dallas 2', host: 'us-dal-loc2.torguard.com', cc: 'us' },
		{ name: 'USA LA', host: 'us-la.torguard.com', cc: 'us' },
		{ name: 'USA Las Vegas', host: 'us-lv.torguard.com', cc: 'us' },
		{ name: 'USA Miami', host: 'us-fl.torguard.com', cc: 'us' },
		{ name: 'USA New Jersey', host: 'us-nj.torguard.com', cc: 'us' },
		{ name: 'USA New Jersey 2', host: 'us-nj-loc2.torguard.com', cc: 'us' },
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

return view.extend({
	load: function() {
		return Promise.all([
			callUciGet('tgwireguard2_cfg'),
			callNetDump(),
			L.resolveDefault(callExec('/bin/sh', ['-c',
				'ip link show wg 2>/dev/null | head -1; ' +
				'echo "---WG_TRANSFER---"; ' +
				'wg show wg transfer 2>/dev/null; ' +
				'echo "---SYSFS---"; ' +
				'cat /sys/class/net/wg/statistics/rx_bytes 2>/dev/null || echo 0; ' +
				'echo; ' +
				'cat /sys/class/net/wg/statistics/tx_bytes 2>/dev/null || echo 0'
			]), '')
		]);
	},

	parseWgStats: function(raw) {
		raw = raw || '';
		var result = { up: false, rx: 0, tx: 0 };
		if (raw.indexOf('state UP') >= 0 || raw.indexOf(',UP') >= 0)
			result.up = true;
		var transferSection = raw.split('---WG_TRANSFER---')[1] || '';
		transferSection = transferSection.split('---SYSFS---')[0] || '';
		transferSection.trim().split('\n').forEach(function(line) {
			var parts = line.trim().split(/\t/);
			if (parts.length >= 3) {
				result.rx += parseInt(parts[1]) || 0;
				result.tx += parseInt(parts[2]) || 0;
			}
		});
		if (result.rx === 0 && result.tx === 0) {
			var sysfsSection = raw.split('---SYSFS---')[1] || '';
			var nums = sysfsSection.trim().split('\n');
			result.rx = parseInt(nums[0]) || 0;
			result.tx = parseInt(nums[1]) || 0;
		}
		return result;
	},

	render: function(data) {
		var cfg = data[0] || {};
		var ifaces = data[1] || [];
		var wgStats = this.parseWgStats(data[2]);
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

		var isConnected = (wgIface && wgIface.up) || wgStats.up;
		var vpnIP = '';
		if (wgIface && wgIface['ipv4-address'] && wgIface['ipv4-address'].length)
			vpnIP = wgIface['ipv4-address'][0].address;

		var selectedServer = settings.TGWG_URL || '';

		var root = el('div', 'simple-page');

		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero status card ── */
		var hero = el('div', 'tg-hero');

		var shield = el('div', 'tg-shield ' + (isConnected ? 'connected' : 'disconnected'), SVG.shield);
		hero.appendChild(shield);

		var statusText = el('div', 'tg-status-text', isConnected ? 'Connected' : 'Disconnected');
		hero.appendChild(statusText);

		var subText = '';
		if (isConnected) {
			subText = serverLabel(selectedServer);
			if (vpnIP) subText += '  \u2022  ' + vpnIP;
		} else {
			subText = settings.TGWG_ENABLED === 'yes' ? 'VPN enabled but tunnel is down' : 'VPN is not enabled';
		}
		hero.appendChild(el('div', 'tg-status-sub', subText));

		var powerBtn = el('button', 'tg-power-btn' + (isConnected ? ' stop' : ''));
		powerBtn.innerHTML = SVG.power + (isConnected ? ' Disconnect' : ' Connect');
		powerBtn.disabled = false;
		powerBtn.addEventListener('click', function() {
			self.handlePower(powerBtn, isConnected);
		});
		hero.appendChild(powerBtn);

		if (isConnected) {
			var rxBytes = wgStats.rx;
			var txBytes = wgStats.tx;
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

		/* ── Credentials card ── */
		var credsCard = el('div', 'tg-config');
		var credsTitle = el('div', 'tg-config-title', SVG.settings + ' Account Settings');
		credsCard.appendChild(credsTitle);

		var userRow = this.makeFieldRow('VPN Username', 'text', settings.TGWG_USER || '', 'tg-user');
		credsCard.appendChild(userRow);

		var passRow = this.makeFieldRow('VPN Password', 'password', settings.TGWG_PASS || '', 'tg-pass');
		credsCard.appendChild(passRow);

		root.appendChild(credsCard);

		/* ── Server selection card ── */
		var svrCard = el('div', 'tg-config');
		var svrTitle = el('div', 'tg-config-title', SVG.shield + ' Server Location');
		svrCard.appendChild(svrTitle);

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

		/* ── Save button ── */
		var saveWrap = el('div', '', null);
		saveWrap.style.textAlign = 'center';
		saveWrap.style.padding = '8px 0 24px';
		var saveBtn = el('button', 'simple-btn simple-btn-primary');
		saveBtn.textContent = 'Save Settings';
		saveBtn.style.padding = '12px 48px';
		saveBtn.style.fontSize = '15px';
		saveBtn.addEventListener('click', function() {
			self.handleSave(saveBtn);
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

		callExec('/etc/init.d/tgwireguard2', [action]).then(function() {
			setTimeout(function() { window.location.reload(); }, 4000);
		}).catch(function() {
			btn.innerHTML = 'Error — try again';
			btn.disabled = false;
		});
	},

	handleSave: function(btn) {
		var user = document.getElementById('tg-user');
		var pass = document.getElementById('tg-pass');
		if (!user || !pass) return;

		var vals = {
			TGWG_USER: user.value,
			TGWG_PASS: pass.value,
			TGWG_URL: this.selectedServer || '',
			TGWG_ENABLED: 'yes'
		};

		btn.disabled = true;
		btn.textContent = 'Saving...';

		callUciSet('tgwireguard2_cfg', 'settings', vals).then(function() {
			return callUciCommit('tgwireguard2_cfg');
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
	}
});
