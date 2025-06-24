
import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .transform(email => email.toLowerCase().trim());

// Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número');

// Church name validation
export const churchNameSchema = z.string()
  .min(2, 'Nome da igreja deve ter pelo menos 2 caracteres')
  .max(100, 'Nome da igreja muito longo')
  .regex(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/, 'Nome da igreja contém caracteres inválidos')
  .transform(name => name.trim());

// Address validation
export const addressSchema = z.string()
  .min(5, 'Endereço deve ter pelo menos 5 caracteres')
  .max(200, 'Endereço muito longo')
  .transform(address => address.trim());

// Pastor name validation
export const pastorNameSchema = z.string()
  .min(2, 'Nome do pastor deve ter pelo menos 2 caracteres')
  .max(100, 'Nome do pastor muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s\-\.]+$/, 'Nome do pastor contém caracteres inválidos')
  .transform(name => name.trim());

// Generic text sanitization
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML injection characters
    .slice(0, 1000); // Limit length
};

// Number validation for financial data
export const financialAmountSchema = z.number()
  .min(0, 'Valor não pode ser negativo')
  .max(999999999.99, 'Valor muito alto')
  .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais');

// ID validation (UUID)
export const uuidSchema = z.string()
  .uuid('ID inválido');

// Validate church form data
export const validateChurchData = (data: any) => {
  const schema = z.object({
    nome: churchNameSchema,
    endereco: addressSchema,
    tipo: z.enum(['matriz', 'filial'], { message: 'Tipo de igreja inválido' }),
    pastor_nome: pastorNameSchema,
    pastor_email: emailSchema,
  });

  return schema.parse(data);
};

// Validate login data
export const validateLoginData = (data: any) => {
  const schema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Senha é obrigatória'),
  });

  return schema.parse(data);
};
