'use strict';
'require view';
'require dom';
'require rpc';
'require uci';
'require poll';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });
var callFileRead = rpc.declare({ object: 'file', method: 'read', params: ['path'] });

var SVG = {
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.54-3.12 8.78-7 9.88-3.88-1.1-7-5.34-7-9.88V6.3l7-3.12z"/><path d="M10 12.5l-2-2-1.41 1.41L10 15.32l7-7-1.41-1.41z"/></svg>',
	shieldOff: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
	power: '<svg viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>',
	alert: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
	eye: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
	block: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	tune: '<svg viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
	net: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
	memory: '<svg viewBox="0 0 24 24"><path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z"/></svg>',
	rules: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
	download: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
	del: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>'
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

function mkSelect(options, selected) {
	var sel = el('select', 'simple-input');
	sel.style.cssText = 'width:auto;min-width:160px;padding:8px 12px';
	options.forEach(function(o) {
		var opt = el('option', '');
		opt.value = o[0]; opt.textContent = o[1];
		if (o[0] === selected) opt.selected = true;
		sel.appendChild(opt);
	});
	return sel;
}

return view.extend({
	_pollHandle: null,

	load: function() {
		return Promise.all([
			uci.load('snort').catch(function() { return null; }),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'RUNNING=0; PID=""; MEM=""; ALERTS=0; IFACE=""; MODE=""; RULES=0; ' +
				'PID=$(ps w 2>/dev/null | grep "/usr/bin/snort" | grep -v grep | awk \'{print $1}\' | head -1); ' +
				'if [ -n "$PID" ]; then RUNNING=1; MEM=$(ps w | grep "^[ ]*$PID " | awk \'{print $5}\'); fi; ' +
				'[ -f /var/log/alert_fast.txt ] && ALERTS=$(wc -l < /var/log/alert_fast.txt 2>/dev/null || echo 0); ' +
				'RULES=$(ls /etc/snort/rules/*.rules 2>/dev/null | wc -l); ' +
				'echo "RUNNING=$RUNNING"; echo "PID=$PID"; echo "MEM=$MEM"; echo "ALERTS=$ALERTS"; echo "RULES=$RULES"'
			]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'[ -f /var/log/alert_fast.txt ] && tail -30 /var/log/alert_fast.txt | tac 2>/dev/null || echo ""'
			]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'opkg list-installed 2>/dev/null | grep "^snort3 "'
			]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'awk \'/MemTotal/ {t=$2} /MemAvailable/ {a=$2} END {printf "%d %d", t/1024, (t-a)/1024}\' /proc/meminfo'
			]), {})
		]);
	},

	parseStatus: function(data) {
		var out = (data && data.stdout) ? data.stdout : '';
		var s = { running: false, pid: '', mem: '', alerts: 0, rules: 0 };
		out.split('\n').forEach(function(l) {
			var p = l.split('=');
			if (p[0] === 'RUNNING') s.running = (p[1] === '1');
			if (p[0] === 'PID') s.pid = p[1] || '';
			if (p[0] === 'MEM') s.mem = p[1] || '';
			if (p[0] === 'ALERTS') s.alerts = parseInt(p[1]) || 0;
			if (p[0] === 'RULES') s.rules = parseInt(p[1]) || 0;
		});
		return s;
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3500);
	},

	render: function(data) {
		var self = this;
		var snortLoaded = data[0] !== null;
		var status = self.parseStatus(data[1]);
		var alertsRaw = (data[2] && data[2].stdout) ? data[2].stdout.trim() : '';
		var snortInstalled = !!(data[3] && data[3].stdout && data[3].stdout.trim());
		var memRaw = (data[4] && data[4].stdout) ? data[4].stdout.trim() : '';
		var memParts = memRaw.split(' ');
		var memTotal = parseInt(memParts[0]) || 0;
		var memUsed = parseInt(memParts[1]) || 0;
		var memPct = memTotal > 0 ? Math.round((memUsed / memTotal) * 100) : 0;

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Not Installed ── */
		if (!snortInstalled && !snortLoaded) {
			var niHero = el('div', 'tg-hero');
			niHero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';
			var niShield = el('div', 'tg-shield disconnected');
			niShield.innerHTML = SVG.shieldOff;
			niHero.appendChild(niShield);
			niHero.appendChild(el('div', 'tg-status-text', 'Intrusion Detection Not Installed'));
			niHero.appendChild(el('div', 'tg-status-sub', 'Install the Snort3 IDS package from System \u2192 Software to enable network intrusion detection.'));
			var installBtn = el('a', 'tg-power-btn');
			installBtn.href = L.url('admin', 'simple-system', 'software');
			installBtn.innerHTML = 'Go to Software';
			installBtn.style.textDecoration = 'none';
			niHero.appendChild(installBtn);
			root.appendChild(niHero);
			return root;
		}

		var enabled = (uci.get('snort', 'snort', 'enabled') === '1');
		var mode = uci.get('snort', 'snort', 'mode') || 'ids';
		var iface = uci.get('snort', 'snort', 'interface') || 'br-lan';
		var homeNet = uci.get('snort', 'snort', 'home_net') || '192.168.1.0/24';
		var method = uci.get('snort', 'snort', 'method') || 'pcap';
		var logging = uci.get('snort', 'snort', 'logging') !== '0';
		var ruleAction = uci.get('snort', 'snort', 'action') || 'default';

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		if (status.running) {
			hero.style.background = mode === 'ips'
				? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%)'
				: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)';
		} else {
			hero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';
		}

		var shieldDiv = el('div', 'tg-shield ' + (status.running ? 'connected' : 'disconnected'));
		shieldDiv.innerHTML = status.running ? SVG.shield : SVG.shieldOff;
		hero.appendChild(shieldDiv);

		var heroTitle = status.running
			? (mode === 'ips' ? 'IPS Active \u2014 Blocking Threats' : 'IDS Active \u2014 Monitoring Traffic')
			: 'Intrusion Detection Offline';
		hero.appendChild(el('div', 'tg-status-text', heroTitle));
		hero.appendChild(el('div', 'tg-status-sub',
			status.running
				? 'Monitoring ' + iface + ' \u2022 ' + status.alerts + ' alert' + (status.alerts !== 1 ? 's' : '') + ' detected'
				: 'Start Snort to monitor your network for threats'
		));

		var powerBtn = el('button', 'tg-power-btn' + (status.running ? ' stop' : ''));
		powerBtn.innerHTML = ic(SVG.power, 18) + ' ' + (status.running ? 'Stop Snort' : 'Start Snort');
		powerBtn.onclick = function() {
			powerBtn.disabled = true;
			var action = status.running ? 'stop' : 'start';
			L.resolveDefault(callFileExec('/etc/init.d/snort', [action]), {}).then(function() {
				self.showToast('Snort ' + (action === 'start' ? 'starting...' : 'stopped'));
				window.setTimeout(function() { location.reload(); }, 3000);
			});
		};
		hero.appendChild(powerBtn);

		if (status.running) {
			var stats = el('div', 'tg-stats');
			[
				{ val: String(status.alerts), label: 'Alerts' },
				{ val: status.pid || '—', label: 'PID' },
				{ val: String(status.rules), label: 'Rule Files' },
				{ val: memPct + '%', label: 'Memory Used' }
			].forEach(function(s) {
				var stat = el('div', 'tg-stat');
				stat.appendChild(el('div', 'tg-stat-val', s.val));
				stat.appendChild(el('div', 'tg-stat-label', s.label));
				stats.appendChild(stat);
			});
			hero.appendChild(stats);
		}

		root.appendChild(hero);

		/* ── Configuration Card ── */
		var cfgCard = el('div', 'tg-config');

		var cfgTitle = el('div', '');
		cfgTitle.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:20px';
		var cfgIconWrap = el('div', '');
		cfgIconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--simple-accent-light);color:var(--simple-accent)';
		cfgIconWrap.innerHTML = ic(SVG.tune, 22);
		cfgTitle.appendChild(cfgIconWrap);
		var cfgTitleBlock = el('div', '');
		cfgTitleBlock.innerHTML = '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">Configuration</div>' +
			'<div style="font-size:13px;color:var(--simple-muted)">Set up how Snort monitors your network</div>';
		cfgTitle.appendChild(cfgTitleBlock);
		cfgCard.appendChild(cfgTitle);

		// Enable at boot
		var enableRow = el('div', 'simple-toggle-row');
		var enableInfo = el('div', 'simple-toggle-info');
		enableInfo.appendChild(el('div', 'simple-toggle-title', 'Enable at Boot'));
		enableInfo.appendChild(el('div', 'simple-toggle-desc', 'Automatically start Snort when the router boots'));
		enableRow.appendChild(enableInfo);
		enableRow.appendChild(mkSwitch(enabled, function(val) {
			uci.set('snort', 'snort', 'enabled', val ? '1' : '0');
		}));
		cfgCard.appendChild(enableRow);

		// Mode: IDS vs IPS
		var modeRow = el('div', 'simple-toggle-row');
		var modeInfo = el('div', 'simple-toggle-info');
		modeInfo.appendChild(el('div', 'simple-toggle-title', ic(SVG.eye, 15) + ' Operating Mode'));
		modeInfo.appendChild(el('div', 'simple-toggle-desc', 'IDS = detect & alert only \u2022 IPS = actively block threats'));
		modeRow.appendChild(modeInfo);
		var modeSel = mkSelect([['ids', 'IDS (Detection)'], ['ips', 'IPS (Prevention)']], mode);
		modeSel.onchange = function() { uci.set('snort', 'snort', 'mode', modeSel.value); };
		modeRow.appendChild(modeSel);
		cfgCard.appendChild(modeRow);

		// Interface
		var ifRow = el('div', 'simple-toggle-row');
		var ifInfo = el('div', 'simple-toggle-info');
		ifInfo.appendChild(el('div', 'simple-toggle-title', ic(SVG.net, 15) + ' Network Interface'));
		ifInfo.appendChild(el('div', 'simple-toggle-desc', 'Which interface to monitor for intrusions'));
		ifRow.appendChild(ifInfo);
		var ifInput = el('input', 'simple-input');
		ifInput.type = 'text';
		ifInput.value = iface;
		ifInput.style.cssText = 'width:auto;min-width:140px;padding:8px 12px';
		ifInput.onchange = function() { uci.set('snort', 'snort', 'interface', ifInput.value); };
		ifRow.appendChild(ifInput);
		cfgCard.appendChild(ifRow);

		// Home net
		var hnRow = el('div', 'simple-toggle-row');
		var hnInfo = el('div', 'simple-toggle-info');
		hnInfo.appendChild(el('div', 'simple-toggle-title', 'Home Network'));
		hnInfo.appendChild(el('div', 'simple-toggle-desc', 'Your local network range to protect'));
		hnRow.appendChild(hnInfo);
		var hnInput = el('input', 'simple-input');
		hnInput.type = 'text';
		hnInput.value = homeNet;
		hnInput.style.cssText = 'width:auto;min-width:160px;padding:8px 12px';
		hnInput.placeholder = '192.168.1.0/24';
		hnInput.onchange = function() { uci.set('snort', 'snort', 'home_net', hnInput.value); };
		hnRow.appendChild(hnInput);
		cfgCard.appendChild(hnRow);

		// DAQ Method
		var daqRow = el('div', 'simple-toggle-row');
		var daqInfo = el('div', 'simple-toggle-info');
		daqInfo.appendChild(el('div', 'simple-toggle-title', 'Capture Method'));
		daqInfo.appendChild(el('div', 'simple-toggle-desc', 'Packet acquisition method (PCAP recommended for most setups)'));
		daqRow.appendChild(daqInfo);
		var daqSel = mkSelect([['pcap', 'PCAP'], ['afpacket', 'AF_PACKET'], ['nfq', 'NFQ (for IPS)']], method);
		daqSel.onchange = function() { uci.set('snort', 'snort', 'method', daqSel.value); };
		daqRow.appendChild(daqSel);
		cfgCard.appendChild(daqRow);

		// Logging toggle
		var logRow = el('div', 'simple-toggle-row');
		logRow.style.borderBottom = 'none';
		var logInfo = el('div', 'simple-toggle-info');
		logInfo.appendChild(el('div', 'simple-toggle-title', 'Event Logging'));
		logInfo.appendChild(el('div', 'simple-toggle-desc', 'Log detected events to /var/log'));
		logRow.appendChild(logInfo);
		logRow.appendChild(mkSwitch(logging, function(val) {
			uci.set('snort', 'snort', 'logging', val ? '1' : '0');
		}));
		cfgCard.appendChild(logRow);

		// Save & Apply button
		var saveRow = el('div', '');
		saveRow.style.cssText = 'margin-top:16px;display:flex;gap:10px;justify-content:flex-end';
		var saveBtn = el('button', 'simple-btn simple-btn-primary');
		saveBtn.innerHTML = ic(SVG.save, 15) + ' Save & Restart';
		saveBtn.onclick = function() {
			saveBtn.disabled = true;
			saveBtn.innerHTML = ic(SVG.save, 15) + ' Saving\u2026';
			uci.save();
			uci.apply().then(function() {
				if (status.running) {
					return L.resolveDefault(callFileExec('/etc/init.d/snort', ['restart']), {});
				}
			}).then(function() {
				self.showToast('Configuration saved' + (status.running ? ' — Snort restarting' : ''));
				window.setTimeout(function() { location.reload(); }, 2500);
			});
		};
		saveRow.appendChild(saveBtn);
		cfgCard.appendChild(saveRow);
		root.appendChild(cfgCard);

		/* ── Rules Management Card ── */
		var rulesCard = el('div', 'tg-config');

		var rTitle = el('div', '');
		rTitle.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:20px';
		var rIconWrap = el('div', '');
		rIconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(249,115,22,0.12);color:#f97316';
		rIconWrap.innerHTML = ic(SVG.rules, 22);
		rTitle.appendChild(rIconWrap);
		var rTitleBlock = el('div', '');
		rTitleBlock.style.flex = '1';
		rTitleBlock.innerHTML = '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">Rules Management</div>' +
			'<div style="font-size:13px;color:var(--simple-muted)">' + status.rules + ' rule file' + (status.rules !== 1 ? 's' : '') + ' loaded</div>';
		rTitle.appendChild(rTitleBlock);
		rulesCard.appendChild(rTitle);

		// Default rule action
		var actRow = el('div', 'simple-toggle-row');
		var actInfo = el('div', 'simple-toggle-info');
		actInfo.appendChild(el('div', 'simple-toggle-title', 'Default Rule Action'));
		actInfo.appendChild(el('div', 'simple-toggle-desc', 'What to do when a rule matches: alert only, block, drop, or reject'));
		actRow.appendChild(actInfo);
		var actSel = mkSelect([
			['default', 'Default'], ['alert', 'Alert'], ['block', 'Block'], ['drop', 'Drop'], ['reject', 'Reject']
		], ruleAction);
		actSel.onchange = function() {
			uci.set('snort', 'snort', 'action', actSel.value);
			uci.save();
			uci.apply();
		};
		actRow.appendChild(actSel);
		rulesCard.appendChild(actRow);

		// Oinkcode
		var oinkRow = el('div', 'simple-toggle-row');
		oinkRow.style.borderBottom = 'none';
		var oinkInfo = el('div', 'simple-toggle-info');
		oinkInfo.appendChild(el('div', 'simple-toggle-title', 'Snort Oinkcode'));
		oinkInfo.appendChild(el('div', 'simple-toggle-desc', 'Optional: Enter your Oinkcode for registered Snort rulesets from snort.org'));
		oinkRow.appendChild(oinkInfo);
		var oinkInput = el('input', 'simple-input');
		oinkInput.type = 'password';
		oinkInput.value = uci.get('snort', 'snort', 'oinkcode') || '';
		oinkInput.style.cssText = 'width:auto;min-width:200px;padding:8px 12px';
		oinkInput.placeholder = 'Enter Oinkcode (optional)';
		oinkInput.onchange = function() {
			uci.set('snort', 'snort', 'oinkcode', oinkInput.value);
			uci.save();
			uci.apply();
		};
		oinkRow.appendChild(oinkInput);
		rulesCard.appendChild(oinkRow);

		// Update & Fix buttons
		var rBtnRow = el('div', '');
		rBtnRow.style.cssText = 'margin-top:16px;display:flex;gap:10px;flex-wrap:wrap';

		var updateBtn = el('button', 'simple-btn simple-btn-primary');
		updateBtn.innerHTML = ic(SVG.download, 15) + ' Update Rules';
		var updateStatus = el('span', '');
		updateStatus.style.cssText = 'font-size:0.82rem;color:var(--simple-muted);display:flex;align-items:center;gap:6px';
		updateBtn.onclick = function() {
			updateBtn.disabled = true;
			updateBtn.innerHTML = ic(SVG.refresh, 15) + ' Updating\u2026';
			updateStatus.innerHTML = '<span style="color:var(--simple-warning)">Downloading rules in background\u2026</span>';
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'if [ -f /tmp/snort_rules_update.lock ]; then echo LOCKED; exit 0; fi; ' +
				'touch /tmp/snort_rules_update.lock; ' +
				'(/usr/bin/snort-rules > /tmp/snort_rules_update.log 2>&1; ' +
				'rm -f /var/snort.d/*.tar.gz /tmp/snort*.tar.gz 2>/dev/null; ' +
				'rm -f /tmp/snort_rules_update.lock; ' +
				'echo FINISHED >> /tmp/snort_rules_update.log) &'
			]), {}).then(function() {
				self.pollRulesUpdate(updateBtn, updateStatus);
			});
		};

		var fixBtn = el('button', 'simple-btn simple-btn-outline');
		fixBtn.innerHTML = ic(SVG.refresh, 15) + ' Fix Rules Symlink';
		fixBtn.onclick = function() {
			fixBtn.disabled = true;
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'TD="/var/snort.d/rules"; CD="/etc/snort/rules"; ' +
				'if [ -d "$TD" ]; then ' +
				'  [ -d "$CD" ] && [ ! -L "$CD" ] && mv "$CD" "$CD.backup"; ' +
				'  [ -L "$CD" ] && rm "$CD"; ' +
				'  ln -sf "$TD" "$CD" && echo OK || echo FAIL; ' +
				'else echo NODIR; fi'
			]), {}).then(function(res) {
				fixBtn.disabled = false;
				var out = (res && res.stdout) ? res.stdout.trim() : '';
				if (out === 'OK') self.showToast('Rules symlink created');
				else if (out === 'NODIR') self.showToast('No rules directory found — update rules first');
				else self.showToast('Failed to create symlink');
			});
		};

		rBtnRow.appendChild(updateBtn);
		rBtnRow.appendChild(fixBtn);
		rBtnRow.appendChild(updateStatus);
		rulesCard.appendChild(rBtnRow);
		root.appendChild(rulesCard);

		/* ── Alerts Card ── */
		var alertCard = el('div', 'tg-config');

		var aTitle = el('div', '');
		aTitle.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px';
		var aTitleLeft = el('div', '');
		aTitleLeft.style.cssText = 'display:flex;align-items:center;gap:10px';
		var aIconWrap = el('div', '');
		aIconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,0.12);color:#ef4444';
		aIconWrap.innerHTML = ic(SVG.alert, 22);
		aTitleLeft.appendChild(aIconWrap);
		var aTitleBlock = el('div', '');
		aTitleBlock.innerHTML = '<div style="font-size:16px;font-weight:700;color:var(--simple-text)">Recent Alerts</div>' +
			'<div style="font-size:13px;color:var(--simple-muted)">Last 30 intrusion detection events</div>';
		aTitleLeft.appendChild(aTitleBlock);
		aTitle.appendChild(aTitleLeft);

		// Alert count badge
		if (status.alerts > 0) {
			var badge = el('div', '');
			badge.style.cssText = 'padding:4px 14px;border-radius:20px;font-size:0.82rem;font-weight:700;background:rgba(239,68,68,0.12);color:#ef4444';
			badge.textContent = status.alerts + ' total';
			aTitle.appendChild(badge);
		}

		alertCard.appendChild(aTitle);

		if (alertsRaw) {
			var alertPre = el('div', '');
			alertPre.style.cssText = 'max-height:360px;overflow-y:auto;border-radius:10px;background:var(--simple-input-bg);padding:2px';

			var lines = alertsRaw.split('\n').filter(function(l) { return l.trim(); });
			if (lines.length === 0) {
				alertPre.innerHTML = '<div style="padding:20px;text-align:center;color:var(--simple-muted)">No alerts detected</div>';
			} else {
				lines.forEach(function(line) {
					var row = el('div', '');
					var priorityMatch = line.match(/Priority:\s*(\d)/);
					var priority = priorityMatch ? parseInt(priorityMatch[1]) : 3;
					var borderColor = priority === 1 ? '#ef4444' : priority === 2 ? '#f59e0b' : '#3b82f6';

					row.style.cssText = 'padding:8px 12px;margin:4px;border-radius:8px;font-size:0.78rem;font-family:monospace;' +
						'border-left:3px solid ' + borderColor + ';background:var(--simple-card-bg);color:var(--simple-text);' +
						'word-break:break-all;line-height:1.5';
					row.textContent = line;
					alertPre.appendChild(row);
				});
			}

			alertCard.appendChild(alertPre);
		} else {
			var emptyAlert = el('div', '');
			emptyAlert.style.cssText = 'padding:32px;text-align:center;border-radius:10px;background:var(--simple-input-bg)';
			emptyAlert.innerHTML = '<div style="width:48px;height:48px;margin:0 auto 12px;border-radius:50%;background:rgba(34,197,94,0.12);display:flex;align-items:center;justify-content:center">' +
				ic(SVG.shield, 24, '#22c55e') + '</div>' +
				'<div style="font-weight:600;color:var(--simple-text);margin-bottom:4px">No Alerts Detected</div>' +
				'<div style="font-size:0.82rem;color:var(--simple-muted)">Your network looks clean. Alerts will appear here when threats are detected.</div>';
			alertCard.appendChild(emptyAlert);
		}

		// Clear alerts button
		if (status.alerts > 0) {
			var clearRow = el('div', '');
			clearRow.style.cssText = 'margin-top:12px;display:flex;justify-content:flex-end';
			var clearBtn = el('button', 'simple-btn simple-btn-outline');
			clearBtn.style.cssText += ';color:#ef4444;border-color:#ef4444';
			clearBtn.innerHTML = ic(SVG.del, 14, '#ef4444') + ' Clear Alerts';
			clearBtn.onclick = function() {
				clearBtn.disabled = true;
				L.resolveDefault(callFileExec('/bin/sh', ['-c',
					'echo -n "" > /var/log/alert_fast.txt 2>/dev/null; echo OK'
				]), {}).then(function() {
					self.showToast('Alert log cleared');
					window.setTimeout(function() { location.reload(); }, 1000);
				});
			};
			clearRow.appendChild(clearBtn);
			alertCard.appendChild(clearRow);
		}

		root.appendChild(alertCard);

		return root;
	},

	pollRulesUpdate: function(btn, statusEl) {
		var self = this;
		var pollCount = 0;
		var maxPolls = 60;
		function check() {
			pollCount++;
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'if [ -f /tmp/snort_rules_update.lock ]; then echo RUNNING; ' +
				'elif [ -f /tmp/snort_rules_update.log ] && grep -q FINISHED /tmp/snort_rules_update.log 2>/dev/null; then echo DONE; ' +
				'else echo IDLE; fi'
			]), {}).then(function(res) {
				var st = (res && res.stdout) ? res.stdout.trim() : 'IDLE';
				if (st === 'RUNNING' && pollCount < maxPolls) {
					statusEl.innerHTML = '<span style="color:var(--simple-warning)">Downloading rules\u2026 (' + (pollCount * 5) + 's)</span>';
					window.setTimeout(check, 5000);
				} else if (st === 'DONE') {
					btn.disabled = false;
					btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:15px;height:15px;fill:currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg> Update Rules';
					statusEl.innerHTML = '<span style="color:var(--simple-success)">\u2713 Rules updated successfully</span>';
					L.resolveDefault(callFileExec('/bin/sh', ['-c',
						'rm -f /var/snort.d/*.tar.gz /tmp/snort*.tar.gz /tmp/snort_rules_update.log /tmp/snort_rules_update.lock 2>/dev/null'
					]), {});
				} else {
					btn.disabled = false;
					btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:15px;height:15px;fill:currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg> Update Rules';
					statusEl.innerHTML = pollCount >= maxPolls
						? '<span style="color:var(--simple-danger)">Update timed out</span>'
						: '';
				}
			});
		}
		window.setTimeout(check, 5000);
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
