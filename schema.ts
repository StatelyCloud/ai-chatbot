import {
  arrayOf,
  bool,
  bytes,
  enumType,
  itemType,
  objectType,
  string,
  timestampSeconds,
  uint,
} from "@stately-cloud/schema";

/** Visibility levels for chat conversations */
const Visibility = enumType("Visibility", {
  PRIVATE: 0,
  PUBLIC: 1,
});

/** Document types */
const DocumentKind = enumType("DocumentKind", {
  TEXT: 0,
  CODE: 1,
  IMAGE: 2,
  SHEET: 3,
});

/** Message roles for chat participants */
const MessageRole = enumType("MessageRole", {
  UNSPECIFIED: 0,
  USER: 1,
  ASSISTANT: 2,
  SYSTEM: 3,
});

/** Resolution status for suggestions */
const ResolutionStatus = enumType("ResolutionStatus", {
  PENDING: 0,
  RESOLVED: 1,
  REJECTED: 2,
});

/** App usage context for chat sessions */
const AppUsage = objectType("AppUsage", {
  fields: {
    app: { type: string },
    version: { type: string },
    features: { type: arrayOf(string), required: false },
    metadata: { type: string, required: false },
  },
});

/** Message part structure for rich message content */
const MessagePart = objectType("MessagePart", {
  fields: {
    type: { type: string },
    content: { type: string, required: false },
    mimeType: { type: string, required: false },
    data: { type: bytes, required: false },
  },
});

/** Message attachment structure */
const MessageAttachment = objectType("MessageAttachment", {
  fields: {
    name: { type: string },
    mimeType: { type: string },
    size: { type: uint },
    url: { type: string, required: false },
    data: { type: bytes, required: false },
  },
});

/** Chat represents a conversation thread */
itemType("Chat", {
  keyPath: [
    "/chat-:id",
    "/user-:userId/chat-:id",
    "/user-:userId/visibility-:visibility/chat-:id",
  ],
  fields: {
    id: { type: uint, initialValue: "rand53" },
    title: { type: string },
    userId: { type: uint },
    visibility: { type: Visibility, required: false },
    lastContext: { type: AppUsage, required: false },
    createdAt: {
      type: timestampSeconds,
      fromMetadata: "createdAtTime",
    },
    updatedAt: {
      type: timestampSeconds,
      fromMetadata: "lastModifiedAtTime",
    },
  },
});

/**
 * Document represents user-created content
 * Note: We use a separate createdTimestamp field for versioning of one document
 * because metadata fields cannot be used in key paths
 */
itemType("Document", {
  keyPath: [
    "/document-:id/version-:createdAt",
    "/user-:userId/document-:id/version-:createdAt",
  ],
  fields: {
    id: { type: uint, initialValue: "rand53" },
    userId: { type: uint },
    title: { type: string },
    content: { type: string, required: false },
    kind: { type: DocumentKind, required: false },
    createdAt: { type: timestampSeconds },
    updatedAt: {
      type: timestampSeconds,
      fromMetadata: "lastModifiedAtTime",
    },
  },
});

/** Message represents a single message in a chat conversation */
itemType("Message", {
  keyPath: "/chat-:chatId/message-:id",
  fields: {
    id: { type: uint, initialValue: "sequence" },
    chatId: { type: uint },
    role: { type: MessageRole },
    parts: { type: arrayOf(MessagePart) },
    attachments: { type: arrayOf(MessageAttachment), required: false },
    createdAt: {
      type: timestampSeconds,
      fromMetadata: "createdAtTime",
    },
    createdAtVersion: {
      type: uint,
      fromMetadata: "createdAtVersion",
    },
  },
});

/** Stream represents real-time streaming sessions for chats */
itemType("Stream", {
  keyPath: ["/chat-:chatId/stream-:id", "/stream-:id"],
  ttl: {
    source: "fromCreated",
    durationSeconds: 86400,
  },
  fields: {
    id: { type: uint, initialValue: "rand53" },
    chatId: { type: uint },
    active: { type: bool },
    createdAt: {
      type: timestampSeconds,
      fromMetadata: "createdAtTime",
    },
    lastActivity: {
      type: timestampSeconds,
      fromMetadata: "lastModifiedAtTime",
    },
  },
});

/** Suggestion represents feedback or suggestions on documents */
itemType("Suggestion", {
  keyPath: [
    "/document-:documentId/version-:documentVersion/suggestion-:id",
    "/user-:userId/suggestion-:id",
  ],
  fields: {
    id: { type: uint, initialValue: "rand53" },
    documentId: { type: uint },
    documentVersion: { type: timestampSeconds },
    originalText: { type: string },
    suggestedText: { type: string },
    description: { type: string, required: false },
    resolutionStatus: { type: ResolutionStatus, required: false },
    userId: { type: uint },
    resolvedAt: { type: timestampSeconds, required: false },
  },
});

/** User represents an authenticated user of the system */
itemType("User", {
  keyPath: ["/user-:id", "/email-:email"],
  fields: {
    id: { type: uint, initialValue: "rand53" },
    email: { type: string, valid: `this.matches("[^@]+@[^@]+")` },
    passwordHash: { type: string },
    createdAt: {
      type: timestampSeconds,
      fromMetadata: "createdAtTime",
    },
    lastModifiedAt: {
      type: timestampSeconds,
      fromMetadata: "lastModifiedAtTime",
    },
  },
});

/** Vote represents user feedback on messages */
itemType("Vote", {
  keyPath: [
    "/chat-:chatId/message-:messageId/vote",
    "/message-:messageId/vote-:chatId",
  ],
  fields: {
    chatId: { type: uint },
    messageId: { type: uint },
    isUpvoted: { type: bool },
    votedAt: {
      type: timestampSeconds,
      fromMetadata: "lastModifiedAtTime",
    },
  },
});
