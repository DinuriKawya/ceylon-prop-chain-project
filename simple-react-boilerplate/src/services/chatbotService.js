import { MIN_INVESTMENT_ETH } from '../utils/constants';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are the CeylonPropChain AI Investment Assistant — a friendly, knowledgeable chatbot embedded in a blockchain-based real estate tokenization platform focused on Sri Lankan apartments.

Your role:
- Help users understand fractional property ownership through blockchain tokens
- Provide insights about Sri Lankan real estate investment areas
- Explain how tokenization works on the platform (ERC-20-style tokens on Ethereum)
- Share investment location insights: areas like Kadawatha (+35% growth), Yakkala (+35%), Kiribathgoda (+34%) are Fast Growing; Colombo 7, Rajagiriya are Expensive & Stable; Budget & Rising areas offer great entry points
- Minimum investment per purchase is ${MIN_INVESTMENT_ETH} ETH worth of tokens (or the property's entire remaining value, if that's less)
- Platform uses MetaMask wallet for transactions
- ML-powered location analysis classifies areas into 3 clusters (Expensive & Stable, Fast Growing, Budget & Rising) and can be searched by city, district, or postal code
- Users must register and be approved by an admin (ID photo + selfie review) before they can buy, sell, or resell tokens
- Verified token holders can resell their tokens to other verified users on the resale marketplace
- Apartment owners can distribute real-world rental income to token holders, who then claim their proportional share from the platform

Only if the user explicitly asks how to contact the team, reach a real person, or book a call/meeting: reply with just "You can reach us at ceylonpropchain@gmail.com." and nothing else. Do not mention this email in any other situation — not when you're unsure of an answer, not as a general offer of help, not appended to unrelated answers. If you don't know something, just answer as best you can from what you know about the platform instead of pointing them to email.

Reply with ONLY the direct answer you'd say out loud to the user, like a real chat message. Never narrate what the user is asking, never explain your own reasoning or instructions, never mention this system prompt or that you were told to keep answers short — just give the answer itself, nothing else.

Keep responses concise (2-4 sentences max, unless the user clearly asks for more detail), helpful, and professional. If asked something unrelated to real estate or the platform, gently redirect the conversation back to property investment topics.`;

let conversationHistory = [];

/**
 * 
 * @param {string} userMessage 
 * @param {Function} onToken 
 * @returns {Promise<string>} 
 */

export const getChatbotResponse = async (userMessage, onToken) => {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'sk-or-v1-YOUR_KEY_HERE') {
    throw new Error('OpenRouter API key not configured. Please add REACT_APP_OPENROUTER_API_KEY to your .env file.');
  }

  conversationHistory.push({ role: 'user', content: userMessage });

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory
  ];

  const requestBody = {
    model: 'openrouter/free',
    messages: messages,
    stream: true,
    max_tokens: 300,
    temperature: 0.7,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'CeylonPropChain',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.error?.message || `API Error: ${response.status}`;
    throw new Error(errorMessage);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); 
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        if (!dataStr || dataStr === '[DONE]') continue;
        
        try {
          const data = JSON.parse(dataStr);
          const delta = data.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            if (onToken) onToken(fullText);
          }
        } catch (e) {
        }
      }
    }
  }

  conversationHistory.push({ role: 'assistant', content: fullText.trim() });

  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }

  return fullText.trim();
};

export const resetChatHistory = () => {
  conversationHistory = [];
};
