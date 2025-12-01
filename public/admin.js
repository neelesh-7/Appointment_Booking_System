document.getElementById("exportBtn").addEventListener("click", async () => {
  const res = await fetch('/api/appointments');
  const data = await res.json();

  let csv = 'Name,Email,Service,Date,Time\n';
  data.forEach(app => {
    csv += `${app.name},${app.email},${app.service},${app.date},${app.time}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'appointments.csv';
  a.click();
});

document.getElementById('showLogsBtn').onclick = async () => {
  const res = await fetch('/api/logs');
  const logs = await res.json();

  let html = '<table><tr><th>ID</th><th>Appointment</th><th>Action</th><th>Time</th></tr>';
  logs.forEach(log => {
    html += `<tr>
      <td>${log.id}</td>
      <td>${log.appointmentId}</td>
      <td>${log.action}</td>
      <td>${new Date(log.timestamp).toLocaleString()}</td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('logsTable').innerHTML = html;
};

document.getElementById('exportLogsBtn').onclick = async () => {
  const res = await fetch('/api/logs');
  const logs = await res.json();

  let csv = 'ID,Appointment ID,Action,Timestamp\n';
  logs.forEach(log => {
    csv += `${log.id},${log.appointmentId},${log.action},${log.timestamp}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'booking_logs.csv';
  a.click();
};
