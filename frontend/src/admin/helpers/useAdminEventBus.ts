import { inject, provide } from "vue";
import { InjectionKey } from "vue";

type Listener = () => void;

class AdminEventBus {
  private updateCountersListeners: Listener[] = [];

  public addUpdateCountersListener(listener: Listener) {
    this.updateCountersListeners.push(listener);
  }

  public removeUpdateCountersListener(listener: Listener) {
    this.updateCountersListeners.filter((l) => l !== listener);
  }

  public triggerUpdateCounters() {
    this.updateCountersListeners.forEach((listener) => listener());
  }
}

const AdminEventBusKey: InjectionKey<AdminEventBus> = Symbol("AdminEventBus");

function provideAdminEventBus(): void {
  return provide(AdminEventBusKey, new AdminEventBus());
}

function useAdminEventBus(): AdminEventBus {
  return inject(AdminEventBusKey) as AdminEventBus;
}

export { AdminEventBusKey, provideAdminEventBus, useAdminEventBus };
