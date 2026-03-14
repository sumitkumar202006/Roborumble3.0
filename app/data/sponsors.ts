export interface SponsorData {
  name: string;
  image: string;
  category: string;
  contribution: string;
  about: string;
  operationalRole: string;
}

export const sponsors: SponsorData[] = [
  {
    name: "Nkosh",
    image: "/Nkosh.png",
    category: "Agritech Partner",
    contribution: "Agri-Bot Infrastructure & Data Analytics",
    about: "Nutrikosh India Limited (Nkosh) is a prominent Kanpur-based agritech startup founded by alumni from IIT Roorkee. They utilize a 'Phygital' (Physical + Digital) model to empower over 50,000 farmers. Their platform leverages AI and Machine Learning for real-time crop disease detection and advisory, bridging the gap between traditional farming and high-tech engineering.",
    operationalRole: "For Robo Rumble 3.0, Nkosh serves as the primary technical consultant for robotics applications in agriculture. They are providing the telemetry datasets for the AI challenges and sponsoring the hardware kits for the Agri-Bot segment, ensuring that the student innovations have real-world utility in India's agrarian economy."
  },
  {
    name: "CSJMIF",
    image: "/CSJMIF.jpg",
    category: "Incubation Partner",
    contribution: "Seed Funding & Startup Launchpad",
    about: "The Chhatrapati Shahu Ji Maharaj Innovation Foundation (CSJMIF) is a Section-8 (Not-for-Profit) Tech-Business Incubator based within CSJM University. It supports sector-agnostic startups in DeepTech, Robotics, and AI, providing them with office space, mentoring, legal IP support, and access to a massive network of angel investors.",
    operationalRole: "CSJMIF acts as the transition bridge from student project to commercial startup. Their strategic role involves identifying the top three robotic prototypes from the Project Expo for direct entry into their pre-incubation program, offering up to ₹5 Lakhs in potential seed funding and industry mentorship."
  },
  {
    name: "Sahara",
    image: "/sahara.jpg",
    category: "Media Partner",
    contribution: "Information Diffusion & Multi-Channel Broadcast",
    about: "Sahara India Pariwar's news network, including Sahara Samay and the Hindi daily Rashtriya Sahara, is a cornerstone of regional and national journalism. With over 1,500 live connectivity centers, they specialize in the rapid diffusion of news to millions of households through satellite and print media.",
    operationalRole: "The Sahara News Network serves as the eyes and ears of the event. They are responsible for the multi-channel broadcast of the 'Robo Wars' finals and the 'Innovation Highlights' segments, ensuring that the technical achievements of the participants gain national visibility and media recognition."
  },
  {
    name: "Dominos",
    image: "/dominos.png",
    category: "Logistics Partner",
    contribution: "Field Kitchen & Logistical Support",
    about: "Domino's India is the leader in the Quick Service Restaurant (QSR) industry, renowned for its sophisticated logistical routing and time-sensitive delivery protocols. They manage one of the most efficient high-volume food supply chains in the country.",
    operationalRole: "Domino's operates as the event's tactical 'Field Kitchen.' By establishing a dedicated deployment unit on the CSJMU campus, they manage the large-scale logistical challenge of providing fresh sustenance to participants and staff on a synchronized schedule, preventing any downtime in the mission timeline."
  },
  {
    name: "DailyWash",
    image: "/dailywash.jpg",
    category: "Service Partner",
    contribution: "Operational Maintenance & Campus Integrity",
    about: "DailyWash is a specialized professional facility management provider. They focus on commercial-grade hygiene, sterilization, and operational maintenance for large institutions, ensuring that high-traffic environments meet international safety and cleanliness standards.",
    operationalRole: "DailyWash is tasked with the 'Campus Integrity Protocol.' Their teams work behind the scenes to maintain the sterilization of the innovation labs and the organization of the UIET workshops, ensuring that the high-tech equipment remains in an optimal environment free from debris or logistical clutter."
  },
];