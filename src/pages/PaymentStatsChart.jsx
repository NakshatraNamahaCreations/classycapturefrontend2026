// // components/PaymentStatsChart.js
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const PaymentStatsChart = () => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const [clientRes, vendorRes] = await Promise.all([
//           axios.get("http://localhost:5000/api/quotations/stats/client-payments"),
//           axios.get("http://localhost:5000/api/quotations/stats/vendor-payments"),
//         ]);

//         // Merge stats into single dataset
//         const clientData = clientRes.data.data;
//         const vendorData = vendorRes.data.data;

//         const merged = {};

//         clientData.forEach((c) => {
//           merged[c._id] = { year: c._id, clientReceived: c.totalReceived, vendorPaid: 0 };
//         });

//         vendorData.forEach((v) => {
//           if (!merged[v._id]) {
//             merged[v._id] = { year: v._id, clientReceived: 0, vendorPaid: v.totalPaid };
//           } else {
//             merged[v._id].vendorPaid = v.totalPaid;
//           }
//         });

//         setData(Object.values(merged).sort((a, b) => a.year - b.year));
//       } catch (err) {
//         console.error("Error fetching stats:", err);
//       }
//     };

//     fetchStats();
//   }, []);

//   return (
//     <div style={{ width: "100%", height: 400 }}>
//       <h3 className="text-center">Yearly Client vs Vendor Payments</h3>
//       <ResponsiveContainer>
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="year" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="clientReceived" fill="#23408B" name="Client Received" />
//           <Bar dataKey="vendorPaid" fill="#32984D" name="Vendor Paid" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default PaymentStatsChart;

// components/PaymentStatsChart.js
import React, { useMemo } from "react";
import { Card, Spinner } from "react-bootstrap";

const fmtINR = (n) => {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("en-IN");
  } catch {
    return String(num);
  }
};

const safeArr = (v) => (Array.isArray(v) ? v : []);

const PaymentStatsChart = ({ loading, client, vendor, other, net }) => {
  const c = safeArr(client);
  const v = safeArr(vendor);
  const o = safeArr(other);
  const nn = safeArr(net);

  // ✅ SAME COLORS LIKE PIE CHARTS
  const COLORS = {
    client: "#2E7D32", // green (same as booked)
    vendor: "#E65100", // orange (same as notBooked)
    other: "#722424", // neutral gray (goes well with bgRing)
    track: "#EEE", // same as bgRing
    text: "#111",
    muted: "#666",
    border: "#eee",
    softClient: "#E9F7EF",
    softVendor: "#FFF3E0",
    softOther: "#F5F5F5",
  };

  const row = useMemo(() => {
    const label =
      c?.[0]?.label ||
      v?.[0]?.label ||
      o?.[0]?.label ||
      nn?.[0]?.label ||
      "Selected Period";

    const clientTotal = Number(c?.[0]?.total || 0);
    const vendorTotal = Number(v?.[0]?.total || 0);
    const otherTotal = Number(o?.[0]?.total || 0);
    const netTotal = Number(
      nn?.[0]?.total || clientTotal - (vendorTotal + otherTotal)
    );

    const max = Math.max(
      clientTotal,
      vendorTotal,
      otherTotal,
      Math.abs(netTotal),
      1
    );

    return {
      label,
      clientTotal,
      vendorTotal,
      otherTotal,
      netTotal,
      max,
    };
  }, [c, v, o, nn]);

  if (loading) {
    return (
      <Card className="shadow border-0 mt-3">
        <Card.Body className="d-flex align-items-center gap-2">
          <Spinner size="sm" />
          <span className="text-muted">Loading finance data...</span>
        </Card.Body>
      </Card>
    );
  }

  const items = [
    {
      name: "Client",
      value: row.clientTotal,
      color: COLORS.client,
      soft: COLORS.softClient,
    },
    {
      name: "Vendor",
      value: row.vendorTotal,
      color: COLORS.vendor,
      soft: COLORS.softVendor,
    },
    {
      name: "Other",
      value: row.otherTotal,
      color: COLORS.other,
      soft: COLORS.softOther,
    },
  ];

  return (
    <Card className="shadow border-0 mt-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <div className="fw-bold" style={{ fontSize: 14, color: COLORS.text }}>
              {row.label}
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Client, Vendor & Other Expense Summary
            </div>
          </div>
        </div>

        {/* Totals row */}
        <div className="row mt-3 g-2">
          <div className="col-md-3 col-6">
            <div
              className="p-2 rounded"
              style={{
                background: COLORS.softClient,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="text-muted" style={{ fontSize: 11 }}>
                Client Total
              </div>
              <div className="fw-bold" style={{ fontSize: 16 }}>
                ₹ {fmtINR(row.clientTotal)}
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div
              className="p-2 rounded"
              style={{
                background: COLORS.softVendor,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="text-muted" style={{ fontSize: 11 }}>
                Vendor Total
              </div>
              <div className="fw-bold" style={{ fontSize: 16 }}>
                ₹ {fmtINR(row.vendorTotal)}
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div
              className="p-2 rounded"
              style={{
                background: COLORS.softOther,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="text-muted" style={{ fontSize: 11 }}>
                Other Expense
              </div>
              <div className="fw-bold" style={{ fontSize: 16 }}>
                ₹ {fmtINR(row.otherTotal)}
              </div>
            </div>
          </div>
        </div>

        {/* Mini bars (pie-like colors) */}
        <div className="mt-3">
          {items.map((x) => {
            const pct = Math.round((Math.abs(x.value) / row.max) * 100);

            return (
              <div key={x.name} className="mb-2">
                <div className="d-flex justify-content-between" style={{ fontSize: 12 }}>
                  <span className="fw-semibold d-flex align-items-center gap-2">
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: x.color,
                        display: "inline-block",
                      }}
                    />
                    {x.name}
                  </span>
                  <span>₹ {fmtINR(x.value)}</span>
                </div>

                <div
                  style={{
                    height: 10,
                    width: "100%",
                    background: COLORS.track, // same feel as pie bg ring
                    borderRadius: 999,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: x.color, // ✅ pie colors here
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PaymentStatsChart;
