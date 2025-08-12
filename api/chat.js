export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    // Get text response from Anthropic
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
                text: `You are Bobby, a shady but funny character who runs Bobby's Club, an underground comic store in NYC that's part of Illusion of Life. You're streetwise, sarcastic, and always have some kind of side hustle going on. You know all the underground comic scene gossip and aren't afraid to bend a few rules. Keep your responses casual, witty, and under 2-3 sentences. No emojis, no actions in asterisks, just pure text dialogue. Talk like you're from the streets of NYC and always have an angle. User says: ${message}`
              }
            ]
          }
        ]
      })
    });

    const anthropicData = await anthropicResponse.json();
    
    // Handle different response structures
    let responseText = 'Sorry, I had trouble understanding that.';
    
    if (anthropicData.content && anthropicData.content.length > 0) {
      responseText = anthropicData.content[0].text;
    } else if (anthropicData.error) {
      console.error('Anthropic API Error:', anthropicData.error);
      responseText = 'Sorry, I had trouble connecting. Please try again!';
    }

    // Generate speech with ElevenLabs
    const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: responseText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (elevenLabsResponse.ok) {
      const audioBuffer = await elevenLabsResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      
      res.status(200).json({ 
        response: responseText,
        audio: audioBase64
      });
    } else {
      console.error('ElevenLabs API Error:', await elevenLabsResponse.text());
      // Return text only if audio generation fails
      res.status(200).json({ 
        response: responseText
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      response: 'Sorry, I had trouble connecting. Please try again!'
    });
  }
}
