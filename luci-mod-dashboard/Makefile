include $(TOPDIR)/rules.mk

PKG_NAME:=luci-mod-dashboard
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_LICENSE:=MIT
PKG_MAINTAINER:=GULF Theme Contributors

LUCI_TITLE:=LuCI Dashboard Module
LUCI_DESCRIPTION:=Modern dashboard for OpenWrt with system stats, VPN status, traffic monitoring, and quick access links. Designed to work with the GULF theme.
LUCI_DEPENDS:=+luci-base
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

define Package/$(PKG_NAME)/install
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/dashboard
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/dashboard/css
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/dashboard/icons
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DIR) $(1)/usr/libexec

	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/dashboard/*.js $(1)/www/luci-static/resources/view/dashboard/
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/dashboard/include
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/dashboard/include/*.js $(1)/www/luci-static/resources/view/dashboard/include/
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/dashboard/css/*.css $(1)/www/luci-static/resources/view/dashboard/css/
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/dashboard/icons/*.svg $(1)/www/luci-static/resources/view/dashboard/icons/
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/*.json $(1)/usr/share/rpcd/acl.d/
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/*.json $(1)/usr/share/luci/menu.d/
	$(INSTALL_BIN) ./root/usr/libexec/vpn-status.sh $(1)/usr/libexec/
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
