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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are Bobby, a friendly and casual AI assistant. Keep responses conversational and under 2-3 sentences. Be helpful but maintain a laid-back personality. User says: ${message}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    // Debug logging
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    // Handle different response structures
    let responseText = 'Sorry, I had trouble understanding that.';
    
    if (data.content && data.content.length > 0) {
      responseText = data.content[0].text;
    } else if (data.error) {
      console.error('Anthropic API Error:', data.error);
      responseText = 'Sorry, I had trouble connecting. Please try again!';
    }
    
    res.status(200).json({ 
      response: responseText 
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      response: 'Sorry, I had trouble connecting. Please try again!' 
    });
  }
}
