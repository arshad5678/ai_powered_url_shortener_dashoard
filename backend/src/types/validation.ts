import { AnyZodObject } from 'zod';

export interface ValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

export interface RequestSchema extends ValidationSchemas {}

export interface ValidationOptions {
  stripUnknown?: boolean;
}
