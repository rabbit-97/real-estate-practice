document.getElementById("addressForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const address = document.getElementById("address").value;

  fetch(`/api/search?address=${encodeURIComponent(address)}`)
    .then((response) => response.json())
    .then((data) => {
      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = "";
      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(data[0].latitude, data[0].longitude),
        level: 3,
      };
      const map = new kakao.maps.Map(mapContainer, mapOption);

      data.forEach((item) => {
        const markerPosition = new kakao.maps.LatLng(item.latitude, item.longitude);
        const marker = new kakao.maps.Marker({
          position: markerPosition,
        });
        marker.setMap(map);

        const div = document.createElement("div");
        div.textContent = `아파트: ${item.aptNm}, 실거래가: ${item.dealAmount}`;
        resultsDiv.appendChild(div);
      });
    })
    .catch((error) => console.error("Error:", error));
});
