import { NicheTemplate } from "./types";

export const NICHE_TEMPLATES: NicheTemplate[] = [
  {
    id: "dtc_skincare",
    name: "DTC Skincare & Beauty",
    description: "Premium organic facial serums and dermatologically tested anti-aging skincare products.",
    preloadedVariations: [
      {
        id: "skin_var_1",
        name: "Scientific Proof & Ingredients",
        niche: "DTC Skincare & Beauty",
        hook: "Stop putting random chemicals on your face.",
        body: "Our custom vitamin C serum has zero synthetic fillers. Dermatologist approved, 100% organic, and clinically proven to brighten skin spots in just 7 days. Join over 40,000 women who switched to clean skincare.",
        cta: "Shop Now & Save 15%",
        visualStyle: "Green-screen style: Creator pointing to clean scientific reports, showing active glass amber bottles, followed by zero-makeup skin close-ups.",
        trend: "Scientific Green Screen Explanation",
        ctr: 3.82,
        conversions: 142,
        spend: 520,
        days: 16,
        impressions: 24000
      },
      {
        id: "skin_var_2",
        name: "Morning Routine Vlog",
        niche: "DTC Skincare & Beauty",
        hook: "How I fixed my dry skin barrier in under two weeks.",
        body: "My morning glow routine. First, cleansing. Second, applying this active hydrating serum. No sticky residue, no heavy perfume. Just pure botanical moisture that locked in all day. Get yours now with free delivery.",
        cta: "Shop Today",
        visualStyle: "UGC style: Fast cuts of creator in a brightly lit modern bathroom applying the serum with serene background music.",
        trend: "UGC Aesthetic Vlog",
        ctr: 2.15,
        conversions: 52,
        spend: 290,
        days: 14,
        impressions: 12000
      },
      {
        id: "skin_var_3",
        name: "Direct Offer / Heavy Discount",
        niche: "DTC Skincare & Beauty",
        hook: "Hurry! Get 30% off our best-selling serum.",
        body: "Unlock your skin's natural glow for a fraction of the cost. Limited-time 30% off sale. Formulated with pure hyaluronic acid and botanical stem cells. Cruelty-free, vegan, and backed by a 30-day empty-bottle guarantee.",
        cta: "Claim 30% Off",
        visualStyle: "Product-centric close-up of a rotating bottle with sleek pastel-colored background, high-contrast overlay text showing '30% OFF TODAY'.",
        trend: "Aesthetic Product Showcase",
        ctr: 1.05,
        conversions: 11,
        spend: 85,
        days: 14,
        impressions: 7100
      }
    ]
  },
  {
    id: "saas_calendar",
    name: "B2B SaaS (AI Smart Calendar)",
    description: "AI-powered calendar and meeting productivity assistant that auto-schedules and defends deep focus blocks.",
    preloadedVariations: [
      {
        id: "saas_var_1",
        name: "Relatable Humor POV",
        niche: "B2B SaaS (AI Smart Calendar)",
        hook: "POV: You are color-coding your 12th calendar event instead of doing actual work.",
        body: "We've all been there. Spending an hour 'planning' so we can delay actual hard tasks. Stop managing your schedule and let ChronosAI do it for you. It's the silent assistant that defends your focus block so you can build your business.",
        cta: "Automate Your Schedule",
        visualStyle: "Office comedy: Creator looking dead-eyed at a laptop screen, dragging calendar blocks back and forth manually, followed by quick smart software demo.",
        trend: "Corporate Office POV Comedy",
        ctr: 4.15,
        conversions: 152,
        spend: 850,
        days: 28,
        impressions: 41000
      },
      {
        id: "saas_var_2",
        name: "Productivity Hook",
        niche: "B2B SaaS (AI Smart Calendar)",
        hook: "Spend 5 hours less scheduling meetings every single week.",
        body: "Stop the back-and-forth email ping pong just to find 30 minutes to chat. ChronosAI analyzes your calendar, auto-schedules meetings in optimal clusters, and defends your focus blocks. Connects with Slack, Google, and Outlook in 10 seconds.",
        cta: "Try Free For 14 Days",
        visualStyle: "Fast-paced screen recording of a chaotic calendar instantly restructuring itself into clean, organized blocks as the user toggles ChronosAI on.",
        trend: "Satisfying UI Transformation",
        ctr: 2.38,
        conversions: 55,
        spend: 380,
        days: 18,
        impressions: 16200
      },
      {
        id: "saas_var_3",
        name: "Social Proof / Competitor Shift",
        niche: "B2B SaaS (AI Smart Calendar)",
        hook: "Why 8,000+ modern founders threw away their old scheduling links.",
        body: "Standard booking links are passive-aggressive. ChronosAI flips the script. It suggests perfect times for both parties and schedules around your energy peaks, not just your availability. See why tech founders are switching.",
        cta: "Join ChronosAI",
        visualStyle: "Selfie vlog: Creator in a modern workspace holding their phone, talking directly to the camera with high energy, showing the ChronosAI mobile dashboard.",
        trend: "Founder-to-Founder Referral",
        ctr: 1.12,
        conversions: 9,
        spend: 60,
        days: 8,
        impressions: 4200
      }
    ]
  },
  {
    id: "dtc_tumbler",
    name: "DTC E-Commerce (Eco Tumbler)",
    description: "High-end, plastic-free thermal coffee tumblers crafted with recycled steel for eco-conscious professionals.",
    preloadedVariations: [
      {
        id: "eco_var_1",
        name: "Eco-Shock / Health Warning",
        niche: "DTC E-Commerce (Eco Tumbler)",
        hook: "Stop drinking microplastics with your hot morning brew.",
        body: "Did you know standard paper cups and plastic-lined tumblers release millions of microplastics when exposed to boiling liquid? Your health shouldn't be the cost of your caffeine. Switch to the world's first fully zero-plastic thermal mug.",
        cta: "Claim Your EcoMug",
        visualStyle: "Green-screen aesthetic: Creator pointing at a scientific article about microplastics, then zooming in on the plastic-free seals of the EcoMug.",
        trend: "Scientific Green Screen Explanation",
        ctr: 3.42,
        conversions: 124,
        spend: 580,
        days: 22,
        impressions: 25000
      },
      {
        id: "eco_var_2",
        name: "Problem-Solving Narrative",
        niche: "DTC E-Commerce (Eco Tumbler)",
        hook: "Your morning coffee is cooling down faster than your motivation...",
        body: "Stop settling for lukewarm drinks in leaky mugs. The EcoMug keeps your brew piping hot for 12 hours straight. Crafted with dual-wall vacuum insulation and 100% ocean-recycled steel. No metallic taste, no plastic liners.",
        cta: "Shop Now & Save 15%",
        visualStyle: "UGC style: Quick cuts of a creator struggling with a standard mug (spilling, cold coffee), then transitioning to a sleek, smiling clip drinking from EcoMug while commuting.",
        trend: "UGC Relatability Vlog",
        ctr: 1.85,
        conversions: 48,
        spend: 240,
        days: 16,
        impressions: 13000
      },
      {
        id: "eco_var_3",
        name: "Aesthetic Product Spin",
        niche: "DTC E-Commerce (Eco Tumbler)",
        hook: "Get 20% off the most durable, stylish reusable mug in 2026.",
        body: "The search for the perfect commuter mug is over. Spill-proof, scratch-resistant, and fits perfectly in your car cup holder. Over 25,000+ coffee lovers have made the switch. Order yours today with a 30-day leak-proof guarantee.",
        cta: "Get 20% Off Today",
        visualStyle: "Product-centric focus: Clean studio close-ups rotating the mug in multiple beautiful pastel colors, pouring liquid in slow motion.",
        trend: "Aesthetic Product Showcase",
        ctr: 0.95,
        conversions: 8,
        spend: 55,
        days: 11,
        impressions: 5100
      }
    ]
  },
  {
    id: "apparel_fashion",
    name: "Apparel & Fashion (Activewear)",
    description: "Premium, squat-proof activewear and seamless gym leggings for female athletes and fitness enthusiasts.",
    preloadedVariations: [
      {
        id: "apparel_var_1",
        name: "Squat-Test & Transparency",
        niche: "Apparel & Fashion (Activewear)",
        hook: "Are your leggings actually squat-proof? Let's check.",
        body: "We put our seamless activewear leggings through the ultimate test: full deep squats, high-intensity leaps, and high stretching. Zero sheer, 100% opaque, and built with our custom double-knitted compression fabric. Lift with confidence.",
        cta: "Shop the Squat-Proof Collection",
        visualStyle: "UGC video: Fitness coach in gym showing deep squats close up, highlighting that zero undergarments are visible through the leggings.",
        trend: "Extreme Product Durability Test",
        ctr: 4.21,
        conversions: 184,
        spend: 780,
        days: 20,
        impressions: 31000
      },
      {
        id: "apparel_var_2",
        name: "Unboxing / Aesthetic Trial",
        niche: "Apparel & Fashion (Activewear)",
        hook: "These buttery-soft active leggings just arrived and omg...",
        body: "The packaging is stunning but the fit is even better. It has a high-rise waist that doesn't slip down during cardio, zero uncomfortable seams, and literally feels like a second skin. Here are three ways I style them this week.",
        cta: "Explore Styles",
        visualStyle: "UGC style: Close up of opening a high-end matte box, creator pulling out leggings, doing a transition cut wearing them and smiling.",
        trend: "Aesthetic Unboxing & Try-On",
        ctr: 2.45,
        conversions: 61,
        spend: 340,
        days: 14,
        impressions: 15000
      },
      {
        id: "apparel_var_3",
        name: "Flat-Lay / General Promo",
        niche: "Apparel & Fashion (Activewear)",
        hook: "Get 15% off premium premium gym activewear.",
        body: "Upgrade your gym wardrobe today. Engineered with sweat-wicking tech, ultra-soft yarns, and ergonomic seams. Designed for athletes, worn by everyone. Discover over 15+ colorways now with free shipping over $50.",
        cta: "Shop 15% Discount",
        visualStyle: "Minimalist layout: Static flat-lay images of leggings and crop tops on a clean wooden background with slow zoom in.",
        trend: "Minimalist Catalogue Promo",
        ctr: 0.88,
        conversions: 6,
        spend: 75,
        days: 14,
        impressions: 5200
      }
    ]
  },
  {
    id: "home_fitness",
    name: "Home Fitness & Wellness",
    description: "Compact smart resistance bands and portable home gyms with custom workout app integrations.",
    preloadedVariations: [
      {
        id: "fit_var_1",
        name: "Ditch the Gym Membership",
        niche: "Home Fitness & Wellness",
        hook: "I cancelled my $120 gym membership for this $50 band.",
        body: "No more waiting for equipment, no more fighting for parking. This compact smart resistance system delivers up to 150 lbs of modular load that fits inside a backpack. Link up to our free workout app for 100+ targeted training sessions.",
        cta: "Get My Smart Gym Pack",
        visualStyle: "UGC style: Creator packing a sleek pouch, pulling out neon-colored bands, attaching them to a door frame, and doing full body exercises in her living room.",
        trend: "UGC Relatability Vlog",
        ctr: 3.65,
        conversions: 112,
        spend: 490,
        days: 18,
        impressions: 19000
      },
      {
        id: "fit_var_2",
        name: "Time-Saving Smart Workouts",
        niche: "Home Fitness & Wellness",
        hook: "How busy moms get a killer strength workout in 15 minutes.",
        body: "Between work, school runs, and chores, who has 2 hours for the gym? Our smart bands let you activate high-intensity resistance workouts right at your kitchen counter. Track burn metrics on your phone in real time.",
        cta: "Shop 15-Min Fit Packs",
        visualStyle: "Vlog format: Creator multitasking at home, then dropping into a quick 15-minute resistance band routine while baby is napping.",
        trend: "Busy Lifestyle Hack",
        ctr: 2.10,
        conversions: 35,
        spend: 210,
        days: 14,
        impressions: 9800
      }
    ]
  },
  {
    id: "pet_care",
    name: "Pet Care & Premium Treats",
    description: "Allergy-free gourmet food subscriptions and clean baked organic treats for dogs and cats.",
    preloadedVariations: [
      {
        id: "pet_var_1",
        name: "Dog Reaction Test",
        niche: "Pet Care & Premium Treats",
        hook: "My dog literally ignores all treats except for these...",
        body: "No grain, no fillers, no artificial binders. Just 100% human-grade freeze-dried beef liver infused with sweet potato. See why over 15,000+ picky eaters are obsessed. Get your dog's starter box for 20% off today.",
        cta: "Claim 20% Pet Box",
        visualStyle: "High energy: Creator holding two different treats, dog immediately knocking over competitor pack to devour the premium treat.",
        trend: "Extreme Pet Preference Test",
        ctr: 3.95,
        conversions: 135,
        spend: 410,
        days: 15,
        impressions: 17200
      },
      {
        id: "pet_var_2",
        name: "Allergen Health Audit",
        niche: "Pet Care & Premium Treats",
        hook: "If your dog is scratching their ears, read this immediately.",
        body: "Most pet treats are packed with corn, wheat, and industrial byproduct oils that trigger itchy yeast infections. Stop feeding your best friend filler garbage. Our treats are single-ingredient, hypoallergenic, and baked fresh.",
        cta: "Shop Clean Treats",
        visualStyle: "Green-screen aesthetic: Creator pointing at common dog treat ingredient list, highlighting chemical terms, then switching to clean organic packaging.",
        trend: "Scientific Green Screen Explanation",
        ctr: 2.88,
        conversions: 78,
        spend: 320,
        days: 14,
        impressions: 11000
      }
    ]
  },
  {
    id: "elearning_courses",
    name: "E-Learning & Digital Courses",
    description: "Self-paced expert-led bootcamps and masterclasses for tech and creative career advancement.",
    preloadedVariations: [
      {
        id: "learn_var_1",
        name: "Career Transition Hook",
        niche: "E-Learning & Digital Courses",
        hook: "The exact skill that got me a remote job in under 6 months.",
        body: "No expensive university degree, no coding background required. Modern product copywriting is booming. Our intensive 12-module self-paced masterclass teaches you how to write copy that converts, build a portfolio, and land your first client.",
        cta: "Enroll in Masterclass",
        visualStyle: "Selfie vlog: Creator working in a gorgeous beachfront cafe on a laptop, talking candidly to the camera about escaping the corporate 9-to-5 grind.",
        trend: "POV Freedom Vlog",
        ctr: 3.55,
        conversions: 82,
        spend: 460,
        days: 19,
        impressions: 21000
      },
      {
        id: "learn_var_2",
        name: "Skill-Up Checklist",
        niche: "E-Learning & Digital Courses",
        hook: "3 tech skills you can master in 30 days (without coding).",
        body: "1. No-Code design. 2. Conversion copywriting. 3. Visual content creation. These are in massive demand by 7-figure startups. We bundle all three into a single, comprehensive bootcamp. Learn step-by-step and unlock your path.",
        cta: "Learn More Now",
        visualStyle: "Fast-paced editing: Tech creator pointing to text overlays on-screen listing skills, showing beautiful visual slides of the online course dashboard.",
        trend: "Educational Roadmap Listicle",
        ctr: 2.18,
        conversions: 38,
        spend: 250,
        days: 14,
        impressions: 10500
      }
    ]
  },
  {
    id: "smart_home",
    name: "Smart Home Devices",
    description: "Automated energy-saving thermostats and motion-sensing dimmable ambient lighting solutions.",
    preloadedVariations: [
      {
        id: "smart_var_1",
        name: "Energy Bill Shock",
        niche: "Smart Home Devices",
        hook: "How we cut our monthly electricity bill by 35% with this tiny gadget.",
        body: "Stop heating or cooling an empty house. Our smart thermostat automatically senses when you leave, adapts to peak electric utility rates, and programs itself around your lifestyle. Installs in under 10 minutes with just a screwdriver.",
        cta: "Save Energy Today",
        visualStyle: "UGC style: Creator holding up an expensive paper energy bill with a shocked face, then showing a close up of mounting the sleek black thermostat on the wall.",
        trend: "Life Hack Cost reduction",
        ctr: 3.72,
        conversions: 104,
        spend: 530,
        days: 21,
        impressions: 22000
      },
      {
        id: "smart_var_2",
        name: "Cozy Home Aesthetic",
        niche: "Smart Home Devices",
        hook: "Instantly change the entire vibe of your room with one tap.",
        body: "Introducing smart ambient ambient light strips. Fully motion-activated, over 16 million colors, and syncs directly to your TV or music. Create the perfect cozy workspace, game room, or cinema aesthetic in 5 minutes.",
        cta: "Get Ambient Lights",
        visualStyle: "Cinematic slow motion: Creator tapping her phone, room instantly glowing with a gorgeous soft amber lighting theme that syncs to a record player.",
        trend: "Aesthetic Room Makeover",
        ctr: 2.62,
        conversions: 55,
        spend: 310,
        days: 14,
        impressions: 13000
      }
    ]
  },
  {
    id: "eco_cleaning",
    name: "Eco-Friendly Cleaning Products",
    description: "Water-soluble plant-based cleaning tablets sold with refillable glass spray dispensers.",
    preloadedVariations: [
      {
        id: "clean_var_1",
        name: "Waste Elimination Hook",
        niche: "Eco-Friendly Cleaning Products",
        hook: "Stop paying for 95% water in single-use plastic bottles.",
        body: "Standard cleaning sprays are mostly water shipped in plastic that sits in landfills for centuries. Our plant-powered tablets dissolve instantly in normal tap water. Buy our reusable frosted glass bottle once, refill forever for just $1.50.",
        cta: "Claim Starter Kit",
        visualStyle: "UGC style: Creator showing a kitchen counter crowded with colorful plastic trash sprayers, dropping a small tablet into water and watching it fizz.",
        trend: "Satisfying Fizzing Demo",
        ctr: 3.68,
        conversions: 119,
        spend: 480,
        days: 18,
        impressions: 18500
      },
      {
        id: "clean_var_2",
        name: "Grease Dissolve Test",
        niche: "Eco-Friendly Cleaning Products",
        hook: "Can eco-cleaning sprays actually dissolve kitchen grease? Let's test.",
        body: "Skeptics said plant-based wouldn't cut through heavy baked-on stovetop grease. Watch this. One spray, wait 10 seconds, wipe once. Clean, non-toxic, pet-safe, and infused with pure cold-pressed grapefruit peel oils.",
        cta: "Get My Cleaning Pack",
        visualStyle: "Split screen: On the left, spraying a greasy metal stovetop. On the right, wiping it perfectly clean in one fluid swipe.",
        trend: "Before-and-After Stunt Test",
        ctr: 2.82,
        conversions: 62,
        spend: 280,
        days: 14,
        impressions: 11500
      }
    ]
  },
  {
    id: "b2c_mobile_apps",
    name: "B2C Mobile Apps (Mindfulness)",
    description: "Stress-reduction mobile applications specializing in ambient audio landscapes and sleep meditations.",
    preloadedVariations: [
      {
        id: "app_var_1",
        name: "Sleep Help POV",
        niche: "B2C Mobile Apps (Mindfulness)",
        hook: "POV: It is 3 AM and your brain is reviewing everything you said in 2018.",
        body: "Stop tossing and turning. Our sleep science app uses targeted binaural beats and expert-led bedtime audio journeys that calm your nervous system in 5 minutes flat. Download for free and finally claim the deep rest you deserve.",
        cta: "Download Free App",
        visualStyle: "Relatable text overlay: Creator wide-awake in a dark room looking at her glowing phone screen with a funny/stressed expression.",
        trend: "Late Night Relatability POV",
        ctr: 4.38,
        conversions: 195,
        spend: 920,
        days: 25,
        impressions: 48000
      },
      {
        id: "app_var_2",
        name: "Anxiety Calming Breath",
        niche: "B2C Mobile Apps (Mindfulness)",
        hook: "Try this 10-second nervous system reset with me right now.",
        body: "Breathe in for 4 seconds as the circle expands... hold... and let go. This is box breathing. Our app features over 200+ guided breathing patterns and ambient rain soundscapes designed to instantly lower stress. Free to start.",
        cta: "Install Free Today",
        visualStyle: "Aesthetic graphic: A glowing minimalist circle expanding and shrinking in perfect rhythm with soft ambient chime audio tracks in background.",
        trend: "Interactive Breathing Stunt",
        ctr: 3.12,
        conversions: 94,
        spend: 420,
        days: 15,
        impressions: 18000
      }
    ]
  }
];
