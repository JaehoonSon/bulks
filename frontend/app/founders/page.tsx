import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail, Globe, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Founders",
  description: "Meet the founders",
};

type SocialLinks = {
  website?: string;
  twitter?: string;
  linkedin?: string;
  email?: string; // mailto:
};

type Founder = {
  name: string;
  subtitle: string;
  img: string;
  links: SocialLinks;
};

const founders: Founder[] = [
  {
    name: "Jaehoon",
    subtitle: "YC Hacks & 20k Users",
    img: "https://storage.googleapis.com/theblucksshortform/public%20assets/team/jaehoon.png",
    links: {
      website: "https://jaehoon.vercel.app/",
      twitter: "https://x.com/knuceles",
      linkedin: "https://www.linkedin.com/in/jaehoon-son/",
      email: "mailto:son.jaehoon0826@gmail.com",
    },
  },
  {
    name: "Germain",
    subtitle: "Bloomberg",
    img: "https://storage.googleapis.com/theblucksshortform/public%20assets/team/germain.png",
    links: {
      website: "https://germain.vercel.app/",
      twitter: "https://x.com/GermainHirwa",
      linkedin: "https://www.linkedin.com/in/germain-hirwa-5b07041b3/",
      email: "mailto:ghirwa1@swarthmore.edu",
    },
  },
  {
    name: "Carson",
    subtitle: "IMO",
    img: "https://storage.googleapis.com/theblucksshortform/public%20assets/team/carson.png",
    links: {
      website: "https://www.carsonlin.dev/",
      twitter: "https://www.carsonlin.dev/",
      linkedin: "https://www.linkedin.com/in/carson-lin/",
      email: "mailto:carsonlin0713@gmail.com",
    },
  },
];

// Placeholder achievement logos for the "All of us" section
const achievements: { name: string; logo: string; href?: string }[] = [
  {
    name: "Congressional App Challenge",
    logo: "https://www.westonschools.org/high/wp-content/uploads/sites/4/2017/09/app-challenge-logo-transparent-e1505152916677.png",
    href: "#",
  },
  {
    name: "Swarthmore College SwatTank",
    logo: "https://www.swarthmore.edu/sites/default/files/styles/main_page_image/public/assets/images/communications-office/swarthmore_logo_thumb.jpg.webp?itok=cZHt54UK",
    href: "#",
  },
  {
    name: "International Mathematical Olympiad",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/IMO_logo.svg/250px-IMO_logo.svg.png",
    href: "#",
  },
  {
    name: "MIT - MITES",
    logo: "https://logos-world.net/wp-content/uploads/2021/09/MIT-Massachusetts-Institute-of-Technology-Logo.png",
    href: "#",
  },
  {
    name: "YC Hacks",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/1200px-Y_Combinator_logo.svg.png",
    href: "#",
  },
  {
    name: "Bloomberg Engineering",
    logo: "https://mma.prnewswire.com/media/649927/Bloomberg_Black_Logo.jpg?p=twitter",
    href: "#",
  },
  {
    name: "Gnosis Freight",
    logo: "https://global-uploads.webflow.com/63ff36f0db9a4f7f16992b44/6410484de1db9e94c8f1df85_GnosisFreight.png",
    href: "#",
  },
  {
    name: "Gnosis Freight",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Logo_of_the_Carrier_Corporation.svg/1200px-Logo_of_the_Carrier_Corporation.svg.png",
    href: "#",
  },
  {
    name: "JP Morgan Hackathon",
    logo: "https://cdn.prod.website-files.com/63f6e52346a353ca1752970e/644fb7a5f64fb5cb87a5beaa_20230501T1259-9f1793fc-a440-492c-a2b5-c01eba32c7f4.jpeg",
    href: "#",
  },
];

export default function FoundersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header (same as root) */}
      <header className="fixed inset-x-0 top-4 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-0">
          <div className="landing-header rounded-2xl px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Brand */}
              <Link href="/">
                <BrandLogo />
              </Link>
              {/* Center nav (hidden on mobile) */}
              <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                <Link
                  href="/#features"
                  className="px-3 py-2 rounded-full hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/#pricing"
                  className="px-3 py-2 rounded-full hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>{" "}
                <Link
                  href="/founders"
                  className="px-3 py-2 rounded-full hover:text-foreground transition-colors"
                >
                  Founders
                </Link>
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="landing-pill px-4">
                  <Link href="/login">Login</Link>
                </Button>

                <Button asChild className="landing-pill px-4">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-4 pt-28 pb-16">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Founders</h1>
          <p className="mt-2 text-muted-foreground">
            Meet the team building this project in{" "}
            <span className="font-extrabold text-primary">
              AI4Hack Hackathon
            </span>
            .
          </p>
        </header>

        <section
          aria-label="Founders"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {founders.map((f) => (
            <article key={f.name} className="group">
              {/* Image */}
              <div className="overflow-hidden rounded-2xl border bg-background">
                <Image
                  src={f.img}
                  alt={`${f.name} headshot placeholder`}
                  width={640}
                  height={640}
                  className="aspect-square h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  priority={false}
                />
              </div>

              {/* Text */}
              <div className="mt-4">
                <h2 className="text-xl font-medium leading-tight">{f.name}</h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.subtitle}
                </p>
              </div>

              {/* Socials */}
              <div className="mt-4 flex items-center gap-4">
                {f.links.website && (
                  <a
                    href={f.links.website}
                    aria-label={`${f.name} website`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-accent"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {f.links.twitter && (
                  <a
                    href={f.links.twitter}
                    aria-label={`${f.name} Twitter`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-accent"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {f.links.linkedin && (
                  <a
                    href={f.links.linkedin}
                    aria-label={`${f.name} LinkedIn`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-accent"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {f.links.email && (
                  <a
                    href={f.links.email}
                    aria-label={`${f.name} email`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-accent"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-28 mb-28" aria-label="Team achievements">
          <h3 className="text-4xl font-semibold">All of us</h3>
          <p className="mt-1 text-muted-foreground text-xl">
            have expertise participating in{" "}
            <b>
              <u>hackathons</u>
            </b>
            ,
            <b>
              <u>coding competitions</u>
            </b>
            , tech initiatives, and{" "}
            <b>
              <u>work experience</u>
            </b>
          </p>

          {/* Auto layout by intrinsic widths. Same-height images. Caption below. */}
          <div className="mt-8 flex flex-wrap gap-8 items-center justify-center">
            {achievements.map((a) => (
              <a
                key={a.name}
                href={a.href ?? "#"}
                className="group inline-flex flex-col items-center gap-2"
              >
                {/* Fixed height, dynamic width */}
                <Image
                  src={a.logo}
                  alt={`${a.name} logo`}
                  width={256} // intrinsic, not enforced
                  height={128} // sets the common height
                  className="h-32 w-auto object-contain opacity-90 transition-opacity group-hover:opacity-100"
                />
                <span className="text-xs font-medium text-center text-muted-foreground">
                  {a.name}
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* Footer (same as root) */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <BrandLogo />
            <p className="text-sm text-muted-foreground text-center sm:text-right">
              © 2025 Blucks. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
