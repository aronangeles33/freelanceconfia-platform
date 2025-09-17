import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "María González",
    role: "Desarrolladora Full Stack",
    country: "México",
    rating: 5,
    text: "FreelanceConfía cambió mi vida profesional. El sistema de reputación IA me ayudó a conseguir proyectos de mayor calidad y los pagos en escrow me dieron la confianza que necesitaba.",
    avatar: "MG",
    projects: 47,
    earnings: "$25,000"
  },
  {
    name: "Carlos Mendoza",
    role: "Diseñador UX/UI",
    country: "Colombia",
    rating: 5,
    text: "La plataforma entiende perfectamente las necesidades del mercado latino. El matching inteligente me conecta con clientes que realmente valoran mi trabajo.",
    avatar: "CM",
    projects: 32,
    earnings: "$18,500"
  },
  {
    name: "Ana Silva",
    role: "Marketing Digital",
    country: "Brasil",
    rating: 5,
    text: "Increíble la diferencia que hace tener una plataforma enfocada en LatAm. Los horarios compatibles y el entendimiento cultural marcan la diferencia.",
    avatar: "AS",
    projects: 28,
    earnings: "$22,300"
  },
  {
    name: "Diego Ramirez",
    role: "Desarrollador Mobile",
    country: "Argentina",
    rating: 5,
    text: "Los pagos seguros y la verificación continua me dan tranquilidad total. Puedo enfocarme en lo que mejor hago: programar.",
    avatar: "DR",
    projects: 35,
    earnings: "$30,200"
  },
  {
    name: "Lucía Torres",
    role: "Redactora de Contenido",
    country: "Chile",
    rating: 5,
    text: "La comunidad es fantástica y el soporte es excepcional. FreelanceConfía realmente se preocupa por el éxito de sus freelancers.",
    avatar: "LT",
    projects: 41,
    earnings: "$16,800"
  },
  {
    name: "Roberto Herrera",
    role: "Consultor en Data Science",
    country: "Perú",
    rating: 5,
    text: "El sistema de matching es impresionante. Me conecta con proyectos que realmente aprovechan mis habilidades especializadas en machine learning.",
    avatar: "RH",
    projects: 19,
    earnings: "$35,600"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Lo que dicen nuestros{" "}
            <span className="text-gradient">freelancers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Miles de profesionales han transformado sus carreras con FreelanceConfía
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary font-medium">{testimonial.country}</p>
                  </div>
                </div>

                <div className="flex justify-between text-sm bg-muted/50 rounded-xl p-3">
                  <div className="text-center">
                    <div className="font-semibold text-primary">{testimonial.projects}</div>
                    <div className="text-muted-foreground">Proyectos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-secondary">{testimonial.earnings}</div>
                    <div className="text-muted-foreground">Ganado</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold">4.9/5 Rating Promedio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <span className="text-lg font-semibold">98% Satisfacción</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-secondary rounded-full"></div>
              <span className="text-lg font-semibold">+10K Freelancers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;