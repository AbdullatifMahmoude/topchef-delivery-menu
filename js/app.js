/**
 * TOP CHEF CAPTAIN DELIVERY - COMPREHENSIVE APP LOGIC & STATE
 * Integrated with Top Chef backend specifications & financial custody
 */

// Global Application State
const state = {
  // Authentication & Captain Info (matches users model: UserRole.DELIVERY)
  auth: {
    isAuthenticated: true,
    user: {
      id: 12,
      username: 'ahmed_captain',
      fullName: 'أحمد عبد الحميد',
      phone: '01012345678',
      role: 'delivery',
      vehicle: 'دراجة نارية • سكوتر'
    },
    token: 'jwt_mock_token_topchef_2026'
  },
  
  // Shift & Captain Status
  captain: {
    status: 'online', // 'online' | 'break' | 'offline'
    branchName: 'فرع الزقازيق الرئيسي',
    shiftStartedAt: '١٢:٣٠ ظهراً',
    ordersCompleted: 8
  },

  // Finances & Custody Management (مستحقات المطعم وأتعاب الكابتن والتوريد)
  finances: {
    cashInHand: 1450,       // Total physical cash currently in rider's pocket
    restaurantDue: 1210,    // Food value owed to the restaurant (order_value)
    riderFeesEarned: 240,   // Accumulated delivery fees earned by the rider (8 orders x 30 EGP)
    digitalAmount: 285,     // Amount paid directly via Instapay / Wallet to restaurant
    settlementsHistory: [
      {
        id: 'SET-901',
        amount: 800,
        remainingInHand: 1450,
        receiver: 'أ. محمود عزت • كاشير الخزينة',
        time: 'منذ ساعتين',
        notes: 'توريد دفعة أولى - تم ترك 250 ج.م فكة'
      }
    ]
  },

  currentView: 'home',
  isLoading: false,

  // Active Order (matches orders model & state_machine)
  currentOrder: {
    id: '1428',
    customerName: 'م. كريم عبد العزيز',
    customerPhone: '01012345678',
    customerAddress: 'حي الجامعة، بجوار مسجد القدس — عمارة السعادة، الدور الرابع • شقة ٨',
    notes: 'رن الجرس، عدم ترك الطلب بالخارج مطلقا',
    orderStatus: 'out_for_delivery', // 'out_for_delivery' | 'delivered'
    paymentMethod: 'cash',           // 'cash' | 'instapay' | 'wallet'
    subtotal: 320,
    deliveryFee: 30,                 // Rider's fee
    totalAmount: 350,                // Gross amount
    items: [
      { name: 'نصف فرخة مشوية على الفحم', qty: 1, price: 180 },
      { name: 'شيش طاووق على الفحم بصوص خاص', qty: 1, price: 120 },
      { name: '٢ كانز بيبسي + ثومية إضافية', qty: 1, price: 50 }
    ]
  },

  // Route Stops
  stops: [
    { id: 1, title: 'مطبخ توب شيف الزقازيق', desc: 'تم استلام وتجهيز الوجبات الساخنة', status: 'completed' },
    { id: 2, title: 'حي الجامعة — م. كريم عبد العزيز', desc: 'المحطة الحالية • مطلوب ٣٥٠ ج.م نقداً', status: 'active' },
    { id: 3, title: 'شارع المحافظة — أ. سارة محمود', desc: 'المحطة القادمة • مدفوع إلكترونياً عبر إنستاباي', status: 'pending' }
  ],

  // Completed Orders History
  history: [
    { id: '1427', customer: 'د. طارق الحفناوي', location: 'المشاية السفلية', time: 'منذ ٢٥ دقيقة', amount: 420, method: 'نقدي', fee: 30 },
    { id: '1426', customer: 'أ. محمود عزت', location: 'شارع جيهان', time: 'منذ ٤٥ دقيقة', amount: 285, method: 'إنستا باي', fee: 30 },
    { id: '1425', customer: 'م. شادي سمير', location: 'حي الجامعة', time: 'منذ ١ ساعة', amount: 510, method: 'نقدي', fee: 30 },
    { id: '1424', customer: 'أ. فاطمة رضوان', location: 'شارع قناة السويس', time: 'منذ ساعتين', amount: 340, method: 'نقدي', fee: 30 }
  ]
};

// Subtle Web Audio Haptic & Chimes
function playChime(type = 'success') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {
    // Audio autoplay restrictions handled
  }
}

// Toast Notification
function showToast(message, type = 'normal', duration = 3000) {
  const toast = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  if (!toast) return;

  toast.className = 'toast-alert show';
  if (type === 'success') toast.classList.add('success');
  if (type === 'error') toast.classList.add('error');

  toastIcon.textContent = type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : 'info');
  toastMsg.textContent = message;

  setTimeout(() => {
    toast.className = 'toast-alert';
  }, duration);
}

// Screen Router & Navigation
function navigateTo(viewId) {
  playChime('click');
  state.currentView = viewId;

  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add('active');
    const scrollContainer = document.querySelector('.screen-content');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }

  // Update Bottom Nav
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.view === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Toggle Header and Bottom Nav visibility on Auth views
  const header = document.querySelector('.app-header');
  const bottomNav = document.querySelector('.bottom-nav-wrapper');
  const isAuthView = ['auth', 'register', 'otp'].includes(viewId);

  if (header && bottomNav) {
    header.style.display = isAuthView ? 'none' : 'flex';
    bottomNav.style.display = isAuthView ? 'none' : 'flex';
  }
}

// Loading Skeletons Simulation
function simulateLoading(callback) {
  state.isLoading = true;
  const normalContainers = document.querySelectorAll('.data-loaded-content');
  const skeletonContainers = document.querySelectorAll('.data-skeleton-content');

  normalContainers.forEach(el => el.style.display = 'none');
  skeletonContainers.forEach(el => el.style.display = 'block');

  setTimeout(() => {
    state.isLoading = false;
    normalContainers.forEach(el => el.style.display = 'block');
    skeletonContainers.forEach(el => el.style.display = 'none');
    if (typeof callback === 'function') callback();
  }, 1000);
}

// ==========================================================================
// Theme Management (Light / Dark / System Mode)
// ==========================================================================
function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;
  if (effectiveTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Update header toggle icon
  const icon = document.getElementById('themeToggleIcon');
  if (icon) {
    icon.textContent = effectiveTheme === 'dark' ? 'light_mode' : 'dark_mode';
  }

  // Update profile label & pill buttons
  const label = document.getElementById('currentThemeLabel');
  if (label) {
    label.textContent = theme === 'auto' 
      ? (effectiveTheme === 'dark' ? 'تلقائي • داكن' : 'تلقائي • فاتح') 
      : (theme === 'dark' ? 'ليلي' : 'فاتح');
  }

  document.querySelectorAll('.theme-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === `pillTheme${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
  });
}

function setAppTheme(theme) {
  localStorage.setItem('topchef_theme', theme);
  applyTheme(theme);
  playChime('click');
  showToast(`تم تفعيل: ${theme === 'dark' ? 'الوضع الليلي' : (theme === 'light' ? 'الوضع الفاتح' : 'المظهر التلقائي')}`, 'normal');
}

function toggleTheme() {
  const current = localStorage.getItem('topchef_theme') || 'light';
  const effective = current === 'auto' ? getSystemTheme() : current;
  const next = effective === 'dark' ? 'light' : 'dark';
  setAppTheme(next);
}

function initTheme() {
  const saved = localStorage.getItem('topchef_theme') || 'light';
  applyTheme(saved);

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const current = localStorage.getItem('topchef_theme') || 'light';
      if (current === 'auto') {
        applyTheme('auto');
      }
    });
  }
}

// Minimalist Clean Splash / Launch Screen (Snappy & Adapts to Theme)
function triggerAppSplash(onComplete) {
  const splash = document.getElementById('appSplashScreen');
  const bar = document.getElementById('splashProgressBar');
  const status = document.getElementById('splashStatusText');
  if (!splash) return;

  // Make sure current theme is applied so splash background matches
  const savedTheme = localStorage.getItem('topchef_theme') || 'light';
  applyTheme(savedTheme);

  // Reset to visible
  splash.classList.remove('fade-out');
  if (bar) bar.style.width = '0%';
  if (status) status.textContent = 'جاري الاتصال بالنظام...';

  // Fast, natural progression (total duration ~1.1s)
  setTimeout(() => {
    if (bar) bar.style.width = '45%';
    if (status) status.textContent = 'مزامنة الوردية والطلبات النشطة...';
  }, 250);

  setTimeout(() => {
    if (bar) bar.style.width = '100%';
    if (status) status.textContent = 'جاهز للوردية';
  }, 650);

  // Snappy smooth cross-fade out
  setTimeout(() => {
    splash.classList.add('fade-out');
    if (typeof onComplete === 'function') onComplete();
  }, 1100);
}

// Toggle Online / Break Status
function toggleBreak() {
  playChime('click');
  const btn = document.getElementById('breakToggleBtn');
  const statusLabel = document.getElementById('captainStatusLabel');
  const statusDot = document.getElementById('statusDot');
  const statusPillDot = document.getElementById('statusPillDot');

  if (state.captain.status === 'online') {
    state.captain.status = 'break';
    btn.classList.add('active');
    btn.innerHTML = '<span class="material-symbols-outlined text-[15px]">play_arrow</span><span>إنهاء الاستراحة</span>';
    statusLabel.textContent = 'في استراحة';
    if (statusDot) statusDot.classList.add('break');
    if (statusPillDot) statusPillDot.classList.add('break');
    showToast('تم تفعيل وضع الاستراحة - تم إيقاف التكليفات مؤقتاً', 'normal');
  } else {
    state.captain.status = 'online';
    btn.classList.remove('active');
    btn.innerHTML = '<span class="material-symbols-outlined text-[15px]">bedtime</span><span>استراحة</span>';
    statusLabel.textContent = 'متصل وجاهز';
    if (statusDot) statusDot.classList.remove('break');
    if (statusPillDot) statusPillDot.classList.remove('break');
    showToast('أهلاً بك! أنت الآن متصل وجاهز لاستقبال الطلبات', 'success');
  }
}

// Complete Delivery Order
function completeDelivery() {
  const completeBtn = document.getElementById('completeDeliveryBtn');
  const cashCheckbox = document.getElementById('cashCheckbox');

  if (state.currentOrder.paymentMethod === 'cash' && !cashCheckbox.checked) {
    showToast('يرجى تأكيد استلام المبلغ النقدي أولاً', 'error');
    playChime('click');
    return;
  }

  completeBtn.disabled = true;
  completeBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> جاري الحفظ وتحديث السيستم...';

  setTimeout(() => {
    playChime('success');
    state.captain.ordersCompleted += 1;

    // Financial updates matching backend logic
    if (state.currentOrder.paymentMethod === 'cash') {
      state.finances.cashInHand += state.currentOrder.totalAmount;
      state.finances.restaurantDue += state.currentOrder.subtotal;
    } else {
      state.finances.digitalAmount += state.currentOrder.totalAmount;
    }
    state.finances.riderFeesEarned += state.currentOrder.deliveryFee;

    state.currentOrder.orderStatus = 'delivered';

    // Add to history
    state.history.unshift({
      id: state.currentOrder.id,
      customer: state.currentOrder.customerName,
      location: 'حي الجامعة',
      time: 'الآن',
      amount: state.currentOrder.totalAmount,
      method: state.currentOrder.paymentMethod === 'cash' ? 'نقدي' : 'إلكتروني',
      fee: state.currentOrder.deliveryFee
    });

    // Advance stops
    state.stops[1].status = 'completed';
    state.stops[2].status = 'active';

    updateUI();

    completeBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> تم التسليم بنجاح';
    completeBtn.style.backgroundColor = 'var(--success)';

    showToast(`تم تسليم طلب ${state.currentOrder.id} وإضافته لسجل الحسابات بنجاح`, 'success');

    setTimeout(() => {
      navigateTo('home');
      completeBtn.disabled = false;
      completeBtn.style.backgroundColor = '';
      completeBtn.innerHTML = '<span class="material-symbols-outlined">task_alt</span> تأكيد التسليم وإنهاء المحطة';
      cashCheckbox.checked = false;
    }, 1100);
  }, 800);
}

// ==========================================================================
// FINANCES & PARTIAL SETTLEMENT LOGIC (إدارة وتوريد العهدة النقدية)
// ==========================================================================
function openSettlementModal() {
  playChime('click');
  const modal = document.getElementById('settlementModal');
  const input = document.getElementById('settlementAmountInput');
  const maxLabel = document.getElementById('maxRestaurantDueLabel');

  if (maxLabel) {
    maxLabel.textContent = `${state.finances.restaurantDue.toLocaleString('ar-EG')} ج.م`;
  }
  if (input) {
    // Default suggestion: Full restaurant due
    input.value = state.finances.restaurantDue;
  }
  if (modal) modal.classList.add('show');
}

function closeSettlementModal() {
  playChime('click');
  const modal = document.getElementById('settlementModal');
  if (modal) modal.classList.remove('show');
}

function setQuickSettlement(preset) {
  playChime('click');
  const input = document.getElementById('settlementAmountInput');
  if (!input) return;

  if (preset === 'all') {
    input.value = state.finances.restaurantDue;
  } else if (preset === 'leave_fakka') {
    // Leave 210 EGP for change, remit the rest roundly
    const safeAmount = Math.max(0, state.finances.restaurantDue - 210);
    input.value = safeAmount;
  } else if (preset === '1000') {
    input.value = Math.min(state.finances.cashInHand, 1000);
  } else if (preset === '500') {
    input.value = Math.min(state.finances.cashInHand, 500);
  }

  // Update active chip styling
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.preset === preset);
  });
}

function submitSettlement() {
  const input = document.getElementById('settlementAmountInput');
  const notesInput = document.getElementById('settlementNotesInput');
  const receiverSelect = document.getElementById('settlementReceiverSelect');
  const amount = parseFloat(input.value) || 0;

  if (amount <= 0) {
    showToast('يرجى تحديد مبلغ صحيح للتوريد', 'error');
    return;
  }

  if (amount > state.finances.cashInHand) {
    showToast(`المبلغ المدخل أكبر من الكاش المتوفر معك: ${state.finances.cashInHand} ج.م`, 'error');
    return;
  }

  const btn = document.getElementById('confirmSettlementBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> جاري تسجيل التوريد...';

  setTimeout(() => {
    playChime('success');
    state.finances.cashInHand -= amount;
    state.finances.restaurantDue = Math.max(0, state.finances.restaurantDue - amount);

    const receiverName = receiverSelect ? receiverSelect.value : 'كاشير الفرع';
    const notesText = notesInput ? notesInput.value.trim() : '';

    // Record settlement transaction
    state.finances.settlementsHistory.unshift({
      id: `SET-${Math.floor(100 + Math.random() * 900)}`,
      amount: amount,
      remainingInHand: state.finances.cashInHand,
      receiver: receiverName,
      time: 'الآن',
      notes: notesText || (amount < state.finances.restaurantDue ? 'توريد جزئي - تم إبقاء جزء فكة' : 'توريد كامل مستحقات المطعم')
    });

    updateUI();
    closeSettlementModal();

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">payments</span><span>تأكيد التوريد واستخراج الإيصال</span>';

    showToast(`تم توريد ${amount.toLocaleString('ar-EG')} ج.م بنجاح إلى ${receiverName}`, 'success');
  }, 750);
}

// ==========================================================================
// AUTHENTICATION LOGIC (Login, Register, OTP Verification)
// ==========================================================================
function handleLogin() {
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const branchInput = document.getElementById('loginBranchInput');
  const btn = document.getElementById('loginSubmitBtn');

  if (!usernameInput.value.trim()) {
    showToast('يرجى إدخال اسم المستخدم أو رقم الهاتف', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> جاري التحقق...';

  setTimeout(() => {
    playChime('success');
    state.auth.isAuthenticated = true;
    state.auth.user.username = usernameInput.value.trim();
    if (branchInput && branchInput.value) {
      state.captain.branchName = branchInput.value;
      const profileBranchEl = document.querySelector('.profile-branch');
      if (profileBranchEl) {
        profileBranchEl.textContent = `${branchInput.value} • وردية نشطة`;
      }
    }
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">login</span><span>تسجيل الدخول للوردية</span>';
    showToast('تم تسجيل الدخول بنجاح! وردية موفقة', 'success');
    navigateTo('home');
  }, 700);
}

function handleRegister() {
  const nameInput = document.getElementById('regFullName');
  const phoneInput = document.getElementById('regPhone');
  const vehicleSelect = document.getElementById('regVehicle');
  const branchInput = document.getElementById('regBranchInput');
  const btn = document.getElementById('registerSubmitBtn');

  if (!nameInput.value.trim() || !phoneInput.value.trim()) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> جاري إنشاء الحساب...';

  setTimeout(() => {
    playChime('click');
    state.auth.user.fullName = nameInput.value.trim();
    state.auth.user.phone = phoneInput.value.trim();
    if (vehicleSelect) state.auth.user.vehicle = vehicleSelect.value;
    if (branchInput && branchInput.value) state.captain.branchName = branchInput.value;

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">how_to_reg</span><span>إنشاء الحساب ومتابعة التحقق</span>';

    // Move to OTP verification view
    const targetPhoneLabel = document.getElementById('otpTargetPhone');
    if (targetPhoneLabel) targetPhoneLabel.textContent = phoneInput.value.trim();

    showToast('تم إرسال كود التحقق السداسي عبر WhatsApp / SMS', 'normal');
    navigateTo('otp');
    startOtpCountdown();
  }, 650);
}

function handleOtpVerify() {
  const inputs = document.querySelectorAll('.otp-box');
  const code = Array.from(inputs).map(i => i.value).join('');
  const btn = document.getElementById('verifyOtpBtn');

  if (code.length < 6) {
    showToast('يرجى إدخال كود التحقق السداسي كاملاً', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> جاري تأكيد الرمز...';

  setTimeout(() => {
    playChime('success');
    state.auth.isAuthenticated = true;
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">verified</span><span>تأكيد الرمز وبدء الوردية</span>';
    showToast('تم تأكيد الحساب بنجاح! أنت الآن في وردية التوصيل', 'success');
    navigateTo('home');
  }, 750);
}

let otpTimerInterval = null;
function startOtpCountdown() {
  let timeLeft = 45;
  const timerLabel = document.getElementById('otpCountdownLabel');
  const resendBtn = document.getElementById('otpResendBtn');

  if (resendBtn) {
    resendBtn.style.display = 'none';
  }

  if (otpTimerInterval) clearInterval(otpTimerInterval);
  otpTimerInterval = setInterval(() => {
    timeLeft--;
    if (timerLabel) {
      const sec = timeLeft < 10 ? '0' + timeLeft : timeLeft;
      timerLabel.textContent = `00:${sec}`;
    }
    if (timeLeft <= 0) {
      clearInterval(otpTimerInterval);
      if (resendBtn) resendBtn.style.display = 'inline-flex';
    }
  }, 1000);
}

function resendOtp() {
  playChime('click');
  showToast('تمت إعادة إرسال كود التحقق إلى هاتفك المسجل', 'normal');
  startOtpCountdown();
  document.querySelectorAll('.otp-box').forEach(box => box.value = '');
  const first = document.querySelector('.otp-box');
  if (first) first.focus();
}

function logout() {
  playChime('click');
  state.auth.isAuthenticated = false;
  showToast('تم تسجيل الخروج بنجاح', 'normal');
  navigateTo('auth');
}

// Setup OTP Inputs Auto-Advancing
function initOtpInputs() {
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val ? val[0] : '';
      if (val && index < boxes.length - 1) {
        boxes[index + 1].focus();
      }
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        boxes[index - 1].focus();
      }
    });

    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
      if (paste) {
        paste.slice(0, 6).split('').forEach((char, i) => {
          if (boxes[i]) boxes[i].value = char;
        });
        const targetIndex = Math.min(paste.length, boxes.length - 1);
        boxes[targetIndex].focus();
      }
    });
  });
}

// Update Dynamic UI Fields
function updateUI() {
  // Stats on Home View
  const statOrders = document.getElementById('statCompletedOrders');
  const statCash = document.getElementById('statCashCustody');
  if (statOrders) statOrders.textContent = `${state.captain.ordersCompleted} طلبات`;
  if (statCash) statCash.textContent = `${state.finances.cashInHand.toLocaleString('ar-EG')} ج.م`;

  // Finances Screen
  const finCashInHand = document.getElementById('finCashInHand');
  const finRestaurantDue = document.getElementById('finRestaurantDue');
  const finRiderFees = document.getElementById('finRiderFees');
  const finDigitalAmount = document.getElementById('finDigitalAmount');
  const profileCustodyCash = document.getElementById('profileCustodyCash');

  if (finCashInHand) finCashInHand.textContent = `${state.finances.cashInHand.toLocaleString('ar-EG')} ج.م`;
  if (finRestaurantDue) finRestaurantDue.textContent = `${state.finances.restaurantDue.toLocaleString('ar-EG')} ج.م`;
  if (finRiderFees) finRiderFees.textContent = `${state.finances.riderFeesEarned.toLocaleString('ar-EG')} ج.م`;
  if (finDigitalAmount) finDigitalAmount.textContent = `${state.finances.digitalAmount.toLocaleString('ar-EG')} ج.م`;
  if (profileCustodyCash) profileCustodyCash.textContent = `${state.finances.cashInHand.toLocaleString('ar-EG')} ج.م`;

  // Render Settlements Ledger (سجل التوريدات)
  const ledgerContainer = document.getElementById('settlementsLedgerList');
  if (ledgerContainer) {
    if (state.finances.settlementsHistory.length === 0) {
      ledgerContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 12px;">لا توجد عمليات توريد سابقة اليوم</div>';
    } else {
      ledgerContainer.innerHTML = state.finances.settlementsHistory.map(item => `
        <div class="ledger-item">
          <div class="ledger-item-left">
            <span class="ledger-item-title">${item.id} — ${item.receiver}</span>
            <span class="ledger-item-time">${item.time} • ${item.notes}</span>
          </div>
          <div class="ledger-item-right">
            <span class="ledger-item-amount">- ${item.amount.toLocaleString('ar-EG')} ج.م</span>
            <span class="ledger-item-rem">المتبقي باليد: ${item.remainingInHand.toLocaleString('ar-EG')} ج.م</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Render History List (سجل الطلبات بدون شباك)
  renderHistoryList('all');
}

function renderHistoryList(filterType = 'all') {
  const historyContainer = document.getElementById('historyItemsList');
  if (!historyContainer) return;

  let items = state.history;
  if (filterType === 'cash') {
    items = items.filter(i => i.method === 'نقدي');
  } else if (filterType === 'digital') {
    items = items.filter(i => i.method !== 'نقدي');
  }

  if (items.length === 0) {
    historyContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 24px;">لا توجد طلبات في هذا التصنيف اليوم</div>';
    return;
  }

  historyContainer.innerHTML = items.map(item => `
    <div class="history-item">
      <div>
        <div class="history-order-num">طلب ${item.id} — ${item.customer}</div>
        <div class="history-meta">${item.location} • ${item.time} • أتعابك: +${item.fee} ج.م</div>
      </div>
      <div style="text-align: left;">
        <div class="history-amount">${item.amount.toLocaleString('ar-EG')} ج.م</div>
        <div style="font-size: 10px; color: var(--text-muted); font-weight: 600;">${item.method}</div>
      </div>
    </div>
  `).join('');
}

function filterHistoryOrders(filterType) {
  renderHistoryList(filterType);
}

// ==========================================================================
// APP CUSTOM DROPDOWN INTERACTIVE SYSTEM
// ==========================================================================
function toggleCustomDropdown(dropdownId) {
  const target = document.getElementById(dropdownId);
  if (!target) return;
  const wasOpen = target.classList.contains('open');

  // Close any open dropdowns across the document
  document.querySelectorAll('.app-custom-dropdown.open').forEach(dd => {
    dd.classList.remove('open');
  });

  if (!wasOpen) {
    target.classList.add('open');
    playChime('click');
  }
}

function selectDropdownOption(dropdownId, value, icon, text) {
  const container = document.getElementById(dropdownId);
  if (!container) return;

  const hiddenInput = container.querySelector('input[type="hidden"]');
  const labelEl = container.querySelector('.dropdown-selected-label');
  const iconEl = container.querySelector('.dropdown-item-icon');

  if (hiddenInput) {
    hiddenInput.value = value;
    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (labelEl) labelEl.textContent = text || value;
  if (iconEl && icon) iconEl.textContent = icon;

  container.querySelectorAll('.dropdown-option-item').forEach(item => {
    const isThis = item.getAttribute('data-value') === value;
    item.classList.toggle('selected', isThis);
  });

  container.classList.remove('open');
  playChime('click');
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Event Listeners
  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view) navigateTo(view);
    });
  });

  // Break Toggle
  const breakBtn = document.getElementById('breakToggleBtn');
  if (breakBtn) breakBtn.addEventListener('click', toggleBreak);

  // Cash Checkbox in Stop Details
  const cashCheck = document.getElementById('cashCheckbox');
  const completeBtn = document.getElementById('completeDeliveryBtn');
  if (cashCheck && completeBtn) {
    cashCheck.addEventListener('change', () => {
      playChime('click');
      completeBtn.disabled = !cashCheck.checked;
    });
  }

  if (completeBtn) completeBtn.addEventListener('click', completeDelivery);

  const openTripBtn = document.getElementById('openTripDetailsBtn');
  if (openTripBtn) openTripBtn.addEventListener('click', () => navigateTo('trip'));

  const arrivedBtn = document.getElementById('arrivedAtCustomerBtn');
  if (arrivedBtn) {
    arrivedBtn.addEventListener('click', () => {
      playChime('click');
      navigateTo('details');
    });
  }

  // Quick Preset Chips for Settlement
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      setQuickSettlement(chip.dataset.preset);
    });
  });

  initOtpInputs();
  initTheme();
  updateUI();

  // Close custom dropdowns on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.app-custom-dropdown')) {
      document.querySelectorAll('.app-custom-dropdown.open').forEach(dd => {
        dd.classList.remove('open');
      });
    }
  });

  // Trigger Top Chef branding splash loading sequence on app start
  triggerAppSplash();
});

// Expose globals for onclick handlers
window.navigateTo = navigateTo;
window.toggleBreak = toggleBreak;
window.showToast = showToast;
window.simulateLoading = simulateLoading;
window.triggerAppSplash = triggerAppSplash;
window.setAppTheme = setAppTheme;
window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;
window.openSettlementModal = openSettlementModal;
window.closeSettlementModal = closeSettlementModal;
window.submitSettlement = submitSettlement;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleOtpVerify = handleOtpVerify;
window.resendOtp = resendOtp;
window.logout = logout;
window.toggleCustomDropdown = toggleCustomDropdown;
window.selectDropdownOption = selectDropdownOption;
window.filterHistoryOrders = filterHistoryOrders;
