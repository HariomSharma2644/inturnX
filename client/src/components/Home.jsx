import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FloatingBlobs from "./FloatingBlobs";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const { demoLogin, isAuthenticated } = useAuth();

  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const observerRef = useRef(null);

  // Simulate loading for smooth animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observerRef.current = observer;

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Allow authenticated users to view the home page
  // Remove redirect to dashboard

  const stats = [
    { number: 5000, label: "Active Learners", suffix: "+" },
    { number: 150, label: "AI Models", suffix: "+" },
    { number: 1000, label: "Projects Completed", suffix: "+" },
    { number: 95, label: "Success Rate", suffix: "%" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate stats with smoother intervals
          const interval = setInterval(() => {
            setCurrentStat(prev => {
              if (prev < stats.length - 1) return prev + 1;
              clearInterval(interval);
              return prev;
            });
          }, 1500); // Faster, smoother animation
        }
      },
      { threshold: 0.1 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, [stats.length]);

  const handleDemoLogin = async () => {
    const result = await demoLogin();
    if (result.success) {
      // Navigation will be handled by the auth context
    } else {
      alert('Demo login failed: ' + result.message);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white overflow-hidden transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <FloatingBlobs />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center bg-[#0A0A0A] overflow-hidden pt-20">
        {/* Background overlay to improve contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 z-0"></div>

        {/* Floating background blobs */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#14A44D]/25 blur-[120px] rounded-full z-0 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#5F2EEA]/25 blur-[140px] rounded-full z-0 animate-pulse"></div>

        {/* Foreground content */}
        <div className={`relative z-10 px-6 transition-all duration-1000 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
          <div className="mb-6">
            <span className="inline-block bg-[#14A44D]/20 text-[#14A44D] px-4 py-2 rounded-full text-sm font-medium mb-4">
              🚀 AI-Powered Learning Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Master Coding with
            <span className="block bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          <h2 className="text-xl md:text-3xl font-semibold mb-6 text-gray-200">
            Learn • Compete • Get Hired
          </h2>

          <p className="text-gray-300 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-8">
            InturnX revolutionizes coding education with personalized AI-driven learning paths,
            real-time coding battles, intelligent project feedback, and smart internship matching.
            Join the future of tech education where AI adapts to your learning style.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-[#14A44D]">Personalized Learning</h3>
              <p className="text-sm text-gray-400">AI-tailored courses based on your skills</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-[#5F2EEA]">Real-Time Battles</h3>
              <p className="text-sm text-gray-400">Compete with peers in live coding challenges</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="font-semibold text-[#FF4B2B]">Career Acceleration</h3>
              <p className="text-sm text-gray-400">AI-matched internships and job opportunities</p>
            </div>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-700 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'}`}>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:from-[#14A44D]/80 hover:to-[#5F2EEA]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105 animate-pulse"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:from-[#14A44D]/80 hover:to-[#5F2EEA]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105"
                >
                  Start Your Journey
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-[#14A44D] text-[#14A44D] hover:bg-[#14A44D] hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleDemoLogin}
                  className="bg-gradient-to-r from-[#FF4B2B] to-[#FF8E53] hover:from-[#FF4B2B]/80 hover:to-[#FF8E53]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#FF4B2B]/40 transition-all duration-300 transform hover:scale-105"
                >
                  Try Demo
                </button>
              </>
            )}
          </div>
        </div>

      </section>

      {/* Stats Section */}
      <section id="stats-section" className={`py-20 bg-black/20 backdrop-blur-sm transition-all duration-1000 delay-300 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Our Impact in Numbers
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#14A44D] mb-2 transition-all duration-1000 ease-out">
                  {isVisible && index <= currentStat ? (
                    <span className="counter animate-fade-in-up">
                      {stat.number.toLocaleString()}{stat.suffix}
                    </span>
                  ) : (
                    <span className="animate-fade-in">0{stat.suffix}</span>
                  )}
                </div>
                <p className="text-gray-300 text-lg transition-all duration-500 delay-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-black/20 to-black/40">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent scroll-reveal">
            How InturnX Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF4B2B] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">AI</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Assess Your Skills</h3>
              <p className="text-gray-300 leading-relaxed">
                Our AI analyzes your current programming knowledge, learning style, and career goals
                to create a personalized learning roadmap tailored just for you.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-[#5F2EEA] to-[#FF4B2B] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#14A44D] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🎯</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Learn & Practice</h3>
              <p className="text-gray-300 leading-relaxed">
                Engage with interactive courses, complete hands-on projects, and participate in
                real-time coding battles to reinforce your learning and build practical skills.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-[#FF4B2B] to-[#14A44D] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#5F2EEA] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🚀</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Get Hired</h3>
              <p className="text-gray-300 leading-relaxed">
                Receive AI-powered internship recommendations, get feedback on your projects,
                and connect with top companies looking for talented developers like you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/20 backdrop-blur-sm section-fade-in will-change-transform">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent scroll-reveal">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto scroll-reveal">
              InturnX leverages cutting-edge open-source AI models to provide personalized learning experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold mb-2 text-[#14A44D]">Sentence Transformers</h3>
              <p className="text-gray-400 text-sm">Personalized course recommendations using all-MiniLM-L6-v2</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2 text-[#5F2EEA]">CodeBERT</h3>
              <p className="text-gray-400 text-sm">Advanced code quality analysis and feedback generation</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2 text-[#FF4B2B]">BERT Resume Analyzer</h3>
              <p className="text-gray-400 text-sm">Intelligent skill extraction and internship matching</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2 text-[#FF8E53]">OpenAssistant</h3>
              <p className="text-gray-400 text-sm">Conversational AI mentor for learning guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose InturnX Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-black/40 to-black/20 section-fade-in will-change-transform">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent scroll-reveal">
            Why Choose InturnX?
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="group text-center p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
              <div className="w-20 h-20 bg-[#14A44D]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#14A44D]/30 transition-colors duration-300">
                <svg className="w-10 h-10 text-[#14A44D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">AI-Powered Learning</h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                Personalized course recommendations and intelligent learning paths tailored to your skills and goals.
              </p>
              <div className="text-sm text-[#14A44D] font-medium">Learn at your pace</div>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
              <div className="w-20 h-20 bg-[#5F2EEA]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#5F2EEA]/30 transition-colors duration-300">
                <svg className="w-10 h-10 text-[#5F2EEA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Real-Time Coding Battles</h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                Compete with other students in live coding challenges and improve your programming skills through friendly competition.
              </p>
              <div className="text-sm text-[#5F2EEA] font-medium">Challenge yourself</div>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
              <div className="w-20 h-20 bg-[#FF4B2B]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#FF4B2B]/30 transition-colors duration-300">
                <svg className="w-10 h-10 text-[#FF4B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Smart Internship Matching</h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                AI analyzes your skills and experience to recommend the perfect internship opportunities from top companies.
              </p>
              <div className="text-sm text-[#FF4B2B] font-medium">Launch your career</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm section-fade-in will-change-transform">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent scroll-reveal">
            Built with Modern Technology
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl mb-4">⚛️</div>
              <h3 className="text-lg font-semibold mb-2 text-[#61DAFB]">React 19</h3>
              <p className="text-gray-400 text-sm">Modern frontend framework with hooks and concurrent features</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2 text-[#3178C6]">TypeScript</h3>
              <p className="text-gray-400 text-sm">Type-safe development with Node.js and Express</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl mb-4">🐍</div>
              <h3 className="text-lg font-semibold mb-2 text-[#3776AB]">Python FastAPI</h3>
              <p className="text-gray-400 text-sm">High-performance AI service with async support</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl mb-4">🍃</div>
              <h3 className="text-lg font-semibold mb-2 text-[#47A248]">MongoDB</h3>
              <p className="text-gray-400 text-sm">Flexible NoSQL database for scalable data storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-black/20 to-black/40 section-fade-in will-change-transform">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent scroll-reveal">
            What Our Students Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#14A44D] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  S
                </div>
                <div>
                  <h4 className="font-semibold text-white">Sarah Chen</h4>
                  <p className="text-gray-400 text-sm">Full Stack Developer</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "InturnX's AI recommendations helped me focus on the right technologies. I landed my dream job thanks to their internship matching!"
              </p>
              <div className="flex text-[#14A44D] mt-4">
                ★★★★★
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#5F2EEA] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  M
                </div>
                <div>
                  <h4 className="font-semibold text-white">Marcus Johnson</h4>
                  <p className="text-gray-400 text-sm">AI Engineer</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "The coding battles are addictive! I've improved my problem-solving skills tremendously and learned from amazing peers."
              </p>
              <div className="flex text-[#5F2EEA] mt-4">
                ★★★★★
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#FF4B2B] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  A
                </div>
                <div>
                  <h4 className="font-semibold text-white">Aisha Patel</h4>
                  <p className="text-gray-400 text-sm">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "The AI mentor is like having a personal tutor available 24/7. It explains concepts in ways that finally clicked for me!"
              </p>
              <div className="flex text-[#FF4B2B] mt-4">
                ★★★★★
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#FF4B2B]/20 to-[#5F2EEA]/20 backdrop-blur-sm section-fade-in will-change-transform">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent scroll-reveal">
            Ready to Transform Your Coding Journey?
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto scroll-reveal">
            Join thousands of students who are already learning smarter, coding better, and building brighter futures with InturnX.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-[#14A44D] to-[#14A44D]/80 hover:from-[#14A44D]/80 hover:to-[#14A44D] px-10 py-5 rounded-full text-xl font-semibold shadow-lg hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105"
            >
              🚀 Start Learning Now
            </Link>

            <Link
              to="/learning"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-5 rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              📚 Explore Courses
            </Link>
          </div>

          <div className="text-gray-400 text-sm">
            No credit card required • 7-day free trial • Cancel anytime
          </div>
        </div>
      </section>
    </div>
  );
}
