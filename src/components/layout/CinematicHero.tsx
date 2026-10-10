import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import videoAsset from "@/assets/ondjala-hero.mp4.asset.json";
import posterAsset from "@/assets/ondjala-hero-poster.jpg.asset.json";

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = motion.matches ? 0 : Math.min(1, Math.max(0, -rect.top / rect.height));
      section.style.setProperty("--hero-shift", `${progress * 110}px`);
      section.style.setProperty("--hero-scale", `${1 + progress * 0.12}`);
      section.style.setProperty("--hero-copy-shift", `${progress * -55}px`);
    };
    const scroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !motion.matches) void video.play().catch(() => setPlaying(false));
      else video.pause();
    }, { threshold: 0.05 });
    const motionChanged = () => {
      if (motion.matches) video.pause();
      else void video.play().catch(() => setPlaying(false));
      update();
    };
    observer.observe(section);
    window.addEventListener("scroll", scroll, { passive: true });
    motion.addEventListener("change", motionChanged);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      motion.removeEventListener("change", motionChanged);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  };

  return (
    <section ref={sectionRef} className="cinematic-hero" aria-label="Ondjala Academy">
      <div className="cinematic-media" aria-hidden="true">
        <video ref={videoRef} poster={posterAsset.url} muted={muted} loop playsInline preload="metadata"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
          <source src={videoAsset.url} type="video/mp4" />
        </video>
      </div>
      <div className="cinematic-shade" />
      <div className="cinematic-inner">
        <div className="cinematic-copy">
          <p className="cinematic-kicker"><span /> Conhecimento em movimento</p>
          <h1>Ondjala<br /><span>Academy.</span></h1>
          <p className="cinematic-slogan">Aprende. Inova. Transforma.<br />Lidera o Futuro.</p>
          <p className="cinematic-description">Formação prática para desenvolver competências, criar oportunidades e transformar conhecimento em resultados.</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/cursos">Explorar cursos <ArrowUpRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/cursos">Inscrever-me</Link>
            </Button>
          </div>
        </div>
        <div className="cinematic-bottom">
          <a href="#areas-formacao" className="cinematic-scroll" aria-label="Ver áreas de formação"><ArrowDown className="size-4" /><span>O teu próximo passo</span></a>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="cinematic-control" onClick={togglePlayback} aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"} title={playing ? "Pausar vídeo" : "Reproduzir vídeo"}>{playing ? <Pause /> : <Play />}</Button>
            <Button variant="ghost" size="icon" className="cinematic-control" onClick={() => setMuted(value => !value)} aria-label={muted ? "Activar som" : "Silenciar vídeo"} title={muted ? "Activar som" : "Silenciar vídeo"}>{muted ? <VolumeX /> : <Volume2 />}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}