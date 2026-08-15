import axios from 'axios';

const key = 'AIzaSyCiSh1LqwlMHZtpFEknoxUrYwKRmAW-mMY';
const models = ['gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.5-flash'];

const prompt = `
You are an expert trading coach and risk management educator.
Analyze this trading checklist and produce a comprehensive study reviewer:

Payout Bootcamp - Improving Risk Management
GatieTrades
Phase 1 - Auto Fail
Was the loss obviously avoidable?
Was the loss over my max loss per trade?
Was the loss taken while already being in daily drawdown?
Was the loss violating max loss per day?
Was the loss a full size loss?
Was the loss taken with increased stop loss?
Was the loss taken with emotional drawdown?
Was the loss taken with improper stop loss placement?
Phase 2 - Spiral Detection
Did I recognize warning signs before or during the loss?
Did I allow the loss to affect my decision-making?
Did I fully accept the loss with composure?
Did I feel pressure to recover immediately after the loss?
Did I consider the loss acceptable within my risk plan?
Did I willingly accept taking this same loss again?
Did I prioritize capital preservation above all else?
Did I take the trade with an appropriate amount of risk?
Phase 3 - Skill Improvement
Could I have logically reduced risk?
Could I have logically closed earlier?
Could I have logically partialed a position?
Could I have logically managed risk aggressively?
Could I have logically derisked initially?
Could I have trailed stops into profit?

Return valid JSON with: title, executiveSummary, keyTakeaways, comprehensiveSections, glossary, tags, entities, wikilinks, flashcards, quizQuestions.
`;

async function test() {
  for (const m of models) {
    try {
      console.log(`Trying model ${m}...`);
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );
      console.log(`SUCCESS with ${m}!`);
      const parsed = JSON.parse(res.data.candidates[0].content.parts[0].text);
      console.log('SUMMARY:', parsed.executiveSummary);
      console.log('SECTIONS:', parsed.comprehensiveSections?.length);
      return;
    } catch (e) {
      console.log(`Failed ${m}:`, e.response?.status, e.response?.data?.error?.message || e.message);
    }
  }
}

test();
