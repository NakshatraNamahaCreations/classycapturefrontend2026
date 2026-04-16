// src/components/Albums/LocalAlbumsTable.jsx
import React, { useMemo } from "react";
import { Table, Button, Card, ButtonGroup } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import { ALBUM_TEMPLATES, BOX_TYPES } from "./AddAlbumModal";

// ---- helpers (pure client) ----
const money = (n) => `₹${(Number(n) || 0).toLocaleString()}`;

const findTpl = (id) => ALBUM_TEMPLATES.find((t) => t.id === id);
const findBox = (id) => BOX_TYPES.find((b) => b.id === id) || BOX_TYPES[0];

const calcExtrasCost = (extrasObj = {}) =>
  Object.entries(extrasObj).reduce(
    (sum, [, qty]) => sum + (Number(qty) || 0), // quantity only; prices are in sheet types (snapshot)
    0
  );

/**
 * Safe local compute for album total, mirroring your UI math:
 * finalTotal from suggested if present; otherwise best-effort recompute.
 */
export const computeAlbumTotalLocal = (a) => {
  if (a?.suggested?.finalTotal != null) return Number(a.suggested.finalTotal) || 0;

  const qty = Math.max(1, Number(a?.qty) || 1);
  const unitAlbumPrice = Number(a?.unitPrice) || 0;
  const boxPerUnit = Number(a?.suggested?.boxPerUnit ?? 0);

  if (a?.customizePerUnit && Array.isArray(a?.extras?.perUnit)) {
    // If we don't have detailed per-unit extras costs, fallback to albumOnly + box
    return Array.from({ length: qty }).reduce(
      (sum) => sum + (unitAlbumPrice + boxPerUnit),
      0
    );
  } else {
    // shared extras known?
    const sheetTypes = a?.snapshot?.sheetTypes || [];
    const shared = a?.extras?.shared || {};
    const sharedExtrasCost =
      sheetTypes.reduce(
        (sum, s) => sum + (Number(shared[s.id]) || 0) * (Number(s.price) || 0),
        0
      ) || 0;
    const finalUnit = unitAlbumPrice + sharedExtrasCost + boxPerUnit;
    return finalUnit * qty;
  }
};

const LocalAlbumsTable = ({ albums = [], onRemove, onView, onEdit }) => {
  const subtotal = useMemo(
    () => (albums || []).reduce((s, a) => s + computeAlbumTotalLocal(a), 0),
    [albums]
  );

  return (
    <Card className="mt-3 border-0 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>Albums</strong>
        <div className="small text-muted">Subtotal: {money(subtotal)}</div>
      </Card.Header>
      <Card.Body className="pt-0">
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Album</th>
              <th>Box</th>
              {/* <th>Qty</th> */}
              <th>Album Price</th>
          
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((a, i) => {
              const tpl = findTpl(a.templateId);
              const box = findBox(a.boxTypeId);
              const qty = Math.max(1, Number(a.qty) || 1);
              const total = computeAlbumTotalLocal(a);

              return (
                <tr key={`local-${i}`}>
                  <td>{String(i + 1).padStart(2, "0")}</td>
                  <td className="fw-semibold">
                    {a.snapshot?.templateLabel || tpl?.label || "-"}
                  </td>
                  <td>{a.snapshot?.boxLabel || box?.label || "-"}</td>
              
                  <td >{money(a.unitPrice)}</td>
          
                  <td className="text-end">
                    <ButtonGroup size="sm">
                      <Button variant="outline-secondary" onClick={() => onView?.(i)}>
                        View
                      </Button>
                      <Button variant="outline-primary" onClick={() => onEdit?.(i)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => onRemove?.(i)}
                        title="Remove"
                      >
                        <FaTimes />
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              );
            })}
            {albums.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No albums added yet
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default LocalAlbumsTable;
