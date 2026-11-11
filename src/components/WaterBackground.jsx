import { useEffect, useRef } from 'react';
import { REDUCED } from '../lib/anim';

const VERT = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/* Wave equation: r = height (0.5-centered), g = velocity (0.5-centered) */
const SIM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform vec4 uDrop; /* xy = uv, z = strength, w = aspect */
in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 uv = vUv;
  float h = texture(uPrev, uv).r * 2.0 - 1.0;
  float v = texture(uPrev, uv).g * 2.0 - 1.0;
  float hl = texture(uPrev, uv - vec2(uTexel.x, 0.0)).r * 2.0 - 1.0;
  float hr = texture(uPrev, uv + vec2(uTexel.x, 0.0)).r * 2.0 - 1.0;
  float hd = texture(uPrev, uv - vec2(0.0, uTexel.y)).r * 2.0 - 1.0;
  float hu = texture(uPrev, uv + vec2(0.0, uTexel.y)).r * 2.0 - 1.0;
  float avg = (hl + hr + hd + hu) * 0.25;

  v += (avg - h) * 0.62;
  v *= 0.986;
  h += v;
  h *= 0.999;

  if (uDrop.z != 0.0) {
    vec2 d = (uv - uDrop.xy) * vec2(uDrop.w, 1.0);
    h += uDrop.z * exp(-dot(d, d) * 3800.0);
  }

  outColor = vec4(h * 0.5 + 0.5, v * 0.5 + 0.5, 0.0, 1.0);
}`;

/* Dark water: deep gradient + drifting caustics, refracted by the ripples */
const DRAW_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uSim;
uniform vec2 uTexel;
uniform vec2 uRes;
uniform float uTime;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; }
  return s;
}

void main() {
  float hl = texture(uSim, vUv - vec2(uTexel.x, 0.0)).r * 2.0 - 1.0;
  float hr = texture(uSim, vUv + vec2(uTexel.x, 0.0)).r * 2.0 - 1.0;
  float hd = texture(uSim, vUv - vec2(0.0, uTexel.y)).r * 2.0 - 1.0;
  float hu = texture(uSim, vUv + vec2(0.0, uTexel.y)).r * 2.0 - 1.0;
  float hc = texture(uSim, vUv).r * 2.0 - 1.0;
  vec2 grad = vec2(hr - hl, hu - hd);
  vec2 refr = grad * 3.2;

  float aspect = uRes.x / uRes.y;
  vec2 p = vUv * vec2(aspect, 1.0);

  /* deep water base */
  float depth = fbm(p * 2.1 + vec2(uTime * 0.014, uTime * 0.007));
  vec3 deep = vec3(0.022, 0.030, 0.037);
  vec3 shallow = vec3(0.105, 0.145, 0.162);
  vec3 col = mix(deep, shallow, depth * 0.9);

  /* wave height shading - bright crests, dark troughs (makes rings read) */
  col += clamp(hc * 0.6, -0.12, 0.30) * vec3(0.50, 0.68, 0.76);

  /* drifting caustics, distorted by the ripples */
  float ca = fbm(p * 5.5 + refr * 3.2 + vec2(0.0, -uTime * 0.028));
  ca = smoothstep(0.40, 0.82, ca);
  col += ca * vec3(0.070, 0.118, 0.128);

  /* specular glints on the wave crests */
  vec3 n = normalize(vec3(grad * 6.0, 1.0));
  float glint = pow(clamp(dot(n, normalize(vec3(-0.35, 0.55, 0.75))), 0.0, 1.0), 55.0);
  col += glint * vec3(0.40, 0.50, 0.55);

  /* soft crest sheen */
  float crest = smoothstep(0.025, 0.32, length(grad));
  col += crest * vec3(0.115, 0.165, 0.185);

  /* vignette keeps it deep and lets the type breathe */
  float vg = smoothstep(1.3, 0.3, length(vUv - 0.5));
  col *= mix(0.78, 1.0, vg);

  outColor = vec4(col, 1.0);
}`;

export default function WaterBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const hero = canvas.closest('.hero');

    let gl;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power',
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      canvas.dataset.water = 'no-webgl2';
      canvas.style.display = 'none';
      return undefined;
    }

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = (fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      return p;
    };

    let simProg;
    let drawProg;
    try {
      simProg = program(SIM_FRAG);
      drawProg = program(DRAW_FRAG);
      canvas.dataset.water = 'ok';
    } catch (err) {
      canvas.dataset.water = `error: ${err.message}`.slice(0, 300);
      canvas.style.display = 'none';
      return undefined;
    }

    const halfFloat = !!gl.getExtension('EXT_color_buffer_float');
    const U = (prog, name) => gl.getUniformLocation(prog, name);
    const simU = {
      prev: U(simProg, 'uPrev'),
      texel: U(simProg, 'uTexel'),
      drop: U(simProg, 'uDrop'),
    };
    const drawU = {
      sim: U(drawProg, 'uSim'),
      texel: U(drawProg, 'uTexel'),
      res: U(drawProg, 'uRes'),
      time: U(drawProg, 'uTime'),
    };

    /* fullscreen triangle */
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let simA = null;
    let simB = null;
    let simW = 0;
    let simH = 0;

    const makeTarget = (w, h) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (halfFloat) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0.5, 0.5, 0.5, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fb };
    };

    const freeTargets = () => {
      [simA, simB].forEach((t) => {
        if (!t) return;
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fb);
      });
    };

    let raf = 0;
    let visible = true;
    let running = false;
    let last = performance.now();
    let time = 0;
    let ambientIn = 1.4;
    let drop = [0, 0, 0];
    let lastMX = null;
    let lastMY = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(2, Math.round(rect.width * dpr));
      const h = Math.max(2, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const aspect = rect.width / rect.height;
      simW = Math.min(400, Math.max(160, Math.round(384 * Math.min(1, aspect))));
      simH = Math.max(120, Math.round(simW / aspect));
      freeTargets();
      simA = makeTarget(simW, simH);
      simB = makeTarget(simW, simH);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const queueDrop = (x, y, strength) => {
      drop = [x, y, Math.min(strength + drop[2], 0.9)];
    };

    const onPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      let strength = 0.16;
      if (lastMX !== null) {
        const dx = x - lastMX;
        const dy = y - lastMY;
        strength = Math.min(0.12 + Math.hypot(dx, dy) * 9.0, 0.65);
      }
      lastMX = x;
      lastMY = y;
      queueDrop(x, y, strength);
    };
    const onLeave = () => {
      lastMX = null;
      lastMY = null;
    };
    hero.addEventListener('pointermove', onPointer, { passive: true });
    hero.addEventListener('pointerleave', onLeave, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    const step = (src, dst, withDrop) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, simW, simH);
      gl.useProgram(simProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform1i(simU.prev, 0);
      gl.uniform2f(simU.texel, 1 / simW, 1 / simH);
      gl.uniform4f(simU.drop, withDrop ? drop[0] : 0, withDrop ? drop[1] : 0, withDrop ? drop[2] : 0, simW / simH);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const draw = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(drawProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, simB.tex);
      gl.uniform1i(drawU.sim, 0);
      gl.uniform2f(drawU.texel, 1 / simW, 1 / simH);
      gl.uniform2f(drawU.res, canvas.width, canvas.height);
      gl.uniform1f(drawU.time, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;

      /* ambient rain keeps the surface alive without input */
      ambientIn -= dt;
      if (ambientIn <= 0) {
        queueDrop(0.08 + Math.random() * 0.84, 0.08 + Math.random() * 0.84, 0.16 + Math.random() * 0.24);
        ambientIn = 1.2 + Math.random() * 1.6;
      }

      step(simA, simB, true); // consume the queued drop
      const t = simA;
      simA = simB;
      simB = t;
      step(simA, simB, false);
      const t2 = simA;
      simA = simB;
      simB = t2;
      drop = [0, 0, 0];
      draw();
    }

    if (REDUCED) {
      /* calm static water: pre-settle a few drops, then freeze */
      for (let i = 0; i < 6; i++) {
        drop = [0.15 + Math.random() * 0.7, 0.15 + Math.random() * 0.7, 0.3];
        step(simA, simB, true);
        const t = simA;
        simA = simB;
        simB = t;
        drop = [0, 0, 0];
      }
      draw();
    } else {
      running = true;
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      ro.disconnect();
      io.disconnect();
      hero.removeEventListener('pointermove', onPointer);
      hero.removeEventListener('pointerleave', onLeave);
      freeTargets();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <canvas className="hero-water" ref={canvasRef} aria-hidden="true" />;
}
