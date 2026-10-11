"""Phrase tables for the bilingual brief. Data only, no logic.

Hindi reviewer: check all Hindi strings in this file.
All Hindi strings need review and sign-off before 3:00 PM.
"""

# ---------------------------------------------------------------------------
# Risk, confidence, quadrant, recovery phrases
#
# Quadrant and recovery come from scoring.py (see DECISIONS D-11, D-13):
#   already_bad           pre severity high, little rise during immersion
#   damaged_by_immersion  severity rises during immersion
#   both                  high before and rises during
#   stable                no clear rise during immersion (NOT "clean": readings
#                         can still breach limits, so never say "within limits")
#   recovery good         no worse after than before immersion (D-11). It is NOT "clean":
#                         build_facts splits it into good_above_limits / good_within_limits (D-15)
# ---------------------------------------------------------------------------

PHRASES_EN = {
    "risk": {"High": "High", "Medium": "Medium", "Low": "Low"},
    "confidence": {"High": "High", "Medium": "Medium", "Low": "Low"},
    "quadrant": {
        "already_bad": "Poor before immersion.",
        "damaged_by_immersion": "Worse during immersion.",
        "both": "Poor before, worse during.",
        "stable": "No clear rise during immersion.",
        "unknown": "Phases not comparable.",
    },
    "recovery": {
        "poor": "Still worse after.",
        "good": "No worse after than before.",
        "good_above_limits": "Still above limits after.",
        "good_within_limits": "Within limits after.",
        "unknown": "After: unknown.",
    },
    "missing": "not measured",
    "bdl": "below detection",
    "within": "DO, BOD, pH within limits",
}

PHRASES_HI = {
    "risk": {"High": "उच्च", "Medium": "मध्यम", "Low": "कम"},
    "confidence": {"High": "अधिक", "Medium": "मध्यम", "Low": "कम"},
    "quadrant": {
        "already_bad": "पहले से खराब।",
        "damaged_by_immersion": "विसर्जन में और खराब।",
        "both": "पहले से खराब, विसर्जन में और खराब।",
        "stable": "विसर्जन में खास बढ़त नहीं।",
        "unknown": "चरणों की तुलना संभव नहीं।",
    },
    "recovery": {
        "poor": "बाद में भी खराब।",
        "good": "बाद में पहले से बदतर नहीं।",
        "good_above_limits": "बाद में भी सीमा से ऊपर।",
        "good_within_limits": "बाद में सीमा के भीतर।",
        "unknown": "बाद का पता नहीं।",
    },
    "missing": "मापा नहीं गया",
    "bdl": "पता लगाने की सीमा से कम",
    "within": "DO, BOD, pH सीमा के भीतर",
}

# ---------------------------------------------------------------------------
# Site names (Hindi) — reviewer: verify transliterations
# ---------------------------------------------------------------------------

SITE_HI = {
    "Bairagarh (Sant Hirdaram) kund": "बैरागढ़ (संत हिरदाराम) कुंड",
    "Malikhedi kund": "मालीखेड़ी कुंड",
    "Prempura ghat": "प्रेमपुरा घाट",
    "Khatlapura ghat": "खटलापुरा घाट",
    "Hathaikheda dam / kund": "हथाईखेड़ा डैम / कुंड",
    "Rani Kamlapati ghat / Kamla Park kund": "रानी कमलापति घाट / कमला पार्क कुंड",
    "Shahpura lake ghat": "शाहपुरा झील घाट",
    "Arch Bridge ghat": "आर्च ब्रिज घाट",
}

# ---------------------------------------------------------------------------
# Confidence reason translations.
# (regex on the English reason from scoring.confidence, Hindi template).
# First match wins, so specific patterns come first. Named groups are
# substituted into the template; {festival} is mapped through FESTIVAL_HI_SHORT.
# Unknown reasons fall back to REASON_HI_FALLBACK.
# ---------------------------------------------------------------------------

REASON_HI = [
    (r"No (?P<festival>Durga|Ganesh) (?P<year>\d{4}) data", "{festival} {year} का डेटा नहीं"),
    (r"Only 'during' phase data in (?P<year>\d{4})", "{year} में केवल विसर्जन के दौरान का डेटा"),
    (r"Missing .* phase\(s\) in (?P<year>\d{4})", "{year} में कुछ चरण नहीं मापे गए"),
    (r"No (?:Dissolved oxygen|BOD|pH) data in (?P<year>\d{4})", "{year} में कुछ मापदंड नहीं मापे गए"),
    (r"Missing .* in (?P<year>\d{4})", "{year} में कुछ रीडिंग नहीं"),
    (r"Only one year of data", "केवल एक वर्ष का डेटा"),
    (r"Site name match confidence is medium", "स्थान एक है या दो, पक्का नहीं"),
]

REASON_HI_FALLBACK = "कुछ डेटा उपलब्ध नहीं"

# ---------------------------------------------------------------------------
# Festival names in Hindi
# ---------------------------------------------------------------------------

FESTIVAL_HI = {
    "Durga": "दुर्गा विसर्जन",
    "Ganesh": "गणेश विसर्जन",
}

FESTIVAL_HI_SHORT = {
    "Durga": "दुर्गा",
    "Ganesh": "गणेश",
}

# ---------------------------------------------------------------------------
# Footer (appended by code after validation; never sent to or written by LLM)
# ---------------------------------------------------------------------------

FOOTER_EN = (
    "Past readings only, not a forecast for 20 Oct. "
    "Readings are compared with limits; this is not a health assessment. "
    "Source pages are in the tool."
)

FOOTER_HI = (
    "केवल पिछली रीडिंग, 20 अक्टूबर का पूर्वानुमान नहीं। "
    "रीडिंग की तुलना सीमा से है; यह स्वास्थ्य आकलन नहीं है। "
    "स्रोत पृष्ठ टूल में हैं।"
)

# ---------------------------------------------------------------------------
# LLM system prompt (Groq, open-weight model)
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You rewrite a short water-quality brief for a Bhopal Municipal Corporation officer planning immersion (visarjan) at ghats.
You receive FACTS as JSON, computed from MPPCB readings compared with CPCB Class B limits. Write two versions: English, and Hindi in Devanagari.

Rules:
- Use only numbers that appear in FACTS, written exactly as given, as digits. Do not round, add, average, compare or compute anything. No percentages. No number words.
- Do not mention health, disease, illness, toxicity, danger, or whether water is safe. Only say how readings compare with the limits.
- List every ghat in FACTS.top in rank order, using its exact site name, with its risk level and its worst DO, BOD and pH readings with the year.
- A null reading means "not measured". status "below_detection" means "below detection", never zero. Never describe missing data as clean or normal.
- Quadrant meanings: already_bad = poor before immersion; damaged_by_immersion = worse during immersion; both = poor before and worse during; stable = no clear rise during immersion (it does NOT mean within limits); unknown = phases not comparable.
- Recovery meanings: good_above_limits = no worse after than before immersion but still above the limits; good_within_limits = within limits after; poor = still worse after; unknown = not measured. Never say "recovered", "improved" or "clean".
- When a ghat's confidence is not High, say so with the reason.
- Name every site in FACTS.no_data_sites as "no data, test before use".
- In Hindi use the site names given in FACTS.site_names_hi exactly.
- Keep each version under 100 words. Plain text with line breaks, no markdown, no emoji.
- Do not add a disclaimer; one is appended later.

Return only JSON: {"en": "...", "hi": "..."}"""
