# ICT 2024 Mentorship Master Notes (Lectures 1-21)
*Lectures by @TheInnerCircleTrader (ICT) — Notes by GatieTrades*

---

## 📌 Executive Summary & Key Algorithmic Reference Points

This document captures the complete 21-lecture **ICT 2024 Mentorship** curriculum compiled by GatieTrades. The framework covers the mechanics of the Interbank Price Delivery Algorithm (IPDA), market structure, time-and-price theory, and precision execution rules.

### Core Reference Levels:
- **NDOG (New Day Opening Gap)**: The price gap between the 16:59 EST settlement close and the 18:00 EST opening price of the next trading session. Has an algorithmic lifespan of **5 trading days**. Functions as a high-probability [[Draw on Liquidity]].
- **NWOG (New Week Opening Gap)**: The price gap between Friday's 16:59 EST close and Sunday's 18:00 EST opening price. Has a lifespan of **5 trading weeks**.
- **Consequent Encroachment (CE)**: The exact 50% midpoint of any gap, wick, NDOG/NWOG, or [[Fair Value Gap]].
- **Opening Range Gap (ORG)**: The opening price range between 9:30 AM and 10:00 AM EST. Quadrants (25%, 50%, 75%) provide key algorithmic anchor levels.
- **Draw on Liquidity (DOL)**: Where the market algorithm is drawn to reprice (e.g. relative equal highs/lows, NDOG/NWOG clusters, or unmitigated inefficiencies).

---

## 📖 Comprehensive Lecture-by-Lecture Breakdown

### Lecture #1 (August 5, 2024) — Foundations of the Algorithm & Draw on Liquidity
- **The Algorithm**: Price delivery is governed by **time first**, then price. Every move is coded by the algorithm. At **8:30 AM EST**, the algorithm spools toward liquidity or inefficiencies (or both).
- **Draw on Liquidity (DOL)**:
  - Focus on the 1-minute, 5-minute, and 15-minute timeframes.
  - Scan for areas of **smoothness** (Relative Equal Highs/Lows) vs **roughness**.
  - Market algorithm seeks smoothness at the top/bottom to run stop loss orders resting beyond those levels.
- **Manual Intervention**: News events such as [[CPI]], [[FOMC]], and [[NFP]] represent non-tradeable manual intervention. Do not attempt to trade during these releases.
- **PD Arrays**: Introduction to [[Orderblock]] (Change in State of Delivery) and [[Breaker Block]].

---

### Lecture #2 (August 6, 2024) — Price Delivery Continuum & Time Framework
- **Price Delivery Continuum**: Use the 15-second chart to look for entries under the 1m timeframe for extreme precision and minimal risk.
- **Time Framework**:
  - Mark **7:00 AM EST** with a vertical line (ignore London session noise before 7:00 AM).
  - Key 30-minute observation windows: **7:00 - 7:30 AM**, **8:00 - 8:30 AM**, and **9:00 - 9:30 AM**.
  - Expect manipulation (run on stops) in one direction, followed by strong [[Displacement]] back into the range.
- **Inversion FVG (IFVG)**: Look for an [[Inversion Fair Value Gap]] overlapping with a [[Breaker Block]]. Stop loss is set at the breaker high + 2 points.

---

### Lecture #3 (August 7, 2024) — NDOG, NWOG & Consequent Encroachment
- **[[NDOG]] (New Day Opening Gap)**: 16:59 to 18:00 EST gap (5-day lifespan).
- **[[NWOG]] (New Week Opening Gap)**: Friday 16:59 to Sunday 18:00 EST gap (5-week lifespan).
- **Consequent Encroachment**: The 50% midpoint of gaps, volume imbalances, NDOG/NWOG, and wicks.
- **Economic Calendar & Timing**: If there is medium/high impact news absent in the NYAM session (8:30 AM), look to trade the afternoon session starting at **1:30 PM EST**.

---

### Lecture #4 (August 8, 2024) — News Volatility & Determining DOL
- **News Timing**: At 8:30 AM news releases, wait for data release prior to trading. News injects aggressive volatility.
- **Determining DOL**: Look at clusters of NDOG/NWOG levels. Direction is favored toward smooth liquidity targets and away from rough/jagged price action.

---

### Lecture #5 (August 9, 2024) — Asian Session & Standard Deviation Projections
- **Asian Session Window**: 7:00 PM to 9:00 PM EST. Build draw on liquidity around Asian highs/lows and NDOG levels.
- **Standard Deviation (STDV) Projections**: Measure the 0-1 impulse leg. Multiply by 2 for expansion targets. The **-1 STDEV** level represents the measured move for low-hanging fruit profit targets.

---

### Lecture #6 (August 12, 2024) — Pre-Market Price Review & Partials Protocol
- **No-News Days**: Yield more opportunities for mistakes and errors.
- **Trade Management Rules**:
  - Accept that you can be wrong and minimize risk.
  - Do not swing for big home runs; take profit systematically.
  - **Partials Pay**: Scaling out secures gains and removes psychological anxiety.

---

### Lecture #7 (August 13, 2024) — Silver Bullet & Institutional Order Flow Entry Drill (IOFED)
- **Silver Bullet Window**: **10:00 AM - 11:00 AM EST**. The best setups form in this window following high-impact 8:30 AM news releases (NFP, PPI, CPI, PMI).
- **Institutional Order Flow Entry Drill (IOFED)**: Enter on the low of a BISI (Buyside Imbalance Sellside Efficiency) or high of a SIBI (Sellside Imbalance Buyside Efficiency) when higher timeframe (HTF) context and time align.

---

### Lecture #8 (August 14, 2024) — Wicks as Gaps, Market Maker Models & Turtle Soup
- **Using Wicks as a Gap**: Long news wicks act like FVGs. Watch price reaction at the 50% CE level of the wick.
- **Market Maker Buy/Sell Model**:
  - Buyside Curve -> [[Smart Money Reversal]] (SMR) -> Sellside Curve.
  - Entry confluences occur when PD arrays from the buyside curve overlap with new PD arrays on the sellside curve.
- **[[Turtle Soup]]**: Selling above an old high or buying below an old low when market narrative supports a reversal.

---

### Lecture #9 (August 15, 2024) — Signatures of Price Delivery & Inverting FVGs
- **Signatures of Intent**: Key signature is inverting the [[Fair Value Gap]] used to take out buy-stops (Change in State of Delivery). If price fails to displace and respects the ORG High, stay patient and wait for confirmation.

---

### Lecture #10 (August 16, 2024) — Opening Range Gap Quadrants & Target Thresholds
- **ORG Quadrants**: Divide the 9:30 - 10:00 AM opening range into 4 quarters.
- **Minimum Handle Thresholds**:
  - ES: 5 handles minimum off NDOG.
  - NQ: 15 to 20 handles minimum off NDOG.
- **Framing a Trade**: Look for Rejection of NDOG, IFVG, SIBI, OB, and news wick confluences.

---

### Lecture #11 (August 19, 2024) — Reclaimed Fair Value Gaps & TGIF Model
- **Reclaimed FVG (Re-Claimed BISI/SIBI)**: Note the candle that leaves the FVG and the candle that re-touches the reclaimed FVG to rally aggressively.
- **20% TGIF Rule**: Note choppiness after reaching 20% TGIF targets.

---

### Lecture #12 (August 19, 2024) — OLHC / OHLC Daily Bar Mechanics
- **Bullish OLHC**: Open, Low, High, Close daily bar delivery. Scan intraday charts for the low of the day forming during the morning window.
- **Bearish OHLC**: Open, High, Low, Close daily bar delivery.

---

### Lecture #13 (August 20, 2024) — Running Down Equity & Partials Protocol
- **Running Down Equity**: Taking partials at short-term broken highs while leaving the stop loss in place.
- **Volume Imbalance Partials**: Take partials at the 50% level of daily volume imbalances.

---

### Lecture #14 (August 22, 2024) — Rejection Blocks & Jackson Hole Event Rules
- **[[Rejection Block]]**: A reversal pattern forming at a swing high/low. Defined by the highest body (open or close) at the swing high. Price should NOT tap beyond the rejection block if a CISD/OB is active.
- **Jackson Hole Symposium**: 3-day annual news event characterized by heavy overlapping, choppy ranges, and deep retracements. Keep trade parameters tight and take partials quickly.

---

### Lecture #15 (August 23, 2024) — RTH Opening Range Gap & NY Session Mechanics
- **Opening Range High/Low (9:30 - 10:00 AM)**: Key reference levels that the algorithm WILL refer to during the NY session.

---

### Lecture #16 (August 24, 2024) — Premium Array Confluences & Powell Speeches
- Evaluate Daily Volume Imbalances, Mean Threshold of [[Orderblock]], Daily Rejection Block, and Premium Wicks prior to major Fed speeches.

---

### Lecture #17 (August 26, 2024) — Event Horizon PD Array & Immediate Rebalance
- **Event Horizon**: Range calculated from the high of the NDOG below to the low of the NDOG above. Mark quarters (25%, 50%, 75%).
- **Immediate Rebalance**: Rapid price action filling a gap instantly within 1-2 candles, signaling high institutional urgency.

---

### Lecture #18 (August 27, 2024) — The Mohawk Pattern & Trade Execution
- **Mohawk Pattern**: Price wicks "outside the lines" of a level while body closures stay strictly within limits. Validates the setup despite wick spikes.

---

### Lecture #19 (August 28, 2024) — PDH & PDL Algorithmic Reference Points
- **PDH (Previous Day High)** & **PDL (Previous Day Low)**: Core algorithmic anchor points that remain valid for drawing on liquidity and turtle soups even after being breached.

---

### Lecture #20 (August 29, 2024) — Targeting Old Daily Lows & IOFED
- Execution breakdown targeting old daily lows using IOFED entries and partial scale-outs.

---

### Lecture #21 (August 30, 2024) — Holiday Weekend Trading & Deep Premium Rules
- Avoid heavy position sizing on Fridays before holiday weekends. Respect old PDH/PDL reference points.

---

#ict #trading #liquidity #ndog #nwog #fvg #orderblock #breaker-block #turtle-soup #market-maker-model #discipline #risk-management
