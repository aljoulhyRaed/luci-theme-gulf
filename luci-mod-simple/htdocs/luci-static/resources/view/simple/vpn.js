'use strict';
'require view';
'require dom';
'require rpc';
'require poll';

var callNetIfStatus = rpc.declare({ object: 'network.interface', method: 'dump', expect: { 'interface': [] } });
var callUciGet = rpc.declare({ object: 'uci', method: 'get', params: ['config'], expect: { 'values': {} } });
var callExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'], expect: { stdout: '' } });

var SVG = {
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.54-3.12 8.78-7 9.88-3.88-1.1-7-5.34-7-9.88V6.3l7-3.12z"/><path d="M10 12.5l-2-2-1.41 1.41L10 15.32l7-7-1.41-1.41z"/></svg>',
	wg: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
	ovpn: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>',
	v2ray: '<svg viewBox="0 0 24 24"><path d="M12 2L2 19.5h20L12 2zm0 4l7 12H5l7-12z"/></svg>',
	arrow: '<svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>'
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

function formatUptime(s) {
	s = parseInt(s) || 0;
	var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
	if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
	if (h > 0) return h + 'h ' + m + 'm';
	return m + 'm';
}

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callUciGet('network'), {}),
			L.resolveDefault(callNetIfStatus(), []),
			L.resolveDefault(callUciGet('tgwireguard2_cfg'), {}),
			L.resolveDefault(callUciGet('tgwireguard_cfg'), {}),
			L.resolveDefault(callUciGet('tgopenvpn_cfg'), {}),
			L.resolveDefault(callUciGet('tgv2ray'), {}),
			L.resolveDefault(callExec('/bin/sh', ['-c',
				'echo "WG:$(ip link show wg 2>/dev/null | head -1)"; ' +
				'echo "TUN:$(ip link show tun0 2>/dev/null | head -1)"; ' +
				'echo "SING:$(pidof sing-box 2>/dev/null)"; ' +
				'echo "---WG_TRANSFER---"; ' +
				'wg show wg transfer 2>/dev/null; ' +
				'echo "---SYSFS---"; ' +
				'cat /sys/class/net/wg/statistics/rx_bytes 2>/dev/null || echo 0; echo; ' +
				'cat /sys/class/net/wg/statistics/tx_bytes 2>/dev/null || echo 0; echo; ' +
				'cat /sys/class/net/tun0/statistics/rx_bytes 2>/dev/null || echo 0; echo; ' +
				'cat /sys/class/net/tun0/statistics/tx_bytes 2>/dev/null || echo 0'
			]), '')
		]);
	},

	parseStatus: function(raw) {
		raw = raw || '';
		var lines = raw.trim().split('\n');
		var result = { wgUp: false, tunUp: false, singUp: false, wgRx: 0, wgTx: 0, tunRx: 0, tunTx: 0 };
		lines.forEach(function(l) {
			l = l.trim();
			if (l.indexOf('WG:') === 0 && l.length > 3) result.wgUp = l.indexOf('UP') !== -1 || l.indexOf('state UP') !== -1;
			if (l.indexOf('TUN:') === 0 && l.length > 4) result.tunUp = l.indexOf('UP') !== -1 || l.indexOf('state UP') !== -1 || l.indexOf('UNKNOWN') !== -1;
			if (l.indexOf('SING:') === 0 && l.length > 5) result.singUp = true;
		});

		var transferSection = (raw.split('---WG_TRANSFER---')[1] || '').split('---SYSFS---')[0] || '';
		transferSection.trim().split('\n').forEach(function(line) {
			var parts = line.trim().split(/\t/);
			if (parts.length >= 3) {
				result.wgRx += parseInt(parts[1]) || 0;
				result.wgTx += parseInt(parts[2]) || 0;
			}
		});

		var sysfsSection = raw.split('---SYSFS---')[1] || '';
		var sysfsNums = sysfsSection.trim().split('\n').map(function(n) { return parseInt(n.trim()) || 0; });
		if (result.wgRx === 0 && result.wgTx === 0 && sysfsNums.length >= 2) {
			result.wgRx = sysfsNums[0];
			result.wgTx = sysfsNums[1];
		}
		if (sysfsNums.length >= 4) {
			result.tunRx = sysfsNums[2];
			result.tunTx = sysfsNums[3];
		}
		return result;
	},

	findIface: function(ifaces, name) {
		for (var i = 0; i < ifaces.length; i++)
			if (ifaces[i]['interface'] === name) return ifaces[i];
		return null;
	},

	render: function(data) {
		var networkUci = data[0] || {};
		var ifDump = data[1] || [];
		var tgwg2 = data[2] || {};
		var tgwg1 = data[3] || {};
		var tgovpn = data[4] || {};
		var tgv2ray = data[5] || {};
		var status = this.parseStatus(data[6]);

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		var tunnels = [];

		/* ── TorGuard WireGuard (tgwireguard2) ── */
		var tgwg2Settings = null;
		for (var k in tgwg2) {
			if (tgwg2[k] && tgwg2[k]['.type'] === 'wgconfig') { tgwg2Settings = tgwg2[k]; break; }
		}
		if (tgwg2Settings) {
			var wgIface = this.findIface(ifDump, 'wg');
			var wgIsUp = (wgIface && wgIface.up) || status.wgUp;
			var wgAddr = '-';
			if (wgIface && wgIface['ipv4-address'] && wgIface['ipv4-address'].length)
				wgAddr = wgIface['ipv4-address'][0].address;
			var wgRx = status.wgRx, wgTx = status.wgTx;
			if (wgIface && wgIface.data) {
				wgRx = wgIface.data.rx_bytes || wgRx;
				wgTx = wgIface.data.tx_bytes || wgTx;
			}
			tunnels.push({
				type: 'wireguard', label: 'TorGuard WireGuard', name: tgwg2Settings.TGWG_URL || 'wg',
				isUp: wgIsUp, addr: wgAddr,
				uptime: wgIface ? (wgIface.uptime || 0) : 0,
				rx: wgRx, tx: wgTx,
				link: 'simple-vpn/torguard'
			});
		}

		/* ── TorGuard WireGuard Custom (tgwireguard) ── */
		var tgwg1Settings = null;
		for (var k in tgwg1) {
			if (tgwg1[k] && tgwg1[k]['.type'] === 'wgconfig') { tgwg1Settings = tgwg1[k]; break; }
		}
		if (tgwg1Settings && tgwg1Settings.TGWG_ENABLED === 'yes') {
			var wg1Up = status.wgUp;
			tunnels.push({
				type: 'wireguard', label: 'Custom WireGuard', name: tgwg1Settings.TGWG_URL || 'custom',
				isUp: wg1Up, addr: '-',
				uptime: 0, rx: status.wgRx, tx: status.wgTx,
				link: 'simple-vpn/custom'
			});
		}

		/* ── Standard WireGuard interfaces (from network UCI) ── */
		for (var section in networkUci) {
			var s = networkUci[section];
			if (s && s['.type'] === 'interface' && s.proto === 'wireguard') {
				var ifname = s['.name'] || section;
				if (ifname === 'wg' && tgwg2Settings) continue;

				var iface = this.findIface(ifDump, ifname);
				var isUp = iface ? (iface.up || false) : false;
				var addr = '-';
				if (iface && iface['ipv4-address'] && iface['ipv4-address'].length)
					addr = iface['ipv4-address'][0].address;
				if (s.addresses && addr === '-')
					addr = Array.isArray(s.addresses) ? s.addresses[0] : s.addresses;

				var peerCount = 0;
				for (var ps in networkUci) {
					if (networkUci[ps] && networkUci[ps]['.type'] === 'wireguard_' + ifname) peerCount++;
				}

				tunnels.push({
					type: 'wireguard', label: 'WireGuard', name: ifname,
					isUp: isUp, addr: addr, peers: peerCount,
					uptime: iface ? (iface.uptime || 0) : 0,
					rx: iface && iface.data ? (iface.data.rx_bytes || 0) : 0,
					tx: iface && iface.data ? (iface.data.tx_bytes || 0) : 0
				});
			}
		}

		/* ── TorGuard OpenVPN ── */
		var tgovpnSettings = null;
		for (var k in tgovpn) {
			if (tgovpn[k] && tgovpn[k]['.type'] === 'ovpnconfig') { tgovpnSettings = tgovpn[k]; break; }
		}
		if (tgovpnSettings) {
			tunnels.push({
				type: 'openvpn', label: 'TorGuard OpenVPN', name: tgovpnSettings.server || 'openvpn',
				isUp: status.tunUp, addr: status.tunUp ? 'tun0' : '-',
				uptime: 0, rx: status.tunRx, tx: status.tunTx,
				link: 'simple-vpn/openvpn'
			});
		}

		/* ── TorGuard V2Ray ── */
		var tgv2Settings = null;
		for (var k in tgv2ray) {
			if (tgv2ray[k] && tgv2ray[k]['.type'] === 'tgv2ray' && tgv2ray[k]['.name'] === 'settings') { tgv2Settings = tgv2ray[k]; break; }
		}
		if (tgv2Settings) {
			tunnels.push({
				type: 'v2ray', label: 'TorGuard V2Ray', name: tgv2Settings.server || 'v2ray',
				isUp: status.singUp, addr: status.singUp ? 'sing-box' : '-',
				uptime: 0, rx: 0, tx: 0,
				link: 'simple-vpn/v2ray'
			});
		}

		var activeCount = tunnels.filter(function(t) { return t.isUp; }).length;

		/* ── Summary hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = activeCount > 0
			? 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)'
			: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var shieldDiv = el('div', 'tg-shield ' + (activeCount > 0 ? 'connected' : 'disconnected'), SVG.shield);
		hero.appendChild(shieldDiv);
		hero.appendChild(el('div', 'tg-status-text', activeCount > 0 ? 'VPN Protected' : 'No Active Tunnels'));
		hero.appendChild(el('div', 'tg-status-sub',
			tunnels.length === 0
				? 'No VPN tunnels configured'
				: activeCount + ' of ' + tunnels.length + ' tunnel' + (tunnels.length !== 1 ? 's' : '') + ' active'
		));

		if (activeCount > 0) {
			var totalRx = 0, totalTx = 0;
			tunnels.forEach(function(t) { if (t.isUp) { totalRx += t.rx; totalTx += t.tx; } });
			var stats = el('div', 'tg-stats');
			var dlStat = el('div', 'tg-stat');
			dlStat.appendChild(el('div', 'tg-stat-val', formatBytes(totalRx)));
			dlStat.appendChild(el('div', 'tg-stat-label', '\u2193 Download'));
			stats.appendChild(dlStat);
			var ulStat = el('div', 'tg-stat');
			ulStat.appendChild(el('div', 'tg-stat-val', formatBytes(totalTx)));
			ulStat.appendChild(el('div', 'tg-stat-label', '\u2191 Upload'));
			stats.appendChild(ulStat);
			hero.appendChild(stats);
		}

		root.appendChild(hero);

		/* ── Tunnel cards ── */
		if (tunnels.length === 0) {
			var emptyCard = el('div', 'tg-config');
			emptyCard.style.textAlign = 'center';
			emptyCard.style.padding = '40px 24px';
			emptyCard.appendChild(el('div', '', '<div style="width:64px;height:64px;margin:0 auto 16px;border-radius:50%;background:var(--simple-accent-light);display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="32" height="32" fill="var(--simple-accent)"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div>'));
			emptyCard.appendChild(el('div', '', '<div style="font-size:18px;font-weight:700;color:var(--simple-text);margin-bottom:8px">No VPN Tunnels</div>'));
			emptyCard.appendChild(el('div', '', '<p style="color:var(--simple-muted);margin:0 0 20px">Set up a WireGuard or OpenVPN tunnel to secure your connection.</p>'));

			var setupBtn = el('a', 'simple-btn simple-btn-primary');
			setupBtn.href = L.url('admin', 'simple-vpn', 'torguard');
			setupBtn.innerHTML = SVG.arrow + ' Set Up TorGuard VPN';
			setupBtn.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:10px 24px;text-decoration:none';
			setupBtn.querySelector('svg').style.cssText = 'width:18px;height:18px;fill:currentColor';
			emptyCard.appendChild(setupBtn);
			root.appendChild(emptyCard);
		} else {
			tunnels.forEach(function(tun) {
				var card = el('div', 'tg-config');

				var header = el('div', '');
				header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:16px';

				var iconWrap = el('div', '');
				iconWrap.style.cssText = 'width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;' +
					(tun.isUp
						? 'background:rgba(16,185,129,0.12);color:#10b981'
						: 'background:var(--simple-accent-light);color:var(--simple-accent)');
				var tunIcon = tun.type === 'wireguard' ? SVG.wg : tun.type === 'v2ray' ? SVG.v2ray : SVG.ovpn;
				iconWrap.innerHTML = tunIcon;
				iconWrap.querySelector('svg').style.cssText = 'width:22px;height:22px;fill:currentColor';
				header.appendChild(iconWrap);

				var titleBlock = el('div', '');
				titleBlock.style.flex = '1';
				titleBlock.appendChild(el('div', '', '<span style="font-size:16px;font-weight:700;color:var(--simple-text)">' + tun.label + '</span>'));
				titleBlock.appendChild(el('div', '', '<span style="font-size:13px;color:var(--simple-muted)">' + tun.name + '</span>'));
				header.appendChild(titleBlock);

				var badge = el('span', '');
				badge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;' +
					(tun.isUp
						? 'background:rgba(16,185,129,0.12);color:#10b981'
						: 'background:rgba(239,68,68,0.1);color:#ef4444');
				badge.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block"></span>' +
					(tun.isUp ? 'Active' : 'Down');
				header.appendChild(badge);

				card.appendChild(header);

				var grid = el('div', '');
				grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px';

				var fields = [];
				if (tun.addr && tun.addr !== '-')
					fields.push(['Address', tun.addr]);
				if (tun.peers !== undefined)
					fields.push(['Peers', String(tun.peers)]);
				if (tun.isUp && tun.uptime)
					fields.push(['Uptime', formatUptime(tun.uptime)]);
				if (tun.isUp && (tun.rx || tun.tx)) {
					fields.push(['\u2193 RX', formatBytes(tun.rx)]);
					fields.push(['\u2191 TX', formatBytes(tun.tx)]);
				}

				if (fields.length === 0) {
					fields.push(['Status', tun.isUp ? 'Connected' : 'Not connected']);
				}

				fields.forEach(function(f) {
					var cell = el('div', '');
					cell.style.cssText = 'padding:10px 14px;border-radius:8px;background:var(--simple-input-bg)';
					cell.appendChild(el('div', '', '<span style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:var(--simple-muted);display:block;margin-bottom:4px">' + f[0] + '</span>'));
					cell.appendChild(el('div', '', '<span style="font-size:14px;font-weight:600;color:var(--simple-text)">' + f[1] + '</span>'));
					grid.appendChild(cell);
				});

				card.appendChild(grid);

				if (tun.link) {
					var linkWrap = el('div', '');
					linkWrap.style.cssText = 'margin-top:14px;text-align:right';
					var cfgLink = el('a', '');
					cfgLink.href = L.url('admin', tun.link);
					cfgLink.style.cssText = 'font-size:13px;font-weight:600;color:var(--simple-accent);text-decoration:none;display:inline-flex;align-items:center;gap:4px';
					cfgLink.innerHTML = 'Configure ' + SVG.arrow.replace('<svg ', '<svg style="width:14px;height:14px;fill:currentColor" ');
					linkWrap.appendChild(cfgLink);
					card.appendChild(linkWrap);
				}

				root.appendChild(card);
			});
		}

		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
