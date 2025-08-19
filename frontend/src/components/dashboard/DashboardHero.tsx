import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import { MessageSquare, FileText, Coins, Sparkles } from 'lucide-react';

interface DashboardHeroProps {
  credits: number;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ credits }) => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-600 to-secondary-600 text-white shadow-brand">
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Vítejte zpět!</h1>
          <p className="text-white/80 max-w-2xl">Vyberte si AI asistenta nebo začněte nový chat. Materiály, cvičení a výpočty na jednom místě.</p>
        </div>

        {/* Credit badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 ring-1 ring-white/20 backdrop-blur">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold leading-tight">{credits}</div>
              <div className="text-xs uppercase tracking-wide text-white/80">dostupné kredity</div>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/20" />

          {/* CTAs */}
          <div className="flex gap-3">
            <Button onClick={() => navigate('/chat')} className="shadow-soft">
              <MessageSquare className="h-4 w-4 mr-2" />
              Začít nový chat
            </Button>
            <Link to="/materials/create">
              <Button className="shadow-soft bg-blue-600 hover:bg-blue-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Vytvořit materiál
              </Button>
            </Link>
            <Link to="/materials">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Materiály
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHero;


