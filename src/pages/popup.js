document.getElementById('connectBtn').addEventListener('click', function () {
  chrome.cookies.get({ url: "https://www.linkedin.com", name: "li_at" }, function (cookie) {
    const statusDiv = document.getElementById('status');
    if (cookie && cookie.value) {
      // Send the cookie to your Supabase Edge Function
      fetch('https://vycheykmhswtxjzmfaiy.functions.supabase.co/store-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ li_at: cookie.value })
      })
      .then(response => {
        if (response.ok) {
          statusDiv.textContent = "Cookie sent successfully!";
          statusDiv.style.color = "green";
        } else {
          statusDiv.textContent = "Failed to send cookie.";
          statusDiv.style.color = "red";
        }
      })
      .catch(() => {
        statusDiv.textContent = "Error sending cookie.";
        statusDiv.style.color = "red";
      });
    } else {
      statusDiv.textContent = "Could not find LinkedIn session cookie.";
      statusDiv.style.color = "red";
    }
  });
}); 