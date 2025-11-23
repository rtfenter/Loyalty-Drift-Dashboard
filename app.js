// ML Drift Dashboard — Points & Promotions
// Tiny drift checker for loyalty events (toy version).

function safeParse(jsonText) {
  try {
    return { ok: true, value: JSON.parse(jsonText) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

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

function compareEvents(v1, v2) {
  const issues = [];

  DRIFT_FIELDS.forEach((field) => {
    const has1 = Object.prototype.hasOwnProperty.call(v1, field);
    const has2 = Object.prototype.hasOwnProperty.call(v2, field);

    if (has1 && !has2) {
      issues.push(`Field removed in v2: ${field} (was "${v1[field]}")`);
      return;
    }

    if (!has1 && has2) {
      issues.push(`Field added in v2: ${field} (now "${v2[field]}")`);
      return;
    }

    if (has1 && has2) {
      const val1 = v1[field];
      const val2 = v2[field];

      if (val1 !== val2) {
        issues.push(
          `Value drift in ${field}: v1="${val1}" → v2="${val2}"`
        );
      }
    }
  });

  // Rough drift level based on number of issues
  let driftLevel = "Low";
  if (issues.length >= 2 && issues.length <= 4) {
    driftLevel = "Medium";
  } else if (issues.length > 4) {
    driftLevel = "High";
  }

  return { issues, driftLevel };
}

function formatResult(result) {
  const lines = [];

  if (result.issues.length === 0) {
    lines.push("No drift detected for tracked fields.");
  } else {
    lines.push("Drift Detected:");
    result.issues.forEach((issue) => {
      lines.push("- " + issue);
    });
  }

  lines.push("");
  lines.push("Drift Level: " + result.driftLevel);
  lines.push("Issue Count: " + result.issues.length);

  // Very simple interpretation
  if (result.driftLevel === "High") {
    lines.push(
      "\nImpact: High — expect targeting, promo eligibility, or scoring to behave differently between these versions."
    );
  } else if (result.driftLevel === "Medium") {
    lines.push(
      "\nImpact: Medium — some targeting or promo behavior may shift; review before relying on historical results."
    );
  } else {
    lines.push(
      "\nImpact: Low — small or no meaningful changes in tracked fields."
    );
  }

  return lines.join("\n");
}

document.getElementById("checkDriftBtn").addEventListener("click", () => {
  const raw1 = document.getElementById("event1").value || "";
  const raw2 = document.getElementById("event2").value || "";

  const parsed1 = safeParse(raw1);
  const parsed2 = safeParse(raw2);

  if (!parsed1.ok || !parsed2.ok) {
    let msg = "Error parsing JSON:\n";
    if (!parsed1.ok) msg += "- Event v1: " + parsed1.error + "\n";
    if (!parsed2.ok) msg += "- Event v2: " + parsed2.error + "\n";
    document.getElementById("output").textContent = msg.trim();
    return;
  }

  const result = compareEvents(parsed1.value, parsed2.value);
  const formatted = formatResult(result);
  document.getElementById("output").textContent = formatted;
});
