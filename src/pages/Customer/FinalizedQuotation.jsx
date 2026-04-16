// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Table, Button, Card, Row, Col, Spinner, Alert } from "react-bootstrap";
// import { FaWhatsapp, FaDownload, FaEdit, FaPrint } from "react-icons/fa";
// import { toast } from "react-hot-toast";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import axios from "axios";
// import { API_URL } from "../../utils/api";

// const money = (n) => `₹${(Number(n) || 0).toLocaleString()}`;

// // ------- album helpers (pure local compute; no APIs) -------
// const toPlain = (m) => (m instanceof Map ? Object.fromEntries(m) : m || {});
// const calcExtrasCost = (extrasObj = {}, sheetCatalog = []) =>
//   sheetCatalog.reduce(
//     (sum, s) => sum + (Number(extrasObj?.[s.id]) || 0) * (Number(s.price) || 0),
//     0
//   );

// const computeAlbumTotalLocal = (a) => {
//   if (!a) return 0;
//   const suggestedTotal = Number(a?.suggested?.finalTotal);
//   if (!Number.isNaN(suggestedTotal) && suggestedTotal > 0)
//     return suggestedTotal;

//   const qty = Math.max(1, Number(a.qty) || 1);
//   const unitAlbumPrice = Number(a.unitPrice) || 0;
//   const boxPerUnit =
//     Number(a?.suggested?.boxPerUnit) ||
//     Number(a?.snapshot?.boxSurchargeAtSave) ||
//     0;

//   const sheetCatalog = Array.isArray(a?.snapshot?.sheetTypes)
//     ? a.snapshot.sheetTypes
//     : [];

//   const extrasShared = toPlain(a?.extras?.shared);
//   const extrasPerUnit = Array.isArray(a?.extras?.perUnit)
//     ? a.extras.perUnit.map(toPlain)
//     : [];

//   if (a?.customizePerUnit && extrasPerUnit.length > 0) {
//     const perUnitTotals = Array.from({ length: qty }, (_, i) => {
//       const extraCost = calcExtrasCost(extrasPerUnit[i] || {}, sheetCatalog);
//       return unitAlbumPrice + extraCost + boxPerUnit;
//     });
//     return perUnitTotals.reduce((s, v) => s + v, 0);
//   }

//   const sharedCost = calcExtrasCost(extrasShared, sheetCatalog);
//   const finalUnit = unitAlbumPrice + sharedCost + boxPerUnit;
//   return finalUnit * qty;
// };

// const albumSubtotalFromQuote = (albums = [], fallbackTotal) => {
//   if (Number(fallbackTotal) > 0) return Number(fallbackTotal);
//   return (albums || []).reduce((s, a) => s + computeAlbumTotalLocal(a), 0);
// };

// // ===================== Component =====================
// const FinalizedQuotation = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const pdfRef = useRef(null);
//   const [loading, setLoading] = useState(true);
//   const [quotation, setQuotation] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchQuotation = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_URL}/quotations/${id}`);
//         const data = await res.json();
//         if (data?.success) {
//           setQuotation(data.quotation);
//           setError("");
//         } else {
//           setError("Quotation not found.");
//           setQuotation(null);
//         }
//       } catch {
//         setError("Failed to load quotation. Please try again.");
//         setQuotation(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuotation();
//   }, [id]);

//   const albumSubtotalMemo = useMemo(
//     () =>
//       albumSubtotalFromQuote(
//         quotation?.albums || [],
//         quotation?.totalAlbumAmount
//       ),
//     [quotation]
//   );

//   // ---------------- Handlers ----------------
//   // NEW: multipage, tight margins, no cropping; keeps signatures visible
//   const handleDownloadPDF = async () => {
//     if (!pdfRef.current) return;
//     try {
//       await toast.promise(
//         (async () => {
//           const canvas = await html2canvas(pdfRef.current, {
//             scale: 2,
//             useCORS: true,
//             logging: false,
//             // ensure full layout is measured
//             windowWidth: document.documentElement.scrollWidth,
//             windowHeight: document.documentElement.scrollHeight,
//           });

//           const imgData = canvas.toDataURL("image/png");
//           const pdf = new jsPDF("p", "mm", "a4");

//           const pageWidth = pdf.internal.pageSize.getWidth();
//           const pageHeight = pdf.internal.pageSize.getHeight();
//           const margin = 10; // mm total margin on each side
//           const printableWidth = pageWidth - margin * 2;
//           const printableHeight = pageHeight - margin * 2;

//           // render image to printable width, compute resulting height
//           const imgWidth = printableWidth;
//           const imgHeight = (canvas.height * imgWidth) / canvas.width;

//           let position = margin;
//           let heightLeft = imgHeight;

//           // first page
//           pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
//           heightLeft -= printableHeight;

//           // additional pages (shift the same big image up with negative Y)
//           while (heightLeft > 0) {
//             pdf.addPage();
//             position = margin - (imgHeight - heightLeft);
//             pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
//             heightLeft -= printableHeight;
//           }

//           pdf.save(
//             `ClassyCaptures_Quotation_${quotation?.quotationId || ""}.pdf`
//           );
//         })(),
//         {
//           loading: "Generating PDF...",
//           success: "PDF downloaded successfully!",
//           error: "Failed to generate PDF.",
//         }
//       );
//     } catch (e) {
//       console.error(e);
//       toast.error("Error generating PDF");
//     }
//   };

//   const handleShareWhatsApp = async () => {
//     if (!quotation) return;

//     const whatsappNo =
//       quotation?.leadId?.persons?.[0]?.whatsappNo ||
//       quotation?.leadId?.persons?.[0]?.phoneNo;

//     if (!whatsappNo) {
//       alert("WhatsApp number not found for this client.");
//       return;
//     }

//     try {
//       // 1. Generate PDF
//       const canvas = await html2canvas(pdfRef.current, {
//         scale: 2,
//         useCORS: true,
//         windowWidth: document.documentElement.scrollWidth,
//         windowHeight: document.documentElement.scrollHeight,
//       });

//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");

//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const imgHeight = (canvas.height * pageWidth) / canvas.width;
//       pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

//       // 2. Save PDF locally (user will attach it manually in WhatsApp)
//       pdf.save(`Quotation_${quotation?.quotationId || ""}.pdf`);

//       // 3. Prepare WhatsApp message
//       const message = `Hello, please find attached your quotation (downloaded just now).`;
//       const encodedMsg = encodeURIComponent(message);

//       // 4. Open WhatsApp chat
//       window.open(`https://wa.me/${whatsappNo}?text=${encodedMsg}`, "_blank");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to generate & share PDF");
//     }
//   };

//   // ---------- Booking Handler ----------
//   const handleConfirmBooking = async () => {
//     if (!quotation) return;

//     // Case: no installments and totalAmount is 0
//     if (
//       (!quotation.installments || quotation.installments.length === 0) &&
//       Number(quotation.totalAmount) === 0
//     ) {
//       if (!window.confirm("Confirm booking with Grand Total ₹0?")) return;

//       try {
//         const res = await axios.put(
//           `${API_URL}/quotations/${id}/booking-status`,
//           {
//             status: "Booked",
//             queryId: quotation.queryId,
//           }
//         );

//         if (res.data.success) {
//           toast.success("Booking confirmed");
//           setQuotation(res.data.quotation);
//         } else {
//           toast.error(res.data.message || "Failed to confirm booking");
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Error confirming booking");
//       }
//     } else {
//       // Navigate to installment page if installments exist
//       navigate(`/payment/installment-details/${quotation._id}`);
//     }
//   };

//   // ---------- early returns ----------
//   if (loading) {
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ height: "80vh" }}
//       >
//         <Spinner animation="border" role="status" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container py-5">
//         <Alert variant="danger">{error}</Alert>
//         <Button variant="primary" onClick={() => navigate(-1)}>
//           Go Back
//         </Button>
//       </div>
//     );
//   }

//   const q = quotation || {};
//   const lead = q.leadId;
//   const hasPackages =
//     Number(q.totalPackageAmt || 0) > 0 && (q.packages || []).length > 0;
//   const hasAlbums = (q.albums || []).length > 0;

//   const totalPackageAmt = Number(q.totalPackageAmt || 0);
//   const totalAlbumAmount = Number(q.totalAlbumAmount || albumSubtotalMemo || 0);
//   const totalBeforeDiscount = totalPackageAmt + totalAlbumAmount;

//   const discountValue = Number(q.discountValue || 0); // Only amount
//   const gstApplied = !!q.gstApplied;

//   const grandTotal = Number(q.totalAmount);

//   const gstValue = Number.isFinite(Number(q.gstValue))
//     ? Number(q.gstValue)
//     : Math.round(gstApplied ? (grandTotal / 1.18) * 0.18 : 0);

//   const hasInstallments = (q.installments || []).length > 0;

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     if (Number.isNaN(d.getTime())) return dateStr;
//     const dd = String(d.getDate()).padStart(2, "0");
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     const yy = d.getFullYear();
//     return `${dd}-${mm}-${yy}`;
//   };

//   return (
//     <>
//       <style>
//         {`
//           table th, table td { padding: 0.4rem !important; }
//           h5, h6 { font-size: 1rem !important; }
//           .card-header { padding: 0.4rem 0.6rem !important; }
//           .card-body { padding: 0.6rem !important; }
//         `}
//       </style>

//       <div className="container py-4" style={{ fontSize: "0.85rem" }}>
//         {/* Controls (not part of the PDF as they're outside pdfRef) */}
//         <div
//           className="d-flex gap-3 mb-4 position-sticky top-0 bg-white py-2"
//           style={{ zIndex: 1000 }}
//         >
//           <Button
//             variant="light"
//             className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
//             style={{ background: "#f4f4f4", fontWeight: 500 }}
//             onClick={handleShareWhatsApp}
//           >
//             <FaWhatsapp className="text-success" /> Share
//           </Button>
//           <Button
//             variant="light"
//             className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
//             style={{ background: "#fff", fontWeight: 500 }}
//             onClick={handleDownloadPDF}
//           >
//             <FaDownload /> Download PDF
//           </Button>

//           {q?.bookingStatus === "NotBooked" && (
//             <Button
//               variant="light"
//               className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
//               style={{ background: "#fff", fontWeight: 500 }}
//               onClick={() =>
//                 navigate(
//                   `/customer/create-quote/${q.leadId?._id || ""}/${q.queryId}`,
//                   { state: { selectQuotationId: q._id } }
//                 )
//               }
//             >
//               <FaEdit /> Edit Quotation
//             </Button>
//           )}
//         </div>

//         {/* Quotation content captured to PDF */}
//         <div ref={pdfRef}>
//           {/* Letterhead */}
//           <div className="text-center mb-4">
//             <h2 className="fw-bold">Classy Captures</h2>
//             <p className="text-muted mb-0">
//               Professional Photography & Videography
//             </p>
//             <p className="text-muted mb-0">
//               123 Photography Lane, Bangalore - 560001
//             </p>
//             <p className="text-muted">
//               +91 98765 43210 | info@classycaptures.com
//             </p>
//           </div>
//           <hr className="my-4" />

//           {/* Header */}
//           <div className="mb-4">
//             <h5 className="fw-bold text-center mb-4">QUOTATION</h5>
//             <Row>
//               <Col md={6}>
//                 <h6 className="fw-bold mb-3">CLIENT DETAILS</h6>
//                 <p className="mb-1">
//                   <strong>Name:</strong> {lead?.persons?.[0]?.name || "N/A"}
//                 </p>
//                 <p className="mb-1">
//                   <strong>Phone:</strong> {lead?.persons?.[0]?.phoneNo || "N/A"}
//                 </p>
//                 <p className="mb-1">
//                   <strong>Email:</strong> {lead?.persons?.[0]?.email || "N/A"}
//                 </p>
//                 <p className="mb-1">
//                   <strong>Whatsapp:</strong>{" "}
//                   {lead?.persons?.[0]?.whatsappNo ||
//                     lead?.persons?.[0]?.phoneNo ||
//                     "N/A"}
//                 </p>
//                 <p className="mb-1">
//                   <strong>Reference:</strong> {lead?.referenceForm || "N/A"}
//                 </p>
//               </Col>

//               <Col md={6} className="text-md-end">
//                 <h6 className="fw-bold mb-3">QUOTATION DETAILS</h6>
//                 <p className="mb-1">
//                   <strong>Quotation ID:</strong> {q.quotationId}
//                 </p>
//                 <p className="mb-1">
//                   <strong>Title:</strong> {q.quoteTitle}
//                 </p>
//                 <p className="mb-1">
//                   {/* <strong>Description:</strong> {q.quoteDescription} */}
//                 </p>
//                 <p className="mb-1">
//                   <strong>Created Date:</strong> {formatDate(q.createdAt)}
//                 </p>
//                 <p className="mb-1">
//                   <strong>Status: </strong>
//                   <span className="bg-success bg-opacity-50 fw-bold fs-6 p-1 rounded">
//                     {" "}
//                     {q.bookingStatus}
//                   </span>
//                 </p>
//               </Col>
//             </Row>
//           </div>

//           {/* Packages */}
//           {hasPackages && (
//             <div className="mb-4">
//               <h5 className="fw-bold mb-3">PACKAGE DETAILS</h5>
//               {(q.packages || []).map((pkg, index) => {
//                 const pkgTotal = (pkg.services || []).reduce(
//                   (sum, s) =>
//                     sum + (Number(s.price) || 0) * (Number(s.qty) || 1),
//                   0
//                 );
//                 return (
//                   <Card className="mb-3 border" key={pkg._id || index}>
//                     <Card.Header className="bg-light">
//                       <h6 className="fw-bold mb-0">
//                         {pkg.categoryName && pkg.categoryName.includes(" - ")
//                           ? pkg.categoryName.split(" - ")[0]
//                           : pkg.categoryName}
//                       </h6>
//                       <small className="text-muted d-block">
//                         {formatDate(pkg.eventStartDate)} to{" "}
//                         {formatDate(pkg.eventEndDate)} | {pkg.slot}
//                       </small>
//                       {(pkg.venueName || pkg.venueAddress) && (
//                         <div className="mt-2">
//                           {pkg.venueName && (
//                             <small className=" d-block">
//                               <strong>Venue:</strong> {pkg.venueName}
//                             </small>
//                           )}
//                           {pkg.venueAddress && (
//                             <small className=" d-block">
//                               <strong>Address:</strong> {pkg.venueAddress}
//                             </small>
//                           )}
//                         </div>
//                       )}
//                     </Card.Header>
//                     <Card.Body className="p-0">
//                       <Table bordered hover responsive className="mb-0">
//                         <thead className="table-light">
//                           <tr>
//                             <th style={{ width: "5%" }}>No</th>
//                             <th style={{ width: "55%" }}>Service</th>
//                             <th
//                               className="text-center"
//                               style={{ width: "10%" }}
//                             >
//                               Qty
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {(pkg.services || []).map((service, idx) => (
//                             <tr key={service._id || idx}>
//                               <td className="text-center">{idx + 1}</td>
//                               <td>{service.serviceName}</td>
//                               <td className="text-center">{service.qty}</td>
//                             </tr>
//                           ))}
//                           <tr className="fw-bold">
//                             <td colSpan="2" className="text-left">
//                               Package Total:
//                             </td>
//                             <td className="text-left">{money(pkgTotal)}</td>
//                           </tr>
//                         </tbody>
//                       </Table>
//                     </Card.Body>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}

//           {/* Albums */}
//           {hasAlbums && (
//             <div className="mb-4">
//               <h5 className="fw-bold mb-3">ALBUMS</h5>
//               {(q.albums || []).map((a, i) => {
//                 const tplLabel =
//                   a?.snapshot?.templateLabel || a?.templateId || "-";
//                 const boxLabel = a?.snapshot?.boxLabel || a?.boxTypeId || "-";
//                 const qty = Math.max(1, Number(a?.qty) || 1);
//                 const unitPriceAlbumOnly = Number(a?.unitPrice) || 0;
//                 const total = computeAlbumTotalLocal(a);

//                 const sheetCatalog = Array.isArray(a?.snapshot?.sheetTypes)
//                   ? a.snapshot.sheetTypes
//                   : [];
//                 const getSheet = (id) =>
//                   sheetCatalog.find((s) => s.id === id) || {};
//                 const entriesWithQty = (obj) =>
//                   Object.entries(obj || {}).filter(
//                     ([, v]) => (Number(v) || 0) > 0
//                   );

//                 const extrasShared = a?.extras?.shared || {};
//                 const extrasPerUnitRaw = Array.isArray(a?.extras?.perUnit)
//                   ? a.extras.perUnit
//                   : [];

//                 const extrasPerUnit = Array.from({ length: qty }).map(
//                   (_, idx) => {
//                     const e = extrasPerUnitRaw[idx];
//                     if (e instanceof Map) return Object.fromEntries(e);
//                     return e || {};
//                   }
//                 );

//                 const isPerUnit =
//                   !!a?.customizePerUnit &&
//                   extrasPerUnit.some((o) =>
//                     Object.values(o).some((v) => Number(v) > 0)
//                   );

//                 return (
//                   <Card className="mb-3 border" key={a._id || i}>
//                     <Card.Header className="bg-light d-flex justify-content-between align-items-start">
//                       <div>
//                         <div className="fw-bold">{tplLabel}</div>
//                         <small className="text-muted">
//                           Box: {boxLabel} &nbsp;•&nbsp; Qty: {qty}
//                         </small>
//                       </div>
//                       <div className="text-end">
//                         <div className="small text-muted">
//                           Unit Price (album only)
//                         </div>
//                         <div className="fw-semibold">
//                           {money(unitPriceAlbumOnly)}
//                         </div>
//                       </div>
//                     </Card.Header>

//                     <Card.Body className="p-0">
//                       <Table bordered hover responsive className="mb-0">
//                         <thead className="table-light">
//                           <tr>
//                             <th style={{ width: "6%" }}>#</th>
//                             <th>Album</th>
//                             <th>Box</th>
//                             <th className="text-center" style={{ width: "8%" }}>
//                               Qty
//                             </th>
//                             <th style={{ width: "18%" }}>Unit Price (album)</th>
//                             <th className="text-end" style={{ width: "18%" }}>
//                               Total
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td>{String(i + 1).padStart(2, "0")}</td>
//                             <td className="fw-semibold">{tplLabel}</td>
//                             <td>{boxLabel}</td>
//                             <td className="text-center">{qty}</td>
//                             <td>{money(unitPriceAlbumOnly)}</td>
//                             <td className="text-end fw-semibold">
//                               {money(total)}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </Table>

//                       {/* Extras Breakdown */}
//                       <div className="p-3">
//                         <div className="fw-semibold mb-2">Extra Sheets</div>

//                         {!isPerUnit ? (
//                           <>

//                             {entriesWithQty(extrasShared).length > 0 ? (
//                               <Table size="sm" bordered>
//                                 <thead>
//                                   <tr>
//                                     <th>Type</th>
//                                     <th>Qty / unit</th>
//                                     <th>Price / sheet</th>
//                                     <th>Cost / unit</th>
//                                     <th className="text-end">
//                                       Total (all units)
//                                     </th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {entriesWithQty(extrasShared).map(
//                                     ([k, v]) => {
//                                       const sheet = getSheet(k);
//                                       const price = Number(sheet.price) || 0;
//                                       const qtyPerUnit = Number(v) || 0;
//                                       const costPerUnit = qtyPerUnit * price;
//                                       const totalAllUnits = costPerUnit * qty;
//                                       return (
//                                         <tr key={k}>
//                                           <td>{sheet.label || k}</td>
//                                           <td>{qtyPerUnit}</td>
//                                           <td>{money(price)}</td>
//                                           <td>{money(costPerUnit)}</td>
//                                           <td className="text-end">
//                                             {money(totalAllUnits)}
//                                           </td>
//                                         </tr>
//                                       );
//                                     }
//                                   )}
//                                 </tbody>
//                               </Table>
//                             ) : (
//                               <div className="text-muted">
//                                 No extra sheets selected.
//                               </div>
//                             )}
//                           </>
//                         ) : (
//                           <>
//                             <div className="text-muted small mb-2">
//                               Customized <strong>per unit</strong>
//                             </div>
//                             {Array.from({ length: qty }).map((_, idx) => {
//                               const rows = entriesWithQty(
//                                 extrasPerUnit[idx] || {}
//                               );
//                               return (
//                                 <div key={idx} className="mb-2">
//                                   <div className="text-muted mb-1">
//                                     Unit {String(idx + 1).padStart(2, "0")}
//                                   </div>
//                                   {rows.length > 0 ? (
//                                     <Table size="sm" bordered>
//                                       <thead>
//                                         <tr>
//                                           <th>Type</th>
//                                           <th>Qty</th>
//                                           <th>Price / sheet</th>
//                                           <th>Cost</th>
//                                         </tr>
//                                       </thead>
//                                       <tbody>
//                                         {rows.map(([k, v]) => {
//                                           const sheet = getSheet(k);
//                                           const price =
//                                             Number(sheet.price) || 0;
//                                           const qn = Number(v) || 0;
//                                           const cost = qn * price;
//                                           return (
//                                             <tr key={k}>
//                                               <td>{sheet.label || k}</td>
//                                               <td>{qn}</td>
//                                               <td>{money(price)}</td>
//                                               <td>{money(cost)}</td>
//                                             </tr>
//                                           );
//                                         })}
//                                       </tbody>
//                                     </Table>
//                                   ) : (
//                                     <div className="text-muted">
//                                       No extra sheets.
//                                     </div>
//                                   )}
//                                 </div>
//                               );
//                             })}
//                           </>
//                         )}
//                       </div>
//                     </Card.Body>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}

//           <div className="my-4">
//             {totalPackageAmt !== 0 && (
//               <div className="d-flex justify-content-between">
//                 <div className="fw-bold">Total Package Amount</div>
//                 <div className="fw-bold">{money(totalPackageAmt)}</div>
//               </div>
//             )}
//             {totalAlbumAmount !== 0 && (
//               <div className="d-flex justify-content-between">
//                 <div className="fw-bold">Albums Subtotal</div>
//                 <div className="fw-bold">{money(totalAlbumAmount)}</div>
//               </div>
//             )}

//             {discountValue !== 0 && (
//               <div className="d-flex justify-content-between">
//                 <div className="fw-bold">Discount</div>
//                 <div className="fw-bold">- {money(discountValue)}</div>
//               </div>
//             )}

//             {gstValue !== 0 && (
//               <div className="d-flex justify-content-between">
//                 <div className="fw-bold">Gst (18%) </div>
//                 <div className="fw-bold">{money(gstValue)}</div>
//               </div>
//             )}

//             <div className="d-flex justify-content-between">
//               <div className="fw-bold">Grand Total</div>
//               <div className="fw-bold">{money(grandTotal)}</div>
//             </div>
//           </div>
//            <hr />
//             {q?.quoteNote && (
//               <div className="mt-2 fw-bold fs-6 bg-warning p-2 rounded bg-opacity-25">
//                 Note : <span>{q?.quoteNote || "N/A"}</span>
//               </div>
//             )}

//           {/* Show installments only if they exist */}
//           {/* Installments Section */}
//           {hasInstallments && (
//             <div className="mb-4">
//               <h5 className="fw-bold mb-3">PAYMENT SCHEDULE</h5>

//               {q.bookingStatus === "Booked" ? (
//                 // ✅ Show detailed booking style table
//                 <Table bordered responsive>
//                   <thead className="table-light">
//                     <tr>
//                       <th>Installment</th>
//                       <th>Percentage</th>
//                       <th>Amount</th>
//                       <th>Paid Amt</th>
//                       <th>Pending Amt</th>
//                       <th>Date</th>
//                       <th>Mode</th>
//                       <th>Status</th>
//                       <th>Account Holder</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {q.installments.map((inst, idx) => (
//                       <tr key={inst._id || idx}>
//                         <td>Installment {inst.installmentNumber || idx + 1}</td>
//                         <td>{inst.paymentPercentage || 0}%</td>
//                         <td>{money(inst.paymentAmount)}</td>
//                         <td>{money(inst.paidAmount || 0)}</td>
//                         <td>{money(inst.pendingAmount || 0)}</td>
//                         <td>{inst.dueDate || "-"}</td>
//                         <td>{inst.paymentMode || "-"}</td>
//                         <td>{inst.status || "-"}</td>
//                         <td>
//                           {inst.accountHolders?.length
//                             ? inst.accountHolders.map((a) => a.name).join(", ")
//                             : "-"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               ) : (
//                 // ✅ Keep simple schedule before booking
//                 <Table bordered responsive>
//                   <thead className="table-light">
//                     <tr>
//                       <th>No</th>
//                       <th>Installment</th>
//                       <th>Percentage</th>
//                       <th>Amount</th>
//                       <th>Due Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {q.installments.map((inst, idx) => {
//                       const pct = Number(inst.paymentPercentage) || 0;
//                       const amt =
//                         Number(inst.paymentAmount) > 0
//                           ? Number(inst.paymentAmount)
//                           : Math.round((grandTotal * pct) / 100);
//                       return (
//                         <tr key={inst._id || idx}>
//                           <td>{idx + 1}</td>
//                           <td>
//                             Installment {inst.installmentNumber || idx + 1}
//                           </td>
//                           <td>{pct}%</td>
//                           <td>{money(amt)}</td>
//                           <td>
//                             {inst.dueDate ? formatDate(inst.dueDate) : "-"}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </Table>
//               )}
//             </div>
//           )}

//           {/* Terms */}
//           <div className="mb-4">
//             <h5 className="fw-bold mb-3">TERMS AND CONDITIONS</h5>
//             <ol className="ps-3">
//               <li className="mb-2">
//                 This quotation is valid for 30 days from the date of issue.
//               </li>
//               <li className="mb-2">
//                 A booking fee of {q.installments?.[0]?.paymentPercentage ?? 30}%
//                 is required to confirm the booking.
//               </li>
//               <li className="mb-2">All payments are non-refundable.</li>
//               <li className="mb-2">
//                 Any additional hours or services will be charged separately.
//               </li>
//               <li className="mb-2">
//                 Delivery of final products will be within 45-60 days after the
//                 event.
//               </li>
//               <li className="mb-2">
//                 Travel outside of city limits may incur additional charges.
//               </li>
//             </ol>
//           </div>

//           {/* Footer / Signatures — these will now appear in the PDF */}
//           <div className="mt-5 pt-4">
//             <Row>
//               <Col md={6}>
//                 <p className="mb-0 fw-bold">Client Signature</p>
//                 <p className="text-muted">________________</p>
//               </Col>
//               <Col md={6} className="text-end">
//                 <p className="mb-0 fw-bold">For Classy Captures</p>
//                 <p className="text-muted">________________</p>
//               </Col>
//             </Row>
//           </div>
//           <div className="text-center mt-5 pt-4 text-muted">
//             <p>Thank you for choosing Classy Captures!</p>
//             <p className="small">
//               © {new Date().getFullYear()} Classy Captures. All rights reserved.
//             </p>
//           </div>
//         </div>

//         {/* Confirm Button */}
//         {q?.finalized && q?.bookingStatus === "Not Booked" && (
//           <div className="d-flex justify-content-end mt-4">
//             <Button
//               variant="success"
//               className="px-4"
//               onClick={handleConfirmBooking}
//             >
//               Confirm Booking
//             </Button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default FinalizedQuotation;

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import { FaWhatsapp, FaDownload, FaEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { API_URL } from "../../utils/api";

const money = (n) => `₹${(Number(n) || 0).toLocaleString()}`;

// ------- album helpers (pure local compute; no APIs) -------
const toPlain = (m) => (m instanceof Map ? Object.fromEntries(m) : m || {});
const calcExtrasCost = (extrasObj = {}, sheetCatalog = []) =>
  sheetCatalog.reduce(
    (sum, s) => sum + (Number(extrasObj?.[s.id]) || 0) * (Number(s.price) || 0),
    0,
  );

const computeAlbumTotalLocal = (a) => {
  if (!a) return 0;
  const suggestedTotal = Number(a?.suggested?.finalTotal);
  if (!Number.isNaN(suggestedTotal) && suggestedTotal > 0)
    return suggestedTotal;

  const qty = Math.max(1, Number(a.qty) || 1);
  const unitAlbumPrice = Number(a.unitPrice) || 0;
  const boxPerUnit =
    Number(a?.suggested?.boxPerUnit) ||
    Number(a?.snapshot?.boxSurchargeAtSave) ||
    0;

  const sheetCatalog = Array.isArray(a?.snapshot?.sheetTypes)
    ? a.snapshot.sheetTypes
    : [];

  const extrasShared = toPlain(a?.extras?.shared);
  const extrasPerUnit = Array.isArray(a?.extras?.perUnit)
    ? a.extras.perUnit.map(toPlain)
    : [];

  if (a?.customizePerUnit && extrasPerUnit.length > 0) {
    const perUnitTotals = Array.from({ length: qty }, (_, i) => {
      const extraCost = calcExtrasCost(extrasPerUnit[i] || {}, sheetCatalog);
      return unitAlbumPrice + extraCost + boxPerUnit;
    });
    return perUnitTotals.reduce((s, v) => s + v, 0);
  }

  const sharedCost = calcExtrasCost(extrasShared, sheetCatalog);
  const finalUnit = unitAlbumPrice + sharedCost + boxPerUnit;
  return finalUnit * qty;
};

const albumSubtotalFromQuote = (albums = [], fallbackTotal) => {
  if (Number(fallbackTotal) > 0) return Number(fallbackTotal);
  return (albums || []).reduce((s, a) => s + computeAlbumTotalLocal(a), 0);
};

const getBookingStatusStyle = (statusRaw) => {
  const s = (statusRaw || "").trim().toLowerCase();

  if (s === "cancelled") return { color: "red" };
  if (s === "booked") return { color: "green" };
  if (s === "not booked" || s === "notbooked") return { color: "blue" };

  return { color: "#111" };
};

const getBookingStatusBadgeStyle = (statusRaw) => {
  const s = (statusRaw || "").trim().toLowerCase();

  if (s === "cancelled")
    return {
      color: "red",
      backgroundColor: "rgba(255,0,0,0.12)",
      border: "1px solid rgba(255,0,0,0.25)",
    };

  if (s === "booked")
    return {
      color: "green",
      backgroundColor: "rgba(0,128,0,0.12)",
      border: "1px solid rgba(0,128,0,0.25)",
    };

  if (s === "not booked" || s === "notbooked")
    return {
      color: "blue",
      backgroundColor: "rgba(0,0,255,0.12)",
      border: "1px solid rgba(0,0,255,0.25)",
    };

  return {
    color: "#111",
    backgroundColor: "rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.10)",
  };
};

// ===================== Component =====================
const FinalizedQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const pdfRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/quotations/${id}`);
        const data = await res.json();
        if (data?.success) {
          setQuotation(data.quotation);
          setError("");
        } else {
          setError("Quotation not found.");
          setQuotation(null);
        }
      } catch {
        setError("Failed to load quotation. Please try again.");
        setQuotation(null);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id]);

  const albumSubtotalMemo = useMemo(
    () =>
      albumSubtotalFromQuote(
        quotation?.albums || [],
        quotation?.totalAlbumAmount,
      ),
    [quotation],
  );

  // ---------------- Handlers ----------------
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    try {
      await toast.promise(
        (async () => {
          const canvas = await html2canvas(pdfRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight,
          });

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 10;
          const printableWidth = pageWidth - margin * 2;
          const printableHeight = pageHeight - margin * 2;

          const imgWidth = printableWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let position = margin;
          let heightLeft = imgHeight;

          pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
          heightLeft -= printableHeight;

          while (heightLeft > 0) {
            pdf.addPage();
            position = margin - (imgHeight - heightLeft);
            pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
            heightLeft -= printableHeight;
          }

          pdf.save(
            `ClassyCaptures_Quotation_${quotation?.quotationId || ""}.pdf`,
          );
        })(),
        {
          loading: "Generating PDF...",
          success: "PDF downloaded successfully!",
          error: "Failed to generate PDF.",
        },
      );
    } catch (e) {
      console.error(e);
      toast.error("Error generating PDF");
    }
  };

  const handleShareWhatsApp = async () => {
    if (!quotation) return;

    const whatsappNo =
      quotation?.leadId?.persons?.[0]?.whatsappNo ||
      quotation?.leadId?.persons?.[0]?.phoneNo;

    if (!whatsappNo) {
      alert("WhatsApp number not found for this client.");
      return;
    }

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

      pdf.save(`Quotation_${quotation?.quotationId || ""}.pdf`);

      const message = `Hello, please find attached your quotation (downloaded just now).`;
      const encodedMsg = encodeURIComponent(message);

      window.open(`https://wa.me/${whatsappNo}?text=${encodedMsg}`, "_blank");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate & share PDF");
    }
  };

  const handleConfirmBooking = async () => {
    if (!quotation) return;

    if (
      (!quotation.installments || quotation.installments.length === 0) &&
      Number(quotation.totalAmount) === 0
    ) {
      if (!window.confirm("Confirm booking with Grand Total ₹0?")) return;

      try {
        const res = await axios.put(
          `${API_URL}/quotations/${id}/booking-status`,
          {
            status: "Booked",
            queryId: quotation.queryId,
          },
        );

        if (res.data.success) {
          toast.success("Booking confirmed");
          setQuotation(res.data.quotation);
        } else {
          toast.error(res.data.message || "Failed to confirm booking");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error confirming booking");
      }
    } else {
      navigate(`/payment/installment-details/${quotation._id}`);
    }
  };

  // ---------- early returns ----------
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const q = quotation || {};
  const lead = q.leadId;

  const hasPackages =
    Number(q.totalPackageAmt || 0) > 0 && (q.packages || []).length > 0;
  const hasAlbums = (q.albums || []).length > 0;

  // ✅ Additional services
  const additionalServices = Array.isArray(q.additionalServices)
    ? q.additionalServices
    : [];
  const hasAdditionalServices = additionalServices.length > 0;

  // totals
  const totalPackageAmt = Number(q.totalPackageAmt || 0);
  const totalAlbumAmount = Number(q.totalAlbumAmount || albumSubtotalMemo || 0);

  // ✅ Prefer backend totalAdditionalServiceAmount if present, else compute from list
  const totalAdditionalServiceAmount = Number.isFinite(
    Number(q.totalAdditionalServiceAmount),
  )
    ? Number(q.totalAdditionalServiceAmount)
    : additionalServices.reduce((s, a) => s + (Number(a?.price) || 0), 0);

  // ✅ include additional services in before-discount total
  const totalBeforeDiscount =
    totalPackageAmt + totalAlbumAmount + totalAdditionalServiceAmount;

  const discountValue = Number(q.discountValue || 0);
  const gstApplied = !!q.gstApplied;

  const grandTotal = Number(q.totalAmount);

  const gstValue = Number.isFinite(Number(q.gstValue))
    ? Number(q.gstValue)
    : Math.round(gstApplied ? (grandTotal / 1.18) * 0.18 : 0);

  const hasInstallments = (q.installments || []).length > 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}-${mm}-${yy}`;
  };

  return (
    <>
      <style>
        {`
          table th, table td { padding: 0.4rem !important; }
          h5, h6 { font-size: 1rem !important; }
          .card-header { padding: 0.4rem 0.6rem !important; }
          .card-body { padding: 0.6rem !important; }
        `}
      </style>

      <div className="container py-4" style={{ fontSize: "0.85rem" }}>
        {/* Controls */}
        <div
          className="d-flex gap-3 mb-4 position-sticky top-0 bg-white py-2"
          style={{ zIndex: 1000 }}
        >
          {/* <Button
            variant="light"
            className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
            style={{ background: "#f4f4f4", fontWeight: 500 }}
            onClick={handleShareWhatsApp}
          >
            <FaWhatsapp className="text-success" /> Share
          </Button> */}

          <Button
            variant="light"
            className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
            style={{ background: "#fff", fontWeight: 500 }}
            onClick={handleDownloadPDF}
          >
            <FaDownload /> Download PDF
          </Button>

          {q?.bookingStatus === "Not Booked"  && (
            <Button
              variant="light"
              className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
              style={{ background: "#fff", fontWeight: 500 }}
              onClick={() =>
                navigate(
                  `/customer/create-quote/${q.leadId?._id || ""}/${q.queryId}`,
                  {
                    state: { selectQuotationId: q._id },
                  },
                )
              }
            >
              <FaEdit /> Edit Quotation
            </Button>
          )}
        </div>

        {/* Quotation content captured to PDF */}
        <div ref={pdfRef}>
          {/* Letterhead */}
          <div className="text-center mb-4">
            <h2 className="fw-bold">Classy Captures</h2>
            <p className="text-muted mb-0">
              Professional Photography & Videography
            </p>
            <p className="text-muted mb-0">
              123 Photography Lane, Bangalore - 560001
            </p>
            <p className="text-muted">
              +91 98765 43210 | info@classycaptures.com
            </p>
          </div>
          <hr className="my-4" />

          {/* Header */}
          <div className="mb-4">
            <h5 className="fw-bold text-center mb-4">QUOTATION</h5>
            <Row>
              <Col md={6}>
                <h6 className="fw-bold mb-3">CLIENT DETAILS</h6>
                <p className="mb-1">
                  <strong>Name:</strong> {lead?.persons?.[0]?.name || "N/A"}
                </p>
                <p className="mb-1">
                  <strong>Phone:</strong> {lead?.persons?.[0]?.phoneNo || "N/A"}
                </p>
                <p className="mb-1">
                  <strong>Email:</strong> {lead?.persons?.[0]?.email || "N/A"}
                </p>
                <p className="mb-1">
                  <strong>Whatsapp:</strong>{" "}
                  {lead?.persons?.[0]?.whatsappNo ||
                    lead?.persons?.[0]?.phoneNo ||
                    "N/A"}
                </p>
                <p className="mb-1">
                  <strong>Reference:</strong> {lead?.referenceForm || "N/A"}
                </p>
              </Col>

              <Col md={6} className="text-md-end">
                <h6 className="fw-bold mb-3">QUOTATION DETAILS</h6>
                <p className="mb-1">
                  <strong>Quotation ID:</strong> {q.quotationId}
                </p>
                <p className="mb-1">
                  <strong>Title:</strong> {q.quoteTitle}
                </p>
                <p className="mb-1">
                  <strong>Created Date:</strong> {formatDate(q.createdAt)}
                </p>
                <p className="mb-1">
                  <strong>Status: </strong>
                  <span
                    className="fw-bold fs-6 px-2 py-1 rounded"
                    style={{
                      ...getBookingStatusBadgeStyle(q.bookingStatus),
                      display: "inline-block",
                      lineHeight: 1.2,
                    }}
                  >
                    {q.bookingStatus}
                  </span>
                </p>
              </Col>
            </Row>
          </div>

          {/* Packages */}
          {hasPackages && (
            <div className="mb-4">
              <h5 className="fw-bold mb-3">PACKAGE DETAILS</h5>
              {(q.packages || []).map((pkg, index) => {
                const pkgTotal = (pkg.services || []).reduce(
                  (sum, s) =>
                    sum + (Number(s.price) || 0) * (Number(s.qty) || 1),
                  0,
                );
                return (
                  <Card className="mb-3 border" key={pkg._id || index}>
                    <Card.Header className="bg-light">
                      <h6 className="fw-bold mb-0">
                        {pkg.categoryName && pkg.categoryName.includes(" - ")
                          ? pkg.categoryName.split(" - ")[0]
                          : pkg.categoryName}
                      </h6>
                      <small className="text-muted d-block">
                        {formatDate(pkg.eventStartDate)} to{" "}
                        {formatDate(pkg.eventEndDate)} | {pkg.slot}
                      </small>
                      {(pkg.venueName || pkg.venueAddress) && (
                        <div className="mt-2">
                          {pkg.venueName && (
                            <small className=" d-block">
                              <strong>Venue:</strong> {pkg.venueName}
                            </small>
                          )}
                          {pkg.venueAddress && (
                            <small className=" d-block">
                              <strong>Address:</strong> {pkg.venueAddress}
                            </small>
                          )}
                        </div>
                      )}
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Table bordered hover responsive className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "5%" }}>No</th>
                            <th style={{ width: "55%" }}>Service</th>
                            <th
                              className="text-center"
                              style={{ width: "10%" }}
                            >
                              Qty
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(pkg.services || []).map((service, idx) => (
                            <tr key={service._id || idx}>
                              <td className="text-center">{idx + 1}</td>
                              <td>{service.serviceName}</td>
                              <td className="text-center">{service.qty}</td>
                            </tr>
                          ))}
                          <tr className="fw-bold">
                            <td colSpan="2" className="text-left">
                              Package Total:
                            </td>
                            <td className="text-left">{money(pkgTotal)}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Albums */}
          {hasAlbums && (
            <div className="mb-4">
              <h5 className="fw-bold mb-3">ALBUMS</h5>
              {(q.albums || []).map((a, i) => {
                const tplLabel =
                  a?.snapshot?.templateLabel || a?.templateId || "-";
                const boxLabel = a?.snapshot?.boxLabel || a?.boxTypeId || "-";
                const qty = Math.max(1, Number(a?.qty) || 1);
                const unitPriceAlbumOnly = Number(a?.unitPrice) || 0;
                const total = computeAlbumTotalLocal(a);

                const sheetCatalog = Array.isArray(a?.snapshot?.sheetTypes)
                  ? a.snapshot.sheetTypes
                  : [];
                const getSheet = (id) =>
                  sheetCatalog.find((s) => s.id === id) || {};
                const entriesWithQty = (obj) =>
                  Object.entries(obj || {}).filter(
                    ([, v]) => (Number(v) || 0) > 0,
                  );

                const extrasShared = a?.extras?.shared || {};
                const extrasPerUnitRaw = Array.isArray(a?.extras?.perUnit)
                  ? a.extras.perUnit
                  : [];

                const extrasPerUnit = Array.from({ length: qty }).map(
                  (_, idx) => {
                    const e = extrasPerUnitRaw[idx];
                    if (e instanceof Map) return Object.fromEntries(e);
                    return e || {};
                  },
                );

                const isPerUnit =
                  !!a?.customizePerUnit &&
                  extrasPerUnit.some((o) =>
                    Object.values(o).some((v) => Number(v) > 0),
                  );

                return (
                  <Card className="mb-3 border" key={a._id || i}>
                    <Card.Header className="bg-light d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold">{tplLabel}</div>
                        <small className="text-muted">
                          Box: {boxLabel} &nbsp;•&nbsp; Qty: {qty}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="small text-muted">
                          Total Album Price 
                        </div>
                        <div className="fw-semibold">
                          {money(unitPriceAlbumOnly)}
                        </div>
                      </div>
                    </Card.Header>

                    <Card.Body className="p-0">
                      <Table bordered hover responsive className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "6%" }}>#</th>
                            <th>Album</th>
                            <th>Box</th>
                          
                            <th style={{ width: "18%" }}>Album Price</th>
                           
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{String(i + 1).padStart(2, "0")}</td>
                            <td className="fw-semibold">{tplLabel}</td>
                            <td>{boxLabel}</td>
                         
                            <td>{money(unitPriceAlbumOnly)}</td>
                        
                          </tr>
                        </tbody>
                      </Table>

                      {/* Extras Breakdown */}
                      <div className="p-3">
                        <div className="fw-semibold mb-2">Extra Sheets</div>

                        {!isPerUnit ? (
                          <>
                            {entriesWithQty(extrasShared).length > 0 ? (
                              <Table size="sm" bordered>
                                <thead>
                                  <tr>
                                    <th>Type</th>
                                    <th>Qty / unit</th>
                                    <th>Price / sheet</th>
                                    <th>Cost / unit</th>
                                    <th className="text-end">
                                      Total (all units)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {entriesWithQty(extrasShared).map(
                                    ([k, v]) => {
                                      const sheet = getSheet(k);
                                      const price = Number(sheet.price) || 0;
                                      const qtyPerUnit = Number(v) || 0;
                                      const costPerUnit = qtyPerUnit * price;
                                      const totalAllUnits = costPerUnit * qty;
                                      return (
                                        <tr key={k}>
                                          <td>{sheet.label || k}</td>
                                          <td>{qtyPerUnit}</td>
                                          <td>{money(price)}</td>
                                          <td>{money(costPerUnit)}</td>
                                          <td className="text-end">
                                            {money(totalAllUnits)}
                                          </td>
                                        </tr>
                                      );
                                    },
                                  )}
                                </tbody>
                              </Table>
                            ) : (
                              <div className="text-muted">
                                No extra sheets selected.
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-muted small mb-2">
                              Customized <strong>per unit</strong>
                            </div>
                            {Array.from({ length: qty }).map((_, idx) => {
                              const rows = entriesWithQty(
                                extrasPerUnit[idx] || {},
                              );
                              return (
                                <div key={idx} className="mb-2">
                                  <div className="text-muted mb-1">
                                    Unit {String(idx + 1).padStart(2, "0")}
                                  </div>
                                  {rows.length > 0 ? (
                                    <Table size="sm" bordered>
                                      <thead>
                                        <tr>
                                          <th>Type</th>
                                          <th>Qty</th>
                                          <th>Price / sheet</th>
                                          <th>Cost</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {rows.map(([k, v]) => {
                                          const sheet = getSheet(k);
                                          const price =
                                            Number(sheet.price) || 0;
                                          const qn = Number(v) || 0;
                                          const cost = qn * price;
                                          return (
                                            <tr key={k}>
                                              <td>{sheet.label || k}</td>
                                              <td>{qn}</td>
                                              <td>{money(price)}</td>
                                              <td>{money(cost)}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </Table>
                                  ) : (
                                    <div className="text-muted">
                                      No extra sheets.
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ✅ Additional Services */}
          {hasAdditionalServices && (
            <div className="mb-4">
              <h5 className="fw-bold mb-3">ADDITIONAL SERVICES</h5>
              <Card className="border">
                <Card.Body className="p-0">
                  <Table bordered hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "6%" }}>No</th>
                        <th style={{ width: "34%" }}>Service</th>
                        <th>Description</th>
                        <th className="text-end" style={{ width: "18%" }}>
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {additionalServices.map((s, idx) => (
                        <tr key={s._id || idx}>
                          <td className="text-center">{idx + 1}</td>
                          <td className="fw-semibold">{s?.name || "-"}</td>
                          <td>{s?.description || "-"}</td>
                          <td className="text-end">{money(s?.price)}</td>
                        </tr>
                      ))}
                      <tr className="fw-bold">
                        <td colSpan="3">Additional Services Total</td>
                        <td className="text-end">
                          {money(totalAdditionalServiceAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          )}

          {/* Totals */}
          <div className="my-4">
            {totalPackageAmt !== 0 && (
              <div className="d-flex justify-content-between">
                <div className="fw-bold">Total Package Amount</div>
                <div className="fw-bold">{money(totalPackageAmt)}</div>
              </div>
            )}

            {totalAlbumAmount !== 0 && (
              <div className="d-flex justify-content-between">
                <div className="fw-bold">Albums Subtotal</div>
                <div className="fw-bold">{money(totalAlbumAmount)}</div>
              </div>
            )}

            {/* ✅ show additional service total in summary */}
            {totalAdditionalServiceAmount !== 0 && (
              <div className="d-flex justify-content-between">
                <div className="fw-bold">Additional Services</div>
                <div className="fw-bold">
                  {money(totalAdditionalServiceAmount)}
                </div>
              </div>
            )}

            {discountValue !== 0 && (
              <div className="d-flex justify-content-between">
                <div className="fw-bold">Discount</div>
                <div className="fw-bold">- {money(discountValue)}</div>
              </div>
            )}

            {gstValue !== 0 && (
              <div className="d-flex justify-content-between">
                <div className="fw-bold">Gst (18%)</div>
                <div className="fw-bold">{money(gstValue)}</div>
              </div>
            )}

            {/* Grand total from backend */}
            <div className="d-flex justify-content-between">
              <div className="fw-bold">Grand Total</div>
              <div className="fw-bold">{money(grandTotal)}</div>
            </div>

            {/* Optional: show computed total before discount for debugging (comment out if not needed) */}
            {/* <div className="d-flex justify-content-between text-muted small mt-1">
              <div>Total Before Discount</div>
              <div>{money(totalBeforeDiscount)}</div>
            </div> */}
          </div>

          <hr />
          {q?.quoteNote && (
            <div className="mt-2 fw-bold fs-6 bg-warning p-2 rounded bg-opacity-25">
              Note : <span>{q?.quoteNote || "N/A"}</span>
            </div>
          )}

          {/* Installments Section */}
          {hasInstallments && (
            <div className="mb-4">
              <h5 className="fw-bold mb-3">PAYMENT SCHEDULE</h5>

              {q.bookingStatus === "Booked" ? (
                <Table bordered responsive>
                  <thead className="table-light">
                    <tr>
                      <th>Installment</th>
                      <th>Percentage</th>
                      <th>Amount</th>
                      <th>Paid Amt</th>
                      <th>Pending Amt</th>
                      <th>Date</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Account Holder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.installments.map((inst, idx) => (
                      <tr key={inst._id || idx}>
                        <td>Installment {inst.installmentNumber || idx + 1}</td>
                        <td>{inst.paymentPercentage || 0}%</td>
                        <td>{money(inst.paymentAmount)}</td>
                        <td>{money(inst.paidAmount || 0)}</td>
                        <td>{money(inst.pendingAmount || 0)}</td>
                        <td>{inst.dueDate || "-"}</td>
                        <td>{inst.paymentMode || "-"}</td>
                        <td>{inst.status || "-"}</td>
                        <td>
                          {inst.accountHolders?.length
                            ? inst.accountHolders.map((a) => a.name).join(", ")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Table bordered responsive>
                  <thead className="table-light">
                    <tr>
                      <th>No</th>
                      <th>Installment</th>
                      <th>Percentage</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.installments.map((inst, idx) => {
                      const pct = Number(inst.paymentPercentage) || 0;
                      const amt =
                        Number(inst.paymentAmount) > 0
                          ? Number(inst.paymentAmount)
                          : Math.round((grandTotal * pct) / 100);
                      return (
                        <tr key={inst._id || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            Installment {inst.installmentNumber || idx + 1}
                          </td>
                          <td>{pct}%</td>
                          <td>{money(amt)}</td>
                          <td>
                            {inst.dueDate ? formatDate(inst.dueDate) : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </div>
          )}

          {/* Terms */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">TERMS AND CONDITIONS</h5>
            <ol className="ps-3">
              <li className="mb-2">
                This quotation is valid for 30 days from the date of issue.
              </li>
              <li className="mb-2">
                A booking fee of {q.installments?.[0]?.paymentPercentage ?? 30}%
                is required to confirm the booking.
              </li>
              <li className="mb-2">All payments are non-refundable.</li>
              <li className="mb-2">
                Any additional hours or services will be charged separately.
              </li>
              <li className="mb-2">
                Delivery of final products will be within 45-60 days after the
                event.
              </li>
              <li className="mb-2">
                Travel outside of city limits may incur additional charges.
              </li>
            </ol>
          </div>

          {/* Footer / Signatures */}
          <div className="mt-5 pt-4">
            <Row>
              <Col md={6}>
                <p className="mb-0 fw-bold">Client Signature</p>
                <p className="text-muted">________________</p>
              </Col>
              <Col md={6} className="text-end">
                <p className="mb-0 fw-bold">For Classy Captures</p>
                <p className="text-muted">________________</p>
              </Col>
            </Row>
          </div>

          <div className="text-center mt-5 pt-4 text-muted">
            <p>Thank you for choosing Classy Captures!</p>
            <p className="small">
              © {new Date().getFullYear()} Classy Captures. All rights reserved.
            </p>
          </div>
        </div>

        {/* Confirm Button */}
        {q?.finalized && q?.bookingStatus === "Not Booked" && (
          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="success"
              className="px-4"
              onClick={handleConfirmBooking}
            >
              Confirm Booking
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default FinalizedQuotation;
