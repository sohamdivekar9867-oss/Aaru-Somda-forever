const hotspots = document.querySelectorAll(".hotspot");
const SUPABASE_URL="https://swqaakxywwajesuajflz.supabase.co";
const SUPABASE_KEY="sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";
// Shared relationship data: planned Date Cat quests live in Supabase so both Aaru and Somda see the same data.
const PLANNED_QUESTS_API=`${SUPABASE_URL}/rest/v1/planned_date_quests`;
function dateCatHeaders(extra={}){return {apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,'Content-Type':'application/json',...extra}}

const modal = document.getElementById("memoryModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const modalClose = document.querySelector(".modal-close");
const modalBackdrop = document.querySelector(".modal-backdrop");


// =========================
// OBJECT INTERACTIONS
// =========================

hotspots.forEach((hotspot) => {

  hotspot.addEventListener("click", (event) => {

    // Date Cat has its own RPG-style planner modal.
    if (hotspot.classList.contains("cat-hotspot")) return;

    // If the object has a link, open that page instead of the popup
    const link = hotspot.dataset.link;

    if (link) {
      window.location.href = link;
      return;
    }

    // Otherwise, open the normal memory popup
    const title = hotspot.dataset.title;
    const content = hotspot.dataset.content;

    modalTitle.textContent = title;
    modalContent.textContent = content;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    // Remove active state from other objects
    hotspots.forEach((item) => item.classList.remove("active"));

    // Keep the selected label visible briefly
    hotspot.classList.add("active");
  });

});


// =========================
// CLOSE MODAL
// =========================

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  hotspots.forEach((item) => item.classList.remove("active"));
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);


// Close with Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});



// =========================
// BED — KISS INTERACTION
// =========================

const bedHotspot = document.querySelector(".bed-hotspot");
const kissModal = document.getElementById("kissModal");
const kissClose = document.querySelector(".kiss-close");
const kissBackdrop = document.querySelector(".kiss-backdrop");
const kissAction = document.getElementById("kissAction");
const kissMessage = document.getElementById("kissMessage");
const kissCount = document.getElementById("kissCount");

let kissStep = 0;

const kissLines = [
  {
    message: "I think you owe me a kiss. 💋",
    button: "💋 Kiss Somda",
    count: ""
  },
  {
    message: "Mwah. ❤️ That was supposed to be just one kiss.",
    button: "💋 One more",
    count: ""
  },
  {
    message: "Okay… now you're making it difficult for me to behave. 😏",
    button: "💋 Come closer",
    count: ""
  },
  {
    message: "Aaru… you're really not helping me behave. 🙈❤️",
    button: "💋 One last kiss",
    count: ""
  },
  {
    message: "Fine. Come here. I'm keeping you. 🫶",
    button: "❤️ Stay here",
    count: ""
  },
  {
    message: "No more teasing. Just come here and let me hold you. ❤️",
    button: "💋 Mwah",
    count: "Private corner — Aaru + Somda only 🤫"
  }
];


function createKissParticles() {
  if (!bedHotspot) return;

  const rect = bedHotspot.getBoundingClientRect();
  const symbols = ["💋", "♡", "♥", "💗", "💋", "♡", "❤️"];

  for (let i = 0; i < 7; i++) {
    const particle = document.createElement("span");
    particle.className = "kiss-float-particle";
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const startX = rect.left + rect.width * (0.25 + Math.random() * 0.5);
    const startY = rect.top + rect.height * (0.45 + Math.random() * 0.35);

    const drift = `${Math.round((Math.random() - 0.5) * 90)}px`;
    const rise = `${Math.round(100 + Math.random() * 110)}px`;
    const rotate = `${Math.round((Math.random() - 0.5) * 35)}deg`;
    const duration = `${(1.25 + Math.random() * 0.8).toFixed(2)}s`;

    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.setProperty("--kiss-drift", drift);
    particle.style.setProperty("--kiss-rise", rise);
    particle.style.setProperty("--kiss-rotate", rotate);
    particle.style.setProperty("--kiss-duration", duration);
    particle.style.animationDelay = `${(Math.random() * 120).toFixed(0)}ms`;

    document.body.appendChild(particle);

    particle.addEventListener("animationend", () => {
      particle.remove();
    }, { once: true });
  }
}

function openKissModal() {
  kissStep = 0;
  kissMessage.textContent = kissLines[0].message;
  kissAction.textContent = kissLines[0].button;
  kissCount.textContent = "";
  kissModal.classList.add("open");
  kissModal.setAttribute("aria-hidden", "false");
}

function closeKissModal() {
  kissModal.classList.remove("open");
  kissModal.setAttribute("aria-hidden", "true");
}

if (bedHotspot) {
  bedHotspot.addEventListener("click", () => {
    hotspots.forEach((item) => item.classList.remove("active"));
    openKissModal();
  });
}

if (kissAction) {
  kissAction.addEventListener("click", () => {
    createKissParticles();
    kissStep = Math.min(kissStep + 1, kissLines.length - 1);

    const line = kissLines[kissStep];
    kissMessage.textContent = line.message;
    kissAction.textContent = line.button;
    kissCount.textContent = line.count;

    kissAction.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.07)" },
        { transform: "scale(1)" }
      ],
      { duration: 280, easing: "ease-out" }
    );
  });
}

if (kissClose) kissClose.addEventListener("click", closeKissModal);
if (kissBackdrop) kissBackdrop.addEventListener("click", closeKissModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeKissModal();
});


// =========================
// MIRROR — 30 RANDOM COMPLIMENTS
// =========================

const mirrorHotspot = document.querySelector(".mirror-hotspot");
const mirrorModal = document.getElementById("mirrorModal");
const mirrorClose = document.querySelector(".mirror-close");
const mirrorBackdrop = document.querySelector(".mirror-backdrop");
const mirrorNext = document.getElementById("mirrorNext");
const mirrorCompliment = document.getElementById("mirrorCompliment");

const mirrorCompliments = [
  "Yep. Still the most beautiful girl I know. ♡",
  "You have no idea how lucky Somda feels.",
  "Someone out there is completely, hopelessly in love with you.",
  "Your smile is still my favourite view.",
  "You make ordinary days feel like something worth remembering.",
  "If I could freeze one moment, it'd be the moment you smile.",
  "You look like someone's favourite person. Because you are.",
  "Somehow, you get prettier every time I see you.",
  "Awww. Look at you being adorable again.",
  "Mirror report: dangerously cute today.",
  "Yep. Certified sweetheart. ♡",
  "That face deserves approximately 47 kisses.",
  "You look very huggable today.",
  "The mirror would like to officially compliment you.",
  "Warning: excessive cuteness detected.",
  "Did you really need the mirror to tell you you're pretty?",
  "Okay, stop staring. You're making the mirror nervous.",
  "Someone clearly woke up determined to be gorgeous.",
  "Honestly? A little unfair to everyone else.",
  "Breaking news: Aaru is still ridiculously pretty.",
  "You came here for a compliment, didn't you? 😏",
  "Fine. You're pretty. Happy now?",
  "I would compliment you more, but your ego is already getting dangerous.",
  "Somda is going to have a very hard time behaving around you.",
  "That look? Yeah… absolutely not helping him behave.",
  "You know exactly what you're doing with that face, don't you?",
  "If Somda were here, that mirror probably wouldn't get much attention.",
  "Pretty face. Dangerous effect. 😏",
  "Honestly, Aaru… come closer. I think you deserve a kiss.",
  "You look way too good tonight. Come here and let me admire you properly. ❤️"
];

let mirrorDeck = [];
let mirrorSeen = 0;

function shuffleMirrorDeck() {
  mirrorDeck = [...mirrorCompliments];

  for (let i = mirrorDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mirrorDeck[i], mirrorDeck[j]] = [mirrorDeck[j], mirrorDeck[i]];
  }

  mirrorSeen = 0;
}

function nextMirrorCompliment() {
  if (!mirrorDeck.length || mirrorSeen >= mirrorDeck.length) {
    shuffleMirrorDeck();
  }

  const text = mirrorDeck[mirrorSeen];
  mirrorSeen += 1;

  mirrorCompliment.textContent = text;

  mirrorCompliment.animate(
    [
      { opacity: 0, transform: "translateY(5px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    { duration: 260, easing: "ease-out" }
  );

  mirrorNext.textContent =
    mirrorSeen === mirrorCompliments.length ? "More secrets ♡" : "Awww ♡";
}

function openMirrorModal() {
  if (!mirrorDeck.length || mirrorSeen >= mirrorDeck.length) {
    shuffleMirrorDeck();
  }

  mirrorModal.classList.add("open");
  mirrorModal.setAttribute("aria-hidden", "false");
  nextMirrorCompliment();
}

function closeMirrorModal() {
  mirrorModal.classList.remove("open");
  mirrorModal.setAttribute("aria-hidden", "true");
}

if (mirrorHotspot) {
  mirrorHotspot.addEventListener("click", () => {
    hotspots.forEach((item) => item.classList.remove("active"));
    openMirrorModal();
  });
}

if (mirrorNext) {
  mirrorNext.addEventListener("click", nextMirrorCompliment);
}

if (mirrorClose) mirrorClose.addEventListener("click", closeMirrorModal);
if (mirrorBackdrop) mirrorBackdrop.addEventListener("click", closeMirrorModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMirrorModal();
});

// =========================
// DATE CAT — RPG / CHEEKY DATE PLANNER
// =========================
(function(){
  const catHotspot=document.querySelector('.cat-hotspot');
  const catModal=document.getElementById('dateCatModal');
  const catClose=document.getElementById('dateCatClose');
  const catBackdrop=catModal?.querySelector('.date-cat-backdrop');
  const catBubble=document.getElementById('dateCatBubble');
  const catOptions=document.getElementById('dateCatOptions');
  const catProgress=document.getElementById('dateCatProgress');
  const catThinking=document.getElementById('dateCatThinking');
  const catQuest=document.getElementById('dateCatQuest');
  const catActions=document.getElementById('dateCatActions');
  const catSave=document.getElementById('dateCatSave');
  const catAnother=document.getElementById('dateCatAnother');
  const catSaved=document.getElementById('dateCatSaved');
  const catChangeTop=document.getElementById('dateCatChangeTop');
  if(!catHotspot||!catModal)return;

  const opening=[
    'Ohhh. Look who\'s here.',
    'Planning another date, are we? I should\'ve known.',
    'You two have a suspicious habit of turning completely normal days into dates.',
    'Fortunately for you, I\'m professionally trained in this.',
    'Well… professionally trained according to absolutely nobody. Anyway, tell me what kind of trouble we\'re getting into today.'
  ];

  const data={
    start:{options:[
      ['nature','🌳 Nature Date'],['afteroffice','💼 After Office Date'],['mumbai','🏙️ Explore Mumbai'],['photos','📸 Photo Date'],['getaway','🚗 Mini Getaway'],['fun','🎢 Fun & Activities'],['movie','🎬 Movie / Show'],['food','🍽️ Food Date'],['cafe','☕ Café Date'],['make','🎨 Make Something Together'],['shopping','🛍️ Shopping + Food'],['evening','🌙 Evening Date'],['romantic','❤️ Romantic Date'],['surprise','🎲 Surprise Us']
    ]},
    nature:{questions:[
      {key:'type',text:'Nature? Wow. I didn\'t know you two were capable of leaving civilisation voluntarily. I\'m impressed. So… what kind of nature are we talking?',options:[['park','🌿 Park / Garden','Classic. Walk. Talk. Sit together. Pretend you weren\'t going to spend half the time looking at each other.'],['lake','🌊 Lake / Waterfront','Pretty. Peaceful. Excellent place for unnecessarily romantic conversations.'],['hills','🏞️ Hills / Viewpoint','Okay, someone has decided the date needs a view. I respect the ambition.'],['forest','🌳 Forest / Greenery','Very peaceful. Very cute. Potentially terrible for phone battery.'],['sunset','🌅 Nature + Sunset','Oh, we\'re combining things. Ambitious. I like it.'],['beach','🏖️ Beach','Sand. Sea. Sun. And probably someone complaining about the sand later.'],['food','🍽️ Nature + Food','You went into nature and somehow food followed. Honestly? Valid.']]},
      {key:'walk',text:'How much walking are we making these poor legs do?',options:[['sit','🪑 Mostly Sitting','Ah. So we\'re technically doing nature. But from a chair.'],['some','🚶 Some Walking','Perfect. Enough walking to feel productive. Not enough to regret your life choices.'],['explore','🥾 Let\'s Actually Explore','OH. We\'re serious. Okay, shoes on. No complaining halfway through.']]},
      {key:'add',text:'And what are we adding to make this an actual date?',options:[['cafe','☕ Café','Nature… followed by coffee. You two really cannot escape cafés.'],['food','🍽️ Food','Excellent. Walking creates hunger. I have studied this extensively.'],['photos','📸 Photos','Pretty place. Pretty people. Easy.'],['dessert','🍦 Dessert','Dessert after nature. You know what? I\'m starting to like your decision-making.'],['picnic','🧺 Picnic','PICNIC? Okay, this is adorable. Someone is getting extra romance points.'],['us','❤️ Just Us','Aww. No activity. No distraction. Just you two. Disgustingly cute.']]},
      {key:'budget',text:'Finally, the important question. How much are we spending on our wholesome little escape?',options:'budget'}
    ]},
    afteroffice:{questions:[
      {key:'meet',text:'After office, huh? So you two survived the workday and now want to escape it together. I approve. Where are we meeting?',options:[['ghatkopar','📍 Ghatkopar','Ah, Ghatkopar. Convenient. Efficient. Very Mumbai. Let\'s make the most of the evening.'],['andheri','📍 Andheri','Andheri? Okay. Someone is making me do Mumbai logistics now. Fine.'],['lowerparel','📍 Lower Parel','Lower Parel. Offices, malls, food, and approximately seventeen ways to accidentally spend money.'],['thane','📍 Thane','Thane! Look at you two travelling for love after a full workday. Respect.'],['decide','🎲 We\'ll Decide Ourselves','Keeping the meeting point flexible? Smart. I\'ll worry about the actual date.']]},
      {key:'plan',text:'Good. You\'ve escaped the office. Now what are we actually doing with the evening?',options:[['food','🍽️ Dinner','Obviously. The workday has earned you food.'],['cafe','☕ Café','A post-office café date. Classic. You two really do have a type.'],['movie','🎬 Movie','Straight from spreadsheets to cinema. Excellent transition.'],['walk','🚶 Walk & Talk','No screens. No office talk. Just the two of you.'],['shopping','🛍️ Shopping + Food','Dangerous after payday. Extremely dangerous.'],['fun','🎢 Fun Activity','You survived work. Now go do something actually fun.'],['romantic','❤️ Romantic Evening','Ohhh. Someone wants the workday to end on a much better note.'],['surprise','🎲 Cat Chooses','You survived office and now you\'re surrendering the evening to me? Brave.']]},
      {key:'time',text:'How much of the post-office evening are we stealing for ourselves?',options:[['short','⏰ 1–2 Hours','A little escape. Enough to reset before heading home.'],['medium','🌆 2–4 Hours','Now that\'s a proper after-office date.'],['long','🌙 Until Late','Oh. We\'re forgetting tomorrow\'s alarm exists. I see.']]},
      {key:'budget',text:'Last thing. How much are we allowing Somda\'s wallet to suffer after surviving the workday?',options:'budget'}
    ]},
    mumbai:{questions:[
      {key:'area',text:'Now THIS is interesting. You don\'t necessarily need a plan. You just need somewhere to start. So where are we sending you two?',options:[['bandra','🌊 Bandra','Walks, food, sea, cafés… very date-friendly.'],['marine','🌊 Marine Drive','Classic. Sea breeze, city lights, and absolutely no excuse not to sit together.'],['fort','🎨 Fort','Pretty streets, old buildings, good photographs. Let\'s pretend we\'re sophisticated.'],['lower','🏙️ Lower Parel','Food, malls, entertainment… and Somda\'s wallet quietly preparing itself.'],['andheri','🌆 Andheri','Busy, chaotic, full of options. Very Mumbai.'],['panvel','🚆 Panvel','PANVEL? 😂 You two really said “Explore Mumbai” and then left Mumbai. I respect the loophole.'],['dombivli','🚆 Dombivli','DOMBIVLI? 😂 Okay, this is personal. Someone has chosen chaos.'],['new','🗺️ Somewhere New','YES. No repeating the same old places. Let\'s discover something.'],['cat','🐱 Cat Chooses','Excellent. You have surrendered control to a cat.']]},
      {key:'activity',text:'Okay, destination selected. What are we actually doing once we get there?',options:[['walk','🚶 Walk Around','No strict itinerary. Just wander and see what happens.'],['photos','📸 Take Photos','Camera ready. I expect at least one ridiculously cute picture.'],['food','🍽️ Find Food','Of course. I knew food would enter the conversation eventually.'],['cafe','☕ Café Hop','Again? Really? You two have a serious café addiction.'],['shop','🛍️ Shop','I\'ll alert Somda\'s bank account.'],['interesting','🎭 Find Something Interesting','Now THAT is my favourite option. No idea what you\'ll find. Let\'s find out.'],['everything','🎲 A Bit of Everything','Ah. The chaos option. My favourite.']]},
      {key:'duration',text:'And how long are we letting Mumbai keep you?',options:[['short','⏰ 2–3 Hours','A neat little date. Enough time to have fun, not enough time to get lost.'],['half','🌤️ Half Day','Proper exploring. I approve.'],['full','🌅 Whole Day','Oh, we\'re making an EVENT out of this. Excellent.']]},
      {key:'budget',text:'One final thing. How much chaos can Somda\'s wallet tolerate?',options:'budget'}
    ]},
    photos:{questions:[
      {key:'style',text:'PHOTO DATE? Ohhh. Someone wants a new camera-roll dump. I support this. What kind of pictures are we hunting?',options:[['city','🌆 City Photos','City aesthetic. Very cinematic. Try not to look like you\'re posing.'],['sea','🌊 Sunset / Sea','Easy. Good lighting. Romantic background. Aaru does the pretty part. Somda just needs to show up.'],['nature','🌿 Nature','Pretty greenery. Pretty people. Easy.'],['architecture','🏛️ Pretty Architecture','Fancy. Let\'s make you two look like you\'re in a movie.'],['couple','❤️ Couple Photos','Oh? We\'re committing. I respect it.'],['candid','📸 Random Candid Photos','Excellent. No posing. No “wait, let me fix my hair.” Just catch the actual moments.']]},
      {key:'who',text:'And who is taking these masterpieces?',options:[['turns','📱 Take Turns','Fair. Equal opportunity embarrassment.'],['selfies','🤳 Mostly Selfies','Classic. Foreheads together. Cheeks together. You know the drill.'],['better','😂 Whoever Takes Better Photos','Ohhh. Competition. I like this.'],['none','🎲 No Plan','Perfect. Let the camera do its thing.']]},
      {key:'add',text:'Good. But we\'re not spending the entire date taking 47 versions of the same selfie. What else are we doing?',options:[['cafe','☕ Café','A little coffee break.'],['food','🍽️ Food','Photos require fuel. Obviously.'],['sunset','🌅 Sunset','Good light. Good choice.'],['walk','🚶 Walk','Keep wandering.'],['shop','🛍️ Explore / Shop','A little browsing never hurt anyone.'],['us','❤️ Just Us','Put the phone away for a bit.']]},
      {key:'budget',text:'And what is the damage limit?',options:'budget'}
    ]},
    getaway:{questions:[
      {key:'type',text:'WAIT. You\'re escaping Mumbai? This got serious very quickly. Okay, little travellers. What kind of escape?',options:[['beach','🏖️ Beach','Sand. Sea. Sun. And probably someone complaining about the sand later.'],['hills','🏞️ Hills','Fresh air. Views. And at least one “wow, look at that” moment.'],['nature','🌳 Nature','Very wholesome. I\'m suspicious.'],['drive','🌅 Scenic Drive','Music. Road. Good company. Very dangerous combination for catching feelings.'],['food','🍽️ Food Destination','You travelled outside Mumbai… for food. Honestly? Valid.'],['random','🎲 Surprise Me','I choose the escape. Bold move.']]},
      {key:'duration',text:'How long are we disappearing for?',options:[['half','🌅 Half Day','Little escape. Back home before it becomes a full expedition.'],['full','🌄 Full Day','Okay. Proper date.'],['overnight','🧳 Overnight','Oh? We\'re really committing to the storyline.']]},
      {key:'travel',text:'And how are we getting there?',options:[['train','🚆 Train','Classic. A little chaos. A little sharing snacks. Very Mumbai.'],['car','🚗 Car','Road trip mode. Playlist better be good.'],['bus','🚌 Bus','Respect. Maximum opportunity for sleeping on each other\'s shoulders.'],['whatever','🎲 Whatever Works','Excellent. You just want to get there.']]},
      {key:'budget',text:'Before I book this imaginary expedition, what are we telling Somda\'s wallet?',options:'budget'}
    ]},
    fun:{questions:[
      {key:'activity',text:'Ahhh. So sitting quietly isn\'t enough today. You want CHAOS. What are we doing?',options:[['bowling','🎳 Bowling','Are we here to bowl… or discover who gets unbearably competitive?'],['arcade','🎮 Arcade / Gaming','Winner gets bragging rights. Loser buys dessert.'],['skating','⛸️ Skating','Potential for grace. Potential for disaster. Either way, entertaining.'],['escape','🧩 Escape Room','You two are going to solve puzzles together. Or blame each other. Probably both.'],['workshop','🎨 Workshop','Cute. You get to make something together and keep the questionable result forever.'],['competitive','🎯 Something Competitive','OH. May the better partner win.'],['cat','🐱 Cat Chooses','You want me to pick the chaos? Finally, a sensible decision.']]},
      {key:'after',text:'And what happens after you inevitably become exhausted from all that fun?',options:[['food','🍽️ Food','Obviously.'],['dessert','🍦 Dessert','Winner gets dessert. Loser also gets dessert. Everyone wins.'],['cafe','☕ Café','Time to recover.'],['movie','🎬 Movie','Something peaceful after all that chaos.'],['walk','🚶 Walk','Cool down.'],['winner','😏 Winner Decides','Ohhhh. That\'s dangerous. I like it.']]},
      {key:'budget',text:'Okay, final financial question before I unleash the chaos. Budget?',options:'budget'}
    ]},
    movie:{questions:[
      {key:'show',text:'Classic date. Lights down. Snacks ready. And someone inevitably says “I\'m not sleepy” before falling asleep. What are we watching?',options:[['movie','🎬 Movie','Easy.'],['theatre','🎭 Theatre / Play','Fancy. Someone dressed up, didn\'t they?'],['live','🎤 Live Event','Okay. Now we\'re making an evening of it.'],['concert','🎶 Concert','Music. Crowd. Two people singing completely different lyrics. Beautiful.'],['random','🎲 Cat Chooses','I\'ll choose. Don\'t blame me if it\'s weird.']]},
      {key:'after',text:'And what are we doing before or after?',options:[['dinner','🍽️ Dinner','Dinner before the movie. Very responsible.'],['snacks','🍿 Snacks Only','Correct. Snacks are not optional.'],['cafe','☕ Café','Classic.'],['dessert','🍦 Dessert','Good.'],['walk','🚶 Walk','A little post-movie walk.'],['romantic','❤️ Something Romantic','Oh? So we\'re adding romance to the classic. Noted.']]},
      {key:'budget',text:'Last thing. What are we telling the wallet?',options:'budget'}
    ]},
    food:{questions:[
      {key:'food',text:'Finally. A date category that requires absolutely no explanation. We eat. We talk. We eat again. Beautiful. What are we eating?',options:[['pizza','🍕 Pizza / Casual','Safe. Reliable. Cheesy. Much like certain people I know.'],['italian','🍝 Italian','Fancy-ish. Romantic-ish. Potentially messy.'],['asian','🍜 Asian','Excellent. Let\'s get something you\'ve never tried.'],['indian','🍛 Indian','Comfort food. Approved.'],['different','🌮 Something Different','YES. Let\'s get weird.'],['dessert','🍰 Dessert','You skipped directly to the important part. Respect.'],['cafe','☕ Café','I knew we\'d end up here.'],['random','🎲 Surprise Me','Brave. Very brave.']]},
      {key:'vibe',text:'And what kind of food date are we having?',options:[['casual','🥰 Cute & Casual','No pressure. Just food and each other.'],['fancy','✨ Slightly Fancy','Okay. Someone\'s dressing up.'],['main','😋 Food Is The Main Event','Correct. No further questions.'],['dinner','❤️ Proper Dinner Date','Ah. Candles? Nice outfit? Someone\'s trying.']]},
      {key:'after',text:'Food can\'t be the entire quest. What happens after?',options:[['walk','🚶 Walk','Walk it off.'],['dessert','🍦 Dessert','One more round. I respect it.'],['movie','🎬 Movie','Something chill.'],['sunset','🌅 Sunset','Now we\'re making it romantic.'],['coffee','☕ Coffee','Because apparently one beverage wasn\'t enough.'],['talk','❤️ Just Sit & Talk','Honestly? Sometimes that\'s the best part.']]},
      {key:'budget',text:'And finally, what are we allowing Somda\'s wallet to survive?',options:'budget'}
    ]},
    cafe:{questions:[
      {key:'type',text:'CAFÉ? You two really do love these, don\'t you? Fine. I\'ll allow one more. What kind of café?',options:[['aesthetic','🌿 Aesthetic','Pretty place. Pretty pictures. Pretty couple.'],['sea','🌊 Sea View','Coffee with a view. Hard to complain.'],['quiet','📚 Quiet','Talk. Read. Sit close.'],['dessert','🍰 Dessert Café','You didn\'t come here for coffee. Don\'t lie.'],['coffee','☕ Coffee-Focused','Respect. Finally, someone actually wants coffee.'],['random','🎲 Surprise Me','I\'ll choose. And no complaining.']]},
      {key:'after',text:'And after café?',options:[['walk','🚶 Walk','Walk it off.'],['photos','📸 Photos','Camera time.'],['dinner','🍽️ Dinner','One meal wasn\'t enough. I understand.'],['sunset','🌅 Sunset','Ohhh. Now we\'re making it romantic.'],['explore','🛍️ Explore','Coffee first. Chaos later.'],['home','❤️ Go Home Happy','Simple. Sometimes that\'s enough.']]},
      {key:'budget',text:'One last thing. Budget?',options:'budget'}
    ]},
    make:{questions:[
      {key:'activity',text:'You want to MAKE something? Together? This could be adorable. Or catastrophically funny. Either outcome is acceptable. What are we making?',options:[['painting','🎨 Painting','Please don\'t fight over the colours.'],['pottery','🏺 Pottery','Hands covered in clay. This is either going to be cute or extremely messy.'],['baking','🧁 Baking','Excellent. Eat the evidence if it goes wrong.'],['diy','🎀 DIY / Craft','Cute. Make something you\'ll actually keep.'],['photo','📸 Photography','Back to pictures. You two are obsessed.'],['handmade','🌸 Something Handmade','Awww. That\'s going to mean more because you made it.'],['random','🎲 Surprise Me','I\'ll pick. Godspeed.']]},
      {key:'vibe',text:'And what kind of creative chaos are we bringing?',options:[['cute','🥰 Cute','Obviously.'],['chaotic','😂 Chaotic','YES. Now we\'re talking.'],['serious','🎨 Actually Try','Oh. We\'re taking this seriously. No pressure. Except there is absolutely pressure.']]},
      {key:'budget',text:'Final question before I hand you the glue gun. Budget?',options:'budget'}
    ]},
    shopping:{questions:[
      {key:'shop',text:'Shopping AND food? Dangerous. Very dangerous. Especially for one particular wallet. What are we shopping for?',options:[['clothes','👗 Clothes','Aaru chooses. Somda carries the bags. I don\'t make the rules.'],['gifts','🎁 Gifts','Aww. Secret little gifts?'],['couple','💍 Something Cute Together','Oh? Couple shopping. I approve.'],['browse','🛍️ Just Browse','The most dangerous words in shopping: “we\'re just browsing.”'],['random','🎲 Surprise Me','Let\'s see what catches your eye.']]},
      {key:'food',text:'And after spending all that money… we obviously need food. What are we eating?',options:[['casual','🍕 Casual','Simple. Easy.'],['cafe','☕ Café','Coffee and recovery.'],['dinner','🍽️ Dinner','Proper meal.'],['dessert','🍰 Dessert','You shopped. You deserve sugar.']]},
      {key:'after',text:'And once the bags are full and the food is gone?',options:[['walk','🚶 Walk','Walk around with your purchases like victorious little merchants.'],['movie','🎬 Movie','Sit down and recover.'],['photos','📸 Photos','Document the damage.'],['home','❤️ Head Home Happy','Simple ending.']]},
      {key:'budget',text:'Okay. Let\'s establish financial boundaries before this gets out of hand.',options:'budget'}
    ]},
    evening:{questions:[
      {key:'start',text:'Evening date? Excellent. Mumbai after sunset is basically free romance. How are we starting?',options:[['cafe','☕ Café','Soft start.'],['sunset','🌅 Sunset','Perfect timing.'],['shop','🛍️ Shopping','Of course.'],['movie','🎬 Movie','Classic.'],['walk','🚶 Walk','Simple.'],['dinner','🍽️ Dinner','Straight to the important part.']]},
      {key:'end',text:'And how are we ending the evening?',options:[['lights','🌃 City Lights','Very cinematic.'],['sea','🌊 Sea','Very romantic.'],['dessert','🍰 Dessert','Very necessary.'],['drive','🚗 Drive','Playlist better be ready.'],['quiet','❤️ Quiet Time Together','Awww. Just you two. I\'ll leave you alone. Eventually.']]},
      {key:'budget',text:'One little detail before I approve this: budget?',options:'budget'}
    ]},
    romantic:{questions:[
      {key:'setting',text:'Ohhhhh. ROMANTIC? Okay. I suddenly feel like I should put on some music. Let me guess: someone wants butterflies, maybe a little hand-holding, maybe a lot of staring. I\'ll stop before Somda gets ideas. Where are we setting this up?',options:[['sea','🌊 By the Sea','Soft. Pretty. Dangerous levels of hand-holding.'],['lights','🌃 City Lights','Very movie-like.'],['quiet','🌙 Quiet Evening','No distractions. Just you two. That\'s usually when things get dangerously romantic.'],['dinner','🕯️ Dinner','Okay. We\'re dressing up.'],['peaceful','🌳 Somewhere Peaceful','Sweet.'],['sunset','🌅 Sunset','Classic romance.'],['random','🎲 Surprise Me','You want me to decide the romance? This is a lot of responsibility.']]},
      {key:'level',text:'Now… how romantic are we actually being? Be honest. I can handle it. Probably.',options:[['sweet','🌸 Sweet','Aww. Cute. Little butterflies.'],['romantic','❤️ Romantic','Okay. We\'re committing. I like this.'],['very','💋 Very Romantic','…Oh. Someone\'s feeling brave tonight. Fine. I\'ll make the quest worthy of that choice.']]},
      {key:'special',text:'And because ordinary romance is apparently not enough, what little special thing are we adding?',options:[['letters','💌 Exchange Letters','A love letter? Oh, we\'re making future memories now.'],['gift','🎁 Small Gift','Little surprise? Very cute.'],['photos','📸 Couple Photos','Evidence of the romance.'],['flowers','🌹 Flowers','Classic.'],['dessert','🍰 Dessert','Romance requires sugar. It\'s science.'],['talk','🗣️ Just Talk','Honestly… sometimes that\'s the best one.'],['random','🎲 Cat Chooses','You really trust me with this? Interesting.']]},
      {key:'budget',text:'Last question. What are we telling Somda\'s wallet?',options:'budget'}
    ]}
  };

  const budgetOpts=[['low','💰 Under ₹1,000','Respectable. Cute date. Minimal financial damage.'],['mid','💰💰 ₹1,000–₹2,500','Okay. A little spending. Still survivable.'],['high','💰💰💰 ₹2,500+','…Somda? Are you sure? Blink twice if Aaru made you choose this.']];
  function optsFor(q){return q.options==='budget'?budgetOpts:q.options;}

  const selected={};
  let category='',step=0,lastQuest=null,typingTimer=null,typingDone=false,advanceFn=null;
  let openingIndex=0;
  const rand=a=>a[Math.floor(Math.random()*a.length)];
  const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function clearTyping(){if(typingTimer){clearInterval(typingTimer);typingTimer=null}}
  function hideAllPanels(){
    catThinking.hidden=true;catQuest.hidden=true;catActions.hidden=true;
    catThinking.style.display='none';catQuest.style.display='none';catActions.style.display='none';
  }
  function showPanel(el){el.hidden=false;el.style.display='';}
  function clearOptions(){catOptions.innerHTML='';}

  function setNext(label='NEXT ▶'){
    catOptions.innerHTML=`<button class="date-cat-next" id="dateCatNext" type="button">${label}</button>`;
    const btn=document.getElementById('dateCatNext');
    btn.onclick=()=>{
      if(!typingDone){finishTyping();return;}
      const fn=advanceFn;advanceFn=null;if(fn)fn();
    };
  }

  function finishTyping(){
    clearTyping();
    const el=catBubble.querySelector('.date-cat-typed');
    if(el)el.textContent=window.__dateCatTypingText||'';
    const cursor=catBubble.querySelector('.date-cat-cursor');if(cursor)cursor.remove();
    typingDone=true;
  }

  function typeLine(text){
    clearTyping();typingDone=false;window.__dateCatTypingText=String(text);
    catBubble.innerHTML='<span class="date-cat-typed"></span><span class="date-cat-cursor">▋</span>';
    const el=catBubble.querySelector('.date-cat-typed');
    const chars=Array.from(String(text));let i=0;
    typingTimer=setInterval(()=>{
      el.textContent+=chars[i++]||'';
      if(i>=chars.length){clearTyping();typingDone=true;const cursor=catBubble.querySelector('.date-cat-cursor');if(cursor)cursor.remove();}
    },24);
  }

  // One RPG dialogue line. NEXT is visible for the whole typing animation.
  function dialogue(text,onAdvance,nextLabel='NEXT ▶'){
    clearOptions();
    advanceFn=onAdvance||null;
    setNext(nextLabel);
    typeLine(text);
  }

  function open(){catModal.classList.add('open');catModal.setAttribute('aria-hidden','false');reset()}
  function close(){clearTyping();advanceFn=null;catModal.classList.remove('open');catModal.setAttribute('aria-hidden','true')}

  function reset(){
    clearTyping();advanceFn=null;category='';step=0;openingIndex=0;lastQuest=null;
    Object.keys(selected).forEach(k=>delete selected[k]);
    hideAllPanels();catSaved.textContent='';catSave.disabled=false;catSave.textContent='❤️ Save to Our Dates';
    catProgress.innerHTML='';catBubble.innerHTML='';clearOptions();renderOpening();
  }

  function renderProgress(total){catProgress.innerHTML=Array.from({length:Math.max(total,1)},(_,i)=>`<span class="date-cat-dot ${i<=step?'active':''}></span>`).join('')}

  function renderOpening(){
    renderProgress(5);
    const line=opening[openingIndex];
    dialogue(line,()=>{
      openingIndex++;
      if(openingIndex<opening.length)renderOpening();
      else renderStartOptions();
    });
  }

  function renderStartOptions(){
    clearOptions();advanceFn=null;
    catOptions.innerHTML=data.start.options.map(([id,label])=>`<button class="date-cat-option" type="button" data-value="${escapeHTML(id)}">${label}</button>`).join('');
    catOptions.querySelectorAll('button').forEach(b=>b.onclick=()=>chooseCategory(b.dataset.value));
  }

  function chooseCategory(id){
    category=id;Object.keys(selected).forEach(k=>delete selected[k]);step=0;lastQuest=null;catSaved.textContent='';catSave.disabled=false;catSave.textContent='❤️ Save to Our Dates';hideAllPanels();
    if(id==='surprise'){runSurprise();return;}
    renderQuestion();
  }

  function getQuestions(){
    const base=[...(data[category]?.questions||[])];
    base.push({key:'date',type:'date',text:'Okay, one last thing before I build your quest. When are we actually going on this date? Pick the day below. And yes, I need a real date this time. I am a planner, not a mind reader.'});
    return base;
  }

  function renderQuestion(){
    const qs=getQuestions();
    if(step>=qs.length){generate();return;}
    const q=qs[step];renderProgress(qs.length);
    hideAllPanels();

    if(q.type==='date'){
      // The date picker is revealed ONLY after the user advances past the cat's final line.
      dialogue(q.text,()=>showDatePicker());
      return;
    }

    dialogue(q.text,()=>{
      const opts=optsFor(q);
      clearOptions();
      catOptions.innerHTML=opts.map(([id,label])=>`<button class="date-cat-option" type="button" data-value="${escapeHTML(id)}">${label}</button>`).join('');
      catOptions.querySelectorAll('button').forEach(b=>b.onclick=()=>chooseAnswer(q,b.dataset.value));
    },'NEXT ▶');
  }

  function showDatePicker(){
    clearOptions();advanceFn=null;
    const today=new Date();
    const min=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    catOptions.innerHTML=`<div class="date-cat-calendar-wrap"><label for="dateCatDateInput">📅 PICK YOUR DATE</label><input type="date" id="dateCatDateInput" class="date-cat-date-input" min="${min}" value="${escapeHTML(selected.date||'')}"><button class="date-cat-option date-cat-date-submit" id="dateCatDateSubmit" type="button">SET DATE ▶</button></div>`;
    const input=document.getElementById('dateCatDateInput');
    const submit=document.getElementById('dateCatDateSubmit');
    submit.onclick=()=>{
      if(!input.value){input.focus();return;}
      selected.date=input.value;step=getQuestions().length;generate();
    };
    input.addEventListener('keydown',e=>{if(e.key==='Enter')submit.click()});
  }

  function chooseAnswer(q,val){
    selected[q.key]=val;
    const option=optsFor(q).find(x=>x[0]===val);
    step++;
    if(option){
      renderProgress(getQuestions().length);
      dialogue(option[2],()=>renderQuestion());
    }else renderQuestion();
  }

  function labelFor(key,val){
    const qs=getQuestions();
    for(const q of qs){const x=optsFor(q).find(o=>o[0]===val);if(x)return x[1].replace(/^\S+\s/,'')}
    return val;
  }

  function buildQuest(){
    const s=selected;const budgetMap={low:'Under ₹1,000',mid:'₹1,000–₹2,500',high:'₹2,500+'};
    const q={title:'A Date Quest',location:'Mumbai',activity:'Spend time together',duration:'2–3 hours',budget:budgetMap[s.budget]||'Flexible',romance:3,objectives:[],note:'',date:s.date||''};
    const catNames={nature:'Green Escape',afteroffice:'After Office Escape',mumbai:'Mumbai Little Adventure',photos:'Camera Roll Date',getaway:'Little Escape',fun:'Chaos & Fun Date',movie:'Movie & More',food:'Eat, Talk & Repeat',cafe:'Coffee & Conversations',make:'Make Something Together',shopping:'Shopping & Snacks',evening:'After-Dark Date',romantic:'A Little More Romance'};
    q.title=catNames[category]||q.title;
    const locMap={ghatkopar:'Ghatkopar',andheri:'Andheri',lowerparel:'Lower Parel',thane:'Thane',decide:'Your choice',bandra:'Bandra',marine:'Marine Drive',fort:'Fort',lower:'Lower Parel',panvel:'Panvel 😂',dombivli:'Dombivli 😂',new:'Somewhere New',cat:'Cat chooses',park:'Park / Garden',lake:'Lake / Waterfront',hills:'Hills / Viewpoint',forest:'Greenery',beach:'Beach'};
    q.location=locMap[s.meet]||locMap[s.area]||locMap[s.type]||locMap[s.setting]||'Mumbai';
    const acts=[];
    for(const [k,v] of Object.entries(s)){
      if(['budget','meet','area','type','walk','time','travel','level','duration','date'].includes(k))continue;
      const l=labelFor(k,v);if(l)acts.push(l);
    }
    q.activity=acts.slice(0,3).join(' → ')||'Spend time together';
    const durationMap={short:'1–2 hours',medium:'2–4 hours',long:'Until late',half:'Half Day',full:'Whole Day',overnight:'Overnight'};
    if(s.time)q.duration=durationMap[s.time]||q.duration;if(s.duration)q.duration=durationMap[s.duration]||q.duration;
    q.romance=category==='romantic'?5:(category==='evening'||category==='afteroffice'?4:(s.special?4:3));
    q.objectives=[q.activity,'Take at least one photo together','Put the phones away for a little while','Find one tiny moment you\'ll want to remember'];
    if(category==='fun')q.objectives=[q.activity,'Choose a winner','Let the loser choose dessert','Laugh at least once'];
    if(category==='romantic')q.objectives=[q.activity,'Do the special little thing you chose','Find a quiet moment together','Tell each other something you mean'];
    if(category==='afteroffice')q.objectives=[q.activity,'Leave office talk behind','Get one proper laugh out of the evening','Go home with a better day than you started with'];
    const notes=['Strong potential for hand-holding. Proceed carefully.','Date Cat approved. Please do not turn this into another café date.','Possible side effect: falling in love with each other again.','Mandatory: at least one moment where you both forget to check your phones.','Somda\'s wallet has been notified. It is pretending to be calm.','This one has excellent memory-making potential.','The cat has spoken. Now go make it cute.'];
    q.note=rand(notes);return q;
  }

  function surpriseSelections(){
    const cats=['nature','afteroffice','mumbai','photos','getaway','fun','movie','food','cafe','make','shopping','evening','romantic'];
    category=rand(cats);Object.keys(selected).forEach(k=>delete selected[k]);
    for(const q of data[category].questions){const opts=optsFor(q);selected[q.key]=rand(opts)[0]}
  }

  function runSurprise(){
    category='surprise';step=0;hideAllPanels();clearOptions();catProgress.innerHTML='';
    const lines=[
      'You want me to choose EVERYTHING?',
      'No budget? No category? No instructions?',
      'Aaru. Somda. You have made a terrible mistake.',
      'I love it.'
    ];
    let i=0;
    const next=()=>{
      if(i<lines.length){dialogue(lines[i++],next);return;}
      surpriseSelections();
      step=data[category].questions.length;
      // Surprise still gets the same final real-date question.
      renderQuestion();
    };
    next();
  }

  function generate(){
    // Clear the old date/question text so the generation screen can never sit under it.
    clearOptions();advanceFn=null;catBubble.innerHTML='';catProgress.innerHTML='';hideAllPanels();
    catThinking.hidden=false;catThinking.style.display='';
    catThinking.innerHTML='<span class="paw">🐾</span>Okay… give me a second.';
    window.setTimeout(()=>{
      lastQuest=buildQuest();
      catThinking.hidden=true;catThinking.style.display='none';
      showQuest();
    },550);
  }

  function formatQuestDate(v){if(!v)return 'Not set';const d=new Date(`${v}T00:00:00`);return Number.isNaN(d.getTime())?v:d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});}

  function showQuest(){
    const q=lastQuest;
    catThinking.hidden=true;catThinking.style.display='none';
    catQuest.innerHTML=`<div class="date-cat-quest-label">❤️ DATE QUEST</div><h3>${escapeHTML(q.title)}</h3><div class="date-cat-quest-grid"><div class="date-cat-stat"><small>📍 DESTINATION</small><span>${escapeHTML(q.location)}</span></div><div class="date-cat-stat"><small>📅 DATE</small><span>${escapeHTML(formatQuestDate(q.date))}</span></div><div class="date-cat-stat"><small>⏱️ TIME</small><span>${escapeHTML(q.duration)}</span></div><div class="date-cat-stat"><small>💰 ESTIMATED BUDGET</small><span>${escapeHTML(q.budget)}</span></div><div class="date-cat-stat"><small>💕 ROMANCE</small><span>${'❤️'.repeat(q.romance)}${'♡'.repeat(5-q.romance)}</span></div></div><div class="date-cat-objectives"><strong>🎯 QUEST OBJECTIVES</strong><ol>${q.objectives.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol></div><div class="date-cat-note">${escapeHTML(q.note)}</div>`;
    showPanel(catQuest);showPanel(catActions);catSaved.textContent='';catSave.disabled=false;catSave.textContent='❤️ Save to Our Dates';
    // Final RPG line appears above the quest, not over the loading state.
    dialogue('Look. I actually did a good job. Don\'t get used to it.',null,'DONE ▶');
    // Keep the final quest visible while the line is being typed.
    showPanel(catQuest);showPanel(catActions);
  }

  async function saveQuest(){
    if(!lastQuest)return;
    catSave.disabled=true;
    catSave.textContent='❤️ Saving…';
    try{
      const payload={
        title:lastQuest.title,
        location:lastQuest.location,
        activity:lastQuest.activity,
        duration:lastQuest.duration,
        budget:lastQuest.budget,
        romance:lastQuest.romance,
        objectives:lastQuest.objectives,
        note:lastQuest.note,
        date:lastQuest.date,
        status:'planned'
      };
      const r=await fetch(PLANNED_QUESTS_API,{method:'POST',headers:dateCatHeaders({'Prefer':'return=representation'}),body:JSON.stringify(payload)});
      if(!r.ok)throw new Error(await r.text());
      catSaved.textContent='❤️ Added to Our Dates. Both of you can see this planned date now.';
      catSave.textContent='❤️ Saved';
    }catch(err){
      console.error('Date Cat save failed:',err);
      catSaved.textContent='Could not save this planned date. Please check the planned-date table setup in Supabase.';
      catSave.disabled=false;
      catSave.textContent='❤️ Save to Our Dates';
    }
  }

  catHotspot.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof hotspots!=='undefined')hotspots.forEach(x=>x.classList.remove('active'));open()});
  catClose.addEventListener('click',close);catBackdrop?.addEventListener('click',close);
  catAnother.addEventListener('click',()=>reset());
  catChangeTop?.addEventListener('click',()=>{catActions.hidden=true;catActions.style.display='none';catQuest.hidden=true;catQuest.style.display='none';step=0;renderQuestion()});
  catSave.addEventListener('click',saveQuest);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&catModal.classList.contains('open'))close()});
})();
