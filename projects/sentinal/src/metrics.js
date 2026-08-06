// Simulated system metrics — three generators:
//
// cpuMetric()
//   returns { type: "cpu", value: 0-100, unit: "%" }
//   value drifts gradually — not pure random
//   spikes occasionally to simulate load
//
// memoryMetric()
//   returns { type: "memory", value: 0-100, unit: "%" }
//   slowly increases over time (simulates memory pressure)
//   resets occasionally (simulates GC)
//
// networkMetric()
//   returns { type: "network", value: 0-1000, unit: "Mbps" }
//   random with occasional bursts
//
// All three are regular functions — not async
// Each call returns one fresh reading with a timestamp


import os from "node:os";

function reading(type, value, unit) {
  return {
    type,
    value: Number(value.toFixed(2)),
    unit,
    timestamp: new Date().toISOString(),
  };
}
 
// --- Real Metrics ---
 
function cpuSnapshot() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
 
  for (const cpu of cpus) {
    idle += cpu.times.idle;
    total +=
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq;
  }
 
  return { idle, total };
}
 
let lastCpu = cpuSnapshot();
 
export function cpuMetric() {
  const current = cpuSnapshot();
 
  const idleDiff = current.idle - lastCpu.idle;
  const totalDiff = current.total - lastCpu.total;
 
  lastCpu = current;
 
  const usage = totalDiff === 0 ? 0 : (1 - idleDiff / totalDiff) * 100;
 
  return reading("cpu", usage, "%");
}
 
export function memoryMetric() {
  const total = os.totalmem();
  const free = os.freemem();
  const usedPercent = ((total - free) / total) * 100;
 
  return reading("memory", usedPercent, "%");
}
 
// --- Simulated Network ---
// Node.js os module does not expose network throughput.
// Replace with the systeminformation package for real data.
 
let networkBase = 100;
 
export function networkMetric() {
  const drift = Math.random() * 50 - 25;
  const burst = Math.random() < 0.15 ? Math.random() * 750 : 0;
 
  networkBase = Math.max(0, Math.min(1000, networkBase + drift));
 
  return reading("network", Math.min(1000, networkBase + burst), "Mbps");
}