// Contact form handler
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();
  alert("Thank you for your message! We'll get back to you soon.");
  this.reset();
});

// Booking form handler
document.getElementById("bookingForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = this.fullname.value;
  const email = this.email.value;
  const service = this.service.value;
  const date = this.date.value;
  const time = this.time.value;

  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, service, date, time })
    });

    const data = await res.json();

    if (res.ok) {
      alert('✅ Appointment booked! Confirmation email sent.');
      this.reset(); // Clear the form
    } else {
      alert(`❌ Error: ${data.error || 'Booking failed'}`);
    }

    // Optional: update message on page
    document.getElementById("bookingResponse").innerText = data.message || '';
  } catch (err) {
    console.error('Error submitting booking:', err);
    document.getElementById("bookingResponse").innerText = "Error booking appointment.";
  }
});
