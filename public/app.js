document.getElementById("addressForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const address = document.getElementById("address").value;

  fetch(`/api/search?address=${encodeURIComponent(address)}`)
    .then((response) => response.json())
    .then((data) => {
      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = "";
      data.forEach((item) => {
        const div = document.createElement("div");
        div.textContent = `아파트: ${item.name}, 실거래가: ${item.price}`;
        resultsDiv.appendChild(div);
      });
    })
    .catch((error) => console.error("Error:", error));
});
