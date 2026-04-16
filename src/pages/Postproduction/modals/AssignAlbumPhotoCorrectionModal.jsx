import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import dayjs from "dayjs";

export default function AssignAlbumPhotoCorrectionModal({
  show,
  onClose,
  album,
  quotationId,
  selectedPhotos, // from AlbumPhotoSelected.latest
  vendors,
  specializationOptions,
  fetchVendorsBySpecialization,
  onAssign,
}) {
  const [form, setForm] = useState({
    specialization: "",
    vendorId: "",
    taskDescription: "",
    completionDate: dayjs().add(2, "day").format("YYYY-MM-DD"),
  });

  const albumLabel = album?.snapshot?.templateLabel || "—";

  const canAssign = useMemo(() => {
    return (
      album?._id &&
      quotationId &&
      String(selectedPhotos ?? "") !== "" &&
      Number(selectedPhotos || 0) >= 0 &&
      form.vendorId &&
      form.completionDate
    );
  }, [album, quotationId, selectedPhotos, form]);

  useEffect(() => {
    if (!show) return;
    setForm({
      specialization: "",
      vendorId: "",
      taskDescription: "",
      completionDate: dayjs().add(2, "day").format("YYYY-MM-DD"),
    });
  }, [show]);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 16 }}>
          Assign Album Photo Correction
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ fontSize: 13 }}>
        {!album ? (
          <Alert variant="warning" className="mb-0">
            No album selected
          </Alert>
        ) : (
          <>
            <div className="mb-2">
              <strong>Album:</strong> {albumLabel}
            </div>
            <div className="mb-3">
              <strong>Selected Photos:</strong> {Number(selectedPhotos || 0)}
            </div>

            <Row className="g-2">
              <Col md={6}>
                <Form.Label>Specialization (optional)</Form.Label>
                <Form.Select
                  value={form.specialization}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((p) => ({ ...p, specialization: value, vendorId: "" }));
                    if (value) fetchVendorsBySpecialization(value);
                  }}
                >
                  <option value="">Select specialization</option>
                  {(specializationOptions || []).map((o) => (
                    <option key={o.value} value={o.label || o.value}>
                      {o.label || o.value}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Vendor *</Form.Label>
                <Form.Select
                  value={form.vendorId}
                  onChange={(e) => setForm((p) => ({ ...p, vendorId: e.target.value }))}
                >
                  <option value="">Select vendor</option>
                  {(vendors || []).map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Deadline *</Form.Label>
                <Form.Control
                  type="date"
                  value={form.completionDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, completionDate: e.target.value }))
                  }
                />
              </Col>

              <Col md={12}>
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.taskDescription}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, taskDescription: e.target.value }))
                  }
                  placeholder="Any correction instructions..."
                />
              </Col>
            </Row>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="primary"
          disabled={!canAssign}
          onClick={() => {
            try {
              onAssign({
                quotationId,
                albumId: album._id,
                vendorId: form.vendorId,
                taskDescription: form.taskDescription,
                completionDate: form.completionDate,
              });
            } catch (e) {
              console.error(e);
            }
          }}
        >
          Assign
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
