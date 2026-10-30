import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function AppControllers({ basePath }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [figureHtml, setFigureHtml] = useState('');

  useEffect(() => {
    document.documentElement.dataset.comarcHydrated = 'true';
    function closeDrawer() {
      setDrawerOpen(false);
      document.getElementById('sidebar')?.classList.remove('open');
    }

    function handleClick(event) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest('#menu-open')) {
        setDrawerOpen(true);
        document.getElementById('sidebar')?.classList.add('open');
        return;
      }
      if (target.closest('#overlay')) {
        closeDrawer();
        return;
      }
      if (target.closest('#collection')) {
        window.location.assign(`${basePath}/`);
        closeDrawer();
        return;
      }
      if (target.closest('#figure-close')) {
        setFigureHtml('');
        return;
      }
      if (target.closest('[data-action="zoom"]')) {
        const card = target.closest('.diagram-card')?.cloneNode(true);
        if (card) {
          card.querySelectorAll('.figure-zoom').forEach((button) => button.remove());
          setFigureHtml(card.outerHTML);
        }
        return;
      }
      if (target.closest('#sidebar a')) closeDrawer();
    }

    function handleKey(event) {
      if (event.key === 'Escape') {
        setFigureHtml('');
        closeDrawer();
      }
    }

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
      document.getElementById('sidebar')?.classList.remove('open');
      delete document.documentElement.dataset.comarcHydrated;
    };
  }, [basePath]);

  return (
    <>
      <div id="overlay" className="overlay" hidden={!drawerOpen} />
      {figureHtml && (
        <div id="figure-modal" className="figure-modal" role="dialog" aria-modal="true" aria-label="ขยายภาพ">
          <button id="figure-close" type="button" aria-label="ปิดภาพ"><X size={20} strokeWidth={1.8} /></button>
          <div id="figure-modal-content" dangerouslySetInnerHTML={{ __html: figureHtml }} />
        </div>
      )}
    </>
  );
}

export function ReadingProgress() {
  useEffect(() => {
    function update() {
      const root = document.getElementById('page');
      const fill = document.getElementById('read-progress-fill');
      if (!root || !fill) return;
      const start = root.getBoundingClientRect().top + window.scrollY;
      const range = Math.max(1, root.offsetHeight - window.innerHeight + 90);
      const percent = Math.max(0, Math.min(100, (window.scrollY - start + 78) / range * 100));
      fill.style.width = `${percent}%`;
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return <div className="read-progress"><div id="read-progress-fill" /></div>;
}
