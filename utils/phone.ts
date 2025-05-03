export function normalise(phone: string): string {
    return phone.replace(/\D/g, "");   // keep digits only (“+91 123-456” -> “91123456”)
  }