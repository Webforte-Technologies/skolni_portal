import React, { useState } from 'react';
import Button from '../ui/Button';
import { Mail, Phone, Building, CheckCircle } from 'lucide-react';

interface LeadCaptureFormProps {
  type: 'newsletter' | 'demo' | 'contact';
  title: string;
  description: string;
  className?: string;
}

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ 
  type, 
  title, 
  description, 
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    school: '',
    role: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        school: '',
        role: '',
        message: ''
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <div className={`bg-green-900/20 border border-green-700/40 rounded-lg p-6 text-center text-green-300 ${className}`}>
        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Děkujeme za zájem!</h3>
        <p>
          {type === 'newsletter' && 'Byli jste přidáni do našeho newsletteru. První email vám dorazí brzy!'}
          {type === 'demo' && 'Budeme vás kontaktovat do 24 hodin a domluvíme si demo prezentaci.'}
          {type === 'contact' && 'Vaše zpráva byla odeslána. Odpovíme vám co nejdříve.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-surface-card/90 backdrop-blur-xl border border-surface-border/60 rounded-2xl shadow-2xl p-6 text-surface-text ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
              Jméno *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md border border-surface-border/60 bg-surface-bg text-surface-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Vaše jméno"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
              Příjmení *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md border border-surface-border/60 bg-surface-bg text-surface-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Vaše příjmení"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-2 rounded-md border border-surface-border/60 bg-surface-bg text-surface-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="vas@email.cz"
            />
          </div>
        </div>

        {type !== 'newsletter' && (
          <>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Telefon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-surface-border/60 bg-surface-bg text-surface-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+420 123 456 789"
                />
              </div>
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-300 mb-1">
                Název školy *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-surface-border/60 bg-surface-bg text-surface-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Název vaší školy"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                Vaše role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md border border-surface-border/60 bg-surface-bg text-surface-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Vyberte roli</option>
                <option value="teacher">Učitel</option>
                <option value="school_admin">Ředitel školy</option>
                <option value="it_admin">IT administrátor</option>
                <option value="other">Jiné</option>
              </select>
            </div>

            {type === 'contact' && (
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Zpráva
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-surface-border/60 bg-surface-bg text-surface-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Napište nám, s čím vám můžeme pomoci..."
                />
              </div>
            )}
          </>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Odesílám...
            </div>
          ) : (
            <>
              {type === 'newsletter' && 'Přihlásit se k newsletteru'}
              {type === 'demo' && 'Požádat o demo'}
              {type === 'contact' && 'Odeslat zprávu'}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Odesláním formuláře souhlasíte s našimi{' '}
          <a href="/privacy" className="text-blue-400 hover:underline">
            podmínkami ochrany osobních údajů
          </a>
        </p>
      </form>
    </div>
  );
};

export default LeadCaptureForm;
