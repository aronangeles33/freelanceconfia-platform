import { Shield, Brain, CreditCard, MessageCircle, Star, Users } from "lucide-react";
import aiImage from "@/assets/ai-reputation.jpg";
import paymentsImage from "@/assets/secure-payments.jpg";

const features = [
  {
    icon: Brain,
    title: "Reputación con IA",
    description: "Sistema inteligente que analiza tu historial y comportamiento para construir una reputación sólida y confiable.",
    image: aiImage,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "Matching Inteligente",
    description: "Algoritmo avanzado que conecta freelancers con proyectos perfectos basado en habilidades y experiencia.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: CreditCard,
    title: "Pagos en Escrow",
    description: "Sistema de pagos seguros que protege tanto a freelancers como clientes con garantía de fondos.",
    image: paymentsImage,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: MessageCircle,
    title: "Chat Seguro",
    description: "Comunicación integrada y segura para coordinar proyectos sin compartir datos personales.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Star,
    title: "Verificación Continua",
    description: "Proceso de verificación constante que mantiene la calidad y confianza en la plataforma.",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: Users,
    title: "Comunidad LatAm",
    description: "Red exclusiva de profesionales latinoamericanos con enfoque cultural y horarios compatibles.",
    gradient: "from-indigo-500 to-purple-500"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            ¿Por qué elegir{" "}
            <span className="text-gradient">FreelanceConfía</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tecnología de vanguardia diseñada específicamente para el mercado latinoamericano
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-feature group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                {feature.image && (
                  <div className="mb-6 rounded-xl overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-white animate-fade-in-up">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para impulsar tu carrera freelance?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Únete a miles de freelancers que ya confían en nuestra plataforma
            </p>
            <button className="btn-outline-hero">
              Comenzar Ahora - Es Gratis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;