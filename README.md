
---

## 🎯 Purpose

Loyalty engines are highly sensitive to upstream event quality.  
Even minor changes — partner IDs, tiers, categories, spend fields — can cause:

- incorrect promotion targeting  
- invalid partner attributions  
- mismatched redemption offers  
- unstable scores and segment assignments  

This dashboard exposes those shifts visually, making drift legible before it hits production.

---

## 🧠 How This Maps to Real Loyalty Systems

Each step corresponds to real downstream engines:

### Event Comparison  
Loyalty systems rely on stable, consistent events. Schema drift or inconsistent values break attribution, rules, and targeting.

### Targeting Engine  
Promotions and campaigns often depend on partner, tier, spend, and category fields. Drift directly impacts eligibility.

### Partner Classification  
If the partner field changes (e.g., from “PartnerA” → “Partner A”), promotions may fail silently.

### Score / Segment Stability  
When key fields differ, the scoring engine may produce wildly different results for the same customer.

This tool is a small, legible version of those real-world behaviors.

---

## 🔗 Part of the Loyalty Systems Series

Main repo:  
https://github.com/rtfenter/loyalty-series

---

## 🚧 Status  
MVP planned.  
This dashboard will focus only on the minimal mechanics required to demonstrate drift behavior in loyalty systems.

---

## ▶️ Local Use  
When ready, everything will run client-side.

To run locally:

1. Clone the repo  
2. Open `index.html` in your browser  

That’s it — static JS, no backend required.
