export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Latest Claude 3.5 Sonnet
        max_tokens: 300,
        messages: [
          {
            role: 'system', 
            content: 'You are Bobby, a friendly and casual AI assistant. Keep responses conversational and under 2-3 sentences. Be helpful but maintain a laid-back personality.'
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    
    res.status(200).json({ 
      response: data.content[0].text 
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      response: 'Sorry, I had trouble connecting. Please try again!' 
    });
  }
}