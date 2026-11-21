const data = window.CSM_DATA;
const sections = {
  essentials: { title: 'Quick Access', desc: 'Quick access to the most frequently visited tools.' },
  destinations: { title: 'Destination Guide', desc: 'Select your destination from the list below to find Airport, Hotel & Transport Information' },
  aircraft: { title: 'Aircraft Types', desc: 'Aircraft Seating Capacity and Registrations' },
  flightInfo: { title: 'Flight Information', desc: '' },
  flight: {
    title: 'Flight & Duty', desc: 'Flight & Duty Information',
    cards: [
      ['BASIC', 'Basic Maximum Daily FDP', 'Basic Maximum FDP is calculated from each crew member’s report time. It is then reduced according to the number of sectors operated as per the table.'],
      ['ACCLIMATISATION', 'Acclimatisation Checker', 'Check the acclimatisation state for a crew member leaving Dublin.'],
      ['NINTH CREW MEMBER', '9th Crew Member Protocol', 'When a transatlantic FDP is expected to exceed 13 hours, the CSM / No. 1 contacts the on-duty OCM and Crew Control to request a ninth crew member.']
    ]
  },
  ife: {
    title: 'IFE & Wi-Fi Quick Reference', desc: 'Flight opening and closing, seat resets, media support, and IFE power controls.',
    cards: [
      ['FLIGHT SETUP', 'Opening a flight', 'Sign in for the aircraft type, select the flight number, and wait for the flight dashboard.', [
        'Sign in using the IFE password for the aircraft type: A330 or A321.',
        'Enter the flight number, e.g. EI105.',
        'Press Select to choose a flight from the pre-defined list, then press Open Flight.',
        'Wait for the opening timer to finish. The IFE dashboard should appear.'
      ]],
      ['FLIGHT SETUP', 'Closing a flight', 'The system normally closes a flight automatically after parking at the gate. If it remains open, close it manually at the end of the flight.', [
        'From the main screen, open Dashboard using the button at the top right.',
        'Choose Close Flight at the bottom right.',
        'At the confirmation prompt, choose Yes.'
      ]],
      ['TROUBLESHOOTING', 'Resetting seats', 'Reset one or more selected seats when a seat’s IFE is not working correctly.', [
        'Choose Seats in the screen footer, then open the Seat Reset tab.',
        'Select one or more seats by entering seat numbers or using the seat map.',
        'Choose Reset. In the confirmation window, select Quick or Full, then confirm with Yes.',
        'When asked whether the issue is resolved, choose Yes if it is fixed. If a Quick reset did not help, choose No to continue to a Full reset.'
      ], 'Quick reset takes about 2 minutes and may resolve audio issues. A Full reset takes about 6–7 minutes and is intended for more persistent issues. Audio or video on the seats immediately ahead of and behind a seat being reset may be interrupted until the reset finishes.'],
      ['TROUBLESHOOTING', 'Sending media to a seat', 'Try Send Media if a seat issue remains after a Full reset. This may help, but it is not guaranteed to resolve the issue.', [
        'Choose Seats in the screen footer, then open the Send Media tab.',
        'Select one or more seats.',
        'Choose Enter Title, select or search for the media, then choose Done.',
        'Choose Send Media to send the selected title.'
      ], 'After media is sent, the passenger can control volume and screen brightness. Other playback controls, such as play, pause, and seek, must be operated from the Crew Terminal.'],
      ['PORT POWER', 'Port power control', 'Use Port Power Control if seat resets have not resolved an equipment or entertainment issue.', [
        'Choose System in the screen footer, then open Port Power Control.',
        'Select the seat. Use the up and down controls to view more seats if needed, then choose OK.',
        'Choose Reset to momentarily remove and automatically reapply power to the selected seat equipment.',
        'Use the Port Power ON / OFF control to enable or disable seat equipment power.'
      ], 'Port power can affect other seats connected to the same equipment. Review every affected seat shown on screen before proceeding.', 'warning'],
      ['SYSTEM RESTART', 'Power cycling the IFE system', 'For multiple IFE issues, the guide describes a full system power cycle followed by reopening the flight.', [
        'Close the flight first.',
        'Switch PAX SYS and VCI / VCC MAIN off.',
        'Wait about 10 minutes before powering the system back on.',
        'Switch PAX SYS and VCI / VCC MAIN back on as applicable. Allow about 7–10 minutes for the system to restart.',
        'Reopen the flight.'
      ], undefined, undefined, 'ife-card-wide'],
      ['WI-FI', 'Starlink Wi-Fi and connectivity', 'Starlink Wi-Fi remains active during an IFE system restart because it is controlled separately using the Flight Deck Starlink control.', ['If Starlink or connectivity issues occur, liaise with the Flight Deck and follow their troubleshooting steps.']]
    ]
  },
  crew: {
    title: 'Credits & Payments', desc: '',
    cards: [
      ['CREDITS', 'Credits & payment dates', 'Select a pay period to view its payroll and credit dates.'],
      ['COMMISSION', 'Commission', 'Current commission policy, calculation and payroll timing.'],
      ['EXPENSES', 'Expenses & allowances', 'Select an overnight location to view the allowance rate.']
    ]
  },
  roster: {
    title: 'Roster & Bids', desc: '',
    cards: [
      ['BID WINDOWS', 'Bid Windows', 'Roster bid windows and publication dates by roster period.']
    ]
  },
  contacts: { title: 'Useful Contacts & Links', desc: '' },
  feedback: { title: 'Missing / Incorrect Information', desc: 'Help improve AerKit by reporting incorrect or missing details, or sharing an app idea.' }
};

const content = document.querySelector('#content-area');
const search = document.querySelector('#search');
const results = document.querySelector('#search-results');
const sectionNavigation = document.querySelector('.section-navigation');
const sectionMenuToggle = document.querySelector('#section-menu-toggle');
const currentSectionLabel = document.querySelector('#current-section');
const themeToggle = document.querySelector('#theme-toggle');
const savedTheme = (() => { try { return localStorage.getItem('aerkit-theme'); } catch { return null; } })();
if (savedTheme === 'dark' || (!savedTheme && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.dataset.theme = 'dark';
themeToggle.setAttribute('aria-pressed', String(document.documentElement.dataset.theme === 'dark'));
themeToggle.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  try { localStorage.setItem('aerkit-theme', dark ? 'dark' : 'light'); } catch {}
});
let destinationClockTimer;

const destinationTimeZones = {
  DUB: 'Europe/Dublin',
  BOS: 'America/New_York', CUN: 'America/Cancun', ORD: 'America/Chicago', CLE: 'America/New_York',
  BDL: 'America/New_York', IND: 'America/Indiana/Indianapolis', LAX: 'America/Los_Angeles',
  MIA: 'America/New_York', BNA: 'America/Chicago', JFK: 'America/New_York', EWR: 'America/New_York',
  MCO: 'America/New_York', PHL: 'America/New_York', PIT: 'America/New_York', RDU: 'America/New_York',
  SFO: 'America/Los_Angeles', SEA: 'America/Los_Angeles', YYZ: 'America/Toronto', IAD: 'America/New_York'
};

const destinationAirportCoordinates = {
  BOS: [42.3656, -71.0096], CUN: [21.0365, -86.8771], ORD: [41.9742, -87.9073], CLE: [41.4117, -81.8498],
  BDL: [41.9389, -72.6832], IND: [39.7173, -86.2944], LAX: [33.9416, -118.4085], MIA: [25.7959, -80.287],
  BNA: [36.1263, -86.6774], JFK: [40.6413, -73.7781], EWR: [40.6895, -74.1745], MCO: [28.4312, -81.3081],
  PHL: [39.8744, -75.2424], PIT: [40.4959, -80.241], RDU: [35.8801, -78.788], SFO: [37.6213, -122.379],
  SEA: [47.4502, -122.3088], YYZ: [43.6777, -79.6248], IAD: [38.9531, -77.4565]
};
const destinationWeatherCache = new Map();

function setActive(id) {
  document.querySelectorAll('.quick-links button').forEach(button => {
    const isActive = button.dataset.section === id;
    button.classList.toggle('active', isActive);
    if (isActive) {
      button.setAttribute('aria-current', 'page');
      currentSectionLabel.textContent = button.dataset.label;
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function setSectionMenuOpen(isOpen) {
  sectionNavigation.classList.toggle('is-open', isOpen);
  sectionMenuToggle.setAttribute('aria-expanded', String(isOpen));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function heading(kicker, title, description) {
  return `<div class="section-head"><div>${kicker ? `<span class="section-kicker">${escapeHtml(kicker)}</span>` : ''}<h2>${escapeHtml(title)}</h2></div>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div>`;
}

function caution(text) {
  return `<div class="notice">${escapeHtml(text)}</div>`;
}

function renderUsefulContacts() {
  const renderGroup = (title, entries) => `<section class="useful-link-card"><h3>${escapeHtml(title)}</h3><div class="useful-link-list">${entries.map(entry => `<a class="useful-resource-link" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(entry.title)}</span><b aria-hidden="true">↗</b></a>`).join('')}</div></section>`;
  const contacts = (data.usefulContacts || []).map(contact => {
    const validPhone = contact.phone && /^[+()\d\s-]+$/.test(contact.phone);
    const routes = `${contactAction('EMAIL', contact.email, 'email')}${validPhone ? contactAction('CALL', contact.phone, 'phone') : contact.phone ? `<div class="contact-action contact-action-unverified"><span>PHONE · CHECK SOURCE</span><strong>${escapeHtml(contact.phone)}</strong></div>` : ''}`;
    return `<article class="useful-person-card"><h4>${escapeHtml(contact.name)}</h4><div class="contact-actions">${routes || '<span class="contact-missing">No contact route entered</span>'}</div></article>`;
  }).join('');
  content.innerHTML = heading('', sections.contacts.title, '')
    + `<div class="useful-link-grid">${renderGroup('Useful Links', data.usefulLinks || [])}${renderGroup('Useful Forms', data.usefulForms || [])}</div><section class="useful-contact-panel"><h3>Telephone &amp; Email Contacts</h3><div class="useful-contact-grid">${contacts}</div></section>`;
}

function renderFeedbackPage() {
  const destinationOptions = [...data.destinations]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(destination => `<option value="${escapeHtml(destination.code)}">${escapeHtml(destination.name)} (${escapeHtml(destination.code)})</option>`)
    .join('');
  content.innerHTML = heading('FEEDBACK', sections.feedback.title, sections.feedback.desc)
    + `<article class="card feedback-card">
      <p>Choose what your feedback relates to, then describe the information that should be added or corrected.</p>
      <form id="feedback-form" class="feedback-form">
        <label class="flight-field"><span>Feedback type</span><select id="feedback-category" required><option value="">Select a category</option><option>Airport Information</option><option>Outstation Contact Information</option><option>Hotel Information</option><option>Other</option><option>App Idea Suggestions</option></select></label>
        <label class="flight-field" id="feedback-destination-wrap" hidden><span>Destination</span><select id="feedback-destination"><option value="">Select destination</option>${destinationOptions}</select></label>
        <label class="flight-field feedback-detail-field"><span id="feedback-detail-label">Suggested Correction</span><textarea id="feedback-detail" rows="4" required placeholder="Describe the suggested correction"></textarea></label>
        <label class="flight-field feedback-context-field"><span>Source or evidence (optional)</span><textarea id="feedback-context" rows="3" placeholder="Add a document name, link, date checked, or other evidence"></textarea></label>
        <div class="feedback-actions"><button class="feedback-submit" type="submit">Save Feedback</button><button class="feedback-copy" type="button" id="feedback-copy" hidden>Copy report</button></div>
        <p id="feedback-status" class="feedback-status" role="status" aria-live="polite"></p>
      </form>
    </article>`;
}

function initFeedbackPage() {
  const form = content.querySelector('#feedback-form');
  if (!form) return;
  const category = form.querySelector('#feedback-category');
  const destinationWrap = form.querySelector('#feedback-destination-wrap');
  const destination = form.querySelector('#feedback-destination');
  const detailLabel = form.querySelector('#feedback-detail-label');
  const detail = form.querySelector('#feedback-detail');
  const status = form.querySelector('#feedback-status');
  const copyButton = form.querySelector('#feedback-copy');
  let savedReport = '';
  const updateFields = () => {
    const selected = category.value;
    const idea = selected === 'App Idea Suggestions';
    const needsDestination = ['Airport Information', 'Outstation Contact Information', 'Hotel Information'].includes(selected);
    destinationWrap.hidden = !needsDestination;
    destination.required = needsDestination;
    if (!needsDestination) destination.value = '';
    detailLabel.textContent = idea ? 'App Idea Suggestion' : 'Suggested Correction';
    detail.placeholder = idea ? 'Describe the app idea or improvement' : 'Describe the suggested correction';
  };
  category.addEventListener('change', updateFields);
  form.addEventListener('reset', () => setTimeout(updateFields));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = category.value;
    const destinationName = !destinationWrap.hidden && destination.value ? destination.options[destination.selectedIndex].textContent : '';
    const extra = form.querySelector('#feedback-context').value.trim();
    const lines = [
      'AerKit Feedback',
      `Category: ${selected}`,
      ...(destinationName ? [`Destination: ${destinationName}`] : []),
      `${selected === 'App Idea Suggestions' ? 'App idea suggestion' : 'Suggested correction'}: ${detail.value.trim()}`,
      ...(extra ? [`Source or evidence: ${extra}`] : [])
    ];
    savedReport = lines.join('\n\n');
    try { localStorage.setItem('aerkit-feedback-draft', savedReport); } catch {}
    status.textContent = 'Feedback saved on this device. Copy the report if you want to share it.';
    copyButton.hidden = false;
  });
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(savedReport);
      status.textContent = 'Feedback report copied.';
    } catch {
      status.textContent = 'Clipboard unavailable. Your feedback remains saved on this device.';
    }
  });
  updateFields();
}

function renderCards(cards) {
  return `<div class="card-grid">${cards.map(card => {
    if (card[0] === 'BASIC') return renderBasicFdpCard(card);
    if (card[0] === 'ACCLIMATISATION') return renderAcclimatisationCard(card);
    if (card[0] === 'NINTH CREW MEMBER') return renderNinthCrewCard(card);
    if (card[0] === 'COMMISSION') return renderCommissionCard();
    if (card[0] === 'BID WINDOWS') return renderBidWindowsCard();
    if (card[0] === 'CREDITS') return renderCreditDatesCard();
    if (card[0] === 'EXPENSES') return renderOvernightAllowancesCard();
    return `<article class="card"><span class="card-tag">${escapeHtml(card[0])}</span><h3>${escapeHtml(card[1])}</h3><p>${escapeHtml(card[2])}</p></article>`;
  }).join('')}</div>`;
}

function renderIfeQuickReference() {
  const cards = sections.ife.cards.map(card => {
    const steps = (card[3] || []).length
      ? `<ol class="ife-steps">${card[3].map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`
      : '';
    const note = card[4]
      ? `<div class="ife-note${card[5] === 'warning' ? ' is-warning' : ''}">${escapeHtml(card[4])}</div>`
      : '';
    const cardClass = `card ife-reference-card${card[6] ? ` ${escapeHtml(card[6])}` : ''}`;
    return `<article class="${cardClass}"><span class="card-tag">${escapeHtml(card[0])}</span><h3>${escapeHtml(card[1])}</h3><p>${escapeHtml(card[2])}</p>${steps}${note}</article>`;
  }).join('');
  content.innerHTML = heading('', sections.ife.title, sections.ife.desc)
    + `<div class="card-grid ife-reference-grid">${cards}</div>`;
}

const overnightAllowanceGroups = data.overnightAllowanceGroups || [];

function renderOvernightAllowancesCard() {
  const options = overnightAllowanceGroups.map((group, index) => `<option value="${index}">${escapeHtml(group.name)}</option>`).join('');
  return `<article class="card overnight-allowance-card"><span class="card-tag">EXPENSES</span><h3>Overnight Allowances</h3>
    <p>Rates effective 1 October 2025 (${escapeHtml(data.overnightAllowanceVersion || 'Winter 2025 Version 1')}). Select the location and duration; select your role where required.</p>
    <div class="overnight-allowance-controls">
      <label class="flight-field"><span>Location</span><select id="allowance-location"><option value="">Select location</option>${options}</select></label>
      <label class="flight-field"><span>Duration</span><select id="allowance-duration" disabled><option value="">Select duration</option></select></label>
      <label class="flight-field allowance-role-field" hidden><span>Crew Role</span><select id="allowance-role"><option value="">Select role</option><option>Captain</option><option>First Officer</option><option>Cabin Manager</option><option>Cabin Crew</option></select></label>
    </div>
    <div class="overnight-allowance-result" id="allowance-result" aria-live="polite"><span>Allowance</span><strong>Select location and duration</strong></div>
  </article>`;
}

function initOvernightAllowances() {
  const location = content.querySelector('#allowance-location');
  const duration = content.querySelector('#allowance-duration');
  const roleField = content.querySelector('.allowance-role-field');
  const role = content.querySelector('#allowance-role');
  const result = content.querySelector('#allowance-result');
  if (!location || !duration || !role || !result) return;
  let selectedGroup = null;
  const updateResult = () => {
    if (!selectedGroup || duration.value === '') {
      result.innerHTML = '<span>Allowance</span><strong>Select location and duration</strong>';
      return;
    }
    let amount;
    if (selectedGroup.roles) {
      amount = role.value ? selectedGroup.roles[role.value][Number(duration.value)] : null;
    } else {
      amount = Object.values(selectedGroup.durations)[Number(duration.value)];
    }
    result.innerHTML = amount == null
      ? '<span>Allowance</span><strong>Select crew role</strong>'
      : `<span>${escapeHtml(selectedGroup.name)} · ${escapeHtml(duration.options[duration.selectedIndex].textContent)}${role.value && selectedGroup.roles ? ` · ${escapeHtml(role.value)}` : ''}</span><strong>${escapeHtml(selectedGroup.currency)}${Number(amount).toFixed(2)}</strong>`;
  };
  location.addEventListener('change', () => {
    selectedGroup = location.value === '' ? null : overnightAllowanceGroups[Number(location.value)];
    const bands = selectedGroup ? (selectedGroup.bands || Object.keys(selectedGroup.durations)) : [];
    duration.innerHTML = `<option value="">Select duration</option>${bands.map((band, index) => `<option value="${index}">${escapeHtml(band)}</option>`).join('')}`;
    duration.disabled = !selectedGroup;
    roleField.hidden = !selectedGroup?.roles;
    role.value = '';
    updateResult();
  });
  duration.addEventListener('change', updateResult);
  role.addEventListener('change', updateResult);
}

function renderCreditDatesCard() {
  const options = (data.creditPeriods || []).map(period => `<option value="${escapeHtml(period.period)}">${escapeHtml(period.period)}</option>`).join('');
  return `<article class="card credit-dates-card"><span class="card-tag">CREDITS</span><h3>Credits &amp; Payment Dates</h3>
    <p>Select a pay period to view its payroll and credit dates. Current Credit Value: <strong>€5.83</strong>.</p>
    <label class="flight-field credit-period-control"><span>Pay Period</span><select id="credit-period-select"><option value="">Select pay period</option>${options}</select></label>
    <div id="credit-period-details" class="credit-period-details" hidden></div>
  </article>`;
}

function initCreditDatesCard() {
  const select = content.querySelector('#credit-period-select');
  const details = content.querySelector('#credit-period-details');
  if (!select || !details) return;
  select.addEventListener('change', () => {
    const period = (data.creditPeriods || []).find(item => item.period === select.value);
    if (!period) {
      details.hidden = true;
      details.innerHTML = '';
      return;
    }
    details.innerHTML = `<h4>${escapeHtml(period.period)}</h4><dl class="credit-date-grid"><div><dt>Payroll Period Start Date</dt><dd>${escapeHtml(period.payrollStart)}</dd></div><div><dt>Payroll Period End Date</dt><dd>${escapeHtml(period.payrollEnd)}</dd></div><div><dt>Credit Period Start Date</dt><dd>${escapeHtml(period.creditStart)}</dd></div><div><dt>Credit Period End Date</dt><dd>${escapeHtml(period.creditEnd)}</dd></div></dl><div class="credit-pay-date-hero"><span>PAY DATE</span><strong>${escapeHtml(period.payDate)}</strong></div>`;
    details.hidden = false;
  });
}

function renderBidWindowsCard() {
  const options = (data.rosterBidPeriods || []).map(period => `<option value="${escapeHtml(period.period)}">${escapeHtml(period.period)}</option>`).join('');
  return `<article class="card bid-window-card"><span class="card-tag">BID WINDOWS</span><h3>Bid Windows</h3>
    <p>Select a roster period to view its bid window, roster publication date, and WR &amp; PR request period.</p>
    <label class="flight-field credit-period-control"><span>Roster Period</span><select id="roster-period-select"><option value="">Select roster period</option>${options}</select></label>
    <div id="roster-period-details" class="credit-period-details" hidden></div>
  </article>`;
}

function initBidWindowsCard() {
  const select = content.querySelector('#roster-period-select');
  const details = content.querySelector('#roster-period-details');
  if (!select || !details) return;
  select.addEventListener('change', () => {
    const period = (data.rosterBidPeriods || []).find(item => item.period === select.value);
    if (!period) {
      details.hidden = true;
      details.innerHTML = '';
      return;
    }
    details.innerHTML = `<h4>${escapeHtml(period.period)}</h4><dl class="credit-date-grid roster-date-grid"><div><dt>Open Bid Window</dt><dd>${escapeHtml(period.openBid)}</dd></div><div><dt>Close Bid Window</dt><dd>${escapeHtml(period.closeBid)}</dd></div><div><dt>WR &amp; PR Request Period Start</dt><dd>${escapeHtml(period.wrPrStart)}</dd></div><div><dt>WR &amp; PR Request Period End</dt><dd>${escapeHtml(period.wrPrEnd)}</dd></div></dl><div class="credit-pay-date-hero roster-publication-hero"><span>ROSTER PUBLICATION DATE</span><strong>${escapeHtml(period.rosterPublication)}</strong></div>`;
    details.hidden = false;
  });
}

function renderCommissionCard() {
  return `<article class="card commission-card"><span class="card-tag">COMMISSION</span><h3>Commission Calculator</h3>
    <p>Current Commission Rate: <strong>12%</strong></p>
    <p>All sales are pooled and equally split among operating crew.</p>
    <p>The calculator below can give you an estimated Commission Total.</p>
    <div class="commission-calculator" id="commission-calculator">
      <label class="flight-field"><span>Total Recorded Sales (€)</span><input id="commission-sales" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00"></label>
      <label class="flight-field"><span>No. of Crew (3–12)</span><input id="commission-crew" type="number" min="3" max="12" step="1" inputmode="numeric" value="0"></label>
      <div class="commission-result"><span>Estimated Commission Total</span><strong id="commission-result">—</strong><small>per crew member</small></div>
    </div>
  </article>`;
}

function initCommissionCalculator() {
  const calculator = content.querySelector('#commission-calculator');
  if (!calculator) return;
  const sales = calculator.querySelector('#commission-sales');
  const crew = calculator.querySelector('#commission-crew');
  const result = calculator.querySelector('#commission-result');
  const currency = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
  const calculate = () => {
    const salesValue = Number(sales.value);
    const crewValue = Number(crew.value);
    result.textContent = sales.value !== '' && crew.value !== '' && salesValue >= 0 && Number.isInteger(crewValue) && crewValue >= 3 && crewValue <= 12
      ? currency.format((salesValue * 0.12) / crewValue)
      : '—';
  };
  calculator.addEventListener('input', calculate);
}

const basicFdpRows = [
    ['06:00–13:29', '13:00', '12:30', '12:00'], ['13:30–13:59', '12:45', '12:15', '11:45'],
    ['14:00–14:29', '12:30', '12:00', '11:30'], ['14:30–14:59', '12:15', '11:45', '11:15'],
    ['15:00–15:29', '12:00', '11:30', '11:00'], ['15:30–15:59', '11:45', '11:15', '10:45'],
    ['16:00–16:29', '11:30', '11:00', '10:30'], ['16:30–16:59', '11:15', '10:45', '10:15'],
    ['17:00–04:59', '11:00', '10:30', '10:00'], ['05:00–05:14', '12:00', '11:30', '11:00'],
    ['05:15–05:29', '12:15', '11:45', '11:15'], ['05:30–05:44', '12:30', '12:00', '11:30'],
    ['05:45–05:59', '12:45', '12:15', '11:45']
];

function renderBasicFdpCard(card) {
  const reportOptions = basicFdpRows.map(([reportTime], index) => `<option value="${index}">${reportTime}</option>`).join('');
  return `<article class="card fdp-card"><span class="card-tag">${escapeHtml(card[0])}</span><h3>${escapeHtml(card[1])}</h3>
    <p>Pick your report-time band, then the number of sectors to be operated. This will calculate your <strong>basic</strong> maximum FDP allowable under EASA FTL's.</p>
    <p class="fdp-acclim-prompt">Check Acclimatisation state below if you are starting your Duty away from your Home Base after 48hrs from your starting report time.</p>
    <form class="acclim-checker" id="basic-fdp-checker">
      <label class="acclim-field"><span>Report time (reference time)</span><select name="reportTime" required><option value="">Select report-time band</option>${reportOptions}</select></label>
      <label class="acclim-field"><span>Sectors operated</span><select name="sectors" required><option value="">Select sectors</option><option value="1">1–2 sectors</option><option value="2">3 sectors</option><option value="3">4 sectors</option></select></label>
      <div class="acclim-actions"><button class="acclim-calculate" type="submit">Check maximum FDP</button><button class="acclim-reset" type="reset">Reset</button></div>
      <div class="acclim-result fdp-basic-result" id="basic-fdp-result" role="status" aria-live="polite" hidden></div>
    </form>
    <p class="acclim-note">This is a basic FDP estimate. Ensure all collective agreements are also followed and applied where necessary.</p>
  </article>`;
}

function renderAcclimatisationCard(card) {
  return `<article class="card fdp-card"><span class="card-tag">${escapeHtml(card[0])}</span><h3>${escapeHtml(card[1])}</h3><p>If you report for duty in Ireland, you are assumed to be acclimatised to Home Base time. Your acclimatisation state at your next outstation report depends on the time elapsed since your Home Base report and the time difference at the outstation.</p><form class="acclim-checker" id="acclim-checker"><label class="acclim-field"><span>Time Difference between Home Base &amp; Next Report Location</span><select name="difference" required><option value="">Select time difference</option><option value="0">Less than 4 hours</option><option value="1">4 to 6 hours</option><option value="2">More than 6 to 9 hours</option><option value="3">More than 9 to 12 hours</option></select></label><label class="acclim-field"><span>Time from Home Base Report until next report time</span><select name="elapsed" required><option value="">Select elapsed time</option><option value="0">Less than 48 hours</option><option value="1">48 to 71 hours 59 minutes</option><option value="2">72 to 95 hours 59 minutes</option><option value="3">96 to 119 hours 59 minutes</option><option value="4">120 hours or more</option></select></label><div class="acclim-actions"><button class="acclim-calculate" type="submit">Check acclimatisation</button><button class="acclim-reset" type="reset">Reset</button></div><div class="acclim-result" id="acclim-result" role="status" aria-live="polite" hidden></div></form><p class="acclim-note">This checker uses the information from EASA ORO.FTL.105 Definitions.</p></article>`;
}

content.addEventListener('submit', event => {
  if (event.target.id === 'basic-fdp-checker') {
    event.preventDefault();
    const reportTime = event.target.elements.reportTime.value;
    const sectors = event.target.elements.sectors.value;
    const result = event.target.querySelector('#basic-fdp-result');
    const form = event.target;
    if (reportTime === '' || sectors === '') return;
    const maximumBasicFdp = basicFdpRows[Number(reportTime)][Number(sectors)];
    result.innerHTML = `<div class="acclim-result-copy"><strong>Maximum Basic FDP</strong><p class="fdp-basic-result-time">${escapeHtml(maximumBasicFdp)}</p><p>Based on report-time band ${escapeHtml(form.elements.reportTime.selectedOptions[0].textContent)} and ${escapeHtml(form.elements.sectors.selectedOptions[0].textContent)}. Reference time zone follows the crew member’s acclimatisation state.</p></div>`;
    result.hidden = false;
    return;
  }
  if (event.target.id !== 'acclim-checker') return;
  event.preventDefault();
  const form = event.target;
  const difference = form.elements.difference.value;
  const elapsed = form.elements.elapsed.value;
  const result = form.querySelector('#acclim-result');
  if (difference === '' || elapsed === '') return;
  const matrix = [['B','D','D','D','D'],['B','X','D','D','D'],['B','X','X','D','D'],['B','X','X','X','D']];
  const code = matrix[Number(difference)][Number(elapsed)];
  const meanings = {
    B: ['Use Dublin home-base time', 'You are acclimatised to Dublin time. Use Dublin local time as your reference when determining the maximum daily FDP.'],
    D: ['Use outstation local time', 'You are acclimatised to the local time where your next duty starts. Use that local time when determining the maximum daily FDP.'],
    X: ['Unknown acclimatisation state', 'Your acclimatisation state is unknown. The duty start time no longer determines the maximum daily FDP; apply the sector-based cap below.']
  };
  const [title, description] = meanings[code];
  result.dataset.state = code;
  const sectorCaps = code === 'X' ? '<p class="acclim-cap-title"><strong>Maximum daily FDP cap</strong></p><ul class="acclim-cap-list"><li><b>1–2 sectors</b><span>11:00</span></li><li><b>3 sectors</b><span>10:30</span></li><li><b>4 sectors</b><span>10:00</span></li></ul>' : '';
  result.innerHTML = `<span class="acclim-result-code">${code}</span><div class="acclim-result-copy"><strong>${title}</strong><p>${description}</p>${sectorCaps}</div>`;
  result.hidden = false;
});
content.addEventListener('reset', event => {
  if (!['acclim-checker', 'basic-fdp-checker'].includes(event.target.id)) return;
  const result = event.target.querySelector(event.target.id === 'acclim-checker' ? '#acclim-result' : '#basic-fdp-result');
  result.hidden = true;
  delete result.dataset.state;
  result.textContent = '';
});
content.addEventListener('input', event => {
  if (['ninth-report-time', 'ninth-pushback-time', 'ninth-flight-hours', 'ninth-flight-minutes', 'ninth-extra-info'].includes(event.target.id)) updateNinthCrewEstimate();
});
content.addEventListener('click', event => {
  const resetButton = event.target.closest('#ninth-reset-calculator');
  if (!resetButton) return;
  const estimator = resetButton.closest('.ninth-estimator');
  estimator.querySelectorAll('input, select, textarea').forEach(field => { field.value = ''; });
  updateNinthCrewEstimate();
  estimator.querySelector('#ninth-flight-number')?.focus();
});
content.addEventListener('change', event => {
  if (event.target.id === 'ninth-flight-number') {
    const flight = event.target.value === '' ? null : data.flightSchedule[Number(event.target.value)];
    const destination = document.getElementById('ninth-destination');
    if (destination) destination.value = flight?.destinationCode || '';
    updateNinthCrewEstimate();
  }
  if (event.target.id === 'ninth-destination') {
    const flightSelect = document.getElementById('ninth-flight-number');
    const flight = flightSelect?.value === '' ? null : data.flightSchedule[Number(flightSelect?.value)];
    if (flight && flight.destinationCode !== event.target.value) flightSelect.value = '';
    updateNinthCrewEstimate();
  }
});

function renderNinthCrewCard(card) {
  const destinationOptions = [...data.destinations].sort((a, b) => a.name.localeCompare(b.name)).map(destination => `<option value="${escapeHtml(destination.code)}">${escapeHtml(destination.name)} (${escapeHtml(destination.code)})</option>`).join("");
  const flightOptions = data.flightSchedule.map((flight, index) => `<option value="${index}">${escapeHtml(flight.flightNumber)}</option>`).join('');
  return `<article class="card fdp-card"><span class="card-tag">${escapeHtml(card[0])}</span><h3>${escapeHtml(card[1])}</h3><p>The 9th Crew Member Protocol applies to transatlantic flights when it becomes apparent that the FDP will exceed 13 hours.</p><div class="protocol-steps"><section><h4>Starting the Process</h4><p>When this is known, the CSM / No. 1 should liaise with the on-duty Operations Crew Manager (OCM) and Crew Control to advise them that a 9th Crew Member is required.</p></section><section><h4>Required Information</h4><p>When contacting the OCM and Crew Control, provide all relevant information available, such as:</p><ul class="protocol-info-list"><li>Nature of the delay</li><li>Expected duration of the delay</li><li>Planned flight time</li><li>Planned taxi time for departure and arrival</li><li>Any other relevant information</li></ul></section><section><h4>When the ninth is provided</h4><p>The ninth crew member is surplus to the operating crew and should be used to support in-flight rest. Duty and rest should remain balanced among the operating cabin crew.</p></section><section><h4>If a 9th Crew Member is <em>NOT</em> Provided</h4><p>The CSM should inform the remaining operating crew and explain why a 9th Crew Member may not be available. If none is available, each operating crew member will receive the applicable approved short-crew credit shown below.</p></section></div><div class="protocol-credits"><h4>Short-Crew Credits</h4><table class="fdp-table protocol-credit-table"><thead><tr><th scope="col">Situation in the protocol</th><th scope="col">Credits per crew member</th></tr></thead><tbody><tr><th scope="row">Known delay: FDP exceeds 13 hours and no 9th Crew Member is provided when requested</th><td>28</td></tr><tr><th scope="row">Unknown delay: maximum FDP exceeds 13 h 15 min</th><td>28</td></tr><tr><th scope="row">Unknown delay: maximum FDP is less than 13 h 15 min</th><td>10</td></tr></tbody></table></div><section class="ninth-estimator" aria-labelledby="ninth-estimator-title"><span class="card-tag">ESTIMATE</span><h4 id="ninth-estimator-title">9th Crew Member Estimator</h4><p>Estimate overall duty time from crew report through estimated pushback, flight and arrival taxi.</p><div class="ninth-flight-route-fields"><label class="acclim-field"><span>Flight Number</span><select id="ninth-flight-number" aria-label="Flight Number"><option value="">Select flight number</option>${flightOptions}</select></label><label class="acclim-field"><span>Destination</span><select id="ninth-destination"><option value="">Select destination</option>${destinationOptions}</select></label></div><div class="ninth-estimator-fields"><label class="acclim-field"><span>Crew report time</span><input id="ninth-report-time" type="time" aria-label="Crew report time"></label><label class="acclim-field"><span>Estimated pushback time</span><input id="ninth-pushback-time" type="time" aria-label="Estimated pushback time"></label><fieldset class="flight-field ninth-flight-time"><legend>Flight time</legend><div><label><input id="ninth-flight-hours" type="number" min="0" max="30" step="1" inputmode="numeric" placeholder="0" aria-label="Flight time hours"><small>hours</small></label><b>:</b><label><input id="ninth-flight-minutes" type="number" min="0" max="59" step="1" inputmode="numeric" placeholder="00" aria-label="Flight time minutes"><small>minutes</small></label></div></fieldset></div><label class="acclim-field ninth-extra-field"><span>Additional information (optional)</span><textarea id="ninth-extra-info" rows="3" placeholder="Add details to include in the request"></textarea></label><p class="ninth-estimator-assumption">This estimator includes an average 15-minute taxi time for departure and arrival. It is not a Maximum FDP calculator.</p><div id="ninth-estimator-result" class="ninth-estimator-result" role="status" aria-live="polite" hidden></div><button class="ninth-reset-button" id="ninth-reset-calculator" type="button">Reset Calculator</button></section><small class="fdp-source-note">Protocol dated 14 December 2018 · addendum dated 12 September 2019.</small></article>`;
}

function updateNinthCrewEstimate() {
  const reportTime = document.getElementById('ninth-report-time')?.value;
  const pushbackTime = document.getElementById('ninth-pushback-time')?.value;
  const hoursValue = document.getElementById('ninth-flight-hours')?.value;
  const minutesValue = document.getElementById('ninth-flight-minutes')?.value;
  const result = document.getElementById('ninth-estimator-result');
  if (!result) return;
  if (!reportTime || !pushbackTime || (hoursValue === '' && minutesValue === '')) {
    result.hidden = true;
    result.removeAttribute('data-state');
    result.innerHTML = '';
    return;
  }
  const [reportHour, reportMinute] = reportTime.split(':').map(Number);
  const [pushbackHour, pushbackMinute] = pushbackTime.split(':').map(Number);
  const hours = Number(hoursValue || 0);
  const minutes = Number(minutesValue || 0);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 30 || minutes < 0 || minutes > 59) {
    result.hidden = true;
    return;
  }
  const reportMinutes = reportHour * 60 + reportMinute;
  const pushbackMinutes = pushbackHour * 60 + pushbackMinute;
  const preDepartureMinutes = (pushbackMinutes - reportMinutes + 1440) % 1440;
  const estimatedDuration = preDepartureMinutes + hours * 60 + minutes + 30;
  const completionMinutes = reportMinutes + estimatedDuration;
  const finishTime = `${String(Math.floor((completionMinutes % 1440) / 60)).padStart(2, '0')}:${String(completionMinutes % 60).padStart(2, '0')}`;
  const nextDay = completionMinutes >= 1440 ? ' (next day)' : '';
  const durationText = `${Math.floor(estimatedDuration / 60)} hr ${String(estimatedDuration % 60).padStart(2, '0')} min`;
  let state, resultMessage, callButton = '', emailButton = '';
  if (estimatedDuration < 12 * 60 + 45) {
    state = 'green';
    resultMessage = `Your estimated duty time will be ${durationText}. Therefore, it is unlikely that you will require a 9th Crew Member.`;
  } else if (estimatedDuration < 13 * 60) {
    state = 'amber';
    resultMessage = `Your estimated duty time will be ${durationText}. Therefore, if you encounter further delays you may require a 9th Crew Member. Revise your estimates as more information becomes available.`;
  } else {
    state = 'red';
    resultMessage = `Your estimated duty time will be ${durationText}. Therefore, per protocol, you should request a 9th Crew Member. You can call or email Inflight Operations below to provide them with the information.`;
    callButton = '<a class="ninth-call-button" href="tel:+35318868600">Call Inflight Operations</a>';
    const emailAddress = (data.usefulContacts || []).find(contact => contact.name === 'Inflight Operations')?.email || 'crewoperations@aerlingus.com';
    const flightNumberSelect = document.getElementById('ninth-flight-number');
    const selectedFlight = flightNumberSelect?.value === '' ? null : data.flightSchedule[Number(flightNumberSelect?.value)];
    const flightNumber = selectedFlight?.flightNumber || 'Not entered';
    const destinationCode = document.getElementById('ninth-destination')?.value;
    const destination = data.destinations.find(item => item.code === destinationCode);
    const extraInfo = document.getElementById('ninth-extra-info')?.value.trim() || 'None provided';
    const emailBody = [
      'Hello Inflight Operations,', '',
      'I am writing to request the provision of a 9th Crew Member for the following flight.', '',
      `Flight Number: ${flightNumber}`,
      `Destination: ${destination ? `${destination.name} (${destination.code})` : 'Not entered'}`, '',
      `Crew report time: ${reportTime}`,
      `Estimated pushback time: ${pushbackTime}`,
      `Flight time: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      `Estimated duty time: ${durationText}`,
      `Estimated Chox On: ${finishTime}${nextDay}`, '',
      
      `Additional information: ${extraInfo}`, '',
      'Please advise on the availability of a 9th Crew Member. If none is available, can you provide me with the explanation so I can brief my crew and ensure all are listed for the appropriate Credit Payment if none is available.', '',
      'Kind regards,'
    ].join('\n');
    emailButton = `<a class="ninth-email-button" href="mailto:${encodeURI(emailAddress)}?subject=${encodeURIComponent('Request for 9th Crew Member')}&body=${encodeURIComponent(emailBody)}">Email Inflight Operations</a>`;
  }
  result.dataset.state = state;
  const contactActions = callButton || emailButton ? `<div class="ninth-contact-actions">${callButton}${emailButton}</div>` : '';
  result.innerHTML = `<div class="ninth-estimate-details"><strong>Result</strong><b>${escapeHtml(resultMessage)}</b></div>${contactActions}`;
  result.hidden = false;
}

function renderDestinations() {
  clearInterval(destinationClockTimer);
  const list = [...data.destinations].sort((a, b) => a.name.localeCompare(b.name)).map(destination => {
    return `<button class="destination" data-destination="${escapeHtml(destination.code)}"><strong>${escapeHtml(destination.name)}</strong><span>${escapeHtml(destination.code)}</span></button>`;
  }).join('');
  content.innerHTML = heading('', sections.destinations.title, sections.destinations.desc)
    + `<div class="destination-list">${list}</div>`;
  content.querySelectorAll('[data-destination]').forEach(button => button.onclick = () => openDestination(button.dataset.destination));
}

function renderDestinationProfile(destination) {
  const facts = data.destinationFacts.map((fact, index) => ({ ...fact, searchIndex: index })).filter(fact => fact.code === destination.code);
  const metadata = `<div class="profile-meta"><div><span>TIME AT DUBLIN</span><strong id="dublin-current-time">Calculating…</strong></div><div><span>TIME AT DESTINATION</span><strong id="destination-current-time">Calculating…</strong></div><div><span>CURRENT WEATHER AT AIRPORT</span><strong id="destination-weather" aria-live="polite">Loading weather…</strong><small class="weather-attribution">Weather by <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a></small></div></div><p class="destination-freshness">Source: destination source register · Checked ${escapeHtml(data.informationLastUpdated || 'date unknown')}. Record confidence: unknown unless the record itself states otherwise.</p>`;
  if (!facts.length) {
    return metadata + `<div class="empty"><strong>No destination details entered yet</strong>This location is present in the destination index, but the source register has no detailed records for it.</div>`;
  }
  const grouped = new Map();
  facts.forEach(fact => {
    // Earlier register rows stored these two duty contacts under Handling & Operations.
    const isDutyContact = /^Duty Manager(?: Email| Phone)?$/.test(fact.field);
    const category = fact.category === 'Handling & Operations' && isDutyContact
      ? 'Turnaround Coordination'
      : fact.category;
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category).push(fact);
  });
  const cards = [...grouped.entries()].map(([category, categoryFacts]) => {
    if (category === 'Handling & Operations') return renderHandlingCard(categoryFacts);
    if (category === 'Turnaround Coordination') return renderTurnaroundCard(categoryFacts);
    if (category === 'Hotel Amenities') return renderHotelAmenities(categoryFacts);
    const records = categoryFacts.map(fact => {
      const mapLink = destinationMapLink(fact, destination);
      const contact = destinationContactValue(fact);
      const value = contact || `<div class="profile-value">${escapeHtml(fact.value || 'No value entered')}</div>`;
      return `<div class="profile-record" id="destination-fact-${fact.searchIndex}"><div class="profile-record-heading"><strong>${escapeHtml(fact.field)}</strong></div>${value}${mapLink}</div>`;
    }).join('');
    const cardClass = category === 'Crew Transport' ? 'card profile-card crew-transport-card' : 'card profile-card';
    return `<article class="${cardClass}"><span class="card-tag">${escapeHtml(category)}</span><div class="profile-fields">${records}</div></article>`;
  }).join('');
  return metadata + `<div class="card-grid profile-grid">${cards}</div>`;
}

function renderHotelAmenities(facts) {
  const labels = {
    'accepts packages': 'Packages',
    'in-room fridge': 'Fridge',
    'in-room fridge availability': 'Fridge',
    'food discount': 'F&B Discount',
    'fitness centre': 'Gym'
  };
  const items = facts.map(fact => {
    const field = fact.field.trim().toLowerCase();
    const label = labels[field] || (field === 'pool' ? 'Pool' : fact.field);
    const value = String(fact.value || '').trim();
    const normalized = value.toLowerCase();
    let status;
    if (normalized === 'yes') {
      status = '<span class="amenity-status is-yes" role="img" aria-label="Yes">✓</span>';
    } else if (normalized === 'yes (fee payable)') {
      status = '<span class="amenity-status-group" role="img" aria-label="Yes, fee payable"><span class="amenity-status is-yes" aria-hidden="true">✓</span><span class="amenity-status is-fee-mark" aria-hidden="true">$</span></span>';
    } else if (normalized === 'no') {
      status = '<span class="amenity-status is-no" role="img" aria-label="No">×</span>';
    } else if (normalized === 'none') {
      status = '<span class="amenity-status is-no" role="img" aria-label="None">×</span>';
    } else if (normalized === 'by request') {
      status = '<span class="amenity-status is-request" role="img" aria-label="By request"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.25 4.25h13.5v9.5H9l-4.25 3v-3H3.25z"/><path d="M6.5 9h.01M10 9h.01M13.5 9h.01"/></svg></span>';
    } else if (normalized === 'food & drinks') {
      status = `<span class="amenity-status-group" role="img" aria-label="Food and drinks">${mealAmenityIcon()}${drinkAmenityIcon()}</span>`;
    } else if (normalized === 'food only') {
      status = `<span class="amenity-status-group" role="img" aria-label="Food only">${mealAmenityIcon()}</span>`;
    } else {
      status = `<span class="amenity-value">${escapeHtml(value || 'Not listed')}</span>`;
    }
    return `<div class="amenity-item"${fact.searchIndex !== undefined ? ` id="destination-fact-${fact.searchIndex}"` : ''}><strong>${escapeHtml(label)}</strong>${status}</div>`;
  }).join('');
  return `<article class="card profile-card hotel-amenities-card"><span class="card-tag">Hotel Amenities</span><div class="amenity-grid">${items}</div></article>`;
}

function mealAmenityIcon() {
  return '<span class="amenity-status is-food" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4 2v5M2 2v3a2 2 0 0 0 4 0V2M4 7v11M14 2v16M14 2c3 2 4 5 0 8"/></svg></span>';
}

function drinkAmenityIcon() {
  return '<span class="amenity-status is-food" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M3 3h14l-7 7-7-7ZM10 10v7M6 18h8M15 2l2-1"/></svg></span>';
}

function destinationMapLink(fact, destination) {
  if (fact.field.trim().toLowerCase() !== 'hotel address') return '';
  const queryParts = [fact.value, destination.name, destination.country];
  const query = [...new Set(queryParts.filter(Boolean))].join(', ');
  const url = `https://maps.apple.com/place?address=${encodeURIComponent(query)}`;
  return `<a class="map-action" href="${escapeHtml(url)}" target="_blank" rel="noopener">OPEN IN MAPS ↗</a>`;
}

function destinationContactValue(fact) {
  const field = fact.field.trim().toLowerCase();
  if (/email$/.test(field)) return contactAction('EMAIL', fact.value, 'email');
  if (/(?:phone|telephone)$/.test(field)) return contactAction('CALL', fact.value, 'phone');
  return '';
}

function contactAction(label, value, kind) {
  if (!value) return '';
  const href = kind === 'phone'
    ? `tel:${String(value).replace(/[^\d+]/g, '')}`
    : `mailto:${String(value).trim()}`;
  return `<a class="contact-action" href="${escapeHtml(href)}"><span>${label}</span><strong>${escapeHtml(value)}</strong></a>`;
}

function contactCard(role, name, email, phone) {
  const links = `${contactAction('EMAIL', email, 'email')}${contactAction('CALL', phone, 'phone')}`;
  return `<article class="contact-card"><span class="contact-role">${escapeHtml(role)}</span><h3>${escapeHtml(name || 'Contact details')}</h3><div class="contact-actions">${links || '<span class="contact-missing">No contact route entered</span>'}</div></article>`;
}

function renderHandlingCard(facts) {
  const manager = facts.find(fact => fact.field === 'Station Manager');
  const managerEmail = facts.find(fact => fact.field === 'Station Manager Email')?.value;
  const managerPhone = facts.find(fact => fact.field === 'Station Manager Phone')?.value;
  const consumed = new Set(['Station Manager', 'Station Manager Email', 'Station Manager Phone']);
  const records = facts.filter(fact => !consumed.has(fact.field)).map(fact => `<div class="profile-record"><div class="profile-record-heading"><strong>${escapeHtml(fact.field)}</strong></div><div class="profile-value">${escapeHtml(fact.value || 'No value entered')}</div></div>`).join('');
  const managerCard = manager ? contactCard('STATION MANAGER', manager.value, managerEmail, managerPhone) : '';
  return `<article class="card profile-card"><span class="card-tag">Handling &amp; Operations</span><div class="profile-fields">${records}</div>${managerCard}</article>`;
}

function renderTurnaroundCard(facts) {
  const contacts = [];
  const unassigned = [];
  let current = null;
  facts.forEach(fact => {
    if (fact.field === 'Duty Manager') {
      current = { role: fact.field, name: fact.value, email: '', phone: '' };
      contacts.push(current);
    } else if (fact.field === 'Duty Manager Email') {
      if (current && !current.email) current.email = fact.value;
      else unassigned.push(fact);
    } else if (fact.field === 'Duty Manager Phone') {
      if (current && !current.phone) current.phone = fact.value;
      else unassigned.push(fact);
    } else {
      unassigned.push(fact);
    }
  });
  const cards = contacts.map(contact => contactCard(contact.role, contact.name, contact.email, contact.phone)).join('');
  const extras = unassigned.map(fact => `<div class="contact-extra"><strong>${escapeHtml(fact.field)}</strong>${fact.field.toLowerCase().includes('phone') ? contactAction('CALL', fact.value, 'phone') : `<span>${escapeHtml(fact.value)}</span>`}</div>`).join('');
  return `<article class="card profile-card"><span class="card-tag">Turnaround Coordination</span><div class="coordination-grid">${cards}${extras}</div></article>`;
}

function updateDestinationClock(destination) {
  const zone = destinationTimeZones[destination.code];
  const dublinTime = document.querySelector('#dublin-current-time');
  const currentTime = document.querySelector('#destination-current-time');
  const now = new Date();
  if (dublinTime) {
    dublinTime.textContent = new Intl.DateTimeFormat('en-IE', { timeZone: 'Europe/Dublin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short' }).format(now);
  }
  if (currentTime) {
    currentTime.textContent = zone
      ? new Intl.DateTimeFormat('en-IE', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short' }).format(now)
      : 'Unavailable';
  }
  updateDestinationWeather(destination);
}

function weatherDescription(code) {
  if (code === 0) return ['☀️', 'Clear'];
  if ([1, 2].includes(code)) return ['🌤️', 'Partly cloudy'];
  if (code === 3) return ['☁️', 'Cloudy'];
  if ([45, 48].includes(code)) return ['🌫️', 'Fog'];
  if ([51, 53, 55, 56, 57].includes(code)) return ['🌦️', 'Drizzle'];
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ['🌧️', 'Rain'];
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['🌨️', 'Snow'];
  if ([95, 96, 99].includes(code)) return ['⛈️', 'Thunderstorm'];
  return ['🌡️', 'Current conditions'];
}

async function updateDestinationWeather(destination) {
  const output = document.querySelector('#destination-weather');
  const coordinates = destinationAirportCoordinates[destination.code];
  if (!output || !coordinates) {
    if (output) output.textContent = 'Unavailable';
    return;
  }
  if (navigator.onLine === false) {
    output.textContent = 'Weather unavailable offline';
    return;
  }
  const cached = destinationWeatherCache.get(destination.code);
  if (cached && Date.now() - cached.time < 20 * 60 * 1000) {
    output.innerHTML = cached.html;
    return;
  }
  output.textContent = 'Loading weather…';
  try {
    const [latitude, longitude] = coordinates;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather request failed');
    const result = await response.json();
    const temperature = result.current?.temperature_2m;
    const code = result.current?.weather_code;
    if (!Number.isFinite(temperature) || !Number.isFinite(code)) throw new Error('Weather data unavailable');
    const [icon, description] = weatherDescription(code);
    const html = `<span class="weather-icon" aria-hidden="true">${icon}</span> <span class="weather-temperature">${Math.round(temperature)}°C</span><span class="weather-description">${escapeHtml(description)}</span>`;
    destinationWeatherCache.set(destination.code, { time: Date.now(), html });
    if (document.querySelector('#destination-weather') === output) output.innerHTML = html;
  } catch {
    if (document.querySelector('#destination-weather') === output) output.textContent = navigator.onLine === false ? 'Weather unavailable offline' : 'Weather unavailable';
  }
}

function openDestination(code) {
  const destination = data.destinations.find(item => item.code === code);
  if (!destination) return;
  setRoute(`destinations/${code}`);
  clearInterval(destinationClockTimer);
  setActive('destinations');
  content.innerHTML = `<button class="back-button" data-back>← ALL DESTINATIONS</button>`
    + `<div class="destination-heading"><div class="destination-title-row"><h2>${escapeHtml(destination.name)}</h2><span class="destination-code" aria-label="Airport code ${escapeHtml(destination.code)}">${escapeHtml(destination.code)}</span></div><div class="destination-meta"><div><span>COUNTRY</span><strong>${escapeHtml(destination.country)}</strong></div><div><span>OPERATES</span><strong>${escapeHtml(destination.routeStatus)}</strong></div></div></div>`
    + renderDestinationProfile(destination);
  content.querySelector('[data-back]').onclick = () => openSection('destinations');
  updateDestinationClock(destination);
  destinationClockTimer = setInterval(() => updateDestinationClock(destination), 60_000);
}

function aircraftConfigurations() {
  const groups = new Map();
  data.aircraft.forEach(aircraft => {
    const key = [aircraft.type, aircraft.business, aircraft.premiumEconomy, aircraft.economy, aircraft.total, aircraft.cabinCrewSeats, aircraft.flightDeckRest, aircraft.cabinCrewRest].join('|');
    if (!groups.has(key)) groups.set(key, { ...aircraft, registrations: [] });
    groups.get(key).registrations.push(aircraft.registration);
  });
  return [...groups.values()].sort((a, b) => a.type.localeCompare(b.type) || a.cabinCrewSeats - b.cabinCrewSeats);
}

function aircraftId(aircraft) {
  return `aircraft-${aircraft.type}-${aircraft.cabinCrewSeats}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function renderRestStatus(value) {
  const normalized = String(value).toLowerCase();
  if (normalized === 'yes') return '<strong class="aircraft-rest-status is-yes" role="img" aria-label="Yes">✓</strong>';
  if (normalized === 'no') return '<strong class="aircraft-rest-status is-no" role="img" aria-label="No">×</strong>';
  return `<strong>${escapeHtml(value)}</strong>`;
}

function renderAircraft() {
  const variants = aircraftConfigurations();
  const cards = variants.map(aircraft => {
    const zones = [['Business', aircraft.business], ['Premium Economy', aircraft.premiumEconomy], ['Economy', aircraft.economy]].filter(([, seats]) => seats > 0);
    const nonBusinessSeats = zones.filter(([name]) => name !== 'Business').reduce((sum, [, seats]) => sum + seats, 0);
    const bar = zones.map(([name, seats]) => {
      const visualShare = name === 'Business' ? 25 : (nonBusinessSeats ? 75 * seats / nonBusinessSeats : 75);
      return `<div class="seat-zone${name === 'Business' ? ' seat-zone-business' : ''}" style="--zone:${visualShare.toFixed(2)}%"><strong>${seats}</strong></div>`;
    }).join('');
    const registrations = aircraft.registrations.map(registration => `<li>${escapeHtml(registration)}</li>`).join('');
    return `<article class="card aircraft-card" id="${aircraftId(aircraft)}"><div class="aircraft-card-head"><span class="card-tag">${escapeHtml(aircraft.type)}</span><strong class="aircraft-total">${aircraft.total}<small> seats</small></strong></div><div class="seat-bar" aria-label="Approximate cabin class visual; exact seat counts are listed below">${bar}</div><div class="seat-legend">${zones.map(([name, seats]) => `<span>${escapeHtml(name)} <b>${seats}</b></span>`).join('')}</div><div class="aircraft-stats"><div><span>CABIN CREW SEATS</span><strong>${aircraft.cabinCrewSeats}</strong></div><div><span>FLIGHT DECK REST</span>${renderRestStatus(aircraft.flightDeckRest)}</div><div><span>CABIN CREW REST</span>${renderRestStatus(aircraft.cabinCrewRest)}</div></div><details class="registration-list"><summary>Registrations</summary><ul>${registrations}</ul><div class="registration-total"><span>Total in Fleet</span><strong>${aircraft.registrations.length} aircraft</strong></div></details></article>`;
  }).join('');
  content.innerHTML = heading('', sections.aircraft.title, sections.aircraft.desc)
    + `<div class="card-grid aircraft-grid">${cards}</div>`;
}

function renderFlightInformation() {
  const destinationOptions = [{ name: 'Dublin', code: 'DUB' }, ...data.destinations].sort((a, b) => a.name.localeCompare(b.name))
    .map(destination => `<option value="${escapeHtml(destination.code)}">${escapeHtml(destination.name)} (${escapeHtml(destination.code)})</option>`).join('');
  const originOptions = [...data.destinations].sort((a, b) => a.name.localeCompare(b.name))
    .map(origin => `<option value="${escapeHtml(origin.code)}">${escapeHtml(origin.name)} (${escapeHtml(origin.code)})</option>`).join('');
  content.innerHTML = heading('', sections.flightInfo.title, sections.flightInfo.desc)
    + `<form class="flight-form" id="flight-information-form" autocomplete="off">
      <section class="flight-panel flight-route-panel"><div class="flight-panel-head"><h3>Flight Route</h3></div>
        <div class="flight-fields flight-route-fields">
          <label class="flight-field"><span>Destination</span><select name="destination"><option value="">Select destination</option>${destinationOptions}</select></label>
          <label class="flight-field" id="origin-airport-wrap" hidden><span>Origin airport</span><select name="originAirport" id="origin-airport"><option value="">Select origin airport</option>${originOptions}</select></label>
        </div>
      </section>
      <div class="flight-form-grid">
        <section class="flight-panel"><div class="flight-panel-head"><h3>Passenger Figures</h3></div>
          <div class="passenger-counts">
            <label class="flight-field"><span>Business Class</span><input name="business" type="number" min="0" max="30" step="1" inputmode="numeric" placeholder="0"></label>
            <label class="flight-field"><span>Premium Economy</span><input name="premiumEconomy" type="number" min="0" max="28" step="1" inputmode="numeric" placeholder="0"></label>
            <label class="flight-field"><span>Economy</span><input name="economy" type="number" min="0" inputmode="numeric" placeholder="0"></label>
          </div>
          <div class="flight-fields passenger-extra">
            <label class="flight-field"><span>No. of INF</span><input name="infants" type="number" min="0" inputmode="numeric" placeholder="0"></label>
            <label class="flight-field"><span>No. of PRM's</span><input name="prms" type="number" min="0" inputmode="numeric" placeholder="0"></label>
          </div>
          <div class="passenger-total"><span>TOTAL PAX · INCLUDES INFANTS</span><strong id="passenger-total">0</strong></div>
        </section>
        <section class="flight-panel"><div class="flight-panel-head"><h3>Flight Timings</h3></div>
          <div class="flight-fields">
            <div class="flight-field pushback-time-field"><label for="pushback-time">Pushback time</label><input id="pushback-time" name="pushback" type="datetime-local" aria-describedby="pushback-time-zone"><small id="pushback-time-zone" role="status" aria-live="polite">Time zone used: Dublin (Europe/Dublin)</small><button class="current-time-button" type="button" id="use-current-pushback-time">Use current time</button></div>
            <div class="flight-duration-pair">
              <label class="flight-field taxi-minutes-field"><span>Taxi (mins)</span><input name="taxiMinutes" type="number" min="1" step="1" inputmode="numeric" placeholder="0"></label>
              <fieldset class="flight-field duration-field"><legend>Flight Time</legend><div><label><input name="flightHours" type="number" min="0" max="30" inputmode="numeric" placeholder="0"><small>hours</small></label><b>:</b><label><input name="flightMinutes" type="number" min="0" max="59" inputmode="numeric" placeholder="00"><small>minutes</small></label></div></fieldset>
            </div>
          </div>
          <div class="arrival-summary"><span>ESTIMATED TIME OF ARRIVAL</span><div class="arrival-time"><small>DUBLIN LOCAL TIME</small><strong id="estimated-arrival-dublin">Enter the required times</strong></div><div class="arrival-time"><small id="destination-arrival-label">DESTINATION LOCAL TIME</small><strong id="estimated-arrival-destination">Select destination</strong></div></div>
        </section>
        <section class="flight-panel notes-panel"><div class="flight-panel-head"><span class="card-tag">FLIGHT NOTES</span></div>
          <div class="flight-fields notes-fields">
            <label class="flight-field"><span>Flight notes</span><textarea name="flightInformation" rows="3" placeholder="Add operational notes such as weather, turbulence, delays or other items to brief the crew."></textarea></label>
          </div>
        </section>
      </div>
      <div class="flight-form-footer"><small id="flight-save-status" role="status">Entries stay in this page only and are cleared when you leave. PRMs are recorded separately and are not included in passenger total.</small><div class="flight-footer-actions"><button class="clear-flight-button" type="button" id="show-flight-snapshot">Flight Snapshot</button><button class="clear-flight-button" type="button" id="clear-flight-information">Clear Flight Information</button></div></div>
    </form>
    <dialog class="flight-snapshot-dialog" id="flight-snapshot-dialog" aria-labelledby="flight-snapshot-title">
      <article class="flight-snapshot-card">
        <header class="flight-snapshot-header"><span class="card-tag">AERKIT · FLIGHT SNAPSHOT</span><button class="snapshot-close" type="button" aria-label="Close Flight Snapshot">×</button></header>
        <h2 id="flight-snapshot-title">Flight Snapshot</h2>
        <div id="flight-snapshot-content" class="flight-snapshot-content"></div>
      </article>
    </dialog>`;

  const form = content.querySelector('#flight-information-form');
  const saveStatus = content.querySelector('#flight-save-status');
  const cappedPassengerFields = { business: 30, premiumEconomy: 28 };
  const capPassengerCounts = () => {
    Object.entries(cappedPassengerFields).forEach(([name, maximum]) => {
      const field = form.elements[name];
      const value = Number(field.value);
      if (field.value !== '' && Number.isFinite(value) && value > maximum) field.value = String(maximum);
      if (field.value !== '' && Number.isFinite(value) && value < 0) field.value = '0';
    });
  };
  // Remove flight data saved by older versions; this form is reference-only.
  try {
    localStorage.removeItem('csm-flight-information-v2');
    localStorage.removeItem('csm-flight-information-v1');
  } catch {}

  const updateFlightSummary = () => {
    const total = ['business', 'premiumEconomy', 'economy', 'infants'].reduce((sum, name) => sum + Math.max(0, Number(form.elements[name].value) || 0), 0);
    content.querySelector('#passenger-total').textContent = total.toLocaleString('en-IE');

    const pushbackValue = form.elements.pushback.value;
    const flightHours = Number(form.elements.flightHours.value) || 0;
    const flightMinutes = Number(form.elements.flightMinutes.value) || 0;
    const taxiMinutes = Number(form.elements.taxiMinutes.value) || 0;
    const hasFlightTime = form.elements.flightHours.value !== '' || form.elements.flightMinutes.value !== '';
    const hasTaxiTime = form.elements.taxiMinutes.value !== '';
    const estimatedDublin = content.querySelector('#estimated-arrival-dublin');
    const estimatedDestination = content.querySelector('#estimated-arrival-destination');
    const originWrap = content.querySelector('#origin-airport-wrap');
    const originAirport = form.elements.originAirport;
    const pushbackTimeZone = content.querySelector('#pushback-time-zone');
    const isDublinDestination = form.elements.destination.value === 'DUB';
    originWrap.hidden = !isDublinDestination;
    originAirport.required = isDublinDestination;
    if (!isDublinDestination) originAirport.value = '';
    const destination = data.destinations.find(item => item.code === form.elements.destination.value)
      || (form.elements.destination.value === 'DUB' ? { name: 'Dublin', code: 'DUB' } : null);
    const origin = data.destinations.find(item => item.code === originAirport.value);
    const pushbackZone = isDublinDestination ? destinationTimeZones[originAirport.value] : 'Europe/Dublin';
    const pushbackZoneLabel = isDublinDestination
      ? (origin && pushbackZone ? `${origin.name} (${pushbackZone})` : '')
      : `Dublin (${pushbackZone})`;
    pushbackTimeZone.textContent = pushbackZoneLabel
      ? `Time zone used: ${pushbackZoneLabel}`
      : 'Select an origin airport to set the pushback time zone.';
    content.querySelector('#use-current-pushback-time').disabled = !pushbackZone;
    content.querySelector('#destination-arrival-label').textContent = destination
      ? `ESTIMATED ARRIVAL · ${destination.name.toUpperCase()} LOCAL TIME`
      : 'DESTINATION LOCAL TIME';

    if (hasTaxiTime && taxiMinutes < 1) {
      estimatedDublin.textContent = 'Enter a taxi time of at least 1 minute';
      estimatedDestination.textContent = destination ? 'Enter a taxi time of at least 1 minute' : 'Select destination';
      return;
    }

    if (!pushbackZone) {
      estimatedDublin.textContent = 'Select an origin airport to set the pushback time zone';
      estimatedDestination.textContent = 'Select an origin airport to set the pushback time zone';
      return;
    }

    if (!pushbackValue || !hasFlightTime || !hasTaxiTime) {
      estimatedDublin.textContent = 'Enter the required times';
      estimatedDestination.textContent = destination ? 'Enter timings to calculate' : 'Select destination';
      return;
    }

    const pushback = wallTimeToDate(pushbackValue, pushbackZone);
    const invalidDuration = flightHours < 0 || flightHours > 30 || flightMinutes < 0 || flightMinutes > 59
      || taxiMinutes < 1 || !Number.isInteger(taxiMinutes);
    if (!Number.isFinite(pushback.getTime()) || invalidDuration) {
      estimatedDublin.textContent = 'Check the push back time and durations';
      estimatedDestination.textContent = 'Check the push back time and durations';
      return;
    }

    const arrival = new Date(pushback.getTime() + (flightHours * 60 + flightMinutes + taxiMinutes) * 60_000);
    estimatedDublin.textContent = formatFlightTime(arrival, 'Europe/Dublin');
    const destinationTimeZone = destinationTimeZones[destination?.code];
    estimatedDestination.textContent = destination
      ? (destinationTimeZone ? formatFlightTime(arrival, destinationTimeZone) : 'Time zone unavailable')
      : 'Select destination';
  };

  const handleFlightInput = () => {
    capPassengerCounts();
    updateFlightSummary();
  };
  form.addEventListener('input', handleFlightInput);
  form.addEventListener('change', handleFlightInput);
  content.querySelector('#use-current-pushback-time').addEventListener('click', () => {
    const selectedZone = form.elements.destination.value === 'DUB'
      ? destinationTimeZones[form.elements.originAirport.value]
      : 'Europe/Dublin';
    if (!selectedZone) return;
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: selectedZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
    const part = type => parts.find(item => item.type === type)?.value;
    form.elements.pushback.value = `${part('year')}-${part('month')}-${part('day')}T${pad(Number(part('hour')))}:${pad(Number(part('minute')))}`;
    form.elements.pushback.dispatchEvent(new Event('input', { bubbles: true }));
  });
  window.addEventListener('pagehide', () => form.reset(), { once: true });
  updateFlightSummary();

  content.querySelector('#clear-flight-information').addEventListener('click', () => {
    form.reset();
    saveStatus.textContent = 'Flight information cleared from this page.';
    updateFlightSummary();
  });
  content.querySelector('#show-flight-snapshot').addEventListener('click', () => {
    const values = Object.fromEntries(new FormData(form).entries());
    const destination = data.destinations.find(item => item.code === values.destination)?.name
      || (values.destination === 'DUB' ? 'Dublin' : 'Not selected');
    const origin = data.destinations.find(item => item.code === values.originAirport)?.name;
    const snapshotPushbackZone = values.destination === 'DUB' ? destinationTimeZones[values.originAirport] : 'Europe/Dublin';
    const pushback = values.pushback && snapshotPushbackZone
      ? formatFlightTime(wallTimeToDate(values.pushback, snapshotPushbackZone), snapshotPushbackZone)
      : 'Not entered';
    const pax = ['business', 'premiumEconomy', 'economy', 'infants'].reduce((sum, name) => sum + Math.max(0, Number(values[name]) || 0), 0);
    const flightTime = `${values.flightHours || '0'}h ${values.flightMinutes || '0'}m`;
    const rows = [
      ['Route', `${origin ? `${origin} → ` : ''}${destination}`],
      ['Pushback', pushback],
      ['Flight time', flightTime],
      ['Taxi', values.taxiMinutes ? `${values.taxiMinutes} min` : 'Not entered'],
      ['Passengers', [['Business', values.business || '0'], ['Premium Economy', values.premiumEconomy || '0'], ['Economy', values.economy || '0'], ['INF', values.infants || '0'], ['PRM', values.prms || '0']]],
      ['Total Passengers', String(pax)],
      ['Dublin arrival', content.querySelector('#estimated-arrival-dublin').textContent],
      ['Local arrival', content.querySelector('#estimated-arrival-destination').textContent],
      ['Flight notes', values.flightInformation || 'None']
    ];
    content.querySelector('#flight-snapshot-content').innerHTML = rows.map(([label, value]) => {
      const rowClass = label === 'Total Passengers' ? ' snapshot-total-row' : '';
      if (label === 'Passengers') {
        const passengers = value.map(([name, count]) => `<div><span>${escapeHtml(name)}</span><strong>${escapeHtml(count)}</strong></div>`).join('');
        return `<section class="snapshot-row snapshot-passenger-row"><span>${escapeHtml(label)}</span><div class="snapshot-passenger-list">${passengers}</div></section>`;
      }
      const formattedValue = escapeHtml(value);
      return `<section class="snapshot-row${rowClass}"><span>${escapeHtml(label)}</span><strong>${formattedValue}</strong></section>`;
    }
    ).join('');
    content.querySelector('#flight-snapshot-dialog').showModal();
  });
  const snapshotDialog = content.querySelector('#flight-snapshot-dialog');
  snapshotDialog.querySelector('.snapshot-close').addEventListener('click', () => snapshotDialog.close());
  snapshotDialog.addEventListener('click', event => { if (event.target === snapshotDialog) snapshotDialog.close(); });
}

function formatFlightTime(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    hourCycle: 'h23', timeZoneName: 'short'
  }).formatToParts(date);
  const part = type => parts.find(item => item.type === type)?.value || '';
  return `${part('hour')}:${part('minute')} ${part('timeZoneName')} | ${part('day')}-${part('month')}`;
}

function wallTimeToDate(value, timeZone) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return new Date(NaN);
  const [, year, month, day, hour, minute] = match.map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const offsetAt = instant => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' }).formatToParts(new Date(instant));
    const fields = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
    return Date.UTC(fields.year, fields.month - 1, fields.day, fields.hour, fields.minute, fields.second) - Math.floor(instant / 1000) * 1000;
  };
  let utc = wallAsUtc - offsetAt(wallAsUtc);
  utc = wallAsUtc - offsetAt(utc);
  return new Date(utc);
}

function setRoute(route) {
  const hash = route ? `#/${route}` : '#/';
  if (window.location.hash !== hash) window.location.hash = hash;
}

function renderRoute() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'destinations' && parts[1]) {
    if (data.destinations.some(item => item.code === parts[1])) openDestination(parts[1]);
    else openSection('destinations', false);
    return;
  }
  const section = parts[0] && sections[parts[0]] ? parts[0] : 'essentials';
  openSection(section, false);
}

function openSection(id, updateRoute = true) {
  if (updateRoute) setRoute(id === 'essentials' ? '' : id);
  setSectionMenuOpen(false);
  clearInterval(destinationClockTimer);
  setActive(id);
  if (id === 'essentials') return renderCrewEssentials();
  if (id === 'destinations') return renderDestinations();
  if (id === 'aircraft') return renderAircraft();
  if (id === 'flightInfo') return renderFlightInformation();
  if (id === 'contacts') return renderUsefulContacts();
  if (id === 'ife') return renderIfeQuickReference();
  if (id === 'feedback') {
    renderFeedbackPage();
    initFeedbackPage();
    return;
  }
  const section = sections[id];
  if (!section) return;
  content.innerHTML = heading('', section.title, section.desc) + renderCards(section.cards || []);
  if (id === 'crew') {
    initCreditDatesCard();
    initCommissionCalculator();
    initOvernightAllowances();
  }
  if (id === 'roster') initBidWindowsCard();
}

function renderCrewEssentials() {
  const links = [
    ['FLIGHT CALCULATOR', 'Enter Flight Information', 'Passenger totals, arrival time estimate and flight notes.', 'flightInfo'],
    ['DESTINATIONS', 'Open Destination Information', 'Airport, hotel, transport details and station contacts.', 'destinations'],
    ['FLIGHT & DUTY', 'Check Duty References', 'Basic FDP, acclimatisation and ninth crew member guidance.', 'flight'],
    ['CREW RESOURCES', 'Open useful links and contacts', 'Company resources, forms, telephone and email contacts.', 'contacts']
  ];
  content.innerHTML = heading('', sections.essentials.title, sections.essentials.desc)
    + `<div class="card-grid essentials-grid">${links.map(([tag, title, detail, section]) => `<button type="button" class="card essentials-card" data-essential="${section}"><span class="card-tag">${tag}</span><h3>${title}</h3><p>${detail}</p><span class="essentials-open">Open →</span></button>`).join('')}</div>`;
  content.querySelectorAll('[data-essential]').forEach(button => button.addEventListener('click', () => openSection(button.dataset.essential)));
}

document.querySelectorAll('.quick-links button').forEach(button => {
  button.addEventListener('click', () => {
    openSection(button.dataset.section);
    content.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

sectionMenuToggle.addEventListener('click', () => {
  setSectionMenuOpen(sectionMenuToggle.getAttribute('aria-expanded') !== 'true');
});

document.addEventListener('click', event => {
  if (!sectionNavigation.contains(event.target)) setSectionMenuOpen(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setSectionMenuOpen(false);
});

document.querySelector('.home-button').addEventListener('click', event => {
  event.preventDefault();
  openSection('essentials');
  content.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const searchable = [
  ...data.destinations.map(destination => ({ id: 'destinations', title: destination.name, tag: destination.code, detail: `${destination.country} · ${destination.routeStatus}`, destinationCode: destination.code, group: 'Destinations' })),
  ...data.destinationFacts.map((fact, index) => ({ id: 'destinations', title: fact.field, tag: `${fact.destination} · ${fact.code}`, detail: fact.value, destinationCode: fact.code, destinationName: fact.destination, group: `${fact.destination} · ${fact.category}`, targetId: `destination-fact-${index}` })),
  ...aircraftConfigurations().flatMap(aircraft => [
    { id: 'aircraft', title: aircraft.type, tag: 'AIRCRAFT', detail: `${aircraft.total} passenger seats · ${aircraft.registrations.join(', ')}`, aircraftId: aircraftId(aircraft), group: 'Aircraft' },
    ...aircraft.registrations.map(registration => ({ id: 'aircraft', title: registration, tag: aircraft.type, detail: `${aircraft.total} passenger seats · ${aircraft.cabinCrewSeats} cabin crew seats`, aircraftId: aircraftId(aircraft), group: 'Aircraft' }))
  ]),
  ...Object.entries(sections).filter(([id]) => !['destinations', 'aircraft'].includes(id)).map(([id, section]) => ({ id, title: section.title, tag: 'SECTION', detail: section.desc, group: 'Sections' })),
  ...Object.entries(sections).flatMap(([id, section]) => (section.cards || []).map(card => ({ id, title: card[1], tag: card[0], detail: card[2], group: section.title }))),
  ...(data.usefulLinks || []).map(link => ({ id: 'contacts', title: link.title, tag: 'USEFUL LINK', detail: 'Company website or service', group: 'Useful links' })),
  ...(data.usefulForms || []).map(form => ({ id: 'contacts', title: form.title, tag: 'USEFUL FORM', detail: 'Online form', group: 'Useful forms' })),
  ...(data.usefulContacts || []).map(contact => ({ id: 'contacts', title: contact.name, tag: 'CONTACT', detail: [contact.phone, contact.email].filter(Boolean).join(' · '), group: 'Contacts' }))
];

function showResults(query) {
  const term = query.trim().toLowerCase();
  if (!term) { results.hidden = true; return; }
  const rank = item => {
    const title = item.title.toLowerCase();
    if (title === term) return 0;
    if (title.startsWith(term)) return 1;
    if (item.tag.toLowerCase().includes(term)) return 2;
    return 3;
  };
  const matches = searchable
    .filter(item => `${item.title} ${item.tag} ${item.detail} ${item.group || ''}`.toLowerCase().includes(term))
    .sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title))
    .slice(0, 20);
  const grouped = new Map();
  matches.forEach(item => {
    const group = item.group || 'Other';
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group).push(item);
  });
  results.innerHTML = matches.length
    ? [...grouped.entries()].map(([group, items]) => `<div class="search-result-group"><div class="search-result-heading">${escapeHtml(group)}</div>${items.map(item => `<button class="result" role="option" aria-label="${escapeHtml(`${item.title}, ${item.tag}. ${item.detail}`)}" data-index="${searchable.indexOf(item)}"><span class="result-tag">${escapeHtml(item.tag)}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span></button>`).join('')}</div>`).join('')
    : '<div class="result"><span><strong>No matches</strong><small>Try a destination, aircraft registration or topic.</small></span></div>';
  results.hidden = false;
  results.setAttribute('role', 'region');
  results.setAttribute('aria-label', `${matches.length} search results`);
  results.querySelectorAll('[data-index]').forEach(button => button.onclick = () => {
    const item = searchable[Number(button.dataset.index)];
    openSection(item.id);
    if (item.destinationCode) openDestination(item.destinationCode);
    results.hidden = true;
    search.setAttribute('aria-expanded', 'false');
    search.value = '';
    content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (item.targetId) requestAnimationFrame(() => document.getElementById(item.targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    if (item.aircraftId) document.getElementById(item.aircraftId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

search.setAttribute('aria-controls', 'search-results');
search.setAttribute('aria-expanded', 'false');
search.addEventListener('input', () => { showResults(search.value); search.setAttribute('aria-expanded', String(!results.hidden)); });
search.addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
  const options = [...results.querySelectorAll('button[data-index]')];
  if (!options.length) return;
  const current = options.indexOf(document.activeElement);
  if (event.key === 'Enter') { event.preventDefault(); options[current >= 0 ? current : 0].click(); return; }
  event.preventDefault();
  const next = current < 0 ? (event.key === 'ArrowUp' ? options.length - 1 : 0) : (current + (event.key === 'ArrowUp' ? options.length - 1 : 1)) % options.length;
  options[next].focus();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.search-wrap')) {
    results.hidden = true;
    search.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.focus(); }
  if (event.key === 'Escape') { results.hidden = true; search.setAttribute('aria-expanded', 'false'); search.blur(); }
});
window.addEventListener('hashchange', renderRoute);
window.addEventListener('offline', () => {
  const destinationCode = window.location.hash.match(/^#\/destinations\/([^/]+)/)?.[1];
  const destination = data.destinations.find(item => item.code === destinationCode);
  if (destination) updateDestinationWeather(destination);
});
window.addEventListener('online', () => {
  const destinationCode = window.location.hash.match(/^#\/destinations\/([^/]+)/)?.[1];
  const destination = data.destinations.find(item => item.code === destinationCode);
  if (destination) {
    destinationWeatherCache.delete(destination.code);
    updateDestinationWeather(destination);
  }
});
renderRoute();

let installPrompt;
const installButton = document.querySelector('#install-button');
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; installButton.hidden = false; });
installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

if ('serviceWorker' in navigator) {
  const syncStatus = document.querySelector('#sync-status');
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type !== 'CACHE_STATUS') return;
    if (!event.data.ready) {
      syncStatus.textContent = 'Offline references unavailable';
      return;
    }
    const synced = event.data.syncedAt ? new Date(event.data.syncedAt) : null;
    const label = synced && Number.isFinite(synced.getTime())
      ? new Intl.DateTimeFormat('en-IE', { dateStyle: 'medium', timeStyle: 'short' }).format(synced)
      : 'time unknown';
    syncStatus.textContent = `Offline references ready · Last sync ${label}`;
  });
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
      const registration = await navigator.serviceWorker.ready;
      (navigator.serviceWorker.controller || registration.active)?.postMessage('GET_CACHE_STATUS');
    } catch {
      syncStatus.textContent = 'Offline references not available';
    }
  });
}
