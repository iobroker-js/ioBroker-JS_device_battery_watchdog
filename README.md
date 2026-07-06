# ioBroker-JS Device Battery Watchdog

An ioBroker JavaScript that monitors the battery status of Zigbee and Fritz! devices and sends Telegram alerts for low battery, critical battery, and lost device connections.

## Features

- 🔋 **Automatic device discovery** – scans `zigbee.*.battery`, `fritzdect.*.battery`, and `fritzbox.*.battery` states, no manual device list required
- 🟠 **Low battery alerts** – configurable threshold and repeat interval
- 🔴 **Critical battery alerts** – separate threshold and repeat interval, independent from low battery alerts
- 📡 **Connection lost detection** – flags devices that stopped reporting for a configurable time, but only once their last known battery level was already low (avoids false alarms for healthy devices with a brief outage)
- 🚀 **Initial report on script start** – sends a full battery overview immediately when the script is (re)started
- 🔁 **Rate limiting per alert type** – each warning category (low / critical / connection lost) has its own cooldown, so you don't get spammed on every check interval
- 📇 **Human-readable device names** – resolves device IDs to their configured `common.name`

## Requirements

- [ioBroker](https://www.iobroker.net/) with the **javascript** adapter
- [Telegram adapter](https://github.com/iobroker-community-adapters/ioBroker.telegram) (`telegram.0`) configured and connected to your bot
- Zigbee and/or Fritz! devices exposing a `battery` state

## Installation

1. Open the ioBroker **Javascript** adapter instance
2. Create a new script (type: Javascript, engine: JavaScript)
3. Paste the contents of `device_battery_watchdog_v0.4.js`
4. Adjust the [configuration](#configuration) block to your needs
5. Save and start the script

On start, the script automatically creates the state `0_userdata.0.deviceBatteryWatchdog.lastMsg`, which is used internally to track when each alert type was last sent.

## Configuration

All settings are in the `CONFIG` block at the top of the script:

| Constant             | Description                                              | Default |
|----------------------|------------------------------------------------------------|---------|
| `CHECK_INTERVAL`     | How often battery states are checked (seconds)              | `900`   |
| `THRESHOLD1`         | Low battery threshold (%)                                   | `15`    |
| `MESSAGE_INTERVAL1`  | Minimum time between low battery alerts (seconds)            | `86400` |
| `THRESHOLD2`         | Critical battery threshold (%)                               | `5`     |
| `MESSAGE_INTERVAL2`  | Minimum time between critical battery alerts (seconds)       | `3600`  |
| `THRESHOLD3`         | Time without a state update before a device counts as disconnected (seconds) | `3600` |
| `MESSAGE_INTERVAL3`  | Minimum time between connection-lost alerts (seconds)        | `3600`  |
| `TELEGRAM_INSTANCE`  | Telegram adapter instance to send messages through            | `telegram.0` |
| `TELEGRAM_USER`      | Optional specific Telegram user/chat to target (empty = default) | `''` |

**Note on connection-lost detection:** a device is only reported as "connection lost" if its last known battery value was already below `THRESHOLD1`. This prevents alert noise for devices that briefly go offline while their battery is still fine.

## How it works

1. On every check interval, the script reads the current `val` and `ts` (last update timestamp) of every discovered battery state
2. If a device hasn't reported an update within `THRESHOLD3` seconds **and** its last known battery level was below `THRESHOLD1`, it's flagged as connection lost
3. Otherwise, the last known battery value is evaluated against `THRESHOLD1` (low) and `THRESHOLD2` (critical)
4. Each alert category has its own cooldown timer, stored in `0_userdata.0.deviceBatteryWatchdog.lastMsg`, so repeated warnings aren't sent more often than `MESSAGE_INTERVAL1/2/3`
5. Alerts are sent via Telegram and also logged to the ioBroker script log

## License

Free to use, modify, and distribute for personal and community use.

---

This script was created and published free of charge for the open source community. If you find it useful and would like to support future development, consider making a small donation:

```
Bitcoin (BTC): 33AXe8Z8XBuGKx9eHHmGnvbawrNYjSgDcM

Ethereum (ETH): 0xa61d178EA84C2200A8617b51B4bCf98F87ff59Ff

Solana (SOL): BDf5EgsN8fRUicYzeM8cuaNhL7zdty2qsEj2mC2jA4Fm

Ripple (XRP): rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh

Cardano (ADA): addr1q8anur2wvvc6pv3cpp30vv05makyra8huh0lk0yhdk6hcnlrzr27g03klu862usxqsru794d03gzkk8n86ta34n85z0svn5ams   

USTether (USDT): 0xa61d178EA84C2200A8617b51B4bCf98F87ff59Ff

```

Thank you for your support! 🙏
