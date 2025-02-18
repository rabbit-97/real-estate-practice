import express from "express";
import axios from "axios";
import xml2js from "xml2js";

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
  console.log("Kakao API response:", response.data); // Log the API response for debugging
  if (response.data.documents.length === 0) {
    throw new Error("No results found for the given address");
  }
  return response.data.documents[0].address;
};

// 실거래가 데이터를 가져오는 함수
const getRealEstateData = async (coordinates) => {
  const response = await axios.get(
    "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade",
    {
      params: {
        serviceKey: process.env.PUBLIC_DATA_API_KEY, // 인코딩된 인증키 사용
        LAWD_CD: "11110",
        DEAL_YMD: "202407",
        pageNo: 1,
        numOfRows: 1,
      },
    }
  );

  console.log("Raw Response Data:", response.data); // 응답 데이터 로그 추가

  // JSON 응답을 직접 처리
  const result = response.data;
  console.log("Parsed JSON:", result); // 변환된 JSON 로그 추가

  if (!result.response || !result.response.body || !result.response.body.items) {
    throw new Error("Invalid response structure");
  }

  const realEstateData = result.response.body.items.item;
  console.log("Real Estate Data:", realEstateData); // 디버깅을 위한 로그 추가

  // realEstateData가 객체일 경우 배열로 변환
  const realEstateArray = Array.isArray(realEstateData) ? realEstateData : [realEstateData];

  return realEstateArray;
};

router.get("/search", async (req, res) => {
  try {
    const address = req.query.address;
    console.log(`Received address: ${address}`);
    const coordinates = await getCoordinates(address);
    const realEstateData = await getRealEstateData(coordinates);
    const enrichedData = realEstateData.map((item) => ({
      ...item,
      latitude: coordinates.y,
      longitude: coordinates.x,
    }));
    res.json(enrichedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

export default router;
