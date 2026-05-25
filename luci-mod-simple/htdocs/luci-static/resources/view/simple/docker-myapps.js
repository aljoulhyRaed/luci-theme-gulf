'use strict';
'require view';
'require rpc';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });
function fetchJSON(url) {
	return new Promise(function(resolve) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function() {
			if (xhr.status === 200) {
				try { resolve(JSON.parse(xhr.responseText)); } catch(e) { resolve([]); }
			} else { resolve([]); }
		};
		xhr.onerror = function() { resolve([]); };
		xhr.send();
	});
}

var SVG = {
	app: '<svg viewBox="0 0 24 24"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>',
	open: '<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
	stop: '<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>',
	play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
	restart: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	trash: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
	log: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
	store: '<svg viewBox="0 0 24 24"><path d="M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z"/></svg>',
	close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
};

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (children != null) {
		if (typeof children === 'string') e.innerHTML = children;
		else if (children instanceof Node) e.appendChild(children);
	}
	return e;
}

function svgIcon(svg, size, fill) {
	return svg.replace('<svg ', '<svg style="width:' + (size || 16) + 'px;height:' + (size || 16) + 'px;fill:' + (fill || 'currentColor') + '" ');
}

return view.extend({
	load: function() {
		var dataRootCmd = "uci -q get dockerd.globals.data_root || echo /opt/docker";
		var settingsCmd = "cat $(uci -q get dockerd.globals.data_root || echo /opt/docker)/.gulf-docker.json 2>/dev/null || echo '{}'";
		var containersCmd = "/usr/bin/docker ps -a --format '{{.Names}}|{{.Status}}|{{.Image}}|{{.Ports}}' 2>/dev/null || true";
		var checkCmd = "pidof dockerd >/dev/null 2>&1 && echo running || echo stopped";
		var lanIpCmd = "(uci -q get network.lan.ipaddr 2>/dev/null || ip -4 addr show br-lan 2>/dev/null | awk '/inet /{print $2}' || echo '192.168.1.1') | cut -d/ -f1 | head -1";

		return Promise.all([
			L.resolveDefault(callFileExec('/bin/sh', ['-c', dataRootCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', settingsCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', containersCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', checkCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', lanIpCmd]), {}),
			fetchJSON(L.resource('view/simple/appstore/catalog.json'))
		]);
	},

	handleSaveApply: null, handleSave: null, handleReset: null,

	showToast: function(msg) {
		var t = el('div', 'simple-toast', msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	parsePorts: function(portsStr) {
		if (!portsStr) return [];
		var ports = [];
		var re = /0\.0\.0\.0:(\d+)->/g;
		var m;
		while ((m = re.exec(portsStr)) !== null) {
			var p = parseInt(m[1]);
			if (ports.indexOf(p) === -1) ports.push(p);
		}
		return ports;
	},

	pickWebPort: function(dockerPorts, catalogPort) {
		if (!dockerPorts.length && !catalogPort) return null;
		if (catalogPort && dockerPorts.indexOf(catalogPort) !== -1) return catalogPort;
		if (catalogPort && !dockerPorts.length) return catalogPort;
		var dominated = [6881, 51413, 25565, 3478, 1900, 5353];
		for (var i = 0; i < dockerPorts.length; i++) {
			if (dominated.indexOf(dockerPorts[i]) === -1) return dockerPorts[i];
		}
		return dockerPorts[0] || catalogPort;
	},

	buildAccessUrl: function(mode, lanIp, port, urlSuffix, appId, domain) {
		if (!port) return null;
		var suffix = urlSuffix || '';
		switch (mode) {
			case 'vpn':
				return 'http://10.0.0.1:' + port + suffix;
			case 'public':
				return domain ? 'https://' + appId + '.' + domain + suffix : null;
			default:
				return 'http://' + lanIp + ':' + port + suffix;
		}
	},

	showLogsModal: function(containerName) {
		var self = this;
		var overlay = el('div', 'dapps-modal-overlay');
		var modal = el('div', 'dapps-modal');
		modal.style.maxWidth = '700px';

		var hdr = el('div', 'dapps-modal-hdr');
		hdr.innerHTML = svgIcon(SVG.log, 22, 'var(--simple-accent)');
		hdr.appendChild(el('span', 'dapps-modal-title', 'Logs: ' + containerName));
		var closeBtn = el('button', 'dapps-modal-close');
		closeBtn.innerHTML = svgIcon(SVG.close, 18);
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		hdr.appendChild(closeBtn);
		modal.appendChild(hdr);

		var logPre = el('pre', 'dapps-logs-pre', 'Loading logs...');
		modal.appendChild(logPre);

		var cmd = 'docker logs --tail 100 ' + containerName + ' 2>&1';
		L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var logs = (res && res.stdout) || '';
			var stderr = (res && res.stderr) || '';
			logPre.textContent = (logs + stderr).trim() || 'No logs available.';
		});

		overlay.appendChild(modal);
		overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
		document.body.appendChild(overlay);
	},

	render: function(data) {
		var self = this;
		var dataRoot = (data[0] && data[0].stdout) ? data[0].stdout.trim() : '/opt/docker';
		var settings = {};
		try { settings = JSON.parse((data[1] && data[1].stdout) ? data[1].stdout.trim() : '{}'); } catch(e) {}
		var accessMode = settings.access_mode || 'local';
		var domain = settings.domain || '';
		var isRunning = (data[3] && data[3].stdout) ? data[3].stdout.trim() === 'running' : false;
		var lanIp = (data[4] && data[4].stdout) ? data[4].stdout.trim() : window.location.hostname;

		var catalog = Array.isArray(data[5]) ? data[5] : [];
		var catalogMap = {};
		catalog.forEach(function(a) { catalogMap[a.id] = a; });

		var containers = [];
		((data[2] && data[2].stdout) || '').trim().split('\n').forEach(function(line) {
			if (!line.trim()) return;
			var parts = line.split('|');
			if (parts.length >= 4) {
				containers.push({
					name: parts[0],
					status: parts[1],
					image: parts[2],
					ports: parts.slice(3).join('|')
				});
			}
		});

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* Hero */
		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)';
		var iconDiv = el('div', 'tg-shield disconnected');
		iconDiv.innerHTML = svgIcon(SVG.app, 40, '#fff');
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text', 'My Apps'));
		var modeLabels = { local: 'Local Access', vpn: 'VPN Access', public: 'Public Domain' };
		var heroSub = isRunning ? (modeLabels[accessMode] || 'Local Access') : 'Docker daemon not running';
		hero.appendChild(el('div', 'tg-status-sub', heroSub));
		root.appendChild(hero);

		if (!isRunning) {
			var warn = el('div', 'tg-config dock-card');
			warn.style.textAlign = 'center';
			warn.style.padding = '32px';
			warn.innerHTML = '<p style="font-size:15px;margin:0 0 12px">Docker is not running. Start it from the <strong>Settings</strong> page first.</p>';
			root.appendChild(warn);
			return root;
		}

		var webApps = [];
		containers.forEach(function(c) {
			if (c.name === 'gulf-caddy') return;
			var appInfo = catalogMap[c.name] || null;
			var dockerPorts = self.parsePorts(c.ports);
			var catalogPort = appInfo ? appInfo.port : null;
			var webPort = self.pickWebPort(dockerPorts, catalogPort);
			var urlSuffix = appInfo ? appInfo.url_suffix : '';
			var accessUrl = self.buildAccessUrl(accessMode, lanIp, webPort, urlSuffix, c.name, domain);
			if (accessUrl) {
				webApps.push({ c: c, appInfo: appInfo, webPort: webPort, accessUrl: accessUrl });
			}
		});

		hero.querySelector('.tg-status-sub').textContent =
			webApps.length + ' app' + (webApps.length !== 1 ? 's' : '') + ' \u2022 ' + (modeLabels[accessMode] || 'Local Access');

		if (!webApps.length) {
			var empty = el('div', 'tg-config dock-card');
			empty.style.textAlign = 'center';
			empty.style.padding = '40px';
			empty.innerHTML = '<div style="margin-bottom:16px">' + svgIcon(SVG.store, 48, 'var(--simple-text-secondary)') + '</div>' +
				'<p style="font-size:16px;margin:0 0 8px;font-weight:600;color:var(--simple-text)">No web apps deployed yet</p>' +
				'<p style="font-size:14px;margin:0 0 20px;color:var(--simple-text-secondary)">Browse the App Store to deploy an app. Supporting containers (databases, etc.) are visible on the <strong>Containers</strong> page.</p>';
			var browseBtn = el('a', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.store, 14) + ' Browse App Store');
			browseBtn.href = L.url('admin/simple-docker/apps');
			browseBtn.style.display = 'inline-flex';
			browseBtn.style.textDecoration = 'none';
			empty.appendChild(browseBtn);
			root.appendChild(empty);
			return root;
		}

		/* Web App Cards */
		webApps.forEach(function(entry) {
			var c = entry.c;
			var appInfo = entry.appInfo;
			var webPort = entry.webPort;
			var accessUrl = entry.accessUrl;
			var isUp = c.status.indexOf('Up') !== -1;

			var card = el('div', 'tg-config myapp-card');

			var cardHdr = el('div', 'myapp-card-hdr');
			var nameBadge = el('div', 'myapp-name');
			nameBadge.textContent = appInfo ? appInfo.name : c.name;
			cardHdr.appendChild(nameBadge);

			var statusBadge = el('span', 'dock-port-badge ' + (isUp ? 'dset-badge-ok' : 'dset-badge-off'),
				isUp ? 'Running' : c.status.substring(0, 20));
			cardHdr.appendChild(statusBadge);
			card.appendChild(cardHdr);

			var cardMeta = el('div', 'myapp-meta');
			if (appInfo && appInfo.short_desc) {
				cardMeta.appendChild(el('div', 'myapp-desc', appInfo.short_desc));
			}
			var metaRow = el('div', 'myapp-meta-row');
			metaRow.appendChild(el('span', 'myapp-image', c.image.split('/').pop()));
			if (webPort) metaRow.appendChild(el('span', 'dapps-port-pill', ':' + webPort));
			if (appInfo && appInfo.category) metaRow.appendChild(el('span', 'dapps-cat-pill', appInfo.category));
			cardMeta.appendChild(metaRow);
			card.appendChild(cardMeta);

			/* Access Link */
			if (isUp && accessUrl) {
				var linkRow = el('div', 'myapp-access');
				var link = document.createElement('a');
				link.href = accessUrl;
				link.target = '_blank';
				link.className = 'myapp-access-link';
				link.innerHTML = svgIcon(SVG.open, 14) + ' ' + accessUrl;
				linkRow.appendChild(link);
				card.appendChild(linkRow);
			}

			/* Actions */
			var actions = el('div', 'myapp-actions');

			if (isUp && accessUrl) {
				var openBtn = el('button', 'dock-action-btn dock-btn-deploy myapp-btn', svgIcon(SVG.open, 14) + ' Open');
				openBtn.addEventListener('click', function() { window.open(accessUrl, '_blank'); });
				actions.appendChild(openBtn);
			}

			if (isUp) {
				var stopBtn = el('button', 'dock-action-btn dock-btn-stop myapp-btn', svgIcon(SVG.stop, 14) + ' Stop');
				stopBtn.addEventListener('click', function() {
					self.showToast('Stopping ' + c.name + '...');
					var composeDir = dataRoot + '/compose/' + c.name;
					var cmd = 'cd "' + composeDir + '" 2>/dev/null && docker compose stop 2>&1 || docker stop ' + c.name + ' 2>&1';
					L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
						setTimeout(function() { window.location.reload(); }, 2000);
					});
				});
				actions.appendChild(stopBtn);

				var restartBtn = el('button', 'dock-action-btn dock-btn-outline myapp-btn', svgIcon(SVG.restart, 14) + ' Restart');
				restartBtn.addEventListener('click', function() {
					self.showToast('Restarting ' + c.name + '...');
					var composeDir = dataRoot + '/compose/' + c.name;
					var cmd = 'cd "' + composeDir + '" 2>/dev/null && docker compose restart 2>&1 || docker restart ' + c.name + ' 2>&1';
					L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
						setTimeout(function() { window.location.reload(); }, 3000);
					});
				});
				actions.appendChild(restartBtn);
			} else {
				var startBtn = el('button', 'dock-action-btn dock-btn-deploy myapp-btn', svgIcon(SVG.play, 14) + ' Start');
				startBtn.addEventListener('click', function() {
					self.showToast('Starting ' + c.name + '...');
					var composeDir = dataRoot + '/compose/' + c.name;
					var cmd = 'cd "' + composeDir + '" 2>/dev/null && docker compose start 2>&1 || docker start ' + c.name + ' 2>&1';
					L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
						setTimeout(function() { window.location.reload(); }, 2000);
					});
				});
				actions.appendChild(startBtn);
			}

			var logBtn = el('button', 'dock-action-btn dock-btn-outline myapp-btn', svgIcon(SVG.log, 14) + ' Logs');
			logBtn.addEventListener('click', function() { self.showLogsModal(c.name); });
			actions.appendChild(logBtn);

			var removeBtn = el('button', 'dock-action-btn dock-btn-stop myapp-btn', svgIcon(SVG.trash, 14) + ' Remove');
			removeBtn.addEventListener('click', function() {
				if (!confirm('Remove ' + c.name + '? Data in volumes will be preserved.')) return;
				self.showToast('Removing ' + c.name + '...');
				var composeDir = dataRoot + '/compose/' + c.name;
				var cmd = 'cd "' + composeDir + '" 2>/dev/null && docker compose down 2>&1 || docker rm -f ' + c.name + ' 2>&1';
				L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
					self.showToast(c.name + ' removed');
					setTimeout(function() { window.location.reload(); }, 2000);
				});
			});
			actions.appendChild(removeBtn);

			card.appendChild(actions);
			root.appendChild(card);
		});

		return root;
	}
});
