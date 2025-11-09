#!/usr/bin/env node

/**
 * Simple script to add lesson content to the database
 * Usage: node add-lesson-content.js
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const db = new Database(path.join(__dirname, 'src', 'database', 'questions.db'));

// Ensure lesson_content table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS lesson_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'paragraph',
    content_order INTEGER NOT NULL DEFAULT 1,
    title TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Clear existing content to avoid duplicates
db.exec('DELETE FROM lesson_content');

// Sample content for different lessons
const sampleLessons = {
  1: [ // Unit 1, Section A, Lesson A
    {
      content_type: 'header',
      content_order: 1,
      title: 'Unit 1, Section A: Foundations',
      content: 'This lesson covers the fundamental principles of grassroots organizing and civic engagement.'
    },
    {
      content_type: 'paragraph',
      content_order: 2,
      title: 'The Power of the Desk',
      content: `Welcome to mygrassroutes!

Just about everyone wants to get involved, because we all have something we want to change in the world we live in. Nothing and no one is perfect—that’s why we’re always working toward a brighter future.

But such a vague quest can make it difficult for the average person to participate. The sheer level of organization and bureaucracy required to run a modern society, along with the frequent influence of those behind the scenes wishing for things to remain exactly as they are to hold onto power, means it often feels impossible to make any sort of meaningful change. On top of this, deep ideological divisions in our society can make any message impossible to spread beyond your immediate base. It makes it seem impossible to start. Constant cries abound to get involved, but none of us know how to.

But no one ever created change by giving up!

While it can seem like only the massive marches we see on the news have any sort of impact, the fact is that all movements have to start somewhere. And every successful movement starts by simply changing and captivating the hearts and minds of the people around you. By building a successful grassroots movement that is sustainable enough to spiral into something massive—for example, one of the (at least!) 32 protests in the United States that has had 100,000 attendees.

In fact, sociologists have concluded that it only takes 3.5% of people protesting to incite significant change in a country’s governance. Relative to the US, that’s about 12 million people. A lot, yes—but certainly not a majority. Recently, young Gen Z protestors in Nepal managed to topple their repressive government with similar numbers—and then elected their prime minister through Discord!

And nowadays, so many of these movements start online, with changemakers like you desperate for reform, and for something new. Let’s learn about how to build a movement, and all the nuances such an effort comes with. And soon, you’ll finally be able to get involved, without being lost in the political abyss!
`
    },
    {
      content_type: 'tip',
      content_order: 3,
      title: 'Study Tip',
      content: 'Take your time with each question and think about how the concepts apply to real-world situations. Consider how you might apply these ideas in your own community.'
    }
  ],
  2: [ // Unit 1, Section A, Lesson B
    {
      content_type: 'header',
      content_order: 1,
      title: 'Unit 1, Section A: Foundations',
      content: 'This lesson explores how social change has evolved throughout history and how historical movements inform modern activism.'
    },
    {
      content_type: 'paragraph',
      content_order: 2,
      title: 'Historical Context',
      content: `Thanks for coming back!

With regards to creating change, it is always important to remember where we came from. To not forget why we wanted the things we seek, so that we do not make the same mistakes that caused the very issues we sought to change. But it is also necessary to learn from history so that we can learn from the actions and decisions of our predecessors. In this case, how change itself has been viewed throughout history!

As humanity transferred from hunter-gatherer groups to organized societies living in villages, power was held by those who controlled the food. To retain their food and therefore survive, but also to simply retain their grasp on power, they often organized repressive ways of living where any dissent was harshly punishable, and only a small inner circle had control over much of society’s needs. As society advanced, these positions changed to kings and other monarchical titles, but the concept was the same—any change was seen as dangerous, because the establishment was all that was safe. People had few, if any, rights, because any sort of human expression ran counter to the need for commoners to be simple cogs in the machine. 

However, starting around the time of the Enlightenment, people began to take control of their destiny. By the 17th and 18th century, evolution came to be seen as a means of defense against tyrants. As philosophers began to preach that people in a given society had a duty to enforce proper reform, revolution was seen as the main means of doing this by the 19th and 20th centuries. Slowly, society became less repressive, and the significantly increased rights we have in our modern world make it even easier to create change than it used to be. Rights such as freedom of speech or freedom of religion or to marry who we want or to wear what we want would have been unthinkable even a few hundred years ago—and to this day people in many countries still do not have these rights. So savor them!

It is worth noting that revolution does not always change things for the better. Many post-revolution countries get stuck in a cycle of war as the previously-united revolutionaries no longer have a reason to be. Power consumes even the most pure human. So remember where you came from so that you do not make the same mistakes.
`
    },
    {
      content_type: 'tip',
      content_order: 3,
      title: 'Learning from History',
      content: 'Pay attention to the tactics, messaging, and organizational structures used by successful historical movements. These patterns often repeat across different causes and time periods.'
    }
  ],
  3: [ // Unit 1, Section A, Lesson C
    {
      content_type: 'header',
      content_order: 1,
      title: 'Unit 1, Section A: Foundations',
      content: 'This lesson examines how social change happens in the modern digital age and the unique opportunities and challenges of contemporary activism.'
    },
    {
      content_type: 'paragraph',
      content_order: 2,
      title: 'Acted Opinion',
      content: `Back to the present!

One of the main benefits of today’s society is that a globalized world makes it even easier to create change. With our phones in our pocket and the viral nature of social media, news travels in an instant! In such a quickly-moving world, change is codified not based solely on law, but on opinion. Why? Because opinion is what people care about! It decides who gets into office, and it decides what receives the most coverage and the most support.

To be specific, acted opinion is what matters. It does not matter if everyone thinks something if they don’t care to mention or implement it—from the lowest levels of society, up to the very highest. The goal is to build something that can resonate through all of them!
`
    },
    {
      content_type: 'paragraph',
      content_order: 3,
      title: 'Modern Challenges',
      content: `Not all change has become easier to create, however. Much of bureaucracy is hindered by what is known as red tape, or the extreme number of procedural actions required to make any formal change happen. This ensures guidelines are followed properly and can protect marginalized communities—for example, red tape prevents the poorest neighborhoods from being immediately razed when a new highway is going to be built—but it also acts as another barrier any change has to get through!

In fact, much of modern democratic society is built on intended and respectful, yet admittedly often very slow, procedures. For example, just about any politician can be contacted with your thoughts, and your feedback will be read by someone in the office (and if you’re lucky the politician themselves). A handwritten letter to a local politician will have the most impact!

Also, politicians will also frequently host town halls (and very similar feedback meetings), an event where they take questions from constituents. (You can look up town halls or feedback meetings in your local area to find these; feedback meetings are about a specific topic). If attending, come with a prepared question!

And remember to strike a balance between the fires of social media and the slow burn of the democratic system!
`
    },
    {
      content_type: 'tip',
      content_order: 4,
      title: 'Balancing Online and Offline',
      content: 'Effective modern activism combines digital organizing with real-world action. Use online tools to build awareness and community, but remember that lasting change often requires face-to-face engagement.'
    }
  ],
  4: [ // Unit 1, Section A, Lesson D
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Place',
      content: `It is almost guaranteed that your specific goal already has a movement devotedly pushing it. So every aspiring changemaker must ask, should they join an existing cause or create one themselves?

For example, with regards to something like protests, it can be better to defer to an already-existing cause because the goal is simply to get as many people in one place as possible. Sites like findaprotest.info help you, well, find a protest in your area.

The fact is that joining an existing cause can help you create a bigger impact in less time because you do not have to put in the significant effort required to build a movement yourself. You will not have to deal with the inevitable opposition to your movement head on—the bigger a movement grows, the wider its reach, and the more ambitious it is, the more opposition it will face. A successful movement also requires a deep knowledge of your issue, an understanding of the status quo relative to your issue—how do people feel about it right now?—and the impact your movement might have if successful. You will not need to have a strong base around you to spread your message, and the necessary connections which can provide funding, messages, ideas, and further connections.

But if you have all these things, or are willing to get them, and you are willing to put in the time and effort to make your movement successful, then go for it. Anyone as committed as you was born to be a good leader.
`
    }
  ],
  5: [ // Unit 1, Section A, Lesson E
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `No matter what your goal is, you must be able to communicate it effectively. To be able to do that, you must understand it deeply in a few important ways:

- Understand why people connect with your core idea and why they don’t. You need to understand why they think the way they do in the first place, both on a personal level and relative to their messaging. Speaking of:
- Understand public opinion about your message. This includes media coverage, with an understanding that media bias is prevalent and takes many different forms. This includes social media, though its inflammatory rhetoric and echo chambers make it a poor tool for consistently gauging public opinion. Also, you can consult polls about your issue if they are available, though note that few pollsters strive to be unbiased (such as Pew Research Center). Most are paid for by political parties or related organizations.
- Understand how to use rhetoric to convey your message persuasively. Using the first two steps, you should strive to boil down your message into one which is concise and summarizable while also considering the way your target audience perceives the world.

Remember that you’ll never be able to convince everyone, and you should never try to, but you should always strive to be persuasive while remaining true to yourself.
`
    }
  ],
  6: [ // Unit 1, Section A, Lesson F
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `In the meantime, let’s talk about something unrelated—contacting representatives!

While representatives’ national votes tend to be beholden to the whims of their party, local representatives can often be swayed toward an issue with many, or even just a few, acts of correspondence related to one specific issue. In-person meetings have the greatest impact, but these are difficult to obtain. Handwritten letters are second in effectiveness, followed by typed letters, phone calls, and social media messages. Generic ‘form letters’ land toward the bottom, but they can be effective en masse.

The House of Representatives website contains a page dedicated to looking up your representative. For greatest effectiveness, your letter should be personalized, not from a generic template. It should also:
- Make note of the fact that you are a constituent. Writing to a representative who does not represent you will not have nearly the same impact. In written communication include your name in address. In a phone call, state where you live.
- Tell a personal story. Explain why your issue matters to you.
- Make a specific ask. Explain exactly what you want; don’t be vague.
- Be respectful. Aggressive mail will get thrown out at best.
- Be informed, factual, and honest. Do not equivocate. Strive for clear communication.
- Follow up to the person who took time to speak with you and thank them. This will likely be a staff member but the staff deserve just as much respect as the actual representative.
- Really successful correspondence can be continued over time, and build a long-term relationship!

Just about any politician can be contacted. Use this power wisely!
`
    }
  ],
  7: [ // Unit 1, Section B, Lesson A
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `When growing a movement, we want to create change that is sustainable even beyond its peak. In other words, it should retain influence even when not at peak relevance. We want the process of change to simply be seen as ordinary.

As previously stated, this requires the influence of “acted opinion”. Acted opinion is not an official term, but it represents anything which seriously moves the conversation about the subject, even on a micro level. For example, a deep, sincere debate or conversation with a family member or friend can reveal disparate thoughts and reasoning related to a specific issue, along with their current focus in the moment, which may be very different from yours. (This is also why it is important to have conversations with those who hold different opinions with you—you can’t reach the masses just by talking to those who agree.) Simply influencing the people we talk to every day can encourage them to change the people they know too. And of course, laws govern the rules of our daily lives.

Historically, as people’s rights and privileges have grown, the definition of the “center” has changed over time, generally to the left—common agreed-upon components of our life like Social Security would have been considered far too left-leaning 100 years ago. But that definition is always going to change, because humanity is not perfect. There will always be a need for change, so there will always be a need for something sustainable. That starts by having deep discussions with the people around us, if they are willing. We all need to be. But sometimes, people are firmly ingrained in their world, and there is nothing we can do.
`
    }
  ],
  8: [ // Unit 1, Section B, Lesson B
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `To be able to build a movement, we must be able to understand the mechanisms which guide acted opinion. And the most common source of acted opinion is law. 

While we often consider national laws to be the most important, and they do indeed have the most wide-reaching consequences, for many of us local and state laws are just as impactful, if not more so. For example, local laws govern the rules for our living places, our roads, our water and electricity, our waste management, and our public spaces, like parks. People can almost always view these laws publicly, and in a benefit to bureaucracy, citizens can ask requests of their county or city, such as a wish to fix a pothole in the road.

Many cities and counties will also host public meetings related to their agendas or laws. This allows them to collect public feedback—including from you. You have a voice, so speak your mind!

However, it is true that many of the laws with the biggest impact can only truly be enacted on the national level. It is also equally unfortunately true that many of these laws are only passed after a tragedy, such as bills which codify hate crimes or improve aviation safety. A movement should attempt to ensure that such a tragedy is not necessary.
`
    }
  ],
  9: [ // Unit 1, Section B, Lesson C
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `In practice, much of the acted opinion we view comes from the opinions of those in our daily lives—our family, friends, coworkers, and the bumper stickers in that truck in front of you on the highway.

One of the easiest ways to gauge public opinion is through polls. (Try to ensure your poll source is unbiased; Pew Research and Gallup are great examples.) Every poll comes with a series of numbers, but said numbers also come with a margin of error, indicating that the number could swing up to that much in either direction. Always read the title, details, and fine print on a poll so that you are fully informed. 

Because polls are designed to canvass a diverse, representative group, polls can be seen as a summary of how people feel on a given issue. However, due to limited sample size, no poll can ever be definitively accurate with regard to aggregate public opinion.

The majority of opinions shared in these polls come from family. The vast majority of our opinions are actually formed from family, and are generally unlikely to change as we grow—as humans, we are inherently stubborn. This makes it important to emphasize with someone’s upbringing, so you may strive to persuade them in a manner which resonates.

That being said, seminal events in our lives can cause an ideological shift, and certain things, such as money and the people we deeply love, are capable of changing the lives and beliefs of many. Nothing is ever truly fixed in place, and so it is our job to use tools such as polls to understand the opinion of those close to us so we may build change from the bottom up.
`
    }
  ],
  10: [ // Unit 1, Section B, Lesson D
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Republicans and Democrats aren’t the only parties in the United States!

Okay, yes, they have the most influence by far: 99% of national politicians, billions of dollars in funds, and a vise grip on the national conversation. But that doesn’t mean they’re the only option!

The largest parties after these two are the Libertarian party, which leans liberal socially but fiscal conservatively, and the Green Party, focused on sustainability, pacifism, and a hypothetical Green New Deal. Well-organized third parties can seek to win local elections, and gradually grow their base by influencing local politics and growing their movement upward. Also, when a third party does well nationally, the two major parties will incorporate elements from their party platform into theirs. (Every party has a party platform on their website detailing their beliefs, which is usually updated every four years.)

In fact, political parties often shift ideologically based on the opinions of both their members and society. The Democratic Party has slowly shifted left over the past few decades, while the Republican Party has shifted hard to the right since 2016.

Keep in mind that not every third party is available to vote for in every state. Details of ballot access can be found on the ballotpedia website.
`
    }
  ],
  11: [ // Unit 1, Section B, Lesson E
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `The driving force of politics in America is money. Money influences everything in our daily life, and this is no less true in politics. Money persuades politicians to act, and monetary deals can result in a specific politician taking office through the support of interest groups. (More on them later). It is equally true that millions to billions of dollars are thrown at political campaigns to persuade a given voter to choose a specific candidate. Money even controls the information we receive—multibillionaires are easily able to purchase or otherwise directly influence mass media or social media, after all.

Technically, it’s not supposed to be this way. Laws passed as recently as the 2000s (the Bipartisan Campaign Reform Act) were intended to limit the amount of money and airtime a politician could receive in campaigns. In practice, they could still receive virtually unlimited money if it was indirectly ‘funneled’ to them, so political parties set up Political Action Committees (PACs) to handle the donations. 

In 2010, the Supreme Court exacerbated this issue in its Citizens United v. FEC [Federal Election Committee] decision. The ruling equated corporations to people, and therefore declared that they are able to, like people, engage in unlimited political spending. This sent political spending to where it is today, and resulted in the creation of SuperPACs, the largest of which handle hundreds of millions of dollars.

Why spend so much? Well, the largest corporations have more than enough money to throw at protecting their interests. This is especially true for controversial industries such as fossil fuels or finance. However, raising money does not automatically guarantee a given candidate will win! A candidate still has to connect with voters, and if they cannot do that they are dead in the water.
`
    }
  ],  
  12: [ // Unit 1, Section B, Lesson F
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `In an era of turmoil like today, a common plea is a desire for a return to something normal. A wish to return to a time before the constant polarization and war and AI upheaval and climate disaster and so much more that plagues us today. But this isn’t the first time we’ve been in this position.

World War I was a devastating event which killed over 100,000 Americans, not to mention tens of millions elsewhere. On top of this, the nadir of race relations in America resulted in destructive and deadly race riots across the country, and paranoia around Communism resulted in many immigrants—including legal ones—often deported in what was known as the Palmer Raids. The public got the impression everything was falling apart, and craved a return to the relative normalcy which existed prior to the First World War.

Enter Warren G. Harding. Relatively unknown on the national stage previously, with other candidates offering little of value Harding made waves by promising a “return to normalcy.” To put America First, to return to family values and pulling oneself up by the bootstraps. Harding promised to fervently support businesses and once he had their support, he was easily able to win the national election. And when he did, he was very well-loved—one of the most popular presidents during his lifetime.

But it was not to last. His changes were flashy, but of little substance. He had no major policy actions during his tenure. The economy grew, but it significantly widened the wealth gap and would prove to be unsustainable years later when the Great Depression began (Harding’s successors, Calvin Coolidge and Herbert Hoover, had similar pro-business policies to him). In fact, Harding’s tenure was marred by scandal, when the government had been found leasing Navy oil reserves to private companies, known as the Teapot Dome scandal.

Change is not something that can be avoided just because of nostalgia. Society is fluid, and its needs change constantly—along with the definition of what is normal. Do not settle for what was good in the past. Strive for something even better.
`
    }
  ],
  13: [ // Unit 1, Section C, Lesson A
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Welcome to section 3—a detail of protests!

Protests are one of the most visible forms of resistance, and so their legality has been heavily questioned throughout history. Questions of what you can and can’t do abound.

Fortunately, we’re here to clarify some things! The First Amendment states that people have the right “peaceably to assemble.” The most important thing to know is that protestor rights are strongest in “traditional public forums”, and in these places it is easiest and simplest to assemble. This basically refers to anywhere which is publicly accessible and usable, such as a park, and this is why the largest and cleanest protests have been in these places. Sometimes a protest seeking to make further waves will do something like block a highway, but this is not legally advisable and many states are seeking to punish this by law. Take care of yourself.

Rules governing police are similar to those otherwise. Police can be filmed; video is legally protected though some states make it difficult to use the audio as evidence under wiretapping laws. Police are not allowed to interfere with a protest unless absolutely necessary, and if police break up a protest, they must provide proper avenues of exit.

Scenes such as flag-burning make waves among many, but such an act is perfectly legal under the First Amendment—many protest symbols are protected as “symbolic speech”, as according to the 1969 Supreme Court decision Tinker v. Des Moines. As long as the “time, place, and manner” are permissible, such actions and symbols are too!

A full protest rights explainer can be found at the ACLU website:
https://www.aclu.org/know-your-rights/protesters-rights
`
    }
  ],
  14: [ // Unit 1, Section C, Lesson B
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `It is important to know what the goals of your protests are, and then it is even more important to know how to convey them.

One of the most common means of doing this is through a protest sign—when media outlets take pictures of a given protest, the most common sources for photos are either a wide shot of the protest or a witty protest sign. And when conducting a protest, you always want to project a representative image. Other than signs, it is a good idea to create symbols which can unite your protestors under a banner—songs, flags, symbols, and slogans are all common methods to do this.

A good protest sign should be clearly visible, legible, represent your movement with words or symbols, and be concise. You want it to be something memorable, whether from being witty or resonating emotionally. Remember that protest signs are protected under the First Amendment, whether content is controversial or not. Do not be too aggressive, and do not ever advocate for violence—you do not ever want to be seen as willing to resort to it. Peaceful protests have a greater impact.

Finally, while you should have a clear goal in mind, keep in mind that change will very unlikely not happen immediately. Martin Luther King Jr. spent at least 13 years protesting, and even then only some of his goals were reached. Search for positive change, not a perfect world.
`
    }
  ],
  15: [ // Unit 1, Section C, Lesson C
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Let’s talk some more about protest rights. Let’s get some controversial topics out of the way:

- Protestors and counterprotestors have the exact same rights. After all, counterprotestors are still running a protest, it just happens to be protesting another protest.
- A protest permit cannot be denied based on the topic being controversial. Many protests require, or at least run more smoothly, if the governing body of the local area provides a permit for the gathering. First Amendment requirements dictate that a permit cannot be denied if the intent of the gathering is controversial.
- Police can only break up a gathering if there is an immediate threat to public safety. They cannot interfere because they feel like it or because they disagree with the protest. If any such action, or any other violation of your rights happens, you should write down as much information as possible, including witness info, information about the police officers such as patrol car number, photograph any injuries you might have, and file a complaint with the appropriate authorities—generally, the police, but if they are not possible, find an independent arbitrating third party in your government, or otherwise a national law firm like the ACLU.
- The First Amendment does not apply on public property. The Bill of Rights and its ten Amendments originally only applied to federal law, but were mostly extended to apply to the states, and therefore public spaces. But private property is not run by the government, and so the First Amendment does not have the same power there. This is why corporations can fire people for what they say.
`
    }
  ],
  16: [ // Unit 1, Section C, Lesson D
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `The media will always seek to project the image it wants to project when a protest is involved. When the major George Floyd/Black Lives Matter protests occurred beginning in 2020, some outlets portrayed the protestors as violent looters destroying property, while others portrayed them as peaceful protestors simply seeking to end racism. The reality was more nuanced—small instances of looting and violence did occur, but the vast majority of protests were peaceful. Still, in an ideal world, you do not want such contradictions to occur at all.

One common tactic is irreverence. This is why you often see images of people in strange costumes like those of frogs during protests—it enhances the idea that the protestors are simply ordinary peaceful people trying to draw attention to a cause. And attacking something like an innocent costumed frog wouldn’t make the attacker look good at all. You want to appear like an underdog fighting the establishment, because people love to root for an underdog.

Another idea is to create one impactful image which can be spread around. On a technical level, a well-composed image can go a long way. You want to ensure that your image is composed and well-lit, or with appropriate dramatic lighting. You can also utilize the rule of thirds, which uses horizontal and vertical lines to divide an image into nine equal parts, and states that new elements should exist at the intersection of these lines. Spread out your image contents well!

Unjust police presence in an area can increase a cause’s legitimacy by enhancing the underdog image and furthering the idea that the protestors are on the right side of history.

While in an ideal world you would have well-trained protesters who exclusively remain peaceful and leave you with a perfect image, in the real world you cannot control everything, and bad things can always happen. Be prepared to project your own image if necessary.
`
    }
  ],
  17: [ // Unit 1, Section C, Lesson E
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Large protests can result in frequent police encounters, so it is important for us to understand how to interact with the police, and one of the major laws governing such interactions is the Fourth Amendment. First, we will discuss warrants.

While private spaces generally require a warrant to be searched, this is not the same for people, and indeed, the police can perform a quick patdown of anybody if they perceive the person to be armed and dangerous, an action known as a stop-and-frisk (or, alternatively, a Terry stop). The same is similarly true for searching a car. When a police officer pulls you over, any consent to search will permit the officer to search the whole vehicle—the same goes if any contraband is in plain view. However, even if these conditions are not met, the police officer still only needs probable cause to search your car, not an entire warrant.

As a whole, a warrant requires three main things: probable cause, a neutral judge’s signature, and particularity—police cannot simply say that they are searching for something, they have to specify exactly what is being searched for, including the location. In general, any evidence illegally obtained is inadmissible in court.

Exceptions to a warrant do exist, however. Police are allowed to conduct warrantless searches in so-called “exigent” (pressing; urgent) circumstances—these include immediate threats to public safety, a fleeing suspect, or destruction of evidence. Basically, any situation where the urgency of the suspect’s actions outweighs the need to preserve the search process allows for a search based on exigent circumstances.
`
    }
  ],
  18: [ // Unit 1, Section C, Lesson F
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `With warrants addressed, it is now time to discuss the process of searches themselves—if a police officer ever searches you it is good to know the rules surrounding it.

First of all, if the police pull you aside, you should ask if you are being detained. (During a traffic stop, ask this if the officer brings you out of your car). It is absolutely legal to film an officer’s search as long as the camera does not interfere with the search, so consider putting a camera in your car in case you need evidence of wrongdoing. At a protest, this can be useful if you see someone being searched by the police. Always treat officers with respect and never make any sudden moves. And remember that the absolute worst thing you can do is try to run away from the police.

Note that a search warrant is hyperspecific. Evidence obtained in a search (without exigent circumstances) requires a warrant, and you cannot simply take evidence from a different room. For example, if the basement is specified as the warrant’s search location, officers cannot use any evidence found in the upstairs bedroom.

Keep in mind that consent given under threat is illegal. Officers cannot coerce you to conduct a search. Never let them bully you into giving up your rights.

When it comes to phone data, the government can search your phone to “the extent reasonably practical” based on 2015’s USA Freedom Act. This wording is very vague, but in general, and even outside of this wording, don’t ever do anything rash. You always strive to create change, but you never want to become a criminal.
`
    }
  ],
  19: [ // Unit 1, Section D, Lesson A
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `An interest is simply a topic for which a given group wants to influence policy. There you go. Lesson over!

In all honesty, it isn’t quite that simple. Every change-seeking group reaches a point where quick, fiery decisions based on emotion or the heat of the moment are no longer enough to constitute proper leadership. So they organize under a structured, bureaucratic, money-loving banner: interest groups! Interest groups exist at all levels of government, though of course the largest operate on a national or even a global basis. Politics and interests are inseparable.

Interest groups operate by lobbying, or attempting to directly influence public officials. This can include purer methods such as constituent polling and statistical analysis, but it can also include more underhanded methods such as direct donations and gifts, or even recruiting candidates for public office. Whatever gets the job done. 

In reality, most interest groups are formed for promotional purposes—to spread their wants and opinions to the common man—and only enter politics when absolutely necessary. Still, this is where they have the greatest impact. Still, despite the shady appearance, interest groups achieve great power by aggregating the needs, wants, and power of many individuals sharing a common cause. It’s still changemaking, just not as flashy as many people would like it to be.
`
    }
  ],
  20: [ // Unit 1, Section D, Lesson B
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `‘Interest group’ is only a catchall term, and there are in fact many different types of interest groups out there. One of the most notable is unions, worker groups which fight for workers’ rights. Advances such as the minimum wage, the 40-hour workweek, and improved working conditions can be credited to them. They also fight for worker quality of life and relevancy. On a less specific level, professional groups regulate the interests and codes of a certain profession, especially highly specific ones or ones tied heavily to a specific area. (Major interest groups in an area of interest in a specific country are referred to as peak associations).

Cause groups represent a noneconomic cause which is important to a society. Note that these represent specific groups which do not apply generally to everyone in society, like disability/veterans’ rights, or churches. By contrast, public interest groups relate to general public concern. This can include human rights groups like Amnesty International, environmental protection groups like Greenpeace or the World Wildlife Fund, or consumer rights groups like the Consumer Federation of America.

Knowing about different types of interest groups can help you determine if you’d like to get involved in any type of them!
`
    }
  ],
  21: [ // Unit 1, Section D, Lesson C
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Every interest group wants you to join them—to promote their message, but also to get your money! 

There are nuances to both of the above things, though. Interest groups generally charge a membership fee to join, but ones which care about the money less may have an option to waive the fee. In general, once you join an interest group, they can send you as many messages as they want without restriction (they promote themselves even more), so be careful. (It is sometimes even possible to receive messages from interest groups when not a member, such as during election season).

It should be noted that there are also often outright benefits to joining interest groups. Joining the AAA (American Automobile Association) has very useful benefits to any car owner, such as hotel discounts and a towing service. 

In the end, though, the biggest reason interest groups exist is to aggregate the power of the individual. In today’s world, however, increased globalization has made it easier to support causes no matter where you stand. Think carefully about whether an interest group is worth it for you, and research any benefits joining one may offer you.
`
    }
  ],
  22: [ // Unit 1, Section D, Lesson D
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Even the most money-driven interest groups know the value of a grassroots movement, and they therefore often seek to create one themselves. There are a few ways they try to do this. The first and simplest is by simply trying to get you involved in their work; that’s what all the messaging mentioned in the previous lesson is for.

Otherwise, interest groups will seek to manifest grassroots activity among their local members. They may create local chapters in a city or county and encourage members in that area to meet. They may create chapters on colleges or high schools and thereby bring like-minded students together. Both of these help interest groups mount campaigns at all levels, and help you meet people who may share your same cause. Interest groups will always strive to explain how you can get involved in their actions, so take action if you are interested yourself.
`
    }
  ],
  23: [ // Unit 1, Section D, Lesson E
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `The main benefit and downside of an interest group is the money.

Having so much money inevitably gives a strong interest group lots of power. The largest interest groups have millions of members, and the money from these millions inevitably goes into building connections with prominent politicians. This is good for representing the people’s interests, but bad for the corruptability of the average politician. 

One definite benefit of the interest group is that it enables interest groups to spread information more easily. Newsletters (most common) and other correspondence allow group members to be well-informed.

Many interest groups also come with a definitive political leaning. For example, the National Rifle Association tends to donate significantly more often to Republican politicians, as Republican politicians generally care more about gun rights. Meanwhile, union members tend to lean more Democratic.

While not a definitive downside of all interest groups, many tend to be more interested in your money rather than your membership. However, to really achieve its goals, an interest group should care about the people supporting it. The best way to do that is to create a way for all members to participate, not just the higher-ups.
`
    }
  ],
  24: [ // Unit 1, Section D, Lesson F
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Money is never the only thing that matters!

There are three other key factors an organization must consider:
- Is there a need for what the group is doing? If nobody cares about what the group is pushing, or if the group otherwise fails to be persuasive, then the group will fail to attain any political leverage.
- Does the interest group have proper connections in the government? Even if it doesn’t, does the group have the people necessary to create and maintain these connections? Money does not build rapport by itself.
- How strong is the opposition to the group? Who is fighting against it? Does anyone not want it to succeed?

If the interest group can successfully consider all of these factors, it will attain incredible power.

Other special cases can relate to the locality of the district. For example, if an interest group has direct ties to a large corporation in a politician’s constituency, the group will inevitably find it easier to make connections with said politician.

The connection between interest groups and the main politicians it seeks to influence are summed up in what is known as the iron triangle: interest groups, regulatory agencies, and congressional committees, which is said to keep the bureaucracy running. Why do interest groups care about regulatory agencies? Well, less restrictive regulations make it easier for the corporations supporting interest groups to make greater profits. And the connection to congressional committees is natural—committees have the earliest and most direct path to bringing a law bill under consideration. The goal is for interest groups to increase their relevancy and get as close to government as possible.
`
    }
  ],
  25: [ // Unit 1, Section E, Lesson A
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `A boycott is not something anyone should just start on a whim.

Every successful boycott requires organization, even if group leaders may not immediately be obvious, such as in boycotts organized on social media. But simply saying ‘boycott this company!’ and then doing it will not create something sustainable.

First of all, every boycott should be united under a name—a catchy name that should convey who is being boycotted. Then a boycott needs some organization. After a target is established and a set of boycotters—who might have a reason to boycott this company?—have been established, the boycotters should establish clear leadership, because someone needs to run the show and mobilize the boycotter group. There should be a clear method of communicating with the group, such as through a unique social media account. Then they should come up with a demand. What do you want out of the company for the boycott to end?

Boycotts can be frequent in today’s world; research has shown a clear political divide in the brands customers purchase from, and the things that said companies can endorse therefore can make them a frequent target of said boycotts. But political fervor is not sustainable. People easily forget about minor things that anger them. A successful boycott requires firmer ground to stand on.

This has been shown throughout history, too—for example, when the Rosa Parks-led Montgomery Bus Boycott helped further the Civil Rights Movement by boycotting segregated buses until they were forced to end the practice. In this way, boycotts can be used to fight against tyrannical government!

Keep in mind that boycotts are not even limited to individuals. Corporations and even countries can participate in boycotts, too. It’s all just a matter of really supporting what you believe in!
`
    }
  ],
  26: [ // Unit 1, Section E, Lesson B
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Spending boycotts are the most common type of boycott because the perception is that corporations are most affected by making less money—and this often turns out to be true!

There are many reasons to boycott a company, but the most common reasons include funding wars (or other disliked countries; this happened in 2024 with Sabra hummus and Unilever) or environmental abuse during the making of corporate products. Companies have been boycotted for other reasons, too; Twitter was boycotted when Elon Musk took over due to his harsh advertiser policies and apparent allowance of hate speech. When successful, boycotts such as these (and, indeed, the ones for Sabra and Twitter achieved some success) can result in significant changes in corporate policy.

There are, however, two major caveats with regards to boycotts. The first is that many people will consider the prospect of undertaking a boycott too much of an individual sacrifice to make the boycott worth it. After all, if you’re actively buying from a brand enough for the boycott to be worth it, you tend to like what it is offering. There must be enough of an active moral persuasion for the spender to stop buying from that brand.

The second major issue is the fact that individuals with the most power are the least likely to participate in a boycott. After all, corporate interests protect corporate interests—if anything they are more likely to encourage more buying. This is, naturally, especially true with the people running the actual corporation being boycotted. This is why creating an organized, grassroots boycott is so important—you need power to counteract power.

It is worth noting that even countries can engage in spending boycotts by not trading with another country at all, known as an embargo. Protest is powerful, even at the very highest levels.
`
    }
  ],
  27: [ // Unit 1, Section E, Lesson C
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `We all think of a boycott as not purchasing something, but this is not always the case. For example, one of the most common forms of boycotts during the Civil Rights Movement was the sit-in, where a devoted group quite literally sat in an establishment which promoted segregation for hours or even days at a time, protesting these racist policies. The most striking images from the boycotts came from the totally peaceful image of the boycotters simply sitting at a counter. It’s always good to be more peaceful than people expect.

In general, some boycotts seek not to avoid so much as overwhelm. For example, a recent tactic is to flood call centers and detail being against a specific policy until the center is completely flooded. Such a total loss of capabilities directly signals intense opposition to the offending policies.

When running such a boycott, it is even more important to educate boycotters. They must know exactly how, where, and why to participate, and what they do when they get there. A unified stream of protest is the best way to make a point.

That being said, boycotts against more powerful corporations or ones more ready to resist may take years. This is why organization is important. It is good to be ready for the long run.
`
    }
  ],
  28: [ // Unit 1, Section E, Lesson D
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `A boycott’s success should be measurable. For example, cancellations of Disney+ doubled after the recent boycott of the streaming service, which occurred due to Jimmy Kimmel being taken off the air. That is a clear, measurable impact that the boycott had.

In general, the largest boycotts are against public companies, (since they’re the largest ones), which make their earnings public, therefore making it relatively easy to track financial impact. For example, the infamous Bud Light boycott in 2023 resulted in a decline of somewhere between 26-28% of sales. Bud Light is still feeling the impact of the boycott today, having lost its status as the top selling beer in America. With an impact like that, finances are naturally the most common metric people use.

Many strong boycotts may still not make a noticeable impact, however. Boycotts tend to encounter opposition when people “boycott the boycott” in what is sometimes called a buycott. People are encouraged to buy from the boycotted company in an attempt to offset the boycott. If done properly, the boycott will have little impact. It is easier to make an impact by buying something than not buying it, because there are greater benefits from one person’s revenue compared to the impact of one person’s loss—that loss is not guaranteed to go to a relevant competitor.

A successful boycott will generally last somewhere around a few weeks; the time could be significantly longer or shorter but a few weeks is around the time it takes for a company to notice the corresponding financial impact. To hang on to a boycott for that long, boycotters should be keenly aware of who they are, what they value, and why they started the boycott in the first place.
`
    }
  ],
  29: [ // Unit 1, Section E, Lesson E
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `A boycott should have an end goal.

In general, people like to have something definitive to work toward, and they like to see their progress as it is happening. This gives people the (hopefully rightful) impression that their actions have purpose. Provide frequent updates to boycotters about new members joining the movement, impact seen on the micro and macro level, and any possible alternatives that consumers may choose instead. Give people something to rally around.

This effect of having something to rally around actually explains many of the boycotts from recent years. A heated political climate frequently results in temporary boycotts to companies based on a minor political grievance, especially for more publicly visible products or companies which can become targets on social media. But such boycotts are not sustainable because such political anger is based on a whim, flaring up and disappearing quickly. Even then, with boycotts requiring a definitive goal, the impact of a boycott is generally not a very long and sustained one. Big brands will survive with or without you, and any boycott will have to overcome the power of brand loyalty. That is why having a goal to stand on is so important.
`
    }
  ],
  30: [ // Unit 1, Section E, Lesson F
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Boycotts are built off of hate.

Any super successful boycott runs off of showing harm, whether harm from funding war, or harm from some perceived moral slight. There is hatred of the company’s activity, hatred of the company, and perceived hatred in how the company conducts itself.

Hate, however, can blind us, and make us lose our sense of unity, organization, and drive. Use hate as motivation to start your boycott if you want, but do not let it be your driver in life—you will be blind to what brought you to this point. A good boycott will spread by being organized, having a sustainable cause, and by providing definitive actions for boycotters. Provide actions for boycotters to take, such as telling their friends or providing a clear substitute to purchase instead of the boycotted item. But remember where you came from, so that your movement remains sustainable.
`
    }
  ],
  31: [ // Unit 1, Section F, Lesson A
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Petitions are incredibly important as an American because they allow us to exercise two of our most fundamental rights—complaining, and organizing.

On a personal level, petitions allow us to complain about the government and how it is operating, something which is illegal in many countries. We may also ask for favors, such as a request to the local county to fix a road. The First Amendment covers many general means of doing this, such as filing legitimate lawsuits, contacting representatives, and lobbying. People are encouraged to comment on how the government is doing, and use petitions and the law to resolve legitimate grievances.

Some petitions also allow us to organize, such as for collecting signatures. The purpose of this is that it allows us to send written petitions to local, state, or national governments to advocate for change. The government, however, is not obligated to respond to petitions, no matter how many signatures they receive, Prominent petitions, however, may attain the benefit of widespread media coverage, so attention is drawn to the issue either way.

It is also possible to sign petitions online. The most popular website for this is change.org but other prominent websites include openpetition.org and ipetitions.com. They can still hold an impact, but a lesser one since signatures do not need to be verified.
`
    }
  ],
  32: [ // Unit 1, Section F, Lesson B
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Petitions are meant to be current; they last for a short period of time and signatures must be gathered quickly, too.

In whatever case, petitions with traditional written signatures are usually designed to get either a ballot measure or candidate on the ballot, which voters will eventually vote for or against. A ballot measure should not be confused with a referendum, which is proposed by the state legislature. There are two main types of referendums:
- An advisory referendum is issued by a state legislature to gauge public opinion on an issue, but the result is not binding whatsoever.
- A voluntary referendum allows voters to decide whether a law should be enacted or not.

A third type exists called a popular referendum; this exists in 23 out of the 50 states. It allows voters to vote on an already-passed law that they disagree with. However, it requires collecting signatures just like with a normal ballot.

By contrast to all of these, a ballot measure is a from-scratch grassroots initiative to get a question on the ballot which can become law. That being said, there are still issues. To get a question on the ballot, organizers must collect a certain number of signatures from registered voters. But the timeframe to do this is limited—months to a year, depending on the state. Organizers must organize and mobilize adequately.
`
    }
  ],
  33: [ // Unit 1, Section F, Lesson C
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `While having the required number of signatures gets you on the ballot, generally speaking, having between 100-110% of the required signatures requires every signature to be verified (though this varies somewhat by state). All these signatures must be physical—no digital allowed.

At the same time, you want to be sure your ballot measure can succeed. If the measure fails, that’s it, you’re done—if you want to run it again, you’ll have to start all over again with your signature collection!

There is also the small matter that many states do not even allow ballot initiatives. A full list is available here:
https://ballotpedia.org/Ballot_initiative
In such states, citizens are encouraged to write to and place increased pressure on the state legislature, since it is where all laws must go through.

Not all ballot referendums are created equal. The most common is an Amendment referendum, which amends a state’s constitution. State constitutions are much longer and more detailed than the national one, so they tend to be amended more frequently.

Other states have statute referendums, which affect state law (statute is another word for law). Amendments can be preferable, however, as a constitutional amendment is harder to change or overturn than a law.

The third and final type is a veto referendum, which asks voters whether to uphold or reverse a law which has already been enacted, but these types of referendums are rarer.

A full state-by-state map is available in the Ballotpedia link above.
`
    }
  ],
  34: [ // Unit 1, Section F, Lesson D
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `As states vary in their ballot initiative types, they vary in their ballot initiative requirements.

Many states require signatures from a percentage of the population. Many will tie this to a set number based on the number of registered voters over the past election cycle. The same is true in terms of running for office.

A full list of candidate signature requirements by state can be found at https://www.ncsl.org/elections-and-campaigns/petition-requirements-to-run-for-the-state-legislature .

Note that when trying to get a candidate on the ballot for a certain political party, some states will dictate that the signer must be registered for that party. Also, some states, such as Alaska, will not even require any signatures at all.

Aside from signatures, organizers of a ballot initiative must also submit the content of their initiative to the state for approval. The ballot must include a question title, a header (which essentially acts as a small description of the ballot measure), and a full description—generally a paragraph or two explaining what voters are voting on. If you want full transparency, make your wording clear, though clear wording on a ballot is not always guaranteed otherwise—research what’s up for voting first. Also, only one major issue can be voted on at a time—you can’t collect signatures to legalize marijuana and also increase funding for public housing.

A full list of signature requirements by state for ballot measures can be found at
https://ballotpedia.org/Signature_requirements_for_ballot_measures.
`
    }
  ],
  35: [ // Unit 1, Section F, Lesson E
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `An online petition’s power is not found in direct legal results, but in indirect coercive power.

There are many major online petition websites, such as change.org and openpetitions.org. They are all very similar, though—petitions are created, the best with a clear goal in mind, and then people provide their name and address in the form of signatures. They are also encouraged to spread the word and donate money to the cause (usually just to boost the donation to the front page). There are downsides, however. Signatures can be faked easily by putting a fake name or address, meaning that petitions on these websites have no legal effect. These websites have no government ties, anyway. Their real benefit comes in showing how strong a movement is, and encouraging people to join a movement by making them feel like they’re part of something big.

There are also other places to sign petitions. Interest groups such as Amnesty International, a human rights organization, will often collect petitions to raise awareness of their goals and policies. Some foreign governments even run their own petition services—in the United Kingdom, official petitions which reach more than a million signatures are required to be addressed in Parliament. 
`
    }
  ],
  36: [ // Unit 1, Section F, Lesson F
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `The process of filing a ballot application is relatively simple. You generally have to send your ballot (with header and question) to the secretary of state, then collect signatures before the deadline. A full guide can be found here.
https://letthevotersdecide.com/how-to-get-an-issue-on-the-ballot/

You then have to circulate your petition, collecting signatures and eventually getting all of them verified—though some states waive this requirement if you have 100% of the required amount. Be careful about collecting fake signatures—the punishment for one fake signature is often very harsh. In California, one fake signature removes 1700 valid ones from the final count. 

In either case, each state has its own guidelines; you can use Ballotpedia to find them. Check carefully, though—for example, in Arizona, every signature collector and campaigner must be registered with the election office, and failing to meet this requirement will immediately fail your ballot attempt.

With such stringent laws, it is extremely important to build a sense of community. If you want to get an initiative on the ballot, assemble a trusted group around you and seek to connect with the locals in your area about the issues that matter to you. Visit colleges or other public gathering places (where soliciting is allowed!) and let the word of your movement spread over time. But do not try to rush things—that will only hurt you.
`
    }
  ],
  37: [ // Unit 1, Section G, Lesson A
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `A name unites people.

People long to be part of something. That’s part of why religion is so popular—it gives people a movement and a purpose. And few things can capture that better than a name.

Whether it be Black Lives Matter, #MeToo or Make America Great Again, a good name carries a sense of unity among all of its participants. And that unity is key to building a movement that can last.

Hashtagged movement names have been frequent in recent years due to the prevalence of social media, but the most important thing is to build a brand, as one does when creating any powerful movement. You want to have something that’s easily recognizable and identifiable. An organically built movement might not even have a name at first because it simply involves a few close friends working together—and that’s okay. You want to strike a balance between building your movement and building its brand. Doing both can help your movement gain prominence on the national stage.
`
    }
  ],
  38: [ // Unit 1, Section G, Lesson B
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `The simple reality is that if you aspire to build a movement you will face direct competition.

If you are taking advantage of a seminal event, many others will too. If you are simply trying to push your goals forward, it is almost certain that many others are already trying to do the same. Your goals are almost always someone else’s goals. This means you will be jostling with competing organizations for prominence.

In a direct sense, there is nothing you can do about this. Infighting with the competing groups will only hurt your shared movement in the long run. Instead, you want to aspire to fill the gaps that the other, current organizations do not have, and ensure that everyone who gets involved knows exactly where they stand.

The first step to building a movement is to find a small group of connected connectors. In other words, tap into the core group of people who are most closely connected to what you want to accomplish. Create a network of these individuals, and ensure that they are connected with each other. Then craft a definitive guide of what will happen once people (the connected connectors) join your movement. You want this small group to catalyze something bigger, and rope in people who are progressively less and less related until you’ve built something big. And you always, always want to keep people engaged, so your movement will continue to spread and grow.

There is no need for competition if you build a movement organically like this.
`
    }
  ],
  39: [ // Unit 1, Section G, Lesson C
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `Do not waver in your message.

The thing that appeals to people the most is not knowledge or power or wealth or even safety. It is stability. That reaches everyone. And you can create stability by crafting a consistent message that people can always turn to.

As society has evolved, power has gone from something that was inherited or fought for to something that is more spread out and channeled. Not necessarily hard power, such as for law and wealth, but soft power—to influence people’s minds.

Nevertheless, do not fall under the impression that knowledge or power or wealth is useless. Knowledge and experience are extremely important because they run the “backend” of the movement; how to run the books and decisions of it, instead of the people's side. Even still, knowledge can be distilled into a good summary that everyone can connect with. It is always good to have a deep knowledge of a subject so you can understand it on every level.

You should also consider who you are appealing to in your messaging. For example, minorities are often more willing to join a given movement because they generally face harder times in society. Your movement does not only have to produce content or messaging directly related to the movement, either. Consider posting something funny or relatable that may resonate with your target audience. This can act as a hook to pull them to your wider page.
`
    }
  ],
  40: [ // Unit 1, Section G, Lesson D
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `You are probably in an echo chamber.

It happens to all of us. As humans, we like to only hear the perspectives of those we agree with. We like for our beliefs to be affirmed.

But that means many of us are in for a shock when we start a movement and see just how harshly it is being discussed on other sides of the aisle.

The political compass is not a perfect or all-encompassing method of quantifying political beliefs whatsoever, but it does make for a good summary: four squares, with left and right-leaning beliefs on the x-axis, and libertarian and authoritarian beliefs on the y-axis. The farther away people lie from your movement’s goals on the compass, the stronger the invective they will hurl against you. You have to be prepared to deal with this, and decide who exactly you want to appeal to.

It is a common trap to believe you should be as neutral as possible to attract everyone. While a few things are agreed upon by just about everyone (everyone wants a good economy and less violence!) trying to appeal to everyone appeals to no one. You lose sight of what makes your movement special, and becomes seen as spineless. You can try to distance yourself from the movement if you are its leader, but you also do not want to seem like a useless figurehead. Strike a balance between appealing to and growing your base and wandering the political wilderness.

An equally common trap is to advocate for violence. But violence does not attract anyone but the most devoted. Peaceful protests are twice as likely to succeed because they bring people together. And isn’t that what a good movement should do?
`
    }
  ],
  41: [ // Unit 1, Section G, Lesson E
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `People do not just want progression. Think of it like a good game—they want it to scale, and feel as if they’re doing more. Allow for an ease of progression, then gradually scale it up over time.

This whole idea is actually quantified in what is known as the “participation scale.” At the lowest end is simply complying with movement activities, and then other basic activities like consuming information or sharing it. (Guilty as charged.)

Your goal is to build people who can be changemakers like you. Find people who can go from just sharing your movement to shaping it, and shaping the world around you. Become influencers. 

The full participation scale can be found at
https://ideas.ted.com/how-to-build-a-successful-movement-in-4-steps/.
`
    }
  ],
  42: [ // Unit 1, Section G, Lesson F
    {
      content_type: 'paragraph',
      content_order: 1,
      title: 'Placeholder',
      content: `You can and should fight it as necessary, but one day, your movement will become irrelevant.

Maybe your base falls apart. Maybe you run out of necessary funding. Or maybe you were lucky, and you did everything you wanted to do and rode off into the sunset.

But things happen. Maybe backlash will hit you—maybe you grew so well that you’ll have counter-movements targeting your own. Maybe they’ll try to discredit you, or run misinformation and disinformation campaigns against you. All are possible. That’s why projecting your image and brand is so important.

Maybe your fringe idea became mainstream. Maybe your movement grew to the point where it had no choice but to do what all too-large movements do and become more centrist. Swinging too hard on one side of the aisle only lasts for so long in this charged political climate. Maybe you couldn’t keep it up, and were forced to try to appeal to many.

Maybe your movement wasn’t strong enough to remain independent. Maybe your original grassroots leaders were replaced and the movement was never the same. Maybe your movement was bought out, reduced to nothing but a marketing scheme for a big company. Or maybe your movement wasn’t good enough to beat a bigger one, and it was absorbed, or co-opted, into theirs.

Or maybe your energy just ran out. Society’s interests wax and wane all the time, and high-energy movements are inevitably vulnerable to a period of contraction. It’s possible that you just couldn’t retain relevance in that time, no matter how hard you tried. And soon, your own time was up.

But if you build something so strong that it can survive all of that, you can achieve the ultimate paradise. 

Your movement will eventually fall inactive anyway.

But you will have created change so strong that your movement’s work will remain ingrained in the fabric of society forever.

Your movement will forever be sustainable.
`
    }
  ],
};

// Function to add lesson content
function addLessonContent(lessonId, contentItems) {
  const insertStmt = db.prepare(`
    INSERT INTO lesson_content (lesson_id, content_type, content_order, title, content)
    VALUES (?, ?, ?, ?, ?)
  `);

  contentItems.forEach(item => {
    insertStmt.run(lessonId, item.content_type, item.content_order, item.title, item.content);
  });

  console.log(`Added ${contentItems.length} content items for lesson ${lessonId}`);
}

// Add sample content for each lesson
Object.entries(sampleLessons).forEach(([lessonId, content]) => {
  addLessonContent(parseInt(lessonId), content);
});

console.log('Lesson content added successfully!');
console.log('You can now view the content by clicking the "Read" button in any lesson.');

db.close();
