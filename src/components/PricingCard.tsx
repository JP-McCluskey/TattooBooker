import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  onSelect: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  description,
  features,
  cta,
  popular = false,
  onSelect
}) => {
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      popular ? 'border-primary shadow-md scale-105' : ''
    }`}>
      {popular && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
        </div>
      )}
      
      <CardHeader className="text-center pt-8">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className={`w-full ${popular ? 'bg-primary hover:bg-primary/90' : ''}`}
          variant={popular ? 'default' : 'outline'}
          onClick={onSelect}
        >
          {cta}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;