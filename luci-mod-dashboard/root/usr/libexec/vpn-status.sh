#!/bin/sh
echo "===WG_UCI==="
WG_IFACES=$(uci show network 2>/dev/null | grep "proto='wireguard'" | awk -F '[.=]' '{print $2}')
echo "$WG_IFACES"
echo "===WG_STATUS==="
for iface in $WG_IFACES; do
  echo "IFACE:$iface"
  UP=$(ubus call network.interface.$iface status 2>/dev/null | jsonfilter -e "@.up" 2>/dev/null)
  ADDR=$(ubus call network.interface.$iface status 2>/dev/null | jsonfilter -e '@["ipv4-address"][0].address' 2>/dev/null)
  echo "up=$UP"
  echo "addr=$ADDR"
done
echo "===WG_SHOW==="
wg show all dump 2>/dev/null
echo "===OVPN==="
pgrep -la openvpn 2>/dev/null || true
echo "===OVPN_UCI==="
OVPN_INSTS=$(uci show openvpn 2>/dev/null | grep "=openvpn$" | awk -F '[.=]' '{print $2}')
for inst in $OVPN_INSTS; do
  enabled=$(uci -q get openvpn.$inst.enabled 2>/dev/null)
  dev=$(uci -q get openvpn.$inst.dev 2>/dev/null)
  echo "INST:$inst:enabled=$enabled:dev=$dev"
done
