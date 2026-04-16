import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal, Card, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { API_URL } from "../../utils/api";

const paymentModes = [
  { value: "", label: "-" },
  { value: "Online", label: "Online" },
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "Other", label: "Other" },
];

const statusOptions = [
  // { value: "", label: "Select Status" },
  { value: "Pending", label: "Pending" },
  { value: "Partial Paid", label: "Partial Paid" },
  { value: "Completed", label: "Completed" },
];

const InstallmentDetails = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "Online",
    amount: 0,
    status: "Partial Paid",
  });
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [existingHolders, setExistingHolders] = useState([]);
  const [newHolder, setNewHolder] = useState({ name: "" }); // ✅ only name

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quotations/${quotationId}`);
      const data = await res.json();
      if (data?.success) {
        setQuotation(data.quotation);
        setCustomerId(data.quotation.leadId?._id?.toString() || null);
        setError("");
        setInstallments(data.quotation.installments || []);
      } else {
        setError("Quotation not found.");
      }
    } catch (err) {
      setError("Failed to load quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  // ...inside handlePaymentClick...
  const handlePaymentClick = (installment) => {
    setSelectedInstallment(installment);

    setPaymentData({
      paymentDate: installment.dueDate
        ? dayjs(installment.dueDate, ["DD-MM-YYYY", "YYYY-MM-DD"]).format(
            "YYYY-MM-DD",
          )
        : dayjs().format("YYYY-MM-DD"),
      paymentMode: installment.paymentMode || "Online",
      amount: installment.paymentAmount || 0, // <-- set to installment amount by default
      status: installment.status || "",
      maxAmount: installment.paymentAmount || 0,
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
    if (Number(paymentData.amount) > Number(paymentData.maxAmount)) {
      toast.error("Amount cannot exceed installment amount.");
      return;
    }
    if (Number(paymentData.amount) <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        dueDate: dayjs(paymentData.paymentDate, "YYYY-MM-DD").format(
          "DD-MM-YYYY",
        ),
        paymentMode: paymentData.paymentMode,
        paymentAmount: paymentData.amount,
        status: paymentData.status,
        accountHolders: [{ name }],
        paidTo: newHolder.name,
      };

      const res = await axios.put(
        `${API_URL}/quotations/${quotationId}/installments/${selectedInstallment._id}/first-payment`,
        payload,
      );

      if (res.data?.success) {
        toast.success("Payment recorded successfully!");
        setShowPaymentModal(false);
        fetchQuotation();
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
    <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
      <Card className="border-0 p-3 my-3 mb-5">
        <div
          className="table-responsive bg-white"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
        >
          <Table className="table table-hover align-middle">
            <thead
              className="text-white text-center sticky-top"
              style={{ backgroundColor: "#333a40" }}
            >
              <tr style={{ fontSize: "14px" }}>
                <th>Sl.No</th>
                <th>Installment</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Account holders</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody
              style={{ fontSize: "12px", textAlign: "center" }}
              className="fw-semibold"
            >
              {installments.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center">
                    No installments found
                  </td>
                </tr>
              ) : (
                installments.map((inst, index) => (
                  <tr key={inst._id || index}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{`Installment ${
                      inst.installmentNumber || index + 1
                    }`}</td>
                    <td>₹{inst.paymentAmount?.toLocaleString() || "-"}</td>
                    <td>₹{inst.paidAmount?.toLocaleString() || "0"}</td>
                    <td>₹{inst.pendingAmount?.toLocaleString() || "0"}</td>
                    <td>{inst.dueDate || "-"}</td>
                    <td>{inst.paymentMode || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          inst.status === "Completed"
                            ? "bg-success"
                            : inst.status === "Partial Paid"
                              ? "bg-warning"
                              : "bg-secondary"
                        }`}
                      >
                        {inst.status || "Pending"}
                      </span>
                    </td>

                    {/* ✅ Only show account holder names */}
                    <td>
                      {inst.accountHolders?.length > 0
                        ? inst.accountHolders.map((h, i) => (
                            <div key={i}>{h.name}</div>
                          ))
                        : "-"}
                    </td>

                    {inst.status !== "Completed" && (
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handlePaymentClick(inst)}
                        >
                          Pay
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Payment Modal */}
        <Modal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Record Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={paymentData.paymentDate}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          paymentDate: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Mode</Form.Label>
                    <Form.Select
                      value={paymentData.paymentMode}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          paymentMode: e.target.value,
                        })
                      }
                    >
                      {paymentModes
                        .filter((mode) => mode.value)
                        .map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Installment Amount</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={selectedInstallment?.paymentAmount || 1}
                      value={paymentData.amount}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        const max = selectedInstallment?.paymentAmount || 1;
                        if (val > max) val = max;
                        if (val < 1) val = 1;
                        setPaymentData({ ...paymentData, amount: val });
                      }}
                      className="fw-bold"
                    />
                    <Form.Text muted>
                      Max: ₹
                      {selectedInstallment?.paymentAmount?.toLocaleString()}
                    </Form.Text>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={paymentData.status}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          status: e.target.value,
                        })
                      }
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              {/* Existing account holders list (read-only) */}
              {existingHolders.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Already Recorded Account Holders</Form.Label>
                  <div className="border rounded p-2">
                    {existingHolders.map((h, idx) => (
                      <div key={idx}>{h.name}</div>
                    ))}
                  </div>
                </Form.Group>
              )}

              {/* New account holder (only name, no amount) */}
              <Form.Group className="mb-3">
                <Form.Label>Add Account Holder</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter account holder name"
                  value={newHolder.name}
                  onChange={(e) => setNewHolder({ name: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePaymentSubmit}
              disabled={isSubmitting || paymentData.status === "Pending"}
            >
              {isSubmitting ? "Processing..." : "Submit Payment"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </div>
  );
};

export default InstallmentDetails;
