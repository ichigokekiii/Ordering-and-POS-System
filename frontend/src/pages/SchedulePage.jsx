function SchedulePage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Schedule</h1>

      <p className="text-gray-600 mb-6">
        Check our upcoming flower pop-up events and delivery schedules.
      </p>

      <div className="space-y-4">
        <div className="border p-4 rounded shadow-sm">
          <h2 className="font-semibold">Valentine's Flower Sale</h2>
          <p>Date: Feb 14, 2026</p>
          <p>Location: Manila</p>
        </div>

        <div className="border p-4 rounded shadow-sm">
          <h2 className="font-semibold">Spring Bouquet Launch</h2>
          <p>Date: March 20, 2026</p>
          <p>Location: Quezon City</p>
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
