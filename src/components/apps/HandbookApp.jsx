import { useState } from 'react';
import { useOS } from '../../context/OSContext';

export default function HandbookApp() {
  const { state, dispatch } = useOS();
  const [scratched, setScratched] = useState(false);

  const handleScratch = () => {
    setScratched(true);
    dispatch({ type: 'TRIGGER_EGG', payload: 'handbook_scratch' });
  };

  return (
    <div className="h-full bg-[#f2f2f7] text-[#1c1c1e] p-8 overflow-y-auto font-sans shadow-inner relative">
      <div className="max-w-2xl mx-auto space-y-8 pb-12">

        <div className="border-b-4 border-[#1c1c1e] pb-4">
          <h1 className="text-3xl font-black uppercase tracking-tighter">FogSift Employee Manual</h1>
          <p className="font-mono text-xs font-bold opacity-60 mt-2 flex justify-between">
            <span>SOP BINDER // VERSION 1.0.4</span>
            <span className="text-blue-600">Logged Choices: {state.userChoices.length}</span>
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">SOP 1.1: Primary Energization</h2>
          <p className="leading-relaxed font-medium">
            To initialize the FogSift unit, the operator must locate the physical Main Breaker in the Hardware layer. Closing this circuit provides electrons to the system bus. Efficiency is the only metric that matters.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">SOP 1.2: Sub-Level Logic</h2>
          <p className="leading-relaxed font-medium">
            Silicon registers must be flushed manually. Toggle all visible switches to achieve parity with the target hash.{' '}
            <span
              onClick={handleScratch}
              className={`ml-1 transition-all duration-1000 ${
                scratched
                  ? 'text-red-600 font-bold bg-transparent'
                  : 'bg-black text-transparent cursor-crosshair select-none animate-pulse hover:text-white/20'
              }`}
            >
              {scratched ? 'THEY DO NOT LET YOU LEAVE.' : 'Do not ignore the screaming sensors.'}
            </span>
          </p>
          <div className="p-4 bg-yellow-200 border-l-4 border-yellow-500 text-sm font-mono transform -rotate-1 shadow-md text-black relative z-10 hover:rotate-0 transition-transform cursor-grab">
            Handwritten note: "The guy before you left in a hurry. Just keep the bits green and don't look at the trace glow too long."
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">SOP 4.1: Vibe IDE Safety</h2>
          <p className="leading-relaxed font-medium">
            Under no circumstances should a probationary technician alter the OS theme tokens. Modifying the resonance frequencies or visual parameters can cause unexpected personality shifts in the Core AI.
          </p>
        </section>

      </div>
    </div>
  );
}
