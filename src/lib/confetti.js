const COLORS = ['#58CC02', '#1CB0F6', '#FF4B4B', '#FFC800', '#CE82FF', '#FF9600', '#00CD9C'];

function drawParticle(ctx, p, rectRatio) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.fillStyle = p.color;
  if (p.shape === 'rect') {
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * rectRatio);
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Fan-shaped explosion from the top of the screen. Returns a cancel function.
export function launchExplosion(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;

  const originX = canvas.width / 2;
  const originY = Math.min(canvas.height * 0.18, 140);

  const particles = Array.from({ length: 110 }, () => {
    const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.7;
    const speed = Math.random() * 12 + 5;
    return {
      x: originX + (Math.random() - 0.5) * 50,
      y: originY + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * (Math.random() > 0.5 ? speed : -speed),
      vy: -Math.sin(angle) * speed,
      size: Math.random() * 9 + 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    };
  });

  let id;
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    particles.forEach((p) => {
      p.vx *= 0.975;
      p.vy = p.vy * 0.975 + 0.16;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      if (p.y < canvas.height + 30) {
        alive++;
        drawParticle(ctx, p, 0.65);
      }
    });
    if (alive > 0) id = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(id);
}

// Centered burst that fades out. Returns a cancel function.
export function launchBurst(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const palette = ['#FFC800', '#FF4B4B', '#58CC02', '#1CB0F6', '#FF9600', '#FFFFFF'];
  const particles = Array.from({ length: 90 }, () => ({
    x: canvas.width / 2,
    y: canvas.height / 2 - 40,
    vx: (Math.random() - 0.5) * 16,
    vy: (Math.random() - 0.7) * 18,
    size: Math.random() * 8 + 4,
    color: palette[Math.floor(Math.random() * palette.length)],
    rotation: Math.random() * 360,
    vRot: (Math.random() - 0.5) * 10,
    opacity: 1,
    shape: Math.random() > 0.4 ? 'rect' : 'circle',
  }));

  let id;
  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = 0;
    particles.forEach((p) => {
      if (p.opacity <= 0) return;
      active++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.vx *= 0.98;
      p.rotation += p.vRot;
      p.opacity -= 0.008;
      ctx.globalAlpha = Math.max(0, p.opacity);
      drawParticle(ctx, p, 1.4);
    });
    ctx.globalAlpha = 1;
    if (active > 0) id = requestAnimationFrame(loop);
  };
  loop();
  return () => cancelAnimationFrame(id);
}
