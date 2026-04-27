/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 토스 디자인 시스템 색상
        toss: {
          blue: '#3182F6',
          'blue-hover': '#1B64DA',
          bg: '#F2F4F6',
          text: '#191F28',
          'text-sub': '#6B7684',
          'text-disabled': '#ADB5C0',
          border: '#E5E8EB',
          white: '#FFFFFF',
          red: '#F04452',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Apple SD Gothic Neo',
               'Pretendard', 'sans-serif'],
      },
      borderRadius: {
        'toss': '12px',
        'toss-lg': '16px',
      },
    },
  },
  plugins: [],
}
