import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-muted/20 to-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">FC</span>
              </div>
              <span className="text-2xl font-bold text-gradient">FreelanceConfía</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              La plataforma líder para conectar freelancers con empresas confiables en América Latina. Tecnología IA, pagos seguros y matching inteligente.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl flex items-center justify-center transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl flex items-center justify-center transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl flex items-center justify-center transition-all duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl flex items-center justify-center transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li><Link to="/projects" className="text-muted-foreground hover:text-primary transition-colors">Buscar Proyectos</Link></li>
              <li><Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categorías</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Precios</Link></li>
              <li><Link to="/success-stories" className="text-muted-foreground hover:text-primary transition-colors">Casos de Éxito</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-6">Soporte</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">Centro de Ayuda</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contacto</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/community" className="text-muted-foreground hover:text-primary transition-colors">Comunidad</Link></li>
              <li><Link to="/tutorials" className="text-muted-foreground hover:text-primary transition-colors">Tutoriales</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-6">Newsletter</h3>
            <p className="text-muted-foreground mb-4">
              Recibe consejos, noticias y oportunidades directamente en tu email.
            </p>
            <div className="space-y-3">
              <Input 
                placeholder="Tu email"
                type="email"
                className="bg-white/50 border-border focus:bg-white"
              />
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Email</div>
                <div className="text-muted-foreground">hola@freelanceconfia.com</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Teléfono</div>
                <div className="text-muted-foreground">+52 55 1234 5678</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Ubicación</div>
                <div className="text-muted-foreground">Ciudad de México, México</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-muted-foreground text-sm">
            © 2024 FreelanceConfía. Todos los derechos reservados.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacidad
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Términos
            </Link>
            <Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;