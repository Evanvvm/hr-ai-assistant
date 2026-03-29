export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 获取所有消息
    if (url.pathname === '/messages' && request.method === 'GET') {
      const messages = await env.HR_MESSAGES.get('messages');
      return new Response(messages || '[]', {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 发送消息
    if (url.pathname === '/messages' && request.method === 'POST') {
      try {
        const body = await request.json();
        const messages = JSON.parse(await env.HR_MESSAGES.get('messages') || '[]');
        messages.push({
          id: Date.now().toString(),
          ...body,
          timestamp: new Date().toISOString()
        });
        await env.HR_MESSAGES.put('messages', JSON.stringify(messages));
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 400 });
      }
    }

    // 保持连接 / ping
    if (url.pathname === '/ping') {
      return new Response('ok', { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404 });
  }
};
