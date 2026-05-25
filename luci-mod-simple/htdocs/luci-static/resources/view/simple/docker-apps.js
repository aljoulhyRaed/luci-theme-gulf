'use strict';
'require view';
'require rpc';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });
var callFileRead = rpc.declare({ object: 'file', method: 'read', params: ['path'] });
var callFileWrite = rpc.declare({ object: 'file', method: 'write', params: ['path', 'data'] });

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

function fetchText(url) {
	return new Promise(function(resolve) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function() { resolve(xhr.status === 200 ? xhr.responseText : ''); };
		xhr.onerror = function() { resolve(''); };
		xhr.send();
	});
}

var GITHUB_RAW = 'https://raw.githubusercontent.com/torguardvpn/gulf-appstore/main';

var SVG = {
	rocket: '<svg viewBox="0 0 24 24"><path d="M12 2.5c0 0-6.5 5-6.5 13.5h13C18.5 7.5 12 2.5 12 2.5zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 20l1.5 1.5L9 20H5zm7 0l1.5 1.5L16 20h-4zm5 0l1.5 1.5L21 20h-2z"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
	search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
	store: '<svg viewBox="0 0 24 24"><path d="M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z"/></svg>',
	cube: '<svg viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15zM5 15.91l6 3.38v-6.71L5 9.21v6.7zm14 0v-6.7l-6 3.37v6.71l6-3.38z"/></svg>'
};

var CATEGORY_COLORS = {
	'AI': '#8b5cf6', 'Automation': '#f59e0b', 'Books': '#78716c', 'Cloud & Data': '#3b82f6',
	'Development': '#10b981', 'Finance': '#14b8a6', 'Gaming': '#ec4899', 'Media': '#a855f7',
	'Music': '#f43f5e', 'Network': '#0ea5e9', 'Photography': '#f97316', 'Security': '#ef4444',
	'Social': '#6366f1', 'Utilities': '#64748b'
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
	catalog: [],
	containers: [],
	paths: {},
	settings: {},
	dataRoot: '/opt/docker',

	load: function() {
		var dataRootCmd = "uci -q get dockerd.globals.data_root || echo /opt/docker";
		var settingsCmd = "cat $(uci -q get dockerd.globals.data_root || echo /opt/docker)/.gulf-docker.json 2>/dev/null || echo '{}'";
		var containersCmd = "/usr/bin/docker ps -a --format '{{.Names}}|{{.Status}}|{{.Image}}' 2>/dev/null || true";
		var checkCmd = "pidof dockerd >/dev/null 2>&1 && echo running || echo stopped";
		var catalogDlCmd = 'DEST=/www/luci-static/resources/view/simple/appstore; ' +
			'mkdir -p "$DEST"; ' +
			'if [ ! -f "$DEST/catalog.json" ] || [ "$(find "$DEST/catalog.json" -mmin +60 2>/dev/null)" ]; then ' +
			'wget -q -O "$DEST/catalog.json.tmp" "' + GITHUB_RAW + '/catalog.json" 2>/dev/null && ' +
			'mv "$DEST/catalog.json.tmp" "$DEST/catalog.json" && chmod 644 "$DEST/catalog.json" && echo UPDATED || echo CACHED; ' +
			'else echo CACHED; fi';

		return L.resolveDefault(callFileExec('/bin/sh', ['-c', catalogDlCmd]), {}).then(function() {
			return Promise.all([
				L.resolveDefault(callFileExec('/bin/sh', ['-c', dataRootCmd]), {}),
				L.resolveDefault(callFileExec('/bin/sh', ['-c', settingsCmd]), {}),
				L.resolveDefault(callFileExec('/bin/sh', ['-c', containersCmd]), {}),
				L.resolveDefault(callFileExec('/bin/sh', ['-c', checkCmd]), {}),
				fetchJSON(L.resource('view/simple/appstore/catalog.json'))
			]);
		});
	},

	handleSaveApply: null, handleSave: null, handleReset: null,

	showToast: function(msg) {
		var t = el('div', 'simple-toast', msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	substituteVars: function(template, paths, tz) {
		return template
			.replace(/\{\{CONFIG\}\}/g, paths.config || '/opt/docker/config')
			.replace(/\{\{DOWNLOADS\}\}/g, paths.downloads || '/mnt/files/downloads')
			.replace(/\{\{MEDIA\}\}/g, paths.media || '/mnt/files/media')
			.replace(/\{\{CLOUD\}\}/g, paths.cloud || '/mnt/cloud')
			.replace(/\{\{TZ\}\}/g, tz || 'UTC');
	},

	ensureRestartPolicy: function(yaml) {
		if (/restart\s*:/m.test(yaml)) return yaml;
		var lines = yaml.split('\n');
		var result = [];
		for (var i = 0; i < lines.length; i++) {
			result.push(lines[i]);
			if (/^\s+container_name\s*:/.test(lines[i])) {
				var indent = lines[i].match(/^(\s+)/)[1];
				result.push(indent + 'restart: unless-stopped');
			}
		}
		return result.join('\n');
	},

	getContainerStatus: function(appId) {
		for (var i = 0; i < this.containers.length; i++) {
			if (this.containers[i].name === appId) return this.containers[i];
		}
		return null;
	},

	showDeployModal: function(app) {
		var self = this;
		var ghUrl = GITHUB_RAW + '/apps/' + app.id + '/docker-compose.yml';
		var fetchCmd = 'wget -q -O - "' + ghUrl + '" 2>/dev/null';

		L.resolveDefault(callFileExec('/bin/sh', ['-c', fetchCmd]), {}).then(function(res) {
			var rawCompose = (res && res.stdout) ? res.stdout : '';
			if (!rawCompose.trim()) {
				self.showToast('Could not load compose file for ' + app.name);
				return;
			}

			var yaml = self.substituteVars(rawCompose, self.paths, self.settings.timezone);

			var overlay = el('div', 'dapps-modal-overlay');
			var modal = el('div', 'dapps-modal');

			var hdr = el('div', 'dapps-modal-hdr');
			hdr.innerHTML = svgIcon(SVG.rocket, 22, 'var(--simple-accent)');
			hdr.appendChild(el('span', 'dapps-modal-title', 'Deploy ' + app.name));
			var closeBtn = el('button', 'dapps-modal-close');
			closeBtn.innerHTML = svgIcon(SVG.close, 18);
			closeBtn.addEventListener('click', function() { overlay.remove(); });
			hdr.appendChild(closeBtn);
			modal.appendChild(hdr);

			if (app.description) {
				var desc = el('div', 'dapps-modal-desc', '');
				desc.textContent = app.description.length > 300 ? app.description.substring(0, 300) + '...' : app.description;
				modal.appendChild(desc);
			}

			var formFields = app.form_fields || [];
			var formInputs = {};

			if (formFields.length > 0) {
				var formSection = el('div', 'dapps-form-section');
				formSection.appendChild(el('div', 'dapps-form-title', 'Configuration'));

				formFields.forEach(function(field) {
					var group = el('div', 'dapps-form-group');
					var label = el('label', 'dapps-form-label', field.label || field.env_variable);
					if (field.required) {
						label.appendChild(el('span', 'dapps-form-req', ' *'));
					}
					group.appendChild(label);

					var input;
					if (field.type === 'password') {
						input = document.createElement('input');
						input.type = 'password';
						input.className = 'dock-run-input';
						input.placeholder = field.hint || 'Enter ' + (field.label || field.env_variable);
					} else if (field.type === 'random') {
						input = document.createElement('input');
						input.type = 'text';
						input.className = 'dock-run-input';
						var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
						var len = field.min || 32;
						var rnd = '';
						for (var i = 0; i < len; i++) rnd += chars.charAt(Math.floor(Math.random() * chars.length));
						input.value = rnd;
					} else {
						input = document.createElement('input');
						input.type = 'text';
						input.className = 'dock-run-input';
						input.placeholder = field.hint || 'Enter ' + (field.label || field.env_variable);
					}
					group.appendChild(input);
					formInputs[field.env_variable] = input;
					formSection.appendChild(group);
				});
				modal.appendChild(formSection);
			}

			var editorToggle = el('div', 'dapps-editor-toggle');
			var toggleLink = el('a', 'dapps-toggle-link', 'Show Compose File');
			var editorWrap = el('div', 'dapps-editor-wrap');
			editorWrap.style.display = 'none';
			var editor = document.createElement('textarea');
			editor.className = 'dapps-compose-editor';
			editor.value = yaml;
			editor.spellcheck = false;
			editorWrap.appendChild(editor);
			toggleLink.addEventListener('click', function(e) {
				e.preventDefault();
				if (editorWrap.style.display === 'none') {
					editorWrap.style.display = '';
					toggleLink.textContent = 'Hide Compose File';
				} else {
					editorWrap.style.display = 'none';
					toggleLink.textContent = 'Show Compose File';
				}
			});
			editorToggle.appendChild(toggleLink);
			modal.appendChild(editorToggle);
			modal.appendChild(editorWrap);

			if (app.port) {
				modal.appendChild(el('div', 'dapps-port-note', 'Port: ' + app.port + (app.url_suffix ? ' \u2022 URL suffix: ' + app.url_suffix : '')));
			}
			if (app.arch && app.arch.length) {
				modal.appendChild(el('div', 'dapps-port-note', 'Architectures: ' + app.arch.join(', ')));
			}

			var actions = el('div', 'dapps-modal-actions');
			var cancelBtn = el('button', 'dock-action-btn dock-btn-outline', 'Cancel');
			cancelBtn.addEventListener('click', function() { overlay.remove(); });
			actions.appendChild(cancelBtn);

			var deployBtn = el('button', 'dock-action-btn dock-btn-deploy', svgIcon(SVG.rocket, 14) + ' Deploy');
			deployBtn.addEventListener('click', function() {
				for (var i = 0; i < formFields.length; i++) {
					var f = formFields[i];
					var inp = formInputs[f.env_variable];
					if (f.required && !inp.value.trim()) {
						self.showToast(f.label + ' is required');
						inp.focus();
						return;
					}
				}

				deployBtn.disabled = true;
				deployBtn.innerHTML = 'Deploying...';

				var composeYaml = self.ensureRestartPolicy(editor.value.trim());
				if (!composeYaml) { self.showToast('Compose file is empty'); return; }

				var envLines = [];
				for (var ev in formInputs) {
					envLines.push(ev + '=' + formInputs[ev].value.trim());
				}
				var envContent = envLines.join('\n');
				var composeDir = self.dataRoot + '/compose/' + app.id;
				var logFile = '/tmp/deploy-' + app.id + '.log';

				modal.innerHTML = '';
				modal.style.cssText = 'max-width:620px;width:calc(100% - 40px);padding:24px 20px;box-sizing:border-box';
				var logTitle = el('h3', '', 'Deploying ' + app.name + '...');
				logTitle.style.cssText = 'margin:0 0 16px;color:var(--simple-text,#fff);font-size:18px';
				modal.appendChild(logTitle);

				var stepList = el('div', 'deploy-steps');
				stepList.style.cssText = 'margin-bottom:12px';
				modal.appendChild(stepList);

				var logPre = el('pre', 'dapps-logs-pre', '');
				logPre.style.cssText = 'max-height:350px;min-height:60px;overflow-y:auto;overflow-x:hidden;font-size:12px;font-family:monospace;padding:12px;border-radius:10px;background:#0d1117;color:#c9d1d9;white-space:pre-wrap;word-break:break-all;border:1px solid #30363d;line-height:1.5;box-sizing:border-box;max-width:100%';
				modal.appendChild(logPre);

				var logClose = el('button', 'dock-action-btn dock-btn-deploy', 'Close');
				logClose.style.cssText = 'margin-top:16px;display:none;padding:8px 24px';
				logClose.addEventListener('click', function() {
					overlay.remove();
					window.location.reload();
				});
				modal.appendChild(logClose);

				function addStep(text, status) {
					var s = el('div', '');
					s.style.cssText = 'padding:4px 0;font-size:13px;color:var(--simple-text-dim,#94a3b8)';
					var icon = status === 'ok' ? '\u2705' : status === 'fail' ? '\u274C' : '\u23F3';
					s.textContent = icon + '  ' + text;
					s._stepText = text;
					stepList.appendChild(s);
					return s;
				}

				function updateStep(stepEl, status) {
					var icon = status === 'ok' ? '\u2705' : status === 'fail' ? '\u274C' : '\u23F3';
					stepEl.textContent = icon + '  ' + stepEl._stepText;
				}

				function appendLog(text) {
					logPre.textContent += text + '\n';
					logPre.scrollTop = logPre.scrollHeight;
				}

				function showFail(msg) {
					logTitle.textContent = 'Deploy Failed';
					logTitle.style.color = '#f87171';
					appendLog('\n' + msg);
					logClose.style.display = '';
				}

				var stepFw = addStep('Configuring firewall...', 'pending');
				var stepDir = addStep('Preparing compose files...', 'pending');
				var stepPull = addStep('Pulling images & starting container...', 'pending');

				var fwCmd = "changed=0; " +
					"if ! uci show firewall 2>/dev/null | grep forwarding | grep -q \"dest='docker'\"; then " +
					"uci add firewall forwarding; uci set firewall.@forwarding[-1].src='lan'; " +
					"uci set firewall.@forwarding[-1].dest='docker'; changed=1; fi; " +
					"if ! uci get firewall.docker.device 2>/dev/null | grep -q 'br-'; then " +
					"uci add_list firewall.docker.device='br-+'; changed=1; fi; " +
					"if [ \"$changed\" = \"1\" ]; then uci commit firewall; fw4 reload 2>/dev/null; fi; echo FW_OK";

			L.resolveDefault(callFileExec('/bin/sh', ['-c', fwCmd]), {}).then(function(fwRes) {
				updateStep(stepFw, 'ok');
				appendLog('Firewall configured');

				var mkdirCmd = 'mkdir -p "' + composeDir + '" && echo DIR_OK';
				return L.resolveDefault(callFileExec('/bin/sh', ['-c', mkdirCmd]), {});
			}).then(function() {
				var writeYamlCmd = "cat > '" + composeDir + "/docker-compose.yml' << 'GULFEOF'\n" +
					composeYaml + "\nGULFEOF\necho WRITE_OK";
				return L.resolveDefault(callFileExec('/bin/sh', ['-c', writeYamlCmd]), {});
			}).then(function(writeRes) {
				var wout = (writeRes && writeRes.stdout) || '';
				if (wout.indexOf('WRITE_OK') === -1) {
					updateStep(stepDir, 'fail');
					showFail('Failed to write docker-compose.yml: ' + wout + ((writeRes && writeRes.stderr) || ''));
					return Promise.reject('write_failed');
				}

				if (envContent) {
					var writeEnvCmd = "cat > '" + composeDir + "/.env' << 'GULFEOF'\n" +
						envContent + "\nGULFEOF\necho WRITE_OK";
					return L.resolveDefault(callFileExec('/bin/sh', ['-c', writeEnvCmd]), {});
				}
				return Promise.resolve({});
			}).then(function() {
				updateStep(stepDir, 'ok');
				appendLog('Compose files written to ' + composeDir);

				updateStep(stepPull, 'pending');
				appendLog('Starting docker compose up...\n');

				var launcherPath = '/tmp/deploy-' + app.id + '.sh';
				var launchCmd = "cat > " + launcherPath + " << 'GULFEOF'\n" +
					'#!/bin/sh\ntouch ' + logFile + '\ncd "' + composeDir + '"\ndocker compose up -d >> ' + logFile + " 2>&1\nGULFEOF\n" +
					'chmod +x ' + launcherPath + '; rm -f ' + logFile + '; ' +
					launcherPath + ' </dev/null >/dev/null 2>&1 &';
				L.resolveDefault(callFileExec('/bin/sh', ['-c', launchCmd]), {});

				var pollCount = 0;
				var maxPolls = 180;
					var pollInterval = setInterval(function() {
						pollCount++;
					var readCmd = 'cat ' + logFile + ' 2>/dev/null; ' +
						'echo "---POLL---"; ' +
						'ps w 2>/dev/null | grep -v grep | grep -q "docker compose.*up" && echo RUNNING || echo DONE; ' +
						'echo "---CTR---"; ' +
						'docker ps --filter name=' + app.id + ' --format "{{.Names}}|{{.Status}}" 2>/dev/null | head -1';
						L.resolveDefault(callFileExec('/bin/sh', ['-c', readCmd]), {}).then(function(lr) {
							var out = (lr && lr.stdout) || '';
							var parts = out.split('---POLL---');
							var logContent = (parts[0] || '').trim();
							var rest = (parts[1] || '').split('---CTR---');
							var proc = (rest[0] || '').trim();
							var ctr = (rest[1] || '').trim();

						if (logContent) {
							logPre.textContent = logContent;
							logPre.scrollTop = logPre.scrollHeight;
						}

						var isUp = ctr.indexOf('Up') !== -1;
						if (proc === 'DONE' || isUp || pollCount >= maxPolls) {
							clearInterval(pollInterval);
								updateStep(stepPull, isUp ? 'ok' : 'fail');
								if (isUp) {
									logTitle.textContent = app.name + ' Deployed!';
									logTitle.style.color = '#4ade80';
									appendLog('\n\u2705 Container is running');
									logClose.style.display = '';
								} else {
									logTitle.textContent = 'Deploy Issue';
									logTitle.style.color = '#f87171';
									var errCmd = 'docker logs ' + app.id + ' --tail 30 2>&1; ' +
										'echo "---ALL---"; ' +
										'docker ps -a --filter name=' + app.id + ' --format "{{.Names}}: {{.Status}}" 2>/dev/null';
									L.resolveDefault(callFileExec('/bin/sh', ['-c', errCmd]), {}).then(function(er) {
										var eout = (er && er.stdout) || '';
										var eParts = eout.split('---ALL---');
										var containerLogs = (eParts[0] || '').trim();
										var ctrStatus = (eParts[1] || '').trim();
										appendLog('\n--- Container Status ---');
										if (ctrStatus) appendLog(ctrStatus);
										if (containerLogs) {
											appendLog('\n--- Container Logs ---');
											appendLog(containerLogs);
										}
										appendLog('\n\u274C Container not running');
										logClose.style.display = '';
									});
								}
							}
						});
					}, 3000);
				}).catch(function() {
					logClose.style.display = '';
				});
			});
			actions.appendChild(deployBtn);
			modal.appendChild(actions);

			overlay.appendChild(modal);
			overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
			document.body.appendChild(overlay);
		});
	},

	renderGrid: function(root, apps) {
		var self = this;
		var existingGrid = root.querySelector('.dapps-grid-container');
		if (existingGrid) existingGrid.remove();

		var gridContainer = el('div', 'dapps-grid-container');

		if (!apps.length) {
			var empty = el('div', 'dapps-empty');
			empty.textContent = 'No apps found matching your search.';
			gridContainer.appendChild(empty);
			root.appendChild(gridContainer);
			return;
		}

		var grid = el('div', 'dapps-grid');

		apps.forEach(function(app) {
			var containerInfo = self.getContainerStatus(app.id);
			var isDeployed = !!containerInfo;
			var isUp = isDeployed && containerInfo.status.indexOf('Up') !== -1;

			var card = el('div', 'dapps-card' + (isDeployed ? ' dapps-card-deployed' : ''));

			var cardIcon = el('div', 'dapps-card-icon');
			var catColor = CATEGORY_COLORS[app.category] || '#6366f1';
			cardIcon.style.background = catColor;
			cardIcon.innerHTML = svgIcon(SVG.cube, 24, '#fff');
			card.appendChild(cardIcon);

			var cardBody = el('div', 'dapps-card-body');
			var titleRow = el('div', 'dapps-card-title-row');
			titleRow.appendChild(el('span', 'dapps-card-name', app.name));
			if (isDeployed) {
				titleRow.appendChild(el('span', 'dock-port-badge ' + (isUp ? 'dset-badge-ok' : 'dset-badge-off'),
					isUp ? 'Running' : 'Stopped'));
			}
			cardBody.appendChild(titleRow);
			cardBody.appendChild(el('div', 'dapps-card-desc', app.short_desc || ''));

			var metaRow = el('div', 'dapps-card-meta');
			metaRow.appendChild(el('span', 'dapps-cat-pill', app.category));
			if (app.port) metaRow.appendChild(el('span', 'dapps-port-pill', ':' + app.port));
			cardBody.appendChild(metaRow);
			card.appendChild(cardBody);

			var cardAction = el('div', 'dapps-card-action');
			if (isDeployed) {
				var manageBtn = el('button', 'dock-action-btn dock-btn-outline dapps-btn-sm', 'Manage');
				manageBtn.addEventListener('click', (function(a, ci) {
					return function(ev) { ev.stopPropagation(); self.showManageModal(a, ci); };
				})(app, containerInfo));
				cardAction.appendChild(manageBtn);
			} else {
				var deployBtn = el('button', 'dock-action-btn dock-btn-deploy dapps-btn-sm',
					svgIcon(SVG.rocket, 12) + ' Deploy');
				deployBtn.addEventListener('click', (function(a) {
					return function(ev) { ev.stopPropagation(); self.showDeployModal(a); };
				})(app));
				cardAction.appendChild(deployBtn);
			}
			card.appendChild(cardAction);
			grid.appendChild(card);
		});

		gridContainer.appendChild(grid);
		root.appendChild(gridContainer);
	},

	showManageModal: function(app, containerInfo) {
		var self = this;
		var overlay = el('div', 'dapps-modal-overlay');
		var modal = el('div', 'dapps-modal');

		var hdr = el('div', 'dapps-modal-hdr');
		hdr.innerHTML = svgIcon(SVG.cube, 22, 'var(--simple-accent)');
		hdr.appendChild(el('span', 'dapps-modal-title', 'Manage ' + app.name));
		var closeBtn = el('button', 'dapps-modal-close');
		closeBtn.innerHTML = svgIcon(SVG.close, 18);
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		hdr.appendChild(closeBtn);
		modal.appendChild(hdr);

		var isUp = containerInfo && containerInfo.status.indexOf('Up') !== -1;
		var statusRow = el('div', 'dset-row');
		statusRow.appendChild(el('div', 'dset-label', 'Status'));
		statusRow.appendChild(el('span', 'dock-port-badge ' + (isUp ? 'dset-badge-ok' : 'dset-badge-off'),
			containerInfo ? containerInfo.status : 'Not found'));
		modal.appendChild(statusRow);

		if (app.port && isUp) {
			var linkRow = el('div', 'dset-row');
			linkRow.appendChild(el('div', 'dset-label', 'Access'));
			var accessLink = document.createElement('a');
			accessLink.href = 'http://' + window.location.hostname + ':' + app.port + (app.url_suffix || '');
			accessLink.target = '_blank';
			accessLink.className = 'dapps-access-link';
			accessLink.textContent = window.location.hostname + ':' + app.port;
			linkRow.appendChild(accessLink);
			modal.appendChild(linkRow);
		}

		var actions = el('div', 'dapps-modal-actions');

		if (isUp) {
			var stopBtn = el('button', 'dock-action-btn dock-btn-stop', 'Stop');
			stopBtn.addEventListener('click', function() {
				self.showToast('Stopping ' + app.name + '...');
				var composeDir = self.dataRoot + '/compose/' + app.id;
				var cmd = 'cd "' + composeDir + '" 2>/dev/null && docker compose stop 2>&1 || docker stop ' + app.id + ' 2>&1; echo STOP_OK';
				L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
					overlay.remove();
					setTimeout(function() { window.location.reload(); }, 2000);
				});
			});
			actions.appendChild(stopBtn);

			var restartBtn = el('button', 'dock-action-btn dock-btn-outline', 'Restart');
			restartBtn.addEventListener('click', function() {
				self.showToast('Restarting ' + app.name + '...');
				var composeDir = self.dataRoot + '/compose/' + app.id;
				var cmd = 'cd "' + composeDir + '" 2>/dev/null && docker compose restart 2>&1 || docker restart ' + app.id + ' 2>&1; echo RESTART_OK';
				L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
					overlay.remove();
					setTimeout(function() { window.location.reload(); }, 3000);
				});
			});
			actions.appendChild(restartBtn);
		} else {
			var startBtn = el('button', 'dock-action-btn dock-btn-deploy', 'Start');
			startBtn.addEventListener('click', function() {
				self.showToast('Starting ' + app.name + '...');
				var composeDir = self.dataRoot + '/compose/' + app.id;
				var cmd = 'cd "' + composeDir + '" 2>/dev/null && docker compose start 2>&1 || docker start ' + app.id + ' 2>&1; echo START_OK';
				L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
					overlay.remove();
					setTimeout(function() { window.location.reload(); }, 2000);
				});
			});
			actions.appendChild(startBtn);
		}

		var removeBtn = el('button', 'dock-action-btn dock-btn-stop', 'Remove');
		removeBtn.addEventListener('click', function() {
			if (!confirm('Remove ' + app.name + '? Data in volumes will be preserved.')) return;
			self.showToast('Removing ' + app.name + '...');
			var composeDir = self.dataRoot + '/compose/' + app.id;
			var cmd = 'cd "' + composeDir + '" 2>/dev/null && docker compose down 2>&1 || docker rm -f ' + app.id + ' 2>&1; echo REMOVE_OK';
			L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {}).then(function() {
				overlay.remove();
				self.showToast(app.name + ' removed');
				setTimeout(function() { window.location.reload(); }, 2000);
			});
		});
		actions.appendChild(removeBtn);

		modal.appendChild(actions);
		overlay.appendChild(modal);
		overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
		document.body.appendChild(overlay);
	},

	render: function(data) {
		var self = this;
		self.dataRoot = (data[0] && data[0].stdout) ? data[0].stdout.trim() : '/opt/docker';
		try { self.settings = JSON.parse((data[1] && data[1].stdout) ? data[1].stdout.trim() : '{}'); } catch(e) { self.settings = {}; }
		self.paths = self.settings.paths || {};
		var isRunning = (data[3] && data[3].stdout) ? data[3].stdout.trim() === 'running' : false;

		self.containers = [];
		((data[2] && data[2].stdout) || '').trim().split('\n').forEach(function(line) {
			if (!line.trim()) return;
			var parts = line.split('|');
			if (parts.length >= 3) {
				self.containers.push({ name: parts[0], status: parts[1], image: parts[2] });
			}
		});

		self.catalog = Array.isArray(data[4]) ? data[4] : [];

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* Hero */
		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)';
		var iconDiv = el('div', 'tg-shield disconnected');
		iconDiv.innerHTML = svgIcon(SVG.store, 40, '#fff');
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text', 'App Store'));
		hero.appendChild(el('div', 'tg-status-sub',
			isRunning ? self.catalog.length + ' apps available \u2022 ' + self.containers.length + ' deployed'
				: 'Docker daemon not running'));

		if (isRunning) {
			var updateBtn = document.createElement('button');
			updateBtn.className = 'tg-power-btn';
			updateBtn.style.cssText = 'font-size:13px;padding:8px 20px;margin-top:8px';
			updateBtn.innerHTML = svgIcon(SVG.refresh, 14) + ' Update Apps';
			updateBtn.addEventListener('click', function() {
				updateBtn.disabled = true;
				updateBtn.innerHTML = svgIcon(SVG.refresh, 14) + ' Updating\u2026';
				var updateCmd = 'DEST=/www/luci-static/resources/view/simple/appstore; ' +
					'mkdir -p "$DEST"; ' +
					'wget -q -O "$DEST/catalog.json.tmp" "' + GITHUB_RAW + '/catalog.json" 2>&1 && ' +
					'mv "$DEST/catalog.json.tmp" "$DEST/catalog.json" && ' +
					'chmod 644 "$DEST/catalog.json" && ' +
					'echo UPDATE_OK || echo UPDATE_FAIL';
				L.resolveDefault(callFileExec('/bin/sh', ['-c', updateCmd]), {}).then(function(res) {
					var out = (res && res.stdout) || '';
					if (out.indexOf('UPDATE_OK') !== -1) {
						self.showToast('App catalog updated from GitHub');
						setTimeout(function() { window.location.reload(); }, 1500);
					} else {
						self.showToast('Failed to update catalog \u2014 check internet connection');
						updateBtn.disabled = false;
						updateBtn.innerHTML = svgIcon(SVG.refresh, 14) + ' Update Apps';
					}
				});
			});
			hero.appendChild(updateBtn);
		}

		root.appendChild(hero);

		if (!isRunning) {
			var warn = el('div', 'tg-config dock-card');
			warn.style.textAlign = 'center';
			warn.style.padding = '32px';
			warn.innerHTML = '<p style="font-size:15px;margin:0 0 12px">Docker is not running. Start it from the <strong>Settings</strong> page first.</p>';
			root.appendChild(warn);
			return root;
		}

		if (!self.catalog.length) {
			var noCat = el('div', 'tg-config dock-card');
			noCat.style.textAlign = 'center';
			noCat.style.padding = '32px';
			noCat.innerHTML = '<p style="font-size:15px;margin:0 0 12px">App catalog not found. Deploy the app store files to the router first.</p>';
			root.appendChild(noCat);
			return root;
		}

		/* Search & Filter Bar */
		var toolbar = el('div', 'dapps-toolbar');

		var searchWrap = el('div', 'dapps-search-wrap');
		searchWrap.innerHTML = svgIcon(SVG.search, 18, 'var(--simple-text-secondary)');
		var searchInput = document.createElement('input');
		searchInput.type = 'text';
		searchInput.className = 'dapps-search-input';
		searchInput.placeholder = 'Search ' + self.catalog.length + ' apps...';
		searchWrap.appendChild(searchInput);
		toolbar.appendChild(searchWrap);

		var categories = ['All'];
		var catSet = {};
		self.catalog.forEach(function(a) {
			if (a.category && !catSet[a.category]) {
				catSet[a.category] = true;
				categories.push(a.category);
			}
		});
		categories.sort(function(a, b) { return a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b); });

		var filterRow = el('div', 'dapps-filter-row');
		var activeFilter = 'All';
		categories.forEach(function(cat) {
			var pill = el('span', 'dapps-filter-pill' + (cat === 'All' ? ' dapps-filter-active' : ''), cat);
			if (cat !== 'All') pill.style.borderColor = CATEGORY_COLORS[cat] || '#6366f1';
			pill.addEventListener('click', function() {
				activeFilter = cat;
				filterRow.querySelectorAll('.dapps-filter-pill').forEach(function(p) { p.classList.remove('dapps-filter-active'); });
				pill.classList.add('dapps-filter-active');
				applyFilter();
			});
			filterRow.appendChild(pill);
		});
		toolbar.appendChild(filterRow);
		root.appendChild(toolbar);

		function applyFilter() {
			var query = searchInput.value.toLowerCase().trim();
			var filtered = self.catalog.filter(function(app) {
				var matchCat = activeFilter === 'All' || app.category === activeFilter;
				var matchSearch = !query ||
					app.name.toLowerCase().indexOf(query) !== -1 ||
					(app.short_desc || '').toLowerCase().indexOf(query) !== -1 ||
					(app.category || '').toLowerCase().indexOf(query) !== -1;
				return matchCat && matchSearch;
			});
			self.renderGrid(root, filtered);
		}

		searchInput.addEventListener('input', applyFilter);
		self.renderGrid(root, self.catalog);

		return root;
	}
});
