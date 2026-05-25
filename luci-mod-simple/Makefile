include $(TOPDIR)/rules.mk

PKG_NAME:=luci-mod-simple
PKG_VERSION:=1.0.0
PKG_RELEASE:=5

PKG_LICENSE:=MIT
PKG_MAINTAINER:=GULF Theme Contributors

LUCI_TITLE:=LuCI Simple Mode Module
LUCI_DESCRIPTION:=Simplified LuCI interface pages for everyday router management. Provides clean, modern views for Wi-Fi, Internet, VPN, Docker, Devices, and System settings. Works with the GULF theme Simple/Advanced mode toggle.
LUCI_DEPENDS:=+luci-base +luci-theme-gulf +luci-mod-dashboard
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

define Package/$(PKG_NAME)/install
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/simple
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/simple/css
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d

	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/simple/*.js $(1)/www/luci-static/resources/view/simple/
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/simple/css/*.css $(1)/www/luci-static/resources/view/simple/css/
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/*.json $(1)/usr/share/rpcd/acl.d/
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/*.json $(1)/usr/share/luci/menu.d/

	$(INSTALL_DIR) $(1)/usr/share/gulf/ipks
	$(INSTALL_DATA) ./ipks/*.ipk $(1)/usr/share/gulf/ipks/

	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/simple/i18n
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/simple/i18n/*.json $(1)/www/luci-static/resources/view/simple/i18n/

	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/simple/flags
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/simple/flags/*.svg $(1)/www/luci-static/resources/view/simple/flags/
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
