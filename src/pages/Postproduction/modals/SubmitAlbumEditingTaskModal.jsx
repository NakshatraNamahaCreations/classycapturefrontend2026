import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import dayjs from "dayjs";
import { API_URL } from "../../../utils/api";
import { toast } from "react-toastify";

const SubmitAlbumEditingTaskModal = ({
  show,
  onClose,
  task, // album editing task object
  onSubmitted, // (updatedTask) => void
}) => {
  const [submitDate, setSubmitDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [submitNote, setSubmitNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (show) {
        setSubmitDate(dayjs().format("YYYY-MM-DD"));
        setSubmitNote("");
      }
    } catch (e) {}
  }, [show]);

  const handleSubmit = async () => {
    try {
      if (!task?._id) return toast.error("No task selected");
      if (!submitDate) return toast.error("Submit date is required");

      setBusy(true);

      // ✅ your route: PUT /album-editing/:taskId/submit
      const { data } = await axios.put(
        `${API_URL}/album-editing/${task._id}/submit`,
        {
          submitDate, // comes from req.body
          submitNote, // comes from req.body
        }
      );

      if (!data?.success) {
        toast.error(data?.message || "Failed to submit editing task");
        return;
      }

      toast.success(
        data?.message || "Task submitted. Marked Completed successfully."
      );

      // send updated task back to parent
      onSubmitted?.(data.task);

      onClose?.();
    } catch (err) {
      console.error("SubmitAlbumEditingTaskModal submit error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to submit editing task"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 14, fontWeight: 600 }}>
          Submit Album Editing Task
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ fontSize: 13 }}>
        {!task ? (
          <Alert variant="warning" className="mb-0">
            No task selected.
          </Alert>
        ) : (
          <>
            <Alert variant="warning" className="py-2" style={{ fontSize: 12 }}>
              This will mark the task as <strong>Completed</strong> and move the
              album status to <strong>Awaiting Printing Approval</strong>.
            </Alert>

            <div className="mb-2" style={{ fontSize: 13 }}>
              <strong>Vendor:</strong> {task.vendorName || "—"}
            </div>

            <Form.Group className="mb-2">
              <Form.Label className="mb-1" style={{ fontSize: 12 }}>
                Submit Date *
              </Form.Label>
              <Form.Control
                type="date"
                value={submitDate}
                onChange={(e) => setSubmitDate(e.target.value)}
                style={{ fontSize: 13, minHeight: 36 }}
              />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label className="mb-1" style={{ fontSize: 12 }}>
                Submit Note
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={submitNote}
                onChange={(e) => setSubmitNote(e.target.value)}
                placeholder="Add submit note..."
                style={{ fontSize: 13 }}
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          size="sm"
          style={{ fontSize: 12 }}
          onClick={onClose}
          disabled={busy}
        >
          Cancel
        </Button>

        <Button
          variant="success"
          size="sm"
          style={{ fontSize: 12 }}
          onClick={handleSubmit}
          disabled={busy || !task?._id}
        >
          {busy ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Submitting…
            </>
          ) : (
            "Submit Task"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubmitAlbumEditingTaskModal;
