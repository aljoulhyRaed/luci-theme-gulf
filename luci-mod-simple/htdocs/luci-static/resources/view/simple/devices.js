'use strict';
'require view';
'require dom';
'require poll';
'require rpc';
'require uci';
'require network';

var callLuciDHCP = rpc.declare({ object: 'luci-rpc', method: 'getDHCPLeases', expect: { dhcp_leases: [] } });
var callLuciDHCP6 = rpc.declare({ object: 'luci-rpc', method: 'getDHCPLeases', expect: { dhcp6_leases: [] } });
var callLuciHosts = rpc.declare({ object: 'luci-rpc', method: 'getHostHints', expect: { '': {} } });
var callNetIfStatus = rpc.declare({ object: 'network.interface', method: 'dump', expect: { 'interface': [] } });
var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });
var callFileRead = rpc.declare({ object: 'file', method: 'read', params: ['path'] });

var SVG = {
	devices: '<svg viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>',
	laptop: '<svg viewBox="0 0 24 24"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>',
	phone: '<svg viewBox="0 0 24 24"><path d="M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3.25-3H6.75V4h10.5v14z"/></svg>',
	tablet: '<svg viewBox="0 0 24 24"><path d="M18.5 0h-14C3.12 0 2 1.12 2 2.5v19C2 22.88 3.12 24 4.5 24h14c1.38 0 2.5-1.12 2.5-2.5v-19C21 1.12 19.88 0 18.5 0zm-7 23c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7.5-4H4V3h15v16z"/></svg>',
	tv: '<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>',
	router: '<svg viewBox="0 0 24 24"><path d="M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1s1.8.3 2.5 1l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z"/></svg>',
	printer: '<svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>',
	unknown: '<svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
	clock: '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
	search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
	pin: '<svg viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>',
	speed: '<svg viewBox="0 0 24 24"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>',
	block: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/></svg>',
	arrowUp: '<svg viewBox="0 0 24 24"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>',
	arrowDown: '<svg viewBox="0 0 24 24"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>',
	close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	edit: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'
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

function formatBytes(b) {
	if (!b || b === 0) return '0 B';
	if (b < 1024) return b + ' B';
	if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
	if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB';
	return (b / 1073741824).toFixed(2) + ' GB';
}

function formatSpeed(bps) {
	if (!bps || bps <= 0) return '0 B/s';
	if (bps < 1024) return bps.toFixed(0) + ' B/s';
	if (bps < 1048576) return (bps / 1024).toFixed(1) + ' KB/s';
	return (bps / 1048576).toFixed(1) + ' MB/s';
}

function guessDeviceType(hostname, mac) {
	var h = (hostname || '').toLowerCase();
	if (h.match(/iphone|android|pixel|galaxy|oneplus|xiaomi|huawei|oppo|redmi|poco|phone|mobile/))
		return { icon: SVG.phone, type: 'Phone' };
	if (h.match(/ipad|tab|kindle|surface/))
		return { icon: SVG.tablet, type: 'Tablet' };
	if (h.match(/macbook|thinkpad|dell|hp-|lenovo|asus|acer|laptop|notebook/))
		return { icon: SVG.laptop, type: 'Laptop' };
	if (h.match(/tv|roku|fire-?stick|chromecast|apple-?tv|shield|smart-?tv|lg-|samsung-|sony-|bravia/))
		return { icon: SVG.tv, type: 'Smart TV' };
	if (h.match(/printer|brother|canon|epson|hp.?print/))
		return { icon: SVG.printer, type: 'Printer' };
	if (h.match(/router|gateway|ap|access.?point|mesh|extender|repeater|openwrt/))
		return { icon: SVG.router, type: 'Router' };
	if (h.match(/desktop|pc|tower|workstation|imac/))
		return { icon: SVG.devices, type: 'Desktop' };
	return { icon: SVG.unknown, type: 'Device' };
}

function formatExpiry(ts) {
	if (!ts) return 'Static';
	var d = new Date(ts * 1000), now = new Date(), diff = Math.floor((d - now) / 1000);
	if (diff <= 0) return 'Expired';
	var h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60);
	return h > 0 ? h + 'h ' + m + 'm' : m + 'm';
}

var _prevTraffic = {};
var _pollInterval = 3;

function parseTrafficOutput(stdout) {
	var data = {};
	(stdout || '').trim().split('\n').forEach(function(line) {
		var p = line.trim().split(/\s+/);
		if (p.length >= 3) data[p[0]] = { tx: parseInt(p[1]) || 0, rx: parseInt(p[2]) || 0 };
	});
	return data;
}

function calcSpeeds(current) {
	var out = {};
	for (var ip in current) {
		var prev = _prevTraffic[ip];
		if (prev) {
			out[ip] = {
				txSpeed: Math.max(0, current[ip].tx - prev.tx) / _pollInterval,
				rxSpeed: Math.max(0, current[ip].rx - prev.rx) / _pollInterval,
				txTotal: current[ip].tx, rxTotal: current[ip].rx
			};
		} else {
			out[ip] = { txSpeed: 0, rxSpeed: 0, txTotal: current[ip].tx, rxTotal: current[ip].rx };
		}
	}
	_prevTraffic = current;
	return out;
}

return view.extend({
	_statsEnabled: false,
	_deviceEls: {},
	_staticLeases: {},
	_blockedMACs: {},

	load: function() {
		return Promise.all([
			L.resolveDefault(callLuciDHCP(), []),
			L.resolveDefault(callLuciHosts(), {}),
			L.resolveDefault(callNetIfStatus(), []),
			L.resolveDefault(callLuciDHCP6(), []),
			uci.load('dhcp').then(function() { return uci.sections('dhcp', 'host'); }).catch(function() { return []; }),
			uci.load('firewall').then(function() { return uci.sections('firewall', 'rule'); }).catch(function() { return []; })
		]);
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	findStaticLease: function(mac) {
		mac = (mac || '').toUpperCase();
		for (var key in this._staticLeases) {
			var l = this._staticLeases[key];
			if ((l.mac || '').toUpperCase() === mac) return l;
		}
		return null;
	},

	isBlocked: function(mac) {
		return !!this._blockedMACs[(mac || '').toUpperCase()];
	},

	toggleStaticIP: function(mac, ip, hostname, enable) {
		var self = this;
		mac = (mac || '').toUpperCase();

		return uci.load('dhcp').then(function() {
			var sections = uci.sections('dhcp', 'host');
			var existing = null;
			for (var i = 0; i < sections.length; i++) {
				if ((sections[i].mac || '').toUpperCase() === mac) {
					existing = sections[i];
					break;
				}
			}

			if (enable) {
				if (!existing) {
					var sid = uci.add('dhcp', 'host');
					uci.set('dhcp', sid, 'mac', mac);
					uci.set('dhcp', sid, 'ip', ip);
					if (hostname) uci.set('dhcp', sid, 'name', hostname);
					uci.set('dhcp', sid, 'dns', '1');
				} else {
					uci.set('dhcp', existing['.name'], 'ip', ip);
					if (hostname) uci.set('dhcp', existing['.name'], 'name', hostname);
				}
			} else if (existing) {
				uci.remove('dhcp', existing['.name']);
			}

			return uci.save().then(function() { return uci.apply(); });
		}).then(function() {
			self.showToast(enable ? 'Static IP ' + ip + ' bound to ' + mac : 'Static IP binding removed');
			self._staticLeases[mac] = enable ? { mac: mac, ip: ip, name: hostname } : null;
			if (!enable) delete self._staticLeases[mac];
		}).catch(function(e) {
			self.showToast('Error: ' + (e.message || e));
		});
	},

	toggleBlock: function(mac, enable) {
		var self = this;
		mac = (mac || '').toUpperCase();

		return uci.load('firewall').then(function() {
			var sections = uci.sections('firewall', 'rule');
			var existing = null;
			for (var i = 0; i < sections.length; i++) {
				if (sections[i].name === 'block_' + mac.replace(/:/g, '')) {
					existing = sections[i];
					break;
				}
			}

			if (enable && !existing) {
				var sid = uci.add('firewall', 'rule');
				uci.set('firewall', sid, 'name', 'block_' + mac.replace(/:/g, ''));
				uci.set('firewall', sid, 'src', 'lan');
				uci.set('firewall', sid, 'src_mac', mac);
				uci.set('firewall', sid, 'dest', '*');
				uci.set('firewall', sid, 'target', 'DROP');
			} else if (!enable && existing) {
				uci.remove('firewall', existing['.name']);
			}

			return uci.save().then(function() { return uci.apply(); });
		}).then(function() {
			self._blockedMACs[mac] = enable;
			if (!enable) delete self._blockedMACs[mac];
			self.showToast(enable ? 'Device blocked' : 'Device unblocked');
		}).catch(function(e) {
			self.showToast('Error: ' + (e.message || e));
		});
	},

	fetchTraffic: function() {
		var cmd = "awk '{s=\"\";t=0;r=0;n=0;for(i=1;i<=NF;i++){if($i~/^src=/){split($i,a,\"=\");if(n==0)s=a[2];n++}if($i~/^bytes=/){split($i,a,\"=\");if(t==0)t=a[2];else r=a[2]}}if(s!=\"\"){u[s]+=t;d[s]+=r}}END{for(ip in u)print ip,u[ip],d[ip]}' /proc/net/nf_conntrack 2>/dev/null";
		return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			return parseTrafficOutput(res ? res.stdout : '');
		});
	},

	updateTrafficUI: function(speeds) {
		for (var ip in this._deviceEls) {
			var els = this._deviceEls[ip];
			var s = speeds[ip] || { txSpeed: 0, rxSpeed: 0, txTotal: 0, rxTotal: 0 };
			if (els.txSpeed) els.txSpeed.textContent = formatSpeed(s.txSpeed);
			if (els.rxSpeed) els.rxSpeed.textContent = formatSpeed(s.rxSpeed);
			if (els.txTotal) els.txTotal.textContent = formatBytes(s.txTotal);
			if (els.rxTotal) els.rxTotal.textContent = formatBytes(s.rxTotal);
		}
	},

	showStaticIPDialog: function(mac, ip, hostname, onDone) {
		var self = this;
		var overlay = el('div', 'dev-overlay');
		var dialog = el('div', 'dev-dialog');

		var hdr = el('div', 'dev-dialog-hdr');
		hdr.appendChild(el('span', 'dev-dialog-title', 'Static IP Binding'));
		var closeBtn = el('button', 'dev-dialog-close');
		closeBtn.innerHTML = SVG.close.replace('<svg ', '<svg style="width:18px;height:18px;fill:currentColor" ');
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		hdr.appendChild(closeBtn);
		dialog.appendChild(hdr);

		var body = el('div', 'dev-dialog-body');
		var fields = [
			['MAC Address', 'mac', mac],
			['IP Address', 'ip', ip],
			['Hostname', 'name', hostname || '']
		];
		fields.forEach(function(f) {
			var row = el('div', 'inet-form-row');
			row.appendChild(el('label', 'inet-form-label', f[0]));
			row.appendChild(E('input', { 'class': 'tg-server-search', 'type': 'text', 'value': f[2], 'data-field': f[1] }));
			body.appendChild(row);
		});
		dialog.appendChild(body);

		var actions = el('div', 'dev-dialog-actions');
		var cancelBtn = el('button', 'inet-cancel-btn', 'Cancel');
		cancelBtn.addEventListener('click', function() { overlay.remove(); });
		var saveBtn = el('button', 'tg-power-btn', 'Save Binding');
		saveBtn.style.cssText = 'width:auto;padding:10px 28px';
		saveBtn.addEventListener('click', function() {
			var newMAC = body.querySelector('[data-field="mac"]').value.trim();
			var newIP = body.querySelector('[data-field="ip"]').value.trim();
			var newName = body.querySelector('[data-field="name"]').value.trim();
			if (!newMAC || !newIP) { self.showToast('MAC and IP are required'); return; }
			self.toggleStaticIP(newMAC, newIP, newName, true).then(function() {
				overlay.remove();
				if (onDone) onDone();
			});
		});
		actions.appendChild(cancelBtn);
		actions.appendChild(saveBtn);
		dialog.appendChild(actions);

		overlay.appendChild(dialog);
		overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
		document.body.appendChild(overlay);
	},

	showQoSDialog: function(ip, hostname) {
		var self = this;
		var overlay = el('div', 'dev-overlay');
		var dialog = el('div', 'dev-dialog');

		var hdr = el('div', 'dev-dialog-hdr');
		hdr.appendChild(el('span', 'dev-dialog-title', 'Speed Limit \u2014 ' + (hostname || ip)));
		var closeBtn = el('button', 'dev-dialog-close');
		closeBtn.innerHTML = SVG.close.replace('<svg ', '<svg style="width:18px;height:18px;fill:currentColor" ');
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		hdr.appendChild(closeBtn);
		dialog.appendChild(hdr);

		var body = el('div', 'dev-dialog-body');
		[['Download Limit (Kbit/s)', 'dl', ''], ['Upload Limit (Kbit/s)', 'ul', '']].forEach(function(f) {
			var row = el('div', 'inet-form-row');
			row.appendChild(el('label', 'inet-form-label', f[0]));
			row.appendChild(E('input', { 'class': 'tg-server-search', 'type': 'number', 'placeholder': '0 = unlimited', 'value': f[2], 'data-field': f[1] }));
			body.appendChild(row);
		});
		var note = el('div', 'inet-info-note');
		note.innerHTML = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--simple-accent);flex-shrink:0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
		note.appendChild(el('span', '', 'Requires <code>tc</code> (iproute2). Set 0 or leave empty to remove limits. Changes are runtime-only and reset on reboot.'));
		body.appendChild(note);
		dialog.appendChild(body);

		var actions = el('div', 'dev-dialog-actions');
		var cancelBtn = el('button', 'inet-cancel-btn', 'Cancel');
		cancelBtn.addEventListener('click', function() { overlay.remove(); });
		var applyBtn = el('button', 'tg-power-btn', 'Apply Limit');
		applyBtn.style.cssText = 'width:auto;padding:10px 28px';
		applyBtn.addEventListener('click', function() {
			var dl = parseInt(body.querySelector('[data-field="dl"]').value) || 0;
			var ul = parseInt(body.querySelector('[data-field="ul"]').value) || 0;
			var script = 'IP="' + ip + '"; DL=' + dl + '; UL=' + ul + '; ';
			script += 'DEV=$(ip route show default | awk \'{print $5;exit}\' 2>/dev/null || echo "br-lan"); ';
			script += 'tc qdisc del dev $DEV root 2>/dev/null; ';
			if (dl > 0 || ul > 0) {
				script += 'tc qdisc add dev $DEV root handle 1: htb default 99; ';
				script += 'tc class add dev $DEV parent 1: classid 1:99 htb rate 1000mbit; ';
				if (dl > 0) {
					script += 'tc class add dev $DEV parent 1: classid 1:10 htb rate ' + dl + 'kbit; ';
					script += 'tc filter add dev $DEV parent 1: protocol ip u32 match ip dst $IP/32 flowid 1:10; ';
				}
				if (ul > 0) {
					script += 'tc class add dev $DEV parent 1: classid 1:11 htb rate ' + ul + 'kbit; ';
					script += 'tc filter add dev $DEV parent 1: protocol ip u32 match ip src $IP/32 flowid 1:11; ';
				}
			}
			script += 'echo ok';
			L.resolveDefault(callFileExec('/bin/sh', ['-c', script]), {}).then(function(res) {
				var ok = res && res.stdout && res.stdout.trim() === 'ok';
				self.showToast(ok ? 'Speed limit applied' : 'tc command may not be available');
				overlay.remove();
			});
		});
		var removeBtn = el('button', 'inet-cancel-btn', 'Remove Limits');
		removeBtn.addEventListener('click', function() {
			var script = 'DEV=$(ip route show default | awk \'{print $5;exit}\' 2>/dev/null || echo "br-lan"); tc qdisc del dev $DEV root 2>/dev/null; echo ok';
			L.resolveDefault(callFileExec('/bin/sh', ['-c', script]), {}).then(function() {
				self.showToast('All speed limits removed');
				overlay.remove();
			});
		});
		var topRow = el('div', 'dev-dialog-actions-row');
		topRow.appendChild(removeBtn);
		topRow.appendChild(cancelBtn);
		actions.appendChild(topRow);
		applyBtn.style.cssText = 'width:100%;padding:12px 28px';
		actions.appendChild(applyBtn);
		dialog.appendChild(actions);

		overlay.appendChild(dialog);
		overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
		document.body.appendChild(overlay);
	},

	render: function(data) {
		var leases = data[0] || [];
		var hints = data[1] || {};
		var ifaces = data[2] || [];
		var leases6 = data[3] || [];
		var staticHosts = data[4] || [];
		var fwRules = data[5] || [];
		var self = this;

		this._staticLeases = {};
		staticHosts.forEach(function(h) {
			if (h.mac) self._staticLeases[(h.mac || '').toUpperCase()] = h;
		});

		this._blockedMACs = {};
		fwRules.forEach(function(r) {
			if (r.name && r.name.indexOf('block_') === 0 && r.target === 'DROP' && r.src_mac) {
				self._blockedMACs[(r.src_mac || '').toUpperCase()] = true;
			}
		});

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		var totalDevices = leases.length;

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = totalDevices > 0
			? 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)'
			: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var iconDiv = el('div', 'tg-shield ' + (totalDevices > 0 ? 'connected' : 'disconnected'),
			SVG.devices.replace('<svg ', '<svg style="width:40px;height:40px;fill:#fff" '));
		if (totalDevices > 0) {
			iconDiv.style.background = 'rgba(14,165,233,0.3)';
			iconDiv.style.boxShadow = '0 0 24px rgba(14,165,233,0.4), 0 0 48px rgba(14,165,233,0.2)';
		}
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text',
			totalDevices > 0 ? totalDevices + ' Device' + (totalDevices !== 1 ? 's' : '') + ' Online' : 'No Devices'));
		hero.appendChild(el('div', 'tg-status-sub',
			totalDevices > 0 ? 'Connected via DHCP on your local network' : 'No active DHCP leases found'));

		if (totalDevices > 0) {
			var stats = el('div', 'tg-stats');
			var s1 = el('div', 'tg-stat');
			s1.appendChild(el('div', 'tg-stat-val', '' + leases.length));
			s1.appendChild(el('div', 'tg-stat-label', 'IPv4 Leases'));
			stats.appendChild(s1);
			var uniqueMACs = {};
			leases.forEach(function(l) { if (l.macaddr) uniqueMACs[l.macaddr.toUpperCase()] = 1; });
			var s2 = el('div', 'tg-stat');
			s2.appendChild(el('div', 'tg-stat-val', '' + Object.keys(uniqueMACs).length));
			s2.appendChild(el('div', 'tg-stat-label', 'Unique Devices'));
			stats.appendChild(s2);
			var pinnedCount = 0;
			leases.forEach(function(l) { if (self.findStaticLease(l.macaddr)) pinnedCount++; });
			var s3 = el('div', 'tg-stat');
			s3.appendChild(el('div', 'tg-stat-val', '' + pinnedCount));
			s3.appendChild(el('div', 'tg-stat-label', 'Static IPs'));
			stats.appendChild(s3);
			hero.appendChild(stats);
		}
		root.appendChild(hero);

		/* ── Empty state ── */
		if (totalDevices === 0) {
			var emptyCard = el('div', 'tg-config');
			var emptyBody = el('div', 'dev-empty');
			emptyBody.innerHTML = SVG.devices.replace('<svg ', '<svg class="dev-empty-icon" ');
			emptyBody.appendChild(el('div', 'dev-empty-title', 'No Connected Devices'));
			emptyBody.appendChild(el('div', 'dev-empty-text', 'Devices that connect to your router via DHCP will appear here automatically. Check that your LAN is configured and devices are connected.'));
			emptyCard.appendChild(emptyBody);
			root.appendChild(emptyCard);
			return root;
		}

		/* ── Device list card ── */
		var card = el('div', 'tg-config');

		/* Toolbar: search + stats toggle */
		var toolbar = el('div', 'dev-toolbar');
		var searchWrap = el('div', 'dev-search-wrap');
		searchWrap.innerHTML = SVG.search.replace('<svg ', '<svg class="dev-search-icon" ');
		var searchInput = E('input', { 'class': 'tg-server-search', 'type': 'text', 'placeholder': 'Search devices...', 'style': 'padding-left:36px' });
		searchWrap.appendChild(searchInput);
		toolbar.appendChild(searchWrap);

		/* Stats toggle */
		var statsToggle = el('div', 'dev-stats-toggle');
		statsToggle.appendChild(el('span', 'dev-stats-label', 'Real-time Stats'));
		var toggleWrap = el('label', 'dev-toggle');
		var toggleInput = E('input', { 'type': 'checkbox' });
		toggleWrap.appendChild(toggleInput);
		toggleWrap.appendChild(el('span', 'dev-toggle-slider'));
		statsToggle.appendChild(toggleWrap);
		toolbar.appendChild(statsToggle);

		var countLabel = el('span', 'dev-count', totalDevices + ' device' + (totalDevices !== 1 ? 's' : ''));
		toolbar.appendChild(countLabel);
		card.appendChild(toolbar);

		/* Column headers */
		var colHdr = el('div', 'dev-col-header');
		colHdr.appendChild(el('span', 'dev-col dev-col-name', 'Device'));
		colHdr.appendChild(el('span', 'dev-col dev-col-ip', 'IP + MAC'));
		var speedCol = el('span', 'dev-col dev-col-speed dev-stats-col', 'Speed');
		var trafficCol = el('span', 'dev-col dev-col-traffic dev-stats-col', 'Traffic');
		colHdr.appendChild(speedCol);
		colHdr.appendChild(trafficCol);
		colHdr.appendChild(el('span', 'dev-col dev-col-actions', 'Actions'));
		card.appendChild(colHdr);

		/* Device list */
		var list = el('div', 'dev-list');

		leases.sort(function(a, b) {
			var an = (a.hostname || '').toLowerCase(), bn = (b.hostname || '').toLowerCase();
			if (an && !bn) return -1;
			if (!an && bn) return 1;
			return an < bn ? -1 : an > bn ? 1 : 0;
		});

		for (var i = 0; i < leases.length; i++) {
			var lease = leases[i];
			var mac = (lease.macaddr || '').toUpperCase();
			var hostname = lease.hostname || '';
			if (!hostname && hints[mac]) hostname = hints[mac].name || '';
			var devInfo = guessDeviceType(hostname, mac);
			var isPinned = !!this.findStaticLease(mac);
			var isBlockedDev = this.isBlocked(mac);

			var item = el('div', 'dev-item');
			item.setAttribute('data-search', (hostname + ' ' + lease.ipaddr + ' ' + mac).toLowerCase());
			item.setAttribute('data-ip', lease.ipaddr);
			item.setAttribute('data-mac', mac);

			/* Icon + Name */
			var nameCell = el('div', 'dev-cell dev-cell-name');
			var iconWrap = el('div', 'dev-icon');
			iconWrap.innerHTML = devInfo.icon;
			nameCell.appendChild(iconWrap);
			var nameInfo = el('div', 'dev-name-info');
			var nameRow = el('div', 'dev-name-row');
			nameRow.appendChild(el('span', 'dev-name', hostname || 'Unknown'));
			nameRow.appendChild(el('span', 'dev-type-badge', devInfo.type));
			if (isPinned) {
				var pinBadge = el('span', 'dev-pin-badge');
				pinBadge.innerHTML = SVG.pin.replace('<svg ', '<svg style="width:10px;height:10px;fill:currentColor" ') + ' Static';
				nameRow.appendChild(pinBadge);
			}
			nameInfo.appendChild(nameRow);
			nameCell.appendChild(nameInfo);
			item.appendChild(nameCell);

			/* IP + MAC */
			var ipCell = el('div', 'dev-cell dev-cell-ip');
			ipCell.appendChild(el('div', 'dev-ip', lease.ipaddr || '-'));
			ipCell.appendChild(el('div', 'dev-mac', mac));
			var expBadge = el('div', 'dev-expiry');
			expBadge.innerHTML = SVG.clock.replace('<svg ', '<svg style="width:11px;height:11px;fill:currentColor" ');
			expBadge.appendChild(document.createTextNode(' ' + formatExpiry(lease.expires)));
			ipCell.appendChild(expBadge);
			item.appendChild(ipCell);

			/* Speed (hidden by default) */
			var speedCell = el('div', 'dev-cell dev-cell-speed dev-stats-col');
			var txSpeedEl = el('span', 'dev-speed-val', '0 B/s');
			var rxSpeedEl = el('span', 'dev-speed-val', '0 B/s');
			var txSpeedRow = el('div', 'dev-speed-row up');
			txSpeedRow.innerHTML = SVG.arrowUp.replace('<svg ', '<svg style="width:12px;height:12px;fill:#10b981" ');
			txSpeedRow.appendChild(txSpeedEl);
			var rxSpeedRow = el('div', 'dev-speed-row dn');
			rxSpeedRow.innerHTML = SVG.arrowDown.replace('<svg ', '<svg style="width:12px;height:12px;fill:#3b82f6" ');
			rxSpeedRow.appendChild(rxSpeedEl);
			speedCell.appendChild(txSpeedRow);
			speedCell.appendChild(rxSpeedRow);
			item.appendChild(speedCell);

			/* Traffic (hidden by default) */
			var trafficCell = el('div', 'dev-cell dev-cell-traffic dev-stats-col');
			var txTotalEl = el('span', 'dev-traffic-val', '0 B');
			var rxTotalEl = el('span', 'dev-traffic-val', '0 B');
			var txTotalRow = el('div', 'dev-speed-row up');
			txTotalRow.innerHTML = SVG.arrowUp.replace('<svg ', '<svg style="width:12px;height:12px;fill:#10b981" ');
			txTotalRow.appendChild(txTotalEl);
			var rxTotalRow = el('div', 'dev-speed-row dn');
			rxTotalRow.innerHTML = SVG.arrowDown.replace('<svg ', '<svg style="width:12px;height:12px;fill:#3b82f6" ');
			rxTotalRow.appendChild(rxTotalEl);
			trafficCell.appendChild(txTotalRow);
			trafficCell.appendChild(rxTotalRow);
			item.appendChild(trafficCell);

			this._deviceEls[lease.ipaddr] = {
				txSpeed: txSpeedEl, rxSpeed: rxSpeedEl,
				txTotal: txTotalEl, rxTotal: rxTotalEl
			};

			/* Actions */
			var actCell = el('div', 'dev-cell dev-cell-actions');

			/* Static IP toggle */
			(function(currentMAC, currentIP, currentHost, currentPinned) {
				var pinBtn = el('button', 'dev-action-btn' + (currentPinned ? ' active' : ''), currentPinned ? 'Pinned' : 'Pin IP');
				pinBtn.title = 'Static IP binding';
				pinBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					if (currentPinned) {
						self.toggleStaticIP(currentMAC, currentIP, currentHost, false).then(function() {
							pinBtn.classList.remove('active');
							pinBtn.textContent = 'Pin IP';
						});
					} else {
						self.showStaticIPDialog(currentMAC, currentIP, currentHost, function() {
							pinBtn.classList.add('active');
							pinBtn.textContent = 'Pinned';
						});
					}
				});
				actCell.appendChild(pinBtn);
			})(mac, lease.ipaddr, hostname, isPinned);

			/* QoS button */
			(function(currentIP, currentHost) {
				var qosBtn = el('button', 'dev-action-btn dev-qos-btn', 'QoS');
				qosBtn.title = 'Set speed limit';
				qosBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					self.showQoSDialog(currentIP, currentHost);
				});
				actCell.appendChild(qosBtn);
			})(lease.ipaddr, hostname);

			/* Block toggle */
			(function(currentMAC, currentBlocked) {
				var blockToggle = el('label', 'dev-block-toggle');
				var blockInput = E('input', { 'type': 'checkbox' });
				blockInput.checked = currentBlocked;
				blockToggle.appendChild(blockInput);
				blockToggle.appendChild(el('span', 'dev-block-slider'));
				blockToggle.title = 'Block internet access';
				blockInput.addEventListener('change', function() {
					var shouldBlock = this.checked;
					self.toggleBlock(currentMAC, shouldBlock);
				});
				var blockLabel = el('div', 'dev-block-wrap');
				blockLabel.appendChild(blockToggle);
				blockLabel.appendChild(el('span', 'dev-block-label', 'Block'));
				actCell.appendChild(blockLabel);
			})(mac, isBlockedDev);

			item.appendChild(actCell);
			list.appendChild(item);
		}

		card.appendChild(list);

		/* Search filter */
		searchInput.addEventListener('input', function() {
			var q = this.value.toLowerCase().trim();
			var items = list.querySelectorAll('.dev-item');
			var shown = 0;
			items.forEach(function(item) {
				var match = !q || item.getAttribute('data-search').indexOf(q) !== -1;
				item.style.display = match ? '' : 'none';
				if (match) shown++;
			});
			countLabel.textContent = shown + ' device' + (shown !== 1 ? 's' : '');
		});

		/* Stats toggle logic */
		toggleInput.addEventListener('change', function() {
			self._statsEnabled = this.checked;
			var statsCols = card.querySelectorAll('.dev-stats-col');
			statsCols.forEach(function(c) {
				c.style.display = self._statsEnabled ? '' : 'none';
			});

			if (self._statsEnabled) {
				_prevTraffic = {};
				self.fetchTraffic().then(function(current) {
					var speeds = calcSpeeds(current);
					self.updateTrafficUI(speeds);
				});
				poll.add(function() {
					if (!self._statsEnabled) return;
					return self.fetchTraffic().then(function(current) {
						var speeds = calcSpeeds(current);
						self.updateTrafficUI(speeds);
					});
				}, _pollInterval);
			} else {
				poll.remove(function() {});
			}
		});

		/* Initially hide stats columns */
		var initStatsCols = card.querySelectorAll('.dev-stats-col');
		initStatsCols.forEach(function(c) { c.style.display = 'none'; });

		root.appendChild(card);
		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
