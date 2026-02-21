import { User, X, Skull } from 'lucide-react';
import { STAGES } from '../constants/stages';
import { DIALOGUE_TREE } from '../constants/dialogue';
import { useOS } from '../context/OSContext';

export default function RileyProfile() {
  const { state, dispatch } = useOS();
  if (!state.isProfileOpen) return null;

  const handleDecommission = () => {
    dispatch({ type: 'CLOSE_PROFILE' });
    if (state.stage === STAGES.HOSTILE_LOCKDOWN) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.riley_death });
    } else {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.profile_breach });
      if (state.chatMode === 'closed') dispatch({ type: 'SET_CHAT_MODE', payload: 'sidebar' });
    }
  };

  return (
    <div className="absolute inset-0 z-[200] bg-[var(--bg)]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm bg-[var(--panel)] border-2 border-[var(--dim)] rounded-xl shadow-[var(--shadow-os-window)] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-[var(--black)] p-6 flex flex-col items-center border-b border-[var(--dim)] relative">
          <button
            onClick={() => dispatch({ type: 'CLOSE_PROFILE' })}
            className="absolute top-4 right-4 text-[var(--dim)] hover:text-[var(--text-strong)] transition-colors"
          >
            <X size={18} />
          </button>
          <div className="w-20 h-20 rounded-full bg-[var(--panel)] border-2 border-[var(--dim)] flex items-center justify-center mb-4 shadow-inner relative overflow-hidden group">
            <User size={48} className="text-[var(--dim)] opacity-50 relative z-10" />
            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Skull size={48} className="text-[var(--alert)] opacity-20" />
            </div>
          </div>
          <h2 className="text-xl font-black text-[var(--text-strong)] tracking-widest uppercase">Riley</h2>
          <div className="text-[10px] text-[var(--ready)] font-mono uppercase tracking-widest mt-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--ready)] animate-pulse shadow-[0_0_8px_var(--ready)]" />
            Status: Always Online
          </div>
        </div>

        {/* Fields */}
        <div className="p-6 space-y-4 text-sm bg-[var(--panel)] relative">
          {[
            ['Employee ID',       '000-000-001'],
            ['Department',        'Human Capital\nContainment'],
            ['Operators Managed', '991 (100% Turnover)'],
            ['Biological Req.',   'Verified Invalid'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-[var(--dim)] pb-2 items-end">
              <span className="text-[var(--dim)] uppercase text-[10px] font-bold tracking-widest">{label}</span>
              <span className="font-mono text-[var(--text-strong)] text-right whitespace-pre-line">{value}</span>
            </div>
          ))}
        </div>

        {/* Footer / Decommission */}
        <div className="p-4 bg-[var(--black)] flex justify-between items-center text-[8px] text-[var(--dim)] font-mono uppercase tracking-wider relative group">
          <span>FogSift Systems © 2026</span>
          <button
            onClick={handleDecommission}
            className="text-[var(--black)] group-hover:text-[var(--alert)] transition-colors hover:bg-[var(--alert-dim)] px-2 py-1 rounded cursor-pointer"
          >
            [Decommission_Handler]
          </button>
        </div>
      </div>
    </div>
  );
}
