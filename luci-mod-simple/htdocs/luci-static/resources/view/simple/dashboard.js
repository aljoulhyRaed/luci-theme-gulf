'use strict';
'require view';
'require dom';
'require poll';
'require rpc';
'require uci';

var callSystemBoard = rpc.declare({ object: 'system', method: 'board', expect: { '': {} } });
var callSystemInfo = rpc.declare({ object: 'system', method: 'info', expect: { '': {} } });
var callNetIfDump = rpc.declare({ object: 'network.interface', method: 'dump', expect: { 'interface': [] } });
var callDHCPLeases = rpc.declare({ object: 'luci-rpc', method: 'getDHCPLeases', expect: { '': {} } });
var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });

var SVG = {
	router: '<svg viewBox="0 0 24 24"><path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H5v-1h14v1zm0-3H5V8h14v8z"/></svg>',
	cpu: '<svg viewBox="0 0 24 24"><path d="M15 21h-2v-2h2v2zm-4 0H9v-2h2v2zm8 0h-2v-2h2v2zM7 3v2H5v2H3V5c0-1.1.9-2 2-2h2zm12 0c1.1 0 2 .9 2 2v2h-2V5h-2V3h2zM5 19H3v-2h2v2zm0-4H3v-2h2v2zm0-4H3V9h2v2zm16 8h-2v2h2c1.1 0 2-.9 2-2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V9h-2v2zM7 21H5c-1.1 0-2-.9-2-2v-2h2v2h2v2zm4-18H9v2h2V3zm4 0h-2v2h2V3zm4 4H5v10h14V7z"/></svg>',
	net: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
	wifi: '<svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
	vpn: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
	devices: '<svg viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>',
	firewall: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
	dns: '<svg viewBox="0 0 24 24"><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.68 1.5 1.5S7.83 8.5 7 8.5z"/></svg>',
	system: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
	software: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
	password: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>',
	storage: '<svg viewBox="0 0 24 24"><path d="M20 6H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H4V8h16v8zm-2-1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-3 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/></svg>',
	mesh: '<svg viewBox="0 0 24 24"><path d="M17 16l-4-4V8.82C14.16 8.4 15 7.3 15 6c0-1.66-1.34-3-3-3S9 4.34 9 6c0 1.3.84 2.4 2 2.82V12l-4 4H3v5h5v-3.05l4-4.2 4 4.2V21h5v-5h-4z"/></svg>',
	arrowUp: '<svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>',
	arrowDown: '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	x: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
	usb: '<svg viewBox="0 0 24 24"><path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.22.99 2.2 2.2 2.2 1.21 0 2.2-.98 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/></svg>',
	laptop: '<svg viewBox="0 0 24 24"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>',
	phone: '<svg viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>'
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

function formatUptime(s) {
	if (!s) return '-';
	var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
	if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
	if (h > 0) return h + 'h ' + m + 'm';
	return m + 'm';
}

function formatBytes(b) {
	if (!b || b === 0) return '0 B';
	var u = ['B', 'KB', 'MB', 'GB', 'TB'];
	var i = Math.floor(Math.log(b) / Math.log(1024));
	return (b / Math.pow(1024, i)).toFixed(1) + ' ' + u[i];
}

function gaugeRing(pct, color) {
	var r = 38, cx = 50, cy = 50, sw = 7;
	var c = 2 * Math.PI * r;
	var off = c - (pct / 100) * c;
	return '<svg viewBox="0 0 100 100" class="sd-gauge-svg">' +
		'<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="rgba(100,100,120,0.1)" stroke-width="' + sw + '"/>' +
		'<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" ' +
		'stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" stroke-linecap="round" transform="rotate(-90 ' + cx + ' ' + cy + ')" style="transition:stroke-dashoffset 0.6s"/>' +
		'<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central" class="sd-gauge-pct">' + Math.round(pct) + '%</text>' +
		'</svg>';
}

function statusDot(up) {
	return '<span class="sd-dot" style="background:' + (up ? '#10b981' : '#ef4444') + '"></span>';
}

function guessDeviceIcon(hostname) {
	var h = (hostname || '').toLowerCase();
	if (h.indexOf('iphone') >= 0 || h.indexOf('android') >= 0 || h.indexOf('pixel') >= 0 || h.indexOf('galaxy') >= 0 || h.indexOf('phone') >= 0)
		return SVG.phone;
	return SVG.laptop;
}

return view.extend({
	load: function() {
		return Promise.all([
			callSystemBoard(),
			callSystemInfo(),
			L.resolveDefault(callNetIfDump(), []),
			L.resolveDefault(callDHCPLeases(), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				"WG_FOUND=0; " +
				"for iface in $(ip -o link show type wireguard 2>/dev/null | awk -F: '{print $2}' | tr -d ' '); do " +
				"  wg show $iface 2>/dev/null && echo '---WG_IF_END---'; WG_FOUND=1; " +
				"done; " +
				"if [ $WG_FOUND -eq 0 ]; then " +
				"  ip link show wg 2>/dev/null | grep -q UP && wg show wg 2>/dev/null && echo '---WG_IF_END---'; " +
				"fi; " +
				"ip link show tun0 2>/dev/null | head -1 | grep -q UP && echo 'OVPN_ACTIVE:tun0'; " +
				"pidof sing-box >/dev/null 2>&1 && echo 'V2RAY_ACTIVE:sing-box'; " +
				"echo '===VPN_DONE==='"
			]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				"cat /proc/mounts 2>/dev/null | grep -E '^/dev/(sd|mmcblk|nvme)' | head -10; echo '===STOR_DONE==='"
			]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				"iwinfo 2>/dev/null | grep -E 'ESSID|Signal|Mode|Channel' | head -40; echo '===WIFI_DONE==='"
			]), {}),
		L.resolveDefault(callFileExec('/bin/sh', ['-c',
				"for d in $(ls /sys/class/net/); do " +
				"  [ -f /sys/class/net/$d/statistics/rx_bytes ] && " +
				"  echo \"$d $(cat /sys/class/net/$d/statistics/rx_bytes) $(cat /sys/class/net/$d/statistics/tx_bytes)\"; " +
				"done 2>/dev/null; echo '===NET_DONE==='"
			]), {}),
		L.resolveDefault(callFileExec('/bin/sh', ['-c',
				"grep -c ^processor /proc/cpuinfo 2>/dev/null || echo 1"
			]), {})
		]);
	},

	render: function(data) {
		var board = data[0] || {};
		var info = data[1] || {};
		var ifaces = data[2] || [];
		var leaseData = data[3] || {};
		var leases = leaseData.dhcp_leases || [];
		var vpnOut = (data[4] && data[4].stdout) || '';
		var storOut = (data[5] && data[5].stdout) || '';
		var wifiOut = (data[6] && data[6].stdout) || '';
		var netStatsOut = (data[7] && data[7].stdout) || '';
		var cpuCores = parseInt((data[8] && data[8].stdout || '').trim()) || 1;

		var release = board.release || {};
		var mem = info.memory || {};
		var memTotal = mem.total || 1;
		var memUsed = memTotal - (mem.free||0) - (mem.buffered||0) - (mem.cached||0);
		var memPct = Math.round((memUsed / memTotal) * 100);
		var load = info.load || [0,0,0];
		var loadPct = Math.min(100, Math.round((load[0] / 65536 / cpuCores) * 100));

		var wanIf = null, wanUp = false, wanIP = '-', wanProto = '-';
		var wanRx = 0, wanTx = 0;
		var wanCandidates = ['wan', 'wwan', 'wwan0', 'wan6'];
		ifaces.forEach(function(i) {
			var name = i.interface || '';
			var isWanLike = wanCandidates.indexOf(name) >= 0 ||
				name.indexOf('wan') >= 0 || name.indexOf('wwan') >= 0;
			if (!isWanLike) return;
			if (!wanIf || (i.up && !wanIf.up) || (name === 'wan' && !wanIf.up)) {
				wanIf = i;
				wanUp = i.up || false;
				wanProto = i.proto || '-';
				var addrs = i['ipv4-address'] || [];
				if (addrs.length > 0) wanIP = addrs[0].address || '-';
			}
		});
		if (wanIf && wanIf.statistics) {
			wanRx = wanIf.statistics.rx_bytes || 0;
			wanTx = wanIf.statistics.tx_bytes || 0;
		}
		// Fallback: read device-level stats if interface stats are zero
		if (wanIf && (wanRx === 0 && wanTx === 0)) {
			var wanDev = wanIf.l3_device || wanIf.device || '';
			if (wanDev && netStatsOut) {
				netStatsOut.split('\n').forEach(function(line) {
					var p = line.trim().split(/\s+/);
					if (p[0] === wanDev && p.length >= 3) {
						wanRx = parseInt(p[1]) || 0;
						wanTx = parseInt(p[2]) || 0;
					}
				});
			}
		}

		// Parse VPN info
		var vpnActive = false, vpnPeers = 0, vpnIface = '-', vpnType = 'WireGuard';
		if (vpnOut.indexOf('interface:') >= 0 || vpnOut.indexOf('public key:') >= 0) {
			vpnActive = true;
			var peerMatches = vpnOut.match(/peer:/g);
			vpnPeers = peerMatches ? peerMatches.length : 0;
			var ifMatch = vpnOut.match(/interface:\s*(\S+)/);
			vpnIface = ifMatch ? ifMatch[1] : 'wg';
			vpnType = 'WireGuard';
		}
		if (!vpnActive && vpnOut.indexOf('OVPN_ACTIVE:') >= 0) {
			vpnActive = true;
			vpnIface = 'tun0';
			vpnType = 'OpenVPN';
		}
		if (!vpnActive && vpnOut.indexOf('V2RAY_ACTIVE:') >= 0) {
			vpnActive = true;
			vpnIface = 'sing-box';
			vpnType = 'V2Ray';
		}

		// Parse Storage info
		var storMounts = [];
		storOut.split('\n').forEach(function(line) {
			if (line.indexOf('===') >= 0 || !line.trim()) return;
			var parts = line.trim().split(/\s+/);
			if (parts.length >= 3)
				storMounts.push({ dev: parts[0], mount: parts[1], fs: parts[2] });
		});

		// Parse Wi-Fi info
		var wifiNetworks = [];
		var curNet = null;
		wifiOut.split('\n').forEach(function(line) {
			if (line.indexOf('===') >= 0) return;
			var essidM = line.match(/ESSID:\s*"([^"]*)"/);
			if (essidM) {
				if (curNet && curNet.ssid) wifiNetworks.push(curNet);
				curNet = { ssid: essidM[1] };
			}
			if (!curNet) return;
			var modeM = line.match(/Mode:\s*(\S+)/);
			if (modeM) curNet.mode = modeM[1];
			var chanM = line.match(/Channel:\s*(\d+)/);
			if (chanM) curNet.channel = chanM[1];
			var sigM = line.match(/Signal:\s*(-?\d+)/);
			if (sigM) curNet.signal = parseInt(sigM[1]);
		});
		if (curNet && curNet.ssid) wifiNetworks.push(curNet);

		var root = el('div', 'simple-page');
		var cssLink = el('link'); cssLink.rel = 'stylesheet'; cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'sd-hero-compact');
		var heroIcon = el('div', 'sd-hero-icon');
		heroIcon.innerHTML = icon(SVG.router, 24, '#fff');
		hero.appendChild(heroIcon);
		hero.appendChild(el('div', 'sd-hero-title', 'Dashboard'));
		var heroRight = el('div', 'sd-hero-meta');
		heroRight.innerHTML = (board.hostname || 'OpenWrt') + ' &bull; ' + formatUptime(info.uptime);
		hero.appendChild(heroRight);
		root.appendChild(hero);

		/* ── Row 1: Internet + Wi-Fi ── */
		var row1 = el('div', 'sd-card-row');

		// Internet connectivity card
		var inetCard = el('div', 'sd-feature-card');
		var inetHdr = el('div', 'sd-fcard-hdr');
		var inetIcon = el('div', 'sd-fcard-icon');
		inetIcon.innerHTML = icon(SVG.net, 22, '#fff');
		inetIcon.style.background = wanUp ? '#10b981' : '#ef4444';
		inetHdr.appendChild(inetIcon);
		var inetTitles = el('div', 'sd-fcard-titles');
		inetTitles.appendChild(el('div', 'sd-fcard-title', 'Internet'));
		inetTitles.appendChild(el('div', 'sd-fcard-subtitle', wanUp ? 'Connected' : 'Disconnected'));
		inetHdr.appendChild(inetTitles);
		var inetBadge = el('div', 'sd-badge ' + (wanUp ? 'sd-badge-green' : 'sd-badge-red'));
		inetBadge.textContent = wanUp ? 'Online' : 'Offline';
		inetHdr.appendChild(inetBadge);
		inetCard.appendChild(inetHdr);

		var inetBody = el('div', 'sd-fcard-body');
		var wanName = wanIf ? wanIf.interface : '-';
		var inetRows = [
			['WAN IP', wanUp ? wanIP : 'N/A'],
			['Interface', wanName.toUpperCase()],
			['Protocol', wanProto ? wanProto.toUpperCase() : '-'],
			['Download', formatBytes(wanRx)],
			['Upload', formatBytes(wanTx)]
		];
		inetRows.forEach(function(r) {
			var row = el('div', 'sd-info-row');
			row.appendChild(el('span', 'sd-info-label', r[0]));
			row.appendChild(el('span', 'sd-info-value', r[1]));
			inetBody.appendChild(row);
		});
		inetCard.appendChild(inetBody);

		var inetFooter = el('div', 'sd-fcard-footer');
		var inetLink = el('a', 'sd-fcard-link');
		inetLink.href = L.url('admin/simple-internet/connection');
		inetLink.textContent = 'Connection Settings';
		inetFooter.appendChild(inetLink);
		inetCard.appendChild(inetFooter);
		row1.appendChild(inetCard);

		// Wi-Fi card
		var wifiCard = el('div', 'sd-feature-card');
		var wifiHdr = el('div', 'sd-fcard-hdr');
		var wifiIcon = el('div', 'sd-fcard-icon');
		wifiIcon.innerHTML = icon(SVG.wifi, 22, '#fff');
		wifiIcon.style.background = '#3b82f6';
		wifiHdr.appendChild(wifiIcon);
		var wifiTitles = el('div', 'sd-fcard-titles');
		wifiTitles.appendChild(el('div', 'sd-fcard-title', 'Wi-Fi'));
		wifiTitles.appendChild(el('div', 'sd-fcard-subtitle', wifiNetworks.length > 0 ? wifiNetworks.length + ' network' + (wifiNetworks.length > 1 ? 's' : '') + ' active' : 'No radios detected'));
		wifiHdr.appendChild(wifiTitles);
		if (wifiNetworks.length > 0) {
			var wifiBadge = el('div', 'sd-badge sd-badge-blue');
			wifiBadge.textContent = 'Active';
			wifiHdr.appendChild(wifiBadge);
		}
		wifiCard.appendChild(wifiHdr);

		var wifiBody = el('div', 'sd-fcard-body');
		if (wifiNetworks.length > 0) {
			wifiNetworks.forEach(function(net) {
				var row = el('div', 'sd-info-row');
				row.appendChild(el('span', 'sd-info-label', net.ssid || '(hidden)'));
				var parts = [];
				if (net.mode) parts.push(net.mode);
				if (net.channel) parts.push('Ch ' + net.channel);
				if (net.signal) parts.push(net.signal + ' dBm');
				row.appendChild(el('span', 'sd-info-value', parts.join(' / ') || '-'));
				wifiBody.appendChild(row);
			});
		} else {
			var emptyWifi = el('div', 'sd-empty-msg');
			emptyWifi.innerHTML = icon(SVG.wifi, 28, 'var(--simple-text-sub)');
			emptyWifi.appendChild(el('span', '', ' No Wi-Fi adapters found'));
			wifiBody.appendChild(emptyWifi);
		}
		wifiCard.appendChild(wifiBody);

		var wifiFooter = el('div', 'sd-fcard-footer');
		var wifiLink = el('a', 'sd-fcard-link');
		wifiLink.href = L.url('admin/simple-wifi/networks');
		wifiLink.textContent = 'Wi-Fi Settings';
		wifiFooter.appendChild(wifiLink);
		wifiCard.appendChild(wifiFooter);
		row1.appendChild(wifiCard);

		root.appendChild(row1);

		/* ── Row 2: VPN + Storage ── */
		var row2 = el('div', 'sd-card-row');

		// VPN card
		var vpnCard = el('div', 'sd-feature-card');
		var vpnHdr = el('div', 'sd-fcard-hdr');
		var vpnIconEl = el('div', 'sd-fcard-icon');
		vpnIconEl.innerHTML = icon(SVG.vpn, 22, '#fff');
		vpnIconEl.style.background = vpnActive ? '#7c3aed' : '#64748b';
		vpnHdr.appendChild(vpnIconEl);
		var vpnTitles = el('div', 'sd-fcard-titles');
		vpnTitles.appendChild(el('div', 'sd-fcard-title', 'VPN'));
		vpnTitles.appendChild(el('div', 'sd-fcard-subtitle', vpnActive ? vpnType + ' tunnel active' : 'No active tunnels'));
		vpnHdr.appendChild(vpnTitles);
		var vpnBadge = el('div', 'sd-badge ' + (vpnActive ? 'sd-badge-purple' : 'sd-badge-gray'));
		vpnBadge.textContent = vpnActive ? 'Protected' : 'Inactive';
		vpnHdr.appendChild(vpnBadge);
		vpnCard.appendChild(vpnHdr);

		var vpnBody = el('div', 'sd-fcard-body');
		if (vpnActive) {
			var vpnRows = [['Interface', vpnIface], ['Type', vpnType]];
			if (vpnType === 'WireGuard' && vpnPeers > 0)
				vpnRows.splice(1, 0, ['Peers', String(vpnPeers)]);
			vpnRows.forEach(function(r) {
				var row = el('div', 'sd-info-row');
				row.appendChild(el('span', 'sd-info-label', r[0]));
				row.appendChild(el('span', 'sd-info-value', r[1]));
				vpnBody.appendChild(row);
			});
		} else {
			var emptyVPN = el('div', 'sd-empty-msg');
			emptyVPN.innerHTML = icon(SVG.vpn, 28, 'var(--simple-text-sub)');
			emptyVPN.appendChild(el('span', '', ' No VPN tunnels configured'));
			vpnBody.appendChild(emptyVPN);
		}
		vpnCard.appendChild(vpnBody);

		var vpnFooter = el('div', 'sd-fcard-footer');
		var vpnLink = el('a', 'sd-fcard-link');
		vpnLink.href = L.url('admin/simple-vpn/status');
		vpnLink.textContent = 'VPN Settings';
		vpnFooter.appendChild(vpnLink);
		vpnCard.appendChild(vpnFooter);
		row2.appendChild(vpnCard);

		// Storage card
		var storCard = el('div', 'sd-feature-card');
		var storHdr = el('div', 'sd-fcard-hdr');
		var storIconEl = el('div', 'sd-fcard-icon');
		storIconEl.innerHTML = icon(SVG.storage, 22, '#fff');
		storIconEl.style.background = storMounts.length > 0 ? '#f97316' : '#64748b';
		storHdr.appendChild(storIconEl);
		var storTitles = el('div', 'sd-fcard-titles');
		storTitles.appendChild(el('div', 'sd-fcard-title', 'Storage'));
		storTitles.appendChild(el('div', 'sd-fcard-subtitle', storMounts.length > 0 ? storMounts.length + ' device' + (storMounts.length > 1 ? 's' : '') + ' mounted' : 'No storage detected'));
		storHdr.appendChild(storTitles);
		if (storMounts.length > 0) {
			var storBadge = el('div', 'sd-badge sd-badge-orange');
			storBadge.textContent = storMounts.length + ' Mounted';
			storHdr.appendChild(storBadge);
		}
		storCard.appendChild(storHdr);

		var storBody = el('div', 'sd-fcard-body');
		if (storMounts.length > 0) {
			storMounts.forEach(function(m) {
				var row = el('div', 'sd-info-row');
				row.appendChild(el('span', 'sd-info-label', m.dev.replace('/dev/', '')));
				row.appendChild(el('span', 'sd-info-value', m.mount + ' (' + m.fs + ')'));
				storBody.appendChild(row);
			});
		} else {
			var emptyStor = el('div', 'sd-empty-msg');
			emptyStor.innerHTML = icon(SVG.usb, 28, 'var(--simple-text-sub)');
			emptyStor.appendChild(el('span', '', ' No USB or external storage'));
			storBody.appendChild(emptyStor);
		}
		storCard.appendChild(storBody);

		var storFooter = el('div', 'sd-fcard-footer');
		var storLink = el('a', 'sd-fcard-link');
		storLink.href = L.url('admin/simple-devices/storage');
		storLink.textContent = 'Storage Settings';
		storFooter.appendChild(storLink);
		storCard.appendChild(storFooter);
		row2.appendChild(storCard);

		root.appendChild(row2);

		/* ── Gauge Cards ── */
		var gaugeRow = el('div', 'sd-gauge-row');

		var cpuCard = el('div', 'sd-gauge-card');
		cpuCard.innerHTML = gaugeRing(loadPct, loadPct > 80 ? '#ef4444' : loadPct > 50 ? '#f59e0b' : '#10b981');
		cpuCard.appendChild(el('div', 'sd-gauge-label', 'CPU Load'));
		cpuCard.appendChild(el('div', 'sd-gauge-sub', (load[0]/65536).toFixed(2) + ' / ' + (load[1]/65536).toFixed(2) + ' / ' + (load[2]/65536).toFixed(2)));
		gaugeRow.appendChild(cpuCard);

		var memCard = el('div', 'sd-gauge-card');
		memCard.innerHTML = gaugeRing(memPct, memPct > 85 ? '#ef4444' : memPct > 60 ? '#f59e0b' : '#10b981');
		memCard.appendChild(el('div', 'sd-gauge-label', 'Memory'));
		memCard.appendChild(el('div', 'sd-gauge-sub', formatBytes(memUsed) + ' / ' + formatBytes(memTotal)));
		gaugeRow.appendChild(memCard);

		var trafficCard = el('div', 'sd-gauge-card');
		var trafficInner = el('div', 'sd-traffic-inner');
		var txRow = el('div', 'sd-traffic-row');
		txRow.innerHTML = icon(SVG.arrowUp, 14, '#10b981');
		txRow.appendChild(el('span', 'sd-traffic-label', 'TX'));
		txRow.appendChild(el('span', 'sd-traffic-val', formatBytes(wanTx)));
		trafficInner.appendChild(txRow);
		var rxRow = el('div', 'sd-traffic-row');
		rxRow.innerHTML = icon(SVG.arrowDown, 14, '#3b82f6');
		rxRow.appendChild(el('span', 'sd-traffic-label', 'RX'));
		rxRow.appendChild(el('span', 'sd-traffic-val', formatBytes(wanRx)));
		trafficInner.appendChild(rxRow);
		trafficCard.appendChild(trafficInner);
		trafficCard.appendChild(el('div', 'sd-gauge-label', 'WAN Traffic'));
		var wanLabel = wanUp ? (wanIf ? wanIf.interface.toUpperCase() : 'Connected') : 'Disconnected';
		trafficCard.appendChild(el('div', 'sd-gauge-sub', wanLabel));
		gaugeRow.appendChild(trafficCard);

		root.appendChild(gaugeRow);

		/* ── Connected Clients ── */
		var clientCard = el('div', 'sd-feature-card');
		var clientHdr = el('div', 'sd-fcard-hdr');
		var clientIcon = el('div', 'sd-fcard-icon');
		clientIcon.innerHTML = icon(SVG.devices, 22, '#fff');
		clientIcon.style.background = '#f59e0b';
		clientHdr.appendChild(clientIcon);
		var clientTitles = el('div', 'sd-fcard-titles');
		clientTitles.appendChild(el('div', 'sd-fcard-title', 'Connected Clients'));
		clientTitles.appendChild(el('div', 'sd-fcard-subtitle', leases.length + ' device' + (leases.length !== 1 ? 's' : '') + ' on the network'));
		clientHdr.appendChild(clientTitles);
		var clientBadge = el('div', 'sd-badge sd-badge-amber');
		clientBadge.textContent = leases.length + ' Active';
		clientHdr.appendChild(clientBadge);
		clientCard.appendChild(clientHdr);

		var clientBody = el('div', 'sd-fcard-body sd-client-list');
		if (leases.length > 0) {
			leases.slice(0, 20).forEach(function(lease) {
				var hostname = lease.hostname || 'Unknown';
				var ip = lease.ipaddr || '-';
				var mac = lease.macaddr || '-';

				var item = el('div', 'sd-client-item');
				var devIcon = el('div', 'sd-client-icon');
				devIcon.innerHTML = icon(guessDeviceIcon(hostname), 18, 'var(--simple-text-sub)');
				item.appendChild(devIcon);

				var info = el('div', 'sd-client-info');
				info.appendChild(el('div', 'sd-client-name', hostname));
				info.appendChild(el('div', 'sd-client-meta', ip + ' &bull; ' + mac.toUpperCase()));
				item.appendChild(info);

				clientBody.appendChild(item);
			});
			if (leases.length > 20) {
				clientBody.appendChild(el('div', 'sd-client-more', '+ ' + (leases.length - 20) + ' more devices'));
			}
		} else {
			var emptyClients = el('div', 'sd-empty-msg');
			emptyClients.innerHTML = icon(SVG.devices, 28, 'var(--simple-text-sub)');
			emptyClients.appendChild(el('span', '', ' No clients connected'));
			clientBody.appendChild(emptyClients);
		}
		clientCard.appendChild(clientBody);

		var clientFooter = el('div', 'sd-fcard-footer');
		var clientLink = el('a', 'sd-fcard-link');
		clientLink.href = L.url('admin/simple-devices/clients');
		clientLink.textContent = 'Manage Devices';
		clientFooter.appendChild(clientLink);
		clientCard.appendChild(clientFooter);
		root.appendChild(clientCard);

		/* ── Quick Access ── */
		var qaCard = el('div', 'sd-feature-card');
		var qaHdr = el('div', 'sd-fcard-hdr');
		var qaIcon = el('div', 'sd-fcard-icon');
		qaIcon.innerHTML = icon(SVG.system, 22, '#fff');
		qaIcon.style.background = '#6366f1';
		qaHdr.appendChild(qaIcon);
		var qaTitles = el('div', 'sd-fcard-titles');
		qaTitles.appendChild(el('div', 'sd-fcard-title', 'Quick Access'));
		qaTitles.appendChild(el('div', 'sd-fcard-subtitle', 'Common settings'));
		qaHdr.appendChild(qaTitles);
		qaCard.appendChild(qaHdr);

		var qaGrid = el('div', 'sd-qa-grid');
		var links = [
			{ icon: SVG.wifi, color: '#3b82f6', label: 'Wi-Fi', desc: 'Manage wireless networks', path: 'admin/simple-wifi/networks' },
			{ icon: SVG.mesh, color: '#10b981', label: 'Mesh', desc: 'Batman-adv mesh setup', path: 'admin/simple-wifi/mesh' },
			{ icon: SVG.net, color: '#0ea5e9', label: 'Internet', desc: 'WAN & connection settings', path: 'admin/simple-internet/connection' },
			{ icon: SVG.firewall, color: '#ef4444', label: 'Firewall', desc: 'Ports & DMZ rules', path: 'admin/simple-internet/firewall' },
			{ icon: SVG.vpn, color: '#7c3aed', label: 'VPN', desc: 'Tunnel status & config', path: 'admin/simple-vpn/status' },
			{ icon: SVG.devices, color: '#f59e0b', label: 'Clients', desc: 'Connected devices', path: 'admin/simple-devices/clients' },
			{ icon: SVG.storage, color: '#f97316', label: 'Storage', desc: 'USB & file sharing', path: 'admin/simple-devices/storage' },
			{ icon: SVG.dns, color: '#10b981', label: 'DNS', desc: 'Custom DNS servers', path: 'admin/simple-system/dns' },
			{ icon: SVG.system, color: '#6366f1', label: 'System', desc: 'Info & timezone', path: 'admin/simple-system/info' },
			{ icon: SVG.password, color: '#8b5cf6', label: 'Password', desc: 'Change admin password', path: 'admin/simple-system/password' },
			{ icon: SVG.software, color: '#4f46e5', label: 'Software', desc: 'Install packages', path: 'admin/simple-system/software' }
		];

		links.forEach(function(lk) {
			var item = el('a', 'sd-qa-item');
			item.href = L.url(lk.path);
			var ic = el('div', 'sd-qa-icon');
			ic.innerHTML = icon(lk.icon, 22, '#fff');
			ic.style.background = lk.color;
			item.appendChild(ic);
			var qinfo = el('div', 'sd-qa-info');
			qinfo.appendChild(el('div', 'sd-qa-name', lk.label));
			qinfo.appendChild(el('div', 'sd-qa-desc', lk.desc));
			item.appendChild(qinfo);
			qaGrid.appendChild(item);
		});

		qaCard.appendChild(qaGrid);
		root.appendChild(qaCard);

		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
