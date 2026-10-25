// Run: npm test   (Node 18+, no dependencies)
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const R = require("./public/rules.js");

const sampleText = fs.readFileSync(__dirname + "/test_sample_text.txt", "utf8");

test("parser reads every marker in the sample report correctly", () => {
  const got = Object.fromEntries(R.parseText(sampleText).map(f => [f.key, f.value]));
  const expected = { hemoglobin: 10.8, mcv: 74, wbc: 7.2, platelets: 142, glucose: 112, hba1c: 6.1, cholesterol: 185,
    ldl: 128, hdl: 36, triglycerides: 188, ferritin: 9, creatinine: 0.9, bun: 14, crp: 2.1, vitd: 18 };
  assert.deepStrictEqual(got, expected);
});

test("sample report fires the four expected combinations", () => {
  const ids = R.findCombinations(R.parseText(sampleText)).map(c => c.id).sort();
  assert.deepStrictEqual(ids, ["blood-counts", "iron-pattern", "lipid-pattern", "metabolic-glucose"]);
});

test("a combination needs ALL of its markers (no partial firing)", () => {
  const r = [{ key: "hemoglobin", value: 10.8 }, { key: "mcv", value: 74 }, { key: "ferritin", value: 40 }];
  assert.ok(!R.findCombinations(r).some(c => c.id === "iron-pattern"));
});

test("healthy values fire nothing", () => {
  const r = [{ key: "hemoglobin", value: 14 }, { key: "glucose", value: 85 }, { key: "wbc", value: 6 }, { key: "crp", value: 1 }];
  assert.deepStrictEqual(R.findCombinations(r), []);
});

test("kidney and inflammation pairs", () => {
  assert.deepStrictEqual(R.findCombinations([{ key: "creatinine", value: 2.1 }, { key: "bun", value: 38 }]).map(c => c.id), ["kidney-pair"]);
  assert.deepStrictEqual(R.findCombinations([{ key: "wbc", value: 15 }, { key: "crp", value: 40 }]).map(c => c.id), ["inflammation-pair"]);
});

test("total cholesterol is not confused with LDL/HDL/non-HDL", () => {
  const t = "Non-HDL Cholesterol 150 mg/dL LDL Cholesterol 128 mg/dL HDL Cholesterol 36 mg/dL";
  const got = Object.fromEntries(R.parseText(t).map(f => [f.key, f.value]));
  assert.deepStrictEqual(got, { ldl: 128, hdl: 36 });
});

test("HbA1c is not mistaken for haemoglobin", () => {
  const got = Object.fromEntries(R.parseText("Glycosylated Hemoglobin (HbA1c) 6.1 % 4.0-5.6").map(f => [f.key, f.value]));
  assert.deepStrictEqual(got, { hba1c: 6.1 });
});

test("API returns combinations and rejects junk keys", async () => {
  const server = require("./server.js");
  await new Promise(r => server.listen(0, r));
  const base = "http://localhost:" + server.address().port;
  try {
    const post = body => fetch(base + "/api/analyze", { method: "POST", body: JSON.stringify(body) }).then(r => r.json());
    const out = await post({ results: [{ key: "creatinine", value: 2.1 }, { key: "bun", value: 38 }, { key: "__proto__", value: 1 }, { key: "constructor", value: 3 }] });
    assert.strictEqual(out.results.length, 2);
    assert.deepStrictEqual(out.combinations.map(c => c.id), ["kidney-pair"]);
    const html = await fetch(base + "/").then(r => r.text());
    assert.ok(html.includes("Concerning combinations"));
    const rules = await fetch(base + "/rules.js").then(r => r.status);
    assert.strictEqual(rules, 200);
  } finally { server.close(); }
});
