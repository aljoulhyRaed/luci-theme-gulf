# luci-mod-simple

A simplified LuCI interface module for OpenWrt routers. Provides clean, modern, beginner-friendly pages for the most common router settings.

## Overview

`luci-mod-simple` works with the **GULF theme's Simple/Advanced mode toggle** to provide two distinct user experiences:

- **Simple Mode**: Shows only the simplified pages from this module — Dashboard, Wi-Fi, Internet, VPN, Devices, and System
- **Advanced Mode**: Shows the full standard LuCI interface with all its powerful configuration options

When a user switches to Simple mode, the sidebar menu is filtered to show only the simple pages. If they navigate to an advanced URL while in Simple mode, they are automatically redirected to the Dashboard.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin/gulf-dashboard` | System overview with gauges, status cards, and quick links (from `luci-mod-dashboard`) |
| Wi-Fi | `/admin/simple-wifi` | View and edit wireless networks — SSID, password, encryption, enable/disable |
| Internet | `/admin/simple-internet` | WAN connection status — IP, gateway, DNS, uptime, traffic stats |
| VPN | `/admin/simple-vpn` | WireGuard and OpenVPN tunnel status display |
| Devices | `/admin/simple-devices` | Connected DHCP clients with hostname, IP, MAC, and lease expiry |
| System | `/admin/simple-system` | System info, memory usage, hostname editor, reboot button |

## Features

- Modern card-based UI with consistent styling
- Dark mode support via CSS variables
- Real-time data from UCI and ubus RPC calls
- Actual UCI writes for Wi-Fi and System settings (Save & Apply)
- Responsive layout for mobile and desktop
- Toast notifications for save feedback
- No external dependencies — all assets are self-contained

## Dependencies

- `luci-base` — LuCI framework
- `luci-theme-gulf` — GULF theme with Simple/Advanced toggle
- `luci-mod-dashboard` — Dashboard module (shared by the `admin/gulf-dashboard` route)

## File Structure

```
luci-mod-simple/
├── Makefile
├── README.md
├── htdocs/
│   └── luci-static/
│       └── resources/
│           └── view/
│               └── simple/
│                   ├── css/
│                   │   └── simple.css      # Shared styles for all simple pages
│                   ├── wifi.js             # Wi-Fi settings page
│                   ├── internet.js         # Internet/WAN status page
│                   ├── vpn.js              # VPN tunnel status page
│                   ├── devices.js          # Connected devices page
│                   └── system.js           # System info and settings page
└── root/
    └── usr/
        └── share/
            ├── luci/
            │   └── menu.d/
            │       └── luci-mod-simple.json  # Menu entries for simple pages
            └── rpcd/
                └── acl.d/
                    └── luci-mod-simple.json  # ACL permissions
```

## Installation (Manual)

```bash
# Copy view files
scp -r htdocs/luci-static/resources/view/simple/ root@ROUTER:/www/luci-static/resources/view/simple/

# Copy menu and ACL
scp root/usr/share/luci/menu.d/luci-mod-simple.json root@ROUTER:/usr/share/luci/menu.d/
scp root/usr/share/rpcd/acl.d/luci-mod-simple.json root@ROUTER:/usr/share/rpcd/acl.d/

# Restart services
ssh root@ROUTER "/etc/init.d/rpcd restart; /etc/init.d/uhttpd restart"
```

## Building as an OpenWrt Package

Place this directory in the OpenWrt build tree under `feeds/luci/applications/luci-mod-simple/`, then:

```bash
./scripts/feeds update -a
./scripts/feeds install luci-mod-simple
make menuconfig  # Select LuCI > Applications > luci-mod-simple
make package/luci-mod-simple/compile
```

## How the Toggle Works

The Simple/Advanced toggle is implemented in the GULF theme (`luci-theme-gulf`):

1. **Toggle switch** in the header bar stores the mode in `localStorage` as `gulf-ui-mode`
2. The `<html>` element gets a `data-ui-mode` attribute (`"simple"` or `"advanced"`)
3. CSS rules hide/show sidebar menu items based on their `data-path` attribute prefix
4. JavaScript in the header redirects users to the Dashboard when switching to Simple mode from an advanced page

## License

MIT
