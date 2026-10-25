/* MediLens rules — single source of truth shared by the browser UI and the Node API.
   Illustrative ranges only. Not clinical guidance. Not a diagnosis. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MediLensRules = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const definitions = {
    glucose: { name: "Glucose (fasting example)", unit: "mg/dL", min: 70, max: 99, range: "70–99 mg/dL",
      hint: "Sample reference range: 70–99 mg/dL (fasting example only).",
      aliases: ["fasting blood sugar", "fasting plasma glucose", "fasting glucose", "glucose", "fbs"], unitRe: /\bmg\/d[lL]\b/i },
    hba1c: { name: "HbA1c", unit: "%", min: 4, max: 5.6, range: "4.0–5.6 %",
      hint: "Illustrative example range: 4.0–5.6 %. Targets differ for people already managing diabetes.",
      aliases: ["glycosylated hemoglobin", "glycated haemoglobin", "glycated hemoglobin", "hba1c", "a1c"], unitRe: /%/ },
    hemoglobin: { name: "Haemoglobin", unit: "g/dL", min: 12, max: 16, range: "12–16 g/dL",
      hint: "Illustrative example range: 12–16 g/dL. Actual ranges vary by individual and laboratory.",
      aliases: ["haemoglobin", "hemoglobin", "hb"], unitRe: /\bg\/d[lL]\b/i,
      excludeBefore: /(?:glycosylated|glycated|glyco)\s*$/i, excludeAfter: /^\s*a1c/i },
    mcv: { name: "MCV (red cell size)", unit: "fL", min: 80, max: 100, range: "80–100 fL",
      hint: "Illustrative example range: 80–100 fL.",
      aliases: ["mean corpuscular volume", "mcv"], unitRe: /\bfl\b/i },
    ferritin: { name: "Ferritin", unit: "ng/mL", min: 15, max: 150, range: "15–150 ng/mL",
      hint: "Illustrative example range: 15–150 ng/mL. Ranges differ by sex and age.",
      aliases: ["serum ferritin", "ferritin"], unitRe: /\bng\/m[lL]\b/i },
    wbc: { name: "White blood cells (WBC)", unit: "×10⁹/L", min: 4, max: 11, range: "4–11 ×10⁹/L",
      hint: "Illustrative example range: 4–11 ×10⁹/L. Use the range printed by the laboratory.",
      aliases: ["white blood cell", "white blood cells", "total leukocyte count", "wbc", "tlc"],
      unitRe: /\b(?:10\^?9\/[lL]|x10\^?9\/[lL]|×10⁹\/[lL])/i },
    platelets: { name: "Platelets", unit: "×10⁹/L", min: 150, max: 450, range: "150–450 ×10⁹/L",
      hint: "Illustrative example range: 150–450 ×10⁹/L. Laboratory ranges may differ.",
      aliases: ["platelet count", "platelets", "platelet"], unitRe: /\b(?:10\^?9\/[lL]|x10\^?9\/[lL]|×10⁹\/[lL])/i },
    crp: { name: "C-reactive protein (CRP)", unit: "mg/L", min: 0, max: 5, range: "Up to 5 mg/L",
      hint: "Illustrative example upper limit: 5 mg/L. Laboratories differ.",
      aliases: ["c-reactive protein", "c reactive protein", "crp"], unitRe: /\bmg\/[lL]\b/i },
    cholesterol: { name: "Total cholesterol", unit: "mg/dL", min: 0, max: 199, range: "Below 200 mg/dL",
      hint: "Illustrative desirable level: below 200 mg/dL. Individual risk requires clinical context.",
      aliases: ["total cholesterol", "cholesterol"], unitRe: /\bmg\/d[lL]\b/i,
      excludeBefore: /(?:ldl|hdl|vldl|non[\s-]*hdl)[\s-]*$/i },
    ldl: { name: "LDL cholesterol", unit: "mg/dL", min: 0, max: 99, range: "Below 100 mg/dL",
      hint: "Illustrative example: below 100 mg/dL.",
      aliases: ["ldl cholesterol", "ldl-c", "ldl"], unitRe: /\bmg\/d[lL]\b/i },
    hdl: { name: "HDL cholesterol", unit: "mg/dL", min: 40, max: 100, range: "40–100 mg/dL",
      hint: "Illustrative example: 40 mg/dL or higher (low HDL is the concern).",
      aliases: ["hdl cholesterol", "hdl-c", "hdl"], unitRe: /\bmg\/d[lL]\b/i,
      excludeBefore: /non[\s-]*$/i },
    triglycerides: { name: "Triglycerides", unit: "mg/dL", min: 0, max: 149, range: "Below 150 mg/dL",
      hint: "Illustrative example: below 150 mg/dL.",
      aliases: ["triglycerides", "triglyceride", "tg"], unitRe: /\bmg\/d[lL]\b/i },
    creatinine: { name: "Creatinine", unit: "mg/dL", min: 0.6, max: 1.3, range: "0.6–1.3 mg/dL",
      hint: "Illustrative example range: 0.6–1.3 mg/dL. Varies with age, sex and muscle mass.",
      aliases: ["serum creatinine", "creatinine"], unitRe: /\bmg\/d[lL]\b/i },
    bun: { name: "Blood urea nitrogen (BUN)", unit: "mg/dL", min: 7, max: 20, range: "7–20 mg/dL",
      hint: "Illustrative example range: 7–20 mg/dL. Note: 'blood urea' is reported on a different scale.",
      aliases: ["blood urea nitrogen", "bun"], unitRe: /\bmg\/d[lL]\b/i },
    vitd: { name: "Vitamin D", unit: "ng/mL", min: 20, max: 50, range: "20–50 ng/mL",
      hint: "Illustrative example range: 20–50 ng/mL. Interpretation varies by guideline and context.",
      aliases: ["vitamin d 25-oh", "vitamin d 25 oh", "vitamin d 25-hydroxy", "25-oh vitamin d", "25 hydroxy vitamin d", "25(oh)d", "vitamin d"], unitRe: /\bng\/m[lL]\b/i }
  };

  /* Each combination lists required directions. ALL must match to fire.
     Wording is deliberately non-diagnostic: "pattern sometimes discussed with…", "worth reviewing with a clinician". */
  const combinations = [
    { id: "iron-pattern", level: "review", title: "Low haemoglobin + small red cells + low ferritin",
      needs: [["hemoglobin", "low"], ["mcv", "low"], ["ferritin", "low"]],
      body: "Together these are a pattern often discussed in relation to low iron stores. Several results pointing the same way is more informative than any single number, but only a clinician can interpret the cause." },
    { id: "metabolic-glucose", level: "review", title: "High glucose + high HbA1c + high triglycerides",
      needs: [["glucose", "high"], ["hba1c", "high"], ["triglycerides", "high"]],
      body: "Raised short-term and longer-term glucose markers alongside raised triglycerides is a combination clinicians commonly look at together when assessing blood-sugar and metabolic health." },
    { id: "kidney-pair", level: "review", title: "High creatinine + high BUN",
      needs: [["creatinine", "high"], ["bun", "high"]],
      body: "Both markers sit above the example range. Clinicians often read these together when assessing kidney function; hydration and other factors also affect them." },
    { id: "inflammation-pair", level: "review", title: "High WBC + high CRP",
      needs: [["wbc", "high"], ["crp", "high"]],
      body: "Raised white cells with a raised inflammation marker is a combination commonly reviewed for signs of infection or inflammation. It does not say which." },
    { id: "lipid-pattern", level: "review", title: "High LDL + low HDL",
      needs: [["ldl", "high"], ["hdl", "low"]],
      body: "A higher LDL together with a lower HDL is a lipid combination clinicians weigh when estimating cardiovascular risk, alongside age, blood pressure and family history." },
    { id: "blood-counts", level: "priority", title: "Low platelets + low haemoglobin",
      needs: [["hemoglobin", "low"], ["platelets", "low"]],
      body: "More than one blood-count marker is below range. This is worth raising with a clinician promptly, especially if you have unusual bruising, bleeding or fatigue." }
  ];

  function statusOf(key, value) {
    const d = definitions[key];
    return value < d.min ? "low" : value > d.max ? "high" : "normal";
  }

  /* results: [{key, value}] → fired combinations, each with the evidence values used (transparent). */
  function findCombinations(results) {
    const byKey = {};
    for (const r of results) if (definitions[r.key] && Number.isFinite(r.value)) byKey[r.key] = r.value;
    const fired = [];
    for (const c of combinations) {
      const evidence = [];
      let ok = true;
      for (const [key, dir] of c.needs) {
        if (!(key in byKey) || statusOf(key, byKey[key]) !== dir) { ok = false; break; }
        evidence.push({ key, name: definitions[key].name, value: byKey[key], unit: definitions[key].unit, status: dir });
      }
      if (ok) fired.push({ id: c.id, level: c.level, title: c.title, body: c.body, evidence });
    }
    return fired;
  }

  /* Best-effort text → candidate values. Heuristic: the first number after the test name that sits before its unit.
     Always shown to the user as "verify before applying". */
  function parseText(txt) {
    const normalized = String(txt).replace(/,/g, "").replace(/[–—]/g, "-");
    const found = [];
    for (const [key, d] of Object.entries(definitions)) {
      let hit = null;
      for (const alias of d.aliases) {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp("(?:^|[^a-z0-9])" + escaped + "(?=[^a-z]|$)", "gi");
        let m;
        while ((m = re.exec(normalized))) {
          const start = m.index + m[0].toLowerCase().indexOf(alias.toLowerCase());
          if (d.excludeBefore && d.excludeBefore.test(normalized.slice(Math.max(0, start - 20), start))) continue;
          if (d.excludeAfter && d.excludeAfter.test(normalized.slice(start + alias.length, start + alias.length + 10))) continue;
          if (!hit || start < hit.index || (start === hit.index && alias.length > hit.alias.length)) hit = { index: start, alias };
          break;
        }
      }
      if (!hit) continue;
      const after = normalized.slice(hit.index + hit.alias.length, hit.index + hit.alias.length + 160).replace(/^\s*\([^)]*\)/, "");
      // drop a leading parenthetical such as "(HbA1c)" so digits in names are not read as results

      const numberRe = /(\d+(?:\.\d+)?)/g;
      let candidate = null;
      const labelled = /(?:result|value|observed|your result)\s*[:=]?\s*(\d+(?:\.\d+)?)/i.exec(after);
      if (labelled) candidate = Number(labelled[1]);
      else {
        const u = after.search(d.unitRe);
        if (u >= 0) {
          const before = [...after.slice(0, u).matchAll(numberRe)].map(x => Number(x[1]));
          if (before.length) candidate = before[0];
        }
        if (candidate === null) {
          const all = [...after.matchAll(numberRe)].map(x => Number(x[1]));
          if (all.length === 1) candidate = all[0];
        }
      }
      if (candidate !== null && Number.isFinite(candidate)) found.push({ key, value: candidate, source: hit.alias });
    }
    return found;
  }

  return { definitions, combinations, statusOf, findCombinations, parseText };
});
