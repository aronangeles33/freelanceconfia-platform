import { UserPlus, FileText, Search, MessageSquare, DollarSign } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Regístrate",
    description: "Crea tu perfil profesional en minutos. Nuestro sistema de IA analizará tus habilidades y experiencia.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: FileText,
    number: "02", 
    title: "Completa tu Perfil",
    description: "Agrega tu portafolio, certificaciones y experiencia. Cuanto más completo, mejor será tu matching.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Search,
    number: "03",
    title: "Busca Proyectos",
    description: "Explora miles de proyectos o deja que nuestro algoritmo te recomiende los perfectos para ti.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: MessageSquare,
    number: "04",
    title: "Postúlate y Chatea",
    description: "Envía propuestas personalizadas y comunícate directamente con clientes a través de nuestro chat seguro.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: DollarSign,
    number: "05",
    title: "Recibe Pago Seguro",
    description: "Trabaja con tranquilidad sabiendo que tu pago está protegido en nuestro sistema de escrow.",
    color: "from-emerald-500 to-green-600"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-muted/30 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-secondary to-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            ¿Cómo <span className="text-gradient">funciona</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            En solo 5 pasos simples estarás conectado con los mejores proyectos de América Latina
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent transform -translate-y-1/2 rounded-full"></div>
            
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Step Circle */}
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <step.icon className="h-12 w-12 text-white" />
                  </div>
                  
                  {/* Step Content */}
                  <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-64 text-center">
                    <div className="text-sm font-bold text-primary mb-2">{step.number}</div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-primary mb-2">{step.number}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 animate-fade-in-up">
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white shadow-xl">
            <div>
              <h3 className="text-2xl font-bold mb-2">¿Listo para comenzar?</h3>
              <p className="text-white/90 mb-4">Únete a FreelanceConfía hoy mismo</p>
              <button className="btn-outline-hero">
                Crear Cuenta Gratis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;