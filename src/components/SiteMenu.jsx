import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import './SiteMenu.css';
import {MenuHome, MenuShare, MenuStory} from './MenuArtwork';

export default function SiteMenu() {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false), [notice, setNotice] = useState('');
  const root = useRef(null);
  useEffect(() => { setOpen(false); setNotice(''); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = event => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  if (['/', '/title', '/experience', '/receive-photo'].includes(pathname)) return null;
  const share = async () => {
    const url = new URL('/', location.href).href;
    try {
      if (navigator.share) await navigator.share({title: '우리바람', url});
      else { await navigator.clipboard.writeText(url); setNotice('링크를 복사했어요.'); }
    } catch (error) { if (error.name !== 'AbortError') setNotice('주소창의 링크를 공유해 주세요.'); }
  };
  return <nav ref={root} className="site-menu" aria-label="전체 메뉴">
    <div className="site-menu-clip" id="site-menu-flags" inert={!open || undefined}>
      {[[MenuHome, '처음으로', () => navigate('/')], [MenuShare, '소문내기', share], [MenuStory, '풍물이야기', () => navigate('/story')]].map(([Artwork, label, action], index) =>
        <button key={label} className={open ? 'is-open' : ''} style={{'--hide-distance': [-133.56, -104.11, -100][index] + '%'}}
          aria-label={label} onClick={() => { setOpen(false); action(); }}>
          <Artwork/>
        </button>)}
    </div>
    <button className="site-menu-toggle" aria-label={open ? '메뉴 접기' : '메뉴 펼치기'}
      aria-expanded={open} aria-controls="site-menu-flags" onClick={() => setOpen(value => !value)}>
      <img src={'/assets/figma/feedback/' + (open ? 'menu-open' : 'menu') + '.svg'} width="73.957" height="73.957" alt=""/>
    </button>
    <p className="site-menu-notice" role="status">{notice}</p>
  </nav>;
}
