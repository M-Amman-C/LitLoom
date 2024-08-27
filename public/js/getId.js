document.querySelectorAll('.action-btn').forEach(button => {
            button.addEventListener('click', function() {
                // Get the ID from the button's data attribute
                const bookId = this.getAttribute('data-id');

                // Create a JSON object to send
                const data = { id: bookId };
                // Send the ID to the server via fetch
                fetch('/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                  if (response.redirected) {
                      // Redirect the browser to the new URL
                      window.location.href = response.url;
                  }
              })
              .catch((error) => {
                    console.error('Error:', error);
                });
            });
        });