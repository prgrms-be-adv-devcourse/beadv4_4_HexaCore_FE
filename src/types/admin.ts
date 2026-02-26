import type { PageResponse } from './product';

export interface BidSpamLogResponse {
    id: number;
    userId: number;
    requestCount: number;
    timeWindowMinutes: number;
    banLevel: 'FIRST' | 'SECOND' | 'THIRD' | string;
    createdAt: string;
}
