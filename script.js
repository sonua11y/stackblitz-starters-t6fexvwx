const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');
const bruteResultView = document.getElementById('brute-result');

// store in localStorage
function store(key, value) {
  localStorage.setItem(key, value);
}

// retrieve from localStorage
function retrieve(key) {
  return localStorage.getItem(key);
}

// random number between min and max
function getRandomArbitrary(min, max) {
  let cached = Math.random() * (max - min) + min;
  cached = Math.floor(cached);
  return cached;
}

// clear local storage
function clear() {
  localStorage.clear();
}

// SHA256 hashing
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// get or generate a SHA256 hash of a random 3-digit number
async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) return cached;

  const randomPin = getRandomArbitrary(MIN, MAX).toString();
  const hashed = await sha256(randomPin);
  store('sha256', hashed);
  return hashed;
}

// load the hash on page load
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// check user input
async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 not 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const hasedPin = await sha256(pin);
  const targetHash = sha256HashView.innerHTML;

  if (hasedPin === targetHash) {
    resultView.innerHTML = '🎉 success';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = '❌ failed';
  }

  resultView.classList.remove('hidden');
}

// brute-force function
async function bruteForce() {
  bruteResultView.innerHTML = '🔍 Brute forcing...';
  const targetHash = sha256HashView.innerHTML;

  for (let i = MIN; i <= MAX; i++) {
    const guess = i.toString();
    const hash = await sha256(guess);

    if (hash === targetHash) {
      bruteResultView.innerHTML = `💥 Found! PIN: ${guess}`;
      return;
    }
  }

  bruteResultView.innerHTML = '❌ Could not find the PIN';
}

// only allow numbers, limit to 3 digits
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// attach check button
document.getElementById('check').addEventListener('click', test);

// attach brute-force button
document.getElementById('brute-force').addEventListener('click', bruteForce);

main();
