# ioBroker Battery Monitor (Zigbee + DECT)

This script monitors battery levels of Zigbee and DECT devices in ioBroker and sends Telegram notifications when thresholds are reached.

## Features

* Monitors:

  * `zigbee.*.battery`
  * `fritzbox.*.battery`
* Two configurable thresholds:

  * **Warning** (<10%)
  * **Critical** (<5%)
* Independent notification intervals:

  * Warning (e.g. once per day)
  * Critical (e.g. every hour)
* Aggregated Telegram messages (no per-device spam)
* Automatic device name resolution via `common.name`
* Persistent timestamp storage using `0_userdata.0`

---

## Configuration

Adjust at the top of the script:

```javascript
const CHECK_INTERVAL = 900;                 // battery check interval (s)

const THRESHOLD1 = 10;                      // low battery threshold (%)
const MESSAGE_INTERVAL1 = 86400;            // interval for <10% alerts (s)

const THRESHOLD2 = 5;                       // critical battery threshold (%)
const MESSAGE_INTERVAL2 = 3600;              // interval for <5% alerts (s)

const TELEGRAM_INSTANCE = 'telegram.0';     // ioBroker telegram instance
const TELEGRAM_USER = '';                   // optional target user
```

---

## How it works

* Script runs periodically (e.g. every 900 seconds)
* Collects all battery states from dect and zigbee devices
* Groups devices by threshold
* Sends Telegram messages **only if**:

  * at least one device is below a threshold **and**
  * the defined interval since the last message has passed

Timestamps are stored in:

```
0_userdata.0.batteryWarnings.lastMsg
```

---

## Example Telegram Output

```
🔴 Critical battery (<5%):
Kitchen window sensor (3%)
Hall motion sensor (4%)

🟠 Low battery (<10%):
Living room thermostat (9%)
```

---

## Requirements

* ioBroker with:

  * Javascript adapter
  * Telegram adapter
  * Zigbee adapter (e.g. Zigbee2MQTT)
  * optional: Fritzbox adapter

---

## Installation

1. Create a new script in the Javascript adapter
2. Paste the code
3. Enable the script
4. Done

---

## Notes

* The state `0_userdata.0.batteryWarnings.lastMsg` is created automatically
* Devices without valid battery values are ignored
* Only numeric values are processed

---

## Optional Enhancements

* Room grouping via `enum.rooms`
* Ignore offline devices (`available = false`)
* Alias support (`alias.0`)
* Immediate alert on first threshold breach


--------------------------------------------------------------------------------------------------------------

This script was created and published free of charge for the open source community.
If you find it useful and would like to support future development, consider making a small donation:

    Bitcoin (BTC): 33AXe8Z8XBuGKx9eHHmGnvbawrNYjSgDcM

    Ethereum (ETH): 0xa61d178EA84C2200A8617b51B4bCf98F87ff59Ff

    Solana (SOL): BDf5EgsN8fRUicYzeM8cuaNhL7zdty2qsEj2mC2jA4Fm

    Ripple (XRP): rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh

    Cardano (ADA): addr1q8anur2wvvc6pv3cpp30vv05makyra8huh0lk0yhdk6hcnlrzr27g03klu862usxqsru794d03gzkk8n86ta34n85z0svn5ams   

    USTether (USDT): 0xa61d178EA84C2200A8617b51B4bCf98F87ff59Ff


Thank you for your support! 🙏



