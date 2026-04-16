import React, { useMemo } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Select from "react-select";

const AddAdditionalServicesModal = ({
  show,
  onClose,
  loading = false,
  options = [],
  value = [],
  onChange,
  onSubmit,
}) => {
  const selectedTotal = useMemo(() => {
    return Math.round(
      (value || []).reduce((s, x) => s + (Number(x.price) || 0), 0),
    );
  }, [value]);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton style={{ padding: "14px 18px" }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          Add Additional Services
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 10 }}>
          Select one or more additional services and click Add to update quotation
          totals and installments.
        </div>

        <Form.Group>
          <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>
            Additional Services
          </Form.Label>

          <Select
            isMulti
            isLoading={loading}
            options={options}
            value={value}
            onChange={(val) => onChange(val || [])}
            placeholder={loading ? "Loading..." : "Select services"}
          />
        </Form.Group>

        <div
          className="mt-3 border rounded p-2"
          style={{ background: "#fafafa" }}
        >
          <div className="d-flex justify-content-between" style={{ fontSize: 13 }}>
            <strong>Selected Total</strong>
            <strong>₹{selectedTotal.toLocaleString()}</strong>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer style={{ padding: "12px 18px" }}>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button variant="dark" onClick={onSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" /> Adding...
            </>
          ) : (
            "Add"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddAdditionalServicesModal;
