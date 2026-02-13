export type DomainEvent<TPayload = Record<string, unknown>> = {
  event_name: string;
  occurred_at: string;
  request_id?: string;
  actor_user_id?: string;
  payload: TPayload;
};

export type EventHandler = (event: DomainEvent) => Promise<void>;
