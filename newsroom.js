/* Wildlife Mystery Newsroom: facts stay in the Expert view until the case is solved. */
(() => {
  const animals = [
    {name:'Giant panda',found:'central China',diet:'bamboo',behavior:'rests in bamboo forests',threat:'habitat loss',protection:'conservation programs',fact:'spends much of its day eating bamboo'},
    {name:'Polar bear',found:'the Arctic',diet:'seals',behavior:'walks on sea ice',threat:'shrinking sea ice',protection:'wildlife laws',fact:'can swim long distances'},
    {name:'Sea turtle',found:'warm oceans around the world',diet:'sea grass and small sea animals',behavior:'swims near coral reefs',threat:'plastic waste and fishing nets',protection:'wildlife laws',fact:'returns to a beach to lay eggs'},
    {name:'Pangolin',found:'parts of Africa and Asia',diet:'ants and termites',behavior:'rolls into a ball when threatened',threat:'illegal hunting',protection:'wildlife laws',fact:'has hard scales'},
    {name:'Elephant',found:'parts of Africa',diet:'grass, leaves, and fruit',behavior:'moves in family groups',threat:'habitat loss and illegal hunting',protection:'wildlife laws and park rangers',fact:'uses its trunk to pick up food'},
    {name:'Tiger',found:'parts of Asia',diet:'deer and other animals',behavior:'walks alone through forests',threat:'habitat loss and illegal hunting',protection:'wildlife laws and park rangers',fact:'has a different stripe pattern from every other tiger'},
    {name:'Blue whale',found:'oceans around the world',diet:'tiny animals called krill',behavior:'swims through deep water',threat:'ship strikes and fishing gear',protection:'international laws',fact:'is the largest animal on Earth'},
    {name:'Orangutan',found:'the rainforests of Borneo and Sumatra',diet:'fruit and leaves',behavior:'climbs trees',threat:'forest loss',protection:'conservation groups',fact:'builds a new nest to rest in'},
    {name:'Koala',found:'eastern Australia',diet:'eucalyptus leaves',behavior:'rests in eucalyptus trees',threat:'habitat loss and wildfires',protection:'wildlife rescue teams',fact:'sleeps for many hours each day'},
    {name:'Snow leopard',found:'high mountains in Central Asia',diet:'wild sheep and other animals',behavior:'moves quietly across rocky slopes',threat:'habitat loss and illegal hunting',protection:'wildlife laws',fact:'uses its long tail for balance'},
    {name:'Rhino',found:'parts of Africa and Asia',diet:'grass and leaves',behavior:'walks across grasslands',threat:'illegal hunting',protection:'wildlife guards',fact:'has thick skin and a strong horn'},
    {name:'Sea otter',found:'coastal waters of the North Pacific',diet:'shellfish and sea urchins',behavior:'floats on its back',threat:'oil spills and pollution',protection:'marine conservation laws',fact:'uses rocks to open hard shells'}
  ];

  const questions = [
    {topic:'Location',starter:'Do you know',clause:'where this animal is found',ending:'?',challenge:'Where...?'},
    {topic:'Diet',starter:'Can you tell me',clause:'what it eats',ending:'?',challenge:'What...?'},
    {topic:'Interesting fact',starter:'Do you know',clause:'what it is known for',ending:'?',challenge:'What...?'},
    {topic:'Threat',starter:'I wonder',clause:'why it is threatened',ending:'.',challenge:'Why...?'},
    {topic:'Protection',starter:'Can you tell me',clause:'how it is protected',ending:'?',challenge:'How...?'},
    {topic:'Special behavior',starter:'Do you know',clause:'what special behavior it has',ending:'?',challenge:'What...?'},
  ];
  const noteFields=[['location','Location'],['diet','Diet'],['behavior','Special behavior'],['threat','Threat'],['protection','Protection'],['guess','My guess']];
  const passiveForms=['is found','is known for','is threatened','is protected','is often seen'];
  const starters=['It is found in...','It is known for...','It is threatened by...','It is protected by...','It is often seen...'];
  const freshNotes=()=>Object.fromEntries(noteFields.map(([key])=>[key,'']));
  const state={
    index:Math.floor(Math.random()*animals.length),caseNo:Math.floor(Math.random()*90)+10,
    view:'reporter',pending:'expert',level:'training',asked:new Set(),pendingQuestion:null,
    notes:freshNotes(),guessAttempted:false,solved:false,reflectionQuestions:new Set(),reflectionPassive:new Set(),
    roster:'',pair:'',seconds:180,running:false,framesLarge:false
  };
  let tick=null;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const animal=()=>animals[state.index];
  const timeText=()=>`${String(Math.floor(state.seconds/60)).padStart(2,'0')}:${String(state.seconds%60).padStart(2,'0')}`;
  const art=(label)=>`<div class="mystery-art quadrant-${state.index%4}" role="img" aria-label="${esc(label)}" style="background-image:url('assets/mystery-animals/set-${Math.floor(state.index/4)+1}.png')"></div>`;
  const timer=()=>`<div class="timer-card"><span>3-MINUTE CHALLENGE</span><strong class="news-timer">${timeText()}</strong></div>`;
  const canGuess=()=>state.asked.size>=5&&state.pendingQuestion===null;
  const stage=()=>state.solved?'CASE SOLVED':canGuess()?'READY TO GUESS':'MYSTERY';

  function switchTo(role){state.pending=role;state.view='transition';window.render()}
  function reset(index=state.index){
    clearInterval(tick);tick=null;
    Object.assign(state,{index,caseNo:Math.floor(Math.random()*90)+10,view:'reporter',pending:'expert',asked:new Set(),pendingQuestion:null,notes:freshNotes(),guessAttempted:false,solved:false,reflectionQuestions:new Set(),reflectionPassive:new Set(),seconds:180,running:false});
    window.render();
  }
  function startTimer(){
    if(state.running)return;
    if(state.seconds===0)state.seconds=180;
    state.running=true;
    tick=setInterval(()=>{
      state.seconds=Math.max(0,state.seconds-1);
      document.querySelectorAll('.news-timer').forEach(el=>el.textContent=timeText());
      if(state.seconds===0){clearInterval(tick);tick=null;state.running=false}
    },1000);
    window.render();
  }
  function markAsked(index){
    if(state.view!=='reporter'||state.solved||!questions[index])return;
    state.asked.add(index);
    state.pendingQuestion=index;
    switchTo('expert');
  }
  function markAnswered(){
    if(state.view!=='expert'||state.pendingQuestion===null)return;
    state.pendingQuestion=null;
    switchTo('reporter');
  }
  function makeGuess(){
    if(state.view!=='reporter'||!canGuess()||state.solved)return;
    state.guessAttempted=true;
    const guess=state.notes.guess.trim().toLowerCase().replace(/[\s-]+/g,' ');
    const correct=animal().name.toLowerCase().replace(/[\s-]+/g,' ');
    if(guess&&guess===correct)state.solved=true;
    window.render();
  }

  function questionCard(q,i){
    const asked=state.asked.has(i);
    const text=state.level==='training'
      ?`<span class="starter">${esc(q.starter)}</span> <span class="clause">${esc(q.clause)}</span>${q.ending}`
      :`<span class="challenge-prompt">${esc(q.challenge)}</span>`;
    return `<button class="question-frame ${asked?'asked':''}" data-news="ask" data-i="${i}" aria-label="${esc(q.topic)}: ${asked?'asked; ask again':'mark asked after speaking'}"><span class="question-check" aria-hidden="true">${asked?'✓':'□'}</span><span class="question-body"><small>${esc(q.topic)}</small><span>${text}</span></span></button>`;
  }
  function progress(){return `<div class="case-progress"><div class="progress-label"><strong>Questions asked: ${state.asked.size} / 6</strong><span>Ask 5 different questions to unlock your guess.</span></div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${state.asked.size}" aria-label="Questions asked"><span style="width:${state.asked.size/6*100}%"></span></div></div>`}
  function notePad(){return `<section class="card reporter-notes"><p class="overline">EVIDENCE · REPORTER NOTES</p><h3>Write what you hear</h3><div class="note-grid">${noteFields.map(([key,label])=>`<label>${label}<input data-note="${key}" value="${esc(state.notes[key])}" placeholder="${label==='My guess'?'Type the animal name here':'Listen and note a clue'}" autocomplete="off"></label>`).join('')}</div><p class="micro">Your notes stay on this device during the activity.</p></section>`}
  function guessArea(){
    if(state.solved)return reveal();
    const feedback=state.guessAttempted?(state.notes.guess.trim()?'Try again. Ask your partner for another clue.':'Type an animal name in “My guess” first.'):'The animal stays hidden until your guess is correct.';
    return `<section class="card guess-panel"><p class="overline">STAGE 2 · MAKE YOUR GUESS</p><h3>🎯 Make Your Guess</h3><p>Use your Reporter Notes. Say your guess aloud, then check it.</p><button class="action-btn" data-news="guess" ${canGuess()?'':'disabled'}>Check My Guess</button><p class="guess-feedback" aria-live="polite">${canGuess()?feedback:'Locked: ask five different questions and hear the Expert’s answer.'}</p></section>`;
  }
  function factList(a,includeName=true){
    const items=[...(includeName?[['Animal',a.name]]:[]),['Found',a.found],['Diet',a.diet],['Special behavior',a.behavior],['Threat',a.threat],['Protection',a.protection],['Interesting fact',a.fact]];
    return `<dl class="fact-list">${items.map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
  }
  function sampleDialogue(a){
    const lines=[['Reporter','Do you know where this animal is found?'],['Expert',`It is found in ${a.found}.`],['Reporter','Can you tell me what it eats?'],['Expert',`It is known for eating ${a.diet}.`],['Reporter','I wonder why it is threatened.'],['Expert',`It is threatened by ${a.threat}.`],['Reporter','Can you tell me how it is protected?'],['Expert',`It is protected by ${a.protection}.`]];
    return `<details class="sample-dialogue"><summary>Sample Dialogue · 示範對話</summary><div>${lines.map(([role,line])=>`<p><b>${role}:</b> <span class="${role==='Reporter'?'sample-clause':'sample-passive'}">${esc(line)}</span></p>`).join('')}</div></details>`;
  }
  function reflection(){
    return `<section class="card detective"><p class="overline">🔎 LANGUAGE DETECTIVE</p><h3>Which expressions did you use or hear?</h3><div class="detective-grid"><div><strong>Embedded questions</strong><div class="detective-options">${questions.map((q,i)=>`<button data-news="reflect-q" data-i="${i}" aria-pressed="${state.reflectionQuestions.has(i)}">${esc(q.clause)}</button>`).join('')}</div></div><div><strong>Passive voice</strong><div class="detective-options">${passiveForms.map((x,i)=>`<button data-news="reflect-p" data-i="${i}" aria-pressed="${state.reflectionPassive.has(i)}">${esc(x)}</button>`).join('')}</div></div></div><p class="reflection-result" aria-live="polite">Great! You used <b>${state.reflectionQuestions.size}</b> embedded questions and <b>${state.reflectionPassive.size}</b> passive-voice expressions.</p></section>`;
  }
  function reveal(){
    const a=animal();
    return `<section class="card solved-panel"><p class="overline">STAGE 3 · REVEAL</p><div class="solved-head"><span class="solved-stamp">CASE SOLVED!</span><h3>${esc(a.name)}</h3></div><div class="solved-grid"><div class="full-art">${art(`${a.name} illustration`)}</div><div><p class="lead">The mystery animal is the <b>${esc(a.name)}</b>.</p>${factList(a,false)}</div></div>${sampleDialogue(a)}</section>${reflection()}`;
  }
  function reporter(projector=false){
    return `<div class="news-layout"><section class="card news-visual reporter-visual"><span class="role-pill reporter-pill">STUDENT A · REPORTER</span><p class="classified-stamp">MYSTERY ANIMAL · CLUE 01</p><div class="mystery-window">${art('Obscured mystery animal silhouette')}</div><p class="mystery-caption">Only a shadow is visible. Ask for evidence.</p></section><section class="card role-card reporter-card"><div class="role-heading"><div><p class="overline">STAGE 1 · ASK FOR CLUES</p><h3>🕵️ Mystery Animal Case</h3><p>Ask your partner questions and discover the animal.</p></div>${timer()}</div>${progress()}<div class="question-frames ${state.framesLarge?'frames-large':''}">${questions.map(questionCard).join('')}</div><p class="micro">Ask aloud first. Then click that question to mark it and pass the screen to the Expert.</p><button class="text-switch" data-news="switch-expert">Switch to Expert View →</button></section></div>${projector?'':`${notePad()}${guessArea()}`}`;
  }
  function expert(){
    const a=animal();
    const selected=state.pendingQuestion===null?'Your partner is preparing a question.':`The Reporter asked about: ${questions[state.pendingQuestion].topic}. Answer aloud using the key information below.`;
    const help=state.level==='training'?`<section class="passive-help"><p class="overline">PASSIVE VOICE HELP</p><div>${starters.map(s=>`<span>${esc(s)}</span>`).join('')}</div><p class="micro">Choose a starter and finish the sentence yourself. Do not read a prepared answer.</p></section>`:'';
    return `<section class="card secret-brief"><div class="secret-head"><div><span class="role-pill expert-pill">🔒 SECRET — STUDENT B ONLY</span><p class="classified-stamp">CLASSIFIED · WILDLIFE FILE</p><h3>${esc(a.name)}</h3></div>${timer()}</div><p class="secret-instruction">${esc(selected)}</p>${factList(a)}${help}<div class="turn-action"><span class="turn-badge">${state.asked.size} / 6 questions asked</span><button class="action-btn" data-news="answered" ${state.pendingQuestion===null?'disabled':''}>I answered aloud →</button></div><button class="text-switch" data-news="switch-reporter">Switch to Reporter View →</button></section>`;
  }
  function teacherPanel(){
    return `<aside class="news-teacher"><p class="overline">TEACHER CONTROLS</p><div class="news-actions"><button class="action-btn" data-news="random">🎲 Random Animal</button><button class="action-btn secondary" data-news="next">Next Animal →</button><button class="action-btn secondary" data-news="reset">Reset Dialogue</button><button class="action-btn secondary" data-news="large">${state.framesLarge?'Normal':'Enlarge'} Question Frames</button><button class="action-btn blue" data-news="timer">⏱ Start 3-Minute Challenge</button></div><div class="roster"><label for="rosterInput">Student names (comma or line separated; only kept in this tab)</label><textarea id="rosterInput" rows="2" placeholder="Enter at least two names">${esc(state.roster)}</textarea><button class="action-btn secondary" data-news="pair">👥 Random Pair</button><strong class="pair-result" aria-live="polite">${esc(state.pair)}</strong></div><p class="micro">Suggested time: 3 minutes. Reporter asks at least five different questions; Expert answers using key facts. The full answer is revealed only after a correct guess.</p></aside>`;
  }
  function render({teacher,projector}){
    if(state.view==='transition')return `<section class="handoff" aria-live="polite"><span class="handoff-icon">↔</span><p class="overline">INFORMATION GAP · ROLE SWITCH</p><h3>Pass the screen to your partner.</h3><p>The next card is hidden until your partner is ready.</p><button class="action-btn" data-news="continue">${state.pending==='expert'?'I am the Expert · Show my secret brief':'I am the Reporter · Show my case'}</button></section>`;
    return `<div class="newsroom"><div class="news-intro"><div><span class="pill">CASE #${state.caseNo} · ${stage()}</span><h3>🕵️ Wildlife Mystery Newsroom</h3><p>Ask. Discover. Report.</p></div><div class="news-intro-side"><span>INFORMATION GAP · PAIR WORK</span><b>${state.asked.size} / 6 QUESTIONS</b></div></div>${!projector?`<div class="level-switch" role="group" aria-label="Speaking support level"><button data-news="level" data-level="training" aria-pressed="${state.level==='training'}">Training Mode</button><button data-news="level" data-level="challenge" aria-pressed="${state.level==='challenge'}">Challenge Mode</button></div>`:''}${projector||state.view==='reporter'?reporter(projector):expert()}${!projector&&teacher?teacherPanel():''}</div>`;
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-news]');if(!button)return;
    const action=button.dataset.news,index=Number(button.dataset.i);
    if(action==='ask')markAsked(index);
    else if(action==='answered')markAnswered();
    else if(action==='switch-expert')switchTo('expert');
    else if(action==='switch-reporter'){if(state.pendingQuestion!==null)markAnswered();else switchTo('reporter')}
    else if(action==='continue'){state.view=state.pending;window.render()}
    else if(action==='guess')makeGuess();
    else if(action==='level'){state.level=button.dataset.level;window.render()}
    else if(action==='reflect-q'||action==='reflect-p'){const set=action==='reflect-q'?state.reflectionQuestions:state.reflectionPassive;set.has(index)?set.delete(index):set.add(index);window.render()}
    else if(action==='random'){let next=Math.floor(Math.random()*(animals.length-1));if(next>=state.index)next++;reset(next)}
    else if(action==='next')reset((state.index+1)%animals.length);
    else if(action==='reset')reset();
    else if(action==='large'){state.framesLarge=!state.framesLarge;window.render()}
    else if(action==='timer')startTimer();
    else if(action==='pair'){
      const names=state.roster.split(/[,，\n]+/).map(x=>x.trim()).filter(Boolean);
      if(names.length<2)state.pair='Enter at least two names.';
      else{const first=Math.floor(Math.random()*names.length);let second=Math.floor(Math.random()*(names.length-1));if(second>=first)second++;state.pair=`Reporter: ${names[first]} · Expert: ${names[second]}`}
      window.render();
    }
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='rosterInput')state.roster=event.target.value;
    if(event.target.dataset.note){state.notes[event.target.dataset.note]=event.target.value;state.guessAttempted=false}
  });
  window.Newsroom={render,toProjector(){state.view='reporter';state.pending='expert'},getState:()=>({index:state.index,view:state.view,asked:state.asked.size,pendingQuestion:state.pendingQuestion,level:state.level,solved:state.solved,seconds:state.seconds})};
})();
