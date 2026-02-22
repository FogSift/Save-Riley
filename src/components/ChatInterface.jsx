import { useEffect, useRef } from 'react';
import { User, X, Send, Lock, Loader2, Zap } from 'lucide-react';
import { useOS } from '../context/OSContext';

export default function ChatInterface({ isModal }) {
  const { state, dispatch, sendToClaudeRiley } = useOS();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.chatMessages, state.isTyping, state.chatOptions, state.claudeStreamBuffer]);

  const content = (
    <div
      className={`flex flex-col bg-[var(--bg)] ${
        isModal
          ? 'w-full max-w-md h-[500px] max-h-[80vh] rounded-xl shadow-[var(--shadow-os-window)] border-2 border-[var(--secure)] overflow-hidden'
          : 'h-full w-full'
      }`}
    >
      {/* Header */}
      <div className="bg-[var(--secure)] text-white p-3 flex justify-between items-center shrink-0 shadow-md z-10">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PROFILE' })}
          className="flex items-center gap-3 hover:bg-white/10 p-1.5 rounded transition-colors group text-left"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[var(--secure-dim)] flex items-center justify-center border-2 border-transparent group-hover:border-white transition-colors">
              <User size={18} className="text-white opacity-70" />
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 absolute bottom-0 right-0 border-2 border-[var(--secure)] animate-pulse shadow-[0_0_8px_#4ade80]" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide leading-none group-hover:text-white transition-colors flex items-center gap-1.5">
                Riley
                {state.claudeMode && (
                  <span className="text-[7px] bg-yellow-300 text-black px-1 py-0.5 rounded font-mono uppercase tracking-widest inline-flex items-center gap-0.5">
                    <Zap size={7} /> LIVE
                  </span>
                )}
              </div>
            <div className="text-[9px] opacity-70 mt-1 uppercase tracking-widest font-mono flex items-center gap-2">
              Senior Tech{' '}
              <span className="bg-black/30 px-1 rounded border border-white/10" title="Internal Rapport Score">
                Rapport: {state.rapport}
              </span>
            </div>
          </div>
        </button>

        {!isModal && (
          <button onClick={() => dispatch({ type: 'TOGGLE_CHAT' })} className="hover:bg-white/20 p-2 rounded transition-colors">
            <X size={18} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-6 bg-[var(--panel)]">
        {state.chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.sender === 'System' ? 'items-center' : msg.sender === 'Operator' ? 'items-end' : 'items-start'
            }`}
          >
            {msg.sender === 'System' ? (
              <div className="flex items-center gap-2 my-4 opacity-50 w-full justify-center">
                <div className="h-px flex-1 bg-[var(--text)]" />
                <span className="text-[9px] font-mono text-[var(--text)] uppercase tracking-widest px-2">{msg.text}</span>
                <div className="h-px flex-1 bg-[var(--text)]" />
              </div>
            ) : (
              <div
                className={`p-3 rounded-xl text-sm shadow-sm max-w-[85%] leading-relaxed ${
                  msg.sender === 'Operator'
                    ? 'bg-[var(--accent)] text-[var(--accent-text)] rounded-tr-sm border border-[var(--accentLight)]'
                    : 'bg-[var(--secure-dim)] border border-[var(--secure)] text-[var(--text-strong)] rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            )}
          </div>
        ))}

        {state.isTyping && (
          <div className="flex items-start">
            <div className="bg-[var(--secure-dim)] border border-[var(--secure)] p-4 rounded-xl rounded-tl-sm flex gap-1">
              {[0, 150, 300].map(delay => (
                <div
                  key={delay}
                  className="w-1.5 h-1.5 bg-[var(--secure)] rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Claude streaming: live token buffer */}
        {state.claudeStreaming && state.claudeStreamBuffer && (
          <div className="flex items-start">
            <div className="bg-[var(--secure-dim)] border border-[var(--secure)] p-3 rounded-xl rounded-tl-sm text-sm text-[var(--text-strong)] max-w-[85%] leading-relaxed">
              {state.claudeStreamBuffer}
              <span className="inline-block w-1 h-3 bg-[var(--secure)] animate-pulse ml-0.5 align-middle" />
            </div>
          </div>
        )}

        {/* Claude streaming: dots while waiting for first token */}
        {state.claudeStreaming && !state.claudeStreamBuffer && (
          <div className="flex items-start">
            <div className="bg-[var(--secure-dim)] border border-[var(--secure)] p-4 rounded-xl rounded-tl-sm flex gap-1">
              {[0, 150, 300].map(delay => (
                <div key={delay} className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input / Options */}
      <div className="p-3 bg-[var(--bg)] border-t border-[var(--dim)] shrink-0 min-h-[60px] flex flex-col justify-center">
        {state.chatOptions.length > 0 ? (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
            {state.chatOptions.map((opt, i) => {
              const isLocked = opt.reqRapport !== undefined && state.rapport < opt.reqRapport;
              return (
                <button
                  key={i}
                  disabled={isLocked}
                  onClick={() => dispatch({ type: 'SELECT_CHAT_OPTION', payload: opt })}
                  className={`w-full text-left p-3 rounded bg-[var(--black)] border text-sm transition-colors flex items-center justify-between group ${
                    isLocked
                      ? 'opacity-50 cursor-not-allowed border-[var(--dim)] text-[var(--dim)]'
                      : 'hover:bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--text-strong)]'
                  }`}
                >
                  <span>
                    {opt.reqRapport !== undefined && (
                      <span className="text-[10px] text-[var(--secure)] mr-2 font-mono">[RAPPORT Lvl {opt.reqRapport}]</span>
                    )}
                    {opt.text}
                  </span>
                  {isLocked
                    ? <Lock size={14} className="opacity-50" />
                    : <Send size={14} className="opacity-0 group-hover:opacity-100 text-[var(--accent)] transition-opacity" />
                  }
                </button>
              );
            })}
          </div>
        ) : state.isTyping ? (
          <div className="flex items-center gap-2 text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest px-2">
            <Loader2 size={12} className="animate-spin" /> Receiving transmission...
          </div>
        ) : state.claudeMode && !state.claudeStreaming && state.chatQueue.length === 0 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendToClaudeRiley?.(state.claudeFreeInput);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={state.claudeFreeInput}
              onChange={(e) => dispatch({ type: 'SET_CLAUDE_FREE_INPUT', payload: e.target.value })}
              placeholder="Message Riley..."
              autoFocus
              className="flex-1 bg-[var(--black)] border border-[var(--secure)] rounded px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--dim)] font-mono"
            />
            <button
              type="submit"
              disabled={!state.claudeFreeInput.trim()}
              className="px-3 py-2 bg-[var(--secure)] text-white rounded text-xs font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        ) : (
          <div className="w-full bg-[var(--black)] border border-[var(--dim)] rounded-lg px-3 py-2.5 text-xs text-[var(--dim)] cursor-not-allowed select-none flex items-center justify-between">
            <span>Reply locked by admin...</span>
            <Lock size={12} className="opacity-50" />
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="absolute inset-0 z-[100] bg-[var(--bg)]/80 backdrop-blur-sm flex items-center justify-center p-4">
        {content}
      </div>
    );
  }
  return content;
}
