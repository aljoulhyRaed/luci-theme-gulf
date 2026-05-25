'use strict';
'require view';
'require rpc';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'] });
var callUciGet  = rpc.declare({ object: 'uci', method: 'get', params: ['config'], expect: { 'values': {} } });

var SVG = {
	guest: '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
	wifi: '<svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
	eye: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
	eyeOff: '<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>',
	trash: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	device: '<svg viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>',
	warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'
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
	return svg.replace('<svg ', '<svg style="width:' + (size || 14) + 'px;height:' + (size || 14) + 'px;fill:' + (color || 'currentColor') + '" ');
}

function radioLabel(device, wirelessUci) {
	for (var s in wirelessUci) {
		var sec = wirelessUci[s];
		if (sec && sec['.type'] === 'wifi-device' && sec['.name'] === device) {
			var band = sec.band || '';
			if (band === '2g' || band === '2.4g') return '2.4 GHz';
			if (band === '5g') return '5 GHz';
			if (band === '6g') return '6 GHz';
			var ch = parseInt(sec.channel, 10);
			if (ch > 0 && ch <= 14) return '2.4 GHz';
			if (ch > 14) return '5 GHz';
			return device.toUpperCase();
		}
	}
	return device ? device.toUpperCase() : 'Radio';
}

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callUciGet('wireless'), {}),
			L.resolveDefault(callUciGet('network'), {}),
			L.resolveDefault(callUciGet('firewall'), {}),
			L.resolveDefault(callUciGet('dhcp'), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'cat /tmp/dhcp.leases 2>/dev/null || echo ""'
			]), {})
		]);
	},

	handleSaveApply: null, handleSave: null, handleReset: null,

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	findGuestConfig: function(wirelessUci, networkUci, firewallUci, dhcpUci) {
		var guestIface = null;
		for (var s in wirelessUci) {
			var sec = wirelessUci[s];
			if (sec && sec['.type'] === 'wifi-iface' && sec.network === 'guest') {
				guestIface = sec;
				break;
			}
		}
		var guestNet = null;
		for (var s in networkUci) {
			if (networkUci[s] && networkUci[s]['.type'] === 'interface' && (networkUci[s]['.name'] === 'guest' || s === 'guest'))
				guestNet = networkUci[s];
		}
		var guestZone = null;
		for (var s in firewallUci) {
			if (firewallUci[s] && firewallUci[s]['.type'] === 'zone' && firewallUci[s].name === 'guest')
				guestZone = firewallUci[s];
		}
		var guestDhcp = null;
		for (var s in dhcpUci) {
			if (dhcpUci[s] && dhcpUci[s]['.type'] === 'dhcp' && dhcpUci[s].interface === 'guest')
				guestDhcp = dhcpUci[s];
		}

		return {
			exists: !!(guestIface && guestNet && guestZone),
			wifiIface: guestIface,
			network: guestNet,
			zone: guestZone,
			dhcp: guestDhcp
		};
	},

	render: function(data) {
		var self = this;
		var wirelessUci = data[0] || {};
		var networkUci  = data[1] || {};
		var firewallUci = data[2] || {};
		var dhcpUci     = data[3] || {};
		var leasesRaw   = (data[4] && data[4].stdout) || '';

		var devices = {};
		for (var s in wirelessUci) {
			var sec = wirelessUci[s];
			if (sec && sec['.type'] === 'wifi-device')
				devices[sec['.name'] || s] = sec;
		}

		var guest = this.findGuestConfig(wirelessUci, networkUci, firewallUci, dhcpUci);

		var guestClients = [];
		if (guest.exists && leasesRaw) {
			var lines = leasesRaw.trim().split('\n');
			lines.forEach(function(line) {
				var parts = line.trim().split(/\s+/);
				if (parts.length >= 4) {
					guestClients.push({
						mac: parts[1] || '-',
						ip: parts[2] || '-',
						name: parts[3] || 'Unknown'
					});
				}
			});
		}

		var root = el('div', 'simple-page');
		var cssLink = el('link'); cssLink.rel = 'stylesheet'; cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* Hero */
		var hero = el('div', 'tg-hero');
		if (guest.exists && guest.wifiIface && guest.wifiIface.disabled !== '1') {
			hero.style.background = 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)';
		} else if (guest.exists) {
			hero.style.background = 'linear-gradient(135deg, #44403c 0%, #57534e 50%, #78716c 100%)';
		} else {
			hero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';
		}

		var shieldDiv = el('div', 'tg-shield ' + ((guest.exists && guest.wifiIface && guest.wifiIface.disabled !== '1') ? 'connected' : 'disconnected'));
		shieldDiv.innerHTML = ic(SVG.guest, 40, '#fff');
		if (guest.exists && guest.wifiIface && guest.wifiIface.disabled !== '1') {
			shieldDiv.style.background = 'rgba(14,165,233,0.3)';
			shieldDiv.style.boxShadow = '0 0 24px rgba(14,165,233,0.4)';
		}
		hero.appendChild(shieldDiv);

		if (guest.exists && guest.wifiIface && guest.wifiIface.disabled !== '1') {
			hero.appendChild(el('div', 'tg-status-text', 'Guest Network Active'));
			hero.appendChild(el('div', 'tg-status-sub', (guest.wifiIface.ssid || 'Guest') + ' \u2022 Isolated from LAN'));
			var stats = el('div', 'tg-stats');
			var s1 = el('div', 'tg-stat');
			s1.appendChild(el('div', 'tg-stat-val', guest.wifiIface.ssid || '-'));
			s1.appendChild(el('div', 'tg-stat-label', 'SSID'));
			stats.appendChild(s1);
			var s2 = el('div', 'tg-stat');
			s2.appendChild(el('div', 'tg-stat-val', radioLabel(guest.wifiIface.device || '', wirelessUci)));
			s2.appendChild(el('div', 'tg-stat-label', 'Band'));
			stats.appendChild(s2);
			var s3 = el('div', 'tg-stat');
			s3.appendChild(el('div', 'tg-stat-val', String(guestClients.length)));
			s3.appendChild(el('div', 'tg-stat-label', 'Clients'));
			stats.appendChild(s3);
			hero.appendChild(stats);
		} else if (guest.exists) {
			hero.appendChild(el('div', 'tg-status-text', 'Guest Network Disabled'));
			hero.appendChild(el('div', 'tg-status-sub', (guest.wifiIface ? guest.wifiIface.ssid : 'Guest') + ' \u2022 Currently off'));
		} else {
			hero.appendChild(el('div', 'tg-status-text', 'Guest Wi-Fi'));
			hero.appendChild(el('div', 'tg-status-sub', 'Create an isolated Wi-Fi network for guests'));
		}
		root.appendChild(hero);

		if (guest.exists) {
			root.appendChild(this.renderExisting(guest, wirelessUci, devices, guestClients));
		} else {
			root.appendChild(this.renderSetup(wirelessUci, devices));
		}

		return root;
	},

	renderSetup: function(wirelessUci, devices) {
		var self = this;
		var deviceList = Object.keys(devices);

		var card = el('div', 'tg-config stor-card');
		var hdr = el('div', 'stor-card-hdr');
		hdr.innerHTML = ic(SVG.wifi, 20, 'var(--simple-accent)');
		hdr.appendChild(el('span', 'stor-card-title', 'Set Up Guest Network'));
		card.appendChild(hdr);

		var body = el('div', 'sys-card-body');
		body.style.padding = '16px 20px';

		body.appendChild(el('p', '', 'Create a separate Wi-Fi network for guests. It will be <strong>isolated from your main network</strong> \u2014 guests can access the internet but cannot see your devices, files, or printers.'));

		/* SSID */
		var r1 = el('div', 'fw-form-row');
		r1.appendChild(el('label', 'fw-form-label', 'Guest Network Name (SSID)'));
		var ssidInput = E('input', { type: 'text', 'class': 'fw-form-input', placeholder: 'MyNetwork-Guest', value: '' });
		r1.appendChild(ssidInput);
		body.appendChild(r1);

		/* Password */
		var r2 = el('div', 'fw-form-row');
		r2.appendChild(el('label', 'fw-form-label', 'Password'));
		var pwWrap = el('div', 'pw-field-wrap');
		var pwInput = E('input', { type: 'password', 'class': 'fw-form-input', placeholder: 'Guest password (min 8 chars)' });
		pwWrap.appendChild(pwInput);
		var eyeBtn = el('button', 'pw-eye-btn');
		eyeBtn.type = 'button';
		eyeBtn.innerHTML = ic(SVG.eye, 18, 'var(--simple-text-sub)');
		var pwVisible = false;
		eyeBtn.addEventListener('click', function() {
			pwVisible = !pwVisible;
			pwInput.type = pwVisible ? 'text' : 'password';
			eyeBtn.innerHTML = ic(pwVisible ? SVG.eyeOff : SVG.eye, 18, 'var(--simple-text-sub)');
		});
		pwWrap.appendChild(eyeBtn);
		r2.appendChild(pwWrap);
		body.appendChild(r2);

		/* Radio */
		if (deviceList.length > 1) {
			var r3 = el('div', 'fw-form-row');
			r3.appendChild(el('label', 'fw-form-label', 'Radio'));
			var radioSel = E('select', { 'class': 'fw-form-input' });
			deviceList.forEach(function(d) {
				var opt = E('option', { value: d }, d + ' (' + radioLabel(d, wirelessUci) + ')');
				radioSel.appendChild(opt);
			});
			r3.appendChild(radioSel);
			body.appendChild(r3);
		}

		/* Isolation info box */
		var infoBox = el('div', '');
		infoBox.style.cssText = 'background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.3);border-radius:10px;padding:14px 16px;margin-top:12px;display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--simple-text)';
		infoBox.innerHTML = ic(SVG.shield, 20, '#0ea5e9');
		infoBox.appendChild(el('span', '', '<strong>Network isolation</strong><br>Guest clients will be placed on a separate subnet (192.168.4.x) with firewall rules blocking access to your LAN. Client-to-client isolation will also be enabled.'));
		body.appendChild(infoBox);

		card.appendChild(body);

		var actions = el('div', 'sys-card-actions');
		var createBtn = el('button', 'fw-save-btn');
		createBtn.innerHTML = ic(SVG.save, 16, '#fff') + ' Create Guest Network';
		createBtn.addEventListener('click', function() {
			var ssid = ssidInput.value.trim();
			var pw = pwInput.value;
			if (!ssid) { self.showToast('Please enter a network name'); return; }
			if (pw.length < 8) { self.showToast('Password must be at least 8 characters'); return; }
			var radio = deviceList.length > 1 ? radioSel.value : deviceList[0];
			if (!radio) { self.showToast('No radio available'); return; }

			createBtn.disabled = true;
			createBtn.innerHTML = 'Creating\u2026';

			var cmd =
				'NEXT=$( for i in $(seq 0 99); do uci -q get wireless.wifinet$i >/dev/null 2>&1 || { echo $i; break; }; done ); ' +
				'SEC="wifinet$NEXT"; ' +

				'uci set network.brguest=device; ' +
				'uci set network.brguest.type="bridge"; ' +
				'uci set network.brguest.name="br-guest"; ' +

				'uci set network.guest=interface; ' +
				'uci set network.guest.proto="static"; ' +
				'uci set network.guest.ipaddr="192.168.4.1"; ' +
				'uci set network.guest.netmask="255.255.255.0"; ' +
				'uci set network.guest.device="br-guest"; ' +

				'uci set wireless.$SEC=wifi-iface; ' +
				'uci set wireless.$SEC.device="' + radio + '"; ' +
				'uci set wireless.$SEC.mode="ap"; ' +
				'uci set wireless.$SEC.ssid="' + ssid.replace(/"/g, '\\"') + '"; ' +
				'uci set wireless.$SEC.encryption="psk2"; ' +
				'uci set wireless.$SEC.key="' + pw.replace(/"/g, '\\"') + '"; ' +
				'uci set wireless.$SEC.network="guest"; ' +
				'uci set wireless.$SEC.isolate="1"; ' +

				'uci set dhcp.guest=dhcp; ' +
				'uci set dhcp.guest.interface="guest"; ' +
				'uci set dhcp.guest.start="100"; ' +
				'uci set dhcp.guest.limit="150"; ' +
				'uci set dhcp.guest.leasetime="1h"; ' +

				'uci set firewall.guest_zone=zone; ' +
				'uci set firewall.guest_zone.name="guest"; ' +
				'uci set firewall.guest_zone.network="guest"; ' +
				'uci set firewall.guest_zone.input="REJECT"; ' +
				'uci set firewall.guest_zone.output="ACCEPT"; ' +
				'uci set firewall.guest_zone.forward="REJECT"; ' +

				'uci set firewall.guest_wan=forwarding; ' +
				'uci set firewall.guest_wan.src="guest"; ' +
				'uci set firewall.guest_wan.dest="wan"; ' +

				'uci set firewall.guest_dns=rule; ' +
				'uci set firewall.guest_dns.name="Allow-Guest-DNS"; ' +
				'uci set firewall.guest_dns.src="guest"; ' +
				'uci set firewall.guest_dns.dest_port="53"; ' +
				'uci set firewall.guest_dns.proto="tcpudp"; ' +
				'uci set firewall.guest_dns.target="ACCEPT"; ' +

				'uci set firewall.guest_dhcp=rule; ' +
				'uci set firewall.guest_dhcp.name="Allow-Guest-DHCP"; ' +
				'uci set firewall.guest_dhcp.src="guest"; ' +
				'uci set firewall.guest_dhcp.dest_port="67-68"; ' +
				'uci set firewall.guest_dhcp.proto="udp"; ' +
				'uci set firewall.guest_dhcp.target="ACCEPT"; ' +

				'uci commit network; uci commit wireless; uci commit dhcp; uci commit firewall; ' +
				'/etc/init.d/network reload; wifi reload; fw4 reload 2>/dev/null; ' +
				'echo GUEST_OK';

			L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
				var out = (res && res.stdout) || '';
				if (out.indexOf('GUEST_OK') !== -1) {
					self.showToast('Guest network created successfully!');
					setTimeout(function() { window.location.reload(); }, 1500);
				} else {
					self.showToast('Error creating guest network');
					createBtn.disabled = false;
					createBtn.innerHTML = ic(SVG.save, 16, '#fff') + ' Create Guest Network';
				}
			});
		});
		actions.appendChild(createBtn);
		card.appendChild(actions);

		return card;
	},

	renderExisting: function(guest, wirelessUci, devices, guestClients) {
		var self = this;
		var frag = document.createDocumentFragment();
		var gi = guest.wifiIface || {};
		var gn = guest.network || {};
		var isEnabled = gi.disabled !== '1';

		/* Settings Card */
		var card = el('div', 'tg-config stor-card');
		var hdr = el('div', 'stor-card-hdr');
		hdr.innerHTML = ic(SVG.wifi, 20, 'var(--simple-accent)');
		hdr.appendChild(el('span', 'stor-card-title', 'Guest Network Settings'));
		card.appendChild(hdr);

		var body = el('div', 'sys-card-body');
		body.style.padding = '16px 20px';

		/* Enable/Disable toggle */
		var toggleRow = el('div', '');
		toggleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--simple-border)';
		toggleRow.appendChild(el('span', '', '<strong>Guest Network</strong><br><span style="font-size:12px;color:var(--simple-text-dim)">' + (isEnabled ? 'Broadcasting to guests' : 'Currently disabled') + '</span>'));
		var toggleLabel = document.createElement('label');
		toggleLabel.className = 'simple-switch';
		var toggleCheck = document.createElement('input');
		toggleCheck.type = 'checkbox';
		toggleCheck.checked = isEnabled;
		toggleLabel.appendChild(toggleCheck);
		toggleLabel.appendChild(el('span', 'simple-switch-slider'));
		toggleRow.appendChild(toggleLabel);
		body.appendChild(toggleRow);

		toggleCheck.addEventListener('change', function() {
			var val = toggleCheck.checked ? '0' : '1';
			var sec = gi['.name'];
			var cmd = 'uci set wireless.' + sec + '.disabled="' + val + '"; uci commit wireless; wifi reload; echo TOG_OK';
			toggleCheck.disabled = true;
			L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
				var out = (res && res.stdout) || '';
				if (out.indexOf('TOG_OK') !== -1) {
					self.showToast(toggleCheck.checked ? 'Guest network enabled' : 'Guest network disabled');
					setTimeout(function() { window.location.reload(); }, 1500);
				} else {
					self.showToast('Error toggling guest network');
					toggleCheck.disabled = false;
				}
			});
		});

		/* SSID */
		var r1 = el('div', 'fw-form-row');
		r1.appendChild(el('label', 'fw-form-label', 'Network Name (SSID)'));
		var ssidInput = E('input', { type: 'text', 'class': 'fw-form-input', value: gi.ssid || '' });
		r1.appendChild(ssidInput);
		body.appendChild(r1);

		/* Password */
		var r2 = el('div', 'fw-form-row');
		r2.appendChild(el('label', 'fw-form-label', 'Password'));
		var pwWrap = el('div', 'pw-field-wrap');
		var pwInput = E('input', { type: 'password', 'class': 'fw-form-input', value: gi.key || '' });
		pwWrap.appendChild(pwInput);
		var eyeBtn = el('button', 'pw-eye-btn');
		eyeBtn.type = 'button';
		eyeBtn.innerHTML = ic(SVG.eye, 18, 'var(--simple-text-sub)');
		var pwVis = false;
		eyeBtn.addEventListener('click', function() {
			pwVis = !pwVis;
			pwInput.type = pwVis ? 'text' : 'password';
			eyeBtn.innerHTML = ic(pwVis ? SVG.eyeOff : SVG.eye, 18, 'var(--simple-text-sub)');
		});
		pwWrap.appendChild(eyeBtn);
		r2.appendChild(pwWrap);
		body.appendChild(r2);

		/* Radio selector */
		var deviceList = Object.keys(devices);
		if (deviceList.length > 1) {
			var r3 = el('div', 'fw-form-row');
			r3.appendChild(el('label', 'fw-form-label', 'Radio'));
			var radioSel = E('select', { 'class': 'fw-form-input' });
			deviceList.forEach(function(d) {
				var opt = E('option', { value: d }, d + ' (' + radioLabel(d, wirelessUci) + ')');
				if (d === gi.device) opt.selected = true;
				radioSel.appendChild(opt);
			});
			r3.appendChild(radioSel);
			body.appendChild(r3);
		}

		/* Client Isolation Toggle */
		var isolRow = el('div', '');
		isolRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:16px;border-top:1px solid var(--simple-border)';
		isolRow.appendChild(el('span', '', '<strong>Client Isolation</strong><br><span style="font-size:12px;color:var(--simple-text-dim)">Prevent guests from seeing each other</span>'));
		var isolLabel = document.createElement('label');
		isolLabel.className = 'simple-switch';
		var isolCheck = document.createElement('input');
		isolCheck.type = 'checkbox';
		isolCheck.checked = gi.isolate === '1';
		isolLabel.appendChild(isolCheck);
		isolLabel.appendChild(el('span', 'simple-switch-slider'));
		isolRow.appendChild(isolLabel);
		body.appendChild(isolRow);

		card.appendChild(body);

		/* Save button */
		var actions = el('div', 'sys-card-actions');
		var saveBtn = el('button', 'fw-save-btn');
		saveBtn.innerHTML = ic(SVG.save, 16, '#fff') + ' Save Changes';
		saveBtn.addEventListener('click', function() {
			var ssid = ssidInput.value.trim();
			var pw = pwInput.value;
			if (!ssid) { self.showToast('Please enter a network name'); return; }
			if (pw.length < 8) { self.showToast('Password must be at least 8 characters'); return; }

			saveBtn.disabled = true;
			saveBtn.innerHTML = 'Saving\u2026';

			var sec = gi['.name'];
			var cmd =
				'uci set wireless.' + sec + '.ssid="' + ssid.replace(/"/g, '\\"') + '"; ' +
				'uci set wireless.' + sec + '.key="' + pw.replace(/"/g, '\\"') + '"; ' +
				'uci set wireless.' + sec + '.isolate="' + (isolCheck.checked ? '1' : '0') + '"; ';

			if (deviceList.length > 1) {
				cmd += 'uci set wireless.' + sec + '.device="' + radioSel.value + '"; ';
			}

			cmd += 'uci commit wireless; wifi reload; echo SAVE_OK';

			L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
				var out = (res && res.stdout) || '';
				if (out.indexOf('SAVE_OK') !== -1) {
					self.showToast('Guest network settings saved!');
					setTimeout(function() { window.location.reload(); }, 1500);
				} else {
					self.showToast('Error saving settings');
					saveBtn.disabled = false;
					saveBtn.innerHTML = ic(SVG.save, 16, '#fff') + ' Save Changes';
				}
			});
		});
		actions.appendChild(saveBtn);
		card.appendChild(actions);
		frag.appendChild(card);

		/* Connected Clients Card */
		var clientCard = el('div', 'tg-config stor-card');
		var clHdr = el('div', 'stor-card-hdr');
		clHdr.innerHTML = ic(SVG.device, 20, 'var(--simple-accent)');
		clHdr.appendChild(el('span', 'stor-card-title', 'Connected Guests (' + guestClients.length + ')'));
		clientCard.appendChild(clHdr);

		var clBody = el('div', 'sys-card-body');
		clBody.style.padding = '16px 20px';

		if (guestClients.length === 0) {
			clBody.appendChild(el('p', '', '<span style="color:var(--simple-text-dim)">No guests currently connected.</span>'));
		} else {
			guestClients.forEach(function(c) {
				var row = el('div', '');
				row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--simple-border,rgba(255,255,255,0.06))';
				var left = el('div', '');
				left.innerHTML = '<strong>' + c.name + '</strong><br><span style="font-size:12px;color:var(--simple-text-dim)">' + c.mac + '</span>';
				row.appendChild(left);
				row.appendChild(el('span', '', '<code style="font-size:13px">' + c.ip + '</code>'));
				clBody.appendChild(row);
			});
		}
		clientCard.appendChild(clBody);
		frag.appendChild(clientCard);

		/* Network Info Card */
		var netCard = el('div', 'tg-config stor-card');
		var netHdr = el('div', 'stor-card-hdr');
		netHdr.innerHTML = ic(SVG.shield, 20, 'var(--simple-accent)');
		netHdr.appendChild(el('span', 'stor-card-title', 'Isolation Details'));
		netCard.appendChild(netHdr);

		var netBody = el('div', 'sys-card-body');
		netBody.style.padding = '16px 20px';
		var details = [
			['Subnet', (gn.ipaddr || '192.168.4.1') + '/' + (gn.netmask || '255.255.255.0')],
			['DHCP Range', '.100 \u2013 .250'],
			['Firewall Zone', 'guest (REJECT input, REJECT forward)'],
			['Internet Access', 'Allowed (guest \u2192 wan)'],
			['LAN Access', 'Blocked']
		];
		details.forEach(function(r) {
			var row = el('div', '');
			row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--simple-border,rgba(255,255,255,0.06))';
			row.appendChild(el('span', '', '<span style="color:var(--simple-text-dim)">' + r[0] + '</span>'));
			row.appendChild(el('span', '', '<strong>' + r[1] + '</strong>'));
			netBody.appendChild(row);
		});
		netCard.appendChild(netBody);
		frag.appendChild(netCard);

		/* Remove Guest Network Card */
		var rmCard = el('div', 'tg-config stor-card');
		var rmHdr = el('div', 'stor-card-hdr');
		rmHdr.innerHTML = ic(SVG.warning, 20, '#ef4444');
		rmHdr.appendChild(el('span', 'stor-card-title', 'Remove Guest Network'));
		rmCard.appendChild(rmHdr);

		var rmBody = el('div', 'sys-card-body');
		rmBody.style.padding = '16px 20px';
		rmBody.appendChild(el('p', '', 'Remove the guest Wi-Fi network and all associated configuration (interface, firewall zone, DHCP pool). This will disconnect all guest clients.'));

		var rmActions = el('div', 'sys-card-actions');
		var rmBtn = el('button', 'fw-save-btn');
		rmBtn.style.background = '#ef4444';
		rmBtn.innerHTML = ic(SVG.trash, 16, '#fff') + ' Remove Guest Network';
		rmBtn.addEventListener('click', function() {
			if (!confirm('Remove the guest network? All guest clients will be disconnected.')) return;

			rmBtn.disabled = true;
			rmBtn.innerHTML = 'Removing\u2026';

			var sec = gi['.name'];
			var cmd =
				'uci delete wireless.' + sec + '; ' +
				'uci delete network.guest; ' +
				'uci delete network.brguest 2>/dev/null; ' +
				'uci delete dhcp.guest; ' +
				'uci delete firewall.guest_zone; ' +
				'uci delete firewall.guest_wan; ' +
				'uci delete firewall.guest_dns; ' +
				'uci delete firewall.guest_dhcp; ' +
				'uci commit wireless; uci commit network; uci commit dhcp; uci commit firewall; ' +
				'/etc/init.d/network reload; wifi reload; fw4 reload 2>/dev/null; ' +
				'echo RM_OK';

			L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
				var out = (res && res.stdout) || '';
				if (out.indexOf('RM_OK') !== -1) {
					self.showToast('Guest network removed');
					setTimeout(function() { window.location.reload(); }, 1500);
				} else {
					self.showToast('Error removing guest network');
					rmBtn.disabled = false;
					rmBtn.innerHTML = ic(SVG.trash, 16, '#fff') + ' Remove Guest Network';
				}
			});
		});
		rmActions.appendChild(rmBtn);
		rmCard.appendChild(rmBody);
		rmCard.appendChild(rmActions);
		frag.appendChild(rmCard);

		return frag;
	}
});
