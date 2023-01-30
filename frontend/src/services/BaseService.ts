import { Client } from "@/services/Client";

export class BaseService {
  protected client;

  constructor(client: Client) {
    this.client = client;
  }
}
