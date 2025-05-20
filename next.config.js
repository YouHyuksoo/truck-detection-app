/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ 기본 설정
  reactStrictMode: true,

  // ✅ 개발 환경에서 외부 접근 허용 (예: 192.168.x.x → 모바일/다른 PC 테스트 용도)
  experimental: {
    allowedDevOrigins: [
      "http://192.168.123.105:3000", // ⚠ 본인의 IP로 수정
      "192.168.123.105",
      // 프로토콜 없는 형식도 추가
      "192.168.123.105:3000",
    ],
  },

  // Emotion/스타일 컴포넌트 설정
  compiler: {
    // Emotion 지원 추가
    emotion: true,
  },

  // ✅ 필요한 경우 추가 설정
  images: {
    domains: ["your-backend-server.com"], // 외부 이미지 도메인 허용 시
  },

  // ✅ 리디렉션 예시 (백엔드 API 프록시)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8010/api/:path*", // FastAPI 백엔드 예시
      },
    ];
  },
};

module.exports = nextConfig;
