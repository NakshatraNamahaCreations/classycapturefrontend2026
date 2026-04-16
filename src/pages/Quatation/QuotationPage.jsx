import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Card,
  Container,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import DynamicPagination from "../DynamicPagination";
import { API_URL } from "../../utils/api";

const QuotationPage = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchFinalizedQuotations(currentPage, search);
  }, [currentPage, search]);

  const fetchFinalizedQuotations = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/quotations/finalized?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(searchValue)}`,
      );
      setQuotations(response.data.quotations || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch finalized quotations";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  const handleViewQuotation = (quotation) => {
    navigate(`/quote/finalized-quotation/${quotation._id}`, {
      state: { quotation },
    });
  };

  return (
    <div
      className="container py-2 rounded vh-100"
      style={{ background: "#F4F4F4" }}
    >
      <div>
        <div className="d-flex gap-2 align-items-center justify-content-between p-2 rounded">
          <Form
            onSubmit={handleSearch}
            className="d-flex gap-2 align-items-center w-50"
          >
            <InputGroup className="bg-white rounded px-2">
              <IoSearch size={16} className="text-muted mt-1" />
              <Form.Control
                type="text"
                placeholder="Search by quotationId or title"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  fontSize: "14px",
                }}
              />
            </InputGroup>
            <Button variant="dark" size="sm" type="submit" disabled={loading}>
              Search
            </Button>
            {search && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleClearSearch}
              >
                Clear
              </Button>
            )}
          </Form>
        </div>

        <Container className="position-relative mt-4">
          <Card className="border-0 p-3">
            {error && <p className="text-danger">{error}</p>}
            {loading && <p>Loading...</p>}
            <div
              className="table-responsive bg-white"
              style={{ maxHeight: "65vh", overflowY: "auto" }}
            >
              <Table className="table table-hover align-middle">
                <thead
                  className="text-white text-center sticky-top"
                  style={{ backgroundColor: "#343a40" }}
                >
                  <tr style={{ fontSize: "14px" }}>
                    <th>Sl.No</th>
                    <th>Quotation ID</th>
                    <th>Quote Title</th>
                    <th>Total Amount</th>
                    <th>Created Date</th>
                    <th>Booking Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.length === 0 && !loading ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No finalized quotations found
                      </td>
                    </tr>
                  ) : (
                    quotations.map((quote, idx) => (
                      <tr
                        className="text-center fw-semibold"
                        style={{ fontSize: "12px" }}
                        key={quote._id}
                      >
                        <td>
                          {String(
                            (currentPage - 1) * itemsPerPage + idx + 1,
                          ).padStart(2, "0")}
                        </td>
                        <td>{quote.quotationId}</td>
                        <td>{quote.quoteTitle || "N/A"}</td>
                        <td>
                          ₹{quote.totalAmount?.toLocaleString("en-IN") || "N/A"}
                        </td>
                        <td>
                          {quote.createdAt
                            ? new Date(quote.createdAt).toLocaleDateString(
                                "en-GB",
                              )
                            : "N/A"}
                        </td>
                        <td
                          style={{
                            fontWeight: 700,
                            color:
                              quote.bookingStatus === "Cancelled"
                                ? "red"
                                : quote.bookingStatus === "Booked"
                                  ? "green"
                                  : quote.bookingStatus === "Not Booked" ||
                                      quote.bookingStatus === "NotBooked"
                                    ? "blue"
                                    : "#111", // default
                          }}
                        >
                          {quote.bookingStatus}
                        </td>

                        <td>
                          <Button
                            variant="link"
                            onClick={() => handleViewQuotation(quote)}
                            className="text-dark fw-bold"
                            style={{ fontSize: "14px" }}
                          >
                            Show Final Quote
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
            {/* {totalPages > 1 && ( */}
            <DynamicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            {/* )} */}
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default QuotationPage;
