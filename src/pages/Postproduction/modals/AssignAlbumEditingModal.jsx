// // src/pages/PostProduction/modals/AssignAlbumEditingModal.jsx
// import React, { useMemo, useState } from "react";
// import { Modal, Row, Col, Button } from "react-bootstrap";
// import Select from "react-select";

// const AssignAlbumEditingModal = ({
//   show,
//   onClose,
//   album,                // album object from quotation.albums[]
//   selectedPhotos,       // number
//   specializationOptions,
//   vendors,
//   fetchVendorsBySpecialization,
//   onAssign,             // (payload) => Promise<void>
// }) => {
//   const [form, setForm] = useState({
//     specialization: "",
//     vendorId: "",
//     taskDescription: "",
//   });
//   const [busy, setBusy] = useState(false);

//   const albumDetails = useMemo(
//     () => ({
//       templateLabel: album?.snapshot?.templateLabel || "",
//       baseSheets: album?.snapshot?.baseSheets || 0,
//       basePhotos: album?.snapshot?.basePhotos || 0,
//       boxLabel: album?.snapshot?.boxLabel || "",
//       qty: album?.qty || 0,
//       unitPrice: album?.unitPrice || 0,
//     }),
//     [album]
//   );

//   const handleAssign = async () => {
//     if (!album?._id) return;
//     if (!form.vendorId) return alert("Please select a vendor.");

//     const payload = {
//       albumId: album._id,
//       albumDetails,
//       selectedPhotos: Number(selectedPhotos) || 0,
//       specialization: form.specialization || "",
//       vendorId: form.vendorId,
//       taskDescription: form.taskDescription || "",
//     };

//     try {
//       setBusy(true);
//       await onAssign(payload);
//       onClose();
//     } catch (e) {
//       // surface any error thrown by onAssign
//       alert(
//         e?.response?.data?.message ||
//           e?.message ||
//           "Failed to assign album editing task"
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onClose} centered size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>Assign Album Editing</Modal.Title>
//       </Modal.Header>

//       <Modal.Body>
//         {/* Summary */}
//         <div className="border rounded p-2 mb-3 bg-light">
//           <p className="mb-1">
//             <strong>Album:</strong> {albumDetails.templateLabel || "—"}
//           </p>
//           <p className="mb-1">
//             <strong>Capacity:</strong> {albumDetails.basePhotos} photos •{" "}
//             {albumDetails.baseSheets} sheets
//           </p>
//           <p className="mb-1">
//             <strong>Box:</strong> {albumDetails.boxLabel || "Without Box"}
//           </p>
//           <p className="mb-0 text-success fw-bold">
//             <strong>Selected Photos:</strong> {Number(selectedPhotos) || 0}
//           </p>
//         </div>

//         <Row>
//           <Col md={6}>
//             <label>Specialization</label>
//             <Select
//               options={specializationOptions}
//               value={
//                 specializationOptions.find(
//                   (x) => x.value === form.specialization
//                 ) || null
//               }
//               onChange={(s) => {
//                 const specialization = s?.value || "";
//                 setForm((p) => ({ ...p, specialization }));
//                 if (s?.label) fetchVendorsBySpecialization(s.label);
//               }}
//               isClearable
//             />
//           </Col>

//           <Col md={6}>
//             <label>Vendor</label>
//             <Select
//               options={vendors.map((v) => ({ value: v._id, label: v.name }))}
//               value={
//                 vendors.find((v) => v._id === form.vendorId)
//                   ? {
//                       value: form.vendorId,
//                       label: vendors.find((v) => v._id === form.vendorId)?.name,
//                     }
//                   : null
//               }
//               onChange={(s) =>
//                 setForm((p) => ({ ...p, vendorId: s?.value || "" }))
//               }
//             />
//           </Col>
//         </Row>

//         <div className="mt-3">
//           <label>Task Description</label>
//           <textarea
//             className="form-control"
//             rows={2}
//             value={form.taskDescription}
//             onChange={(e) =>
//               setForm((p) => ({ ...p, taskDescription: e.target.value }))
//             }
//             placeholder="Any guidance for the designer (styles, themes, do/don'ts)…"
//           />
//         </div>
//       </Modal.Body>

//       <Modal.Footer>
//         <Button variant="secondary" onClick={onClose} disabled={busy}>
//           Cancel
//         </Button>
//         <Button
//           variant="success"
//           onClick={handleAssign}
//           disabled={busy || !album?._id}
//         >
//           {busy ? "Assigning…" : "Assign"}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default AssignAlbumEditingModal;

// src/pages/PostProduction/modals/AssignAlbumEditingModal.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Modal, Row, Col, Button, Form } from "react-bootstrap";
import Select from "react-select";
import dayjs from "dayjs";

const AssignAlbumEditingModal = ({
  show,
  onClose,
  album, // album object from quotation.albums[]
  selectedPhotos, // number
  specializationOptions,
  vendors,
  fetchVendorsBySpecialization,
  onAssign, // (payload) => Promise<void>
}) => {
  const [form, setForm] = useState({
    specialization: "",
    vendorId: "",
    taskDescription: "",
    completionDate: dayjs().add(1, "day").format("YYYY-MM-DD"), // ✅ added
  });

  const [busy, setBusy] = useState(false);

  // ✅ Reset form when modal opens (prevents old values staying)
  useEffect(() => {
    try {
      if (show) {
        setForm({
          specialization: "",
          vendorId: "",
          taskDescription: "",
          completionDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
        });
      }
    } catch (e) {}
  }, [show]);

  const albumDetails = useMemo(
    () => ({
      templateLabel: album?.snapshot?.templateLabel || "",
      baseSheets: album?.snapshot?.baseSheets || 0,
      basePhotos: album?.snapshot?.basePhotos || 0,
      boxLabel: album?.snapshot?.boxLabel || "",
      qty: album?.qty || 0,
      unitPrice: album?.unitPrice || 0,
    }),
    [album],
  );

  // ✅ compact react-select styles (kept)
  const selectStyles = useMemo(
    () => ({
      control: (base) => ({
        ...base,
        minHeight: 34,
        height: 34,
        fontSize: 12,
      }),
      valueContainer: (base) => ({
        ...base,
        height: 34,
        padding: "0 10px",
      }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
        fontSize: 12,
      }),
      singleValue: (base) => ({
        ...base,
        fontSize: 12,
      }),
      placeholder: (base) => ({
        ...base,
        fontSize: 12,
        color: "#6c757d",
      }),
      indicatorsContainer: (base) => ({
        ...base,
        height: 34,
      }),
      dropdownIndicator: (base) => ({
        ...base,
        padding: 6,
      }),
      clearIndicator: (base) => ({
        ...base,
        padding: 6,
      }),
      menu: (base) => ({
        ...base,
        fontSize: 12,
        zIndex: 9999,
      }),
      option: (base, state) => ({
        ...base,
        fontSize: 12,
        padding: "8px 10px",
        backgroundColor: state.isSelected
          ? "#f5f5f5"
          : state.isFocused
            ? "#fafafa"
            : "white",
        color: "#212529",
      }),
    }),
    [],
  );

  const handleAssign = async () => {
    try {
      if (!album?._id) return;
      if (!form.vendorId) return alert("Please select a vendor.");
      if (!form.completionDate) return alert("Please select completion date.");

      const payload = {
        albumId: album._id,
        albumDetails, // used in backend as snapshot
        selectedPhotos: Number(selectedPhotos) || 0,
        specialization: form.specialization || "",
        vendorId: form.vendorId,
        taskDescription: form.taskDescription || "",
        completionDate: form.completionDate, // ✅ added
      };

      setBusy(true);
      await onAssign(payload);
      onClose();
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to assign album editing task",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header closeButton style={{ padding: "10px 14px" }}>
        <Modal.Title style={{ fontSize: 14, fontWeight: 600 }}>
          Assign Album Editing
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "12px 14px", fontSize: 12 }}>
        {/* Summary */}
        <div className="border rounded bg-light" style={{ padding: 10 }}>
          <div className="mb-1">
            <strong>Album:</strong> {albumDetails.templateLabel || "—"}
          </div>
          <div className="mb-1">
            <strong>Capacity:</strong> {albumDetails.basePhotos} photos •{" "}
            {albumDetails.baseSheets} sheets
          </div>
          <div className="mb-1">
            <strong>Box:</strong> {albumDetails.boxLabel || "Without Box"}
          </div>
          <div className="mb-0 text-success fw-bold">
            <strong>Selected Photos:</strong> {Number(selectedPhotos) || 0}
          </div>
        </div>

        <Row className="mt-3 g-2">
          <Col md={6}>
            <label className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
              Specialization
            </label>

            <Select
              options={specializationOptions}
              value={
                specializationOptions.find(
                  (x) => x.value === form.specialization,
                ) || null
              }
              onChange={(s) => {
                try {
                  const specialization = s?.value || "";
                  setForm((p) => ({ ...p, specialization, vendorId: "" }));
                  if (s?.label) fetchVendorsBySpecialization(s.label);
                } catch (e) {}
              }}
              styles={{
                ...selectStyles,
                control: (base) => ({
                  ...base,
                  fontSize: 13,
                  minHeight: 36,
                  height: 36,
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: 36,
                  padding: "0 10px",
                }),
                singleValue: (base) => ({
                  ...base,
                  fontSize: 13,
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: 13,
                  color: "#6c757d",
                }),
                input: (base) => ({
                  ...base,
                  fontSize: 13,
                  margin: 0,
                  padding: 0,
                }),
                option: (base) => ({
                  ...base,
                  fontSize: 13,
                  padding: "8px 10px",
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: 36,
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: 6,
                }),
                menuPortal: (base) => ({ ...base, zIndex: 999999 }),
                menu: (base) => ({ ...base, zIndex: 999999, fontSize: 13 }),
              }}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isClearable
              placeholder="Select specialization..."
            />
          </Col>

          <Col md={6}>
            <label className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
              Vendor
            </label>

            <Select
              styles={{
                control: (base) => ({
                  ...base,
                  fontSize: 13,
                  minHeight: 36,
                  height: 36,
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: 36,
                  padding: "0 10px",
                }),
                singleValue: (base) => ({
                  ...base,
                  fontSize: 13,
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: 13,
                  color: "#6c757d",
                }),
                input: (base) => ({
                  ...base,
                  fontSize: 13,
                  margin: 0,
                  padding: 0,
                }),
                option: (base) => ({
                  ...base,
                  fontSize: 13,
                  padding: "8px 10px",
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: 36,
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: 6,
                }),
                menuPortal: (base) => ({ ...base, zIndex: 999999 }),
                menu: (base) => ({ ...base, zIndex: 999999, fontSize: 13 }),
              }}
              options={vendors.map((v) => ({ value: v._id, label: v.name }))}
              value={
                vendors.find((v) => v._id === form.vendorId)
                  ? {
                      value: form.vendorId,
                      label: vendors.find((v) => v._id === form.vendorId)?.name,
                    }
                  : null
              }
              onChange={(s) => {
                try {
                  setForm((p) => ({ ...p, vendorId: s?.value || "" }));
                } catch (e) {}
              }}
              placeholder="Select vendor..."
              isDisabled={!form.specialization}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />

            {!form.specialization && (
              <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                Select specialization first
              </div>
            )}
          </Col>
        </Row>

        {/* ✅ Completion Date */}
        <div className="mt-3">
          <label className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
            Completion Date *
          </label>
          <Form.Control
            type="date"
            style={{ fontSize: 12, minHeight: 36 }}
            value={form.completionDate}
            onChange={(e) => {
              try {
                setForm((p) => ({ ...p, completionDate: e.target.value }));
              } catch (err) {}
            }}
          />
        </div>

        {/* Notes */}
        <div className="mt-3">
          <label className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
            Task Description
          </label>
          <textarea
            className="form-control"
            rows={2}
            style={{ fontSize: 12 }}
            value={form.taskDescription}
            onChange={(e) => {
              try {
                setForm((p) => ({ ...p, taskDescription: e.target.value }));
              } catch (err) {}
            }}
            placeholder="Any guidance for the designer (styles, themes, do/don'ts)…"
          />
        </div>
      </Modal.Body>

      <Modal.Footer style={{ padding: "10px 14px" }}>
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
          onClick={handleAssign}
          disabled={busy || !album?._id}
        >
          {busy ? "Assigning…" : "Assign"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignAlbumEditingModal;
