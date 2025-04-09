import React, { useState, useRef, useEffect } from "react";
import LoadingBar from "react-top-loading-bar";
import axios from "./utils/axios";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import "./App.css";
import "./landing.css";

const App = () => {
  const particlesContainerRef = useRef(null);
  const [progress, setProgress] = useState(100);

  const [currentLanguage, setCurrentLanguage] = useState("");
  const [code, setCode] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translatedCode, setTranslatedCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentLanguage || !targetLanguage || !code) {
      alert("Please select languages and enter your code");
      return;
    }

    if (currentLanguage === targetLanguage) {
      alert("Source and target languages must be different");
      setCurrentLanguage("");
      setTargetLanguage("");
      setCode("");
      setTranslatedCode("");
      setExplanation("");
      return;
    }

    setIsLoading(true);
    setProgress(30);

    try {
      const response = await axios.post("/api/generate", {
        currentLanguage: currentLanguage,
        code: code,
        targetLanguage: targetLanguage,
      });
      
      setProgress(90);
      console.log(response.data);

      const { Code: translatedCode, Explanation: explanation } = response.data;
      setTranslatedCode(translatedCode || "");
      setExplanation(explanation || "");
      
      setProgress(100);
    } catch (error) {
      console.error("Error generating text:", error);
      alert("Failed to generate text");
      setProgress(100);
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (!translatedCode) return;
    
    navigator.clipboard.writeText(translatedCode)
      .then(() => {
        console.log('Code copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  useEffect(() => {
    if (!particlesContainerRef.current) return;

    const container = particlesContainerRef.current;
    const gridSize = 40; // Match grid size from CSS
    const particleCount = 8; // Reduced from 15
    const particles = [];
    const trails = [];

    // Clear any existing particles
    container.innerHTML = "";

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "grid-particle";

      // Random position on grid lines
      const isHorizontal = Math.random() > 0.5;
      let x, y;

      if (isHorizontal) {
        // Horizontal line
        x = Math.floor(Math.random() * window.innerWidth);
        y =
          Math.floor(Math.random() * (window.innerHeight / gridSize)) *
          gridSize;
        particle.setAttribute(
          "data-direction",
          Math.random() > 0.5 ? "right" : "left"
        );
      } else {
        // Vertical line
        x =
          Math.floor(Math.random() * (window.innerWidth / gridSize)) * gridSize;
        y = Math.floor(Math.random() * window.innerHeight);
        particle.setAttribute(
          "data-direction",
          Math.random() > 0.5 ? "down" : "up"
        );
      }

      // Set initial position
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      // Track which line the particle is on
      particle.setAttribute("data-is-horizontal", isHorizontal.toString());
      particle.setAttribute("data-grid-line", isHorizontal ? y : x);

      // Set random speed
      const speed = 0.7 + Math.random() * 1.3;
      particle.setAttribute("data-speed", speed);

      // Counter for direction changes
      particle.setAttribute("data-steps", "0");
      particle.setAttribute(
        "data-max-steps",
        Math.floor(Math.random() * 100) + 50
      );

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

      particles.forEach((particle) => {
        const direction = particle.getAttribute("data-direction");
        const speed = parseFloat(particle.getAttribute("data-speed"));
        const rect = container.getBoundingClientRect();
        const isHorizontal =
          particle.getAttribute("data-is-horizontal") === "true";
        const gridLine = parseInt(particle.getAttribute("data-grid-line"));

        let x = parseInt(particle.style.left);
        let y = parseInt(particle.style.top);

        // Only create trails on some frames for performance
        if (frameCount % 3 === 0) {
          const trail = document.createElement("div");
          trail.className = "grid-particle-trail";
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
        let steps = parseInt(particle.getAttribute("data-steps"));
        const maxSteps = parseInt(particle.getAttribute("data-max-steps"));
        steps++;

        if (steps > maxSteps) {
          // Time to potentially change direction
          steps = 0;
          particle.setAttribute(
            "data-max-steps",
            Math.floor(Math.random() * 100) + 50
          );

          // 25% chance to turn at an intersection
          if (Math.random() < 0.25) {
            // If we're on a horizontal line, turn up or down
            if (isHorizontal) {
              const newDirection = Math.random() > 0.5 ? "up" : "down";
              particle.setAttribute("data-direction", newDirection);
              particle.setAttribute("data-is-horizontal", "false");
              // Snap to nearest grid line
              x = Math.round(x / gridSize) * gridSize;
              particle.setAttribute("data-grid-line", x.toString());
            } else {
              // If we're on a vertical line, turn left or right
              const newDirection = Math.random() > 0.5 ? "left" : "right";
              particle.setAttribute("data-direction", newDirection);
              particle.setAttribute("data-is-horizontal", "true");
              // Snap to nearest grid line
              y = Math.round(y / gridSize) * gridSize;
              particle.setAttribute("data-grid-line", y.toString());
            }
          }
        }

        particle.setAttribute("data-steps", steps.toString());

        // Move based on direction
        switch (direction) {
          case "right":
            x += speed;
            if (x > rect.width) x = 0;
            break;
          case "left":
            x -= speed;
            if (x < 0) x = rect.width;
            break;
          case "down":
            y += speed;
            if (y > rect.height) y = 0;
            break;
          case "up":
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
      trails.forEach((trail) => {
        if (container.contains(trail)) {
          container.removeChild(trail);
        }
      });
    };
  }, []);

  return (
    <div className="app-content-page">
      <LoadingBar
        color="#aa42f5"
        progress={progress}
        onLoaderFinished={() => {
          setProgress(0);
        }}
        shadow={true}
        height={4}
      />
      <div className="grid-background" ref={particlesContainerRef}></div>
      <div className="app-content">
        <h1 className="app-title">Code Translator</h1>
        
        <div className="language-selector-container">
          <div className="language-selector">
            <label htmlFor="current-language-select">From:</label>
            <select 
              value={currentLanguage} 
              onChange={(e) => setCurrentLanguage(e.target.value)} 
              id="current-language-select" 
              className="language-dropdown"
            >
              <option value="" disabled>Select source language</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="typescript">TypeScript</option>
              <option value="php">PHP</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="ruby">Ruby</option>
            </select>
          </div>
          
          <div className="arrow">→</div>
          
          <div className="language-selector">
            <label htmlFor="target-language-select">To:</label>
            <select 
              value={targetLanguage} 
              onChange={(e) => setTargetLanguage(e.target.value)} 
              id="target-language-select" 
              className="language-dropdown"
            >
              <option value="" disabled>Select target language</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="typescript">TypeScript</option>
              <option value="php">PHP</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="ruby">Ruby</option>
            </select>
          </div>
        </div>

        <div className="code-container">
          <div className="code-editor">
            <h3>Your Code <span className="language-tag">{currentLanguage}</span></h3>
            <textarea 
              placeholder="Paste your code here..." 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              className="code-input"
            ></textarea>
          </div>
          
          <div className="code-output">
            <h3>
              Translated Code 
              <div className="code-header-actions">
                <span className="language-tag">{targetLanguage}</span>
                <button 
                  className="copy-button" 
                  onClick={copyToClipboard}
                  disabled={!translatedCode}
                  title="Copy code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </h3>
            <div className="code-display">
              <SyntaxHighlighter 
                language={targetLanguage.toLowerCase()} 
                style={vscDarkPlus}
                customStyle={{ 
                  margin: 0, 
                  padding: '0.75rem',
                  height: '100%',
                  overflow: 'auto',
                  border: 'none',
                  fontFamily: '"Fira Code", "JetBrains Mono", "Source Code Pro", Consolas, monospace',
                  backgroundColor: 'rgba(19, 18, 29, 0.8)',
                  maxHeight: '280px',
                }}
                showLineNumbers={true}
                wrapLines={false}  
                wrapLongLines={false} 
              >
                {translatedCode || "// Translated code will appear here"}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        {explanation && (
          <div className="explanation-container">
            <h3>Explanation</h3>
            <div className="explanation-content">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="translate-button-container">
          <button 
            className={`cta-button ${isLoading ? 'loading' : ''}`} 
            onClick={handleSubmit}
            disabled={isLoading || !currentLanguage || !targetLanguage || !code}
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
