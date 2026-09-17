# PaizoMath curriculum question bank — first implementation phase

## Scope

The question bank is being expanded toward **more than 1,000 approved educational questions per theme in total**, distributed across Kindergarten, Primary 1–6, and Gymnasium 1–3. Each approved record is assigned to one theme, one grade, one language, one unit, and one difficulty level.

The first implementation phase establishes the data contract and approval gate. It does not insert unreviewed or synthetic questions into the live offline game. The existing in-app question bank remains active until approved curriculum records are available.

## Source policy

A question may state that it is **aligned with** a cited curriculum or textbook. It must not claim that the Ministry of Education approved an original PaizoMath question. Sources are shown to the parent in the management area, not to the child during play.

The initial source registry includes the Institute of Educational Policy curriculum hub, the official digital schoolbook catalogue organised by grade, and the Institute's Religious Education curriculum page. Every factual question will retain its source title, URL, authority, and access date.

## Approval lifecycle

Each record moves through `draft`, `review`, `approved`, or `rejected`. Only records with `status: "approved"` in `data/approved/` may be published to the offline application. The validator checks the topic and grade vocabulary, four distinct answer choices, inclusion of the correct answer, unique IDs, approved status, and an accepted official source authority.

## Current status

The schema, source registry, approved-bank directory, and validator are now present. The approved directory contains zero records at this stage by design: no question is published before it has been mapped to a grade-level unit and source and passed review. The next content phase should add a small pilot per theme and grade, validate it, and only then scale the same workflow toward the 1,000-per-theme target.

## Files

- `data/question-schema.json` — required record structure.
- `data/sources.json` — official source registry and supported grades.
- `data/approved/` — publishable records only.
- `tools/validate-question-bank.py` — deterministic quality gate.

## Official references

[1]: https://www.iep.edu.gr/nea-programmata-spoudon/ "Ινστιτούτο Εκπαιδευτικής Πολιτικής — Νέα Προγράμματα Σπουδών"
[2]: https://ebooks.edu.gr/ebooks/v2/class-main.jsp?classcode=K06 "Διαδραστικά Σχολικά Βιβλία — Υλικό ανά τάξη"
[3]: https://www2.iep.edu.gr/el/nea-programmata-spoudon-sta-thriskeftika "ΙΕΠ — Νέα Προγράμματα Σπουδών στα Θρησκευτικά"
