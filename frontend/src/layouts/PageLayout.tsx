import React from 'react';
import Header from './common/Header';
import Footer from './common/Footer';

type PageLayoutProps = {
  mainElement: React.ReactNode
}

function PageLayout({mainElement}: PageLayoutProps) {
  
  return (
    <>
      <Header/>
      <main className='prose prose-slate prose-sm max-w-none' style={{minHeight: `calc(100svh - 4rem - 3rem)`}}>
        {mainElement}
      </main>
      <Footer/>
    </>
  );
}

export default PageLayout;