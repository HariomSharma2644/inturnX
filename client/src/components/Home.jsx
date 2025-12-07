import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { demoLogin, isAuthenticated } = useAuth();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const learningHubRef = useRef(null);
  const projectBuilderRef = useRef(null);
  const battleArenaRef = useRef(null);
  const aiMentorRef = useRef(null);
  const communityRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    // Hero section animation
    gsap.fromTo(
      heroRef.current.children,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.3,
        delay: 0.5,
      }
    );

    // Features section animation
    gsap.fromTo(
      featuresRef.current.children,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // How It Works section animation
    gsap.fromTo(
      howItWorksRef.current.querySelectorAll(".step"),
      { x: -100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        stagger: 0.3,
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Testimonials section animation
    gsap.fromTo(
      testimonialsRef.current.children,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Footer animation
    gsap.fromTo(
      footerRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  const handleDemoLogin = async () => {
    const result = await demoLogin();
    if (result.success) {
      // Navigation will be handled by the auth context
    } else {
      alert('Demo login failed: ' + result.message);
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Fixed Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&h=1080&fit=crop')`,
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <div className="mb-6">
            <span className="inline-block bg-[#14A44D]/20 text-[#14A44D] px-4 py-2 rounded-full text-sm font-medium mb-4">
              🚀 AI-Powered Learning Platform
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Learn. Build. Compete.
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-8">
            India's first AI-powered developer platform that helps you master tech skills, build projects, and prove your potential through coding battles.
          </p>
          <p className="text-gray-400 text-sm mt-6">
            Empowering 21st-century learners with experience-driven education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:from-[#14A44D]/80 hover:to-[#5F2EEA]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105"
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
        </section>

        {/* Learning Hub Section */}
        <section ref={learningHubRef} className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Learning Hub
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Explore AI-curated learning paths across Web Development, Data Science, and Machine Learning. Track your progress, solve challenges, and move from learning to mastery — one milestone at a time.
            </p>
            <Link
              to="/courses"
              className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:from-[#14A44D]/80 hover:to-[#5F2EEA]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105"
            >
              Explore Learning Paths →
            </Link>
          </div>
        </section>

        {/* Project Builder Section */}
        <section ref={projectBuilderRef} className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Project Builder
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              At InturnX, every course ends with a project that mimics real industry challenges — from building a full-stack app to creating AI models. By the end, you don't just complete a course; you build something meaningful.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Earn portfolio-worthy projects that prove your skill.
            </p>
            <Link
              to="/projects"
              className="bg-gradient-to-r from-[#5F2EEA] to-[#FF4B2B] hover:from-[#5F2EEA]/80 hover:to-[#FF4B2B]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#5F2EEA]/40 transition-all duration-300 transform hover:scale-105"
            >
              Start Building →
            </Link>
          </div>
        </section>

        {/* Coding Battle Arena Section */}
        <section ref={battleArenaRef} className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Code. Compete. Conquer.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Challenge your friends or peers in real-time coding duels across multiple languages. Test your logic, speed, and accuracy — and rise to the top of the leaderboard.
            </p>
            <Link
              to="/battle-arena"
              className="bg-gradient-to-r from-[#FF4B2B] to-[#14A44D] hover:from-[#FF4B2B]/80 hover:to-[#14A44D]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#FF4B2B]/40 transition-all duration-300 transform hover:scale-105"
            >
              Join the Battle Arena →
            </Link>
          </div>
        </section>

        {/* AI Mentor Section */}
        <section ref={aiMentorRef} className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI Mentor
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Your personal AI mentor is here to guide you every step of the way — from choosing your next skill to debugging your code. Built using open-source LLMs, it personalizes your journey so you learn smarter, not harder.
            </p>
            <Link
              to="/ai-mentor"
              className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:from-[#14A44D]/80 hover:to-[#5F2EEA]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105"
            >
              Chat with AI Mentor →
            </Link>
          </div>
        </section>

        {/* Community & Leaderboard Section */}
        <section ref={communityRef} className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Community & Leaderboard
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Join a global community of coders learning, building, and competing together. Share progress, compare ranks, and get noticed by top recruiters.
            </p>
            <Link
              to="/leaderboard"
              className="bg-gradient-to-r from-[#5F2EEA] to-[#FF4B2B] hover:from-[#5F2EEA]/80 hover:to-[#FF4B2B]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#5F2EEA]/40 transition-all duration-300 transform hover:scale-105"
            >
              View Leaderboard →
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Why Choose InturnX
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              InturnX isn't just another course platform. It's your personal growth accelerator — where AI mentors you, projects challenge you, and coding battles sharpen you.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2 text-[#14A44D]">Real-world learning through AI-guided paths</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold mb-2 text-[#5F2EEA]">Hands-on experience via live coding and team projects</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold mb-2 text-[#FF4B2B]">Gamified experience with ranks, badges, and rewards</h3>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section ref={howItWorksRef} className="py-20 px-6">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How InturnX Works
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="step text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Assess Your Skills</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our AI analyzes your current programming knowledge, learning style, and career goals
                  to create a personalized learning roadmap tailored just for you.
                </p>
              </div>
              <div className="step text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-[#5F2EEA] to-[#FF4B2B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Learn & Practice</h3>
                <p className="text-gray-300 leading-relaxed">
                  Engage with interactive courses, complete hands-on projects, and participate in
                  real-time coding battles to reinforce your learning and build practical skills.
                </p>
              </div>
              <div className="step text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-[#FF4B2B] to-[#14A44D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">3</span>
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

        {/* Testimonials Section */}
        <section ref={testimonialsRef} className="py-20 px-6">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              What Our Students Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6">
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
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6">
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
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6">
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

        {/* Call to Action Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Turn your learning into action.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Join InturnX today — where coders grow into creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:from-[#14A44D]/80 hover:to-[#5F2EEA]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                to="/courses"
                className="border-2 border-[#14A44D] text-[#14A44D] hover:bg-[#14A44D] hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer ref={footerRef} className="py-10 px-6 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto text-center">
            <div className="mb-6">
              <img src="/inturnx-logo.svg" alt="InturnX Logo" className="h-12 mx-auto mb-4" />
              <p className="text-gray-400">Empowering the next generation of developers with AI-driven learning.</p>
            </div>
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
            <p className="text-gray-500 text-sm">&copy; 2025 InturnX. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
