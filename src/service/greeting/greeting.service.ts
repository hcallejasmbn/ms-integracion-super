import { createGreeting, type Greeting } from "@/core/domain/greeting/greeting";
import { GreetingRepository } from "@/core/repository/greeting.repository";

export class GreetingService {
  constructor(private readonly greetingRepository = new GreetingRepository()) { }

  getGreeting(name?: string): Greeting {
    const saludo = this.greetingRepository.saludo();
    return createGreeting(saludo, name, new Date());
  }
}
