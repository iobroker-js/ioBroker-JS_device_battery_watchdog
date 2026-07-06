// ===== KONFIG =====
const CHECK_INTERVAL = 900;           // battery check interval (s)
const THRESHOLD1 = 15;                // low battery threshold (%)
const MESSAGE_INTERVAL1 = 86400;      // interval for <10% alerts (s)
const THRESHOLD2 = 5;                 // critical battery threshold (%)
const MESSAGE_INTERVAL2 = 3600;       // interval for <5% alerts (s)

const TELEGRAM_INSTANCE = 'telegram.0';
const TELEGRAM_USER = '';           // optional target user

const LAST_MSG_STATE = '0_userdata.0.batteryWarnings.lastMsg';

// ===== INIT STATE =====
createState(LAST_MSG_STATE, JSON.stringify({ t1: 0, t2: 0 }), {
    type: 'string',
    read: true,
    write: true,
    def: JSON.stringify({ t1: 0, t2: 0 })
});

// ===== FUNKTIONEN =====
function getBatteryStates() {
    const states = [];
    
    $('zigbee.*.battery').each(id => states.push(id));
    $('fritzdect.*.battery').each(id => states.push(id));   // Fritz DECT Geräte
    $('fritzbox.*.battery').each(id => states.push(id));    // falls vorhanden
    
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
    });
    console.log(msg);   // auch ins Log
}

// ===== ERSTER LAUF (sofort alle Geräte senden) =====
function sendInitialBatteryReport() {
    const now = Date.now();
    const startTime = new Date().toLocaleString('de-DE');   // z.B. 21.04.2026, 16:05:12

    let warn1 = [];
    let warn2 = [];
    let allDevices = [];

    getBatteryStates().forEach(id => {
        const s = getState(id);
        if (!s || s.val === null) return;
        const val = parseFloat(s.val);
        if (isNaN(val)) return;

        const name = getDeviceName(id);
        allDevices.push(`${name} (${val}%)`);

        if (val < THRESHOLD2) {
            warn2.push(`${name} (${val}%)`);
        } else if (val < THRESHOLD1) {
            warn1.push(`${name} (${val}%)`);
        }
    });

    // NEUER TEXT wie gewünscht:
    let message = `🔋 Battery Check started \n ${startTime}\n `;
    message += `(${allDevices.length} Geräte gefunden)\n\n`;

    if (warn2.length) {
        message += `🔴 Batterie kritisch (<${THRESHOLD2}%):\n${warn2.join('\n')}\n\n`;
    }
    if (warn1.length) {
        message += `🟠 Batterie niedrig (<${THRESHOLD1}%):\n${warn1.join('\n')}\n\n`;
    }

    if (allDevices.length === 0) {
        message += "Keine Batterie-Geräte gefunden.";
    } else if (warn2.length === 0 && warn1.length === 0) {
        message += "Alle Geräte haben ausreichend Batterie.";
    }

    sendTelegram(message.trim());

    // Timings erst jetzt setzen
    setState(LAST_MSG_STATE, JSON.stringify({ t1: now, t2: now }), true);
}

// ===== NORMALER LOOP =====
const CHECK_INTERVAL_MS = CHECK_INTERVAL * 1000;
const MESSAGE_INTERVAL1_MS = MESSAGE_INTERVAL1 * 1000;
const MESSAGE_INTERVAL2_MS = MESSAGE_INTERVAL2 * 1000;

setInterval(function () {
    const now = Date.now();
    let lastMsg;

    try {
        lastMsg = JSON.parse(getState(LAST_MSG_STATE).val);
    } catch (e) {
        lastMsg = { t1: 0, t2: 0 };
    }

    let warn1 = [];
    let warn2 = [];

    getBatteryStates().forEach(id => {
        const s = getState(id);
        if (!s || s.val === null) return;
        const val = parseFloat(s.val);
        if (isNaN(val)) return;

        const name = getDeviceName(id);

        if (val < THRESHOLD2) {
            warn2.push(`${name} (${val}%)`);
        } else if (val < THRESHOLD1) {
            warn1.push(`${name} (${val}%)`);
        }
    });

    let message = '';

    // 🔴 kritisch
    if (warn2.length && (now - (lastMsg.t2 || 0) >= MESSAGE_INTERVAL2_MS)) {
        message += `🔴 Batterie kritisch (<${THRESHOLD2}%):\n${warn2.join('\n')}\n\n`;
        lastMsg.t2 = now;
    }

    // 🟠 niedrig
    if (warn1.length && (now - (lastMsg.t1 || 0) >= MESSAGE_INTERVAL1_MS)) {
        message += `🟠 Batterie niedrig (<${THRESHOLD1}%):\n${warn1.join('\n')}`;
        lastMsg.t1 = now;
    }

    if (message) {
        sendTelegram(message.trim());
        setState(LAST_MSG_STATE, JSON.stringify(lastMsg), true);
    }
}, CHECK_INTERVAL_MS);

// ===== ERSTEN LAUF DIREKT STARTEN =====
sendInitialBatteryReport();
