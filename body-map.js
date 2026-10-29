/*
 * Original vector training map. Region colour represents logged set exposure,
 * including assisting muscles, not muscle size, strength, fatigue or recovery.
 * Depends on the exercise/progress domain helpers in upgrade.js.
 */
(function installBodyMap() {
  'use strict';

  const mirror = 'translate(220 0) scale(-1 1)';
  const outline = `M101 64 L100 77
    C91 80 80 80 68 87 C59 91 54 103 50 118
    L41 156 C38 166 36 174 36 183
    C33 196 29 211 26 228 L23 245
    C20 250 18 260 19 268 L22 280 Q25 284 27 280
    L28 267 L30 277 Q33 280 35 276 L39 257 L38 246
    L49 215 C55 204 59 192 60 183
    C65 169 68 156 72 140 L75 129
    C78 147 81 163 79 179 L76 198
    C71 215 71 234 75 254
    L80 301 C81 316 82 326 85 338
    C80 352 82 368 86 383 L91 419 L91 432
    L84 443 Q82 448 86 450 L103 450
    Q108 449 107 442 L105 430 L107 400
    C111 380 111 359 107 341 L110 294
    L113 341 C109 359 109 380 113 400
    L115 430 L113 442 Q112 449 117 450 L134 450
    Q138 448 136 443 L129 432 L129 419 L134 383
    C138 368 140 352 135 338
    C138 326 139 316 140 301 L145 254
    C149 234 149 215 144 198 L141 179
    C139 163 142 147 145 129 L148 140
    C152 156 155 169 160 183
    C161 192 165 204 171 215 L182 246 L181 257
    L185 276 Q187 280 190 277 L192 267 L193 280
    Q195 284 198 280 L201 268 C202 260 200 250 197 245
    L194 228 C191 211 187 196 184 183
    C184 174 182 166 179 156 L170 118
    C166 103 161 91 152 87 C140 80 129 80 120 77
    L119 64 Z`;

  // Each entry contains the left-side geometry; most regions are mirrored.
  // Central back/abdominal geometry is deliberately drawn as paired anatomy.
  const front = [
    ['shoulders', 'M68 90 C60 94 55 107 53 119 L61 130 C65 123 72 117 78 112 L82 93 C77 89 73 88 68 90 Z', true],
    ['chest', 'M84 94 C92 91 100 93 107 96 L107 125 C98 133 86 132 76 125 L75 114 Z', true],
    ['biceps', 'M53 127 C59 131 64 133 68 130 L65 149 C64 163 59 174 54 180 L44 176 C43 163 47 143 53 127 Z', true],
    ['forearms', 'M43 185 L54 187 C53 203 46 219 38 237 L29 239 C30 224 35 198 43 185 Z', true],
    ['core', 'M83 138 L91 143 L91 178 L103 198 L102 212 C92 203 84 192 83 179 L80 157 Z M94 138 Q101 135 107 137 L107 153 L94 152 Z M94 156 L107 157 L107 174 L94 172 Z M95 177 L107 179 L107 199 L104 202 L97 190 Z', true],
    ['quads', 'M80 223 C88 218 96 220 101 227 L105 263 L102 305 C101 320 96 330 91 334 L86 321 L82 285 Z M79 238 L80 281 L86 316 L83 314 L78 280 L76 246 Z M104 271 L107 285 L105 321 L99 330 L96 327 L103 305 Z', true],
    ['calves', 'M91 349 L98 348 C102 366 102 386 100 402 L97 420 L94 414 L90 384 C87 369 87 358 91 349 Z', true]
  ];
  const back = [
    ['shoulders', 'M68 90 C59 95 55 107 53 119 L63 129 L75 113 L81 93 C77 90 72 88 68 90 Z', true],
    ['back', 'M101 78 L107 84 L107 119 L91 108 L80 92 Z M83 113 L105 128 L105 143 L95 151 L79 132 Z M78 140 L96 155 L106 145 L105 178 L98 194 C89 181 81 162 78 140 Z M101 186 L108 180 L108 213 L95 210 Z', true],
    ['triceps', 'M54 128 L65 135 C66 149 61 168 55 180 L44 177 C44 160 49 141 54 128 Z', true],
    ['forearms', 'M43 186 L54 189 C52 206 46 222 38 238 L29 239 C31 221 36 200 43 186 Z', true],
    ['glutes', 'M93 214 C98 213 104 215 108 220 L107 250 C99 257 86 257 77 249 L77 230 C81 222 86 216 93 214 Z', true],
    ['hamstrings', 'M79 260 C86 263 95 261 105 257 L104 291 L100 321 L95 334 L89 329 L85 304 Z M79 269 L84 306 L87 326 L84 326 L80 302 Z', true],
    ['calves', 'M90 347 L96 348 L96 370 L92 390 C85 378 83 362 90 347 Z M99 348 L103 349 C108 367 105 383 99 399 L96 393 L99 372 Z', true]
  ];

  function region([muscle, path, symmetric]) {
    const count = muscleData(muscle).week.length;
    const selected = muscle === selectedMuscle;
    const label = `${MUSCLES[muscle]}: ${count} logged sets this week`;
    return `<g class="body-region" data-muscle="${muscle}" tabindex="0" role="button"
      aria-label="${label}" aria-pressed="${selected}"
      fill="${muscleFill(muscle)}" stroke="${selected ? '#e6dbff' : '#151a24'}" stroke-width="1.5"
      stroke-linejoin="round" onclick="selectMuscle('${muscle}')"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectMuscle('${muscle}')}">
      <title>${label}</title><path d="${path}"/>
      ${symmetric ? `<path d="${path}" transform="${mirror}"/>` : ''}</g>`;
  }

  anatomy = function anatomy(backView = false) {
    const side = backView ? 'Back' : 'Front';
    const titleId = `body-map-${backView ? 'back' : 'front'}-title`;
    return `<svg viewBox="0 0 220 478" class="anatomy body-map" role="group" aria-labelledby="${titleId}">
      <title id="${titleId}">${side} training map. Select a muscle group to view recorded sets.</title>
      <style>
        .body-region { cursor:pointer; transition:stroke .15s ease; outline:none; }
        .body-region:hover,.body-region:focus-visible { stroke:#f4efff; stroke-width:2.8; }
        .body-map { overflow:visible; }
        @media(prefers-reduced-motion:reduce) { .body-region { transition:none; } }
      </style>
      <g fill="#1b202a" stroke="#505765" stroke-width="1.2" stroke-linejoin="round">
        <path d="M110 16 C97 16 91 25 92 39 L94 51 Q97 63 106 67 L114 67 Q123 63 126 51 L128 39 C129 25 123 16 110 16 Z"/>
        <path d="${outline}"/>
      </g>
      ${(backView ? back : front).map(region).join('')}
      <g fill="none" stroke="#505765" stroke-width="1.2" stroke-linecap="round" opacity=".8" aria-hidden="true">
        ${backView ? '<path d="M110 86 L110 208 M80 252 Q93 260 108 252 M112 252 Q127 260 140 252"/>' : '<path d="M110 98 L110 130 M108 211 L110 216 L112 211 M88 340 Q94 344 101 339 M119 339 Q126 344 132 340"/>'}
        <path d="M96 423 L102 423 M118 423 L124 423 M26 247 L35 249 M185 249 L194 247"/>
      </g>
      <text x="110" y="474" fill="#969eae" text-anchor="middle" font-size="11" font-family="inherit" letter-spacing="1.7">${side.toUpperCase()}</text>
    </svg>`;
  };

  const previousSelect = selectMuscle;
  selectMuscle = function selectBodyRegion(group) {
    if (!Object.hasOwn(MUSCLES, group)) return;
    previousSelect(group);
    document.querySelectorAll('[data-muscle]').forEach(element => {
      const selected = element.dataset.muscle === group;
      element.setAttribute('aria-pressed', String(selected));
      element.setAttribute('stroke', selected ? '#e6dbff' : '#151a24');
    });
    document.querySelectorAll('.muscle-buttons button').forEach(element => {
      const selected = element.textContent.trim() === MUSCLES[group];
      element.classList.toggle('green', selected);
      element.setAttribute('aria-pressed', String(selected));
    });
  };
})();
