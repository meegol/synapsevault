import { generateDeepReviewerWithGemini } from './services/geminiService.js';

const text = `
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
`;

async function run() {
  try {
    const res = await generateDeepReviewerWithGemini({
      title: 'Payout Bootcamp - Improving Risk Management',
      sourceType: 'pdf',
      content: text
    });
    console.log('--- SUMMARY ---');
    console.log(res.executiveSummary);
    console.log('--- SECTIONS ---');
    console.log(JSON.stringify(res.comprehensiveSections, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  }
}

run();
