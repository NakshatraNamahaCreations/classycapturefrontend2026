import React, {  useState } from "react";
import {  Form, Table } from "react-bootstrap";
import sortIcon from "../../assets/icons/sort.png"
import filterIcon from "../../assets/icons/filter.png"
import { IoSearch } from "react-icons/io5";


const CalenderEvents = () => {
    const [calenderEvents, setCalenderEvents] = useState([]);

    return (
        <div className="container py-2 rounded " style={{ background: "#F4F4F4", }} >

            <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
                <div className="d-flex gap-2 align-items-center w-50">
                    <div className="w-100 bg-white d-flex gap-2 align-items-center px-2 rounded">
                        <IoSearch size={16} className="text-muted" />
                        <Form className="d-flex flex-grow-1">
                            <Form.Group className="w-100">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Service name"
                                    style={{
                                        paddingLeft: "4px",
                                        border: "none",
                                        outline: "none",
                                        boxShadow: "none",
                                        fontSize: "14px"
                                    }}
                                />
                            </Form.Group>
                        </Form>
                    </div>
                    <img src={sortIcon} alt="sortIcon" style={{ width: "25px", cursor: "pointer" }} />
                    <img src={filterIcon} alt="filterIcon" style={{ width: "25px", cursor: "pointer" }} />
                </div>
            </div>

            <div className="table-responsive bg-white mt-3" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                <Table className="table table-hover align-middle">
                    <thead className="text-white text-center sticky-top">
                        <tr style={{ fontSize: "14px" }}>
                            <th className="">Sl.No</th>
                            <th className="">Name</th>
                            <th className="">Booking Id</th>
                            <th className="">Events</th>
                            <th className="">Vendor</th>

                        </tr>
                    </thead>
                    <tbody>
                        {
                            calenderEvents.map((item, idx) => (
                                <tr key={idx} style={{ fontSize: "12px" }} className="fw-semibold">
                                    <td className="text-center">{String(idx + 1).padStart(2, "0")}</td>
                                    <td className="text-center">{item.name}</td>
                                    <td className="text-center">{item.bookingId}</td>
                                    <td className="text-center d-flex flex-column text-center">{item.eventDetails.name}<small className="text-muted">{item.eventDetails.venue}</small></td>

                                    <td className="text-center">
                                        {item.vendor}
                                    </td>
                               </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>

        </div>
    )
}

export default CalenderEvents