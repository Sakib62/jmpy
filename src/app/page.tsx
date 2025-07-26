"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MyUrlsModal from "../components/MyUrlsModal";
import ProfileModal from "../components/ProfileModal";
import ShortenForm from "../components/ShortenForm";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [myUrlsOpen, setMyUrlsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const prevUserRef = useRef<User | null>(null);
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    // Always refresh session on load to get the latest user data (e.g., after email change)
    supabase.auth.refreshSession().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Show welcome toast on login or sign up
  useEffect(() => {
    if (user && !prevUserRef.current) {
      if (justSignedUp) {
        toast.success("Account created! Welcome!");
        setJustSignedUp(false);
      } else {
        toast.success("Welcome!");
      }
    }
    prevUserRef.current = user;
  }, [user, justSignedUp]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 animate-bg-gradient">
      <Header
        user={user}
        onSignIn={() => setAuthOpen(true)}
        onMyUrls={() => setMyUrlsOpen(true)}
        onProfile={() => setProfileOpen(true)}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={setUser}
        onSignUp={() => setJustSignedUp(true)}
      />
      <MyUrlsModal
        open={myUrlsOpen}
        onClose={() => setMyUrlsOpen(false)}
        user={user}
      />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        setUser={setUser}
      />
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-6 md:py-12">
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
          <ShortenForm user={user} onShorten={() => {}} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
