interface ChatMessage { role: 'user' | 'assistant'; content: string }

function buildPrompt(messages: ChatMessage[]): string {
  return messages
    .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
    .join('\n') + '\nAsistente:';
}

export default {
  async fetch(request: Request, env: { AI: any }) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    // Salud para ver si está arriba
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    if (request.method !== 'POST') {
      return new Response('Use POST', { status: 405, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    try {
      const body = await request.json();
      const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
      const prompt = buildPrompt(messages);
      const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt,
        max_tokens: 350,
        temperature: 0.7,
      });
      const reply = typeof result === 'string' ? result : (result as any)?.response || 'No se obtuvo respuesta.';
      return new Response(JSON.stringify({ reply }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message || 'Error interno' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }
};
