// data/welfarePolicies.js
//
// 이 파일에 있는 정책만 AI(Gemini)에게 전달되며,
// AI는 이 목록 밖의 정책을 추천하지 않습니다.
//
// ⚠️ 지금 들어있는 2개 정책은 "구조를 보여주기 위한 예시"입니다.
// 실제 배포 전에는 반드시 우리 팀이 최신 자격 요건과 공식 출처를
// 직접 조사하여 아래 형식 그대로 교체/추가해 주세요.
// (정부 정책은 소득 기준, 지원 금액 등이 매년 바뀔 수 있습니다.)
//
// 각 정책 객체의 필드:
// - id: 고유 식별자 (영문/숫자, 공백 없이)
// - name: 정책명
// - targetSummary: 이 정책이 주로 대상으로 하는 사람 (AI가 판단 참고용으로 사용)
// - eligibilityNotes: 자격 조건에 대한 참고 설명 (확정 발언 금지, 참고용 서술)
// - supportContent: 지원 내용
// - applicationMethod: 신청 또는 문의 방법
// - officialAgency: 공식 담당 기관
// - officialUrl: 공식 출처 링크

const welfarePolicies = [
  {
    id: "senior-customized-care",
    name: "노인맞춤돌봄서비스",
    targetSummary:
      "만 65세 이상 어르신 중 신체적·정신적 어려움으로 일상생활에 도움이 필요하고, " +
      "소득·건강 상태 등 사회적 돌봄이 필요하다고 인정되는 분",
    eligibilityNotes:
      "국민기초생활수급자, 차상위계층, 또는 유사 중위소득 이하 등 소득 조건과 " +
      "건강 상태(신체·인지 기능 저하 등)를 함께 고려하여 지자체(읍면동 주민센터)에서 " +
      "대상 여부를 심사합니다. 정확한 소득 기준선은 매년 변경될 수 있습니다.",
    supportContent:
      "안전 확인, 사회참여, 생활교육, 신체·정서 지원 등 방문형 돌봄 서비스와 " +
      "필요 시 가사·식사 지원 등 연계 서비스를 제공합니다.",
    applicationMethod:
      "주소지 관할 읍·면·동 행정복지센터에 방문하거나 전화로 신청할 수 있으며, " +
      "보건복지상담센터(국번 없이 129)를 통해서도 안내를 받을 수 있습니다.",
    officialAgency: "보건복지부 / 주소지 관할 읍·면·동 행정복지센터",
    officialUrl: "https://www.bokjiro.go.kr",
  },
  {
    id: "disability-activity-support",
    name: "장애인 활동지원서비스",
    targetSummary:
      "만 6세 이상 65세 미만의 등록 장애인 중 활동지원 인정조사에서 일정 점수 이상을 " +
      "받아 일상생활 및 사회활동에 도움이 필요하다고 인정되는 분",
    eligibilityNotes:
      "장애 정도, 활동지원 인정조사 결과 점수, 나이 조건(만 65세 이후에는 노인장기요양보험 " +
      "제도와의 관계를 별도로 확인해야 함) 등을 함께 검토해야 합니다.",
    supportContent:
      "신체활동 지원(이동, 식사, 배설 등), 가사활동 지원, 이동 보조 등을 위해 " +
      "활동지원사가 방문하는 서비스 시간을 지원합니다.",
    applicationMethod:
      "국민연금공단 지사 또는 주소지 관할 읍·면·동 행정복지센터를 통해 신청할 수 있으며, " +
      "복지로 누리집(온라인)에서도 신청 절차를 확인할 수 있습니다.",
    officialAgency: "보건복지부 / 국민연금공단",
    officialUrl: "https://www.bokjiro.go.kr",
  },
];

module.exports = { welfarePolicies };
