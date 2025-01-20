import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Função para aplicar máscara de telefone
function applyPhoneMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica máscara (XX) XXXXX-XXXX
  if (numbers.length <= 10) {
    if (numbers.length <= 2) {
      return numbers ? `(${numbers}` : '';
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  } else {
    // Telefone com 11 dígitos (celular)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
}

// Função para aplicar máscara de CPF
function applyCPFMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica máscara XXX.XXX.XXX-XX
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
  } else if (limitedNumbers.length <= 9) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9, 11)}`;
  }
}

// Função para validar e formatar email
function applyEmailMask(value: string): string {
  // Email não precisa de máscara, apenas validação básica
  // Remove espaços e converte para minúsculas
  return value.trim().toLowerCase();
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      let maskedValue = inputValue;

      if (mask === "(99) 99999-9999") {
        maskedValue = applyPhoneMask(inputValue);
      } else if (mask === "999.999.999-99") {
        maskedValue = applyCPFMask(inputValue);
      } else if (mask === "email") {
        maskedValue = applyEmailMask(inputValue);
      }

      // Cria um novo evento com o valor mascarado
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: maskedValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    };

    // Determina o tipo de input baseado na máscara
    const inputType = mask === "email" ? "email" : mask === "999.999.999-99" ? "text" : "tel";

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        type={inputType}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";
