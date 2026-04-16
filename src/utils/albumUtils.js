// import { BOX_TYPES, SHEET_TYPES } from "../pages/Albums/AddAlbumModal";

// const findBox = (id) => BOX_TYPES.find((b) => b.id === id) || BOX_TYPES[0];

// const calcExtrasCost = (extrasObj) =>
//   SHEET_TYPES.reduce(
//     (sum, s) => sum + (Number(extrasObj?.[s.id]) || 0) * s.price,
//     0
//   );

// export const computeAlbumTotal = (a) => {
//   const qty = Math.max(1, Number(a.qty) || 1);
//   const boxPerUnit = findBox(a.boxTypeId)?.surcharge || 0;
//   const unitAlbumPrice = Number(a.unitPrice) || 0;

//   if (a.customizePerUnit && Array.isArray(a.extras?.perUnit)) {
//     let total = 0;
//     for (let i = 0; i < qty; i++) {
//       const extrasForUnit = a.extras.perUnit[i] || {};
//       const perUnit = unitAlbumPrice + calcExtrasCost(extrasForUnit) + boxPerUnit;
//       total += perUnit;
//     }
//     return total;
//   }

//   const shared = a.extras?.shared || {};
//   const perUnit = unitAlbumPrice + calcExtrasCost(shared) + boxPerUnit;
//   return perUnit * qty;
// };

// export const fmt = (n) => `₹${(Number(n) || 0).toLocaleString()}`;

import { BOX_TYPES, SHEET_TYPES } from "../pages/Albums/AddAlbumModal";

const safeNum = (v) => {
  try {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  } catch (e) {
    return 0;
  }
};

const safeInt = (v, fallback = 1) => {
  const n = Math.floor(safeNum(v));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const findBox = (id) => BOX_TYPES.find((b) => b.id === id) || BOX_TYPES[0];

const calcExtrasCost = (extrasObj) => {
  try {
    return SHEET_TYPES.reduce((sum, s) => {
      const qty = safeNum(extrasObj?.[s.id]);
      const price = safeNum(s.price);
      // extras qty cannot be negative
      return sum + Math.max(0, qty) * Math.max(0, price);
    }, 0);
  } catch (e) {
    return 0;
  }
};

export const computeAlbumTotal = (a) => {
  try {
    if (!a) return 0;

    // ✅ qty must always be integer >= 1
    const qty = safeInt(a.qty, 1);

    // ✅ box surcharge per unit
    const boxPerUnit = Math.max(0, safeNum(findBox(a.boxTypeId)?.surcharge));

    // ✅ unit price
    const unitAlbumPrice = Math.max(0, safeNum(a.unitPrice));

    /**
     * ✅ Your requirement:
     * You are NOT handling per-unit customization / extra sheets.
     * So ALWAYS treat as shared pricing only.
     */
    const shared = a.extras?.shared || {};
    const extrasPerUnit = calcExtrasCost(shared);

    const perUnit = unitAlbumPrice + extrasPerUnit + boxPerUnit;

    // ✅ return integer safe total
    return Math.round(perUnit * qty);
  } catch (e) {
    return 0;
  }
};

export const fmt = (n) => `₹${Math.round(safeNum(n)).toLocaleString("en-IN")}`;
