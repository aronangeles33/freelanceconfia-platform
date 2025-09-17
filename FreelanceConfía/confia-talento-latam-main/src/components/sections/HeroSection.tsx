import { ArrowRight, Play, Star, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-freelancers.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Freelancers trabajando en América Latina"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero opacity-90"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-2">
          <Shield className="h-8 w-8 text-white" />
          <span className="text-white font-semibold">Verificación IA</span>
        </div>
      </div>
      
      <div className="absolute top-40 right-10 animate-float" style={{ animationDelay: '1s' }}>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-2">
          <Star className="h-8 w-8 text-yellow-400" />
          <span className="text-white font-semibold">4.9/5 Rating</span>
        </div>
      </div>

      <div className="absolute bottom-32 left-16 animate-float" style={{ animationDelay: '2s' }}>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-2">
          <Zap className="h-8 w-8 text-white" />
          <span className="text-white font-semibold">Matching Inteligente</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Conecta con{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Clientes Confiables
              </span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
            </span>
            {" "}en LatAm
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sistema de reputación basado en IA, pagos seguros en escrow y matching inteligente para freelancers latinos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button className="btn-hero text-lg px-8 py-4">
              Regístrate Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button variant="outline" className="btn-outline-hero text-lg px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Ver Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">10K+</div>
              <div className="text-white/80 text-sm">Freelancers Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">5K+</div>
              <div className="text-white/80 text-sm">Empresas Registradas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">98%</div>
              <div className="text-white/80 text-sm">Pagos Seguros</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">4.9</div>
              <div className="text-white/80 text-sm">Rating Promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;