'use strict';
'require view';
'require rpc';
'require ui';
'require dom';
'require poll';

var callUciGet = rpc.declare({ object: 'uci', method: 'get', params: ['config'], expect: { values: {} } });
var callUciSet = rpc.declare({ object: 'uci', method: 'set', params: ['config', 'section', 'values'] });
var callUciCommit = rpc.declare({ object: 'uci', method: 'commit', params: ['config'] });
var callExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'], expect: { stdout: '' } });
var callFileRead = rpc.declare({ object: 'file', method: 'read', params: ['path'], expect: { data: '' } });

var SVG = {
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.54-3.12 8.78-7 9.88-3.88-1.1-7-5.34-7-9.88V6.3l7-3.12z"/><path d="M10 12.5l-2-2-1.41 1.41L10 15.32l7-7-1.41-1.41z"/></svg>',
	power: '<svg viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42A6.92 6.92 0 0119 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.05.88-3.9 2.29-5.18l-1.42-1.42A8.96 8.96 0 003 12c0 4.97 4.03 9 9 9s9-4.03 9-9a8.96 8.96 0 00-2.17-5.83z"/></svg>',
	globe: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
	key: '<svg viewBox="0 0 24 24"><path d="M12.65 10A5.99 5.99 0 007 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 005.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
	settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.611 3.611 0 0112 15.6z"/></svg>',
	search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	link: '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
	vpn: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
	proxy: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93C7.06 19.43 4 16.07 4 12zm13.89 5.4c-.26-.81-1-1.39-1.89-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C18.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z"/></svg>'
};

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (Array.isArray(children)) children.forEach(function(c) { if (c) e.appendChild(c); });
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function parseServerTag(tag) {
	var m = tag.match(/^TG-(.+?)(?:-(Reality|CDN\d*)-?(Vless|Trojan|Vmess)?)?$/i);
	if (!m) return { location: tag, proto: '', cdn: '' };
	var loc = m[1].replace(/-/g, ' ');
	var cdn = m[2] || '';
	var proto = m[3] || (cdn === 'Reality' ? 'Reality' : '');
	if (cdn === 'Reality') cdn = '';
	return { location: loc, proto: proto, cdn: cdn };
}

function locationToCC(loc) {
	var map = {
		'Bulgaria': 'bg', 'Austria': 'at',
		'Phoenix': 'us', 'Miami': 'us',
		'Sweden': 'se', 'Slovakia': 'sk',
		'UK Man': 'gb', 'UK': 'gb', 'London': 'gb',
		'Italy': 'it', 'Swiss': 'ch', 'Switzerland': 'ch',
		'HongKong': 'hk', 'Hong Kong': 'hk',
		'UAE': 'ae', 'Canada': 'ca',
		'Germany': 'de', 'Netherlands': 'nl',
		'Norway': 'no', 'Romania': 'ro',
		'LosAngeles': 'us', 'Los Angeles': 'us',
		'Dallas': 'us', 'Chicago': 'us', 'NewYork': 'us',
		'New York': 'us', 'Atlanta': 'us', 'Seattle': 'us',
		'SanFrancisco': 'us', 'San Francisco': 'us', 'SaltLakeCity': 'us',
		'Las Vegas': 'us', 'LasVegas': 'us', 'NewJersey': 'us',
		'Turkey': 'tr', 'Ukraine': 'ua',
		'Moldova': 'md', 'Singapore': 'sg',
		'Belgium': 'be', 'Russia': 'ru',
		'Kenya': 'ke', 'France': 'fr',
		'Poland': 'pl', 'Spain': 'es',
		'Japan': 'jp', 'Taiwan': 'tw',
		'Thailand': 'th', 'India': 'in',
		'Indonesia': 'id', 'Korea': 'kr',
		'South Korea': 'kr', 'SouthKorea': 'kr',
		'Australia': 'au', 'Brazil': 'br',
		'Argentina': 'ar', 'Mexico': 'mx',
		'Chile': 'cl', 'Israel': 'il',
		'South Africa': 'za', 'SouthAfrica': 'za',
		'New Zealand': 'nz', 'NewZealand': 'nz',
		'Czech Republic': 'cz', 'Czech': 'cz',
		'Denmark': 'dk', 'Finland': 'fi',
		'Greece': 'gr', 'Hungary': 'hu',
		'Iceland': 'is', 'Ireland': 'ie',
		'Luxembourg': 'lu', 'Portugal': 'pt'
	};
	return map[loc] || null;
}

function flagImg(cc) {
	var img = document.createElement('img');
	img.src = L.resource('view/simple/flags/' + cc + '.svg');
	img.alt = cc;
	img.className = 'flag-icon';
	img.style.cssText = 'width:24px;height:18px;object-fit:cover;border-radius:2px;flex-shrink:0;box-shadow:0 0 0 1px rgba(0,0,0,.12)';
	return img;
}

function flagImgSmall(cc) {
	var img = document.createElement('img');
	img.src = L.resource('view/simple/flags/' + cc + '.svg');
	img.alt = cc;
	img.className = 'flag-icon';
	img.style.cssText = 'width:20px;height:15px;object-fit:cover;border-radius:2px;flex-shrink:0;vertical-align:middle;margin-right:6px;box-shadow:0 0 0 1px rgba(0,0,0,.12)';
	return img;
}

return view.extend({
	load: function() {
		return Promise.all([
			callUciGet('tgv2ray'),
			L.resolveDefault(callFileRead('/etc/tgv2ray/servers.json'), ''),
			L.resolveDefault(callExec('pidof', ['sing-box']), '')
		]);
	},

	render: function(data) {
		var cfg = data[0] || {};
		var serversRaw = data[1] || '';
		var pidResult = data[2] || '';
		var self = this;

		var settings = {};
		for (var k in cfg) {
			if (cfg[k] && cfg[k]['.type'] === 'tgv2ray' && cfg[k]['.name'] === 'settings') {
				settings = cfg[k];
				break;
			}
		}

		var servers = [];
		try { servers = JSON.parse(serversRaw); } catch(e) {}
		if (!Array.isArray(servers)) servers = [];

		var isRunning = !!(pidResult && pidResult.trim());
		var mode = settings.mode || 'vpn';
		var selectedServer = settings.server || settings.selected_server || '';
		this.selectedServer = selectedServer;

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		if (isRunning)
			hero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #5b21b6 50%, #7c3aed 100%)';
		else
			hero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var shield = el('div', 'tg-shield ' + (isRunning ? 'connected' : 'disconnected'), SVG.shield);
		if (isRunning) {
			shield.style.background = 'rgba(139,92,246,0.3)';
			shield.style.boxShadow = '0 0 24px rgba(139,92,246,0.4), 0 0 48px rgba(139,92,246,0.2)';
		}
		hero.appendChild(shield);

		hero.appendChild(el('div', 'tg-status-text', isRunning ? 'V2Ray Active' : 'V2Ray Stopped'));

		var subParts = [];
		if (isRunning) {
			subParts.push(mode === 'vpn' ? 'VPN Mode' : 'Proxy Mode');
			if (selectedServer) subParts.push(selectedServer);
		} else {
			subParts.push(settings.enabled === '1' ? 'Service enabled but not running' : 'Configure and connect below');
		}
		hero.appendChild(el('div', 'tg-status-sub', subParts.join('  \u2022  ')));

		var powerBtn = el('button', 'tg-power-btn' + (isRunning ? ' stop' : ''));
		powerBtn.innerHTML = SVG.power + (isRunning ? ' Stop' : ' Start');
		powerBtn.addEventListener('click', function() { self.handlePower(powerBtn, isRunning); });
		hero.appendChild(powerBtn);

		if (isRunning && mode === 'proxy') {
			var lanIp = '192.168.1.1';
			try {
				for (var ck in cfg) {
					if (cfg[ck] && cfg[ck]['.name'] === 'settings') {
						lanIp = cfg[ck].local_ip || lanIp;
						break;
					}
				}
			} catch(e) {}
			var socksPort = settings.local_port || '1080';
			var httpPort = settings.http_port || '8080';

			var proxyInfo = el('div', 'v2-proxy-info');
			proxyInfo.innerHTML =
				'<div class="v2-proxy-title">Proxy Addresses</div>' +
				'<div class="v2-proxy-row"><span class="v2-proxy-label">SOCKS5</span><code class="v2-proxy-addr">' + lanIp + ':' + socksPort + '</code></div>' +
				'<div class="v2-proxy-row"><span class="v2-proxy-label">HTTP</span><code class="v2-proxy-addr">' + lanIp + ':' + httpPort + '</code></div>';
			hero.appendChild(proxyInfo);
		}

		root.appendChild(hero);

		/* ── Mode & UUID card ── */
		var configCard = el('div', 'tg-config');
		configCard.appendChild(el('div', 'tg-config-title', SVG.settings + ' Connection Settings'));

		var modeRow = el('div', 'inet-field-row');
		modeRow.appendChild(el('span', 'inet-field-label', 'Mode'));
		var modeWrap = el('div', 'v2-mode-toggle');
		var vpnBtn = el('button', 'v2-mode-btn' + (mode === 'vpn' ? ' active' : ''));
		vpnBtn.innerHTML = SVG.vpn + ' VPN';
		var proxyBtn = el('button', 'v2-mode-btn' + (mode === 'proxy' ? ' active' : ''));
		proxyBtn.innerHTML = SVG.proxy + ' Proxy';
		this.currentMode = mode;
		vpnBtn.addEventListener('click', function() {
			vpnBtn.classList.add('active');
			proxyBtn.classList.remove('active');
			self.currentMode = 'vpn';
			if (tunRow) tunRow.style.display = '';
			if (portsGroup) portsGroup.style.display = 'none';
		});
		proxyBtn.addEventListener('click', function() {
			proxyBtn.classList.add('active');
			vpnBtn.classList.remove('active');
			self.currentMode = 'proxy';
			if (tunRow) tunRow.style.display = 'none';
			if (portsGroup) portsGroup.style.display = '';
		});
		modeWrap.appendChild(vpnBtn);
		modeWrap.appendChild(proxyBtn);
		modeRow.appendChild(modeWrap);
		configCard.appendChild(modeRow);

		var uuidRow = el('div', 'inet-field-row');
		uuidRow.appendChild(el('span', 'inet-field-label', 'UUID'));
		var uuidInput = el('input', 'tg-server-search');
		uuidInput.type = 'password';
		uuidInput.id = 'v2-uuid';
		uuidInput.value = settings.uuid || '';
		uuidInput.placeholder = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
		uuidInput.style.cssText = 'width:320px;max-width:100%';
		uuidRow.appendChild(uuidInput);
		configCard.appendChild(uuidRow);

		var uuidHint = el('div', '');
		uuidHint.style.cssText = 'font-size:12px;color:var(--simple-muted);margin:-8px 0 12px';
		uuidHint.innerHTML = 'Find your UUID in the <a href="https://torguard.net/proxynetwork/vmess.php" target="_blank" style="color:var(--simple-accent)">TorGuard members area</a>';
		configCard.appendChild(uuidHint);

		var tunRow = el('div', 'inet-field-row');
		tunRow.appendChild(el('span', 'inet-field-label', 'TUN IP'));
		var tunInput = el('input', 'tg-server-search');
		tunInput.type = 'text';
		tunInput.id = 'v2-tunip';
		tunInput.value = settings.local_ip || '172.20.0.1';
		tunInput.style.cssText = 'width:180px';
		tunRow.appendChild(tunInput);
		if (mode !== 'vpn') tunRow.style.display = 'none';
		configCard.appendChild(tunRow);

		var portsGroup = el('div', '');
		var socksRow = el('div', 'inet-field-row');
		socksRow.appendChild(el('span', 'inet-field-label', 'SOCKS5 Port'));
		var socksInput = el('input', 'tg-server-search');
		socksInput.type = 'text';
		socksInput.id = 'v2-socks';
		socksInput.value = settings.local_port || '1080';
		socksInput.style.cssText = 'width:120px';
		socksRow.appendChild(socksInput);
		portsGroup.appendChild(socksRow);

		var httpRow = el('div', 'inet-field-row');
		httpRow.appendChild(el('span', 'inet-field-label', 'HTTP Port'));
		var httpInput = el('input', 'tg-server-search');
		httpInput.type = 'text';
		httpInput.id = 'v2-http';
		httpInput.value = settings.http_port || '8080';
		httpInput.style.cssText = 'width:120px';
		httpRow.appendChild(httpInput);
		portsGroup.appendChild(httpRow);
		if (mode !== 'proxy') portsGroup.style.display = 'none';
		configCard.appendChild(portsGroup);

		root.appendChild(configCard);

		/* ── Server selection card ── */
		var svrCard = el('div', 'tg-config');
		svrCard.appendChild(el('div', 'tg-config-title', SVG.globe + ' Server Location'));

		var topRow = el('div', '');
		topRow.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap';
		var searchWrap = el('div', 'tg-server-search-wrap');
		searchWrap.style.flex = '1';
		searchWrap.innerHTML = SVG.search;
		var searchInput = el('input', 'tg-server-search');
		searchInput.type = 'text';
		searchInput.placeholder = 'Search servers...';
		searchWrap.appendChild(searchInput);
		topRow.appendChild(searchWrap);

		var updateBtn = el('button', 'v2-action-btn');
		updateBtn.innerHTML = SVG.refresh + ' Update List';
		updateBtn.addEventListener('click', function() { self.handleUpdateServers(updateBtn); });
		topRow.appendChild(updateBtn);
		svrCard.appendChild(topRow);

		var serverCount = el('div', '');
		serverCount.style.cssText = 'font-size:12px;color:var(--simple-muted);margin-bottom:8px';
		serverCount.textContent = servers.length + ' servers available';
		svrCard.appendChild(serverCount);

		var serverList = el('div', 'tg-server-list');
		serverList.style.maxHeight = '320px';
		this.renderServerList(serverList, servers, selectedServer, '');
		svrCard.appendChild(serverList);

		searchInput.addEventListener('input', function() {
			self.renderServerList(serverList, servers, self.selectedServer, this.value);
		});

		root.appendChild(svrCard);

		/* ── Custom import card ── */
		var importCard = el('div', 'tg-config');
		importCard.appendChild(el('div', 'tg-config-title', SVG.link + ' Custom Server Import'));

		var importHint = el('div', 'wgc-hint');
		importHint.textContent = 'Paste a VLESS, VMess, Trojan, or Shadowsocks URL to import a custom server.';
		importCard.appendChild(importHint);

		var importTextWrap = el('div', 'wgc-textarea-wrap');
		var importTextarea = el('textarea', 'wgc-textarea');
		importTextarea.id = 'v2-import-url';
		importTextarea.rows = 3;
		importTextarea.spellcheck = false;
		importTextarea.placeholder = 'vless://uuid@server:port?params...';
		importTextWrap.appendChild(importTextarea);
		importCard.appendChild(importTextWrap);

		var importBtn = el('button', 'v2-action-btn');
		importBtn.innerHTML = SVG.link + ' Import Server';
		importBtn.addEventListener('click', function() { self.handleImport(importBtn); });
		importCard.appendChild(importBtn);

		root.appendChild(importCard);

		/* ── Save button ── */
		var saveWrap = el('div', '');
		saveWrap.style.cssText = 'text-align:center;padding:8px 0 24px';
		var saveBtn = el('button', 'simple-btn simple-btn-primary');
		saveBtn.id = 'v2-save-btn';
		saveBtn.textContent = 'Save Settings';
		saveBtn.style.cssText = 'padding:12px 48px;font-size:15px';
		saveBtn.addEventListener('click', function() { self.handleSave(saveBtn); });
		saveWrap.appendChild(saveBtn);
		root.appendChild(saveWrap);

		return root;
	},

	renderServerList: function(container, servers, selectedTag, filter) {
		container.innerHTML = '';
		var self = this;
		var lc = (filter || '').toLowerCase();

		var grouped = {};
		servers.forEach(function(srv) {
			var info = parseServerTag(srv.tag);
			var loc = info.location;
			if (lc && srv.tag.toLowerCase().indexOf(lc) === -1 && loc.toLowerCase().indexOf(lc) === -1)
				return;
			if (!grouped[loc]) grouped[loc] = [];
			grouped[loc].push({ tag: srv.tag, proto: info.proto, cdn: info.cdn, type: srv.type, server: srv.server });
		});

		var locs = Object.keys(grouped).sort();
		if (!locs.length) {
			container.appendChild(el('div', 'tg-server-region', 'No servers found'));
			return;
		}

		locs.forEach(function(loc) {
			var cc = locationToCC(loc);
			var regionDiv = el('div', 'tg-server-region');
			if (cc) {
				regionDiv.appendChild(flagImgSmall(cc));
				regionDiv.appendChild(document.createTextNode(loc));
			} else {
				regionDiv.textContent = loc;
			}
			container.appendChild(regionDiv);

			grouped[loc].forEach(function(srv) {
				var item = el('div', 'tg-server-item' + (srv.tag === selectedTag ? ' selected' : ''));

				if (cc) item.appendChild(flagImg(cc));

				var nameSpan = el('span', 'server-name', srv.tag);
				item.appendChild(nameSpan);

				if (srv.proto || srv.type) {
					var badge = el('span', 'v2-proto-badge');
					badge.textContent = (srv.proto || srv.type || '').toUpperCase();
					item.appendChild(badge);
				}
				if (srv.cdn) {
					var cdnBadge = el('span', 'v2-cdn-badge');
					cdnBadge.textContent = srv.cdn;
					item.appendChild(cdnBadge);
				}

				item.dataset.tag = srv.tag;
				item.addEventListener('click', function() {
					container.querySelectorAll('.tg-server-item').forEach(function(el) { el.classList.remove('selected'); });
					item.classList.add('selected');
					self.selectedServer = srv.tag;
				});
				container.appendChild(item);
			});
		});
	},

	handlePower: function(btn, wasRunning) {
		btn.disabled = true;
		btn.innerHTML = '<span class="tg-spinner"></span> ' + (wasRunning ? 'Stopping...' : 'Starting...');
		var action = wasRunning ? 'stop' : 'start';
		callExec('/etc/init.d/tgv2ray', [action]).then(function() {
			setTimeout(function() { window.location.reload(); }, 4000);
		}).catch(function() {
			btn.innerHTML = 'Error \u2014 try again';
			btn.disabled = false;
		});
	},

	handleUpdateServers: function(btn) {
		btn.disabled = true;
		var origHTML = btn.innerHTML;
		btn.innerHTML = '<span class="tg-spinner" style="border-color:var(--simple-accent);border-top-color:var(--simple-text)"></span> Updating...';
		callExec('/usr/bin/tgv2ray-subscription', ['update']).then(function() {
			btn.innerHTML = '\u2713 Updated';
			setTimeout(function() { window.location.reload(); }, 1500);
		}).catch(function() {
			btn.innerHTML = 'Update Failed';
			btn.disabled = false;
			setTimeout(function() { btn.innerHTML = origHTML; }, 2000);
		});
	},

	handleImport: function(btn) {
		var urlField = document.getElementById('v2-import-url');
		if (!urlField || !urlField.value.trim()) return;
		btn.disabled = true;
		var origHTML = btn.innerHTML;
		btn.innerHTML = '<span class="tg-spinner" style="border-color:var(--simple-accent);border-top-color:var(--simple-text)"></span> Importing...';
		callExec('/usr/bin/tgv2ray-subscription', ['parse', urlField.value.trim()]).then(function() {
			btn.innerHTML = '\u2713 Imported';
			setTimeout(function() { window.location.reload(); }, 1500);
		}).catch(function() {
			btn.innerHTML = 'Import Failed';
			btn.disabled = false;
			setTimeout(function() { btn.innerHTML = origHTML; }, 2000);
		});
	},

	handleSave: function(btn) {
		var uuid = document.getElementById('v2-uuid');
		var tunip = document.getElementById('v2-tunip');
		var socks = document.getElementById('v2-socks');
		var http = document.getElementById('v2-http');

		var vals = {
			enabled: '1',
			mode: this.currentMode || 'vpn',
			uuid: uuid ? uuid.value : '',
			server: this.selectedServer || '',
			selected_server: this.selectedServer || ''
		};
		if (tunip) vals.local_ip = tunip.value;
		if (socks) vals.local_port = socks.value;
		if (http) vals.http_port = http.value;

		btn.disabled = true;
		btn.textContent = 'Saving...';

		callUciSet('tgv2ray', 'settings', vals).then(function() {
			return callUciCommit('tgv2ray');
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
