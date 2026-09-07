import { RegisteredTravelerUser } from '../types/cms';

// Production traveler accounts must never be committed to source control.
// Real users are created from verified authentication and server-side storage.
export const DEFAULT_REGISTERED_USERS: RegisteredTravelerUser[] = [];
