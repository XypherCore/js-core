// A data processing pipeline — pure functions only
//
// processReading(reading)
//   - validates reading has id, value, type
//   - converts temperature F to C if type === "temp"
//   - tags reading as "critical" if value > 90, "warning" if > 70, "normal" otherwise
//   - returns { ...reading, status, processedAt }
//
// filterCritical(readings)
//   - returns only critical readings
//
// summarize(readings)
//   - returns {
//       total: number,
//       critical: number,
//       warning: number,
//       normal: number,
//       avgValue: number (rounded to 1 decimal)
//     }


export function processReading(reading) {
    if (!reading.id || reading.value === undefined || !reading.type) {
        return null; // invalid
    }

    const converted = reading.type === "temp"
        ? { ...reading, value: Number(((reading.value - 32) * 5 / 9).toFixed(1)), unit: "C" }
        : reading;

    const status = converted.value > 90 ? "critical"
        : converted.value > 70 ? "warning"
            : "normal";

    return { ...converted, status, processedAt: new Date().toISOString() };
}

export const filterCritical = readings => readings.filter(r => r.status === "critical");

export const summarize = readings => {
    const total = readings.length;
    const critical = readings.filter(reading => reading.status === "critical").length;
    const warning = readings.filter(reading => reading.status === "warning").length;
    const normal = readings.filter(reading => reading.status === "normal").length;
    const valueTotal = readings.reduce((sum, reading) => sum + reading.value, 0);
    const avgValue = total === 0 ? 0 : Number((valueTotal / total).toFixed(1));

    return {
        total,
        critical,
        warning,
        normal,
        avgValue
    };
};