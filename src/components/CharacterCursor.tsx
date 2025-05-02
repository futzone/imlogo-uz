'use client';
import React, { useEffect, useRef } from 'react';

interface Particle {
  rotationSign: number;
  age: number;
  initialLifeSpan: number;
  lifeSpan: number;
  velocity: { x: number; y: number };
  position: { x: number; y: number };
  canv: HTMLCanvasElement;
  update: (context: CanvasRenderingContext2D) => void;
}

interface CharacterCursorProps {
  characters?: string[];
  colors?: string[];
  cursorOffset?: { x: number; y: number };
  font?: string;
  characterLifeSpanFunction?: () => number;
  initialCharacterVelocityFunction?: () => { x: number; y: number };
  characterVelocityChangeFunctions?: {
    x_func: (age: number, lifeSpan: number) => number;
    y_func: (age: number, lifeSpan: number) => number;
  };
  characterScalingFunction?: (age: number, lifeSpan: number) => number;
  characterNewRotationDegreesFunction?: (
    age: number,
    lifeSpan: number
  ) => number;
  wrapperElement?: HTMLElement;
}

const CharacterCursor: React.FC<CharacterCursorProps> = ({
  characters = ['h', 'e', 'l', 'l', 'o'],
  colors = ['#6622CC', '#A755C2', '#B07C9E', '#B59194', '#D2A1B8'],
  cursorOffset = { x: 0, y: 0 },
  font = '15px serif',
  characterLifeSpanFunction = () => Math.floor(Math.random() * 60 + 80),
  initialCharacterVelocityFunction = () => ({
    x: (Math.random() < 0.5 ? -1 : 1) * Math.random() * 5,
    y: (Math.random() < 0.5 ? -1 : 1) * Math.random() * 5,
  }),
  characterVelocityChangeFunctions = {
    x_func: () => (Math.random() < 0.5 ? -1 : 1) / 30,
    y_func: () => (Math.random() < 0.5 ? -1 : 1) / 15,
  },
  characterScalingFunction = (age, lifeSpan) =>
    Math.max(((lifeSpan - age) / lifeSpan) * 2, 0),
  characterNewRotationDegreesFunction = (age, lifeSpan) => (lifeSpan - age) / 5,
  wrapperElement,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const cursorRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const canvImagesRef = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    let canvas: HTMLCanvasElement | null = null;
    let context: CanvasRenderingContext2D | null = null;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const randomPositiveOrNegativeOne = () => (Math.random() < 0.5 ? -1 : 1);

    class Particle {
      rotationSign: number;
      age: number;
      initialLifeSpan: number;
      lifeSpan: number;
      velocity: { x: number; y: number };
      position: { x: number; y: number };
      canv: HTMLCanvasElement;

      constructor(x: number, y: number, canvasItem: HTMLCanvasElement) {
        const lifeSpan = characterLifeSpanFunction();
        this.rotationSign = randomPositiveOrNegativeOne();
        this.age = 0;
        this.initialLifeSpan = lifeSpan;
        this.lifeSpan = lifeSpan;
        this.velocity = initialCharacterVelocityFunction();
        this.position = {
          x: x + cursorOffset.x,
          y: y + cursorOffset.y,
        };
        this.canv = canvasItem;
      }

      update(context: CanvasRenderingContext2D) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.lifeSpan--;
        this.age++;

        this.velocity.x += characterVelocityChangeFunctions.x_func(
          this.age,
          this.initialLifeSpan
        );
        this.velocity.y += characterVelocityChangeFunctions.y_func(
          this.age,
          this.initialLifeSpan
        );

        const scale = characterScalingFunction(this.age, this.initialLifeSpan);

        const degrees =
          this.rotationSign *
          characterNewRotationDegreesFunction(this.age, this.initialLifeSpan);
        const radians = degrees * 0.0174533;

        context.translate(this.position.x, this.position.y);
        context.rotate(radians);

        context.drawImage(
          this.canv,
          (-this.canv.width / 2) * scale,
          -this.canv.height / 2,
          this.canv.width * scale,
          this.canv.height * scale
        );

        context.rotate(-radians);
        context.translate(-this.position.x, -this.position.y);
      }
    }

    const init = () => {
      if (prefersReducedMotion.matches) {
        console.log(
          'This browser has prefers reduced motion turned on, so the cursor did not init'
        );
        return false;
      }

      canvas = canvasRef.current;
      if (!canvas) return;

      context = canvas.getContext('2d');
      if (!context) return;

      canvas.style.top = '0px';
      canvas.style.left = '0px';
      canvas.style.pointerEvents = 'none';

      if (wrapperElement) {
        canvas.style.position = 'absolute';
        wrapperElement.appendChild(canvas);
        canvas.width = wrapperElement.clientWidth;
        canvas.height = wrapperElement.clientHeight;
      } else {
        canvas.style.position = 'fixed';
        document.body.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;
      }

      context.font = font;
      context.textBaseline = 'middle';
      context.textAlign = 'center';

      characters.forEach((char) => {
        // ----- TUZATISH BU YERDA -----
        const measurements = context!.measureText(char); // context null bo'lmasligiga ishonch hosil qilish uchun ! qo'shdim (agar init to'g'ri ishlasa)
        const bgCanvas = document.createElement('canvas');
        const bgContext = bgCanvas.getContext('2d');
        // ----- TUZATISH SHU YERGACHA -----

        if (bgContext) {
          bgCanvas.width = measurements.width;
          bgCanvas.height = measurements.actualBoundingBoxAscent * 2.5;

          bgContext.textAlign = 'center';
          bgContext.font = font;
          bgContext.textBaseline = 'middle';
          // ----- TUZATISH BU YERDA -----
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          // ----- TUZATISH SHU YERGACHA -----
          bgContext.fillStyle = randomColor;

          bgContext.fillText(
            char,
            bgCanvas.width / 2,
            measurements.actualBoundingBoxAscent
          );

          canvImagesRef.current.push(bgCanvas);
        }
      });

      bindEvents();
      loop();
      return true; // init muvaffaqiyatli bo'lsa true qaytarish (ixtiyoriy)
    };

    const bindEvents = () => {
      const element = wrapperElement || document.body;
      element.addEventListener('mousemove', onMouseMove);
      element.addEventListener('touchmove', onTouchMove, { passive: true });
      element.addEventListener('touchstart', onTouchMove, { passive: true });
      window.addEventListener('resize', onWindowResize);
    };

    const onWindowResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      if (!canvasRef.current) return;

      if (wrapperElement) {
        canvasRef.current.width = wrapperElement.clientWidth;
        canvasRef.current.height = wrapperElement.clientHeight;
      } else {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        for (let i = 0; i < e.touches.length; i++) {
          addParticle(
            e.touches[i].clientX,
            e.touches[i].clientY,
            canvImagesRef.current[
              Math.floor(Math.random() * canvImagesRef.current.length)
            ]
          );
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (wrapperElement) {
        const boundingRect = wrapperElement.getBoundingClientRect();
        cursorRef.current.x = e.clientX - boundingRect.left;
        cursorRef.current.y = e.clientY - boundingRect.top;
      } else {
        cursorRef.current.x = e.clientX;
        cursorRef.current.y = e.clientY;
      }

      addParticle(
        cursorRef.current.x,
        cursorRef.current.y,
        canvImagesRef.current[Math.floor(Math.random() * characters.length)]
      );
    };

    const addParticle = (x: number, y: number, img: HTMLCanvasElement) => {
      particlesRef.current.push(new Particle(x, y, img));
    };

    const updateParticles = () => {
      if (!canvas || !context) return;

      if (particlesRef.current.length === 0) {
        // Agar zarralar qolmagan bo'lsa ham canvasni tozalash mantiqan to'g'ri
        // context.clearRect(0, 0, canvas.width, canvas.height); // <-- Kerak bo'lsa buni yoqing
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Update
      for (let i = 0; i < particlesRef.current.length; i++) {
        particlesRef.current[i].update(context);
      }

      // Remove dead particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        if (particlesRef.current[i].lifeSpan < 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Agar tozalashdan keyin zarralar qolmagan bo'lsa, yana tozalash
      // Bu oxirgi zarracha o'chganda canvas toza bo'lishini ta'minlaydi
      if (particlesRef.current.length === 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const loop = () => {
      updateParticles();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    init();

    return () => {
      // O'chirish funksiyasida ham canvas mavjudligini tekshirish
      if (canvas && canvas.parentNode) {
         canvas.parentNode.removeChild(canvas); // remove() o'rniga ishonchliroq usul
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Event listenerlarni o'chirishda ham element mavjudligini tekshirish
      const element = wrapperElement || document.body;
      if (element) {
          element.removeEventListener('mousemove', onMouseMove);
          element.removeEventListener('touchmove', onTouchMove);
          element.removeEventListener('touchstart', onTouchMove);
      }
      window.removeEventListener('resize', onWindowResize);
    };
  }, [
    characters,
    colors,
    cursorOffset,
    font,
    characterLifeSpanFunction,
    initialCharacterVelocityFunction,
    characterVelocityChangeFunctions,
    characterScalingFunction,
    characterNewRotationDegreesFunction,
    wrapperElement,
  ]);

  return <canvas ref={canvasRef} />;
};

export default CharacterCursor;