interface PaginationControlsProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, total, pageSize, onPageChange }: PaginationControlsProps) {
  if (total <= 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="room-footer" style={{ marginTop: 12 }}>
      <span className="room-meta">
        Page {page} of {totalPages} • Showing {from}–{to} of {total} stays
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          className="btn btn-outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}