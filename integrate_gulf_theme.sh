#!/bin/bash
# integrate_gulf_theme.sh
# This script integrates the Gulf theme into an OpenWrt build environment.
# Usage: ./integrate_gulf_theme.sh <path-to-gulf-theme-repo>

if [ -z "$1" ]; then
    echo "Usage: $0 <path-to-gulf-theme-repo>"
    echo "Example: $0 /home/user/luci-theme-gulf"
    exit 1
fi

THEME_DIR="$1"

if [ ! -d "$THEME_DIR/luci-theme-gulf" ] || [ ! -d "$THEME_DIR/luci-mod-dashboard" ]; then
    echo "Error: Could not find theme directories in $THEME_DIR"
    exit 1
fi

if [ ! -f "scripts/feeds" ]; then
    echo "Error: This script must be run from the root of your OpenWrt build environment."
    exit 1
fi

echo "Copying packages into OpenWrt feeds..."
cp -r "$THEME_DIR/luci-theme-gulf" feeds/luci/themes/luci-theme-gulf
cp -r "$THEME_DIR/luci-mod-dashboard" feeds/luci/modules/luci-mod-dashboard
cp -r "$THEME_DIR/luci-mod-simple" feeds/luci/applications/luci-mod-simple

echo "Updating feeds..."
./scripts/feeds update -a
./scripts/feeds install luci-theme-gulf luci-mod-dashboard luci-mod-simple

echo "Patching luci-mod-system menu to decouple password management from SSH..."
find feeds/luci -name "luci-mod-system.json" -type f -exec sed -i 's/"acl": \[ "luci-mod-system-config", "luci-mod-system-ssh" \]/"acl": \[ "luci-mod-system-config" \]/g' {} +

echo "Patching password.js to decouple password changes from root user only..."
find feeds/luci -name "password.js" -type f -exec sed -i "s/return callSetPassword(document.body.className.match(\/user-(\\\\w+)\/)?RegExp.\$1:'root',/var u=document.body.className.match(\/user-(\\\\w+)\/); return callSetPassword(u?u[1]:'root',/g" {} +
find feeds/luci -name "password.js" -type f -exec sed -i "s/return callSetPassword('root',/var u=document.body.className.match(\/user-(\\\\w+)\/); return callSetPassword(u?u[1]:'root',/g" {} +

echo "Enabling packages in .config..."
# Ensure .config exists
if [ ! -f .config ]; then
    make defconfig
fi

# Enable the packages
sed -i 's/.*CONFIG_PACKAGE_luci-theme-gulf.*/CONFIG_PACKAGE_luci-theme-gulf=y/' .config || echo "CONFIG_PACKAGE_luci-theme-gulf=y" >> .config
sed -i 's/.*CONFIG_PACKAGE_luci-mod-dashboard.*/CONFIG_PACKAGE_luci-mod-dashboard=y/' .config || echo "CONFIG_PACKAGE_luci-mod-dashboard=y" >> .config
sed -i 's/.*CONFIG_PACKAGE_luci-mod-simple.*/CONFIG_PACKAGE_luci-mod-simple=y/' .config || echo "CONFIG_PACKAGE_luci-mod-simple=y" >> .config

# Set Gulf as the default theme
sed -i 's/.*CONFIG_LUCI_SRCDIET.*/CONFIG_LUCI_SRCDIET=y/' .config

echo "Integration complete. You can now run 'make menuconfig' to verify or 'make' to build."
