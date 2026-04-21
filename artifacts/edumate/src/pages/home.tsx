import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Zap,
  Users,
  Trophy,
  ArrowRight,
  Star,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Focus Tracking",
    description: "Intelligent monitoring that adapts to your study patterns and helps you maintain peak concentration.",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  {
    icon: BookOpen,
    title: "Smart Learning System",
    description: "Upload materials, complete Pomodoro sessions, and get auto-generated quizzes to reinforce knowledge.",
    color: "text-cyan-500",
    bg: "bg-cyan-50",
  },
  {
    icon: Users,
    title: "Peer Mentorship",
    description: "Connect with top-performing students who have earned mentor status through consistent focus.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Trophy,
    title: "Rewards System",
    description: "Turn your focus points into real rewards — scholarships, internships, and exclusive coupons.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
];

const steps = [
  { icon: BookOpen, step: "01", title: "Study", desc: "Start a Pomodoro session and upload your study materials." },
  { icon: TrendingUp, step: "02", title: "Earn Points", desc: "Complete sessions and quizzes to accumulate focus points." },
  { icon: Users, step: "03", title: "Mentor Others", desc: "Reach mentor status and guide other students on their journey." },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Computer Science, Year 3",
    text: "EduMate completely changed how I study. The Pomodoro timer keeps me on track and the mentor system is invaluable. I went from struggling to top of my class.",
    rating: 5,
    points: 2840,
  },
  {
    name: "Jake Morrison",
    role: "Physics, Year 2",
    text: "I love the rewards system. Knowing I can redeem my focus points for real opportunities makes every study session feel worthwhile. Best study platform out there.",
    rating: 5,
    points: 1920,
  },
  {
    name: "Aisha Okonkwo",
    role: "Medicine, Year 1",
    text: "The peer mentorship feature is incredible. My mentor Sarah helped me understand complex topics and now I'm paying it forward with my own mentees.",
    rating: 5,
    points: 3510,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-900" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 50%, rgba(6,182,212,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 30%, rgba(139,92,246,0.4) 0%, transparent 50%)"
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 px-4 py-1 text-sm">
            AI-Powered Learning Platform
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Turn Focus into{" "}
            <span className="text-cyan-300">Real Success</span>
          </h1>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered learning, focus tracking, and mentorship — all in one platform. Study smarter, earn rewards, and build a community of achievers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-8 py-3 rounded-xl text-base shadow-lg hover:shadow-xl transition-all hover:bg-primary hover:text-white hover:border-white">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl text-base hover:border-white hover:text-primary hover:bg-white">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="mt-16 flex justify-center gap-12 text-center">
            {[
              { value: "10K+", label: "Active Students" },
              { value: "850+", label: "Expert Mentors" },
              { value: "2M+", label: "Focus Sessions" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-indigo-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-100">Features</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">Everything you need to excel</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for students who are serious about their education and want to turn study time into tangible outcomes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f) => (
            <Card key={f.title} className="group hover:shadow-lg transition-all duration-300 border border-border hover:border-indigo-200">
              <CardContent className="p-8">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-gradient-to-b from-indigo-50/50 to-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-100">How It Works</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple. Effective. Rewarding.</h2>
            <p className="text-muted-foreground text-lg">Three steps to transforming your academic performance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.step} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-300 to-transparent" />
                )}
                <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <step.icon className="h-8 w-8 text-white" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-cyan-400 rounded-full text-xs font-bold text-white flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Preview */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-amber-50 text-amber-700 border-amber-100">Rewards System</Badge>
              <h2 className="text-4xl font-bold mb-6">Your focus earns real opportunities</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Every minute of focused study translates into points that you can redeem for scholarships, internship opportunities, and exclusive discounts from our partners.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Merit Scholarships", points: "5,000 pts", icon: GraduationCap },
                  { label: "Internship Access", points: "3,000 pts", icon: Target },
                  { label: "Partner Coupons", points: "500 pts", icon: Trophy },
                ].map((reward) => (
                  <div key={reward.label} className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <reward.icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{reward.label}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-0">{reward.points}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm text-indigo-200">Your Points</p>
                    <p className="text-3xl font-bold">2,840</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Study Streak", value: "12 days" },
                    { label: "Sessions This Week", value: "14" },
                    { label: "Total Study Hours", value: "67h" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3">
                      <span className="text-indigo-200 text-sm">{stat.label}</span>
                      <span className="font-semibold">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-emerald-300 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Eligible for Internship Access reward</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-400 rounded-2xl opacity-20 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-indigo-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-800 text-indigo-200 border-indigo-700">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">Students who transformed their studies</h2>
            <p className="text-indigo-300 text-lg">Real results from real students.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-indigo-900 border-indigo-800 hover:border-indigo-600 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/50">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-indigo-100 leading-relaxed mb-6 text-sm">"{t.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-indigo-400 text-sm">{t.role}</p>
                    </div>
                    <Badge className="bg-indigo-700 text-cyan-300 border-0 text-xs">
                      {t.points.toLocaleString()} pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start your journey?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of students already transforming their academic performance with EduMate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-white hover:text-primary px-10 py-3 rounded-xl text-base font-semibold shadow-lg shadow-indigo-200">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-10 py-3 rounded-xl text-base hover:bg-black hover:text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <BookOpen className="h-5 w-5" />
            <span>EduMate</span>
          </Link>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          <p className="text-sm text-muted-foreground">&copy; 2026 EduMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
