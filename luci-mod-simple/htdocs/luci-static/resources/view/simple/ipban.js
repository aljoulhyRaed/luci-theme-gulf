'use strict';
'require view';
'require dom';
'require rpc';
'require uci';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });
var callFileRead = rpc.declare({ object: 'file', method: 'read', params: ['path'] });

var SVG = {
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.54-3.12 8.78-7 9.88-3.88-1.1-7-5.34-7-9.88V6.3l7-3.12z"/><path d="M10 12.5l-2-2-1.41 1.41L10 15.32l7-7-1.41-1.41z"/></svg>',
	shieldOff: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
	block: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/></svg>',
	power: '<svg viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>',
	globe: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
	tune: '<svg viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	list: '<svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>',
	flag: '<svg viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>'
};

var FEEDS = [
	{ id: 'drop',            name: 'Spamhaus DROP',       cat: 'threats',  desc: 'Known hostile networks (recommended)' },
	{ id: 'dshield',         name: 'DShield',             cat: 'threats',  desc: 'SANS Internet Storm Center blocklist' },
	{ id: 'firehol1',        name: 'FireHOL Level 1',     cat: 'threats',  desc: 'High-confidence malicious IPs' },
	{ id: 'firehol2',        name: 'FireHOL Level 2',     cat: 'threats',  desc: 'Extended threat compilation' },
	{ id: 'firehol3',        name: 'FireHOL Level 3',     cat: 'threats',  desc: 'Broader threat compilation' },
	{ id: 'firehol4',        name: 'FireHOL Level 4',     cat: 'threats',  desc: 'Maximum threat coverage' },
	{ id: 'threat',          name: 'Emerging Threats',     cat: 'threats',  desc: 'ET block IPs' },
	{ id: 'threatview',      name: 'ThreatView',          cat: 'threats',  desc: 'High-confidence malicious IPs' },
	{ id: 'debl',            name: 'Blocklist.de',        cat: 'attacks',  desc: 'Fail2ban IP blocklist' },
	{ id: 'bruteforceblock', name: 'BruteForce Blocker',  cat: 'attacks',  desc: 'Brute-force attacker IPs' },
	{ id: 'cinsscore',       name: 'CINS Score',          cat: 'attacks',  desc: 'Suspicious attacker IPs' },
	{ id: 'greensnow',       name: 'GreenSnow',           cat: 'attacks',  desc: 'Suspicious server IPs' },
	{ id: 'ipsum',           name: 'IPsum',               cat: 'attacks',  desc: 'Crowd-sourced malicious IPs' },
	{ id: 'ipthreat',        name: 'IPThreat',            cat: 'attacks',  desc: 'Hacker and botnet IPs' },
	{ id: 'myip',            name: 'MyIP.ms',             cat: 'attacks',  desc: 'Real-time IP blocklist' },
	{ id: 'turris',          name: 'Turris Sentinel',     cat: 'attacks',  desc: 'Turris router honeypot data' },
	{ id: 'becyber',         name: 'BeCyber',             cat: 'malware',  desc: 'Malicious attacker IPs' },
	{ id: 'binarydefense',   name: 'Binary Defense',      cat: 'malware',  desc: 'Binary defense banlist' },
	{ id: 'etcompromised',   name: 'ET Compromised',      cat: 'malware',  desc: 'Compromised hosts' },
	{ id: 'feodo',           name: 'Feodo Tracker',       cat: 'malware',  desc: 'Feodo banking trojan C&C' },
	{ id: 'urlhaus',         name: 'URLhaus',             cat: 'malware',  desc: 'Malware distribution IPs' },
	{ id: 'urlvir',          name: 'URLVir',              cat: 'malware',  desc: 'Malware related IPs' },
	{ id: 'webclient',       name: 'WebClient',           cat: 'malware',  desc: 'Malware webclient IPs' },
	{ id: 'bogon',           name: 'Bogon Prefixes',      cat: 'network',  desc: 'Invalid/unallocated IP ranges' },
	{ id: 'backscatterer',   name: 'Backscatterer',       cat: 'network',  desc: 'Backscatter source IPs' },
	{ id: 'proxy',           name: 'Open Proxies',        cat: 'network',  desc: 'Known open proxy IPs' },
	{ id: 'doh',             name: 'DoH Providers',       cat: 'network',  desc: 'Block DNS-over-HTTPS bypass' },
	{ id: 'tor',             name: 'Tor Exit Nodes',      cat: 'network',  desc: 'Block Tor exit node traffic' },
	{ id: 'vpn',             name: 'VPN IPs',             cat: 'network',  desc: 'Known VPN provider IPs' },
	{ id: 'vpndc',           name: 'VPN Datacenter',      cat: 'network',  desc: 'VPN datacenter IPs' },
	{ id: 'nixspam',         name: 'NiX Spam',            cat: 'spam',     desc: 'Spam protection' },
	{ id: 'uceprotect1',     name: 'UCE Protect L1',      cat: 'spam',     desc: 'Spam protection level 1' },
	{ id: 'voip',            name: 'VoIP Fraud',          cat: 'spam',     desc: 'VoIP fraud blocklist' },
	{ id: 'pallebone',       name: 'Pallebone',           cat: 'spam',     desc: 'Curated IP blocklist' },
	{ id: 'hagezi',          name: 'Hagezi TIF',          cat: 'threats',  desc: 'Threat intelligence IPs' },
	{ id: 'ipblackhole',     name: 'IP Blackhole',        cat: 'attacks',  desc: 'Blackhole IP blocklist' }
];

var CATEGORIES = {
	threats:  { name: 'Threat Intelligence',  icon: SVG.shield, color: '#ef4444' },
	attacks:  { name: 'Attack Prevention',     icon: SVG.block,  color: '#f59e0b' },
	malware:  { name: 'Malware & Botnets',     icon: SVG.block,  color: '#8b5cf6' },
	network:  { name: 'Network Filtering',     icon: SVG.globe,  color: '#3b82f6' },
	spam:     { name: 'Spam & Fraud',           icon: SVG.list,   color: '#ec4899' }
};

var PRESETS = {
	light:      { label: 'Light',      color: '#22c55e', icon: '1', desc: 'Essential threat feeds only', feeds: ['drop', 'dshield', 'feodo'] },
	standard:   { label: 'Standard',   color: '#3b82f6', icon: '2', desc: 'Recommended for most routers', feeds: ['drop', 'dshield', 'firehol1', 'debl', 'feodo', 'threat', 'bruteforceblock'] },
	aggressive: { label: 'Aggressive', color: '#ef4444', icon: '3', desc: 'Maximum IP-level protection', feeds: ['drop', 'dshield', 'firehol1', 'firehol2', 'debl', 'feodo', 'threat', 'bruteforceblock', 'cinsscore', 'ipsum', 'becyber', 'etcompromised', 'urlhaus', 'turris', 'hagezi'] },
	custom:     { label: 'Custom',     color: '#8b5cf6', icon: null, desc: 'Pick individual threat feeds', feeds: null }
};

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (Array.isArray(children)) children.forEach(function(c) { if (c) e.appendChild(c); });
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function ic(svg, size, color) {
	return svg.replace('<svg ', '<svg style="width:' + (size||16) + 'px;height:' + (size||16) + 'px;fill:' + (color||'currentColor') + '" ');
}

function mkSwitch(checked, onChange) {
	var lbl = el('label', 'simple-switch');
	var cb = el('input', '');
	cb.type = 'checkbox';
	cb.checked = !!checked;
	if (onChange) cb.onchange = function() { onChange(cb.checked); };
	lbl.appendChild(cb);
	lbl.appendChild(el('span', 'simple-switch-slider'));
	return lbl;
}

return view.extend({
	_activeSources: [],

	load: function() {
		return Promise.all([
			uci.load('banip').catch(function() { return null; }),
			L.resolveDefault(callFileExec('/etc/init.d/banip', ['status']), {}),
			L.resolveDefault(callFileRead('/etc/banip/banip.countries'), ''),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'opkg list-installed 2>/dev/null | grep "^banip "'
			]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'ip -o link show 2>/dev/null | awk -F": " \'{print $2}\' | grep -v "^lo$"'
			]), {})
		]);
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3500);
	},

	parseStatus: function(raw) {
		var s = { running: false, elements: '0', feeds: '—', devices: '—', lastRun: 'Never' };
		if (!raw) return s;
		var lines = raw.split('\n');
		lines.forEach(function(l) {
			var m;
			if ((m = l.match(/status\s*:\s*(.*)/))) s.running = m[1].trim() === 'active';
			if ((m = l.match(/element_count\s*:\s*(.*)/))) s.elements = m[1].trim();
			if ((m = l.match(/active_feeds\s*:\s*(.*)/))) s.feeds = m[1].trim();
			if ((m = l.match(/active_devices\s*:\s*(.*)/))) s.devices = m[1].trim();
			if ((m = l.match(/last_run\s*:\s*(.*)/))) s.lastRun = m[1].trim();
		});
		return s;
	},

	detectPreset: function(sources) {
		var srcSet = {};
		sources.forEach(function(s) { srcSet[s] = true; });
		var keys = Object.keys(PRESETS);
		for (var i = 0; i < keys.length; i++) {
			if (keys[i] === 'custom') continue;
			var ps = PRESETS[keys[i]].feeds;
			if (ps.length === sources.length && ps.every(function(s) { return srcSet[s]; }))
				return keys[i];
		}
		return 'custom';
	},

	render: function(data) {
		var self = this;
		var banipLoaded = data[0] !== null;
		var statusRaw = (data[1] && data[1].stdout) ? data[1].stdout : '';
		var countriesRaw = (data[2] && typeof data[2] === 'object') ? (data[2].data || '') : (data[2] || '');
		var banipInstalled = !!(data[3] && data[3].stdout && data[3].stdout.trim());
		var ifacesRaw = (data[4] && data[4].stdout) ? data[4].stdout.trim() : '';
		var availableIfaces = ifacesRaw ? ifacesRaw.split('\n').map(function(s) { return s.trim(); }).filter(Boolean) : [];

		var status = self.parseStatus(statusRaw);

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		if (!banipInstalled && !banipLoaded) {
			var niHero = el('div', 'tg-hero');
			niHero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';
			var niShield = el('div', 'tg-shield disconnected');
			niShield.innerHTML = SVG.shieldOff;
			niHero.appendChild(niShield);
			niHero.appendChild(el('div', 'tg-status-text', 'IP Ban Not Installed'));
			niHero.appendChild(el('div', 'tg-status-sub', 'Install the banIP packages from System \u2192 Software to enable IP-level threat blocking.'));
			var installBtn = el('a', 'tg-power-btn');
			installBtn.href = L.url('admin', 'simple-system', 'software');
			installBtn.innerHTML = 'Go to Software';
			installBtn.style.textDecoration = 'none';
			niHero.appendChild(installBtn);
			root.appendChild(niHero);
			return root;
		}

		var enabled = (uci.get('banip', 'global', 'ban_enabled') === '1');
		var autodetect = (uci.get('banip', 'global', 'ban_autodetect') !== '0');
		var currentFeeds = uci.get('banip', 'global', 'ban_feed') || [];
		if (typeof currentFeeds === 'string') currentFeeds = [currentFeeds];
		self._activeSources = currentFeeds.slice();
		var activePreset = self.detectPreset(currentFeeds);
		var currentCountries = uci.get('banip', 'global', 'ban_country') || [];
		if (typeof currentCountries === 'string') currentCountries = currentCountries ? [currentCountries] : [];

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = status.running
			? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%)'
			: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var shieldDiv = el('div', 'tg-shield ' + (status.running ? 'connected' : 'disconnected'));
		shieldDiv.innerHTML = status.running ? SVG.shield : SVG.shieldOff;
		hero.appendChild(shieldDiv);
		hero.appendChild(el('div', 'tg-status-text', status.running ? 'IP Ban Active' : 'IP Ban Offline'));
		hero.appendChild(el('div', 'tg-status-sub',
			status.running
				? status.elements + ' IPs blocked \u2022 ' + status.feeds
				: 'Enable banIP to block malicious IPs at the firewall level'
		));

		var powerBtn = el('button', 'tg-power-btn' + (status.running ? ' stop' : ''));
		powerBtn.innerHTML = ic(SVG.power, 18) + ' ' + (status.running ? 'Stop BanIP' : 'Start BanIP');
		powerBtn.onclick = function() {
			powerBtn.disabled = true;
			var action = status.running ? 'stop' : 'restart';
			L.resolveDefault(callFileExec('/etc/init.d/banip', [action]), {}).then(function() {
				self.showToast(status.running ? 'BanIP stopped' : 'BanIP starting\u2026 this may take a moment');
				window.setTimeout(function() { location.reload(); }, 4000);
			});
		};
		hero.appendChild(powerBtn);

		if (status.running) {
			var stats = el('div', 'tg-stats');
			[
				{ val: status.elements, label: 'IPs Blocked' },
				{ val: String(currentFeeds.length), label: 'Active Feeds' },
				{ val: status.devices, label: 'Devices' },
				{ val: status.lastRun, label: 'Last Run' }
			].forEach(function(s) {
				var stat = el('div', 'tg-stat');
				stat.appendChild(el('div', 'tg-stat-val', s.val));
				stat.appendChild(el('div', 'tg-stat-label', s.label));
				stats.appendChild(stat);
			});
			hero.appendChild(stats);
		}

		root.appendChild(hero);

		/* ── Protection Level Presets ── */
		var presetCard = el('div', 'tg-config');

		var pTitle = el('div', '');
		pTitle.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:20px';
		var pIconWrap = el('div', '');
		pIconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--simple-accent-light);color:var(--simple-accent)';
		pIconWrap.innerHTML = ic(SVG.tune, 22);
		pTitle.appendChild(pIconWrap);
		var pTitleBlock = el('div', '');
		pTitleBlock.innerHTML = '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">Protection Level</div>' +
			'<div style="font-size:13px;color:var(--simple-muted)">Choose how many threat feeds to activate</div>';
		pTitle.appendChild(pTitleBlock);
		presetCard.appendChild(pTitle);

		var presetGrid = el('div', '');
		presetGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px';

		Object.keys(PRESETS).forEach(function(pk) {
			var p = PRESETS[pk];
			var isActive = (activePreset === pk);
			var isCustom = (pk === 'custom');
			var card = el('div', '');
			card.style.cssText = 'padding:16px 18px;border-radius:14px;cursor:pointer;position:relative;overflow:hidden;' +
				'border:2px solid ' + (isActive ? p.color : 'var(--simple-card-border)') + ';' +
				'background:' + (isActive ? p.color + '14' : 'var(--simple-input-bg)') + ';transition:all 0.25s ease';
			if (isActive) card.style.boxShadow = '0 0 20px ' + p.color + '25';

			var header = el('div', '');
			header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px';

			var dot = el('div', '');
			dot.style.cssText = 'width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;background:' + p.color + (isActive ? '' : '80');
			if (isCustom) dot.innerHTML = ic(SVG.tune, 16, '#fff');
			else dot.textContent = p.icon;
			header.appendChild(dot);

			var name = el('div', '');
			name.style.cssText = 'font-weight:700;font-size:0.95rem;color:' + (isActive ? p.color : 'var(--simple-text)');
			name.textContent = p.label;
			header.appendChild(name);

			if (isActive) {
				var ck = el('div', '');
				ck.style.cssText = 'margin-left:auto;width:22px;height:22px;border-radius:50%;background:' + p.color + ';display:flex;align-items:center;justify-content:center';
				ck.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
				header.appendChild(ck);
			}
			card.appendChild(header);
			card.appendChild(el('div', '', '<div style="font-size:0.8rem;color:var(--simple-muted);line-height:1.4">' + p.desc + '</div>'));

			if (!isCustom) {
				var cnt = el('div', '');
				cnt.style.cssText = 'margin-top:8px;font-size:0.72rem;font-weight:600;color:' + (isActive ? p.color : 'var(--simple-muted)');
				cnt.textContent = p.feeds.length + ' feeds';
				card.appendChild(cnt);
			} else if (isActive) {
				var cnt2 = el('div', '');
				cnt2.style.cssText = 'margin-top:8px;font-size:0.72rem;font-weight:600;color:' + p.color;
				cnt2.textContent = currentFeeds.length + ' feeds selected';
				card.appendChild(cnt2);
			}

			card.onmouseenter = function() { if (!isActive) { card.style.borderColor = p.color + '80'; card.style.background = p.color + '0a'; } };
			card.onmouseleave = function() { if (!isActive) { card.style.borderColor = 'var(--simple-card-border)'; card.style.background = 'var(--simple-input-bg)'; } };

			card.onclick = function() {
				if (isCustom) {
					var cs = document.getElementById('ban-custom');
					if (cs) { cs.style.display = cs.style.display === 'none' ? '' : 'none'; if (cs.style.display !== 'none') cs.scrollIntoView({ behavior: 'smooth' }); }
					return;
				}
				self._activeSources = p.feeds.slice();
				self.applyFeeds();
			};

			presetGrid.appendChild(card);
		});

		presetCard.appendChild(presetGrid);
		root.appendChild(presetCard);

		/* ── Settings Card ── */
		var cfgCard = el('div', 'tg-config');
		var cTitle = el('div', '');
		cTitle.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px';
		var cIconWrap = el('div', '');
		cIconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(59,130,246,0.12);color:#3b82f6';
		cIconWrap.innerHTML = ic(SVG.tune, 22);
		cTitle.appendChild(cIconWrap);
		cTitle.innerHTML += '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">Settings</div>';
		cfgCard.appendChild(cTitle);

		var enRow = el('div', 'simple-toggle-row');
		var enInfo = el('div', 'simple-toggle-info');
		enInfo.appendChild(el('div', 'simple-toggle-title', 'Enable at Boot'));
		enInfo.appendChild(el('div', 'simple-toggle-desc', 'Automatically start banIP when the router boots'));
		enRow.appendChild(enInfo);
		enRow.appendChild(mkSwitch(enabled, function(val) {
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'uci set banip.global.ban_enabled=' + (val ? '1' : '0') + ' && uci commit banip && echo OK'
			]), {}).then(function() { self.showToast(val ? 'BanIP enabled at boot' : 'BanIP disabled at boot'); });
		}));
		cfgCard.appendChild(enRow);

		var ifaceSection = el('div', '');
		ifaceSection.id = 'ban-iface-section';
		ifaceSection.style.display = autodetect ? 'none' : '';

		var adRow = el('div', 'simple-toggle-row');
		var adInfo = el('div', 'simple-toggle-info');
		adInfo.appendChild(el('div', 'simple-toggle-title', 'Auto Detect Interfaces'));
		adInfo.appendChild(el('div', 'simple-toggle-desc', 'Automatically detect WAN devices and subnets (recommended)'));
		adRow.appendChild(adInfo);
		adRow.appendChild(mkSwitch(autodetect, function(val) {
			ifaceSection.style.display = val ? 'none' : '';
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'uci set banip.global.ban_autodetect=' + (val ? '1' : '0') + ' && uci commit banip && echo OK'
			]), {});
		}));
		cfgCard.appendChild(adRow);

		// Interface selector (shown when autodetect is off)
		var currentDevs = uci.get('banip', 'global', 'ban_dev') || [];
		if (typeof currentDevs === 'string') currentDevs = currentDevs ? [currentDevs] : [];

		var ifLabel = el('div', '');
		ifLabel.style.cssText = 'font-weight:600;font-size:0.85rem;color:var(--simple-text);margin:12px 0 8px 0';
		ifLabel.textContent = 'Network Interfaces to Monitor';
		ifaceSection.appendChild(ifLabel);

		var ifDesc = el('div', '');
		ifDesc.style.cssText = 'font-size:0.78rem;color:var(--simple-muted);margin-bottom:10px';
		ifDesc.textContent = 'Select which network interfaces banIP should protect. Typically you want WAN-facing interfaces.';
		ifaceSection.appendChild(ifDesc);

		var ifGrid = el('div', '');
		ifGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px';
		availableIfaces.forEach(function(iface) {
			var isSel = currentDevs.indexOf(iface) !== -1;
			var chip = el('div', '');
			chip.style.cssText = 'padding:6px 14px;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;transition:all 0.2s;font-family:monospace;' +
				'border:1.5px solid ' + (isSel ? '#3b82f6' : 'var(--simple-card-border)') + ';' +
				'background:' + (isSel ? 'rgba(59,130,246,0.12)' : 'transparent') + ';' +
				'color:' + (isSel ? '#3b82f6' : 'var(--simple-text)');
			chip.textContent = (isSel ? '\u2713 ' : '') + iface;
			chip.onclick = function() {
				var idx = currentDevs.indexOf(iface);
				if (idx !== -1) currentDevs.splice(idx, 1);
				else currentDevs.push(iface);
				var cmds = 'while uci -q delete banip.global.ban_dev 2>/dev/null; do :; done\n';
				currentDevs.forEach(function(v) { cmds += 'uci add_list banip.global.ban_dev=' + v + '\n'; });
				cmds += 'uci commit banip\necho OK';
				L.resolveDefault(callFileExec('/bin/sh', ['-c', cmds]), {}).then(function() {
					self.showToast('Interface selection updated');
					window.setTimeout(function() { location.reload(); }, 1500);
				});
			};
			ifGrid.appendChild(chip);
		});
		ifaceSection.appendChild(ifGrid);
		cfgCard.appendChild(ifaceSection);

		var abRow = el('div', 'simple-toggle-row');
		var abInfo = el('div', 'simple-toggle-info');
		abInfo.appendChild(el('div', 'simple-toggle-title', 'Auto Blocklist'));
		abInfo.appendChild(el('div', 'simple-toggle-desc', 'Automatically add suspicious IPs from logs to the local blocklist'));
		abRow.appendChild(abInfo);
		var autoBl = uci.get('banip', 'global', 'ban_autoblocklist') !== '0';
		abRow.appendChild(mkSwitch(autoBl, function(val) {
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'uci set banip.global.ban_autoblocklist=' + (val ? '1' : '0') + ' && uci commit banip && echo OK'
			]), {});
		}));
		cfgCard.appendChild(abRow);

		var alRow = el('div', 'simple-toggle-row');
		alRow.style.borderBottom = 'none';
		var alInfo = el('div', 'simple-toggle-info');
		alInfo.appendChild(el('div', 'simple-toggle-title', 'Auto Allowlist'));
		alInfo.appendChild(el('div', 'simple-toggle-desc', 'Automatically allow your uplink IPs and resolved domains'));
		alRow.appendChild(alInfo);
		var autoAl = uci.get('banip', 'global', 'ban_autoallowlist') !== '0';
		alRow.appendChild(mkSwitch(autoAl, function(val) {
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'uci set banip.global.ban_autoallowlist=' + (val ? '1' : '0') + ' && uci commit banip && echo OK'
			]), {});
		}));
		cfgCard.appendChild(alRow);

		root.appendChild(cfgCard);

		/* ── Country Blocking Card ── */
		var countryCard = el('div', 'tg-config');
		var ctTitle = el('div', '');
		ctTitle.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px';
		var ctIconWrap = el('div', '');
		ctIconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(249,115,22,0.12);color:#f97316';
		ctIconWrap.innerHTML = ic(SVG.flag, 22);
		ctTitle.appendChild(ctIconWrap);
		var ctTitleBlock = el('div', '');
		ctTitleBlock.innerHTML = '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">Country Blocking</div>' +
			'<div style="font-size:13px;color:var(--simple-muted)">Block entire countries or regions by IP range</div>';
		ctTitle.appendChild(ctTitleBlock);
		countryCard.appendChild(ctTitle);

		var countryList = [];
		if (countriesRaw) {
			countriesRaw.trim().split('\n').forEach(function(line) {
				var parts = line.split('\t');
				if (parts.length >= 3) countryList.push({ code: parts[0].trim(), rir: parts[1].trim(), name: parts[2].trim() });
			});
		}

		var regionLabel = el('div', '');
		regionLabel.style.cssText = 'font-weight:600;font-size:0.85rem;color:var(--simple-text);margin-bottom:10px';
		regionLabel.textContent = 'Block by Region';
		countryCard.appendChild(regionLabel);

		var regionDesc = el('div', '');
		regionDesc.style.cssText = 'font-size:0.78rem;color:var(--simple-muted);margin-bottom:10px';
		regionDesc.textContent = 'Clicking a region selects/deselects all countries in that region';
		countryCard.appendChild(regionDesc);

		var REGIONS = [
			['AFRINIC', 'Africa & Indian Ocean'],
			['APNIC', 'Asia Pacific'],
			['ARIN', 'North America'],
			['LACNIC', 'Latin America & Caribbean'],
			['RIPE', 'Europe, Middle East & Central Asia']
		];

		function getRegionCodes(rir) {
			return countryList.filter(function(c) { return c.rir === rir; }).map(function(c) { return c.code; });
		}

		function isRegionFullySelected(rir) {
			var codes = getRegionCodes(rir);
			if (codes.length === 0) return false;
			return codes.every(function(c) { return currentCountries.indexOf(c) !== -1; });
		}

		function commitCountries() {
			var cmds = 'while uci -q delete banip.global.ban_country 2>/dev/null; do :; done\n';
			currentCountries.forEach(function(v) {
				cmds += 'uci add_list banip.global.ban_country=' + v + '\n';
			});
			cmds += 'uci commit banip\necho OK';
			return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmds]), {});
		}

		var regionGrid = el('div', '');
		regionGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px';
		REGIONS.forEach(function(r) {
			var isSelected = isRegionFullySelected(r[0]);
			var regionCodes = getRegionCodes(r[0]);
			var chip = el('div', '');
			chip.style.cssText = 'padding:8px 16px;border-radius:20px;cursor:pointer;font-size:0.82rem;font-weight:600;transition:all 0.2s;' +
				'border:1.5px solid ' + (isSelected ? '#f97316' : 'var(--simple-card-border)') + ';' +
				'background:' + (isSelected ? '#f9731614' : 'transparent') + ';' +
				'color:' + (isSelected ? '#f97316' : 'var(--simple-text)');
			chip.textContent = (isSelected ? '\u2713 ' : '') + r[1] + ' (' + regionCodes.length + ')';
			chip.onclick = function() {
				if (isSelected) {
					currentCountries = currentCountries.filter(function(c) { return regionCodes.indexOf(c) === -1; });
				} else {
					regionCodes.forEach(function(c) {
						if (currentCountries.indexOf(c) === -1) currentCountries.push(c);
					});
				}
				commitCountries().then(function() {
					self.showToast(isSelected
						? r[1] + ' countries removed'
						: r[1] + ' countries (' + regionCodes.length + ') blocked');
					window.setTimeout(function() { location.reload(); }, 1500);
				});
			};
			regionGrid.appendChild(chip);
		});
		countryCard.appendChild(regionGrid);

		if (countryList.length > 0) {
			var cLabel = el('div', '');
			cLabel.style.cssText = 'font-weight:600;font-size:0.85rem;color:var(--simple-text);margin-bottom:8px';
			cLabel.textContent = 'Block Specific Countries';
			countryCard.appendChild(cLabel);

			var searchInput = el('input', 'simple-input');
			searchInput.type = 'text';
			searchInput.placeholder = 'Search countries\u2026';
			searchInput.style.cssText = 'margin-bottom:10px;width:100%;box-sizing:border-box';

			var countryWrap = el('div', '');
			countryWrap.style.cssText = 'max-height:280px;overflow-y:auto;border:1px solid var(--simple-card-border);border-radius:10px;padding:4px';

			function renderCountries(filter) {
				countryWrap.innerHTML = '';
				var filtered = countryList.filter(function(c) {
					if (!filter) return true;
					return c.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1 || c.code.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
				});
				filtered.forEach(function(c) {
					var isSelected = currentCountries.indexOf(c.code) !== -1;
					var row = el('div', '');
					row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:8px;cursor:pointer;transition:background 0.15s;' +
						(isSelected ? 'background:#f9731610;' : '');
					row.innerHTML = '<div style="display:flex;align-items:center;gap:8px">' +
						'<span style="font-weight:600;font-size:0.75rem;width:28px;text-align:center;padding:2px 0;border-radius:4px;background:var(--simple-input-bg);color:var(--simple-muted)">' + c.code + '</span>' +
						'<span style="font-size:0.85rem;color:var(--simple-text)">' + c.name + '</span>' +
						'<span style="font-size:0.7rem;color:var(--simple-muted)">' + c.rir + '</span></div>';

					var cb = el('input', '');
					cb.type = 'checkbox';
					cb.checked = isSelected;
					cb.style.cssText = 'width:18px;height:18px;accent-color:#f97316;cursor:pointer';
					cb.onclick = function(e) { e.stopPropagation(); };
					cb.onchange = function() {
						var idx = currentCountries.indexOf(c.code);
						if (idx !== -1) currentCountries.splice(idx, 1);
						else currentCountries.push(c.code);
						commitCountries().then(function() {
							renderCountries(searchInput.value);
						});
					};
					row.appendChild(cb);
					row.onclick = function() { cb.checked = !cb.checked; cb.onchange(); };
					countryWrap.appendChild(row);
				});
				if (filtered.length === 0) {
					countryWrap.innerHTML = '<div style="padding:16px;text-align:center;color:var(--simple-muted)">No countries found</div>';
				}
			}

			searchInput.oninput = function() { renderCountries(searchInput.value); };
			countryCard.appendChild(searchInput);
			countryCard.appendChild(countryWrap);
			renderCountries('');

			if (currentCountries.length > 0) {
				var selLabel = el('div', '');
				selLabel.style.cssText = 'margin-top:10px;font-size:0.78rem;color:#f97316;font-weight:600';
				selLabel.textContent = currentCountries.length + ' countr' + (currentCountries.length === 1 ? 'y' : 'ies') + ' blocked';
				countryCard.appendChild(selLabel);
			}
		}

		root.appendChild(countryCard);

		/* ── Custom Feed Selection ── */
		var customSection = el('div', '');
		customSection.id = 'ban-custom';
		customSection.style.display = activePreset === 'custom' ? '' : 'none';

		Object.keys(CATEGORIES).forEach(function(catId) {
			var cat = CATEGORIES[catId];
			var catFeeds = FEEDS.filter(function(f) { return f.cat === catId; });
			if (catFeeds.length === 0) return;

			var card = el('div', 'tg-config');
			var cT = el('div', '');
			cT.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px';
			var cIW = el('div', '');
			cIW.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:' + cat.color + '14;color:' + cat.color;
			cIW.innerHTML = ic(cat.icon, 22);
			cT.appendChild(cIW);
			cT.innerHTML += '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">' + cat.name + '</div>';
			card.appendChild(cT);

			catFeeds.forEach(function(feed, idx) {
				var row = el('div', 'simple-toggle-row');
				if (idx === catFeeds.length - 1) row.style.borderBottom = 'none';
				var info = el('div', 'simple-toggle-info');
				info.appendChild(el('div', 'simple-toggle-title', feed.name));
				info.appendChild(el('div', 'simple-toggle-desc', feed.desc));
				row.appendChild(info);
				row.appendChild(mkSwitch(self._activeSources.indexOf(feed.id) !== -1, function(val) {
					if (val) { if (self._activeSources.indexOf(feed.id) === -1) self._activeSources.push(feed.id); }
					else { self._activeSources = self._activeSources.filter(function(s) { return s !== feed.id; }); }
				}));
				card.appendChild(row);
			});
			customSection.appendChild(card);
		});

		var applyRow = el('div', '');
		applyRow.style.cssText = 'text-align:center;margin-bottom:var(--simple-gap)';
		var applyBtn = el('button', 'tg-power-btn');
		applyBtn.style.cssText = 'background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.4);font-size:14px;padding:12px 40px';
		applyBtn.innerHTML = ic(SVG.save, 16) + ' Apply Custom Feeds';
		applyBtn.onclick = function() { self.applyFeeds(); };
		applyRow.appendChild(applyBtn);
		customSection.appendChild(applyRow);

		root.appendChild(customSection);

		return root;
	},

	setUciList: function(option, values) {
		var cmds = 'while uci -q delete banip.global.' + option + ' 2>/dev/null; do :; done\n';
		values.forEach(function(v) {
			cmds += 'uci add_list banip.global.' + option + '=' + v + '\n';
		});
		cmds += 'uci commit banip\necho OK';
		return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmds]), {});
	},

	applyFeeds: function() {
		var self = this;
		var cmds = 'while uci -q delete banip.global.ban_feed 2>/dev/null; do :; done\n';
		self._activeSources.forEach(function(f) {
			cmds += 'uci add_list banip.global.ban_feed=' + f + '\n';
		});
		cmds += 'uci set banip.global.ban_enabled=1\nuci commit banip\n/etc/init.d/banip reload\necho OK';
		L.resolveDefault(callFileExec('/bin/sh', ['-c', cmds]), {}).then(function(res) {
			var ok = (res && res.stdout && res.stdout.indexOf('OK') !== -1);
			self.showToast(ok ? 'Feeds updated \u2014 banIP is reloading' : 'Error updating feeds');
			window.setTimeout(function() { location.reload(); }, 4000);
		});
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
