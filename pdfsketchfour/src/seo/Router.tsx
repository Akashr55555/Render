import React, { useState, useEffect } from 'react';
import { routeConfigs } from './seoConfig';
import { SeoHead } from './SeoHead';
import { ToolLandingPage } from './ToolLandingPage';
import { GuidesPage } from './GuidesPage';
import { NotFoundPage } from './NotFoundPage';
import { CommercialPage } from './CommercialPage';

interface RouterProps {
  children: (routeState: { currentPath: string; isHome: boolean; navigate: (path: string) => void }) => React.ReactNode;
}

export const Router: React.FC<RouterProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    let raw = window.location.pathname;
    if (!raw.endsWith('/')) raw += '/';
    return raw;
  });

  useEffect(() => {
    const handlePopState = () => {
      let raw = window.location.pathname;
      if (!raw.endsWith('/')) raw += '/';
      setCurrentPath(raw);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    let norm = path;
    if (!norm.endsWith('/')) norm += '/';
    window.history.pushState({}, '', norm);
    setCurrentPath(norm);
    window.scrollTo(0, 0);
  };

  // Find matching route config
  const matchedConfig = routeConfigs[currentPath] || 
    Object.values(routeConfigs).find(rc => rc.path === currentPath || rc.slug === currentPath.replace(/\//g, ''));

  const isHome = currentPath === '/' || currentPath === '';

  let pageContent: React.ReactNode = null;

  if (matchedConfig) {
    if (isHome) {
      pageContent = children({ currentPath, isHome: true, navigate });
    } else if (matchedConfig.isCommercial) {
      pageContent = (
        <CommercialPage config={matchedConfig} onNavigate={navigate} />
      );
    } else if (matchedConfig.isGuide) {
      pageContent = (
        <GuidesPage config={matchedConfig} onNavigate={navigate} />
      );
    } else {
      pageContent = (
        <ToolLandingPage config={matchedConfig} onNavigate={navigate} />
      );
    }
  } else {
    // 404 Route
    pageContent = (
      <>
        <title>404 Page Not Found – PDFSketch</title>
        <NotFoundPage onNavigate={navigate} />
      </>
    );
  }

  return (
    <>
      {matchedConfig && <SeoHead config={matchedConfig} />}
      {pageContent}
    </>
  );
};
