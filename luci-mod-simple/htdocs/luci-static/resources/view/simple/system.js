'use strict';
'require view';
'require dom';
'require rpc';
'require uci';

var callSystemBoard = rpc.declare({ object: 'system', method: 'board', expect: { '': {} } });
var callSystemInfo = rpc.declare({ object: 'system', method: 'info', expect: { '': {} } });
var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });

var SVG = {
	cpu: '<svg viewBox="0 0 24 24"><path d="M15 21h-2v-2h2v2zm-4 0H9v-2h2v2zm8 0h-2v-2h2v2zM7 3v2H5v2H3V5c0-1.1.9-2 2-2h2zm12 0c1.1 0 2 .9 2 2v2h-2V5h-2V3h2zM5 19H3v-2h2v2zm0-4H3v-2h2v2zm0-4H3V9h2v2zm16 8h-2v2h2c1.1 0 2-.9 2-2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V9h-2v2zM7 21H5c-1.1 0-2-.9-2-2v-2h2v2h2v2zm4-18H9v2h2V3zm4 0h-2v2h2V3zm4 4H5v10h14V7z"/></svg>',
	clock: '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
	ipv6: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
	reboot: '<svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>',
	hostname: '<svg viewBox="0 0 24 24"><path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H5v-1h14v1zm0-3H5V8h14v8z"/></svg>',
	lan: '<svg viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>',
	logo: '<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
	sync: '<svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>'
};

function el(tag, cls, children) {
	if (arguments.length === 1 && typeof tag === 'string' && tag.charAt(0) === '<') {
		var w = document.createElement('span'); w.innerHTML = tag; return w.firstChild;
	}
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

function formatUptime(s) {
	if (!s) return '-';
	var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
	if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
	if (h > 0) return h + 'h ' + m + 'm';
	return m + 'm';
}

function formatBytes(b) {
	if (!b || b === 0) return '0 B';
	var u = ['B', 'KB', 'MB', 'GB'];
	var i = Math.floor(Math.log(b) / Math.log(1024));
	return (b / Math.pow(1024, i)).toFixed(1) + ' ' + u[i];
}

var TIMEZONES = [
	'UTC','US/Eastern','US/Central','US/Mountain','US/Pacific','US/Alaska','US/Hawaii',
	'America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Anchorage',
	'America/Toronto','America/Vancouver','America/Mexico_City','America/Sao_Paulo','America/Buenos_Aires',
	'Europe/London','Europe/Paris','Europe/Berlin','Europe/Madrid','Europe/Rome','Europe/Amsterdam',
	'Europe/Moscow','Europe/Istanbul','Europe/Athens','Europe/Warsaw','Europe/Stockholm',
	'Asia/Tokyo','Asia/Shanghai','Asia/Hong_Kong','Asia/Taipei','Asia/Seoul','Asia/Singapore',
	'Asia/Kolkata','Asia/Dubai','Asia/Bangkok','Asia/Jakarta','Asia/Manila',
	'Australia/Sydney','Australia/Melbourne','Australia/Perth','Australia/Brisbane',
	'Pacific/Auckland','Pacific/Fiji','Africa/Cairo','Africa/Johannesburg','Africa/Lagos'
];

return view.extend({
	load: function() {
		return Promise.all([
			callSystemBoard(),
			callSystemInfo(),
			uci.load('system'),
			uci.load('network'),
			uci.load('dhcp')
		]);
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	makeInfoRow: function(label, value) {
		var row = el('div', 'sys-info-row');
		row.appendChild(el('span', 'sys-info-label', label));
		row.appendChild(el('span', 'sys-info-value', value));
		return row;
	},

	render: function(data) {
		var self = this;
		var board = data[0] || {};
		var info = data[1] || {};
		var release = board.release || {};
		var mem = info.memory || {};
		var memTotal = mem.total || 0;
		var memUsed = memTotal - (mem.free||0) - (mem.buffered||0) - (mem.cached||0);
		var memPct = memTotal ? Math.round((memUsed / memTotal) * 100) : 0;
		var load = info.load || [0,0,0];
		var loadStr = (load[0]/65536).toFixed(2) + ' / ' + (load[1]/65536).toFixed(2) + ' / ' + (load[2]/65536).toFixed(2);

		var sysSect = null;
		uci.sections('system', 'system', function(s) { if (!sysSect) sysSect = s; });
		var sysName = sysSect ? sysSect['.name'] : '@system[0]';
		var curTimezone = sysSect ? (sysSect.zonename || sysSect.timezone || 'UTC') : 'UTC';

		var ipv6Disabled = false;
		uci.sections('network', 'globals', function(s) {
			if (s.ula_prefix === '' || s.ula_prefix === 'disabled') ipv6Disabled = true;
		});
		var wanIf = uci.get('network', 'wan6');
		var ipv6Enabled = !ipv6Disabled && !!wanIf;

		var root = el('div', 'simple-page');
		var cssLink = el('link'); cssLink.rel = 'stylesheet'; cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)';
		var iconDiv = el('div', 'tg-shield connected');
		iconDiv.innerHTML = icon(SVG.cpu, 40, '#fff');
		iconDiv.style.background = 'rgba(14,165,233,0.3)';
		iconDiv.style.boxShadow = '0 0 24px rgba(14,165,233,0.4)';
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text', board.hostname || 'OpenWrt'));
		hero.appendChild(el('div', 'tg-status-sub', (release.description || 'OpenWrt') + ' &bull; Uptime: ' + formatUptime(info.uptime)));

		var stats = el('div', 'tg-stats');
		var s1 = el('div', 'tg-stat');
		s1.appendChild(el('div', 'tg-stat-val', memPct + '%'));
		s1.appendChild(el('div', 'tg-stat-label', 'Memory'));
		stats.appendChild(s1);
		var s2 = el('div', 'tg-stat');
		s2.appendChild(el('div', 'tg-stat-val', loadStr.split('/')[0].trim()));
		s2.appendChild(el('div', 'tg-stat-label', 'Load Avg'));
		stats.appendChild(s2);
		var s3 = el('div', 'tg-stat');
		s3.appendChild(el('div', 'tg-stat-val', board.kernel || '-'));
		s3.appendChild(el('div', 'tg-stat-label', 'Kernel'));
		stats.appendChild(s3);
		hero.appendChild(stats);
		root.appendChild(hero);

		/* ── System Info Card ── */
		var infoCard = el('div', 'tg-config stor-card');
		var infoHdr = el('div', 'stor-card-hdr');
		infoHdr.innerHTML = icon(SVG.cpu, 20, 'var(--simple-accent)');
		infoHdr.appendChild(el('span', 'stor-card-title', 'System Information'));
		infoCard.appendChild(infoHdr);

		var infoBody = el('div', 'sys-info-body');
		infoBody.appendChild(this.makeInfoRow('Hostname', board.hostname || '-'));
		infoBody.appendChild(this.makeInfoRow('Model', board.model || '-'));
		infoBody.appendChild(this.makeInfoRow('Architecture', (board.system || '-')));
		infoBody.appendChild(this.makeInfoRow('Firmware', release.description || '-'));
		infoBody.appendChild(this.makeInfoRow('Kernel', board.kernel || '-'));
		infoBody.appendChild(this.makeInfoRow('Uptime', formatUptime(info.uptime)));
		infoBody.appendChild(this.makeInfoRow('Load Average', loadStr));

		var memRow = el('div', 'sys-info-row');
		memRow.appendChild(el('span', 'sys-info-label', 'Memory'));
		var memVal = el('div', 'sys-mem-wrap');
		var memBar = el('div', 'sys-mem-bar');
		var memFill = el('div', 'sys-mem-fill');
		memFill.style.width = memPct + '%';
		memFill.style.background = memPct > 85 ? '#ef4444' : memPct > 60 ? '#f59e0b' : '#10b981';
		memBar.appendChild(memFill);
		memVal.appendChild(memBar);
		memVal.appendChild(el('span', 'sys-mem-text', formatBytes(memUsed) + ' / ' + formatBytes(memTotal) + ' (' + memPct + '%)'));
		memRow.appendChild(memVal);
		infoBody.appendChild(memRow);

		infoCard.appendChild(infoBody);

		var infoActions = el('div', 'sys-card-actions');
		var rebootBtn = el('button', 'stor-eject-btn');
		rebootBtn.innerHTML = icon(SVG.reboot, 14, '#fff') + ' Reboot Router';
		rebootBtn.addEventListener('click', function() {
			if (confirm('Are you sure you want to reboot the router?')) {
				rpc.declare({ object: 'system', method: 'reboot' })().then(function() {
					self.showToast('Rebooting...');
				});
			}
		});
		infoActions.appendChild(rebootBtn);
		infoCard.appendChild(infoActions);
		root.appendChild(infoCard);

		/* ── Router Name Card ── */
		var nameCard = el('div', 'tg-config stor-card');
		var nameHdr = el('div', 'stor-card-hdr');
		nameHdr.innerHTML = icon(SVG.hostname, 20, 'var(--simple-accent)');
		nameHdr.appendChild(el('span', 'stor-card-title', 'Router Name'));
		nameCard.appendChild(nameHdr);

		var nameBody = el('div', 'sys-card-body');
		var nameFormRow = el('div', 'fw-form-row');
		nameFormRow.appendChild(el('label', 'fw-form-label', 'Hostname'));
		var nameInput = E('input', { type: 'text', 'class': 'fw-form-input', value: board.hostname || '' });
		nameFormRow.appendChild(nameInput);
		nameBody.appendChild(nameFormRow);
		nameCard.appendChild(nameBody);

		var nameActions = el('div', 'sys-card-actions');
		var nameSaveBtn = el('button', 'fw-save-btn');
		nameSaveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Save';
		nameSaveBtn.addEventListener('click', function() {
			var val = nameInput.value.trim();
			if (!val) { self.showToast('Hostname cannot be empty'); return; }
			uci.set('system', sysName, 'hostname', val);
			uci.save().then(function() { return uci.apply(); }).then(function() {
				self.showToast('Hostname saved!');
			});
		});
		nameActions.appendChild(nameSaveBtn);
		nameCard.appendChild(nameActions);
		root.appendChild(nameCard);

		/* ── LAN IP Card ── */
		var lanIp = uci.get('network', 'lan', 'ipaddr') || '192.168.1.1';
		var lanMask = uci.get('network', 'lan', 'netmask') || '255.255.255.0';

		var dhcpStart = '', dhcpLimit = '';
		uci.sections('dhcp', 'dhcp', function(s) {
			if (s.interface === 'lan') {
				dhcpStart = s.start || '100';
				dhcpLimit = s.limit || '150';
			}
		});
		var dhcpEnd = String(parseInt(dhcpStart, 10) + parseInt(dhcpLimit, 10) - 1);

		var lanCard = el('div', 'tg-config stor-card');
		var lanHdr = el('div', 'stor-card-hdr');
		lanHdr.innerHTML = icon(SVG.lan, 20, 'var(--simple-accent)');
		lanHdr.appendChild(el('span', 'stor-card-title', 'LAN IP Address'));
		lanCard.appendChild(lanHdr);

		var lanBody = el('div', 'sys-card-body');

		var lanHint = el('div', 'fw-hint');
		lanHint.innerHTML = icon(SVG.warning, 14, '#f59e0b') + ' Changing the LAN IP will disconnect you. You will need to reconnect using the new address.';
		lanBody.appendChild(lanHint);

		var ipRow = el('div', 'fw-form-row');
		ipRow.appendChild(el('label', 'fw-form-label', 'LAN IP Address'));
		var ipInput = E('input', { type: 'text', 'class': 'fw-form-input', value: lanIp, placeholder: '192.168.1.1' });
		ipRow.appendChild(ipInput);
		lanBody.appendChild(ipRow);

		var maskRow = el('div', 'fw-form-row');
		maskRow.appendChild(el('label', 'fw-form-label', 'Subnet Mask'));
		var maskSelect = document.createElement('select');
		maskSelect.className = 'fw-form-input';
		[['255.255.255.0', '255.255.255.0 (/24)'], ['255.255.0.0', '255.255.0.0 (/16)'], ['255.0.0.0', '255.0.0.0 (/8)']].forEach(function(m) {
			var opt = document.createElement('option');
			opt.value = m[0]; opt.textContent = m[1];
			if (m[0] === lanMask) opt.selected = true;
			maskSelect.appendChild(opt);
		});
		maskRow.appendChild(maskSelect);
		lanBody.appendChild(maskRow);

		var dhcpTitle = el('div', '');
		dhcpTitle.style.cssText = 'font-weight:600;font-size:13px;margin-top:16px;padding-top:16px;border-top:1px solid var(--simple-border);color:var(--simple-text)';
		dhcpTitle.textContent = 'DHCP Range';
		lanBody.appendChild(dhcpTitle);

		var dhcpDesc = el('div', '');
		dhcpDesc.style.cssText = 'font-size:12px;color:var(--simple-text-dim);margin-bottom:12px';
		dhcpDesc.textContent = 'IP address range assigned to devices on your network.';
		lanBody.appendChild(dhcpDesc);

		var startRow = el('div', 'fw-form-row');
		startRow.appendChild(el('label', 'fw-form-label', 'Start Address'));
		var startInput = E('input', { type: 'number', 'class': 'fw-form-input', value: dhcpStart, min: '2', max: '254', placeholder: '100' });
		startRow.appendChild(startInput);
		lanBody.appendChild(startRow);

		var endRow = el('div', 'fw-form-row');
		endRow.appendChild(el('label', 'fw-form-label', 'End Address'));
		var endInput = E('input', { type: 'number', 'class': 'fw-form-input', value: dhcpEnd, min: '2', max: '254', placeholder: '249' });
		endRow.appendChild(endInput);
		lanBody.appendChild(endRow);

		lanCard.appendChild(lanBody);

		var lanActions = el('div', 'sys-card-actions');
		var lanSaveBtn = el('button', 'fw-save-btn');
		lanSaveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Apply';
		lanSaveBtn.addEventListener('click', function() {
			var newIp = ipInput.value.trim();
			var newMask = maskSelect.value;
			var newStart = parseInt(startInput.value, 10);
			var newEnd = parseInt(endInput.value, 10);

			if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(newIp)) {
				self.showToast('Invalid IP address format');
				return;
			}
			var octets = newIp.split('.');
			for (var i = 0; i < 4; i++) {
				var v = parseInt(octets[i], 10);
				if (v < 0 || v > 255) { self.showToast('Invalid IP address'); return; }
			}
			if (isNaN(newStart) || newStart < 2 || newStart > 254) {
				self.showToast('DHCP start must be between 2 and 254');
				return;
			}
			if (isNaN(newEnd) || newEnd < newStart || newEnd > 254) {
				self.showToast('DHCP end must be between start and 254');
				return;
			}
			var newLimit = newEnd - newStart + 1;

			var changed = (newIp !== lanIp || newMask !== lanMask || String(newStart) !== String(dhcpStart) || String(newLimit) !== String(dhcpLimit));
			if (!changed) {
				self.showToast('No changes to apply');
				return;
			}

			var ipChanged = (newIp !== lanIp);
			var msg = ipChanged
				? 'Change LAN IP to ' + newIp + '?\n\nYou will be disconnected and need to reconnect at http://' + newIp + '/'
				: 'Apply DHCP range changes?';
			if (!confirm(msg)) return;

			lanSaveBtn.disabled = true;
			lanSaveBtn.innerHTML = 'Applying\u2026';

			uci.set('network', 'lan', 'ipaddr', newIp);
			uci.set('network', 'lan', 'netmask', newMask);

			uci.sections('dhcp', 'dhcp', function(s) {
				if (s.interface === 'lan') {
					uci.set('dhcp', s['.name'], 'start', String(newStart));
					uci.set('dhcp', s['.name'], 'limit', String(newLimit));
				}
			});

			uci.save().then(function() { return uci.apply(); }).then(function() {
				if (ipChanged) {
					self.showToast('LAN IP changed to ' + newIp + '. Redirecting\u2026');
					setTimeout(function() {
						window.location.href = 'http://' + newIp + '/cgi-bin/luci/';
					}, 3000);
				} else {
					self.showToast('DHCP settings saved!');
					lanSaveBtn.disabled = false;
					lanSaveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Apply';
				}
			}).catch(function() {
				if (ipChanged) {
					setTimeout(function() {
						window.location.href = 'http://' + newIp + '/cgi-bin/luci/';
					}, 3000);
				}
			});
		});
		lanActions.appendChild(lanSaveBtn);
		lanCard.appendChild(lanActions);
		root.appendChild(lanCard);

		/* ── Router Logo Card ── */
		var logoCard = el('div', 'tg-config stor-card');
		var logoHdr = el('div', 'stor-card-hdr');
		logoHdr.innerHTML = icon(SVG.logo, 20, 'var(--simple-accent)');
		logoHdr.appendChild(el('span', 'stor-card-title', 'Router Logo'));
		logoCard.appendChild(logoHdr);

		var logoBody = el('div', 'sys-card-body');
		var logoHint = el('div', 'fw-hint');
		logoHint.innerHTML = icon(SVG.hostname, 14, '#3b82f6') + ' Choose what appears in the header. You can display the hostname as text or use the Gulf logo.';
		logoBody.appendChild(logoHint);

		var curLogoMode = localStorage.getItem('gulf-logo-mode') || 'logo';

		var logoOpts = el('div', 'sys-logo-options');

		var optHostname = el('label', 'sys-logo-option' + (curLogoMode === 'hostname' ? ' selected' : ''));
		var radioH = E('input', { type: 'radio', name: 'logo-mode', value: 'hostname' });
		radioH.checked = (curLogoMode === 'hostname');
		optHostname.appendChild(radioH);
		var optHContent = el('div', 'sys-logo-opt-content');
		optHContent.appendChild(el('div', 'sys-logo-opt-title', 'Hostname'));
		optHContent.appendChild(el('div', 'sys-logo-opt-desc', 'Display the router hostname as text'));
		var optHPreview = el('div', 'sys-logo-preview sys-logo-preview-text');
		optHPreview.textContent = board.hostname || 'OpenWrt';
		optHContent.appendChild(optHPreview);
		optHostname.appendChild(optHContent);
		logoOpts.appendChild(optHostname);

		var optLogo = el('label', 'sys-logo-option' + (curLogoMode === 'logo' ? ' selected' : ''));
		var radioL = E('input', { type: 'radio', name: 'logo-mode', value: 'logo' });
		radioL.checked = (curLogoMode === 'logo');
		optLogo.appendChild(radioL);
		var optLContent = el('div', 'sys-logo-opt-content');
		optLContent.appendChild(el('div', 'sys-logo-opt-title', 'Gulf Logo'));
		optLContent.appendChild(el('div', 'sys-logo-opt-desc', 'Display the Gulf brand logo'));
		var optLPreview = el('div', 'sys-logo-preview');
		var isDark = document.documentElement.getAttribute('data-darkmode') === 'true';
		var previewImg = E('img', {
			src: L.resource('../gulf/gulf_logo_' + (isDark ? 'dark' : 'light') + '.png'),
			'class': 'sys-logo-preview-img'
		});
		optLPreview.appendChild(previewImg);
		optLContent.appendChild(optLPreview);
		optLogo.appendChild(optLContent);
		logoOpts.appendChild(optLogo);

		logoBody.appendChild(logoOpts);
		logoCard.appendChild(logoBody);

		function selectLogoOption(mode) {
			optHostname.classList.toggle('selected', mode === 'hostname');
			optLogo.classList.toggle('selected', mode === 'logo');
		}

		radioH.addEventListener('change', function() { selectLogoOption('hostname'); });
		radioL.addEventListener('change', function() { selectLogoOption('logo'); });

		var logoActions = el('div', 'sys-card-actions');
		var logoSaveBtn = el('button', 'fw-save-btn');
		logoSaveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Apply';
		logoSaveBtn.addEventListener('click', function() {
			var mode = radioL.checked ? 'logo' : 'hostname';
			localStorage.setItem('gulf-logo-mode', mode);
			self.applyHeaderLogo(mode, board.hostname);
			self.showToast('Logo updated!');
		});
		logoActions.appendChild(logoSaveBtn);
		logoCard.appendChild(logoActions);
		root.appendChild(logoCard);

		/* ── Timezone Card ── */
		var tzCard = el('div', 'tg-config stor-card');
		var tzHdr = el('div', 'stor-card-hdr');
		tzHdr.innerHTML = icon(SVG.clock, 20, 'var(--simple-accent)');
		tzHdr.appendChild(el('span', 'stor-card-title', 'Time Zone'));
		tzCard.appendChild(tzHdr);

		var tzBody = el('div', 'sys-card-body');

		var timeRow = el('div', 'sys-info-row');
		timeRow.appendChild(el('span', 'sys-info-label', 'Router Time'));
		timeRow.appendChild(el('span', 'sys-info-value', new Date((info.localtime || 0) * 1000).toLocaleString()));
		tzBody.appendChild(timeRow);

		var tzFormRow = el('div', 'fw-form-row');
		tzFormRow.appendChild(el('label', 'fw-form-label', 'Timezone'));
		var tzSelect = document.createElement('select');
		tzSelect.className = 'fw-form-input';
		TIMEZONES.forEach(function(tz) {
			var opt = document.createElement('option');
			opt.value = tz; opt.textContent = tz;
			if (tz === curTimezone) opt.selected = true;
			tzSelect.appendChild(opt);
		});
		tzFormRow.appendChild(tzSelect);
		tzBody.appendChild(tzFormRow);
		tzCard.appendChild(tzBody);

		var tzActions = el('div', 'sys-card-actions');
		var syncBtn = el('button', 'fw-add-btn');
		syncBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
		syncBtn.innerHTML = icon(SVG.sync, 14, '#fff') + ' Sync with Browser';
		syncBtn.addEventListener('click', function() {
			var now = new Date();
			var cmd = 'date -s "' + now.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '') + '"';
			L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
				self.showToast('Time synced with browser');
			});
		});
		tzActions.appendChild(syncBtn);

		var tzSaveBtn = el('button', 'fw-save-btn');
		tzSaveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Save Timezone';
		tzSaveBtn.addEventListener('click', function() {
			uci.set('system', sysName, 'zonename', tzSelect.value);
			uci.save().then(function() { return uci.apply(); }).then(function() {
				self.showToast('Timezone saved!');
			});
		});
		tzActions.appendChild(tzSaveBtn);
		tzCard.appendChild(tzActions);
		root.appendChild(tzCard);

		/* ── IPv6 Card ── */
		var ipv6Card = el('div', 'tg-config stor-card');
		var ipv6Hdr = el('div', 'stor-card-hdr');
		ipv6Hdr.innerHTML = icon(SVG.ipv6, 20, 'var(--simple-accent)');
		ipv6Hdr.appendChild(el('span', 'stor-card-title', 'IPv6'));
		ipv6Card.appendChild(ipv6Hdr);

		var ipv6Body = el('div', 'sys-card-body');
		var ipv6Warn = el('div', 'fw-hint');
		ipv6Warn.innerHTML = icon(SVG.warning, 14, '#f59e0b') + ' If you use both VPN and IPv6 at the same time, it may cause IPv6 data leakage. The firewall, VPN, and some services may not fully support IPv6.';
		ipv6Body.appendChild(ipv6Warn);

		var ipv6Row = el('div', 'stor-share-row');
		var ipv6Left = el('div', 'stor-share-info');
		ipv6Left.appendChild(el('div', 'stor-share-name', 'Enable IPv6'));
		ipv6Left.appendChild(el('div', 'stor-share-desc', 'Enable or disable IPv6 networking on this router'));
		ipv6Row.appendChild(ipv6Left);
		var ipv6Toggle = el('label', 'dev-toggle');
		var ipv6Input = E('input', { type: 'checkbox' });
		ipv6Input.checked = ipv6Enabled;
		ipv6Toggle.appendChild(ipv6Input);
		ipv6Toggle.appendChild(el('span', 'dev-toggle-slider'));
		ipv6Row.appendChild(ipv6Toggle);
		ipv6Body.appendChild(ipv6Row);
		ipv6Card.appendChild(ipv6Body);

		var ipv6Actions = el('div', 'sys-card-actions');
		var ipv6SaveBtn = el('button', 'fw-save-btn');
		ipv6SaveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Apply';
		ipv6SaveBtn.addEventListener('click', function() {
			var en = ipv6Input.checked;
			if (en) {
				uci.set('network', 'globals', 'ula_prefix', 'fd00::/48');
			} else {
				uci.set('network', 'globals', 'ula_prefix', '');
			}
			uci.save().then(function() { return uci.apply(); }).then(function() {
				self.showToast('IPv6 ' + (en ? 'enabled' : 'disabled'));
			});
		});
		ipv6Actions.appendChild(ipv6SaveBtn);
		ipv6Card.appendChild(ipv6Actions);
		root.appendChild(ipv6Card);

		return root;
	},

	applyHeaderLogo: function(mode, hostname) {
		var brand = document.querySelector('header .brand');
		if (!brand) return;
		if (mode === 'logo') {
			var isDark = document.documentElement.getAttribute('data-darkmode') === 'true';
			var src = L.resource('../gulf/gulf_logo_' + (isDark ? 'dark' : 'light') + '.png');
			brand.innerHTML = '';
			var img = document.createElement('img');
			img.src = src;
			img.className = 'brand-logo-img';
			img.alt = 'Gulf';
			brand.appendChild(img);
		} else {
			brand.textContent = hostname || 'OpenWrt';
		}
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
