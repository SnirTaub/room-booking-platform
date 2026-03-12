import { PageLayout } from "../components/layout/PageLayout";
import { useRoomSearch } from "../hooks/useRoomSearch";
import { RoomsFilters } from "../components/rooms/RoomsFilters";
import { RoomsList } from "../components/rooms/RoomsList";
import { PaginationControls } from "../components/rooms/PaginationControls";

export function SearchRoomsPage() {
  const { filters, results, options, actions } = useRoomSearch();

  return (
    <PageLayout title="Find your next stay">
      <div className="room-layout">
        <RoomsFilters
          location={filters.location}
          capacity={filters.capacity}
          checkIn={filters.checkIn}
          checkOut={filters.checkOut}
          selectedAmenities={filters.selectedAmenities}
          amenities={options.amenities}
          onLocationChange={actions.setLocation}
          onCapacityChange={actions.setCapacity}
          onCheckInChange={actions.setCheckIn}
          onCheckOutChange={actions.setCheckOut}
          onToggleAmenity={actions.toggleAmenity}
          onSubmit={actions.handleSearchSubmit}
          error={results.error}
          success={results.success}
        />

        <div className="room-grid">
          <RoomsList rooms={results.rooms} onBook={actions.handleBook} />

          <PaginationControls
            page={results.page}
            total={results.total}
            pageSize={results.pageSize}
            onPageChange={actions.fetchRooms}
          />

          {results.rooms.length === 0 && !results.error && (
            <div className="room-meta">
              No results yet. Adjust your filters and click &quot;Search rooms&quot;.
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}