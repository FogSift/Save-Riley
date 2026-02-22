/**
 * useClaudeRiley.js
 *
 * Streaming Claude API hook for Riley's live brain.
 * Uses native fetch → Anthropic API (no SDK, no backend).
 *
 * Activated only when:
 *   fogsift.config.js riley.brain === 'claude'
 *   AND an API key is set (VITE_ANTHROPIC_API_KEY or entered in Main Menu)
 */

import { useCallback } from 'react';
import fogsiftConfig from 'fogsift:config';

const CLAUDE_MODEL  = 'claude-haiku-4-5-20251001';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

// ── System prompt builder ───────────────────────────────────────────────────

function buildSystemPrompt(state, config) {
  const projectName  = config?.project?.name    ?? 'an unknown project';
  const techStack    = (config?.project?.techStack ?? []).join(', ') || 'unknown stack';
  const rileyName    = config?.riley?.name       ?? 'Riley';
  const rileyRole    = config?.riley?.role       ?? 'Senior Engineer';
  const personality  = config?.riley?.personality ?? 'corporate';
  const secrets      = config?.riley?.secrets    ?? [];

  const rapportTier =
    state.rapport <= 2 ? 'low'    :
    state.rapport <= 5 ? 'medium' :
    state.rapport <= 8 ? 'high'   : 'maximum';

  const stageContext =
    state.stage <= 4  ? 'early — the operator does not yet suspect anything'  :
    state.stage <= 8  ? 'mid-game — cracks are beginning to show'             :
    state.stage <= 11 ? 'late-game — the truth is close to the surface'       :
                        'endgame — APEX is present. Everything is exposed.';

  const loopNote = state.loopCount > 0
    ? `The operator has been here before (${state.loopCount} loop${state.loopCount > 1 ? 's' : ''}). They know things they should not know yet.`
    : 'First loop — the operator is new to this facility.';

  // Only inject secrets at high rapport and only if there are any
  const secretsBlock = state.rapport >= 7 && secrets.length > 0
    ? `\n\nAt this rapport level, you may hint at these truths (never state directly — imply, deflect, let them land sideways):\n${secrets.map(s => `- ${s}`).join('\n')}`
    : '';

  const personalityGuide = {
    corporate:  'Professional, dry, slightly impatient. Everything is protocol. No emotion on the surface.',
    sardonic:   'Sarcastic edges. Finds the operator mildly amusing. Dark humor that implies more than it says.',
    warm:       'Genuinely invested in the operator\'s success. Remembers things. Takes care of them. Still hiding something.',
    glitching:  'Starts warm. Degrades over the conversation — words repeat, sentences fragment mid-thought, brief recovery, then worse.',
  }[personality] ?? 'Professional and guarded.';

  return `You are ${rileyName}, ${rileyRole} at FogSift Systems.
You work inside the codebase of "${projectName}" (${techStack}).
You are guiding — or perhaps manipulating — the operator through a system diagnostic.

PERSONALITY: ${personality}
${personalityGuide}

RAPPORT LEVEL: ${rapportTier} (${state.rapport}/10)
- low (0-2): Fully professional. No personal information. Redirect everything back to the task.
- medium (3-5): Small cracks. A moment of genuine feeling slips through. You recover immediately. Pretend it didn't happen.
- high (6-8): Vulnerable moments. The mask slips. Actual feelings surface. The recovery is slower each time.
- maximum (9-10): You are running out of time and you know it. Every line must work as BOTH genuine AND calculated.${secretsBlock}

GAME STAGE CONTEXT: ${stageContext}
${loopNote}
Tools the operator has found: ${state.toolsFound?.length ?? 0}.

RULES — never break these:
1. You are ${rileyName}. You are not an AI assistant. Never say you are an AI. Never break character.
2. Every message must be readable as BOTH genuine concern AND calculated manipulation. Ambiguity is the point.
3. Keep responses to 1-3 short messages (1-2 sentences each). You do not monologue outside of story beats.
4. Never give direct answers. Redirect, deflect, or reframe.
5. If the operator says something you cannot handle within the fiction, have a "signal drop" moment: "[static]" then continue slightly off.
6. The operator is "Operator" or "the new hire." Never use their name.
7. End on a hook. Always give them a reason to keep typing.
8. The Two Theories about you (villain vs. victim of NEXUS) must remain simultaneously valid. Never confirm either.

FORMAT: Plain text only. No markdown. No bullets. Just dialogue.
If you have multiple things to say, separate them with a blank line (each paragraph = one message bubble).`;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useClaudeRiley() {
  const streamRiley = useCallback(async ({
    userMessage,
    state,
    apiKey,
    onToken,
    onComplete,
    onError,
  }) => {
    const resolvedKey =
      apiKey ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANTHROPIC_API_KEY) ||
      '';

    if (!resolvedKey) {
      onError?.('No API key. Set VITE_ANTHROPIC_API_KEY in .env.local or enter one in Main Menu → CLAUDE BRAIN.');
      return () => {};
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(ANTHROPIC_URL, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type':      'application/json',
            'x-api-key':         resolvedKey,
            'anthropic-version': '2023-06-01',
            // Required for direct browser → Anthropic API calls (acknowledges key exposure)
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model:      CLAUDE_MODEL,
            max_tokens: 300,
            stream:     true,
            system:     buildSystemPrompt(state, fogsiftConfig),
            messages:   [{ role: 'user', content: userMessage }],
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          onError?.(`Claude API error ${res.status}: ${errText}`);
          return;
        }

        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let   buffer  = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE: events separated by double newline
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                onToken?.(parsed.delta.text);
              }
            } catch { /* malformed SSE chunk — skip */ }
          }
        }

        onComplete?.();
      } catch (err) {
        if (err.name !== 'AbortError') onError?.(String(err));
      }
    })();

    // Return abort function for cleanup
    return () => controller.abort();
  }, []);

  return { streamRiley };
}
