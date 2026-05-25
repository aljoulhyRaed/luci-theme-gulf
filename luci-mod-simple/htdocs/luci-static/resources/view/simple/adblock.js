'use strict';
'require view';
'require dom';
'require rpc';
'require uci';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });
var callFileRead = rpc.declare({ object: 'file', method: 'read', params: ['path'], expect: { data: '' } });

var SVG = {
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.54-3.12 8.78-7 9.88-3.88-1.1-7-5.34-7-9.88V6.3l7-3.12z"/><path d="M10 12.5l-2-2-1.41 1.41L10 15.32l7-7-1.41-1.41z"/></svg>',
	shieldOff: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
	block: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/></svg>',
	eye: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
	phish: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
	crypto: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z"/></svg>',
	child: '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
	search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
	list: '<svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	power: '<svg viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
	tune: '<svg viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>'
};

var SOURCES = [
	{ id: 'adguard',          name: 'AdGuard DNS',       cat: 'ads',      size: 'L',   desc: 'General ad & tracker blocking' },
	{ id: 'adguard_tracking', name: 'AdGuard Tracking',  cat: 'tracking', size: 'L',   desc: 'CNAME-cloaked trackers' },
	{ id: 'disconnect',       name: 'Disconnect.me',     cat: 'ads',      size: 'S',   desc: 'Malvertising domains' },
	{ id: 'oisd_small',       name: 'OISD Small',        cat: 'ads',      size: 'L',   desc: 'Balanced ad blocklist' },
	{ id: 'oisd_big',         name: 'OISD Big',          cat: 'ads',      size: 'XXL', desc: 'Comprehensive ad blocklist' },
	{ id: 'yoyo',             name: 'Yoyo.org',          cat: 'ads',      size: 'S',   desc: 'Classic ad server list' },
	{ id: 'easylist',         name: 'EasyList',          cat: 'ads',      size: 'M',   desc: 'Popular browser adblock list' },
	{ id: 'spam404',          name: 'Spam404',           cat: 'ads',      size: 'S',   desc: 'Spam & scam domains' },
	{ id: 'easyprivacy',      name: 'EasyPrivacy',       cat: 'tracking', size: 'M',   desc: 'Tracking & analytics domains' },
	{ id: 'android_tracking', name: 'Android Tracking',  cat: 'tracking', size: 'S',   desc: 'Android telemetry domains' },
	{ id: 'firetv_tracking',  name: 'Fire TV Tracking',  cat: 'tracking', size: 'S',   desc: 'Amazon Fire TV telemetry' },
	{ id: 'games_tracking',   name: 'Game Tracking',     cat: 'tracking', size: 'S',   desc: 'Game industry telemetry' },
	{ id: 'notracking',       name: 'NoTracking',        cat: 'tracking', size: 'XL',  desc: 'Comprehensive tracker list' },
	{ id: 'winspy',           name: 'WindowsSpy',        cat: 'tracking', size: 'S',   desc: 'Windows telemetry domains' },
	{ id: 'certpl',           name: 'CERT.PL',           cat: 'security', size: 'L',   desc: 'Polish CERT phishing list' },
	{ id: 'phishing_army',    name: 'Phishing Army',     cat: 'security', size: 'S',   desc: 'Phishing domain blocklist' },
	{ id: 'openphish',        name: 'OpenPhish',         cat: 'security', size: 'S',   desc: 'Phishing URL intelligence' },
	{ id: 'doh_blocklist',    name: 'DoH Blocklist',     cat: 'security', size: 'S',   desc: 'Block DNS-over-HTTPS bypass' },
	{ id: 'bitcoin',          name: 'NoCoin',            cat: 'mining',   size: 'S',   desc: 'Crypto mining scripts' },
	{ id: 'oisd_nsfw',        name: 'OISD NSFW',         cat: 'adult',    size: 'XXL', desc: 'Adult content blocklist' },
	{ id: 'oisd_nsfw_small',  name: 'OISD NSFW Small',   cat: 'adult',    size: 'M',   desc: 'Lightweight adult filter' },
	{ id: 'stevenblack',      name: 'StevenBlack',       cat: 'compilation', size: 'VAR', desc: 'Unified hosts compilation' },
	{ id: 'hagezi',           name: 'Hagezi',            cat: 'compilation', size: 'VAR', desc: 'Multi-source DNS blocklists' },
	{ id: 'anudeep',          name: 'Anudeep',           cat: 'compilation', size: 'M',   desc: 'Curated ad server list' },
	{ id: 'hblock',           name: 'hBlock',            cat: 'compilation', size: 'XL',  desc: 'Aggregated hosts blocklist' }
];

var CATEGORIES = {
	ads:         { name: 'Ads & Popups',       icon: SVG.block,  color: '#ef4444' },
	tracking:    { name: 'Tracking & Privacy',  icon: SVG.eye,    color: '#f59e0b' },
	security:    { name: 'Phishing & Malware',  icon: SVG.phish,  color: '#8b5cf6' },
	mining:      { name: 'Crypto Mining',       icon: SVG.crypto, color: '#f97316' },
	adult:       { name: 'Adult Content',       icon: SVG.child,  color: '#ec4899' },
	compilation: { name: 'Multi-Source Lists',  icon: SVG.list,   color: '#3b82f6' }
};

var PRESETS = {
	light:      { label: 'Light',      color: '#22c55e', icon: '1',  desc: 'Minimal blocking — just major ad networks',                       sources: ['adguard'] },
	standard:   { label: 'Standard',   color: '#3b82f6', icon: '2',  desc: 'Recommended — ads, trackers, and phishing',                       sources: ['adguard', 'adguard_tracking', 'certpl'] },
	aggressive: { label: 'Aggressive', color: '#ef4444', icon: '3',  desc: 'Maximum protection — may affect some sites',                      sources: ['adguard', 'adguard_tracking', 'certpl', 'phishing_army', 'disconnect', 'bitcoin', 'anudeep', 'easyprivacy', 'spam404'] },
	family:     { label: 'Family',     color: '#ec4899', icon: '4',  desc: 'Standard + adult content filtering',                              sources: ['adguard', 'adguard_tracking', 'certpl', 'phishing_army', 'oisd_nsfw_small'] }
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
			uci.load('adblock').catch(function() { return null; }),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'if [ -f /tmp/adb_runtime.json ]; then cat /tmp/adb_runtime.json; else echo "{}"; fi'
			]), {}),
			L.resolveDefault(callFileRead('/etc/adblock/adblock.whitelist'), ''),
			L.resolveDefault(callFileRead('/etc/adblock/adblock.blacklist'), ''),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'opkg list-installed 2>/dev/null | grep "^adblock "'
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

	detectPreset: function(sources) {
		var srcSet = {};
		sources.forEach(function(s) { srcSet[s] = true; });
		var keys = Object.keys(PRESETS);
		for (var i = 0; i < keys.length; i++) {
			var ps = PRESETS[keys[i]].sources;
			if (ps.length === sources.length && ps.every(function(s) { return srcSet[s]; }))
				return keys[i];
		}
		return 'custom';
	},

	render: function(data) {
		var self = this;
		var adblockLoaded = data[0] !== null;
		var runtimeRaw = data[1] && data[1].stdout ? data[1].stdout : '{}';
		var whitelist = data[2] || '';
		var blacklist = data[3] || '';
		var adblockInstalled = !!(data[4] && data[4].stdout && data[4].stdout.trim());

		var runtime = {};
		try { runtime = JSON.parse(runtimeRaw); } catch(e) {}

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		if (!adblockLoaded) {
			var notInstalled = el('div', 'tg-hero');
			notInstalled.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

			var niShield = el('div', 'tg-shield disconnected');
			niShield.innerHTML = SVG.shieldOff;
			notInstalled.appendChild(niShield);
			notInstalled.appendChild(el('div', 'tg-status-text', 'Adblock Not Installed'));
			notInstalled.appendChild(el('div', 'tg-status-sub', 'Install the Adblock packages from System \u2192 Software to enable network-wide ad blocking.'));

			var installBtn = el('a', 'tg-power-btn');
			installBtn.href = L.url('admin', 'simple-system', 'software');
			installBtn.innerHTML = 'Go to Software';
			installBtn.style.textDecoration = 'none';
			notInstalled.appendChild(installBtn);

			root.appendChild(notInstalled);
			return root;
		}

		var enabled = (uci.get('adblock', 'global', 'adb_enabled') !== '0');
		var safesearch = (uci.get('adblock', 'global', 'adb_safesearch') === '1');
		var currentSources = uci.get('adblock', 'global', 'adb_sources');
		if (!currentSources) currentSources = [];
		if (typeof currentSources === 'string') currentSources = [currentSources];
		self._activeSources = currentSources.slice();
		var activePreset = self.detectPreset(currentSources);

		var blocked = runtime.blocked_domains || runtime.adb_dnstotal || '0';
		var lastRunRaw = runtime.last_run || runtime.adb_lastrun || '';
		var lastRun = 'Never';
		if (lastRunRaw) {
			var tsMatch = lastRunRaw.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
			if (tsMatch) lastRun = tsMatch[1] + ' ' + tsMatch[2];
			else lastRun = lastRunRaw.split(',')[0] || lastRunRaw;
		}
		var activeFeeds = (runtime.active_sources && runtime.active_sources.length) || currentSources.length || 0;

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = enabled
			? 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)'
			: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var shieldDiv = el('div', 'tg-shield ' + (enabled ? 'connected' : 'disconnected'));
		shieldDiv.innerHTML = enabled ? SVG.shield : SVG.shieldOff;
		hero.appendChild(shieldDiv);
		hero.appendChild(el('div', 'tg-status-text', enabled ? 'Protection Active' : 'Protection Disabled'));
		hero.appendChild(el('div', 'tg-status-sub',
			enabled
				? currentSources.length + ' blocklist' + (currentSources.length !== 1 ? 's' : '') + ' active \u2022 ' + blocked + ' domains blocked'
				: 'Enable adblock to protect all devices on your network'
		));

		var heroBtn = el('button', 'tg-power-btn' + (enabled ? ' stop' : ''));
		heroBtn.innerHTML = ic(SVG.power, 18) + ' ' + (enabled ? 'Disable Protection' : 'Enable Protection');
		heroBtn.onclick = function() {
			heroBtn.disabled = true;
			var newVal = enabled ? '0' : '1';
			uci.set('adblock', 'global', 'adb_enabled', newVal);
			uci.save();
			uci.apply().then(function() {
				return L.resolveDefault(callFileExec('/etc/init.d/adblock', ['restart']), {});
			}).then(function() {
				self.showToast(newVal === '1' ? 'Adblock enabled' : 'Adblock disabled');
				window.setTimeout(function() { location.reload(); }, 2500);
			});
		};
		hero.appendChild(heroBtn);

		if (enabled) {
			var stats = el('div', 'tg-stats');
			[
				{ val: String(blocked), label: 'Domains Blocked' },
				{ val: String(activeFeeds), label: 'Active Lists' },
				{ val: lastRun, label: 'Last Update' }
			].forEach(function(s) {
				var stat = el('div', 'tg-stat');
				stat.appendChild(el('div', 'tg-stat-val', s.val));
				stat.appendChild(el('div', 'tg-stat-label', s.label));
				stats.appendChild(stat);
			});
			hero.appendChild(stats);
		}

		root.appendChild(hero);

		/* ── Protection Level ── */
		var presetCard = el('div', 'tg-config');

		var presetTitle = el('div', '');
		presetTitle.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:20px';
		var presetIconWrap = el('div', '');
		presetIconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--simple-accent-light);color:var(--simple-accent)';
		presetIconWrap.innerHTML = ic(SVG.tune, 22);
		presetTitle.appendChild(presetIconWrap);
		var presetTitleText = el('div', '');
		presetTitleText.innerHTML = '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">Protection Level</div>' +
			'<div style="font-size:13px;color:var(--simple-muted)">Choose how aggressively to block ads and trackers</div>';
		presetTitle.appendChild(presetTitleText);
		presetCard.appendChild(presetTitle);

		var presetGrid = el('div', '');
		presetGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px';

		Object.keys(PRESETS).forEach(function(pk) {
			var p = PRESETS[pk];
			var isActive = (activePreset === pk);
			var card = el('div', '');
			card.style.cssText = 'padding:16px 18px;border-radius:14px;cursor:pointer;position:relative;overflow:hidden;' +
				'border:2px solid ' + (isActive ? p.color : 'var(--simple-card-border)') + ';' +
				'background:' + (isActive ? p.color + '14' : 'var(--simple-input-bg)') + ';' +
				'transition:all 0.25s ease';

			if (isActive) {
				card.style.boxShadow = '0 0 20px ' + p.color + '25';
			}

			var header = el('div', '');
			header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px';

			var dot = el('div', '');
			dot.style.cssText = 'width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;' +
				'background:' + p.color + (isActive ? '' : '80');
			dot.textContent = p.icon;
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

			var desc = el('div', '');
			desc.style.cssText = 'font-size:0.8rem;color:var(--simple-muted);line-height:1.4';
			desc.textContent = p.desc;
			card.appendChild(desc);

			var count = el('div', '');
			count.style.cssText = 'margin-top:8px;font-size:0.72rem;font-weight:600;color:' + (isActive ? p.color : 'var(--simple-muted)');
			count.textContent = p.sources.length + ' list' + (p.sources.length !== 1 ? 's' : '');
			card.appendChild(count);

			card.onmouseenter = function() { if (!isActive) { card.style.borderColor = p.color + '80'; card.style.background = p.color + '0a'; } };
			card.onmouseleave = function() { if (!isActive) { card.style.borderColor = 'var(--simple-card-border)'; card.style.background = 'var(--simple-input-bg)'; } };

			card.onclick = function() {
				self._activeSources = p.sources.slice();
				self.applySources();
			};

			presetGrid.appendChild(card);
		});

		// Custom card
		var customCard = el('div', '');
		var isCustom = (activePreset === 'custom');
		customCard.style.cssText = 'padding:16px 18px;border-radius:14px;cursor:pointer;position:relative;' +
			'border:2px solid ' + (isCustom ? '#8b5cf6' : 'var(--simple-card-border)') + ';' +
			'background:' + (isCustom ? '#8b5cf614' : 'var(--simple-input-bg)') + ';' +
			'transition:all 0.25s ease';
		if (isCustom) customCard.style.boxShadow = '0 0 20px #8b5cf625';

		var cHeader = el('div', '');
		cHeader.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px';
		var cDot = el('div', '');
		cDot.style.cssText = 'width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;background:#8b5cf6' + (isCustom ? '' : '80');
		cDot.innerHTML = ic(SVG.tune, 16, '#fff');
		cHeader.appendChild(cDot);
		var cName = el('div', '');
		cName.style.cssText = 'font-weight:700;font-size:0.95rem;color:' + (isCustom ? '#8b5cf6' : 'var(--simple-text)');
		cName.textContent = 'Custom';
		cHeader.appendChild(cName);
		if (isCustom) {
			var ck2 = el('div', '');
			ck2.style.cssText = 'margin-left:auto;width:22px;height:22px;border-radius:50%;background:#8b5cf6;display:flex;align-items:center;justify-content:center';
			ck2.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
			cHeader.appendChild(ck2);
		}
		customCard.appendChild(cHeader);
		customCard.appendChild(el('div', '', '<div style="font-size:0.8rem;color:var(--simple-muted);line-height:1.4">Pick exactly which blocklists to use</div>'));
		if (isCustom) {
			var cCnt = el('div', '');
			cCnt.style.cssText = 'margin-top:8px;font-size:0.72rem;font-weight:600;color:#8b5cf6';
			cCnt.textContent = currentSources.length + ' list' + (currentSources.length !== 1 ? 's' : '') + ' selected';
			customCard.appendChild(cCnt);
		}
		customCard.onmouseenter = function() { if (!isCustom) { customCard.style.borderColor = '#8b5cf680'; customCard.style.background = '#8b5cf60a'; } };
		customCard.onmouseleave = function() { if (!isCustom) { customCard.style.borderColor = 'var(--simple-card-border)'; customCard.style.background = 'var(--simple-input-bg)'; } };
		customCard.onclick = function() {
			var cs = document.getElementById('adb-custom');
			if (cs) {
				cs.style.display = cs.style.display === 'none' ? '' : 'none';
				if (cs.style.display !== 'none') cs.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		};
		presetGrid.appendChild(customCard);

		presetCard.appendChild(presetGrid);

		if (enabled) {
			var updateRow = el('div', '');
			updateRow.style.cssText = 'margin-top:16px;display:flex;justify-content:flex-end';
			var updateBtn = el('button', 'simple-btn simple-btn-outline');
			updateBtn.innerHTML = ic(SVG.refresh, 15) + ' Update Blocklists Now';
			updateBtn.onclick = function() {
				updateBtn.disabled = true;
				updateBtn.innerHTML = ic(SVG.refresh, 15) + ' Updating\u2026';
				L.resolveDefault(callFileExec('/etc/init.d/adblock', ['reload']), {}).then(function() {
					self.showToast('Blocklists updating in background');
					window.setTimeout(function() { location.reload(); }, 5000);
				});
			};
			updateRow.appendChild(updateBtn);
			presetCard.appendChild(updateRow);
		}

		root.appendChild(presetCard);

		/* ── Settings Card (SafeSearch etc.) ── */
		var settingsCard = el('div', 'tg-config');

		var stTitle = el('div', '');
		stTitle.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px';
		var stIcon = el('div', '');
		stIcon.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(59,130,246,0.12);color:#3b82f6';
		stIcon.innerHTML = ic(SVG.search, 22);
		stTitle.appendChild(stIcon);
		stTitle.innerHTML += '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">Settings</div>';
		settingsCard.appendChild(stTitle);

		// SafeSearch row
		var safeRow = el('div', 'simple-toggle-row');
		var safeInfo = el('div', 'simple-toggle-info');
		safeInfo.appendChild(el('div', 'simple-toggle-title', 'SafeSearch'));
		safeInfo.appendChild(el('div', 'simple-toggle-desc', 'Force SafeSearch on Google, Bing, YouTube, DuckDuckGo, and Pixabay'));
		safeRow.appendChild(safeInfo);
		safeRow.appendChild(mkSwitch(safesearch, function(val) {
			uci.set('adblock', 'global', 'adb_safesearch', val ? '1' : '0');
			uci.save();
			uci.apply().then(function() {
				return L.resolveDefault(callFileExec('/etc/init.d/adblock', ['restart']), {});
			}).then(function() {
				self.showToast(val ? 'SafeSearch enabled' : 'SafeSearch disabled');
			});
		}));
		settingsCard.appendChild(safeRow);

		// Force DNS row
		var forceDns = (uci.get('adblock', 'global', 'adb_forcedns') === '1');
		var dnsRow = el('div', 'simple-toggle-row');
		var dnsInfo = el('div', 'simple-toggle-info');
		dnsInfo.appendChild(el('div', 'simple-toggle-title', 'Force Local DNS'));
		dnsInfo.appendChild(el('div', 'simple-toggle-desc', 'Redirect all DNS queries through the router to prevent clients from bypassing adblock'));
		dnsRow.appendChild(dnsInfo);
		dnsRow.appendChild(mkSwitch(forceDns, function(val) {
			uci.set('adblock', 'global', 'adb_forcedns', val ? '1' : '0');
			uci.save();
			uci.apply().then(function() {
				return L.resolveDefault(callFileExec('/etc/init.d/adblock', ['restart']), {});
			}).then(function() {
				self.showToast(val ? 'DNS forcing enabled' : 'DNS forcing disabled');
			});
		}));
		settingsCard.appendChild(dnsRow);

		root.appendChild(settingsCard);

		/* ── Custom Source Selection ── */
		var customSection = el('div', '');
		customSection.id = 'adb-custom';
		customSection.style.display = isCustom ? '' : 'none';

		var catKeys = Object.keys(CATEGORIES);
		catKeys.forEach(function(catId) {
			var cat = CATEGORIES[catId];
			var catSources = SOURCES.filter(function(s) { return s.cat === catId; });
			if (catSources.length === 0) return;

			var card = el('div', 'tg-config');

			var cTitle = el('div', '');
			cTitle.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px';
			var cIconWrap = el('div', '');
			cIconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:' + cat.color + '14;color:' + cat.color;
			cIconWrap.innerHTML = ic(cat.icon, 22);
			cTitle.appendChild(cIconWrap);
			cTitle.innerHTML += '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">' + cat.name + '</div>';
			card.appendChild(cTitle);

			catSources.forEach(function(src, idx) {
				var row = el('div', 'simple-toggle-row');
				if (idx === catSources.length - 1) row.style.borderBottom = 'none';

				var info = el('div', 'simple-toggle-info');
				var titleHtml = '<span>' + src.name + '</span> <span style="font-size:0.68rem;padding:2px 8px;border-radius:8px;margin-left:6px;' +
					'background:' + cat.color + '14;color:' + cat.color + ';font-weight:600">' + src.size + '</span>';
				info.appendChild(el('div', 'simple-toggle-title', titleHtml));
				info.appendChild(el('div', 'simple-toggle-desc', src.desc));
				row.appendChild(info);

				row.appendChild(mkSwitch(self._activeSources.indexOf(src.id) !== -1, function(val) {
					if (val) {
						if (self._activeSources.indexOf(src.id) === -1)
							self._activeSources.push(src.id);
					} else {
						self._activeSources = self._activeSources.filter(function(s) { return s !== src.id; });
					}
				}));

				card.appendChild(row);
			});

			customSection.appendChild(card);
		});

		var applyRow = el('div', '');
		applyRow.style.cssText = 'text-align:center;margin-bottom:var(--simple-gap)';
		var applyBtn = el('button', 'tg-power-btn');
		applyBtn.style.cssText = 'background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.4);font-size:14px;padding:12px 40px';
		applyBtn.innerHTML = ic(SVG.save, 16) + ' Apply Custom Sources';
		applyBtn.onclick = function() { self.applySources(); };
		applyRow.appendChild(applyBtn);
		customSection.appendChild(applyRow);

		root.appendChild(customSection);

		/* ── Allowlist / Blocklist ── */
		var listCard = el('div', 'tg-config');

		var lTitle = el('div', '');
		lTitle.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px';
		var lIconWrap = el('div', '');
		lIconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(16,185,129,0.12);color:#10b981';
		lIconWrap.innerHTML = ic(SVG.list, 22);
		lTitle.appendChild(lIconWrap);
		var lTitleBlock = el('div', '');
		lTitleBlock.innerHTML = '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">Custom Allow & Block Lists</div>' +
			'<div style="font-size:13px;color:var(--simple-muted)">Override specific domains. One per line.</div>';
		lTitle.appendChild(lTitleBlock);
		listCard.appendChild(lTitle);

		var listGrid = el('div', '');
		listGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:16px';

		var alDiv = el('div', '');
		var alLabel = el('div', '');
		alLabel.style.cssText = 'font-weight:600;margin-bottom:8px;font-size:0.85rem;display:flex;align-items:center;gap:6px;color:#22c55e';
		alLabel.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block"></span> Allowlist';
		alDiv.appendChild(alLabel);
		var alTa = el('textarea', 'simple-input');
		alTa.style.cssText = 'width:100%;height:150px;font-family:\'JetBrains Mono\',monospace;font-size:0.8rem;resize:vertical;box-sizing:border-box;line-height:1.6';
		alTa.value = whitelist;
		alTa.placeholder = 'example.com\nads.example.net';
		alDiv.appendChild(alTa);

		var blDiv = el('div', '');
		var blLabel = el('div', '');
		blLabel.style.cssText = 'font-weight:600;margin-bottom:8px;font-size:0.85rem;display:flex;align-items:center;gap:6px;color:#ef4444';
		blLabel.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block"></span> Blocklist';
		blDiv.appendChild(blLabel);
		var blTa = el('textarea', 'simple-input');
		blTa.style.cssText = 'width:100%;height:150px;font-family:\'JetBrains Mono\',monospace;font-size:0.8rem;resize:vertical;box-sizing:border-box;line-height:1.6';
		blTa.value = blacklist;
		blTa.placeholder = 'badsite.com\ntracker.example.org';
		blDiv.appendChild(blTa);

		listGrid.appendChild(alDiv);
		listGrid.appendChild(blDiv);
		listCard.appendChild(listGrid);

		var saveRow = el('div', '');
		saveRow.style.cssText = 'margin-top:14px;display:flex;justify-content:flex-end';
		var saveBtn = el('button', 'simple-btn simple-btn-primary');
		saveBtn.innerHTML = ic(SVG.save, 15) + ' Save Lists';
		saveBtn.onclick = function() {
			saveBtn.disabled = true;
			saveBtn.innerHTML = ic(SVG.save, 15) + ' Saving\u2026';
			Promise.all([
				L.resolveDefault(callFileExec('/bin/sh', ['-c',
					"cat > /etc/adblock/adblock.whitelist << 'GULFEOF'\n" + alTa.value.trim() + "\nGULFEOF"
				]), {}),
				L.resolveDefault(callFileExec('/bin/sh', ['-c',
					"cat > /etc/adblock/adblock.blacklist << 'GULFEOF'\n" + blTa.value.trim() + "\nGULFEOF"
				]), {})
			]).then(function() {
				return L.resolveDefault(callFileExec('/etc/init.d/adblock', ['reload']), {});
			}).then(function() {
				saveBtn.disabled = false;
				saveBtn.innerHTML = ic(SVG.save, 15) + ' Save Lists';
				self.showToast('Allow & block lists saved');
			});
		};
		saveRow.appendChild(saveBtn);
		listCard.appendChild(saveRow);
		root.appendChild(listCard);

		return root;
	},

	applySources: function() {
		var self = this;
		while (uci.get('adblock', 'global', 'adb_sources'))
			uci.unset('adblock', 'global', 'adb_sources');

		self._activeSources.forEach(function(src) {
			uci.add_list('adblock', 'global', 'adb_sources', src);
		});

		uci.set('adblock', 'global', 'adb_enabled', '1');
		uci.save();
		uci.apply().then(function() {
			return L.resolveDefault(callFileExec('/etc/init.d/adblock', ['restart']), {});
		}).then(function() {
			self.showToast('Protection level updated \u2014 lists are refreshing');
			window.setTimeout(function() { location.reload(); }, 3000);
		});
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
