'use strict';
'require baseclass';
'require ui';

return baseclass.extend({
	simpleMenuPaths: {
		'admin/gulf-dashboard': true,
		'admin/simple-wifi': true,
		'admin/simple-wifi/networks': true,
		'admin/simple-wifi/mesh': true,
		'admin/simple-internet': true,
		'admin/simple-internet/connection': true,
		'admin/simple-internet/firewall': true,
		'admin/simple-vpn': true,
		'admin/simple-vpn/status': true,
		'admin/simple-vpn/torguard': true,
		'admin/simple-vpn/custom': true,
		'admin/simple-vpn/openvpn': true,
		'admin/simple-vpn/v2ray': true,
		'admin/simple-devices': true,
		'admin/simple-devices/clients': true,
		'admin/simple-devices/storage': true,
		'admin/simple-docker': true,
		'admin/simple-docker/myapps': true,
		'admin/simple-docker/containers': true,
		'admin/simple-docker/apps': true,
		'admin/simple-docker/settings': true,
		'admin/simple-system': true,
		'admin/simple-system/info': true,
		'admin/simple-system/password': true,
		'admin/simple-system/dns': true,
		'admin/simple-system/software': true
	},

	__init__: function () {
		this._menuTree = null;
		ui.menu.load().then(L.bind(function(tree) {
			this._menuTree = tree;
			this.render(tree);
		}, this));
		this.initMenuToggle();
		this.initRippleEffect();
		this.initHeaderShadow();
		this.initModeListener();
		this.initHeaderLogo();
	},

	initModeListener: function() {
		var self = this;
		document.addEventListener('ui-mode-changed', function(e) {
			var mode = e.detail.mode;
			if (mode === 'simple') {
				var currentPath = window.location.pathname;
				var isSimplePage = false;
				for (var p in self.simpleMenuPaths) {
					if (currentPath.indexOf(p) !== -1) {
						isSimplePage = true;
						break;
					}
				}
				if (!isSimplePage) {
					window.location.href = L.url('admin', 'gulf-dashboard');
				}
			}
		});

		// Hide sensitive flash features for root user
		if (document.body.classList.contains('user-root') && window.location.pathname.indexOf('admin/system/flash') !== -1) {
			var hideFlashFeatures = function() {
				var buttons = document.querySelectorAll('[data-name="dl_backup"], [data-name="reset"], [data-name="restore"], [data-name="mtdselect"], [data-name="mtddownload"]');
				buttons.forEach(function(btn) {
					var section = btn.closest('.cbi-value');
					if (section) section.style.display = 'none';
					var parentSection = section ? section.parentElement.closest('.cbi-value') : null;
					if (parentSection) parentSection.style.display = 'none';
				});
				var configSection = document.querySelector('.cbi-section[data-name="config"]');
				if (configSection) configSection.style.display = 'none';
			};
			hideFlashFeatures();
			var observer = new MutationObserver(hideFlashFeatures);
			observer.observe(document.body, { childList: true, subtree: true });
		}

		// Hide sensitive administration features for root user
		if (document.body.classList.contains('user-root') && window.location.pathname.indexOf('admin/system/admin') !== -1) {
			var hideAdminFeatures = function() {
				var tabs = document.querySelectorAll('.tabmenu-item-dropbear, .tabmenu-item-sshkeys, .tabmenu-item-uhttpd, .tabmenu-item-repokeys');
				tabs.forEach(function(tab) {
					tab.style.display = 'none';
				});
			};
			hideAdminFeatures();
			var observerAdmin = new MutationObserver(hideAdminFeatures);
			observerAdmin.observe(document.body, { childList: true, subtree: true });
		}
	},

	getUiMode: function() {
		return document.documentElement.getAttribute('data-ui-mode') || 'simple';
	},

	isSimplePath: function(path) {
		return this.simpleMenuPaths.hasOwnProperty(path);
	},

	createRipple: function (event, target) {
		// 移除已有的水波纹
		var oldRipple = target.querySelector('.ripple');
		if (oldRipple) {
			oldRipple.remove();
		}

		// 创建并设置水波纹
		var ripple = document.createElement('div');
		ripple.className = 'ripple';
		ripple.style.left = event.clientX - target.getBoundingClientRect().left + 'px';
		ripple.style.top = event.clientY - target.getBoundingClientRect().top + 'px';

		// 添加水波纹并设置自动移除
		target.appendChild(ripple);
		ripple.addEventListener('animationend', function () {
			ripple.remove();
		});
	},

	initMenuToggle: function () {
		var menuBtn = document.querySelector('.menu-btn');
		var sidebar = document.querySelector('.sidebar');
		var body = document.body;

		// 创建遮罩层
		var overlay = document.createElement('div');
		overlay.className = 'sidebar-overlay';
		document.body.appendChild(overlay);

		if (menuBtn && sidebar) {
			// 点击菜单按钮
			menuBtn.addEventListener('click', function () {
				menuBtn.classList.toggle('active');
				sidebar.classList.toggle('active');
				overlay.classList.toggle('active');
				body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
			});

			// 点击遮罩层关闭菜单
			overlay.addEventListener('click', function () {
				menuBtn.classList.remove('active');
				sidebar.classList.remove('active');
				overlay.classList.remove('active');
				body.style.overflow = '';
			});
		}
	},

	// 关闭其他展开的菜单
	closeOtherMenus: function (currentMenu) {
		var openMenus = document.querySelectorAll('#topmenu > li.open');

		openMenus.forEach(function (menu) {
			if (menu !== currentMenu) {
				var submenu = menu.querySelector('.dropdown-menu');
				if (submenu) {
					// 先设置实际高度，以便动画正常工作
					submenu.style.height = submenu.scrollHeight + 'px';
					// 强制重排
					submenu.offsetHeight;
					// 开始收起动画
					submenu.style.height = '0px';
					menu.classList.remove('open');
				}
			}
		});
	},

	render: function (tree) {
		var node = tree,
			url = '';

		this.renderModeMenu(tree);

		if (L.env.dispatchpath.length >= 3) {
			for (var i = 0; i < 3 && node; i++) {
				node = node.children[L.env.dispatchpath[i]];
				url = url + (url ? '/' : '') + L.env.dispatchpath[i];
			}

			if (node)
				this.renderTabMenu(node, url);
		}
	},

	renderTabMenu: function (tree, url, level) {
		var container = document.querySelector('#tabmenu'),
			ul = E('ul', { 'class': 'tabs' }),
			children = ui.menu.getChildren(tree),
			activeNode = null;

		for (var i = 0; i < children.length; i++) {
			var childPath = url + '/' + children[i].name;
			if (document.body.classList.contains('user-root') && (childPath.indexOf('admin/status/syslog') !== -1 || childPath.indexOf('admin/status/dmesg') !== -1)) {
				continue;
			}

			var isActive = (L.env.dispatchpath[3 + (level || 0)] == children[i].name),
				activeClass = isActive ? ' active' : '',
				className = 'tabmenu-item-%s %s'.format(children[i].name, activeClass);

			ul.appendChild(E('li', { 'class': className }, [
				E('a', { 'href': L.url(url, children[i].name) }, [children[i].name === 'nas' ? 'NAS' : _(children[i].title)])]));

			if (isActive)
				activeNode = children[i];
		}

		if (ul.children.length == 0)
			return E([]);

		container.appendChild(ul);
		container.style.display = '';

		if (activeNode)
			this.renderTabMenu(activeNode, url + '/' + activeNode.name, (level || 0) + 1);

		return ul;
	},

	renderMainMenu: function (tree, url, level) {
		var self = this;
		var ul = level ? E('ul', { 'class': 'dropdown-menu' }) : document.querySelector('#topmenu'),
			children = ui.menu.getChildren(tree);

		if (children.length == 0 || level > 1)
			return E([]);

		for (var i = 0; i < children.length; i++) {
			var submenu = this.renderMainMenu(children[i], url + '/' + children[i].name, (level || 0) + 1),
				subclass = (!level && submenu.firstElementChild) ? 'dropdown' : null,
				linkclass = (!level && submenu.firstElementChild) ? 'menu' : null,
				linkurl = submenu.firstElementChild ? '#' : L.url(url, children[i].name);

			var currentPath = L.env.requestpath.join('/');
			var itemPath = (url + '/' + children[i].name).replace(/^\/+/, '');
			
			// Hide System Log and Kernel Log from root user to prevent leaking the admin username
			if (document.body.classList.contains('user-root') && (itemPath === 'admin/status/syslog' || itemPath === 'admin/status/dmesg')) {
				continue;
			}

			var isActive = currentPath.startsWith(itemPath);

			if (isActive && submenu.firstElementChild) {
				subclass = 'dropdown open active';
				submenu.style.display = 'block';
				submenu.style.height = 'auto';
			}
			else if (isActive) {
				subclass = 'active';
			}
			else if (submenu.firstElementChild) {
				subclass = 'dropdown';
				submenu.style.height = '0px';
			}

			var modeClass = (!level) ? (this.isSimplePath(itemPath) ? ' menu-simple' : ' menu-advanced') : '';

			var li = E('li', {
				'class': (subclass || '') + modeClass,
				'data-path': itemPath
			}, [
				E('a', {
					'class': linkclass,
					'href': linkurl,
					'click': (function (submenu, hasSubmenu, targetUrl, ev) {
						// 添加水波纹效果
						self.createRipple(ev, ev.currentTarget);

						if (hasSubmenu) {
							ev.preventDefault();
							ev.stopPropagation();

							var parentLi = ev.currentTarget.parentNode;
							var dropdownMenu = submenu;

							if (parentLi.classList.contains('open')) {
								// 先获取当前高度
								dropdownMenu.style.height = dropdownMenu.scrollHeight + 'px';
								// 强制重排
								dropdownMenu.offsetHeight;
								// 开始收起动画
								parentLi.classList.remove('open');
								dropdownMenu.style.height = '0px';
							} else {
								self.closeOtherMenus(parentLi);
								parentLi.classList.add('open');
								// 移除auto和display设置，以便动画生效
								dropdownMenu.style.display = '';
								dropdownMenu.style.height = dropdownMenu.scrollHeight + 'px';
							}
						}
						else if (targetUrl) {
							location.href = targetUrl;
						}
					}).bind(null, submenu, !!submenu.firstElementChild, linkurl)
				}, [children[i].name === 'nas' ? 'NAS' : _(children[i].title)]),
				submenu
			]);

			ul.appendChild(li);
		}

		ul.style.display = '';

		return ul;
	},

	renderModeMenu: function (tree) {
		var ul = document.querySelector('#modemenu'),
			children = ui.menu.getChildren(tree),
			mode = this.getUiMode();

		for (var i = 0; i < children.length; i++) {
			var isActive = (L.env.requestpath.length ? children[i].name == L.env.requestpath[0] : i == 0);

			ul.appendChild(E('li', { 'class': isActive ? 'active' : null }, [
				E('a', { 'href': L.url(children[i].name) }, [children[i].name === 'nas' ? 'NAS' : _(children[i].title)])
			]));

			if (isActive)
				this.renderMainMenu(children[i], children[i].name);
		}

		if (ul.children.length > 1)
			ul.style.display = '';
	},

	initRippleEffect: function () {
		var self = this;
		document.addEventListener('click', function (e) {
			// 排除一级菜单的点击，因为它们已经在自己的点击事件中处理了水波纹
			var target = e.target.closest('.dropdown-menu>li>a, .tabs>li, .cbi-tabmenu>li');
			if (!target) return;

			self.createRipple(e, target);
		});
	},

	initHeaderShadow: function () {
		var header = document.querySelector('header');
		var scrollThreshold = 10;

		window.addEventListener('scroll', function () {
			if (window.scrollY > scrollThreshold) {
				header.classList.add('with-shadow');
			} else {
				header.classList.remove('with-shadow');
			}
		});
	},

	initHeaderLogo: function() {
		var mode = localStorage.getItem('gulf-logo-mode');
		if (mode === 'hostname') return;

		var brand = document.querySelector('header .brand');
		if (!brand) return;

		var isDark = document.documentElement.getAttribute('data-darkmode') === 'true';
		var src = L.resource('../gulf/gulf_logo_' + (isDark ? 'dark' : 'light') + '.png');
		brand.textContent = '';
		var img = document.createElement('img');
		img.src = src;
		img.className = 'brand-logo-img';
		img.alt = 'Gulf';
		brand.appendChild(img);
	}
});
