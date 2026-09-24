export type ClientActivityType =
    | "offer_created"
    | "proposal_received"
    | "message"
    | "payment"
    | "offer_completed"
    | "review_given";

export interface ClientActivity {
    id: string;
    type: ClientActivityType;
    title: string;
    description: string;
    time: string;
    createdAt: string;
    offerId?: string;
    freelancerId?: string;
}
