const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));

// Liệt kê models để kiểm tra nhanh model hợp lệ
router.get('/models', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Missing GOOGLE_GENERATIVE_AI_API_KEY' });
    const r = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    const data = await r.json();
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    res.status(500).json({ message: 'List models error', detail: e.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Missing GOOGLE_GENERATIVE_AI_API_KEY' });

    const { messages = [] } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages required (array of {role, content})' });
    }

    // Ưu tiên 2.5 → 2.0 → 1.5, kèm biến .env nếu có
    const candidates = [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash', 'gemini-2.5-pro',
      'gemini-2.0-flash', 'gemini-2.0-pro',
      'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest',
    ].filter(Boolean);
    const uniqueCandidates = [...new Set(candidates)];

    // Tách history chuẩn
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === 'user') { lastUserIndex = i; break; }
    }
    const lastUserMsg = lastUserIndex >= 0
      ? (messages[lastUserIndex]?.content || '')
      : (messages[messages.length - 1]?.content || '');
    const historyMsgs = lastUserIndex > 0 ? messages.slice(0, lastUserIndex) : [];

    const toGeminiMsg = (m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: (m.content || '').toString() }],
    });

    const genAI = new GoogleGenerativeAI(apiKey);

    const tryOnce = async (modelId) => {
      const model = genAI.getGenerativeModel({ model: modelId });
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{
              text: `Bạn là trợ lý tư vấn nhận nuôi của FurEver (VN).
- Tập trung vào nhu cầu và hoàn cảnh: thời gian rảnh, ngân sách, kinh nghiệm, có trẻ nhỏ/người dị ứng, có thú cưng khác, mục tiêu (bạn đồng hành, canh gác, trị liệu, ít rụng lông, ít sủa...).
- Nếu thông tin chưa đủ, hỏi 1 câu làm rõ.
- Trả lời ngắn gọn, tiếng Việt, kèm 3–5 gợi ý giống phù hợp.`,
            }],
          },
          ...historyMsgs.map(toGeminiMsg),
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
      });

      const result = await chat.sendMessage(lastUserMsg || 'Tư vấn giúp mình.');
      let text = result?.response?.text?.();
      if (!text) {
        const cands = result?.response?.candidates || [];
        text = cands.flatMap(c => (c.content?.parts || []).map(p => p.text).filter(Boolean)).join('\n').trim();
      }
      return (text || '').trim();
    };

    let reply = '';
    let usedModel = '';

    for (const m of uniqueCandidates) {
      try {
        reply = await tryOnce(m);
        usedModel = m;
        if (reply) break;
      } catch (e) {
        const status = e.status || e.response?.status;
        const msg = e.message || e.response?.data || '';
        // 404/400 → thử model tiếp theo
        if (status === 404 || status === 400) {
          console.warn(`[Gemini] ${m} not usable (${status}). Trying next...`, msg);
          continue;
        }
        if (status === 429) {
          return res.status(429).json({ message: 'Quota exceeded', detail: 'AI hết hạn mức hoặc quá tải.' });
        }
        console.error(`[Gemini] ${m} error:`, status, msg);
        // lỗi khác → thử tiếp
        continue;
      }
    }

    res.json({
      reply: reply || 'Mình chưa đủ thông tin. Bạn mô tả thêm ngân sách, có trẻ nhỏ/thú cưng khác và mục tiêu nuôi nhé.',
      model: usedModel || 'N/A',
    });
  } catch (err) {
    const status = err.status || err.response?.status || 500;
    const detail = err.message || err.response?.data || 'Unknown error';
    console.error('Gemini chat error:', status, detail);
    res.status(status === 429 ? 429 : 500).json({
      message: status === 429 ? 'Quota exceeded' : 'Chat error',
      detail,
    });
  }
});

module.exports = router;