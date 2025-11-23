// Loyalty Drift Dashboard — Points & Promotions
// Tiny drift checker for loyalty events (toy version).

function safeParse(jsonText) {
  try {
    return { ok: true, value: JSON.parse(jsonText) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Predefined drift scenarios
const SCENARIOS = {
  scenario1: {
    // Example 1 – Partner + Promo Drift
    v1: `{
  "partnerId": "PartnerA",
  "tier": "Gold",
  "segment": "HighValue",
  "promoCode": "SPRING10",
  "campaignId": "CAMP123",
  "score": 82,
  "spend": 120,
  "currency": "USD",
  "category": "Electronics"
}`,
    v2: `{
  "partnerId": "partner-a",
  "tier": "Platinum",
  "segment": "HighValue",
  "promoCode": "SPRING20",
  "campaignId": "CAMP123",
  "score": 76,
  "spend": 120,
  "currency": "USD",
  "category": "Electronics-Devices"
}`
  },
  scenario2: {
    // Example 2 – Tier + Category Drift, milder
    v1: `{
  "partnerId": "PartnerB",
  "tier": "Silver",
  "segment": "New",
  "promoCode": "WELCOME5",
  "campaignId": "CAMP200",
  "score": 60,
  "spend": 45,
  "currency": "USD",
  "category": "Grocery"
}`,
    v2: `{
  "partnerId": "PartnerB",
  "tier": "Gold",
  "segment": "New",
  "promoCode": "WELCOME5",
  "campaignId": "CAMP200",
  "score": 68,
  "spend": 45,
  "currency": "USD",
  "category": "Grocery-Fresh"
}`
  }
};

// Fields we care about for drift (toy, extendable)
const DRIFT_FIELDS = [
  "partnerId",
  "tier",
  "segment",
  "promoCode",
  "campaignId",
  "score",
  "spend",
  "currency",
  "category"
];

// Compare two events and return structured drift info
function compareEvents(v1, v2) {
  const issues = [];

  DRIFT_FIELDS.forEach((field) => {
    const has1 = Object.prototype.hasOwnProperty.call(v1, field);
    const has2 = Object.prototype.hasOwnProperty.call(v2, field);

    if (has1 && !has2) {
      issues.push({
        field,
        type: "removed",
        from: v1[field],
        to: undefined,
        message: `Field removed in v2: ${field} (was "${v1[field]}")`
      });
      return;
    }

    if (!has1 && has2) {
      issues.push({
        field,
        type: "added",
        from: undefined,
        to: v2[field],
        message: `Field added in v2: ${field} (now "${v2[field]}")`
      });
      return;
    }

    if (has1 && has2) {
      const val1 = v1[field];
      const val2 = v2[field];

      if (val1 !== val2) {
        issues.push({
          field,
          type: "changed",
          from: val1,
          to: val2,
          message: `Value drift in ${field}: v1="${val1}" → v2="${val2}"`
        });
      }
    }
  });

  // Rough drift level based on number of issues
  const count = issues.length;
  let driftLevel = "Low";
  if (count >= 2 && count <= 4) {
    driftLevel = "Medium";
  } else if (count > 4) {
    driftLevel = "High";
  }

  return { issues, driftLevel };
}

// Rendering helpers

function renderSummary(result) {
  const summaryEl = document.getElementById("summary");
  summaryEl.innerHTML = "";

  const badge = document.createElement("div");

  if (!result || result.issues.length === 0) {
    badge.className = "summary-badge summary-badge-ok";
    badge.textContent = "No drift detected for tracked fields.";
  } else {
    badge.className = "summary-badge summary-badge-fail";
    badge.innerHTML = `
      Drift Level: <span class="count">${result.driftLevel}</span>
      · Issues: <span class="count">${result.issues.length}</span>
    `;
  }

  summaryEl.appendChild(badge);
}

function renderDetails(result) {
  const impactLine = document.getElementById("impact-line");
  const fieldsLine = document.getElementById("fields-line");
  const targetingLine = document.getElementById("targeting-line");
  const rawOutput = document.getElementById("raw-output");

  if (!result) {
    impactLine.textContent =
      "Run a drift check to see whether this change is low, medium, or high impact.";
    fieldsLine.textContent =
      "Added, removed, and changed fields will appear here by category.";
    targetingLine.textContent =
      "See how partner IDs, tiers, and categories might shift behavior downstream.";
    rawOutput.textContent =
      'Select a scenario and click "Check for Drift" to see detailed drift output.';
    return;
  }

  const { issues, driftLevel } = result;

  // Impact line
  if (issues.length === 0) {
    impactLine.innerHTML =
      'Drift impact: <strong>Low</strong>. No field-level changes detected in tracked fields.';
  } else if (driftLevel === "Low") {
    impactLine.innerHTML =
      'Drift impact: <strong>Low</strong>. Small changes, unlikely to fully reshape targeting or promo behavior.';
  } else if (driftLevel === "Medium") {
    impactLine.innerHTML =
      'Drift impact: <strong>Medium</strong>. Enough changes that some campaigns or scores may behave differently.';
  } else {
    impactLine.innerHTML =
      'Drift impact: <strong>High</strong>. Multiple core fields shifted — expect targeting, eligibility, or scoring to diverge between versions.';
  }

  // Fields line: group by type
  if (issues.length === 0) {
    fieldsLine.innerHTML = "No added, removed, or changed fields in the tracked set.";
  } else {
    const added = issues.filter((i) => i.type === "added").map((i) => i.field);
    const removed = issues.filter((i) => i.type === "removed").map((i) => i.field);
    const changed = issues.filter((i) => i.type === "changed").map((i) => i.field);

    const parts = [];
    if (added.length) {
      parts.push(`Added: <strong>${added.join(", ")}</strong>`);
    }
    if (removed.length) {
      parts.push(`Removed: <strong>${removed.join(", ")}</strong>`);
    }
    if (changed.length) {
      parts.push(`Changed: <strong>${changed.join(", ")}</strong>`);
    }

    fieldsLine.innerHTML = parts.join("<br />");
  }

  // Targeting & promo line
  if (issues.length === 0) {
    targetingLine.innerHTML =
      "Targeting, promotions, and scores are likely to stay aligned across versions for tracked fields.";
  } else {
    const partnerTouched = issues.some((i) => i.field === "partnerId");
    const tierTouched = issues.some((i) => i.field === "tier");
    const categoryTouched = issues.some((i) => i.field === "category" || i.field === "segment");
    const promoTouched = issues.some((i) => i.field === "promoCode" || i.field === "campaignId");
    const scoreTouched = issues.some((i) => i.field === "score");

    const bullets = [];
    if (partnerTouched) bullets.push("partner classification");
    if (tierTouched) bullets.push("tier-based multipliers");
    if (categoryTouched) bullets.push("category-level targeting");
    if (promoTouched) bullets.push("promo eligibility & campaign mapping");
    if (scoreTouched) bullets.push("loyalty score & segment assignment");

    if (bullets.length) {
      targetingLine.innerHTML =
        "Drift is likely to affect: " +
        "<strong>" +
        bullets.join(", ") +
        "</strong>.";
    } else {
      targetingLine.innerHTML =
        "Drift is present but does not touch core targeting or scoring fields in this toy example.";
    }
  }

  // Raw output
  if (issues.length === 0) {
    rawOutput.textContent = [
      "No drift detected for tracked fields.",
      "",
      "Drift Level: " + driftLevel,
      "Issue Count: 0",
      "",
      "Impact: Low — no field-level differences across the tracked keys."
    ].join("\n");
  } else {
    const lines = [];
    lines.push("Drift Detected:");
    issues.forEach((issue) => {
      lines.push("- " + issue.message);
    });
    lines.push("");
    lines.push("Drift Level: " + driftLevel);
    lines.push("Issue Count: " + issues.length);

    if (driftLevel === "High") {
      lines.push(
        "\nImpact: High — expect targeting, promo eligibility, or scoring to behave differently between these versions."
      );
    } else if (driftLevel === "Medium") {
      lines.push(
        "\nImpact: Medium — some targeting or promo behavior may shift; review before relying on historical results."
      );
    } else {
      lines.push(
        "\nImpact: Low — small or no meaningful changes in tracked fields."
      );
    }

    rawOutput.textContent = lines.join("\n");
  }
}

// Wire up scenario selector and button

const scenarioSelect = document.getElementById("scenarioSelect");
const event1El = document.getElementById("event1");
const event2El = document.getElementById("event2");
const statusEl = document.getElementById("drift-status");

function resetUI() {
  renderSummary(null);
  renderDetails(null);
}

scenarioSelect.addEventListener("change", () => {
  const key = scenarioSelect.value;

  if (!key || !SCENARIOS[key]) {
    event1El.value = "";
    event2El.value = "";
    statusEl.textContent = "Scenario cleared. Select a scenario to begin.";
    resetUI();
    return;
  }

  const scenario = SCENARIOS[key];
  event1El.value = scenario.v1;
  event2El.value = scenario.v2;
  statusEl.textContent = 'Scenario loaded. Click "Check for Drift" to calculate.';
  resetUI();
});

document.getElementById("checkDriftBtn").addEventListener("click", () => {
  const raw1 = event1El.value || "";
  const raw2 = event2El.value || "";

  if (!raw1 || !raw2) {
    statusEl.textContent = "Please select a scenario first; events are empty.";
    renderSummary(null);
    renderDetails(null);
    return;
  }

  const parsed1 = safeParse(raw1);
  const parsed2 = safeParse(raw2);

  if (!parsed1.ok || !parsed2.ok) {
    let msg = "Error parsing JSON:\n";
    if (!parsed1.ok) msg += "- Event v1: " + parsed1.error + "\n";
    if (!parsed2.ok) msg += "- Event v2: " + parsed2.error + "\n";

    statusEl.textContent = "JSON parsing error.";
    document.getElementById("raw-output").textContent = msg.trim();
    renderSummary({ issues: [{}, {}], driftLevel: "Low" }); // just to show something
    return;
  }

  const result = compareEvents(parsed1.value, parsed2.value);
  statusEl.textContent = "Drift calculation complete.";
  renderSummary(result);
  renderDetails(result);
});

// Optional: preload the first scenario for instant demo
(function preload() {
  scenarioSelect.value = "scenario1";
  const scenario = SCENARIOS["scenario1"];
  event1El.value = scenario.v1;
  event2El.value = scenario.v2;
  statusEl.textContent = 'Scenario 1 loaded. Click "Check for Drift" to calculate.';
})();
