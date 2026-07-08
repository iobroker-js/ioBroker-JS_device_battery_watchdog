// ============================================================
// Monitors battery status of Zigbee and Fritz! devices
// Sends warning messages via Telegram when battery is low,
// critical, or when a connection is lost.
// ============================================================
// Author   : speefak
// Name	    : device_battery_watchdog
// Created  : 2026-05-20
// Version  : 0.4
// Adapter  : iobroker.javascript
// Requires : Telegram Adapter (telegram.0)
// ============================================================

// ===== CONFIG =====
const CHECK_INTERVAL = 900;           // battery check interval (s)

const THRESHOLD1 = 15;                // low battery threshold (%)
const MESSAGE_INTERVAL1 = 86400;      // interval for <15% alerts (s)
const THRESHOLD2 = 5;                 // critical battery threshold (%)
const MESSAGE_INTERVAL2 = 3600;       // interval for <5% alerts (s)
const THRESHOLD3 = 3600;              // connection lost threshold - no state update (s)
const MESSAGE_INTERVAL3 = 3600;       // interval for lost connection alerts (s)

// Battery warning levels, evaluated top to bottom - first match wins.
// Each level has its own per-device cooldown key ('t1'/'t2') and repeat interval.
const LEVELS = [
    { key: 't2', emoji: '🔴', label: 'critical', threshold: THRESHOLD2, intervalMs: MESSAGE_INTERVAL2 * 1000 },
    { key: 't1', emoji: '🟠', label: 'low', threshold: THRESHOLD1, intervalMs: MESSAGE_INTERVAL1 * 1000 }
];

const TELEGRAM_INSTANCE = 'telegram.0';
const TELEGRAM_USER = '';           // optional target user

const LAST_MSG_STATE = '0_userdata.0.deviceBatteryWatchdog.lastMsg';

// ===== INIT STATE =====
createState(LAST_MSG_STATE, JSON.stringify({}), {
    type: 'string',
    read: true,
    write: true,
    def: JSON.stringify({})
});

// ===== FUNCTIONS =====
function getBatteryStates() {
    const states = [];

    $('zigbee.*.battery').each(id => states.push(id));
    $('fritzdect.*.battery').each(id => states.push(id));   // Fritz DECT devices
    $('fritzbox.*.battery').each(id => states.push(id));    // if available

    return states;
}

function getDeviceName(id) {
    const parts = id.split('.');
    if (parts.length >= 4) {
        const deviceId = parts.slice(0, 3).join('.');
        const obj = getObject(deviceId);
        if (obj?.common?.name) return obj.common.name;
    }
    return id;
}

function sendTelegram(msg) {
    sendTo(TELEGRAM_INSTANCE, 'send', {
        text: msg,
        user: TELEGRAM_USER || undefined
    }, result => {
        if (result && result.error) {
            console.error(`[device_battery_watchdog] Telegram send failed: ${result.error}`);
        }
    });
    console.log(msg);   // also to log
}

function loadLastMsg() {
    try {
        return JSON.parse(getState(LAST_MSG_STATE).val) || {};
    } catch (e) {
        return {};
    }
}

// ===== CORE CHECK LOGIC (shared by initial report and interval) =====
// forceSend = true  -> ignore per-device cooldowns, always report (used on script start)
function checkDevices(forceSend) {
    const now = Date.now();
    const lastMsg = loadLastMsg();

    const groups = { t3: [] };                     // connection lost
    LEVELS.forEach(l => groups[l.key] = []);       // 't2' (critical), 't1' (low)

    let allDevices = [];

    getBatteryStates().forEach(id => {
        const s = getState(id);
        if (!s || s.val === null) return;

        const val = parseFloat(s.val);
        if (isNaN(val)) return;

        const name = getDeviceName(id);
        if (!lastMsg[id]) lastMsg[id] = {};
        const device = lastMsg[id];

        // Connection lost: last update too long ago AND battery was already low
        const stale = s.ts && (now - s.ts) >= THRESHOLD3 * 1000;
        if (stale && val < THRESHOLD1) {
            if (forceSend || (now - (device.t3 || 0)) >= MESSAGE_INTERVAL3 * 1000) {
                groups.t3.push(`${name} (${val}%, ${Math.round((now - s.ts) / 60000)} min ago)`);
                device.t3 = now;
            }
            return;
        }

        allDevices.push(`${name} (${val}%)`);

        for (const level of LEVELS) {
            if (val < level.threshold) {
                if (forceSend || (now - (device[level.key] || 0)) >= level.intervalMs) {
                    groups[level.key].push(`${name} (${val}%)`);
                    device[level.key] = now;
                }
                break; // first matching level wins (critical before low)
            }
        }
    });

    setState(LAST_MSG_STATE, JSON.stringify(lastMsg), true);

    return { groups, allDevices };
}

function buildMessage(groups, allDevices, isInitial) {
    let message = '';

    if (isInitial) {
        const startTime = new Date().toLocaleString('de-DE');   // e.g. 21.04.2026, 16:05:12
        message += `🔋 Battery Check started \n ${startTime}\n `;
        message += `(${allDevices.length} devices found)\n\n`;
    }

    for (const level of LEVELS) {
        if (groups[level.key].length) {
            message += `${level.emoji} Battery ${level.label} (<${level.threshold}%):\n${groups[level.key].join('\n')}\n\n`;
        }
    }

    if (groups.t3.length) {
        message += `📡 Connection lost (>${Math.round(THRESHOLD3 / 60)} min without update):\n${groups.t3.join('\n')}\n\n`;
    }

    if (isInitial) {
        if (allDevices.length === 0 && groups.t3.length === 0) {
            message += 'No battery devices found.';
        } else if (!LEVELS.some(l => groups[l.key].length) && groups.t3.length === 0) {
            message += 'All devices have sufficient battery.';
        }
    }

    return message.trim();
}

// ===== FIRST RUN (send all devices immediately) =====
function sendInitialBatteryReport() {
    const { groups, allDevices } = checkDevices(true);
    sendTelegram(buildMessage(groups, allDevices, true));
}

// ===== MAIN LOOP =====
const CHECK_INTERVAL_MS = CHECK_INTERVAL * 1000;

const intervalHandle = setInterval(function () {
    const { groups, allDevices } = checkDevices(false);
    const message = buildMessage(groups, allDevices, false);
    if (message) {
        sendTelegram(message);
    }
}, CHECK_INTERVAL_MS);

// ===== CLEANUP ON SCRIPT STOP =====
onStop(() => {
    clearInterval(intervalHandle);
    console.log('[device_battery_watchdog] stopped, interval cleared.');
});

// ===== START FIRST RUN DIRECTLY =====
sendInitialBatteryReport();
