export const GHAT_META = {
  note: "Working assumptions from news reports (Free Press Journal 26 Feb 2026 and Hitavada 26 Feb 2026). Unverified BMC working list; past historical MPPCB monitoring.",
  ghats: {
    "Bairagarh (Sant Hirdaram) kund": {
      bmc_list_2026: "listed",
      water_body: "Upper Lake",
      site_match_confidence: "high",
      description: "Dedicated immersion kund excavated at the western shore of Upper Lake in Bairagarh (Sant Hirdaram Nagar).",
      notes: "No Durga 2025 table in MPPCB report; Ganesh 2025 has during-phase only. Severe baseline hypoxia observed historically."
    },
    "Malikhedi kund": {
      bmc_list_2026: "listed",
      water_body: "Kund",
      site_match_confidence: "high",
      description: "Artificial immersion kund in eastern Bhopal designed to buffer local stream and lake bodies.",
      notes: "No Durga 2025 table in MPPCB report; Ganesh 2025 has during-phase only."
    },
    "Prempura ghat": {
      bmc_list_2026: "listed",
      water_body: "Upper Lake",
      site_match_confidence: "high",
      description: "Major historical immersion ghat on the southern edge of Upper Lake (Bhojtal) with formal concrete ramp.",
      notes: "Full 3-year record available across pre, during, and after phases."
    },
    "Khatlapura ghat": {
      bmc_list_2026: "listed",
      water_body: "Lower Lake",
      site_match_confidence: "high",
      description: "Primary immersion ghat on Lower Lake near Jahangirabad with extensive urban catchment.",
      notes: "Consistent multi-year monitoring with high organic loading and low dissolved oxygen."
    },
    "Hathaikheda dam / kund": {
      bmc_list_2026: "listed",
      water_body: "Hathaikheda dam",
      site_match_confidence: "high",
      description: "Immersion kund and reservoir embankment on the eastern outskirts of Bhopal.",
      notes: "Relatively stable baseline with noticeable during-phase organic spikes."
    },
    "Rani Kamlapati ghat / Kamla Park kund": {
      bmc_list_2026: "not_listed",
      water_body: "Lower Lake",
      site_match_confidence: "medium",
      description: "Lower Lake embankment near historic Kamla Park and Rani Kamlapati palace.",
      notes: "Site match confidence capped at Medium: Ganesh tables refer to 'Kamla Park kund' while Durga tables refer to 'Lower Lake ghat'. May represent two adjoining sampling spots."
    },
    "Shahpura lake ghat": {
      bmc_list_2026: "not_listed",
      water_body: "Shahpura Lake",
      site_match_confidence: "high",
      description: "Urban lake ghat in South Bhopal residential and commercial hub.",
      notes: "Elevated baseline BOD reflecting urban runoff and stormwater inflow."
    }
  },
  no_data_sites: [
    {
      name: "Arch Bridge ghat",
      water_body: "Upper Lake",
      bmc_list_2026: "listed",
      site_match_confidence: "no_data",
      note: "Listed in BMC 2026 public announcements per news reports, but completely absent from MPPCB historical data pack. Marked as 'No baseline, test before use'."
    }
  ]
};

export const CPCB_LIMITS = {
  "Dissolved oxygen": { min: 5.0, unit: "mg/l", standard: "CPCB Class B (Outdoor Bathing)", desc: "Essential for aquatic life; lower values indicate severe asphyxiation risk." },
  "BOD": { max: 3.0, unit: "mg/l", standard: "CPCB Class B (Outdoor Bathing)", desc: "Biochemical oxygen demand; higher values indicate organic decomposition load." },
  "pH": { min: 6.5, max: 8.5, unit: "pH units", standard: "CPCB Class B (Outdoor Bathing)", desc: "Measure of acidity or alkalinity; standard range 6.5 to 8.5." }
};

export const CONTEXT_PARAMETERS = [
  "COD", "Total solids", "Dissolved solids", "Suspended solids", "Turbidity",
  "Conductivity", "Chromium", "Lead", "Zinc", "Copper"
];
