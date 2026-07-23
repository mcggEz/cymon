import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

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

// Right-side hero visual: a rotated diamond lattice (the CMPS brand collage
// look) — photo tiles interleaved with solid purple accent diamonds, over a
// purple underlay so the seams read as the purple diagonals in the reference.
// Photos are professional therapy-session stock (Unsplash, free for commercial
// use) served from the Unsplash CDN; a grey gradient shows through if a tile's
// image fails to load.


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

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const intervalId = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 320, behavior: 'smooth' })
      }
    }, 4000)
    return () => clearInterval(intervalId)
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

  const STATIC_ANNOUNCEMENTS = [
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

  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    let on = true
    api.publicAnnouncements()
      .then((d) => {
        if (!on) return
        if (d.announcements && d.announcements.length > 0) {
          const mapped = d.announcements.map((a) => ({
            category: a.type ? a.type.toUpperCase() : 'PROMOTION',
            date: a.publish_date ? new Date(a.publish_date).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.') : '',
            title: a.title,
            body: a.body,
          }))
          setAnnouncements(mapped)
        } else {
          setAnnouncements(STATIC_ANNOUNCEMENTS)
        }
      })
      .catch((err) => {
        console.error('Failed to load announcements:', err)
        if (on) setAnnouncements(STATIC_ANNOUNCEMENTS)
      })
    return () => {
      on = false
    }
  }, [])

  return (
    <main id="top" className="min-h-screen bg-cream text-charcoal overflow-x-hidden selection:bg-violet selection:text-white">
      {/* Custom float animation styles & flip cards */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(4deg); }
        }
        .animate-custom-float {
          animation: customFloat 6s ease-in-out infinite;
        }
        .animate-custom-float-delay-1 {
          animation: customFloat 5s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .animate-custom-float-delay-2 {
          animation: customFloat 7s ease-in-out infinite;
          animation-delay: 3s;
        }
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 1.5rem;
          overflow: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}} />
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
            <img src="/logo-cymon.png" alt="ClearMind" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xl font-bold tracking-wider">ClearMind</span>
          </a>

          {/* Desktop Nav in Capsule */}
          <nav className={`hidden md:flex items-center space-x-8 px-6 py-2 rounded-full border transition-all duration-300 ${
            scrolled
              ? 'bg-charcoal/5 border-charcoal/10 text-charcoal'
              : 'bg-white/5 border-white/10 text-slate-200 backdrop-blur-md shadow-sm'
          }`}>
            <a
              href="#about"
              className={`text-sm font-semibold tracking-wide hover:text-violet transition-colors duration-300 ${
                scrolled ? 'text-charcoal' : 'text-slate-200'
              }`}
            >
              About Us
            </a>
            <a
              href="#news"
              className={`text-sm font-semibold tracking-wide hover:text-violet transition-colors duration-300 ${
                scrolled ? 'text-charcoal' : 'text-slate-200'
              }`}
            >
              Announcements
            </a>
            <a
              href="#appointments"
              className={`text-sm font-semibold tracking-wide hover:text-violet transition-colors duration-300 ${
                scrolled ? 'text-charcoal' : 'text-slate-200'
              }`}
            >
              Appointments
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
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white text-xl font-semibold tracking-wide hover:text-violet"
          >
            About Us
          </a>
          <a
            href="#news"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white text-xl font-semibold tracking-wide hover:text-violet"
          >
            Announcements
          </a>
          <a
            href="#appointments"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white text-xl font-semibold tracking-wide hover:text-violet"
          >
            Appointments
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              navigate('/login')
            }}
            className="bg-violet hover:bg-violet-dark text-white text-sm font-semibold px-8 py-4 rounded-full transition-colors duration-300 shadow-md cursor-pointer"
          >
            Log in
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative flex min-h-screen items-center overflow-hidden px-6 pt-32 pb-20 lg:px-16"
        style={{ background: 'linear-gradient(155deg, #17141f 0%, #221a37 55%, #2b1c44 100%)' }}
      >
        <div className="relative z-20 mx-auto w-full max-w-7xl py-12 flex flex-col items-start justify-center">
          {/* Left-aligned Text Content */}
          <div className="text-left flex flex-col items-start max-w-3xl">
            <h1 className="font-sans text-4xl font-normal leading-[1.03] tracking-tight text-white min-[360px]:text-5xl sm:text-6xl lg:text-7xl">
              Clarity of Mind, <span className="text-violet">Journey to Wellness.</span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
              Empowering children, families, and adults with compassionate, professional, and evidence-based mental health care, psychological evaluations, and pediatric developmental therapies.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-violet px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet/25 transition-colors hover:bg-violet-dark"
              >
                Access Patient Portal
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="bg-cream py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-tight max-w-4xl mb-16">
            Empowering growth and emotional well-being through integrated multi-specialty care.
          </h2>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 text-[#1a191f] leading-relaxed text-base md:text-lg font-light">
            <div className="space-y-8 flex flex-col justify-between">
              <p>
                At ClearMind Psychological Services, we believe that achieving optimal mental wellness and developmental growth requires a collaborative circle of support. Our dedicated team brings together clinical psychologists, psychometricians, speech-language pathologists, and occupational therapists to guide clients of all ages through customized, compassionate care pathways.
              </p>
              {/* Flip Card 1 */}
              <div className="flip-card w-full aspect-[4/3] max-w-lg mx-auto cursor-pointer">
                <div className="flip-card-inner shadow-xl rounded-3xl">
                  <div className="flip-card-front bg-[#1c1233]">
                    <img src="/front.jpg" alt="ClearMind services" className="w-full h-full object-contain" />
                  </div>
                  <div className="flip-card-back bg-[#1c1233]">
                    <img src="/back.jpg" alt="ClearMind detail" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 flex flex-col justify-between">
              <p>
                From detailed psychological evaluations and diagnostic assessments to specialized pediatric intervention programs and classroom integration planning, we coordinate closely with families to ensure every milestone is supported. We create a safe, warm environment where clients and caregivers are equipped to thrive.
              </p>
              {/* Flip Card 2 */}
              <div className="flip-card w-full aspect-[4/3] max-w-lg mx-auto cursor-pointer">
                <div className="flip-card-inner shadow-xl rounded-3xl">
                  <div className="flip-card-front bg-white">
                    <img src="/front2.png" alt="ClearMind team" className="w-full h-full object-contain" />
                  </div>
                  <div className="flip-card-back bg-white">
                    <img src="/back2.jpg" alt="ClearMind clinic" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Our Foundation */}
      <section className="bg-cream py-20 lg:py-28 px-6 lg:px-16 border-t border-charcoal/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-charcoal tracking-tight">
            Our Foundation
          </h2>
          <div className="space-y-6 text-[#1a191f] leading-relaxed text-base md:text-lg font-light max-w-3xl mx-auto">
            <p>
              <strong>ClearMind Psychological Services</strong> was established on December 18, 2024. The clinic name was inspired through the St. Clare of Assisi, a known saint dedicated to prayer, penance and contemplation.
            </p>
            <p>
              CMPS provides professional and compassionate mental health care tailored to individual needs, with expert therapists offering individual therapy, couples counseling, child and adolescent therapy, psychological assessments, and stress management strategies. CMPS is dedicated to helping clients achieve emotional well-being and a clearer mind, supporting clients on their journey to mental wellness.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Mission & Vision */}
      <section className="bg-[#f5ebd7]/50 py-20 lg:py-28 px-6 lg:px-16 border-t border-b border-charcoal/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Mission Card */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-charcoal/5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-mono text-violet uppercase tracking-wider">MISSION</div>
              <h3 className="text-2xl md:text-3xl font-bold text-charcoal">Empowerment & Care</h3>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed font-light">
                To provide compassionate, evidence-based mental health care that empowers individuals, couples, and families to navigate life&apos;s challenges with clarity and confidence. Through personalized therapy, assessments, and wellness, CMPS creates a safe space where healing begins.
              </p>
            </div>
          </div>
          {/* Vision Card */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-charcoal/5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-mono text-violet uppercase tracking-wider">VISION</div>
              <h3 className="text-2xl md:text-3xl font-bold text-charcoal">Fostering Growth</h3>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed font-light">
                CMPS envisions a future where mental health is valued as a cornerstone of overall well-being, free from stigma and barriers. By 2030, CMPS is dedicated to being a trusted leader in psychological care, fostering self-awareness, emotional strength, and personal growth province-wide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: C.L.E.A.R. Commitments */}
      <section className="bg-cream py-20 lg:py-28 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal tracking-tight">Our Commitments</h2>
            <p className="text-xs font-mono text-violet uppercase tracking-widest">C.L.E.A.R.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { letter: 'C', title: 'Compassion', desc: 'We provide a warm, empathetic, and non-judgmental space for healing.' },
              { letter: 'L', title: 'Lifelong Growth', desc: 'We promote continuous self-improvement, learning, and personal development.' },
              { letter: 'E', title: 'Empowerment', desc: 'We equip individuals with the tools to take charge of their mental well-being.' },
              { letter: 'A', title: 'Authenticity', desc: 'We foster genuine connections built on trust, honesty, and integrity.' },
              { letter: 'R', title: 'Resilience', desc: 'We empower clients to develop emotional strength and adaptability.' }
            ].map((item) => (
              <div key={item.letter} className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
                <span className="text-4xl font-black text-violet bg-violet/5 w-16 h-16 rounded-full flex items-center justify-center font-mono">
                  {item.letter}
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-charcoal text-sm uppercase tracking-wide">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: M.I.N.D. Approach */}
      <section className="bg-[#f5ebd7]/30 py-20 lg:py-28 px-6 lg:px-16 border-t border-b border-charcoal/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal tracking-tight">Our Approach</h2>
            <p className="text-xs font-mono text-violet uppercase tracking-widest">M.I.N.D.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { letter: 'M', title: 'Mindfulness', desc: 'We encourage self-awareness and present-focused growth.' },
              { letter: 'I', title: 'Innovation', desc: 'We use evidence-based and evolving psychological practices.' },
              { letter: 'N', title: 'Nurturing', desc: 'We support each client\'s unique journey toward healing and self-discovery.' },
              { letter: 'D', title: 'Dedication', desc: 'We are committed to providing high-quality, ethical, and client-centered care.' }
            ].map((item) => (
              <div key={item.letter} className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
                <span className="text-4xl font-black text-violet bg-violet/5 w-16 h-16 rounded-full flex items-center justify-center font-mono">
                  {item.letter}
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-charcoal text-sm uppercase tracking-wide">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            ))}
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
              {/* ClearMind clinic video */}
              <div className="bg-black/30 aspect-[4/3] rounded-2xl relative overflow-hidden">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube-nocookie.com/embed/J---aiyznGQ"
                  title="ClearMind workflow — placeholder clip"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
                <span className="pointer-events-none absolute bottom-4 left-6 text-white/40 font-mono text-xs">Workflow Visualization</span>
              </div>

              {/* Right content */}
              <div className="space-y-6">
                <span className="text-violet font-mono tracking-widest text-xs uppercase block">Clinical Programs</span>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">Tailored therapeutic pathways.</h2>
                <p className="text-slate-200 leading-relaxed text-base md:text-lg">
                  We deliver integrated pediatric care spanning professional diagnostic evaluation, intensive developmental therapies, and structured educational integration.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 pt-4">
                  <FeatureItem n="01" title="Clinical Intake & Evaluation" body="Thorough intake sessions and diagnostic testing to map cognitive, adaptive, and behavioral baselines." />
                  <FeatureItem n="02" title="Speech-Language Pathology" body="Focused therapy to enhance communication skills, social interaction, and verbal expression." />
                  <FeatureItem n="03" title="Occupational Therapy" body="Sensory integration and fine/gross motor training to help children gain everyday independence." />
                  <FeatureItem n="04" title="Special Education & Milestones" body="Structured milestones tracking and learning plans geared towards mainstream school readiness." />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Announcements Section (Newsroom style) */}
      <section id="news" className="bg-cream py-20 lg:py-32 w-full">
        <div className="w-full">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 px-6 lg:px-16">
            <div className="space-y-3">
              <div className="flex items-baseline space-x-3">
                <h2 className="text-3xl md:text-5xl font-bold">Announcements</h2>
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
            className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-8 px-6 lg:px-16"
          >
            {announcements.map((item, index) => (
              <div
                key={index}
                className="min-w-[85%] sm:min-w-[45%] lg:min-w-[31%] bg-white rounded-2xl p-8 flex flex-col justify-between h-[380px] border border-charcoal/5 shadow-sm snap-start group hover:shadow-md transition-shadow duration-300"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold leading-snug text-charcoal group-hover:text-violet transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {item.body}
                  </p>
                </div>
                <div className="text-violet text-xs uppercase tracking-widest flex items-center space-x-1 cursor-pointer hover:underline">
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

      {/* Footer (Recreation of LESA.app website footer style) */}
      <footer id="appointments" className="relative text-white pt-20 pb-8 px-6 lg:px-16 overflow-hidden border-t border-white/5 flex flex-col items-center" style={{ background: 'linear-gradient(155deg, #17141f 0%, #221a37 55%, #2b1c44 100%)' }}>
        {/* Abstract background curves */}
        <svg className="absolute left-0 top-6 w-56 h-56 opacity-30 select-none pointer-events-none" viewBox="0 0 100 100" fill="none">
          <path d="M-10 30 Q35 45 65 15" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          <path d="M-5 60 Q40 50 70 75" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <svg className="absolute right-0 top-6 w-56 h-56 opacity-30 select-none pointer-events-none" viewBox="0 0 100 100" fill="none">
          <path d="M110 30 Q65 45 35 15" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          <path d="M105 60 Q60 50 30 75" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" />
        </svg>

        {/* Ambient background glows */}
        <div className="absolute left-10 bottom-24 w-64 h-64 rounded-full bg-violet/10 blur-[80px] pointer-events-none hidden xl:block" />
        <div className="absolute right-10 bottom-24 w-64 h-64 rounded-full bg-pink/10 blur-[80px] pointer-events-none hidden xl:block" />

        {/* Content wrapper */}
        <div className="relative max-w-xl w-full z-10 flex flex-col items-center text-center space-y-6 pb-10">
          <span className="text-violet font-mono tracking-widest text-xs uppercase block">START YOUR JOURNEY</span>
          <h3 className="text-2xl md:text-4xl font-bold tracking-tight leading-snug">
            Ready to begin your journey to wellness?
          </h3>
          <a
            href="https://www.clearmindpsychservices.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-3 rounded-full bg-violet px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet/25 transition-all hover:bg-violet-dark cursor-pointer group"
          >
            <span>Book an Appointment</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          {/* Socials & Phone block */}
          <div className="flex flex-col items-center space-y-3 pt-6 text-sm font-medium">
            <a href="https://maps.google.com/?q=ClearMind+Psychological+Services" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline text-center max-w-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>2/F Wellness Building, 123 Harmony Avenue, Quezon City</span>
            </a>
            <a href="tel:+639929164078" className="flex items-center gap-2 hover:underline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +63 992-916-4078
            </a>
            <a href="https://www.facebook.com/clearmindpsychservices" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-white/70">
            <a href="#top" className="hover:text-white transition-colors">Home</a>
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
            <a href="#news" className="hover:text-white transition-colors">Announcements</a>
            <a href="#appointments" className="hover:text-white transition-colors font-medium text-white/95">Appointments</a>
            <a href="https://maps.google.com/?q=ClearMind+Psychological+Services" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Location</a>
          </div>
        </div>

        {/* Large watermark text at the bottom */}
        <div className="w-full relative select-none pointer-events-none mt-auto flex flex-col items-center">
          <div className="text-[17vw] font-black text-white opacity-20 leading-none tracking-tighter uppercase select-none font-sans text-center mt-6 select-none pointer-events-none">
            CLEARMIND
          </div>

          {/* Split info overlays on top of giant letters */}
          <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 z-10 text-[11px] font-mono tracking-wide text-white/70 absolute bottom-2 left-0 right-0">
            <div>
              &copy; 2026 ClearMind. All rights reserved
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Landing
