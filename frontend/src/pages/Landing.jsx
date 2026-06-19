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



const FloralPetal = ({ className = '', style = {} }) => (
  <svg viewBox="0 0 120 120" fill="currentColor" className={className} style={style}>
    <circle cx="60" cy="60" r="10" />
    <path d="M60 50C60 30 80 15 60 0C40 15 60 30 60 50Z" />
    <path d="M60 70C60 90 80 105 60 120C40 105 60 90 60 70Z" />
    <path d="M50 60C30 60 15 40 0 60C15 80 30 60 50 60Z" />
    <path d="M70 60C90 60 105 40 120 60C105 80 90 60 70 60Z" />
    <path d="M53 53C39 39 28 28 17 38C28 48 39 39 53 53Z" />
    <path d="M67 67C81 81 92 92 103 82C92 72 81 81 67 67Z" />
    <path d="M53 67C39 81 28 92 17 82C28 72 39 81 53 67Z" />
    <path d="M67 53C81 39 92 28 103 38C92 48 81 39 67 53Z" />
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
              <div className="font-serif italic text-2xl font-bold">CyMon</div>
              <div className="font-mono text-[10px] tracking-[0.25em] opacity-80 uppercase">// ClearMind</div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-10">
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
            <button
              onClick={() => navigate('/login')}
              className={`text-sm font-semibold tracking-wide hover:text-violet transition-colors duration-300 ${
                scrolled ? 'text-charcoal' : 'text-white'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/setup/personal')}
              className="bg-violet hover:bg-violet-dark text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors duration-300 shadow-sm cursor-pointer"
            >
              Get Started
            </button>
          </nav>

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
      <section className="relative min-h-screen bg-charcoal flex items-center justify-center pt-24 pb-16 px-6 lg:px-16 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -right-40 top-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-violet to-pink opacity-25 blur-[120px] pointer-events-none" />
        <div className="absolute -left-40 bottom-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-violet to-pink opacity-25 blur-[120px] pointer-events-none" />

        {/* Subtle Animated Floral Background Shapes */}
        <FloralPetal className="absolute left-[4%] top-[12%] w-48 h-48 text-violet/5 pointer-events-none animate-float-slow" />
        <FloralPetal className="absolute right-[6%] bottom-[10%] w-56 h-56 text-pink/5 pointer-events-none animate-float-slower" />
        <FloralPetal className="absolute right-[20%] top-[8%] w-32 h-32 text-violet/5 pointer-events-none animate-float-slower" style={{ transform: 'rotate(75deg)' }} />
        <FloralPetal className="absolute left-[18%] bottom-[8%] w-40 h-40 text-pink/5 pointer-events-none animate-float-slow" style={{ transform: 'rotate(-45deg)' }} />
        <FloralPetal className="absolute left-[28%] top-[35%] w-24 h-24 text-pink/4 pointer-events-none animate-float-slower" style={{ transform: 'rotate(30deg)' }} />
        <FloralPetal className="absolute right-[30%] bottom-[30%] w-28 h-28 text-violet/4 pointer-events-none animate-float-slow" style={{ transform: 'rotate(110deg)' }} />
        <FloralPetal className="absolute left-[8%] bottom-[28%] w-36 h-36 text-violet/5 pointer-events-none animate-float-slower" style={{ transform: 'rotate(15deg)' }} />
        <FloralPetal className="absolute right-[8%] top-[28%] w-44 h-44 text-pink/5 pointer-events-none animate-float-slow" style={{ transform: 'rotate(150deg)' }} />

        <div className="max-w-3xl w-full mx-auto text-center space-y-8 relative z-10">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              Compassionate care,<br />
              <span className="text-violet">simplified.</span>
            </h1>
            <p className="text-slate-200 text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
              One secure platform for a child&apos;s entire developmental journey — intake, assessments, interventions, and progress — connecting families and clinicians at ClearMind Psychological Services.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/setup/personal')}
              className="bg-violet hover:bg-violet-dark text-white font-mono text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
            >
              Enroll a Child
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-white/20 hover:border-violet text-white font-mono text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 bg-white/5 hover:bg-white/10"
            >
              Sign In to Portal
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-8 font-mono text-[10px] text-slate-400">
            <span>DATA PRIVACY ACT OF 2012</span>
            <span>NPC CIRCULAR 2023-04</span>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="bg-cream py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-tight max-w-4xl mb-16">
            We are redefining clinical care coordination to empower families and clinicians.
          </h2>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 text-[#1a191f] leading-relaxed text-base md:text-lg mb-20 font-medium">
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
            <span className="text-violet font-mono tracking-widest text-xs uppercase block">// Start Enrollment</span>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">Ready to begin your child&apos;s developmental path?</h2>
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
              <p className="text-slate-700 leading-relaxed">
                Blk 1 Lot 7 Painsville Subdivision,<br />
                Brgy. Banilo, Calauan City,<br />
                Laguna 4025
              </p>
              <a href="mailto:clearmind.psychservices@gmail.com" className="hover:text-violet transition-colors duration-300 font-bold block pt-2 text-charcoal">
                clearmind.psychservices@gmail.com
              </a>
              <a href="tel:+639929184078" className="hover:text-violet transition-colors duration-300 text-charcoal font-medium">
                +63 992-918-4078
              </a>
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
