# The Authority Audit

## *The 5-minute diagnostic for experts who want to earn more & work less*

### AI Consultant Build Brief — Version 3.0 (Final)

**Client:** Authority.io (Sunny D Entertainment Ltd.) **Supersedes:** All previous versions (v1.0, v2.0, Final v2)

---

## 1\. Overview

Build an interactive, AI-powered lead magnet called **The Authority Audit** — *The 5-minute diagnostic for experts who want to earn more & work less.*

A single-page web application (embeddable as iframe or standalone hosted page) with the following sequential experience:

**The complete user journey:**

1. **Quiz** — 5-step income ceiling diagnostic (rate, hours, goal, model, profession)  
2. **Email gate** — hard gate: personalized dashboard and blueprint is locked until name \+ email submitted  
3. **Results dashboard** — personalised income ceiling stats, gap visual, leverage score  
4. **Blueprint** — AI-generated personalised 4 C's scalable asset blueprint (generates after email submitted)  
5. **Next steps \+ CTA** — action overview \+ book a complimentary consultation button

---

## 2\. Brand Guidelines

| Attribute | Spec |
| :---- | :---- |
| Primary gold | `#B4882A` |
| Dark accent | `#1a1a1a` |
| Light gold fill | `#FAEEDA` (pills, callouts, gates, focus rings) |
| Gold text on light | `#633806` |
| Deep gold text | `#854F0B` |
| Danger/red | `#A32D2D` |
| Success/green | `#3B6D11` |
| Background | Clean white / off-white surfaces |
| Typography | Clean sans-serif (Inter or similar), weights 400 and 500 only |
| Voice | Grounded, not flashy. Honest, not harsh. Smart, not complicated. |
| Audience | Experienced professionals and operators — not beginners |

---

## 3\. Tool 1 — Income Ceiling Calculator (Steps 1–5)

### 3.1 Progress indicator

6 segments (5 quiz steps \+ 1 for email/blueprint unlock), filled gold as completed.

### 3.2 Opening screen (Step 1\)

Display before the first question:

- Logo: "authority.io" in small gold caps  
- Title: "The Authority Audit" in large type  
- Tagline: *"The 5-minute diagnostic for experts who want to earn more & work less"* in italics  
- Subheading: "Answer 5 quick questions to see your exact income ceiling. Then unlock your personalised scalable asset blueprint — free."

### 3.3 Steps

**Step 1 — Hourly/session rate**

- "What do you charge per hour or session?"  
- Subcopy: "Use your effective rate — total revenue ÷ total hours worked."  
- Input: Currency field `$`, validation: required \> 0, Enter key advances

**Step 2 — Weekly delivery hours**

- "How many client-facing hours do you work per week?"  
- Subcopy: "Include delivery, consulting, coaching — not admin or marketing."  
- 4 tiles: Under 10 hrs (10) / 10–20 hrs (20) / 20–35 hrs (30) / 35+ hrs (40)

**Step 3 — Income goal**

- "What's your annual income goal?"  
- Subcopy: "The number that would genuinely change how you operate."  
- Input: Currency field `$`, validation: required \> 0

**Step 4 — Current business model**

- "What best describes your current model?"  
- Subcopy: "Be honest — this determines your leverage score."  
- 4 tiles: 100% 1:1 clients (0) / Mostly 1:1, some group (25) / Mix of 1:1 and programs (50) / Programs \+ some 1:1 (75)

**Step 5 — Profession**

- "What's your profession or area of expertise?"  
- Subcopy: "Be specific — this is what your scalable asset will be built around."  
- Free-text input, min 3 chars  
- Helper chips: Executive leadership coach / Functional medicine doctor / Divorce attorney / Financial planner for physicians  
- CTA: "See my results →"

### 3.4 Calculations

```
WEEKS = 48
INCOME_CEILING = rate × hours × WEEKS
GAP = MAX(0, goal - INCOME_CEILING)
TIME_LOCKED_PCT = 100 - leverageScore
HOURS_NEEDED = ROUND(goal / (rate × WEEKS))
WORTH_PER_HR = ROUND(goal / (hours × WEEKS))
RECLAIM_HRS = MAX(2, hours - ROUND(hours × 0.25))
```

---

| Score | Fill | Text | Copy |
| :---- | :---- | :---- | :---- |
| 0 | `#FCEBEB` | `#A32D2D` | "Fully time-locked. Every dollar requires your presence. One slow month and the whole thing stops." |
| 25 | `#FAEEDA` | `#854F0B` | "Mostly time-locked. You've started the shift, but most of your income still depends on your hours." |
| 50 | `#E1F5EE` | `#0F6E56` | "Balanced. Half your income has leverage. The other half is a ceiling waiting to press down on you." |
| 75 | `#E6F1FB` | `#185FA5` | "Good leverage. Most income doesn't require your direct time — now it's about compounding what's working." |

---

## 4\. Email Gate (Hard Gate)

**Position:** Immediately below the insight callout, before the blueprint.

**The blueprint does not generate or display until email is submitted.** This is a hard gate.

### 4.1 Gate design

- Gold border (1.5px `#B4882A`), rounded corners, white background card  
- Unlock icon (🔓 or equivalent)  
- Heading: "Unlock your personalised scalable asset blueprint"  
- Subheading: "Enter your details below and we'll generate your custom blueprint — showing exactly how your expertise becomes a scalable asset — plus a downloadable PDF of your full report."  
- Two fields side by side: First name / Email address  
- Button (gold background `#B4882A`, white text): "Unlock my blueprint →"  
- Privacy note: "No spam. Unsubscribe anytime."

### 4.2 On submit

- Validate: both fields required, email must contain @  
- POST to email platform webhook — **endpoint to be provided by client** (Mailchimp / ConvertKit / ActiveCampaign)  
- Payload: first name, email, profession, income ceiling, goal, gap, leverage score, time-locked %, hours needed, worth per hr, reclaim hrs  
- Hide the gate  
- Show blueprint section  
- Fire AI blueprint generation immediately  
- Mark 6th progress segment as complete

### 4.3 Validation error handling

If fields are incomplete, show inline message on the button: "Please enter your name and a valid email →" — revert after 2 seconds.

---

## 5\. Results Dashboard

Shown immediately after Step 5\. Email gate appears below the results.

### 5.1 Top 2 metric cards (2-column grid)

1. "Your income ceiling" — INCOME\_CEILING — red `#A32D2D`  
2. "Your income goal" — goal — neutral

### 5.2 Three insight stats (3-column grid)

| Stat label | Value | Sub-label |
| :---- | :---- | :---- |
| Hours to hit your goal | HOURS\_NEEDED hrs/wk | If \> hours: "That's X more hours than you currently work — every single week" / If ≤ hours: "Nearly your full current load, with zero room to grow" |
| What your time is actually worth | WORTH\_PER\_HR/hr | "per hour at your goal — vs your current $\[rate\]/hr" |
| Hours you could reclaim | RECLAIM\_HRS hrs/wk | "per week with a scalable asset doing the work" |

### 5.3 Gap visual

Two-point track showing current ceiling vs income goal:

- Red fill \+ red dot marker \= current ceiling  
- Dark ghost fill \+ dark dot marker \= income goal  
- Labels below: "Current ceiling: $X" / "Income goal: $X"  
- Gap amount box: "Gap your current model can never close" \+ dynamic subtext \+ gold amount  
- Animate on load (transition: width 1s ease)

### 5.4 Leverage score block

Circular badge (0, 25, 50, 75\) with one-sentence interpretation:

### 5.5 Insight callout

Gold left-border box (`#B4882A`, 3px, background `#FAEEDA`). Dynamic copy tying together WORTH\_PER\_HR, RECLAIM\_HRS, and the gap. Bridges the diagnosis into the gate.

## 6\. AI Blueprint Generator

### 6.1 Loading state

While API call processes, show gold spinner \+ rotating messages (2.2s intervals):

- "Analysing your expertise..."  
- "Mapping your process to the 4 C's..."  
- "Building your value-based pricing..."  
- "Calculating your week comparison..."  
- "Finalising your blueprint..."

### 6.2 API configuration

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1800,
    messages: [{ role: "user", content: buildPrompt(inputs) }]
  })
});
```

API key via server-side proxy only. Never in client-side JS.

### 6.3 Prompt template

```
You are a business strategist for Authority.io. Model: 4 C's — Curriculum, Coaching,
Community — validated via a one-time live POP (Prototype of Program), then evergreen.

CRITICAL RULES:
- No mention of building a second program
- No mention of keeping 1:1 clients — the program replaces 1:1 work entirely
- No time-bound language
- Program is evergreen after the POP
- No mention of sales calls
- Philosophy: Mastery → Method → Mentorship

Value-based pricing: price = 0.5%–5% of (annual cost of problem × years struggling).

Profession: "{profession}"
Current rate: ${rate}/hr | Weekly hours: {hours} | Ceiling: ${ceiling}
Goal: ${goal} | Gap: ${gap} | Time-locked: {locked}%
Hrs needed: {hrsNeeded}/wk | Time worth: ${worthPerHr}/hr | Reclaim: {reclaimHrs} hrs/wk

VOICE: Grounded mentor. Every sentence specific to their profession. No hype. No "passive income."

Return ONLY valid JSON, no markdown:

{
  "headline": "12-15 words specific to profession naming the shift from time-locked to scalable",
  "summary": "2-3 sentences referencing their ${worthPerHr}/hr time value and {reclaimHrs} hrs/wk reclaim. Specific to profession.",
  "fourCs": {
    "curriculum": "2 sentences — 1:1 process as curriculum, specific methodology named.",
    "coaching": "2 sentences — group coaching replacing 1:1 entirely.",
    "community": "2 sentences — peer community for their client type.",
    "pop": "2 sentences — one-time live POP before going evergreen. No future programs."
  },
  "assetName": "1-2 sentences — specific scalable asset. No time duration. No 1:1.",
  "clientSize": "e.g. '15–20 founding clients'",
  "weekComparison": {
    "nowSessions": "current weekly 1:1 hours",
    "nowAdmin": "estimated admin hrs/wk",
    "nowMktg": "estimated marketing hrs/wk",
    "nowIncome": "weekly income at ceiling",
    "afterCalls": "group coaching hrs/wk",
    "afterDelivery": "program delivery + async hrs/wk",
    "afterIncome": "estimated weekly program income at scale",
    "afterStop": "Continues earning",
    "note": "2 sentences on weekly shift referencing {reclaimHrs} reclaimed hours."
  },
  "mastery": {"title": "5 words max", "body": "2 sentences on specific expertise."},
  "method": {"title": "5 words max", "body": "2 sentences on 1:1 process becoming curriculum."},
  "mentorship": {"title": "5 words max", "body": "2 sentences on group replacing 1:1."},
  "valuePricing": {
    "problemCost": "Annual cost of client problem — specific dollar estimate.",
    "yearsStruggling": "Typical years struggling.",
    "totalCost": "Range of total lifetime cost.",
    "priceRange": "0.5%–5% value-based range.",
    "recommendedPrice": "Specific recommended POP price.",
    "whyItWorks": "One sentence — outcome value not program length.",
    "pricingNote": "2-3 sentences income math from ${ceiling} ceiling to ${goal} goal."
  },
  "nextSteps": {
    "title": "A compelling 8-10 word headline for what they do this week — specific to their profession",
    "body": "3-4 sentences: first, one concrete action they can take this week to begin extracting their methodology (specific to their profession, not generic). Then a natural transition into why the next step is speaking with the Authority.io team — frame it as the fastest path from knowing their ceiling to building beyond it. Warm and direct, not salesy."
  }
}
```

### 6.4 Blueprint display layout

Render in this order:

**Transition bar** — dark `#1a1a1a` rounded box: "Here's your scalable asset blueprint — built specifically for \[profession\]."

**1\. Header block** — `#1a1a1a` background

- Small gold label: "Your scalable asset blueprint"  
- Headline from `headline` field in white

**2\. Summary paragraph** — from `summary`

**3\. 4 C's grid** — 4 equal columns

- Curriculum / Coaching / Community / POP Launch  
- Each: large gold "C", name in small caps, 2-sentence body

**4\. Scalable asset callout** — `#B4882A` border 1.5px

- Label: "Your scalable asset"  
- Asset description  
- 3 pills: founding client count / recommended price / "Evergreen enrollment"

**5\. Mastery → Method → Mentorship** — 3-column grid

**6\. What your week looks like** — side-by-side comparison

| Right now | With your scalable asset |
| :---- | :---- |
| 1:1 client sessions | Group coaching calls |
| Admin \+ prep | Program delivery \+ async |
| Marketing \+ outreach | Weekly program income |
| Weekly income | If you take a week off → "Continues earning" |
| If you take a week off → "$0" (red) |  |

Note: NO 1:1 by choice row in after column. NO sales calls row.

**7\. Value-based pricing breakdown** — 3 cards: Cost of problem / Recommended price range (gold border) / Why this price works

**8\. Your next steps this week** — two-part block:

*Top section* — dark `#1a1a1a` background, rounded top corners:

- Small gold label: "Your next steps this week"  
- Title from `nextSteps.title` in white, 17px  
- Body from `nextSteps.body` in muted white, 14px

*Bottom section* — gold `#B4882A` background, rounded bottom corners:

- Small label: "Ready to build this?" in white/muted  
- Heading: "Book a complimentary consultation with our team — we'll show you exactly how to turn your expertise into a scalable online education business."  
- Button (white background, gold text `#633806`): "Book my free consultation →"  
- **Button links to:** \[BOOKING URL — to be provided by client\]

### 6.5 Error handling

If API call fails:

- Hide spinner  
- Display blueprint section with fallback next steps copy:  
  - Title: "Start extracting your methodology this week"  
  - Body: "Your income ceiling is clear. The next step is turning your expertise into a structured program — and the fastest path there is a conversation with our team. We'll show you exactly how to go from where you are to a fully scalable online education business."  
- Still show the consultation CTA button

---

## 7\. PDF / Print Export

After blueprint renders, show "Download as PDF" button. Use `window.print()` with print-optimised CSS, or server-side generation.

PDF includes: Authority.io logo, user's name, "Your Scalable Asset Blueprint," all blueprint sections, footer CTA: "Ready to build this? Visit authority.io"

---

## 8\. Technical Specifications

| Item | Spec |
| :---- | :---- |
| Deployment | Standalone hosted page AND embeddable iframe |
| Framework | Vanilla HTML/CSS/JS preferred; React acceptable |
| AI model | `claude-sonnet-4-20250514` |
| API key | Server-side proxy only |
| Email gate | Hard gate — blueprint hidden until email submitted |
| Webhook endpoint | To be provided by client (Mailchimp / ConvertKit / ActiveCampaign) |
| Webhook payload | first name, email, profession, ceiling, goal, gap, leverage score, time-locked %, hours needed, worth/hr, reclaim hrs |
| Blueprint trigger | Fires on email submission, simultaneously with gate hide |
| Booking URL | To be provided by client — used in "Book my free consultation" button |
| Mobile responsive | 375px viewport minimum |
| Analytics events | Step completions ×5, results view, email submit, blueprint render, CTA click, PDF download |
| Loading | Spinner \+ rotating messages, no blank-screen wait |
| Hosting | Client to provide |
| Browser support | Chrome, Safari, Firefox, Edge — last 2 versions |

---

## 9\. Blueprint Quality Standards

Verify before handoff:

1. No forbidden content — no 1:1 post-launch, no second program, no time-bound language, no sales calls  
2. Profession specificity — every profession produces entirely different content  
3. 4 C's fidelity — Curriculum \+ Coaching \+ Community \+ POP every time  
4. Value-based pricing math — realistic for the profession, clean path from ceiling to goal  
5. Week comparison — exactly 4 rows in after column, no 1:1 row  
6. Pills — founding clients / price / "Evergreen enrollment" only  
7. Next steps — concrete first action specific to profession \+ natural CTA transition  
8. Email gate — blueprint genuinely hidden until submission, no way to bypass

**Required QA test professions:**

| Profession | Rate | Hrs/wk | Goal |
| :---- | :---- | :---- | :---- |
| Executive leadership coach | $500/hr | 25 | $800K |
| Functional medicine doctor | $400/hr | 30 | $1M |
| Divorce attorney | $350/hr | 35 | $600K |
| Personal trainer | $100/hr | 40 | $300K |
| Accountant | $100/hr | 40 | $200K |
| Physical therapist | $50/hr | 40 | $100K |
| Book editor | $50/hr | 40 | $200K |

---

## 10\. Items Still Needed from Client

- [ ] Email platform webhook endpoint URL  
- [ ] Booking/consultation page URL (for "Book my free consultation →" button)  
- [ ] Hosting environment / domain  
- [ ] Authority.io logo file for PDF export

---

## 11\. Deliverables Checklist

- [ ] Full working application — Quiz → Results → Email gate → Blueprint → Next steps CTA  
- [ ] Server-side proxy for Anthropic API key  
- [ ] Email gate: hard gate, blueprint hidden until submission  
- [ ] Webhook integration for email capture (endpoint TBD)  
- [ ] Claude API integration with full prompt  
- [ ] All blueprint sections rendering correctly  
- [ ] "Your next steps this week" two-part block with consultation CTA  
- [ ] Booking button linked to client URL (TBD)  
- [ ] Progress bar: 6 segments  
- [ ] Three insight stats: Hours to hit goal / What your time is actually worth / Hours you could reclaim  
- [ ] Gap visual (two-point track, no bar chart)  
- [ ] After column: exactly 4 rows, no 1:1 row  
- [ ] Asset pills: founding clients / price / "Evergreen enrollment" only  
- [ ] PDF/print export  
- [ ] Mobile-responsive at 375px+  
- [ ] Analytics event hooks (GTM-ready)  
- [ ] Error handling with fallback next steps \+ CTA still visible  
- [ ] All 7 QA test professions pass quality standards  
- [ ] Staging link for client review before launch

