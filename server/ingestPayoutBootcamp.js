import axios from 'axios';

async function main() {
  try {
    const login = await axios.post('https://synapse-vault-jade.vercel.app/api/auth/login', { password: 'migol' });
    const token = login.data.token;
    console.log('Login success! Ingesting Payout Bootcamp...');

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

    const ingest = await axios.post(
      'https://synapse-vault-jade.vercel.app/api/ingest-pdf-text',
      {
        title: 'Payout Bootcamp - Improving Risk Management',
        rawText: text,
        numPages: 1,
        wordCount: 175,
        images: []
      },
      { headers: { Authorization: 'Bearer ' + token }, timeout: 60000 }
    );
    console.log('--- INGESTION COMPLETED WITH AI! ---');
    console.log('Title:', ingest.data.document.title);
    console.log('Summary:', ingest.data.document.reviewer.executiveSummary);
    console.log('Sections count:', ingest.data.document.reviewer.comprehensiveSections.length);
    console.log('Flashcards count:', ingest.data.document.reviewer.flashcards?.length);
  } catch (err) {
    console.error('Ingest error:', err.response?.status, err.response?.data || err.message);
  }
}

main();
