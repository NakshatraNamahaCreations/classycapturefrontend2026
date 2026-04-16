import { Button, Form, Row, Col, Card, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { IoEye } from "react-icons/io5";
import { API_URL } from "../../utils/api";

const referenceOptions = [
  { label: "Google", value: "Google" },
  { label: "Friend", value: "Friend" },
  { label: "Instagram", value: "Instagram" },
  { label: "Other", value: "Other" },
];

const AddleadsForm = () => {
  const navigate = useNavigate();
  const [persons, setPersons] = useState([]);
  const [eventDetails, setEventDetails] = useState([
    { category: "", eventStartDate: "", eventEndDate: "" },
  ]);
  const [categories, setCategories] = useState([]);
  const [referenceForm, setReferenceForm] = useState("");
  const [referenceOptions, setReferenceOptions] = useState([]);
  const [selectedReference, setSelectedReference] = useState(null);
  const [searchPhone, setSearchPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [leadFound, setLeadFound] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showAddQueryForm, setShowAddQueryForm] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.name,
  }));

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/category/all`
        );
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchReferenceOptions = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/reference/`
        );
        const formattedOptions = response.data.data.map((item) => ({
          value: item._id,
          label: item.name,
        }));
        setReferenceOptions(formattedOptions);
      } catch (err) {
        console.error("Error fetching reference options", err);
        toast.error("Failed to load reference options");
      }
    };
    fetchReferenceOptions();
  }, []);

  const handleAddPerson = () => {
    setPersons([
      ...persons,
      { name: "", phoneNo: "", whatsappNo: "", email: "", profession: "" },
    ]);
  };

  const handleRemovePerson = (index) => {
    const updated = [...persons];
    updated.splice(index, 1);
    setPersons(updated);
  };

  const resetForm = () => {
    setPersons([
      {
        name: "",
        phoneNo: searchPhone,
        whatsappNo: "",
        email: "",
        profession: "",
      },
    ]);
    setEventDetails([{ category: "", eventStartDate: "", eventEndDate: "" }]);
    setReferenceForm("");
  };

  const handlePhoneChange = async (e) => {
    const { value } = e.target;
    const onlyDigits = value.replace(/\D/g, "");
    setSearchPhone(onlyDigits);
    setSearchPerformed(false);

    if (onlyDigits.length >= 3) {
      try {
        const response = await axios.get(
          `${API_URL}/lead/searchByPhonePrefix?prefix=${onlyDigits.slice(
            0,
            3
          )}`
        );
        const allSuggestions = response.data || [];
        // ✅ Filter again based on full typed input
        const filtered = allSuggestions.filter((phone) =>
          phone.startsWith(onlyDigits)
        );
        setSearchSuggestions(filtered.length > 0 ? filtered : []);
      } catch (error) {
        console.error("Error fetching phone suggestions", error);
        setSearchSuggestions([]);
        if (!error.response || error.response.status !== 404) {
          toast.error(
            "Failed to fetch phone suggestions due to a server issue"
          );
        }
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const handlePhoneSuggestion = (phoneNo) => {
    setSearchPhone(phoneNo);
    setSearchSuggestions([]);
  };

  const handleSearch = async () => {
    setValidationError("");
    setError("");
    setLeadFound(false);
    setLeadDetails(null);
    setShowAddQueryForm(false);
    setSearchPerformed(true);

    // ✅ Close suggestions box when clicking Search
    setSearchSuggestions([]);

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/lead/searchByPhone?phoneNo=${searchPhone}`
      );
      const leads = response.data;
      if (leads && leads.length > 0) {
        const lead = leads[0];
        setLeadFound(true);
        setLeadDetails(lead);
        resetForm();
        toast.success("Lead found! Click '+ Add Query' to add a new query.");
      } else {
        setLeadFound(false);
        resetForm();
        toast.info(
          `No existing lead with ${searchPhone} number. You can create a new one.`
        );
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to search lead.");
      toast.error(error.response?.data?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };
  const isEmptyPerson = (person) => {
    return !person.name && !person.phoneNo && !person.whatsappNo && !person.email && !person.profession;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setValidationError("");

    if (!leadFound) {
      // ✅ Require at least one person only when creating a new lead
      if (
        !persons ||
        persons.length === 0 ||
        !persons[0].name ||
        !persons[0].phoneNo
      ) {
        setValidationError(
          "At least one person with name and phone is required."
        );
        setLoading(false);
        return;
      }

      // Validate all persons
      for (let p of persons) {
        if (!p.name || !p.phoneNo) {
          setValidationError("Fill all required person fields (name, phone).");
          setLoading(false);
          return;
        }
      }
    } else if (leadFound && showAddQueryForm) {
      // ✅ Persons optional for adding query → only validate if provided
      for (let p of persons) {
        if (p.email && !/^\S+@\S+\.\S+$/.test(p.email)) {
          setValidationError(`Invalid email: ${p.email}`);
          setLoading(false);
          return;
        }
      }
    }
    const dateError = validateEventDates();
    if (dateError && leadFound && showAddQueryForm) {
      setValidationError(dateError);
      setLoading(false);
      return;
    }

    // Filter out empty person objects
    const filteredPersons = persons.filter(p => !isEmptyPerson(p));

    const payload = { persons: filteredPersons, eventDetails };

    if (!leadFound) {
      if (!referenceForm) {
        setValidationError("Select a reference.");
        setLoading(false);
        return;
      }
      payload.referenceForm = referenceForm;
    }

    console.log("Add form payload", payload)
    try {
      if (leadFound && leadDetails && showAddQueryForm) {
        if (!leadDetails._id) {
          throw new Error("Lead _id is missing. Please search again.");
        }
        const response = await axios.post(
          `${API_URL}/lead/${leadDetails._id}/addQueryAndPerson`,
          payload
        );
        toast.success("Query and persons added successfully.");
      } else if (!leadFound) {
        await axios.post(`${API_URL}/lead/create`, payload);
        toast.success("Lead created successfully with initial query.");
      }
      navigate("/customer");
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Failed to submit."
      );
      toast.error(
        error.response?.data?.message || error.message || "Submit failed."
      );
      console.error("Error details:", error);
    } finally {
      setLoading(false);
      setShowAddQueryForm(false);
    }
  };

  const validateEventDates = () => {
    for (let ev of eventDetails) {
      if (leadFound && showAddQueryForm) {
        if (!ev.eventStartDate || !ev.eventEndDate)
          return "Please select valid start and end dates for the event.";
        if (new Date(ev.eventEndDate) < new Date(ev.eventStartDate))
          return "End date must be after start date for the event.";
        if (!ev.category) return "Please select a category for the event.";
      }
    }
    return "";
  };

  const addPerson = () => {
    setPersons((prev) => [
      ...prev,
      { name: "", phoneNo: "", whatsappNo: "", email: "", profession: "" },
    ]);
  };

  const removePerson = (idx) => {
    setPersons((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePersonChange = (idx, e) => {
    const { name, value } = e.target;
    setPersons((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [name]: value } : p))
    );
  };

  const addEventDetail = () => {
    setEventDetails((prev) => [
      ...prev,
      { category: "", eventStartDate: "", eventEndDate: "" },
    ]);
  };

  const removeEventDetail = (idx) => {
    setEventDetails((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEventDetailChange = (idx, field, value) => {
    setEventDetails((prev) =>
      prev.map((ev, i) => (i === idx ? { ...ev, [field]: value } : ev))
    );
  };

  const handleCategorySelect = (idx, e) => {
    setEventDetails((prev) =>
      prev.map((ev, i) =>
        i === idx ? { ...ev, category: e.target.value } : ev
      )
    );
  };

  return (
    <>
      <style>
        {`
    .form-control,
    .form-select,
    .form-label,
    .btn,
    .table,
    .table th,
    .table td,
    .list-group-item,
    .suggestions-list {
      font-size: 12px !important;
    }

    .react-select__single-value,
    .react-select__option,
    .react-select__input,
    .react-select__placeholder,
    .react-select__menu {
      font-size: 12px !important;
    }

    h3, h5 {
      font-size: 13px !important;
    }

    .form-label {
      margin-bottom: 2px;
    }

    .btn {
      padding: 4px 10px;
    }

    .table th,
    .table td {
      padding: 6px;
    }
  `}
      </style>

      <div className="container py-2" style={{ fontSize: "14px" }}>
        <h3 className="mb-4">Add Lead / Query</h3>
        {error && <p className="text-danger">{error}</p>}
        {validationError && <p className="text-danger">{validationError}</p>}

        {/* Search Phone */}
        <Form.Group className="mb-4 position-relative">
          <Form.Label>Search by Phone Number</Form.Label>
          <Row>
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                value={searchPhone}
                onChange={handlePhoneChange}
                className="mb-2"
              />
            </Col>
            <Col md={2}>
              <Button
                variant="outline-dark"
                onClick={handleSearch}
                disabled={loading}
                className="w-100 "
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </Col>
          </Row>
          {/* Phone suggestions */}
          {searchSuggestions.length > 0 && (
            <ul
              className="suggestions-list list-group position-absolute w-25 bg-white border rounded shadow-sm"
              style={{ zIndex: 1000, top: "100%", left: 0 }}
            >
              {searchSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handlePhoneSuggestion(suggestion)}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: "pointer" }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </Form.Group>

        {/* Lead Details */}
        {leadFound && leadDetails && (
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-dark text-white">
              Lead Details (ID: {leadDetails.leadId})
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-5">
                <p className="mb-2">
                  <strong>Reference:</strong> {leadDetails.referenceForm}
                </p>
                <p className="mb-2">
                  <strong>Created:</strong> {formatDate(leadDetails.createdAt)}
                </p>
              </div>

              <h5 className="mt-3">Persons</h5>
              <Table striped bordered hover responsive className="mb-4">
                <thead className="table-primary">
                  <tr>
                    <th>Name</th>
                    <th>Phone No</th>
                    <th>Email</th>
                    <th>WhatsApp No</th>
                    <th>Profession</th>
                  </tr>
                </thead>
                <tbody>
                  {leadDetails.persons.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.phoneNo}</td>
                      <td>{p.email || "-"}</td>
                      <td>{p.whatsappNo || "-"}</td>
                      <td>{p.profession || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <h5 className="mt-3">Previous Queries</h5>
              {leadDetails.queries?.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead className="table-primary">
                    <tr>
                      <th>Query ID</th>
                      <th>Created Date</th>
                      <th>Event</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadDetails.queries.map((q, i) => (
                      <tr key={q._id}>
                        <td>{q.queryId}</td>
                        <td>{formatDate(q.createdAt)}</td>
                        <td>
                          {q.eventDetails.map((ev, j) => (
                            <div key={j}>{ev.category}</div>
                          ))}
                        </td>
                        <td>
                          {q.eventDetails.map((ev, j) => (
                            <div key={j}>{formatDate(ev.eventStartDate)}</div>
                          ))}
                        </td>
                        <td>
                          {q.eventDetails.map((ev, j) => (
                            <div key={j}>{formatDate(ev.eventEndDate)}</div>
                          ))}
                        </td>
                        <td>{q.status}</td>
                        <td>
                          {q.status === "Booked" && (
                            <IoEye
                              size={20}
                              onClick={() =>
                                navigate(`/booking/by-query/${q._id}`)
                              }
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No queries found for this lead.</p>
              )}
              <Button
                variant="outline-dark"
                onClick={() => setShowAddQueryForm(true)}
                className="mt-3"
              >
                + Add Query
              </Button>
            </Card.Body>
          </Card>
        )}

        {/* Form for Adding Lead / Query */}
        {(searchPerformed && !leadFound) || (leadFound && showAddQueryForm) ? (
          <Form onSubmit={handleSubmit}>
            {/* Persons Details */}
            <div className="mb-4 border rounded p-3 bg-white shadow-sm">
              <h5>Person(s) Details</h5>
              {persons.map((person, idx) => (
                <Row key={idx} className="mb-2 align-items-end">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={person.name}
                        onChange={(e) => handlePersonChange(idx, e)}
                        required={!leadFound}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Phone No</Form.Label>
                      <Form.Control
                        type="text"
                        name="phoneNo"
                        value={person.phoneNo}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, ""); // Keep digits only
                          handlePersonChange(idx, {
                            target: { name: "phoneNo", value: onlyDigits },
                          });
                        }}
                        required={!leadFound}
                        inputMode="numeric"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>WhatsApp No</Form.Label>
                      <Form.Control
                        type="text"
                        name="whatsappNo"
                        value={person.whatsappNo}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, ""); // Keep digits only
                          handlePersonChange(idx, {
                            target: { name: "whatsappNo", value: onlyDigits },
                          });
                        }}
                        inputMode="numeric"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={person.email}
                        onChange={(e) => handlePersonChange(idx, e)}
                        // required={!leadFound}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Profession</Form.Label>
                      <Form.Control
                        type="text"
                        name="profession"
                        value={person.profession}
                        onChange={(e) => handlePersonChange(idx, e)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    {((leadFound && showAddQueryForm) ||
                      persons.length > 1) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removePerson(idx)}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={addPerson}
                className="mt-2"
              >
                + Add Person
              </Button>
            </div>

            {/* Event Details */}
            <div className="mb-4 border rounded p-3 bg-white shadow-sm">
              <h5>Add New Event(s)</h5>
              {eventDetails.map((ev, idx) => (
                <Row key={idx} className="mb-2 align-items-end">
                  {/* <Col md={4}>
                  <Form.Group>
                    <Form.Label>
                      Event Category (e.g., Birthday, Festival)
                    </Form.Label>
                    <Form.Select
                      value={ev.category}
                      onChange={(e) => handleCategorySelect(idx, e)}
                      required={leadFound && showAddQueryForm} // Required only for Add Query
                    >
                      <option value="">Select Event Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col> */}
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        Event Category (e.g., Birthday, Festival)
                      </Form.Label>
                      <Select
                        options={categoryOptions}
                        value={
                          categoryOptions.find(
                            (opt) => opt.value === ev.category
                          ) || null
                        }
                        onChange={(selected) =>
                          handleEventDetailChange(
                            idx,
                            "category",
                            selected?.value || ""
                          )
                        }
                        placeholder="Select or search category"
                        isClearable
                        required={leadFound && showAddQueryForm}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Event Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={ev.eventStartDate}
                        onChange={(e) =>
                          handleEventDetailChange(
                            idx,
                            "eventStartDate",
                            e.target.value
                          )
                        }
                        required={leadFound && showAddQueryForm} // Required only for Add Query
                        placeholder="Select start date"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Event End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={ev.eventEndDate}
                        min={ev.eventStartDate}
                        onChange={(e) =>
                          handleEventDetailChange(
                            idx,
                            "eventEndDate",
                            e.target.value
                          )
                        }
                        required={leadFound && showAddQueryForm} // Required only for Add Query
                        placeholder="Select end date"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    {eventDetails.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeEventDetail(idx)}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={addEventDetail}
                className="mt-2"
              >
                + Add Event
              </Button>
            </div>

            {/* Reference form for new lead only */}
            {!leadFound && (
              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Reference From</Form.Label>
                    <Select
                      options={referenceOptions}
                      value={selectedReference}
                      onChange={(selected) => {
                        setSelectedReference(selected);
                        setReferenceForm(selected?.label || "");
                      }}
                      placeholder="Select reference source"
                      isClearable
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <div className="mt-3">
              <Button
                variant="dark"
                type="submit"
                disabled={loading}
                className="px-4"
              >
                {loading
                  ? "Submitting..."
                  : leadFound
                  ? "Add Query"
                  : "Create Lead"}
              </Button>
            </div>
          </Form>
        ) : (
          searchPerformed &&
          !leadFound && (
            <p className="text-danger">No lead found with this phone number</p>
          )
        )}
      </div>
    </>
  );
};

export default AddleadsForm;
