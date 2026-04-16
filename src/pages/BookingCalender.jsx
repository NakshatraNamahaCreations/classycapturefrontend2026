import React, { useEffect, useState } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Container,
  Card,
  Table,
  Tabs,
  Tab,
  Form,
  InputGroup,
  Button,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DynamicPagination from "./DynamicPagination";
import { API_URL } from "../utils/api";

const localizer = dayjsLocalizer(dayjs);

const BookingCalendar = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("calendar");
  const [loading, setLoading] = useState({
    calendar: false,
    bookings: false,
  });
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState("bookingId");

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Fetch calendar events (Booked only)
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        setLoading((prev) => ({ ...prev, calendar: true }));
        const response = await axios.get(`${API_URL}/quotations/status/Booked`);

        if (response.data.success) {
          const dateCountMap = {};
          const today = dayjs().startOf("day");

          (response.data.quotations || []).forEach((quotation) => {
            (quotation.packages || []).forEach((pkg) => {
              const date = pkg.eventStartDate;
              if (!date || dayjs(date).isBefore(today)) return;
              dateCountMap[date] = (dateCountMap[date] || 0) + 1;
            });
          });

          setEvents(
            Object.entries(dateCountMap).map(([date, count]) => ({
              title: `${count} ${count === 1 ? "Event" : "Events"}`,
              start: new Date(date),
              end: new Date(date),
              resource: { date },
            })),
          );
        }
      } catch (err) {
        console.error("Error fetching calendar events:", err);
        setError("Failed to load calendar events. Please try again later.");
      } finally {
        setLoading((prev) => ({ ...prev, calendar: false }));
      }
    };

    if (activeTab === "calendar") {
      fetchCalendarEvents();
    }
  }, [activeTab]);

  // Fetch all bookings (Booked and Completed)
  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        setLoading((prev) => ({ ...prev, bookings: true }));
        const response = await axios.get(`${API_URL}/quotations/all-bookings`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            searchType,
            searchValue: searchTerm,
          },
        });

        if (response.data.success) {
          setAllBookings(response.data.quotations || []);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading((prev) => ({ ...prev, bookings: false }));
      }
    };

    if (activeTab === "allBookings") {
      fetchAllBookings();
    }
  }, [activeTab, currentPage, searchTerm]);

  const handleEventClick = (event) => {
    const selectedDate = dayjs(event.start).format("YYYY-MM-DD");
    navigate("/booking-list", { state: { date: selectedDate } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const isLoading = loading[activeTab === "calendar" ? "calendar" : "bookings"];

  return (
    <Container className="py-3">
      <Card>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            {/* Calendar Tab */}
            <Tab eventKey="calendar" title="Calendar View">
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  defaultView="month"
                  views={["month", "agenda"]}
                  style={{ height: 500 }}
                  eventPropGetter={() => ({
                    style: {
                      backgroundColor: "#3C3D37",
                      color: "white",
                      borderRadius: "4px",
                      border: "none",
                      padding: "2px 6px",
                    },
                  })}
                  onSelectEvent={handleEventClick}
                />
              )}
            </Tab>

            {/* All Bookings Tab */}
            <Tab eventKey="allBookings" title="All Bookings">
              <div className="d-flex justify-content-between mb-3">
                <Form onSubmit={handleSearchSubmit} style={{ width: "520px" }}>
                  <InputGroup>
                    <Form.Select
                      value={searchType}
                      onChange={(e) => {
                        setSearchType(e.target.value);
                        setCurrentPage(1);
                        // optional: clear search when changing type
                        setSearchInput("");
                        setSearchTerm("");
                      }}
                      disabled={isLoading}
                      style={{ maxWidth: "180px" }}
                    >
                      <option value="bookingId">Booking ID</option>
                      <option value="venue">Venue</option>
                      <option value="customerName">Customer Name</option>
                      <option value="customerPhone">Customer Phone</option>
                      <option value="personName">Person / Couple Name</option>
                    </Form.Select>

                    <Form.Control
                      type="text"
                      placeholder={
                        searchType === "bookingId"
                          ? "Search booking id..."
                          : searchType === "venue"
                            ? "Search venue name..."
                            : searchType === "customerName"
                              ? "Search customer name..."
                              : searchType === "customerPhone"
                                ? "Search customer phone..."
                                : "Search couple/person name..."
                      }
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      disabled={isLoading}
                    />

                    <Button variant="dark" type="submit" disabled={isLoading}>
                      Search
                    </Button>

                    {(searchTerm || searchInput) && (
                      <Button
                        variant="outline-secondary"
                        onClick={handleClearSearch}
                        disabled={isLoading}
                      >
                        Clear
                      </Button>
                    )}
                  </InputGroup>
                </Form>
              </div>

              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead
                        className="table-light"
                        style={{ fontSize: "14px" }}
                      >
                        <tr>
                          <th>#</th>
                          <th>Booking ID</th>
                          <th>Event Details</th>
                          <th>Customer</th>
                          <th>Contact</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "14px" }}>
                        {allBookings.length > 0 ? (
                          allBookings.map((booking, index) => (
                            <tr
                              key={booking._id}
                              onClick={() =>
                                navigate(
                                  `/booking/booking-details/${booking._id}`,
                                )
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <td>
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td>{booking.quotationId || "N/A"}</td>
                              <td>
                                {booking.packages?.map((pkg, i) => (
                                  <div key={i}>
                                    {pkg.categoryName || "N/A"} -{" "}
                                    {pkg.eventStartDate
                                      ? dayjs(pkg.eventStartDate).format(
                                          "DD/MM/YY",
                                        )
                                      : "N/A"}
                                  </div>
                                )) || "N/A"}
                              </td>
                              <td>
                                {booking.leadId?.persons?.map((p, i) => (
                                  <div key={i}>{p.name || "N/A"}</div>
                                )) || "N/A"}
                              </td>
                              <td>
                                {booking.leadId?.persons?.map((p, i) => (
                                  <div key={i}>{p.phoneNo || "N/A"}</div>
                                )) || "N/A"}
                              </td>
                              <td>
                                ₹{(booking.totalAmount || 0).toLocaleString()}
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    booking.bookingStatus === "Booked"
                                      ? "primary"
                                      : booking.bookingStatus === "Completed"
                                        ? "success"
                                        : booking.bookingStatus === "Cancelled"
                                          ? "danger"
                                          : "secondary"
                                  }
                                >
                                  {booking.bookingStatus || "N/A"}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              {searchTerm
                                ? "No bookings match your search"
                                : "No bookings found"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                      <DynamicPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BookingCalendar;
