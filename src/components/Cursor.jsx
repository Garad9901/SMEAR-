import { useEffect, useRef, useState } from 'react';

const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const trails = useRef([]);

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };

      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }

      // Spawn trail particle
      spawnTrail(e.clientX, e.clientY);
    };

    const onDown = (e) => {
      setClicking(true);
      spawnRipple(e.clientX, e.clientY);
      setTimeout(() => setClicking(false), 300);
    };

    const onHoverIn = () => setHovering(true);
    const onHoverOut = () => setHovering(false);

    const interactiveEls = document.querySelectorAll('a, button, [data-hover]');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', onHoverIn);
      el.addEventListener('mouseleave', onHoverOut);
    });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);

    // Lerp ring animation
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;

      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', onHoverIn);
        el.removeEventListener('mouseleave', onHoverOut);
      });
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const spawnTrail = (x, y) => {
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
  };

  const spawnRipple = (x, y) => {
    const el = document.createElement('div');
    el.className = 'ripple-burst';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
  };

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot ${hovering ? 'opacity-0' : ''}`}
        style={{ display: hovering ? 'none' : 'block' }}
      />
      <div
        ref={ringRef}
        className={`cursor-ring ${hovering ? 'hovering' : ''} ${clicking ? 'clicking' : ''}`}
      />
    </>
  );
};

export default Cursor;
