// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import { Badge, Spinner, Alert, Button, Table } from "react-bootstrap";
// import dayjs from "dayjs";
// import { FaArrowLeft, FaSyncAlt, FaPrint } from "react-icons/fa";
// import { API_URL } from "../../utils/api";

// const DeliverableDetailPage = () => {
//   const { quotationId } = useParams();
//   const navigate = useNavigate();

//   const [deliverable, setDeliverable] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   const fetchDeliverable = async () => {
//     try {
//       setLoading(true);
//       setErr("");

//       const res = await axios.get(`${API_URL}/deliverables/${quotationId}`);

//       if (res.data?.success) {
//         setDeliverable(res.data.deliverable || null);
//       } else {
//         setDeliverable(null);
//         setErr(res.data?.message || "Deliverables not available");
//       }
//     } catch (e) {
//       console.error(e);
//       setDeliverable(null);
//       setErr(
//         e?.response?.data?.message ||
//           e?.message ||
//           "Failed to load deliverables",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDeliverable();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [quotationId]);

//   const snapshot = deliverable?.snapshot;

//   const summary = useMemo(() => {
//     const s = snapshot?.summary || {};
//     return {
//       sorted: s.totalSortedPhotos ?? 0,
//       edited: s.totalEditedPhotos ?? 0,
//       tradVideos: s.totalTraditionalVideos ?? 0,
//       candidVideos: s.totalCandidVideos ?? 0,
//       reels: s.totalReels ?? 0,
//       albums: s.totalAlbums ?? 0,
//     };
//   }, [snapshot]);

//   const hasAlbums = Array.isArray(snapshot?.albums) && snapshot.albums.length > 0;
//   const hasAddl =
//     Array.isArray(snapshot?.additionalServices) &&
//     snapshot.additionalServices.length > 0;

//   if (loading) {
//     return (
//       <div className="container py-4">
//         <div className="text-center py-4">
//           <Spinner animation="border" role="status" />
//           <div className="mt-2">Loading deliverables...</div>
//         </div>
//       </div>
//     );
//   }

//   if (err) {
//     return (
//       <div className="container py-4">
//         <div className="p-3 border rounded bg-white shadow-sm">
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <div className="fw-bold">DELIVERABLES</div>
//             <Button
//               variant="outline-dark"
//               size="sm"
//               onClick={() => navigate(-1)}
//             >
//               <FaArrowLeft className="me-2" />
//               Back
//             </Button>
//           </div>

//           <Alert variant="danger" className="mb-2">
//             {err}
//           </Alert>

//           <Button variant="outline-primary" size="sm" onClick={fetchDeliverable}>
//             <FaSyncAlt className="me-2" />
//             Retry
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (!snapshot) {
//     return (
//       <div className="container py-4">
//         <Alert variant="info">Deliverables not found.</Alert>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-4" style={{ fontSize: 13 }}>
//       {/* ---------- PDF LIKE SHEET ---------- */}
//       <div
//         id="deliverable-sheet"
//         className="bg-white shadow-sm border rounded"
//         style={{
//           maxWidth: 980,
//           margin: "0 auto",
//           padding: "22px 22px",
//         }}
//       >
//         {/* Header Top Row */}
//         <div className="d-flex justify-content-between align-items-start gap-3">
//           <div>
//             <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.2 }}>
//               Deliverables Sheet
//             </div>
//             <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
//               Final handover summary (photos / videos / albums / add-ons)
//             </div>
//           </div>

//           <div className="d-flex gap-2">
//             <Button
//               variant="outline-dark"
//               size="sm"
//               onClick={() => navigate(-1)}
//               style={{ fontSize: 12 }}
//             >
//               <FaArrowLeft className="me-2" />
//               Back
//             </Button>

//             <Button
//               variant="outline-dark"
//               size="sm"
//               onClick={fetchDeliverable}
//               style={{ fontSize: 12 }}
//             >
//               <FaSyncAlt className="me-2" />
//               Refresh
//             </Button>

//             <Button
//               variant="dark"
//               size="sm"
//               onClick={() => window.print()}
//               style={{ fontSize: 12 }}
//             >
//               <FaPrint className="me-2" />
//               Print
//             </Button>
//           </div>
//         </div>

//         {/* Divider */}
//         <div
//           style={{
//             height: 1,
//             background: "#e9ecef",
//             margin: "14px 0 12px",
//           }}
//         />

//         {/* Header Meta Block (PDF style) */}
//         <div className="row g-3">
//           <div className="col-md-7">
//             <div
//               className="border rounded"
//               style={{ padding: "12px 14px", background: "#fcfcfd" }}
//             >
//               <div className="row">
//                 <div className="col-6">
//                   <div className="text-muted" style={{ fontSize: 11 }}>
//                     Quotation ID
//                   </div>
//                   <div className="fw-bold" style={{ fontSize: 13 }}>
//                     {deliverable?.quotationUniqueId || "—"}
//                   </div>
//                 </div>
//                 <div className="col-6">
//                   <div className="text-muted" style={{ fontSize: 11 }}>
//                     Couples / Person
//                   </div>
//                   <div className="fw-bold" style={{ fontSize: 13 }}>
//                     {deliverable?.personName || "—"}
//                   </div>
//                 </div>
//               </div>

//               <div className="row mt-2">

//                 <div className="col-6">
//                   <div className="text-muted" style={{ fontSize: 11 }}>
//                     Finalized At
//                   </div>
//                   <div className="fw-semibold" style={{ fontSize: 13 }}>
//                     {deliverable?.finalizedAt
//                       ? dayjs(deliverable.finalizedAt).format("DD-MM-YYYY • hh:mm A")
//                       : "—"}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Summary (counts) */}
//           <div className="col-md-5">
//             <div
//               className="border rounded"
//               style={{ padding: "12px 14px", background: "#ffffff" }}
//             >
//               <div className="fw-bold" style={{ fontSize: 13 }}>
//                 Overall Summary
//               </div>

//               <div
//                 className="mt-2"
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: 10,
//                 }}
//               >
//                 <CountLine label="Sorted Photos" value={summary.sorted} />
//                 <CountLine label="Edited Photos" value={summary.edited} />
//                 <CountLine
//                   label="Traditional Videos"
//                   value={summary.tradVideos}
//                 />
//                 <CountLine label="Candid Videos" value={summary.candidVideos} />
//                 <CountLine label="Reels" value={summary.reels} />
//                 <CountLine label="Albums" value={summary.albums} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Divider */}
//         <div
//           style={{
//             height: 1,
//             background: "#e9ecef",
//             margin: "14px 0 14px",
//           }}
//         />

//         {/* Packages */}
//         <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
//           Event-wise Deliverables
//         </div>

//         {(snapshot.packages || []).map((p, idx) => {
//           const rows = p.deliverables || [];
//           const eventTotalPhotos = rows.reduce(
//             (s, d) => s + Number(d.photos ?? 0),
//             0,
//           );
//           const eventTotalVideos = rows.reduce(
//             (s, d) => s + Number(d.videos ?? 0),
//             0,
//           );
//           const eventTotalReels = rows.reduce(
//             (s, d) => s + Number(d.reels ?? 0),
//             0,
//           );

//           return (
//             <div
//               key={p.packageId || idx}
//               className="border rounded mb-3"
//               style={{ overflow: "hidden" }}
//             >
//               {/* Event header bar */}
//               <div
//                 className="d-flex justify-content-between align-items-center flex-wrap"
//                 style={{
//                   background: "#f6f7f9",
//                   padding: "10px 12px",
//                   borderBottom: "1px solid #e9ecef",
//                 }}
//               >
//                 <div>
//                   <div className="fw-bold" style={{ fontSize: 13 }}>
//                     {String(idx + 1).padStart(2, "0")}. {p.packageName || "—"}
//                   </div>
//                   <div className="text-muted" style={{ fontSize: 12 }}>
//                     {p.eventStartDate || p.eventEndDate
//                       ? `${p.eventStartDate || "—"} → ${p.eventEndDate || "—"}`
//                       : ""}
//                   </div>
//                 </div>

//                 <div className="d-flex gap-2 mt-2 mt-sm-0">
//                   <Badge bg="light" text="dark">
//                     Photos: <b>{eventTotalPhotos}</b>
//                   </Badge>
//                   <Badge bg="light" text="dark">
//                     Videos: <b>{eventTotalVideos}</b>
//                   </Badge>
//                   <Badge bg="light" text="dark">
//                     Reels: <b>{eventTotalReels}</b>
//                   </Badge>
//                 </div>
//               </div>

//               {/* Event table */}
//               <div style={{ padding: "10px 12px" }}>
//                 <Table bordered responsive size="sm" className="mb-0">
//                   <thead style={{ background: "#fcfcfd" }}>
//                     <tr style={{ fontSize: 12 }}>
//                       <th style={{ width: "44%" }}>Item</th>
//                       <th style={{ width: "10%" }} className="text-center">
//                         Photos
//                       </th>
//                       <th style={{ width: "10%" }} className="text-center">
//                         Videos
//                       </th>
//                       <th style={{ width: "10%" }} className="text-center">
//                         Reels
//                       </th>
//                       <th style={{ width: "13%" }}>Duration</th>
//                       <th style={{ width: "13%" }}>Notes</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {rows.map((d, j) => (
//                       <tr key={`${p.packageId}-${j}`}>
//                         <td>
//                           <div className="fw-semibold" style={{ fontSize: 13 }}>
//                             {d.label || d.type || "—"}
//                           </div>
//                           <div className="text-muted" style={{ fontSize: 11 }}>
//                             {d.type || ""}
//                           </div>
//                         </td>
//                         <td className="text-center">{d.photos ?? 0}</td>
//                         <td className="text-center">{d.videos ?? 0}</td>
//                         <td className="text-center">{d.reels ?? 0}</td>
//                         <td>{d.duration || "—"}</td>
//                         <td>{d.notes || "—"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot>
//                     <tr>
//                       <td className="text-end fw-bold">Event Total</td>
//                       <td className="text-center fw-bold">{eventTotalPhotos}</td>
//                       <td className="text-center fw-bold">{eventTotalVideos}</td>
//                       <td className="text-center fw-bold">{eventTotalReels}</td>
//                       <td colSpan={2}></td>
//                     </tr>
//                   </tfoot>
//                 </Table>
//               </div>
//             </div>
//           );
//         })}

//         {/* Albums (show only if exists) */}
//         {hasAlbums && (
//           <>
//             <div
//               style={{
//                 height: 1,
//                 background: "#e9ecef",
//                 margin: "14px 0 14px",
//               }}
//             />

//             <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
//               Albums
//             </div>

//             <div className="border rounded" style={{ overflow: "hidden" }}>
//               <Table bordered responsive size="sm" className="mb-0">
//                 <thead style={{ background: "#fcfcfd" }}>
//                   <tr style={{ fontSize: 12 }}>
//                     <th style={{ width: 70 }}>#</th>
//                     <th>Album</th>

//                   </tr>
//                 </thead>
//                 <tbody>
//                   {snapshot.albums.map((a, i) => (
//                     <tr key={a.albumId || i}>
//                       <td>{String(i + 1).padStart(2, "0")}</td>
//                       <td className="fw-semibold">{a.name}</td>

//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </div>
//           </>
//         )}

//         {/* Additional Services (show only if exists) */}
//         {hasAddl && (
//           <>
//             <div
//               style={{
//                 height: 1,
//                 background: "#e9ecef",
//                 margin: "14px 0 14px",
//               }}
//             />

//             <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
//               Additional Services
//             </div>

//             <div className="border rounded" style={{ overflow: "hidden" }}>
//               <Table bordered responsive size="sm" className="mb-0">
//                 <thead style={{ background: "#fcfcfd" }}>
//                   <tr style={{ fontSize: 12 }}>
//                     <th style={{ width: 70 }}>#</th>
//                     <th>Service</th>
//                     <th>Description</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {snapshot.additionalServices.map((s, i) => (
//                     <tr key={s.serviceId || i}>
//                       <td>{String(i + 1).padStart(2, "0")}</td>
//                       <td className="fw-semibold">{s.name || "—"}</td>
//                       <td className="text-muted" style={{ fontSize: 12 }}>
//                         {s.description || "—"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </div>
//           </>
//         )}

//         {/* Footer note (small, document style) */}
//         <div
//           className="text-muted"
//           style={{
//             fontSize: 11,
//             marginTop: 14,
//             paddingTop: 10,
//             borderTop: "1px solid #e9ecef",
//           }}
//         >
//           Generated from finalized deliverables snapshot.
//         </div>
//       </div>

//       {/* Optional: Print CSS for this page */}
//       <style>{`
//         @media print {
//           body {
//             background: #fff !important;
//           }
//           .container {
//             max-width: 100% !important;
//           }
//           button, .btn {
//             display: none !important;
//           }
//           #deliverable-sheet {
//             box-shadow: none !important;
//             border: none !important;
//             padding: 0 !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default DeliverableDetailPage;

// function CountLine({ label, value }) {
//   return (
//     <div
//       className="d-flex justify-content-between align-items-center"
//       style={{
//         border: "1px solid #e9ecef",
//         borderRadius: 8,
//         padding: "8px 10px",
//         background: "#fcfcfd",
//       }}
//     >
//       <div className="text-muted" style={{ fontSize: 12 }}>
//         {label}
//       </div>
//       <div className="fw-bold" style={{ fontSize: 13 }}>
//         {value ?? 0}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Spinner, Alert, Button } from "react-bootstrap";
import dayjs from "dayjs";
import { FaArrowLeft, FaSyncAlt, FaPrint } from "react-icons/fa";
import { API_URL } from "../../utils/api";

const DeliverableDetailPage = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();

  const [deliverable, setDeliverable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchDeliverable = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await axios.get(`${API_URL}/deliverables/${quotationId}`);

      if (res.data?.success) {
        setDeliverable(res.data.deliverable || null);
      } else {
        setDeliverable(null);
        setErr(res.data?.message || "Deliverables not available");
      }
    } catch (e) {
      console.error(e);
      setDeliverable(null);
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load deliverables",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  const snapshot = deliverable?.snapshot;

  const summary = useMemo(() => {
    const s = snapshot?.summary || {};
    return {
      sorted: s.totalSortedPhotos ?? 0,
      edited: s.totalEditedPhotos ?? 0,
      tradVideos: s.totalTraditionalVideos ?? 0,
      candidVideos: s.totalCandidVideos ?? 0,
      reels: s.totalReels ?? 0,
      albums: s.totalAlbums ?? 0,
    };
  }, [snapshot]);

  const hasAlbums =
    Array.isArray(snapshot?.albums) && snapshot.albums.length > 0;
  const hasAddl =
    Array.isArray(snapshot?.additionalServices) &&
    snapshot.additionalServices.length > 0;

  // ---------- helpers ----------
  const normType = (t = "") => String(t).trim().toLowerCase();

  const formatDuration = (d) => {
    const s = String(d || "").trim();
    return s ? s : "";
  };

  const handlePrintCurrent = () => {
    try {
      const el = document.getElementById("deliverable-sheet");
      if (!el) return;

      // Clone so we can safely remove elements
      const clone = el.cloneNode(true);

      // Remove any "no-print" elements + all buttons
      clone.querySelectorAll(".no-print").forEach((n) => n.remove());
      clone.querySelectorAll("button, .btn").forEach((n) => n.remove());

      const printWindow = window.open("", "_blank", "width=900,height=650");
      if (!printWindow) return;

      const html = `
      <html>
        <head>
          <title>Deliverables - Print</title>
          <style>
            @page { size: A4; margin: 14mm; }
            html, body { margin: 0; padding: 0; background: #fff; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

            .sheet {
              font-family: Arial, sans-serif;
              font-size: 12px;
              color: #111;
            }

            /* Better spacing in print */
            .border { border: 1px solid #e9ecef !important; }
            .rounded { border-radius: 10px; }
            table { width: 100%; border-collapse: collapse; }

            /* Avoid breaking event blocks */
            .avoid-break { break-inside: avoid; page-break-inside: avoid; }

            /* If you used bootstrap utility classes, we don’t rely on them */
          </style>
        </head>
        <body>
          <div class="sheet">
            ${clone.outerHTML}
          </div>
          <script>
            window.onload = function () {
              window.focus();
              window.print();
              window.onafterprint = function () { window.close(); };
            };
          </script>
        </body>
      </html>
    `;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (e) {
      console.error("Print error:", e);
    }
  };

  const buildPackageLines = (pkg) => {
    const rows = Array.isArray(pkg?.deliverables) ? pkg.deliverables : [];

    const sorted = rows.filter((x) => normType(x.type) === "sorted photos");
    const edited = rows.filter((x) => normType(x.type) === "edited photos");
    const trad = rows.filter((x) => normType(x.type) === "traditional video");
    const candid = rows.filter((x) => normType(x.type) === "candid video");
    const reels = rows.filter(
      (x) => normType(x.type) === "reel" || normType(x.type) === "reels",
    );

    const lines = [];

    // ✅ Sorted photos line
    if (sorted.length) {
      const totalSorted = sorted.reduce((s, d) => s + Number(d.photos ?? 0), 0);
      const labelText =
        sorted.find((x) => (x.label || "").trim())?.label ||
        "All sorted photos soft copy";

      lines.push(
        `All sorted photos soft copy${totalSorted ? ` (${totalSorted} photos)` : ""} — ${labelText}.`,
      );
    }

    // ✅ Edited photos line (only if present)
    if (edited.length) {
      const totalEdited = edited.reduce((s, d) => s + Number(d.photos ?? 0), 0);
      const labelText =
        edited.find((x) => (x.label || "").trim())?.label ||
        "All edited photos soft copy";

      lines.push(
        `All edited photos soft copy${totalEdited ? ` (${totalEdited} photos)` : ""} — ${labelText}.`,
      );
    }

    // ✅ Traditional video line
    if (trad.length) {
      // Many times it's 1 per event; but we’ll respect `videos` field.
      const totalTradVideos = trad.reduce(
        (s, d) => s + Number(d.videos ?? 0),
        0,
      );

      // Collect durations if present
      const durations = trad
        .map((x) => formatDuration(x.duration))
        .filter(Boolean);

      const durationText =
        durations.length === 1
          ? ` (${durations[0]})`
          : durations.length > 1
            ? ` (${durations.join(", ")})`
            : "";

      lines.push(
        `Traditional videography: ${totalTradVideos || 1} edited video${(totalTradVideos || 1) > 1 ? "s" : ""}${durationText}.`,
      );
    }

    // ✅ Candid video line (+ reels if mentioned under candid or separate)
    if (candid.length) {
      const totalCandidVideos = candid.reduce(
        (s, d) => s + Number(d.videos ?? 0),
        0,
      );
      const totalReelsInside =
        candid.reduce((s, d) => s + Number(d.reels ?? 0), 0) +
        reels.reduce((s, d) => s + Number(d.reels ?? 0), 0);

      const durations = candid
        .map((x) => formatDuration(x.duration))
        .filter(Boolean);

      const durationText =
        durations.length === 1
          ? ` (${durations[0]})`
          : durations.length > 1
            ? ` (${durations.join(", ")})`
            : "";

      const reelsText = totalReelsInside
        ? ` + ${totalReelsInside} reel${totalReelsInside > 1 ? "s" : ""}`
        : "";

      lines.push(
        `Candid videography: ${totalCandidVideos || 1} edited video${(totalCandidVideos || 1) > 1 ? "s" : ""}${reelsText}${durationText}.`,
      );
    } else {
      // If there is NO candid video but reels exist as separate deliverable
      const totalReelsOnly = reels.reduce(
        (s, d) => s + Number(d.reels ?? 0),
        0,
      );
      if (totalReelsOnly) {
        lines.push(
          `Reels: ${totalReelsOnly} reel${totalReelsOnly > 1 ? "s" : ""}.`,
        );
      }
    }

    // Fallback: if none matched, show each row label in bullet form (keeps you safe)
    if (!lines.length && rows.length) {
      rows.forEach((d) => {
        const parts = [];
        const title = (d.label || d.type || "").trim();
        if (!title) return;

        if (Number(d.photos ?? 0) > 0) parts.push(`${d.photos} photos`);
        if (Number(d.videos ?? 0) > 0) parts.push(`${d.videos} videos`);
        if (Number(d.reels ?? 0) > 0) parts.push(`${d.reels} reels`);
        const dur = formatDuration(d.duration);
        if (dur) parts.push(dur);

        lines.push(`${title}${parts.length ? ` — ${parts.join(" · ")}` : ""}.`);
      });
    }

    return lines;
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center py-4">
          <Spinner animation="border" role="status" />
          <div className="mt-2">Loading deliverables...</div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container py-4">
        <div className="p-3 border rounded bg-white shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="fw-bold">DELIVERABLES</div>
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-2" />
              Back
            </Button>
          </div>

          <Alert variant="danger" className="mb-2">
            {err}
          </Alert>

          <Button
            variant="outline-primary"
            size="sm"
            onClick={fetchDeliverable}
          >
            <FaSyncAlt className="me-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="container py-4">
        <Alert variant="info">Deliverables not found.</Alert>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ fontSize: 13 }}>
      <div
        id="deliverable-sheet"
        className="bg-white shadow-sm border rounded"
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "22px 22px",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.2 }}>
              Deliverables Sheet
            </div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
              Final handover summary
            </div>
          </div>

          <div className="d-flex gap-2 no-print">
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => navigate(-1)}
              style={{ fontSize: 12 }}
            >
              <FaArrowLeft className="me-2" />
              Back
            </Button>

            <Button
              variant="outline-dark"
              size="sm"
              onClick={fetchDeliverable}
              style={{ fontSize: 12 }}
            >
              <FaSyncAlt className="me-2" />
              Refresh
            </Button>

            <Button
              variant="dark"
              size="sm"
              onClick={handlePrintCurrent}
              style={{ fontSize: 12 }}
            >
              <FaPrint className="me-2" />
              Print
            </Button>
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: "#e9ecef",
            margin: "14px 0 12px",
          }}
        />

        {/* Meta + Summary */}
        <div
          className="border rounded"
          style={{ padding: "12px 14px", background: "#fcfcfd" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    width: "50%",
                    padding: "6px 8px",
                    verticalAlign: "top",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#6c757d" }}>
                    Quotation ID
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {deliverable?.quotationUniqueId || "—"}
                  </div>
                </td>

                <td
                  style={{
                    width: "50%",
                    padding: "6px 8px",
                    verticalAlign: "top",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#6c757d" }}>
                    Couples / Person
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {deliverable?.personName || "—"}
                  </div>
                </td>
              </tr>

              {/* <tr>
        <td style={{ width: "50%", padding: "6px 8px", verticalAlign: "top" }}>
          <div style={{ fontSize: 11, color: "#6c757d" }}>Finalized At</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {deliverable?.finalizedAt
              ? dayjs(deliverable.finalizedAt).format("DD-MM-YYYY • hh:mm A")
              : "—"}
          </div>
        </td>

        <td style={{ width: "50%", padding: "6px 8px", verticalAlign: "top" }}>
          <div style={{ fontSize: 11, color: "#6c757d" }}>Status</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            {deliverable?.status || "Finalized"}
          </div>
        </td>
      </tr> */}
            </tbody>
          </table>
        </div>

        <div
          style={{
            height: 1,
            background: "#e9ecef",
            margin: "14px 0 14px",
          }}
        />

        {/* Event-wise paragraphs */}
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
          Event-wise Deliverables
        </div>

        {(snapshot.packages || []).map((p, idx) => {
          const lines = buildPackageLines(p);

          return (
            <div
              key={p.packageId || idx}
              className="border rounded mb-3 avoid-break"
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  background: "#f6f7f9",
                  padding: "10px 12px",
                  borderBottom: "1px solid #e9ecef",
                }}
              >
                <div className="fw-bold" style={{ fontSize: 13 }}>
                  {String(idx + 1).padStart(2, "0")}. {p.packageName || "—"}
                </div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {p.eventStartDate || p.eventEndDate
                    ? `${p.eventStartDate || "—"} → ${p.eventEndDate || "—"}`
                    : ""}
                </div>
              </div>

              <div style={{ padding: "12px 14px" }}>
                {lines.length ? (
                  <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.65 }}>
                    {lines.map((t, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted">—</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Albums (only if exists) */}
        {hasAlbums && (
          <>
            <div
              style={{
                height: 1,
                background: "#e9ecef",
                margin: "14px 0 14px",
              }}
            />
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
              Albums
            </div>

            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.65 }}>
              {snapshot.albums.map((a, i) => (
                <li key={a.albumId || i} style={{ marginBottom: 6 }}>
                  {a.name}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Additional Services (only if exists) */}
        {hasAddl && (
          <>
            <div
              style={{
                height: 1,
                background: "#e9ecef",
                margin: "14px 0 14px",
              }}
            />
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
              Additional Services
            </div>

            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.65 }}>
              {snapshot.additionalServices.map((s, i) => (
                <li key={s.serviceId || i} style={{ marginBottom: 6 }}>
                  <span className="fw-semibold">{s.name}</span>
                  {s.description ? (
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      {" "}
                      — {s.description}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Footer */}
        <div
          className="print-footer"
          style={{
            marginTop: 16,
            paddingTop: 10,
            borderTop: "1px solid #e9ecef",
            fontSize: 11,
            color: "#6c757d",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: "#111" }}>
              Classy Captures
            </div>
            <div>Generated by Computer</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div>
              Generated on:{" "}
              {deliverable?.finalizedAt
                ? dayjs(deliverable.finalizedAt).format("DD-MM-YYYY • hh:mm A")
                : "—"}
            </div>

            <div>Document: Deliverables Sheet</div>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          .container { max-width: 100% !important; }
          button, .btn { display: none !important; }
          #deliverable-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DeliverableDetailPage;

function CountLine({ label, value }) {
  return (
    <div
      className="d-flex justify-content-between align-items-center"
      style={{
        border: "1px solid #e9ecef",
        borderRadius: 8,
        padding: "8px 10px",
        background: "#fcfcfd",
      }}
    >
      <div className="text-muted" style={{ fontSize: 12 }}>
        {label}
      </div>
      <div className="fw-bold" style={{ fontSize: 13 }}>
        {value ?? 0}
      </div>
    </div>
  );
}
