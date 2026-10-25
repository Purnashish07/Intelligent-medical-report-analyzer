# MediLens — 2.5 minute demo video script (Orca Coder, Problem 02)

Before recording: `npm start`, open http://localhost:3000, browser zoom ~110%, internet on (PDF.js loads from a CDN).

| Time | On screen | Say |
|---|---|---|
| 0:00–0:20 | Hero section | "Lab reports are full of numbers people can't interpret, and the real signal is often in how results combine. MediLens reads a report, flags abnormal values, and highlights concerning combinations." |
| 0:20–0:40 | Scroll to "How MediLens works" | "Three steps: extract the values from the PDF in the browser, compare each to a reference range, then look for combinations that point the same way. Every rule is transparent, no black box." |
| 0:40–1:10 | Analyzer: choose `sample_lab_report.pdf` → Extract text → Find recognizable test values | "Here's a synthetic lab report. Text is extracted locally, the file never leaves the browser. MediLens finds 15 values and asks us to verify each before applying." |
| 1:10–1:25 | Click Apply on a few values (or just use the preloaded demo set) | "Humans stay in the loop: nothing is applied without review." |
| 1:25–2:00 | Results table, then "Concerning combinations" panel | "Ten values are out of range, but look at the combinations. Low haemoglobin, small red cells and low ferritin together is the pattern discussed with low iron stores. Low platelets plus low haemoglobin is marked priority. Each card shows the exact values that triggered it." |
| 2:00–2:15 | Change Ferritin to 60 → Check and update | "Change one number and the iron pattern disappears. The logic is explainable and testable." |
| 2:15–2:30 | Export summary; safety notice | "We never diagnose. Ranges are illustrative, with a disclaimer throughout. Next: OCR for scanned reports, trend tracking across reports, multilingual explanations, and clinician-validated rules." |
