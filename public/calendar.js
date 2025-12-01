document.addEventListener('DOMContentLoaded', async function () {
  function getColorForService(service) {
    return {
      'Web Design': '#6C5CE7',
      'Development': '#0190FF',
      'SEO': '#00B894'
    }[service] || '#636E72';
  }

  // ✅ Fetch with login check
  const res = await fetch('/api/appointments', {
    headers: {
      'x-logged-in': localStorage.getItem('loggedIn')
    }
  });

  const appointments = await res.json();

  // ✅ Check for proper format
  if (!Array.isArray(appointments)) {
    console.error("Invalid appointment data:", appointments);
    return;
  }

  const events = appointments.map(app => ({
    title: `${app.name} – ${app.service}`,
    start: `${app.date}T${app.time}`,
    id: app.id,
    backgroundColor: getColorForService(app.service),
    borderColor: getColorForService(app.service),
  }));

  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    height: 600,
    editable: true,
    events: events,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    eventClick: function (info) {
      const event = info.event;
      const [name, service] = event.title.split(' – ');

      document.getElementById('edit-id').value = event.id;
      document.getElementById('edit-name').value = name;
      document.getElementById('edit-service').value = service;
      document.getElementById('edit-date').value = event.start.toISOString().split('T')[0];
      document.getElementById('edit-time').value = event.start.toTimeString().slice(0, 5);

      document.getElementById('editModal').style.display = 'block';
    },

    eventDrop: async function (info) {
      const { id, start } = info.event;
      const date = start.toISOString().split('T')[0];
      const time = start.toTimeString().slice(0, 5);

      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time })
      });

      if (!res.ok) {
        alert('Update failed. Reverting...');
        info.revert();
      }
    }
  });

  calendar.render();
});

// Global handlers for save/edit and delete
window.saveEdit = async function () {
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('edit-name').value;
  const service = document.getElementById('edit-service').value;
  const date = document.getElementById('edit-date').value;
  const time = document.getElementById('edit-time').value;

  const res = await fetch(`/api/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, service, date, time })
  });

  if (res.ok) location.reload();
  else alert('Update failed');
};

window.deleteAppointment = async function () {
  const id = document.getElementById('edit-id').value;

  const res = await fetch(`/api/appointments/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) location.reload();
  else alert('Delete failed');
};