import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import dayjs from "dayjs";
import Select from "react-select";
import { IoEye } from "react-icons/io5";
import {
  FaTasks,
  FaWhatsapp,
  FaCheckCircle,
  FaUpload,
  FaClipboardList,
  FaStickyNote,
  FaIdBadge,
  FaUser,
  FaCamera,
  FaVideo,
} from "react-icons/fa";
import { API_URL } from "../../utils/api";

const normalizeDateOnly = (d) => {
  if (!d) return null;
  // if backend sends ISO or date string, dayjs handles both
  return dayjs(d).startOf("day");
};

const isLateSubmission = (task) => {
  const submitted = normalizeDateOnly(task?.submittedDate);
  const deadline = normalizeDateOnly(task?.completionDate);
  if (!submitted || !deadline) return false;
  return submitted.isAfter(deadline, "day");
};

const lateByText = (task) => {
  const submitted = normalizeDateOnly(task?.submittedDate);
  const deadline = normalizeDateOnly(task?.completionDate);
  if (!submitted || !deadline) return "";
  const days = submitted.diff(deadline, "day");
  if (days <= 0) return "0 days";
  return days === 1 ? "1 day late" : `${days} days late`;
};

const renderSubmissionIndicator = (task) => {
  const submitted = task?.submittedDate;
  const deadline = task?.completionDate;

  // show only when both dates exist AND task is completed
  if (!submitted || !deadline || task?.status !== "Completed") return null;

  const late = isLateSubmission(task);

  return (
    <div
      className={`my-3 d-flex align-items-center justify-content-between px-3 py-2 rounded border ${
        late
          ? "border-danger bg-danger-subtle"
          : "border-success bg-success-subtle"
      }`}
    >
      <div className="d-flex align-items-center gap-2 ">
        <span
          className={`d-inline-flex align-items-center justify-content-center rounded-circle ${
            late ? "bg-danger text-white" : "bg-success text-white"
          }`}
          style={{ width: 28, height: 28, fontSize: 14 }}
        >
          {late ? "!" : "✓"}
        </span>

        <div style={{ lineHeight: 1.2 }}>
          <div className="fw-bold" style={{ fontSize: 14 }}>
            {late ? "Late Submission" : "Submitted On Time"}
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {late ? lateByText(task) : "Within deadline"}
          </div>
        </div>
      </div>

      <span className={`badge ${late ? "text-bg-danger" : "text-bg-success"}`}>
        {late ? "LATE" : "ON TIME"}
      </span>
    </div>
  );
};

const PostProductionDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  // Add a new state for submit modal loading
  const [submitModalLoading, setSubmitModalLoading] = useState(false);
  const [specializationOptions, setSpecializationOptions] = useState([]);

  const [assignData, setAssignData] = useState({
    eventName: "",
    serviceName: "",
    vendorId: "",
    taskDescription: "",
    completionDate: "",
    photosCount: "",
    videosCount: "",
    taskType: "",
  });

  const [submitData, setSubmitData] = useState({
    submittedPhotos: "",
    submittedVideos: "",
    submittedNotes: "",
    submittedDate: "",
  });

  const navigate = useNavigate();

  // --- mark booking as completed ---
  const handleMarkCompleted = async () => {
    const quotationId = data?.quotationId;
    if (!quotationId) return alert("Quotation identifier not available.");

    if (
      !window.confirm(
        "Mark this booking as Completed? This will finalize deliverables.",
      )
    ) {
      return;
    }

    try {
      setMarking(true);

      // 1) mark booking as completed
      const res = await axios.put(
        `${API_URL}/quotations/${quotationId}/booking-status`,
        { status: "Completed" },
      );

      if (!res.data?.success) {
        alert(res.data?.message || "Failed to update booking status.");
        return;
      }

      // update UI status immediately
      setQuotation((q) => ({ ...(q || {}), bookingStatus: "Completed" }));

      // 2) finalize deliverables (ONLY NOW)
      const d = await finalizeDeliverables(quotationId);

      if (d) {
        alert("Booking marked completed & deliverables finalized!");
      } else {
        alert(
          "Booking marked completed, but deliverables could not be finalized.",
        );
      }
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ||
          e.message ||
          "Failed to update booking status.",
      );
    } finally {
      setMarking(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/service/all`);
      if (res.data.success) {
        const specialization = res.data.data.map((service) => ({
          value: service._id,
          label: service.name,
        }));

        // 🔹 Static roles
        const staticSpecialization = [
          { value: "candid-photo-editing", label: "Candid photo editing" },
          {
            value: "traditional-video-editing",
            label: "Traditional Video editing",
          },
          {
            value: "traditional-photo-editing",
            label: "Traditional Photo editing",
          },
          { value: "candid-video-editing", label: "Candid Video editing" },
          { value: "album-designing", label: "Album Designing" },
          { value: "photo-sorting", label: "Photo sorting" },
          { value: "video-sorting", label: "Video sorting/Conversion" },
          { value: "assistant", label: "Assistant" },
          { value: "driver", label: "Driver" },
          { value: "cc-admin", label: "CC Admin" },
          { value: "cr-manager", label: "CR Manager" },
          { value: "makeup-artist", label: "Make up Artist" },
          { value: "speakers-audio", label: "Speakers & Audio arrangements" },
          { value: "album-final-correction", label: "Album final correction" },
          {
            value: "photo-colour-correction",
            label: "Photo colour correction",
          },
          { value: "album-photo-selection", label: "Album photo selection" },
          { value: "video-3d-editing", label: "3D Video editing" },
          { value: "vr-360-editing", label: "360 degree VR Video editing" },
          { value: "photo-slideshow", label: "Photo slideshow" },
          { value: "photo-lamination", label: "Photo lamination & Frame" },
          { value: "photo-printing-lab", label: "Photo Printing Lab" },
          { value: "storage-devices", label: "Storage devices" },
          {
            value: "marketing-printing",
            label: "Marketing collaterals Printing",
          },
          { value: "uniforms", label: "Uniforms" },
          { value: "branding-collaterals", label: "Branding collaterals" },
          { value: "software-hardware", label: "Software & Hardware service" },
          { value: "supervisor", label: "Supervisor" },
          { value: "marketing-team", label: "Marketing Team" },
          { value: "branding-team", label: "Branding Team" },
        ];

        // Merge both lists
        setSpecializationOptions([...specialization, ...staticSpecialization]);
      }
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  // Fetch vendors based on specialization name
  const fetchVendorsBySpecialization = async (specializationName) => {
    if (!specializationName) {
      setVendors([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/vendors/specialization/${encodeURIComponent(
          specializationName,
        )}`,
      );

      if (res.data?.success && Array.isArray(res.data.data)) {
        setVendors(res.data.data);
      } else {
        setVendors([]);
        toast.error("No vendors found for this specialization");
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      toast.error("Failed to load vendors for the selected specialization");
      setVendors([]);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch assigned tasks for service units
  const fetchAssignedTasks = async (serviceUnitIds) => {
    try {
      const tasks = {};
      for (const unitId of serviceUnitIds) {
        try {
          const res = await axios.get(
            `${API_URL}/sorting-task/service-unit/${unitId}`,
          );
          if (res.data?.success && res.data.data) {
            tasks[unitId] = res.data.data; // ✅ directly store the task object
          }
        } catch (err) {
          console.log(`No task found for unit ${unitId}`);
        }
      }
      setAssignedTasks(tasks);
    } catch (err) {
      console.error("Error fetching assigned tasks:", err);
    }
  };
  const handleOpenAssignModal = async (unit) => {
    try {
      const hasPhotos = unit.noOfPhotos > 0;
      const hasVideos = unit.noOfVideos > 0;

      setAssignData({
        eventName: unit.packageName || "",
        serviceName: unit.serviceName || "",
        vendorId: "",
        taskDescription: "",
        completionDate: "",
        photosCount: hasPhotos ? unit.noOfPhotos.toString() : "",
        videosCount: hasVideos ? unit.noOfVideos.toString() : "",
      });

      setVendors([]);
      setSelectedUnit(unit);
      setShowAssignModal(true);
    } catch (err) {
      console.error("Error opening assign modal:", err);
      alert("Failed to open assign task modal.");
    }
  };

  // Handle input changes with validation
  const handlePhotoCountChange = (value) => {
    const maxPhotos = selectedUnit?.noOfPhotos || 0;
    const numericValue = parseInt(value) || 0;

    if (numericValue > maxPhotos) {
      alert(
        `Cannot assign more than ${maxPhotos} photos (available in collected data)`,
      );
      setAssignData((prev) => ({
        ...prev,
        photosCount: maxPhotos.toString(),
      }));
    } else {
      setAssignData((prev) => ({
        ...prev,
        photosCount: value,
      }));
    }
  };

  const handleVideoCountChange = (value) => {
    const maxVideos = selectedUnit?.noOfVideos || 0;
    const numericValue = parseInt(value) || 0;

    if (numericValue > maxVideos) {
      alert(
        `Cannot assign more than ${maxVideos} videos (available in collected data)`,
      );
      setAssignData((prev) => ({
        ...prev,
        videosCount: maxVideos.toString(),
      }));
    } else {
      setAssignData((prev) => ({
        ...prev,
        videosCount: value,
      }));
    }
  };

  const handleAssignTask = async () => {
    try {
      if (!assignData.vendorId) {
        alert("Please select a vendor");
        return;
      }

      const selectedVendor = vendors.find((v) => v._id === assignData.vendorId);

      const taskData = {
        quotationId: data.quotationId,
        collectedDataId: data._id,
        serviceUnitId: selectedUnit._id,
        vendorId: assignData.vendorId,
        vendorName: selectedVendor?.name || "Unknown Vendor",
        serviceName: assignData?.serviceName,
        packageId: selectedUnit?.packageId,
        packageName: selectedUnit?.packageName,
        taskDescription: assignData.taskDescription,
        noOfPhotos: parseInt(assignData.photosCount) || 0,
        noOfVideos: parseInt(assignData.videosCount) || 0,
        completionDate: assignData.completionDate,
      };

      // Validate that at least one count is provided
      if (taskData.noOfPhotos === 0 && taskData.noOfVideos === 0) {
        alert("Please specify the number of photos or videos to process");
        return;
      }

      console.log("Task data to be sent:", taskData);
      const res = await axios.post(`${API_URL}/sorting-task/assign`, taskData);

      if (res.data?.success) {
        // Update assigned tasks for this unit
        setAssignedTasks((prev) => ({
          ...prev,
          [selectedUnit._id]: res.data.task,
        }));

        // Refresh the data to get updated sorting status
        await refreshData();

        setShowAssignModal(false);
        // alert("Task assigned successfully!");
      } else {
        alert(res.data?.message || "Failed to assign task");
      }
    } catch (err) {
      console.error("Error assigning task:", err);
      alert("Failed to assign task. Please try again.");
    }
  };

  const handleSubmitTask = async () => {
    try {
      if (!selectedTask) {
        alert("No task selected");
        return;
      }

      const res = await axios.post(
        `${API_URL}/sorting-task/${selectedTask._id}/submit`,
        {
          submittedPhotos: parseInt(submitData.submittedPhotos) || 0,
          submittedVideos: parseInt(submitData.submittedVideos) || 0,
          submittedNotes: submitData.submittedNotes,
          submittedDate: submitData.submittedDate,
        },
      );

      if (res.data?.success) {
        // Update the task in state
        setAssignedTasks((prev) => ({
          ...prev,
          [selectedTask.serviceUnitId]: res.data.task,
        }));

        // Refresh the data to get updated sorting status
        await refreshData();

        setShowSubmitModal(false);
        setSelectedTask(null);
      } else {
        alert(res.data?.message || "Failed to submit task");
      }
    } catch (err) {
      console.error("Error submitting task:", err);
      alert("Failed to submit task. Please try again.");
    }
  };

  // Add this function to refresh data
  const refreshData = async () => {
    try {
      const detailsRes = await axios.get(
        `${API_URL}/collected-data/details/${id}`,
      );

      if (detailsRes.data?.success && detailsRes.data?.data) {
        const details = detailsRes.data.data;
        setData(details);

        // Fetch assigned tasks for all service units
        const serviceUnitIds =
          details.serviceUnits?.map((unit) => unit._id) || [];
        await fetchAssignedTasks(serviceUnitIds);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  // FIXED: Simplified handleOpenSubmitModal
  const handleOpenSubmitModal = (unit) => {
    console.log("Opening submit modal for unit:", unit._id);

    const task = assignedTasks[unit._id];
    console.log("Task found:", task);

    if (task) {
      setSelectedTask(task);
      setSubmitData({
        submittedPhotos: task.noOfPhotos?.toString() || "0",
        submittedVideos: task.noOfVideos?.toString() || "0",
        submittedNotes: task.submittedNotes || "",
      });
      setShowSubmitModal(true);
      console.log("Submit modal state set to true");
    } else {
      console.log("No task found in assignedTasks");
      alert("Task data not loaded. Please try refreshing the page.");
    }
  };

  const handleViewSubmittedTask = (unit) => {
    const task = assignedTasks[unit._id];
    if (task) {
      setSelectedTask(task);
      setShowViewModal(true);
    } else {
      alert("No task details available.");
    }
  };

  const vendorOptions = vendors.map((v) => ({
    value: v._id,
    label: `${v.name}`,
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const detailsRes = await axios.get(
          `${API_URL}/collected-data/details/${id}`,
        );

        if (detailsRes.data?.success && detailsRes.data?.data) {
          const details = detailsRes.data.data;
          setData(details);

          // Fetch assigned tasks for all service units
          const serviceUnitIds =
            details.serviceUnits?.map((unit) => unit._id) || [];
          await fetchAssignedTasks(serviceUnitIds);

          if (details.quotationId) {
            const quotationRes = await axios.get(
              `${API_URL}/quotations/${details.quotationId}`,
            );
            if (quotationRes.data?.quotation) {
              setQuotation(quotationRes.data.quotation);
            }
          }
        } else {
          setError(detailsRes.data?.message || "Failed to load data.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleOpenModal = (unit) => {
    setSelectedUnit(unit);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUnit(null);
    setShowModal(false);
  };

  // const handleRowClick = (unit) => {
  //   navigate(`/post-production/post-production-detail/assign-task`, {
  //     state: {
  //       collectedDataId: data._id,
  //       serviceUnitId: unit._id,
  //     },
  //   });
  // };
  const handleRowClick = (unit) => {
    // console.log("data", data)
    // if (unit.status == true) {
    navigate(
      `/post-production/post-production-detail/sorted-data/${data.quotationId}`,
    );
    // }
  };

  // Helper functions
  const fmt = (n) => (n == null ? "-" : `₹${Number(n).toLocaleString()}`);
  const asPlainObj = (maybeMap) => {
    if (!maybeMap) return {};
    if (maybeMap instanceof Map) return Object.fromEntries(maybeMap.entries());
    if (typeof maybeMap === "object") return maybeMap;
    return {};
  };
  const idToLabel = (sheetTypes = [], id) => {
    const hit = sheetTypes.find((s) => s.id === id);
    return hit?.label || id || "-";
  };
  const qtySummary = (qtyObj, sheetTypes) => {
    const entries = Object.entries(qtyObj || {});
    if (!entries.length) return "—";
    return entries
      .map(([k, v]) => `${idToLabel(sheetTypes, k)}: ${v}`)
      .join(", ");
  };

  // Get task for a service unit
  const getTaskForUnit = (unitId) => {
    return assignedTasks[unitId] || null;
  };

  // Render action buttons based on sortingStatus
  const renderActionButtons = (unit) => {
    const sortingStatus = unit.sortingStatus || "Pending";
    const task = getTaskForUnit(unit._id);

    if (sortingStatus === "Pending") {
      return (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Assign Task</Tooltip>}
        >
          <Button
            variant="outline-primary"
            size="sm"
            className="py-1 px-2" // tighter padding
            onClick={(e) => {
              e.stopPropagation();
              handleOpenAssignModal(unit);
            }}
          >
            <FaTasks size={14} /> {/* smaller icon */}
          </Button>
        </OverlayTrigger>
      );
    }

    if (sortingStatus === "Assigned") {
      return (
        <>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Submit Task</Tooltip>}
          >
            <Button
              variant="outline-warning"
              size="sm"
              className="py-1 px-2"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenSubmitModal(unit);
              }}
            >
              <FaUpload size={14} />
            </Button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>View Sorting Task Details</Tooltip>}
          >
            <Button
              variant="outline-info"
              size="sm"
              className="py-1 px-2"
              onClick={(e) => {
                e.stopPropagation();
                handleViewSubmittedTask(unit);
              }}
            >
              <FaClipboardList size={14} />
            </Button>
          </OverlayTrigger>
        </>
      );
    }

    if (sortingStatus === "Completed") {
      return (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>View Task Details</Tooltip>}
        >
          <Button
            variant="outline-info"
            size="sm"
            className="py-1 px-2"
            onClick={(e) => {
              e.stopPropagation();
              handleViewSubmittedTask(unit);
            }}
          >
            <FaClipboardList size={14} />
          </Button>
        </OverlayTrigger>
      );
    }

    return null;
  };

  // Helper to determine available media types for a unit
  const getAvailableMediaTypes = (unit) => {
    const hasPhotos = unit.noOfPhotos > 0;
    const hasVideos = unit.noOfVideos > 0;

    return {
      hasPhotos,
      hasVideos,
      hasBoth: hasPhotos && hasVideos,
    };
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-4">No data found</div>;
  }

  return (
    <div className="container py-4" style={{ fontSize: "13px" }}>
      {/* Collected Data Details */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Header className="fw-bold bg-dark text-white d-flex justify-content-between align-items-center">
          <span>Collected Data Details</span>

          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center gap-2">
              {/* ✅ View Deliverables button */}
              {data?.quotationId && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => navigate(`/deliverables/${data.quotationId}`)}
                  style={{ fontSize: 12, padding: "6px 10px" }}
                >
                  View Deliverables
                </Button>
              )}

              {/* ✅ Mark Completed Button */}
              {quotation?.bookingStatus !== "Completed" && (
                <Button
                  variant="success"
                  size="sm"
                  disabled={marking}
                  onClick={handleMarkCompleted}
                  style={{ fontSize: 12, padding: "6px 10px" }}
                >
                  {marking ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" />
                      Mark Booking Completed
                    </>
                  )}
                </Button>
              )}

              <Badge
                bg={
                  quotation?.bookingStatus === "Completed"
                    ? "success"
                    : quotation?.bookingStatus === "Booked"
                      ? "primary"
                      : "warning"
                }
                className="px-3 py-2"
              >
                Status: {quotation?.bookingStatus || "—"}
              </Badge>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="row gy-3">
            {/* Quote ID */}
            <div className="col-md-3">
              <div className="p-3 rounded shadow-sm bg-white h-100 border d-flex align-items-center">
                <FaIdBadge className="me-3 text-primary" size={24} />
                <div>
                  <small className="text-muted">Quote ID</small>
                  <h6 className="mb-0 fw-bold">{data.quotationUniqueId}</h6>
                </div>
              </div>
            </div>

            {/* Person Name */}
            <div className="col-md-3">
              <div className="p-3 rounded shadow-sm bg-white h-100 border d-flex align-items-center">
                <FaUser className="me-3 text-success" size={24} />
                <div>
                  <small className="text-muted">Person / Couples</small>
                  <h6 className="mb-0 fw-bold">{data.personName}</h6>
                </div>
              </div>
            </div>

            {/* Total Photos */}
            <div className="col-md-3">
              <div className="p-3 rounded shadow-sm bg-white h-100 border d-flex align-items-center">
                <FaCamera className="me-3 text-info" size={24} />
                <div>
                  <small className="text-muted">Total Photos</small>
                  <h6 className="mb-0 fw-bold">{data.totalPhotos}</h6>
                </div>
              </div>
            </div>

            {/* Total Videos */}
            <div className="col-md-3">
              <div className="p-3 rounded shadow-sm bg-white h-100 border d-flex align-items-center">
                <FaVideo className="me-3 text-warning" size={24} />
                <div>
                  <small className="text-muted">Total Videos</small>
                  <h6 className="mb-0 fw-bold">{data.totalVideos}</h6>
                </div>
              </div>
            </div>

            {/* Quote Note */}
            <div className="col-md-6">
              <div className="p-3 rounded shadow-sm bg-white h-100 border d-flex align-items-start">
                <FaStickyNote className="me-3 text-secondary mt-1" size={20} />
                <div>
                  <small className="text-muted">Quote Note</small>
                  <p className="mb-0">{quotation?.quoteNote || "—"}</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Group */}
            <div className="col-md-6">
              <div className="p-3 rounded shadow-sm bg-white h-100 border d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">WhatsApp Group</small>
                  <h6 className="mb-0 fw-bold">
                    {quotation?.whatsappGroupName || "—"}
                  </h6>
                </div>
                {quotation?.whatsappGroupName && (
                  <div className="bg-success text-white d-flex align-items-center px-3 py-2 rounded-pill shadow-sm">
                    <FaWhatsapp className="me-2" /> WhatsApp
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Quotation Details */}
      {quotation ? (
        <Card className="shadow-sm mb-4">
          <Card.Header className="fw-bold bg-light">Events Details</Card.Header>
          <Card.Body>
            {quotation.packages?.length ? (
              <Table bordered responsive hover style={{ fontSize: "13px" }}>
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th>Event Start</th>
                    <th>Event End</th>
                    <th>Slot</th>
                    <th>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.packages.map((pkg, idx) => (
                    <tr key={pkg._id || idx}>
                      <td>{String(idx + 1).padStart(2, "0")}</td>
                      <td className="w-25">{pkg.categoryName}</td>
                      <td>
                        {pkg.eventStartDate
                          ? dayjs(pkg.eventStartDate).format("DD-MM-YYYY")
                          : "-"}
                      </td>
                      <td>
                        {pkg.eventEndDate
                          ? dayjs(pkg.eventEndDate).format("DD-MM-YYYY")
                          : "-"}
                      </td>
                      <td>{pkg.slot}</td>
                      <td>{pkg.venueName}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-muted small">No packages found</div>
            )}
          </Card.Body>
        </Card>
      ) : null}

      {console.log("quotation albums", quotation?.albums)}

      {/* Albums (only if present in quotation) */}
      {quotation?.albums?.length ? (
        <Card className="shadow-sm mb-4">
          <Card.Header className="fw-bold bg-light">Albums</Card.Header>
          <Card.Body className="p-0">
            <Table
              bordered
              responsive
              hover
              className="mb-0"
              style={{ fontSize: "13px" }}
            >
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Template</th>
                  <th>Box</th>

                  <th>Album Unit Price</th>
                  <th>Box Charge</th>
                  <th>Extras</th>
                </tr>
              </thead>
              <tbody>
                {quotation.albums.map((alb, idx) => {
                  const sheetTypes = alb?.snapshot?.sheetTypes || [];
                  const sharedObj = asPlainObj(alb?.extras?.shared);
                  const perUnitArr = Array.isArray(alb?.extras?.perUnit)
                    ? alb.extras.perUnit
                    : [];
                  const hasPerUnit =
                    !!alb?.customizePerUnit && perUnitArr.length;

                  const extrasCell = hasPerUnit ? (
                    <div className="small">
                      <div className="fw-semibold mb-1">Per-unit extras</div>
                      <Table bordered size="sm" className="mb-0">
                        <thead>
                          <tr>
                            <th style={{ whiteSpace: "nowrap" }}>Unit #</th>
                            {sheetTypes.map((t) => (
                              <th key={t.id}>{t.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {perUnitArr.map((m, i) => {
                            const mObj = asPlainObj(m);
                            return (
                              <tr key={i}>
                                <td className="text-center">{i + 1}</td>
                                {sheetTypes.map((t) => (
                                  <td key={t.id} className="text-end">
                                    {mObj?.[t.id] ?? 0}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="small">
                      <div className="fw-semibold">Shared extras</div>
                      <div>{qtySummary(sharedObj, sheetTypes)}</div>
                    </div>
                  );

                  return (
                    <tr key={alb._id || idx}>
                      <td>{String(idx + 1).padStart(2, "0")}</td>
                      <td>
                        <div className="fw-semibold">
                          {alb?.snapshot?.templateLabel ||
                            alb?.templateId ||
                            "-"}
                        </div>
                        <div className="text-muted small">
                          {alb?.snapshot?.baseSheets
                            ? `${alb.snapshot.baseSheets} sheets • ${
                                alb.snapshot.basePhotos ?? "-"
                              } photos`
                            : ""}
                        </div>
                      </td>
                      <td>
                        {alb?.snapshot?.boxLabel || alb?.boxTypeId || "-"}
                      </td>
                      {/* <td className="text-center">{alb?.qty ?? 1}</td> */}
                      <td className="text-end">{fmt(alb?.unitPrice)}</td>
                      <td className="text-end">
                        {fmt(alb?.suggested?.boxSurcharge)}
                      </td>
                      <td style={{ width: "30%" }}>{extrasCell}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : null}
      {/* Service Unit Details Table */}
      <Card className="shadow-sm">
        <Card.Header className="fw-bold bg-light">
          Service Unit Details
        </Card.Header>
        <Card.Body className="p-0">
          <Table
            bordered
            responsive
            hover
            className="mb-0"
            style={{ fontSize: "13px", cursor: "pointer" }}
          >
            <thead className="table-light">
              <tr>
                <th>Sl.No</th>
                <th>Event</th>
                <th>Service</th>
                <th>Unit</th>
                <th>Sys No.</th>
                <th>Photos</th>
                <th>Videos</th>
                <th>Submission Date</th>
                <th>Notes</th>
                <th>Backup Drive</th>
                <th>Sorting Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(data.serviceUnits || []).map((u, idx) => {
                const task = getTaskForUnit(u._id);
                const mediaTypes = getAvailableMediaTypes(u);

                return (
                  <tr
                    key={u._id || idx}
                    onClick={() => handleRowClick(u)}
                    style={{ transition: "background-color 0.2s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "")
                    }
                  >
                    <td>{String(idx + 1).padStart(2, "0")}</td>
                    <td>{u.packageName}</td>
                    <td>{u.serviceName}</td>
                    <td className="text-center">
                      {typeof u.unitIndex === "number" ? u.unitIndex + 1 : "-"}
                    </td>
                    <td>{data.systemNumber}</td>
                    <td className="text-center">{u.noOfPhotos}</td>
                    <td className="text-center">{u.noOfVideos}</td>
                    <td>
                      {u.submissionDate
                        ? dayjs(u.submissionDate).format("DD-MM-YYYY")
                        : "-"}
                    </td>
                    <td>{u.notes}</td>
                    <td>{u.backupDrive ? u.backupDrive : "Pending"}</td>

                    {/* ✅ NEW: Sorting Status Column */}
                    <td className="text-center">
                      <Badge
                        bg={
                          u.sortingStatus === "Completed"
                            ? "success"
                            : u.sortingStatus === "Assigned"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {u.sortingStatus || "Pending"}
                      </Badge>
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        {/* Eye Button */}
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>View Details</Tooltip>}
                        >
                          <Button
                            variant="outline-dark"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(u);
                            }}
                          >
                            <IoEye size={16} />
                          </Button>
                        </OverlayTrigger>

                        {/* Dynamic Action Button */}
                        {renderActionButtons(u)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal for full collected data details */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Collected Data Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUnit ? (
            <div>
              <div className="row">
                <div className="col-md-6">
                  <strong>Package:</strong> {selectedUnit.packageName}
                </div>
                <div className="col-md-6">
                  <strong>Service:</strong> {selectedUnit.serviceName}
                </div>
              </div>
              <div className="mb-3"></div>
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Camera:</strong> {selectedUnit.cameraName}
                  </p>
                  <p>
                    <strong>System Number:</strong> {data.systemNumber}
                  </p>
                  <p>
                    <strong>Backup System:</strong> {data.backupSystemNumber}
                  </p>
                  <p>
                    <strong>Drive Size:</strong> {selectedUnit.totalDriveSize}
                  </p>
                  <p>
                    <strong>Filled Size:</strong> {selectedUnit.filledSize}
                  </p>
                  <p>
                    <strong>Copied Location:</strong>{" "}
                    {selectedUnit.copiedLocation}
                  </p>
                  <p>
                    <strong>Backup Copied Location:</strong>{" "}
                    {selectedUnit.backupCopiedLocation}
                  </p>
                  <p>
                    <strong>Backup Drive: </strong>{" "}
                    {selectedUnit.backupDrive || "N/A"}
                  </p>
                  {selectedUnit.backupDrive && (
                    <p>
                      <strong>Backup Drive Name: </strong>{" "}
                      {selectedUnit.driveName}
                    </p>
                  )}
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>No. of Photos:</strong>{" "}
                    {selectedUnit.noOfPhotos ?? "-"}
                  </p>
                  <p>
                    <strong>No. of Videos:</strong>{" "}
                    {selectedUnit.noOfVideos ?? "-"}
                  </p>
                  <p>
                    <strong>First Photo Time:</strong>{" "}
                    {selectedUnit.firstPhotoTime || "-"}
                  </p>
                  <p>
                    <strong>Last Photo Time:</strong>{" "}
                    {selectedUnit.lastPhotoTime || "-"}
                  </p>
                  <p>
                    <strong>First Video Time:</strong>{" "}
                    {selectedUnit.firstVideoTime || "-"}
                  </p>
                  <p>
                    <strong>Last Video Time:</strong>{" "}
                    {selectedUnit.lastVideoTime || "-"}
                  </p>
                  <p>
                    <strong>Submission Date:</strong>{" "}
                    {selectedUnit.submissionDate
                      ? dayjs(selectedUnit.submissionDate).format("DD-MM-YYYY")
                      : "-"}
                  </p>
                  <p>
                    <strong>Notes:</strong> {selectedUnit.notes || "-"}
                  </p>
                </div>
              </div>
              <div>
                <Badge bg="success">
                  Sorting Status: {selectedUnit.sortingStatus}
                </Badge>
              </div>
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Assign Task Modal */}
      {/* <Modal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Task</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Event Name</label>
              <input
                type="text"
                className="form-control"
                value={assignData.eventName}
                disabled
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Service Name</label>
              <input
                type="text"
                className="form-control"
                value={assignData.serviceName}
                disabled
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Select Task Type</label>
            <Select
              options={specializationOptions}
              value={
                specializationOptions.find(
                  (opt) => opt.value === assignData.taskType,
                ) || null
              }
              onChange={async (selected) => {
                if (selected) {
               
                  setAssignData((prev) => ({
                    ...prev,
                    taskType: selected.value,
                    vendorId: "",
                  }));
             
                  await fetchVendorsBySpecialization(selected.label);
                } else {
                  
                  setAssignData((prev) => ({
                    ...prev,
                    taskType: "",
                    vendorId: "",
                  }));
                  setVendors([]);
                }
              }}
              placeholder="Select Specialization"
              isClearable
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Select Vendor</label>
            <Select
              options={vendors.map((v) => ({
                value: v._id,
                label: v.name,
              }))}
              value={
                vendors
                  .map((v) => ({ value: v._id, label: v.name }))
                  .find((opt) => opt.value === assignData.vendorId) || null
              }
              onChange={(selected) =>
                setAssignData((prev) => ({
                  ...prev,
                  vendorId: selected?.value || "",
                }))
              }
              placeholder={
                assignData.taskType
                  ? vendors.length
                    ? "Select Vendor"
                    : "No vendors found"
                  : "Select specialization first"
              }
              isClearable
              isDisabled={!assignData.taskType}
            />
          </div>

          {selectedUnit?.noOfPhotos > 0 && (
            <div className="mb-3">
              <label className="form-label">
                No. of Photos to sort
                <small className="text-muted ms-2">
                  (Collected: {selectedUnit?.noOfPhotos} available)
                </small>
              </label>
              <input
                type="number"
                className="form-control"
                value={assignData.photosCount}
                onChange={(e) => handlePhotoCountChange(e.target.value)}
                min="0"
                max={selectedUnit?.noOfPhotos}
                placeholder={`Enter photos to sort (max ${selectedUnit?.noOfPhotos})`}
              />
            </div>
          )}

          {selectedUnit?.noOfVideos > 0 && (
            <div className="mb-3">
              <label className="form-label">
                No. of Videos to convert
                <small className="text-muted ms-2">
                  (Max: {selectedUnit?.noOfVideos} available)
                </small>
              </label>
              <input
                type="number"
                className="form-control"
                value={assignData.videosCount}
                onChange={(e) => handleVideoCountChange(e.target.value)}
                min="0"
                max={selectedUnit?.noOfVideos}
                placeholder={`Enter videos to convert (max ${selectedUnit?.noOfVideos})`}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Task Description</label>
            <textarea
              className="form-control"
              rows="2"
              value={assignData.taskDescription}
              onChange={(e) =>
                setAssignData((prev) => ({
                  ...prev,
                  taskDescription: e.target.value,
                }))
              }
              placeholder="Describe the task requirements..."
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Completion Date</label>
            <input
              type="date"
              className="form-control"
              value={assignData.completionDate}
              onChange={(e) =>
                setAssignData((prev) => ({
                  ...prev,
                  completionDate: e.target.value,
                }))
              }
            />
          </div>

          {selectedUnit && (
            <div className="alert alert-info p-2">
              <small>
                <strong>Available Media:</strong> {selectedUnit.noOfPhotos}{" "}
                photos, {selectedUnit.noOfVideos} videos
              </small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAssignTask}>
            Assign Task
          </Button>
        </Modal.Footer>
      </Modal> */}

      {/* Assign Task Modal */}
      <Modal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton style={{ padding: "10px 14px" }}>
          <Modal.Title style={{ fontSize: "14px", fontWeight: 600 }}>
            Assign Task
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "12px 14px", fontSize: "12px" }}>
          <div className="row">
            <div className="col-md-6 mb-3" style={{ marginBottom: "10px" }}>
              <label
                className="form-label"
                style={{ fontSize: "12px", marginBottom: 4 }}
              >
                Event Name
              </label>
              <input
                type="text"
                className="form-control"
                value={assignData.eventName}
                disabled
                style={{
                  fontSize: "12px",
                  height: "32px",
                  padding: "6px 10px",
                }}
              />
            </div>

            <div className="col-md-6 mb-3" style={{ marginBottom: "10px" }}>
              <label
                className="form-label"
                style={{ fontSize: "12px", marginBottom: 4 }}
              >
                Service Name
              </label>
              <input
                type="text"
                className="form-control"
                value={assignData.serviceName}
                disabled
                style={{
                  fontSize: "12px",
                  height: "32px",
                  padding: "6px 10px",
                }}
              />
            </div>
          </div>

          <div className="mb-3" style={{ marginBottom: "10px" }}>
            <label
              className="form-label"
              style={{ fontSize: "12px", marginBottom: 4 }}
            >
              Select Task Type
            </label>

            <Select
              classNamePrefix="rs"
              options={specializationOptions}
              value={
                specializationOptions.find(
                  (opt) => opt.value === assignData.taskType,
                ) || null
              }
              onChange={async (selected) => {
                if (selected) {
                  setAssignData((prev) => ({
                    ...prev,
                    taskType: selected.value,
                    vendorId: "",
                  }));
                  await fetchVendorsBySpecialization(selected.label);
                } else {
                  setAssignData((prev) => ({
                    ...prev,
                    taskType: "",
                    vendorId: "",
                  }));
                  setVendors([]);
                }
              }}
              placeholder="Select Specialization"
              isClearable
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: 32,
                  height: 32,
                  fontSize: 12,
                  borderColor: state.isFocused ? "#86b7fe" : base.borderColor,
                  boxShadow: state.isFocused
                    ? "0 0 0 0.12rem rgba(13,110,253,.18)"
                    : "none",
                }),
                valueContainer: (base) => ({ ...base, padding: "0 8px" }),
                input: (base) => ({
                  ...base,
                  margin: 0,
                  padding: 0,
                  fontSize: 12,
                }),
                placeholder: (base) => ({ ...base, fontSize: 12 }),
                singleValue: (base) => ({ ...base, fontSize: 12 }),
                indicatorSeparator: (base) => ({
                  ...base,
                  marginTop: 6,
                  marginBottom: 6,
                }),
                dropdownIndicator: (base) => ({ ...base, padding: 4 }),
                clearIndicator: (base) => ({ ...base, padding: 4 }),
                menu: (base) => ({ ...base, zIndex: 9999, fontSize: 12 }),
                option: (base, state) => ({
                  ...base,
                  fontSize: 12,
                  padding: "6px 10px",
                }),

                menuPortal: (base) => ({ ...base, zIndex: 999999 }), // ✅ IMPORTANT
                menu: (base) => ({ ...base, zIndex: 999999 }), // ✅ IMPORTANT
              }}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          <div className="mb-3" style={{ marginBottom: "10px" }}>
            <label
              className="form-label"
              style={{ fontSize: "12px", marginBottom: 4 }}
            >
              Select Vendor
            </label>

            <Select
              classNamePrefix="rs"
              options={vendors.map((v) => ({ value: v._id, label: v.name }))}
              value={
                vendors
                  .map((v) => ({ value: v._id, label: v.name }))
                  .find((opt) => opt.value === assignData.vendorId) || null
              }
              onChange={(selected) =>
                setAssignData((prev) => ({
                  ...prev,
                  vendorId: selected?.value || "",
                }))
              }
              placeholder={
                assignData.taskType
                  ? vendors.length
                    ? "Select Vendor"
                    : "No vendors found"
                  : "Select specialization first"
              }
              isClearable
              isDisabled={!assignData.taskType}
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: 32,
                  height: 32,
                  fontSize: 12,
                  borderColor: state.isFocused ? "#86b7fe" : base.borderColor,
                  boxShadow: state.isFocused
                    ? "0 0 0 0.12rem rgba(13,110,253,.18)"
                    : "none",
                }),
                valueContainer: (base) => ({ ...base, padding: "0 8px" }),
                input: (base) => ({
                  ...base,
                  margin: 0,
                  padding: 0,
                  fontSize: 12,
                }),
                placeholder: (base) => ({ ...base, fontSize: 12 }),
                singleValue: (base) => ({ ...base, fontSize: 12 }),
                indicatorSeparator: (base) => ({
                  ...base,
                  marginTop: 6,
                  marginBottom: 6,
                }),
                dropdownIndicator: (base) => ({ ...base, padding: 4 }),
                clearIndicator: (base) => ({ ...base, padding: 4 }),
                menu: (base) => ({ ...base, zIndex: 9999, fontSize: 12 }),
                option: (base) => ({
                  ...base,
                  fontSize: 12,
                  padding: "6px 10px",
                }),
                menuPortal: (base) => ({ ...base, zIndex: 999999 }), // ✅ IMPORTANT
                menu: (base) => ({ ...base, zIndex: 999999 }), // ✅ IMPORTANT
              }}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          {/* Dynamic Fields */}
          {selectedUnit?.noOfPhotos > 0 && (
            <div className="mb-3" style={{ marginBottom: "10px" }}>
              <label
                className="form-label"
                style={{ fontSize: "12px", marginBottom: 4 }}
              >
                No. of Photos to sort
                <small className="text-muted ms-2" style={{ fontSize: "11px" }}>
                  (Collected: {selectedUnit?.noOfPhotos} available)
                </small>
              </label>
              <input
                type="number"
                className="form-control"
                value={assignData.photosCount}
                onChange={(e) => handlePhotoCountChange(e.target.value)}
                min="0"
                max={selectedUnit?.noOfPhotos}
                placeholder={`Enter photos to sort (max ${selectedUnit?.noOfPhotos})`}
                style={{
                  fontSize: "12px",
                  height: "32px",
                  padding: "6px 10px",
                }}
              />
            </div>
          )}

          {selectedUnit?.noOfVideos > 0 && (
            <div className="mb-3" style={{ marginBottom: "10px" }}>
              <label
                className="form-label"
                style={{ fontSize: "12px", marginBottom: 4 }}
              >
                No. of Videos to convert
                <small className="text-muted ms-2" style={{ fontSize: "11px" }}>
                  (Max: {selectedUnit?.noOfVideos} available)
                </small>
              </label>
              <input
                type="number"
                className="form-control"
                value={assignData.videosCount}
                onChange={(e) => handleVideoCountChange(e.target.value)}
                min="0"
                max={selectedUnit?.noOfVideos}
                placeholder={`Enter videos to convert (max ${selectedUnit?.noOfVideos})`}
                style={{
                  fontSize: "12px",
                  height: "32px",
                  padding: "6px 10px",
                }}
              />
            </div>
          )}

          <div className="mb-3" style={{ marginBottom: "10px" }}>
            <label
              className="form-label"
              style={{ fontSize: "12px", marginBottom: 4 }}
            >
              Task Description
            </label>
            <textarea
              className="form-control"
              rows="2"
              value={assignData.taskDescription}
              onChange={(e) =>
                setAssignData((prev) => ({
                  ...prev,
                  taskDescription: e.target.value,
                }))
              }
              placeholder="Describe the task requirements..."
              style={{ fontSize: "12px", padding: "6px 10px" }}
            />
          </div>

          <div className="mb-3" style={{ marginBottom: "10px" }}>
            <label
              className="form-label"
              style={{ fontSize: "12px", marginBottom: 4 }}
            >
              Completion Date
            </label>
            <input
              type="date"
              className="form-control"
              value={assignData.completionDate}
              onChange={(e) =>
                setAssignData((prev) => ({
                  ...prev,
                  completionDate: e.target.value,
                }))
              }
              style={{ fontSize: "12px", height: "32px", padding: "6px 10px" }}
            />
          </div>

          {/* Available Media Summary */}
          {selectedUnit && (
            <div
              className="alert alert-info p-2"
              style={{ fontSize: "11px", padding: "6px 10px" }}
            >
              <small>
                <strong>Available Media:</strong> {selectedUnit.noOfPhotos}{" "}
                photos, {selectedUnit.noOfVideos} videos
              </small>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer style={{ padding: "10px 14px" }}>
          <Button
            variant="secondary"
            onClick={() => setShowAssignModal(false)}
            size="sm"
            style={{ fontSize: "12px", padding: "6px 10px" }}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleAssignTask}
            size="sm"
            style={{ fontSize: "12px", padding: "6px 10px" }}
          >
            Assign Task
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Submit Task Modal */}
      <Modal
        show={showSubmitModal}
        onHide={() => setShowSubmitModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Submit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitModalLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading task details...</span>
              </Spinner>
              <div className="mt-2">Loading task details...</div>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Submitted Photos Count</label>
                <input
                  type="number"
                  className="form-control"
                  value={submitData.submittedPhotos}
                  onChange={(e) =>
                    setSubmitData((prev) => ({
                      ...prev,
                      submittedPhotos: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Submitted Videos Count</label>
                <input
                  type="number"
                  className="form-control"
                  value={submitData.submittedVideos}
                  onChange={(e) =>
                    setSubmitData((prev) => ({
                      ...prev,
                      submittedVideos: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Submission Date</label>
                <input
                  type="date"
                  className="form-control"
                  rows="3"
                  value={submitData.submittedDate}
                  onChange={(e) =>
                    setSubmitData((prev) => ({
                      ...prev,
                      submittedDate: e.target.value,
                    }))
                  }
                  // placeholder="Any notes about the submitted work..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Submission Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={submitData.submittedNotes}
                  onChange={(e) =>
                    setSubmitData((prev) => ({
                      ...prev,
                      submittedNotes: e.target.value,
                    }))
                  }
                  placeholder="Any notes about the submitted work..."
                ></textarea>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmitTask}>
            Submit Task
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Task Details Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>
            Sorting Task Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ fontSize: "12px" }}>
            {selectedTask ? (
              <div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Vendor:</strong> {selectedTask.vendorName}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Assigned Date:</strong>{" "}
                    {dayjs(selectedTask.assignedDate).format("DD-MM-YYYY")}
                  </div>
                  <div className="col-md-6">
                    <strong>Completion Date:</strong>{" "}
                    {selectedTask.completionDate
                      ? dayjs(selectedTask.completionDate).format("DD-MM-YYYY")
                      : "-"}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Assigned Photos:</strong> {selectedTask.noOfPhotos}
                  </div>
                  <div className="col-md-6">
                    <strong>Assigned Videos:</strong> {selectedTask.noOfVideos}
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Task Description:</strong>
                  <p>
                    {selectedTask.taskDescription || "No description provided"}
                  </p>
                </div>

                {selectedTask.status === "Completed" ? (
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong>Submitted Photos:</strong>{" "}
                        {selectedTask.submittedPhotos}
                      </div>
                      <div className="col-md-6">
                        <strong>Submitted Videos:</strong>{" "}
                        {selectedTask.submittedVideos}
                      </div>
                    </div>

                    <div className="mb-3">
                      <strong>Submission Notes:</strong>
                      <p>
                        {selectedTask.submittedNotes || "No notes provided"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <strong>Submitted Date:</strong>{" "}
                      {selectedTask.submittedDate
                        ? dayjs(selectedTask.submittedDate).format(
                            "DD-MM-YYYY HH:mm",
                          )
                        : "-"}
                    </div>

                    {renderSubmissionIndicator(selectedTask)}
                  </>
                ) : (
                  <div className="alert alert-info">
                    <small>
                      This task is currently <strong>Assigned</strong> but not
                      yet submitted.
                    </small>
                  </div>
                )}

                <div className="mb-3">
                  <strong>Status:</strong>{" "}
                  <Badge
                    bg={
                      selectedTask.status === "Completed"
                        ? "success"
                        : "warning"
                    }
                  >
                    {selectedTask.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <p>No task details available.</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PostProductionDetail;
