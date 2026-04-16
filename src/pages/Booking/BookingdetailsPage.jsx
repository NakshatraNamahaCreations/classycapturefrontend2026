import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Card,
  Modal,
  Row,
  Col,
  Tooltip,
  OverlayTrigger,
  Alert,
} from "react-bootstrap";
import {
  FaPlus,
  FaMinus,
  FaEdit,
  FaSave,
  FaTimes,
  FaExchangeAlt,
  FaClipboardList,
  FaUserTie,
  FaUserAlt,
  FaInstagram,
  FaUserPlus,
  FaWhatsapp,
  FaStickyNote,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddAlbumModal from "../Albums/AddAlbumModal";
import AlbumsTable from "../Albums/AlbumsTable";
import AlbumDetailsModal from "../Albums/AlbumDetailsModal";
import { computeAlbumTotal, fmt } from "../../utils/albumUtils";
import { BsDatabaseFillAdd, BsDatabaseFillCheck } from "react-icons/bs";
import { BsCheckCircleFill } from "react-icons/bs";
import { API_URL } from "../../utils/api";
import Select from "react-select";
import AdditionalServicesTable from "../AdditionalServices/AdditionalServicesTable";
import AddAdditionalServicesModal from "../AdditionalServices/AddAdditionalServicesModal";
import DispatchRemarkModal from "./DispatchRemarkModal";

const Chip = ({ children, tone = "light" }) => (
  <span className={`chip chip-${tone}`}>{children}</span>
);

const paymentModes = [
  { value: "Online", label: "Online" },
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "Bank Transfer", label: "Bank Transfer" },
];

const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Partial Paid", label: "Partial Paid" },
  { value: "Completed", label: "Completed" },
];

// ✅ Add these near the top of your component (before return)
const cdLabelStyle = { fontSize: "12px", fontWeight: 600, marginBottom: "4px" };
const cdInputStyle = { fontSize: "13px", height: "38px" };
const cdNoteInputStyle = { fontSize: "13px", height: "38px" };

const BookingdetailsPage = () => {
  const [quotationData, setQuotationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [installments, setInstallments] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [startFilter, setStartFilter] = useState(null);
  const [endFilter, setEndFilter] = useState(null);
  const [newInstruction, setNewInstruction] = useState("");
  const [showCollectDataModal, setShowCollectDataModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedServiceUnit, setSelectedServiceUnit] = useState(null);
  const [collectedDataList, setCollectedDataList] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [viewAlbum, setViewAlbum] = useState(null);

  // ✅ Additional Services
  const [showAdditionalModal, setShowAdditionalModal] = useState(false);
  const [additionalCatalog, setAdditionalCatalog] = useState([]);
  const [additionalLoading, setAdditionalLoading] = useState(false);
  const [additionalSelected, setAdditionalSelected] = useState([]); // react-select values

  // ✅ Initial state
  const [collectData, setCollectData] = useState({
    personName: "",
    cameraName: "",

    // ✅ New storage fields (GB)
    storageTotalCapacityGb: "",
    existingDataSizeBeforeEventGb: "",
    existingFilesCountBeforeEvent: "",
    thisEventDataSizeGb: "", // optional
    totalUsedAfterEventGb: "", // optional

    // existing fields
    backupDrive: "",
    driveName: "",
    qualityChecked: false,

    copyingPerson: "",
    systemNumber: "",
    backupSystemNumber: "",
    copiedLocation: "",
    backupCopiedLocation: "",

    noOfPhotos: "",
    noOfVideos: "",
    firstPhotoTime: "",
    lastPhotoTime: "",
    firstVideoTime: "",
    lastVideoTime: "",
    submissionDate: "",
    notes: "",
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentDate: dayjs().format("DD-MM-YYYY"),
    paymentMode: "Online",
    amount: 0,
    status: "Pending",
  });
  const [existingHolders, setExistingHolders] = useState([]);
  const [newHolder, setNewHolder] = useState({ name: "" });

  // --- package qty edit modal state ---
  const [pkgQtyModalOpen, setPkgQtyModalOpen] = useState(false);
  const [pkgEditIndex, setPkgEditIndex] = useState(null);
  const [pkgDraft, setPkgDraft] = useState(null);

  // Add state for person edit modal
  const [showPersonEditModal, setShowPersonEditModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [personFormData, setPersonFormData] = useState({
    name: "",
    phoneNo: "",
    email: "",
    profession: "",
    instagramHandle: "",
  });

  const [discountValue, setDiscountValue] = useState(0); // NEW: discount amount
  const [discountEditMode, setDiscountEditMode] = useState(false);
  const [discountDraft, setDiscountDraft] = useState(discountValue);

  // Action modal for Note / Group
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // "note" or "group"
  const [actionValue, setActionValue] = useState("");

  const [showRemark, setShowRemark] = useState(false);
  const [dispatchRemark, setDispatchRemark] = useState(null);
  const [dispatchRemarkLoading, setDispatchRemarkLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const isCancelled = quotationData?.bookingStatus === "Cancelled";
  const isCompleted = quotationData?.bookingStatus === "Completed";

  const markAsCancelled = async () => {
    try {
      if (isCancelled) return;

      const ok = window.confirm(
        "Are you sure you want to cancel this booking? After cancelling, no modifications will be allowed.",
      );
      if (!ok) return;

      await axios.put(`${API_URL}/quotations/${id}/booking-status`, {
        status: "Cancelled",
        queryId: quotationData?.queryId?.queryId || quotationData?.queryId,
      });

      toast.success("Booking marked as Cancelled");
      await fetchQuotation();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to cancel booking");
    }
  };

  useEffect(() => {
    setDiscountDraft(discountValue);
  }, [discountValue]);

  const handleDiscountEditClick = () => {
    setDiscountEditMode(true);
    setDiscountDraft(discountValue);
  };

  const handleDiscountDraftChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setDiscountDraft(val);
  };

  // Add function to handle opening person edit modal
  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setPersonFormData({
      name: person.name || "",
      phoneNo: person.phoneNo || "",
      email: person.email || "",
      profession: person.profession || "",
      instagramHandle: person.instagramHandle || "",
    });
    setShowPersonEditModal(true);
  };

  const handlePersonFormChange = (e) => {
    const { name, value } = e.target;
    setPersonFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchDispatchRemark = async () => {
    try {
      if (!id) return;
      setDispatchRemarkLoading(true);

      const res = await axios.get(
        `${API_URL}/dispatch-remarks/by-quotation/${id}`,
      );

      setDispatchRemark(res?.data?.data || null);
    } catch (e) {
      setDispatchRemark(null);
    } finally {
      setDispatchRemarkLoading(false);
    }
  };

  const handleSavePersonDetails = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/lead/${quotationData?.leadId?._id}/person/${editingPerson._id}`,
        {
          instagramHandle: personFormData.instagramHandle,
          email: personFormData.email,
          profession: personFormData.profession,
        },
      );
      // Update all fields after API call
      setQuotationData((prev) => ({
        ...prev,
        leadId: {
          ...prev.leadId,
          persons: prev.leadId.persons.map((p) =>
            p._id === editingPerson._id
              ? {
                  ...p,
                  instagramHandle: personFormData.instagramHandle,
                  email: personFormData.email,
                  profession: personFormData.profession,
                }
              : p,
          ),
        },
      }));
      toast.success("Instagram handle updated successfully");
      setShowPersonEditModal(false);
    } catch (error) {
      console.error("Update Instagram error:", error);
      toast.error("Failed to update Instagram handle");
    }
  };

  const getAdditionalId = (s) => s?._id || s?.id;

  // fetch catalog
  const fetchAdditionalServicesCatalog = async () => {
    try {
      setAdditionalLoading(true);
      const res = await axios.get(`${API_URL}/additional-services`);
      setAdditionalCatalog(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load additional services");
    } finally {
      setAdditionalLoading(false);
    }
  };

  // open modal
  const openAdditionalModal = async () => {
    try {
      // Load catalog if empty
      if (!additionalCatalog?.length) {
        await fetchAdditionalServicesCatalog();
      }

      // pre-select current services from quotation
      const current = quotationData?.additionalServices || [];
      const preselected = current.map((s) => ({
        value: getAdditionalId(s),
        label: `${s.name} (₹${Number(s.price || 0).toLocaleString()})`,
        price: Number(s.price) || 0,
        raw: s,
      }));
      setAdditionalSelected(preselected);

      setShowAdditionalModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Unable to open modal");
    }
  };

  // compute subtotal from quotationData
  const additionalServiceSubtotal = useMemo(() => {
    return Math.round(
      (quotationData?.additionalServices || []).reduce(
        (sum, s) => sum + (Number(s.price) || 0),
        0,
      ),
    );
  }, [quotationData?.additionalServices]);

  const additionalOptions = useMemo(() => {
    return (additionalCatalog || []).map((s) => ({
      value: s._id,
      label: `${s.name} (₹${Number(s.price || 0).toLocaleString()})`,
      price: Number(s.price) || 0,
      raw: s,
    }));
  }, [additionalCatalog]);

  const handleAddInstruction = async () => {
    if (!newInstruction.trim()) return;
    try {
      const res = await axios.put(
        `${API_URL}/quotations/${id}/instruction/add`,
        { instruction: newInstruction.trim() },
      );
      setQuotationData((prev) => ({
        ...prev,
        clientInstructions: res.data.clientInstructions,
      }));
      setNewInstruction("");
      toast.success("Instruction added");
    } catch (error) {
      console.error("Add instruction error:", error);
      toast.error("Failed to add instruction");
    }
  };

  const handleRemoveInstruction = async (instructionToDelete) => {
    try {
      const res = await axios.delete(
        `${API_URL}/quotations/${id}/instruction/delete`,
        { data: { instruction: instructionToDelete } },
      );
      setQuotationData((prev) => ({
        ...prev,
        clientInstructions: res.data.clientInstructions,
      }));
      toast.success("Instruction deleted");
    } catch (error) {
      console.error("Delete instruction error:", error);
      toast.error("Failed to delete instruction");
    }
  };

  const handleRemoveAdditionalService = async (service) => {
    try {
      const serviceId = String(service?.serviceId || "");
      if (!serviceId) return toast.error("Invalid additional service id");

      const ok = window.confirm(`Remove "${service?.name}"?`);
      if (!ok) return;

      // ✅ delete only that serviceId entry
      const res = await axios.delete(
        `${API_URL}/quotations/${id}/additional-services/${serviceId}`,
      );

      const nextQuotation = res?.data?.quotation || null;
      const nextAdditional = nextQuotation?.additionalServices || [];

      if (nextQuotation) setQuotationData(nextQuotation);
      else {
        setQuotationData((p) => ({
          ...p,
          additionalServices: (p?.additionalServices || []).filter(
            (x) => String(x?.serviceId) !== serviceId,
          ),
        }));
      }

      const totals = buildMinimalTotals(
        null,
        null,
        discountValue,
        nextAdditional,
      );

      await axios.put(`${API_URL}/quotations/${id}/totals-min`, {
        package: null,
        totalPackageAmt: totals.totalPackageAmt,
        totalAlbumAmount: totals.totalAlbumAmount,
        totalAdditionalServiceAmount: totals.totalAdditionalServiceAmount,
        discountValue: totals.discountValue,
        gstValue: totals.gstValue,
        totalAmount: totals.totalAmount,
        grandTotal: totals.totalAmount,
        totalMarginFinal: totals.totalMarginFinal,
        installments: totals.installments,
      });

      toast.success("Additional service removed");
      await fetchQuotation();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to remove additional service",
      );
    }
  };

  useEffect(() => {
    const fetchCollectedData = async () => {
      try {
        const res = await axios.get(`${API_URL}/collected-data/${id}`);
        setCollectedDataList(res.data.data);
      } catch (err) {
        setCollectedDataList(null);
      }
    };
    if (id) fetchCollectedData();
  }, [id, showCollectDataModal]);

  const fetchQuotation = async () => {
    try {
      const res = await axios.get(`${API_URL}/quotations/${id}`);
      const q = res.data.quotation;
      setQuotationData(q);
      setInstallments(q.installments || []);
      setAlbums(q.albums || []);
      setDiscountValue(Number(q.discountValue || 0)); // set discountValue
      console.log("res.data.q", q);
      fetchDispatchRemark();
    } catch (err) {
      toast.error("Error loading quotation");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  // Package subtotal (generic helper) — keep if not already present
  const computePackageSubtotalNow = (packagesArr = []) =>
    Math.round(
      (packagesArr || []).reduce(
        (sum, pkg) =>
          sum +
          (pkg.services || []).reduce(
            (s, srv) => s + (Number(srv.qty) || 1) * (Number(srv.price) || 0),
            0,
          ),
        0,
      ),
    );

  // Draft package total (for showing inside the modal)
  const pkgDraftTotal = useMemo(() => {
    if (!pkgDraft) return 0;
    return (pkgDraft.services || []).reduce(
      (s, srv) => s + (Number(srv.qty) || 1) * (Number(srv.price) || 0),
      0,
    );
  }, [pkgDraft]);

  // --- Totals calculation using discountValue ---
  const packageSubtotal = Math.round(
    (quotationData?.packages || []).reduce(
      (sum, pkg) =>
        sum +
        (pkg.services || []).reduce(
          (s, srv) => s + Number(srv.qty || 1) * Number(srv.price || 0),
          0,
        ),
      0,
    ),
  );

  const albumSubtotal = useMemo(
    () =>
      Math.round(
        (albums || []).reduce((sum, a) => sum + computeAlbumTotal(a), 0),
      ),
    [albums],
  );

  const totalBeforeDiscount =
    packageSubtotal + albumSubtotal + additionalServiceSubtotal;
  const totalAfterDiscount = totalBeforeDiscount - (Number(discountValue) || 0);
  const gst = quotationData?.gstApplied
    ? Math.round(totalAfterDiscount * 0.18)
    : 0;
  const totalAmount = totalAfterDiscount + gst;
  const grandTotal = totalAmount;

  // --- Margin calculations (unchanged, discount not applied to margin) ---
  const packageMarginSubtotal = Math.round(
    (quotationData?.packages || []).reduce(
      (sum, pkg) =>
        sum +
        (pkg.services || []).reduce(
          (s, srv) => s + Number(srv.qty || 1) * Number(srv.marginPrice || 0),
          0,
        ),
      0,
    ),
  );
  const totalMarginBeforeDiscount = packageMarginSubtotal + albumSubtotal;
  const marginAfterDiscount = totalMarginBeforeDiscount;
  const marginGst = quotationData?.gstApplied
    ? Math.round(marginAfterDiscount * 0.18)
    : 0;
  const totalMarginFinal = marginAfterDiscount + marginGst;

  const handleDiscountSave = async () => {
    setDiscountEditMode(false);
    setDiscountValue(discountDraft);

    const nextPackages = quotationData?.packages || [];
    const totals = buildMinimalTotals(null, nextPackages, discountDraft); // ✅ pass draft

    const payload = {
      package: null,
      totalPackageAmt: totals.totalPackageAmt,
      totalAlbumAmount: totals.totalAlbumAmount,
      totalAdditionalServiceAmount: totals.totalAdditionalServiceAmount,
      discountValue: totals.discountValue, // ✅ use computed
      gstValue: totals.gstValue,
      totalAmount: totals.totalAmount,
      grandTotal: totals.totalAmount,
      totalMarginFinal: totals.totalMarginFinal,
      installments: totals.installments,
    };

    try {
      await axios.put(`${API_URL}/quotations/${id}/totals-min`, payload);
      await fetchQuotation(); // refresh
      toast.success("Discount updated");
    } catch (err) {
      toast.error("Failed to update discount");
    }
  };

  const handleDiscountCancel = () => {
    setDiscountEditMode(false);
    setDiscountDraft(discountValue);
  };

  // Compute album subtotal for any array (used when we have a "next" array)
  const computeAlbumSubtotalNow = (albumsArr) =>
    Math.round(
      (albumsArr || []).reduce((sum, a) => sum + computeAlbumTotal(a), 0),
    );

  const computeAdditionalSubtotalNow = (arr = []) =>
    Math.round((arr || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0));

  const buildMinimalTotals = (
    albumsOverride = null,
    packagesOverride = null,
    discountOverride = null,
    additionalOverride = null, // ✅ NEW
  ) => {
    const albumsArr = Array.isArray(albumsOverride) ? albumsOverride : albums;
    const packagesArr = Array.isArray(packagesOverride)
      ? packagesOverride
      : quotationData?.packages || [];

    const additionalArr = Array.isArray(additionalOverride)
      ? additionalOverride
      : quotationData?.additionalServices || [];

    const albumSubtotalNow = computeAlbumSubtotalNow(albumsArr);
    const packageSubtotalNow = computePackageSubtotalNow(packagesArr);
    const additionalSubtotalNow = computeAdditionalSubtotalNow(additionalArr);

    const totalBeforeDiscountNow = Math.round(
      packageSubtotalNow + albumSubtotalNow + additionalSubtotalNow,
    );

    const discountValueNow =
      discountOverride !== null
        ? Number(discountOverride)
        : Number(discountValue) || 0;

    const totalAfterDiscountNow = Math.max(
      0,
      Math.round(totalBeforeDiscountNow - discountValueNow),
    );

    const gstNow = quotationData?.gstApplied
      ? Math.round(totalAfterDiscountNow * 0.18)
      : 0;

    const grandTotalNow = Math.round(totalAfterDiscountNow + gstNow);

    const calculatedInstallments = (installments || []).map((inst) => {
      const newAmount = Math.round(
        (inst.paymentPercentage / 100) * grandTotalNow,
      );
      return { ...inst, paymentAmount: newAmount };
    });

    let remainingPayment = 0;
    const finalInstallments = calculatedInstallments.map((inst) => {
      const previouslyPaid = inst.paidAmount || 0;
      const newPaidAmount = Math.min(
        inst.paymentAmount,
        previouslyPaid + remainingPayment,
      );
      const pending = inst.paymentAmount - newPaidAmount;
      remainingPayment = previouslyPaid + remainingPayment - newPaidAmount;

      let status = inst.status;
      if (newPaidAmount >= inst.paymentAmount) status = "Completed";
      else if (newPaidAmount > 0) status = "Partial Paid";
      else status = "Pending";

      return {
        ...inst,
        paidAmount: newPaidAmount,
        pendingAmount: pending,
        status,
      };
    });

    if (remainingPayment > 0 && finalInstallments.length > 0) {
      const last = finalInstallments[finalInstallments.length - 1];
      last.paidAmount += remainingPayment;
      last.pendingAmount = Math.max(0, last.paymentAmount - last.paidAmount);
      last.status = "Completed";
    }

    // ✅ Margin (keep your old logic, but include additional subtotal same as albums if needed)
    const totalMarginBeforeDiscountNow = Math.round(
      packageMarginSubtotal + albumSubtotalNow + additionalSubtotalNow,
    );

    const marginDiscountNow = discountValueNow;

    const marginAfterDiscountNow = Math.max(
      0,
      totalMarginBeforeDiscountNow - discountValueNow,
    );

    const marginGstNow = quotationData?.gstApplied
      ? Math.round(marginAfterDiscountNow * 0.18)
      : 0;

    const totalMarginFinalNow = Math.round(
      marginAfterDiscountNow + marginGstNow,
    );

    return {
      totalPackageAmt: packageSubtotalNow,
      totalAlbumAmount: albumSubtotalNow,

      // ✅ NEW
      totalAdditionalServiceAmount: additionalSubtotalNow,

      discountValue: discountValueNow,
      gstValue: gstNow,
      totalAmount: grandTotalNow,
      installments: finalInstallments,
      totalMarginFinal: totalMarginFinalNow,
      marginDiscountValue: marginDiscountNow,
      marginAfterDiscountValue: marginAfterDiscountNow,
      marginGstValue: marginGstNow,
      totalMarginBeforeDiscountValue: totalMarginBeforeDiscountNow,
    };
  };

  const marginTotals = buildMinimalTotals();

  // Album update API
  const pushMinimalTotalsFrom = async (albumsOverride = null) => {
    try {
      const payload = buildMinimalTotals(albumsOverride, null, discountValue);
      await axios.put(`${API_URL}/quotations/${id}/totals-min`, payload);
      fetchQuotation();
    } catch (e) {
      console.error("Failed to update totals", e);
      toast.error("Failed to update totals on server");
    }
  };

  // Package update API
  const savePackagesAndTotals = async (nextPackages, editedPackageIndex) => {
    const totals = buildMinimalTotals(null, nextPackages, discountValue); // ✅ include discount

    const payload = {
      package:
        editedPackageIndex !== undefined
          ? nextPackages[editedPackageIndex]
          : null,
      totalPackageAmt: totals.totalPackageAmt,
      totalAlbumAmount: totals.totalAlbumAmount,
      totalAdditionalServiceAmount: totals.totalAdditionalServiceAmount,
      discountValue: totals.discountValue,
      gstValue: totals.gstValue,
      totalAmount: totals.totalAmount,
      grandTotal: totals.totalAmount,
      totalMarginFinal: totals.totalMarginFinal,
      installments: totals.installments,
    };

    console.log("payload", payload);

    const res = await axios.put(
      `${API_URL}/quotations/${id}/totals-min`,
      payload,
    );

    if (res?.data?.quotation) {
      setQuotationData(res.data.quotation);
    } else {
      await fetchQuotation();
    }
  };

  const handleAdditionalServicesAdd = async () => {
    try {
      if (!id) return;

      const additionalServiceIds = (additionalSelected || []).map(
        (x) => x.value,
      );

      // ✅ 1) update quotation additional services (new backend route)
      const res = await axios.put(
        `${API_URL}/quotations/${id}/additional-services`,
        { additionalServiceIds },
      );

      // Use server quotation if returned, else fallback
      const nextQuotation = res?.data?.quotation || null;
      const nextAdditional = nextQuotation?.additionalServices
        ? nextQuotation.additionalServices
        : (additionalSelected || []).map((x) => ({
            _id: x.value,
            name: x.raw?.name || x.label,
            price: x.price || 0,
            description: x.raw?.description || "",
          }));

      // ✅ update UI quickly
      if (nextQuotation) {
        setQuotationData(nextQuotation);
      } else {
        setQuotationData((prev) => ({
          ...prev,
          additionalServices: nextAdditional,
        }));
      }

      // ✅ 2) recalc totals and update totals-min (same style as albums)
      const totals = buildMinimalTotals(
        null,
        null,
        discountValue,
        nextAdditional,
      );

      const payload = {
        package: null,
        totalPackageAmt: totals.totalPackageAmt,
        totalAlbumAmount: totals.totalAlbumAmount,
        totalAdditionalServiceAmount: totals.totalAdditionalServiceAmount,
        discountValue: totals.discountValue,
        gstValue: totals.gstValue,
        totalAmount: totals.totalAmount,
        grandTotal: totals.totalAmount,
        totalMarginFinal: totals.totalMarginFinal,
        installments: totals.installments,
      };

      await axios.put(`${API_URL}/quotations/${id}/totals-min`, payload);

      toast.success("Additional services updated");
      setShowAdditionalModal(false);

      // ✅ final refresh for safety
      await fetchQuotation();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update additional services",
      );
    }
  };

  // Open the modal with a deep copy of the selected package
  const handleOpenPkgQty = (pkg, index) => {
    setPkgEditIndex(index);
    setPkgDraft(JSON.parse(JSON.stringify(pkg))); // deep clone
    setPkgQtyModalOpen(true);
  };

  const closePkgQtyModal = () => {
    setPkgQtyModalOpen(false);
    setPkgEditIndex(null);
    setPkgDraft(null);
  };

  // +/- buttons
  const changeDraftQty = (srvIndex, delta) => {
    setPkgDraft((p) => {
      const services = [...(p.services || [])];
      const srv = { ...services[srvIndex] };
      const current = Number(srv.qty) || 1;
      const next = Math.max(1, current + delta);
      srv.qty = next;
      services[srvIndex] = srv;
      return { ...p, services };
    });
  };

  // direct input (keeps min = 1)
  const setDraftQtyInput = (srvIndex, val) => {
    const n = Math.max(1, parseInt(String(val).replace(/\D/g, "") || "1", 10));
    setPkgDraft((p) => {
      const services = [...(p.services || [])];
      services[srvIndex] = { ...services[srvIndex], qty: n };
      return { ...p, services };
    });
  };

  // Save back to state, then persist packages + totals + installments
  const handleSavePkgQty = async () => {
    if (pkgEditIndex == null || !pkgDraft) return;

    const nextPackages = (quotationData?.packages || []).map((p, i) =>
      i === pkgEditIndex
        ? {
            ...p,
            services: (pkgDraft.services || []).map((s) => ({
              ...s,
              qty: Math.max(1, Number(s.qty) || 1), // enforce min 1
            })),
          }
        : p,
    );

    // Optimistic UI update
    setQuotationData((prev) => ({ ...prev, packages: nextPackages }));
    closePkgQtyModal();

    try {
      await savePackagesAndTotals(nextPackages, pkgEditIndex); // Pass the edited index
      toast.success("Package updated");
      fetchQuotation();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save package");
    }
  };

  const filteredPackages = quotationData?.packages?.filter((pkg) => {
    const startDate = dayjs(pkg.eventStartDate).toDate();
    const endDate = dayjs(pkg.eventEndDate).toDate();
    const afterStart = !startFilter || startDate >= startFilter;
    const beforeEnd = !endFilter || endDate <= endFilter;
    return afterStart && beforeEnd;
  });

  // Only these services have assistants
  const isCandidService = (name = "") =>
    name === "Candid Photographer" || name === "Candid Cinematographer";

  const getTotalAllocatedPercentage = (customList = installments) => {
    return customList.reduce(
      (sum, i) => sum + (Number(i.paymentPercentage) || 0),
      0,
    );
  };

  const handleEditToggle = (index) => {
    if (editIndex === index) {
      setEditIndex(null);
    } else {
      setEditIndex(index);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...installments];
    updated[index][field] = value;

    // recalculate amount if percentage changes
    if (field === "paymentPercentage") {
      const raw = value.replace(/[^0-9.]/g, "");
      if (raw === "") {
        updated[index].paymentPercentage = "";
      } else {
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          updated[index].paymentPercentage = parsed;
          updated[index].paymentAmount = Math.round(
            (totalAmount * parsed) / 100,
          );
        }
      }
    }
    setInstallments(updated);
  };

  // Helper to find collected data for a specific service unit
  const findCollectedForServiceUnit = (packageId, serviceId, unitIndex) => {
    const unitsArr = collectedDataList?.serviceUnits || [];
    return unitsArr.find(
      (s) =>
        s.packageId?.toString() === packageId?.toString() &&
        s.serviceId?.toString() === serviceId?.toString() &&
        Number(s.unitIndex) === Number(unitIndex),
    );
  };

  // Open collect/edit for a specific service unit row
  const handleOpenCollectForUnit = (pkg, service, unitIndex) => {
    const existing = findCollectedForServiceUnit(
      pkg._id,
      service._id,
      unitIndex,
    );
    setSelectedServiceUnit({
      packageId: pkg._id,
      packageName: pkg.categoryName,
      serviceId: service._id,
      serviceName: service.serviceName,
      serviceQty: Number(service.qty) || 1,
      unitIndex,
    });

    // ✅ Updated: handleOpenCollectForUnit (ONLY setCollectData part)
    setCollectData({
      // parent level (common for all units)
      personName: collectedDataList?.personName || "",
      systemNumber: collectedDataList?.systemNumber || "",
      backupSystemNumber:
        collectedDataList?.backupSystemNumber ||
        existing?.backupSystemNumber ||
        "",

      // unit level
      cameraName: existing?.cameraName || "",

      // ✅ NEW storage fields
      storageTotalCapacityGb: existing?.storageTotalCapacityGb || "",
      existingDataSizeBeforeEventGb:
        existing?.existingDataSizeBeforeEventGb || "",
      existingFilesCountBeforeEvent:
        existing?.existingFilesCountBeforeEvent ?? "",
      thisEventDataSizeGb: existing?.thisEventDataSizeGb || "",
      totalUsedAfterEventGb: existing?.totalUsedAfterEventGb || "",

      // other fields
      backupDrive: existing?.backupDrive || "",
      driveName: existing?.driveName || "",
      qualityChecked: existing?.qualityChecked || false,

      copyingPerson: existing?.copyingPerson || "",
      copiedLocation: existing?.copiedLocation || "",
      backupCopiedLocation: existing?.backupCopiedLocation || "",

      noOfPhotos: existing?.noOfPhotos ?? "",
      noOfVideos: existing?.noOfVideos ?? "",

      firstPhotoTime: existing?.firstPhotoTime || "",
      lastPhotoTime: existing?.lastPhotoTime || "",
      firstVideoTime: existing?.firstVideoTime || "",
      lastVideoTime: existing?.lastVideoTime || "",

      submissionDate: existing?.submissionDate
        ? dayjs(existing.submissionDate).format("YYYY-MM-DD")
        : "",
      notes: existing?.notes || "",

      collectionType: "both", // frontend-only
    });

    setEditMode(!!existing);
    setShowCollectDataModal(true);
  };

  const handleCollectDataChange = (e) => {
    try {
      const { name, value, type, checked } = e.target;

      setCollectData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } catch (err) {
      console.error("handleCollectDataChange error:", err);
    }
  };

  const handleCollectDataSubmit = async () => {
    try {
      const payload = {
        quotationId: id,
        quotationUniqueId: quotationData?.quotationId,

        // Event-level details
        personName: collectData.personName,
        systemNumber: collectData.systemNumber,
        backupSystemNumber: collectData.backupSystemNumber,

        // Package/service identifiers
        eventId: selectedVendor?.eventId || selectedServiceUnit?.packageId, // legacy
        eventName:
          selectedVendor?.eventName || selectedServiceUnit?.packageName, // legacy
        packageId: selectedServiceUnit?.packageId,
        packageName: selectedServiceUnit?.packageName,
        serviceId: selectedServiceUnit?.serviceId,
        serviceName: selectedServiceUnit?.serviceName,
        unitIndex: selectedServiceUnit?.unitIndex,

        // Collection details
        cameraName: collectData.cameraName,

        // ✅ NEW storage fields
        storageTotalCapacityGb: collectData.storageTotalCapacityGb,
        existingDataSizeBeforeEventGb:
          collectData.existingDataSizeBeforeEventGb,
        existingFilesCountBeforeEvent:
          collectData.existingFilesCountBeforeEvent,
        thisEventDataSizeGb: collectData.thisEventDataSizeGb,
        totalUsedAfterEventGb: collectData.totalUsedAfterEventGb,

        backupDrive: collectData.backupDrive,
        driveName: collectData.driveName,
        qualityChecked: collectData.qualityChecked,
        copyingPerson: collectData.copyingPerson,
        copiedLocation: collectData.copiedLocation,
        backupCopiedLocation: collectData.backupCopiedLocation,
        noOfPhotos: collectData.noOfPhotos,
        noOfVideos: collectData.noOfVideos,

        // Times
        firstPhotoTime: collectData.firstPhotoTime,
        lastPhotoTime: collectData.lastPhotoTime,
        firstVideoTime: collectData.firstVideoTime,
        lastVideoTime: collectData.lastVideoTime,

        // Meta
        submissionDate: collectData.submissionDate,
        notes: collectData.notes,
      };

      await axios.post(`${API_URL}/collected-data/`, payload);

      toast.success(
        editMode ? "Data updated successfully" : "Data collected successfully",
      );

      // Reset after submit
      setShowCollectDataModal(false);
      setSelectedVendor(null);
      setSelectedServiceUnit(null);
      setEditMode(false);

      setCollectData({
        personName: "",
        cameraName: "",

        // ✅ NEW storage fields
        storageTotalCapacityGb: "",
        existingDataSizeBeforeEventGb: "",
        existingFilesCountBeforeEvent: "",
        thisEventDataSizeGb: "",
        totalUsedAfterEventGb: "",

        backupDrive: "",
        driveName: "",
        qualityChecked: false,
        copyingPerson: "",
        systemNumber: "",
        backupSystemNumber: "",
        copiedLocation: "",
        backupCopiedLocation: "",
        noOfPhotos: "",
        noOfVideos: "",
        firstPhotoTime: "",
        lastPhotoTime: "",
        firstVideoTime: "",
        lastVideoTime: "",
        submissionDate: "",
        notes: "",
        collectionType: "both", // frontend-only
      });
    } catch (err) {
      console.error("handleCollectDataSubmit error:", err);
      toast.error("Failed to collect data");
    }
  };

  const handleSaveInstallment = async (index) => {
    const inst = installments[index];
    const newTotal = getTotalAllocatedPercentage();

    if (newTotal > 100) {
      toast.error("Total percentage exceeds 100%");
      return;
    }

    const payload = {
      paymentPercentage: inst.paymentPercentage,
      paymentAmount: inst.paymentAmount,
      dueDate: inst.dueDate,
      paymentMode: inst.paymentMode,
    };

    try {
      let response;

      if (inst._id) {
        // 🔁 Update existing installment
        response = await axios.put(
          `${API_URL}/quotations/${id}/installment/${inst._id}`,
          payload,
        );
      } else {
        // 🆕 Create new installment (use `new` as dummy ID)
        response = await axios.put(
          `${API_URL}/quotations/${id}/installment/new`,
          payload,
        );
      }

      // ✅ Update frontend list from latest response
      const updatedList = response.data.quotation.installments;
      setInstallments(updatedList);
      setEditIndex(null);
      toast.success("Installment saved");
    } catch (err) {
      console.error("Save error", err);
      toast.error("Save failed");
    }
  };

  const handleDeleteInstallment = async (index) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this installment?",
    );
    if (!confirm) return;

    const inst = installments[index];

    try {
      await axios.delete(`${API_URL}/quotations/${id}/installment/${inst._id}`);
      toast.success("Installment deleted successfully");

      const updated = [...installments];
      updated.splice(index, 1);
      setInstallments(updated);
    } catch (err) {
      toast.error("Failed to delete installment");
      console.error(err);
    }
  };

  const handleAddInstallment = () => {
    const total = getTotalAllocatedPercentage();
    if (total >= 100) {
      toast.error("Total percentage already 100%");
      return;
    }
    const newInstallment = {
      installmentNumber: installments.length + 1,
      paymentPercentage: 0,
      paymentAmount: 0,
      dueDate: "",
      paymentMode: "",
      status: "Pending",
    };
    setInstallments([...installments, newInstallment]);
  };

  // Flatten to one row per service unit
  const rows = (filteredPackages || []).flatMap((pkg) =>
    (pkg.services || []).flatMap((srv) => {
      const qty = Math.max(1, srv.qty || 1);

      // normalize to arrays (compat with old singular assignedVendor)
      const vendorArr = Array.isArray(srv.assignedVendors)
        ? srv.assignedVendors
        : srv.assignedVendor
          ? [srv.assignedVendor]
          : [];
      const asstArr = Array.isArray(srv.assignedAssistants)
        ? srv.assignedAssistants
        : [];

      return Array.from({ length: qty }, (_, unitIndex) => ({
        pkg,
        service: srv,
        unitIndex,
        vendor: vendorArr[unitIndex] || null,
        assistant: isCandidService(srv.serviceName)
          ? asstArr[unitIndex] || null
          : null,
      }));
    }),
  );

  // Keep your existing vendor-assign flow per package
  const handleAssignVendor = (packageId) => {
    navigate(`/vendors/vendor-assign/${id}/${packageId}`, {
      state: { returnPath: `/booking/booking-details/${id}` },
    });
  };

  // add flow
  const openAlbumModal = () => {
    setModalMode("add");
    setShowAlbumModal(true);
  };
  const closeAlbumModal = () => {
    setShowAlbumModal(false);
    setEditingAlbum(null);
  };
  const handleAlbumAdd = (item) => {
    const next = [...albums, item]; // 1) compute next list
    setAlbums(next); // 2) update UI
    setShowAlbumModal(false);

    // 3) persist minimal totals based on the NEXT list
    pushMinimalTotalsFrom(next);
  };

  const getAlbumId = (a) => a?._id || a?.id;

  const handleAlbumEdit = (albumId) => {
    const found = albums.find((a) => getAlbumId(a) === albumId);
    if (!found) return;
    setEditingAlbum(found);
    setModalMode("edit");
    setShowAlbumModal(true);
  };
  // Update
  const handleAlbumUpdate = (serverAlbum) => {
    const idToMatch = getAlbumId(serverAlbum);
    const next = albums.map((a) =>
      getAlbumId(a) === idToMatch ? serverAlbum : a,
    );

    setAlbums(next);
    toast.success("Album updated");
    setShowAlbumModal(false);
    setEditingAlbum(null);

    // persist minimal totals based on the NEXT list
    pushMinimalTotalsFrom(next);
  };

  // view flow
  const handleAlbumView = (albumId) => {
    const found = albums.find((a) => getAlbumId(a) === albumId);
    if (found) setViewAlbum(found);
  };

  // existing qty/price/remove handlers stay the same
  const handleAlbumQtyDelta = (id, delta) =>
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, qty: Math.max(1, (a.qty || 1) + delta) } : a,
      ),
    );
  const handleAlbumPriceChange = (id, val) =>
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, unitPrice: Number(val) || 0 } : a,
      ),
    );

  const handleAlbumRemove = async (albumId) => {
    // Ask first
    const album = albums.find((a) => a._id === albumId || a.id === albumId);
    const name =
      album?.snapshot?.templateLabel || album?.templateId || "this album";
    const ok = window.confirm(`Are you sure you want to remove ${name}?`);
    if (!ok) return;

    try {
      const res = await axios.delete(
        `${API_URL}/quotations/${id}/albums/${albumId}`,
      );

      // Prefer server list; fallback to local
      const next = Array.isArray(res?.data?.albums)
        ? res.data.albums
        : albums.filter((a) => a._id !== albumId && a.id !== albumId);

      setAlbums(next);
      toast.success("Album removed");

      // Persist minimal totals for the updated list
      await pushMinimalTotalsFrom(next);
    } catch (err) {
      console.error("Delete error:", err);
      const message = err.response?.data?.message || "Failed to remove album";
      toast.error(message);
    }
  };

  // --- Update handleOpenPay function ---
  const handleOpenPay = (installment) => {
    setSelectedInstallment(installment);

    setPaymentData({
      paymentDate: dayjs().format("YYYY-MM-DD"), // Always default to current date
      paymentMode: installment.paymentMode || "Online",
      amount: installment.pendingAmount || 0, // Default to pending amount
      status: installment.status || "Pending",
      maxAmount: installment.pendingAmount || 0, // Max is pending amount
    });

    setExistingHolders(
      Array.isArray(installment.accountHolders)
        ? installment.accountHolders
        : [],
    );
    setNewHolder({ name: "" });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    const name = (newHolder.name || "").trim();

    if (!name) {
      toast.error("Please enter account holder name.");
      return;
    }
    if (!paymentData.status) {
      toast.error("Please select a status.");
      return;
    }
    // if (Number(paymentData.amount) > Number(paymentData.maxAmount)) {
    //   toast.error("Amount cannot exceed installment amount.");
    //   return;
    // }
    if (Number(paymentData.amount) <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    setIsSubmitting(true);

    try {
      const dueDateDDMMYYYY = paymentData.paymentDate
        ? dayjs(paymentData.paymentDate, "YYYY-MM-DD").format("DD-MM-YYYY")
        : "";
      const payload = {
        paymentAmount: selectedInstallment.paymentAmount,
        paidAmount: paymentData.amount,
        paymentMode: paymentData.paymentMode,
        dueDate: dueDateDDMMYYYY, // ✅ FIXED
        status: paymentData.status,
        accountHolders: [{ name }],
        paidTo: newHolder.name,
      };
      const res = await axios.put(
        `${API_URL}/quotations/${id}/installment/${selectedInstallment._id}`,
        payload,
      );

      if (res.data?.success) {
        toast.success("Payment recorded successfully!");
        if (res.data.quotation?.installments) {
          setInstallments(res.data.quotation.installments);
        }
        setShowPaymentModal(false);
      } else {
        throw new Error(res.data?.message || "Payment failed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <Card className="mb-4 shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
          <h6 className="fw-bold mb-0">Customer Details</h6>
          <div className="d-flex align-items-center gap-2">
            {/* ✅ Status badge */}
            {isCancelled ? (
              <span
                className="badge"
                style={{
                  background: "#ffe5e7",
                  color: "#b02a37",
                  border: "1px solid #f5c2c7",
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontWeight: 800,
                  letterSpacing: "0.2px",
                  boxShadow: "0 2px 8px rgba(176,42,55,0.12)",
                }}
              >
                Booking Status: CANCELLED
              </span>
            ) : (
              <span
                className="badge"
                style={{
                  background: "#e7f1ff",
                  color: "#0b5ed7",
                  border: "1px solid #cfe2ff",
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontWeight: 800,
                  letterSpacing: "0.2px",
                }}
              >
                Booking Status: {quotationData?.bookingStatus || "Not Booked"}
              </span>
            )}

            {/* ✅ Mark as Cancel button (only when not cancelled) */}
            {!isCancelled && !isCompleted && (
              <Button
                variant="danger"
                size="sm"
                onClick={markAsCancelled}
                style={{ fontSize: "12px", fontWeight: 700 }}
              >
                Mark as Cancel
              </Button>
            )}
            {!isCancelled && isCompleted && !dispatchRemark &&  (
              <Button
                variant="success"
                size="sm"
                onClick={() => setShowRemark(true)}
                style={{ fontSize: "12px", fontWeight: 700 }}
              >
                Add Dispatch Remarks
              </Button>
            )}

            {/* WhatsApp Group Button */}
            {!isCancelled && !isCompleted && (
              <Button
                variant="success"
                size="sm"
                className="me-2"
                disabled={isCancelled}
                onClick={() => {
                  if (isCancelled)
                    return toast.error("Booking is Cancelled. View-only.");
                  setActionType("group");
                  setActionValue(quotationData?.whatsappGroupName || "");
                  setShowActionModal(true);
                }}
              >
                <FaWhatsapp /> Add Group
              </Button>
            )}
            {/* Note Button */}
            {!isCancelled && !isCompleted && (
              <Button
                variant="dark"
                size="sm"
                disabled={isCancelled}
                onClick={() => {
                  if (isCancelled)
                    return toast.error("Booking is Cancelled. View-only.");
                  setActionType("note");
                  setActionValue(quotationData?.quoteNote || "");
                  setShowActionModal(true);
                }}
              >
                <FaStickyNote /> Add Note
              </Button>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="px-3 py-4">Loading...</div>
        ) : (
          <div className="px-3 py-3">
            <div className="row mb-3" style={{ fontSize: "12px" }}>
              <div className="col-md-4">
                <strong>Lead ID:</strong>{" "}
                <span className="text-primary">
                  {quotationData?.leadId?.leadId}
                </span>
              </div>
              <div className="col-md-4">
                <strong>Query ID:</strong>{" "}
                <span>{quotationData?.quotationId}</span>
              </div>
              <div className="col-md-4">
                <strong>Reference:</strong>{" "}
                <span>{quotationData?.leadId?.referenceForm}</span>
              </div>
              <div className="col-md-4 ">
                <strong>Note:</strong> <span>{quotationData?.quoteNote}</span>
              </div>
              {/* ✅ Stylish WhatsApp Group Display */}
              {quotationData?.whatsappGroupName && (
                <div className="col-md-4 mt-2">
                  <strong>WhatsApp Group:</strong>{" "}
                  <span
                    className="badge d-inline-flex align-items-center px-3 py-2"
                    style={{
                      backgroundColor: "#25D366", // WhatsApp green
                      color: "white",
                      fontSize: "13px",
                      borderRadius: "20px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    <FaWhatsapp className="me-2" />
                    {quotationData.whatsappGroupName}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h6 className="fw-bold">Persons</h6>
              <div className="row g-3">
                {quotationData?.leadId?.persons?.map((person) => (
                  <div className="col-md-6" key={person._id}>
                    <div className="d-flex align-items-center px-2 py-2 bg-white rounded shadow-sm border position-relative">
                      {/* Edit Button */}
                      {!isCancelled && (
                        <Button
                          variant="none"
                          size="sm"
                          className="position-absolute"
                          style={{ top: "8px", right: "8px" }}
                          onClick={() => handleEditPerson(person)}
                        >
                          <FaEdit size={12} />
                        </Button>
                      )}
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      >
                        {person.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold">{person.name}</div>
                        <div style={{ fontSize: "13px", color: "#555" }}>
                          {person.phoneNo} | {person.email}
                        </div>
                        <span
                          className="badge bg-light text-dark"
                          style={{ fontSize: "10px" }}
                        >
                          {person.profession}
                        </span>
                        {person.instagramHandle && (
                          <div className="mt-1">
                            <FaInstagram className="text-danger me-1" />
                            <span style={{ fontSize: "12px", color: "#555" }}>
                              {person.instagramHandle}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

   {/* ✅ Dispatch Remark Display (Highlighted) */}
{dispatchRemarkLoading ? (
  <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
    Loading dispatch remarks...
  </div>
) : dispatchRemark?.dispatchText ? (
  <div className="dispatch-remark-card mt-3">
    <div className="dispatch-remark-top">
      <div className="dispatch-remark-title">
        <span className="dispatch-remark-icon">🚚</span>
        <div>
          <div className="dispatch-remark-heading">
            Dispatch Remark <span className="dispatch-remark-badge">IMPORTANT</span>
          </div>
          {/* <div className="dispatch-remark-sub">
            Please verify dispatch details before closing the booking.
          </div> */}
        </div>
      </div>

      {isCompleted && (
        <Button
          size="sm"
          variant="outline-primary"
          className="dispatch-remark-edit"
          onClick={() => setShowRemark(true)}
        >
          <FaEdit className="me-1" />
          Edit
        </Button>
      )}
    </div>

    <div className="dispatch-remark-text">{dispatchRemark.dispatchText}</div>

    {dispatchRemark?.createdAt && (
      <div className="dispatch-remark-time">
        Added on: {dayjs(dispatchRemark.createdAt).format("DD-MM-YYYY hh:mm A")}
      </div>
    )}
  </div>
) : null}

      </Card>

      {/* Person Edit Modal */}
      <Modal
        show={showPersonEditModal}
        onHide={() => setShowPersonEditModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={personFormData.name}
                    onChange={handlePersonFormChange}
                    placeholder="Enter name"
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNo"
                    value={personFormData.phoneNo}
                    onChange={handlePersonFormChange}
                    placeholder="Enter phone number"
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={personFormData.email}
                    onChange={handlePersonFormChange}
                    placeholder="Enter email"
                    // Only disable after update, not while typing
                    disabled={!!editingPerson?.email}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Profession</Form.Label>
                  <Form.Control
                    type="text"
                    name="profession"
                    value={personFormData.profession}
                    onChange={handlePersonFormChange}
                    placeholder="Enter profession"
                    // Only disable after update, not while typing
                    disabled={!!editingPerson?.profession}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    <FaInstagram className="text-danger me-1" />
                    Instagram Account
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="instagramHandle"
                    value={personFormData.instagramHandle}
                    onChange={handlePersonFormChange}
                    placeholder="Enter Instagram username"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPersonEditModal(false)}
          >
            Cancel
          </Button>
          <Button variant="dark" onClick={handleSavePersonDetails}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="my-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Assigned Vendors</strong>
        </Card.Header>

        {/* Client Instructions Inline Add */}
        <Card.Body>
          <div style={{ fontSize: "12px" }}>
            <strong>Client Instructions:</strong>
            <ul className="mt-2 ps-3">
              {quotationData?.clientInstructions?.map((item) => (
                <li
                  key={item}
                  className="d-flex justify-content-between align-items-center mb-1"
                >
                  <span>{item}</span>
                  <FaTimes
                    onClick={() => handleRemoveInstruction(item)}
                    style={{
                      cursor: "pointer",
                      fontSize: "10px",
                      color: "red",
                    }}
                  />
                </li>
              ))}
            </ul>

            {/* Add Instruction Input */}
            {!isCancelled && !isCompleted && (
              <div className="d-flex gap-2 mt-2">
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Write instruction..."
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                />
                <Button
                  variant="dark"
                  size="sm"
                  onClick={handleAddInstruction}
                  className="d-flex align-items-center"
                >
                  <FaPlus /> Add
                </Button>
              </div>
            )}
          </div>
        </Card.Body>

        {/* Vendors Table */}
        <Table
          className="vendor-table shadow-sm"
          striped
          hover
          responsive
          style={{ tableLayout: "fixed", width: "100%" }} // force equal layout
        >
          <thead>
            <tr>
              <th style={{ width: "5%" }}>#</th>
              <th style={{ width: "15%" }}>Service</th>
              <th style={{ width: "20%" }}>Event</th>
              <th style={{ width: "10%" }}>Start Date</th>
              <th style={{ width: "10%" }}>End Date</th>
              <th style={{ width: "15%" }}>Vendor</th>
              <th style={{ width: "15%" }}>Assistant</th>
              <th style={{ width: "10%", textAlign: "right" }}>Salary</th>
              {!isCancelled && !isCompleted && (
                <th style={{ width: "10%", textAlign: "right" }}>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center">
                  No rows
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={`${r.pkg._id}-${r.service._id}-${r.unitIndex}`}>
                  <td>{String(idx + 1).padStart(2, "0")}</td>

                  <td>
                    <div className="fw-semibold">
                      {r.service.serviceName}
                      <br />
                      {r.service.qty > 1 && (
                        <span className="unit-badge">
                          (unit {r.unitIndex + 1} of {r.service.qty})
                        </span>
                      )}
                    </div>
                  </td>

                  <td>{r.pkg.categoryName || "N/A"}</td>
                  <td>{dayjs(r.pkg.eventStartDate).format("DD-MM-YYYY")}</td>
                  <td>{dayjs(r.pkg.eventEndDate).format("DD-MM-YYYY")}</td>

                  {/* Vendor chip */}
                  <td>
                    {r.vendor?.vendorName ? (
                      <Chip tone="success">
                        <FaUserTie />
                        <span className="chip-text">{r.vendor.vendorName}</span>
                      </Chip>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  {/* Assistant chip */}
                  <td>
                    {isCandidService(r.service.serviceName) ? (
                      r.assistant?.assistantName ? (
                        <Chip tone="primary">
                          <FaUserAlt />
                          <span className="chip-text">
                            {r.assistant.assistantName}
                          </span>
                        </Chip>
                      ) : (
                        <span className="text-muted">—</span>
                      )
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  <td style={{ textAlign: "right" }}>
                    {r.vendor?.salary
                      ? `₹${Number(r.vendor.salary).toLocaleString()}`
                      : "—"}
                  </td>

                  {!isCancelled && !isCompleted && (
                    <td className="text-nowrap" style={{ textAlign: "right" }}>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tt-assign">
                            Assign / Change Vendor
                          </Tooltip>
                        }
                      >
                        <Button
                          variant="light"
                          size="sm"
                          className="btn-icon"
                          onClick={() => handleAssignVendor(r.pkg._id)}
                        >
                          <FaExchangeAlt style={{ fontSize: "12px" }} />
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tt-collect">
                            {findCollectedForServiceUnit(
                              r.pkg._id,
                              r.service._id,
                              r.unitIndex,
                            )
                              ? "Edit Collected data"
                              : "Collect Data"}
                          </Tooltip>
                        }
                      >
                        <Button
                          variant="light"
                          size="sm"
                          className="ms-1 btn-icon"
                          onClick={() =>
                            handleOpenCollectForUnit(
                              r.pkg,
                              r.service,
                              r.unitIndex,
                            )
                          }
                        >
                          {findCollectedForServiceUnit(
                            r.pkg._id,
                            r.service._id,
                            r.unitIndex,
                          ) ? (
                            <BsCheckCircleFill style={{ fontSize: "16px" }} />
                          ) : (
                            <BsDatabaseFillAdd style={{ fontSize: "16px" }} />
                          )}
                        </Button>
                      </OverlayTrigger>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <Modal
          show={showCollectDataModal}
          onHide={() => {
            setShowCollectDataModal(false);
            setEditMode(false);
          }}
          centered
          size="xl"
        >
          <Modal.Header closeButton style={{ padding: "14px 18px" }}>
            <Modal.Title className="fw-bold" style={{ fontSize: "16px" }}>
              {editMode ? "Edit Collected Data" : "Collect Data"} -{" "}
              {selectedServiceUnit
                ? selectedServiceUnit.serviceQty > 1
                  ? `${selectedServiceUnit.serviceName} (unit ${
                      Number(selectedServiceUnit.unitIndex) + 1
                    })`
                  : selectedServiceUnit.packageName
                : selectedVendor?.eventName || "Event"}
              <span className="text-muted" style={{ fontSize: "12px" }}>
                {" - "}
                {selectedServiceUnit?.serviceName}
              </span>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ padding: "16px 18px" }}>
            <Form style={{ fontSize: "13px" }}>
              <Row className="g-3">
                {/* Person Name */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Couples / Person Name{" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="personName"
                      value={collectData.personName}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Couples/Person Name"
                    />
                  </Form.Group>
                </Col>

                {/* Camera Name */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Camera Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="cameraName"
                      value={collectData.cameraName}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Camera Name"
                    />
                  </Form.Group>
                </Col>

                {/* Storage Total Capacity (GB) */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Storage Total Capacity (GB){" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="storageTotalCapacityGb"
                      value={collectData.storageTotalCapacityGb}
                      onChange={handleCollectDataChange}
                      placeholder="Eg: 64"
                    />
                  </Form.Group>
                </Col>

                {/* Existing Data Sized (Before Event) (GB) */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Existing Data Sized (Before Event) (GB){" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="existingDataSizeBeforeEventGb"
                      value={collectData.existingDataSizeBeforeEventGb}
                      onChange={handleCollectDataChange}
                      placeholder="Eg: 12"
                    />
                  </Form.Group>
                </Col>

                {/* Existing Files Count (Before Event) */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Existing Files/Folder Count (Before Event){" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="number"
                      name="existingFilesCountBeforeEvent"
                      value={collectData.existingFilesCountBeforeEvent}
                      onChange={handleCollectDataChange}
                      placeholder="Eg: 350"
                      min={0}
                    />
                  </Form.Group>
                </Col>

                {/* This Event Data Size (GB) (optional) */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      This Event Data Size (GB){" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="thisEventDataSizeGb"
                      value={collectData.thisEventDataSizeGb}
                      onChange={handleCollectDataChange}
                      placeholder="Eg: 18"
                    />
                  </Form.Group>
                </Col>

                {/* Total Used After Event (GB) (optional) */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Total Used After Event (GB)
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="totalUsedAfterEventGb"
                      value={collectData.totalUsedAfterEventGb}
                      onChange={handleCollectDataChange}
                      placeholder="Eg: 30"
                    />
                  </Form.Group>
                </Col>

                {/* Copying Person */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Person Copying Data <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="copyingPerson"
                      value={collectData.copyingPerson}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Name of Person Copying"
                    />
                  </Form.Group>
                </Col>

                {/* System Number */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      System Number <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="systemNumber"
                      value={collectData.systemNumber}
                      onChange={handleCollectDataChange}
                      placeholder="Enter System Number"
                    />
                  </Form.Group>
                </Col>

                {/* Copied Location */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Copied Location <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="copiedLocation"
                      value={collectData.copiedLocation}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Copied Location"
                    />
                  </Form.Group>
                </Col>

                {/* Backup System Number */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Backup System Number
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="backupSystemNumber"
                      value={collectData.backupSystemNumber}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Backup System Number"
                    />
                  </Form.Group>
                </Col>

                {/* Backup Copied Location */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Backup Copied Location
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="backupCopiedLocation"
                      value={collectData.backupCopiedLocation}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Backup Copied Location"
                    />
                  </Form.Group>
                </Col>

                {/* Backup Drive */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Backup Drive (Hard Disk / Pen Drive)
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="backupDrive"
                      value={collectData.backupDrive}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Backup Drive"
                    />
                  </Form.Group>
                </Col>

                {/* Drive Name */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>Drive Name</Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="text"
                      name="driveName"
                      value={collectData.driveName}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Drive Name"
                    />
                  </Form.Group>
                </Col>

                {/* Photos */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>No. of Photos</Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="number"
                      name="noOfPhotos"
                      value={collectData.noOfPhotos}
                      onChange={handleCollectDataChange}
                      placeholder="Enter No. of Photos"
                      min={0}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      First Photo Clip Time
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="time"
                      name="firstPhotoTime"
                      value={collectData.firstPhotoTime}
                      onChange={handleCollectDataChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Last Photo Clip Time
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="time"
                      name="lastPhotoTime"
                      value={collectData.lastPhotoTime}
                      onChange={handleCollectDataChange}
                    />
                  </Form.Group>
                </Col>

                {/* Videos */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>No. of Videos</Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="number"
                      name="noOfVideos"
                      value={collectData.noOfVideos}
                      onChange={handleCollectDataChange}
                      placeholder="Enter No. of Videos"
                      min={0}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      First Video Clip Time
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="time"
                      name="firstVideoTime"
                      value={collectData.firstVideoTime}
                      onChange={handleCollectDataChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Last Video Clip Time
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="time"
                      name="lastVideoTime"
                      value={collectData.lastVideoTime}
                      onChange={handleCollectDataChange}
                    />
                  </Form.Group>
                </Col>

                {/* Submission Date */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>
                      Submission Date
                    </Form.Label>
                    <Form.Control
                      style={cdInputStyle}
                      type="date"
                      name="submissionDate"
                      value={collectData.submissionDate}
                      onChange={handleCollectDataChange}
                    />
                  </Form.Group>
                </Col>

                {/* Notes */}
                <Col md={8}>
                  <Form.Group>
                    <Form.Label style={cdLabelStyle}>Notes</Form.Label>
                    <Form.Control
                      style={cdNoteInputStyle}
                      type="text"
                      name="notes"
                      value={collectData.notes}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Notes"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Quality Checkbox */}
              <div className="d-flex mt-3 gap-2 align-items-center">
                <Form.Check
                  type="checkbox"
                  label={
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>
                      Quality Checked
                    </span>
                  }
                  name="qualityChecked"
                  checked={collectData.qualityChecked || false}
                  onChange={handleCollectDataChange}
                />
                <span className="text-danger">*</span>
              </div>
            </Form>
          </Modal.Body>

          <Modal.Footer
            style={{ padding: "12px 18px" }}
            className="justify-content-center gap-2"
          >
            <Button
              variant="outline-secondary"
              onClick={() => {
                setShowCollectDataModal(false);
                setEditMode(false);
              }}
              style={{ fontSize: "13px", padding: "8px 16px" }}
            >
              Cancel
            </Button>

            <Button
              variant="dark"
              onClick={() => handleCollectDataSubmit(collectData)}
              style={{ fontSize: "13px", padding: "8px 16px", fontWeight: 700 }}
            >
              {editMode ? "Update" : "Submit"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>

      {/* Package Details */}
      {!isLoading && quotationData?.packages?.length > 0 && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center my-2">
            <h5 className="fw-bold mb-3">PACKAGE DETAILS</h5>
          </div>
          {quotationData.packages.map((pkg, index) => {
            const packageTotal = pkg.services.reduce(
              (sum, srv) => sum + srv.qty * srv.price,
              0,
            );
            // Find if collected data exists for this package/event
            const collectedEvent = collectedDataList?.events?.find(
              (ev) =>
                ev.eventId === pkg._id || ev.eventId === pkg._id?.toString(),
            );

            return (
              <Card className="mb-4 border" key={pkg._id}>
                <Card.Header
                  className="bg-light py-2 px-3 d-flex justify-content-between align-items-center"
                  style={{ fontSize: "13px" }}
                >
                  <div>
                    <h6 className="fw-bold mb-1">{pkg.categoryName}</h6>
                    <small className="text-muted d-block">
                      {dayjs(pkg.eventStartDate).format("DD-MM-YYYY")} -{" "}
                      {dayjs(pkg.eventEndDate).format("DD-MM-YYYY")}, {pkg.slot}
                    </small>
                    <div className="mt-1">
                      <small className="d-block">
                        <strong>Venue:</strong> {pkg.venueName}
                      </small>
                      <small className="d-block">
                        <strong>Address:</strong> {pkg.venueAddress}
                      </small>
                    </div>
                  </div>
                  {!isCancelled && !isCompleted && (
                    <div className="d-flex gap-3">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handleOpenPkgQty(pkg, index)}
                      >
                        Edit Package
                      </Button>
                    </div>
                  )}
                </Card.Header>
                <Card.Body className="p-0">
                  <Table bordered responsive className="mb-0">
                    <thead className="table-light" style={{ fontSize: "12px" }}>
                      <tr>
                        <th style={{ width: "5%" }}>No</th>
                        <th style={{ width: "45%" }}>Service</th>
                        <th className="text-center" style={{ width: "10%" }}>
                          Qty
                        </th>
                        <th className="text-center" style={{ width: "20%" }}>
                          Unit Price
                        </th>
                        <th className="text-end" style={{ width: "20%" }}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: "12px" }}>
                      {pkg.services.map((srv, idx) => (
                        <tr key={srv._id}>
                          <td className="text-center">{idx + 1}</td>
                          <td>{srv.serviceName}</td>
                          <td className="text-center">{srv.qty}</td>
                          <td className="text-center">
                            ₹{srv.price.toLocaleString()}
                          </td>
                          <td className="text-end">
                            ₹{(srv.qty * srv.price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="fw-bold">
                        <td colSpan="4" className="text-end">
                          Package Total:
                        </td>
                        <td className="text-end">
                          ₹{packageTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            );
          })}

          {!isCancelled && !isCompleted && (
            <div className="d-flex justify-content-end align-items-center">
              <Button
                size="sm"
                variant="dark"
                onClick={openAlbumModal}
                disabled={isCancelled}
              >
                + Add Album
              </Button>
            </div>
          )}
          <AlbumsTable
            isCancelled={isCancelled}
            isCompleted={isCompleted}
            albums={albums}
            onQtyDelta={handleAlbumQtyDelta}
            onPriceChange={handleAlbumPriceChange}
            onRemove={handleAlbumRemove}
            onView={handleAlbumView}
            onEdit={handleAlbumEdit}
          />

          <AddAlbumModal
            show={showAlbumModal}
            onClose={closeAlbumModal}
            onAdd={handleAlbumAdd}
            onUpdate={handleAlbumUpdate}
            mode={modalMode}
            initialData={editingAlbum}
            albumType="addons"
            fetchQuotation={fetchQuotation}
          />

          <AlbumDetailsModal
            show={!!viewAlbum}
            onClose={() => setViewAlbum(null)}
            album={viewAlbum}
          />
          {!isCancelled && !isCompleted && (
            <div className="d-flex justify-content-end align-items-center">
              <Button
                size="sm"
                variant="dark"
                className="mt-2"
                onClick={openAdditionalModal}
                disabled={isCancelled}
              >
                + Add Additional Services
              </Button>
            </div>
          )}
          <AdditionalServicesTable
            isCancelled={isCancelled}
            isCompleted={isCompleted}
            items={quotationData?.additionalServices || []}
            onRemove={handleRemoveAdditionalService}
          />

          <AddAdditionalServicesModal
            show={showAdditionalModal}
            onClose={() => setShowAdditionalModal(false)}
            loading={additionalLoading}
            options={additionalOptions}
            value={additionalSelected}
            onChange={setAdditionalSelected}
            onSubmit={handleAdditionalServicesAdd}
          />

          <div className="p-3 border rounded bg-light mt-4">
            <div className="d-flex justify-content-between mb-2">
              <strong>Total Package Amount:</strong>
              <span>₹{packageSubtotal.toLocaleString()}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <strong>Album Total:</strong>
              <span>₹{albumSubtotal.toLocaleString()} </span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <strong>Additional Services:</strong>
              <span>₹{additionalServiceSubtotal.toLocaleString()}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <strong>Total Before Discount:</strong>
              <span>₹{totalBeforeDiscount.toLocaleString()} </span>
            </div>
            <div className="d-flex justify-content-between mb-2 align-items-center">
              <strong>Discount:</strong>
              {discountEditMode ? (
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    style={{ width: 120, textAlign: "right", fontWeight: 600 }}
                    value={discountDraft}
                    onChange={handleDiscountDraftChange}
                    disabled={isCancelled} // ✅ extra safety
                  />
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleDiscountSave}
                    disabled={isCancelled} // ✅ extra safety
                  >
                    <FaSave />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDiscountCancel}
                  >
                    <FaTimes />
                  </Button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontWeight: 600 }}>
                    - ₹{Number(discountValue).toLocaleString()}
                  </span>

                  {/* ✅ Show edit button ONLY when booking is NOT cancelled */}
                  {!isCancelled && !isCompleted && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleDiscountEditClick}
                      style={{ padding: "2px 6px" }}
                    >
                      <FaEdit />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between mb-2">
              <strong>Sub Total:</strong>
              <span>₹{totalAfterDiscount.toLocaleString()} </span>
            </div>

            {quotationData?.gstApplied && (
              <div className="d-flex justify-content-between mb-2">
                <strong>GST 18%:</strong>
                <span>₹{gst.toLocaleString()}</span>
              </div>
            )}

            <hr />

            <div className="d-flex justify-content-between text-success fw-bold">
              <h6 className="mb-0">Grand Total:</h6>
              <h6 className="mb-0">₹{Number(grandTotal).toLocaleString()}</h6>
            </div>

            <hr />
            {quotationData?.quoteNote && (
              <div className="mt-2 fw-bold fs-6 bg-warning p-2 rounded bg-opacity-25">
                Note : <span>{quotationData?.quoteNote || "N/A"}</span>
              </div>
            )}
            <hr />
            {packageSubtotal > 0 && (
              <div>
                <div className="d-flex justify-content-between text-primary">
                  <strong>Margin amount:</strong>
                  <span>
                    ₹
                    {marginTotals.totalMarginBeforeDiscountValue?.toLocaleString() ||
                      "0"}
                  </span>
                </div>
                <div className="d-flex justify-content-between text-primary">
                  <strong>Margin Discount:</strong>
                  <span>
                    ₹{marginTotals.marginDiscountValue?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="d-flex justify-content-between text-primary">
                  <strong>Margin after Discount:</strong>
                  <span>
                    ₹
                    {marginTotals.marginAfterDiscountValue?.toLocaleString() ||
                      "0"}
                  </span>
                </div>
                {quotationData?.gstApplied && (
                  <div className="d-flex justify-content-between text-primary">
                    <strong>GST on Margin (18%):</strong>
                    <span>
                      ₹{marginTotals.marginGstValue?.toLocaleString() || "0"}
                    </span>
                  </div>
                )}
                <div className="d-flex justify-content-between text-success">
                  <strong>Final Margin Total:</strong>
                  <span>
                    ₹{marginTotals.totalMarginFinal?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Installments */}
      {installments.length > 0 && (
        <Card className="mb-4 shadow-sm border-0">
          <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
            <h6 className="fw-bold mb-0">Installment Details</h6>
            {!isCancelled && !isCompleted && (
              <Button
                variant="outline-dark"
                size="sm"
                onClick={handleAddInstallment}
                disabled={getTotalAllocatedPercentage() >= 100}
              >
                <FaPlus className="me-2" /> Add Installment
              </Button>
            )}
          </div>
          <div className="table-responsive">
            <Table
              className="mb-0"
              bordered
              hover
              size="sm"
              style={{ fontSize: "12px" }}
            >
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
                  {!isCancelled && !isCompleted && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {installments.map((inst, index) => {
                  return (
                    <tr key={index}>
                      <td>Installment {index + 1}</td>

                      <td>
                        {editIndex === index && inst.status !== "Completed" ? (
                          <Form.Control
                            type="number"
                            min="0"
                            max="100"
                            value={inst.paymentPercentage}
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                "paymentPercentage",
                                e.target.value,
                              )
                            }
                            style={{ fontSize: "13px", width: "80px" }}
                          />
                        ) : (
                          `${inst.paymentPercentage}%`
                        )}
                      </td>
                      <td>₹{inst.paymentAmount?.toLocaleString()} </td>
                      <td>₹{inst.paidAmount?.toLocaleString()} </td>

                      <td>₹{inst.pendingAmount?.toLocaleString()} </td>

                      <td>{inst.dueDate}</td>
                      <td>{inst.paymentMode || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            inst.status === "Completed"
                              ? "bg-success"
                              : inst.status === "Partial Paid"
                                ? "bg-primary" // Custom class defined in your CSS
                                : "bg-danger"
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                      <td>
                        {inst.accountHolders && inst.accountHolders.length > 0
                          ? inst.accountHolders.map((h, i) => (
                              <div key={i}>{h.name}</div>
                            ))
                          : "-"}
                      </td>

                      {!isCancelled && !isCompleted && (
                        <td>
                          {/* Edit and Save/Cancel buttons - only shown for Pending status */}
                          {inst.status === "Pending" &&
                            (editIndex === index ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleSaveInstallment(index)}
                                >
                                  <FaSave />
                                </Button>{" "}
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setEditIndex(null)}
                                >
                                  <FaTimes />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant=""
                                onClick={() => handleEditToggle(index)}
                              >
                                <FaEdit />
                              </Button>
                            ))}

                          {/* Delete button - only shown for Pending status */}
                          {inst.status === "Pending" && (
                            <Button
                              variant=""
                              size="sm"
                              onClick={() => handleDeleteInstallment(index)}
                              className="ms-1"
                            >
                              <img
                                src={deleteIcon}
                                alt="delete"
                                width="14"
                                height="14"
                              />
                            </Button>
                          )}

                          {/* Pay button - shown for Pending or Partial Paid status when there's pending amount */}
                          {(inst.status === "Pending" ||
                            inst.status === "Partial Paid") &&
                            inst.pendingAmount > 0 && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleOpenPay(inst)}
                                className="ms-1"
                              >
                                Pay
                              </Button>
                            )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <div className="text-end px-3 py-2">
              <strong>Total Allocated: </strong>
              {getTotalAllocatedPercentage()}%
            </div>
          </div>
        </Card>
      )}

      {/* Add note/whatsapp group modal */}
      <Modal
        show={showActionModal}
        onHide={() => setShowActionModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === "group" ? "Add WhatsApp Group" : "Add Note"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>
                {actionType === "group" ? "WhatsApp Group Name" : "Note"}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={
                  actionType === "group"
                    ? "Enter WhatsApp group name"
                    : "Enter note"
                }
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActionModal(false)}>
            Cancel
          </Button>
          <Button
            variant="dark"
            onClick={async () => {
              try {
                // ✅ Build payload dynamically
                const payload =
                  actionType === "group"
                    ? { whatsappGroupName: actionValue }
                    : { note: actionValue };

                if (!actionValue.trim()) {
                  toast.error("Please enter a value before saving");
                  return;
                }

                // ✅ Call unified API
                const res = await axios.put(
                  `${API_URL}/quotations/${id}/group-note`,
                  payload,
                );

                fetchQuotation();
                toast.success(
                  `${
                    actionType === "group" ? "Group name" : "Note"
                  } saved successfully!`,
                );
                setShowActionModal(false);
                setActionValue(""); // reset field
              } catch (err) {
                console.error("Save group/note error:", err);
                toast.error("Failed to save");
              }
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ padding: "14px 18px" }}>
          <Modal.Title
            style={{
              fontSize: "16px",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "0.2px",
            }}
          >
            Record Payment
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "16px 18px" }}>
          <Form style={{ fontSize: "13px" }}>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label style={{ fontSize: "12px", fontWeight: 600 }}>
                    Payment Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentDate: e.target.value,
                      })
                    }
                    style={{ fontSize: "13px", height: "38px" }}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label style={{ fontSize: "12px", fontWeight: 600 }}>
                    Payment Mode
                  </Form.Label>
                  <Form.Select
                    value={paymentData.paymentMode}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentMode: e.target.value,
                      })
                    }
                    style={{ fontSize: "13px", height: "38px" }}
                  >
                    {paymentModes.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label style={{ fontSize: "12px", fontWeight: 600 }}>
                    Pending Amount to Pay
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={selectedInstallment?.pendingAmount || 1}
                    value={paymentData.amount}
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      const max = selectedInstallment?.pendingAmount || 1;
                      if (val > max) val = max;
                      if (val < 1) val = 1;
                      setPaymentData({ ...paymentData, amount: val });
                    }}
                    style={{
                      fontSize: "14px",
                      height: "38px",
                      fontWeight: 700,
                    }}
                  />
                  <div
                    style={{ fontSize: "11px", color: "#6c757d", marginTop: 4 }}
                  >
                    Max: ₹{selectedInstallment?.pendingAmount?.toLocaleString()}
                  </div>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label style={{ fontSize: "12px", fontWeight: 600 }}>
                    Status
                  </Form.Label>
                  <Form.Select
                    value={paymentData.status}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        status: e.target.value,
                      })
                    }
                    style={{ fontSize: "13px", height: "38px" }}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Existing account holders */}
              {existingHolders.length > 0 && (
                <div className="col-12">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: 600 }}>
                      Already Recorded Account Holders
                    </Form.Label>
                    <div
                      className=" rounded"
                      style={{
                        // padding: "10px",
                        fontSize: "13px",
                        background: "#fafafa",
                        maxHeight: 90,
                        overflow: "auto",
                      }}
                    >
                      {existingHolders.map((h, idx) => (
                        <div key={idx} style={{ padding: "2px 0" }}>
                          • {h.name}
                        </div>
                      ))}
                    </div>
                  </Form.Group>
                </div>
              )}

              {/* New account holder */}
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ fontSize: "12px", fontWeight: 600 }}>
                    Add Account Holder
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter account holder name"
                    value={newHolder.name}
                    onChange={(e) => setNewHolder({ name: e.target.value })}
                    style={{ fontSize: "13px", height: "38px" }}
                  />
                </Form.Group>
              </div>
            </div>

            {/* ✅ Summary Card */}
            <div
              className="border rounded mt-4"
              style={{
                padding: "12px",
                background: "#fff",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "#343a40",
                }}
              >
                Payment Summary
              </div>

              <div className="d-flex justify-content-between align-items-center py-1">
                <div style={{ fontSize: "12px", color: "#6c757d" }}>
                  Total Installment Amount
                </div>
                <div style={{ fontSize: "13px", fontWeight: 800 }}>
                  ₹{selectedInstallment?.paymentAmount?.toLocaleString()}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center py-1">
                <div style={{ fontSize: "12px", color: "#6c757d" }}>
                  Pending Amount
                </div>
                <span
                  className="badge bg-warning text-dark"
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                >
                  ₹{selectedInstallment?.pendingAmount?.toLocaleString()}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-1">
                <div style={{ fontSize: "12px", color: "#6c757d" }}>
                  Paid Amount
                </div>
                <span
                  className="badge bg-success"
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                >
                  ₹{selectedInstallment?.paidAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer
          style={{
            padding: "12px 18px",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Button
            variant="outline-secondary"
            onClick={() => setShowPaymentModal(false)}
            style={{ fontSize: "13px", padding: "8px 16px" }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handlePaymentSubmit}
            disabled={isSubmitting || paymentData.status === "Pending"}
            style={{ fontSize: "13px", padding: "8px 16px", fontWeight: 700 }}
          >
            {isSubmitting ? "Processing..." : "Submit Payment"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={pkgQtyModalOpen} onHide={closePkgQtyModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service Quantities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pkgDraft ? (
            <Table bordered size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "55%" }}>Service</th>
                  <th className="text-center" style={{ width: "20%" }}>
                    Qty
                  </th>
                  <th className="text-end" style={{ width: "25%" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {(pkgDraft.services || []).map((srv, idx) => {
                  const qty = Math.max(1, Number(srv.qty) || 1);
                  const price = Number(srv.price) || 0;
                  const line = qty * price;
                  return (
                    <tr key={srv._id || idx}>
                      <td>{srv.serviceName}</td>
                      <td className="text-center">
                        <div className="d-inline-flex align-items-center gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => changeDraftQty(idx, -1)}
                          >
                            -
                          </Button>
                          <Form.Control
                            size="sm"
                            style={{ width: 70, textAlign: "center" }}
                            value={qty}
                            onChange={(e) =>
                              setDraftQtyInput(idx, e.target.value)
                            }
                          />
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => changeDraftQty(idx, +1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="text-end">₹{line.toLocaleString()}</td>
                    </tr>
                  );
                })}
                <tr className="fw-bold">
                  <td colSpan={2} className="text-end">
                    Package Total
                  </td>
                  <td className="text-end">
                    ₹{pkgDraftTotal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </Table>
          ) : (
            <div className="text-muted">No services</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePkgQtyModal}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleSavePkgQty}>
            Save Package
          </Button>
        </Modal.Footer>
      </Modal>

      <DispatchRemarkModal
        show={showRemark}
        onHide={() => setShowRemark(false)}
        quotationMongoId={quotationData?._id} // ✅ booking _id
        quotationUniqueId={quotationData?.quotationId} // ✅ "QN0023"
        existingRemark={dispatchRemark} // ✅ important for edit
        onSuccess={(savedDoc) => {
          setDispatchRemark(savedDoc); // instant UI update
          fetchDispatchRemark(); // optional refresh
        }}
      />
    </div>
  );
};

export default BookingdetailsPage;
