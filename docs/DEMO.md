# Demo script

Two versions of the same story: the **6-minute walkthrough** for the room, and the **2-minute cut**
that gets recorded at 4:00 PM and submitted. Run both against the live site, with localhost open in
a second tab as a fallback.

## Before you start

- [ ] Open `/api/health` on the Render URL and wait for it to answer. The free tier sleeps, and a
      cold start takes about a minute. Do this ten minutes before the demo, not during it.
- [ ] Open the frontend. Durga is the default festival. Leave it there.
- [ ] Zoom the browser to 125% for the projector. Check the ranked list fits without scrolling.
- [ ] `LLM_PROVIDER=none` on the server, so the brief is the template and cannot fail live.
- [ ] Have a phone ready if anyone asks about mobile.

Deep links, if you would rather jump than click:

- Ranking: `#/ranking?festival=Durga`
- Bairagarh detail: `#/detail/Bairagarh%20(Sant%20Hirdaram)%20kund?festival=Durga`
- Brief: `#/brief?festival=Durga`
- Data and limits: `#/gaps?festival=Durga`

## The 6-minute walkthrough

**0:00 — The officer and the problem.** One slide or just talk over the ranking screen.

> A Bhopal Municipal Corporation officer has to decide, before Durga visarjan on 20 October, where
> to send cleaning, aeration and extra testing. The data exists: MPPCB tests every ghat three
> times each festival, before, during and a week after. It sits in ninety to a hundred and twenty
> page PDFs that nobody lines up against the legal limits. So the decision gets made from memory.
> Here is one number from those PDFs: dissolved oxygen read zero at Bairagarh kund.

**0:45 — The ranked list.** Point at the top line, not the whole screen.

> Seven ghats, ranked for Durga against CPCB Class B, the outdoor bathing standard. Bairagarh is
> first. The reason is in plain words underneath: DO 0 against a limit of 5, BOD 9.4 against a
> limit of 3. Beside it is a confidence badge, and Bairagarh's says Low, because the 2025 report
> has no Durga table for it. We rank it anyway and we say why we are unsure.

Scroll to the quadrant chart.

> This is the part we care about. Across is how polluted the water already was before anyone
> arrived. Up is how much immersion made it worse. Bairagarh is far to the right and low: the
> immersion is not the problem there, the water is already bad. That is a different instruction
> than a ghat sitting high up.

**1:45 — One ghat, with its source page.** Click Bairagarh.

> Before, during and a week after, for each year, against the limit line. The gaps are gaps, not
> zeros: where the report has no reading, the line breaks and the caption names what is missing.
> Scroll down and every single number is here with the report year and the PDF page it came from.
> Page 60 of the 2023 report. You can check us.

**2:45 — Impact and recovery.** Stay on the detail page, impact table.

> During minus before, and a week after minus before, with the raw values beside them so nobody
> reads a delta on its own. Bairagarh in 2024: BOD 6 before, 8 during, 8.2 a week later. Our
> scoring calls that recovery "good", and "good" here means only one thing — no worse than before
> immersion. It does not mean clean. 8.2 against a limit of 3 is still far above the limit, and
> the tool says exactly that, in the list, on this page and in the brief.

**3:45 — The gaps.** Open **Data and limits**.

> What we are not showing you. Units are not printed in the reports, so we assume the standard
> ones. Two ghats have no Durga 2025 table. Rani Kamlapati and Kamla Park may be two different
> places, so that ghat is capped at Medium confidence. Arch Bridge is on the 2026 news list and
> has no readings at all — it is listed as untested, and an untested ghat is never shown as a
> clean one. The 2026 list itself is from two newspapers, not a BMC order, and it is labelled that
> way everywhere it appears.

**4:30 — The brief.** Open **Brief**.

> This is what the officer actually forwards. Under 150 words, English and Hindi, and every number
> in it was computed by the scoring code and then checked against the computed data before it is
> shown. Each top ghat ends with one action: test, clear and aerate, or clean first. Switch to
> Hindi. Copy. It is plain text, so it goes into WhatsApp as it is.

> There is an optional step where a language model rephrases this. It only ever rephrases. It is
> handed the computed numbers, and if its text contains a number we did not compute, we throw it
> away and ship the template you are looking at. The demo runs with the model switched off.

**5:15 — Close.**

> What the officer can do this week: three ghats to look at first, one action each, and for
> Bairagarh and Malikhedi an extra test during immersion, because thin data is the real problem
> there. What this does not do: it does not forecast 20 October, it makes no health claim, and it
> has no data on the new ghats. Those are in the README too.

## The 2-minute cut (this is the one you record)

| Time | Screen | Say |
|---|---|---|
| 0:00 | Ranking | The officer, the PDFs, DO 0 at Bairagarh. One sentence each. |
| 0:25 | Ranking, top card | Rank 1, the plain-words reason, the Low confidence badge and why. |
| 0:45 | Quadrant chart | Already polluted versus made worse by immersion. Bairagarh is already bad. |
| 1:00 | Bairagarh detail | The phase chart with the limit line, a visible gap, then scroll to a source page. |
| 1:25 | Brief | 150 words, action per ghat, switch to Hindi, copy. |
| 1:45 | Data and limits | One line: here is everything we do not know, including a ghat with no data at all. |

Record it twice and keep the better take. Do not narrate the mouse.

## If something breaks

- API slow or down: the deployed frontend shows a plain message, not a blank screen. Switch to the
  localhost tab. If both are down, talk over the recording.
- A number looks wrong on screen: say so out loud and point at `docs/FACTCHECK.md`. Admitting an
  unverified number is worth more than hiding it.
- Someone asks for a number the tool does not have: "That is not in the data pack" is a complete
  answer. Do not estimate one.

## Questions to expect

- **Why Class B?** People stand in the water at an immersion ghat, so outdoor bathing is the
  closest published standard. It is a comparison, not a legal finding.
- **Is this a health warning?** No. We compare readings with a published limit and stop there.
- **Can you predict 20 October?** No. These are past readings, and the tool says so on every page.
- **Why is a ghat with no data not at the bottom of the list?** It is not in the list at all. It is
  in a separate "No data" section, because ranking it would mean scoring a gap.
- **What does the LLM do?** It rephrases computed numbers, nothing else, and the demo runs without
  it.
