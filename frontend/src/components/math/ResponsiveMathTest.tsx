import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';
import ResponsiveMarkdown from './ResponsiveMarkdown';
import ResponsiveKaTeX from './ResponsiveKaTeX';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

const ResponsiveMathTest: React.FC = () => {
  const { isMobile, isTablet, isDesktop, breakpoint, width } = useResponsive();
  const [selectedExample, setSelectedExample] = useState(0);

  const mathExamples = [
    {
      title: 'Základní algebra',
      content: 'Řešte rovnici: $x^2 + 5x + 6 = 0$\n\nPoužijeme kvadratickou formuli:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nPro naši rovnici je $a = 1$, $b = 5$, $c = 6$:\n\n$$x = \\frac{-5 \\pm \\sqrt{25 - 24}}{2} = \\frac{-5 \\pm 1}{2}$$\n\nTakže $x_1 = -2$ a $x_2 = -3$.'
    },
    {
      title: 'Komplexní výrazy',
      content: 'Integrál komplexní funkce:\n\n$$\\int_{-\\infty}^{\\infty} \\frac{e^{-x^2}}{\\sqrt{\\pi}} dx = 1$$\n\nA Fourierova transformace:\n\n$$F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt$$\n\nMatice s dlouhými výrazy:\n\n$$\\begin{pmatrix} \\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} & \\sin(\\alpha + \\beta + \\gamma) \\\\ \\cos(\\theta_1 + \\theta_2 + \\theta_3) & \\sum_{n=1}^{\\infty} \\frac{(-1)^n}{n!} x^n \\end{pmatrix}$$'
    },
    {
      title: 'Velmi široké výrazy',
      content: 'Dlouhá rovnice, která by měla vyžadovat horizontální scrollování na mobilních zařízeních:\n\n$$f(x) = a_0 + a_1x + a_2x^2 + a_3x^3 + a_4x^4 + a_5x^5 + a_6x^6 + a_7x^7 + a_8x^8 + a_9x^9 + a_{10}x^{10} + \\cdots$$\n\nA také inline matematika s dlouhými výrazy: $\\sum_{i=1}^{n} \\sum_{j=1}^{m} \\sum_{k=1}^{p} a_{ijk} \\cdot b_{ijk} \\cdot c_{ijk} \\cdot d_{ijk}$ v textu.'
    },
    {
      title: 'Fyzikální vzorce',
      content: 'Einsteinova rovnice pole:\n\n$$R_{\\mu\\nu} - \\frac{1}{2}g_{\\mu\\nu}R + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4}T_{\\mu\\nu}$$\n\nSchroedingerova rovnice:\n\n$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$\n\nMaxwellovy rovnice:\n\n$$\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}, \\quad \\nabla \\times \\mathbf{B} = \\mu_0\\mathbf{J} + \\mu_0\\varepsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}$$'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Device Info */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {isMobile && <Smartphone className="h-5 w-5" />}
          {isTablet && <Tablet className="h-5 w-5" />}
          {isDesktop && <Monitor className="h-5 w-5" />}
          Test responzivního vykreslování matematiky
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Zařízení:</span>
            <div className={cn(
              'px-2 py-1 rounded text-xs font-medium mt-1',
              isMobile && 'bg-blue-100 text-blue-800',
              isTablet && 'bg-green-100 text-green-800',
              isDesktop && 'bg-purple-100 text-purple-800'
            )}>
              {breakpoint}
            </div>
          </div>
          <div>
            <span className="font-medium">Šířka:</span>
            <div className="text-gray-600">{width}px</div>
          </div>
          <div>
            <span className="font-medium">Zoom:</span>
            <div className="text-gray-600">
              {(isMobile || isTablet) ? 'Povoleno' : 'Ctrl+kolečko'}
            </div>
          </div>
          <div>
            <span className="font-medium">Pan:</span>
            <div className="text-gray-600">
              {(isMobile || isTablet) ? 'Dotykem' : 'Nedostupné'}
            </div>
          </div>
        </div>
      </Card>

      {/* Example Selection */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Vyberte příklad:</h3>
        <div className="flex flex-wrap gap-2">
          {mathExamples.map((example, index) => (
            <Button
              key={index}
              onClick={() => setSelectedExample(index)}
              variant={selectedExample === index ? 'primary' : 'secondary'}
              size="sm"
              className={cn(
                isMobile && 'text-xs px-2 py-1'
              )}
            >
              {example.title}
            </Button>
          ))}
        </div>
      </Card>

      {/* Math Content */}
      <Card className="p-4">
        <h3 className="font-medium mb-4">{mathExamples[selectedExample].title}</h3>
        
        <div className="prose prose-sm max-w-none">
          <ResponsiveMarkdown>
            {mathExamples[selectedExample].content}
          </ResponsiveMarkdown>
        </div>
      </Card>

      {/* Individual Component Tests */}
      <Card className="p-4">
        <h3 className="font-medium mb-4">Testy jednotlivých komponent</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Inline matematika:</h4>
            <ResponsiveKaTeX 
              math="E = mc^2" 
              displayMode={false}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Display matematika s zoom:</h4>
            <ResponsiveKaTeX 
              math="\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}"
              displayMode={true}
              enableZoom={true}
              enablePan={true}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Široký výraz:</h4>
            <ResponsiveKaTeX 
              math="f(x_1, x_2, \\ldots, x_n) = \\sum_{i=1}^{n} \\sum_{j=1}^{n} \\sum_{k=1}^{n} a_{ijk} x_i x_j x_k + \\sum_{i=1}^{n} b_i x_i + c"
              displayMode={true}
              enableZoom={true}
              enablePan={true}
            />
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-medium mb-2 text-blue-800">Instrukce pro testování:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          {isMobile && (
            <>
              <li>• Použijte dva prsty pro přiblížení/oddálení matematických výrazů</li>
              <li>• Táhněte jedním prstem pro posouvání přiblížených výrazů</li>
              <li>• Klepněte na tlačítka zoom pro přesné ovládání</li>
            </>
          )}
          {isTablet && (
            <>
              <li>• Použijte gesta pro přiblížení matematických výrazů</li>
              <li>• Táhněte pro posouvání přiblížených výrazů</li>
              <li>• Tlačítka zoom jsou dostupná pro přesné ovládání</li>
            </>
          )}
          {isDesktop && (
            <>
              <li>• Držte Ctrl a použijte kolečko myši pro přiblížení</li>
              <li>• Široké výrazy se automaticky scrollují horizontálně</li>
              <li>• Matematika je optimalizována pro čtení na velkých obrazovkách</li>
            </>
          )}
        </ul>
      </Card>
    </div>
  );
};

export default ResponsiveMathTest;