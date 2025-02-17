import express from "express";
import axios from "axios";

const router = express.Router();

// 임시 데이터
const sampleData = [
  { name: "아파트1", price: "1억" },
  { name: "아파트2", price: "2억" },
];

// 주소를 좌표로 변환하는 함수
const getCoordinates = async (address) => {
  const response = await axios.get("https://dapi.kakao.com/v2/local/search/address.json", {
    headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
    params: { query: address },
  });
  return response.data.documents[0].address;
};

// 실거래가 데이터를 가져오는 함수
const getRealEstateData = async (coordinates) => {
  const response = await axios.get("https://api.example.com/real-estate", {
    params: {
      serviceKey: process.env.PUBLIC_DATA_API_KEY,
      lat: coordinates.y,
      lng: coordinates.x,
    },
  });
  return response.data;
};

router.get("/search", async (req, res) => {
  try {
    const address = req.query.address;
    console.log(`Received address: ${address}`);
    const coordinates = await getCoordinates(address);
    const realEstateData = await getRealEstateData(coordinates);
    res.json(realEstateData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

export default router;
