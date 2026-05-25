'use strict';
'require view';
'require dom';
'require poll';
'require rpc';
'require uci';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });

var SVG = {
	hdd: '<svg viewBox="0 0 24 24"><path d="M20 6H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H4V8h16v8zm-2-1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-3 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/></svg>',
	usb: '<svg viewBox="0 0 24 24"><path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.21.99 2.2 2.2 2.2 1.21 0 2.2-.99 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/></svg>',
	sdcard: '<svg viewBox="0 0 24 24"><path d="M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 6h-2V4h2v4zm3 0h-2V4h2v4zm3 0h-2V4h2v4z"/></svg>',
	folder: '<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
	share: '<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
	media: '<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 15l2.5-3.21 1.79 2.15 2.5-3.22L19 15H5z"/></svg>',
	eject: '<svg viewBox="0 0 24 24"><path d="M5 17h14v2H5zm7-12L5.33 15h13.34z"/></svg>',
	mount: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
	info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
	close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
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

function formatSize(kb) {
	if (!kb || kb <= 0) return '0 B';
	if (kb < 1024) return kb + ' KB';
	if (kb < 1048576) return (kb / 1024).toFixed(1) + ' MB';
	return (kb / 1048576).toFixed(1) + ' GB';
}

function guessDeviceIcon(dev) {
	dev = (dev || '').toLowerCase();
	if (dev.match(/mmcblk|mmc/)) return { icon: SVG.sdcard, label: 'SD Card' };
	if (dev.match(/usb|sd[a-z]/)) return { icon: SVG.usb, label: 'USB Drive' };
	if (dev.match(/nvme/)) return { icon: SVG.hdd, label: 'NVMe SSD' };
	return { icon: SVG.hdd, label: 'Disk' };
}

function usagePercent(used, total) {
	if (!total || total <= 0) return 0;
	return Math.min(100, Math.round((used / total) * 100));
}

function usageColor(pct) {
	if (pct > 90) return '#ef4444';
	if (pct > 70) return '#f59e0b';
	return '#10b981';
}

return view.extend({
	load: function() {
		var mountCmd = "cat /proc/mounts 2>/dev/null | grep -E '^/dev/' | grep -v ' /rom ' | grep -v ' / ' | grep -v ' /overlay '";
		var blockCmd = "block info 2>/dev/null || blkid 2>/dev/null";
		var dfCmd = "df -k 2>/dev/null | grep -E '^/dev/'";
		var smbCheck = "[ -f /etc/init.d/samba4 ] && echo 'samba4' || ([ -f /etc/init.d/ksmbd ] && echo 'ksmbd' || echo 'none')";
		var dlnaCheck = "[ -f /etc/init.d/minidlna ] && echo 'minidlna' || echo 'none'";
		var smbStatus = "([ -f /etc/init.d/samba4 ] && /etc/init.d/samba4 enabled 2>/dev/null && echo 'enabled' || ([ -f /etc/init.d/ksmbd ] && /etc/init.d/ksmbd enabled 2>/dev/null && echo 'enabled' || echo 'disabled'))";
		var dlnaStatus = "([ -f /etc/init.d/minidlna ] && /etc/init.d/minidlna enabled 2>/dev/null && echo 'enabled' || echo 'disabled')";
		var lsblkCmd = "lsblk -b -n -o NAME,SIZE,TYPE,MOUNTPOINT,FSTYPE,LABEL,MODEL 2>/dev/null || echo ''";

		return Promise.all([
			L.resolveDefault(callFileExec('/bin/sh', ['-c', mountCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', blockCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', dfCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', smbCheck]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', dlnaCheck]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', smbStatus]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', dlnaStatus]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', lsblkCmd]), {})
		]);
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	parseMounts: function(stdout) {
		var mounts = {};
		(stdout || '').trim().split('\n').forEach(function(line) {
			var p = line.trim().split(/\s+/);
			if (p.length >= 3) mounts[p[0]] = { device: p[0], mountpoint: p[1], fstype: p[2] };
		});
		return mounts;
	},

	parseBlockInfo: function(stdout) {
		var blocks = {};
		(stdout || '').trim().split('\n').forEach(function(line) {
			var m = line.match(/^(\/dev\/\S+):/);
			if (!m) return;
			var dev = m[1];
			var info = { device: dev };
			var uuidM = line.match(/UUID="([^"]+)"/);
			var labelM = line.match(/LABEL="([^"]+)"/);
			var typeM = line.match(/TYPE="([^"]+)"/);
			var mountM = line.match(/MOUNT="([^"]+)"/);
			if (uuidM) info.uuid = uuidM[1];
			if (labelM) info.label = labelM[1];
			if (typeM) info.fstype = typeM[1];
			if (mountM) info.mountpoint = mountM[1];
			blocks[dev] = info;
		});
		return blocks;
	},

	parseDf: function(stdout) {
		var df = {};
		(stdout || '').trim().split('\n').forEach(function(line) {
			var p = line.trim().split(/\s+/);
			if (p.length >= 6) {
				df[p[0]] = { total: parseInt(p[1]) || 0, used: parseInt(p[2]) || 0, avail: parseInt(p[3]) || 0, mountpoint: p[5] };
			}
		});
		return df;
	},

	parseLsblk: function(stdout) {
		var devices = [];
		(stdout || '').trim().split('\n').forEach(function(line) {
			if (!line.trim()) return;
			var p = line.trim().split(/\s+/);
			if (p.length >= 3) {
				var name = p[0].replace(/[^a-zA-Z0-9]/g, '');
				devices.push({
					name: name,
					size: parseInt(p[1]) || 0,
					type: p[2] || '',
					mountpoint: p[3] || '',
					fstype: p[4] || '',
					label: p[5] || '',
					model: p.slice(6).join(' ') || ''
				});
			}
		});
		return devices;
	},

	mountDevice: function(dev) {
		var self = this;
		var label = dev.replace('/dev/', '');
		var mountpoint = '/mnt/' + label;
		var script = [
			'#!/bin/sh',
			'DEV="' + dev + '"',
			'MP="' + mountpoint + '"',
			'FS=$(blkid "$DEV" -s TYPE -o value 2>/dev/null)',
			'UUID=$(blkid "$DEV" -s UUID -o value 2>/dev/null)',
			'[ "$FS" = "ntfs" ] && FS=ntfs3',
			'mkdir -p "$MP"',
			'if [ -n "$FS" ]; then mount -t "$FS" "$DEV" "$MP" 2>&1',
			'else mount "$DEV" "$MP" 2>&1; fi',
			'if [ $? -ne 0 ]; then echo FAIL; exit 1; fi',
			'# Add persistent fstab entry',
			'FOUND=0',
			'for idx in 0 1 2 3 4 5 6 7 8 9; do',
			'  D=$(uci -q get fstab.@mount[$idx].device 2>/dev/null) || break',
			'  if [ "$D" = "$DEV" ]; then',
			'    uci set fstab.@mount[$idx].target="$MP"',
			'    uci set fstab.@mount[$idx].enabled=1',
			'    FOUND=1; break',
			'  fi',
			'done',
			'if [ "$FOUND" = "0" ]; then',
			'  echo "config mount" >> /etc/config/fstab',
			'  echo "	option device \'$DEV\'" >> /etc/config/fstab',
			'  [ -n "$UUID" ] && echo "	option uuid \'$UUID\'" >> /etc/config/fstab',
			'  echo "	option target \'$MP\'" >> /etc/config/fstab',
			'  echo "	option enabled \'1\'" >> /etc/config/fstab',
			'  echo "" >> /etc/config/fstab',
			'fi',
			'uci commit fstab 2>/dev/null',
			'/etc/init.d/fstab enable 2>/dev/null',
			'echo OK'
		].join('\n');
		return L.resolveDefault(callFileExec('/bin/sh', ['-c', script]), {}).then(function(res) {
			var ok = res && res.stdout && res.stdout.indexOf('OK') !== -1;
			self.showToast(ok ? t('Mounted %s at %s (persistent)', dev, mountpoint) : t('Failed to mount %s', dev));
			if (ok) setTimeout(function() { window.location.reload(); }, 1500);
		});
	},

	unmountDevice: function(dev) {
		var self = this;
		var script = [
			'#!/bin/sh',
			'DEV="' + dev + '"',
			'umount "$DEV" 2>&1',
			'if [ $? -ne 0 ]; then echo FAIL; exit 1; fi',
			'for idx in 0 1 2 3 4 5 6 7 8 9; do',
			'  D=$(uci -q get fstab.@mount[$idx].device 2>/dev/null) || break',
			'  if [ "$D" = "$DEV" ]; then',
			'    uci set fstab.@mount[$idx].enabled=0',
			'  fi',
			'done',
			'uci commit fstab 2>/dev/null',
			'echo OK'
		].join('\n');
		return L.resolveDefault(callFileExec('/bin/sh', ['-c', script]), {}).then(function(res) {
			var ok = res && res.stdout && res.stdout.indexOf('OK') !== -1;
			self.showToast(ok ? t('Unmounted %s', dev) : t('Failed to unmount (device may be busy)'));
			if (ok) setTimeout(function() { window.location.reload(); }, 1500);
		});
	},

	toggleService: function(service, enable) {
		var self = this;
		var isSamba = (service === 'samba4' || service === 'ksmbd');

		if (isSamba && enable) {
			var cmd =
				'# Auto-create shares for all mounted storage\n' +
				'MOUNTS=$(grep "/mnt/" /proc/mounts | awk \'{print $2}\')\n' +
				'HAS_SHARE=$(uci show ' + service + ' 2>/dev/null | grep sambashare)\n' +
				'if [ -z "$HAS_SHARE" ]; then\n' +
				'  for MP in $MOUNTS; do\n' +
				'    SNAME=$(basename $MP)\n' +
				'    uci add ' + service + ' sambashare\n' +
				'    uci set ' + service + '.@sambashare[-1].name="$SNAME"\n' +
				'    uci set ' + service + '.@sambashare[-1].path="$MP"\n' +
				'    uci set ' + service + '.@sambashare[-1].read_only="no"\n' +
				'    uci set ' + service + '.@sambashare[-1].guest_ok="yes"\n' +
				'    uci set ' + service + '.@sambashare[-1].create_mask="0666"\n' +
				'    uci set ' + service + '.@sambashare[-1].dir_mask="0777"\n' +
				'    uci set ' + service + '.@sambashare[-1].force_root="1"\n' +
				'  done\n' +
				'  uci commit ' + service + '\n' +
				'fi\n' +
				'/etc/init.d/' + service + ' enable\n' +
				'/etc/init.d/' + service + ' restart\n' +
				'# Enable wsdd2 for Windows network discovery\n' +
				'if [ -f /etc/init.d/wsdd2 ]; then\n' +
				'  /etc/init.d/wsdd2 enable 2>/dev/null\n' +
				'  /etc/init.d/wsdd2 start 2>/dev/null\n' +
				'fi\n' +
				'echo DONE';
			return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
				self.showToast('File sharing enabled with auto-configured shares');
			});
		}

		if (isSamba && !enable) {
			var cmd =
				'/etc/init.d/' + service + ' stop\n' +
				'/etc/init.d/' + service + ' disable\n' +
				'if [ -f /etc/init.d/wsdd2 ]; then\n' +
				'  /etc/init.d/wsdd2 stop 2>/dev/null\n' +
				'  /etc/init.d/wsdd2 disable 2>/dev/null\n' +
				'fi\n' +
				'echo DONE';
			return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
				self.showToast('File sharing stopped');
			});
		}

		var action = enable ? 'enable && /etc/init.d/' + service + ' start' : 'stop && /etc/init.d/' + service + ' disable';
		var cmd = '/etc/init.d/' + service + ' ' + action + ' 2>&1; echo DONE';
		return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
			self.showToast(service + (enable ? ' enabled and started' : ' stopped and disabled'));
		});
	},

	render: function(data) {
		var self = this;
		var mounts = this.parseMounts(data[0] ? data[0].stdout : '');
		var blocks = this.parseBlockInfo(data[1] ? data[1].stdout : '');
		var df = this.parseDf(data[2] ? data[2].stdout : '');
		var smbAvail = (data[3] && data[3].stdout) ? data[3].stdout.trim() : 'none';
		var dlnaAvail = (data[4] && data[4].stdout) ? data[4].stdout.trim() : 'none';
		var smbEnabled = (data[5] && data[5].stdout) ? data[5].stdout.trim() === 'enabled' : false;
		var dlnaEnabled = (data[6] && data[6].stdout) ? data[6].stdout.trim() === 'enabled' : false;
		var lsblkDevs = this.parseLsblk(data[7] ? data[7].stdout : '');

		var allDevices = {};
		for (var d in blocks) {
			if (d.match(/\/(loop|ram|mtd|ubi)/)) continue;
			allDevices[d] = Object.assign({ device: d }, blocks[d]);
		}
		for (var d in mounts) {
			if (!allDevices[d]) allDevices[d] = {};
			Object.assign(allDevices[d], mounts[d]);
		}

		var storageList = [];
		for (var dev in allDevices) {
			var info = allDevices[dev];
			if (!info.fstype || info.fstype === 'squashfs' || info.fstype === 'jffs2' || info.fstype === 'ubifs') continue;
			var isMounted = !!mounts[dev];
			var dfInfo = df[dev] || null;
			storageList.push({
				device: dev,
				label: info.label || '',
				fstype: info.fstype || '',
				uuid: info.uuid || '',
				mounted: isMounted,
				mountpoint: isMounted ? mounts[dev].mountpoint : '',
				total: dfInfo ? dfInfo.total : 0,
				used: dfInfo ? dfInfo.used : 0,
				avail: dfInfo ? dfInfo.avail : 0
			});
		}

		storageList.sort(function(a, b) {
			if (a.mounted && !b.mounted) return -1;
			if (!a.mounted && b.mounted) return 1;
			return a.device < b.device ? -1 : 1;
		});

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		var mountedCount = storageList.filter(function(s) { return s.mounted; }).length;
		var totalStorage = storageList.length;

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = totalStorage > 0
			? 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #f97316 100%)'
			: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var iconDiv = el('div', 'tg-shield ' + (mountedCount > 0 ? 'connected' : 'disconnected'),
			SVG.hdd.replace('<svg ', '<svg style="width:40px;height:40px;fill:#fff" '));
		if (mountedCount > 0) {
			iconDiv.style.background = 'rgba(249,115,22,0.3)';
			iconDiv.style.boxShadow = '0 0 24px rgba(249,115,22,0.4), 0 0 48px rgba(249,115,22,0.2)';
		}
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text',
			totalStorage > 0 ? totalStorage + ' Storage Device' + (totalStorage !== 1 ? 's' : '') : 'No Storage'));
		hero.appendChild(el('div', 'tg-status-sub',
			mountedCount > 0 ? mountedCount + ' mounted' + (totalStorage - mountedCount > 0 ? ', ' + (totalStorage - mountedCount) + ' unmounted' : '')
			: totalStorage > 0 ? 'No partitions currently mounted' : 'No external storage detected'));

		if (mountedCount > 0) {
			var totalUsed = 0, totalSize = 0;
			storageList.forEach(function(s) {
				if (s.mounted && s.total) { totalUsed += s.used; totalSize += s.total; }
			});
			var stats = el('div', 'tg-stats');
			var s1 = el('div', 'tg-stat');
			s1.appendChild(el('div', 'tg-stat-val', formatSize(totalSize)));
			s1.appendChild(el('div', 'tg-stat-label', 'Total Capacity'));
			stats.appendChild(s1);
			var s2 = el('div', 'tg-stat');
			s2.appendChild(el('div', 'tg-stat-val', formatSize(totalUsed)));
			s2.appendChild(el('div', 'tg-stat-label', 'Used'));
			stats.appendChild(s2);
			var s3 = el('div', 'tg-stat');
			s3.appendChild(el('div', 'tg-stat-val', formatSize(totalSize - totalUsed)));
			s3.appendChild(el('div', 'tg-stat-label', 'Available'));
			stats.appendChild(s3);
			hero.appendChild(stats);
		}
		root.appendChild(hero);

		/* ── File Sharing card ── */
		var shareCard = el('div', 'tg-config stor-card');
		var shareHdr = el('div', 'stor-card-hdr');
		shareHdr.innerHTML = SVG.share.replace('<svg ', '<svg style="width:20px;height:20px;fill:var(--simple-accent)" ');
		shareHdr.appendChild(el('span', 'stor-card-title', 'File & Media Sharing'));
		shareCard.appendChild(shareHdr);

		var shareBody = el('div', 'stor-share-body');

		var smbRow = el('div', 'stor-share-row');
		var smbLeft = el('div', 'stor-share-info');
		smbLeft.appendChild(el('div', 'stor-share-name', 'SMB / File Sharing'));
		if (smbAvail === 'none') {
			smbLeft.appendChild(el('div', 'stor-share-desc', 'Not installed. Install <code>samba4-server</code> or <code>ksmbd-server</code> to enable.'));
		} else {
			smbLeft.appendChild(el('div', 'stor-share-desc', 'Share folders over the network via Windows file sharing (' + smbAvail + ')'));
		}
		smbRow.appendChild(smbLeft);
		if (smbAvail !== 'none') {
			var smbToggle = el('label', 'dev-toggle');
			var smbInput = E('input', { 'type': 'checkbox' });
			smbInput.checked = smbEnabled;
			smbToggle.appendChild(smbInput);
			smbToggle.appendChild(el('span', 'dev-toggle-slider'));
			smbInput.addEventListener('change', function() {
				self.toggleService(smbAvail, this.checked);
			});
			smbRow.appendChild(smbToggle);
		} else {
			smbRow.appendChild(el('span', 'stor-badge-na', 'N/A'));
		}
		shareBody.appendChild(smbRow);

		var dlnaRow = el('div', 'stor-share-row');
		var dlnaLeft = el('div', 'stor-share-info');
		dlnaLeft.appendChild(el('div', 'stor-share-name', 'DLNA / Media Server'));
		if (dlnaAvail === 'none') {
			dlnaLeft.appendChild(el('div', 'stor-share-desc', 'Not installed. Install <code>minidlna</code> to enable media streaming.'));
		} else {
			dlnaLeft.appendChild(el('div', 'stor-share-desc', 'Stream media files to smart TVs, phones, and media players'));
		}
		dlnaRow.appendChild(dlnaLeft);
		if (dlnaAvail !== 'none') {
			var dlnaToggle = el('label', 'dev-toggle');
			var dlnaInput = E('input', { 'type': 'checkbox' });
			dlnaInput.checked = dlnaEnabled;
			dlnaToggle.appendChild(dlnaInput);
			dlnaToggle.appendChild(el('span', 'dev-toggle-slider'));
			dlnaInput.addEventListener('change', function() {
				self.toggleService('minidlna', this.checked);
			});
			dlnaRow.appendChild(dlnaToggle);
		} else {
			dlnaRow.appendChild(el('span', 'stor-badge-na', 'N/A'));
		}
		shareBody.appendChild(dlnaRow);
		shareCard.appendChild(shareBody);
		root.appendChild(shareCard);

		/* ── Storage devices ── */
		if (totalStorage === 0) {
			var emptyCard = el('div', 'tg-config');
			var emptyBody = el('div', 'dev-empty');
			emptyBody.innerHTML = SVG.usb.replace('<svg ', '<svg class="dev-empty-icon" ');
			emptyBody.appendChild(el('div', 'dev-empty-title', 'No Storage Devices'));
			emptyBody.appendChild(el('div', 'dev-empty-text', 'Connect a USB drive, SD card, or external storage device to your router. Detected partitions will appear here automatically.'));
			emptyCard.appendChild(emptyBody);
			root.appendChild(emptyCard);
			return root;
		}

		var storCard = el('div', 'tg-config stor-card');
		var storHdr = el('div', 'stor-card-hdr');
		storHdr.innerHTML = SVG.hdd.replace('<svg ', '<svg style="width:20px;height:20px;fill:var(--simple-accent)" ');
		storHdr.appendChild(el('span', 'stor-card-title', 'Partitions & Volumes'));

		var refreshBtn = el('button', 'stor-refresh-btn');
		refreshBtn.innerHTML = SVG.refresh.replace('<svg ', '<svg style="width:14px;height:14px;fill:currentColor" ') + ' Refresh';
		refreshBtn.addEventListener('click', function() { window.location.reload(); });
		storHdr.appendChild(refreshBtn);

		storCard.appendChild(storHdr);

		var storList = el('div', 'stor-list');

		storageList.forEach(function(s) {
			var devInfo = guessDeviceIcon(s.device);
			var pct = usagePercent(s.used, s.total);

			var item = el('div', 'stor-item');

			var iconWrap = el('div', 'stor-icon');
			iconWrap.innerHTML = devInfo.icon;
			item.appendChild(iconWrap);

			var info = el('div', 'stor-info');

			var nameRow = el('div', 'stor-name-row');
			nameRow.appendChild(el('span', 'stor-name', s.label || s.device.replace('/dev/', '')));
			nameRow.appendChild(el('span', 'dev-type-badge', devInfo.label));
			var fsBadge = el('span', 'stor-fs-badge', s.fstype.toUpperCase());
			nameRow.appendChild(fsBadge);
			if (s.mounted) {
				nameRow.appendChild(el('span', 'stor-mounted-badge', 'Mounted'));
			}
			info.appendChild(nameRow);

			var metaRow = el('div', 'stor-meta');
			metaRow.appendChild(el('span', 'dev-mac', s.device));
			if (s.mounted && s.mountpoint) {
				metaRow.appendChild(el('span', 'stor-mp', '\u2192 ' + s.mountpoint));
			}
			info.appendChild(metaRow);

			if (s.mounted && s.total > 0) {
				var barWrap = el('div', 'stor-bar-wrap');
				var barBg = el('div', 'stor-bar-bg');
				var barFill = el('div', 'stor-bar-fill');
				barFill.style.width = pct + '%';
				barFill.style.background = usageColor(pct);
				barBg.appendChild(barFill);
				barWrap.appendChild(barBg);
				barWrap.appendChild(el('span', 'stor-bar-text',
					formatSize(s.used) + ' / ' + formatSize(s.total) + ' (' + pct + '%)'));
				info.appendChild(barWrap);
			}

			item.appendChild(info);

			var actions = el('div', 'stor-actions');
			if (s.mounted) {
				var ejectBtn = el('button', 'stor-eject-btn');
				ejectBtn.innerHTML = SVG.eject.replace('<svg ', '<svg style="width:14px;height:14px;fill:currentColor" ') + ' Unmount';
				ejectBtn.title = 'Safely unmount this device';
				(function(dev) {
					ejectBtn.addEventListener('click', function() { self.unmountDevice(dev); });
				})(s.device);
				actions.appendChild(ejectBtn);
			} else {
				var mountBtn = el('button', 'stor-mount-btn');
				mountBtn.innerHTML = SVG.mount.replace('<svg ', '<svg style="width:14px;height:14px;fill:currentColor" ') + ' Mount';
				mountBtn.title = 'Mount this partition';
				(function(dev) {
					mountBtn.addEventListener('click', function() { self.mountDevice(dev); });
				})(s.device);
				actions.appendChild(mountBtn);
			}
			item.appendChild(actions);

			storList.appendChild(item);
		});

		storCard.appendChild(storList);
		root.appendChild(storCard);

		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
