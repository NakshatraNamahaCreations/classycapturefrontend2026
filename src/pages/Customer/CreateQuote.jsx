import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Form,
  Button,
  Card,
  Modal,
  Col,
  Badge,
  Row,
} from "react-bootstrap";

import {
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimesCircle,
  FaCopy,
  FaStickyNote,
} from "react-icons/fa";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Select from "react-select";
import LocalAddAlbumModal from "../Albums/LocalAddAlbumModal";
import LocalAlbumsTable from "../Albums/LocalAlbumsTable";
import LocalAlbumDetailsModal from "../Albums/LocalAlbumDetailsModal";
import { computeAlbumTotal } from "../../utils/albumUtils"; // you already use this elsewhere
import { API_URL } from "../../utils/api";

// Utility function to format date as DD-MM-YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const NotesModal = ({ show, note, onHide, onSave, title = "Add Notes" }) => {
  const [noteInp, setNoteInp] = useState("");

  // Sync note when modal opens or note prop changes
  useEffect(() => {
    if (show) {
      setNoteInp(note || "");
    }
  }, [note, show]);

  const handleSave = () => {
    onSave(noteInp.trim());
    onHide();
  };

  const handleClose = () => {
    // Restore original note instead of clearing
    setNoteInp(note || "");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Notes/Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={noteInp}
              onChange={(e) => setNoteInp(e.target.value)}
              placeholder="Enter your notes or comments here..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="dark" onClick={handleSave} disabled={!noteInp.trim()}>
          Save Note
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const CreateQuote = () => {
  const navigate = useNavigate();
  const { leadId, queryId } = useParams();
  const location = useLocation();
  const selectQuotationId = location.state?.selectQuotationId;
  const [leadDetails, setLeadDetails] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [servicesList, setServicesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [services, setServices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [presetCategory, setPresetCategory] = useState(null);
  const [presetServices, setPresetServices] = useState([]);
  const [presetEventStartDate, setPresetEventStartDate] = useState("");
  const [presetEventEndDate, setPresetEventEndDate] = useState("");
  const [presetSlot, setPresetSlot] = useState(null);
  const [presetVenueName, setPresetVenueName] = useState("");
  const [presetVenueAddress, setPresetVenueAddress] = useState("");
  const [packages, setPackages] = useState([]);
  const [presetData, setPresetData] = useState([]);

  // const [discountPer, setDiscountPer] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [gstValue, setGstValue] = useState(0);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);
  const [isGstApplied, setIsGstApplied] = useState(false);

  const [marginAfterDiscount, setMarginAfterDiscount] = useState(0);
  const [marginGstValue, setMarginGstValue] = useState(0);
  const [totalMarginFinal, setTotalMarginFinal] = useState(0);
  const [totalBeforeDiscount, setTotalBeforeDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Add state for editing
  const [editingPackageIndex, setEditingPackageIndex] = useState(null);

  // Add state for custom category and slot
  const [customCategory, setCustomCategory] = useState("");
  const [customSlot, setCustomSlot] = useState("");

  // Installments state
  const [installments, setInstallments] = useState([]);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [editingInstallmentIndex, setEditingInstallmentIndex] = useState(null);
  const [newInstallmentName, setNewInstallmentName] = useState("");
  const [newInstallmentPercentage, setNewInstallmentPercentage] = useState("");

  // Add state for save modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteDescription, setQuoteDescription] = useState("");

  // Albums (client-only during creation)
  const [albums, setAlbums] = useState([]);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumModalMode, setAlbumModalMode] = useState("add"); // "add" | "edit"
  const [albumEditIndex, setAlbumEditIndex] = useState(null);
  const [showAlbumDetails, setShowAlbumDetails] = useState(false);
  const [albumDetailsIndex, setAlbumDetailsIndex] = useState(null);

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [note, setNote] = useState("");

  // Additional Services
  const [showAdditionalServicesModal, setShowAdditionalServicesModal] =
    useState(false);
  const [additionalServicesList, setAdditionalServicesList] = useState([]);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState(
    [],
  );
  const totalInstallPercentage =
    installments.length > 0
      ? installments.reduce((sum, inst) => sum + inst.percentage, 0)
      : 0;

  // Derived flag: a "free" quote (100% discount or computed total is 0)
  const isZeroTotal = React.useMemo(
    () =>
      Math.round(Number(grandTotal || 0)) === 0 ||
      Number(discountValue) >= totalBeforeDiscount,
    [grandTotal, discountValue, totalBeforeDiscount],
  );

  const additionalServicesSubtotal = useMemo(() => {
    try {
      return (selectedAdditionalServices || []).reduce(
        (sum, s) => sum + (Number(s.price) || 0),
        0,
      );
    } catch (e) {
      console.error(e);
      return 0;
    }
  }, [selectedAdditionalServices]);

  const albumSubtotal = useMemo(
    () => albums.reduce((s, a) => s + (computeAlbumTotal(a) || 0), 0),
    [albums],
  );

  // open/close + callbacks
  const openAddAlbumModal = () => {
    setAlbumModalMode("add");
    setAlbumEditIndex(null);
    setShowAlbumModal(true);
  };
  const openEditAlbumModal = (idx) => {
    setAlbumModalMode("edit");
    setAlbumEditIndex(idx);
    setShowAlbumModal(true);
  };
  const closeAlbumModal = () => setShowAlbumModal(false);

  const openAlbumDetails = (idx) => {
    setAlbumDetailsIndex(idx);
    setShowAlbumDetails(true);
  };
  const closeAlbumDetails = () => {
    setShowAlbumDetails(false);
    setAlbumDetailsIndex(null);
  };

  const fetchAdditionalServices = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/additional-services?page=1&limit=10000&search=`,
      );
      setAdditionalServicesList(res.data.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch additional services");
    }
  };

  const openAdditionalServicesModal = async () => {
    try {
      setShowAdditionalServicesModal(true);
      if (additionalServicesList.length === 0) {
        await fetchAdditionalServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const closeAdditionalServicesModal = () => {
    try {
      setShowAdditionalServicesModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const removeAdditionalService = (id) => {
    try {
      setSelectedAdditionalServices((prev) =>
        prev.filter((s) => (s._id || s.id) !== id),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const additionalServiceOptions = useMemo(() => {
    try {
      return (additionalServicesList || []).map((s) => ({
        value: s._id,
        label: `${s.name} (₹${Number(s.price || 0).toLocaleString()})`,
        meta: s,
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [additionalServicesList]);

  const handleAlbumAdd = (albumObj) => setAlbums((p) => [...p, albumObj]);
  const handleAlbumUpdate = (albumObj, idx) =>
    setAlbums((p) => p.map((a, i) => (i === idx ? albumObj : a)));
  const handleAlbumRemove = (index) => {
    const ok = window.confirm("Are you sure you want to remove this album?");
    if (!ok) return;
    setAlbums((p) => p.filter((_, i) => i !== index));
  };
  // Calculate total package amount
  const totalPackageAmount = packages.reduce(
    (sum, pkg) =>
      sum +
      pkg.services.reduce(
        (s, srv) => s + (parseFloat(srv.price) || 0) * (parseInt(srv.qty) || 1),
        0,
      ),
    0,
  );

  // Auto-generate installments only when there is a non-zero total
  useEffect(() => {
    if (packages.length > 0 && installments.length === 0 && !isZeroTotal) {
      const defaultPercents = [50, 30, 20];
      const defaultInsts = defaultPercents.map((perc, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: `Installment ${idx + 1}`,
        percentage: perc,
        amount: Math.round((perc / 100) * grandTotal),
      }));
      setInstallments(defaultInsts);
    }
  }, [packages, grandTotal, isZeroTotal]);

  // Recalculate amounts when grand total changes
  useEffect(() => {
    setInstallments((insts) =>
      insts.map((inst) => ({
        ...inst,
        amount: Math.round((inst.percentage / 100) * grandTotal),
      })),
    );
  }, [grandTotal]);

  // If quote becomes free, drop any existing installments
  useEffect(() => {
    if (isZeroTotal && installments.length > 0) {
      setInstallments([]);
    }
  }, [isZeroTotal]);

  const handleEditInstallment = (index) => {
    setEditingInstallmentIndex(index);
    setNewInstallmentName(installments[index].name);
    setNewInstallmentPercentage(installments[index].percentage.toString());
    setShowInstallmentModal(true);
  };

  const handleDeleteInstallment = (index) => {
    setInstallments((insts) => insts.filter((_, idx) => idx !== index));
  };

  // === Recalculate totals ===
  useEffect(() => {
    const packageTotal = packages.reduce(
      (sum, pkg) =>
        sum +
        pkg.services.reduce(
          (s, srv) =>
            s + (parseFloat(srv.price) || 0) * (parseInt(srv.qty) || 1),
          0,
        ),
      0,
    );

    const packageMargin = packages.reduce(
      (sum, pkg) =>
        sum +
        pkg.services.reduce(
          (s, srv) =>
            s + (parseFloat(srv.marginPrice) || 0) * (parseInt(srv.qty) || 1),
          0,
        ),
      0,
    );

    const beforeDiscount =
      packageTotal + (albumSubtotal || 0) + (additionalServicesSubtotal || 0);

    const discount = Number(discountValue) || 0;
    const afterDiscount = beforeDiscount - discount;
    const gst = isGstApplied ? afterDiscount * 0.18 : 0;
    const grand = afterDiscount + gst;

    const marginAfterDisc = packageMargin; // albums don't affect margin
    const marginGst = isGstApplied ? marginAfterDisc * 0.18 : 0;
    const totalMargin = marginAfterDisc + marginGst;

    setTotalBeforeDiscount(Math.round(beforeDiscount));
    setDiscountValue(Math.round(discount));
    setTotalAfterDiscount(Math.round(afterDiscount));
    setGstValue(Math.round(gst));
    setGrandTotal(Math.round(grand));
    setMarginAfterDiscount(Math.round(marginAfterDisc));
    setMarginGstValue(Math.round(marginGst));
    setTotalMarginFinal(Math.round(totalMargin));
  }, [
    packages,
    albumSubtotal,
    additionalServicesSubtotal,
    discountValue,
    isGstApplied,
  ]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/lead/lead-query-details/${leadId}/${queryId}`,
        );
        setLeadDetails(res.data.lead || null);
      } catch (err) {
        toast.error("Failed to fetch lead/query details");
        setLeadDetails(null);
        console.error(err);
      }
    };
    const fetchCategories = async () => {
      try {
        const resCategories = await axios.get(`${API_URL}/category/all`);
        setCategoriesList(resCategories.data.data || []);
      } catch {
        toast.error("Failed to fetch categories");
      }
    };

    const fetchServices = async () => {
      try {
        const resServices = await axios.get(`${API_URL}/service/all`);
        const data = (resServices.data.data || []).map((service, idx) => ({
          ...service,
          id: service._id,
          checked: false,
          qty: 1,
        }));
        setServicesList(data);
        setServices(data);
      } catch {
        toast.error("Failed to fetch services");
      }
    };
    fetchDetails();
    fetchCategories();
    fetchServices();
  }, [leadId, queryId]);

  useEffect(() => {
    const fetchPresetQuotations = async () => {
      try {
        const res = await axios.get(`${API_URL}/preset-quotation`);
        setPresetData(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch preset quotations", err);
        toast.error("Error loading preset packages");
      }
    };

    fetchPresetQuotations();
  }, []);

  const [savedQuotations, setSavedQuotations] = useState([]);
  const [currentQuotationId, setCurrentQuotationId] = useState(null);
  const [noQuotationsFound, setNoQuotationsFound] = useState(false);

  async function fetchQuotations() {
    if (!queryId) return;
    try {
      setNoQuotationsFound(false);
      const res = await axios.get(`${API_URL}/quotations/by-query/${queryId}`);
      if (
        res.data.success === false &&
        res.data.message &&
        res.data.message.toLowerCase().includes("no quotations found")
      ) {
        setSavedQuotations([]);
        setNoQuotationsFound(true);
        setCurrentQuotationId(null);
        return;
      }

      setSavedQuotations(res.data.quotations);
      if (
        selectQuotationId &&
        res.data.quotations.some((q) => q._id === selectQuotationId)
      ) {
        setCurrentQuotationId(selectQuotationId);
        // Auto-load the quotation data into the form for editing
        const selectedQuotation = res.data.quotations.find(
          (q) => q._id === selectQuotationId,
        );
        if (selectedQuotation) {
          setPackages(
            (selectedQuotation.packages || []).map((pkg) => ({
              ...pkg,
              category: pkg.categoryName || pkg.category,
              type: pkg.packageType
                ? pkg.packageType.toLowerCase()
                : pkg.type || "custom",
              id: pkg._id || pkg.id || uuidv4(),
            })),
          );
          // Ensure each installment has an 'amount' field set to paymentAmount
          setInstallments(
            (selectedQuotation.installments || []).map((inst, idx) => ({
              ...inst,
              name:
                inst.name || `Installment ${inst.installmentNumber || idx + 1}`,
              percentage:
                inst.paymentPercentage !== undefined
                  ? inst.paymentPercentage
                  : 0,
              amount: inst.paymentAmount !== undefined ? inst.paymentAmount : 0,
            })),
          );
          setQuoteTitle(selectedQuotation.quoteTitle || "");
          setQuoteDescription(selectedQuotation.quoteDescription || "");
          // setDiscountPer(selectedQuotation.discountPercent ?? 0);
          setIsGstApplied(!!selectedQuotation.gstApplied);
          setGstValue(selectedQuotation.gstValue ?? 0);
          setDiscountValue(selectedQuotation.discountValue ?? 0);
          setTotalAfterDiscount(selectedQuotation.totalAfterDiscount ?? 0);
          setMarginAfterDiscount(selectedQuotation.marginAfterDiscount ?? 0);
          setMarginGstValue(selectedQuotation.marginGstValue ?? 0);
          setTotalMarginFinal(selectedQuotation.totalMarginFinal ?? 0);
          setNote(selectedQuotation.quoteNote || "");
          // setQuoteTitle(selectedQuotation.quoteTitle || "");
          // setQuoteDescription(selectedQuotation.quoteDescription || "");
          setAlbums(selectedQuotation.albums || []); // <<< hydrate albums
          setSelectedAdditionalServices(
            selectedQuotation.additionalServices || [],
          );
        }
      } else {
        setCurrentQuotationId(null); // Do not select any quotation by default
      }
    } catch (err) {
      setSavedQuotations([]);
      setNoQuotationsFound(true);
      setCurrentQuotationId(null);
    }
  }

  // Fetch quotations for this queryId
  useEffect(() => {
    fetchQuotations();
  }, [queryId]);

  // Placeholder handlers for actions
  const handleLoadQuotation = (quotationId) => {
    if (currentQuotationId === quotationId) {
      setCurrentQuotationId(null);
      setPackages([]);
      setInstallments([]);
      setQuoteTitle("");
      setQuoteDescription("");
      (setNote(""),
        // setDiscountPer(0);
        setIsGstApplied(false));
      setGstValue(0);
      setDiscountValue(0);
      setTotalAfterDiscount(0);
      setMarginAfterDiscount(0);
      setMarginGstValue(0);
      setTotalMarginFinal(0);
      setAlbums([]);
      toast.info("No quotation selected. You can now create a new quotation.");
      return;
    }
    const quotation = savedQuotations.find((q) => q._id === quotationId);
    if (quotation) {
      setPackages(
        (quotation.packages || []).map((pkg) => ({
          ...pkg,
          category: pkg.categoryName || pkg.category,
          type: pkg.packageType
            ? pkg.packageType.toLowerCase()
            : pkg.type || "custom",
          id: pkg._id || pkg.id || uuidv4(),
        })),
      );
      // Ensure each installment has an 'amount' field set to paymentAmount
      setInstallments(
        (quotation.installments || []).map((inst, idx) => ({
          ...inst,
          name: inst.name || `Installment ${inst.installmentNumber || idx + 1}`,
          percentage:
            inst.paymentPercentage !== undefined ? inst.paymentPercentage : 0,
          amount: inst.paymentAmount !== undefined ? inst.paymentAmount : 0,
        })),
      );
      setCurrentQuotationId(quotation._id);
      setQuoteTitle(quotation.quoteTitle || "");
      setQuoteDescription(quotation.quoteDescription || "");
      // setDiscountPer(quotation.discountPercent ?? 0);
      setIsGstApplied(!!quotation.gstApplied);
      setNote(quotation.quoteNote || "");
      setAlbums(quotation.albums || []);
      setSelectedAdditionalServices(quotation.additionalServices || []);

      toast.success(`"${quotation.quoteTitle}" selected`);
    }
  };

  const handleFinalizeQuotation = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/quotations/${id}/finalize`, {
        finalized: true,
      });
      toast.success("Quotation finalized!");
      await fetchQuotations();
      handleLoadQuotation(id); // Select the finalized quotation
    } catch (err) {
      console.error(err);
    }
  };
  const handleUnfinalizeQuotation = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/quotations/${id}/finalize`, {
        finalized: false,
      });
      toast.success("Quotation unfinalized!");
      await fetchQuotations();
      // If the current selected quotation was unfinalized, clear selection
      if (currentQuotationId === id) {
        setCurrentQuotationId(null);
        setPackages([]);
        setInstallments([]);
        setQuoteTitle("");
        setQuoteDescription("");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteQuotation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation?"))
      return;
    try {
      const res = await axios.delete(`${API_URL}/quotations/${id}`);
      if (res.data.success) {
        toast.success("Quotation deleted successfully");
        await fetchQuotations();
      } else {
        toast.error(res.data.message || "Failed to delete quotation");
      }
    } catch (err) {
      toast.error("Failed to delete quotation");
    }
  };

  // Custom Modal Handlers
  const openCustomModal = () => {
    setShowCustomModal(true);
    setSelectAll(false);
    setServices(servicesList.map((s) => ({ ...s, checked: false, qty: 1 })));
    setSelectedCategory(null);
    setSelectedSlot(null);
    setEventStartDate("");
    setEventEndDate("");
    setVenueName("");
    setVenueAddress("");
    setCustomCategory("");
    setCustomSlot("");
  };
  const closeCustomModal = () => setShowCustomModal(false);
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setServices(services.map((s) => ({ ...s, checked: !selectAll })));
  };
  const handleServiceCheck = (id) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s)),
    );
  };

  const handleServiceQty = (id, value) => {
    setServices(services.map((s) => (s.id === id ? { ...s, qty: value } : s)));
  };

  // Preset Modal Handlers
  const openPresetModal = () => {
    setShowPresetModal(true);
    setPresetCategory(null);
    setPresetServices([]);
    setPresetEventStartDate("");
    setPresetEventEndDate("");
    setPresetSlot(null);
    setPresetVenueName("");
    setPresetVenueAddress("");
    const fetchPresetQuotations = async () => {
      try {
        const res = await axios.get(`${API_URL}/preset-quotation`);
        setPresetData(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch preset quotations", err);
        toast.error("Error loading preset packages");
      }
    };
    fetchPresetQuotations();
  };
  const closePresetModal = () => setShowPresetModal(false);
  const presetCategoryOptions = presetData.map((p) => {
    const serviceNames = p.services.map((s) => s.serviceName).join(", ");
    return {
      value: p._id,
      label: `${p.category} - ${serviceNames}`,
    };
  });

  const handlePresetCategoryChange = (option) => {
    setPresetCategory(option);
    const found = presetData.find((p) => p._id === option.value);
    if (found) {
      const editableServices = found.services.map((s) => ({
        ...s,
        checked: true, // all services checked by default for preset
      }));
      setPresetServices(editableServices);
    } else {
      setPresetServices([]);
    }
  };

  const handlePresetServicePrice = (id, value) => {
    setPresetServices(
      presetServices.map((s) => (s.id === id ? { ...s, price: value } : s)),
    );
  };

  const handlePresetServiceQty = (id, value) => {
    setPresetServices(
      presetServices.map((s) => (s.id === id ? { ...s, qty: value } : s)),
    );
  };

  // Prepare react-select options
  const categoryOptions = [
    ...categoriesList.map((cat) => ({ value: cat._id, label: cat.name })),
    { value: "others", label: "Others" },
  ];
  const slotOptions = [
    { value: "Morning (8AM - 1PM)", label: "Morning (8AM - 1PM)" },
    { value: "Afternoon (12PM - 5PM)", label: "Afternoon (12PM - 5PM)" },
    { value: "Evening (5PM - 9PM)", label: "Evening (5PM - 9PM)" },
    { value: "Midnight (9PM - 12AM)", label: "Midnight (9PM - 12AM)" },
    { value: "Full Day", label: "Full Day" },
    { value: "others", label: "Others" },
  ];

  // Edit handler
  const handleEditPackage = (pkg, index) => {
    setEditingPackageIndex(index);
    if (pkg.type === "custom") {
      setShowCustomModal(true);
      setSelectedCategory({ label: pkg.category, value: pkg.categoryId });
      setSelectedSlot(pkg.slot ? { value: pkg.slot, label: pkg.slot } : null);
      setEventStartDate(pkg.eventStartDate || "");
      setEventEndDate(pkg.eventEndDate || "");
      setVenueName(pkg.venueName || "");
      setVenueAddress(pkg.venueAddress || "");

      // Robustly match services by id, _id, or serviceId
      setServices(
        servicesList.map((s) => {
          const found = (pkg.services || []).find(
            (ps) =>
              (ps.id && (ps.id === s.id || ps.id === s._id)) ||
              (ps._id && (ps._id === s.id || ps._id === s._id)) ||
              (ps.serviceId &&
                (ps.serviceId === s.id || ps.serviceId === s._id)) ||
              (ps.serviceName && ps.serviceName === s.name),
          );
          return found
            ? {
                ...s,
                checked: true,
                qty: found.qty,
                price: found.price,
                marginPrice: found.marginPrice,
              }
            : { ...s, checked: false, qty: 1 };
        }),
      );
      setCustomCategory(pkg.categoryId === "custom" ? "" : pkg.category);
      setCustomSlot(pkg.slot === "custom" ? "" : pkg.slot);
    } else if (pkg.type === "preset") {
      setShowPresetModal(true);
      setPresetCategory({ label: pkg.category, value: pkg.categoryId });
      setPresetSlot(pkg.slot ? { value: pkg.slot, label: pkg.slot } : null);
      setPresetEventStartDate(pkg.eventStartDate || "");
      setPresetEventEndDate(pkg.eventEndDate || "");
      setPresetVenueName(pkg.venueName || "");
      setPresetVenueAddress(pkg.venueAddress || "");
      // Set preset services, preserving price, qty, marginPrice, etc.
      setPresetServices(
        servicesList
          .filter((s) =>
            pkg.services.some(
              (ps) =>
                (ps.serviceId && ps.serviceId === s.id) ||
                (ps.id && ps.id === s.id) ||
                (ps.serviceName && ps.serviceName === s.name),
            ),
          )
          .map((s) => {
            const found = pkg.services.find(
              (ps) =>
                (ps.serviceId && ps.serviceId === s.id) ||
                (ps.id && ps.id === s.id) ||
                (ps.serviceName && ps.serviceName === s.name),
            );
            return found
              ? {
                  ...s,
                  checked: true,
                  qty: found.qty,
                  price: found.price,
                  marginPrice: found.marginPrice,
                }
              : { ...s, checked: false, qty: 1 };
          }),
      );
    }
  };

  // In custom modal, on save/update
  const handleCreateOrUpdateCustomPackage = () => {
    if (
      !selectedCategory ||
      !selectedSlot ||
      !eventStartDate ||
      !eventEndDate
    ) {
      alert("Please fill all required fields");
      return;
    }
    const selectedServices = services.filter((s) => s.checked);
    if (!selectedCategory || selectedServices.length === 0) {
      toast.error("Please select a category and at least one service.");
      return;
    }
    const categoryLabel =
      selectedCategory.value === "others"
        ? customCategory
        : selectedCategory.label;
    const categoryId =
      selectedCategory.value === "others" ? "custom" : selectedCategory.value;
    const slotValue =
      selectedSlot?.value === "others" ? customSlot : selectedSlot?.value || "";
    const newPackage = {
      type: "custom",
      category: categoryLabel,
      categoryId: categoryId,
      slot: slotValue,
      eventStartDate,
      eventEndDate,
      venueName,
      venueAddress,
      services: selectedServices,
    };
    if (editingPackageIndex !== null) {
      // Update existing
      setPackages(
        packages.map((pkg, i) =>
          i === editingPackageIndex ? newPackage : pkg,
        ),
      );
    } else {
      // Add new
      setPackages([...packages, newPackage]);
    }
    setEditingPackageIndex(null);
    closeCustomModal();
  };

  // In preset modal, on save/update
  const handleCreateOrUpdatePresetPackage = () => {
    if (!presetCategory || presetServices.length === 0) {
      toast.error("Please select a category and at least one service.");
      return;
    }
    const newPackage = {
      type: "preset",
      category: presetCategory.label,
      categoryId: presetCategory.value,
      slot: presetSlot?.value || "",
      eventStartDate: presetEventStartDate,
      eventEndDate: presetEventEndDate,
      venueName: presetVenueName,
      venueAddress: presetVenueAddress,
      services: presetServices,
    };
    if (editingPackageIndex !== null) {
      setPackages(
        packages.map((pkg, i) =>
          i === editingPackageIndex ? newPackage : pkg,
        ),
      );
    } else {
      setPackages([...packages, newPackage]);
    }
    setEditingPackageIndex(null);
    closePresetModal();
  };

  const venueNameSuggestions = useMemo(() => {
    // Unique, non-empty venue names from all packages
    const names = packages
      .map((pkg) => pkg.venueName?.trim())
      .filter((v) => v && v.length > 0);
    return [...new Set(names)];
  }, [packages]);

  const venueAddressSuggestions = useMemo(() => {
    // Unique, non-empty venue addresses from all packages
    const addresses = packages
      .map((pkg) => pkg.venueAddress?.trim())
      .filter((v) => v && v.length > 0);
    return [...new Set(addresses)];
  }, [packages]);

  const baseAvail =
    editingInstallmentIndex !== null
      ? 100 -
        installments.reduce(
          (sum, inst, idx) =>
            idx !== editingInstallmentIndex ? sum + inst.percentage : sum,
          0,
        )
      : 100 - installments.reduce((sum, inst) => sum + inst.percentage, 0);

  const availablePercentage = isZeroTotal ? 0 : baseAvail;

  // Add or update installment
  const handleAddInstallment = () => {
    const percentage = parseFloat(newInstallmentPercentage);
    if (!newInstallmentName || isNaN(percentage) || percentage <= 0) {
      toast.error("Please enter a valid name and percentage.");
      return;
    }
    if (percentage > availablePercentage) {
      toast.error(
        `You can only allocate up to ${availablePercentage}% for this installment.`,
      );
      return;
    }
    if (editingInstallmentIndex !== null) {
      // Update
      setInstallments((insts) =>
        insts.map((inst, idx) =>
          idx === editingInstallmentIndex
            ? {
                ...inst,
                name: newInstallmentName,
                percentage: percentage,
                amount: Math.round((percentage / 100) * grandTotal),
              }
            : inst,
        ),
      );
    } else {
      // Add
      setInstallments((insts) => [
        ...insts,
        {
          id: `${Date.now()}-${Math.random()}`,
          name: newInstallmentName,
          percentage: percentage,
          amount: Math.round((percentage / 100) * grandTotal),
        },
      ]);
    }
    setShowInstallmentModal(false);
    setEditingInstallmentIndex(null);
    setNewInstallmentName("");
    setNewInstallmentPercentage("");
  };

  // Update handleSaveQuotation to use modal values
  const handleSaveQuotation = async () => {
    if (!quoteTitle.trim()) {
      toast.error("Please enter a quotation title");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/quotations/create`, {
        leadId: leadId,
        queryId: queryId,
        quoteTitle,
        quoteDescription,
        quoteNote: note,
        packages: packages.map((pkg) => ({
          categoryName: pkg.category,
          packageType: pkg.type === "preset" ? "Preset" : "Custom",
          eventStartDate: pkg.eventStartDate,
          eventEndDate: pkg.eventEndDate,
          slot: pkg.slot,
          venueName: pkg.venueName,
          venueAddress: pkg.venueAddress,
          services: (pkg.services || []).map((s) => ({
            serviceId: s.id || s.serviceId,
            serviceName: s.serviceName || s.name,
            price: Number(s.price),
            marginPrice: Number(s.marginPrice),
            qty: Number(s.qty),
          })),
        })),
        installments: isZeroTotal
          ? [] // do not store installments for zero total / 100% discount
          : installments.map((inst, idx) => ({
              installmentNumber: idx + 1,
              dueDate: inst.dueDate || "",
              paymentMode: inst.paymentMode || "",
              paymentAmount: inst.amount,
              paymentPercentage: inst.percentage,
            })),
        additionalServices: (selectedAdditionalServices || []).map((s) => ({
          serviceId: s._id || s.id,
          name: s.name,
          price: Number(s.price) || 0,
          description: s.description || "",
        })),
        totalAdditionalServiceAmount: Number(additionalServicesSubtotal || 0),

        totalPackageAmt: totalPackageAmount,
        totalAmount: grandTotal,
        discountValue: discountValue,
        gstApplied: isGstApplied,
        gstValue,
        totalAfterDiscount,
        marginAmount: totalMarginFinal,
        marginAfterDiscount,
        marginGstValue,
        totalMarginFinal,
        finalized: false,
        albums, // <--- include albums array
        totalAlbumAmount: albumSubtotal,
      });
      toast.success("Quotation saved successfully!");
      setShowSaveModal(false);
      setQuoteTitle("");
      setQuoteDescription("");

      await fetchQuotations();

      // Reset all state after save
      setPackages([]);
      setInstallments([]);
      setCurrentQuotationId(null);
      // setDiscountPer(0);
      setIsGstApplied(false);
      setGstValue(0);
      setDiscountValue(0);
      setTotalAfterDiscount(0);
      setMarginAfterDiscount(0);
      setMarginGstValue(0);
      setTotalMarginFinal(0);
      setAlbums([]);
    } catch (err) {
      toast.error("Failed to save quotation");
      console.error(err);
    }
  };

  // Placeholder for handleUpdateQuotation
  const handleUpdateQuotation = async () => {
    if (!quoteTitle.trim()) {
      toast.error("Please enter a quotation title");
      return;
    }
    try {
      const res = await axios.put(
        `${API_URL}/quotations/${currentQuotationId}`,
        {
          leadId: leadId,
          queryId: queryId,
          quoteTitle,
          quoteDescription,
          quoteNote: note,
          packages: packages.map((pkg) => ({
            categoryName: pkg.category,
            packageType: pkg.type === "preset" ? "Preset" : "Custom",
            eventStartDate: pkg.eventStartDate,
            eventEndDate: pkg.eventEndDate,
            slot: pkg.slot,
            venueName: pkg.venueName,
            venueAddress: pkg.venueAddress,
            services: (pkg.services || []).map((s) => ({
              serviceId: s.id || s.serviceId,
              serviceName: s.serviceName || s.name,
              price: Number(s.price),
              marginPrice: Number(s.marginPrice),
              qty: Number(s.qty),
            })),
          })),
          installments: isZeroTotal
            ? [] // do not store installments for zero total / 100% discount
            : installments.map((inst, idx) => ({
                installmentNumber: idx + 1,
                dueDate: inst.dueDate || "",
                paymentMode: inst.paymentMode || "",
                paymentAmount: inst.amount,
                paymentPercentage: inst.percentage,
              })),
          additionalServices: (selectedAdditionalServices || []).map((s) => ({
            serviceId: s._id || s.id,
            name: s.name,
            price: Number(s.price) || 0,
            description: s.description || "",
          })),
          totalAdditionalServiceAmount: Number(additionalServicesSubtotal || 0),

          totalPackageAmt: totalPackageAmount,
          totalAmount: grandTotal,
          discountValue: discountValue,
          gstApplied: isGstApplied,
          gstValue,
          totalAfterDiscount,
          marginAmount: totalMarginFinal,
          marginAfterDiscount,
          marginGstValue,
          totalMarginFinal,
          finalized: false,
          albums, // <--- include albums array
          totalAlbumAmount: albumSubtotal,
        },
      );
      toast.success("Quotation updated successfully!");
      setShowSaveModal(false);
      setQuoteTitle("");
      setQuoteDescription("");

      await fetchQuotations();
      handleLoadQuotation(currentQuotationId); // Ensure UI reflects updated values

      // Reset all state after update
      setPackages([]);
      setInstallments([]);
      setCurrentQuotationId(null);
      // setDiscountPer(0);
      setIsGstApplied(false);
      setGstValue(0);
      setDiscountValue(0);
      setTotalAfterDiscount(0);
      setMarginAfterDiscount(0);
      setMarginGstValue(0);
      setTotalMarginFinal(0);
    } catch (err) {
      console.error(err);
    }
  };

  // When category changes in custom modal, set event dates if category matches query event
  const handleCategoryChange = (option) => {
    setSelectedCategory(option);
    if (option.value !== "others") setCustomCategory("");
    // If leadDetails and eventDetails exist, try to find matching event
    if (
      leadDetails &&
      leadDetails.queryDetails &&
      Array.isArray(leadDetails.queryDetails.eventDetails)
    ) {
      const match = leadDetails.queryDetails.eventDetails.find(
        (ev) => ev.category === option.label,
      );
      if (match) {
        setEventStartDate(
          match.eventStartDate ? match.eventStartDate.split("T")[0] : "",
        );
        setEventEndDate(
          match.eventEndDate ? match.eventEndDate.split("T")[0] : "",
        );
      } else {
        setEventStartDate("");
        setEventEndDate("");
      }
    }
  };

  const handleSaveNotes = (noteInp) => {
    setNote(noteInp);
  };

  const handleDuplicateQuotation = async (quotationId) => {
    const quotation = savedQuotations.find((q) => q._id === quotationId);
    if (!quotation) return;

    // Deep clone all fields and remove only _id/id from all nested objects
    const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

    // Clean function to remove id/_id from any object
    const cleanIds = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(cleanIds);
      } else if (obj && typeof obj === "object") {
        const { id, _id, ...rest } = obj;
        Object.keys(rest).forEach((key) => {
          rest[key] = cleanIds(rest[key]);
        });
        return rest;
      }
      return obj;
    };

    // Clone and clean packages, services, installments, albums
    const clonedPackages = cleanIds(deepClone(quotation.packages || []));
    const clonedInstallments = cleanIds(
      deepClone(quotation.installments || []),
    );
    const clonedAlbums = cleanIds(deepClone(quotation.albums || []));

    try {
      await axios.post(`${API_URL}/quotations/create`, {
        leadId: quotation.leadId,
        queryId: quotation.queryId,
        quoteTitle: `${quotation.quoteTitle} (Copy)`,
        quoteDescription: quotation.quoteDescription,
        quoteNote: quotation.quoteNote,
        packages: clonedPackages,
        installments: clonedInstallments,
        totalPackageAmt: quotation.totalPackageAmt,
        totalAmount: quotation.totalAmount,
        discountValue: quotation.discountValue,
        gstApplied: quotation.gstApplied,
        gstValue: quotation.gstValue,
        totalAfterDiscount: quotation.totalAfterDiscount,
        marginAmount: quotation.marginAmount ?? quotation.totalMarginFinal,
        marginAfterDiscount: quotation.marginAfterDiscount,
        marginGstValue: quotation.marginGstValue,
        totalMarginFinal: quotation.totalMarginFinal,
        finalized: false,
        albums: clonedAlbums,
        totalAlbumAmount: quotation.totalAlbumAmount,
      });
      toast.success("Quotation duplicated successfully!");
      await fetchQuotations();
    } catch (err) {
      toast.error("Failed to duplicate quotation");
      console.error(err);
    }
  };

  const missingVenuePackages = useMemo(() => {
    if (!currentQuotationId || packages.length === 0) return [];
    return packages
      .map((pkg, idx) => ({
        idx,
        category: pkg.category,
        venueName: pkg.venueName,
        venueAddress: pkg.venueAddress,
      }))
      .filter((pkg) => !pkg.venueName?.trim() || !pkg.venueAddress?.trim());
  }, [currentQuotationId, packages]);

  return (
    <div
      className="container mb-5"
      style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px" }}
    >
      <div className="container ">
        <div className="alert alert-danger fw-semibold sticky-top" role="alert">
          <span>
            <strong>Important:</strong> Please <u>save the quotation</u> before
            going to another page. If you leave without saving, your changes
            will be lost.
          </span>
        </div>

        {currentQuotationId && missingVenuePackages.length > 0 && (
          <div className="alert alert-warning fw-semibold mb-3">
            <span>
              <strong>
                Please add the <u>Venue Name</u> and <u>Venue Address</u> for
                all packages before confirming the booking.
              </strong>
              <br />
              Missing in:
              <ul className="mb-0">
                {missingVenuePackages.map((pkg) => (
                  <li key={pkg.idx}>
                    <strong>{pkg.category || `Package ${pkg.idx + 1}`}</strong>
                    {(!pkg.venueName?.trim() || !pkg.venueAddress?.trim()) && (
                      <>
                        {!pkg.venueName?.trim()}
                        {!pkg.venueAddress?.trim()}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </span>
          </div>
        )}

        {/* Lead Details Section */}
        <Card
          className="p-3 mb-3 border-0 shadow-sm"
          style={{ background: "#f8fafc", borderRadius: "12px" }}
        >
          <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-3">
            <p
              className="mb-0"
              style={{ letterSpacing: "1px", fontWeight: 600 }}
            >
              Customer Details
            </p>
            <div className="d-flex align-items-center gap-2">
              {leadDetails?.queryDetails?.status && (
                <span
                  className={`badge bg-${
                    leadDetails.queryDetails.status === "Call Later"
                      ? "warning"
                      : "success"
                  } text-dark`}
                  style={{ fontSize: "13px" }}
                >
                  {leadDetails.queryDetails.status}
                </span>
              )}
              {leadDetails?.leadId && (
                <Button
                  variant="outline-dark"
                  size="sm"
                  className="ms-2 d-flex align-items-center"
                  style={{
                    border: "none",
                    // background: "transparent",
                    boxShadow: "none",
                  }}
                  title="Edit Lead"
                  onClick={() =>
                    navigate(`/customer/edit-details/${leadId}/${queryId}`)
                  }
                >
                  <FaEdit style={{ fontSize: "18px" }} />
                </Button>
              )}

              <Button
                variant="dark"
                size="sm"
                onClick={() => setShowNotesModal(true)}
              >
                <FaStickyNote /> {note ? "Edit Note" : " Add Note"}
              </Button>
            </div>
          </div>
          {leadDetails ? (
            <div>
              <Row className="mb-2">
                <Col md={6} className="mb-2">
                  <div>
                    <strong>Lead ID:</strong>{" "}
                    <span className="text-primary">
                      {leadDetails.leadId || leadDetails._id || "N/A"}
                    </span>
                  </div>
                </Col>
                <Col md={6} className="mb-2">
                  <div>
                    <strong>Reference:</strong>{" "}
                    <span>{leadDetails.referenceForm || "N/A"}</span>
                  </div>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6} className="mb-2">
                  <div>
                    <strong>Query ID:</strong>{" "}
                    <span>{leadDetails.queryDetails?.queryId || "N/A"}</span>
                  </div>
                </Col>
                <Col md={4} className="mb-2">
                  <div>
                    <strong>Note:</strong> <span>{note || "N/A"}</span>
                  </div>
                </Col>
              </Row>
              <div className="mb-3">
                <p
                  className="fw-semibold mb-2"
                  style={{ letterSpacing: "0.5px" }}
                >
                  Persons
                </p>
                <Row>
                  {leadDetails.persons && leadDetails.persons.length > 0 ? (
                    leadDetails.persons.map((person) => (
                      <Col md={6} key={person._id} className="mb-2">
                        <div className="p-2 border rounded bg-white d-flex align-items-center gap-2">
                          <span
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: 32,
                              height: 32,
                              fontWeight: 600,
                              fontSize: 16,
                            }}
                          >
                            {person.name?.[0] || "?"}
                          </span>
                          <div>
                            <div className="fw-semibold">{person.name}</div>
                            <div style={{ fontSize: "13px" }}>
                              <span className="text-muted">
                                {person.phoneNo}
                              </span>{" "}
                              |{" "}
                              <span className="text-muted">{person.email}</span>
                            </div>
                            <div style={{ fontSize: "13px" }}>
                              <span className="badge bg-light text-dark border">
                                {person.profession}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))
                  ) : (
                    <Col>
                      <span className="text-muted">No persons found</span>
                    </Col>
                  )}
                </Row>
              </div>
              <div className="mb-2">
                <p
                  className="fw-semibold mb-2"
                  style={{ letterSpacing: "0.5px" }}
                >
                  Event Details
                </p>
                {leadDetails.queryDetails?.eventDetails &&
                leadDetails.queryDetails.eventDetails.length > 0 ? (
                  <Table bordered size="sm" className="mb-0 bg-white">
                    <thead className="table-light">
                      <tr>
                        <th>Category</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadDetails.queryDetails.eventDetails.map((event) => (
                        <tr key={event._id}>
                          <td>{event.category}</td>
                          <td>{formatDate(event.eventStartDate)}</td>
                          <td>{formatDate(event.eventEndDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <span className="text-muted">No event details found</span>
                )}
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-12">
                <p className="text-danger mb-0">
                  Lead details not found. Please check the lead and query IDs.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Saved Quotations Section */}
        <Card
          className="p-3 mb-3 border-0 shadow-sm"
          style={{ background: "#F4F4F4" }}
        >
          <div className="d-flex justify-content-between align-items-center pb-3">
            <h4 style={{ fontSize: "18px", marginBottom: "0" }}>
              Saved Quotations
            </h4>
          </div>
          {noQuotationsFound ? (
            <div className="alert alert-info mb-0">
              No saved quotations found.
            </div>
          ) : savedQuotations.length > 0 ? (
            <>
              <div className="alert alert-info mb-3">
                <small>
                  <strong>Note:</strong> Only one quotation can be marked as
                  "Finalized" at a time. To change the final quotation, click{" "}
                  <FaTimesCircle className="text-warning" /> to unfinalize the
                  current one, then click{" "}
                  <FaCheckCircle className="text-success" /> to finalize a
                  different quotation.
                  <br />
                  <FaCopy className="text-secondary" /> Duplicate icon lets you
                  copy a quotation for editing.
                </small>
              </div>
              <Table bordered hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "25%" }}>Quotation Name</th>
                    <th style={{ width: "15%" }}>Date</th>
                    <th style={{ width: "15%" }}>Total Amount</th>
                    <th style={{ width: "15%" }}>Packages</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "20%" }} className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {savedQuotations.map((quotation) => (
                    <tr
                      key={quotation._id}
                      className={`${quotation.finalized ? " fw-bold" : ""}
                        ${
                          quotation._id === currentQuotationId
                            ? "table-primary"
                            : ""
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadQuotation(quotation._id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        {quotation.quoteTitle}
                        {quotation.quoteDescription && (
                          <div>
                            <small className="text-muted">
                              {quotation.quoteDescription}
                            </small>
                          </div>
                        )}
                        {quotation._id === currentQuotationId && (
                          <Badge bg="info" className="mt-1 fw-medium">
                            Selected
                          </Badge>
                        )}
                      </td>
                      <td>{formatDate(quotation.createdAt)}</td>
                      <td>
                        {quotation.totalAmount !== undefined &&
                        quotation.totalAmount !== null
                          ? `₹${quotation.totalAmount.toLocaleString()}`
                          : "-"}
                      </td>
                      <td>{quotation.packages?.length ?? 0}</td>
                      <td>
                        {quotation.finalized ? (
                          <Badge bg="success">Finalized</Badge>
                        ) : (
                          <Badge bg="secondary">Draft</Badge>
                        )}
                      </td>
                      <td className="text-center">
                        {/* Duplicate Icon */}
                        <Button
                          variant="link"
                          className="text-secondary p-0 mx-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateQuotation(quotation._id);
                          }}
                          title="Duplicate Quotation"
                        >
                          <FaCopy />
                        </Button>
                        {quotation.finalized ? (
                          <Button
                            variant="link"
                            className="text-warning p-0 mx-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnfinalizeQuotation(quotation._id);
                            }}
                            title="Unfinalize Quotation"
                          >
                            <FaTimesCircle />
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            className="text-success p-0 mx-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFinalizeQuotation(quotation._id);
                            }}
                            title="Finalize Quotation"
                          >
                            <FaCheckCircle />
                          </Button>
                        )}
                        <Button
                          variant="link"
                          className="text-danger p-0 mx-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuotation(quotation._id);
                          }}
                          title="Delete Quotation"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : null}
        </Card>
        {/* Custom Package Modal */}
        <Modal
          show={showCustomModal}
          onHide={closeCustomModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Create New Package</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Select Category<span style={{ color: "Red" }}>*</span>
                    </Form.Label>
                    <Select
                      options={categoryOptions}
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      placeholder="Select Category"
                    />
                    {selectedCategory &&
                      selectedCategory.value === "others" && (
                        <Form.Control
                          type="text"
                          placeholder="Enter custom category"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="mt-2"
                          required
                        />
                      )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Choose Slot<span style={{ color: "Red" }}>*</span>
                    </Form.Label>
                    <Select
                      options={slotOptions}
                      value={selectedSlot}
                      onChange={(option) => {
                        setSelectedSlot(option);
                        if (option.value !== "others") setCustomSlot("");
                      }}
                      placeholder="Select Slot"
                      required
                    />
                    {selectedSlot && selectedSlot.value === "others" && (
                      <Form.Control
                        type="text"
                        placeholder="Enter custom slot"
                        value={customSlot}
                        onChange={(e) => setCustomSlot(e.target.value)}
                        className="mt-2"
                        required
                      />
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Event Start Date<span style={{ color: "Red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Event End Date<span style={{ color: "Red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Venue Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      list="venue-name-suggestions"
                      autoComplete="off"
                    />
                    <datalist id="venue-name-suggestions">
                      {venueNameSuggestions.map((name, idx) => (
                        <option value={name} key={idx} />
                      ))}
                    </datalist>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Venue Address</Form.Label>
                    {/* // Venue Address input */}
                    <Form.Control
                      type="text"
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      list="venue-address-suggestions"
                      autoComplete="off"
                    />
                    <datalist id="venue-address-suggestions">
                      {venueAddressSuggestions.map((addr, idx) => (
                        <option value={addr} key={idx} />
                      ))}
                    </datalist>
                  </Form.Group>
                </Col>
              </Row>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Services</th>
                    <th>Price</th>
                    <th>Margin Price</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, idx) => (
                    <tr key={service.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={service.checked}
                          onChange={() => handleServiceCheck(service.id)}
                        />
                      </td>
                      <td>{service.name}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={service.price}
                          disabled // Only Qty editable
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={service.marginPrice}
                          disabled // Only Qty editable
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={service.qty}
                          onChange={(e) =>
                            handleServiceQty(service.id, e.target.value)
                          }
                          disabled={!service.checked}
                        />
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr>
                    <td colSpan="2" className="fw-semibold text-end">
                      Total
                    </td>
                    <td className="fw-semibold">
                      ₹
                      {services
                        .filter((s) => s.checked)
                        .reduce(
                          (sum, s) =>
                            sum +
                            (parseFloat(s.price) || 0) * (parseInt(s.qty) || 1),
                          0,
                        )
                        .toLocaleString()}
                    </td>
                    <td className="fw-semibold">
                      ₹
                      {services
                        .filter((s) => s.checked)
                        .reduce(
                          (sum, s) =>
                            sum +
                            (parseFloat(s.marginPrice) || 0) *
                              (parseInt(s.qty) || 1),
                          0,
                        )
                        .toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={handleCreateOrUpdateCustomPackage}>
              {editingPackageIndex !== null
                ? "Update Package"
                : "Create Package"}
            </Button>
            <Button variant="outline-secondary" onClick={closeCustomModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Preset Package Modal */}
        <Modal
          show={showPresetModal}
          onHide={closePresetModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Preset Package</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Select Preset</Form.Label>
                    <Select
                      options={presetCategoryOptions}
                      value={presetCategory}
                      onChange={handlePresetCategoryChange}
                      placeholder="Select Preset"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Choose Slot</Form.Label>
                    <Select
                      options={slotOptions}
                      value={presetSlot}
                      onChange={setPresetSlot}
                      placeholder="Select Slot"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Event Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={presetEventStartDate}
                      onChange={(e) => setPresetEventStartDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Event End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={presetEventEndDate}
                      onChange={(e) => setPresetEventEndDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Venue Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={presetVenueName}
                      onChange={(e) => setPresetVenueName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Venue Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={presetVenueAddress}
                      onChange={(e) => setPresetVenueAddress(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Services</th>
                    <th>Price</th>
                    <th>Margin Price</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {presetServices.map((service, idx) => (
                    <tr key={service.id}>
                      <td>{service.serviceName}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={service.price}
                          onChange={(e) =>
                            handlePresetServicePrice(service.id, e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={service.marginPrice}
                          disabled
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={service.qty}
                          onChange={(e) =>
                            handlePresetServiceQty(service.id, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr>
                    <td className="fw-semibold text-end" colSpan="1">
                      Total
                    </td>
                    <td className="fw-semibold">
                      ₹
                      {presetServices
                        .reduce(
                          (sum, s) =>
                            sum +
                            (parseFloat(s.price) || 0) * (parseInt(s.qty) || 1),
                          0,
                        )
                        .toLocaleString()}
                    </td>
                    <td className="fw-semibold">
                      ₹
                      {presetServices
                        .reduce(
                          (sum, s) =>
                            sum +
                            (parseFloat(s.marginPrice) || 0) *
                              (parseInt(s.qty) || 1),
                          0,
                        )
                        .toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={handleCreateOrUpdatePresetPackage}>
              {editingPackageIndex !== null
                ? "Update Package"
                : "Create Package"}
            </Button>
            <Button variant="outline-secondary" onClick={closePresetModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Packages Table */}
        <Card className="p-3 mb-3 border-0 " style={{ background: "#F4F4F4" }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <h4 style={{ fontSize: "18px", marginBottom: "0" }}>
                Current Quotation
              </h4>
            </div>
            <div className="d-flex justify-content-between align-items-center gap-2">
              <Button
                onClick={openPresetModal}
                variant="primary"
                className="fw-bold rounded-1 shadow"
                style={{ fontSize: "14px" }}
              >
                + Add Preset Package
              </Button>
              <Button
                onClick={openCustomModal}
                variant="transparent"
                className="fw-bold rounded-1 shadow bg-white"
                style={{ fontSize: "14px" }}
              >
                + Add Custom Package
              </Button>
            </div>
          </div>
          <br />
          {!currentQuotationId && packages.length === 0 ? (
            <div className="alert alert-info mb-3">
              <p className="mb-0">
                Please select a quotation from above or create a new package by
                clicking 'Add Custom Package'.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-wrap gap-4 justify-content-start">
              {packages.map((pkg, index) => {
                const totalPrice = pkg.services.reduce(
                  (sum, s) =>
                    sum + (parseFloat(s.price) || 0) * (parseInt(s.qty) || 1),
                  0,
                );
                const totalMargin = pkg.services.reduce(
                  (sum, s) =>
                    sum +
                    (parseFloat(s.marginPrice) || 0) * (parseInt(s.qty) || 1),
                  0,
                );

                return (
                  <Card className="mb-4 shadow-sm w-100" key={pkg.id || index}>
                    <div className="d-flex justify-content-between p-4">
                      <div>
                        <p className="fw-bold mb-1">
                          {pkg.category && pkg.category.includes(" - ")
                            ? pkg.category.split(" - ")[0]
                            : pkg.category}

                          {/* {pkg.category} */}
                          {pkg.type && (
                            <Badge
                              bg={pkg.type === "preset" ? "info" : "secondary"}
                              className="ms-2"
                              pill
                            >
                              {pkg.type.charAt(0).toUpperCase() +
                                pkg.type.slice(1)}
                            </Badge>
                          )}
                        </p>

                        <p
                          className="text-muted mb-2"
                          style={{ lineHeight: ".5", marginTop: "10px" }}
                        >
                          {formatDate(pkg.eventStartDate)} -{" "}
                          {formatDate(pkg.eventEndDate)}, {pkg.slot}
                        </p>

                        <div className="mb-4">
                          <p className="mb-1" style={{ lineHeight: "1.2" }}>
                            <strong>Venue:</strong>{" "}
                            {pkg.venueName && pkg.venueName}
                          </p>

                          <p
                            className="mb-0"
                            style={{
                              lineHeight: "1.2",
                              maxWidth: "400px",
                              wordWrap: "break-word",
                            }}
                          >
                            <strong>Address:</strong>{" "}
                            {pkg.venueAddress && pkg.venueAddress}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex gap-2 flex-column">
                        <Button
                          variant="link"
                          className="d-flex align-items-center fw-bold rounded-1 shadow-sm rounded-5 bg-white text-primary"
                          onClick={() => handleEditPackage(pkg, index)}
                        >
                          <FaEdit /> Edit
                        </Button>
                        {/* 2. Delete Individual Package */}
                        <Button
                          variant="transparent"
                          className="fw-bold rounded-1 shadow-sm rounded-5 bg-white text-danger"
                          style={{ fontSize: "14px" }}
                          onClick={() => {
                            setPackages(packages.filter((_, i) => i !== index));
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <Table bordered className="table-sm ">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "40%" }} className="px-4">
                            Services
                          </th>
                          <th style={{ width: "15%" }} className="text-center">
                            Qty
                          </th>
                          <th style={{ width: "15%" }} className="text-right">
                            Price
                          </th>
                          <th style={{ width: "15%" }} className="text-right">
                            Margin Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pkg.services && pkg.services.length > 0 ? (
                          pkg.services.map((service, idx) => (
                            <tr key={service.id || idx}>
                              <td className="px-4">
                                {service.serviceName || service.name}
                              </td>
                              <td className="text-center">{service.qty}</td>
                              <td className="text-right">
                                ₹
                                {(
                                  parseFloat(service.price) *
                                  (parseInt(service.qty) || 1)
                                ).toLocaleString()}
                              </td>
                              <td className="text-right">
                                ₹
                                {(
                                  parseFloat(service.marginPrice) *
                                  (parseInt(service.qty) || 1)
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">
                              No services selected
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td
                            colSpan="2"
                            className="fw-semibold px-4 text-right"
                          >
                            Total
                          </td>
                          <td className="fw-semibold text-right">
                            ₹
                            {typeof totalPrice === "number"
                              ? totalPrice.toLocaleString()
                              : "-"}
                          </td>
                          <td className="fw-semibold text-right">
                            ₹
                            {typeof totalMargin === "number"
                              ? totalMargin.toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card>
                );
              })}

              <Card
                className="p-3 mb-3 border-0 shadow-sm w-100"
                style={{ background: "#F4F4F4" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h4 style={{ fontSize: "18px", marginBottom: 0 }}>Albums</h4>
                  <Button
                    onClick={openAddAlbumModal}
                    variant="transparent"
                    className="fw-bold rounded-1 shadow bg-white"
                    style={{ fontSize: "14px" }}
                  >
                    + Add Album
                  </Button>
                </div>

                <LocalAlbumsTable
                  albums={albums}
                  onView={openAlbumDetails}
                  onEdit={(idx) => openEditAlbumModal(idx)}
                  onRemove={handleAlbumRemove}
                />
              </Card>
              <Card
                className="p-3 mb-3 border-0 shadow-sm w-100"
                style={{ background: "#F4F4F4" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h4 style={{ fontSize: "18px", marginBottom: 0 }}>
                    Additional services
                  </h4>
                  <Button
                    onClick={openAdditionalServicesModal}
                    variant="transparent"
                    className="fw-bold rounded-1 shadow bg-white"
                    style={{ fontSize: "14px" }}
                  >
                    + Add Additional Services
                  </Button>
                </div>
                {selectedAdditionalServices.length > 0 && (
                  <div className="mt-3">
                    <h6 className="fw-bold mb-2">Additional Services</h6>

                    <Table
                      bordered
                      responsive
                      size="sm"
                      className="mb-0 bg-white"
                    >
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "25%" }}>Service Name</th>
                          <th style={{ width: "50%" }}>Description</th>
                          <th style={{ width: "15%" }} className="text-end">
                            Price
                          </th>
                          <th style={{ width: "10%" }} className="text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAdditionalServices.map((s) => {
                          const id = s._id || s.id;
                          return (
                            <tr key={id}>
                              <td className="fw-semibold">{s.name}</td>
                              <td>{s.description || "—"}</td>
                              <td className="text-end fw-semibold">
                                ₹{Number(s.price || 0).toLocaleString()}
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="link"
                                  className="text-danger p-0"
                                  onClick={() => {
                                    try {
                                      removeAdditionalService(id);
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }}
                                  title="Remove"
                                >
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}

                        <tr className="fw-bold">
                          <td colSpan={2} className="text-end">
                            Total
                          </td>
                          <td className="text-end">
                            ₹
                            {Number(
                              additionalServicesSubtotal || 0,
                            ).toLocaleString()}
                          </td>
                          <td />
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card>

              <LocalAddAlbumModal
                show={showAlbumModal}
                onClose={closeAlbumModal}
                mode={albumModalMode}
                initialData={
                  albumModalMode === "edit" ? albums[albumEditIndex] : null
                }
                editIndex={albumEditIndex}
                onAdd={handleAlbumAdd}
                onUpdate={handleAlbumUpdate}
              />

              <LocalAlbumDetailsModal
                show={showAlbumDetails}
                onClose={closeAlbumDetails}
                album={
                  albumDetailsIndex != null ? albums[albumDetailsIndex] : null
                }
              />
              <Card className="mb-4 shadow-sm w-100">
                <div className="p-4">
                  <div className="d-flex justify-content-between">
                    <p className="fw-bold">Total Package Amount</p>
                    <p className="fw-bold">
                      ₹{totalPackageAmount.toLocaleString()}
                    </p>
                  </div>

                  <div className="d-flex justify-content-between">
                    <p className="fw-bold">Total Album Amount</p>
                    <p className="fw-bold">₹{albumSubtotal.toLocaleString()}</p>
                  </div>

                  <div className="d-flex justify-content-between">
                    <p className="fw-bold">Total Additional Services Amount</p>
                    <p className="fw-bold">
                      ₹{additionalServicesSubtotal.toLocaleString()}
                    </p>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between">
                    <p className="fw-bold">Total Before Discount</p>
                    <p className="fw-bold">
                      ₹{totalBeforeDiscount.toLocaleString()}
                    </p>
                  </div>

                  {totalPackageAmount !== 0 && (
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold">Total Margin Amount</p>
                      <p className="fw-bold">
                        ₹
                        {typeof totalMarginFinal === "number"
                          ? totalMarginFinal.toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  )}

                  <hr />

                  {/* === Discount Section (Value only) === */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="mb-0">Discount</p>
                      <div
                        style={{
                          border: "1px solid black",
                          padding: "2px",
                          backgroundColor: "white",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Add discount amount"
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            setDiscountValue(Number(value) || 0);
                          }}
                          value={discountValue}
                          style={{
                            outline: "none",
                            width: "140px",
                            textAlign: "right",
                            fontWeight: 600,
                            border: "none",
                            background: "transparent",
                          }}
                        />
                      </div>
                    </div>

                    {discountValue !== 0 && (
                      <div className="d-flex justify-content-end">
                        <p className="text-danger">
                          - ₹{discountValue.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* GST Row */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <Form.Check
                        type="checkbox"
                        id="gst-check"
                        label="Apply GST (18%)"
                        checked={isGstApplied}
                        onChange={(e) => setIsGstApplied(e.target.checked)}
                      />
                      <span className="fw-bold">
                        ₹{gstValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <hr />

                  {/* Grand Total */}
                  <div className="d-flex justify-content-between text-success">
                    <p className="">Grand Total</p>
                    <p className="fw-semibold">
                      ₹{grandTotal.toLocaleString()}
                    </p>
                  </div>

                  {note && (
                    <div className="mt-1 fw-bold fs-6 bg-warning p-2 rounded bg-opacity-25">
                      Note : <span>{note || "N/A"}</span>
                    </div>
                  )}

                  <hr />

                  {totalPackageAmount !== 0 && (
                    <div className="d-flex justify-content-between text-primary">
                      <p className="">Margin after Discount</p>
                      <p className="fw-semibold">
                        ₹
                        {typeof marginAfterDiscount === "number"
                          ? marginAfterDiscount.toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  )}

                  {totalPackageAmount !== 0 && (
                    <div className="d-flex justify-content-between text-primary">
                      <p className="">GST on Margin</p>
                      <p className="fw-semibold">
                        ₹
                        {typeof marginGstValue === "number"
                          ? marginGstValue.toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  )}

                  {totalPackageAmount !== 0 && (
                    <div className="d-flex justify-content-between text-success">
                      <p className="">Final Margin Total</p>
                      <p className="fw-semibold">
                        ₹
                        {typeof totalMarginFinal === "number"
                          ? totalMarginFinal.toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </Card>
        {packages.length > 0 && !isZeroTotal && (
          <Card className="p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ fontSize: "18px", marginBottom: "0" }}>
                Installments
              </h4>
              <Button
                variant="transparent"
                className="fw-bold rounded-1 shadow bg-white"
                onClick={() => {
                  setEditingInstallmentIndex(null);
                  setNewInstallmentName(
                    `Installment ${installments.length + 1}`,
                  );
                  setNewInstallmentPercentage("");
                  setShowInstallmentModal(true);
                }}
                style={{ fontSize: "14px" }}
                disabled={
                  isZeroTotal || // <— add this
                  installments.reduce(
                    (sum, inst) => sum + inst.percentage,
                    0,
                  ) >= 100
                }
              >
                + Add Installment
              </Button>
            </div>
            {installments.reduce((sum, inst) => sum + inst.percentage, 0) >=
              100 && (
              <div className="alert alert-success my-2">
                All{" "}
                {installments.reduce((sum, inst) => sum + inst.percentage, 0)}%
                of the amount has been allocated to {installments.length}{" "}
                installments.
              </div>
            )}

            <Table bordered responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Installment</th>
                  <th>Percentage</th>
                  <th>Amount</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {installments.length > 0 ? (
                  installments.map((inst, index) => (
                    <tr key={index}>
                      <td>{inst.name}</td>
                      <td>{inst.percentage}%</td>
                      <td>
                        ₹
                        {inst.amount !== undefined && inst.amount !== null
                          ? inst.amount.toLocaleString()
                          : "-"}
                      </td>
                      <td className="text-center">
                        <Button
                          variant="link"
                          className="p-0 me-3"
                          onClick={() => handleEditInstallment(index)}
                        >
                          <FaEdit
                            style={{ fontSize: "18px", color: "#0d6efd" }}
                          />
                        </Button>
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => handleDeleteInstallment(index)}
                        >
                          <FaTrash
                            style={{ fontSize: "16px", color: "#dc3545" }}
                          />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No installments created yet. Click "Add Installment" to
                      create one.
                    </td>
                  </tr>
                )}
                {installments.length > 0 && (
                  <tr className="fw-bold">
                    <td>Total</td>
                    <td>
                      {totalInstallPercentage}%{" "}
                      {totalInstallPercentage !== 100 && (
                        <span className="fw-normal text-danger">
                          (Need to divide it in 100%){" "}
                        </span>
                      )}
                    </td>
                    <td colSpan="2">
                      ₹
                      {typeof grandTotal === "number"
                        ? grandTotal.toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Installment Modal */}
            <Modal
              show={showInstallmentModal}
              onHide={() => setShowInstallmentModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  {editingInstallmentIndex !== null
                    ? "Edit Installment"
                    : "Add Installment"}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Installment Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={newInstallmentName}
                      onChange={(e) => setNewInstallmentName(e.target.value)}
                      placeholder="Enter installment name"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Percentage</Form.Label>
                    <Form.Control
                      type="number"
                      value={newInstallmentPercentage}
                      onChange={(e) =>
                        setNewInstallmentPercentage(e.target.value)
                      }
                      placeholder="Enter percentage (e.g. 25)"
                      min="1"
                      max={availablePercentage}
                      disabled={availablePercentage === 0}
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="dark"
                  onClick={handleAddInstallment}
                  disabled={availablePercentage === 0}
                >
                  {editingInstallmentIndex !== null
                    ? "Update Installment"
                    : "Add Installment"}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowInstallmentModal(false)}
                >
                  Cancel
                </Button>
              </Modal.Footer>
            </Modal>
          </Card>
        )}
      </div>

      {/* Add Save Quotation and View Quotation buttons at the bottom */}
      {packages.length > 0 && (
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button
            variant="dark"
            onClick={() => setShowSaveModal(true)}
            disabled={totalInstallPercentage !== 100}
          >
            {currentQuotationId ? "Update Quotation" : "Save Quotation"}
          </Button>
          {currentQuotationId && (
            <Button
              variant="outline-dark"
              onClick={() =>
                navigate(`/quote/finalized-quotation/${currentQuotationId}`)
              }
            >
              View Quotation
            </Button>
          )}
        </div>
      )}

      {/* Save Quotation Modal */}
      <Modal
        show={showSaveModal}
        onHide={() => setShowSaveModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentQuotationId ? "Update Quotation" : "Save Quotation"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Quotation Title</Form.Label>
              <Form.Control
                type="text"
                value={quoteTitle}
                onChange={(e) => setQuoteTitle(e.target.value)}
                placeholder="Enter quotation title"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={quoteDescription}
                onChange={(e) => setQuoteDescription(e.target.value)}
                placeholder="Enter description (optional)"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={
              currentQuotationId ? handleUpdateQuotation : handleSaveQuotation
            }
           
          >
            {currentQuotationId ? "Update Quotation" : "Save Quotation"}
          </Button>
        </Modal.Footer>
      </Modal>

      <NotesModal
        show={showNotesModal}
        onHide={() => setShowNotesModal(false)}
        onSave={handleSaveNotes}
        note={note}
        title="Add New Note"
      />

      <Modal
        show={showAdditionalServicesModal}
        onHide={closeAdditionalServicesModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Additional Services</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">Additional Services</Form.Label>

            <Select
              isMulti
              options={additionalServiceOptions}
              value={(selectedAdditionalServices || []).map((s) => ({
                value: s._id || s.id,
                label: `${s.name} (₹${Number(s.price || 0).toLocaleString()})`,
                meta: s,
              }))}
              onChange={(selected) => {
                try {
                  const list = (selected || []).map((opt) => ({
                    _id: opt.meta?._id || opt.value,
                    name: opt.meta?.name || "",
                    price: Number(opt.meta?.price || 0),
                    description: opt.meta?.description || "",
                  }));
                  setSelectedAdditionalServices(list);
                } catch (e) {
                  console.error(e);
                }
              }}
              placeholder="Select additional services..."
            />
          </Form.Group>

          <div className="mt-3 text-muted" style={{ fontSize: "13px" }}>
            Selected total: ₹
            {Number(additionalServicesSubtotal || 0).toLocaleString()}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={closeAdditionalServicesModal}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateQuote;
