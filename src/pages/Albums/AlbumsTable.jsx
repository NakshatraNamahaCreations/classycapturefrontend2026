// AlbumsTable.jsx
import React, { useMemo } from "react";
import { Table, Button, Form, Card, ButtonGroup } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import { ALBUM_TEMPLATES, BOX_TYPES, SHEET_TYPES } from "./AddAlbumModal";

import { computeAlbumTotal, fmt } from "../../utils/albumUtils";

const AlbumsTable = ({
  albums = [],
  onRemove,
  onView,
  onEdit,
  isCancelled,
  isCompleted
}) => {
  const subtotal = useMemo(
    () => (albums || []).reduce((s, a) => s + computeAlbumTotal(a), 0), // Double safety with (albums || [])
    [albums]
  );

  const getAlbumId = (a) => a?._id || a?.id;

  return (
    <Card className="mt-3 border-0 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>Albums</strong>
        <div className="small text-muted">Subtotal: {fmt(subtotal)}</div>
      </Card.Header>
      <Card.Body className="pt-0">
        <Table striped hover responsive className="vendor-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Album</th>
              <th>Box</th>
              <th>Sheets</th>
              {/* <th>Qty</th> */}
              <th>Album Price </th>
          
             {!isCancelled && !isCompleted &&  <th className="text-end">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {albums.map((a, i) => {
              console.log("a", a)
              const albumKey = getAlbumId(a); // Use this for keys and operations
              const t = ALBUM_TEMPLATES.find((x) => x.id === a.templateId);
              const b = BOX_TYPES.find((x) => x.id === a.boxTypeId);
              // keep your existing sheet display; adjust if you want to sum extras here
              const totalSheets = (t?.baseSheets || 0) + (a.extraSheets || 0);
              const total = computeAlbumTotal(a);

              return (
                <tr key={albumKey}>
                  <td>{String(i + 1).padStart(2, "0")}</td>
                  <td className="fw-semibold">
                    {a.snapshot?.templateLabel || t?.label || "-"}
                  </td>
                  <td>{a.snapshot?.boxLabel || b?.label || "-"}</td>
                  <td>{totalSheets}</td>
               
                  <td >{a.unitPrice}</td>
         
                 {!isCancelled && !isCompleted &&  <td className="text-end">
                    <ButtonGroup size="sm">
                      <Button
                        variant="outline-secondary"
                        onClick={() => onView?.(albumKey)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline-primary"
                        onClick={() => onEdit?.(albumKey)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => onRemove?.(albumKey)}
                        title="Remove"
                      >
                        <FaTimes />
                      </Button>
                    </ButtonGroup>
                  </td>}
                </tr>
              );
            })}
            {albums.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">
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

export default AlbumsTable;
