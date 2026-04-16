// import React, { useEffect, useMemo, useState } from "react";
// import { Modal, Button, Form, Row, Col, Collapse } from "react-bootstrap";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import { useParams } from "react-router-dom";
// import { API_URL } from "../../utils/api";

// /** ---------- Config ---------- */
// export const BOX_TYPES = [
//   { id: "none", label: "Without Box", surcharge: 0 },
//   { id: "simple", label: "Simple Box", surcharge: 500 },
//   { id: "premium", label: "Premium Box", surcharge: 1500 },
// ];

// export const ALBUM_TEMPLATES = [
//   {
//     id: "small_9x12",
//     label: `Small 9" x 12" (30 Sheets, 100 Photos)`,
//     baseSheets: 30,
//     basePhotos: 100,
//     basePrice: 6000,
//   },
//   {
//     id: "standard_15x24",
//     label: `Standard 15" x 24" (30 Sheets, 200 Photos)`,
//     baseSheets: 30,
//     basePhotos: 200,
//     basePrice: 12000,
//   },
//   {
//     id: "premium_18x24_box",
//     label: `Premium 18" x 24" with Box (30 Sheets, 200 Photos)`,
//     baseSheets: 30,
//     basePhotos: 200,
//     basePrice: 18000,
//   },
//   {
//     id: "luxury_18x24_special",
//     label: `Luxury 18" x 24" with Special Box (30 Sheets, 200 Photos)`,
//     baseSheets: 30,
//     basePhotos: 200,
//     basePrice: 24000,
//   },
//   {
//     id: "custom",
//     label: "Other (Custom Album)",
//     baseSheets: 0,
//     basePhotos: 0,
//     basePrice: 0,
//     isCustom: true,
//   },
// ];

// export const SHEET_TYPES = [
//   { id: "std", label: "Additional Standard Sheet", price: 120 },
//   { id: "special", label: "Additional/Replacement Special Sheet", price: 180 },
//   { id: "embossed", label: "Additional/Replacement Embossed Sheet", price: 260 },
// ];

// const findTemplate = (id) => ALBUM_TEMPLATES.find((t) => t.id === id);
// const findBox = (id) => BOX_TYPES.find((b) => b.id === id) || BOX_TYPES[0];

// const API_BASE = `${API_URL}/quotations`;

// /** ---------- Helpers (NEW) ---------- */
// // Some old rows have only `snapshot.templateLabel = "Custom: 14\" x 16\""`.
// const parseSizeFromTemplateLabel = (label) => {
//   if (!label) return "";
//   const m = /^Custom:\s*(.*)$/i.exec(label.trim());
//   return m ? m[1].trim() : "";
// };

// /** ---------- Component ---------- */
// const AddAlbumModal = ({
//   show,
//   onClose,
//   onAdd,
//   onUpdate,
//   mode = "add",
//   initialData = null,
//   quotationId: quotationIdProp,
//   albumType = "quote", // "quote" | "addons"
//   fetchQuotation,
// }) => {
//   const isEdit = mode === "edit";
//   const { id: quotationIdFromParams } = useParams();
//   const quotationId = quotationIdProp || quotationIdFromParams;

//   const emptyExtras = () =>
//     SHEET_TYPES.reduce((acc, s) => {
//       acc[s.id] = 0;
//       return acc;
//     }, {});

//   // Pull custom fields from various shapes; also parse from templateLabel if needed
//   const extractCustomDetails = (data) => {
//     const snapshot = data?.snapshot || {};
//     const details = data?.customAlbumDetails || {};
//     const parsedSize =
//       details.size ??
//       snapshot.size ??
//       parseSizeFromTemplateLabel(snapshot.templateLabel) ??
//       data?.size ??
//       "";

//     return {
//       size: parsedSize,
//       baseSheets: Number(details.baseSheets ?? snapshot.baseSheets ?? data?.baseSheets ?? 0),
//       basePhotos: Number(details.basePhotos ?? snapshot.basePhotos ?? data?.basePhotos ?? 0),
//       basePrice: Number(
//         details.basePrice ??
//           data?.unitPrice ?? // old saves stored album-only price here
//           0
//       ),
//     };
//   };

//   const initFromData = (data) => {
//     if (!data) {
//       const tpl = ALBUM_TEMPLATES[0];
//       return {
//         templateId: tpl.id,
//         boxTypeId: "none",
//         qty: "1",
//         unitPrice: tpl.basePrice, // album-only price (no box)
//         showCustomize: false,
//         customizePerUnit: false,
//         extrasShared: emptyExtras(),
//         extrasPerUnit: [emptyExtras()],
//         customAlbumDetails: { size: "", baseSheets: 0, basePhotos: 0, basePrice: 0 },
//       };
//     }

//     const isCustom = !!findTemplate(data.templateId)?.isCustom;
//     const customizePerUnit = !!data.customizePerUnit;

//     const customAlbumDetails = isCustom
//       ? extractCustomDetails(data)
//       : { size: "", baseSheets: 0, basePhotos: 0, basePrice: 0 };

//     // For custom, unitPrice should mirror custom basePrice
//     const unitPrice = isCustom ? Number(customAlbumDetails.basePrice) || 0 : Number(data.unitPrice) || 0;

//     return {
//       templateId: data.templateId,
//       boxTypeId: data.boxTypeId || "none",
//       qty: String(data.qty ?? 1),
//       unitPrice,
//       showCustomize: !!data.customizePerUnit,
//       customizePerUnit,
//       extrasShared: !customizePerUnit ? (data.extras?.shared ?? emptyExtras()) : emptyExtras(),
//       extrasPerUnit: customizePerUnit
//         ? (data.extras?.perUnit?.length ? data.extras.perUnit : [emptyExtras()])
//         : [emptyExtras()],
//       customAlbumDetails,
//     };
//   };

//   const [form, setForm] = useState(initFromData(initialData));
//   const [saving, setSaving] = useState(false);

//   // Re-hydrate whenever the modal opens or the initialData changes
//   useEffect(() => {
//     if (!show) return;
//     setForm(initFromData(initialData));
//   }, [show, initialData]);

//   const isCustomAlbum = useMemo(
//     () => !!findTemplate(form.templateId)?.isCustom,
//     [form.templateId]
//   );

//   const boxPerUnit = useMemo(
//     () => findBox(form.boxTypeId)?.surcharge || 0,
//     [form.boxTypeId]
//   );

//   const qtyNum = Math.max(1, parseInt(form.qty || "0", 10) || 1);

//   // keep extrasPerUnit length == qty when per-unit customization on
//   useEffect(() => {
//     if (!form.customizePerUnit) return;
//     setForm((f) => {
//       const arr = [...(f.extrasPerUnit || [])];
//       if (arr.length < qtyNum) {
//         for (let i = arr.length; i < qtyNum; i++) arr.push(emptyExtras());
//       } else if (arr.length > qtyNum) {
//         arr.length = qtyNum;
//       }
//       return { ...f, extrasPerUnit: arr };
//     });
//   }, [form.customizePerUnit, qtyNum]);

//   const calculateExtrasCost = (extrasObj) =>
//     SHEET_TYPES.reduce(
//       (sum, s) => sum + (Number(extrasObj?.[s.id]) || 0) * (Number(s.price) || 0),
//       0
//     );

//   const calculatePrices = useMemo(() => {
//     const qty = Math.max(1, parseInt(form.qty || "0", 10) || 1);
//     const basePrice = isCustomAlbum
//       ? (Number(form.customAlbumDetails.basePrice) || 0)
//       : (Number(form.unitPrice) || 0);
//     const boxPrice = boxPerUnit;

//     if (!form.customizePerUnit) {
//       const sharedExtrasCost = calculateExtrasCost(form.extrasShared);
//       const unitPrice = basePrice + sharedExtrasCost;
//       const unitTotal = unitPrice + boxPrice;
//       const finalTotal = unitTotal * qty;

//       return {
//         unitPrice,
//         unitTotal,
//         finalTotal,
//         perUnitPrices: Array(qty).fill({ unitPrice, unitTotal }),
//       };
//     } else {
//       const perUnitPrices = (form.extrasPerUnit || []).map((extras) => {
//         const extrasCost = calculateExtrasCost(extras);
//         const unitPrice = basePrice + extrasCost;
//         const unitTotal = unitPrice + boxPrice;
//         return { unitPrice, unitTotal };
//       });

//       const finalTotal = perUnitPrices.reduce((sum, { unitTotal }) => sum + unitTotal, 0);

//       return {
//         unitPrice: basePrice,
//         unitTotal: basePrice + boxPrice,
//         finalTotal,
//         perUnitPrices,
//       };
//     }
//   }, [
//     form.unitPrice,
//     form.qty,
//     form.customizePerUnit,
//     form.extrasShared,
//     form.extrasPerUnit,
//     boxPerUnit,
//     isCustomAlbum,
//     form.customAlbumDetails.basePrice,
//   ]);

//   const handleQtyChange = (e) => {
//     const v = e.target.value;
//     setForm((f) => ({ ...f, qty: v === "" ? "" : v.replace(/[^\d]/g, "") }));
//   };
//   const normalizeQtyOnBlur = () =>
//     setForm((f) => ({
//       ...f,
//       qty: String(Math.max(1, parseInt(f.qty || "0", 10) || 1)),
//     }));

//   const handleTemplateChange = (value) => {
//     const tpl = findTemplate(value);
//     const isCustom = !!tpl?.isCustom;

//     setForm((f) => {
//       const nextCustom = isCustom
//         ? {
//             ...f.customAlbumDetails,
//             basePrice: Number(f.customAlbumDetails.basePrice) || 0,
//             baseSheets: Number(f.customAlbumDetails.baseSheets) || 0,
//             basePhotos: Number(f.customAlbumDetails.basePhotos) || 0,
//             size: f.customAlbumDetails.size || "",
//           }
//         : { size: "", baseSheets: 0, basePhotos: 0, basePrice: 0 };

//       return {
//         ...f,
//         templateId: value,
//         unitPrice: isCustom ? Number(nextCustom.basePrice) || 0 : (tpl?.basePrice || 0),
//         extrasShared: emptyExtras(),
//         extrasPerUnit: [emptyExtras()],
//         showCustomize: false,
//         customizePerUnit: false,
//         customAlbumDetails: nextCustom,
//       };
//     });
//   };

//   // keep custom base price & unitPrice in sync
//   const handleCustomAlbumChange = (field, value) => {
//     setForm((f) => {
//       const next = {
//         ...f,
//         customAlbumDetails: {
//           ...f.customAlbumDetails,
//           [field]: field === "size" ? value : Number(value) || 0,
//         },
//       };
//       if (field === "basePrice") {
//         next.unitPrice = Number(value) || 0;
//       }
//       return next;
//     });
//   };

//   const handleConfirm = async () => {
//     const finalQty = Math.max(1, parseInt(form.qty || "0", 10) || 1);

//     const isCustom = isCustomAlbum;
//     const custom = form.customAlbumDetails;

//     const payload = {
//       templateId: form.templateId,
//       boxTypeId: form.boxTypeId,
//       qty: finalQty,
//       // album-only unit price
//       unitPrice: isCustom ? (Number(custom.basePrice) || 0) : (Number(form.unitPrice) || 0),
//       customizePerUnit: form.customizePerUnit,
//       extras: form.customizePerUnit
//         ? { perUnit: form.extrasPerUnit }
//         : { shared: form.extrasShared },
//       type: albumType,

//       // ---- NEW: mirror values at top-level so lists show them easily ----
//       size: isCustom ? custom.size : undefined,
//       baseSheets: isCustom ? Number(custom.baseSheets) || 0 : (findTemplate(form.templateId)?.baseSheets ?? 0),
//       basePhotos: isCustom ? Number(custom.basePhotos) || 0 : (findTemplate(form.templateId)?.basePhotos ?? 0),
//       sheets: isCustom
//         ? Number(custom.baseSheets) || 0
//         : (findTemplate(form.templateId)?.baseSheets ?? 0),

//       suggested: {
//         albumOnlyPerUnit: calculatePrices.perUnitPrices.map((p) => p.unitPrice),
//         boxPerUnit,
//         finalPerUnit: calculatePrices.perUnitPrices.map((p) => p.unitTotal),
//         finalTotal: calculatePrices.finalTotal,
//       },

//       snapshot: {
//         templateLabel: isCustom ? `Custom: ${custom.size}` : (findTemplate(form.templateId)?.label || ""),
//         baseSheets: isCustom ? custom.baseSheets : (findTemplate(form.templateId)?.baseSheets || 30),
//         basePhotos: isCustom ? custom.basePhotos : (findTemplate(form.templateId)?.basePhotos || 0),
//         boxLabel: findBox(form.boxTypeId)?.label || "",
//         sheetTypes: SHEET_TYPES,
//         size: isCustom ? custom.size : undefined, // explicit size kept here too
//       },

//       customAlbumDetails: isCustom ? custom : null,
//     };

//     if (!quotationId) {
//       toast.error("Missing quotation id");
//       return;
//     }

//     try {
//       setSaving(true);

//       if (isEdit) {
//         const albumId = initialData?._id || initialData?.id;
//         if (!albumId) {
//           toast.error("Missing album id");
//           setSaving(false);
//           return;
//         }
//         const { data } = await axios.put(`${API_BASE}/${quotationId}/albums/${albumId}`, payload);
//         if (!data?.success) throw new Error(data?.message || "Update failed");

//         toast.success("Album updated");
//         onUpdate?.(data.album || { ...payload, _id: albumId });
//       } else {
//         const { data } = await axios.post(`${API_BASE}/${quotationId}/albums`, payload);
//         toast.success("Album added");
//         onAdd?.(data?.album || payload);
//       }

//       onClose?.();
//     } catch (err) {
//       console.error("Album save error:", err);
//       toast.error(err.response?.data?.message || err.message || "Failed to save album");
//     } finally {
//       setSaving(false);
//       fetchQuotation?.();
//     }
//   };

//   return (
//     <Modal show={show} onHide={onClose} centered size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title className="fw-bold">
//           {isEdit ? "Edit Album" : "Add Album"}
//         </Modal.Title>
//       </Modal.Header>

//       <Modal.Body className="small">
//         <Form>
//           {/* Album */}
//           <Form.Group className="mb-3">
//             <Form.Label className="fw-semibold">Album</Form.Label>
//             <Form.Select
//               value={form.templateId}
//               onChange={(e) => handleTemplateChange(e.target.value)}
//             >
//               {ALBUM_TEMPLATES.map((t) => (
//                 <option key={t.id} value={t.id}>
//                   {t.label} {t.basePrice ? `— Base ₹${t.basePrice.toLocaleString()}` : ""}
//                 </option>
//               ))}
//             </Form.Select>
//           </Form.Group>

//           {/* Custom Album Details */}
//           {isCustomAlbum && (
//             <div className="p-3 border rounded mb-3">
//               <h6 className="fw-semibold mb-3">Custom Album Details</h6>
//               <Row className="g-3">
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Album Size</Form.Label>
//                     <Form.Control
//                       type="text"
//                       placeholder='e.g., 12" x 18"'
//                       value={form.customAlbumDetails.size}
//                       onChange={(e) => handleCustomAlbumChange("size", e.target.value)}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group>
//                     <Form.Label>Base Sheets</Form.Label>
//                     <Form.Control
//                       type="number"
//                       min="0"
//                       value={form.customAlbumDetails.baseSheets}
//                       onChange={(e) => handleCustomAlbumChange("baseSheets", e.target.value)}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group>
//                     <Form.Label>Base Photos</Form.Label>
//                     <Form.Control
//                       type="number"
//                       min="0"
//                       value={form.customAlbumDetails.basePhotos}
//                       onChange={(e) => handleCustomAlbumChange("basePhotos", e.target.value)}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Base Price (₹)</Form.Label>
//                     <Form.Control
//                       type="number"
//                       min="0"
//                       value={form.customAlbumDetails.basePrice}
//                       onChange={(e) => handleCustomAlbumChange("basePrice", e.target.value)}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </div>
//           )}

//           <Row className="g-3">
//             {/* Box */}
//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label className="fw-semibold">Box</Form.Label>
//                 <Form.Select
//                   value={form.boxTypeId}
//                   onChange={(e) => setForm((f) => ({ ...f, boxTypeId: e.target.value }))}
//                 >
//                   {BOX_TYPES.map((b) => (
//                     <option key={b.id} value={b.id}>
//                       {b.label} {b.surcharge ? `(+₹${b.surcharge})` : ""}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 <div className="mt-1 text-muted">
//                   Box surcharge per unit: ₹{boxPerUnit.toLocaleString()}
//                 </div>
//               </Form.Group>
//             </Col>

//             {/* Qty */}
//             <Col md={3}>
//               <Form.Group>
//                 <Form.Label className="fw-semibold">Quantity</Form.Label>
//                 <Form.Control
//                   size="sm"
//                   type="number"
//                   min="1"
//                   value={form.qty === "" ? "" : form.qty}
//                   onChange={handleQtyChange}
//                   onBlur={normalizeQtyOnBlur}
//                 />
//               </Form.Group>
//             </Col>

//             {/* Unit Price (album only) */}
//             <Col md={3}>
//               <Form.Group>
//                 <Form.Label className="fw-semibold">Unit Price (album only)</Form.Label>
//                 <Form.Control
//                   size="sm"
//                   type="number"
//                   min="0"
//                   value={
//                     isCustomAlbum
//                       ? (form.customAlbumDetails.basePrice || 0)
//                       : form.unitPrice
//                   }
//                   onChange={(e) =>
//                     isCustomAlbum
//                       ? handleCustomAlbumChange("basePrice", e.target.value)
//                       : setForm((f) => ({ ...f, unitPrice: Number(e.target.value) || 0 }))
//                   }
//                 />
//                 {isCustomAlbum && (
//                   <Form.Text className="text-muted">
//                     This updates the custom base price.
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>
//           </Row>

//           {/* Customization toggle */}
//           <div className="d-flex align-items-center mt-3">
//             <Form.Check
//               type="switch"
//               id="toggle-customize"
//               checked={form.showCustomize}
//               onChange={(e) =>
//                 setForm((f) => ({
//                   ...f,
//                   showCustomize: e.target.checked,
//                 }))
//               }
//               label="Customize extra sheets"
//             />
//           </div>

//           <Collapse in={form.showCustomize}>
//             <div>
//               <div className="mt-3">
//                 <Form.Check
//                   type="switch"
//                   id="toggle-per-unit"
//                   checked={form.customizePerUnit}
//                   onChange={(e) =>
//                     setForm((f) => ({
//                       ...f,
//                       customizePerUnit: e.target.checked,
//                       extrasPerUnit: e.target.checked
//                         ? Array.from({ length: qtyNum }, () => emptyExtras())
//                         : f.extrasPerUnit,
//                     }))
//                   }
//                   label="Customize each unit separately"
//                 />
//               </div>

//               {!form.customizePerUnit ? (
//                 <div className="p-2 border rounded mt-2">
//                   <div className="fw-semibold mb-2">Extra sheets (applies to every unit)</div>
//                   {SHEET_TYPES.map((s) => (
//                     <Row key={s.id} className="g-2 align-items-center mb-1">
//                       <Col xs={7}>{s.label} (₹{s.price} / sheet)</Col>
//                       <Col xs={5} className="d-flex align-items-center gap-2">
//                         <Button
//                           size="sm"
//                           variant="light"
//                           onClick={() =>
//                             setForm((f) => ({
//                               ...f,
//                               extrasShared: {
//                                 ...f.extrasShared,
//                                 [s.id]: Math.max(0, (f.extrasShared?.[s.id] || 0) - 1),
//                               },
//                             }))
//                           }
//                         >
//                           −
//                         </Button>
//                         <Form.Control
//                           size="sm"
//                           type="number"
//                           min="0"
//                           value={form.extrasShared?.[s.id] || 0}
//                           onChange={(e) =>
//                             setForm((f) => ({
//                               ...f,
//                               extrasShared: {
//                                 ...f.extrasShared,
//                                 [s.id]: Math.max(0, Number(e.target.value) || 0),
//                               },
//                             }))
//                           }
//                           style={{ maxWidth: 90 }}
//                         />
//                         <Button
//                           size="sm"
//                           variant="light"
//                           onClick={() =>
//                             setForm((f) => ({
//                               ...f,
//                               extrasShared: {
//                                 ...f.extrasShared,
//                                 [s.id]: (f.extrasShared?.[s.id] || 0) + 1,
//                               },
//                             }))
//                           }
//                         >
//                           +
//                         </Button>
//                       </Col>
//                     </Row>
//                   ))}

//                   <div className="mt-2 text-muted">
//                     Album-only per unit: ₹{calculatePrices.unitPrice.toLocaleString()}
//                     <br />
//                     Final per unit (incl. box): ₹{calculatePrices.unitTotal.toLocaleString()}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="p-2 border rounded mt-2">
//                   <div className="fw-semibold mb-2">Extra sheets per unit</div>

//                   {Array.from({ length: qtyNum }).map((_, i) => (
//                     <div key={i} className="border rounded p-2 mb-2">
//                       <div className="fw-semibold mb-1">Unit {String(i + 1).padStart(2, "0")}</div>

//                       {SHEET_TYPES.map((s) => (
//                         <Row key={s.id} className="g-2 align-items-center mb-1">
//                           <Col xs={7}>{s.label} (₹{s.price} / sheet)</Col>
//                           <Col xs={5} className="d-flex align-items-center gap-2">
//                             <Button
//                               size="sm"
//                               variant="light"
//                               onClick={() =>
//                                 setForm((f) => {
//                                   const arr = [...(f.extrasPerUnit || [])];
//                                   const cur = { ...(arr[i] || {}) };
//                                   cur[s.id] = Math.max(0, (cur[s.id] || 0) - 1);
//                                   arr[i] = cur;
//                                   return { ...f, extrasPerUnit: arr };
//                                 })
//                               }
//                             >
//                               −
//                             </Button>
//                             <Form.Control
//                               size="sm"
//                               type="number"
//                               min="0"
//                               value={form.extrasPerUnit?.[i]?.[s.id] ?? 0}
//                               onChange={(e) =>
//                                 setForm((f) => {
//                                   const arr = [...(f.extrasPerUnit || [])];
//                                   const cur = { ...(arr[i] || {}) };
//                                   cur[s.id] = Math.max(0, Number(e.target.value) || 0);
//                                   arr[i] = cur;
//                                   return { ...f, extrasPerUnit: arr };
//                                 })
//                               }
//                               style={{ maxWidth: 90 }}
//                             />
//                             <Button
//                               size="sm"
//                               variant="light"
//                               onClick={() =>
//                                 setForm((f) => {
//                                   const arr = [...(f.extrasPerUnit || [])];
//                                   const cur = { ...(arr[i] || {}) };
//                                   cur[s.id] = (cur[s.id] || 0) + 1;
//                                   arr[i] = cur;
//                                   return { ...f, extrasPerUnit: arr };
//                                 })
//                               }
//                             >
//                               +
//                             </Button>
//                           </Col>
//                         </Row>
//                       ))}

//                       <div className="mt-1 text-muted">
//                         Album-only for this unit: ₹{(calculatePrices.perUnitPrices[i]?.unitPrice || 0).toLocaleString()}
//                         <br />
//                         Final for this unit (incl. box): ₹{(calculatePrices.perUnitPrices[i]?.unitTotal || 0).toLocaleString()}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </Collapse>
//         </Form>

//         {/* Total Price Summary */}
//         <div className="mt-3 p-2 bg-light rounded">
//           <div className="fw-semibold">Price Summary</div>
//           <div>
//             Total: ₹{calculatePrices.finalTotal.toLocaleString()}
//             {qtyNum > 1 && (
//               <span className="text-muted">
//                 {" "}
//                 (₹{calculatePrices.unitTotal.toLocaleString()} × {qtyNum})
//               </span>
//             )}
//           </div>
//         </div>
//       </Modal.Body>

//       <Modal.Footer>
//         <Button variant="secondary" onClick={onClose} disabled={saving}>
//           Cancel
//         </Button>
//         <Button variant="dark" onClick={handleConfirm} disabled={saving}>
//           {saving ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save changes" : "Add"}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default AddAlbumModal;

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, Collapse } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { API_URL } from "../../utils/api";

/** ---------- Config ---------- */
export const BOX_TYPES = [
  { id: "none", label: "Without Box", surcharge: 0 },
  { id: "simple", label: "Simple Box", surcharge: 500 },
  { id: "premium", label: "Premium Box", surcharge: 1500 },
];

export const ALBUM_TEMPLATES = [
  {
    id: "small_9x12",
    label: `Small 9" x 12" (30 Sheets, 100 Photos)`,
    baseSheets: 30,
    basePhotos: 100,
    basePrice: 6000,
  },
  {
    id: "standard_15x24",
    label: `Standard 15" x 24" (30 Sheets, 200 Photos)`,
    baseSheets: 30,
    basePhotos: 200,
    basePrice: 12000,
  },
  {
    id: "premium_18x24_box",
    label: `Premium 18" x 24" with Box (30 Sheets, 200 Photos)`,
    baseSheets: 30,
    basePhotos: 200,
    basePrice: 18000,
  },
  {
    id: "luxury_18x24_special",
    label: `Luxury 18" x 24" with Special Box (30 Sheets, 200 Photos)`,
    baseSheets: 30,
    basePhotos: 200,
    basePrice: 24000,
  },
  {
    id: "custom",
    label: "Other (Custom Album)",
    baseSheets: 0,
    basePhotos: 0,
    basePrice: 0,
    isCustom: true,
  },
];

export const SHEET_TYPES = [
  { id: "std", label: "Additional Standard Sheet", price: 120 },
  { id: "special", label: "Additional/Replacement Special Sheet", price: 180 },
  { id: "embossed", label: "Additional/Replacement Embossed Sheet", price: 260 },
];

const findTemplate = (id) => ALBUM_TEMPLATES.find((t) => t.id === id);
const findBox = (id) => BOX_TYPES.find((b) => b.id === id) || BOX_TYPES[0];

const API_BASE = `${API_URL}/quotations`;

// Some old rows have `snapshot.templateLabel = "Custom: 14\" x 16\""`
const parseSizeFromTemplateLabel = (label) => {
  try {
    if (!label) return "";
    const m = /^Custom:\s*(.*)$/i.exec(String(label).trim());
    return m ? m[1].trim() : "";
  } catch (e) {
    return "";
  }
};

const AddAlbumModal = ({
  show,
  onClose,
  onAdd,
  onUpdate,
  mode = "add",
  initialData = null,
  quotationId: quotationIdProp,
  albumType = "addons", // "quote" | "addons"
  fetchQuotation,
}) => {
  const isEdit = mode === "edit";
  const { id: quotationIdFromParams } = useParams();
  const quotationId = quotationIdProp || quotationIdFromParams;

  const emptyExtras = () =>
    SHEET_TYPES.reduce((acc, s) => {
      acc[s.id] = 0;
      return acc;
    }, {});

  const extractCustomDetails = (data) => {
    try {
      const snapshot = data?.snapshot || {};
      const details = data?.customAlbumDetails || {};
      const parsedSize =
        details.size ??
        snapshot.size ??
        parseSizeFromTemplateLabel(snapshot.templateLabel) ??
        data?.size ??
        "";

      return {
        size: parsedSize,
        baseSheets: Number(details.baseSheets ?? snapshot.baseSheets ?? data?.baseSheets ?? 0),
        basePhotos: Number(details.basePhotos ?? snapshot.basePhotos ?? data?.basePhotos ?? 0),
        basePrice: Number(details.basePrice ?? data?.unitPrice ?? 0),
      };
    } catch (e) {
      return { size: "", baseSheets: 0, basePhotos: 0, basePrice: 0 };
    }
  };

  const initFromData = (data) => {
    try {
      const tpl0 = ALBUM_TEMPLATES[0];

      if (!data) {
        return {
          templateId: tpl0.id,
          boxTypeId: "none",
          unitPrice: tpl0.basePrice, // album-only
          showCustomize: false,
          extrasShared: emptyExtras(),
          customAlbumDetails: { size: "", baseSheets: 0, basePhotos: 0, basePrice: 0 },
        };
      }

      const isCustom = !!findTemplate(data.templateId)?.isCustom;
      const customAlbumDetails = isCustom ? extractCustomDetails(data) : { size: "", baseSheets: 0, basePhotos: 0, basePrice: 0 };

      return {
        templateId: data.templateId || tpl0.id,
        boxTypeId: data.boxTypeId || "none",
        unitPrice: isCustom ? Number(customAlbumDetails.basePrice || 0) : Number(data.unitPrice || findTemplate(data.templateId)?.basePrice || 0),
        showCustomize: !!(data.extras?.shared && Object.keys(data.extras.shared || {}).length > 0),
        extrasShared: data.extras?.shared ? { ...emptyExtras(), ...data.extras.shared } : emptyExtras(),
        customAlbumDetails,
      };
    } catch (e) {
      const tpl0 = ALBUM_TEMPLATES[0];
      return {
        templateId: tpl0.id,
        boxTypeId: "none",
        unitPrice: tpl0.basePrice,
        showCustomize: false,
        extrasShared: emptyExtras(),
        customAlbumDetails: { size: "", baseSheets: 0, basePhotos: 0, basePrice: 0 },
      };
    }
  };

  const [form, setForm] = useState(initFromData(initialData));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      if (!show) return;
      setForm(initFromData(initialData));
    } catch (e) {}
  }, [show, initialData]);

  const isCustomAlbum = useMemo(() => !!findTemplate(form.templateId)?.isCustom, [form.templateId]);

  const boxPerUnit = useMemo(() => {
    try {
      return findBox(form.boxTypeId)?.surcharge || 0;
    } catch (e) {
      return 0;
    }
  }, [form.boxTypeId]);

  const calculateExtrasCost = (extrasObj) => {
    try {
      return SHEET_TYPES.reduce(
        (sum, s) => sum + (Number(extrasObj?.[s.id]) || 0) * (Number(s.price) || 0),
        0
      );
    } catch (e) {
      return 0;
    }
  };

  const prices = useMemo(() => {
    const basePrice = isCustomAlbum ? Number(form.customAlbumDetails.basePrice || 0) : Number(form.unitPrice || 0);
    const extrasTotal = calculateExtrasCost(form.extrasShared);
    const finalTotal = basePrice + extrasTotal + boxPerUnit;

    return {
      albumOnly: basePrice,
      extrasTotal,
      boxSurcharge: boxPerUnit,
      finalTotal,
    };
  }, [form.unitPrice, form.extrasShared, form.boxTypeId, isCustomAlbum, form.customAlbumDetails.basePrice, boxPerUnit]);

  const handleTemplateChange = (value) => {
    try {
      const tpl = findTemplate(value);
      const isCustom = !!tpl?.isCustom;

      setForm((f) => {
        const nextCustom = isCustom
          ? {
              ...f.customAlbumDetails,
              basePrice: Number(f.customAlbumDetails.basePrice) || 0,
              baseSheets: Number(f.customAlbumDetails.baseSheets) || 0,
              basePhotos: Number(f.customAlbumDetails.basePhotos) || 0,
              size: f.customAlbumDetails.size || "",
            }
          : { size: "", baseSheets: 0, basePhotos: 0, basePrice: 0 };

        return {
          ...f,
          templateId: value,
          unitPrice: isCustom ? Number(nextCustom.basePrice) || 0 : tpl?.basePrice || 0,
          extrasShared: emptyExtras(),
          showCustomize: false,
          customAlbumDetails: nextCustom,
        };
      });
    } catch (e) {}
  };

  const handleCustomAlbumChange = (field, value) => {
    try {
      setForm((f) => {
        const next = {
          ...f,
          customAlbumDetails: {
            ...f.customAlbumDetails,
            [field]: field === "size" ? value : Number(value) || 0,
          },
        };
        if (field === "basePrice") next.unitPrice = Number(value) || 0;
        return next;
      });
    } catch (e) {}
  };

  const handleConfirm = async () => {
    if (!quotationId) {
      toast.error("Missing quotation id");
      return;
    }

    try {
      setSaving(true);

      const tpl = findTemplate(form.templateId);
      const custom = form.customAlbumDetails;
      const isCustom = isCustomAlbum;

      const payload = {
        templateId: form.templateId,
        boxTypeId: form.boxTypeId,

        // ✅ Always single unit
        unitPrice: isCustom ? Number(custom.basePrice || 0) : Number(form.unitPrice || 0),

        // ✅ Only shared extras
        extras: { shared: form.showCustomize ? form.extrasShared : emptyExtras() },

        type: albumType,

        // Useful flat fields
        size: isCustom ? custom.size : undefined,
        baseSheets: isCustom ? Number(custom.baseSheets || 0) : Number(tpl?.baseSheets || 0),
        basePhotos: isCustom ? Number(custom.basePhotos || 0) : Number(tpl?.basePhotos || 0),
        sheets: isCustom ? Number(custom.baseSheets || 0) : Number(tpl?.baseSheets || 0),

        // ✅ Single suggested totals (no arrays)
        suggested: {
          albumOnly: prices.albumOnly,
          boxSurcharge: prices.boxSurcharge,
          extrasTotal: prices.extrasTotal,
          finalTotal: prices.finalTotal,
        },

        snapshot: {
          templateLabel: isCustom ? `Custom: ${custom.size}` : (tpl?.label || ""),
          baseSheets: isCustom ? Number(custom.baseSheets || 0) : Number(tpl?.baseSheets || 0),
          basePhotos: isCustom ? Number(custom.basePhotos || 0) : Number(tpl?.basePhotos || 0),
          boxLabel: findBox(form.boxTypeId)?.label || "",
          boxSurchargeAtSave: prices.boxSurcharge,
          sheetTypes: SHEET_TYPES,
          size: isCustom ? custom.size : undefined,
        },

        customAlbumDetails: isCustom ? custom : null,
      };

      if (isEdit) {
        const albumId = initialData?._id || initialData?.id;
        if (!albumId) {
          toast.error("Missing album id");
          return;
        }

        const { data } = await axios.put(`${API_BASE}/${quotationId}/albums/${albumId}`, payload);
        if (!data?.success) throw new Error(data?.message || "Update failed");

        toast.success("Album updated");
        onUpdate?.(data.album || { ...payload, _id: albumId });
      } else {
        const { data } = await axios.post(`${API_BASE}/${quotationId}/albums`, payload);
        toast.success("Album added");
        onAdd?.(data?.album || payload);
      }

      onClose?.();
    } catch (err) {
      console.error("Album save error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to save album");
    } finally {
      setSaving(false);
      try {
        fetchQuotation?.();
      } catch (e) {}
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">{isEdit ? "Edit Album" : "Add Album"}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="small">
        <Form>
          {/* Album */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Album</Form.Label>
            <Form.Select value={form.templateId} onChange={(e) => handleTemplateChange(e.target.value)}>
              {ALBUM_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} {t.basePrice ? `— Base ₹${t.basePrice.toLocaleString()}` : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Custom Album Details */}
          {isCustomAlbum && (
            <div className="p-3 border rounded mb-3">
              <h6 className="fw-semibold mb-3">Custom Album Details</h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Album Size</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder='e.g., 12" x 18"'
                      value={form.customAlbumDetails.size}
                      onChange={(e) => handleCustomAlbumChange("size", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Base Sheets</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={form.customAlbumDetails.baseSheets}
                      onChange={(e) => handleCustomAlbumChange("baseSheets", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Base Photos</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={form.customAlbumDetails.basePhotos}
                      onChange={(e) => handleCustomAlbumChange("basePhotos", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Base Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={form.customAlbumDetails.basePrice}
                      onChange={(e) => handleCustomAlbumChange("basePrice", e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}

          <Row className="g-3">
            {/* Box */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Box</Form.Label>
                <Form.Select
                  value={form.boxTypeId}
                  onChange={(e) => setForm((f) => ({ ...f, boxTypeId: e.target.value }))}
                >
                  {BOX_TYPES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} {b.surcharge ? `(+₹${b.surcharge})` : ""}
                    </option>
                  ))}
                </Form.Select>
                <div className="mt-1 text-muted">Box surcharge: ₹{boxPerUnit.toLocaleString()}</div>
              </Form.Group>
            </Col>

            {/* Unit Price (album only) */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Unit Price (album only)</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  min="0"
                  value={isCustomAlbum ? form.customAlbumDetails.basePrice || 0 : form.unitPrice}
                  onChange={(e) =>
                    isCustomAlbum
                      ? handleCustomAlbumChange("basePrice", e.target.value)
                      : setForm((f) => ({ ...f, unitPrice: Number(e.target.value) || 0 }))
                  }
                />
                {isCustomAlbum && <Form.Text className="text-muted">This updates the custom base price.</Form.Text>}
              </Form.Group>
            </Col>
          </Row>

          {/* Customization toggle */}
          <div className="d-flex align-items-center mt-3">
            <Form.Check
              type="switch"
              id="toggle-customize"
              checked={form.showCustomize}
              onChange={(e) => setForm((f) => ({ ...f, showCustomize: e.target.checked }))}
              label="Customize extra sheets"
            />
          </div>

          <Collapse in={form.showCustomize}>
            <div className="p-2 border rounded mt-2">
              <div className="fw-semibold mb-2">Extra sheets (single album)</div>

              {SHEET_TYPES.map((s) => (
                <Row key={s.id} className="g-2 align-items-center mb-1">
                  <Col xs={7}>
                    {s.label} (₹{s.price} / sheet)
                  </Col>
                  <Col xs={5} className="d-flex align-items-center gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          extrasShared: {
                            ...f.extrasShared,
                            [s.id]: Math.max(0, (f.extrasShared?.[s.id] || 0) - 1),
                          },
                        }))
                      }
                    >
                      −
                    </Button>
                    <Form.Control
                      size="sm"
                      type="number"
                      min="0"
                      value={form.extrasShared?.[s.id] || 0}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          extrasShared: {
                            ...f.extrasShared,
                            [s.id]: Math.max(0, Number(e.target.value) || 0),
                          },
                        }))
                      }
                      style={{ maxWidth: 90 }}
                    />
                    <Button
                      size="sm"
                      variant="light"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          extrasShared: {
                            ...f.extrasShared,
                            [s.id]: (f.extrasShared?.[s.id] || 0) + 1,
                          },
                        }))
                      }
                    >
                      +
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          </Collapse>
        </Form>

        {/* Price Summary */}
        <div className="mt-3 p-2 bg-light rounded">
          <div className="fw-semibold">Price Summary</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            Album: ₹{prices.albumOnly.toLocaleString()} | Extras: ₹{prices.extrasTotal.toLocaleString()} | Box: ₹{prices.boxSurcharge.toLocaleString()}
          </div>
          <div style={{ fontWeight: 800 }}>
            Total: ₹{prices.finalTotal.toLocaleString()}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="dark" onClick={handleConfirm} disabled={saving}>
          {saving ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save changes" : "Add"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddAlbumModal;
