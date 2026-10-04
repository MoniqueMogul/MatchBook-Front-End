"use client";

import ContentSkeleton from "@/components/common/ContentSkeleton";
import {
  useEffect,
  useState,
} from "react";

import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import MessagesDashboard from "@/components/buyer/messages/MessagesDashboard";
import { getMessagesViewData } from "@/lib/api/messages/messages";
import type {
  MessageParticipant,
  MessagesViewData,
} from "@/lib/api/messages/messages.types";
import { supabase } from "@/lib/supabase";

import "./page.css";

function getUserName(
  metadata: Record<string, unknown>,
  email: string | undefined,
): string {
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name.trim()
      : "";

  if (fullName) {
    return fullName;
  }

  const firstName =
    typeof metadata.first_name === "string"
      ? metadata.first_name.trim()
      : "";
  const lastName =
    typeof metadata.last_name === "string"
      ? metadata.last_name.trim()
      : "";
  const combinedName = [firstName, lastName]
    .filter(Boolean)
    .join(" ");

  if (combinedName) {
    return combinedName;
  }

  return email?.split("@")[0] || "MatchBook User";
}

function getUserInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "?";
}

export default function BuyerMessagesPage() {
  const [messagesData, setMessagesData] =
    useState<MessagesViewData | null>(null);
  const [loadError, setLoadError] =
    useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadMessages() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          throw new Error(
            "You must be signed in to view messages.",
          );
        }

        const name = getUserName(
          user.user_metadata,
          user.email,
        );

        const currentUser: MessageParticipant = {
          id: user.id,
          name,
          initials: getUserInitials(name),
        };

        const data =
          await getMessagesViewData(currentUser);

        if (isActive) {
          setMessagesData(data);
          setLoadError(null);
        }
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load messages. Please try again.",
        );
      }
    }

    void loadMessages();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="buyer-messages-page">
      <DashboardSidebar />

      <div className="buyer-messages-page__main">
        {messagesData ? (
          <MessagesDashboard data={messagesData} />
        ) : (
          <main className="messages-dashboard">
            <h1>Messages</h1>

            <>{loadError ? <p role="alert">{loadError}</p> : <ContentSkeleton shape="messages" label="Loading your messages" />}</>
          </main>
        )}
      </div>
    </div>
  );
}