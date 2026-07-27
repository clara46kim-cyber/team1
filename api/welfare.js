export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "GET 요청만 사용할 수 있습니다.",
    });
  }

  const apiKey = process.env.WELFARE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "WELFARE_API_KEY 환경변수가 설정되지 않았습니다.",
    });
  }

  try {
    const {
      pageNo = "1",
      numOfRows = "10",
      searchKeyword = "",
    } = req.query;

    /*
     * 중요:
     * 아래 주소는 공공데이터포털의
     * '복지서비스 목록조회' Swagger에 표시되는
     * 실제 요청주소로 교체해야 합니다.
     */
    const endpoint =
      "복지서비스_목록조회의_실제_요청주소";

    const url = new URL(endpoint);

    url.searchParams.set("serviceKey", apiKey);
    url.searchParams.set("pageNo", pageNo);
    url.searchParams.set("numOfRows", numOfRows);

    /*
     * 검색어 변수명은 Swagger 명세에서 확인해야 합니다.
     * 명세상 변수명이 srchKeyCode, searchWrd 등으로
     * 표시된다면 아래 이름을 그에 맞게 바꿉니다.
     */
    if (searchKeyword.trim()) {
      url.searchParams.set("searchKeyword", searchKeyword.trim());
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `복지 API 호출 실패: ${response.status}`,
      );
    }

    const xml = await response.text();

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400",
    );

    return res.status(200).send(xml);
  } catch (error) {
    console.error("복지 API 오류:", error);

    return res.status(500).json({
      error: "복지서비스 정보를 불러오지 못했습니다.",
      detail:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}
