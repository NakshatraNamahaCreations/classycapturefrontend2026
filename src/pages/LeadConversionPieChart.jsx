import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, Spinner, Alert } from "react-bootstrap";
import { API_URL } from "../utils/api";

// --- helpers ---
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const fmtPct = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
};

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
};

const LeadConversionPieChart = () => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [data, setData] = useState({
    totalQueries: 0,
    bookedQueries: 0,
    bookedRatioPercent: 0,
  });

  const fetchRatio = async () => {
    try {
      setLoading(true);
      setErrMsg("");

      // ✅ uses your API_URL
      const res = await axios.get(`${API_URL}/finance-stats/leadconversion-ratio`);

      const d = res?.data || {};
      if (!d?.success) {
        setErrMsg(d?.message || "Failed to fetch lead conversion ratio");
        return;
      }

      setData({
        totalQueries: Number(d.totalQueries || 0),
        bookedQueries: Number(d.bookedQueries || 0),
        bookedRatioPercent: Number(d.bookedRatioPercent || 0),
      });
    } catch (e) {
      console.log("LeadConversionPieChart error:", e);
      setErrMsg(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computed = useMemo(() => {
    const total = Number(data.totalQueries || 0);
    const booked = Number(data.bookedQueries || 0);
    const notBooked = Math.max(0, total - booked);

    const bookedPct = total > 0 ? (booked / total) * 100 : 0;
    const notBookedPct = total > 0 ? (notBooked / total) * 100 : 0;

    // pie angles
    const bookedAngle = clamp((bookedPct / 100) * 360, 0, 360);
    const start = 0;
    const endBooked = bookedAngle;
    const endTotal = 360;

    return {
      total,
      booked,
      notBooked,
      bookedPct,
      notBookedPct,
      start,
      endBooked,
      endTotal,
    };
  }, [data]);

  // --- SVG settings ---
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;

  // colors
  const COLORS = {
    booked: "#2E7D32",     // green
    notBooked: "#E65100",  // orange
    bgRing: "#EEE",
    text: "#111",
    muted: "#666",
  };

  return (
    <Card className="shadow border-0 mt-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h6 className="fw-bold mb-1">Lead Conversion Ratio</h6>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Booked vs Not Booked 
            </div>
          </div>

          <button
            className="btn btn-sm btn-outline-dark"
            onClick={fetchRatio}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {errMsg ? (
          <Alert variant="danger" className="mt-3 mb-0">
            {errMsg}
          </Alert>
        ) : null}

        {loading ? (
          <div className="d-flex align-items-center gap-2 mt-3">
            <Spinner size="sm" />
            <span className="text-muted">Loading conversion data...</span>
          </div>
        ) : (
          <div className="row mt-3 align-items-center g-3">
            {/* Pie */}
            <div className="col-md-5 col-12 d-flex justify-content-center">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* background ring */}
                <circle cx={cx} cy={cy} r={r} fill={COLORS.bgRing} />

                {/* Booked slice */}
                {computed.total > 0 && computed.booked > 0 ? (
                  <path
                    d={describeArc(cx, cy, r, computed.start, computed.endBooked)}
                    fill={COLORS.booked}
                  />
                ) : null}

                {/* Not booked slice */}
                {computed.total > 0 && computed.notBooked > 0 ? (
                  <path
                    d={describeArc(cx, cy, r, computed.endBooked, computed.endTotal)}
                    fill={COLORS.notBooked}
                  />
                ) : null}

                {/* center hole (donut style) */}
                <circle cx={cx} cy={cy} r={48} fill="#fff" />

                {/* center text */}
                <text
                  x={cx}
                  y={cy - 4}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="800"
                  fill={COLORS.text}
                >
                  {fmtPct(computed.bookedPct)}%
                </text>
                <text
                  x={cx}
                  y={cy + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={COLORS.muted}
                >
                  Booked
                </text>
              </svg>
            </div>

            {/* Stats + legend */}
            <div className="col-md-7 col-12">
              <div className="d-flex flex-column gap-2">
                <div
                  className="p-2 rounded"
                  style={{ border: "1px solid #eee", background: "#fff" }}
                >
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    Total Queries
                  </div>
                  <div className="fw-bold" style={{ fontSize: 16 }}>
                    {computed.total}
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <div
                      className="p-2 rounded"
                      style={{ border: "1px solid #eee", background: "#fff" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: COLORS.booked,
                            display: "inline-block",
                          }}
                        />
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          Booked
                        </div>
                      </div>
                      <div className="fw-bold" style={{ fontSize: 16 }}>
                        {computed.booked}{" "}
                        <span className="text-muted" style={{ fontSize: 12 }}>
                          ({fmtPct(computed.bookedPct)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className="p-2 rounded"
                      style={{ border: "1px solid #eee", background: "#fff" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: COLORS.notBooked,
                            display: "inline-block",
                          }}
                        />
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          Not Booked
                        </div>
                      </div>
                      <div className="fw-bold" style={{ fontSize: 16 }}>
                        {computed.notBooked}{" "}
                        <span className="text-muted" style={{ fontSize: 12 }}>
                          ({fmtPct(computed.notBookedPct)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

               
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LeadConversionPieChart;
