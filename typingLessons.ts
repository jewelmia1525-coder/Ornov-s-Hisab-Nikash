export interface Topic {
  title: string;
  text: string;
}

export interface Lesson {
  title: string;
  topics: Topic[];
}

export interface Level {
  title: string;
  lessons: Lesson[];
}

export interface LanguageData {
  easy: Level;
  medium: Level;
  hard: Level;
}

// Generate placeholder lessons and topics
const generateTopics = (count: number, textGenerator: (index: number) => string): Topic[] => 
  Array.from({ length: count }, (_, i) => ({
    title: `Topic ${i + 1}`,
    text: textGenerator(i),
  }));

const generateLessons = (count: number, topicGenerator: (index: number) => Topic[]): Lesson[] =>
  Array.from({ length: count }, (_, i) => ({
    title: `Lesson ${i + 1}`,
    topics: topicGenerator(i),
  }));

// --- English Texts ---
const easyEnglishText = [
  "The quick brown fox jumps over the lazy dog. A great story has a beginning, a middle, and an end. The sun shines brightly in the clear blue sky. Birds sing sweetly in the tall green trees. It is fun to learn how to type on a computer.",
  "Never underestimate the power of a good book. Reading can take you to new and exciting worlds. The library is a quiet place to study and learn. Friendship is a treasure that lasts a lifetime. Always be kind to others and help when you can.",
  "My favorite season is summer because of the warm weather. We can go swimming at the beach or have a picnic in the park. Ice cream is a delicious treat on a hot day. The days are long and the nights are short. What is your favorite thing to do?",
  "A healthy diet is important for a strong body. Eat plenty of fruits and vegetables every day. Drinking water helps you stay hydrated. Exercise is also good for your mind and body. Get enough sleep to feel rested and full of energy to start your day.",
  "The world is full of amazing animals. Lions are the kings of the jungle. Elephants are the largest land animals. Dolphins are smart and playful creatures that live in the sea. We must protect our planet and all the animals that live on it every day."
];

const mediumEnglishText = [
  "Technology has revolutionized the way we live and work, connecting people across the globe instantaneously. The internet provides access to a vast repository of information, making knowledge more accessible than ever before. However, it's crucial to use these digital tools responsibly and ethically, being mindful of privacy and the spread of misinformation. Developing digital literacy skills is essential for navigating this complex landscape successfully and safely.",
  "The study of history offers profound insights into the human experience, revealing patterns of behavior and societal development over centuries. By understanding the past, we can better comprehend the present and make more informed decisions about the future. Historical events, from great triumphs to tragic failures, provide valuable lessons about leadership, innovation, conflict, and cooperation. It's a field that requires critical thinking and analytical prowess.",
  "Climate change represents one of the most significant challenges facing humanity today. The rising global temperatures, extreme weather events, and melting ice caps are clear indicators of a planet in distress. Addressing this crisis requires a concerted global effort, involving governments, industries, and individuals. Transitioning to renewable energy sources, adopting sustainable practices, and reducing our carbon footprint are critical steps toward a healthier planet for future generations.",
  "Effective communication is a cornerstone of personal and professional success. It involves not only expressing one's own ideas clearly but also actively listening to and understanding others. Non-verbal cues, such as body language and tone of voice, play a significant role in conveying messages. Mastering the art of communication can lead to stronger relationships, better collaboration, and more effective problem-solving in all aspects of life. It builds bridges between people.",
  "The concept of economic supply and demand is fundamental to understanding market dynamics. When the demand for a product exceeds its supply, prices tend to rise. Conversely, when supply surpasses demand, prices typically fall. This delicate balance influences everything from the cost of groceries to the value of stocks. Governments and central banks often implement policies to manage these forces, aiming for economic stability and sustainable growth over the long term."
];

const hardEnglishText = [
  "The philosophical dichotomy between determinism and free will has perplexed thinkers for millennia, questioning the very essence of human agency. Determinists argue that every event, including human action, is causally necessitated by antecedent events in accordance with the laws of nature. In this view, freedom is an illusion. Conversely, libertarians contend that individuals possess genuine freedom to make choices that are not predetermined. This intricate debate traverses metaphysics, ethics, and neuroscience, with profound implications for our concepts of morality, responsibility, and justice. The compatibilist perspective attempts to reconcile these opposing views, suggesting that free will can coexist with determinism if defined appropriately.",
  "Quantum mechanics fundamentally reshaped our understanding of the physical world, introducing concepts that defy classical intuition. The principle of superposition posits that a particle can exist in multiple states simultaneously until it is measured. Entanglement describes a phenomenon where two particles become linked in such a way that the state of one instantly influences the state of the other, regardless of the distance separating them—a concept Einstein famously dubbed 'spooky action at a distance.' These counterintuitive principles are not mere theoretical curiosities; they form the bedrock of emerging technologies like quantum computing and cryptography, promising to revolutionize computation and secure communications in unprecedented ways, challenging our reality.",
  "The geopolitical landscape of the early 21st century is characterized by a complex interplay of globalization, resurgent nationalism, and asymmetrical power dynamics. Intergovernmental organizations grapple with multifaceted challenges such as transnational terrorism, cybersecurity threats, and global pandemics, which transcend traditional state boundaries. The ascendancy of non-state actors and the proliferation of information (and disinformation) via digital platforms have further complicated international relations. Navigating this volatile environment requires sophisticated diplomatic strategies, robust international cooperation, and an adaptive approach to foreign policy that can accommodate rapid shifts in global power structures and allegiances. This is a big challenge for all leaders.",
  "Bioinformatics has emerged as a crucial interdisciplinary field at the intersection of biology, computer science, and statistics, enabling the analysis of vast biological datasets. The advent of next-generation sequencing technologies has produced an unprecedented deluge of genomic, transcriptomic, and proteomic data. Sophisticated algorithms and computational tools are indispensable for assembling genomes, identifying gene functions, predicting protein structures, and understanding complex disease mechanisms. This data-driven approach is accelerating biomedical research, paving the way for personalized medicine, novel drug discovery, and a deeper, more nuanced understanding of the intricate molecular machinery that underpins life itself. The future looks very promising.",
  "The aesthetic theory of the sublime, as articulated by philosophers like Edmund Burke and Immanuel Kant, explores our response to experiences of overwhelming grandeur, power, or terror. Unlike the beautiful, which pleases and calms, the sublime evokes a mixture of awe, fear, and admiration. It's the feeling one might have when confronting a vast mountain range, a raging ocean storm, or the infinite expanse of the cosmos. This experience challenges our capacity for comprehension and highlights our own finitude, yet it can also be exhilarating, leading to a sense of intellectual and spiritual expansion. It pushes the boundaries of human perception and emotion, revealing the limits of our faculties in the face of the immense and the incomprehensible."
];

// --- Bangla Texts ---
const easyBanglaText = [
  "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি। কী শোভা, কী ছায়া গো, কী স্নেহ, কী মায়া গো! কী আঁচল বিছায়েছ বটের মূলে, নদীর কূলে কূলে।",
  "মা, তোর মুখের বাণী আমার কানে লাগে সুধার মতো। একুশে ফেব্রুয়ারি আমাদের জাতীয় জীবনে এক গৌরবময় ও ঐতিহ্যবাহী দিন। এই দিনে আমরা আমাদের ভাষা শহীদদের স্মরণ করি। তাদের আত্মত্যাগের ফলেই আমরা বাংলায় কথা বলতে পারি।",
  "আমাদের জাতীয় পতাকার রঙ সবুজ ও লাল। সবুজ রঙ বাংলাদেশের শ্যামল প্রকৃতির প্রতীক এবং লাল বৃত্তটি স্বাধীনতার নতুন সূর্যের প্রতীক। আমরা আমাদের পতাকাকে সম্মান করি। জাতীয় সংগীতের সময় আমরা সবাই দাঁড়িয়ে যাই।",
  "পড়ালেখা করে যে, গাড়ি ঘোড়া চড়ে সে। জ্ঞান অর্জন করা প্রত্যেক মানুষের জন্য ضروری। বই আমাদের পরম বন্ধু। বই পড়লে আমাদের জ্ঞান বাড়ে এবং মন ভালো থাকে। তাই আমাদের সকলের বেশি বেশি বই পড়া উচিত।",
  "সৎ পথে চলুন, জীবন সুন্দর হবে। মিথ্যা বলা মহাপাপ। আমাদের সকলের উচিত বড়দের সম্মান করা এবং ছোটদের স্নেহ করা। সততা একটি মহৎ গুণ। একজন সৎ মানুষকে সমাজের সবাই ভালোবাসে এবং বিশ্বাস করে।"
];

const mediumBanglaText = [
  "কম্পিউটার এবং ইন্টারনেট আমাদের জীবনযাত্রাকে সম্পূর্ণরূপে পরিবর্তন করে দিয়েছে। পৃথিবীর যেকোনো প্রান্তের মানুষের সাথে এখন মুহূর্তের মধ্যে যোগাযোগ করা সম্ভব। তথ্যের বিশাল ভান্ডার আমাদের হাতের মুঠোয় চলে এসেছে, যা জ্ঞানার্জনকে করেছে আগের চেয়ে অনেক বেশি সহজ। তবে, এই ডিজিটাল সরঞ্জাম ব্যবহারের ক্ষেত্রে আমাদের অবশ্যই দায়িত্বশীল হতে হবে এবং ব্যক্তিগত গোপনীয়তার প্রতি শ্রদ্ধাশীল থাকতে হবে। ডিজিটাল সাক্ষরতা অর্জন এই জটিল мире টিকে থাকার জন্য অপরিহার্য।",
  "ইতিহাসের অধ্যয়ন মানব অভিজ্ঞতা সম্পর্কে গভীর অন্তর্দৃষ্টি প্রদান করে এবং শতাব্দীর পর শতাব্দী ধরে আচরণগত নিদর্শন ও সামাজিক বিকাশের ধারা উন্মোচন করে। অতীতকে বোঝার মাধ্যমে আমরা বর্তমানকে আরও ভালোভাবে উপলব্ধি করতে এবং ভবিষ্যৎ সম্পর্কে আরও সঠিক সিদ্ধান্ত নিতে সক্ষম হই। ঐতিহাসিক ঘটনা, মহান বিজয় থেকে শুরু করে মর্মান্তিক ব্যর্থতা পর্যন্ত, নেতৃত্ব, উদ্ভাবন, সংঘাত এবং সহযোগিতা সম্পর্কে মূল্যবান শিক্ষা প্রদান করে। এটি এমন একটি ক্ষেত্র যেখানে সমালোচনামূলক চিন্তাভাবনা প্রয়োজন।",
  "জলবায়ু পরিবর্তন বর্তমানে মানবজাতির মুখোমুখি হওয়া সবচেয়ে গুরুতর চ্যালেঞ্জগুলোর মধ্যে অন্যতম। ক্রমবর্ধমান বৈশ্বিক তাপমাত্রা, চরম আবহাওয়ার ঘটনা এবং বরফ গলে যাওয়া একটি বিপর্যস্ত গ্রহের সুস্পষ্ট লক্ষণ। এই সংকট মোকাবিলায় সরকার, শিল্প এবং ব্যক্তি পর্যায়ে সমন্বিত বৈশ্বিক প্রচেষ্টা প্রয়োজন। নবায়নযোগ্য শক্তির উৎসের দিকে স্থানান্তর, টেকসই অনুশীলন গ্রহণ এবং আমাদের কার্বন ফুটপ্রিন্ট হ্রাস করা ভবিষ্যৎ প্রজন্মের জন্য একটি স্বাস্থ্যকর গ্রহ নিশ্চিত করার গুরুত্বপূর্ণ পদক্ষেপ।",
  "কার্যকর যোগাযোগ ব্যক্তিগত এবং পেশাগত সাফল্যের একটি মূল ভিত্তি। এর মধ্যে কেবল নিজের ধারণা স্পষ্টভাবে প্রকাশ করাই নয়, অন্যের কথা সক্রিয়ভাবে শোনা এবং বোঝাও অন্তর্ভুক্ত। শরীরের ভাষা এবং কণ্ঠস্বরের মতো অমৌখিক সংকেত বার্তা প্রেরণে একটি গুরুত্বপূর্ণ ভূমিকা পালন করে। যোগাযোগের এই শিল্পে দক্ষতা অর্জন করলে সম্পর্ক শক্তিশালী হয়, সহযোগিতা বাড়ে এবং জীবনের সকল ক্ষেত্রে সমস্যা সমাধানে আরও বেশি কার্যকারিতা আসে।",
  "অর্থনৈতিক সরবরাহ এবং চাহিদার ধারণাটি বাজারের গতিশীলতা বোঝার জন্য মৌলিক। যখন একটি পণ্যের চাহিদা তার সরবরাহের চেয়ে বেশি হয়, তখন দাম বাড়তে থাকে। বিপরীতভাবে, যখন সরবরাহ চাহিদাকে ছাড়িয়ে যায়, তখন দাম সাধারণত হ্রাস পায়। এই সূক্ষ্ম ভারসাম্য মুদিখানার খরচ থেকে শুরু করে স্টকের মূল্য পর্যন্ত সবকিছুকে প্রভাবিত করে। সরকার এবং কেন্দ্রীয় ব্যাংকগুলো প্রায়শই এই শক্তিগুলো পরিচালনা করার জন্য নীতি বাস্তবায়ন করে, যার লক্ষ্য অর্থনৈতিক স্থিতিশীলতা এবং টেকসই প্রবৃদ্ধি।"
];

const hardBanglaText = [
    "নিয়তিবাদ এবং স্বাধীন ইচ্ছার মধ্যে দার্শনিক দ্বিধাবিভক্তি সহস্রাব্দ ধরে চিন্তাবিদদের ধাঁধায় ফেলেছে, যা মানব সংস্থার মূল সারাংশ নিয়ে প্রশ্ন তুলেছে। নিয়তিবাদীরা যুক্তি দেন যে প্রতিটি ঘটনা, মানুষের কার্যকলাপ সহ, প্রকৃতির নিয়ম অনুসারে পূর্ববর্তী ঘটনা দ্বারা কার্যকারণগতভাবে অপরিহার্য। এই দৃষ্টিভঙ্গিতে, স্বাধীনতা একটি भ्रम। বিপরীতভাবে, স্বাধীনতাবাদীরা দাবি করেন যে ব্যক্তিরা প্রকৃত স্বাধীনতা ধারণ করে যা পূর্বনির্ধারিত নয় এমন পছন্দ করার জন্য। এই জটিল বিতর্কটি অধিবিদ্যা, নীতিশাস্ত্র এবং স্নায়ুবিজ্ঞানকে অতিক্রম করে, যা আমাদের নৈতিকতা, দায়িত্ব এবং ন্যায়বিচারের ধারণার জন্য গভীর প্রভাব ফেলে। সামঞ্জস্যবাদী দৃষ্টিভঙ্গি এই বিরোধী মতামতগুলোকে সমন্বয় করার চেষ্টা করে, পরামর্শ দেয় যে সংজ্ঞায়িত হলে স্বাধীন ইচ্ছা নিয়তিবাদের সাথে সহাবস্থান করতে পারে।",
    "কোয়ান্টাম মেকানিক্স ভৌত জগৎ সম্পর্কে আমাদের ধারণাকে মৌলিকভাবে পুনর্গঠিত করেছে, এমন ধারণা প্রবর্তন করেছে যা শাস্ত্রীয় অনুভূতিকে অস্বীকার করে। সুপারপজিশনের নীতিটি প্রস্তাব করে যে একটি কণা পরিমাপ না হওয়া পর্যন্ত একই সাথে একাধিক অবস্থায় থাকতে পারে। এনট্যাঙ্গলমেন্ট এমন একটি ঘটনা বর্ণনা করে যেখানে দুটি কণা এমনভাবে সংযুক্ত হয় যে একটির অবস্থা তাত্ক্ষণিকভাবে অন্যটির অবস্থাকে প্রভাবিত করে, তাদের পৃথককারী দূরত্ব নির্বিশেষে—একটি ধারণা যা আইনস্টাইন বিখ্যাতভাবে 'ভৌতিক দূরত্বে ভুতুড়ে ক্রিয়া' বলে অভিহিত করেছিলেন। এই আপাতবিরোধী নীতিগুলো নিছক তাত্ত্বিক কৌতূহল নয়; এগুলো কোয়ান্টাম কম্পিউটিং এবং ক্রিপ্টোগ্রাফির মতো উদীয়মান প্রযুক্তির ভিত্তি তৈরি করে, যা অভূতপূর্ব উপায়ে গণনা এবং সুরক্ষিত যোগাযোগে বিপ্লব ঘটানোর প্রতিশ্রুতি দেয়, যা আমাদের বাস্তবতাকে চ্যালেঞ্জ করে।",
    "একবিংশ শতাব্দীর প্রথম দিকের ভূ-রাজনৈতিক প্রেক্ষাপট বিশ্বায়ন, পুনরুত্থিত জাতীয়তাবাদ এবং অসমमित ক্ষমতার গতিবিদ্যার এক জটিল পারস্পরিক ক্রিয়ার দ্বারা চিহ্নিত। আন্তঃসরকারি সংস্থাগুলো আন্তর্জাতিক সন্ত্রাসবাদ, সাইবার নিরাপত্তা হুমকি এবং বিশ্বব্যাপী মহামারীর মতো বহুমুখী চ্যালেঞ্জের সাথে লড়াই করছে, যা প্রচলিত রাষ্ট্রীয় সীমানা অতিক্রম করে। বেসরকারি কুশীলবদের উত্থান এবং ডিজিটাল প্ল্যাটফর্মের মাধ্যমে তথ্যের (এবং অপতথ্যের) বিস্তার আন্তর্জাতিক সম্পর্ককে আরও জটিল করে তুলেছে। এই অস্থির পরিবেশে পথ চলার জন্য পরিশীলিত কূটনৈতিক কৌশল, শক্তিশালী আন্তর্জাতিক সহযোগিতা এবং বৈদেশিক নীতির প্রতি একটি অভিযোজিত দৃষ্টিভঙ্গি প্রয়োজন যা বিশ্ব ক্ষমতার কাঠামো এবং জোটের দ্রুত পরিবর্তনকে সামঞ্জস্য করতে পারে। এটি সকল নেতার জন্য একটি বড় চ্যালেঞ্জ।",
    "বায়োইনফরমেটিক্স জীববিজ্ঞান, কম্পিউটার বিজ্ঞান এবং পরিসংখ্যানের সংযোগস্থলে একটি গুরুত্বপূর্ণ আন্তঃবিষয়ক ক্ষেত্র হিসাবে আবির্ভূত হয়েছে, যা বিশাল জৈবিক ডেটাসেট বিশ্লেষণের সুযোগ করে দিয়েছে। নেক্সট-জেনারেশন সিকোয়েন্সিং প্রযুক্তির আবির্ভাব জিনোমিক, ট্রান্সক্রিপ্টোমিক এবং প্রোটিওমিক ডেটার এক অভূতপূর্ব বন্যা তৈরি করেছে। জিনোম একত্রীকরণ, জিনের কার্যকারিতা শনাক্তকরণ, প্রোটিনের কাঠামো পূর্বাভাস এবং জটিল রোগের প্রক্রিয়া বোঝার জন্য অত্যাধুনিক অ্যালগরিদম এবং গণনামূলক সরঞ্জাম অপরিহার্য। এই ডেটা-চালিত পদ্ধতি বায়োমেডিক্যাল গবেষণাকে ত্বরান্বিত করছে, যা ব্যক্তিগতকৃত ওষুধ, নতুন ওষুধ আবিষ্কার এবং জীবনের অন্তর্নিহিত জটিল আণবিক যন্ত্রাদি সম্পর্কে গভীরতর উপলব্ধির পথ প্রশস্ত করছে। ভবিষ্যৎ খুব আশাব্যঞ্জক দেখাচ্ছে।",
    "এডমন্ড বার্ক এবং ইমানুয়েল কান্টের মতো দার্শনিকদের দ্বারা বিবৃত মহিমান্বিতের নান্দনিক তত্ত্বটি অপ্রতিরোধ্য মহিমা, শক্তি বা ভয়ের অভিজ্ঞতার প্রতি আমাদের প্রতিক্রিয়া অন্বেষণ করে। সুন্দরের বিপরীতে, যা আনন্দ দেয় এবং শান্ত করে, মহিমান্বিত ভয়, প্রশংসা এবং বিস্ময়ের মিশ্রণ জাগিয়ে তোলে। এটি এমন এক অনুভূতি যা বিশাল পর্বতশ্রেণী, উত্তাল সামুদ্রিক ঝড় বা মহাজাগতিক অসীম বিস্তৃতির মুখোমুখি হলে হতে পারে। এই অভিজ্ঞতাটি আমাদের উপলব্ধির ক্ষমতাকে চ্যালেঞ্জ করে এবং আমাদের নিজস্ব সীমাবদ্ধতাকে তুলে ধরে, তবুও এটি উত্তেজনাপূর্ণও হতে পারে, যা বৌদ্ধিক এবং আধ্যাত্মিক প্রসারণের অনুভূতিতে নিয়ে যায়। এটি মানব উপলব্ধি এবং আবেগের সীমানাকে ঠেলে দেয়, অপরিসীম এবং বোধগম্যহীনদের মুখে আমাদের অনুষদের সীমাবদ্ধতা প্রকাশ করে।"
];

// --- Structure Assembly ---
export const typingLessons: {
  english: LanguageData;
  bangla: LanguageData;
} = {
  english: {
    easy: {
      title: 'Easy',
      lessons: generateLessons(5, () => generateTopics(5, (i) => easyEnglishText[i])),
    },
    medium: {
      title: 'Medium',
      lessons: generateLessons(5, () => generateTopics(5, (i) => mediumEnglishText[i])),
    },
    hard: {
      title: 'Hard',
      lessons: generateLessons(5, () => generateTopics(5, (i) => hardEnglishText[i])),
    },
  },
  bangla: {
    easy: {
      title: 'সহজ',
      lessons: generateLessons(5, () => generateTopics(5, (i) => easyBanglaText[i])),
    },
    medium: {
      title: 'মধ্যম',
      lessons: generateLessons(5, () => generateTopics(5, (i) => mediumBanglaText[i])),
    },
    hard: {
      title: 'কঠিন',
      lessons: generateLessons(5, () => generateTopics(5, (i) => hardBanglaText[i])),
    },
  },
};