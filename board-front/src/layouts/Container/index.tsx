import React from 'react'
import './style.css'
import Footer from 'layouts/Footer'
import { Outlet, useLocation } from 'react-router-dom'
import Header from 'layouts/Header'
import { AUTH_PATH } from 'constants/'

// 캄포넌트 : 레이아웃
export default function Container() {

  // state : 현제 페이지 경로 이름 받아오기
  const{ pathname } = useLocation();



  //렌더 : 레이아웃 렌더링
  return (
  <>
  <Header />
  <Outlet />
  {/* 경로가 auth 가 아닐때만 Footer 출력 */}
  {pathname !== AUTH_PATH()&& <Footer />}
  </>
  )
}
