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
  { value: "Pending", label: "Pending" },
  { value: "Partial Paid", label: "Partial Paid" },
  { value: "Completed", label: "Completed" },
];

const fmtMoney = (n) =>
  n === 0 || typeof n === "number"
    ? `₹${Number(n).toLocaleString()}`
    : n
    ? `₹${Number(n).toLocaleString()}`
    : "-";

const PaymentDetials = () => {
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

  // ---- Fetch quotation (matches your API sample) ----
  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/quotations/${quotationId}`);
      if (data?.success && data?.quotation) {
        setQuotation(data.quotation);
        setInstallments(Array.isArray(data.quotation.installments) ? data.quotation.installments : []);
        setCustomerId(data.quotation.leadId?._id?.toString() || null);
        setError("");
      } else {
        setError(data?.message || "Quotation not found.");
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

  const handlePaymentClick = (inst) => {
    setSelectedInstallment(inst);
    setPaymentData({
      paymentDate: inst.dueDate
        ? dayjs(inst.dueDate, ["DD-MM-YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      paymentMode: inst.paymentMode || "Online",
      amount: inst.paymentAmount || 0,
      status: inst.status || "Partial Paid",
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedInstallment) return;
    setIsSubmitting(true);
    try {
      const payload = {
        dueDate: dayjs(paymentData.paymentDate, "YYYY-MM-DD").format("DD-MM-YYYY"),
        paymentMode: paymentData.paymentMode,
        paymentAmount: paymentData.amount,
        status: paymentData.status,
      };

      const url = `${API_URL}/quotations/${quotationId}/installment/${selectedInstallment._id}`;
      const res = await axios.put(url, payload);

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

  const handleGenerateInvoice = async () => {
    const firstCompleted = installments.find((inst) => inst.status === "Completed");
    if (!firstCompleted) return;
    setGeneratingInvoice(true);
    try {
      const res = await axios.post(
        `${API_URL}/quotations/${quotation?._id}/generate-invoice`
      );
      if (res.data?.success) {
        toast.success("Invoice generated!");
        navigate(`/invoice/${quotation._id}`, {
          state: { quotationId, customerId, installment: firstCompleted },
        });
      } else {
        toast.error(res.data?.message || "Failed to generate invoice.");
      }
    } catch {
      toast.error("Failed to generate invoice.");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Totals (optional but handy)
  const totals = installments.reduce(
    (acc, i) => {
      acc.amount += Number(i.paymentAmount || 0);
      acc.paid += Number(i.paidAmount || 0);
      acc.pending += Number(i.pendingAmount || 0);
      return acc;
    },
    { amount: 0, paid: 0, pending: 0 }
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <Alert variant="warning">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate("/payments")}>
            Go Back to Payments
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
      <Card className="border-0 p-3 my-3 mb-5">
        {installments.some((inst) => inst.status === "Completed") && (
          <div className="mb-3 d-flex justify-content-end">
            <Button variant="dark" disabled={generatingInvoice} onClick={handleGenerateInvoice}>
              {generatingInvoice ? "Generating..." : "Generate Invoice"}
            </Button>
          </div>
        )}

        <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top" style={{ backgroundColor: "#333a40" }}>
              <tr style={{ fontSize: "14px" }}>
                <th>Installment</th>
                <th>Percentage</th>
                <th>Amount</th>
                <th>Paid Amt</th>
                <th>Pending Amt</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Status</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>

            <tbody style={{ fontSize: "12px", textAlign: "center" }} className="fw-semibold">
              {installments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No installments found for this quotation
                  </td>
                </tr>
              ) : (
                <>
                  {installments.map((inst, index) => (
                    <tr key={inst._id || inst.id || index}>
                      <td>{`Installment ${inst.installmentNumber ?? index + 1}`}</td>
                      <td>
                        {inst.paymentPercentage !== undefined && inst.paymentPercentage !== null
                          ? `${inst.paymentPercentage}%`
                          : "-"}
                      </td>
                      <td>{fmtMoney(inst.paymentAmount)}</td>
                      <td>{fmtMoney(inst.paidAmount)}</td>
                      <td>{fmtMoney(inst.pendingAmount)}</td>
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
                      {/* <td>
                        <Button variant="outline-primary" size="sm" onClick={() => handlePaymentClick(inst)}>
                          Pay
                        </Button>
                      </td> */}
                    </tr>
                  ))}

                  {/* Totals row */}
                  <tr className="table-light fw-bold">
                    <td colSpan={2} className="text-end">
                      Totals:
                    </td>
                    <td>{fmtMoney(totals.amount)}</td>
                    <td>{fmtMoney(totals.paid)}</td>
                    <td>{fmtMoney(totals.pending)}</td>
                    <td colSpan={4}></td>
                  </tr>
                </>
              )}
            </tbody>
          </Table>
        </div>

        {/* Payment Modal */}
        <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Record Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Payment Date</Form.Label>
                <Form.Control
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Mode</Form.Label>
                <Form.Select
                  value={paymentData.paymentMode}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                >
                  {paymentModes
                    .filter((mode) => mode.value !== "")
                    .map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control type="number" value={paymentData.amount} readOnly plaintext />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={paymentData.status}
                  onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePaymentSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Submit Payment"}
            </Button>
          </Modal.Footer>
        </Modal>

        {quotation && (
          <div className="mb-3 d-flex justify-content-end">
            <span className="fw-bold" style={{ fontSize: "16px" }}>
              Total Amount:&nbsp;
              <span className="text-success">{fmtMoney(quotation.totalAmount)}</span>
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentDetials;
