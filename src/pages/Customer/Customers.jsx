import React, { useState, useEffect } from "react";
import { Button, Card, Table, Container, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import DynamicPagination from "../DynamicPagination";
import { FaDownload } from "react-icons/fa";

const Customers = () => {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ✅ Fixed API
  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    try {
      fetchLeads(currentPage, search);
    } catch (e) {
      // no-op
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search]);

  const fetchLeads = async (page = 1, searchValue = "") => {
    setLoading(true);
    setError("");

    try {
      // ✅ Always send valid page + limit to avoid null totalPages/currentPage from backend
      const safePage = Number.isFinite(Number(page)) ? Number(page) : 1;
      const safeLimit = Number.isFinite(Number(itemsPerPage)) ? Number(itemsPerPage) : 10;

      const res = await axios.get(
        `${API_URL}/lead?page=${safePage}&limit=${safeLimit}&search=${encodeURIComponent(
          searchValue || ""
        )}`
      );

      let list = res?.data?.data || [];

      // ✅ keep your sort (optional)
      list = list.sort((a, b) => {
        const numA = parseInt(String(a?.leadId || "").replace("CC-Cust", "") || "0", 10);
        const numB = parseInt(String(b?.leadId || "").replace("CC-Cust", "") || "0", 10);
        return numA - numB;
      });

      setLeads(list);

      // ✅ backend should send totalPages, but if null => fallback
      const tp = Number(res?.data?.totalPages);
      setTotalPages(Number.isFinite(tp) && tp > 0 ? tp : 1);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to fetch leads";
      setError(msg);
      toast.error(msg);
      setLeads([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    try {
      e.preventDefault();
      setCurrentPage(1);
      setSearch(searchInput.trim());
    } catch (e2) {
      // no-op
    }
  };

  const handleClearSearch = () => {
    try {
      setSearchInput("");
      setSearch("");
      setCurrentPage(1);
    } catch (e) {
      // no-op
    }
  };

  // ✅ Export CURRENT PAGE (whatever is loaded in state)
  const downloadCSV = () => {
    try {
      if (leads.length === 0) {
        toast.error("No data to download");
        return;
      }

      // ✅ include Reference column
      const headers = ["Sl.No", "Lead ID", "Reference", "Name", "Phone No", "Created Date"];
      let csvContent = headers.join(",") + "\n";

      leads.forEach((lead, index) => {
        const firstPerson = lead?.persons?.[0] || {};

        const row = [
          (currentPage - 1) * itemsPerPage + (index + 1),
          lead?.leadId || "N/A",
          `"${lead?.referenceForm || "N/A"}"`,
          `"${firstPerson?.name || "N/A"}"`,
          firstPerson?.phoneNo || "N/A",
          lead?.createdAt
            ? new Date(lead.createdAt).toLocaleDateString("en-GB")
            : "N/A",
        ];

        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `customers_page_${currentPage}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Customer data downloaded successfully");
    } catch (err) {
      toast.error("Failed to download CSV");
    }
  };

  return (
    <Container className="position-relative">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form onSubmit={handleSearch} style={{ width: "350px" }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by name / phone / leadId"
              value={searchInput}
              onChange={(e) => {
                try {
                  setSearchInput(e.target.value);
                } catch (e2) {}
              }}
              disabled={loading}
            />
            <Button variant="dark" type="submit" disabled={loading}>
              Search
            </Button>
            {search && (
              <Button
                variant="outline-secondary"
                onClick={handleClearSearch}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </Form>

        {/* ✅ same button */}
        <Button
          variant="success"
          onClick={downloadCSV}
          disabled={leads.length === 0}
          className="d-flex align-items-center gap-1"
        >
          <FaDownload /> Export
        </Button>
      </div>

      <Card className="border-0 p-3">
        {error && <p className="text-danger">{error}</p>}
        {loading && <p>Loading...</p>}

        <div
          className="table-responsive bg-white"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
        >
          <Table className="table table-hover align-middle">
            <thead
              className="text-white sticky-top"
              style={{ backgroundColor: "#343a40" }}
            >
              <tr style={{ fontSize: "14px" }}>
                <th>Sl.No</th>
                <th>Lead ID</th>
                <th>Reference</th>
                <th>Name</th>
                <th>Phone No</th>
                <th>Created Date</th>
              </tr>
            </thead>

            <tbody>
              {leads.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => {
                  const firstPerson = lead?.persons?.[0] || {};
                  return (
                    <tr key={lead?._id || index}>
                      <td style={{ fontSize: "12px" }}>
                        {String((currentPage - 1) * itemsPerPage + (index + 1)).padStart(
                          2,
                          "0"
                        )}
                      </td>

                      <td style={{ fontSize: "12px" }}>{lead?.leadId || "N/A"}</td>

                      <td style={{ fontSize: "12px" }}>
                        {lead?.referenceForm || "N/A"}
                      </td>

                      <td style={{ fontSize: "12px" }}>
                        {firstPerson?.name || "N/A"}
                      </td>

                      <td className="text-success fw-semibold" style={{ fontSize: "12px" }}>
                        {firstPerson?.phoneNo || "N/A"}
                      </td>

                      <td style={{ fontSize: "12px" }}>
                        {lead?.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString("en-GB")
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </Container>
  );
};

export default Customers;
