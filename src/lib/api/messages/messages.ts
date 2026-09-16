import api from "@/lib/api/client";

import type {
  ApiConversation,
  ApiMessage,
  ApiMessageCreate,
  MessageConversation,
  MessagesViewData,
} from "./messages.types";

/**
 * Backend Chat API methods.
 *
 * These are ready for use after the backend Chat router and
 * response-contract issues are resolved.
 */

export async function getConversations(): Promise<
  ApiConversation[]
> {
  const response = await api.get<ApiConversation[]>(
    "/chat/conversations",
  );

  return response.data;
}

export async function getConversationMessages(
  conversationId: string,
): Promise<ApiMessage[]> {
  const response = await api.get<ApiMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
  );

  return response.data;
}

export async function sendConversationMessage(
  conversationId: string,
  data: ApiMessageCreate,
): Promise<ApiMessage> {
  const response = await api.post<ApiMessage>(
    `/chat/conversations/${conversationId}/messages`,
    data,
  );

  return response.data;
}

export async function markMessageAsRead(
  messageId: string,
): Promise<ApiMessage> {
  const response = await api.patch<ApiMessage>(
    `/chat/messages/${messageId}/read`,
  );

  return response.data;
}

/**
 * Presentation-only Messages data.
 *
 * This stays isolated from the backend contract so the Figma
 * screens can be implemented while the Chat API is finalized.
 */

const sharedBusiness = {
  id: "specialty-coffee-roastery",
  name: "Specialty Coffee Roastery",
  city: "Portland",
  state: "OR",
  description:
    "Established specialty food and beverage business with a strong local customer base, recurring revenue, and an experienced operating team.",
  industry: "Specialty Food & Beverage",
  acquisitionType: "Full Sale",
  yearsInOperation: 12,
  employees: 3,
  askingPrice: 750000,
  annualRevenueMin: 800000,
  annualRevenueMax: 900000,
  annualProfit: 200000,
  ownerHoursPerWeek: 35,
  reasonForSelling: "Pursuing other opportunities",
  desiredTimeline: "Within 3-6 months",
  transitionSupport: "3-6 month handover",
  propertyType: "Leased",
  leaseTermRemaining: "3-5 years",
  includedAssets: [
    "Roasting equipment",
    "Delivery van",
    "POS system",
  ],
  estimatedProfitMargin: 24,
};

const conversations: MessageConversation[] = [
  {
    id: "intro-riverside",
    matchId: "match-riverside",
    category: "new",
    participant: {
      id: "seller-riverside",
      name: "Peter S.",
      initials: "PS",
    },
    business: {
      ...sharedBusiness,
      id: "riverside-bakery",
      name: "Riverside Bakery",
    },
    preview:
      "A new introduction is waiting. Sign the NDA to view the message.",
    relativeTime: "2h ago",
    unreadCount: 1,
    ndaRequired: true,
    ndaSigned: false,
    messages: [
      {
        id: "message-riverside-1",
        sender: "participant",
        content:
          "Hi, I would like to introduce you to Riverside Bakery and discuss whether it may fit your acquisition goals.",
        sentAt: "10:39 PM",
        read: false,
      },
    ],
  },
  {
    id: "intro-tampa",
    matchId: "match-tampa",
    category: "new",
    participant: {
      id: "seller-tampa",
      name: "Alex M.",
      initials: "AM",
    },
    business: {
      ...sharedBusiness,
      id: "tampa-sports-club",
      name: "Tampa Sports Club",
      city: "Tampa",
      state: "FL",
      industry: "Fitness & Recreation",
    },
    preview:
      "A new introduction is waiting. Sign the NDA to view the message.",
    relativeTime: "1d ago",
    unreadCount: 1,
    ndaRequired: true,
    ndaSigned: false,
    messages: [
      {
        id: "message-tampa-1",
        sender: "participant",
        content:
          "I would be happy to share more information about Tampa Sports Club and the seller's transition plans.",
        sentAt: "8:15 PM",
        read: false,
      },
    ],
  },
  {
    id: "conversation-arts",
    matchId: "match-arts",
    category: "open",
    participant: {
      id: "seller-arts",
      name: "Peter S.",
      initials: "PS",
    },
    business: {
      ...sharedBusiness,
      id: "arts-crafts-business",
      name: "Arts and Crafts Business",
      industry: "Retail",
    },
    preview:
      "Hi! I am interested in learning more about you and what you are looking for.",
    relativeTime: "2h ago",
    unreadCount: 1,
    ndaRequired: true,
    ndaSigned: true,
    messages: [
      {
        id: "message-arts-1",
        sender: "participant",
        content:
          "Hi! I am interested in learning more about you and what you are looking for in a business.",
        sentAt: "10:39 PM",
        read: false,
      },
    ],
  },
  {
    id: "conversation-home",
    matchId: "match-home",
    category: "open",
    participant: {
      id: "seller-home",
      name: "Nancy R.",
      initials: "NR",
    },
    business: {
      ...sharedBusiness,
      id: "home-construction-business",
      name: "Home Construction Business",
      industry: "Construction",
    },
    preview:
      "Hi, my name is Nancy! I wanted to learn more about you.",
    relativeTime: "6h ago",
    unreadCount: 0,
    ndaRequired: true,
    ndaSigned: true,
    messages: [
      {
        id: "message-home-1",
        sender: "participant",
        content:
          "Hi, my name is Nancy! I wanted to learn more about you and what you are looking for in a business! Please reach out if you want more information regarding my business. I think we would be a great fit.",
        sentAt: "10:39 PM",
        read: true,
      },
      {
        id: "message-home-2",
        sender: "current-user",
        content:
          "Hi, Nancy! My name is Nicole. I love what you're doing with your business! I did have a few questions regarding your revenue.",
        sentAt: "10:39 PM",
        read: true,
      },
    ],
  },
  {
    id: "conversation-coffee",
    matchId: "match-coffee",
    category: "open",
    participant: {
      id: "seller-coffee",
      name: "John S.",
      initials: "JS",
    },
    business: {
      ...sharedBusiness,
      id: "sustainable-coffee-subscription",
      name: "Sustainable Coffee Subscription Box",
    },
    preview:
      "Hi — I'm Nicole, and I run a property-services company.",
    relativeTime: "20d ago",
    unreadCount: 0,
    ndaRequired: true,
    ndaSigned: true,
    messages: [
      {
        id: "message-coffee-1",
        sender: "current-user",
        content:
          "Hi — I'm Nicole, and I run a property-services company here in the Tampa Bay area. Your business came up as a strong match for what I'm looking for, and I wanted to reach out directly rather than send a generic inquiry.\n\nA few things stood out: we're in the same market, so there's no relocation or remote-management guesswork on my end. I'm SBA pre-qualified, and what you've shared lines up well with what I'm approved for.\n\nI'd love to find 20 minutes to talk, no pressure either way.\n\nBest,\nNicole",
        sentAt: "10:39 PM",
        read: true,
      },
    ],
  },
];

export function getMessagesDemoData(): MessagesViewData {
  return {
    currentUser: {
      id: "demo-current-user",
      name: "Nicole Harrison",
      initials: "NH",
    },
    conversations,
  };
}