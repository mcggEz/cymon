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
        if (d.announcements) {
          const mapped = d.announcements.map((a) => ({
            category: a.type ? a.type.toUpperCase() : 'PROMOTION',
            date: a.publish_date ? new Date(a.publish_date).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.') : '',
            title: a.title,
            body: a.body,
          }))
          setAnnouncements(mapped)
        }
      })
      .catch((err) => {
        console.error('Failed to load announcements:', err)
        if (on) setAnnouncements([])
      })
    return () => {
      on = false
    }
  }, [])

  return (
    <main id="top" className="min-h-screen bg-cream text-charcoal overflow-x-hidden selection:bg-violet selection:text-white">
      {/* Custom float animation styles */}
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
        {/* Floating cute graphics */}
        {/* Smiling Cloud (Left) */}
        <div className="absolute left-[6%] top-[24%] hidden lg:block select-none pointer-events-none z-10 animate-custom-float">
          <svg width="100" height="75" viewBox="0 0 80 60" fill="none">
            <path d="M50 15c8-1 15 5 15 13 0 1-.1 2-.2 3 5 1 8.2 6 8.2 11 0 6-5.8 11-13 11H20c-7.2 0-13-5-13-11 0-5 3.2-10 8.2-11-.1-1-.2-2-.2-3 0-8 7-14 15-13 3 0 6.5 1 9.5 3 3-2 6.5-3 10.5-3z" fill="#ffffff" opacity="0.85" />
            <circle cx="33" cy="37" r="1.8" fill="#4c3cb5" />
            <circle cx="47" cy="37" r="1.8" fill="#4c3cb5" />
            <path d="M38 41c1.2 1.5 2.8 1.5 4 0" stroke="#4c3cb5" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="29" cy="39" r="2.5" fill="#fca5a5" opacity="0.7" />
            <circle cx="51" cy="39" r="2.5" fill="#fca5a5" opacity="0.7" />
          </svg>
        </div>

        {/* Smiling Yellow Sparkle (Right) */}
        <div className="absolute right-[10%] top-[25%] hidden lg:block select-none pointer-events-none z-10 animate-custom-float-delay-1">
          <svg width="55" height="55" viewBox="0 0 40 40" fill="none">
            <path d="M20 0l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" fill="#facc15" />
            <circle cx="17" cy="15" r="1" fill="#78350f" />
            <circle cx="23" cy="15" r="1" fill="#78350f" />
            <path d="M19 18c0.5 0.5 1.5 0.5 2 0" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>

        {/* Smiling Pink Heart Balloon (Left-Bottom) */}
        <div className="absolute left-[12%] bottom-[18%] hidden lg:block select-none pointer-events-none z-10 animate-custom-float-delay-2">
          <svg width="60" height="80" viewBox="0 0 45 60" fill="none">
            <path d="M22.5 40c-15-12-18-28-5-34 8-4 13 2 13 2s5-6 13-2c13 6 10 22-5 34z" fill="#f472b6" />
            <path d="M22.5 40c0 6-2.5 14-6 18" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="20" r="1.5" fill="#ffffff" />
            <circle cx="28" cy="20" r="1.5" fill="#ffffff" />
            <path d="M20 24c0.8 1 2.2 1 3 0" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Two restrained ambient glows — depth without noise */}
        <div
          className="pointer-events-none absolute -right-40 -top-24 h-[520px] w-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(165,122,255,0.16) 0%, rgba(23,20,31,0) 70%)' }}
        />
        <div
          className="pointer-events-none absolute -left-32 bottom-[-18%] h-[460px] w-[460px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(221,128,188,0.10) 0%, rgba(23,20,31,0) 70%)' }}
        />

        <div className="relative z-20 mx-auto w-full max-w-4xl py-12 text-center flex flex-col items-center">
          <h1 className="font-sans text-4xl font-normal leading-[1.03] tracking-tight text-white min-[360px]:text-5xl sm:text-6xl lg:text-7xl">
            Clarity of Mind, <span className="text-violet">Journey to Wellness.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Empowering children, families, and adults with compassionate, professional, and evidence-based mental health care, psychological evaluations, and pediatric developmental therapies.
          </p>

          <div className="mt-9 flex flex-col gap-3 min-[360px]:flex-row min-[360px]:items-center justify-center">
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
      </section>

      {/* Intro Section */}
      <section className="bg-cream py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-tight max-w-4xl mb-16">
            Empowering growth and emotional well-being through integrated multi-specialty care.
          </h2>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 text-[#1a191f] leading-relaxed text-base md:text-lg mb-20 font-light">
            <p>
              At ClearMind Psychological Services, we believe that achieving optimal mental wellness and developmental growth requires a collaborative circle of support. Our dedicated team brings together clinical psychologists, psychometricians, speech-language pathologists, and occupational therapists to guide clients of all ages through customized, compassionate care pathways.
            </p>
            <p>
              From detailed psychological evaluations and diagnostic assessments to specialized pediatric intervention programs and classroom integration planning, we coordinate closely with families to ensure every milestone is supported. We create a safe, warm environment where clients and caregivers are equipped to thrive.
            </p>
          </div>

          {/* Image Montage (Interactive 3D Flipping Photo Cards) */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch pb-12">
            {/* Flip Card 1 */}
            <div className="group [perspective:1000px] min-h-[350px] md:min-h-[450px]">
              <div className="relative h-full w-full rounded-2xl shadow-md transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer">
                {/* Front Side */}
                <div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] overflow-hidden">
                  <img src="/front.jpg" alt="Comprehensive Clinical Evaluations" className="h-full w-full object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                {/* Back Side */}
                <div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden">
                  <img src="/back.jpg" alt="Pediatric Developmental Services" className="h-full w-full object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/25" />
                </div>
              </div>
            </div>

            {/* Flip Card 2 */}
            <div className="group [perspective:1000px] min-h-[350px] md:min-h-[450px] md:translate-y-8">
              <div className="relative h-full w-full rounded-2xl shadow-md transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer">
                {/* Front Side */}
                <div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] overflow-hidden">
                  <img src="/front2.png" alt="Speech & Language Intervention" className="h-full w-full object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                {/* Back Side */}
                <div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden">
                  <img src="/back2.jpg" alt="Occupational Therapy & Play" className="h-full w-full object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/25" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cute Potted Plant Graphic */}
        <div className="absolute right-[4%] bottom-[5%] hidden xl:block select-none pointer-events-none animate-custom-float">
          <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
            {/* Pot */}
            <path d="M35 70l5 22h20l5-22H35z" fill="#f97316" />
            <path d="M32 66h36v5H32v-5z" fill="#ea580c" />
            {/* Soil */}
            <ellipse cx="50" cy="66" rx="15" ry="3" fill="#78350f" />
            {/* Leaves */}
            <path d="M50 66 Q40 40 25 38 Q42 50 50 66z" fill="#22c55e" />
            <path d="M50 66 Q60 40 75 38 Q58 50 50 66z" fill="#22c55e" />
            <path d="M50 66 Q50 30 50 20 Q55 35 50 66z" fill="#4ade80" />
            {/* Face on Pot */}
            <circle cx="45" cy="80" r="1.5" fill="#ffffff" />
            <circle cx="55" cy="80" r="1.5" fill="#ffffff" />
            <path d="M48 83c1 1 3 1 4 0" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
          </svg>
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

      {/* Appointments Section */}
      <section id="appointments" className="bg-[#24212a] text-white py-16 px-6 lg:px-16 relative overflow-hidden border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-violet font-mono tracking-widest text-xs uppercase block">START YOUR JOURNEY</span>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              Ready to begin your journey to wellness?
            </h2>
          </div>
          <div>
            <a
              href="https://www.clearmindpsychservices.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#24212a] hover:bg-violet hover:text-white transition-all shadow-lg shrink-0 cursor-pointer group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>


      {/* Footer (Recreation of LESA.app website footer style) */}
      <footer id="contact" className="relative text-white pt-20 pb-8 px-6 lg:px-16 overflow-hidden border-t border-white/5 flex flex-col items-center" style={{ background: 'linear-gradient(155deg, #17141f 0%, #221a37 55%, #2b1c44 100%)' }}>
        {/* Abstract background curves */}
        <svg className="absolute left-0 top-6 w-56 h-56 opacity-30 select-none pointer-events-none" viewBox="0 0 100 100" fill="none">
          <path d="M-10 30 Q35 45 65 15" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          <path d="M-5 60 Q40 50 70 75" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <svg className="absolute right-0 top-6 w-56 h-56 opacity-30 select-none pointer-events-none" viewBox="0 0 100 100" fill="none">
          <path d="M110 30 Q65 45 35 15" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          <path d="M105 60 Q60 50 30 75" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" />
        </svg>

        {/* Left Character (Kid reading book) */}
        <div className="absolute left-10 bottom-24 w-52 h-52 hidden xl:block select-none pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            {/* Body/Shirt */}
            <path d="M32 68c2 4 10 16 12 18h12c2-2 10-14 12-18H32z" fill="#4f46e5" />
            {/* Scarf */}
            <path d="M30 62c4-2 26-2 30 0v6H30v-6z" fill="#4ade80" />
            {/* Head */}
            <circle cx="45" cy="46" r="16" fill="#fed7aa" />
            {/* Cap */}
            <path d="M31 38c0-8 6-13 14-13s14 5 14 13H31z" fill="#22c55e" />
            <circle cx="45" cy="23" r="2.5" fill="#f87171" />
            {/* Eyes */}
            <circle cx="39" cy="44" r="2" fill="#1e293b" />
            <circle cx="51" cy="44" r="2" fill="#1e293b" />
            {/* Blush */}
            <circle cx="36" cy="49" r="2.5" fill="#fca5a5" opacity="0.6" />
            <circle cx="54" cy="49" r="2.5" fill="#fca5a5" opacity="0.6" />
            {/* Smile */}
            <path d="M42 50c1.5 2 4.5 2 6 0" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
            {/* Hands & Book */}
            <circle cx="28" cy="74" r="4" fill="#fed7aa" />
            <circle cx="62" cy="74" r="4" fill="#fed7aa" />
            <path d="M26 78l16-9 4 3v10l-4-2-16 8V78z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M64 78l-16-9-4 3v10l4-2 16 8V78z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Right Character (Kid waving) */}
        <div className="absolute right-10 bottom-24 w-52 h-52 hidden xl:block select-none pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            {/* Left Arm */}
            <path d="M35 62c-2 2-8 12-10 14s-3 1-3-2 6-16 8-18c1-1 3 0 5 6z" fill="#fed7aa" />
            {/* Shirt */}
            <path d="M36 67c0 5 12 18 14 18s14-13 14-18H36z" fill="#facc15" />
            {/* Head */}
            <circle cx="50" cy="50" r="16" fill="#fed7aa" />
            {/* Hair */}
            <path d="M34 44c0-9 7-15 16-15s16 6 16 15c0 1-3-3-5-3s-5 2-10 0-7-3-7-3s-2 5-6 3z" fill="#78350f" />
            {/* Eyes */}
            <circle cx="44" cy="48" r="2" fill="#1e293b" />
            <circle cx="56" cy="48" r="2" fill="#1e293b" />
            {/* Blush */}
            <circle cx="41" cy="52" r="2.5" fill="#fca5a5" opacity="0.6" />
            <circle cx="59" cy="52" r="2.5" fill="#fca5a5" opacity="0.6" />
            {/* Smile */}
            <path d="M47 54c1 2 5 2 6 0" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
            {/* Waving Arm */}
            <path d="M64 62c2-2 12-18 14-18s4 2 2 4-10 18-12 20c-1 1-3 0-4-6z" fill="#fed7aa" />
            <circle cx="79" cy="41" r="3" fill="#fed7aa" />
          </svg>
        </div>

        {/* Content wrapper */}
        <div className="relative max-w-lg w-full z-10 flex flex-col items-center text-center space-y-8 pb-10">
          {/* Headline */}
          <h3 className="text-xl md:text-2xl font-bold tracking-tight max-w-md leading-snug">
            Begin your child's journey to growth. Sign up for clinical updates!
          </h3>

          {/* Stacking Form */}
          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!') }} className="w-full max-w-sm flex flex-col items-center">
            <input
              type="email"
              placeholder="Your email address....."
              required
              className="w-full h-12 text-center rounded-2xl border border-white/20 bg-white/10 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            <button
              type="submit"
              className="w-full h-12 mt-3 rounded-2xl bg-[#5fa2a2] hover:bg-[#4d9090] text-[#1a144e] font-bold text-sm tracking-wide shadow-md transition-colors cursor-pointer"
            >
              Join the waitlist
            </button>
          </form>

          {/* Socials & Phone block */}
          <div className="flex flex-col items-center space-y-3 pt-2 text-sm font-medium">
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
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
            <a href="#news" className="hover:text-white transition-colors font-medium text-white/95">Announcements</a>
            <a href="#appointments" className="hover:text-white transition-colors">Appointments</a>
          </div>
        </div>

        {/* Large watermark text at the bottom */}
        <div className="w-full relative select-none pointer-events-none mt-auto flex flex-col items-center">
          <div className="text-[17vw] font-black text-white opacity-20 leading-none tracking-tighter uppercase select-none font-sans text-center mt-6 select-none pointer-events-none">
            CLEARMIND
          </div>

          {/* Split info overlays on top of giant letters */}
          <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 z-10 text-[11px] font-mono tracking-wide text-white/70 absolute bottom-2 left-0 right-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-white uppercase tracking-wider">Accredited Psychological Services Clinic</span>
            </div>
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
