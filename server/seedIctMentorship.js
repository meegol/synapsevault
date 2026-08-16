import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import dotenv from 'dotenv';
dotenv.config();

import { seedVaultDocument, listVaultDocuments } from './services/agentVault.js';

const title = 'ICT 2024 Mentorship Master Notes (Lectures 1-21)';
const rawText = `# ICT 2024 Mentorship Master Notes (Lectures 1-21)
*Notes compiled by GatieTrades on lectures by @TheInnerCircleTrader (ICT)*

---

## 📌 Core Overview & Key Reference Levels
- **NDOG (New Day Opening Gap)**: Gap between 16:59 settlement close and 18:00 opening price. Lifespan: 5 trading days. Strong [[Draw on Liquidity]].
- **NWOG (New Week Opening Gap)**: Gap between Friday 16:59 close and Sunday 18:00 opening price. Lifespan: 5 trading weeks.
- **Consequent Encroachment (CE)**: The exact 50% midpoint of any gap, wick, NDOG/NWOG, or [[Fair Value Gap]].
- **ORG (Opening Range Gap)**: The opening price range (9:30 AM - 10:00 AM EST). Quadrants (25%, 50%, 75%) act as major algorithmic key levels.
- **Draw on Liquidity (DOL)**: Where price is drawn towards (relative equal highs/lows, NDOG/NWOG clusters, or unmitigated inefficiencies).

---

## 📖 Lecture-by-Lecture Breakdowns

### Lecture #1 (August 5, 2024) — Foundations of the Algorithm & Draw on Liquidity
- **The Algorithm**: Price moves based on **time first**, then price. Every move is algorithmic. At **8:30 AM EST**, the algorithm spools towards liquidity or inefficiencies.
- **Draw on Liquidity (DOL)**: Scan 1m, 5m, and 15m charts to identify where price is "smooth" (Relative Equal Highs/Lows) vs "rough/jagged". Price gravitates toward smooth equal highs/lows to run stops.
- **Manual Intervention / News**: Avoid trading heavy news drivers like [[CPI]], [[FOMC]], or [[NFP]]. News creates unpredictable manual algorithmic intervention.
- **PD Arrays**: Introduction to [[Orderblock]] (Change in State of Delivery) and [[Breaker Block]].

### Lecture #2 (August 6, 2024) — Price Delivery Continuum & Time Framework
- **Price Delivery Continuum**: Use the 15-second chart to refine entries under the 1m timeframe.
- **Time Framework**:
  - Mark **7:00 AM EST** with a vertical line (ignore pre-7:00 AM London noise for this model).
  - Key 30-Minute Windows: **7:00-7:30 AM**, **8:00-8:30 AM**, and **9:00-9:30 AM**.
  - Look for a manipulation run on stops in one direction followed by sharp [[Displacement]] into the opposite direction.
- **Inversion FVG (IFVG)**: Look for an [[Inversion Fair Value Gap]] overlapping with a [[Breaker Block]]. Place stop loss at breaker high + 2 points.

### Lecture #3 (August 7, 2024) — NDOG, NWOG & Consequent Encroachment
- **[[NDOG]] (New Day Opening Gap)**: 16:59 to 18:00 EST. 5-day lifespan.
- **[[NWOG]] (New Week Opening Gap)**: Friday 16:59 to Sunday 18:00 EST. 5-week lifespan.
- **Consequent Encroachment (CE)**: 50% level of any gap, wick, or NDOG/NWOG.
- **Economic Calendar Strategy**: If NYAM session (8:30-11:00 AM) lacks high impact data, look for high-probability setups in the afternoon session starting at **1:30 PM EST**.

### Lecture #4 (August 8, 2024) — News Volatility & Determining DOL
- **News Release Dynamics**: At 8:30 AM news events, wait for the data release before executing.
- **Determining DOL**: Look for clusters of NDOG/NWOGs. Target "smooth" areas where liquidity is resting.

### Lecture #5 (August 9, 2024) — Asian Session & Standard Deviation Projections
- **Asian Session Window**: 7:00 PM to 9:00 PM EST. Build DOL around NDOG and liquidity pools.
- **Standard Deviation (STDV) Projections**: Measure the 0-1 impulse leg. Multiply by 2 for expansion targets. -1 STDEV represents the measured move for "low hanging fruit".

### Lecture #6 (August 12, 2024) — Risk Control & Partials Management
- **No-News Days**: Higher room for error. Avoid chasing big home runs.
- **Partials Pay**: Always take partial profits at key structural liquidity pools.

### Lecture #7 (August 13, 2024) — Silver Bullet & Institutional Order Flow Entry Drill (IOFED)
- **Silver Bullet Window**: **10:00 AM - 11:00 AM EST**. Provides high-probability entries following 8:30 AM news releases.
- **Institutional Order Flow Entry Drill (IOFED)**: Enter on the low of a BISI or high of a SIBI when higher timeframe (HTF) context and time align.

### Lecture #8 (August 14, 2024) — Wicks as Gaps, Market Maker Models & Turtle Soup
- **Wicks as Gaps**: Large news wicks act like FVGs. Watch the 50% CE level of the wick.
- **Market Maker Buy/Sell Model**:
  - Buyside Curve -> Smart Money Reversal (SMR) -> Sellside Curve.
- **[[Turtle Soup]]**: Selling above an old high or buying below an old low when HTF context supports a reversal.

### Lecture #9 (August 15, 2024) — Signatures of Delivery & Inverting FVGs
- **Change of State in Delivery (CSD)**: Inverting the FVG that was used to take out buy-stops confirms a true directional shift.

### Lecture #10 (August 16, 2024) — Opening Range Gap (ORG) Quadrants & Minimum Thresholds
- **ORG Quadrants**: Divide the 9:30-10:00 AM opening range into 4 quarters.
- **Minimum Profit Targets**:
  - ES: 5 handles minimum threshold off NDOG.
  - NQ: 15-20 handles minimum threshold off NDOG.

### Lecture #11 (August 19, 2024) — Reclaimed Fair Value Gaps & TGIF
- **Reclaimed FVG (Re-Claimed BISI/SIBI)**: Candles that re-touch a previously formed FVG and immediately expand in the intended direction.
- **20% TGIF Rule**: Friday expansion towards weekly targets.

### Lecture #12 (August 19, 2024) — OLHC / OHLC Intraday Expansion
- **Bullish OLHC**: Open, Low, High, Close structure on daily chart.
- **Bearish OHLC**: Open, High, Low, Close structure on daily chart.

### Lecture #13 (August 20, 2024) — Running Down Equity & Partial Taking
- **Running Down Equity**: Taking partials at short-term highs without moving stop loss prematurely. Protects trade against sudden reversals at 50% volume imbalance.

### Lecture #14 (August 22, 2024) — Rejection Blocks & Jackson Hole Event
- **[[Rejection Block]]**: The highest body (open or close) at a swing high. Reversals key off the body high, not just the wick tip.
- **Jackson Hole Symposium**: 3-day annual news event causing deep overlapping retracements. Keep trade parameters tight.

### Lecture #15 (August 23, 2024) — RTH Opening Range Gap & NY Session Review
- Mark the 9:30 - 10:00 AM Opening Range Gap high/low. These levels act as magnetic algorithmic anchor points.

### Lecture #16 (August 24, 2024) — Deeper Premium Arrays & Fed Speeches
- Evaluate Daily Volume Imbalances, Mean Threshold of [[Orderblock]], and Daily Rejection Blocks.

### Lecture #17 (August 26, 2024) — Event Horizon PD Array & Immediate Rebalance
- **Event Horizon**: Range between high of lower NDOG and low of upper NDOG.
- **Immediate Rebalance**: High-velocity price action leaving zero gap unfilled.

### Lecture #18 (August 27, 2024) — The Mohawk Pattern & Market Structure
- **Mohawk Pattern**: Price "colors outside the lines" with wick spikes above resistance while body closures respect the level.

### Lecture #19 (August 28, 2024) — PDH & PDL Algorithmic Reference Points
- **PDH (Previous Day High)** & **PDL (Previous Day Low)**: Primary liquidity pools used by the algorithm for turtle soups and expansions.

### Lecture #20 (August 29, 2024) — Targeting Old Daily Lows
- Executing trades targeting un-run daily lows with IOFED entries and partial scale-outs.

### Lecture #21 (August 30, 2024) — Holiday Weekend & Deep Premium Rules
- Avoid trading heavy on Fridays leading into holiday long weekends. Trade with strict risk control.

---

#ict #trading #liquidity #ndog #nwog #fvg #orderblock #breaker-block #turtle-soup #market-maker-model #discipline #risk-management
`;

const tags = ['ict', 'trading', 'liquidity', 'ndog', 'nwog', 'fvg', 'orderblock', 'breaker-block', 'turtle-soup', 'market-maker-model', 'discipline', 'risk-management'];

async function run() {
  console.log('Seeding ICT 2024 Mentorship Master Notes into SynapseVault MongoDB Atlas...');
  const doc = await seedVaultDocument({
    title,
    type: 'pdf',
    rawText,
    tags
  });

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
  console.log('Document ID:', doc.id);
  console.log('Title:', doc.title);
  console.log('Word Count:', doc.wordCount);
  console.log('Extracted Tags:', doc.tags);
  console.log('Extracted Wikilinks:', doc.wikilinks);

  const docs = await listVaultDocuments();
  console.log('\nCurrent Total Vault Documents in MongoDB Atlas:');
  docs.forEach((d, i) => console.log(`${i+1}. [${d.type}] ${d.title}`));
}

run().catch(console.error);
