// import axios from "axios";
// import { useEffect, useState } from "react";
// import { Card } from "react-bootstrap";
// import {
//   AiOutlineUser,
//   AiOutlinePhone,
//   AiOutlineDollarCircle,
//   AiOutlineCalendar,
//   AiOutlineTool,
// } from "react-icons/ai";
// import {
//   FaUsers,
//   FaWarehouse,
//   FaTruckLoading,
//   FaIndustry,
//   FaUserCog,
//   FaCheckCircle,
//   FaBoxOpen,
//   FaUserClock,
//   FaTasks,
//   FaPhotoVideo,
//   FaVideo,
// } from "react-icons/fa";
// import PaymentStatsChart from "./PaymentStatsChart";
// import { API_URL } from "../utils/api";

// const Dashboard = () => {
//   const [newQueriesCount, setNewQueriesCount] = useState(0);
//   const [followupCounts, setFollowupCounts] = useState(0);
//   const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
//   const [pendingfirstInstPaymentCount, setPendingfirstInstPaymentCount] =
//     useState(0);
//   const [todaysEventsCount, setTodaysEventsCount] = useState(0);
//   const [completedQuotationsCount, setCompletedQuotationsCount] = useState(0);
//   const [todaysCallFollowupCount, setTodaysCallFollowupCount] = useState(0);

//   // ✅ NEW COUNTS
//   const [unassignedServicesCount, setUnassignedServicesCount] = useState(0);
//   const [pendingCollectCount, setPendingCollectCount] = useState(0);
//   const [pendingSortingCount, setPendingSortingCount] = useState(0);
//   const [pendingPhotoEditCount, setPendingPhotoEditCount] = useState(0);
//   const [pendingVideoEditCount, setPendingVideoEditCount] = useState(0);
//   const [pendingAlbumCount, setPendingAlbumCount] = useState(0);

//   // ✅ helper: supports {count} OR {total} (and safe number parsing)
//   const pickTotal = (data) => {
//     const v =
//       data?.count ?? data?.total ?? data?.data?.count ?? data?.data?.total;
//     const n = Number(v);
//     return Number.isFinite(n) ? n : 0;
//   };

//   const fetchNewQueriesCount = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/lead/count?status=Created`);
//       if (response?.data?.success) setNewQueriesCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching New Lead count", error);
//     }
//   };

//   const fetchFollowUpCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/lead/count?status=Call Later`,
//       );
//       if (response?.data?.success) setFollowupCounts(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching Payment Follow Up count", error);
//     }
//   };

//   const fetchPendingPaymentCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/quotations/count/pending-payments`,
//       );
//       if (response?.data?.success)
//         setPendingPaymentCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching pending payment count", error);
//     }
//   };

//   const fetchTodaysEventsCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/quotations/count/todays-events`,
//       );
//       if (response?.data?.success)
//         setTodaysEventsCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching today's events count", error);
//     }
//   };

//   const fetchCompletedQuotationsCount = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/quotations/count/completed`);
//       if (response?.data?.success)
//         setCompletedQuotationsCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching completed quotations count", error);
//     }
//   };

//   const fetchTodaysCallfollowupCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/lead/queries/rescheduled/today`,
//       );
//       if (response?.data?.success)
//         setTodaysCallFollowupCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching today's call followup count", error);
//     }
//   };

//   // ✅ NEW APIs
//   const fetchUnassignedServicesCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/quotations/unassigned-services/count`,
//       );
//       if (response?.data?.success)
//         setUnassignedServicesCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching unassigned services count", error);
//     }
//   };

//   const fetchPendingCollectCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/collected-data/pending-events/count`,
//       );
//       if (response?.data?.success)
//         setPendingCollectCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching pending collect count", error);
//     }
//   };

//   const fetchPendingSortingCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/collected-data/sorting/pending-services/count`,
//       );
//       if (response?.data?.success)
//         setPendingSortingCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching pending sorting count", error);
//     }
//   };

//   const fetchPendingPhotoEditCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/photo-editing/pending/count`,
//       );
//       if (response?.data?.success)
//         setPendingPhotoEditCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching pending photo edit count", error);
//     }
//   };

//   const fetchPendingVideoEditCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/video-editing/pending/count`,
//       );
//       if (response?.data?.success)
//         setPendingVideoEditCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching pending video edit count", error);
//     }
//   };
//   const fetchfirstInstPending = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/follow-up/count`);
//       if (response?.data?.success)
//         setPendingfirstInstPaymentCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching pending video edit count", error);
//     }
//   };
//   const fetchAlbumPendingtoComplete = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/quotations/count/pending-albums`);
//       if (response?.data?.success)
//         setPendingAlbumCount(pickTotal(response.data));
//     } catch (error) {
//       console.log("Error in fetching pending video edit count", error);
//     }
//   };

//   useEffect(() => {
//     fetchNewQueriesCount();
//     fetchFollowUpCount();
//     fetchPendingPaymentCount();
//     fetchTodaysEventsCount();
//     fetchCompletedQuotationsCount();
//     fetchTodaysCallfollowupCount();
//     fetchfirstInstPending();
// fetchAlbumPendingtoComplete()
//     fetchUnassignedServicesCount();
//     fetchPendingCollectCount();
//     fetchPendingSortingCount();
//     fetchPendingPhotoEditCount();
//     fetchPendingVideoEditCount();
//   }, []);

//   const preProductionData = [
//     {
//       title: "New Lead",
//       count: newQueriesCount,
//       subtitle: "Enquiries",
//       icon: <AiOutlineUser size={20} />,
//     },
//     // {
//     //   title: "Payment Follow Up",
//     //   count:pendingPaymentCount,
//     //   subtitle: "Clients",
//     //   icon: <AiOutlinePhone size={20} />,
//     // },
//     {
//       title: "All Follow Up",
//       count: followupCounts,
//       subtitle: "Call",
//       icon: <AiOutlinePhone size={20} />,
//     },
//     {
//       title: "Today's Follow Up",
//       count: todaysCallFollowupCount,
//       subtitle: "Call",
//       icon: <AiOutlinePhone size={20} />,
//     },

//     {
//       title: "Pending Payments",
//       count: pendingPaymentCount,
//       subtitle: "(Bookings)",
//       icon: <AiOutlineDollarCircle size={20} />,
//     },
//     {
//       title: "Pending 1st Payments",
//       count: pendingfirstInstPaymentCount,
//       subtitle: "(1st Installment)",
//       icon: <AiOutlineDollarCircle size={20} />,
//     },
//   ];

//   const productionData = [
//     {
//       title: "Today's Event",
//       count: todaysEventsCount,
//       subtitle: "Venue",
//       icon: <AiOutlineCalendar size={20} />,
//     },
//     {
//       title: "Unassigned Vendors",
//       count: unassignedServicesCount,
//       subtitle: "(for services)",
//       icon: <FaUserClock size={20} />,
//     },
//     {
//       title: "Inhouse Vendor",
//       count: 15,
//       subtitle: "(static)",
//       icon: <FaIndustry size={20} />,
//     },
//     {
//       title: "Third Party Vendor",
//       count: 22,
//       subtitle: "(static)",
//       icon: <FaUserCog size={20} />,
//     },
//     {
//       title: "Maintenance",
//       count: "00",
//       subtitle: "(static)",
//       icon: <AiOutlineTool size={20} />,
//     },
//   ];

//   const postProductionData = [
    
//     {
//       title: "Pending Data Collect",
//       count: pendingCollectCount,
//       subtitle: "Services",
//       icon: <FaTasks size={20} />,
//     },
//     {
//       title: "Pending Sorting",
//       count: pendingSortingCount,
//       subtitle: "Services",
//       icon: <FaTasks size={20} />,
//     },
//     {
//       title: "Pending Photo Edit",
//       count: pendingPhotoEditCount,
//       subtitle: "Services",
//       icon: <FaPhotoVideo size={20} />,
//     },
//     {
//       title: "Pending Video Edit",
//       count: pendingVideoEditCount,
//       subtitle: "Services",
//       icon: <FaVideo size={20} />,
//     },
//     {
//       title: "Pending Album Design",
//       count: pendingAlbumCount,
//       subtitle: "Albums",
//       icon: <FaVideo size={20} />,
//     },
//     {
//       title: "Project Delivery",
//       count: completedQuotationsCount,
//       subtitle: "Clients",
//       icon: <FaBoxOpen size={20} />,
//     },
//   ];

//   const StatGrid = ({ data, colClass }) => (
//     <div className="row mt-4 justify-content-start">
//       {data.map((item, index) => (
//         <div className={colClass} key={index}>
//           <Card
//             className="shadow border-0 p-2 text-center"
//             style={{ width: "100%", height: "140px" }}
//           >
//             <Card.Body className="d-flex flex-column align-items-center justify-content-center">
//               <div className="mb-1">{item.icon}</div>
//               <h6 className="fw-bold mb-1" style={{ fontSize: "12px" }}>
//                 {item.title}
//               </h6>
//               <p className="fw-bold mb-0" style={{ fontSize: "18px" }}>
//                 {item.count}
//               </p>
//               <small className="text-muted" style={{ fontSize: "10px" }}>
//                 {item.subtitle}
//               </small>
//             </Card.Body>
//           </Card>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="container p-4 rounded" style={{ background: "#F4F4F4" }}>
//       <h5 className="mt-3 fw-bold">Pre Production</h5>
//       <StatGrid
//         data={preProductionData}
//         colClass="col-md-2 col-sm-4 col-6 mb-2 px-1"
//       />

//       <h5 className="mt-4 fw-bold">Production</h5>
//       <StatGrid
//         data={productionData}
//         colClass="col-md-2 col-sm-4 col-6 mb-2 px-1"
//       />

//       <h5 className="mt-4 fw-bold">Post Production</h5>
//       <StatGrid
//         data={postProductionData}
//         colClass="col-md-2 col-sm-4 col-6 mb-2 px-1"
//       />

//       <PaymentStatsChart />
//     </div>
//   );
// };

// export default Dashboard;

import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import {
  AiOutlineUser,
  AiOutlinePhone,
  AiOutlineDollarCircle,
  AiOutlineCalendar,
  AiOutlineTool,
} from "react-icons/ai";
import {
  FaUserCog,
  FaIndustry,
  FaUserClock,
  FaTasks,
  FaPhotoVideo,
  FaVideo,
  FaBoxOpen,
} from "react-icons/fa";
import PaymentStatsChart from "./PaymentStatsChart";
import { API_URL } from "../utils/api";
import LeadConversionPieChart from "./LeadConversionPieChart";

const Dashboard = () => {
  // ---------------- COUNTS (your existing) ----------------
  const [newQueriesCount, setNewQueriesCount] = useState(0);
  const [followupCounts, setFollowupCounts] = useState(0);
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
  const [pendingfirstInstPaymentCount, setPendingfirstInstPaymentCount] = useState(0);
  const [todaysEventsCount, setTodaysEventsCount] = useState(0);
  const [completedQuotationsCount, setCompletedQuotationsCount] = useState(0);
  const [todaysCallFollowupCount, setTodaysCallFollowupCount] = useState(0);

  const [unassignedServicesCount, setUnassignedServicesCount] = useState(0);
  const [pendingCollectCount, setPendingCollectCount] = useState(0);
  const [pendingSortingCount, setPendingSortingCount] = useState(0);
  const [pendingPhotoEditCount, setPendingPhotoEditCount] = useState(0);
  const [pendingVideoEditCount, setPendingVideoEditCount] = useState(0);
  const [pendingAlbumCount, setPendingAlbumCount] = useState(0);

  // ---------------- ✅ FINANCE STATS ----------------
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1..12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [financeLoading, setFinanceLoading] = useState(false);

  // keep format same as your earlier usage: arrays for chart component
  const [financeStats, setFinanceStats] = useState({
    client: [],
    vendor: [],
    other: [],
    net: [],
  });

  const monthLabels = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

  // ✅ helper: supports {count} OR {total}
  const pickTotal = (data) => {
    const v = data?.count ?? data?.total ?? data?.data?.count ?? data?.data?.total;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const fetchFinanceStats = async () => {
    try {
      setFinanceLoading(true);

      const url = `${API_URL}/finance-stats/payments?month=${encodeURIComponent(
        selectedMonth
      )}&year=${encodeURIComponent(selectedYear)}`;

      const res = await axios.get(url);

      if (res.data?.success) {
        const d = res.data;

        // normalize into arrays so PaymentStatsChart can render consistently
        const label = d.label || `${selectedMonth}/${selectedYear}`;

        setFinanceStats({
          client: [{ label, total: Number(d.clientTotal || 0) }],
          vendor: [{ label, total: Number(d.vendorTotal || 0) }],
          other: [{ label, total: Number(d.otherExpenseTotal || 0) }],
          net: [{ label, total: Number(d.net || 0) }],
        });
      } else {
        setFinanceStats({ client: [], vendor: [], other: [], net: [] });
      }
    } catch (e) {
      console.log("Finance stats error:", e);
      setFinanceStats({ client: [], vendor: [], other: [], net: [] });
    } finally {
      setFinanceLoading(false);
    }
  };

  // ---------------- YOUR EXISTING FETCHES (kept) ----------------
  const fetchNewQueriesCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/lead/count?status=Created`);
      if (response?.data?.success) setNewQueriesCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching New Lead count", error);
    }
  };

  const fetchFollowUpCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/lead/count?status=Call Later`);
      if (response?.data?.success) setFollowupCounts(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching Follow Up count", error);
    }
  };

  const fetchPendingPaymentCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/quotations/count/pending-payments`);
      if (response?.data?.success) setPendingPaymentCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching pending payment count", error);
    }
  };

  const fetchTodaysEventsCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/quotations/count/todays-events`);
      if (response?.data?.success) setTodaysEventsCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching today's events count", error);
    }
  };

  const fetchCompletedQuotationsCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/quotations/count/completed`);
      if (response?.data?.success) setCompletedQuotationsCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching completed quotations count", error);
    }
  };

  const fetchTodaysCallfollowupCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/lead/queries/rescheduled/today`);
      if (response?.data?.success) setTodaysCallFollowupCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching today's call followup count", error);
    }
  };

  const fetchUnassignedServicesCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/quotations/unassigned-services/count`);
      if (response?.data?.success) setUnassignedServicesCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching unassigned services count", error);
    }
  };

  const fetchPendingCollectCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/collected-data/pending-events/count`);
      if (response?.data?.success) setPendingCollectCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching pending collect count", error);
    }
  };

  const fetchPendingSortingCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/collected-data/sorting/pending-services/count`);
      if (response?.data?.success) setPendingSortingCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching pending sorting count", error);
    }
  };

  const fetchPendingPhotoEditCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/photo-editing/pending/count`);
      if (response?.data?.success) setPendingPhotoEditCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching pending photo edit count", error);
    }
  };

  const fetchPendingVideoEditCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/video-editing/pending/count`);
      if (response?.data?.success) setPendingVideoEditCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching pending video edit count", error);
    }
  };

  const fetchfirstInstPending = async () => {
    try {
      const response = await axios.get(`${API_URL}/follow-up/count`);
      if (response?.data?.success) setPendingfirstInstPaymentCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching pending 1st installment count", error);
    }
  };

  const fetchAlbumPendingtoComplete = async () => {
    try {
      const response = await axios.get(`${API_URL}/quotations/count/pending-albums`);
      if (response?.data?.success) setPendingAlbumCount(pickTotal(response.data));
    } catch (error) {
      console.log("Error in fetching pending albums count", error);
    }
  };

  useEffect(() => {
    // counts
    fetchNewQueriesCount();
    fetchFollowUpCount();
    fetchPendingPaymentCount();
    fetchTodaysEventsCount();
    fetchCompletedQuotationsCount();
    fetchTodaysCallfollowupCount();
    fetchfirstInstPending();
    fetchAlbumPendingtoComplete();
    fetchUnassignedServicesCount();
    fetchPendingCollectCount();
    fetchPendingSortingCount();
    fetchPendingPhotoEditCount();
    fetchPendingVideoEditCount();

    // finance
    fetchFinanceStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch finance on month/year change
  useEffect(() => {
    fetchFinanceStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  // ---------------- UI DATA ----------------
  const preProductionData = [
    { title: "New Lead", count: newQueriesCount, subtitle: "Enquiries", icon: <AiOutlineUser size={20} /> },
    { title: "All Follow Up", count: followupCounts, subtitle: "Call", icon: <AiOutlinePhone size={20} /> },
    { title: "Today's Follow Up", count: todaysCallFollowupCount, subtitle: "Call", icon: <AiOutlinePhone size={20} /> },
    { title: "Pending Payments", count: pendingPaymentCount, subtitle: "(Bookings)", icon: <AiOutlineDollarCircle size={20} /> },
    { title: "Pending 1st Payments", count: pendingfirstInstPaymentCount, subtitle: "(1st Installment)", icon: <AiOutlineDollarCircle size={20} /> },
  ];

  const productionData = [
    { title: "Today's Event", count: todaysEventsCount, subtitle: "Venue", icon: <AiOutlineCalendar size={20} /> },
    { title: "Unassigned Vendors", count: unassignedServicesCount, subtitle: "(for services)", icon: <FaUserClock size={20} /> },
    { title: "Inhouse Vendor", count: 15, subtitle: "(static)", icon: <FaIndustry size={20} /> },
    { title: "Third Party Vendor", count: 22, subtitle: "(static)", icon: <FaUserCog size={20} /> },
    { title: "Maintenance", count: "00", subtitle: "(static)", icon: <AiOutlineTool size={20} /> },
  ];

  const postProductionData = [
    { title: "Pending Data Collect", count: pendingCollectCount, subtitle: "Services", icon: <FaTasks size={20} /> },
    { title: "Pending Sorting", count: pendingSortingCount, subtitle: "Services", icon: <FaTasks size={20} /> },
    { title: "Pending Photo Edit", count: pendingPhotoEditCount, subtitle: "Services", icon: <FaPhotoVideo size={20} /> },
    { title: "Pending Video Edit", count: pendingVideoEditCount, subtitle: "Services", icon: <FaVideo size={20} /> },
    { title: "Pending Album Design", count: pendingAlbumCount, subtitle: "Albums", icon: <FaVideo size={20} /> },
    { title: "Project Delivery", count: completedQuotationsCount, subtitle: "Clients", icon: <FaBoxOpen size={20} /> },
  ];

  const StatGrid = ({ data, colClass }) => (
    <div className="row mt-4 justify-content-start">
      {data.map((item, index) => (
        <div className={colClass} key={index}>
          <Card className="shadow border-0 p-2 text-center" style={{ width: "100%", height: "140px" }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div className="mb-1">{item.icon}</div>
              <h6 className="fw-bold mb-1" style={{ fontSize: "12px" }}>{item.title}</h6>
              <p className="fw-bold mb-0" style={{ fontSize: "18px" }}>{item.count}</p>
              <small className="text-muted" style={{ fontSize: "10px" }}>{item.subtitle}</small>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container p-4 rounded" style={{ background: "#F4F4F4" }}>
      <h5 className="mt-3 fw-bold">Pre Production</h5>
      <StatGrid data={preProductionData} colClass="col-md-2 col-sm-4 col-6 mb-2 px-1" />

      <h5 className="mt-4 fw-bold">Production</h5>
      <StatGrid data={productionData} colClass="col-md-2 col-sm-4 col-6 mb-2 px-1" />

      <h5 className="mt-4 fw-bold">Post Production</h5>
      <StatGrid data={postProductionData} colClass="col-md-2 col-sm-4 col-6 mb-2 px-1" />

      {/* ✅ Finance Stats */}
      <div className="mt-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Finance Stats</h5>

          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">Month:</small>
            <select
              className="form-select form-select-sm"
              style={{ width: 100 }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {monthLabels.map((mon, i) => (
                <option key={i} value={i + 1}>
                  {mon}
                </option>
              ))}
            </select>

            <small className="text-muted">Year:</small>
            <input
              className="form-control form-control-sm"
              style={{ width: 110 }}
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            />

            <button
              className="btn btn-sm btn-dark"
              onClick={() => fetchFinanceStats()}
              disabled={financeLoading}
            >
              {financeLoading ? (
                <>
                  <Spinner size="sm" className="me-2" /> Loading
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>
        </div>

        <PaymentStatsChart
          loading={financeLoading}
          client={financeStats.client}
          vendor={financeStats.vendor}
          other={financeStats.other}
          net={financeStats.net}
        />

        <LeadConversionPieChart />
      </div>
    </div>
  );
};

export default Dashboard;
