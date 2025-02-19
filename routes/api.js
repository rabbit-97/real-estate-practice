import express from "express";
import axios from "axios";
import sqlite3 from "sqlite3";

const router = express.Router();

// 데이터베이스 연결
const db = new sqlite3.Database("법정동코드.db");

// 임시 데이터
const sampleData = [
  { name: "아파트1", price: "1억" },
  { name: "아파트2", price: "2억" },
];

// 주소를 기반으로 법정동 코드 검색 함수
const getLawdCode = (address) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT 법정동코드 FROM 법정동코드 WHERE 법정동명 LIKE ? LIMIT 1`;
    db.get(query, [`%${address}%`], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.법정동코드 : null);
      }
    });
  });
};

// 실거래가 데이터를 가져오는 함수
const getRealEstateData = async (lawdCode) => {
  const response = await axios.get(
    "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade",
    {
      params: {
        serviceKey: process.env.PUBLIC_DATA_API_KEY, // 인코딩된 인증키 사용
        LAWD_CD: lawdCode, // 동적으로 가져온 법정동 코드 사용
        DEAL_YMD: "202408",
        pageNo: 1,
        numOfRows: 10,
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
  return {
    latitude: response.data.documents[0].y,
    longitude: response.data.documents[0].x,
  };
};

router.get("/search", async (req, res) => {
  try {
    const address = req.query.address;
    console.log(`Received address: ${address}`);
    const coordinates = await getCoordinates(address); // 주소를 좌표로 변환
    console.log(`Coordinates: ${coordinates}`); // 변환된 좌표 로그 추가
    const lawdCode = await getLawdCode(address); // 주소에 따른 법정동 코드 가져오기
    if (!lawdCode) {
      return res.status(404).json({ error: "법정동 코드를 찾을 수 없습니다." });
    }
    const shortLawdCode = lawdCode.substring(0, 5); // 법정동 코드의 앞 5자리 사용
    const realEstateData = await getRealEstateData(shortLawdCode);
    res.json({ realEstateData, coordinates }); // 좌표와 부동산 데이터 반환
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

export default router;
