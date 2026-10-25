🚀 Live Demo: https://intelligent-medical-report-analyzer.vercel.app/

MediLens — full prototype package
=================================

WHAT'S NEW (v2) — matches Orca Coder problem statement 02
- Concerning-combination detection: 6 transparent multi-marker rules (iron pattern, glucose/HbA1c/triglycerides,
  creatinine+BUN, WBC+CRP, LDL+HDL, low platelets+low haemoglobin). Each alert shows the exact values that triggered it.
- 15 markers (was 6). Ranges and rules live in ONE file, public/rules.js, shared by the browser UI and the Node API.
- Better PDF value matching (HbA1c vs haemoglobin, LDL/HDL vs total cholesterol, digits inside test names).
- sample_lab_report.pdf: synthetic text-based report for the demo video (upload it, click Extract, then Find values).
- npm test: 8 automated tests (parser, rules, API). DEMO_SCRIPT.md: 2.5-minute video script.

PROJECT CONTENTS
- public/rules.js   : reference ranges, combination rules and the PDF text parser (single source of truth).
- public/index.html : responsive frontend with manual entry, PDF text extraction, range checks, review flags and report export.
- server.js         : optional Node.js backend with /api/health and /api/analyze endpoints.
- package.json      : run script (no npm dependencies required).

RUN LOCALLY
1. Install Node.js 18 or newer.
2. Extract this ZIP.
3. Open a terminal in the extracted medilens_full_project folder.
4. Run: npm start
5. Open: http://localhost:3000

PDF EXTRACTION
- Uses PDF.js from a CDN in the browser. Internet access is needed to load the library.
- Text extraction runs in the browser; the selected PDF is not uploaded to the backend.
- Works best with text-based PDFs. Scanned image PDFs need OCR, which is not included.
- Automatic matching of names and values is heuristic and can be wrong. Always compare candidates to the original report before applying them.

BACKEND API
GET /api/health
POST /api/analyze
Example request body:
{"results":[{"key":"creatinine","value":2.1},{"key":"bun","value":38}]}
Only recognized test keys are analyzed. The response includes transparent range comparisons and any matched "combinations" with their evidence values.

AI / MEDICAL SAFETY
This package does NOT include a real AI model and does NOT diagnose, predict disease or recommend treatment. The analyzer is deterministic and rule-based. A real AI integration would require a secured server-side provider/API key, explicit consent, privacy/security review, validated clinical content and appropriate clinical evaluation. Do not put API keys in frontend code. Do not use identifiable or real patient data in this demo. Reference ranges are illustrative and not appropriate for individual medical decisions.
