import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Card,
  Table,
  Container,
  InputGroup,
} from "react-bootstrap";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import axios from "axios";
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import DynamicPagination from "../DynamicPagination";
import { API_URL } from "../../utils/api";

const AdditionalServices = () => {
  const [showModal, setShowModal] = useState(false);
  const [services, setServices] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchServices(currentPage, search);
    // eslint-disable-next-line
  }, [currentPage, search]);

  const fetchServices = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/additional-services?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(
          searchValue
        )}`
      );

      setServices(response.data.data || []);
      setTotalPages(response.data.pages || 1);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to fetch additional services"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    try {
      setShowModal(false);
      setEditingId(null);
      setForm({ name: "", price: "", description: "" });
      setError("");
    } catch (e) {
      console.error(e);
    }
  };

  const validateForm = () => {
    try {
      if (!form.name.trim()) return "Please fill the Additional Service Name.";
      if (form.price === "" || form.price === null)
        return "Please fill the Price.";
      const priceNum = Number(form.price);
      if (Number.isNaN(priceNum) || priceNum < 0)
        return "Price must be a valid number (0 or more).";
      return "";
    } catch (e) {
      console.error(e);
      return "Validation failed.";
    }
  };

  // CREATE / UPDATE
  const handleSave = async () => {
    const vErr = validateForm();
    if (vErr) {
      setError(vErr);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
      };

      if (editingId) {
        const response = await axios.put(
          `${API_URL}/additional-services/${editingId}`,
          payload
        );

        setServices((prev) =>
          prev.map((s) => (s._id === editingId ? response.data.data : s))
        );
      } else {
        await axios.post(`${API_URL}/additional-services`, payload);
        await fetchServices(currentPage, search);
      }

      resetModal();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save additional service"
      );
    } finally {
      setLoading(false);
    }
  };

  // EDIT
  const handleEdit = (service) => {
    try {
      setEditingId(service._id);
      setForm({
        name: service?.name || "",
        price: service?.price ?? "",
        description: service?.description || "",
      });
      setShowModal(true);
      setError("");
    } catch (e) {
      console.error(e);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/additional-services/${id}`);

      if (services.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        await fetchServices(currentPage, search);
      }
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to delete additional service"
      );
    } finally {
      setLoading(false);
    }
  };

  // Excel download (downloads all matching search)
  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/additional-services?page=1&limit=10000&search=${encodeURIComponent(
          search
        )}`
      );

      const all = response.data.data || [];

      const ws = XLSX.utils.aoa_to_sheet([
        ["Sl.No", "Additional Service Name", "Price", "Description", "Created Date"],
        ...all.map((s, index) => [
          index + 1,
          s.name,
          s.price,
          s.description || "",
          new Date(s.createdAt).toLocaleDateString("en-GB"),
        ]),
      ]);

      ws["!cols"] = [
        { wpx: 50 },
        { wpx: 220 },
        { wpx: 90 },
        { wpx: 260 },
        { wpx: 120 },
      ];
      ws["!rows"] = [{ hpx: 30 }, ...all.map(() => ({ hpx: 20 }))];

      for (let col = 0; col < 5; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
        if (cell) cell.s = { font: { bold: true } };
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "AdditionalServices");
      const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelFile]), "additional-services.xlsx");
    } catch (err) {
      setError("Failed to download Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    try {
      e.preventDefault();
      setCurrentPage(1);
      setSearch(searchInput.trim());
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearSearch = () => {
    try {
      setSearchInput("");
      setSearch("");
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container className="position-relative">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        {/* Search */}
        <div style={{ width: "350px" }}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search Additional Service"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ fontSize: "14px" }}
                disabled={loading}
              />
              <Button
                variant="dark"
                type="submit"
                disabled={loading}
                style={{ fontSize: "14px" }}
              >
                Search
              </Button>
              {search && (
                <Button
                  variant="outline-secondary"
                  onClick={handleClearSearch}
                  disabled={loading}
                  style={{ fontSize: "14px" }}
                >
                  Clear
                </Button>
              )}
            </InputGroup>
          </Form>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <Button
            onClick={() => {
              try {
                setShowModal(true);
                setEditingId(null);
                setForm({ name: "", price: "", description: "" });
                setError("");
              } catch (e) {
                console.error(e);
              }
            }}
            variant="transparent"
            className="fw-bold rounded-1 shadow bg-white"
            style={{ fontSize: "14px" }}
            disabled={loading}
          >
            + Add Additional Service
          </Button>

          <Button
            onClick={handleDownloadExcel}
            className="fw-bold rounded-1 shadow bg-white text-dark border-0"
            style={{ fontSize: "14px" }}
            disabled={loading || services.length === 0}
          >
            Download Excel
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && <div className="text-center">Loading...</div>}

      <Card className="border-0 p-3 pb-0">
        <div
          className="table-responsive bg-white"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
        >
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top">
              <tr>
                <th style={{ width: "10%", fontSize: "14px" }} className="text-start">
                  Sl.No
                </th>
                <th style={{ width: "25%", fontSize: "14px" }} className="text-start">
                  Additional Service Name
                </th>
                <th style={{ width: "12%", fontSize: "14px" }}>Price</th>
                <th style={{ width: "33%", fontSize: "14px" }} className="text-start">
                  Description
                </th>
                <th style={{ width: "12%", fontSize: "14px" }}>Created Date</th>
                <th style={{ width: "8%", fontSize: "14px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {services.map((s, index) => (
                <tr key={s._id} className="text-center">
                  <td className="fw-semibold text-start" style={{ fontSize: "12px" }}>
                    {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                  </td>

                  <td className="fw-semibold text-start" style={{ fontSize: "12px" }}>
                    {s.name}
                  </td>

                  <td className="fw-semibold" style={{ fontSize: "12px" }}>
                    ₹ {Number(s.price || 0).toLocaleString()}
                  </td>

                  <td className="text-start" style={{ fontSize: "12px" }}>
                    {s.description || "—"}
                  </td>

                  <td className="text-success fw-semibold" style={{ fontSize: "12px" }}>
                    {new Date(s.createdAt).toLocaleDateString("en-GB")}
                  </td>

                  <td>
                    <Button
                      variant="outline-gray"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDelete(s._id)}
                      disabled={loading}
                    >
                      <img src={deleteIcon} alt="Delete" style={{ width: "20px" }} />
                    </Button>

                    <Button
                      variant="outline-gray"
                      size="sm"
                      onClick={() => handleEdit(s)}
                      disabled={loading}
                    >
                      <img src={editIcon} alt="Edit" style={{ width: "20px" }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            maxPagesToShow={5}
          />
        </div>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={resetModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-black" style={{ fontSize: "18px" }}>
            {editingId ? "Edit Additional Service" : "Add Additional Service"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Additional Service Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter service name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="shadow-sm"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="shadow-sm"
                disabled={loading}
                min={0}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold">Service Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="shadow-sm"
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="dark"
            className="rounded-1"
            onClick={handleSave}
            style={{ borderColor: "black", background: "black" }}
            disabled={loading}
          >
            {editingId ? "Save" : "Add"}
          </Button>
          <Button
            variant="outline-secondary"
            className="rounded-1"
            onClick={resetModal}
            disabled={loading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdditionalServices;
