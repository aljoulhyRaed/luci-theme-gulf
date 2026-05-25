(function() {
	'use strict';

	var LANGS = [
		{ code: 'en', name: 'English',    flag: 'us', dir: 'ltr' },
		{ code: 'es', name: 'Español',    flag: 'es', dir: 'ltr' },
		{ code: 'ar', name: 'العربية',     flag: 'sa', dir: 'rtl' },
		{ code: 'bn', name: 'বাংলা',       flag: 'bd', dir: 'ltr' },
		{ code: 'de', name: 'Deutsch',     flag: 'de', dir: 'ltr' },
		{ code: 'fa', name: 'فارسی',       flag: 'ir', dir: 'rtl' },
		{ code: 'fr', name: 'Français',    flag: 'fr', dir: 'ltr' },
		{ code: 'hi', name: 'हिंदी',         flag: 'in', dir: 'ltr' },
		{ code: 'id', name: 'Indonesia',   flag: 'id', dir: 'ltr' },
		{ code: 'it', name: 'Italiano',    flag: 'it', dir: 'ltr' },
		{ code: 'ja', name: '日本語',       flag: 'jp', dir: 'ltr' },
		{ code: 'ko', name: '한국어',       flag: 'kr', dir: 'ltr' },
		{ code: 'pl', name: 'Polski',      flag: 'pl', dir: 'ltr' },
		{ code: 'pt', name: 'Português',   flag: 'br', dir: 'ltr' },
		{ code: 'ru', name: 'Русский',     flag: 'ru', dir: 'ltr' },
		{ code: 'th', name: 'ไทย',         flag: 'th', dir: 'ltr' },
		{ code: 'tr', name: 'Türkçe',      flag: 'tr', dir: 'ltr' },
		{ code: 'uk', name: 'Українська',  flag: 'ua', dir: 'ltr' },
		{ code: 'vi', name: 'Tiếng Việt',  flag: 'vn', dir: 'ltr' },
		{ code: 'zh', name: '中文',         flag: 'cn', dir: 'ltr' }
	];

	var lang = localStorage.getItem('simple-lang') || 'en';
	var translations = {};
	var langInfo = LANGS.find(function(l) { return l.code === lang; }) || LANGS[0];

	if (lang !== 'en') {
		var cached = localStorage.getItem('simple-i18n-data-' + lang);
		if (cached) {
			try { translations = JSON.parse(cached); } catch(e) { translations = {}; }
		}
	}

	window.t = function(key) {
		var str = (lang !== 'en' && translations[key]) || key;
		for (var i = 1; i < arguments.length; i++) {
			str = str.replace('%s', arguments[i]);
		}
		return str;
	};

	window.SIMPLE_LANG = lang;
	window.SIMPLE_DIR = langInfo.dir;
	window.SIMPLE_LANGS = LANGS;

	function getResourceBase() {
		var scripts = document.querySelectorAll('link[rel="stylesheet"]');
		for (var i = 0; i < scripts.length; i++) {
			var href = scripts[i].href || '';
			var idx = href.indexOf('/luci-static/resources/');
			if (idx !== -1) return href.substring(0, idx + '/luci-static/resources/'.length);
		}
		return '/luci-static/resources/';
	}

	window.setSimpleLang = function(code) {
		localStorage.setItem('simple-lang', code);
		if (code === 'en') {
			localStorage.removeItem('simple-i18n-data-' + lang);
			window.location.reload();
			return;
		}
		var base = getResourceBase();
		var url = base + 'view/simple/i18n/' + code + '.json';
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function() {
			if (xhr.status === 200) {
				try {
					JSON.parse(xhr.responseText);
					localStorage.setItem('simple-i18n-data-' + code, xhr.responseText);
				} catch(e) {}
			}
			window.location.reload();
		};
		xhr.onerror = function() { window.location.reload(); };
		xhr.send();
	};

	/* Reverse lookup: translated value -> original English key (for re-translation prevention) */
	var translatedValues = {};
	if (lang !== 'en') {
		var keys = Object.keys(translations);
		for (var k = 0; k < keys.length; k++) {
			translatedValues[translations[keys[k]]] = true;
		}
	}

	var translating = false;

	if (lang !== 'en' && Object.keys(translations).length > 0) {
		function translateTextNode(node) {
			if (node._i18n) return;
			var text = node.textContent;
			var trimmed = text.trim();
			if (!trimmed || trimmed.length < 2) return;
			if (translatedValues[trimmed]) return;
			if (translations[trimmed]) {
				node._i18n = true;
				node.textContent = text.replace(trimmed, translations[trimmed]);
			}
		}

		function translateElement(el) {
			if (!el) return;
			if (el.nodeType === 3) {
				translateTextNode(el);
				return;
			}
			if (el.nodeType !== 1) return;
			var tag = el.tagName;
			if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'TEXTAREA' || tag === 'CODE' || tag === 'PRE') return;
			if (el.classList && el.classList.contains('lang-picker-dropdown')) return;

			if (el.placeholder) {
				var pt = el.placeholder.trim();
				if (translations[pt] && !translatedValues[pt]) el.placeholder = translations[pt];
			}
			if (el.title) {
				var tt = el.title.trim();
				if (translations[tt] && !translatedValues[tt]) el.title = translations[tt];
			}

			var children = el.childNodes;
			for (var i = 0; i < children.length; i++) {
				translateElement(children[i]);
			}
		}

		var pendingNodes = [];
		var flushTimer = null;

		function flushTranslations() {
			flushTimer = null;
			if (!pendingNodes.length) return;
			var nodes = pendingNodes.slice();
			pendingNodes = [];
			translating = true;
			for (var i = 0; i < nodes.length; i++) {
				translateElement(nodes[i]);
			}
			translating = false;
		}

		var observer = new MutationObserver(function(mutations) {
			if (translating) return;
			for (var i = 0; i < mutations.length; i++) {
				var added = mutations[i].addedNodes;
				for (var j = 0; j < added.length; j++) {
					pendingNodes.push(added[j]);
				}
			}
			if (!flushTimer) {
				flushTimer = setTimeout(flushTranslations, 50);
			}
		});

		function initTranslation() {
			translating = true;
			translateElement(document.body);
			translating = false;
			observer.observe(document.body, { childList: true, subtree: true });
		}

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', initTranslation);
		} else {
			initTranslation();
		}

		if (langInfo.dir === 'rtl') {
			document.documentElement.setAttribute('dir', 'rtl');
			var style = document.createElement('style');
			style.textContent = [
				'html[dir="rtl"] .sidebar, html[dir="rtl"] .sidebar-overlay { left: auto !important; right: 0 !important; }',
				'html[dir="rtl"] .sidebar { border-right: none !important; border-radius: 1rem 0 0 1rem !important; }',
				'html[dir="rtl"] header .brand { flgulf: right; }',
				'html[dir="rtl"] .header-controls { margin-left: 8px; margin-right: auto; }',
				'@media screen and (min-width: 855px) {',
				'  html[dir="rtl"] body { direction: ltr; grid-template-areas: "header" "main" "footer" !important; grid-template-columns: 1fr !important; }',
				'  html[dir="rtl"] header { direction: rtl; grid-column: 1 / -1; }',
				'  html[dir="rtl"] #maincontent { direction: rtl; margin-right: var(--sidebar-width) !important; margin-left: 0 !important; width: auto !important; }',
				'  html[dir="rtl"] .sidebar { direction: rtl; }',
				'}',
				'@media screen and (max-width: 854px) {',
				'  html[dir="rtl"] body { direction: ltr; }',
				'  html[dir="rtl"] #maincontent { direction: rtl; width: auto !important; }',
				'  html[dir="rtl"] header { direction: rtl; }',
				'  html[dir="rtl"] .sidebar { direction: rtl; transform: translateX(100%) !important; border-radius: 1rem 0 0 1rem !important; }',
				'  html[dir="rtl"] .sidebar.active { transform: translateX(0) !important; }',
				'}'
			].join('\n');
			document.head.appendChild(style);
		}
	}

	if (lang !== 'en' && Object.keys(translations).length === 0) {
		var base = getResourceBase();
		var url = base + 'view/simple/i18n/' + lang + '.json';
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function() {
			if (xhr.status === 200) {
				try {
					JSON.parse(xhr.responseText);
					localStorage.setItem('simple-i18n-data-' + lang, xhr.responseText);
					window.location.reload();
				} catch(e) {
					localStorage.removeItem('simple-lang');
					window.location.reload();
				}
			}
		};
		xhr.onerror = function() {
			localStorage.removeItem('simple-lang');
			window.location.reload();
		};
		xhr.send();
	}
})();
