/**
 * Environment Variable Validation & Safety Guard
 * Ensures the application refuses to start/operate if critical secrets or variables are missing.
 */

interface EnvConfig {
  DATABASE_URL: string;
  NEON_API_KEY: string;
  NEON_PROJECT_ID: string;
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

class EnvironmentValidator {
  private static cachedConfig: EnvConfig | null = null;

  public static getEnv(): EnvConfig {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    const errors: string[] = [];

    const DATABASE_URL = process.env.DATABASE_URL?.trim();
    const NEON_API_KEY = process.env.NEON_API_KEY?.trim();
    const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID?.trim();
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY?.trim();
    const NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
    const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const NODE_ENV = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';

    if (!DATABASE_URL) {
      errors.push('DATABASE_URL is missing. Please provide a valid Neon PostgreSQL connection string.');
    } else if (DATABASE_URL.includes('placeholder')) {
      errors.push('DATABASE_URL contains placeholder credentials. A real database connection string is required.');
    }

    if (!NEON_API_KEY) {
      errors.push('NEON_API_KEY is missing. Neon API key is required to provision isolated user branches.');
    }

    if (!NEON_PROJECT_ID) {
      errors.push('NEON_PROJECT_ID is missing. Neon Project ID is required.');
    }

    if (!CLERK_SECRET_KEY) {
      errors.push('CLERK_SECRET_KEY is missing. Clerk secret key is required for backend authentication.');
    }

    if (!NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing. Clerk publishable key is required for client authentication.');
    }

    if (errors.length > 0 && NODE_ENV === 'production') {
      const formattedErrors = errors.map(e => `  ❌ ${e}`).join('\n');
      const errorMessage = `[Security Error] Application startup aborted due to missing critical environment variables:\n${formattedErrors}\n\nCheck .env.example for required configuration.`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    this.cachedConfig = {
      DATABASE_URL: DATABASE_URL || '',
      NEON_API_KEY: NEON_API_KEY || '',
      NEON_PROJECT_ID: NEON_PROJECT_ID || '',
      CLERK_SECRET_KEY: CLERK_SECRET_KEY || '',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
      NEXT_PUBLIC_SITE_URL,
      NODE_ENV,
    };

    return this.cachedConfig;
  }
}

export const env = EnvironmentValidator.getEnv();
export function validateEnv() {
  return EnvironmentValidator.getEnv();
}
