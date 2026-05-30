// protocol.js
// MessageTypes — object with SENSOR_READING, HEARTBEAT, ACK, ERROR
// createMessage(type, payload) — returns { id, type, payload, timestamp }
// parseMessage(raw) — returns { ok: true, message } or { ok: false, error }

export const MessageType = {
    SENSOR_READING: "sensor:reading",
    HEARTBEAT: "heartbeat",
    ACK: "ack",
    ERROR: "error"
};

export const createMessage = (type, payload, id = Date.now()) => ({
    id,
    type,
    payload,
    timestamp: new Date().toISOString()
});

export function parseMessage(raw) {
    try {
        const msg = JSON.parse(raw);
        if (!msg.type || !msg.timestamp) {
            throw new Error("Invalid message format");
        }
        return { ok: true, message: msg };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}