# Demisi

A premium, modern SaaS landing page built with Next.js, Framer Motion, and Tailwind CSS. Demisi features a beautiful dark-mode aesthetic with glassmorphism out of the box, smooth scrolling, and highly engaging micro-animations.

## 🚀 Features

- **Next.js App Router**: Built on top of the latest Next.js 15+ features using React 19.
- **Tailwind CSS v4**: Ultra-fast, inline theme configurations using the newest Tailwind version.
- **Framer Motion**: Smooth entrance animations, stagger effects, and scroll-linked animations.
- **Smooth Scrolling**: Implemented using `@studio-freight/lenis` for an incredibly fluid user experience.
- **Interactive UI Components**: Includes features like a custom cursor glow, grid-based parallax effects, and glassmorphic navigation.
- **Authentication Pages**: Built-in, fully designed `/login` and `/signup` pages ready to be hooked up to an authentication provider.
- **Responsive Design**: Flawlessly adapts to any screen size from mobile to ultra-wide displays.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Smooth Scroll**: [Lenis](https://lenis.studiofreight.com/)

## 🏗️ Project Structure

- `/app`: The Next.js App Router entry point. Includes the main landing page, `globals.css` for app-wide styles and setup, and authentication routes (`/login`, `/signup`).
- `/components`: Contains all modular React components:
  - `Hero`, `Brands`, `Features`, `FeatureGrid`, `Integrations`, `Testimonials`, `CTA`, `Footer`: Sections forming the main landing page.
  - `Navbar`: A fixed, glassmorphism navigation bar.
  - `SmoothScroll`: Component wrapping the application in Lenis smooth scrolling.
  - `CursorGlow`: Custom interactive cursor effect.

## 🚦 Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd demisi
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🎨 Design System

The app utilizes a "Darkrise" inspired aesthetic. Key design elements are defined in `app/globals.css`:
- **Dark Mode First**: The primary background is black `var(--background)` with off-white text `var(--foreground)`.
- **Glassmorphism**: Accessible via the `.glass` utility class for slightly transparent, blurred containers with subtle borders.
- **Gradients**: Custom gradients and `.text-gradient-primary` classes.
- **Backgrounds**: The `.bg-grid` utility allows for an engaging, subtle grid backdrop on screens.

## 📝 Next Steps (Development)

- Connect `/login` and `/signup` to a provider like NextAuth.js or Supabase.
- Populate the `Integrations` or `FeatureGrid` sections with customized product data.
- Start adding dedicated product routes using the Next.js app router.

## 📄 License

This project is open-source and available for usage. Feel free to use it as a foundation for your next SaaS application.
