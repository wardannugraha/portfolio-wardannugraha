import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting seeding process...");

  // 1. Clean existing data
  console.log("Cleaning old database entries...");
  await prisma.project.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.communityActivity.deleteMany({});
  await prisma.siteSetting.deleteMany({});

  // 2. Create Categories
  console.log("Creating Categories...");
  const webDev = await prisma.category.create({
    data: { name: "Web Development", slug: "web-dev" },
  });
  const uiux = await prisma.category.create({
    data: { name: "UI/UX Design", slug: "ui-ux" },
  });
  const aiMl = await prisma.category.create({
    data: { name: "AI / Machine Learning", slug: "ai-ml" },
  });
  const photography = await prisma.category.create({
    data: { name: "Photography", slug: "photography" },
  });
  const videoEditing = await prisma.category.create({
    data: { name: "Video Editing", slug: "video-editing" },
  });
  const graphicDesign = await prisma.category.create({
    data: { name: "Graphic Design", slug: "graphic-design" },
  });

  // 3. Create Projects (Technology & Creative core focus)
  console.log("Creating Projects...");
  await prisma.project.create({
    data: {
      title: "E-Commerce Platform",
      description: "A fast, modern headless e-commerce store built with Next.js App Router and Prisma.",
      content: "Detailed case study of the headless commerce application. Designed with smooth micro-interactions, dark UI layouts, and integrated payment gateway.",
      featuredImage: "/uploads/ecommerce.jpg",
      demoUrl: "https://shop-demo.wardannugraha.com",
      githubUrl: "https://github.com/wardannugraha/ecommerce-nextjs",
      categoryId: webDev.id,
      isFeatured: true,
    },
  });

  await prisma.project.create({
    data: {
      title: "AI Image Generator",
      description: "A SaaS tool integrating Stable Diffusion to generate custom creative branding assets.",
      content: "Harnessing machine learning models to help creators automate their visual banner creation processes.",
      featuredImage: "/uploads/ai-generator.jpg",
      demoUrl: "https://ai-assets.wardannugraha.com",
      githubUrl: "https://github.com/wardannugraha/ai-branding-generator",
      categoryId: aiMl.id,
      isFeatured: true,
    },
  });

  await prisma.project.create({
    data: {
      title: "Dreamscape Visual UI Kit",
      description: "Figma design system tailored for high-contrast dark theme photography portfolios.",
      content: "Complete user experience design kit tailored for portfolio architectures featuring glassmorphic overlays and high-contrast grids.",
      featuredImage: "/uploads/uikit.jpg",
      categoryId: uiux.id,
      isFeatured: false,
    },
  });

  // 4. Create Media (Creative Media Gallery)
  console.log("Creating Media items...");
  
  // Photography
  await prisma.media.create({
    data: {
      title: "Urban Dreamscape",
      url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80",
      description: "Night photography capturing neon reflection on wet city streets.",
      categoryId: photography.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Ethereal Nature",
      url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80",
      description: "Moody forest visual focusing on morning light breaking through tree leaves.",
      categoryId: photography.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Mystic Mountains",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
      description: "Towering mountain peaks draped in low-hanging atmospheric clouds.",
      categoryId: photography.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Architectural Lines",
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
      description: "Sleek, modern minimalist residential architecture elements.",
      categoryId: photography.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Street Lights",
      url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80",
      description: "Golden hour long-exposure street photography visuals.",
      categoryId: photography.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Coastal Mist",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      description: "A calming ocean view with a long exposure soft shoreline.",
      categoryId: photography.id,
      isFeatured: true,
    },
  });

  // Video Editing
  await prisma.media.create({
    data: {
      title: "Cinematic Drone Reel",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      description: "4K aerial footage and video editing showcase.",
      categoryId: videoEditing.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Abstract Motion Loop",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      description: "Moody motion graphics and creative pacing adjustments.",
      categoryId: videoEditing.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Wildlife Story",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      description: "Cinematic documentary pacing and nature capture.",
      categoryId: videoEditing.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Ocean Wave Reel",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      description: "Fluid transitions and high-frame-rate water visual cuts.",
      categoryId: videoEditing.id,
      isFeatured: true,
    },
  });

  // Graphic Design
  await prisma.media.create({
    data: {
      title: "Minimalist Branding Identity",
      url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
      description: "Modern layout and packaging identity assets.",
      categoryId: graphicDesign.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Creative Event Poster",
      url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
      description: "High-contrast poster design utilizing bold typography and shapes.",
      categoryId: graphicDesign.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Typography Experiments",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      description: "Playful graphic layouts exploring hierarchy and fonts.",
      categoryId: graphicDesign.id,
      isFeatured: true,
    },
  });

  await prisma.media.create({
    data: {
      title: "Cyberpunk UI Design",
      url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80",
      description: "Glowing abstract interface elements and HUD designs.",
      categoryId: graphicDesign.id,
      isFeatured: true,
    },
  });

  // 5. Create Skills (Core Tech & Creative)
  console.log("Creating Skills...");
  const skillsData = [
    { name: "Next.js", level: "Advanced", category: "Technology" },
    { name: "TypeScript", level: "Advanced", category: "Technology" },
    { name: "Prisma ORM", level: "Intermediate", category: "Technology" },
    { name: "PostgreSQL", level: "Intermediate", category: "Technology" },
    { name: "Figma", level: "Advanced", category: "Creative" },
    { name: "Adobe Premiere", level: "Advanced", category: "Creative" },
    { name: "Adobe Lightroom", level: "Advanced", category: "Creative" },
  ];
  for (const skill of skillsData) {
    await prisma.skill.create({ data: skill });
  }

  // 6. Create Achievements (Learner Personal Branding)
  console.log("Creating Achievements...");
  await prisma.achievement.create({
    data: {
      title: "Advanced Next.js Certification",
      issuer: "Vercel / Next.js Academy",
      date: new Date("2025-08-15"),
      description: "Verified competence in production level Next.js architectures.",
    },
  });

  // 7. Create Community Activities (Honors & Leadership)
  console.log("Creating Honors & Leadership activities...");
  await prisma.communityActivity.create({
    data: {
      title: "Law Debate Competition",
      role: "1st Place Winner / Champion",
      organization: "Debate Association & Contests",
      dateRange: "2024",
      description: "Awarded Champion in competitive debate, demonstrating advanced verbal articulation, structured legal argumentation, and critical thinking.",
    },
  });

  await prisma.communityActivity.create({
    data: {
      title: "West Java Literacy Ambassador (Duta Baca)",
      role: "Top 10 Finalist",
      organization: "Provincial Library & Archives Office",
      dateRange: "2024",
      description: "Recognized as a Top 10 ambassador at the provincial level, advocating reading programs and speaking at educational seminars.",
    },
  });

  await prisma.communityActivity.create({
    data: {
      title: "Cianjur Literacy Ambassador (Duta Baca)",
      role: "2nd Place Winner",
      organization: "Regional Library Department",
      dateRange: "2023",
      description: "Awarded second place in the regional ambassador program, helping initiate local book circles and creative youth campaigns.",
    },
  });

  console.log("Database seeded successfully! 🌱");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // We don't need to manually disconnect pool since process exits
  });
