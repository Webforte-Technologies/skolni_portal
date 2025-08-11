import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import SEOHead from '../components/seo/SEOHead';
import LeadCaptureForm from '../components/landing/LeadCaptureForm';
import { 
  Brain, 
  Calculator, 
  Users, 
  BookOpen, 
  Shield, 
  Star, 
  Check, 
  ArrowRight,
  Play,
  Zap,
  GraduationCap,
  Globe,
  BarChart3,
  MessageSquare,
  FileText,
  Download
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('basic');

  const features = [
    {
      icon: Brain,
      title: 'AI Matematický Asistent',
      description: 'Inteligentní pomocník pro řešení matematických problémů s podrobným vysvětlením kroků',
      color: 'text-blue-600'
    },
    {
      icon: Calculator,
      title: 'Generování Cvičení',
      description: 'Automatické vytváření cvičení a testů podle obtížnosti a tématu',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Spolupráce Učitelů',
      description: 'Sdílení materiálů a zkušeností mezi učiteli napříč školami',
      color: 'text-purple-600'
    },
    {
      icon: BookOpen,
      title: 'Knihovna Materiálů',
      description: 'Rozsáhlá databáze vzdělávacích materiálů a šablon',
      color: 'text-orange-600'
    },
    {
      icon: Shield,
      title: 'Bezpečnost & Soukromí',
      description: 'Ochrana dat studentů a dodržování GDPR standardů',
      color: 'text-red-600'
    },
    {
      icon: BarChart3,
      title: 'Analýza Pokroku',
      description: 'Sledování pokroku studentů a detailní reporty',
      color: 'text-indigo-600'
    }
  ];

  const testimonials = [
    {
      name: 'Mgr. Jana Nováková',
      role: 'Učitelka matematiky',
      school: 'Gymnázium Brno',
      content: 'EduAI-Asistent nám pomohl zlepšit výsledky studentů o 25%. AI vysvětlení jsou jasná a srozumitelná.',
      rating: 5
    },
    {
      name: 'Ing. Petr Svoboda',
      role: 'Ředitel školy',
      school: 'ZŠ Praha 5',
      content: 'Implementace byla jednoduchá a rychlá. Učitelé jsou nadšení z možností spolupráce a sdílení materiálů.',
      rating: 5
    },
    {
      name: 'Mgr. Eva Dvořáková',
      role: 'Učitelka fyziky',
      school: 'Gymnázium Ostrava',
      content: 'Generování cvičení ušetří hodiny příprav. Studenti si mohou procvičovat doma s okamžitou zpětnou vazbou.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Základní',
      price: '0',
      period: 'měsíc',
      description: 'Pro jednotlivé učitele a malé školy',
      features: [
        '5 AI konverzací denně',
        'Základní generování cvičení',
        'Přístup ke knihovně materiálů',
        'Emailová podpora',
        'Základní analýzy'
      ],
      cta: 'Začít zdarma',
      popular: false
    },
    {
      id: 'pro',
      name: 'Profesionální',
      price: '299',
      period: 'měsíc',
      description: 'Pro střední školy a větší týmy',
      features: [
        'Neomezené AI konverzace',
        'Pokročilé generování cvičení',
        'Spolupráce mezi učiteli',
        'Prioritní podpora',
        'Detailní analýzy a reporty',
        'Integrace s LMS systémy',
        'Vlastní šablony a materiály'
      ],
      cta: 'Začít zkušební verzi',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Kontaktujte nás',
      period: '',
      description: 'Pro velké školy a vzdělávací instituce',
      features: [
        'Všechny funkce z Pro plánu',
        'Vlastní AI model',
        'API přístup',
        'Dedikovaný manažer',
        'Školení a implementace',
        'White-label řešení',
        'SLA garantie'
      ],
      cta: 'Kontaktovat',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="EduAI-Asistent - Moderní AI asistent pro matematické vzdělávání"
        description="EduAI-Asistent je moderní AI asistent pro matematické vzdělávání, který pomáhá učitelům vytvářet lepší výukové materiály a studentům lépe pochopit matematiku."
        keywords="AI asistent, matematika, vzdělávání, cvičení, učitelé, školy"
      />
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">EduAI-Asistent</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Funkce
                </a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Ceny
                </a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Reference
                </a>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Přihlásit se
                </Link>
                <Link to="/register-school">
                  <Button variant="primary" size="sm">
                    Registrovat školu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Revoluce ve
              <span className="text-blue-600"> matematickém vzdělávání</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI asistent, který pomáhá učitelům vytvářet lepší výukové materiály a studentům lépe pochopit matematiku
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register-school">
                <Button variant="primary" size="lg" className="flex items-center gap-2">
                  Začít zdarma
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Zobrazit demo
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Bezplatná zkušební verze</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Nastavení za 5 minut</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>24/7 podpora</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proč si vybrat EduAI-Asistent?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kombinujeme nejmodernější AI technologie s osvědčenými pedagogickými principy
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className={`inline-flex p-3 rounded-full bg-gray-100 mb-4 ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Zůstaňte v obraze
            </h2>
            <p className="text-xl text-gray-600">
              Přihlaste se k našemu newsletteru a získejte nejnovější informace o AI ve vzdělávání
            </p>
          </div>
          <LeadCaptureForm
            type="newsletter"
            title="Newsletter EduAI-Asistent"
            description="Dostávejte tipy, novinky a inspiraci pro moderní výuku matematiky"
            className="max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vyzkoušejte si AI asistenta
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Podívejte se, jak snadno může AI pomoci s matematickými problémy
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <span className="text-gray-700 font-medium">Matematický Asistent</span>
              </div>
              <p className="text-gray-800">
                "Ahoj! Jsem tu, abych ti pomohl s matematikou. Můžeš mi poslat jakýkoliv matematický problém - 
                ať už jde o rovnici, geometrii, nebo cokoliv jiného. Vysvětlím ti to krok za krokem a můžu ti 
                i vytvořit podobné příklady na procvičení. Co bys chtěl řešit?"
              </p>
            </div>
            <div className="text-center">
              <Button variant="primary" size="lg" className="flex items-center gap-2 mx-auto">
                <Zap className="h-5 w-5" />
                Spustit živou ukázku
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Co říkají učitelé
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Připojte se k více než 100+ školám, které už používají EduAI-Asistent
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  <p className="text-gray-500 text-sm">{testimonial.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Jednoduché a transparentní ceny
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Vyberte si plán, který nejlépe vyhovuje potřebám vaší školy
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div key={plan.id} className={`bg-white rounded-lg shadow-lg p-8 relative ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Nejoblíbenější
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-600">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-center">
                  <Link to={plan.id === 'enterprise' ? '/contact' : '/register-school'}>
                    <Button 
                      variant={plan.popular ? 'primary' : 'outline'} 
                      size="lg" 
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Request Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Chcete vidět EduAI-Asistent v akci?
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Domluvte si osobní demo prezentaci s našimi specialisty. Ukážeme vám, jak může AI transformovat výuku matematiky na vaší škole.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Osobní prezentace podle vašich potřeb</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Ukázka všech funkcí na reálných příkladech</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Odpovědi na vaše otázky</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Bezplatné a bez závazků</span>
                </li>
              </ul>
            </div>
            <div>
              <LeadCaptureForm
                type="demo"
                title="Požádat o demo"
                description="Vyplňte formulář a my vás budeme kontaktovat do 24 hodin"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Připraveni začít?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Připojte se k tisícům učitelů, kteří už transformují výuku matematiky s pomocí AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register-school">
              <Button variant="secondary" size="lg" className="flex items-center gap-2">
                Registrovat školu zdarma
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-blue-600">
              <MessageSquare className="h-5 w-5" />
              Kontaktovat prodejce
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">EduAI-Asistent</h3>
              <p className="text-gray-400">
                Revoluce ve matematickém vzdělávání s pomocí umělé inteligence
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Funkce</a></li>
                <li><a href="#pricing" className="hover:text-white">Ceny</a></li>
                <li><a href="#testimonials" className="hover:text-white">Reference</a></li>
                <li><Link to="/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Podpora</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white">Nápověda</a></li>
                <li><a href="/contact" className="hover:text-white">Kontakt</a></li>
                <li><a href="/docs" className="hover:text-white">Dokumentace</a></li>
                <li><a href="/status" className="hover:text-white">Stav služby</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Společnost</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">O nás</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/careers" className="hover:text-white">Kariéra</a></li>
                <li><a href="/privacy" className="hover:text-white">Ochrana osobních údajů</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EduAI-Asistent. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
