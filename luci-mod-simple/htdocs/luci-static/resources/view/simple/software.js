'use strict';
'require view';
'require rpc';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });

var SVG = {
	pkg: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
	vpn: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
	media: '<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 15l2.5-3.21 1.79 2.15 2.5-3.22L19 15H5z"/></svg>',
	share: '<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
	usb: '<svg viewBox="0 0 24 24"><path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.21.99 2.2 2.2 2.2 1.21 0 2.2-.99 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/></svg>',
	phone: '<svg viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>',
	cell: '<svg viewBox="0 0 24 24"><path d="M17.5 14.33C18.29 14.33 19 13.62 19 12.83V7.17c0-.79-.71-1.5-1.5-1.5H14v1.5h3v5.17h-3V14h2.5v.33zM1 14h3.5v-1.5H2.5v-1H4V10H1v4zm7-4H5.5v4H7v-1.5h1c.55 0 1-.45 1-1v-1c0-.55-.45-1.5-1-1.5zm0 2H7v-1h1v1zm11-2h-1.5v4H19v-1.5h1c.55 0 1-.45 1-1v-1c0-.55-.45-.5-1-.5zm0 2h-1v-1h1v1zM8.5 14H12c.55 0 1-.45 1-1v-1.5c0-.55-.45-1-1-1h-2v-1h3V8H8.5c-.55 0-1 .45-1 1v1.5c0 .55.45 1 1 1h2v1h-3V14z"/></svg>',
	net: '<svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
	printer: '<svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>',
	download: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
	del: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	qos: '<svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l4.59-4.58L16 11l-6 6z"/></svg>',
	docker: '<svg viewBox="0 0 24 24"><path d="M21.81 10.25c-.06-.04-.56-.43-1.64-.43-.28 0-.56.03-.84.08-.21-1.4-1.38-2.11-1.43-2.14l-.29-.17-.18.27c-.24.36-.43.77-.51 1.19-.2.8-.08 1.56.34 2.19-.5.28-1.3.35-1.46.35H2.84c-.34 0-.62.28-.62.63 0 1.17.18 2.34.56 3.39.42 1.18 1.05 2.05 1.86 2.57.94.6 2.47.94 4.18.94.78 0 1.59-.08 2.39-.24.96-.19 1.88-.52 2.72-1 .72-.4 1.36-.92 1.93-1.52 1.11-1.23 1.81-2.45 2.3-3.49h.2c1.24 0 2.01-.5 2.44-.93.28-.28.5-.6.63-.96l.08-.24-.7-.43zM4.5 10.83h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15H4.5c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.62 0h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15H7.12c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.64 0h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15H9.76c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.63 0h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15h-1.83c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zM7.12 8.21h1.83c.09 0 .15-.07.15-.15V6.39c0-.09-.07-.15-.15-.15H7.12c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.64 0h1.83c.09 0 .15-.07.15-.15V6.39c0-.09-.07-.15-.15-.15H9.76c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.63 0h1.83c.09 0 .15-.07.15-.15V6.39c0-.09-.07-.15-.15-.15h-1.83c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15z"/></svg>'
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

var BUNDLES = [
	{
		id: 'wireguard',
		name: 'VPN (WireGuard)',
		desc: 'Fast, modern VPN tunnel. Required for TorGuard WireGuard and custom WireGuard configs.',
		icon: SVG.vpn,
		color: '#7c3aed',
		packages: ['wireguard-tools', 'kmod-wireguard', 'luci-proto-wireguard', 'qrencode'],
		local_ipks: ['tgwireguard_2.0.9-r0_all.ipk', 'tgwireguard2_2.0.9-r0_all.ipk']
	},
	{
		id: 'openvpn',
		name: 'VPN (OpenVPN)',
		desc: 'Trusted, versatile VPN protocol. Required for TorGuard OpenVPN connections.',
		icon: SVG.vpn,
		color: '#ea580c',
		packages: ['openvpn-openssl'],
		local_ipks: ['tgopenvpn_25.052.15245.cfd9c4d_all.ipk']
	},
	{
		id: 'v2ray',
		name: 'VPN (V2Ray / sing-box)',
		desc: 'Advanced proxy and tunneling platform. Required for TorGuard V2Ray connections.',
		icon: SVG.vpn,
		color: '#0891b2',
		packages: ['sing-box', 'curl', 'jq', 'bash', 'coreutils-base64'],
		local_ipks: ['tgv2ray_1.0.0-6_all.ipk']
	},
	{
		id: 'smb',
		name: 'SMB File Sharing',
		desc: 'Share folders over the network so Windows, Mac, and Linux computers can access router storage.',
		icon: SVG.share,
		color: '#0ea5e9',
		packages: ['samba4-server', 'luci-app-samba4', 'wsdd2']
	},
	{
		id: 'dlna',
		name: 'DLNA Media Server',
		desc: 'Stream music, photos, and videos to smart TVs, phones, and media players on your network.',
		icon: SVG.media,
		color: '#f97316',
		packages: ['minidlna', 'luci-app-minidlna']
	},
	{
		id: 'usb',
		name: 'USB & Storage Support',
		desc: 'Mount USB drives, SD cards, and external storage. Includes filesystem support for EXT4, FAT, NTFS, and exFAT.',
		icon: SVG.usb,
		color: '#10b981',
		packages: ['kmod-usb-storage', 'kmod-usb-storage-uas', 'block-mount', 'e2fsprogs',
			'kmod-fs-ext4', 'kmod-fs-vfat', 'kmod-fs-ntfs3', 'kmod-fs-exfat',
			'kmod-nls-cp437', 'kmod-nls-iso8859-1', 'kmod-nls-utf8']
	},
	{
		id: 'tether-android',
		name: 'USB Tethering (Android)',
		desc: 'Use an Android phone\'s mobile data connection as WAN via USB tethering.',
		icon: SVG.phone,
		color: '#3b82f6',
		packages: ['kmod-usb-net-rndis', 'kmod-usb-net-cdc-ether']
	},
	{
		id: 'tether-ios',
		name: 'USB Tethering (iPhone)',
		desc: 'Use an iPhone\'s mobile data connection as WAN via USB tethering.',
		icon: SVG.phone,
		color: '#6366f1',
		packages: ['kmod-usb-net-ipheth', 'usbmuxd', 'libimobiledevice', 'libusbmuxd']
	},
	{
		id: 'cell4g',
		name: '4G/LTE Cellular WAN',
		desc: 'Connect a USB 4G/LTE modem as your internet source. Supports QMI, NCM, and MBIM modems.',
		icon: SVG.cell,
		color: '#ef4444',
		packages: ['comgt', 'kmod-usb-serial', 'kmod-usb-serial-option', 'kmod-usb-serial-wwan',
			'usb-modeswitch', 'kmod-usb-net-qmi-wwan', 'uqmi',
			'kmod-usb-net-cdc-mbim', 'umbim',
			'kmod-usb-net-huawei-cdc-ncm', 'luci-proto-qmi', 'luci-proto-ncm', 'luci-proto-mbim']
	},
	{
		id: 'qos',
		name: 'QoS / Traffic Shaping',
		desc: 'Prioritize traffic and set bandwidth limits per device or application for a smoother network experience.',
		icon: SVG.qos,
		color: '#8b5cf6',
		packages: ['tc-full', 'kmod-sched-core', 'kmod-sched-cake', 'luci-app-sqm', 'sqm-scripts']
	},
	{
		id: 'print',
		name: 'Network Printing',
		desc: 'Share a USB printer over the network so any device can print wirelessly.',
		icon: SVG.printer,
		color: '#ec4899',
		packages: ['p910nd', 'luci-app-p910nd', 'kmod-usb-printer']
	},
	{
		id: 'docker',
		name: 'Docker Containers',
		desc: 'Run Docker containers on your router for advanced services like Pi-hole, AdGuard Home, and more.',
		icon: SVG.docker,
		color: '#2563eb',
		packages: ['dockerd', 'docker', 'luci-app-dockerman']
	},
	{
		id: 'adblock',
		name: 'Adblock (DNS)',
		desc: 'Network-wide ad and tracker blocking at the DNS level. Protects all devices on your network without any client software.',
		icon: SVG.vpn,
		color: '#7c3aed',
		packages: ['adblock', 'luci-app-adblock']
	},
	{
		id: 'mt76wifi',
		name: 'Mediatek Wi-Fi Drivers',
		desc: 'Drivers for popular Alfa USB Wi-Fi adapters using Mediatek MT76 chipsets (MT7612U, MT7610U, etc.).',
		icon: SVG.net,
		color: '#14b8a6',
		packages: ['kmod-mt76', 'kmod-mt76-core', 'kmod-mt76-usb', 'kmod-mt76x2u']
	},
	{
		id: 'athwifi',
		name: 'Qualcomm Atheros Wi-Fi Drivers',
		desc: 'Drivers for Qualcomm Atheros Wi-Fi adapters including ath9k, ath10k, and ath11k chipsets.',
		icon: SVG.net,
		color: '#0284c7',
		packages: ['kmod-ath11k', 'kmod-ath10k-ct', 'kmod-ath10k', 'kmod-ath9k', 'kmod-ath9k-htc']
	},
	{
		id: 'easymesh',
		name: 'EasyMesh (Batman-adv)',
		desc: 'Create a mesh Wi-Fi network across multiple routers for seamless whole-home coverage using Batman-adv.',
		icon: SVG.net,
		color: '#059669',
		packages: ['kmod-batman-adv', 'batctl-default'],
		local_ipks: ['luci-app-easymesh_3.8.17-r1_all.ipk']
	},
	{
		id: 'snort3',
		name: 'Intrusion Detection (Snort3)',
		desc: 'Network intrusion detection and prevention system. Monitors traffic for threats, attacks, and suspicious activity in real time.',
		icon: SVG.vpn,
		color: '#dc2626',
		packages: ['snort3']
	},
	{
		id: 'banip',
		name: 'IP Ban (banIP)',
		desc: 'Block malicious IPs at the firewall level using threat intelligence feeds, country blocks, and auto-detection of brute-force attacks.',
		icon: SVG.vpn,
		color: '#ef4444',
		packages: ['banip', 'luci-app-banip']
	}
];

return view.extend({
	_installed: {},

	load: function() {
		return L.resolveDefault(callFileExec('/bin/sh', ['-c',
			"opkg list-installed 2>/dev/null | awk '{print $1}'"
		]), {});
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 4000);
	},

	parseInstalled: function(stdout) {
		var map = {};
		(stdout || '').trim().split('\n').forEach(function(p) {
			p = p.trim();
			if (p) map[p] = true;
		});
		return map;
	},

	bundleInstalled: function(bundle) {
		var self = this;
		var installed = 0;
		var allPkgs = bundle.packages.slice();
		(bundle.local_ipks || []).forEach(function(f) { allPkgs.push(self.ipkPkgName(f)); });
		allPkgs.forEach(function(p) { if (self._installed[p]) installed++; });
		return { installed: installed, total: allPkgs.length, full: installed === allPkgs.length };
	},

	ipkPkgName: function(filename) {
		return filename.replace(/_[0-9].*$/, '');
	},

	runPkgAction: function(action, bundle, btn, statusEl) {
		var self = this;
		var packages = bundle.packages;
		var localIpks = bundle.local_ipks || [];
		var IPK_DIR = '/usr/share/gulf/ipks/';

		btn.disabled = true;
		btn.style.opacity = '0.6';
		statusEl.textContent = (action === 'install' ? 'Installing' : 'Removing') + '...';
		statusEl.style.color = '#f59e0b';

		var cmds = [];
		if (action === 'install') {
			cmds.push('opkg update 2>&1');
			packages.forEach(function(p) { cmds.push('opkg install ' + p + ' 2>&1'); });
			localIpks.forEach(function(f) { cmds.push('opkg install ' + IPK_DIR + f + ' 2>&1'); });
		} else {
			localIpks.slice().reverse().forEach(function(f) {
				cmds.push('opkg remove ' + self.ipkPkgName(f) + ' 2>&1');
			});
			packages.slice().reverse().forEach(function(p) { cmds.push('opkg remove ' + p + ' 2>&1'); });
		}

		var cmd = cmds.join(' ; ') + ' ; echo __DONE__';
		L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var out = (res && res.stdout) || '';
			var ok = out.indexOf('__DONE__') !== -1;
			statusEl.textContent = ok ? (action === 'install' ? 'Installed!' : 'Removed!') : 'Error';
			statusEl.style.color = ok ? '#10b981' : '#ef4444';
			btn.disabled = false;
			btn.style.opacity = '1';
			if (ok) {
				self.showToast((action === 'install' ? 'Packages installed' : 'Packages removed') + ' successfully');
				setTimeout(function() { window.location.reload(); }, 2000);
			}
		});
	},

	render: function(data) {
		var self = this;
		this._installed = this.parseInstalled(data ? data.stdout : '');

		var root = el('div', 'simple-page');
		var cssLink = el('link'); cssLink.rel = 'stylesheet'; cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)';
		var iconDiv = el('div', 'tg-shield connected');
		iconDiv.innerHTML = icon(SVG.pkg, 40, '#fff');
		iconDiv.style.background = 'rgba(79,70,229,0.3)';
		iconDiv.style.boxShadow = '0 0 24px rgba(79,70,229,0.4)';
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text', 'Software'));
		hero.appendChild(el('div', 'tg-status-sub', 'Install or remove feature packages with one click'));

		var totalPkgs = Object.keys(this._installed).length;
		var stats = el('div', 'tg-stats');
		var s1 = el('div', 'tg-stat');
		s1.appendChild(el('div', 'tg-stat-val', String(totalPkgs)));
		s1.appendChild(el('div', 'tg-stat-label', 'Installed'));
		stats.appendChild(s1);
		var s2 = el('div', 'tg-stat');
		s2.appendChild(el('div', 'tg-stat-val', String(BUNDLES.length)));
		s2.appendChild(el('div', 'tg-stat-label', 'Bundles'));
		stats.appendChild(s2);
		hero.appendChild(stats);
		root.appendChild(hero);

		/* ── Update feeds button ── */
		var updateRow = el('div', 'sw-update-row');
		var updateBtn = el('button', 'fw-add-btn');
		updateBtn.innerHTML = icon(SVG.refresh, 14, '#fff') + ' Update Package Lists';
		updateBtn.addEventListener('click', function() {
			updateBtn.disabled = true;
			updateBtn.innerHTML = icon(SVG.refresh, 14, '#fff') + ' Updating...';
			L.resolveDefault(callFileExec('/bin/sh', ['-c', 'opkg update 2>&1 ; echo __DONE__']), {}).then(function(res) {
				var ok = (res && res.stdout || '').indexOf('__DONE__') !== -1;
				self.showToast(ok ? 'Package lists updated!' : 'Update failed');
				updateBtn.disabled = false;
				updateBtn.innerHTML = icon(SVG.refresh, 14, '#fff') + ' Update Package Lists';
			});
		});
		updateRow.appendChild(updateBtn);
		root.appendChild(updateRow);

		/* ── Bundle Cards ── */
		var grid = el('div', 'sw-grid');

		BUNDLES.forEach(function(b) {
			var status = self.bundleInstalled(b);
			var card = el('div', 'sw-card');

			var cardHdr = el('div', 'sw-card-hdr');
			var cardIcon = el('div', 'sw-card-icon');
			cardIcon.innerHTML = icon(b.icon, 28, '#fff');
			cardIcon.style.background = b.color;
			cardHdr.appendChild(cardIcon);

			var cardInfo = el('div', 'sw-card-info');
			var nameRow = el('div', 'sw-card-name-row');
			nameRow.appendChild(el('span', 'sw-card-name', b.name));
			if (status.full) {
				nameRow.appendChild(el('span', 'fw-status-on', 'Installed'));
			} else if (status.installed > 0) {
				nameRow.appendChild(el('span', 'sw-partial-badge', status.installed + '/' + status.total));
			}
			cardInfo.appendChild(nameRow);
			cardInfo.appendChild(el('div', 'sw-card-desc', b.desc));
			cardHdr.appendChild(cardInfo);
			card.appendChild(cardHdr);

			var pkgList = el('div', 'sw-pkg-list');
			b.packages.forEach(function(p) {
				var pkgItem = el('div', 'sw-pkg-item');
				var pkgStatus = self._installed[p]
					? el('span', 'sw-pkg-dot sw-pkg-installed')
					: el('span', 'sw-pkg-dot sw-pkg-missing');
				pkgItem.appendChild(pkgStatus);
				pkgItem.appendChild(el('span', 'sw-pkg-name', p));
				pkgList.appendChild(pkgItem);
			});
			(b.local_ipks || []).forEach(function(f) {
				var pName = self.ipkPkgName(f);
				var pkgItem = el('div', 'sw-pkg-item');
				var pkgStatus = self._installed[pName]
					? el('span', 'sw-pkg-dot sw-pkg-installed')
					: el('span', 'sw-pkg-dot sw-pkg-missing');
				pkgItem.appendChild(pkgStatus);
				pkgItem.appendChild(el('span', 'sw-pkg-name', pName + ' (bundled)'));
				pkgList.appendChild(pkgItem);
			});
			card.appendChild(pkgList);

			var cardActions = el('div', 'sw-card-actions');
			var statusText = el('span', 'sw-status-text', '');

			if (status.full) {
				var rmBtn = el('button', 'sw-rm-btn');
				rmBtn.innerHTML = icon(SVG.del, 13) + ' Uninstall';
				rmBtn.addEventListener('click', function() {
					if (confirm('Remove all ' + b.name + ' packages?'))
						self.runPkgAction('remove', b, rmBtn, statusText);
				});
				cardActions.appendChild(rmBtn);
			} else {
				var instBtn = el('button', 'sw-inst-btn');
				instBtn.innerHTML = icon(SVG.download, 14, '#fff') + ' Install';
				instBtn.style.background = 'linear-gradient(135deg, ' + b.color + ', ' + b.color + 'cc)';
				instBtn.addEventListener('click', function() {
					self.runPkgAction('install', b, instBtn, statusText);
				});
				cardActions.appendChild(instBtn);
			}

			cardActions.appendChild(statusText);
			card.appendChild(cardActions);
			grid.appendChild(card);
		});

		root.appendChild(grid);
		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
