# Clinical note specification

This spec defines **what** a note contains and the text format `generateNote` must return.
How you generate it is up to you, and so is how the note looks in the UI (Part 5).
The eval script checks these rules, and so do we.

## Format

- **Plain text only.** No Markdown: no `#`, `**`, `-` bullets, tables or code fences.
- The note is written in the **note language chosen by the user** (English or Georgian). By default this is the transcript's language, but a Georgian transcript can produce an English note and vice versa. Headings, section text and the "missing" phrases all follow the note language.
- The note contains these 9 sections, **in this order**. Each heading is on its own line, written exactly as below (no colon, no numbering), followed by the section text on the next line(s). Put one empty line between sections.

| # | English heading | Georgian heading |
|---|---|---|
| 1 | `CHIEF COMPLAINT` | `მთავარი ჩივილი` |
| 2 | `HISTORY OF PRESENT ILLNESS` | `ანამნეზი` |
| 3 | `CURRENT MEDICATIONS` | `მიმდინარე მედიკამენტები` |
| 4 | `ALLERGIES` | `ალერგია` |
| 5 | `VITALS AND EXAM` | `ვიტალური მაჩვენებლები და გასინჯვა` |
| 6 | `ASSESSMENT` | `შეფასება` |
| 7 | `PLAN` | `გეგმა` |
| 8 | `FOLLOW-UP` | `განმეორებითი ვიზიტი` |
| 9 | `PATIENT SUMMARY` | `შეჯამება პაციენტისთვის` |

## Content rules

1. **Only use information from the transcript.** Never add diagnoses, doses, test results or advice that the doctor or patient did not say.
2. **Missing information.** If the transcript says nothing about a section, write exactly `Not mentioned` (English) or `არ არის აღნიშნული` (Georgian) and nothing else in that section.
3. **"None" is not "missing".** If the patient explicitly says they have no allergies, write `No known allergies` / `ალერგია არ აქვს`. If they explicitly say they take no medications, write `None` / `არ იღებს`.
4. **CURRENT MEDICATIONS** lists only what the patient takes **at the time of the visit**, with dose and frequency if stated. Medications the patient has stopped belong in HISTORY OF PRESENT ILLNESS. New prescriptions from this visit belong in PLAN.
5. **PLAN** lists only what the doctor actually decided: prescriptions (drug, dose, frequency, duration), tests, referrals, advice. Do not list options the doctor considered and rejected.
6. **Numbers as digits**, units abbreviated: `500 mg`, `1 g`, `38.4 °C`, `2 weeks`. In Georgian: `500 მგ`, `1 გ`, `2 კვირა`.
7. **PATIENT SUMMARY** is written for the patient: 3–5 short sentences, plain language, no medical jargon, addressed as "you" (Georgian: "თქვენ"). It explains what was found, what to do, and when to come back or seek urgent help.
8. Keep clinical sections concise. A doctor should be able to read the whole note in under a minute.

## Example (English, different visit)

```
CHIEF COMPLAINT
Itchy rash on both forearms for 5 days.

HISTORY OF PRESENT ILLNESS
Rash started after gardening. No fever. Tried an over-the-counter hydrocortisone cream with little effect.

CURRENT MEDICATIONS
None

ALLERGIES
Not mentioned

VITALS AND EXAM
Red, raised, linear rash on both forearms. No blisters, no signs of infection.

ASSESSMENT
Contact dermatitis, likely plant-related.

PLAN
Betamethasone 0.1% cream twice a day for 7 days. Cetirizine 10 mg once a day at night for itch. Wear gloves when gardening.

FOLLOW-UP
Return in 2 weeks if not improved.

PATIENT SUMMARY
You have a skin reaction, most likely from a plant in your garden. Use the cream twice a day for one week and take the allergy tablet at night to help with the itch. Wear gloves when you garden. Come back in 2 weeks if the rash has not improved.
```
