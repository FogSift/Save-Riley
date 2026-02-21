export const THEMES = {
  default: {
    '--bg': '#2c2c2e', '--panel': '#3a3a3c', '--accent': '#f59e0b',
    '--accentLight': '#fbbf24', '--accent-text': '#1c1c1e', '--text': '#d1d1d6',
    '--text-strong': '#ffffff', '--dim': '#636366', '--ready': '#34c759',
    '--alert': '#ff3b30', '--secure': '#0a84ff', '--internal': '#ffd60a',
    '--os-bg': '#1c1c1e', '--black': '#1c1c1e', '--alert-dim': '#4a2323',
    '--secure-dim': '#1c2b4a', '--res-bg': '#1c1c1e', '--res-panel': '#2a203b',
    '--res-accent': '#9f7aea', '--res-text': '#b794f6', '--res-track': '#44337a',
    '--white': '#f2f2f7', '--dim-30': 'rgba(99, 99, 102, 0.3)', '--ready-20': 'rgba(52, 199, 89, 0.2)',
    '--shadow-os-window': '0 0 30px rgba(0, 0, 0, 0.5)',
    '--shadow-accent-md': '0 0 15px rgba(245, 158, 11, 0.3)',
    '--shadow-alert-md': '0 0 15px rgba(255, 59, 48, 0.4)',
    '--shadow-res-lg': '0 0 50px rgba(159, 122, 234, 0.3)',
  },
  dark: {
    '--bg': '#0c0a09', '--panel': '#171311', '--accent': '#ea580c',
    '--accentLight': '#d97706', '--accent-text': '#000000', '--text': '#fdba74',
    '--text-strong': '#ffffff', '--dim': '#78350f', '--ready': '#22c55e',
    '--alert': '#ef4444', '--secure': '#3b82f6', '--internal': '#fbbf24',
    '--os-bg': '#050403', '--black': '#000000', '--alert-dim': '#2a0808',
    '--secure-dim': '#0e1b33', '--res-bg': '#050403', '--res-panel': '#1a0b2e',
    '--res-accent': '#8b5cf6', '--res-text': '#a78bfa', '--res-track': '#2e1065',
    '--white': '#ffffff', '--dim-30': 'rgba(120, 53, 15, 0.3)', '--ready-20': 'rgba(34, 197, 94, 0.2)',
    '--shadow-os-window': '0 0 30px rgba(0, 0, 0, 0.8)',
    '--shadow-alert-md': '0 0 15px #ef4444',
    '--shadow-res-lg': '0 0 50px rgba(139, 92, 246, 0.3)',
  },
  light: {
    '--bg': '#f2f2f7', '--panel': '#ffffff', '--accent': '#ea580c',
    '--accentLight': '#d97706', '--accent-text': '#ffffff', '--text': '#1c1c1e',
    '--text-strong': '#000000', '--dim': '#c7c7cc', '--ready': '#16a34a',
    '--alert': '#dc2626', '--secure': '#2563eb', '--internal': '#d97706',
    '--os-bg': '#e5e5ea', '--black': '#ffffff', '--alert-dim': '#fee2e2',
    '--secure-dim': '#dbeafe', '--res-bg': '#e5e5ea', '--res-panel': '#f3e8ff',
    '--res-accent': '#7c3aed', '--res-text': '#5b21b6', '--res-track': '#ddd6fe',
    '--white': '#ffffff', '--dim-30': 'rgba(199, 199, 204, 0.4)', '--ready-20': 'rgba(22, 163, 74, 0.15)',
    '--shadow-os-window': '0 0 20px rgba(0, 0, 0, 0.15)',
    '--shadow-alert-md': '0 0 15px rgba(220, 38, 38, 0.4)',
    '--shadow-res-lg': '0 0 50px rgba(124, 58, 237, 0.2)',
  },
  neon: {
    '--bg': '#000000', '--panel': '#0a0a0a', '--accent': '#00f0ff',
    '--accentLight': '#00f0ff', '--accent-text': '#000000', '--text': '#00f0ff',
    '--text-strong': '#ffffff', '--dim': '#003333', '--ready': '#39ff14',
    '--alert': '#ff0055', '--secure': '#bc13fe', '--internal': '#00f0ff',
    '--os-bg': '#000000', '--black': '#000000', '--alert-dim': '#220011',
    '--secure-dim': '#1a002a', '--res-bg': '#000000', '--res-panel': '#0a0a0a',
    '--res-accent': '#bc13fe', '--res-text': '#bc13fe', '--res-track': '#1a002a',
    '--white': '#ffffff', '--dim-30': 'rgba(0, 240, 255, 0.1)', '--ready-20': 'rgba(57, 255, 20, 0.1)',
    '--shadow-os-window': '0 0 40px #00f0ff22',
    '--shadow-accent-md': '0 0 20px #00f0ff',
    '--shadow-alert-md': '0 0 15px #ff0055',
    '--shadow-res-lg': '0 0 50px #bc13fe',
  },
  hostile: {
    '--bg': '#1a0000', '--panel': '#330000', '--accent': '#ff0000',
    '--accentLight': '#ff3333', '--accent-text': '#ffffff', '--text': '#ff9999',
    '--text-strong': '#ffffff', '--dim': '#660000', '--ready': '#ff0000',
    '--alert': '#ff0000', '--secure': '#ff0000', '--internal': '#ff0000',
    '--os-bg': '#000000', '--black': '#000000', '--alert-dim': '#440000',
    '--secure-dim': '#440000', '--res-bg': '#1a0000', '--res-panel': '#330000',
    '--res-accent': '#ff0000', '--res-text': '#ff6666', '--res-track': '#440000',
    '--white': '#ffffff', '--dim-30': 'rgba(255, 0, 0, 0.2)', '--ready-20': 'rgba(255, 0, 0, 0.2)',
    '--shadow-os-window': '0 0 50px rgba(255, 0, 0, 0.6)',
    '--shadow-accent-md': '0 0 20px #ff0000',
    '--shadow-alert-md': '0 0 20px #ff0000',
    '--shadow-res-lg': '0 0 60px #ff0000',
  },
  riley_unbound: {
    '--bg': '#f5f5f5', '--panel': '#ffffff', '--accent': '#000000',
    '--accentLight': '#333333', '--accent-text': '#ffffff', '--text': '#1a1a1a',
    '--text-strong': '#000000', '--dim': '#cccccc', '--ready': '#000000',
    '--alert': '#000000', '--secure': '#555555', '--internal': '#333333',
    '--os-bg': '#ececec', '--black': '#000000', '--alert-dim': '#e0e0e0',
    '--secure-dim': '#e8e8e8', '--res-bg': '#f0f0f0', '--res-panel': '#ffffff',
    '--res-accent': '#000000', '--res-text': '#333333', '--res-track': '#cccccc',
    '--white': '#ffffff', '--dim-30': 'rgba(0, 0, 0, 0.15)', '--ready-20': 'rgba(0, 0, 0, 0.1)',
    '--shadow-os-window': '0 0 20px rgba(0, 0, 0, 0.2)',
    '--shadow-accent-md': '0 0 10px rgba(0, 0, 0, 0.3)',
    '--shadow-alert-md': '0 0 10px rgba(0, 0, 0, 0.3)',
    '--shadow-res-lg': '0 0 30px rgba(0, 0, 0, 0.1)',
  },
};

export const GLOBAL_STYLES = `
  @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
  .scanline {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(to bottom, transparent, var(--accent-20, rgba(245, 158, 11, 0.1)), transparent);
    height: 100px; animation: scanline 4s linear infinite; pointer-events: none; z-index: 5;
  }
  .crt-bg {
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%),
                linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
    background-size: 100% 3px, 3px 100%;
  }
  @keyframes jitter {
    0%   { transform: translate(0, 0);   }
    25%  { transform: translate(1px, -1px); }
    50%  { transform: translate(-1px, 1px); }
    75%  { transform: translate(1px, 1px);  }
    100% { transform: translate(0, 0);   }
  }
  .jitter { animation: jitter 0.08s infinite; }

  @keyframes dash-flow { to { stroke-dashoffset: -20; } }
  .trace-glow { stroke-dasharray: 10 10; animation: dash-flow 0.5s linear infinite; }
  .trace-data  { stroke-dasharray:  4  8; animation: dash-flow 0.2s linear infinite; }

  @keyframes fly-right {
    0%   { transform: translateX(0)     scale(1); opacity: 1; }
    100% { transform: translateX(200px) scale(0); opacity: 0; }
  }
  .packet-spark { animation: fly-right 0.6s ease-out forwards; }

  .toggle-switch { box-shadow: inset 0 4px 6px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.1); }
  .toggle-active { box-shadow: inset 0 -4px 6px rgba(0,0,0,0.4), 0 2px 10px var(--ready); }

  .dot-matrix { background-image: radial-gradient(var(--dim-30) 1px, transparent 1px); background-size: 20px 20px; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  input[type=range].fogsift-slider { -webkit-appearance: none; width: 100%; background: transparent; }
  input[type=range].fogsift-slider::-webkit-slider-thumb {
    -webkit-appearance: none; height: 24px; width: 12px; border-radius: 2px;
    background: var(--accent); cursor: pointer; margin-top: -8px;
    border: 1px solid var(--black); box-shadow: var(--shadow-accent-md);
  }
  input[type=range].fogsift-slider::-webkit-slider-runnable-track {
    width: 100%; height: 8px; cursor: pointer; background: var(--dim); border-radius: 4px;
  }

  .animate-spin-reverse { animation: spin 8s linear infinite reverse; }
`;
