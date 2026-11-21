import { LandingCallToAction } from "@/components/landing/LandingCallToAction"
import { LandingFaq } from "@/components/landing/LandingFaq"
import { LandingFeatures } from "@/components/landing/LandingFeatures"
import { LandingHero } from "@/components/landing/LandingHero"
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks"
import { LandingNavbar } from "@/components/landing/LandingNavbar"

// The landing page — the first page of the app, for tutors and students alike (REQUIREMENTS §5.1).
// No sign-up: the admin comes from the seeder, students from the admin; everyone uses Log in.
export const HomePage = () => {
  return (
    <div className="min-h-svh bg-background">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingFaq />
        <LandingCallToAction />
      </main>
    </div>
  )
}
