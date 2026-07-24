import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 IELTS & CEFR topics seeding started...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Clear existing topics to re-populate cleanly
  await prisma.dailyTopic.deleteMany({});

  // ================================================================
  // IELTS SPEAKING — Part 1 (10 topics across levels)
  // ================================================================

  const speakingPart1 = [
    {
      level: '4.0-4.5',
      text: 'Talk about your hometown. Where is it? What is it like? Do you like it there?',
      instructions: 'Answer in simple, clear sentences. Speak for 1-2 minutes about your hometown.',
      time: 2,
    },
    {
      level: '4.0-4.5',
      text: 'Tell me about your family. How many people are in your family? What do they do?',
      instructions: 'Answer basic questions about your family members. Speak for 1-2 minutes.',
      time: 2,
    },
    {
      level: '5.0-5.5',
      text: 'Describe your daily routine and free time hobbies.',
      instructions: 'Answer: What do you usually do in the morning? What hobbies do you enjoy? Do you prefer weekends at home or outdoors?',
      time: 2,
    },
    {
      level: '5.0-5.5',
      text: 'Talk about food. What kinds of food do you enjoy? Do you like cooking?',
      instructions: 'Discuss your food preferences, cooking habits, and favorite meals. Speak for 1-2 minutes.',
      time: 2,
    },
    {
      level: '6.0-6.5',
      text: 'Talk about technology and mobile phone usage in daily life.',
      instructions: 'Answer: How often do you use your smartphone? What apps do you use most? Has technology made life easier?',
      time: 2,
    },
    {
      level: '6.0-6.5',
      text: 'Discuss your reading habits. Do you prefer books or digital media?',
      instructions: 'Talk about what you read, how often, and whether you prefer physical books or digital formats.',
      time: 2,
    },
    {
      level: '7.0-7.5',
      text: 'Discuss foreign languages, communication, and international travel.',
      instructions: 'Answer: Why are you learning English? How many languages do you speak? What are the benefits of traveling internationally?',
      time: 2,
    },
    {
      level: '7.0-7.5',
      text: 'Talk about your career goals and professional ambitions.',
      instructions: 'Discuss your current job or studies, career path, and long-term professional goals.',
      time: 2,
    },
    {
      level: '8.0+',
      text: 'Talk about cultural identity, global communication, and preserving traditions.',
      instructions: 'Answer: How does global communication affect local traditions? Is preserving regional languages important? How do you stay connected with your culture?',
      time: 2,
    },
    {
      level: '8.0+',
      text: 'Discuss the concept of happiness and what it means to live a fulfilled life.',
      instructions: 'Give nuanced views on what constitutes happiness, how society defines success, and whether material wealth leads to contentment.',
      time: 2,
    },
  ];

  // ================================================================
  // IELTS SPEAKING — Part 2 (10 Cue Card topics)
  // ================================================================

  const speakingPart2 = [
    {
      level: '4.0-4.5',
      text: 'Describe a family member you admire greatly.',
      instructions: 'Cue Card: Who this person is, What they are like, What you do together, and explain why you admire them. Speak for 2-3 minutes.',
      time: 3,
    },
    {
      level: '4.0-4.5',
      text: 'Describe your favorite food or a meal you enjoy eating.',
      instructions: 'Cue Card: What the food is, Where you eat it, Who makes it or where you buy it, and explain why it is your favorite.',
      time: 3,
    },
    {
      level: '5.0-5.5',
      text: 'Describe a memorable place, park, or garden you visited recently.',
      instructions: 'Cue Card: Where it is, When you went there, What you did there, and explain why it was memorable.',
      time: 3,
    },
    {
      level: '5.0-5.5',
      text: 'Describe an interesting book or film that had an impact on you.',
      instructions: 'Cue Card: What it is about, When you read/watched it, Who recommended it, and explain how it affected your thinking.',
      time: 3,
    },
    {
      level: '6.0-6.5',
      text: 'Describe a useful skill you learned outside of school or university.',
      instructions: 'Cue Card: What the skill is, How and where you learned it, Who helped you, and explain why it is useful in your life.',
      time: 3,
    },
    {
      level: '6.0-6.5',
      text: 'Describe a time when you helped someone solve a problem.',
      instructions: 'Cue Card: Who the person was, What the problem was, How you helped, and explain how you felt about the outcome.',
      time: 3,
    },
    {
      level: '7.0-7.5',
      text: 'Describe an ambitious goal you achieved in your studies or career.',
      instructions: 'Cue Card: What the goal was, How you prepared and worked, What obstacles you faced, and how you felt when you achieved it.',
      time: 3,
    },
    {
      level: '7.0-7.5',
      text: 'Describe a challenging decision you had to make in your life.',
      instructions: 'Cue Card: What the decision was, What factors you considered, What you ultimately decided, and whether you think it was the right choice.',
      time: 3,
    },
    {
      level: '8.0+',
      text: 'Describe a complex problem or social issue you researched or attempted to address.',
      instructions: 'Cue Card: What the problem was, Why it was complex, What action or research you conducted, and what the outcome was.',
      time: 3,
    },
    {
      level: '8.0+',
      text: 'Describe an innovative idea or invention you believe will shape the future.',
      instructions: 'Cue Card: What the idea or invention is, Why you find it innovative, How it works or will work, and why you believe it will be transformative.',
      time: 3,
    },
  ];

  // ================================================================
  // IELTS SPEAKING — Part 3 (10 Discussion topics)
  // ================================================================

  const speakingPart3 = [
    {
      level: '4.0-4.5',
      text: 'Discussion: The role of parents and family in a child\'s upbringing.',
      instructions: 'Discuss: How important is family support for young children? Should parents decide their children\'s future careers?',
      time: 4,
    },
    {
      level: '4.0-4.5',
      text: 'Discussion: The importance of healthy eating habits in modern society.',
      instructions: 'Discuss: Why do people eat unhealthy food despite knowing the risks? What can governments do to encourage healthier diets?',
      time: 4,
    },
    {
      level: '5.0-5.5',
      text: 'Discussion: Public parks and green spaces in modern cities.',
      instructions: 'Discuss: Why do cities need green spaces? Do people spend enough time outdoors today? Should governments invest more in public parks?',
      time: 4,
    },
    {
      level: '5.0-5.5',
      text: 'Discussion: The rise of social media and its effect on relationships.',
      instructions: 'Discuss: Has social media made people more connected or more isolated? What are the dangers of social media for young people?',
      time: 4,
    },
    {
      level: '6.0-6.5',
      text: 'Discussion: How automation and online learning are reshaping education.',
      instructions: 'Discuss: Will online courses replace traditional universities? What practical skills cannot be taught online?',
      time: 4,
    },
    {
      level: '6.0-6.5',
      text: 'Discussion: Gender equality and women\'s roles in modern workplaces.',
      instructions: 'Discuss: Are workplaces truly equal for men and women today? What barriers do women still face in reaching senior positions?',
      time: 4,
    },
    {
      level: '7.0-7.5',
      text: 'Discussion: Environmental conservation versus economic growth priorities.',
      instructions: 'Discuss: Can developing nations achieve economic growth without damaging the environment? What international agreements are most effective?',
      time: 4,
    },
    {
      level: '7.0-7.5',
      text: 'Discussion: Immigration, multiculturalism, and national identity.',
      instructions: 'Discuss: What are the economic and social benefits of immigration? How can societies balance multiculturalism with national cohesion?',
      time: 4,
    },
    {
      level: '8.0+',
      text: 'Discussion: Artificial Intelligence ethics, governance, and the future of work.',
      instructions: 'Discuss: What ethical boundaries should be set for autonomous AI systems? How should governments address potential mass technological unemployment?',
      time: 4,
    },
    {
      level: '8.0+',
      text: 'Discussion: Post-truth society, media manipulation, and political polarization.',
      instructions: 'Discuss: How has the concept of objective truth changed in the internet era? What responsibilities do media organizations have in combating misinformation?',
      time: 4,
    },
  ];

  // ================================================================
  // IELTS WRITING — Task 1 (WITH CHART IMAGES — 10 topics)
  // ================================================================

  const writingTask1 = [
    {
      level: '4.0-4.5',
      text: 'The bar chart below shows the number of mobile phone users in five different countries in 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
      instructions: 'Describe the bar chart. Compare at least two countries. Write at least 150 words in 20 minutes.',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '4.0-4.5',
      text: 'The table below shows the percentage of students who passed their exams in four schools from 2019 to 2023. Summarise the information by selecting and reporting the main features.',
      instructions: 'Report on the data in the table. Note increases, decreases, and key comparisons. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '5.0-5.5',
      text: 'The line graph shows global carbon dioxide emissions (in billion tonnes) between 1990 and 2020. Summarise the main trends shown in the graph and compare key periods.',
      instructions: 'Describe overall trends and any notable highs, lows, or turning points in the data. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '5.0-5.5',
      text: 'The two pie charts show the proportion of household expenditure by category in 2000 and 2020. Summarise the information and make comparisons.',
      instructions: 'Compare proportions between two time periods and identify what changed most significantly. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '6.0-6.5',
      text: 'The pie charts compare household energy consumption by energy source in 2010 and 2022. Summarise the data by selecting and reporting main features, and make comparisons.',
      instructions: 'Highlight the most significant shifts between the two periods. Use appropriate data language. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '6.0-6.5',
      text: 'The bar chart and line graph show the number of international students enrolled in UK universities and the average tuition fees from 2010 to 2022.',
      instructions: 'Describe key data relationships between enrollment and fees. Use linking language and appropriate comparisons. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '7.0-7.5',
      text: 'The table below details international tourist arrivals and total expenditure across six European regions in 2021. Summarise the information and make comparisons where relevant.',
      instructions: 'Analyze the data provided. Report key figures, compare regional performance, and highlight notable disparities. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '7.0-7.5',
      text: 'The diagram shows the water cycle and the stages by which water moves through the environment. Describe the main features of the process.',
      instructions: 'Describe the cyclical process clearly using passive and active voice appropriately. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '8.0+',
      text: 'The flow chart illustrates the multi-stage industrial process of desalinating seawater to produce drinking water at scale.',
      instructions: 'Describe the complete technical process in a clear, sequential academic report using a range of passive constructions. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
    {
      level: '8.0+',
      text: 'The maps show how a coastal town in the UK changed between 1970 and 2020. Summarise the information by selecting and reporting the main features, making comparisons where relevant.',
      instructions: 'Compare development changes with precise geographical language. Organize your report logically with an overview and detailed body. Write at least 150 words.',
      image_url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&auto=format&fit=crop&q=80',
      time: 20,
      words: 150,
    },
  ];

  // ================================================================
  // IELTS WRITING — Task 2 (ESSAYS — 10 topics)
  // ================================================================

  const writingTask2 = [
    {
      level: '4.0-4.5',
      text: 'Some people think that children should spend more time playing sports outdoors rather than playing computer games indoors. Do you agree or disagree?',
      instructions: 'Write an essay giving your opinion. Include reasons and personal examples. Write at least 250 words.',
      time: 40,
      words: 250,
    },
    {
      level: '4.0-4.5',
      text: 'Many people believe that keeping pets at home is good for mental health. Do you agree or disagree? Give reasons for your answer.',
      instructions: 'Give your opinion clearly in the introduction and support it with two or three main reasons and examples. Write at least 250 words.',
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
      level: '5.0-5.5',
      text: 'Some people think that studying abroad is a great way to broaden your experience. Others believe it is better to study in your own country. Discuss both views and give your own opinion.',
      instructions: 'Present and evaluate both arguments, then clearly state your own view with supporting reasons. Write at least 250 words.',
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
      level: '6.0-6.5',
      text: 'In recent years, the number of people working from home has increased significantly. What are the advantages and disadvantages for both employees and employers?',
      instructions: 'Examine both sides of remote work: from the employee\'s perspective and the employer\'s perspective. Write at least 250 words.',
      time: 40,
      words: 250,
    },
    {
      level: '7.0-7.5',
      text: 'In many countries, urban traffic congestion has reached unprecedented levels. What are the primary causes of this issue, and what effective measures can governments take to resolve it?',
      instructions: 'Analyze main causes of severe traffic congestion and propose well-reasoned government solutions. Write at least 250 words.',
      time: 40,
      words: 250,
    },
    {
      level: '7.0-7.5',
      text: 'Some governments have proposed taxing sugary foods and drinks in order to combat rising obesity rates. To what extent is this an effective policy, and what other measures might be more successful?',
      instructions: 'Evaluate the effectiveness of a sugar tax, and propose alternative public health measures with supporting arguments. Write at least 250 words.',
      time: 40,
      words: 250,
    },
    {
      level: '8.0+',
      text: 'The rapid development of autonomous artificial intelligence systems presents profound economic opportunities alongside serious ethical risks. To what extent do the risks of AI outweigh its benefits to human society?',
      instructions: 'Construct a critical, highly structured argumentative essay analyzing economic, technological, and ethical dimensions of AI. Write at least 250 words.',
      time: 40,
      words: 250,
    },
    {
      level: '8.0+',
      text: 'Some academics argue that the rise of digital surveillance technology — from facial recognition to location tracking — represents an existential threat to individual freedoms in democratic societies. To what extent do you agree with this assessment?',
      instructions: 'Present a sophisticated, nuanced argument about digital surveillance using evidence-based reasoning and precise academic language. Write at least 250 words.',
      time: 40,
      words: 250,
    },
  ];

  // ================================================================
  // Database write — map bracket levels to individual band scores
  // ================================================================

  const allLevels = ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'];

  let count = 0;

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

  // 4. Writing Task 1 (With Chart Images)
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
