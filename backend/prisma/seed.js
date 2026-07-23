import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 IELTS & CEFR topics seeding started...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Clear existing topics to re-populate cleanly
  await prisma.dailyTopic.deleteMany({});

  // ================================================================
  // IELTS SPEAKING MAVZULARI
  // ================================================================

  const speakingPart1 = [
    {
      level: '4.0-4.5',
      text: 'Talk about your hometown and your family.',
      instructions: 'Answer basic questions: Where is your hometown? Do you live in a house or an apartment? Who do you live with? What is your favorite room?',
      time: 2,
    },
    {
      level: '5.0-5.5',
      text: 'Describe your daily routine and free time hobbies.',
      instructions: 'Answer: What do you usually do in the morning? What hobbies do you enjoy in your free time? Do you prefer spending weekends at home or outdoors?',
      time: 2,
    },
    {
      level: '6.0-6.5',
      text: 'Talk about technology and mobile phone usage.',
      instructions: 'Answer: How often do you use your smartphone? What apps do you use most? Has technology made life easier or more complicated?',
      time: 2,
    },
    {
      level: '7.0-7.5',
      text: 'Discuss foreign languages and international travel.',
      instructions: 'Answer: Why are you learning English? How many languages do you speak? What are the benefits of traveling to foreign countries?',
      time: 2,
    },
    {
      level: '8.0+',
      text: 'Talk about cultural identity and global communication.',
      instructions: 'Answer: How does global communication affect local traditions? Is it important to preserve regional languages? How do you stay connected with your culture?',
      time: 2,
    },
  ];

  const speakingPart2 = [
    {
      level: '4.0-4.5',
      text: 'Describe a family member you admire greatly.',
      instructions: 'Cue Card: Describe a person in your family. You should say: Who this person is, What they are like, What you do together, and explain why you admire them.',
      time: 3,
    },
    {
      level: '5.0-5.5',
      text: 'Describe a memorable place or park you visited recently.',
      instructions: 'Cue Card: Describe a park or garden you visited. You should say: Where it is, When you went there, What you did there, and explain why it was memorable.',
      time: 3,
    },
    {
      level: '6.0-6.5',
      text: 'Describe a useful skill you learned outside of school or university.',
      instructions: 'Cue Card: Describe a skill you learned. You should say: What the skill is, How and where you learned it, Who helped you, and explain why it is useful in your life.',
      time: 3,
    },
    {
      level: '7.0-7.5',
      text: 'Describe an ambitious goal you achieved in your study or career.',
      instructions: 'Cue Card: Describe a major achievement. You should say: What the goal was, How you prepared and worked for it, What obstacles you faced, and how you felt when you achieved it.',
      time: 3,
    },
    {
      level: '8.0+',
      text: 'Describe a complex problem or social issue you attempted to solve or research.',
      instructions: 'Cue Card: Describe a challenging problem. You should say: What the problem was, Why it was complex, What action or research you conducted, and what the outcome was.',
      time: 3,
    },
  ];

  const speakingPart3 = [
    {
      level: '4.0-4.5',
      text: 'Discussion: The role of parents and family in child development.',
      instructions: 'Discuss: How important is family support for young children? Should parents decide their children\'s future careers?',
      time: 4,
    },
    {
      level: '5.0-5.5',
      text: 'Discussion: Public parks vs private entertainment in modern cities.',
      instructions: 'Discuss: Why do cities need green spaces and public parks? Do people spend enough time outdoors today?',
      time: 4,
    },
    {
      level: '6.0-6.5',
      text: 'Discussion: How automation and online learning are reshaping education.',
      instructions: 'Discuss: Will online courses replace traditional universities? What practical skills cannot be taught over the internet?',
      time: 4,
    },
    {
      level: '7.0-7.5',
      text: 'Discussion: Environmental conservation vs economic growth priorities.',
      instructions: 'Discuss: Can developing nations achieve economic growth without damaging the environment? What international agreements are most effective?',
      time: 4,
    },
    {
      level: '8.0+',
      text: 'Discussion: Artificial Intelligence ethics, governance, and the future of work.',
      instructions: 'Discuss: What ethical boundaries should be set for autonomous AI systems? How should governments address potential mass technological unemployment?',
      time: 4,
    },
  ];

  // ================================================================
  // IELTS WRITING TASK 1 (WITH CHART IMAGES)
  // ================================================================

  const writingTask1 = [
    {
      level: '4.0-4.5',
      text: 'The bar chart below shows the number of mobile phone users in five different countries in 2023.',
      instructions: 'Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '5.0-5.5',
      text: 'The line graph shows global carbon dioxide emissions (in billion tonnes) between 1990 and 2020.',
      instructions: 'Summarize the main trends shown in the graph. Compare key periods and highlight major changes. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '6.0-6.5',
      text: 'The pie charts compare household energy consumption by source in 2010 and 2022.',
      instructions: 'Summarize the data by selecting and reporting main features, comparing energy percentages. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '7.0-7.5',
      text: 'The table below details international tourist arrivals and total expenditure across six European regions in 2021.',
      instructions: 'Analyze the data provided in the table. Report key figures, compare regional performance, and highlight notable disparities. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '8.0+',
      text: 'The flow chart illustrates the multi-stage industrial process of desalinating seawater to produce drinking water.',
      instructions: 'Describe the complete technical process in a clear, sequential report using active and passive structures appropriately. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
  ];

  // ================================================================
  // IELTS WRITING TASK 2 (ESSAYS)
  // ================================================================

  const writingTask2 = [
    {
      level: '4.0-4.5',
      text: 'Some people think that children should spend more time playing sports outdoors rather than playing computer games inside. Do you agree or disagree?',
      instructions: 'Write an essay giving your opinion. Give reasons and personal examples. Write at least 250 words.',
      time: 40,
      words: 250,
    },
    {
      level: '5.0-5.5',
      text: 'Many people nowadays prefer to buy goods online rather than in traditional physical shops. What are the advantages and disadvantages of online shopping?',
      instructions: 'Discuss both advantages and disadvantages of online shopping. Give reasons and relevant examples. Write at least 250 words.',
      time: 40,
      words: 250,
    },
    {
      level: '6.0-6.5',
      text: 'Some people believe that university education should be free for all students. Others argue that students should pay for their own higher education. Discuss both views and give your opinion.',
      instructions: 'Discuss both arguments thoroughly. State your own perspective clearly with supporting evidence. Write at least 250 words.',
      time: 40,
      words: 250,
    },
    {
      level: '7.0-7.5',
      text: 'In many countries, urban traffic congestion has reached unprecedented levels. What are the primary causes of this issue, and what effective measures can governments take to resolve it?',
      instructions: 'Analyze the main causes of severe traffic congestion and propose well-reasoned government solutions. Write at least 250 words.',
      time: 40,
      words: 250,
    },
    {
      level: '8.0+',
      text: 'The rapid development of autonomous artificial intelligence systems presents profound economic opportunities alongside ethical risks. To what extent do the risks of AI outweigh its benefits to human society?',
      instructions: 'Construct a critical, highly structured argumentative essay analyzing economic, technological, and ethical dimensions. Write at least 250 words.',
      time: 40,
      words: 250,
    },
  ];

  // ================================================================
  // Database yozish va barcha darajalar (4.0 - 8.0+) uchun moslash
  // ================================================================

  const allLevels = ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'];

  let count = 0;

  // Helper to map bracket level to individual band scores
  function getLevelsForBracket(bracket) {
    if (bracket === '4.0-4.5') return ['4.0', '4.5'];
    if (bracket === '5.0-5.5') return ['5.0', '5.5'];
    if (bracket === '6.0-6.5') return ['6.0', '6.5'];
    if (bracket === '7.0-7.5') return ['7.0', '7.5'];
    return ['8.0', '8.5', '9.0'];
  }

  // 1. Speaking Part 1
  for (const item of speakingPart1) {
    const levels = getLevelsForBracket(item.level);
    for (const lvl of levels) {
      await prisma.dailyTopic.create({
        data: {
          type: 'speaking',
          subtype: 'part1',
          levelSystem: 'ielts',
          level: lvl,
          topicText: item.text,
          topicData: {
            topic_text: item.text,
            instructions: item.instructions,
            time_limit_minutes: item.time,
            word_limit: null,
          },
          dateGenerated: today,
          isActive: true,
        },
      });
      count++;
    }
  }

  // 2. Speaking Part 2
  for (const item of speakingPart2) {
    const levels = getLevelsForBracket(item.level);
    for (const lvl of levels) {
      await prisma.dailyTopic.create({
        data: {
          type: 'speaking',
          subtype: 'part2',
          levelSystem: 'ielts',
          level: lvl,
          topicText: item.text,
          topicData: {
            topic_text: item.text,
            instructions: item.instructions,
            time_limit_minutes: item.time,
            word_limit: null,
          },
          dateGenerated: today,
          isActive: true,
        },
      });
      count++;
    }
  }

  // 3. Speaking Part 3
  for (const item of speakingPart3) {
    const levels = getLevelsForBracket(item.level);
    for (const lvl of levels) {
      await prisma.dailyTopic.create({
        data: {
          type: 'speaking',
          subtype: 'part3',
          levelSystem: 'ielts',
          level: lvl,
          topicText: item.text,
          topicData: {
            topic_text: item.text,
            instructions: item.instructions,
            time_limit_minutes: item.time,
            word_limit: null,
          },
          dateGenerated: today,
          isActive: true,
        },
      });
      count++;
    }
  }

  // 4. Writing Task 1 (With Images!)
  for (const item of writingTask1) {
    const levels = getLevelsForBracket(item.level);
    for (const lvl of levels) {
      await prisma.dailyTopic.create({
        data: {
          type: 'writing',
          subtype: 'task1',
          levelSystem: 'ielts',
          level: lvl,
          topicText: item.text,
          topicData: {
            topic_text: item.text,
            instructions: item.instructions,
            image_url: item.image_url,
            time_limit_minutes: item.time,
            word_limit: item.words,
          },
          dateGenerated: today,
          isActive: true,
        },
      });
      count++;
    }
  }

  // 5. Writing Task 2
  for (const item of writingTask2) {
    const levels = getLevelsForBracket(item.level);
    for (const lvl of levels) {
      await prisma.dailyTopic.create({
        data: {
          type: 'writing',
          subtype: 'task2',
          levelSystem: 'ielts',
          level: lvl,
          topicText: item.text,
          topicData: {
            topic_text: item.text,
            instructions: item.instructions,
            time_limit_minutes: item.time,
            word_limit: item.words,
          },
          dateGenerated: today,
          isActive: true,
        },
      });
      count++;
    }
  }

  console.log(`✅ Seed muvaffaqiyatli yakunlandi! Jami ${count} ta mavzu qo'shildi.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed xatosi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
