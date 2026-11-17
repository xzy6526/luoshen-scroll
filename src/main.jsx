import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ScrollDemo from './scroll/ScrollDemo.jsx';
import './styles.css';
import './gallery.css';
import './story.css';
import './silk.css';
import { edition, storyEdition, v2Edition, initialDemo } from './edition.mjs';

// The first edition remains available for visual comparison and rollback.
document.documentElement.classList.toggle('gallery', edition !== 'classic'&&edition!=='scroll');
document.documentElement.classList.toggle('scroll-edition',edition==='scroll');
document.documentElement.classList.toggle('story', storyEdition);
document.documentElement.classList.toggle('silk', v2Edition && initialDemo==='narrative');
document.documentElement.dataset.demo = initialDemo;

createRoot(document.getElementById('root')).render(edition==='scroll'?<ScrollDemo/>:<App />);
