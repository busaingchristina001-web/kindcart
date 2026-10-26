const SUPABASE_URL = 'https://utdoqbqxwcnexipseihh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_XeBoR2zNqwDxyxEYCvXkVQ_u5w4e71_';
let sb = null;

const $ = (id) => document.getElementById(id);
const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = n => Number(n || 0).toLocaleString('en-PH', {minimumFractionDigits:0, maximumFractionDigits:2});
let currentUser = null;

function setMessage(text, type='ok') {
  const el = $('msg');
  el.className = `notice ${type}`;
  el.textContent = text;
  el.style.display = 'block';
}
function authMessage(text, type='ok') {
  const el = $('authMsg');
  el.className = `notice ${type}`;
  el.textContent = text;
  el.style.display = 'block';
}
function openAuth(mode='login') {
  $('authModal').classList.add('open');
  $('authTitle').textContent = mode === 'signup' ? 'Create your KindCart account' : 'Welcome back';
  $('displayNameWrap').style.display = mode === 'signup' ? 'block' : 'none';
  $('authSubmit').textContent = mode === 'signup' ? 'Create account' : 'Log in';
  $('authForm').dataset.mode = mode;
  $('authSwitch').innerHTML = mode === 'signup'
    ? 'Already have an account? <button type="button" class="linkbtn" onclick="openAuth(\'login\')">Log in</button>'
    : 'New to KindCart? <button type="button" class="linkbtn" onclick="openAuth(\'signup\')">Create account</button>';
  $('authMsg').style.display='none';
}
function closeAuth(){ $('authModal').classList.remove('open'); }
window.openAuth=openAuth; window.closeAuth=closeAuth;

async function refreshAuth() {
  const { data } = await sb.auth.getUser();
  currentUser = data.user || null;
  $('guestActions').style.display = currentUser ? 'none' : 'flex';
  $('userActions').style.display = currentUser ? 'flex' : 'none';
  if (currentUser) {
    $('userEmail').textContent = currentUser.email || 'Signed in';
    $('formGate').style.display='none';
    $('wishFields').disabled=false;
  } else {
    $('formGate').style.display='block';
    $('wishFields').disabled=true;
  }
}

$('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const mode=e.currentTarget.dataset.mode;
  const email=$('authEmail').value.trim();
  const password=$('authPassword').value;
  $('authSubmit').disabled=true;
  try {
    if(mode==='signup'){
      const display_name=$('authName').value.trim();
      const {error}=await sb.auth.signUp({email,password,options:{data:{display_name},emailRedirectTo:location.origin+location.pathname}});
      if(error) throw error;
      authMessage('Account created. Check your email and click the confirmation link, then return here to log in.');
    } else {
      const {error}=await sb.auth.signInWithPassword({email,password});
      if(error) throw error;
      closeAuth();
      await refreshAuth();
      setMessage('You are logged in. You can now submit a wish.');
    }
  } catch(err){ authMessage(err.message || 'Authentication failed.', 'error'); }
  finally { $('authSubmit').disabled=false; }
});

$('logoutBtn').addEventListener('click', async()=>{ await sb.auth.signOut(); await refreshAuth(); });
sb.auth.onAuthStateChange(()=>setTimeout(refreshAuth,0));

async function drawWishes(){
  const grid=$('grid');
  grid.innerHTML='<p>Loading wishes…</p>';
  const {data,error}=await sb.from('wishes').select('id,title,category,goal_amount,story,status').in('status',['approved','funded']).order('created_at',{ascending:false}).limit(30);
  if(error){ grid.innerHTML='<p>Wishes could not be loaded right now.</p>'; return; }
  if(!data.length){ grid.innerHTML='<div class="empty">No approved wishes yet. Be the first to share one.</div>'; return; }
  grid.innerHTML='';
  data.forEach(w=>grid.insertAdjacentHTML('beforeend',`<article class="card"><div class="pic">🎁</div><small>${esc(w.category)}</small><h3>${esc(w.title)}</h3><p>${esc(w.story)}</p><div class="money">Goal: ₱${money(w.goal_amount)}</div><button class="support" type="button" onclick="alert('Secure funding is the next KindCart stage. Payments are not enabled yet.')">♡ Help this wish</button></article>`));
}

$('form').addEventListener('submit', async(e)=>{
  e.preventDefault();
  if(!currentUser){ openAuth('login'); return; }
  const payload={
    user_id:currentUser.id,
    title:$('title').value.trim(),
    goal_amount:Number($('amount').value),
    category:$('cat').value,
    story:$('story').value.trim(),
    product_url:$('productUrl').value.trim() || null,
    status:'pending'
  };
  $('submitWish').disabled=true;
  const {error}=await sb.from('wishes').insert(payload);
  $('submitWish').disabled=false;
  if(error){ setMessage(error.message || 'Could not submit your wish.','error'); return; }
  e.currentTarget.reset();
  setMessage('Your wish was submitted successfully and is now pending owner review.');
});

async function initKindCart() {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase library failed to load.');
    return;
  }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  await refreshAuth();
  drawWishes();
}

initKindCart();
