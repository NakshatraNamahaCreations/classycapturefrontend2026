// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   Form,
//   Button,
//   Card,
//   InputGroup,
//   Row,
//   Col,
//   Modal,
//   Tab,
//   Tabs,
//   OverlayTrigger,
//   Tooltip,
// } from "react-bootstrap";
// import Select from "react-select";
// import { IoChevronForward } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import * as XLSX from "xlsx";
// import DynamicPagination from "../DynamicPagination";
// import { FaEye } from "react-icons/fa"; // eye icon
// import { API_URL } from "../../utils/api";

// // ---- Date helpers: handle "DD-MM-YYYY" and ISO strings ----
// const parseMaybeDdmmyyyy = (str) => {
//   if (!str) return null;

//   // try native first (handles ISO etc.)
//   const native = new Date(str);
//   if (!Number.isNaN(native.getTime())) return native;

//   // handle DD-MM-YYYY
//   const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(str);
//   if (m) {
//     const [, dd, mm, yyyy] = m;
//     // local time to avoid timezone day-shifts
//     const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
//     return Number.isNaN(d.getTime()) ? null : d;
//   }
//   return null;
// };

// const toDisplayDate = (str) => {
//   const d = parseMaybeDdmmyyyy(str);
//   return d ? d.toLocaleDateString("en-GB") : "N/A"; // dd/mm/yyyy
// };

// // Format date for API (YYYY-MM-DD)
// const formatDateForAPI = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return date.toISOString().split("T")[0];
// };

// const toApiDate = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "");

// const formatINR = (n) => {
//   const num = Number(n || 0);
//   return `₹${num.toLocaleString("en-IN")}`;
// };

// const displayDate = (str) => toDisplayDate(str);


// const roleOptions = [
//   // { value: "Traditional Photography", label: "Traditional Photography" },
//   // { value: "Traditional Videography", label: "Traditional Videography" },
//   // { value: "Candid Photography", label: "Candid Photography" },
//   // { value: "Candid Videography", label: "Candid Videography" },
//   { value: "Album Designing", label: "Album Designing" },
//   // { value: "Traditional Video editing", label: "Traditional Video editing" },
//   // { value: "Traditional Photo editing", label: "Traditional Photo editing" },
//   // { value: "Candid Video editing", label: "Candid Video editing" },
//   // { value: "Candid Photo editing", label: "Candid Photo editing" },
//   { value: "Photo sorting", label: "Photo sorting" },
//   { value: "Video sorting/Conversion", label: "Video sorting/Conversion" },
//   { value: "Assistant", label: "Assistant" },
//   { value: "Driver", label: "Driver" },
//   { value: "CC Admin", label: "CC Admin" },
//   { value: "CR Manager", label: "CR Manager" },
//   // { value: "Drone", label: "Drone" },
//   // { value: "LED wall 6X8", label: "LED wall 6X8" },
//   // { value: "LED wall 8X10", label: "LED wall 8X10" },
//   // { value: "FPV Drone", label: "FPV Drone" },
//   // { value: "Photobooth", label: "Photobooth" },
//   // { value: "Magic mirror photobooth", label: "Magic mirror photobooth" },
//   // { value: "360 degree Spinny", label: "360 degree Spinny" },
//   // { value: "Mixing Unit", label: "Mixing Unit" },
//   // { value: "Live Streaming", label: "Live Streaming" },
//   // { value: "3D Video", label: "3D Video" },
//   // { value: "360 degree VR Video", label: "360 degree VR Video" },
//   // { value: "3D Video editing", label: "3D Video editing" },
//   // {
//   //   value: "360 degree VR Video editing",
//   //   label: "360 degree VR Video editing",
//   // },
//   { value: "Make up Artist", label: "Make up Artist" },
//   {
//     value: "Speakers & Audio arrangements",
//     label: "Speakers & Audio arrangements",
//   },
//   { value: "Album final correction", label: "Album final correction" },
//   { value: "Photo colour correction", label: "Photo colour correction" },
//   { value: "Album photo selection", label: "Album photo selection" },

//   { value: "Photo slideshow", label: "Photo slideshow" },
//   { value: "Photo lamination & Frame", label: "Photo lamination & Frame" },
//   { value: "Photo Printing Lab", label: "Photo Printing Lab" },
//   { value: "Storage devices", label: "Storage devices" },
//   {
//     value: "Marketing collaterals Printing",
//     label: "Marketing collaterals Printing",
//   },
//   { value: "Uniforms", label: "Uniforms" },
//   { value: "Branding collaterals", label: "Branding collaterals" },
//   {
//     value: "Software & Hardware service",
//     label: "Software & Hardware service",
//   },
//   { value: "Supervisor", label: "Supervisor" },
//   { value: "Marketing Team", label: "Marketing Team" },
//   { value: "Branding Team", label: "Branding Team" },
// ];

// const PaymentPage = () => {
//   const navigate = useNavigate();
//   const [payments, setPayments] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   // const [vendorOptions, setVendorOptions] = useState([]);
//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [vendorLoading, setVendorLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [vendorCurrentPage, setVendorCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [vendorTotalPages, setVendorTotalPages] = useState(1);
//   const [activeTab, setActiveTab] = useState("client");
// const [clientMethod, setClientMethod] = useState(""); // Online / Cash etc.


//   // Pay Modal state
//   const [showPayModal, setShowPayModal] = useState(false);
//   const [payingVendor, setPayingVendor] = useState(null);
//   const [payForm, setPayForm] = useState({
//     paymentDate: "",
//     paymentMode: "",
//   });


// // ✅ Client tab (Payment Tracker)
// const [clientRows, setClientRows] = useState([]);
// const [clientSearchInput, setClientSearchInput] = useState("");
// const [clientSearch, setClientSearch] = useState("");
// const [clientPage, setClientPage] = useState(1);
// const [clientTotalPages, setClientTotalPages] = useState(1);
// const [clientTotal, setClientTotal] = useState(0);
// const [clientLoading, setClientLoading] = useState(false);

// // ✅ date filters for tracker
// const [startDate, setStartDate] = useState("");
// const [endDate, setEndDate] = useState("");


//   // Vendor Pending tab
//   const [vendorPendingSearchInput, setVendorPendingSearchInput] = useState("");
//   const [vendorPendingSearch, setVendorPendingSearch] = useState("");
//   const [vendorPendingPage, setVendorPendingPage] = useState(1);
//   const [vendorPendingTotalPages, setVendorPendingTotalPages] = useState(1);

//   // Vendor Completed tab
//   const [vendorCompletedSearchInput, setVendorCompletedSearchInput] =
//     useState("");
//   const [vendorCompletedSearch, setVendorCompletedSearch] = useState("");
//   const [vendorCompletedPage, setVendorCompletedPage] = useState(1);
//   const [vendorCompletedTotalPages, setVendorCompletedTotalPages] = useState(1);

//   // Add payment modal state
//   const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
//   const [selectedVendorPayment, setSelectedVendorPayment] = useState(null);
//   const [additionalPayment, setAdditionalPayment] = useState({
//     amount: "",
//     paymentDate: "",
//     note: "",
//   });

//   // 🔹 Add new state at top of PaymentPage
//   const [otherExpenses, setOtherExpenses] = useState([]);
//   const [newExpense, setNewExpense] = useState({
//     amount: "",
//     remarks: "",
//     paidTo: "",
//     paymentDate: "",
//   });

//   // Other Expenses tab
//   const [expenseSearchInput, setExpenseSearchInput] = useState("");
//   const [expenseSearch, setExpenseSearch] = useState("");
//   const [expensePage, setExpensePage] = useState(1);
//   const [expenseTotalPages, setExpenseTotalPages] = useState(1);
//   const [showExpenseModal, setShowExpenseModal] = useState(false);

//   // Client Payments
//  const fetchClientPayments = async () => {
//   try {
//     setClientLoading(true);

//     const params = new URLSearchParams();
//     params.set("page", String(clientPage));
//     params.set("limit", "10");

//     const q = String(clientSearch || "").trim();
//     if (q) params.set("q", q);

//     const from = toApiDate(startDate);
//     const to = toApiDate(endDate);
//     if (from) params.set("from", from);
//     if (to) params.set("to", to);

//     const url = `${API_URL}/payment-tracker?${params.toString()}`;

//     const res = await axios.get(url);

//     if (res.data?.success) {
//       const rows = Array.isArray(res.data.data) ? res.data.data : [];

//       // ✅ API returns total count. We calculate total pages.
//       const total = Number(res.data.total || 0);
//       const limit = Number(res.data.limit || 10);
//       const pages = Math.max(1, Math.ceil(total / limit));

//       setClientRows(rows);
//       setClientTotal(total);
//       setClientTotalPages(pages);
//     } else {
//       setClientRows([]);
//       setClientTotal(0);
//       setClientTotalPages(1);
//       toast.error(res.data?.message || "Failed to fetch payment tracker");
//     }
//   } catch (err) {
//     console.error("Error fetching payment tracker:", err);
//     setClientRows([]);
//     setClientTotal(0);
//     setClientTotalPages(1);
//     toast.error(err.response?.data?.message || "Failed to fetch payment tracker");
//   } finally {
//     setClientLoading(false);
//   }
// };


//   // Vendors (Pending / Completed)
//   const fetchVendorPayments = async (status, page, search) => {
//     setVendorLoading(true);
//     try {
//       const url = `${API_URL}/vendors/vendor-payments?status=${status}&page=${page}&limit=10&search=${encodeURIComponent(
//         search || "",
//       )}`;

//       const response = await axios.get(url);

//       if (response.data.success && response.data.data) {
//         // Convert object → array
//         const vendorArray = Object.entries(response.data.data).map(
//           ([vendorId, details]) => ({
//             vendorId,
//             ...details,
//           }),
//         );

//         setVendors(vendorArray);

//         // update total pages based on tab
//         if (status === "Pending") {
//           setVendorPendingTotalPages(response.data.pagination?.totalPages || 1);
//         } else if (status === "Completed") {
//           setVendorCompletedTotalPages(
//             response.data.pagination?.totalPages || 1,
//           );
//         }
//       } else {
//         toast.error("No vendor payment data found");
//         setVendors([]);
//       }
//     } catch (err) {
//       console.error("Error fetching vendor payments:", err);
//       toast.error(
//         err.response?.data?.message || "Failed to fetch vendor payments",
//       );
//       setVendors([]);
//     } finally {
//       setVendorLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "other expenses") {
//       fetchOtherExpenses();
//     }
//   }, [activeTab, expensePage, expenseSearch]);

//   // Client
//   useEffect(() => {
//     if (activeTab === "client") fetchClientPayments();
//   }, [clientPage, clientSearch, startDate, endDate, activeTab]);

//   // Vendor Pending
//   useEffect(() => {
//     if (activeTab === "vendor pending")
//       fetchVendorPayments("Pending", vendorPendingPage, vendorPendingSearch);
//   }, [vendorPendingPage, vendorPendingSearch, activeTab]);

//   // Vendor Completed
//   useEffect(() => {
//     if (activeTab === "vendor completed")
//       fetchVendorPayments(
//         "Completed",
//         vendorCompletedPage,
//         vendorCompletedSearch,
//       );
//   }, [vendorCompletedPage, vendorCompletedSearch, activeTab]);

//   // Client
// const handleClientSearch = (e) => {
//   e.preventDefault();
//   setClientSearch(clientSearchInput);
//   setClientPage(1);
// };

// const handleClientClear = () => {
//   setClientSearchInput("");
//   setClientSearch("");
//   setStartDate("");
//   setEndDate("");
//   setClientPage(1);
// };


//   // Vendor Pending
//   const handleVendorPendingSearch = (e) => {
//     e.preventDefault();
//     setVendorPendingSearch(vendorPendingSearchInput);
//     setVendorPendingPage(1);
//   };
//   const handleVendorPendingClear = () => {
//     setVendorPendingSearchInput("");
//     setVendorPendingSearch("");
//     setVendorPendingPage(1);
//   };

//   // Vendor Completed
//   const handleVendorCompletedSearch = (e) => {
//     e.preventDefault();
//     setVendorCompletedSearch(vendorCompletedSearchInput);
//     setVendorCompletedPage(1);
//   };
//   const handleVendorCompletedClear = () => {
//     setVendorCompletedSearchInput("");
//     setVendorCompletedSearch("");
//     setVendorCompletedPage(1);
//   };

//   const handleExpenseSearch = (e) => {
//     e.preventDefault();
//     setExpenseSearch(expenseSearchInput);
//     setExpensePage(1);
//   };

//   const handleExpenseClear = () => {
//     setExpenseSearchInput("");
//     setExpenseSearch("");
//     setExpensePage(1);
//   };

//   const handlePayVendorSubmit = async () => {
//     if (!payForm.paymentDate || !payForm.paymentMode) {
//       toast.error("All fields are required");
//       return;
//     }

//     try {
//       // pick the first event for now (or you can loop if you want all)
//       const event = payingVendor.events[0];

//       console.log("event", event);

//       await axios.put(
//         `${API_URL}/vendors/pay-vendor/${payingVendor.vendorId}`,
//         {
//           paymentMode: payForm.paymentMode,
//           paymentDate: payForm.paymentDate,
//         },
//       );

//       toast.success("Vendor paid successfully");
//       setShowPayModal(false);
//       setPayingVendor(null);
//       fetchVendorPayments("Pending", vendorPendingPage, vendorPendingSearch);
//     } catch (err) {
//       console.error("Pay vendor error:", err);
//       toast.error("Failed to pay vendor");
//     }
//   };

//   // Fetch full report for Excel download
//  const handleDownloadExcel = async () => {
//   try {
//     const q = String(clientSearch || "").trim();
//     const from = toApiDate(startDate);
//     const to = toApiDate(endDate);

//     // fetch all pages
//     let page = 1;
//     const limit = 100; // bigger page for faster export
//     let allRows = [];
//     let total = 0;

//     while (true) {
//       const params = new URLSearchParams();
//       params.set("page", String(page));
//       params.set("limit", String(limit));
//       if (q) params.set("q", q);
//       if (from) params.set("from", from);
//       if (to) params.set("to", to);

//       const url = `${API_URL}/payment-tracker?${params.toString()}`;
//       const res = await axios.get(url);

//       if (!res.data?.success) break;

//       const batch = Array.isArray(res.data.data) ? res.data.data : [];
//       allRows = allRows.concat(batch);

//       total = Number(res.data.total || 0);

//       if (allRows.length >= total) break;
//       page += 1;
//     }

//     const worksheetData = allRows.map((r, idx) => ({
//       "Sl.No": idx + 1,
//       "QuotationId (ObjectId)": r.quotationId || "",
//       "InstallmentId": r.installmentId || "",
//       "Paid Amount": Number(r.paidAmount || 0),
//       "Payment Method": r.paymentMethod || "",
//       "Paid To": r.paidTo || "",
//       "Payment Date": r.paymentDate ? dayjs(r.paymentDate).format("DD-MM-YYYY HH:mm") : "N/A",
//       "Created At": r.createdAt ? dayjs(r.createdAt).format("DD-MM-YYYY HH:mm") : "N/A",
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Payment Tracker");
//     XLSX.writeFile(workbook, "PaymentTrackerReport.xlsx");

//     toast.success("Excel downloaded successfully");
//   } catch (err) {
//     console.error("Excel download error:", err);
//     toast.error("Failed to download Excel");
//   }
// };


//   // Vendor Excel download (Pending / Completed)
//   const handleDownloadVendorExcel = async (status, search) => {
//     try {
//       const url = `${API_URL}/vendors/vendor-payments?status=${status}&search=${encodeURIComponent(
//         search || "",
//       )}&all=true`;

//       const response = await axios.get(url);
//       const vendorData = response.data.data || [];

//       // Convert object → array
//       const vendorArray = Object.entries(vendorData).map(
//         ([vendorId, details]) => ({
//           vendorId,
//           ...details,
//         }),
//       );

//       const worksheetData = vendorArray.map((v) => ({
//         "Vendor Name": v.vendorName,
//         "Vendor Category": v.vendorCategory,
//         "Total Salary": v.totalSalary,
//         Events: (v.events || [])
//           .map(
//             (e) =>
//               `${e.quoteId} - ${e.categoryName} - ${
//                 e.serviceName
//               } - ${toDisplayDate(e.eventDate)} - ${e.slot} - ₹${e.salary}`,
//           )
//           .join("; "),
//       }));

//       const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, `${status} Vendors`);
//       XLSX.writeFile(workbook, `${status}VendorPayments.xlsx`);

//       toast.success(`${status} vendor payments downloaded`);
//     } catch (err) {
//       toast.error("Failed to download vendor Excel");
//     }
//   };

//   // 📥 Download Other Expenses Excel
//   const handleDownloadExpensesExcel = async () => {
//     try {
//       const res = await axios.get(
//         `${API_URL}/other-expenses?search=${encodeURIComponent(
//           expenseSearch || "",
//         )}&all=true`,
//       );

//       const expenses = res.data.data || [];

//       const worksheetData = expenses.map((exp) => ({
//         Amount: exp.amount,
//         Remarks: exp.remarks,
//         "Paid To": exp.paidTo,
//         "Payment Date": toDisplayDate(exp.paymentDate),
//         "Created At": toDisplayDate(exp.createdAt),
//       }));

//       const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Other Expenses");
//       XLSX.writeFile(workbook, "OtherExpensesReport.xlsx");

//       toast.success("Other Expenses Excel downloaded");
//     } catch (err) {
//       console.error("Download error:", err);
//       toast.error("Failed to download Excel");
//     }
//   };

//   // Fetch all other expenses
//   const fetchOtherExpenses = async () => {
//     try {
//       const res = await axios.get(
//         `${API_URL}/other-expenses?page=${expensePage}&limit=10&search=${encodeURIComponent(
//           expenseSearch || "",
//         )}`,
//       );

//       setOtherExpenses(res.data.data || []);
//       setExpenseTotalPages(res.data.pagination?.totalPages || 1);
//     } catch (err) {
//       console.error("Error fetching expenses:", err);
//       toast.error("Failed to fetch expenses");
//       setOtherExpenses([]);
//     }
//   };

//   // Add new expense
//   const handleAddExpense = async (e) => {
//     e.preventDefault();
//     if (
//       !newExpense.amount ||
//       !newExpense.remarks ||
//       !newExpense.paidTo ||
//       !newExpense.paymentDate
//     ) {
//       toast.error("All fields are required");
//       return;
//     }

//     try {
//       const res = await axios.post(`${API_URL}/other-expenses`, newExpense);
//       toast.success("Expense added successfully");

//       // refresh list
//       fetchOtherExpenses();
//       setShowExpenseModal(false);
//       // clear form
//       setNewExpense({ amount: "", remarks: "", paidTo: "", paymentDate: "" });
//     } catch (err) {
//       console.error("Error adding expense:", err);
//       toast.error("Failed to add expense");
//     }
//   };

//   return (
//     <div
//       className="container py-2 rounded vh-100"
//       style={{ background: "#F4F4F4" }}
//     >
//       {/* Tabs for Client and Vendor Payments */}
//       <Tabs
//         activeKey={activeTab}
//         onSelect={(tab) => setActiveTab(tab)}
//         className="mb-3"
//       >
//       <Tab eventKey="client" title="Client Payments">
//   {/* Search */}
//   <Form onSubmit={handleClientSearch} style={{ width: "350px" }}>
//     <InputGroup>
//       <Form.Control
//         type="text"
//         placeholder="Search by quotationId / name / phone"
//         value={clientSearchInput}
//         onChange={(e) => setClientSearchInput(e.target.value)}
//       />
//       <Button type="submit" variant="dark">
//         Search
//       </Button>
//       {(clientSearch || startDate || endDate) && (
//         <Button onClick={handleClientClear} variant="secondary">
//           Clear
//         </Button>
//       )}
//     </InputGroup>
//   </Form>

//   {/* Date Filters (optional - keep if you want) */}
//   <div className="d-flex gap-2 mt-2 flex-wrap">
//     <div>
//       <small className="text-muted">From</small>
//       <Form.Control
//         type="date"
//         value={startDate}
//         onChange={(e) => {
//           setStartDate(e.target.value);
//           setClientPage(1);
//         }}
//       />
//     </div>
//     <div>
//       <small className="text-muted">To</small>
//       <Form.Control
//         type="date"
//         value={endDate}
//         onChange={(e) => {
//           setEndDate(e.target.value);
//           setClientPage(1);
//         }}
//       />
//     </div>

//     <div className="ms-auto d-flex align-items-end">
//       <Button
//         variant="light-gray"
//         className="btn rounded-5 bg-white border-2 shadow-sm"
//         style={{ fontSize: "14px" }}
//         onClick={handleDownloadExcel}
//       >
//         Download Excel
//       </Button>
//     </div>
//   </div>

//   {/* Table */}
//   <Card className="border-0 p-3 my-3">
//     <div className="d-flex justify-content-between align-items-center mb-2">
//       <small className="text-muted">
//         Total Records: <b>{clientTotal}</b>
//       </small>
//     </div>

//     <div
//       className="table-responsive bg-white"
//       style={{ maxHeight: "65vh", overflowY: "auto" }}
//     >
//       <Table className="table table-hover align-middle">
//         <thead
//           className="text-white sticky-top"
//           style={{ backgroundColor: "#343a40" }}
//         >
//           <tr style={{ fontSize: "14px" }}>
//             <th>Sl.No</th>
//             <th>QuotationId</th>
//             <th>InstallmentId</th>
//             <th>Method</th>
//             <th>Paid To</th>
//             <th>Amount</th>
//             <th>Date</th>
//           </tr>
//         </thead>

//         <tbody style={{ fontSize: "12px" }} className="fw-semibold">
//           {clientLoading ? (
//             <tr>
//               <td colSpan="7" className="text-center py-4">
//                 Loading...
//               </td>
//             </tr>
//           ) : clientRows.length === 0 ? (
//             <tr>
//               <td colSpan="7" className="text-center">
//                 No payments found
//               </td>
//             </tr>
//           ) : (
//             clientRows.map((r, index) => (
//               <tr key={r._id} style={{ cursor: "default" }}>
//                 <td>{(clientPage - 1) * 10 + (index + 1)}</td>
//                 <td style={{ maxWidth: 180 }}>
//                   <span title={r.quotationId}>{r.quotationId}</span>
//                 </td>
//                 <td style={{ maxWidth: 180 }}>
//                   <span title={r.installmentId}>{r.installmentId}</span>
//                 </td>
//                 <td>{r.paymentMethod || "-"}</td>
//                 <td>{r.paidTo || "-"}</td>
//                 <td>{formatINR(r.paidAmount)}</td>
//                 <td>{toDisplayDate(r.paymentDate)}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </Table>
//     </div>
//   </Card>

//   {/* Pagination */}
//   <DynamicPagination
//     currentPage={clientPage}
//     totalPages={clientTotalPages}
//     onPageChange={setClientPage}
//   />
// </Tab>


//         <Tab eventKey="vendor pending" title="Vendor Pending Payments">
//           {/* Search and Date Filters */}
//           <Form onSubmit={handleVendorPendingSearch} style={{ width: "350px" }}>
//             <InputGroup>
//               <Form.Control
//                 type="text"
//                 placeholder="Search by Vendor name"
//                 value={vendorPendingSearchInput}
//                 onChange={(e) => setVendorPendingSearchInput(e.target.value)}
//               />
//               <Button type="submit" variant="dark">
//                 Search
//               </Button>
//               {vendorPendingSearch && (
//                 <Button onClick={handleVendorPendingClear}>Clear</Button>
//               )}
//             </InputGroup>
//           </Form>
//           <div className="d-flex justify-content-end mb-2 gap-2">
//             <Button
//               variant="light-gray"
//               className="btn rounded-5 bg-white border-2 shadow-sm"
//               style={{ fontSize: "14px" }}
//               onClick={() =>
//                 handleDownloadVendorExcel("Pending", vendorPendingSearch)
//               }
//             >
//               Download Excel
//             </Button>
//           </div>

//           {/* Vendor Payments Table */}
//           <Card className="border-0 p-3 my-3">
//             {vendorLoading && <p>Loading vendor payments...</p>}
//             <div
//               className="table-responsive bg-white"
//               style={{ maxHeight: "65vh", overflowY: "auto" }}
//             >
//               <Table className="table table-hover align-middle">
//                 <thead
//                   className="text-white sticky-top"
//                   style={{ backgroundColor: "#343a40" }}
//                 >
//                   <tr style={{ fontSize: "14px" }}>
//                     <th>Sl.No</th>
//                     <th>Vendor Name</th>
//                     <th>Vendor Type</th>
//                     <th>Total Salary</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody style={{ fontSize: "12px" }} className="fw-semibold">
//                   {vendors.length === 0 && !vendorLoading ? (
//                     <tr>
//                       <td colSpan="4" className="text-center">
//                         No vendor payments found
//                       </td>
//                     </tr>
//                   ) : (
//                     vendors.map((vendor, index) => (
//                       <tr key={vendor.vendorId}>
//                         <td>{index + 1}</td>
//                         <td>{vendor.vendorName}</td>
//                         <td>{vendor.vendorCategory}</td>
//                         <td>₹{vendor.totalSalary?.toLocaleString("en-IN")}</td>
//                         <td>
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={
//                               <Tooltip id={`tooltip-view-${vendor.vendorId}`}>
//                                 View Details
//                               </Tooltip>
//                             }
//                           >
//                             <Button
//                               variant="outline-dark"
//                               size="sm"
//                               onClick={() => {
//                                 setSelectedVendorPayment(vendor);
//                                 setShowAddPaymentModal(true);
//                               }}
//                             >
//                               <FaEye />
//                             </Button>
//                           </OverlayTrigger>
//                           <Button
//                             variant="outline-success"
//                             size="sm"
//                             className="ms-2"
//                             onClick={() => {
//                               setPayingVendor(vendor);
//                               setPayForm({ paymentDate: "", paymentMode: "" });
//                               setShowPayModal(true);
//                             }}
//                           >
//                             Pay
//                           </Button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </Table>
//             </div>
//           </Card>

//           {/* Vendor Payments Pagination */}
//           <DynamicPagination
//             currentPage={vendorPendingPage}
//             totalPages={vendorPendingTotalPages}
//             onPageChange={setVendorPendingPage}
//           />
//         </Tab>

//         <Tab eventKey="vendor completed" title="Vendor Completed Payments">
//           {/* Search and Date Filters */}
//           <Form
//             onSubmit={handleVendorCompletedSearch}
//             style={{ width: "350px" }}
//           >
//             <InputGroup>
//               <Form.Control
//                 type="text"
//                 placeholder="Search by Vendor name"
//                 value={vendorCompletedSearchInput}
//                 onChange={(e) => setVendorCompletedSearchInput(e.target.value)}
//               />
//               <Button type="submit" variant="dark">
//                 Search
//               </Button>
//               {vendorCompletedSearch && (
//                 <Button onClick={handleVendorCompletedClear}>Clear</Button>
//               )}
//             </InputGroup>
//           </Form>

//           <div className="d-flex justify-content-end mb-2 gap-2">
//             <Button
//               variant="light-gray"
//               className="btn rounded-5 bg-white border-2 shadow-sm"
//               style={{ fontSize: "14px" }}
//               onClick={() =>
//                 handleDownloadVendorExcel("Completed", vendorCompletedSearch)
//               }
//             >
//               Download Excel
//             </Button>
//           </div>

//           {/* Vendor Payments Table */}
//           <Card className="border-0 p-3 my-3">
//             {vendorLoading && <p>Loading vendor payments...</p>}
//             <div
//               className="table-responsive bg-white"
//               style={{ maxHeight: "65vh", overflowY: "auto" }}
//             >
//               <Table className="table table-hover align-middle">
//                 <thead
//                   className="text-white  sticky-top"
//                   style={{ backgroundColor: "#343a40" }}
//                 >
//                   <tr style={{ fontSize: "14px" }}>
//                     <th>Sl.No</th>
//                     <th>Vendor Name</th>
//                     <th>Vendor Type</th>
//                     <th>Total Salary</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody style={{ fontSize: "12px" }} className="fw-semibold">
//                   {vendors.length === 0 && !vendorLoading ? (
//                     <tr>
//                       <td colSpan="4" className="text-center">
//                         No vendor payments found
//                       </td>
//                     </tr>
//                   ) : (
//                     vendors.map((vendor, index) => (
//                       <tr key={vendor.vendorId}>
//                         <td>{index + 1}</td>
//                         <td>{vendor.vendorName}</td>
//                         <td>{vendor.vendorCategory}</td>
//                         <td>₹{vendor.totalSalary?.toLocaleString("en-IN")}</td>
//                         <td>
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={
//                               <Tooltip id={`tooltip-view-${vendor.vendorId}`}>
//                                 View Details
//                               </Tooltip>
//                             }
//                           >
//                             <Button
//                               variant="outline-dark"
//                               size="sm"
//                               onClick={() => {
//                                 setSelectedVendorPayment(vendor);
//                                 setShowAddPaymentModal(true);
//                               }}
//                             >
//                               <FaEye />
//                             </Button>
//                           </OverlayTrigger>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </Table>
//             </div>
//           </Card>

//           {/* Vendor Payments Pagination */}
//           <DynamicPagination
//             currentPage={vendorCompletedPage}
//             totalPages={vendorCompletedTotalPages}
//             onPageChange={setVendorCompletedPage}
//           />
//         </Tab>

//         <Tab eventKey="other expenses" title="Other Expenses">
//           <Card className="border-0 p-3 my-3">
//             {/* 🔍 Search */}
//             <Form onSubmit={handleExpenseSearch} style={{ width: "350px" }}>
//               <InputGroup>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search by Remarks or Paid To"
//                   value={expenseSearchInput}
//                   onChange={(e) => setExpenseSearchInput(e.target.value)}
//                 />
//                 <Button type="submit" variant="dark">
//                   Search
//                 </Button>
//                 {expenseSearch && (
//                   <Button onClick={handleExpenseClear}>Clear</Button>
//                 )}
//               </InputGroup>
//             </Form>

//             {/* 🔘 Action buttons */}
//             <div className="d-flex justify-content-end mb-2 gap-2">
//               <Button
//                 variant="dark"
//                 className="btn rounded-5 shadow-sm"
//                 style={{ fontSize: "14px" }}
//                 onClick={() => setShowExpenseModal(true)}
//               >
//                 + Add Expense
//               </Button>
//               <Button
//                 variant="light-gray"
//                 className="btn rounded-5 bg-white border-2 shadow-sm"
//                 style={{ fontSize: "14px" }}
//                 onClick={handleDownloadExpensesExcel}
//               >
//                 Download Excel
//               </Button>
//             </div>

//             {/* 📋 Expenses Table */}
//             <div
//               className="table-responsive bg-white"
//               style={{ maxHeight: "65vh", overflowY: "auto" }}
//             >
//               <Table className="table table-hover align-middle">
//                 <thead
//                   className="text-white sticky-top"
//                   style={{ backgroundColor: "#343a40" }}
//                 >
//                   <tr style={{ fontSize: "14px" }}>
//                     <th>Sl.No</th>
//                     <th>Amount</th>
//                     <th>Remarks</th>
//                     <th>Paid To</th>
//                     <th>Payment Date</th>
//                   </tr>
//                 </thead>
//                 <tbody style={{ fontSize: "12px" }} className="fw-semibold">
//                   {otherExpenses.length === 0 ? (
//                     <tr>
//                       <td colSpan="5" className="text-center">
//                         No expenses found
//                       </td>
//                     </tr>
//                   ) : (
//                     otherExpenses.map((exp, idx) => (
//                       <tr key={exp._id || idx}>
//                         <td>{(expensePage - 1) * 10 + (idx + 1)}</td>
//                         <td>₹{Number(exp.amount).toLocaleString("en-IN")}</td>
//                         <td>{exp.remarks}</td>
//                         <td>{exp.paidTo}</td>
//                         <td>{toDisplayDate(exp.paymentDate)}</td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </Table>
//             </div>

//             {/* 🔄 Pagination */}
//             <DynamicPagination
//               currentPage={expensePage}
//               totalPages={expenseTotalPages}
//               onPageChange={setExpensePage}
//             />
//           </Card>
//         </Tab>
//       </Tabs>

//       {/* 🟢 Add Expense Modal */}
//       <Modal
//         show={showExpenseModal}
//         onHide={() => setShowExpenseModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Add Other Expense</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleAddExpense}>
//             <Row className="g-3">
//               {/* Amount */}
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Amount</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={newExpense.amount}
//                     onChange={(e) =>
//                       setNewExpense((prev) => ({
//                         ...prev,
//                         amount: e.target.value,
//                       }))
//                     }
//                     required
//                   />
//                 </Form.Group>
//               </Col>

//               {/* Paid To */}
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Paid To</Form.Label>
//                   <Select
//                     options={roleOptions}
//                     value={
//                       roleOptions.find(
//                         (opt) => opt.value === newExpense.paidTo,
//                       ) || null
//                     }
//                     onChange={(selected) =>
//                       setNewExpense((prev) => ({
//                         ...prev,
//                         paidTo: selected?.value || "",
//                       }))
//                     }
//                     placeholder="Select Role"
//                     isClearable
//                   />
//                 </Form.Group>
//               </Col>

//               {/* Remarks */}
//               <Col md={12}>
//                 <Form.Group>
//                   <Form.Label>Remarks</Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={newExpense.remarks}
//                     onChange={(e) =>
//                       setNewExpense((prev) => ({
//                         ...prev,
//                         remarks: e.target.value,
//                       }))
//                     }
//                     required
//                   />
//                 </Form.Group>
//               </Col>

//               {/* Payment Date */}
//               <Col md={12}>
//                 <Form.Group>
//                   <Form.Label>Payment Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={newExpense.paymentDate}
//                     onChange={(e) =>
//                       setNewExpense((prev) => ({
//                         ...prev,
//                         paymentDate: e.target.value,
//                       }))
//                     }
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <div className="mt-3 text-end">
//               <Button
//                 variant="secondary"
//                 onClick={() => setShowExpenseModal(false)}
//                 className="me-2"
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" variant="dark">
//                 Save
//               </Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       {/* Vendor Payment Modal */}
//       <Modal
//         show={showAddPaymentModal}
//         onHide={() => {
//           setShowAddPaymentModal(false);
//           setSelectedVendorPayment(null);
//         }}
//         size="lg"
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title style={{ fontSize: "16px" }}>
//             Vendor Payment Details
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedVendorPayment && (
//             <div style={{ fontSize: "13px" }}>
//               <div className="d-flex gap-5">
//                 <p>
//                   <strong>Vendor:</strong> {selectedVendorPayment.vendorName}
//                 </p>
//                 <p>
//                   <strong>Total Salary:</strong> ₹
//                   {selectedVendorPayment.totalSalary?.toLocaleString("en-IN")}
//                 </p>
//               </div>
//               <hr />
//               <h6>Events</h6>
//               <Table bordered size="sm">
//                 <thead>
//                   <tr>
//                     <th>Quotation ID</th>
//                     <th>Category</th>
//                     <th>Service</th>
//                     <th>Date</th>
//                     <th>Slot</th>
//                     <th>Salary</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedVendorPayment.events.map((e, i) => (
//                     <tr key={i}>
//                       <td>{e.quoteId}</td>
//                       <td>{e.categoryName}</td>
//                       <td>{e.serviceName}</td>
//                       <td>{toDisplayDate(e.eventDate)}</td>
//                       <td>{e.slot}</td>
//                       <td>₹{e.salary?.toLocaleString("en-IN")}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => {
//               setShowAddPaymentModal(false);
//               setSelectedVendorPayment(null);
//             }}
//           >
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Pay Vendor Modal */}
//       <Modal
//         show={showPayModal}
//         onHide={() => {
//           setShowPayModal(false);
//           setPayingVendor(null);
//         }}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title style={{ fontSize: "16px" }}>Pay Vendor</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {payingVendor && (
//             <Form>
//               <div className="mb-3">
//                 <strong>Vendor:</strong> {payingVendor.vendorName}
//               </div>
//               <div className="mb-3">
//                 <strong>Total Salary:</strong> ₹
//                 {payingVendor.totalSalary?.toLocaleString("en-IN")}
//               </div>

//               {/* Payment Date */}
//               <Form.Group className="mb-3">
//                 <Form.Label>Payment Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={payForm.paymentDate}
//                   onChange={(e) =>
//                     setPayForm((prev) => ({
//                       ...prev,
//                       paymentDate: e.target.value,
//                     }))
//                   }
//                   required
//                 />
//               </Form.Group>

//               {/* Payment Mode */}
//               <Form.Group className="mb-3">
//                 <Form.Label>Payment Mode</Form.Label>
//                 <Form.Select
//                   value={payForm.paymentMode}
//                   onChange={(e) =>
//                     setPayForm((prev) => ({
//                       ...prev,
//                       paymentMode: e.target.value,
//                     }))
//                   }
//                   required
//                 >
//                   <option value="">Select Mode</option>
//                   <option value="Cash">Cash</option>
//                   <option value="Online">Online</option>
//                   <option value="Bank Transfer">Bank Transfer</option>
//                   <option value="Cheque">Cheque</option>
//                 </Form.Select>
//               </Form.Group>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => {
//               setShowPayModal(false);
//               setPayingVendor(null);
//             }}
//           >
//             Cancel
//           </Button>
//           <Button variant="dark" onClick={handlePayVendorSubmit}>
//             Submit
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default PaymentPage;


import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Card,
  InputGroup,
  Row,
  Col,
  Modal,
  Tab,
  Tabs,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Select from "react-select";
import { IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import DynamicPagination from "../DynamicPagination";
import { FaEye } from "react-icons/fa";
import { API_URL } from "../../utils/api";

// ---- Date helpers: handle "DD-MM-YYYY" and ISO strings ----
const parseMaybeDdmmyyyy = (str) => {
  if (!str) return null;

  // try native first (handles ISO etc.)
  const native = new Date(str);
  if (!Number.isNaN(native.getTime())) return native;

  // handle DD-MM-YYYY
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(str);
  if (m) {
    const [, dd, mm, yyyy] = m;
    // local time to avoid timezone day-shifts
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const toDisplayDate = (str) => {
  const d = parseMaybeDdmmyyyy(str);
  return d ? d.toLocaleDateString("en-GB") : "N/A"; // dd/mm/yyyy
};

// YYYY-MM-DD for API
const formatDateForAPI = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const formatINR = (n) => {
  const num = Number(n || 0);
  return `₹${num.toLocaleString("en-IN")}`;
};

const roleOptions = [
  { value: "Album Designing", label: "Album Designing" },
  { value: "Photo sorting", label: "Photo sorting" },
  { value: "Video sorting/Conversion", label: "Video sorting/Conversion" },
  { value: "Assistant", label: "Assistant" },
  { value: "Driver", label: "Driver" },
  { value: "CC Admin", label: "CC Admin" },
  { value: "CR Manager", label: "CR Manager" },
  { value: "Make up Artist", label: "Make up Artist" },
  {
    value: "Speakers & Audio arrangements",
    label: "Speakers & Audio arrangements",
  },
  { value: "Album final correction", label: "Album final correction" },
  { value: "Photo colour correction", label: "Photo colour correction" },
  { value: "Album photo selection", label: "Album photo selection" },
  { value: "Photo slideshow", label: "Photo slideshow" },
  { value: "Photo lamination & Frame", label: "Photo lamination & Frame" },
  { value: "Photo Printing Lab", label: "Photo Printing Lab" },
  { value: "Storage devices", label: "Storage devices" },
  {
    value: "Marketing collaterals Printing",
    label: "Marketing collaterals Printing",
  },
  { value: "Uniforms", label: "Uniforms" },
  { value: "Branding collaterals", label: "Branding collaterals" },
  { value: "Software & Hardware service", label: "Software & Hardware service" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Marketing Team", label: "Marketing Team" },
  { value: "Branding Team", label: "Branding Team" },
];

const PaymentPage = () => {
  const navigate = useNavigate();

  // ----------------------------
  // Tabs
  // ----------------------------
  const [activeTab, setActiveTab] = useState("client");

  // ----------------------------
  // ✅ Client tab (Payment Tracker)
  // ----------------------------
  const [clientRows, setClientRows] = useState([]);
  const [clientSearchInput, setClientSearchInput] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [clientPage, setClientPage] = useState(1);
  const [clientTotalPages, setClientTotalPages] = useState(1);
  const [clientTotal, setClientTotal] = useState(0);
  const [clientLoading, setClientLoading] = useState(false);

  // date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ payment method filter
  const [clientMethod, setClientMethod] = useState("");

  const CLIENT_LIMIT = 10;

  const fetchClientPayments = async () => {
    try {
      setClientLoading(true);

      const params = new URLSearchParams();
      params.set("page", String(clientPage));
      params.set("limit", String(CLIENT_LIMIT));

      const q = String(clientSearch || "").trim();
      if (q) params.set("q", q);

      const from = formatDateForAPI(startDate);
      const to = formatDateForAPI(endDate);
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const method = String(clientMethod || "").trim();
      if (method) params.set("paymentMethod", method);

      const url = `${API_URL}/payment-tracker?${params.toString()}`;

      const res = await axios.get(url);

      if (res.data?.success) {
        const rows = Array.isArray(res.data.data) ? res.data.data : [];

        const total = Number(res.data.total || 0);
        const limit = Number(res.data.limit || CLIENT_LIMIT);
        const pages = Math.max(1, Math.ceil(total / limit));

        setClientRows(rows);
        setClientTotal(total);
        setClientTotalPages(pages);
      } else {
        setClientRows([]);
        setClientTotal(0);
        setClientTotalPages(1);
        toast.error(res.data?.message || "Failed to fetch payment tracker");
      }
    } catch (err) {
      console.error("Error fetching payment tracker:", err);
      setClientRows([]);
      setClientTotal(0);
      setClientTotalPages(1);
      toast.error(err.response?.data?.message || "Failed to fetch payment tracker");
    } finally {
      setClientLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "client") fetchClientPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, clientPage, clientSearch, startDate, endDate, clientMethod]);

  const handleClientSearch = (e) => {
    e.preventDefault();
    setClientSearch(clientSearchInput);
    setClientPage(1);
  };

  const handleClientClear = () => {
    setClientSearchInput("");
    setClientSearch("");
    setStartDate("");
    setEndDate("");
    setClientMethod("");
    setClientPage(1);
  };

  // ----------------------------
  // Vendors (Pending / Completed) - unchanged
  // ----------------------------
  const [vendors, setVendors] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);

  const [vendorPendingSearchInput, setVendorPendingSearchInput] = useState("");
  const [vendorPendingSearch, setVendorPendingSearch] = useState("");
  const [vendorPendingPage, setVendorPendingPage] = useState(1);
  const [vendorPendingTotalPages, setVendorPendingTotalPages] = useState(1);

  const [vendorCompletedSearchInput, setVendorCompletedSearchInput] = useState("");
  const [vendorCompletedSearch, setVendorCompletedSearch] = useState("");
  const [vendorCompletedPage, setVendorCompletedPage] = useState(1);
  const [vendorCompletedTotalPages, setVendorCompletedTotalPages] = useState(1);

  const fetchVendorPayments = async (status, page, search) => {
    setVendorLoading(true);
    try {
      const url = `${API_URL}/vendors/vendor-payments?status=${status}&page=${page}&limit=10&search=${encodeURIComponent(
        search || ""
      )}`;

      const response = await axios.get(url);

      if (response.data.success && response.data.data) {
        const vendorArray = Object.entries(response.data.data).map(
          ([vendorId, details]) => ({
            vendorId,
            ...details,
          })
        );

        setVendors(vendorArray);

        if (status === "Pending") {
          setVendorPendingTotalPages(response.data.pagination?.totalPages || 1);
        } else if (status === "Completed") {
          setVendorCompletedTotalPages(response.data.pagination?.totalPages || 1);
        }
      } else {
        toast.error("No vendor payment data found");
        setVendors([]);
      }
    } catch (err) {
      console.error("Error fetching vendor payments:", err);
      toast.error(err.response?.data?.message || "Failed to fetch vendor payments");
      setVendors([]);
    } finally {
      setVendorLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "vendor pending")
      fetchVendorPayments("Pending", vendorPendingPage, vendorPendingSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, vendorPendingPage, vendorPendingSearch]);

  useEffect(() => {
    if (activeTab === "vendor completed")
      fetchVendorPayments("Completed", vendorCompletedPage, vendorCompletedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, vendorCompletedPage, vendorCompletedSearch]);

  const handleVendorPendingSearch = (e) => {
    e.preventDefault();
    setVendorPendingSearch(vendorPendingSearchInput);
    setVendorPendingPage(1);
  };
  const handleVendorPendingClear = () => {
    setVendorPendingSearchInput("");
    setVendorPendingSearch("");
    setVendorPendingPage(1);
  };

  const handleVendorCompletedSearch = (e) => {
    e.preventDefault();
    setVendorCompletedSearch(vendorCompletedSearchInput);
    setVendorCompletedPage(1);
  };
  const handleVendorCompletedClear = () => {
    setVendorCompletedSearchInput("");
    setVendorCompletedSearch("");
    setVendorCompletedPage(1);
  };

  // ----------------------------
  // Other Expenses - unchanged
  // ----------------------------
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    remarks: "",
    paidTo: "",
    paymentDate: "",
  });

  const [expenseSearchInput, setExpenseSearchInput] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expensePage, setExpensePage] = useState(1);
  const [expenseTotalPages, setExpenseTotalPages] = useState(1);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const fetchOtherExpenses = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/other-expenses?page=${expensePage}&limit=10&search=${encodeURIComponent(
          expenseSearch || ""
        )}`
      );

      setOtherExpenses(res.data.data || []);
      setExpenseTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      toast.error("Failed to fetch expenses");
      setOtherExpenses([]);
    }
  };

  useEffect(() => {
    if (activeTab === "other expenses") fetchOtherExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, expensePage, expenseSearch]);

  const handleExpenseSearch = (e) => {
    e.preventDefault();
    setExpenseSearch(expenseSearchInput);
    setExpensePage(1);
  };

  const handleExpenseClear = () => {
    setExpenseSearchInput("");
    setExpenseSearch("");
    setExpensePage(1);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.remarks || !newExpense.paidTo || !newExpense.paymentDate) {
      toast.error("All fields are required");
      return;
    }

    try {
      await axios.post(`${API_URL}/other-expenses`, newExpense);
      toast.success("Expense added successfully");
      fetchOtherExpenses();
      setShowExpenseModal(false);
      setNewExpense({ amount: "", remarks: "", paidTo: "", paymentDate: "" });
    } catch (err) {
      console.error("Error adding expense:", err);
      toast.error("Failed to add expense");
    }
  };

  // ----------------------------
  // ✅ Client Excel Export (optimized + full export)
  // ----------------------------
  const handleDownloadExcel = async () => {
    try {
      const q = String(clientSearch || "").trim();
      const from = formatDateForAPI(startDate);
      const to = formatDateForAPI(endDate);
      const method = String(clientMethod || "").trim();

      let page = 1;
      const limit = 200; // export faster
      let allRows = [];
      let total = 0;

      while (true) {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (q) params.set("q", q);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (method) params.set("paymentMethod", method);

        const url = `${API_URL}/payment-tracker?${params.toString()}`;
        const res = await axios.get(url);

        if (!res.data?.success) break;

        const batch = Array.isArray(res.data.data) ? res.data.data : [];
        allRows = allRows.concat(batch);

        total = Number(res.data.total || 0);
        if (allRows.length >= total) break;

        // no more data
        if (batch.length === 0) break;

        page += 1;
      }

      const worksheetData = allRows.map((r, idx) => {
        const qn = r?.quotationDetails?.quotationId || r?.quotationCode || ""; // prefer QN0028
        const name = r?.leadFirstPerson?.name || r?.firstPersonName || "";
        const phone = r?.leadFirstPerson?.phoneNo || r?.firstPersonPhone || "";
        const instNo = r?.installmentNumber ? `INST-${r.installmentNumber}` : "";

        return {
          "Sl.No": idx + 1,
          "Quotation ID": qn,
          "Customer Name": name,
          Phone: phone,
          "Installment": instNo,
          "Payment Method": r?.paymentMethod || "",
          "Paid To": r?.paidTo || "",
          "Paid Amount": Number(r?.paidAmount || 0),
          "Payment Date": r?.paymentDate ? new Date(r.paymentDate).toLocaleString("en-GB") : "N/A",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payment Tracker");
      XLSX.writeFile(workbook, "PaymentTrackerReport.xlsx");

      toast.success("Excel downloaded successfully");
    } catch (err) {
      console.error("Excel download error:", err);
      toast.error("Failed to download Excel");
    }
  };

  // ----------------------------
  // Vendor download + expenses download unchanged (kept from your code)
  // ----------------------------
  const handleDownloadVendorExcel = async (status, search) => {
    try {
      const url = `${API_URL}/vendors/vendor-payments?status=${status}&search=${encodeURIComponent(
        search || ""
      )}&all=true`;

      const response = await axios.get(url);
      const vendorData = response.data.data || [];

      const vendorArray = Object.entries(vendorData).map(([vendorId, details]) => ({
        vendorId,
        ...details,
      }));

      const worksheetData = vendorArray.map((v) => ({
        "Vendor Name": v.vendorName,
        "Vendor Category": v.vendorCategory,
        "Total Salary": v.totalSalary,
        Events: (v.events || [])
          .map(
            (e) =>
              `${e.quoteId} - ${e.categoryName} - ${e.serviceName} - ${toDisplayDate(
                e.eventDate
              )} - ${e.slot} - ₹${e.salary}`
          )
          .join("; "),
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${status} Vendors`);
      XLSX.writeFile(workbook, `${status}VendorPayments.xlsx`);

      toast.success(`${status} vendor payments downloaded`);
    } catch (err) {
      toast.error("Failed to download vendor Excel");
    }
  };

  const handleDownloadExpensesExcel = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/other-expenses?search=${encodeURIComponent(expenseSearch || "")}&all=true`
      );

      const expenses = res.data.data || [];

      const worksheetData = expenses.map((exp) => ({
        Amount: exp.amount,
        Remarks: exp.remarks,
        "Paid To": exp.paidTo,
        "Payment Date": toDisplayDate(exp.paymentDate),
        "Created At": toDisplayDate(exp.createdAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Other Expenses");
      XLSX.writeFile(workbook, "OtherExpensesReport.xlsx");

      toast.success("Other Expenses Excel downloaded");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download Excel");
    }
  };

  // ----------------------------
  // Vendor modals unchanged
  // ----------------------------
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedVendorPayment, setSelectedVendorPayment] = useState(null);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payingVendor, setPayingVendor] = useState(null);
  const [payForm, setPayForm] = useState({ paymentDate: "", paymentMode: "" });

  const handlePayVendorSubmit = async () => {
    if (!payForm.paymentDate || !payForm.paymentMode) {
      toast.error("All fields are required");
      return;
    }

    try {
      await axios.put(`${API_URL}/vendors/pay-vendor/${payingVendor.vendorId}`, {
        paymentMode: payForm.paymentMode,
        paymentDate: payForm.paymentDate,
      });

      toast.success("Vendor paid successfully");
      setShowPayModal(false);
      setPayingVendor(null);
      fetchVendorPayments("Pending", vendorPendingPage, vendorPendingSearch);
    } catch (err) {
      console.error("Pay vendor error:", err);
      toast.error("Failed to pay vendor");
    }
  };

  return (
    <div className="container py-2 rounded vh-100" style={{ background: "#F4F4F4" }}>
      <Tabs activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)} className="mb-3">
        {/* ✅ UPDATED CLIENT TAB */}
        <Tab eventKey="client" title="Client Payments">
          {/* Search + Method + Date */}
          <div className="d-flex flex-wrap gap-2 align-items-end">
            <Form onSubmit={handleClientSearch} style={{ width: "350px" }}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by Quotation ID / Name / Phone"
                  value={clientSearchInput}
                  onChange={(e) => setClientSearchInput(e.target.value)}
                />
                <Button type="submit" variant="dark">
                  Search
                </Button>
                {(clientSearch || startDate || endDate || clientMethod) && (
                  <Button onClick={handleClientClear} variant="secondary">
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Form>

            {/* ✅ Payment Method Filter */}
            <div style={{ width: 220 }}>
              <small className="text-muted">Method</small>
              <Form.Select
                value={clientMethod}
                onChange={(e) => {
                  setClientMethod(e.target.value);
                  setClientPage(1);
                }}
              >
                <option value="">All Methods</option>
                <option value="Online">Online</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </Form.Select>
            </div>

            {/* Date Filters */}
            <div>
              <small className="text-muted">From</small>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setClientPage(1);
                }}
              />
            </div>

            <div>
              <small className="text-muted">To</small>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setClientPage(1);
                }}
              />
            </div>

            <div className="ms-auto">
              <Button
                variant="light-gray"
                className="btn rounded-5 bg-white border-2 shadow-sm"
                style={{ fontSize: "14px" }}
                onClick={handleDownloadExcel}
              >
                Download Excel
              </Button>
            </div>
          </div>

          {/* Table */}
          <Card className="border-0 p-3 my-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">
                Total Records: <b>{clientTotal}</b>
              </small>
            </div>

            <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              <Table className="table table-hover align-middle">
                <thead className="text-white sticky-top" style={{ backgroundColor: "#343a40" }}>
                  <tr style={{ fontSize: "14px" }}>
                    <th>Sl.No</th>
                    <th>Quotation No</th>
                    <th>Name</th>
                    <th>Phone No</th>
                    <th>Inst no</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Paid To</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody style={{ fontSize: "12px" }} className="fw-semibold">
                  {clientLoading ? (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : clientRows.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    clientRows.map((r, index) => {
                      const qn = r?.quotationNo|| "—";
                      const qMongoId = r?.quotationDetails?._id || r?.quotationId; // for navigation
                      const name = r?.leadFirstPerson?.name || r?.firstPersonName || "—";
                      const phone = r?.leadFirstPerson?.phoneNo || r?.firstPersonPhone || "—";
                      const instNo = r?.installmentNumber ? `INST-${r.installmentNumber}` : "—";

                      return (
                        <tr
                          key={r._id}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate(`/payment/payment-details/${qMongoId}`, {
                              state: { hideActionbtn: true },
                            })
                          }
                        >
                          <td>{(clientPage - 1) * CLIENT_LIMIT + (index + 1)}</td>
                          <td>{qn}</td>
                          <td>{name}</td>
                          <td>{phone}</td>
                          <td>{instNo}</td>
                          <td>{formatINR(r?.paidAmount)}</td>
                          <td>{r?.paymentMethod || "-"}</td>
                          <td>{r?.paidTo || "-"}</td>
                          <td>{toDisplayDate(r?.paymentDate)}</td>
                          <td>
                            <IoChevronForward size={20} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </Card>

          {/* Pagination */}
          <DynamicPagination
            currentPage={clientPage}
            totalPages={clientTotalPages}
            onPageChange={setClientPage}
          />
        </Tab>

        {/* Vendor Pending (unchanged) */}
        <Tab eventKey="vendor pending" title="Vendor Pending Payments">
          <Form onSubmit={handleVendorPendingSearch} style={{ width: "350px" }}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by Vendor name"
                value={vendorPendingSearchInput}
                onChange={(e) => setVendorPendingSearchInput(e.target.value)}
              />
              <Button type="submit" variant="dark">
                Search
              </Button>
              {vendorPendingSearch && <Button onClick={handleVendorPendingClear}>Clear</Button>}
            </InputGroup>
          </Form>

          <div className="d-flex justify-content-end mb-2 gap-2">
            <Button
              variant="light-gray"
              className="btn rounded-5 bg-white border-2 shadow-sm"
              style={{ fontSize: "14px" }}
              onClick={() => handleDownloadVendorExcel("Pending", vendorPendingSearch)}
            >
              Download Excel
            </Button>
          </div>

          <Card className="border-0 p-3 my-3">
            {vendorLoading && <p>Loading vendor payments...</p>}
            <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              <Table className="table table-hover align-middle">
                <thead className="text-white sticky-top" style={{ backgroundColor: "#343a40" }}>
                  <tr style={{ fontSize: "14px" }}>
                    <th>Sl.No</th>
                    <th>Vendor Name</th>
                    <th>Vendor Type</th>
                    <th>Total Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "12px" }} className="fw-semibold">
                  {vendors.length === 0 && !vendorLoading ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No vendor payments found
                      </td>
                    </tr>
                  ) : (
                    vendors.map((vendor, index) => (
                      <tr key={vendor.vendorId}>
                        <td>{index + 1}</td>
                        <td>{vendor.vendorName}</td>
                        <td>{vendor.vendorCategory}</td>
                        <td>₹{vendor.totalSalary?.toLocaleString("en-IN")}</td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-view-${vendor.vendorId}`}>View Details</Tooltip>}
                          >
                            <Button
                              variant="outline-dark"
                              size="sm"
                              onClick={() => {
                                setSelectedVendorPayment(vendor);
                                setShowAddPaymentModal(true);
                              }}
                            >
                              <FaEye />
                            </Button>
                          </OverlayTrigger>

                          <Button
                            variant="outline-success"
                            size="sm"
                            className="ms-2"
                            onClick={() => {
                              setPayingVendor(vendor);
                              setPayForm({ paymentDate: "", paymentMode: "" });
                              setShowPayModal(true);
                            }}
                          >
                            Pay
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>

          <DynamicPagination
            currentPage={vendorPendingPage}
            totalPages={vendorPendingTotalPages}
            onPageChange={setVendorPendingPage}
          />
        </Tab>

        {/* Vendor Completed (unchanged) */}
        <Tab eventKey="vendor completed" title="Vendor Completed Payments">
          <Form onSubmit={handleVendorCompletedSearch} style={{ width: "350px" }}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by Vendor name"
                value={vendorCompletedSearchInput}
                onChange={(e) => setVendorCompletedSearchInput(e.target.value)}
              />
              <Button type="submit" variant="dark">
                Search
              </Button>
              {vendorCompletedSearch && <Button onClick={handleVendorCompletedClear}>Clear</Button>}
            </InputGroup>
          </Form>

          <div className="d-flex justify-content-end mb-2 gap-2">
            <Button
              variant="light-gray"
              className="btn rounded-5 bg-white border-2 shadow-sm"
              style={{ fontSize: "14px" }}
              onClick={() => handleDownloadVendorExcel("Completed", vendorCompletedSearch)}
            >
              Download Excel
            </Button>
          </div>

          <Card className="border-0 p-3 my-3">
            {vendorLoading && <p>Loading vendor payments...</p>}
            <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              <Table className="table table-hover align-middle">
                <thead className="text-white sticky-top" style={{ backgroundColor: "#343a40" }}>
                  <tr style={{ fontSize: "14px" }}>
                    <th>Sl.No</th>
                    <th>Vendor Name</th>
                    <th>Vendor Type</th>
                    <th>Total Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "12px" }} className="fw-semibold">
                  {vendors.length === 0 && !vendorLoading ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No vendor payments found
                      </td>
                    </tr>
                  ) : (
                    vendors.map((vendor, index) => (
                      <tr key={vendor.vendorId}>
                        <td>{index + 1}</td>
                        <td>{vendor.vendorName}</td>
                        <td>{vendor.vendorCategory}</td>
                        <td>₹{vendor.totalSalary?.toLocaleString("en-IN")}</td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-view-${vendor.vendorId}`}>View Details</Tooltip>}
                          >
                            <Button
                              variant="outline-dark"
                              size="sm"
                              onClick={() => {
                                setSelectedVendorPayment(vendor);
                                setShowAddPaymentModal(true);
                              }}
                            >
                              <FaEye />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>

          <DynamicPagination
            currentPage={vendorCompletedPage}
            totalPages={vendorCompletedTotalPages}
            onPageChange={setVendorCompletedPage}
          />
        </Tab>

        {/* Other Expenses (unchanged) */}
        <Tab eventKey="other expenses" title="Other Expenses">
          <Card className="border-0 p-3 my-3">
            <Form onSubmit={handleExpenseSearch} style={{ width: "350px" }}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by Remarks or Paid To"
                  value={expenseSearchInput}
                  onChange={(e) => setExpenseSearchInput(e.target.value)}
                />
                <Button type="submit" variant="dark">
                  Search
                </Button>
                {expenseSearch && <Button onClick={handleExpenseClear}>Clear</Button>}
              </InputGroup>
            </Form>

            <div className="d-flex justify-content-end mb-2 gap-2">
              <Button
                variant="dark"
                className="btn rounded-5 shadow-sm"
                style={{ fontSize: "14px" }}
                onClick={() => setShowExpenseModal(true)}
              >
                + Add Expense
              </Button>
              <Button
                variant="light-gray"
                className="btn rounded-5 bg-white border-2 shadow-sm"
                style={{ fontSize: "14px" }}
                onClick={handleDownloadExpensesExcel}
              >
                Download Excel
              </Button>
            </div>

            <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              <Table className="table table-hover align-middle">
                <thead className="text-white sticky-top" style={{ backgroundColor: "#343a40" }}>
                  <tr style={{ fontSize: "14px" }}>
                    <th>Sl.No</th>
                    <th>Amount</th>
                    <th>Remarks</th>
                    <th>Paid To</th>
                    <th>Payment Date</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "12px" }} className="fw-semibold">
                  {otherExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    otherExpenses.map((exp, idx) => (
                      <tr key={exp._id || idx}>
                        <td>{(expensePage - 1) * 10 + (idx + 1)}</td>
                        <td>₹{Number(exp.amount).toLocaleString("en-IN")}</td>
                        <td>{exp.remarks}</td>
                        <td>{exp.paidTo}</td>
                        <td>{toDisplayDate(exp.paymentDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            <DynamicPagination
              currentPage={expensePage}
              totalPages={expenseTotalPages}
              onPageChange={setExpensePage}
            />
          </Card>
        </Tab>
      </Tabs>

      {/* Add Expense Modal (unchanged) */}
      <Modal show={showExpenseModal} onHide={() => setShowExpenseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Other Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddExpense}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Paid To</Form.Label>
                  <Select
                    options={roleOptions}
                    value={roleOptions.find((opt) => opt.value === newExpense.paidTo) || null}
                    onChange={(selected) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        paidTo: selected?.value || "",
                      }))
                    }
                    placeholder="Select Role"
                    isClearable
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    type="text"
                    value={newExpense.remarks}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        remarks: e.target.value,
                      }))
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newExpense.paymentDate}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        paymentDate: e.target.value,
                      }))
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-3 text-end">
              <Button variant="secondary" onClick={() => setShowExpenseModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="dark">
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Vendor Payment Details Modal (unchanged) */}
      <Modal
        show={showAddPaymentModal}
        onHide={() => {
          setShowAddPaymentModal(false);
          setSelectedVendorPayment(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>Vendor Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVendorPayment && (
            <div style={{ fontSize: "13px" }}>
              <div className="d-flex gap-5">
                <p>
                  <strong>Vendor:</strong> {selectedVendorPayment.vendorName}
                </p>
                <p>
                  <strong>Total Salary:</strong> ₹{selectedVendorPayment.totalSalary?.toLocaleString("en-IN")}
                </p>
              </div>
              <hr />
              <h6>Events</h6>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Quotation ID</th>
                    <th>Category</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Slot</th>
                    <th>Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVendorPayment.events.map((e, i) => (
                    <tr key={i}>
                      <td>{e.quoteId}</td>
                      <td>{e.categoryName}</td>
                      <td>{e.serviceName}</td>
                      <td>{toDisplayDate(e.eventDate)}</td>
                      <td>{e.slot}</td>
                      <td>₹{e.salary?.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddPaymentModal(false);
              setSelectedVendorPayment(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Pay Vendor Modal (unchanged) */}
      <Modal
        show={showPayModal}
        onHide={() => {
          setShowPayModal(false);
          setPayingVendor(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>Pay Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {payingVendor && (
            <Form>
              <div className="mb-3">
                <strong>Vendor:</strong> {payingVendor.vendorName}
              </div>
              <div className="mb-3">
                <strong>Total Salary:</strong> ₹{payingVendor.totalSalary?.toLocaleString("en-IN")}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Payment Date</Form.Label>
                <Form.Control
                  type="date"
                  value={payForm.paymentDate}
                  onChange={(e) =>
                    setPayForm((prev) => ({
                      ...prev,
                      paymentDate: e.target.value,
                    }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Mode</Form.Label>
                <Form.Select
                  value={payForm.paymentMode}
                  onChange={(e) =>
                    setPayForm((prev) => ({
                      ...prev,
                      paymentMode: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowPayModal(false);
              setPayingVendor(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="dark" onClick={handlePayVendorSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentPage;
