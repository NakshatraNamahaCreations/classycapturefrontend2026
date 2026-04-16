import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { API_URL } from "../../utils/api";

const DispatchRemarkModal = ({
  show,
  onHide,
  quotationMongoId,     // booking mongo _id
  quotationUniqueId,    // QN0023
  existingRemark,       // existing remark doc (if any)
  onSuccess,
}) => {
  const [dispatchText, setDispatchText] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Prefill on open (edit mode)
  useEffect(() => {
    try {
      if (!show) return;
      setErr("");
      setSaving(false);
      setDispatchText(existingRemark?.dispatchText || "");
    } catch (e) {
      console.error(e);
    }
  }, [show, existingRemark]);

  const handleSave = async () => {
    try {
      setErr("");
      const clean = dispatchText.trim();

      if (!clean) return setErr("Please enter dispatch remarks.");
      if (!quotationMongoId) return setErr("quotationId (booking _id) missing.");
      if (!quotationUniqueId) return setErr("quotationUniqueId missing.");

      setSaving(true);

      // ✅ CREATE payload (exact 3 fields as you said)
      const createPayload = {
        quotationId: quotationMongoId,
        quotationUniqueId: quotationUniqueId,
        dispatchText: clean,
      };

      let res;

      // ✅ UPDATE if existingRemark present
      if (existingRemark?._id) {
        // If your backend supports PUT by remarkId:
        res = await axios.put(
          `${API_URL}/dispatch-remarks/${existingRemark._id}`,
          { dispatchText: clean } // minimal update payload
        );
      } else {
        // ✅ else create new
        res = await axios.post(`${API_URL}/dispatch-remarks`, createPayload);
      }

      const saved =
        res?.data?.data || res?.data?.remark || res?.data?.doc || res?.data;

      toast.success(existingRemark?._id ? "Dispatch remark updated" : "Dispatch remark added");

      onSuccess?.(saved);
      onHide?.();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Failed to save remark");
      toast.error(e?.response?.data?.message || "Failed to save remark");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 16, fontWeight: 800 }}>
          {existingRemark?._id ? "Edit Dispatch Remark" : "Add Dispatch Remark"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err ? <Alert variant="danger" className="py-2">{err}</Alert> : null}

        <Form.Group>
          <Form.Label style={{ fontSize: 12, fontWeight: 700 }}>
            Dispatch Remark
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={dispatchText}
            onChange={(e) => setDispatchText(e.target.value)}
            placeholder="Enter dispatch remark..."
            style={{ fontSize: 13 }}
          />
        </Form.Group>

        {existingRemark?.createdAt && (
          <div className="text-muted mt-2" style={{ fontSize: 11 }}>
            Added on: {dayjs(existingRemark.createdAt).format("DD-MM-YYYY hh:mm A")}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button variant="dark" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DispatchRemarkModal;
