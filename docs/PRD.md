# PRD: Visarjan Ghat Watch

Status: v0.1, 11 Oct 2026 · Track 2, Claude Impact Lab x Cerebras, Bhopal · Deadline: 5:00 PM same day

## 1. Summary
A tool that gives a Bhopal Municipal Corporation (BMC) officer, before Durga visarjan on 20 Oct 2026, a ranked list of immersion ghats by water-quality risk. Each rank has a plain-words reason, every number traces to its MPPCB report and page, and a short Hindi and English brief can be forwarded.

## 2. Problem
MPPCB tests ghat water three times each festival (pre, during, after immersion). Results sit in 90 to 120 page PDFs that nobody lines up against legal limits or compares across years. The officer who decides where to send cleaning, aeration and extra testing decides from memory.

Evidence in the data (2023 to 2025, Bhopal ghats): 42 of 116 dissolved-oxygen readings are below 5 mg/l, and 100 of 112 BOD readings are above 3 mg/l. Bairagarh kund read DO 0 mg/l four times.

## 3. User and workflow
**User:** the BMC officer who plans Durga visarjan at the ghats.
**Workflow (one):** open the tool, see which ghats need attention and why, check the numbers behind a rank, forward a brief.
**Outcome:** the officer decides where to send cleaning, aeration and testing using data, and can show the reasoning.

## 4. Goals
- G1. Rank ghats by risk against CPCB Class B limits, with reasons in plain words.
- G2. Separate baseline pollution from immersion damage and recovery (our differentiator).
- G3. Make every number traceable to report, page and row.
- G4. Show missing data as missing and state confidence for each ghat.
- G5. Produce a short, forwardable brief in Hindi and English.

## 5. Non-goals
- No health-effect claims. We report readings against limits only.
- No forecast of 20 Oct water quality. Past readings only.
- No portal, login, accounts, or live government systems.
- No new data collection and no personal data.
- No ML model. Scoring is transparent and rule-based.

## 6. Data rules (must hold everywhere)
| Rule | Detail |
|---|---|
| Missing is not clean | Blank, `not sampled`, `*`, `**` are missing. Never scored as passing. |
| BDL is not zero | `BDL` and `ND` are very low, kept as `below_detection`, not missing and not 0. |
| Units | The reports print none. The data pack states standard assumed units. Disclose in the UI and README. |
| Limits | CPCB Class B (outdoor bathing): DO >= 5 mg/l, BOD <= 3 mg/l, pH 6.5 to 8.5. Other parameters are context only. |
| Festivals | Durga and Ganesh are never pooled. Durga is the default view. |
| Known gaps | Bairagarh and Malikhedi have no Durga 2025 table, and their Ganesh 2025 data has `during` only. Suspended solids are missing in Durga 2023 and 2025. Rani Kamlapati / Kamla Park may be two places (`medium` confidence). Only 4 metals were tested. |

## 7. Functional requirements
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-1 | Load and classify readings | Every row has status `measured`, `below_detection` or `missing`. Golden tests reproduce 1,524 rows, 42/116 DO, 100/112 BOD. |
| FR-2 | Per-ghat risk score per festival | Uses DO, BOD, pH vs Class B. Formula visible in the UI. Missing values never reduce risk. |
| FR-3 | Ranked list | Rank, ghat, risk level, one-line reason, confidence badge. Durga default, Ganesh toggle. |
| FR-4 | Immersion impact and recovery | `during` minus `pre` and `after` minus `pre`, only where both values exist. Otherwise "unknown", never 0. Raw before and after values shown beside each delta. |
| FR-5 | Confidence per ghat | High, Medium or Low with reasons (missing phases, missing table, site match). |
| FR-6 | Ghat detail | Readings by phase and year against limits, trend, and `source_page` for every value. |
| FR-7 | Bilingual brief | Short Hindi and English text, copy and print. LLM rephrases computed numbers only. Template fallback works with no API. |
| FR-8 | Gaps and limits panel | Lists data gaps, assumptions, and what the tool does not cover. |
| FR-9 | 2026 context | Show whether a ghat is on the BMC 2026 list (`data/ghat_meta.json`, marked unverified) and show Arch Bridge as "no baseline, test before use". |
| FR-10 | Test priority (stretch) | Risk times data gap, so thinly sampled ghats rise to "test first". |
| FR-11 | Robustness toggle (stretch) | Re-rank under alternative limits and missing-value treatments. Show whether the top 3 holds. |

## 8. Non-functional requirements
- Runs locally in 5 steps or fewer. Public repo, MIT license, no secrets committed.
- Works without any LLM key (template brief). LLM failure never breaks the demo.
- Mobile-readable. Keyboard focus visible. Reduced motion respected.
- API responses under 1 second on the cached dataset.

## 9. Success criteria (jury)
1. Ranking traceable to readings and CPCB limits.
2. Missing data shown as missing, never clean.
3. Brief short and readable in Hindi and English.
4. Honest about what the data does not cover.
Scoring: day-one impact (x2), product, idea, demo clarity. Max 25.

## 10. Risks
| Risk | Mitigation |
|---|---|
| NGT lake ban changes which ghats are used | Working list in `ghat_meta.json`, marked unverified. Ask mentor. Frame as past readings. |
| Thin Durga data (few readings per ghat) | Show raw values beside deltas. Call impact indicative, not statistical. |
| Kamla Park may be two places | Cap its confidence at Medium and flag it. |
| LLM invents numbers | LLM gets computed JSON only. Template fallback. Fact-check against PDFs. |
| Hindi brief errors | A Hindi speaker reviews before freeze. |
| Live demo fails | Record the demo at 4:00 PM. Keep a deployed fallback. |
| Time | Feature freeze 3:45 PM. Stretch items only after the core is done. |

## 11. Open questions for the mentor
1. Which ghats will be used on 20 Oct after the NGT ban, and do the new BMC ghats have data?
2. Is the output a ranking of past risk, or guidance for 20 Oct?
3. Is CPCB Class B the expected reference?
4. Is Rani Kamlapati / Kamla Park one site or two?
5. What actions can the officer take (aeration, cleaning, testing, allocation)?
6. Preferred brief format (WhatsApp text, one-pager)?
7. Is a live link required or is a repo plus run steps enough?

## 12. Milestones (11 Oct)
10:15 start · 11:00 data cleaning and golden tests · 1:00 scoring and UI skeleton · 3:00 impact, detail page, brief · 3:45 freeze · 4:00 record demo · 4:30 submit · 5:00 deadline.
