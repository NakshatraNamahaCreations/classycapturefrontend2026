import React, { useMemo } from "react";
import { Table, Button, Card } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

const AdditionalServicesTable = ({ items = [], onRemove, isCancelled , isCompleted}) => {
  const total = useMemo(() => {
    return Math.round(
      (items || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0),
    );
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <Card className="mt-3 border">
      <Card.Header
        className="bg-light py-2 px-3 d-flex justify-content-between align-items-center"
        style={{ fontSize: 13 }}
      >
        <strong>Additional Services</strong>
        <span className="fw-bold">₹{total.toLocaleString()}</span>
      </Card.Header>

      <Card.Body className="p-0">
        <Table bordered responsive className="mb-0">
          <thead className="table-light" style={{ fontSize: 12 }}>
            <tr>
              <th style={{ width: "6%" }}>No</th>
              <th style={{ width: isCancelled ? "74%":"64%" }}>Service</th>
              <th className="text-end" style={{ width: "20%" }}>
                Price
              </th>
              {!isCancelled && !isCompleted && <th className="text-end" style={{ width: "10%" }}>
                Action
              </th>}
            </tr>
          </thead>

          <tbody style={{ fontSize: 12 }}>
            {(items || []).map((s, idx) => (
              <tr key={s._id || s.id || idx}>
                <td className="text-center">{idx + 1}</td>
                <td>
                  <div className="fw-semibold">{s.name}</div>
                  {s.description ? (
                    <div style={{ fontSize: 11, color: "#6c757d" }}>
                      {s.description}
                    </div>
                  ) : null}
                </td>
                <td className="text-end">
                  ₹{Number(s.price || 0).toLocaleString()}
                </td>
              {!isCancelled && !isCompleted &&   <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onRemove(s)}
                    style={{ padding: "4px 8px" }}
                  >
                    <FaTrash style={{ fontSize: 12 }} />
                  </Button>
                </td>}
              </tr>
            ))}

            <tr className="fw-bold">
              <td colSpan={2} className="text-end">
                Total
              </td>
              <td className="text-end">₹{total.toLocaleString()}</td>
              <td />
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default AdditionalServicesTable;
