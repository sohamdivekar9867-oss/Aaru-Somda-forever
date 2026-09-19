const hotspots = document.querySelectorAll(".hotspot");

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
// DATE CAT — CHEEKY DATE PLANNER
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
  const catChange=document.getElementById('dateCatChange');
  const catChangeButton=document.getElementById('dateCatChangeButton');
  if(!catHotspot||!catModal)return;

  const scripts={
    start:{text:'Ohhh. Look who\'s here.\n\nPlanning another date, are we? I should\'ve known. You two have a suspicious habit of turning completely normal days into dates.\n\nFortunately for you, I\'m professionally trained in this.\n\nWell… professionally trained according to absolutely nobody.\n\nAnyway. Tell me what kind of trouble we\'re getting into today.',options:[['sunset','🌅 Sunset Date'],['nature','🌳 Nature Date'],['mumbai','🏙️ Explore Mumbai'],['photos','📸 Photo Date'],['getaway','🚗 Mini Getaway'],['fun','🎢 Fun & Activities'],['movie','🎬 Movie / Show'],['food','🍽️ Food Date'],['cafe','☕ Café Date'],['make','🎨 Make Something Together'],['shopping','🛍️ Shopping + Food'],['evening','🌙 Evening Date'],['romantic','❤️ Romantic Date'],['surprise','🎲 Surprise Us']]},
    sunset:[['distance','First things first. Where are we taking this little sunset romance?'],['setting','Okay. Now tell me what kind of pretty we\'re looking for.'],['after','But listen… a sunset is only half the date. We need a proper second act.'],['budget','And now… the part Somda has been hoping I wouldn\'t ask. How much are we sacrificing to the Date Gods?']],
    nature:[['type','Nature? Wow. I didn\'t know you two were capable of leaving civilisation voluntarily. I\'m impressed. So… what kind of nature are we talking?'],['walk','How much walking are we making these poor legs do?'],['add','And what are we adding to make this an actual date?'],['budget','Finally, the important question. How much are we spending on our wholesome little escape?']],
    mumbai:[['area','Now THIS is interesting. You don\'t necessarily need a plan. You just need somewhere to start. So where are we sending you two?'],['activity','Okay, destination selected. What are we actually doing once we get there?'],['duration','And how long are we letting Mumbai keep you?'],['budget','One final thing. How much chaos can Somda\'s wallet tolerate?']],
    photos:[['style','PHOTO DATE? Ohhh. Someone wants a new camera-roll dump. I support this. What kind of pictures are we hunting?'],['who','And who is taking these masterpieces?'],['add','Good. But we\'re not spending the entire date taking 47 versions of the same selfie. What else are we doing?'],['budget','And what is the damage limit?']],
    getaway:[['type','WAIT. You\'re escaping Mumbai? This got serious very quickly. Okay, little travellers. What kind of escape are we planning?'],['time','How long are we disappearing for?'],['travel','And how are we getting there?'],['budget','Last question before I start packing imaginary bags. What\'s the budget?']],
    fun:[['activity','Ahhh. So sitting quietly isn\'t enough today. You want CHAOS. What are we doing?'],['after','Excellent. And what happens after you inevitably get competitive?'],['budget','Before you challenge each other to financial ruin, what\'s the budget?']],
    movie:[['type','Classic date. Lights down. Snacks ready. And someone inevitably says “I\'m not sleepy” before falling asleep. What are we watching?'],['before','And what are we doing before or after?'],['budget','Important question: how much are we spending on popcorn and romance?']],
    food:[['type','Finally. A date category that requires absolutely no explanation. We eat. We talk. We eat again. Beautiful. What are we eating?'],['vibe','And what kind of food date is this?'],['after','One final ingredient: what happens after we\'ve eaten ourselves happy?'],['budget','Now tell me what we\'re doing to Somda\'s wallet.']],
    cafe:[['type','CAFÉ? You two really do love these, don\'t you? Fine. I\'ll allow one more. What kind?'],['after','Coffee acquired. What happens next?'],['budget','And what level of financial damage are we accepting?']],
    make:[['activity','You want to MAKE something? Together? This could be adorable. Or catastrophically funny. Either outcome is acceptable. What are we making?'],['vibe','How seriously are we taking this?'],['after','And what are we doing after the creative disaster… I mean masterpiece?'],['budget','How much are we willing to spend on becoming artists?']],
    shopping:[['shop','Shopping AND food? Dangerous. Very dangerous. Especially for one particular wallet. What are we shopping for?'],['food','And after spending all that money… we obviously need food. What are we eating?'],['after','And once the bags are full and the food is gone?'],['budget','Okay. Let\'s establish financial boundaries before this gets out of hand.']],
    evening:[['start','Evening date? Excellent. Mumbai after sunset is basically free romance. How are we starting?'],['end','And how are we ending the evening?'],['budget','One little detail before I approve this: budget?']],
    romantic:[['setting','Ohhhhh. ROMANTIC? Okay. I suddenly feel like I should put on some music. Let me guess: someone wants butterflies, maybe a little hand-holding, maybe a lot of staring. I\'ll stop before Somda gets ideas. Where are we setting this up?'],['level','Now… how romantic are we actually being? Be honest. I can handle it. Probably.'],['special','And because ordinary romance is apparently not enough, what little special thing are we adding?'],['budget','Last question. What are we telling Somda\'s wallet?']],
    surprise:[['done','You want me to choose EVERYTHING? No budget? No category? No instructions?\n\nAaru. Somda. You have made a terrible mistake.\n\nI love it.']]
  };

  const options={
    distance:[['near','🚶 Nearby','Keeping it close? Cute. Less travel, more actual date. And fewer opportunities for Somda to complain about Mumbai traffic.'],['mumbai','🚆 Anywhere in Mumbai','Ah. So we\'re letting the entire city compete for the honour. Fair.'],['outside','🚗 Let\'s go outside Mumbai','WAIT. We\'re leaving Mumbai? This isn\'t a date anymore. This is a field trip. I approve.']],
    setting:[['water','🌊 Waterfront','Obviously. Water, sunset, two people in love… I\'m already emotionally invested.'],['green','🌳 Greenery','Nature? Look at you two. Who are you and what have you done with the café couple?'],['city','🏙️ City View','Ahhh. City lights. Sunset. Aaru looking pretty. Somda pretending he isn\'t staring.'],['pretty','🌅 Just Somewhere Pretty','Excellent. No overthinking. Just find somewhere pretty and bring the girlfriend.']],
    after:[['dinner','🍽️ Dinner','Correct. Sunset followed by food. Humanity\'s greatest invention.'],['dessert','🍦 Dessert','Dessert? Now you\'re speaking my language. Sharing is mandatory, by the way.'],['walk','🚶 Walk & Talk','Aww. Walking around with nowhere to be. Dangerously wholesome.'],['photos','📸 Photos','Obviously. We need evidence. Otherwise did the date even happen?'],['talk','🌙 Sit Somewhere & Talk','Oh. The dangerous option. Two people sitting together with nothing to distract them. Someone might accidentally say something romantic.']],
    budget:[['low','💰 Under ₹1,000','Respectable. Cute date. Minimal financial damage.'],['mid','💰💰 ₹1,000–₹2,500','Okay. A little spending. Still survivable.'],['high','💰💰💰 ₹2,500+','…Somda? Are you sure? Blink twice if Aaru made you choose this.']],
    type:[['park','🌿 Park / Garden','Classic. Walk. Talk. Sit together. Pretend you weren\'t going to spend half the time looking at each other.'],['lake','🌊 Lake / Waterfront','Pretty. Peaceful. Excellent place for unnecessarily romantic conversations.'],['hills','🏞️ Hills / Viewpoint','Okay, adventurous. Someone has decided the date needs a view.'],['forest','🌳 Forest / Greenery','Very peaceful. Very cute. Potentially terrible for phone battery.'],['sunset','🌅 Nature + Sunset','Oh, we\'re combining things. Ambitious. I like it.'],['food','🍽️ Food Destination','You travelled outside Mumbai… for food. Honestly? Valid.'],['beach','🏖️ Beach','Sand. Sea. Sun. And probably someone complaining about the sand later.']],
    walk:[['sit','🪑 Mostly Sitting','Ah. So we\'re technically doing nature. But from a chair.'],['some','🚶 Some Walking','Perfect. Enough walking to feel productive. Not enough to regret your life choices.'],['explore','🥾 Let\'s Actually Explore','OH. We\'re serious. Okay, shoes on. No complaining halfway through.']],
    add:[['cafe','☕ Café','Nature… followed by coffee. You two really cannot escape cafés.'],['food','🍽️ Food','Excellent. Walking creates hunger. I have studied this extensively.'],['photos','📸 Photos','Pretty place. Pretty people. Easy.'],['dessert','🍦 Dessert','Dessert after nature. You know what? I\'m starting to like your decision-making.'],['picnic','🧺 Picnic','PICNIC? Okay, this is adorable. Someone is getting extra romance points.'],['us','❤️ Just Us','Aww. No activity. No distraction. Just you two. Disgustingly cute.']],
    area:[['bandra','🌊 Bandra','Walks, food, sea, cafés… very date-friendly.'],['south','🌆 South Mumbai','Classic. Fancy buildings. Pretty streets. And approximately seventeen places where you can accidentally spend ₹800 on coffee.'],['fort','🎨 Kala Ghoda / Fort','Ooooh. Culture. Architecture. Good photographs. Let\'s pretend we\'re sophisticated.'],['juhu','🌴 Juhu','Beach? Food? Crowds? Classic Mumbai chaos.'],['lower','🛍️ Lower Parel','Shopping malls. Restaurants. Entertainment. Somda\'s wallet has entered the chat.'],['new','🏙️ Somewhere New','YES. No repeating the same old places. Let\'s give Mumbai a chance to surprise you.'],['random','🎲 Cat Chooses','Excellent. You have officially surrendered control. I love this.']],
    activity:[['walk','🚶 Walk Around','Simple. No schedule. Just wander. Very main-character.'],['photos','📸 Take Photos','Camera ready. I expect at least one ridiculously cute picture.'],['food','🍽️ Find Food','Of course. I knew food would enter the conversation eventually.'],['cafe','☕ Café Hop','Again? Really? You two have a serious café addiction.'],['shop','🛍️ Shop','Shopping. Okay. I\'ll alert Somda\'s bank account.'],['interesting','🎭 Find Something Interesting','Now that\'s my favourite option. No idea what we\'ll find. Let\'s find out.'],['mix','🎲 A Bit of Everything','Ah. The chaos option. My favourite.']],
    duration:[['short','⏰ 2–3 Hours','A little escape.'],['half','🌤️ Half Day','Enough time to actually make a memory.'],['full','🌅 Whole Day','Okay. We\'re making a proper day of it.']],
    style:[['city','🌆 City Photos','City aesthetic. Very cinematic. Try not to look like you\'re posing.'],['sea','🌊 Sunset / Sea','Easy. Good lighting. Romantic background. Aaru does the pretty part. Somda just needs to show up.'],['nature','🌿 Nature','Pretty greenery. Pretty people. Easy.'],['architecture','🏛️ Pretty Architecture','Fancy. Let\'s make you two look like you\'re in a movie.'],['couple','❤️ Couple Photos','Oh? We\'re committing. I respect it.'],['candid','📸 Random Candid Photos','Excellent. No posing. No “wait, let me fix my hair.” Just catch the actual moments.']],
    who:[['turns','📱 Take Turns','Fair. Equal opportunity embarrassment.'],['selfies','🤳 Mostly Selfies','Classic. Foreheads touching. Cheeks together. You know the drill.'],['better','😂 Whoever Takes Better Photos','Ohhh. Competition. I like this.'],['none','🎲 No Plan','Perfect. Let the camera do its thing.']],
    getawayType:[['beach','🏖️ Beach','Sand. Sea. Sun. And probably someone complaining about the sand later.'],['hills','🏞️ Hills','Fresh air. Views. And at least one “wow, look at that” moment.'],['nature','🌳 Nature','Very wholesome. I\'m suspicious.'],['drive','🌅 Scenic Drive','Music. Road. Good company. Very dangerous combination for catching feelings.'],['food','🍽️ Food Destination','You travelled outside Mumbai… for food. Honestly? Valid.']],
    time:[['half','🌅 Half Day','Little escape. Back home before it becomes a full expedition.'],['full','🌄 Full Day','Okay. Proper date.'],['overnight','🧳 Overnight','Oh? We\'re really committing to the storyline. Alright.']],
    travel:[['train','🚆 Train','Classic. A little chaos. A little sharing snacks. Very Mumbai.'],['car','🚗 Car','Road trip mode. Playlist better be good.'],['bus','🚌 Bus','Respect. Maximum opportunity for sleeping on each other\'s shoulders.'],['any','🎲 Whatever Works','Excellent. You just want to get there.']],
    funActivity:[['bowling','🎳 Bowling','Are we here to bowl… or discover who gets unbearably competitive?'],['arcade','🎮 Arcade / Gaming','Winner gets bragging rights. Loser buys dessert.'],['skating','⛸️ Skating','Potential for grace. Potential for disaster. Either way, entertaining.'],['escape','🧩 Escape Room','You two are going to solve puzzles together. Or blame each other. Probably both.'],['karaoke','🎤 Karaoke','You want me to help you willingly embarrass yourselves? Absolutely.'],['workshop','🎨 Workshop','Cute. You get to make something together.'],['competitive','🎯 Something Competitive','OH. May the better partner win.']],
    before:[['dinner','🍽️ Dinner','Dinner before the movie. Very responsible.'],['snacks','🍿 Snacks Only','Correct. Snacks are not optional.'],['cafe','☕ Café','Classic.'],['dessert','🍦 Dessert','Good.'],['walk','🚶 Walk','A little post-movie walk.'],['romance','❤️ Something Romantic','Oh? So we\'re adding romance to the classic. Noted.']],
    foodType:[['pizza','🍕 Pizza / Casual','Safe. Reliable. Cheesy. Much like certain people I know.'],['italian','🍝 Italian','Fancy-ish. Romantic-ish. Potentially messy.'],['asian','🍜 Asian','Excellent. Let\'s get something you\'ve never tried.'],['indian','🍛 Indian','Comfort food. Approved.'],['different','🌮 Something Different','YES. Let\'s get weird.'],['dessert','🍰 Dessert','You skipped directly to the important part. Respect.'],['cafe','☕ Café','I knew we\'d end up here.'],['random','🎲 Surprise Me','Brave. Very brave.']],
    vibe:[['casual','🥰 Cute & Casual','No pressure. Just food and each other.'],['fancy','✨ Slightly Fancy','Okay. Someone\'s dressing up.'],['food','😋 Food Is The Main Event','Correct. No further questions.'],['dinner','❤️ Proper Dinner Date','Ah. Candles? Nice outfit? Someone\'s trying.']],
    shop:[['clothes','👗 Clothes','Aaru chooses. Somda carries the bags. I don\'t make the rules.'],['gifts','🎁 Gifts','Aww. Secret little gifts?'],['cute','💍 Something Cute Together','Oh? Couple shopping. I approve.'],['browse','🛍️ Just Browse','The most dangerous words in shopping: “we\'re just browsing.”'],['random','🎲 Surprise Me','Let\'s see what catches your eye.']],
    start:[['cafe','☕ Café','Soft start.'],['sunset','🌅 Sunset','Perfect timing.'],['shop','🛍️ Shopping','Of course.'],['movie','🎬 Movie','Classic.'],['walk','🚶 Walk','Simple.'],['dinner','🍽️ Dinner','Straight to the important part.']],
    end:[['lights','🌃 City Lights','Very cinematic.'],['sea','🌊 Sea','Very romantic.'],['dessert','🍰 Dessert','Very necessary.'],['drive','🚗 Drive','Playlist better be ready.'],['quiet','❤️ Quiet Time Together','Awww. Just you two. I\'ll leave you alone. Eventually.']],
    level:[['sweet','🌸 Sweet','Aww. Cute. Little butterflies.'],['romantic','❤️ Romantic','Okay. We\'re committing. I like this.'],['very','💋 Very Romantic','…Oh. Someone\'s feeling brave tonight. Fine. I\'ll make the quest worthy of that choice.']],
    special:[['letters','💌 Exchange Letters','A love letter? Oh, we\'re making future memories now.'],['gift','🎁 Small Gift','Little surprise? Very cute.'],['photos','📸 Couple Photos','Evidence of the romance.'],['flowers','🌹 Flowers','Classic.'],['dessert','🍰 Dessert','Romance requires sugar. It\'s science.'],['talk','🗣️ Just Talk','Honestly… sometimes that\'s the best one.'],['random','🎲 Cat Chooses','You really trust me with this? Interesting.']],
    funAfter:[['food','🍽️ Food','Obviously.'],['dessert','🍦 Dessert','Winner gets dessert. Loser also gets dessert. Everyone wins.'],['cafe','☕ Café','Time to recover.'],['movie','🎬 Movie','Something peaceful after all that chaos.'],['walk','🚶 Walk','Cool down.'],['winner','😏 Winner Decides','Ohhhh. That\'s dangerous. I like it.']],
    photoAdd:[['cafe','☕ Café','A little coffee break.'],['food','🍽️ Food','Photos require fuel.'],['sunset','🌅 Sunset','Good light. Good choice.'],['walk','🚶 Walk','Keep wandering.'],['shop','🛍️ Explore / Shop','A little browsing never hurt anyone.'],['none','❤️ Just Us','Put the phone away for a bit.']],
    makeVibe:[['cute','🥰 Cute','Obviously.'],['chaotic','😂 Chaotic','YES. Now we\'re talking.'],['serious','🎨 Actually Try','Oh. We\'re taking this seriously. No pressure. Except there is absolutely pressure.']],
    makeAfter:[['food','🍽️ Food','Creative people need snacks.'],['dessert','🍰 Dessert','Reward yourselves.'],['walk','🚶 Walk','Let the masterpiece dry.'],['photos','📸 Photos','Document the questionable result.'],['cafe','☕ Café','Classic recovery plan.']],
    shopFood:[['casual','🍕 Casual','Quick, easy, delicious.'],['cafe','☕ Café','Shopping deserves coffee.'],['dinner','🍽️ Dinner','Proper meal after proper shopping.'],['dessert','🍰 Dessert','Straight to happiness.']],
    shopAfter:[['walk','🚶 Walk','Walk off the food.'],['movie','🎬 Movie','Shopping, food, movie. Full package.'],['cafe','☕ Café','You two are predictable.'],['home','❤️ Go Home Happy','Simple. Sometimes that\'s enough.']],
    budgetShop:[['low','💰 Keep It Under ₹1,500','Financially responsible. Who are you?'],['mid','💰💰 ₹1,500–₹3,000','Okay. Comfortable.'],['high','💰💰💰 ₹3,000+','I\'m calling Somda\'s accountant.']],
    genericAfter:[['food','🍽️ Food','A date without food feels suspicious.'],['cafe','☕ Café','Of course.'],['dessert','🍰 Dessert','Correct.'],['walk','🚶 Walk','A little walk.'],['romance','❤️ Something Romantic','Oh? I see where this is going.']]
  };

  const questions={
    sunset:[['distance',options.distance],['setting',options.setting],['after',options.after],['budget',options.budget]],
    nature:[['type',[...options.type.filter(x=>['park','lake','hills','forest','sunset'].includes(x[0]))]],['walk',options.walk],['add',options.add],['budget',options.budget]],
    mumbai:[['area',options.area],['activity',options.activity],['duration',options.duration],['budget',options.budget]],
    photos:[['style',options.style],['who',options.who],['add',options.photoAdd],['budget',options.budget]],
    getaway:[['type',options.getawayType],['time',options.time],['travel',options.travel],['budget',options.budget]],
    fun:[['activity',options.funActivity],['after',options.funAfter],['budget',options.budget]],
    movie:[['type',[['movie','🎬 Movie','Easy.'],['theatre','🎭 Theatre / Play','Fancy. Someone dressed up, didn\'t they?'],['live','🎤 Live Event','Okay. Now we\'re making an evening of it.'],['concert','🎶 Concert','Music. Crowd. Two people singing completely different lyrics. Beautiful.'],['random','🎲 Surprise Me','I\'ll choose. Don\'t blame me if it\'s weird.']]],['before',options.before],['budget',options.budget]],
    food:[['type',options.foodType],['vibe',options.vibe],['after',options.genericAfter],['budget',options.budget]],
    cafe:[['type',[['aesthetic','🌿 Aesthetic','Pretty place. Pretty pictures. Pretty couple.'],['sea','🌊 Sea View','Coffee with a view. Hard to complain.'],['quiet','📚 Quiet','Talk. Read. Sit close.'],['dessert','🍰 Dessert Café','You didn\'t come here for coffee. Don\'t lie.'],['coffee','☕ Coffee-Focused','Respect. Finally, someone actually wants coffee.'],['random','🎲 Surprise Me','I\'ll choose. And no complaining.']]],['after',options.genericAfter],['budget',options.budget]],
    make:[['activity',[['painting','🎨 Painting','Please don\'t fight over the colours.'],['pottery','🏺 Pottery','Hands covered in clay. Cute or extremely messy.'],['baking','🧁 Baking','Eat the evidence if it goes wrong.'],['diy','🎀 DIY / Craft','Cute. Make something you\'ll actually keep.'],['photo','📸 Photography','Back to pictures. You two are obsessed.'],['handmade','🌸 Something Handmade','Awww. That\'s going to mean more because you made it.'],['random','🎲 Surprise Me','I\'ll pick. Godspeed.']]],['vibe',options.makeVibe],['after',options.makeAfter],['budget',options.budget]],
    shopping:[['shop',options.shop],['food',options.shopFood],['after',options.shopAfter],['budget',options.budgetShop]],
    evening:[['start',options.start],['end',options.end],['budget',options.budget]],
    romantic:[['setting',[['sunset','🌅 Sunset','Classic romance.'],['sea','🌊 By the Sea','Soft. Pretty. Dangerous levels of hand-holding.'],['lights','🌃 City Lights','Very movie-like.'],['quiet','🌙 Quiet Evening','No distractions. Just you two. That\'s usually when things get dangerously romantic.'],['dinner','🕯️ Dinner','Okay. We\'re dressing up.'],['peaceful','🌳 Somewhere Peaceful','Sweet.'],['random','🎲 Surprise Me','You want me to decide the romance? This is a lot of responsibility.']]],['level',options.level],['special',options.special],['budget',options.budget]]
  };

  const selected={};let category='';let step=0;let lastQuest=null;
  const catData=[...scripts.start.options];
  const rand=a=>a[Math.floor(Math.random()*a.length)];
  const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function say(text){catBubble.innerHTML=escapeHTML(text).replace(/\n/g,'<br>')}
  function open(){catModal.classList.add('open');catModal.setAttribute('aria-hidden','false');reset()}
  function close(){catModal.classList.remove('open');catModal.setAttribute('aria-hidden','true')}
  function reset(){category='';step=0;Object.keys(selected).forEach(k=>delete selected[k]);lastQuest=null;catThinking.hidden=true;catQuest.hidden=true;catActions.hidden=true;catChange.hidden=true;catSaved.textContent='';renderStart()}
  function renderProgress(total){catProgress.innerHTML=Array.from({length:Math.max(total,1)},(_,i)=>`<span class="date-cat-dot ${i<=step?'active':''}"></span>`).join('')}
  function renderStart(){say(scripts.start.text);catOptions.innerHTML=catData.map(([id,label])=>`<button class="date-cat-option" data-value="${id}">${label}</button>`).join('');renderProgress(1);catOptions.querySelectorAll('button').forEach(b=>b.onclick=()=>chooseCategory(b.dataset.value))}
  function chooseCategory(id){category=id;if(id==='surprise'){runSurprise();return}step=0;renderQuestion()}
  function renderQuestion(){const qs=questions[category]||[];if(step>=qs.length){generate();return}const [key,opts]=qs[step];const intro=(scripts[category]?.find?.(()=>false))||null;let text='';const map={sunset:scripts.sunset,nature:scripts.nature,mumbai:scripts.mumbai,photos:scripts.photos,getaway:scripts.getaway,fun:scripts.fun,movie:scripts.movie,food:scripts.food,cafe:scripts.cafe,make:scripts.make,shopping:scripts.shopping,evening:scripts.evening,romantic:scripts.romantic};const line=map[category]?.[step];if(line)text=line[1];else text=`Okay. Next question.`;say(text);catOptions.innerHTML=opts.map(([id,label])=>`<button class="date-cat-option" data-value="${escapeHTML(id)}">${label}</button>`).join('');renderProgress(qs.length);catOptions.querySelectorAll('button').forEach(b=>b.onclick=()=>chooseAnswer(key,b.dataset.value))}
  function chooseAnswer(key,val){selected[key]=val;const qs=questions[category];const current=qs.find(q=>q[0]===key);const option=current?.[1]?.find(x=>x[0]===val);if(option){say(option[2])}step++;setTimeout(renderQuestion,260)}
  function labelFor(key,val){const qs=questions[category]||[];for(const [,opts] of qs){const x=opts.find(o=>o[0]===val);if(x)return x[1].replace(/^\S+\s/,'')}return val}
  function buildQuest(){
    const s=selected;
    const budget=s.budget||'mid';
    const budgets={low:'Under ₹1,000',mid:'₹1,000–₹2,500',high:'₹2,500+',low2:'Keep it under ₹1,500'};
    const q={title:'',location:'',activity:'',duration:'2–3 hours',budget:budgets[budget]||labelFor('budget',budget),romance:3,objectives:[],note:''};
    const catNames={sunset:'Sunset & Sea',nature:'Green Escape',mumbai:'Mumbai Little Adventure',photos:'Camera Roll Date',getaway:'Little Escape',fun:'Chaos & Fun Date',movie:'Movie & More',food:'Eat, Talk, Repeat',cafe:'Coffee & Conversations',make:'Make Something Together',shopping:'Shopping & Snacks',evening:'After-Dark Date',romantic:'A Little More Romance'};
    q.title=catNames[category]||'A Date Quest';
    const locMap={near:'Nearby',mumbai:'Anywhere in Mumbai',outside:'Outside Mumbai',water:'Waterfront',green:'Greenery',city:'City View',pretty:'Somewhere Pretty',bandra:'Bandra',south:'South Mumbai',fort:'Kala Ghoda / Fort',juhu:'Juhu',lower:'Lower Parel',new:'Somewhere New',beach:'Beach',hills:'Hills / Viewpoint',park:'Park / Garden',lake:'Lake / Waterfront',forest:'Greenery'};
    q.location=locMap[s.area]||locMap[s.setting]||locMap[s.distance]||locMap[s.type]||'Mumbai';
    const acts=[];for(const [k,v] of Object.entries(s)){if(['budget','distance','setting','area','type','walk','time','travel','level'].includes(k))continue;acts.push(labelFor(k,v))}q.activity=acts.filter(Boolean).slice(0,3).join(' → ')||'Spend time together';
    if(s.duration==='half'||s.time==='half'||s.duration==='full')q.duration=s.duration==='full'?'Whole Day':(s.duration==='half'?'Half Day':'Half Day');if(s.time==='full')q.duration='Whole Day';if(s.time==='overnight')q.duration='Overnight';
    q.romance=category==='romantic'?5:(category==='sunset'||category==='evening'?4:(s.special?4:3));
    q.objectives=[q.activity||'Enjoy the date',`Take at least one photo together`,`Put the phones away for a little while`,`Find one tiny moment you\'ll want to remember`];
    if(category==='food'||category==='cafe')q.objectives=[q.activity,'Try something worth talking about','Take a post-food walk','Save one tiny memory'];
    if(category==='fun')q.objectives=[q.activity,'Choose a winner','Let the loser choose dessert','Laugh at least once'];
    if(category==='romantic')q.objectives=[q.activity,'Do the special little thing you chose','Find a quiet moment together','Tell each other something you mean'];
    const notes=[
      'Strong potential for hand-holding. Proceed carefully.',
      'Date Cat approved. Please do not turn this into another café date.',
      'Possible side effect: falling in love with each other again.',
      'Mandatory: at least one moment where you both forget to check your phones.',
      'Somda\'s wallet has been notified. It is pretending to be calm.',
      'This one has excellent memory-making potential.',
      'The cat has spoken. Now go make it cute.'
    ];q.note=rand(notes);return q;
  }
  function runSurprise(){category='surprise';catOptions.innerHTML='';catProgress.innerHTML='';say('You want me to choose EVERYTHING? No budget? No category? No instructions?<br><br>Aaru. Somda. You have made a terrible mistake.<br><br>I love it.');catThinking.hidden=false;catThinking.innerHTML='<span class="paw">🐾</span>“I have absolutely no idea what I\'m doing.”<br><br>“Just kidding.”<br>“Mostly.”';setTimeout(()=>{const cats=['sunset','nature','mumbai','photos','fun','food','cafe','evening','romantic'];category=rand(cats);const qs=questions[category];Object.keys(selected).forEach(k=>delete selected[k]);qs.forEach(([key,opts])=>selected[key]=rand(opts)[0]);catThinking.innerHTML='<span class="paw">🐾</span>Checking the date possibilities…<br>Looking for somewhere interesting…<br>Calculating romance levels…<br>Checking Somda\'s wallet…<br><br><strong>Found something.</strong>';setTimeout(generate,1500)},1100)}
  function generate(){catOptions.innerHTML='';catThinking.hidden=false;catThinking.innerHTML='<span class="paw">🐾</span>Checking the date possibilities…<br>Looking for somewhere interesting…<br>Calculating romance levels…<br>Checking Somda\'s wallet…';catQuest.hidden=true;catActions.hidden=true;catChange.hidden=true;setTimeout(()=>{lastQuest=buildQuest();catThinking.innerHTML='<span class="paw">🐾</span>“Okay…”<br><br>“I\'ve considered your answers.”<br>“I\'ve considered your questionable decision-making.”<br><br><strong>“I THINK I\'VE GOT IT.”</strong>';setTimeout(showQuest,700)},1000)}
  function showQuest(){const q=lastQuest;say('Look. I actually did a good job.<br><br>Don\'t get used to it.');catThinking.hidden=true;catQuest.hidden=false;catQuest.innerHTML=`<div class="date-cat-quest-label">❤️ DATE QUEST</div><h3>${escapeHTML(q.title)}</h3><div class="date-cat-quest-grid"><div class="date-cat-stat"><small>📍 DESTINATION</small><span>${escapeHTML(q.location)}</span></div><div class="date-cat-stat"><small>⏱️ TIME</small><span>${escapeHTML(q.duration)}</span></div><div class="date-cat-stat"><small>💰 ESTIMATED BUDGET</small><span>${escapeHTML(q.budget)}</span></div><div class="date-cat-stat"><small>💕 ROMANCE</small><span>${'❤️'.repeat(q.romance)}${'♡'.repeat(5-q.romance)}</span></div></div><div class="date-cat-objectives"><strong>🎯 QUEST OBJECTIVES</strong><ol>${q.objectives.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol></div><div class="date-cat-note">${escapeHTML(q.note)}</div></div>`;catActions.hidden=false;catChange.hidden=false;catSaved.textContent=''}
  function saveQuest(){if(!lastQuest)return;const item={...lastQuest,id:'quest-'+Date.now(),createdAt:new Date().toISOString(),status:'planned'};const existing=JSON.parse(localStorage.getItem('aaruSomdaPlannedDates')||'[]');existing.unshift(item);localStorage.setItem('aaruSomdaPlannedDates',JSON.stringify(existing.slice(0,20)));catSaved.textContent='❤️ Added to your planned dates. It will appear in Our Dates.';catSave.textContent='❤️ Saved';catSave.disabled=true}
  catHotspot.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();hotspots.forEach(x=>x.classList.remove('active'));open()});
  catClose.addEventListener('click',close);catBackdrop.addEventListener('click',close);catAnother.addEventListener('click',()=>{catSave.disabled=false;catSave.textContent='❤️ Save to Our Dates';reset()});catSave.addEventListener('click',saveQuest);catChangeButton.addEventListener('click',()=>{catSave.disabled=false;catSave.textContent='❤️ Save to Our Dates';catActions.hidden=true;catChange.hidden=true;catQuest.hidden=true;catThinking.hidden=true;renderQuestion()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&catModal.classList.contains('open'))close()});
})();
