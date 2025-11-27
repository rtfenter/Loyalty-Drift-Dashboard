# Loyalty Drift Dashboard  
[![Live Demo](https://img.shields.io/badge/Live%20Demo-000?style=for-the-badge)](https://rtfenter.github.io/Loyalty-Drift-Dashboard/)

### A small prototype that visualizes schema and value drift across loyalty event streams.

This project is part of my **Loyalty Systems Series**, exploring how loyalty systems behave beneath the UI layer — from event flow to FX reconciliation to partner tiering.

The goal of this dashboard is to make drift legible: how tiny upstream changes in event fields create large downstream failures in targeting, attribution, scoring, and redemption.

---

## Purpose

Loyalty engines are highly sensitive to upstream event quality.  
Even minor changes — partner IDs, tiers, categories, spend fields — can cause:

- incorrect promotion targeting  
- invalid partner attributions  
- mismatched redemption offers  
- unstable scores or segment assignments  

This dashboard provides a visual way to detect and understand those shifts before they hit production.

---

## Features (MVP)

The first version will include:

- Side-by-side comparison of two event sets  
- Highlighted drift in key fields (partner, tier, category, spend)  
- Visualization of affected downstream components  
- Simple event flow: `Compare → Detect Drift → Surface Impact`  
- Lightweight client-side experience — no backend required  

---

## Demo Screenshot
<img width="2696" height="1900" alt="Screenshot 2025-11-23 at 08-42-12 Loyalty Drift Dashboard — Points   Promotions" src="https://github.com/user-attachments/assets/6981715a-05ba-4843-b868-628fa2db3b24" />

---

## Loyalty Drift Flow Diagram

```
[Event Stream A]     [Event Stream B]
         |                 |
         v                 v
     Field Comparison Layer
     (schema + value checks)
                |
                v
       Drift Detection Engine
      (highlight mismatches)
                |
                v
   Downstream Impact Projection
 (targeting, attribution, scoring)
```

---

## How This Maps to Real Loyalty Systems

Even though it's minimal, each step corresponds to real downstream engines:

### Event Comparison  
Loyalty systems rely on stable, consistent events. Schema drift or inconsistent values break attribution, rules, and targeting.

### Targeting Engine  
Promotions and campaigns depend on partner, tier, category, and spend fields. Any drift affects eligibility and segmentation.

### Partner Classification  
If the partner field changes (e.g., “PartnerA” → “Partner A”), promotions may fail silently or classify incorrectly.

### Score / Segment Stability  
Drift in key inputs leads to unstable scoring, incorrect tier assignment, and mismatched customer experiences.

This tool is a small, legible model of those real-world behaviors.

---

## Part of the Loyalty Systems Series

Main repo:  
https://github.com/rtfenter/Loyalty-Systems-Series

---

## Status

MVP implemented and active.  
The dashboard will focus only on minimal mechanics required to demonstrate drift behavior in loyalty systems.

---

## Local Use

Everything runs client-side.

To run locally:

1. Clone the repo  
2. Open `index.html` in your browser  

That’s it — static JS, no backend required.
