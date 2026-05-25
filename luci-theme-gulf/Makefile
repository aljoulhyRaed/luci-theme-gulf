#
# Copyright (C) 2008-2014 The LuCI Team <luci@lists.subsignal.org>
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Gulf Theme (GULF UI styled)
LUCI_DEPENDS:=
PKG_VERSION:=1.0
PKG_RELEASE:=20260216

PKG_LICENSE:=Apache-2.0

define Package/luci-theme-gulf/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.Gulf
	uci set luci.main.mediaurlbase='/luci-static/bootstrap'
	uci commit luci
}
endef
LUCI_MINIFY_CSS:=0

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
