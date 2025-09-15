import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Users,
  Zap,
  Sparkles,
  ChevronDown,
  Globe,
  Lock,
  Heart,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useWeb3 } from "../context/Web3Context";

// Simple Three.js scene component for stars background
const StarfieldScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create stars
    const stars: {
      x: number;
      y: number;
      z: number;
      size: number;
      speed: number;
    }[] = [];
    const starCount = 400;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.05 + 0.005,
      });
    }

    // Animation
    let animationFrameId: number;

    const render = () => {
      if (!ctx) return;

      // Clear canvas with fade effect for trails
      ctx.fillStyle = "rgba(8, 8, 22, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        // Move star
        star.z -= star.speed;

        // Reset star if it's too close
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.z = 1000;
          star.size = Math.random() * 1.5 + 0.5;
          star.speed = Math.random() * 0.05 + 0.005;
        }

        // Calculate star position
        const x =
          (star.x - canvas.width / 2) * (1000 / star.z) + canvas.width / 2;
        const y =
          (star.y - canvas.height / 2) * (1000 / star.z) + canvas.height / 2;

        // Draw star if it's in view
        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
          const opacity = 1 - star.z / 1000;
          const radius = star.size * (1 - star.z / 1000);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        } else {
          // Reset if out of view
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.z = 1000;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        background:
          "radial-gradient(ellipse at center, #0f0f23 0%, #080816 70%)",
      }}
    />
  );
};

// Floating particles component
const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 2}px`,
            height: `${Math.random() * 10 + 2}px`,
            backgroundColor: Math.random() > 0.5 ? "#3b82f6" : "#8b5cf6",
            opacity: Math.random() * 0.5 + 0.1,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient text component
const GradientText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  return (
    <span
      className={`bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent bg-300% animate-gradient ${className}`}
    >
      {text}
    </span>
  );
};

const Welcome: React.FC = () => {
  const { isConnected } = useWeb3();
  const [scrollProgress, setScrollProgress] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Decentralized",
      description:
        "Your data belongs to you. Posts are stored on blockchain and IPFS.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Connect with like-minded people in a trustless environment.",
    },
    {
      icon: Zap,
      title: "Modern Experience",
      description:
        "Enjoy a smooth, modern social media experience with 3D elements.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Posts Created" },
    { value: "99.9%", label: "Uptime" },
    { value: "0", label: "Data Breaches" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Scroll progress indicator */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0">
          <StarfieldScene />
          <FloatingParticles />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto px-4 py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4 animate-fade-in">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-white">
                The future of social networking is here
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              Web3
              <span className="block mt-2">
                <GradientText text="Social" />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Decentralized, secure, and owned by the community. Join the
              revolution of social networking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={isConnected ? "/feed" : "/connect"}>
              <Button
                size="lg"
                className="text-lg px-8 py-4 group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 border-0"
              >
                <span className="relative z-10 flex items-center">
                  {isConnected ? "Go to Feed" : "Get Started"}
                  <ArrowRight
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                    size={20}
                  />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>

            <Link to="/explore">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Explore Platform
              </Button>
            </Link>
          </div>

          <div className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Connect your wallet to join the decentralized revolution
          </div>

          <div className="pt-12 animate-bounce">
            <ChevronDown className="mx-auto text-gray-400" size={32} />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-12 bg-gradient-to-b from-gray-900 to-blue-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-colors"
              >
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-20 px-4 relative bg-gradient-to-b from-blue-900/30 to-purple-900/30"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <GradientText text="Web3Social" />?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Experience social media the way it should be - decentralized,
              secure, and user-controlled.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center hover:bg-white/10 transition-all duration-500 transform ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                    <feature.icon className="text-white" size={28} />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-900/30 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Built for the <GradientText text="Future" />
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with user-friendly
              design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Globe className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Global Reach
              </h3>
              <p className="text-gray-300">
                Connect with users worldwide without borders or restrictions.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Lock className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Enhanced Security
              </h3>
              <p className="text-gray-300">
                Military-grade encryption keeps your data safe and secure.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                <Heart className="text-pink-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                User-First Design
              </h3>
              <p className="text-gray-300">
                Intuitive interface designed with your experience in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                backgroundColor: "rgba(255,255,255,0.1)",
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Join the Future?
          </h2>
          <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto">
            Connect your wallet and start building your decentralized social
            presence today.
          </p>
          <Link to="/connect">
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 border-white hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Connect Wallet
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
