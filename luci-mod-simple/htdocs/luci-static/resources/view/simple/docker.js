'use strict';
'require view';
'require dom';
'require poll';
'require rpc';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });
var callFileWrite = rpc.declare({ object: 'file', method: 'write', params: ['path', 'data'] });

var SVG = {
	docker: '<svg viewBox="0 0 24 24"><path d="M21.81 10.25c-.06-.04-.56-.43-1.64-.43-.28 0-.56.03-.84.08-.21-1.4-1.38-2.11-1.43-2.14l-.29-.17-.18.27c-.24.36-.43.77-.51 1.19-.2.8-.08 1.56.34 2.19-.5.28-1.3.35-1.46.35H2.84c-.34 0-.62.28-.62.63 0 1.17.18 2.34.56 3.39.42 1.18 1.05 2.05 1.86 2.57.94.6 2.47.94 4.18.94.78 0 1.59-.08 2.39-.24.96-.19 1.88-.52 2.72-1 .72-.4 1.36-.92 1.93-1.52 1.11-1.23 1.81-2.45 2.3-3.49h.2c1.24 0 2.01-.5 2.44-.93.28-.28.5-.6.63-.96l.08-.24-.7-.43zM4.5 10.83h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15H4.5c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.62 0h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15H7.12c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.64 0h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15H9.76c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.63 0h1.83c.09 0 .15-.07.15-.15V9.01c0-.09-.07-.15-.15-.15h-1.83c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zM7.12 8.21h1.83c.09 0 .15-.07.15-.15V6.39c0-.09-.07-.15-.15-.15H7.12c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.64 0h1.83c.09 0 .15-.07.15-.15V6.39c0-.09-.07-.15-.15-.15H9.76c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15zm2.63 0h1.83c.09 0 .15-.07.15-.15V6.39c0-.09-.07-.15-.15-.15h-1.83c-.09 0-.15.07-.15.15v1.67c0 .09.07.15.15.15z"/></svg>',
	play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
	stop: '<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>',
	restart: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	trash: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
	log: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
	pull: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
	close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
	image: '<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
	rocket: '<svg viewBox="0 0 24 24"><path d="M12 2.5s-5 5-5 11c0 2.5.5 4.5 1.5 6L12 22l3.5-2.5c1-1.5 1.5-3.5 1.5-6 0-6-5-11-5-11zm0 12.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 10 12 10s2.5 1.12 2.5 2.5S13.38 15 12 15z"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	compose: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-3h8v2H8v-2z"/></svg>',
	container: '<svg viewBox="0 0 24 24"><path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zM6 7h5v5H6V7zm7 0h5v2h-5V7zm0 4h5v2h-5v-2zm0 4h5v2h-5v-2zM6 13h5v5H6v-5z"/></svg>',
	edit: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'
};


function el(tag, cls, children) {
	if (arguments.length === 1 && typeof tag === 'string' && tag.charAt(0) === '<') {
		var w = document.createElement('span'); w.innerHTML = tag; return w.firstChild;
	}
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (children != null) {
		if (typeof children === 'string') e.innerHTML = children;
		else if (children instanceof Node) e.appendChild(children);
	}
	return e;
}

function formatSize(bytes) {
	if (!bytes || bytes <= 0) return '0 B';
	var u = ['B', 'KB', 'MB', 'GB', 'TB'];
	var i = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + u[i];
}

function svgIcon(svg, size, fill) {
	return svg.replace('<svg ', '<svg style="width:' + (size || 16) + 'px;height:' + (size || 16) + 'px;fill:' + (fill || 'currentColor') + '" ');
}

return view.extend({
	load: function() {
		var D = '/usr/bin/docker';
		var psCmd = D + " ps -a --format '{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}|{{.State}}|{{.CreatedAt}}' 2>&1";
		var imgCmd = D + " images --format '{{.Repository}}:{{.Tag}}|{{.ID}}|{{.Size}}|{{.CreatedSince}}' 2>&1";
		var infoCmd = D + " info --format '{{.Containers}}|{{.ContainersRunning}}|{{.ContainersStopped}}|{{.Images}}|{{.ServerVersion}}|{{.DockerRootDir}}' 2>&1";
		var diskCmd = D + " system df --format '{{.Size}}' 2>/dev/null | head -1 || echo '0B'";
		var checkCmd = "pidof dockerd >/dev/null 2>&1 && echo running || echo stopped";
		var dataRootCmd = "uci -q get dockerd.globals.data_root || echo /opt/docker";

		return Promise.all([
			L.resolveDefault(callFileExec('/bin/sh', ['-c', psCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', imgCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', infoCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', diskCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', checkCmd]), {}),
			L.resolveDefault(callFileExec('/bin/sh', ['-c', dataRootCmd]), {})
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null,

	showToast: function(msg) {
		var t = el('div', 'simple-toast', msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	parseContainers: function(stdout) {
		var containers = [];
		(stdout || '').trim().split('\n').forEach(function(line) {
			if (!line.trim()) return;
			var p = line.split('|');
			if (p.length >= 6) {
				containers.push({
					id: p[0],
					name: p[1],
					image: p[2],
					status: p[3],
					ports: p[4] || '',
					state: p[5].toLowerCase(),
					created: p[6] || ''
				});
			}
		});
		return containers;
	},

	parseImages: function(stdout) {
		var images = [];
		(stdout || '').trim().split('\n').forEach(function(line) {
			if (!line.trim()) return;
			var p = line.split('|');
			if (p.length >= 4) {
				images.push({
					repo: p[0],
					id: p[1],
					size: p[2],
					created: p[3]
				});
			}
		});
		return images;
	},

	parseInfo: function(stdout) {
		var p = (stdout || '').trim().split('|');
		if (p.length >= 6) {
			return {
				containers: parseInt(p[0]) || 0,
				running: parseInt(p[1]) || 0,
				stopped: parseInt(p[2]) || 0,
				images: parseInt(p[3]) || 0,
				version: p[4] || '',
				rootDir: p[5] || ''
			};
		}
		return { containers: 0, running: 0, stopped: 0, images: 0, version: '', rootDir: '' };
	},

	containerAction: function(action, id, name) {
		var self = this;
		var cmd = '/usr/bin/docker ' + action + ' ' + id + ' 2>&1 && echo DOCKER_ACTION_OK || echo DOCKER_ACTION_FAIL';
		var labels = { start: 'Starting', stop: 'Stopping', restart: 'Restarting', rm: 'Removing' };
		self.showToast((labels[action] || action) + ' ' + name + '...');
		return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var stdout = (res && res.stdout) || '';
			var ok = stdout.indexOf('DOCKER_ACTION_OK') !== -1;
			if (ok) {
				self.showToast(name + ' ' + action + ' successful');
				setTimeout(function() { window.location.reload(); }, 1500);
			} else {
				var errMsg = stdout.replace('DOCKER_ACTION_FAIL', '').trim();
				var portMatch = errMsg.match(/bind.*?:\s*(.*?in use)/i);
				var detail = portMatch ? portMatch[1] : (errMsg.length > 120 ? errMsg.substring(0, 120) + '...' : errMsg);
				self.showToast('Failed to ' + action + ' ' + name + (detail ? ': ' + detail : ''));
			}
		});
	},

	pullImage: function(imageName) {
		var self = this;
		self.showToast('Pulling ' + imageName + '... This may take a while.');
		var cmd = '/usr/bin/docker pull ' + imageName + ' 2>&1 && echo PULL_OK || echo PULL_FAIL';
		return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var ok = res && res.stdout && res.stdout.indexOf('PULL_OK') !== -1;
			self.showToast(ok ? 'Pulled ' + imageName + ' successfully' : 'Failed to pull ' + imageName);
			if (ok) setTimeout(function() { window.location.reload(); }, 1500);
		});
	},

	removeImage: function(id, name) {
		var self = this;
		if (!confirm('Remove image ' + name + '?')) return;
		var cmd = '/usr/bin/docker rmi ' + id + ' 2>&1 && echo OK || echo FAIL';
		return L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var ok = res && res.stdout && res.stdout.indexOf('OK') !== -1;
			self.showToast(ok ? 'Removed ' + name : 'Failed to remove ' + name + ' (may be in use)');
			if (ok) setTimeout(function() { window.location.reload(); }, 1500);
		});
	},

	showLogs: function(id, name) {
		var self = this;
		var overlay = el('div', 'dock-logs-overlay');
		var modal = el('div', 'dock-logs-modal');

		var hdr = el('div', 'dock-logs-hdr');
		hdr.appendChild(el('span', 'dock-logs-title', svgIcon(SVG.log, 18, 'var(--simple-accent)') + ' Logs: ' + name));
		var closeBtn = el('button', 'dock-logs-close');
		closeBtn.innerHTML = svgIcon(SVG.close, 18);
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		hdr.appendChild(closeBtn);
		modal.appendChild(hdr);

		var content = el('pre', 'dock-logs-content', 'Loading logs...');
		modal.appendChild(content);

		overlay.appendChild(modal);
		overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
		document.body.appendChild(overlay);

		var cmd = "/usr/bin/docker logs --tail 200 " + id + " 2>&1";
		L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var logs = '';
			if (res && res.stdout) logs += res.stdout;
			if (res && res.stderr) logs += (logs ? '\n' : '') + res.stderr;
			logs = logs.trim();
			content.textContent = logs || 'No logs available.\n\nThis container may not have started yet. Check the container status and try starting it first.';
			content.scrollTop = content.scrollHeight;
		});
	},

	showEditCompose: function(containerName, dataRoot) {
		var self = this;
		var composeDir = dataRoot + '/compose/' + containerName;
		var composePath = composeDir + '/docker-compose.yml';

		var overlay = el('div', 'dock-logs-overlay');
		var modal = el('div', 'dock-logs-modal dock-run-modal');
		modal.style.maxWidth = '620px';

		var hdr = el('div', 'dock-logs-hdr');
		hdr.appendChild(el('span', 'dock-logs-title', svgIcon(SVG.edit, 18, 'var(--simple-accent)') + ' Edit Compose: ' + containerName));
		var closeBtn = el('button', 'dock-logs-close');
		closeBtn.innerHTML = svgIcon(SVG.close, 18);
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		hdr.appendChild(closeBtn);
		modal.appendChild(hdr);

		var form = el('div', 'dock-run-form');

		var loading = el('div', 'dock-run-hint');
		loading.textContent = 'Loading compose file...';
		form.appendChild(loading);

		var editor = document.createElement('textarea');
		editor.className = 'dock-run-input dock-run-textarea';
		editor.style.display = 'none';
		editor.style.minHeight = '280px';
		form.appendChild(editor);

		var envGroup = el('div', 'dock-run-group');
		envGroup.style.display = 'none';
		envGroup.appendChild(el('label', 'dock-run-label', '.env'));
		var envEditor = document.createElement('textarea');
		envEditor.className = 'dock-run-input dock-run-textarea';
		envEditor.style.minHeight = '80px';
		envGroup.appendChild(envEditor);
		form.appendChild(envGroup);

		var actions = el('div', 'dock-run-actions');
		actions.style.display = 'none';

		var cancelBtn = el('button', 'dock-action-btn dock-btn-cancel', 'Cancel');
		cancelBtn.addEventListener('click', function() { overlay.remove(); });

		var saveBtn = el('button', 'dock-action-btn dock-btn-outline', svgIcon(SVG.compose, 14) + ' Save');
		saveBtn.addEventListener('click', function() {
			var yaml = editor.value.trim();
			if (!yaml) { self.showToast('Compose file is empty'); return; }
			saveBtn.disabled = true;
			saveBtn.textContent = 'Saving...';
			var writeCmd = "cat > '" + composePath + "' << 'GULFEOF'\n" + yaml + "\nGULFEOF\necho SAVE_OK";
			L.resolveDefault(callFileExec('/bin/sh', ['-c', writeCmd]), {}).then(function(res) {
				var ok = (res && res.stdout || '').indexOf('SAVE_OK') !== -1;
				if (envEditor.value.trim()) {
					var envCmd = "cat > '" + composeDir + "/.env' << 'GULFEOF'\n" + envEditor.value.trim() + "\nGULFEOF\necho ENV_OK";
					return L.resolveDefault(callFileExec('/bin/sh', ['-c', envCmd]), {}).then(function() {
						return ok;
					});
				}
				return ok;
			}).then(function(ok) {
				saveBtn.disabled = false;
				saveBtn.innerHTML = svgIcon(SVG.compose, 14) + ' Save';
				self.showToast(ok ? 'Compose file saved' : 'Failed to save');
			});
		});

		var saveStartBtn = el('button', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.play, 14) + ' Save & Start');
		saveStartBtn.addEventListener('click', function() {
			var yaml = editor.value.trim();
			if (!yaml) { self.showToast('Compose file is empty'); return; }
			saveStartBtn.disabled = true;
			saveStartBtn.textContent = 'Saving & starting...';
			var writeCmd = "cat > '" + composePath + "' << 'GULFEOF'\n" + yaml + "\nGULFEOF\necho SAVE_OK";
			L.resolveDefault(callFileExec('/bin/sh', ['-c', writeCmd]), {}).then(function(res) {
				if (envEditor.value.trim()) {
					var envCmd = "cat > '" + composeDir + "/.env' << 'GULFEOF'\n" + envEditor.value.trim() + "\nGULFEOF";
					return L.resolveDefault(callFileExec('/bin/sh', ['-c', envCmd]), {});
				}
			}).then(function() {
				var upCmd = 'cd "' + composeDir + '" && docker compose up -d 2>&1 && echo UP_OK || echo UP_FAIL';
				return L.resolveDefault(callFileExec('/bin/sh', ['-c', upCmd]), {});
			}).then(function(res) {
				var ok = (res && res.stdout || '').indexOf('UP_OK') !== -1;
				self.showToast(ok ? containerName + ' started with new config!' : 'Failed to start: ' + ((res && res.stdout) || '').substring(0, 200));
				overlay.remove();
				if (ok) setTimeout(function() { window.location.reload(); }, 2000);
			});
		});

		actions.appendChild(cancelBtn);
		actions.appendChild(saveBtn);
		actions.appendChild(saveStartBtn);
		form.appendChild(actions);
		modal.appendChild(form);
		overlay.appendChild(modal);
		overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
		document.body.appendChild(overlay);

		var readCmd = 'cat "' + composePath + '" 2>/dev/null; echo "---ENVFILE---"; cat "' + composeDir + '/.env" 2>/dev/null';
		L.resolveDefault(callFileExec('/bin/sh', ['-c', readCmd]), {}).then(function(res) {
			var out = (res && res.stdout) || '';
			var parts = out.split('---ENVFILE---');
			var yaml = (parts[0] || '').trim();
			var envContent = (parts[1] || '').trim();

			loading.style.display = 'none';
			editor.style.display = '';
			actions.style.display = '';

			if (yaml) {
				editor.value = yaml;
			} else {
				editor.value = '# No docker-compose.yml found for this container.\n# This container may have been created with docker run.\n';
				editor.style.opacity = '0.6';
			}

			if (envContent) {
				envGroup.style.display = '';
				envEditor.value = envContent;
			}
		});
	},

	showRunDialog: function() {
		var self = this;
		var overlay = el('div', 'dock-logs-overlay');
		var modal = el('div', 'dock-logs-modal dock-run-modal');

		var hdr = el('div', 'dock-logs-hdr');
		hdr.appendChild(el('span', 'dock-logs-title', svgIcon(SVG.rocket, 18, 'var(--simple-accent)') + ' Run Container'));
		var closeBtn = el('button', 'dock-logs-close');
		closeBtn.innerHTML = svgIcon(SVG.close, 18);
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		hdr.appendChild(closeBtn);
		modal.appendChild(hdr);

		var form = el('div', 'dock-run-form');

		var toggle = el('div', 'dock-run-toggle');
		var btnContainer = el('button', 'dock-run-toggle-btn active');
		btnContainer.innerHTML = svgIcon(SVG.container, 14) + ' Container';
		var btnCompose = el('button', 'dock-run-toggle-btn');
		btnCompose.innerHTML = svgIcon(SVG.compose, 14) + ' Compose';
		toggle.appendChild(btnContainer);
		toggle.appendChild(btnCompose);
		form.appendChild(toggle);

		var containerPanel = el('div', '');
		var composePanel = el('div', '');
		composePanel.style.display = 'none';

		var fields = [
			{ label: 'Image', id: 'run-image', placeholder: 'e.g. nginx:latest' },
			{ label: 'Container Name', id: 'run-name', placeholder: 'e.g. my-nginx' },
			{ label: 'Ports', id: 'run-ports', placeholder: 'e.g. 8080:80,443:443' },
			{ label: 'Environment', id: 'run-env', placeholder: 'e.g. KEY=value,FOO=bar' },
			{ label: 'Volumes', id: 'run-vols', placeholder: 'e.g. /mnt/data:/data' }
		];
		fields.forEach(function(f) {
			var group = el('div', 'dock-run-group');
			group.appendChild(el('label', 'dock-run-label', f.label));
			var input = document.createElement('input');
			input.type = 'text';
			input.className = 'dock-run-input';
			input.placeholder = f.placeholder;
			input.id = f.id;
			group.appendChild(input);
			containerPanel.appendChild(group);
		});

		var composeHint = el('div', 'dock-run-hint');
		composeHint.textContent = 'Paste a docker-compose.yml below. It will be saved and run with docker compose up -d.';
		composePanel.appendChild(composeHint);

		var composeNameGroup = el('div', 'dock-run-group');
		composeNameGroup.appendChild(el('label', 'dock-run-label', 'Project Name'));
		var composeNameInput = document.createElement('input');
		composeNameInput.type = 'text';
		composeNameInput.className = 'dock-run-input';
		composeNameInput.placeholder = 'e.g. my-stack';
		composeNameInput.id = 'compose-name';
		composeNameGroup.appendChild(composeNameInput);
		composePanel.appendChild(composeNameGroup);

		var composeGroup = el('div', 'dock-run-group');
		composeGroup.appendChild(el('label', 'dock-run-label', 'docker-compose.yml'));
		var composeArea = document.createElement('textarea');
		composeArea.className = 'dock-run-input dock-run-textarea';
		composeArea.placeholder = 'services:\n  web:\n    image: nginx:latest\n    ports:\n      - "8080:80"';
		composeArea.id = 'compose-yaml';
		composeGroup.appendChild(composeArea);
		composePanel.appendChild(composeGroup);

		form.appendChild(containerPanel);
		form.appendChild(composePanel);

		var mode = 'container';
		btnContainer.addEventListener('click', function() {
			mode = 'container';
			btnContainer.className = 'dock-run-toggle-btn active';
			btnCompose.className = 'dock-run-toggle-btn';
			containerPanel.style.display = '';
			composePanel.style.display = 'none';
			runBtn.innerHTML = svgIcon(SVG.play, 14) + ' Pull & Run';
		});
		btnCompose.addEventListener('click', function() {
			mode = 'compose';
			btnCompose.className = 'dock-run-toggle-btn active';
			btnContainer.className = 'dock-run-toggle-btn';
			composePanel.style.display = '';
			containerPanel.style.display = 'none';
			runBtn.innerHTML = svgIcon(SVG.play, 14) + ' Deploy Stack';
		});

		var actions = el('div', 'dock-run-actions');
		var cancelBtn = el('button', 'dock-action-btn dock-btn-cancel', 'Cancel');
		cancelBtn.addEventListener('click', function() { overlay.remove(); });
		var runBtn = el('button', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.play, 14) + ' Pull & Run');
		runBtn.addEventListener('click', function() {
			if (mode === 'container') {
				var img = document.getElementById('run-image').value.trim();
				var name = document.getElementById('run-name').value.trim();
				var ports = document.getElementById('run-ports').value.trim();
				var envStr = document.getElementById('run-env').value.trim();
				var vols = document.getElementById('run-vols').value.trim();
				if (!img) { self.showToast('Image name is required'); return; }
				overlay.remove();

				var cmd = '/usr/bin/docker pull ' + img + ' 2>&1 && /usr/bin/docker run -d --restart unless-stopped';
				if (name) cmd += ' --name ' + name.replace(/[^a-zA-Z0-9_.-]/g, '-');
				if (ports) ports.split(',').forEach(function(p) { cmd += ' -p ' + p.trim(); });
				if (envStr) envStr.split(',').forEach(function(e) { cmd += ' -e ' + e.trim(); });
				if (vols) vols.split(',').forEach(function(v) { cmd += ' -v ' + v.trim(); });
				cmd += ' ' + img + ' 2>&1 && echo RUN_OK || echo RUN_FAIL';

				self.showToast('Pulling & running ' + img + '...');
				L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function(res) {
					var ok = res && res.stdout && res.stdout.indexOf('RUN_OK') !== -1;
					self.showToast(ok ? 'Container started!' : 'Failed to start container');
					if (ok) setTimeout(function() { window.location.reload(); }, 2000);
				});
			} else {
				var projName = document.getElementById('compose-name').value.trim();
				var yaml = document.getElementById('compose-yaml').value.trim();
				if (!projName) { self.showToast('Project name is required'); return; }
				if (!yaml) { self.showToast('Compose YAML is required'); return; }
				projName = projName.replace(/[^a-zA-Z0-9_.-]/g, '-').toLowerCase();

				var dataRootCmd = "uci -q get dockerd.globals.data_root || echo /opt/docker";
				L.resolveDefault(callFileExec('/bin/sh', ['-c', dataRootCmd]), {}).then(function(dr) {
					var dataRoot = (dr && dr.stdout) ? dr.stdout.trim() : '/opt/docker';
					var composeDir = dataRoot + '/compose/' + projName;

					var mkdirCmd = 'mkdir -p "' + composeDir + '"';
					return L.resolveDefault(callFileExec('/bin/sh', ['-c', mkdirCmd]), {}).then(function() {
						return L.resolveDefault(callFileWrite(composeDir + '/docker-compose.yml', yaml), {});
					}).then(function() {
						overlay.remove();
						self.showToast('Deploying ' + projName + '...');
						var logFile = '/tmp/deploy-' + projName + '.log';
						var launcherPath = '/tmp/deploy-' + projName + '.sh';
						var launcherScript = '#!/bin/sh\ncd "' + composeDir + '"\ndocker compose up -d > ' + logFile + ' 2>&1\n';
						return L.resolveDefault(callFileWrite(launcherPath, launcherScript), {}).then(function() {
							var runCmd = 'chmod +x ' + launcherPath + '; ' + launcherPath + ' </dev/null >/dev/null 2>&1 & echo STARTED';
							return L.resolveDefault(callFileExec('/bin/sh', ['-c', runCmd]), {});
						});
					}).then(function() {
						self.showToast(projName + ' deployment started. Check Containers in a moment.');
						setTimeout(function() { window.location.reload(); }, 8000);
					});
				});
			}
		});
		actions.appendChild(cancelBtn);
		actions.appendChild(runBtn);
		form.appendChild(actions);

		modal.appendChild(form);
		overlay.appendChild(modal);
		overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
		document.body.appendChild(overlay);
	},

	render: function(data) {
		var self = this;
		var containers = this.parseContainers(data[0] ? data[0].stdout : '');
		var images = this.parseImages(data[1] ? data[1].stdout : '');
		var info = this.parseInfo(data[2] ? data[2].stdout : '');
		var diskUsage = (data[3] && data[3].stdout) ? data[3].stdout.trim() : '0';
		var daemonStatus = (data[4] && data[4].stdout) ? data[4].stdout.trim() : 'stopped';
		var dataRoot = (data[5] && data[5].stdout) ? data[5].stdout.trim() : '/opt/docker';

		var isRunning = daemonStatus === 'running';

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = isRunning
			? 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)'
			: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var iconDiv = el('div', 'tg-shield ' + (isRunning ? 'connected' : 'disconnected'));
		iconDiv.innerHTML = svgIcon(SVG.docker, 40, '#fff');
		if (isRunning) {
			iconDiv.style.background = 'rgba(37,99,235,0.3)';
			iconDiv.style.boxShadow = '0 0 24px rgba(37,99,235,0.4), 0 0 48px rgba(37,99,235,0.2)';
		}
		hero.appendChild(iconDiv);

		hero.appendChild(el('div', 'tg-status-text', isRunning ? 'Docker Running' : 'Docker Stopped'));
		hero.appendChild(el('div', 'tg-status-sub',
			isRunning
				? 'v' + info.version + ' \u2022 ' + info.running + ' running, ' + info.stopped + ' stopped'
				: 'Docker daemon is not running'));

		if (isRunning) {
			var stats = el('div', 'tg-stats');

			var s1 = el('div', 'tg-stat');
			s1.appendChild(el('div', 'tg-stat-val', String(info.containers)));
			s1.appendChild(el('div', 'tg-stat-label', 'Containers'));
			stats.appendChild(s1);

			var s2 = el('div', 'tg-stat');
			s2.appendChild(el('div', 'tg-stat-val', String(info.images)));
			s2.appendChild(el('div', 'tg-stat-label', 'Images'));
			stats.appendChild(s2);

			var s3 = el('div', 'tg-stat');
			s3.appendChild(el('div', 'tg-stat-val', diskUsage || '0'));
			s3.appendChild(el('div', 'tg-stat-label', 'Disk Used'));
			stats.appendChild(s3);

			hero.appendChild(stats);
		}
		root.appendChild(hero);

		if (!isRunning) {
			var startCard = el('div', 'tg-config dock-card');
			var startBody = el('div', 'dock-empty-state');
			startBody.innerHTML = svgIcon(SVG.docker, 48, 'var(--simple-accent)');
			startBody.appendChild(el('div', 'dock-empty-title', 'Docker is not running'));
			startBody.appendChild(el('div', 'dock-empty-sub', 'Start the Docker daemon to manage containers'));
			var startBtn = el('button', 'dock-action-btn dock-btn-deploy');
			startBtn.innerHTML = svgIcon(SVG.play, 16) + ' Start Docker';
			startBtn.addEventListener('click', function() {
				self.showToast('Starting Docker daemon...');
				L.resolveDefault(callFileExec('/bin/sh', ['-c', '/etc/init.d/dockerd start 2>&1 && echo OK']), {}).then(function() {
					setTimeout(function() { window.location.reload(); }, 5000);
				});
			});
			startBody.appendChild(startBtn);
			startCard.appendChild(startBody);
			root.appendChild(startCard);
			return root;
		}

		/* ── Containers Card ── */
		var cCard = el('div', 'tg-config dock-card');
		var cHdr = el('div', 'dock-card-hdr');
		cHdr.innerHTML = svgIcon(SVG.docker, 20, 'var(--simple-accent)');
		cHdr.appendChild(el('span', 'dock-card-title', 'Containers'));

		var cActions = el('div', 'dock-card-hdr-actions');
		var refreshBtn = el('button', 'dock-action-btn dock-btn-outline');
		refreshBtn.innerHTML = svgIcon(SVG.refresh, 14) + ' Refresh';
		refreshBtn.addEventListener('click', function() { window.location.reload(); });
		cActions.appendChild(refreshBtn);
		cHdr.appendChild(cActions);
		cCard.appendChild(cHdr);

		if (containers.length === 0) {
			var emptyC = el('div', 'dock-empty-state');
			emptyC.innerHTML = svgIcon(SVG.docker, 36, 'var(--text-color-low)');
			emptyC.appendChild(el('div', 'dock-empty-sub', 'No containers yet. Pull an image or deploy an app from the Apps page.'));
			cCard.appendChild(emptyC);
		} else {
			containers.forEach(function(c) {
				var row = el('div', 'dock-container-row');

				var statusDot = el('span', 'dock-status-dot ' + (c.state === 'running' ? 'dock-dot-running' : 'dock-dot-stopped'));
				row.appendChild(statusDot);

				var info = el('div', 'dock-container-info');
				info.appendChild(el('div', 'dock-container-name', c.name));
				var meta = el('div', 'dock-container-meta');
				meta.appendChild(el('span', 'dock-container-image', c.image));
				meta.appendChild(el('span', 'dock-container-status', c.status));
				info.appendChild(meta);

				if (c.ports) {
					var portsDiv = el('div', 'dock-container-ports');
					c.ports.split(',').forEach(function(p) {
						p = p.trim();
						if (p) portsDiv.appendChild(el('span', 'dock-port-badge', p));
					});
					info.appendChild(portsDiv);
				}
				row.appendChild(info);

				var btns = el('div', 'dock-container-actions');
				if (c.state === 'running') {
					var stopBtn = el('button', 'dock-action-btn dock-btn-stop');
					stopBtn.innerHTML = svgIcon(SVG.stop, 12) + ' Stop';
					stopBtn.title = 'Stop container';
					(function(id, name) {
						stopBtn.addEventListener('click', function() { self.containerAction('stop', id, name); });
					})(c.id, c.name);
					btns.appendChild(stopBtn);

					var restartBtn = el('button', 'dock-action-btn dock-btn-outline');
					restartBtn.innerHTML = svgIcon(SVG.restart, 12) + ' Restart';
					(function(id, name) {
						restartBtn.addEventListener('click', function() { self.containerAction('restart', id, name); });
					})(c.id, c.name);
					btns.appendChild(restartBtn);
			} else {
				var playBtn = el('button', 'dock-action-btn dock-btn-deploy');
				playBtn.innerHTML = svgIcon(SVG.play, 12) + ' Start';
				(function(id, name) {
					playBtn.addEventListener('click', function() { self.containerAction('start', id, name); });
				})(c.id, c.name);
				btns.appendChild(playBtn);

				var editBtn = el('button', 'dock-action-btn dock-btn-outline');
				editBtn.innerHTML = svgIcon(SVG.edit, 12) + ' Edit';
				editBtn.title = 'Edit docker-compose.yml';
				(function(name) {
					editBtn.addEventListener('click', function() { self.showEditCompose(name, dataRoot); });
				})(c.name);
				btns.appendChild(editBtn);
			}

				var logBtn = el('button', 'dock-action-btn dock-btn-outline');
				logBtn.innerHTML = svgIcon(SVG.log, 12) + ' Logs';
				(function(id, name) {
					logBtn.addEventListener('click', function() { self.showLogs(id, name); });
				})(c.id, c.name);
				btns.appendChild(logBtn);

				var rmBtn = el('button', 'dock-action-btn dock-btn-danger');
				rmBtn.innerHTML = svgIcon(SVG.trash, 12);
				rmBtn.title = 'Remove container';
				(function(id, name, state) {
					rmBtn.addEventListener('click', function() {
						if (!confirm('Remove container ' + name + '?')) return;
						if (state === 'running') {
							self.containerAction('stop', id, name);
							setTimeout(function() { self.containerAction('rm', id, name); }, 3000);
						} else {
							self.containerAction('rm', id, name);
						}
					});
				})(c.id, c.name, c.state);
				btns.appendChild(rmBtn);

				row.appendChild(btns);
				cCard.appendChild(row);
			});
		}

		var addRow = el('div', 'dock-add-row');
		var runNewBtn = el('button', 'dock-action-btn dock-btn-deploy dock-btn-full');
		runNewBtn.innerHTML = svgIcon(SVG.rocket, 16) + ' Pull & Run Container';
		runNewBtn.addEventListener('click', function() { self.showRunDialog(); });
		addRow.appendChild(runNewBtn);
		cCard.appendChild(addRow);

		root.appendChild(cCard);

		/* ── Images Card ── */
		var iCard = el('div', 'tg-config dock-card');
		var iHdr = el('div', 'dock-card-hdr');
		iHdr.innerHTML = svgIcon(SVG.image, 20, 'var(--simple-accent)');
		iHdr.appendChild(el('span', 'dock-card-title', 'Images'));
		iCard.appendChild(iHdr);

		if (images.length === 0) {
			var emptyI = el('div', 'dock-empty-state');
			emptyI.appendChild(el('div', 'dock-empty-sub', 'No images pulled yet'));
			iCard.appendChild(emptyI);
		} else {
			images.forEach(function(img) {
				var row = el('div', 'dock-image-row');
				var info = el('div', 'dock-image-info');
				info.appendChild(el('div', 'dock-image-name', img.repo));
				info.appendChild(el('div', 'dock-image-meta', img.size + ' \u2022 ' + img.created));
				row.appendChild(info);
				var rmBtn = el('button', 'dock-action-btn dock-btn-danger');
				rmBtn.innerHTML = svgIcon(SVG.trash, 12);
				rmBtn.title = 'Remove image';
				(function(id, name) {
					rmBtn.addEventListener('click', function() { self.removeImage(id, name); });
				})(img.id, img.repo);
				row.appendChild(rmBtn);
				iCard.appendChild(row);
			});
		}

		var pullRow = el('div', 'dock-pull-row');
		var pullInput = document.createElement('input');
		pullInput.type = 'text';
		pullInput.className = 'dock-pull-input';
		pullInput.placeholder = 'Image name (e.g. nginx:latest)';
		pullRow.appendChild(pullInput);
		var pullBtn = el('button', 'dock-action-btn dock-btn-deploy');
		pullBtn.innerHTML = svgIcon(SVG.pull, 14) + ' Pull';
		pullBtn.addEventListener('click', function() {
			var img = pullInput.value.trim();
			if (!img) { self.showToast('Enter an image name'); return; }
			self.pullImage(img);
		});
		pullRow.appendChild(pullBtn);
		iCard.appendChild(pullRow);

		root.appendChild(iCard);

		return root;
	}
});
