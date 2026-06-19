import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const Butterfly = ({ className = '', flip = false }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden="true"
  >
    <ellipse cx="60" cy="60" rx="2.5" ry="30" fill="currentColor" />
    <ellipse cx="40" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="80" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="44" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
    <ellipse cx="76" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
  </svg>
)



const Sparkle = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`text-white/50 pointer-events-none animate-pulse ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2Z" />
  </svg>
)

const FeatureItem = ({ n, title, body }) => (
  <div className="border-t border-white/10 pt-5">
    <div className="font-mono text-xs text-violet font-medium">{n}</div>
    <div className="mt-2 text-lg font-bold text-white">{title}</div>
    <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{body}</p>
  </div>
)

const RoleItem = ({ title, body }) => (
  <div className="border-t border-white/10 pt-5">
    <div className="mt-2 text-lg font-bold text-white">{title}</div>
    <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{body}</p>
  </div>
)

function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const carouselRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  const announcements = [
    {
      category: 'ACTIVITY LOG',
      date: '19.06.2026',
      title: 'Daily Activity Logs feature is now live for all enrolled children.',
      body: 'Caregivers can view session outlines, behavioral targets, and clinician notes immediately after checkout.',
    },
    {
      category: 'ASSESSMENT SCORING',
      date: '15.06.2026',
      title: 'MMSE and GARS-3 automated scoring flows implemented.',
      body: 'Psychometricians can score assessments online. The reports are automatically routed to psychologists for approval and digital signing.',
    },
    {
      category: 'CLINICAL COMPLIANCE',
      date: '10.06.2026',
      title: 'Secure record vaults updated for DPA 2012 alignment.',
      body: 'All files, digital consent forms, and developmental rosters are stored using encrypted fields meeting NPC Circular 2023-04 specifications.',
    },
    {
      category: 'SPED PROGRAM',
      date: '05.06.2026',
      title: 'Mainstreaming readiness tracking portal opens for summer session.',
      body: 'Review academic and social criteria milestones to assess a child\'s readiness for mainstream integration with the school partner network.',
    },
    {
      category: 'THERAPIST NETWORK',
      date: '02.06.2026',
      title: 'Multi-specialty caseload assignments for Speech and Occupational therapists.',
      body: 'Assign caseloads and view collaborative clinical summaries between therapists, ensuring zero overlaps in children\'s individual care paths.',
    },
  ]

  return (
    <main id="top" className="min-h-screen bg-cream text-charcoal overflow-x-hidden selection:bg-violet selection:text-white">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-6 px-6 lg:px-16 ${
          scrolled
            ? 'bg-cream/90 backdrop-blur-md shadow-sm py-4 border-b border-charcoal/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a
            href="#top"
            className={`flex items-center space-x-3 transition-colors duration-300 ${
              scrolled ? 'text-charcoal' : 'text-white'
            }`}
          >
            <Butterfly className="h-9 w-9 text-violet" />
            <div className="leading-tight">
              <div className="font-sans text-2xl font-bold tracking-tight">CyMon</div>
              <div className={`font-mono text-[9px] tracking-[0.22em] uppercase transition-colors duration-300 ${
                scrolled ? 'text-charcoal/80' : 'text-slate-200/80'
              }`}>
                // ClearMind
              </div>
            </div>
          </a>

          {/* Desktop Nav in Capsule */}
          <nav className={`hidden md:flex items-center space-x-8 px-6 py-2 rounded-full border transition-all duration-300 ${
            scrolled
              ? 'bg-charcoal/5 border-charcoal/10 text-charcoal'
              : 'bg-white/5 border-white/10 text-slate-200 backdrop-blur-md shadow-sm'
          }`}>
            <a
              href="#platform"
              className={`text-sm font-semibold tracking-wide hover:text-violet transition-colors duration-300 ${
                scrolled ? 'text-charcoal' : 'text-slate-200'
              }`}
            >
              Platform
            </a>
            <a
              href="#portals"
              className={`text-sm font-semibold tracking-wide hover:text-violet transition-colors duration-300 ${
                scrolled ? 'text-charcoal' : 'text-slate-200'
              }`}
            >
              Portals
            </a>
            <a
              href="#news"
              className={`text-sm font-semibold tracking-wide hover:text-violet transition-colors duration-300 ${
                scrolled ? 'text-charcoal' : 'text-slate-200'
              }`}
            >
              Announcements
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/login')}
              className={`text-sm font-semibold hover:text-violet transition-colors duration-300 cursor-pointer ${
                scrolled ? 'text-charcoal' : 'text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/setup/personal')}
              className={`text-sm font-semibold hover:text-violet transition-colors duration-300 cursor-pointer ${
                scrolled ? 'text-charcoal' : 'text-slate-200'
              }`}
            >
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden focus:outline-none z-50 transition-colors ${
              scrolled || mobileMenuOpen ? 'text-charcoal' : 'text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        <div
          className={`fixed inset-0 bg-[#393842]/95 backdrop-blur-sm z-40 transition-all duration-300 flex flex-col items-center justify-center space-y-8 text-center ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <a
            href="#platform"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white text-xl font-semibold tracking-wide hover:text-violet"
          >
            Platform
          </a>
          <a
            href="#portals"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white text-xl font-semibold tracking-wide hover:text-violet"
          >
            Portals
          </a>
          <a
            href="#news"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white text-xl font-semibold tracking-wide hover:text-violet"
          >
            Announcements
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              navigate('/login')
            }}
            className="text-white text-xl font-semibold tracking-wide hover:text-violet"
          >
            Log in
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              navigate('/setup/personal')
            }}
            className="bg-violet hover:bg-violet-dark text-white text-sm font-semibold px-8 py-4 rounded-full transition-colors duration-300 shadow-md cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center pt-32 pb-16 px-6 lg:px-16 overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 50%, #22155c 0%, #0d0721 100%)' }}
      >
        {/* Giant 3D Smooth Glassmorphic Spheres */}
        <div
          className="absolute left-[5%] bottom-[-20%] w-[320px] md:w-[680px] h-[320px] md:h-[680px] rounded-full pointer-events-none z-0 border border-white/5 animate-float-slow"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.15) 0%, rgba(165, 122, 255, 0.1) 40%, rgba(13, 7, 33, 0.8) 80%)',
            boxShadow: 'inset -20px -20px 50px rgba(165, 122, 255, 0.4), inset 20px 20px 50px rgba(255, 255, 255, 0.15), 0 40px 80px rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(5px)',
          }}
        />
        <div
          className="absolute right-[-15%] bottom-[10%] w-[380px] md:w-[720px] h-[380px] md:h-[720px] rounded-full pointer-events-none z-0 border border-white/5 animate-float-slower"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08) 0%, rgba(221, 128, 188, 0.12) 45%, rgba(13, 7, 33, 0.7) 80%)',
            boxShadow: 'inset -25px -25px 60px rgba(221, 128, 188, 0.35), inset 25px 25px 60px rgba(255, 255, 255, 0.08), 0 45px 90px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
          }}
        />
        <div
          className="absolute left-[3%] top-[8%] w-[200px] md:w-[360px] h-[200px] md:h-[360px] rounded-full pointer-events-none z-0 border border-white/5"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08) 0%, rgba(165, 122, 255, 0.08) 50%, rgba(13, 7, 33, 0.8) 90%)',
            boxShadow: 'inset -15px -15px 45px rgba(165, 122, 255, 0.25), inset 15px 15px 45px rgba(255, 255, 255, 0.08), 0 25px 50px rgba(0, 0, 0, 0.4)',
          }}
        />
        <div
          className="absolute right-[5%] top-[-8%] w-[240px] md:w-[480px] h-[240px] md:h-[480px] rounded-full pointer-events-none z-0 border border-white/5"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.08) 0%, rgba(221, 128, 188, 0.08) 45%, rgba(13, 7, 33, 0.75) 80%)',
            boxShadow: 'inset -20px -20px 50px rgba(221, 128, 188, 0.2), inset 20px 20px 50px rgba(255, 255, 255, 0.08), 0 30px 60px rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(2px)',
          }}
        />

        {/* Ambient Sparkles */}
        <Sparkle className="absolute left-[16%] top-[26%] w-3 h-3" />
        <Sparkle className="absolute left-[8%] top-[48%] w-4 h-4" />
        <Sparkle className="absolute right-[30%] top-[32%] w-3.5 h-3.5" style={{ animationDelay: '1s' }} />
        <Sparkle className="absolute right-[14%] top-[45%] w-3 h-3" style={{ animationDelay: '1.5s' }} />
        <Sparkle className="absolute left-[36%] bottom-[35%] w-4 h-4" style={{ animationDelay: '2s' }} />
        <Sparkle className="absolute right-[42%] bottom-[20%] w-3 h-3" style={{ animationDelay: '0.5s' }} />

        <div className="max-w-7xl w-full mx-auto min-h-[calc(100vh-12rem)] flex flex-col justify-between relative z-20">
          {/* Middle-Left Title Block */}
          <div className="flex-1 flex flex-col justify-center text-left py-12 md:py-16">
            <h1 className="text-5xl md:text-[6.5rem] font-light tracking-tight text-white leading-[0.95] max-w-5xl select-none font-sans">
              Compassionate care,<br />
              <span className="text-violet">simplified.</span>
            </h1>
          </div>

          {/* Bottom Grid Layout */}
          <div className="grid md:grid-cols-12 gap-8 items-end w-full">
            {/* Bottom-Left Space (Indicator Removed) */}
            <div className="md:col-span-6" />

            {/* Bottom-Right: Description, Actions & Privacy Notices */}
            <div className="md:col-span-6 flex flex-col items-start md:items-end space-y-6 text-left md:text-right">
              <p className="text-slate-200/90 text-base md:text-lg leading-relaxed max-w-md font-light">
                ClearMind Psychological Services provides compassionate and professional mental health support, tailored to meet the unique needs of individuals, couples, and families.
              </p>
              <div className="flex flex-wrap gap-4 justify-start md:justify-end">
                <button
                  onClick={() => navigate('/setup/personal')}
                  className="bg-violet hover:bg-violet-dark text-white font-sans text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300 shadow-md transform hover:-translate-y-0.5 cursor-pointer font-bold"
                >
                  Enroll a Child
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border border-white/20 hover:border-violet text-white font-sans text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300 bg-white/5 hover:bg-white/10 cursor-pointer font-bold"
                >
                  Sign In
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="bg-cream py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-tight max-w-4xl mb-16">
            We are redefining clinical care coordination to empower families and clinicians.
          </h2>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 text-[#1a191f] leading-relaxed text-base md:text-lg mb-20 font-light">
            <p>
              Current developmental care pathways rely on fragmented intake forms, isolated therapy records, and delayed caregiver communications. Families and clinicians are left struggling to synchronize milestones and manually coordinate critical progress data.
            </p>
            <p>
              CyMon links caregiver intakes, standardized assessment scores, customized clinical interventions, and therapy logs into a single secure platform. We connect caregivers, speech therapists, occupational therapists, and psychologists to ensure seamless developmental tracking.
            </p>
          </div>

          {/* Image Montage (Solid shapes as placeholders + purple circle bg) */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Placeholder 1 */}
            <div className="bg-[#393842] min-h-[300px] md:min-h-[420px] rounded-2xl relative overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-transparent" />
              {/* Purple Circle Background */}
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-violet to-pink shadow-[0_0_50px_rgba(165,122,255,0.45)] transition-transform duration-500 group-hover:scale-110" />
              <span className="absolute bottom-4 left-6 text-white/50 font-mono text-xs">// Caregiver Intake Flow</span>
            </div>

            {/* Placeholder 2 */}
            <div className="bg-[#393842] min-h-[350px] md:min-h-[470px] rounded-2xl relative overflow-hidden flex items-center justify-center group md:translate-y-8">
              <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-transparent" />
              {/* Purple Circle Background */}
              <div className="w-36 h-36 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-violet to-pink shadow-[0_0_60px_rgba(165,122,255,0.45)] transition-transform duration-500 group-hover:scale-110" />
              <span className="absolute bottom-4 left-6 text-white/50 font-mono text-xs">// Clinical Progress Records</span>
            </div>
          </div>
        </div>
      </section>

      {/* About ClearMind Section */}
      <section className="bg-cream py-20 lg:py-32 px-6 lg:px-16 border-t border-charcoal/5">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="space-y-4">
            <span className="text-violet font-mono tracking-widest text-xs uppercase block">// CLINIC PROFILE</span>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
              <h2 className="text-3xl md:text-5xl font-bold text-charcoal tracking-tight">
                Our Foundation, Mission & Values
              </h2>
              <span className="font-mono text-sm text-slate-500 italic">
                &quot;Clarity of Mind. Journey to Wellness.&quot;
              </span>
            </div>
          </div>

          {/* Main Grid: Story + Core Commitments & Approach */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Story, Mission & Vision */}
            <div className="lg:col-span-6 space-y-10">
              <div className="space-y-6 text-slate-700 leading-relaxed font-light text-base md:text-lg">
                <p>
                  <strong>ClearMind Psychological Services</strong> was established on December 18, 2024. The clinic name was inspired through the St. Clare of Assisi, a known saint dedicated to prayer, penance and contemplation.
                </p>
                <p>
                  ClearMind Psychological Services (CMPS) provides professional and compassionate mental health care tailored to individual needs, with expert therapists offering individual therapy, couples counseling, child and adolescent therapy, psychological assessments, and stress management strategies. CMPS is dedicated to helping clients achieve emotional well-being and a clearer mind, supporting clients on their journey to mental wellness.
                </p>
              </div>

              {/* Mission & Vision Cards */}
              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                {/* Mission Card */}
                <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm space-y-3">
                  <div className="text-xs font-mono text-violet uppercase tracking-wider">// MISSION</div>
                  <h3 className="text-xl font-bold text-charcoal">Empowerment & Care</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    To provide compassionate, evidence-based mental health care that empowers individuals, couples, and families to navigate life&apos;s challenges with clarity and confidence. Through personalized therapy, assessments, and wellness, CMPS creates a safe space where healing begins.
                  </p>
                </div>
                {/* Vision Card */}
                <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm space-y-3">
                  <div className="text-xs font-mono text-violet uppercase tracking-wider">// VISION</div>
                  <h3 className="text-xl font-bold text-charcoal">Fostering Growth</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    CMPS envisions a future where mental health is valued as a cornerstone of overall well-being, free from stigma and barriers. By 2030, CMPS is dedicated to being a trusted leader in psychological care, fostering self-awareness, emotional strength, and personal growth province-wide.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Values & Approach */}
            <div className="lg:col-span-6 space-y-12">
              {/* C.L.E.A.R. Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-charcoal border-b border-charcoal/5 pb-3">
                  C.L.E.A.R. <span className="text-slate-400 font-normal text-sm font-sans tracking-wide ml-2">Our Commitments</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl font-bold text-violet font-mono leading-none">C</span>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wide">Compassion</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">We provide a warm, empathetic, and non-judgmental space for healing.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl font-bold text-violet font-mono leading-none">L</span>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wide">Lifelong Growth</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">We promote continuous self-improvement, learning, and personal development.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl font-bold text-violet font-mono leading-none">E</span>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wide">Empowerment</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">We equip individuals with the tools to take charge of their mental well-being.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl font-bold text-violet font-mono leading-none">A</span>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wide">Authenticity</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">We foster genuine connections built on trust, honesty, and integrity.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl font-bold text-violet font-mono leading-none">R</span>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wide">Resilience</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">We empower clients to develop emotional strength and adaptability.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* M.I.N.D. Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-charcoal border-b border-charcoal/5 pb-3">
                  M.I.N.D. <span className="text-slate-400 font-normal text-sm font-sans tracking-wide ml-2">Our Approach</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl font-bold text-violet font-mono leading-none">M</span>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wide">Mindfulness</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">We encourage self-awareness and present-focused growth.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl font-bold text-violet font-mono leading-none">I</span>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wide">Innovation</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">We use evidence-based and evolving psychological practices.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl font-bold text-violet font-mono leading-none">N</span>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wide">Nurturing</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">We support each client&apos;s unique journey toward healing and self-discovery.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl font-bold text-violet font-mono leading-none">D</span>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wide">Dedication</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">We are committed to providing high-quality, ethical, and client-centered care.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rounded Dark Container (Platform and Portals) */}
      <div className="bg-cream pt-10 pb-20">
        <div className="bg-charcoal rounded-[2.5rem] md:rounded-[4rem] text-white py-20 lg:py-32 px-6 lg:px-16 max-w-[96%] mx-auto relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -left-64 -top-64 w-96 h-96 rounded-full bg-gradient-to-tr from-violet to-pink opacity-15 blur-[100px] pointer-events-none" />
          <div className="absolute -right-64 -bottom-64 w-96 h-96 rounded-full bg-gradient-to-tr from-violet to-pink opacity-15 blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-32 relative z-10">
            {/* ROW 1: Platform workflow */}
            <section id="platform" className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Solid Shape Placeholder with Purple Circle Background */}
              <div className="bg-black/30 aspect-[4/3] rounded-2xl flex items-center justify-center relative overflow-hidden group">
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-violet to-pink shadow-[0_0_40px_rgba(165,122,255,0.4)] transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute bottom-4 left-6 text-white/40 font-mono text-xs">// Workflow Visualization</span>
              </div>

              {/* Right content */}
              <div className="space-y-6">
                <span className="text-violet font-mono tracking-widest text-xs uppercase block">// The Platform</span>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">Designed around the clinic&apos;s real workflow.</h2>
                <p className="text-slate-200 leading-relaxed text-base md:text-lg">
                  Every screen mirrors the forms and routines already in use at ClearMind — onboarding takes hours, not weeks. Fully compliant with national standards.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 pt-4">
                  <FeatureItem n="// 01" title="Intake & Profiling" body="Caregivers enter child demographics, guardian verification, and clinical histories in one unified flow." />
                  <FeatureItem n="// 02" title="Standardized Tools" body="Administer MMSE, CAFAT, and GARS-3 with auto-calculated scores, indexes, and indicators." />
                  <FeatureItem n="// 03" title="Reports & Sign-off" body="Draft clinical folders. Psychometricians prepare notes; psychologists approve and digitally sign." />
                  <FeatureItem n="// 04" title="Interventions & Goals" body="Map therapeutic actions, track mainstreaming readiness, and record measurable goals." />
                </div>
              </div>
            </section>

            {/* ROW 2: Care Team Portals */}
            <section id="portals" className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left content */}
              <div className="space-y-6 lg:order-1">
                <span className="text-violet font-mono tracking-widest text-xs uppercase block">// Access Roles</span>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">One record, many hands.</h2>
                <p className="text-slate-200 leading-relaxed text-base md:text-lg">
                  Unique workspace layouts tailored to every clinical and home user role. Ensure secure coordination without compromising security.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 pt-4">
                  <RoleItem title="Caregivers" body="Review daily logs, check clinical progress graphs, track appointments, and view announcements." />
                  <RoleItem title="Psychologists" body="Oversee active caseloads, review automated assessment calculations, and sign-off report drafts." />
                  <RoleItem title="Psychometricians" body="Input clinical tests, manage test batteries, verify intake folders, and compile drafts." />
                  <RoleItem title="Therapists" body="Record session summaries, track monthly behavioral targets, and list therapy actions." />
                </div>
              </div>

              {/* Right Solid Shape Placeholder with Purple Circle Background */}
              <div className="bg-black/30 aspect-[4/3] rounded-2xl flex items-center justify-center relative overflow-hidden group lg:order-2">
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-violet to-pink shadow-[0_0_40px_rgba(165,122,255,0.4)] transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute bottom-4 left-6 text-white/40 font-mono text-xs">// Portal Hierarchy</span>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Announcements Section (Newsroom style) */}
      <section id="news" class="bg-cream py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="space-y-3">
              <span className="text-violet font-mono tracking-widest text-xs uppercase block">// The latest updates</span>
              <div className="flex items-baseline space-x-3">
                <h2 className="text-3xl md:text-5xl font-bold">Announcements</h2>
                <span className="text-slate-400 font-mono text-lg">(05)</span>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-4 mt-6 md:mt-0">
              <div className="flex space-x-2">
                <button
                  onClick={scrollPrev}
                  className="w-10 h-10 rounded-full border border-charcoal/20 hover:border-charcoal flex items-center justify-center text-charcoal transition-colors duration-300 focus:outline-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={scrollNext}
                  className="w-10 h-10 rounded-full border border-charcoal/20 hover:border-charcoal flex items-center justify-center text-charcoal transition-colors duration-300 focus:outline-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal snaps */}
          <div
            ref={carouselRef}
            className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-8"
          >
            {announcements.map((item, index) => (
              <div
                key={index}
                className="min-w-[85%] sm:min-w-[45%] lg:min-w-[31%] bg-white rounded-2xl p-8 flex flex-col justify-between h-[380px] border border-charcoal/5 shadow-sm snap-start group hover:shadow-md transition-shadow duration-300"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>// {item.category}</span>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold leading-snug text-charcoal group-hover:text-violet transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {item.body}
                  </p>
                </div>
                <div className="text-violet font-mono text-xs uppercase tracking-widest flex items-center space-x-1 cursor-pointer hover:underline">
                  <span>View Details</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers style CTA */}
      <section className="bg-charcoal text-white py-16 lg:py-24 px-6 lg:px-16 border-b border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-gradient-to-tr from-violet to-pink opacity-10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 relative z-10">
          <div className="space-y-2">
            <span className="text-violet font-mono tracking-widest text-xs uppercase block">// Start Your Journey</span>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">Ready to begin your journey to wellness?</h2>
          </div>
          <button
            onClick={() => navigate('/setup/personal')}
            className="w-16 h-16 rounded-full bg-violet hover:bg-white text-white hover:text-charcoal flex items-center justify-center transition-colors duration-300 shadow-lg group focus:outline-none"
          >
            <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-cream text-charcoal py-16 lg:py-24 px-6 lg:px-16 border-t border-charcoal/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 md:gap-8 items-start mb-16">
          {/* Col 1: Contact */}
          <div className="space-y-4">
            <span className="text-slate-400 font-mono text-xs uppercase tracking-widest block">// Contact</span>
            <div className="flex flex-col space-y-2 text-sm">
              <div className="font-bold text-charcoal">ClearMind Psychological Services</div>
              <p className="text-slate-700 leading-relaxed font-light">
                Block 1 Lot 7, Palmsville Subdivision,<br />
                Brgy. Banlic, City of Cabuyao,<br />
                Laguna 4025
              </p>
              <a href="mailto:admin@clearmindpsychservices.com" className="hover:text-violet transition-colors duration-300 font-bold block pt-2 text-charcoal">
                admin@clearmindpsychservices.com
              </a>
              <a href="tel:+639929164078" className="hover:text-violet transition-colors duration-300 text-charcoal font-medium">
                +63 992-916-4078
              </a>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-slate-500 font-mono text-xs uppercase tracking-wider">
                <a href="https://www.facebook.com/clearmindpsychservices" target="_blank" rel="noopener noreferrer" className="hover:text-violet transition-colors">
                  Facebook
                </a>
                <span className="text-slate-300">·</span>
                <a href="https://www.instagram.com/clearmindpsychservices" target="_blank" rel="noopener noreferrer" className="hover:text-violet transition-colors">
                  Instagram
                </a>
                <span className="text-slate-300">·</span>
                <a href="https://seriousmd.com" target="_blank" rel="noopener noreferrer" className="hover:text-violet transition-colors">
                  SeriousMD
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-4">
            <span className="text-slate-400 font-mono text-xs uppercase tracking-widest block">// Navigation</span>
            <div className="grid grid-cols-2 gap-2 text-sm font-mono tracking-wider">
              <a href="#top" className="hover:text-violet transition-colors">Home</a>
              <a href="#platform" className="hover:text-violet transition-colors">Platform</a>
              <a href="#portals" className="hover:text-violet transition-colors">Portals</a>
              <a href="#news" className="hover:text-violet transition-colors">Announcements</a>
            </div>
          </div>

          {/* Col 3: Compliance & Social */}
          <div className="space-y-4">
            <span className="text-slate-400 font-mono text-xs uppercase tracking-widest block">// Privacy Compliance</span>
            <p className="text-xs text-slate-700 leading-relaxed">
              This system fully complies with the Data Privacy Act of 2012 (DPA 2012) and National Privacy Commission Circular 2023-04.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center space-x-2 border border-charcoal/20 px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-wider text-charcoal">
                🛡️ Encryption Secured
              </span>
            </div>
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-charcoal/10 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <div className="text-slate-400 font-mono text-xs">
            &copy; 2026 ClearMind Psychological Services · All Rights Reserved
          </div>

          {/* Scroll-to-top */}
          <div className="flex items-center space-x-6">
            <a href="#top" className="flex items-center space-x-2 text-charcoal hover:text-violet transition-colors duration-300">
              <Butterfly className="h-5 w-5 text-violet" />
              <span className="text-sm font-bold tracking-wider">CyMon</span>
            </a>
            <a
              href="#top"
              className="w-10 h-10 rounded-full bg-charcoal hover:bg-violet text-white flex items-center justify-center transition-colors duration-300 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Landing
