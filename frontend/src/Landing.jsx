import React, { useEffect, useRef, useState } from "react";
import LoadingBar from "react-top-loading-bar";
import './landing.css';
import { Link } from "react-router-dom";

export const Desktop = () => {
  const particlesContainerRef = useRef(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!particlesContainerRef.current) return;
    
    const container = particlesContainerRef.current;
    const gridSize = 40; // Match grid size from CSS
    const particleCount = 8; // Reduced from 15
    const particles = [];
    const trails = [];
    
    // Clear any existing particles
    container.innerHTML = '';
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'grid-particle';
      
      // Random position on grid lines
      const isHorizontal = Math.random() > 0.5;
      let x, y;
      
      if (isHorizontal) {
        // Horizontal line
        x = Math.floor(Math.random() * window.innerWidth);
        y = Math.floor(Math.random() * (window.innerHeight / gridSize)) * gridSize;
        particle.setAttribute('data-direction', Math.random() > 0.5 ? 'right' : 'left');
      } else {
        // Vertical line
        x = Math.floor(Math.random() * (window.innerWidth / gridSize)) * gridSize;
        y = Math.floor(Math.random() * window.innerHeight);
        particle.setAttribute('data-direction', Math.random() > 0.5 ? 'down' : 'up');
      }
      
      // Set initial position
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      // Track which line the particle is on
      particle.setAttribute('data-is-horizontal', isHorizontal.toString());
      particle.setAttribute('data-grid-line', isHorizontal ? y : x);
      
      // Set random speed
      const speed = 0.7 + Math.random() * 1.3;
      particle.setAttribute('data-speed', speed);
      
      // Counter for direction changes
      particle.setAttribute('data-steps', '0');
      particle.setAttribute('data-max-steps', Math.floor(Math.random() * 100) + 50);
      
      // Set random size/intensity
      const size = 5 + Math.random() * 6;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.opacity = 0.6 + Math.random() * 0.4;
      
      container.appendChild(particle);
      particles.push(particle);
    }
    
    // Animate particles
    let animationId;
    let frameCount = 0;
    
    const animate = () => {
      frameCount++;
      
      particles.forEach(particle => {
        const direction = particle.getAttribute('data-direction');
        const speed = parseFloat(particle.getAttribute('data-speed'));
        const rect = container.getBoundingClientRect();
        const isHorizontal = particle.getAttribute('data-is-horizontal') === 'true';
        const gridLine = parseInt(particle.getAttribute('data-grid-line'));
        
        let x = parseInt(particle.style.left);
        let y = parseInt(particle.style.top);
        
        // Only create trails on some frames for performance
        if (frameCount % 3 === 0) {
          const trail = document.createElement('div');
          trail.className = 'grid-particle-trail';
          trail.style.left = `${x}px`;
          trail.style.top = `${y}px`;
          container.appendChild(trail);
          
          // Limit number of trails for performance
          trails.push(trail);
          if (trails.length > 80) {
            const oldTrail = trails.shift();
            oldTrail.remove();
          }
          
          // Remove trail after animation completes
          setTimeout(() => {
            if (container.contains(trail)) {
              container.removeChild(trail);
            }
          }, 1500);
        }
        
        // Check if we should change direction
        let steps = parseInt(particle.getAttribute('data-steps'));
        const maxSteps = parseInt(particle.getAttribute('data-max-steps'));
        steps++;
        
        if (steps > maxSteps) {
          // Time to potentially change direction
          steps = 0;
          particle.setAttribute('data-max-steps', Math.floor(Math.random() * 100) + 50);
          
          // 25% chance to turn at an intersection
          if (Math.random() < 0.25) {
            // If we're on a horizontal line, turn up or down
            if (isHorizontal) {
              const newDirection = Math.random() > 0.5 ? 'up' : 'down';
              particle.setAttribute('data-direction', newDirection);
              particle.setAttribute('data-is-horizontal', 'false');
              // Snap to nearest grid line
              x = Math.round(x / gridSize) * gridSize;
              particle.setAttribute('data-grid-line', x.toString());
            } else {
              // If we're on a vertical line, turn left or right
              const newDirection = Math.random() > 0.5 ? 'left' : 'right';
              particle.setAttribute('data-direction', newDirection);
              particle.setAttribute('data-is-horizontal', 'true');
              // Snap to nearest grid line
              y = Math.round(y / gridSize) * gridSize;
              particle.setAttribute('data-grid-line', y.toString());
            }
          }
        }
        
        particle.setAttribute('data-steps', steps.toString());
        
        // Move based on direction
        switch(direction) {
          case 'right':
            x += speed;
            if (x > rect.width) x = 0;
            break;
          case 'left':
            x -= speed;
            if (x < 0) x = rect.width;
            break;
          case 'down':
            y += speed;
            if (y > rect.height) y = 0;
            break;
          case 'up':
            y -= speed;
            if (y < 0) y = rect.height;
            break;
        }
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      trails.forEach(trail => {
        if (container.contains(trail)) {
          container.removeChild(trail);
        }
      });
    };
  }, []);

  return (
    <div className="landing-container">
      <LoadingBar 
        color='#6a089e'
        progress={progress}
        onLoaderFinished={() => {setProgress(0)}}
        shadow={false}
      />
      <div className="grid-background" ref={particlesContainerRef}></div>
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Code Translator</h1>
          <p className="hero-subtitle">Translate your code across all languages in a click of a button</p>
          <Link to="/app" className="cta-button">Get Started</Link>
        </div>
        <div className="animation-placeholder">
          {/* Space reserved for 3D animation */}
        </div>
      </div>
    </div>
  );
};

export default Desktop;