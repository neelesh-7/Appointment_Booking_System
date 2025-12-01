document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');

  function getEndTime(startTime) {
    if (!startTime) return '11:00';
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + 1;
    return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  try {
    const res = await fetch('/api/appointments/public');
    const appointments = await res.json();
    console.log('Fetched appointments:', appointments);

    const events = appointments
      .filter(a => a.date && a.time && a.service)
      .map(a => ({
        title: `Booked – ${a.service}`,
        start: `${a.date}T${a.time}`,
        end: `${a.date}T${getEndTime(a.time)}`,
        allDay: false
      }));

    console.log("Events to render:", events);

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: events
    });

    calendar.render();
  } catch (err) {
    console.error('Error loading calendar data:', err);
  }
});
