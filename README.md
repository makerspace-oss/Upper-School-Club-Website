School Clubs Website Development\
First Semester Process Documentation

BEFORE READING ANYTHING BELOW, READ THE `START_HERE` DOCUMENT IN THE DIRECTORY ABOVE. 

Executive Summary

This document outlines the comprehensive process for developing a school clubs website during the first semester. The project aims to create a centralized digital platform where students can discover clubs, learn about their activities and achievements, and make informed decisions about club participation. This initiative addresses the limitations of traditional club fairs by providing year-round access to club information.

1. Project Overview
1.1 Project Goals

*	Create a centralized platform for all school club information
*	Improve club visibility and accessibility for students
*	Showcase club achievements and activities
*	Support new students, new clubs, and those who miss club fairs
*	Provide year-round access to club information

1.2 Key Features Under Consideration
*	Comprehensive club directory with detailed profiles
*	Activity calendars and event listings
*	Achievement showcases (Science Olympiad, DECA, Debate competitions, etc.)
*	Search and filter capabilities
*	Integration options with existing school website

1.3 Core Technical Architecture\
The platform’s architecture centers on two critical technical components that enable efficient content management and dynamic user interaction.

1.3.1 Google Sheets Integration\
A crucial element of this project is establishing a direct connection between the website platform and a Google Sheets document. This integration serves as the content management backbone of the system, enabling:
*	Centralized Data Management: All club information (descriptions, proctors, meeting days, tags, etc.) stored in a single, organized spreadsheet
*	Easy Updates: Club leaders and administrators can update information through familiar spreadsheet interface without technical knowledge
*	Real-Time Synchronization: Changes made in the Google Sheet automatically reflect on the website without manual intervention
*	Version Control: Google Sheets built-in version history provides audit trail of all changes
*	Collaborative Editing: Multiple administrators can work simultaneously with proper permissions
*	Data Portability: Information remains accessible and exportable even if the website platform changes
Technical Implementation Considerations:
*	Google Sheets API integration for programmatic data access
*	Structured data format with defined columns for each club attribute
*	Caching strategy to balance real-time updates with website performance
*	Authentication and permission management for sheet access
*	Error handling for API rate limits and connectivity issues

1.3.2 Dynamic Club Page Interface\
The platform features a sophisticated dynamic interface that provides an intuitive browsing experience through expandable club cards. This interface design is essential to the user experience and includes:\
Initial View (Collapsed State):
*	Club Icon: Visual identifier/logo for quick recognition
*	Club Title: Official name prominently displayed
*	Club Tags: Categorization labels (e.g., “STEM,” “Arts,” “Service,” “Competitive”) for quick filtering and identification
Expanded View (When User Clicks/Taps):
When a user interacts with a club card, it dynamically expands to reveal comprehensive information:
*	Club Description: Detailed overview of the club’s purpose, activities, and mission
*	Club Proctors: Leadership information including student leaders and faculty advisors with contact details
*	Club Tags: Full tag list remains visible for context
*	Club Meet Days: Schedule information showing when and where the club meets (day, time, location)
User Experience Benefits:
*	Efficient Browsing: Users can quickly scan multiple clubs without loading separate pages
*	Progressive Disclosure: Information is revealed incrementally, preventing overwhelming interfaces
*	Mobile-Friendly: Expandable cards work seamlessly on touch devices
*	Contextual Navigation: Users maintain their position on the page rather than navigating back and forth
*	Visual Consistency: Uniform card layout creates a cohesive, professional appearance
Technical Implementation Considerations:
*	JavaScript framework for smooth expand/collapse animations
*	Responsive CSS grid or flexbox layout for card arrangement
*	Lazy loading for club icons and images to optimize performance
*	Dynamic content population from Google Sheets data
*	Accessibility features including keyboard navigation and screen reader support
*	URL parameter support for direct linking to expanded clubs

1.4 Implementation Options
*	Option A: Standalone dedicated website
*	Option B: Integration with existing public school website

3. Phase 1: Research and Planning\
2.1 Stakeholder Identification\
The first critical step is identifying all stakeholders who will be affected by or contribute to the project. Understanding their interests and concerns ensures the platform meets actual needs.

- Stakeholder Group
- Interest Level
- Primary Concerns
- Engagement Strategy
- Students
- High
- Ease of use, accurate information, mobile accessibility
- Surveys, focus groups, usability testing
- Club Leaders
- High
- Easy content updates, recruitment support, achievement visibility
- Individual interviews, feature workshops
- Faculty Advisors
- Medium-High
- Time commitment, content moderation, administrative oversight
- Email surveys, advisory committee
- School Administration
- Medium
- Policy compliance, budget, brand consistency, security
- Formal presentations, approval meetings
- IT Department
- Medium
- Technical compatibility, maintenance, security standards
- Technical consultations, system requirements review
- Parents
- Low-Medium
- Student safety, appropriate content, accessibility
- Parent newsletter announcements, optional feedback

 
2.2 Interview Planning and Execution
Conducting structured interviews with stakeholders is essential for gathering requirements and identifying potential challenges. The following approach ensures comprehensive feedback collection.
2.2.1 Interview Preparation
*	Develop standardized interview questions for each stakeholder group
*	Schedule 15-30 minute sessions with representative stakeholders
*	Prepare project overview materials for context
*	Create documentation template for recording responses
2.2.2 Key Interview Questions
Opening Context:
*	"I am considering creating a website for our school clubs. This idea is still in its infancy and nothing is truly established yet. Everything is open to change. If there is a possible problem you see or if you do not agree with this idea in any way, that is perfectly fine and can be helpful. Please respond honestly."
Core Questions:
1.	Is this something you would find useful or be interested in?
○  	If yes: What features would be most valuable to you?
○  	If yes: What hesitations or concerns do you have?
○  	If no: What are your primary objections?
2.	Have you seen anything similar to this at other schools or organizations?
○  	If yes: What worked well?
○  	If yes: What worked poorly?
○  	If yes: What lessons could we apply?
3.	Should this be a standalone website or integrated into the existing school website?
○  	What factors influenced your preference?
4.	What content would you want to see for each club?
○  	Activities and meeting schedules
○  	Achievements and competition results
○  	Contact information
○  	Other suggestions
5.	How would you envision using this platform?
○  	Frequency of use, specific scenarios
6.	What concerns do you have about implementation, maintenance, or usage?
2.2.3 Interview Documentation
*	Record all responses in a standardized format
*	Categorize feedback by theme (features, concerns, technical requirements)
*	Identify patterns and recurring suggestions across stakeholder groups
*	Note any conflicting requirements for later resolution
3. Phase 2: Requirements Analysis
3.1 Synthesizing Feedback
After completing stakeholder interviews, analyze the collected data to identify clear requirements and priorities.
*	Create a consolidated requirements document listing all suggested features
*	Categorize requirements by stakeholder group and priority level
*	Identify must-have features versus nice-to-have enhancements
*	Document any technical constraints or limitations identified
3.2 Competitive Analysis
Research existing club websites at other schools and similar organizations to understand best practices and common pitfalls.
*	Identify 5-10 comparable school club platforms
*	Evaluate their features, usability, and content organization
*	Document strengths and weaknesses of each platform
*	Extract design patterns and functionality ideas applicable to your project
3.3 Technical Feasibility Assessment
Evaluate technical options for implementation, considering school infrastructure, budget, and maintenance capabilities.
*	Consult with IT department about integration possibilities
*	Review existing school website platform and capabilities
*	Research content management systems suitable for club directories
*	Assess hosting options and associated costs
*	Determine authentication and security requirements
4. Phase 3: Design and Planning
4.1 Information Architecture
Develop the site structure and navigation flow based on stakeholder needs and best practices.
*	Create a site map showing all pages and their hierarchy
*	Define content categories and taxonomy for club classification
*	Design search and filter functionality specifications
*	Plan user pathways for different stakeholder groups
4.2 Content Strategy
Determine what information will be collected for each club and how it will be maintained.
Core Club Profile Elements:
*	Club name, description, and mission statement
*	Meeting schedule (day, time, location)
*	Leadership team and faculty advisor contact information
*	Membership requirements and application process
*	Recent activities and upcoming events
*	Achievements and competition results
*	Photos and media gallery
Content Management Workflow:
*	Define who can create and edit club content (club leaders, advisors, administrators)
*	Configure Google Sheets structure with clearly defined columns for each data field (see Google Sheets Structure below)
*	Establish approval process for new clubs or major changes
*	Create content guidelines and quality standards
*	Determine update frequency expectations
*	Set up Google Sheets sharing permissions to control edit access
Google Sheets Structure:
The Google Sheets document should be structured with the following columns to support all platform features:
*	Club_Name: Official club title (text)
*	Club_Icon_URL: Link to club logo/icon image (URL)
*	Club_Description: Detailed description shown in expanded view (long text)
*	Club_Proctors: Names and contact info for student leaders and faculty advisors (text, comma-separated if multiple)
*	Club_Tags: Category labels for filtering (text, comma-separated, e.g., “STEM, Competition, Academic”)
*	Meet_Days: Schedule information (text, e.g., “Tuesdays 3:00 PM, Room 201”)
*	Achievements: Notable accomplishments (text, optional)
*	Status: Active/Inactive flag to control display (dropdown: “Active” or “Inactive”)
*	Last_Updated: Timestamp of last modification (date, can be auto-populated)
4.3 Visual Design and Wireframing
Create low-fidelity wireframes and design mockups to visualize the platform before development.
*	Sketch basic layout concepts for key pages (homepage, club directory, individual club pages)
*	Develop wireframes showing content placement and navigation
*	Ensure design aligns with school branding guidelines
*	Plan for mobile-responsive layouts
*	Get feedback on wireframes from key stakeholders
4.4 Technology Selection
Based on requirements and technical assessment, select the appropriate technology stack.
Key Decisions:
*	Platform choice (WordPress, custom development, school CMS integration, etc.)
*	Hosting solution (school servers, cloud hosting, third-party service)
*	Database and content management approach
*	Google Sheets API integration for backend data management (critical requirement)
*	Frontend framework supporting dynamic expandable card components (React, Vue, or vanilla JavaScript)
*	Authentication system integration
*	Analytics and monitoring tools
Critical Technical Requirements:
*	Google Sheets Integration: Implementation must support OAuth 2.0 authentication, handle API rate limits gracefully, and implement caching strategy for optimal performance
*	Dynamic Interface Components: Must support smooth expand/collapse animations, maintain scroll position during interactions, and work consistently across desktop and mobile devices
*	Performance: Platform must load initial view within 2 seconds and handle 50+ club cards without performance degradation
*	Data Validation: Implement validation for Google Sheets data format to ensure all required fields are present and properly formatted
5. Phase 4: Prototype Development
5.1 Minimum Viable Product (MVP) Definition
Define the simplest version of the platform that delivers core value and can be tested with real users.
MVP Core Features:
*	Google Sheets integration as the primary data source with real-time synchronization
*	Dynamic expandable club cards showing icon, title, and tags in collapsed view
*	Expanded club view revealing description, proctors, tags, and meet days when clicked
*	Tag-based filtering system for easy club discovery
*	Basic search functionality by club name
*	Mobile-responsive design with smooth touch interactions
5.2 Initial Data Collection
Gather initial content for 5-10 pilot clubs to populate the prototype.
*	Select diverse clubs representing different activity types
*	Create standardized data collection forms
*	Work with club leaders to gather complete information
*	Verify accuracy and completeness of all data
5.3 Prototype Development
Build a functional prototype incorporating MVP features and pilot club data.
*	Set up development environment
*	Implement core features according to technical specifications
*	Populate with pilot club data
*	Conduct internal testing to identify and fix bugs
*	Ensure accessibility standards are met
6. Phase 5: Testing and Iteration
6.1 Usability Testing
Conduct structured testing sessions with representative users from each stakeholder group.
*	Recruit 3-5 users from each primary stakeholder group
*	Design specific tasks for users to complete (find a club, update information, etc.)
*	Observe users interacting with the prototype
*	Document pain points, confusion, and usability issues
*	Collect qualitative feedback through post-test interviews
6.2 Feedback Analysis and Prioritization
Systematically review all testing feedback to identify necessary improvements.
*	Categorize issues by severity (critical, major, minor)
*	Group related feedback into themes
*	Prioritize fixes based on impact and effort required
*	Create an iteration plan addressing high-priority items
6.3 Iterative Refinement
Implement improvements based on testing feedback and conduct additional rounds of testing as needed.
*	Address critical usability issues first
*	Refine design and functionality based on user feedback
*	Conduct follow-up testing with revised prototype
*	Continue iteration until core functionality meets user needs
7. Phase 6: Documentation and Planning for Next Semester
7.1 Technical Documentation
Create comprehensive documentation to support ongoing development and maintenance.
*	System architecture documentation
*	Database schema and data dictionary
*	API documentation (if applicable)
*	Code comments and README files
*	Deployment and hosting instructions
7.2 User Documentation
Develop guides for different user types to facilitate adoption.
*	Student user guide for browsing and searching clubs
*	Club leader guide for content management
*	Administrator guide for platform oversight
*	Video tutorials for key functions
7.3 Maintenance and Sustainability Plan
Establish procedures to ensure the platform remains functional and current after initial development.
*	Define content update responsibilities and schedules
*	Establish technical support contact and escalation procedures
*	Create backup and recovery protocols
*	Plan for annual content audits and updates
*	Budget for ongoing hosting and maintenance costs
7.4 Semester Summary and Lessons Learned
Document insights from the first semester to improve future phases.
*	Summarize accomplishments and deliverables
*	Document challenges encountered and how they were addressed
*	Record stakeholder feedback and satisfaction levels
*	Identify what worked well and should be continued
*	Note areas for improvement in subsequent development phases
7.5 Next Semester Planning
Define clear objectives and action items for the second semester based on first-semester learnings.
*	Expand pilot program to include all school clubs
*	Implement additional features based on stakeholder requests
*	Develop training program for club leaders and advisors
*	Plan official launch and promotion strategy
*	Establish metrics for measuring platform success and adoption
8. Conclusion
The first semester of this project focuses on thorough research, planning, and prototype development. By systematically engaging stakeholders, analyzing requirements, and building a testable prototype, you create a solid foundation for successful implementation. The key to success is maintaining flexibility, incorporating feedback at every stage, and documenting everything for future reference.
This structured approach ensures that the final platform truly serves the needs of students, club leaders, and school administration while being technically feasible and sustainable over time. The documentation and lessons learned from the first semester will be invaluable as the project moves into full development and deployment in subsequent semesters.
Appendices
Appendix A: Sample Interview Documentation Template
Interviewee Information:
*	Name:
*	Stakeholder Group:
*	Date:
*	Duration:
Key Responses:
*	Overall interest level: [High/Medium/Low]
*	Most desired features:
*	Primary concerns:
*	Similar platforms referenced:
*	Implementation preference:
*	Additional suggestions:
Appendix B: Timeline Overview
A suggested 16-week timeline for first semester activities:
Weeks
Phase
Key Activities
1-2
Initial Planning
Stakeholder identification, interview preparation
3-5
Research
Conduct interviews, competitive analysis
6-7
Requirements Analysis
Synthesize feedback, technical feasibility assessment
8-10
Design
Information architecture, wireframing, technology selection
11-13
Prototype Development
Build MVP, collect pilot data, internal testing
14-15
Testing & Iteration
Usability testing, feedback collection, refinement
16
Documentation
Finalize documentation, lessons learned, next semester planning

 
Appendix C: Success Metrics
Recommended metrics to track project success:
First Semester Metrics:
*	Number of stakeholder interviews completed
*	Percentage of stakeholders expressing interest in the project
*	Number of pilot clubs participating
*	Prototype completion rate (features implemented vs. planned)
*	Usability test success rate (tasks completed without assistance)
*	Average user satisfaction score from testing sessions
Future Launch Metrics:
*	Percentage of clubs with complete profiles
*	Monthly active users (students visiting the site)
*	Average session duration
*	Club profile update frequency
*	New club member inquiry rate
*	User feedback sentiment (positive/neutral/negative)
Comprehensive list of clubs/activities/affinity groups with club proctors and a club description:
Acorn Coding (Brandão)
This club provides students with the opportunity to learn and collaborate with others interested in programming. For anyone who enjoys coding games, apps, websites or even for those who are curious about how technology works, this is the place! Our ultimate goal is to provide an open environment where students have the ability to create without limits both individually and as a team. 

African American Male Association (AAMA) (Smith)
A well-rounded outlook on what it means to be an African American Male at Shipley. Focused on supporting each other in Culture, Social, and Educational development.

American Red Cross Club (Schauerman and Strickler) ***New Club!***
A Red Cross Club is connected to the American Red Cross that gives you the chance to serve your community through activities like organizing blood drives and teaching disaster preparedness. Club members can gain leadership experience, learn emergency skills, and tackle important local and global issues in creative ways. By volunteering, you join a worldwide network focused on helping others, while making a real impact. The American Red Cross depends on volunteers to provide disaster relief, support military families, and save lives through health and safety programs.

Animal Awareness Club (Fisher)
At the Animal Awareness Club, we help animals in need while gaining service hours! We discuss issues revolving around animal cruelty, endangered animals, and how we can help. On regular days we do fun, hands-on activities such as making dog toys or treats and then donating them to charities. We hope to volunteer at shelters occasionally. We also plan to host fundraising events such as bake sales to raise money for certain organizations. Animal Awareness Club is a great way for students to relax while helping animals!

Art Open Studios (Royer, McGuigan, Lovitz)
Open Studios offer students at Shipley the opportunity to immerse themselves in creative projects. Held Monday through Thursday, these sessions allow students to work independently, encouraging them to explore their artistic voice and develop their skills in various mediums. The atmosphere is one of collaboration and inspiration, as students can gather in the studio, share ideas, and provide constructive feedback.

One day a week, Art faculty will offer guided art projects. These sessions focus on 2D materials, providing students instruction and support to experiment with techniques ranging from painting to graphic design. This structured yet flexible approach will enhance students’ artistic repertoire while benefiting from direct instruction. Independent exploration and guided practice fosters a creative environment for students to thrive, enriching their artistic journey.

Arts Committee (Givler, Royer, Clark)
The Arts Committee provides leadership with art focused programming in the school, including promotion, marketing, and curating opportunities for the Theatre, Music, and Visual Arts at Shipley.

Asian Student Alliance (Prakash, Alicea)
Seeks to create an inclusive school environment by strengthening our impact on the greater student body through advocacy and awareness of the AAPI experience and by sponsoring a variety of activities that center AAPI experiences.

The Beacon - Staff (Maurer, Staples)
The Beacon is the official student newspaper for the school. Established in 1955, it is a forum for students to learn about journalism by researching and writing articles relevant to the school and greater community. You might be interested in a specific area of journalistic writing like sports, news, entertainment, investigative stories, profiles, and opinion. Meetings are once a rotation and used for pitching your article idea or volunteering for one of the pitches presented. Assignments are generally due a week from pitches. If you are a solid writer and can meet a deadline then joining the newspaper might be for you!

Belonging and Connection Committee (Alicea, Frankel, Smith)
Creates spaces for the Shipley community to advance identities through cultural interconnectedness. Promotes cultural understanding and advancements through actionable goals

Beyond Robotics (Harris) ***New Club!***
Beyond Robotics is for two types of students who want to make an impact with our Robotics Team. First, it’s a space for current robotics members who want additional time to focus on building, designing, and coding beyond our regular practices. Second, it’s for students who want to take the lead on the non-technical but equally vital parts of the FIRST Tech Challenge program—managing our Engineering Portfolio, branding and marketing, fundraising, and community outreach efforts that showcase how our team embraces the values of Gracious Professionalism® and Coopertition®. Whether you’re interested in hands-on robot work or helping the team shine through outreach and impact, there’s a place for you in Beyond Robotics.

Book Club (Philambolis & Gearhart)
Do you love books? Then join the Upper School Book Club where we explore a wide range of books and engage in lively discussions. Whether you're an avid reader or just looking to expand your horizons, our club offers a welcoming space to share your thoughts and discover new favorites.

BSU (Gaines, Brown)
BSU's mission is to educate our community about what being Black means in today's society. We wish to teach others about diversity through engaging activities centered around acceptance, while also providing a space for Black students to feel loved and cared for. We hope to build self-esteem, encouragement, and friendship as our members navigate a world that far too often overlooks and neglects our needs as human beings. This activity is open to all students. 

Care for Cancer Club (Goren) 
In the Care for Cancer club, we will work to support those with cancer by doing kind deeds such as writing letters for them, providing room decorations, and making hats for those who have lost their hair. In doing so, we hope to create a partnership with a local hospital where members will hopefully be encouraged to go and volunteer. During meetings, we will provide snacks, and do an activity to either help a cancer patient or teach coping mechanisms or things along that line.  

Ceramics Club (Royer)
Are you interested in the craft of sculpting and creating art out of clay? Look no further! In the Ceramics Club, you will be given the opportunity to create your own artwork using skills and tools learned during our club! Everyone is welcome regardless of how much or how little ceramics experience you have. 

Chess Club 
We gather to play chess. There are various opportunities in the club: from learning the game to challenging matches, but ultimately it is a time to play Chess. It’s also a great way to meet students of all grades and show your competitive nature in a different field! “Chess holds its master in its own bonds, shackling the mind and brain so that the inner freedom of the very strongest must suffer.”  - Albert Einstein 

Compass (Gondi)
The Compass, Shipley’s literary magazine, publishes the creative writing and artwork of Shipley Upper School students.  We work together to create and select pieces for this glossy publication.  Our club meetings include creative writing exercises, sharing our work, editing the work of others, choosing artwork, and proofing the final magazine.  

Dance Club (Givler) *** NEW this year!
The Dance Club is a welcoming space for anyone interested in dance. Throughout the year, we will explore various styles of dance and have lots of fun! We will hold classes and events and educate others about dance. Some dance styles explored will be Ballet, Contemporary, Gaga Movement, Hip-Hop, Cultural Dance and more. The Dance Club is a great activity for anyone wanting to improve their dance skills, make new friends, and have a great time!

Debate (Simpson)
Are you interested in public speaking? Do you enjoy discussing hot topics and sharing your opinions? Do you like to argue? The Debate activity is an opportunity to think critically and analyze domestic American politics as well as international relations. We will practice formal debate process and techniques—specifically Parliamentary Debate—with the goal of participating in debate tournaments with other schools.

DECA (Richard)
DECA prepares the next generation of business leaders to become academically prepared, community oriented, professionally responsible, and experienced at effective workplace leadership. We welcome all students at Shipley with career interests in marketing, entrepreneurship, finance, hospitality, materials handling, and management. We plan to attend several conferences this year (at the District, State, and National levels) and participate in other fun activities associated with the Pennsylvania and National DECA organizations. .

Dungeons and Dragons (Zodda)
Dungeons and Dragons is a game where players are led on an adventure in a fantasy world where they have nearly complete freedom to do whatever they want with the skills and tools of the characters they themselves design. Their adventure is narrated and refereed by a player called the Dungeon Master, who details the surroundings, manages the rules, and moves the story forward. The other players use their creativity and their character’s ever-evolving stats to solve problems and fight monsters. Seven different kinds of dice are used in the game to determine the success of various actions the players might try to do. Dungeons and Dragons is not a video game or a board game, but a roleplaying game that takes place in the players collective imagination.

Events Planning Committee (Denbigh and Varner)
The focus of this committee is to partner with student government in organizing, promoting, planning, and executing four key community events throughout the year: Super Saturday, Halloween, Swamp Night, and Spring Fling. It is a fabulous opportunity to learn about the behind-the-scenes-work in making an event come together and to become a leader in creating special moments for the Shipley community.  

Film and Movie Evaluation (FAME) Club (Winiarski)
Film and Movie Evaluations Club (FAME Club) is a space for students who share a love for movies and shows to come together to turn their passion into a hobby. We will watch a selected movie (voted through a Google form poll) for the duration of two sections and have group discussions based on our opinions and takeaways from the movies. There will be a form via Google Docs that will require each student to reflect thoughtfully on the movie and then share with the group. This will be a fun opportunity for movie-enthusiasts to delve into deeper topics and inspire critical thinking.

The Shipley Finance Forum (Rebholz)
In this Club, you will learn the basics of investing in the stock market and be able to apply the skills that you learn in a risk-free virtually simulated stock market competition (marketwatch). Executives and professors well-versed in the industry will present throughout the year on various topics and to provide advice and give background on their path to success in the finance industry.

Flag Football Club (Atkins, Pidot, Clement) ***New this year!
Flag football club will give students an opportunity to enjoy playing a sport that isn’t offered by Shipley. Students will be able to connect closer with teammates and enjoy engaging in an athletic activity during flex period.

Futbol Forum Club (Addis)
In this club, we do Futbol (Soccer) related activities. We discuss, debate, and play the sport we all love. Our goal is to bring all of our Shipley Futbol fans together to share our love for the game and bring new fans to the game by showing everyone how great a game futbol is. 

Girls’ Spark Club (Atkins) ***New this year!
This club is for female-identifying students in high school. The club's goals are to spread awareness towards teenage mental health, to make others feel like they are not alone in what they are going through, and to connect with others by being a part of the club together.

Jewish Heritage Association (Bejar-Massey, Goren)
The Jewish Heritage Association is a group that welcomes all US students and is focused on Jewish cultural celebration. This group celebrates Jewish heritage (often in delicious and laughter and joy-filled ways). It plans celebrations/awareness of holidays and the like. This is a young club so there are lots of opportunities for student leadership (you?) to find their footing and guide our plans accordingly.

Latinx Affinity Group (Medina + Calderón) ***New this year!
The focus is on building cultural identity and celebrating Latinx and/or Hispanic heritage. It explores what it means to identify as individuals of Latin American cultural or ethnic background in the United States and in the global context. This affinity space fosters the sharing of experiences, the creation of programming, and advocacy efforts.

Logic Playground (Frankel)  ***New this year!
Logic Playground is a club driven by hands-on practice and curiosity. Here, we connect math with daily life in unexpected ways through exploring patterns, logic puzzles, strategy games, and creative projects. We will make Mobius strips and polyhedral models by hand, analyze the probabilities and strategies behind poker games, study the golden ratio and symmetrical structures in art and nature, experience the joy brought by mathematical thinking, and explore some very counterintuitive facts! For each activity, we will prepare the theme and materials in advance to ensure that the content is interesting and easy to participate in. This is a space for free exploration and rediscovery of the beauty of mathematics and logic.

Math Peer Tutoring (Chirlian) 
Math Peer Tutoring offers a chance for students to learn about teaching math while helping their peers. You'll work closely with math teachers to develop skills such as clear communication, problem-solving, and teaching techniques. Later in the year, you'll be able to set up individual sessions with peers who need extra help. To join, you should have completed Algebra II and be excited about math and teaching others.  

Math Team (Rebholz)
We are participating in the “Philadelphia Area Math League for Independent Schools”. This is a Fall league where students meet before school for 30-min online weekly matches, which alternate in group and individual format. At the end of the season there is also an in-person playoff event. The Shipley Math Team has enjoyed a great history over the years, but the focus is on fun and team spirit.

Middle Eastern North African (MENA) (Smith)
Develops healthy cultural and racial identities. Celebrates and promotes a positive understanding of culture, history, and advancement among MENA students.

Mock Trial (Simpson)
The Mock Trial activity involves a simulation of a civic or criminal trial, with witnesses, plaintiffs, and attorneys on both sides. The competition is held in a real courtroom (last year at Delaware County Courthouse) with real judges presiding, and real attorneys acting as the jury. If you're intrigued by the legal world, enjoy public speaking, are good at communicating, or enjoy playing a theatrical role, you might want to consider this hands-on experience. Whether you are a witness or an attorney, you will learn valuable skills, from public speaking to legal research; those playing witnesses will also improve their acting skills. The club meets every week, with optional training sessions held for case discussion when competition is getting closer.

Model UN (Simpson)
For students interested in international relations, history, and politics, this activity offers a great opportunity to develop public-speaking, problem-solving and collaborative skills. Shipley delegates will attend the NAIMUN Model UN conference Washington, D.C. in February. At the conference, students represent specific nations or participate in panels addressing issues of global concern, such as global warming, terrorism, or economic development. Having the time and the motivation to properly research any topic is essential. Open to all Upper School students, but prospective members will have to produce a short research paper and participate in try-outs in order to join.

Music Mentors (Gilver)  ***New Club!***
Music has the power to inspire, connect, and build confidence in students of all ages. The Music Mentors program seeks to create a bridge between the Shipley Upper and Lower School communities by pairing Upper School music students with younger musicians in band, orchestra, and choir. Through weekly mentorship, Upper School students will provide guidance, encouragement, and practical support, fostering a stronger community and promoting music as a lifelong passion.

National History Day (Gillin)
National History Day is a competition that allows you to explore topics that you may have never heard of before, or dive further into topics that you have heard of. Each year, there is a theme and each history project must follow that theme. There are a multitude of project types like documentary, website, exhibit or poster, performance, and more. The competition has local, state, and national levels.

Plates of Promise (Atkins) ***New Club!***
Our club is dedicated to fighting hunger in our community by collecting and donating food to local food banks and shelters. We believe that everyone deserves access to nutritious meals, and through regular food drives and volunteer efforts, we aim to make a positive impact one meal at a time. Whether it’s organizing donations or spreading awareness, we’re committed to helping those in need.

Politics & Activism (Goren, Gillin) 
A club for civically engaged students, we typically discuss current events and ways to get involved in our local community. We aim to distribute a monthly newsletter, to facilitate voter registration, and to share information about ways to make one’s voice heard.

Quiz Bowl (Varner)  
Quiz bowl is a fast-paced trivia competition in which teams of four players compete to answer questions that cover academic subjects like literature and science as well as the broader world of popular culture and current events. We will be competing in tournaments where we can test our knowledge against other schools! Everyone is welcome on the team!

Robotics Team (Harris) ***New Club!*** - Not part of the regular Flex Club Request Process. See information on how to sign-up for Robotics in the blurb below.
A brand-new Robotics Club is kicking off this fall! Our season runs September through April, with practices Monday–Thursday, 3:30–5:00 pm. We’re building an FTC competition team, and we need coders, builders, marketers, engineers, and anyone who just wants to have fun—no experience needed! Don’t worry if you’ve got schedule conflicts, we’ll work it out together. Ready to join? Sign ups and more info can be found HERE!  IF you have any questions please reach out to Mr.Harris at jharris@shipleyschool.org

SCOPE (Foster +Foltiny)
Summer Camp Opportunities Promote Education also known as SCOPE is an organization that helps raise money and awareness for kids not fortunate enough to attend camps over the summer. Summer camp is an important way for children to thrive in a large community that brings different opportunities, education, and life experiences. SCOPE not only helps kids get into the camps but it only connects them more with nature and helps them develop independence. In SCOPE, we directly support the kids going to camp through service projects, letters, fundraising, and more. We are so excited for this to begin and to help support a cause that means so much to us. Anyone is welcome to join our club no matter what your experiences have been with camps in the past. Come join us to contribute to a positive club for our community! 

Science Olympiad (Devlin, Shepherd)
Science Olympiad is a STEM competition in which a group of 15 students pair up to  compete in 23 events which involve building devices, performing labs, test taking, and a combination of these types of skills (www.SOInc.org).  The club consists of many more than 15 students as we work together as a larger team to have fun at multiple tournaments throughout the year.

Senior Smiles Club (Pidot) 
In the Senior Smiles club, our goal is to spread joy and develop friendships with elderly people in senior-living homes around our community while receiving service hours. In our club, we will write letters, create thoughtful gifts, and possibly organize visits to senior living homes. Our mission is to brighten the lives of elderly residents by spreading kindness, creativity, and personal connections. Join us in making a positive impact and forming meaningful relationships with those who have so much wisdom and experience to share.

Service/Global Programs Committee (Winters + Pidot)
Enjoy organizing and participating in service events? Do you have a global outlook?  The Service/Global Programs Committee helps plan service/global programs activities happening at Shipley by giving input, organizing for the event, helping to run events, making posters, working on the bulletin board, and creating new activities.  Events include (but are not limited to) Super Saturday, Global Ed Film Fest, Thanksgiving, virtual exchanges with students in different countries, fostering connections with international families, and much more! Come join us in making a difference in our community and the world!


Shipley Shift: Environmental Club (Lytle) *** NEW this year!
Are you looking to have fun and make a meaningful difference in your community? Do you want to have an impact on something important but not sure how to do it? Come on out to Shipley Shift! In Shipley Shift, we will creatively work together to support our School in learning to make small shifts in our daily lives in the spirit of taking action to ensure a more environmentally sustainable world, both on and off campus. As a club member, you will have the opportunity to lead as you help your peers and adults understand why it’s so important to consume less, reuse, and recycle. Plus, you’ll get to enjoy the homemade cookies and treats that Madame Lytle brings to our enviro club! Let’s make a difference in Shipley Shift!


Shipley Spirit Squad (Satterfield, Brower, Foltiny)
Spirit Squad is a mixed dance/cheer team that performs at several events throughout the year, including Super Saturday, pep rallies, and Swamp Night. It is open to all students in the Upper School and anyone can join regardless of their dance/cheer experience. Some rehearsal outside of the activity/club block may be needed, as well as attendance at weekend/evening events listed above. Student leaders play a large part in choreography and organization.

Shipley TV (Staples, Deal)
Are you interested in media, pop culture, or film production? Shipley TV is a club that gives you the opportunity to explore your interests in a way never offered before. As a group, we will work together to produce weekly news broadcasts that will be posted on social media and shared with the student body. In this club, there is a role for everyone: on-camera hosts, behind the scenes producers, editors, social media managers, and script writers are just some of the unique positions available for members of the club.

Simon’s Heart Club (Varner)
The Simon’s Heart Club is a club made to raise awareness for sudden cardiac arrest. In the club, we will help raise money for the Simon’s Heart organization, help design the annual ‘Simon’s Heart Sweatshirt,’ and come up with various other fundraiser ideas, including making posters and much more. 

SPARC (Norquist)
SPARC offers students the opportunity to advise the school about issues that matter in students’ lives at Shipley. We research topics that students identify as important to them in their life at Shipley, and we present our findings and recommendations at a conference at the University of Pennsylvania. SPARC is an excellent opportunity to learn about university-level research, and to connect with Penn. 

Spectrum - LGBTQ+ Affinity Group (White, Gillin)
Spectrum is a space to discuss LGBTQ issues, to work towards a more inclusive Shipley and world at large, and to plan awesome events. Anyone interested in LGBTQIA+ rights, including allies, is welcome to join. 

LGBTQIA+ Affinity Group is for those who identify within the LGBTQIA+ community, including folks who are questioning. It is a space to build community, share what’s going on in our lives, and support each other. 

Sports Debate Club (Richard)  ***New this year!
In this Club, we are planning to gather students to talk about the different sports going on in the world. We plan to debate various sports while making it fun for everyone. We want people in the club to learn about various sports and help improve their debating. We want to create some fun "game of the week" and the winner at the end of the year gets a reward.

Sprouts (Sterling, Couture, Eiteljorg)
Shipley’s horticulture club has been in existence for more than 40 years and competes annually in the Philadelphia Flower Show. Members design, plant, and care for pots of flower bulbs and succulents, which are submitted as entries in the Flower Show each winter (winning numerous ribbons and awards). Sprouts members are also involved in “greening” the school for the holidays, planting the raised-bed gardens, and preparing plants for sale each spring. While no experience is necessary, members must be dedicated to attending at least one meeting each rotation. The small greenhouse space limits participants to no more than 15 total.

STEAM (Brandão)
STEAM club provides students with the opportunity to learn how to utilize the tools and machines in the Shipley makerspace. For anyone who enjoys STEAM or even for those who are curious about it, this is the place! We have a structured plan for activities but are open to new ideas and would love to base our projects off of what the student body prefers. Our ultimate goal is to provide an open environment where students have the ability to create without limits both individually and as a team. We hope to hold friendly competitions within the club and complete a few service projects along the way.

Shipley Storytelling (Jennings) 
Stories make us more human, they locate us in questions that we long to answer, they connect us across time, space, and geography. In this club, we will build a storytelling community: a network of tellers, listeners, and meaning-makers. Through creative narrative writing prompts, social story drafting, and storytelling, we will explore stories that matter to us. Grounded in The Moth’s storytelling principles, this club will also form the “social drafting team” for Gator Congregation storytellers. 

Ultimate Frisbee (Wellenbach, White, Addis)
Come join us to get a little exercise playing either Ultimate Frisbee or disc golf. Ultimate Frisbee is an action-packed game that combines some of the best elements of sports like football, soccer, and basketball. Everyone is welcome! 

Video Games Club (Atkins) *** NEW this year!
Video Game Club will be a place where people can come together and discuss the games they play and love most. Whether you are competitive , or just a casual gamer, video game club is fun and welcoming for all. Games that will be covered are Clash Royale, Mario-kart, and other games that have changed the world.  

Writing Center (Gondi)
The Shipley Writing Center offers one-on-one assistance to students at all stages of the writing process, from brainstorming ideas to polishing final drafts. Trained peer tutors help students with various types of writing, including English essays, history essays, and lab reports. The center aims to help students become more confident and skilled writers. Only trained peer tutors can sign up to staff the writing center. For this year, those individuals are the ones who received training in the spring of 2024. If you are a trained peer tutor, sign up for one or two slots during the blue or green week. Our aim is to ensure coverage for all available sessions, which are Monday, Wednesday, and Thursday during the blue or green week. We would like to have each covered by a minimum of two students.

Yearbook (Kinsella)
Do you look forward to receiving a yearbook at the end of every school year? Do you enjoy flipping through the pages and being reminded of all the fun activities and special moments captured in photographs? Well how would you like to have a hand in the actual layout and design of our yearbooks? Join Yearbook Club and you will have the opportunity to work with a talented team of students who are dedicated to delivering a quality product each year. Join us and forever leave your mark in the long legacy of Shipley Yearbooks. 

Yoga (Saulino)
Students will learn about the history and philosophy of yoga, as well as practice yoga for improved well-being and flexibility. Yoga does not count as PE Credit.

