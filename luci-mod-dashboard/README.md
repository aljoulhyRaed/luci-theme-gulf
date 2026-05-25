# luci-mod-dashboard

A modern, card-based dashboard module for OpenWrt's LuCI web interface. Designed to pair with the [luci-theme-gulf](../luci-theme-gulf/) theme but works with any LuCI theme.

## Features

- **System Overview** - CPU load and memory usage with animated gauge rings, plus uptime, kernel version, firmware info, and local time
- **Internet Status** - WAN connectivity with IPv4/IPv6 status badges, addresses, gateways, protocol, uptime, and DNS servers
- **Wireless Networks** - Lists configured SSIDs with band, encryption, channel, and bitrate
- **Traffic Monitor** - Download/upload totals with packet counts for the primary WAN device
- **Storage** - Root filesystem and swap usage with color-coded progress bars (green/yellow/red)
- **VPN Status** - Auto-detects WireGuard and OpenVPN tunnels, shows connected/disconnected status with per-tunnel details
- **Connected Devices** - DHCP client list with hostname, IP, and MAC address
- **Quick Access** - 8 shortcut tiles to common settings: Interfaces, Wireless, Firewall, DNS/DHCP, System, Software, Administration, Backup

## Design

- Responsive grid layout (adapts from 1 to 3+ columns)
- Full dark mode support via CSS custom properties
- Staggered fade-in card animations
- All icons are inline SVG (no external dependencies)
- Auto-refreshes via LuCI's polling system (5-second interval)
- Self-contained: no external fonts, CDNs, or JavaScript libraries

## Package Structure

```
luci-mod-dashboard/
├── Makefile                             # OpenWrt build system integration
├── README.md
├── htdocs/
│   └── luci-static/
│       └── resources/
│           └── view/
│               └── dashboard/
│                   ├── index.js         # Main dashboard view
│                   ├── css/
│                   │   └── dashboard.css # Dashboard styles
│                   └── icons/           # SVG icons (legacy)
│                       ├── devices.svg
│                       ├── internet.svg
│                       ├── not-internet.svg
│                       ├── router.svg
│                       └── wireless.svg
└── root/
    └── usr/
        ├── libexec/
        │   └── vpn-status.sh            # VPN status helper script
        └── share/
            ├── luci/
            │   └── menu.d/
            │       └── luci-mod-dashboard.json  # Menu registration
            └── rpcd/
                └── acl.d/
                    └── luci-mod-dashboard.json  # ACL permissions
```

## Installation

### Manual Installation (direct to router)

Copy files to these paths on the router:

```
/www/luci-static/resources/view/dashboard/index.js
/www/luci-static/resources/view/dashboard/css/dashboard.css
/www/luci-static/resources/view/dashboard/icons/*.svg
/usr/share/rpcd/acl.d/luci-mod-dashboard.json
/usr/share/luci/menu.d/luci-mod-dashboard.json
/usr/libexec/vpn-status.sh
```

Then clear the cache and restart services:

```bash
chmod +x /usr/libexec/vpn-status.sh
rm -rf /tmp/luci-*
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
```

### Building as an OpenWrt Package

1. Place this directory in your OpenWrt build tree under `feeds/luci/modules/luci-mod-dashboard/`
2. Run `./scripts/feeds update -a && ./scripts/feeds install luci-mod-dashboard`
3. Select it in `make menuconfig` under LuCI > Modules
4. Build with `make package/luci-mod-dashboard/compile`

## Dependencies

- `luci-base` (required)
- `wireguard-tools` (optional, for WireGuard status)
- `openvpn-*` (optional, for OpenVPN status)

## VPN Detection

The dashboard automatically detects VPN tunnels:

- **WireGuard**: Reads UCI `network` config for interfaces with `proto wireguard`, checks runtime status via `ubus call network.interface dump`
- **OpenVPN**: Reads UCI `openvpn` config for all defined instances, shows enabled/disabled state

## License

MIT
