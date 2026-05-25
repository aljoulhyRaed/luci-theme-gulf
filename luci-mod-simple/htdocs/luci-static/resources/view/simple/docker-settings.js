'use strict';
'require view';
'require rpc';
'require uci';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });
var callFileRead = rpc.declare({ object: 'file', method: 'read', params: ['path'] });
var callFileWrite = rpc.declare({ object: 'file', method: 'write', params: ['path', 'data'] });

var SVG = {
	docker: '<svg viewBox="0 0 24 24"><path d="M21.81 10.25c-.06-.04-.56-.43-1.64-.43-.28 0-.56.03-.84.08-.21-1.4-1.38-2.11-1.43-2.14l-.29-.17-.18.27c-.24.36-.43.77-.51 1.19-.2.8-.08 1.56.34 2.19-.5.28-1.3.35-1.46.35H2.84c-.34 0-.62.28-.62.63 0 1.17.18 2.34.56 3.39.42 1.18 1.05 2.05 1.86 2.57.94.6 2.47.94 4.18.94.78 0 1.59-.08 2.39-.24.96-.19 1.88-.52 2.72-1 .72-.4 1.36-.92 1.93-1.52 1.11-1.23 1.81-2.45 2.3-3.49h.2c1.24 0 2.01-.5 2.44-.93.28-.28.5-.6.63-.96l.08-.24-.7-.43zM4.5 10.83h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15H4.5c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.62 0h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15H7.12c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.64 0h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15H9.76c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.63 0h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15h-1.83c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zM7.12 8.21h1.83c.09 0 .15-.07.15-.15V6.39c0-.09-.07-.15-.15-.15H7.12c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.64 0h1.83c.09 0 .15-.07.15-.15V6.39c0-.09-.07-.15-.15-.15H9.76c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.63 0h1.83c.09 0 .15-.07.15-.15V6.39c0-.09-.07-.15-.15-.15h-1.83c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15z"/></svg>',
	hdd: '<svg viewBox="0 0 24 24"><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/></svg>',
	folder: '<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
	settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
	play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
	stop: '<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>',
	restart: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm0 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	globe: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
	vpnLock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>',
	clock: '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>'
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

function formatSize(kb) {
	if (!kb || kb <= 0) return '0 B';
	var bytes = kb * 1024;
	var u = ['B', 'KB', 'MB', 'GB', 'TB'];
	var i = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + u[i];
}

return view.extend({
	load: function() {
		var checkCmd = "pidof dockerd >/dev/null 2>&1 && echo running || echo stopped";
		var versionCmd = "/usr/bin/docker info --format '{{.ServerVersion}}|{{.DockerRootDir}}' 2>/dev/null || echo '|'";
		var dfCmd = "df -k 2>/dev/null | awk 'NR>1 && $2>1048576{print $6\"|\"$2\"|\"$3\"|\"$4}'";
		var enabledCmd = "/etc/init.d/dockerd enabled 2>/dev/null && echo enabled || echo disabled";
		var dataRootCmd = "uci -q get dockerd.globals.data_root || echo /opt/docker";
		var settingsCmd = "cat $(uci -q get dockerd.globals.data_root || echo /opt/docker)/.gulf-docker.json 2>/dev/null || echo '{}'";
		var fwCheckCmd = "uci show firewall 2>/dev/null | grep -q \"src='lan'\" && uci show firewall 2>/dev/null | grep -q \"dest='docker'\" && echo fw_ok || echo fw_missing";

		return Promise.all([
			L.resolveDefault(callFileExec('/bin/sh', ['-c', checkCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', versionCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', dfCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', enabledCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', dataRootCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', settingsCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', fwCheckCmd]), {})
		]);
	},

	ensureDockerFirewall: function() {
		var cmd = "changed=0; " +
			"if ! uci show firewall 2>/dev/null | grep forwarding | grep -q \"dest='docker'\"; then " +
			"uci add firewall forwarding; " +
			"uci set firewall.@forwarding[-1].src='lan'; " +
			"uci set firewall.@forwarding[-1].dest='docker'; " +
			"changed=1; fi; " +
			"if ! uci get firewall.docker.device 2>/dev/null | grep -q 'br-'; then " +
			"uci add_list firewall.docker.device='br-+'; " +
			"changed=1; fi; " +
			"if [ \"$changed\" = \"1\" ]; then " +
			"uci commit firewall; fw4 reload 2>/dev/null; echo FW_APPLIED; " +
			"else echo FW_EXISTS; fi";
		return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {});
	},

	handleSaveApply: null, handleSave: null, handleReset: null,

	saveAllSettings: function(dataRoot, pathInputs, accessRadios, domainInput, tzInput) {
		var self = this;
		var newPaths = {};
		var mkdirs = [];
		for (var k in pathInputs) {
			var v = pathInputs[k].value.trim();
			if (!v) { self.showToast(k + ' path cannot be empty'); return; }
			newPaths[k] = v;
			mkdirs.push('"' + v + '"');
		}

		var settingsObj = {
			paths: newPaths,
			access_mode: accessRadios._selected || 'local',
			domain: domainInput ? domainInput.value.trim() : '',
			timezone: tzInput ? tzInput.value.trim() || 'UTC' : 'UTC'
		};

		var settingsJson = JSON.stringify(settingsObj, null, 2);
		var settingsPath = dataRoot + '/.gulf-docker.json';
		var cmd = 'mkdir -p ' + mkdirs.join(' ') + ' && ' +
			"cat > '" + settingsPath + "' << 'GULFEOF'\n" + settingsJson + '\nGULFEOF\n' +
			'echo SAVE_OK';
		L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var ok = res && res.stdout && res.stdout.indexOf('SAVE_OK') !== -1;
			self.showToast(ok ? 'All settings saved' : 'Failed to save settings');
		});
	},

	deployCaddy: function(dataRoot, pathInputs) {
		var self = this;
		var configPath = pathInputs.config ? pathInputs.config.value.trim() : dataRoot + '/config';
		var caddyDir = configPath + '/caddy';
		var composeDir = dataRoot + '/compose/caddy';

		self.showToast('Deploying Caddy reverse proxy...');

		var compose = [
			'services:',
			'  caddy:',
			'    image: caddy:2-alpine',
			'    container_name: gulf-caddy',
			'    network_mode: host',
			'    volumes:',
			'      - ' + caddyDir + '/Caddyfile:/etc/caddy/Caddyfile',
			'      - ' + caddyDir + '/data:/data',
			'      - ' + caddyDir + '/config:/config',
			'    restart: unless-stopped'
		].join('\n');

		var caddyfile = [
			'{',
			'\thttp_port 8080',
			'\thttps_port 4443',
			'}',
			'',
			':8080 {',
			'\trespond "Gulf Caddy is running" 200',
			'}'
		].join('\n');

		var cmd = 'mkdir -p "' + composeDir + '" "' + caddyDir + '" && ' +
			"cat > '" + composeDir + "/docker-compose.yml' << 'COMPEOF'\n" + compose + "\nCOMPEOF\n" +
			"cat > '" + caddyDir + "/Caddyfile' << 'CADDYEOF'\n" + caddyfile + "\nCADDYEOF\n" +
			'cd "' + composeDir + '" && docker compose up -d 2>&1 && echo CADDY_OK || echo CADDY_FAIL';

		L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var stdout = (res && res.stdout) || '';
			if (stdout.indexOf('CADDY_OK') !== -1) {
				self.showToast('Caddy deployed successfully');
				self.regenerateCaddyfile(dataRoot, pathInputs);
			} else {
				self.showToast('Failed to deploy Caddy: ' + stdout.substring(0, 200));
			}
		});
	},

	regenerateCaddyfile: function(dataRoot, pathInputs) {
		var self = this;
		var configPath = pathInputs.config ? pathInputs.config.value.trim() : dataRoot + '/config';
		var caddyDir = configPath + '/caddy';

		var settingsPath = dataRoot + '/.gulf-docker.json';
		var cmd = 'cat "' + settingsPath + '" 2>/dev/null || echo "{}"';

		L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var settings = {};
			try { settings = JSON.parse((res && res.stdout) || '{}'); } catch(e) {}
			var domain = settings.domain || '';
			if (!domain) {
				self.showToast('Set a public domain first');
				return;
			}

			var listCmd = "docker ps --format '{{.Names}}|{{.Ports}}' 2>/dev/null";
			L.resolveDefault(callFileExec('/bin/sh', ['-c', listCmd]), {}).then(function(cres) {
				var lines = ((cres && cres.stdout) || '').trim().split('\n').filter(function(l) { return l.trim(); });
				var entries = [
					'{',
					'\thttp_port 8080',
					'\thttps_port 4443',
					'}'
				];

				lines.forEach(function(line) {
					var parts = line.split('|');
					var name = parts[0];
					if (name === 'gulf-caddy') return;
					var portsStr = parts.slice(1).join('|');
					var portMatch = portsStr.match(/0\.0\.0\.0:(\d+)->/);
					if (portMatch) {
						var port = portMatch[1];
						entries.push('');
						entries.push(name + '.' + domain + ' {');
						entries.push('\treverse_proxy localhost:' + port);
						entries.push('}');
					}
				});

				var caddyfile = entries.join('\n') + '\n';
				var writeCmd = "cat > '" + caddyDir + "/Caddyfile' << 'CADDYEOF'\n" + caddyfile + "CADDYEOF\n" +
					'docker exec gulf-caddy caddy reload --config /etc/caddy/Caddyfile 2>&1 && echo RELOAD_OK || echo RELOAD_FAIL';

				L.resolveDefault(callFileExec('/bin/sh', ['-c', writeCmd]), {}).then(function(rres) {
					var ok = (rres && rres.stdout || '').indexOf('RELOAD_OK') !== -1;
					self.showToast(ok ? 'Caddyfile regenerated and reloaded' : 'Caddyfile written but reload failed');
				});
			});
		});
	},

	showToast: function(msg) {
		var t = el('div', 'simple-toast', msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	parseMounts: function(stdout) {
		var mounts = [];
		(stdout || '').trim().split('\n').forEach(function(line) {
			if (!line.trim()) return;
			var p = line.split('|');
			if (p.length >= 4) {
				mounts.push({
					mountpoint: p[0],
					total: parseInt(p[1]) || 0,
					used: parseInt(p[2]) || 0,
					avail: parseInt(p[3]) || 0
				});
			}
		});
		return mounts.filter(function(m) {
			return m.mountpoint.indexOf('/mnt') === 0 || m.mountpoint.indexOf('/opt') === 0;
		});
	},

	render: function(data) {
		var self = this;
		var daemonStatus = (data[0] && data[0].stdout) ? data[0].stdout.trim() : 'stopped';
		var isRunning = daemonStatus === 'running';

		var verParts = (data[1] && data[1].stdout) ? data[1].stdout.trim().split('|') : ['', ''];
		var dockerVersion = verParts[0] || '';
		var dockerRootDir = verParts[1] || '';

		var mounts = this.parseMounts(data[2] ? data[2].stdout : '');
		var bootEnabled = (data[3] && data[3].stdout) ? data[3].stdout.trim() === 'enabled' : false;
		var currentDataRoot = (data[4] && data[4].stdout) ? data[4].stdout.trim() : '/opt/docker';

		var settings = {};
		try { settings = JSON.parse((data[5] && data[5].stdout) ? data[5].stdout.trim() : '{}'); } catch(e) {}
		var paths = settings.paths || {};

		var fwStatus = (data[6] && data[6].stdout) ? data[6].stdout.trim() : 'fw_missing';
		if (fwStatus !== 'fw_ok') {
			self.ensureDockerFirewall().then(function() {
				self.showToast('Docker firewall rule applied for container port access');
			});
		}

		var accessMode = settings.access_mode || 'local';
		var domain = settings.domain || '';
		var timezone = settings.timezone || 'UTC';

		var storageBase = currentDataRoot.replace(/\/docker\/?$/, '') || '/mnt';
		if (!paths.downloads) paths.downloads = storageBase + '/files/downloads';
		if (!paths.media) paths.media = storageBase + '/files/media';
		if (!paths.cloud) paths.cloud = storageBase + '/cloud';
		if (!paths.config) paths.config = currentDataRoot + '/config';

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';
		var iconDiv = el('div', 'tg-shield disconnected');
		iconDiv.innerHTML = svgIcon(SVG.settings, 40, '#fff');
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text', 'Docker Settings'));
		hero.appendChild(el('div', 'tg-status-sub', isRunning ? 'Docker v' + dockerVersion + ' running' : 'Docker daemon stopped'));
		root.appendChild(hero);

		/* ── Daemon Control Card ── */
		var daemonCard = el('div', 'tg-config dock-card');
		var dHdr = el('div', 'dock-card-hdr');
		dHdr.innerHTML = svgIcon(SVG.docker, 20, 'var(--simple-accent)');
		dHdr.appendChild(el('span', 'dock-card-title', 'Docker Daemon'));
		daemonCard.appendChild(dHdr);

		var dBody = el('div', 'dset-section');

		var statusRow = el('div', 'dset-row');
		statusRow.appendChild(el('div', 'dset-label', 'Status'));
		var statusBadge = el('span', 'dock-port-badge ' + (isRunning ? 'dset-badge-ok' : 'dset-badge-off'),
			isRunning ? 'Running' : 'Stopped');
		statusRow.appendChild(statusBadge);
		dBody.appendChild(statusRow);

		if (dockerVersion) {
			var verRow = el('div', 'dset-row');
			verRow.appendChild(el('div', 'dset-label', 'Version'));
			verRow.appendChild(el('div', 'dset-value', 'v' + dockerVersion));
			dBody.appendChild(verRow);
		}

		var bootRow = el('div', 'dset-row');
		bootRow.appendChild(el('div', 'dset-label', 'Start on Boot'));
		var bootToggle = el('label', 'dev-toggle');
		var bootInput = document.createElement('input');
		bootInput.type = 'checkbox';
		bootInput.checked = bootEnabled;
		bootToggle.appendChild(bootInput);
		bootToggle.appendChild(el('span', 'dev-toggle-slider'));
		bootInput.addEventListener('change', function() {
			var action = this.checked ? 'enable' : 'disable';
			L.resolveDefault(callFileExec('/bin/sh', ['-c', '/etc/init.d/dockerd ' + action + ' 2>&1']), {}).then(function() {
				self.showToast('Docker ' + action + 'd on boot');
			});
		});
		bootRow.appendChild(bootToggle);
		dBody.appendChild(bootRow);

		var btnRow = el('div', 'dset-btn-row');
		if (isRunning) {
			var stopBtn = el('button', 'dock-action-btn dock-btn-stop', svgIcon(SVG.stop, 14) + ' Stop');
			stopBtn.addEventListener('click', function() {
				self.showToast('Stopping Docker...');
				L.resolveDefault(callFileExec('/bin/sh', ['-c', '/etc/init.d/dockerd stop 2>&1']), {}).then(function() {
					setTimeout(function() { window.location.reload(); }, 3000);
				});
			});
			btnRow.appendChild(stopBtn);

			var restartBtn = el('button', 'dock-action-btn dock-btn-outline', svgIcon(SVG.restart, 14) + ' Restart');
			restartBtn.addEventListener('click', function() {
				self.showToast('Restarting Docker...');
				L.resolveDefault(callFileExec('/bin/sh', ['-c', '/etc/init.d/dockerd restart 2>&1']), {}).then(function() {
					setTimeout(function() { window.location.reload(); }, 8000);
				});
			});
			btnRow.appendChild(restartBtn);
		} else {
			var startBtn = el('button', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.play, 14) + ' Start Docker');
			startBtn.addEventListener('click', function() {
				self.showToast('Starting Docker...');
				self.ensureDockerFirewall();
				L.resolveDefault(callFileExec('/bin/sh', ['-c', '/etc/init.d/dockerd start 2>&1']), {}).then(function() {
					setTimeout(function() { window.location.reload(); }, 8000);
				});
			});
			btnRow.appendChild(startBtn);
		}
		dBody.appendChild(btnRow);
		daemonCard.appendChild(dBody);
		root.appendChild(daemonCard);

		/* ── Storage Mount Card ── */
		var storCard = el('div', 'tg-config dock-card');
		var sHdr = el('div', 'dock-card-hdr');
		sHdr.innerHTML = svgIcon(SVG.hdd, 20, 'var(--simple-accent)');
		sHdr.appendChild(el('span', 'dock-card-title', 'Docker Storage'));
		storCard.appendChild(sHdr);

		var sBody = el('div', 'dset-section');

		sBody.appendChild(el('div', 'dset-hint',
			'Select where Docker stores images and containers. Choose a mount with enough free space (8 GB+ recommended).'));

		var curRow = el('div', 'dset-row');
		curRow.appendChild(el('div', 'dset-label', 'Current Data Root'));
		curRow.appendChild(el('div', 'dset-value dset-mono', currentDataRoot));
		sBody.appendChild(curRow);

		var selectGroup = el('div', 'dset-field-group');
		selectGroup.appendChild(el('label', 'dset-field-label', 'Storage Location'));

		var storSelect = document.createElement('select');
		storSelect.className = 'dock-run-input';

		var hasMatch = false;
		mounts.forEach(function(m) {
			var opt = document.createElement('option');
			var path = m.mountpoint + '/docker';
			opt.value = path;
			opt.textContent = m.mountpoint + '  (' + formatSize(m.avail) + ' free of ' + formatSize(m.total) + ')';
			if (path === currentDataRoot) { opt.selected = true; hasMatch = true; }
			storSelect.appendChild(opt);
		});

		var customOpt = document.createElement('option');
		customOpt.value = '__custom__';
		customOpt.textContent = 'Custom path...';
		storSelect.appendChild(customOpt);

		if (!hasMatch && currentDataRoot) {
			var existOpt = document.createElement('option');
			existOpt.value = currentDataRoot;
			existOpt.textContent = currentDataRoot + ' (current)';
			existOpt.selected = true;
			storSelect.insertBefore(existOpt, customOpt);
		}

		selectGroup.appendChild(storSelect);

		var customInput = document.createElement('input');
		customInput.type = 'text';
		customInput.className = 'dock-run-input dset-custom-path';
		customInput.placeholder = '/mnt/sda1/docker';
		customInput.style.display = 'none';
		selectGroup.appendChild(customInput);

		storSelect.addEventListener('change', function() {
			customInput.style.display = this.value === '__custom__' ? '' : 'none';
		});

		sBody.appendChild(selectGroup);

		var applyStorBtn = el('button', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.check, 14) + ' Apply Storage');
		applyStorBtn.style.marginTop = '12px';
		applyStorBtn.addEventListener('click', function() {
			var newPath = storSelect.value === '__custom__' ? customInput.value.trim() : storSelect.value;
			if (!newPath || newPath === '__custom__') { self.showToast('Enter a valid path'); return; }
			if (newPath === currentDataRoot) { self.showToast('Already using this path'); return; }
			if (!confirm('Change Docker storage to ' + newPath + '?\n\nDocker will restart and existing containers on the old storage will not be visible until you switch back.')) return;
			self.showToast('Applying new storage path...');
			var cmd = 'mkdir -p "' + newPath + '" && ' +
				'uci set dockerd.globals.data_root="' + newPath + '" && ' +
				'uci commit dockerd && ' +
				'/etc/init.d/dockerd restart 2>&1 && echo OK || echo FAIL';
			L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
				var ok = res && res.stdout && res.stdout.indexOf('OK') !== -1;
				self.showToast(ok ? 'Storage updated. Docker restarting...' : 'Failed to update storage');
				if (ok) setTimeout(function() { window.location.reload(); }, 10000);
			});
		});
		sBody.appendChild(applyStorBtn);
		storCard.appendChild(sBody);
		root.appendChild(storCard);

		/* ── Default Paths Card ── */
		var pathCard = el('div', 'tg-config dock-card');
		var pHdr = el('div', 'dock-card-hdr');
		pHdr.innerHTML = svgIcon(SVG.folder, 20, 'var(--simple-accent)');
		pHdr.appendChild(el('span', 'dock-card-title', 'Default Volume Paths'));
		pathCard.appendChild(pHdr);

		var pBody = el('div', 'dset-section');
		pBody.appendChild(el('div', 'dset-hint',
			'Configure default storage paths used by Docker App templates. Containers will bind-mount these directories for persistent data.'));

		var pathDefs = [
			{ key: 'downloads', label: 'Downloads', desc: 'Torrent clients, file downloads' },
			{ key: 'media', label: 'Media', desc: 'Movies, TV shows, music for media servers' },
			{ key: 'cloud', label: 'Cloud', desc: 'Cloud storage sync (Nextcloud, etc.)' },
			{ key: 'config', label: 'Config', desc: 'App configuration and databases' }
		];

		var pathInputs = {};
		pathDefs.forEach(function(pd) {
			var group = el('div', 'dset-field-group');
			var label = el('label', 'dset-field-label', pd.label);
			label.appendChild(el('span', 'dset-field-desc', ' \u2014 ' + pd.desc));
			group.appendChild(label);
			var input = document.createElement('input');
			input.type = 'text';
			input.className = 'dock-run-input';
			input.value = paths[pd.key] || '';
			input.placeholder = storageBase + '/...';
			group.appendChild(input);
			pBody.appendChild(group);
			pathInputs[pd.key] = input;
		});

		var savePathBtn = el('button', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.save, 14) + ' Save Paths');
		savePathBtn.style.marginTop = '12px';
		savePathBtn.addEventListener('click', function() {
			self.saveAllSettings(currentDataRoot, pathInputs, accessRadios, domainInput, tzInput);
		});
		pBody.appendChild(savePathBtn);
		pathCard.appendChild(pBody);
		root.appendChild(pathCard);

		/* ── Access & Networking Card ── */
		var accessCard = el('div', 'tg-config dock-card');
		var aHdr = el('div', 'dock-card-hdr');
		aHdr.innerHTML = svgIcon(SVG.globe, 20, 'var(--simple-accent)');
		aHdr.appendChild(el('span', 'dock-card-title', 'Access & Networking'));
		accessCard.appendChild(aHdr);

		var aBody = el('div', 'dset-section');
		aBody.appendChild(el('div', 'dset-hint',
			'Choose how deployed apps are accessed. Local = LAN IP only. VPN = via WireGuard tunnel. Public = exposed via reverse proxy with automatic HTTPS.'));

		var modeGroup = el('div', 'dset-field-group');
		modeGroup.appendChild(el('label', 'dset-field-label', 'Access Mode'));

		var modeRow = el('div', 'dset-mode-row');
		var accessRadios = {};
		var modes = [
			{ value: 'local', label: 'Local Only', icon: SVG.settings, desc: 'Access via LAN IP' },
			{ value: 'vpn',   label: 'VPN Private', icon: SVG.vpnLock, desc: 'Access via WireGuard' },
			{ value: 'public', label: 'Public Domain', icon: SVG.globe, desc: 'HTTPS via Caddy' }
		];

		var domainInput;
		modes.forEach(function(mode) {
			var card = el('div', 'dset-mode-card' + (accessMode === mode.value ? ' dset-mode-active' : ''));
			card.innerHTML = svgIcon(mode.icon, 28, accessMode === mode.value ? 'var(--simple-accent)' : 'var(--simple-text-secondary)');
			card.appendChild(el('div', 'dset-mode-label', mode.label));
			card.appendChild(el('div', 'dset-mode-desc', mode.desc));
			card.dataset.mode = mode.value;
			card.addEventListener('click', function() {
				modeRow.querySelectorAll('.dset-mode-card').forEach(function(c) {
					c.classList.remove('dset-mode-active');
					c.querySelector('svg').style.fill = 'var(--simple-text-secondary)';
				});
				card.classList.add('dset-mode-active');
				card.querySelector('svg').style.fill = 'var(--simple-accent)';
				accessRadios._selected = mode.value;
				if (domainGroup) domainGroup.style.display = mode.value === 'public' ? '' : 'none';
				if (caddySection) caddySection.style.display = mode.value === 'public' ? '' : 'none';
			});
			accessRadios[mode.value] = card;
			modeRow.appendChild(card);
		});
		accessRadios._selected = accessMode;
		modeGroup.appendChild(modeRow);
		aBody.appendChild(modeGroup);

		var domainGroup = el('div', 'dset-field-group');
		domainGroup.style.display = accessMode === 'public' ? '' : 'none';
		domainGroup.appendChild(el('label', 'dset-field-label', 'Public Domain'));
		domainInput = document.createElement('input');
		domainInput.type = 'text';
		domainInput.className = 'dock-run-input';
		domainInput.value = domain;
		domainInput.placeholder = 'myrouter.example.com';
		domainGroup.appendChild(domainInput);
		domainGroup.appendChild(el('div', 'dset-field-desc',
			'Apps will be accessible at appname.yourdomain.com. Requires DNS A record pointing to your WireGuard public IP and TorGuard port forwarding for ports 80 & 443.'));
		aBody.appendChild(domainGroup);

		/* Caddy reverse proxy controls */
		var caddySection = el('div', 'dset-caddy-section');
		caddySection.style.display = accessMode === 'public' ? '' : 'none';

		var caddyHint = el('div', 'dset-hint');
		caddyHint.style.marginTop = '12px';
		caddyHint.textContent = 'Caddy handles automatic HTTPS (Let\'s Encrypt) and reverse proxies all deployed apps. It listens on ports 8080 (HTTP) and 4443 (HTTPS), which should be port-forwarded from 80/443 via TorGuard WireGuard.';
		caddySection.appendChild(caddyHint);

		var caddyBtnRow = el('div', 'dset-btn-row');
		var deployCaddyBtn = el('button', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.play, 14) + ' Deploy Caddy');
		deployCaddyBtn.addEventListener('click', function() {
			self.deployCaddy(currentDataRoot, pathInputs);
		});
		caddyBtnRow.appendChild(deployCaddyBtn);

		var regenCaddyBtn = el('button', 'dock-action-btn dock-btn-outline', svgIcon(SVG.restart, 14) + ' Regenerate Config');
		regenCaddyBtn.addEventListener('click', function() {
			self.regenerateCaddyfile(currentDataRoot, pathInputs);
		});
		caddyBtnRow.appendChild(regenCaddyBtn);
		caddySection.appendChild(caddyBtnRow);
		aBody.appendChild(caddySection);

		var saveAccessBtn = el('button', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.save, 14) + ' Save Settings');
		saveAccessBtn.style.marginTop = '12px';
		saveAccessBtn.addEventListener('click', function() {
			self.saveAllSettings(currentDataRoot, pathInputs, accessRadios, domainInput, tzInput);
		});
		aBody.appendChild(saveAccessBtn);
		accessCard.appendChild(aBody);
		root.appendChild(accessCard);

		/* ── Timezone Card ── */
		var tzCard = el('div', 'tg-config dock-card');
		var tzHdr = el('div', 'dock-card-hdr');
		tzHdr.innerHTML = svgIcon(SVG.clock, 20, 'var(--simple-accent)');
		tzHdr.appendChild(el('span', 'dock-card-title', 'Container Timezone'));
		tzCard.appendChild(tzHdr);

		var tzBody = el('div', 'dset-section');
		tzBody.appendChild(el('div', 'dset-hint',
			'Set the timezone used by Docker containers. This is substituted as {{TZ}} in compose templates.'));

		var tzGroup = el('div', 'dset-field-group');
		tzGroup.appendChild(el('label', 'dset-field-label', 'Timezone'));
		var tzInput = document.createElement('input');
		tzInput.type = 'text';
		tzInput.className = 'dock-run-input';
		tzInput.value = timezone;
		tzInput.placeholder = 'America/New_York';
		tzGroup.appendChild(tzInput);

		var tzCommon = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
			'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai',
			'Australia/Sydney', 'Pacific/Auckland'];
		var tzQuick = el('div', 'dset-tz-quick');
		tzCommon.forEach(function(tz) {
			var chip = el('span', 'dset-tz-chip' + (timezone === tz ? ' dset-tz-active' : ''), tz.split('/').pop().replace(/_/g, ' '));
			chip.addEventListener('click', function() {
				tzInput.value = tz;
				tzQuick.querySelectorAll('.dset-tz-chip').forEach(function(c) { c.classList.remove('dset-tz-active'); });
				chip.classList.add('dset-tz-active');
			});
			tzQuick.appendChild(chip);
		});
		tzGroup.appendChild(tzQuick);
		tzBody.appendChild(tzGroup);

		var saveTzBtn = el('button', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.save, 14) + ' Save Timezone');
		saveTzBtn.style.marginTop = '12px';
		saveTzBtn.addEventListener('click', function() {
			self.saveAllSettings(currentDataRoot, pathInputs, accessRadios, domainInput, tzInput);
		});
		tzBody.appendChild(saveTzBtn);
		tzCard.appendChild(tzBody);
		root.appendChild(tzCard);

		return root;
	}
});
