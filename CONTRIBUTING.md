# Contributing to Devlok

Thank you for wanting to make this knowledge more accurate, complete, and honest.

Devlok's strength is scriptural accuracy. Every node, every relationship, every word must be traceable to a named ancient text. This is not pedantry — it's what separates knowledge from folklore.

---

## Two ways to contribute

### 1. Submit via the app (recommended)
When logged in, click "✎ Suggest a correction" on any character card. Fill in the source — the specific text and chapter — and submit. An admin reviews all submissions before they go live.

### 2. Submit via GitHub

For larger contributions (new characters, batch corrections, regional traditions):

```
1. Fork this repository
2. Edit server/seed/seed.js
3. Open a Pull Request with your change and source citation
```

All PRs require a source citation in the description. PRs without sources will be closed.

---

## What we accept

| Type | What to include |
|------|----------------|
| ✅ Character corrections | Corrected field + source (text, chapter, verse if known) |
| ✅ New characters | Full character object + all required fields + source |
| ✅ New relationships | source → target, label, type, and source text |
| ✅ Epithet additions | Additional names for a character + which text uses them |
| ✅ Desc improvements | Better/more accurate description + source |

## What we do not accept

| Type | Reason |
|------|--------|
| ❌ Regional folk stories without textual basis | Cannot verify accuracy across traditions |
| ❌ "I've heard that..." | Oral tradition requires citation of a specific scholar or text |
| ❌ Political or theological editorializing | Devlok is a knowledge graph, not a theology |
| ❌ WhatsApp-sourced "facts" | No traceable source = no entry |
| ❌ Content designed to disparage any tradition | Against the knowledge-as-commons philosophy |

---

## Character object format

```json
{
  "id": "unique_lowercase_id",
  "label": "Display Name",
  "type": "deva | devi | hero | sage | asura | celestial | avatar",
  "size": 11,
  "filter": "mahabharata | ramayana | purana | vedic",
  "yuga": "eternal | satya | treta | dvapara | kali",
  "sanskrit": "संस्कृत नाम",
  "epithets": ["Title 1", "Title 2"],
  "desc": "One paragraph. 3-5 sentences. What makes this being significant? What do they represent?",
  "source": "Primary Text · Secondary Text"
}
```

## Relationship object format

```json
{
  "source": "character_id",
  "target": "character_id",
  "label": "Relationship label",
  "type": "family | divine | conflict | guru | alliance | manifestation"
}
```

---

## Shraddha rewards

When you contribute via the app:
- Submitting a correction: **+50 Shraddha**
- Admin approves your submission: **+200 Shraddha**

These points reflect real respect — *shraddha* — for the knowledge we're building together.

---

## Code of conduct

One sentence: **Be as careful with this knowledge as you would want others to be with yours.**

---

## Questions?

Open a GitHub Issue. We read everything.

*"What you do not know, say that you do not know." — Kena Upanishad*
