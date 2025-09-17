import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Lock,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import escrowPaymentService, { PaymentMilestone } from '@/services/escrowPaymentService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface StripeEscrowPaymentProps {
  milestone: PaymentMilestone;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

const PaymentForm: React.FC<StripeEscrowPaymentProps> = ({ 
  milestone, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    initializePayment();
  }, [milestone.id]);

  const initializePayment = async () => {
    try {
      const { clientSecret: secret, transaction } = await escrowPaymentService.initiateEscrowPayment(
        milestone.id, 
        'card'
      );
      setClientSecret(secret);
      setTransactionId(transaction.id);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al inicializar el pago';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    // Create payment method
    const { error: createPaymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      elements,
      params: {
        billing_details: {
          email: 'user@example.com',
        },
      },
    });

    if (createPaymentMethodError) {
      setPaymentError(createPaymentMethodError.message || 'Error al procesar el método de pago');
      setIsProcessing(false);
      return;
    }

    // Confirm payment
    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });

    if (confirmError) {
      setPaymentError(confirmError.message || 'Error al confirmar el pago');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        // Confirm payment with our backend
        await escrowPaymentService.confirmEscrowPayment(transactionId, paymentIntent.id);
        
        toast({
          title: "Pago exitoso",
          description: "Los fondos han sido depositados en escrow de forma segura"
        });
        
        onPaymentSuccess(transactionId);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Error al confirmar el pago';
        setPaymentError(errorMessage);
        onPaymentError(errorMessage);
      }
    }

    setIsProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const platformFee = milestone.amount * 0.03; // 3% platform fee
  const stripeFee = milestone.amount * 0.029 + 0.30; // Stripe fees
  const totalAmount = milestone.amount + platformFee + stripeFee;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pago Seguro con Escrow
        </CardTitle>
        <CardDescription>
          Los fondos se mantendrán seguros hasta que apruebes el trabajo
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Summary */}
        <div className="space-y-2">
          <h3 className="font-medium">Resumen del pago</h3>
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>{milestone.title}</span>
              <span>${milestone.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tarifa de plataforma (3%)</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tarifa de procesamiento</span>
              <span>${stripeFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)} {milestone.currency}</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Tu pago está protegido por nuestro sistema escrow. Los fondos solo se liberarán 
            cuando apruebes el trabajo completado.
          </AlertDescription>
        </Alert>

        {/* Payment Error */}
        {paymentError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Información de la tarjeta
            </label>
            <div className="border rounded-md p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Security Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Encriptación SSL de 256 bits</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Protección contra fraude</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4" />
              <span>Cumple con PCI DSS</span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || isProcessing || !clientSecret}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando pago...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pagar ${totalAmount.toFixed(2)} de forma segura
              </>
            )}
          </Button>
        </form>

        {/* How Escrow Works */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="font-medium flex items-center gap-1">
            <Info className="h-3 w-3" />
            ¿Cómo funciona el escrow?
          </div>
          <div>1. Tu pago se mantiene seguro en nuestra cuenta escrow</div>
          <div>2. El freelancer recibe notificación para comenzar el trabajo</div>
          <div>3. Tú apruebas el trabajo completado</div>
          <div>4. Los fondos se liberan automáticamente al freelancer</div>
        </div>
      </CardContent>
    </Card>
  );
};

const StripeEscrowPayment: React.FC<StripeEscrowPaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripeEscrowPayment;