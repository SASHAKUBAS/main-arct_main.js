/* --- ARCT Cheats: Draggable Autotake Panel + Radar + Static Box ESP (Overlay Fix) --- */
(function() {
    'use strict';

    // ==========================================
    // 1. КОНФИГ И СОЗДАНИЕ ПАНЕЛИ
    // ==========================================
    const defaultBindings = {
        togglePanel: "KeyH",
        ext: "KeyL",
        bread: "KeyB",
        steal: "KeyQ"
    };

    let savedBindings;
    try {
        savedBindings = JSON.parse(localStorage.getItem('arct_autotake_bindings')) || defaultBindings;
    } catch (e) {
        savedBindings = defaultBindings;
    }

    const arctConfig = {
        ext: false,
        bread: false,
        steal: false,
        boxInfo: true, // ESP включен по умолчанию
        bindings: savedBindings
    };

    let listeningKeyFor = null;

    window.addEventListener('DOMContentLoaded', () => { createPanel(); setupEspCanvas(); });
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => { createPanel(); setupEspCanvas(); }, 1000);
    }

    function createPanel() {
        if (document.getElementById('arct-autotake-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'arct-autotake-panel';
        panel.style.cssText = `
            position: fixed; 
            top: 100px; 
            left: 20px; 
            background: rgba(18, 18, 20, 0.94); 
            border: 1px solid rgba(255, 255, 255, 0.18); 
            border-radius: 8px; 
            padding: 14px; 
            color: #e0e0e0; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            font-size: 13px;
            z-index: 999999; 
            user-select: none; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.7);
            min-width: 250px;
        `;

        panel.innerHTML = `
            <div id="arct-panel-header" style="font-weight: 700; margin-bottom: 12px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 8px; color: #00ffcc; cursor: move; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;">
                <span>ARCT cheats</span>
                <button id="btn-bind-togglePanel" class="arct-bind-btn" data-action="togglePanel" style="font-size: 10px; background: rgba(0,255,204,0.15); border: 1px solid rgba(0,255,204,0.3); padding: 2px 6px; border-radius: 4px; color: #00ffcc; cursor: pointer; font-weight: bold;" title="Change panel toggle key">${formatKey(arctConfig.bindings.togglePanel)}</button>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <label for="arct-ext" style="cursor: pointer;">Extractor take</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="arct-ext" style="cursor: pointer; width: 15px; height: 15px;">
                    <button id="btn-bind-ext" class="arct-bind-btn" data-action="ext" style="font-size: 11px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); padding: 3px 8px; border-radius: 4px; color: #fff; cursor: pointer; min-width: 32px; text-align: center; font-weight: bold;">${formatKey(arctConfig.bindings.ext)}</button>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <label for="arct-bread" style="cursor: pointer;">Bread take</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="arct-bread" style="cursor: pointer; width: 15px; height: 15px;">
                    <button id="btn-bind-bread" class="arct-bind-btn" data-action="bread" style="font-size: 11px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); padding: 3px 8px; border-radius: 4px; color: #fff; cursor: pointer; min-width: 32px; text-align: center; font-weight: bold;">${formatKey(arctConfig.bindings.bread)}</button>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <label for="arct-steal" style="cursor: pointer;">Auto Steal <span style="font-size: 10px; color: #888;">(Hold)</span></label>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="arct-steal" style="cursor: pointer; width: 15px; height: 15px;">
                    <button id="btn-bind-steal" class="arct-bind-btn" data-action="steal" style="font-size: 11px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); padding: 3px 8px; border-radius: 4px; color: #fff; cursor: pointer; min-width: 32px; text-align: center; font-weight: bold;">${formatKey(arctConfig.bindings.steal)}</button>
                </div>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.12); margin-top: 10px; padding-top: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <label for="arct-boxinfo" style="cursor: pointer; color: #00ffcc; font-weight: bold;">BoxInfo</label>
                    <input type="checkbox" id="arct-boxinfo" style="cursor: pointer; width: 15px; height: 15px;" checked>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        const header = document.getElementById('arct-panel-header');
        let isDragging = false, startX, startY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.clientX - panel.offsetLeft;
            startY = e.clientY - panel.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panel.style.left = (e.clientX - startX) + 'px';
            panel.style.top = (e.clientY - startY) + 'px';
        });

        document.addEventListener('mouseup', () => { isDragging = false; });

        document.getElementById('arct-ext').addEventListener('change', (e) => arctConfig.ext = e.target.checked);
        document.getElementById('arct-bread').addEventListener('change', (e) => arctConfig.bread = e.target.checked);
        document.getElementById('arct-steal').addEventListener('change', (e) => arctConfig.steal = e.target.checked);
        document.getElementById('arct-boxinfo').addEventListener('change', (e) => arctConfig.boxInfo = e.target.checked);

        const bindButtons = panel.querySelectorAll('.arct-bind-btn');
        bindButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                listeningKeyFor = action;
                btn.innerText = "...";
                btn.style.color = "#00ffcc";
            });
        });
    }

    function formatKey(code) {
        if (!code) return "NONE";
        return code.replace("Key", "").replace("Digit", "");
    }

    window.addEventListener('keydown', (e) => {
        if (listeningKeyFor) {
            e.preventDefault();
            const action = listeningKeyFor;
            arctConfig.bindings[action] = e.code;
            localStorage.setItem('arct_autotake_bindings', JSON.stringify(arctConfig.bindings));
            
            const btn = document.getElementById(`btn-bind-${action}`);
            if (btn) {
                btn.innerText = formatKey(e.code);
                btn.style.color = action === 'togglePanel' ? "#00ffcc" : "#fff";
            }
            listeningKeyFor = null;
            return;
        }

        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        const panel = document.getElementById('arct-autotake-panel');
        if (!panel) return;

        if (e.code === arctConfig.bindings.togglePanel && !e.repeat) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
        else if (e.code === arctConfig.bindings.ext && !e.repeat) {
            arctConfig.ext = !arctConfig.ext;
            const chk = document.getElementById('arct-ext');
            if (chk) chk.checked = arctConfig.ext;
        }
        else if (e.code === arctConfig.bindings.bread && !e.repeat) {
            arctConfig.bread = !arctConfig.bread;
            const chk = document.getElementById('arct-bread');
            if (chk) chk.checked = arctConfig.bread;
        }
        else if (e.code === arctConfig.bindings.steal) {
            arctConfig.steal = true;
            const chk = document.getElementById('arct-steal');
            if (chk) chk.checked = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.code === arctConfig.bindings.steal) {
            arctConfig.steal = false;
            const chk = document.getElementById('arct-steal');
            if (chk) chk.checked = false;
        }
    });

    // ==========================================
    // 2. ЛОГИКА АВТОСБОРА
    // ==========================================
    function runStandaloneAutotake() {
        try {
            if (!arctConfig.ext && !arctConfig.bread && !arctConfig.steal) return;

            let sock = window.v2600;
            if (!sock || !sock.websocket) {
                for (let k in window) {
                    if (window[k] && typeof window[k] === 'object' && window[k].websocket && window[k].websocket.readyState === 1) {
                        sock = window[k]; break;
                    }
                }
            }
            if (!sock || !sock.websocket || sock.websocket.readyState !== 1) return;

            let world = window.v2603;
            if (!world || !world.units || !world.fast_units) {
                for (let k in window) {
                    let obj = window[k];
                    if (obj && typeof obj === 'object' && obj.units && obj.fast_units) {
                        world = obj; break;
                    }
                }
            }
            if (!world || !world.fast_units) return;

            let mapKeys = window.v2605;
            if (!mapKeys) {
                for (let k in window) {
                    let obj = window[k];
                    if (obj && typeof obj === 'object' && obj.uid !== undefined) {
                        mapKeys = obj; break;
                    }
                }
            }

            const uid = mapKeys ? mapKeys.uid : (window.v2605 ? window.v2605.uid : undefined);
            if (uid === undefined) return;

            let player = world.fast_units[uid];
            if (!player) return;

            const pidKey = mapKeys ? (mapKeys.playerIdKey || mapKeys.pid || "playerId") : "playerId";
            const sendPacket = (packet) => {
                WebSocket.prototype.send.call(sock.websocket, JSON.stringify(packet));
            };

            if (arctConfig.ext) {
                for (let type = 24; type <= 37; type++) {
                    let list = world.units[type];
                    if (!list || !Array.isArray(list)) continue;
                    for (let i = 0; i < list.length; i++) {
                        let ext = list[i];
                        if (!ext || ext.x === undefined) continue;
                        if (Math.hypot(player.x - ext.x, player.y - ext.y) < 300) {
                            if (((Number(ext.info) & 65280) >> 8) > 0) {
                                let pid = ext[pidKey], iid = ext.id;
                                if (pid !== undefined && iid !== undefined) sendPacket([12, pid, iid, type]);
                            }
                        }
                    }
                }
            }

            if (arctConfig.bread) {
                let mills = world.units[41];
                if (mills && Array.isArray(mills)) {
                    for (let j = 0; j < mills.length; j++) {
                        let mill = mills[j];
                        if (!mill || mill.x === undefined) continue;
                        if (Math.hypot(player.x - mill.x, player.y - mill.y) < 300) {
                            if (((Number(mill.info) & 65280) >> 8) > 0) {
                                let pid = mill[pidKey], iid = mill.id;
                                if (pid !== undefined && iid !== undefined) sendPacket([1, pid, iid]);
                            }
                        }
                    }
                }
                let furnaces = world.units[43];
                if (furnaces && Array.isArray(furnaces)) {
                    for (let j = 0; j < furnaces.length; j++) {
                        let furnace = furnaces[j];
                        if (!furnace || furnace.x === undefined) continue;
                        if (Math.hypot(player.x - furnace.x, player.y - furnace.y) < 300) {
                            if (((Number(furnace.info) & 31744) >> 10) > 0) {
                                let pid = furnace[pidKey], iid = furnace.id;
                                if (pid !== undefined && iid !== undefined) sendPacket([28, pid, iid]);
                            }
                        }
                    }
                }
            }

            if (arctConfig.steal) {
                let chests = world.units[11];
                if (chests && Array.isArray(chests)) {
                    for (let k = 0; k < chests.length; k++) {
                        let chest = chests[k];
                        if (!chest || chest.x === undefined) continue;
                        if (Math.hypot(player.x - chest.x, player.y - chest.y) < 300) {
                            let pid = chest[pidKey], iid = chest.id;
                            if (pid !== undefined && iid !== undefined) {
                                if (chest.lock === 1) {
                                    sendPacket([17, pid, iid]); sendPacket([18, pid, iid]);
                                } else if (chest.action !== 0) {
                                    sendPacket([18, pid, iid]);
                                }
                            }
                        }
                    }
                }
            }
        } catch (e) {}
    }

    setInterval(runStandaloneAutotake, 400);

    // ==========================================
    // 3. RADAR & INVENTORY
    // ==========================================
    window.arctAllies = {};
    function initRadar() {
        try {
            const ws = new WebSocket('wss://mazurenok.duckdns.org');
            ws.onmessage = (e) => {
                try { window.arctAllies = JSON.parse(e.data); } catch(err){}
            };
            
            setInterval(() => {
                if (ws.readyState !== WebSocket.OPEN) return;
                let world = window.v2603 || (function(){ for(let k in window) if(window[k] && window[k].fast_units) return window[k]; })();
                let mapKeys = window.v2605 || (function(){ for(let k in window) if(window[k] && window[k].uid !== undefined) return window[k]; })();
                if (!world || !mapKeys || mapKeys.uid === undefined) return;
                let me = world.fast_units[mapKeys.uid];
                if (!me) return;

                let savedName = localStorage.getItem('arct_radar_name');
                let myName = (savedName && savedName.trim() !== "") ? savedName.trim() : "";
                if (!myName) {
                    let nickInput = document.getElementById('nickname');
                    myName = (nickInput && nickInput.value) ? nickInput.value.trim() : "ARCT";
                }

                let myInventory = [];
                try {
                    let userInst = window.__azonCapture ? window.__azonCapture.instances.get('user') : null;
                    userInst = userInst || (window.v2604 ? window.v2604.WUU : null);
                    if (userInst) {
                        let invObj = null;
                        for (let k in userInst) {
                            if (userInst[k] && typeof userInst[k] === 'object' && userInst[k].max !== undefined) {
                                invObj = userInst[k]; break;
                            }
                        }
                        if (!invObj && userInst.WUV) invObj = userInst.WUV;
                        if (invObj) {
                            for (let k in invObj) {
                                let arr = invObj[k];
                                if (Array.isArray(arr) && arr.length > 0 && arr.length < 50) {
                                    let isQuantityArray = false;
                                    for (let i = 0; i < arr.length; i++) {
                                        let v = arr[i];
                                        let num = typeof v === 'number' ? v : (v ? (v.id !== undefined ? v.id : v.n) : null);
                                        if (num !== null && num > 400) { isQuantityArray = true; break; }
                                    }
                                    if (isQuantityArray) continue;
                                    for (let i = 0; i < arr.length; i++) {
                                        let val = arr[i];
                                        if (val != null) {
                                            let id = typeof val === 'number' ? val : (val.id !== undefined ? val.id : val.n);
                                            if (id !== null && typeof id === 'number' && id >= 0) myInventory.push(id);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch(err) {}

                myInventory = [...new Set(myInventory)];
                ws.send(JSON.stringify({ type: 'pos', x: me.x, y: me.y, name: myName, inv: myInventory }));
            }, 500);
        } catch(e){}
    }
    setTimeout(initRadar, 3000);

    // ==========================================
    // 4. ИДЕАЛЬНО СТАТИЧНЫЙ ESP (НА ПРОЗРАЧНОМ ХОЛСТЕ)
    // ==========================================
    let espCtx = null;
    let espCanvas = null;

    function setupEspCanvas() {
        if (document.getElementById('arct-box-esp')) return;
        espCanvas = document.createElement('canvas');
        espCanvas.id = 'arct-box-esp';
        // z-index высокий, pointer-events: none (чтобы клики проходили сквозь него в игру)
        espCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99998;';
        document.body.appendChild(espCanvas);
        espCtx = espCanvas.getContext('2d');

        const resize = () => { 
            espCanvas.width = window.innerWidth; 
            espCanvas.height = window.innerHeight; 
        };
        window.addEventListener('resize', resize);
        resize();

        requestAnimationFrame(renderBoxInfo);
    }

    function updateBoxState(entity, maxTime) {
        if (!entity._arctBoxInfo) {
            entity._arctBoxInfo = {
                timeLeft: maxTime,
                lastUpdate: Date.now(),
                hits: 0,
                wasHitting: true
            };
        }
        
        let now = Date.now();
        if (entity.action === 2 && entity._arctBoxInfo.wasHitting) {
            entity._arctBoxInfo.wasHitting = false;
            entity._arctBoxInfo.hits++;
        } else if (entity.action !== 2) {
            entity._arctBoxInfo.wasHitting = true;
        }

        let delta = (now - entity._arctBoxInfo.lastUpdate) / 1000;
        if (delta > 0 && maxTime > 0) {
            entity._arctBoxInfo.timeLeft = Math.max(0, entity._arctBoxInfo.timeLeft - delta);
            entity._arctBoxInfo.lastUpdate = now;
        }
        
        return entity._arctBoxInfo;
    }

    function drawBoxText(x, y, lines) {
        espCtx.font = "bold 15px 'Baloo Paaji', Arial, sans-serif";
        espCtx.textAlign = "center";
        espCtx.lineWidth = 4;
        espCtx.strokeStyle = "#000000"; 
        espCtx.fillStyle = "#00FFFF";  

        lines.forEach((line, index) => {
            let py = y + (index * 18);
            espCtx.strokeText(line, x, py);
            espCtx.fillText(line, x, py);
        });
    }

    function renderBoxInfo() {
        if (!espCtx || !espCanvas) return requestAnimationFrame(renderBoxInfo);
        
        espCtx.clearRect(0, 0, espCanvas.width, espCanvas.height);
        
        if (arctConfig.boxInfo) {
            let world = window.v2603 || (function(){ for(let k in window) if(window[k] && window[k].fast_units) return window[k]; })();
            let mapKeys = window.v2605 || (function(){ for(let k in window) if(window[k] && window[k].uid !== undefined) return window[k]; })();
            let userInst = window.v2604 || (function(){ for(let k in window) if(window[k] && window[k].WUF) return window[k]; })();

            if (world && world.units && world.fast_units && mapKeys && mapKeys.uid !== undefined && userInst && userInst.WUF) {
                let me = world.fast_units[mapKeys.uid];
                
                // Идеально сглаженные координаты камеры из ядра игры
                let camX = userInst.WUF.x;
                let camY = userInst.WUF.y;

                if (me && typeof camX === 'number' && typeof camY === 'number') {
                    
                    const drawEntities = (typeId, timeLimit, showTimeAndName) => {
                        let entities = world.units[typeId];
                        if (entities && Array.isArray(entities)) {
                            for (let i = 0; i < entities.length; i++) {
                                let ent = entities[i];
                                if (!ent || ent.x === undefined || ent.y === undefined) continue;
                                
                                // Позиция камеры + реальные координаты объекта на карте = статичный текст
                                let screenX = camX + ent.x;
                                let screenY = camY + ent.y - 25;
                                
                                if (screenX > -100 && screenX < window.innerWidth + 100 && 
                                    screenY > -100 && screenY < window.innerHeight + 100) {
                                    
                                    let state = updateBoxState(ent, timeLimit);
                                    let lines = [];
                                    
                                    if (showTimeAndName) {
                                        lines.push(typeId === 102 ? "Drop" : "Dead");
                                        lines.push("Time: " + state.timeLeft.toFixed(1) + "s");
                                    }
                                    lines.push("Hits: " + state.hits);
                                    
                                    drawBoxText(screenX, screenY, lines);
                                }
                            }
                        }
                    };

                    drawEntities(103, 0, false);   // Gift
                    drawEntities(97, 0, false);    // Treasure Chest
                    drawEntities(102, 16, true);   // Crate
                    drawEntities(98, 240, true);   // Dead Box
                }
            }
        }
        
        requestAnimationFrame(renderBoxInfo);
    }
})(); 
(function (_0x2c6fbf, _0xec39e) {
  const _0x39d989 = _0x2c6fbf();
  while (!![]) {
    try {
      const _0x1078e7 = parseInt("1253644gEDnVX") / 1 + parseInt("766080UyhOkj") / 2 + -parseInt("195495ylxuwM") / 3 + parseInt("2887536QfVDTS") / 4 + parseInt("25bNsmis") / 5 * (parseInt("68970DjvdAf") / 6) + -parseInt("1141nYWFXQ") / 7 * (parseInt("40088IkdvkY") / 8) + -parseInt("6568515seMhqk") / 9;
      if (_0x1078e7 === _0xec39e) break;else _0x39d989.push(_0x39d989.shift());
    } catch (_0x2a5919) {
      _0x39d989.push(_0x39d989.shift());
    }
  }
})(_0x3f91, 804250), function () {
  const {
    log: _0x15f19b
  } = console;
  let _0x4cd684 = 0,
    _0x22a5e6 = 0,
    _0x566832 = 0;
  (function () {
    var _0x5f292e, _0x183e00, _0x222c43;
    _0x5f292e = function (_0x1f0f3d) {
      'use strict';

      var _0x264a06,
        _0x431b59,
        _0xa37ff3,
        _0x4e295b,
        _0x320df9 = Number.MAX_SAFE_INTEGER === undefined ? 9007199254740991 : Number.MAX_SAFE_INTEGER,
        _0x43dac0 = new WeakMap();
      function _0x3edd8e(_0x23a11f) {
        var _0x15b87f = _0x431b59.get(_0x23a11f),
          _0x2b22c3 = _0x15b87f === undefined ? _0x23a11f.size : _0x15b87f < 1073741824 ? _0x15b87f + 1 : 0;
        if (!_0x23a11f.has(_0x2b22c3)) return _0x264a06(_0x23a11f, _0x2b22c3);
        if (_0x23a11f.size < 536870912) {
          while (_0x23a11f.has(_0x2b22c3)) {
            _0x2b22c3 = Math.floor(Math.random() * 1073741824);
          }
          return _0x264a06(_0x23a11f, _0x2b22c3);
        }
        if (_0x23a11f.size > _0x320df9) throw Error("Congratulations, you created a collection of unique numbers which uses all available integers!");
        while (_0x23a11f.has(_0x2b22c3)) {
          _0x2b22c3 = Math.floor(Math.random() * _0x320df9);
        }
        return _0x264a06(_0x23a11f, _0x2b22c3);
      }
      _0x4e295b = _0x43dac0, _0x264a06 = function (_0x3b57a1, _0x5e9580) {
        return _0x4e295b.set(_0x3b57a1, _0x5e9580), _0x5e9580;
      }, _0x431b59 = _0x43dac0, _0xa37ff3 = _0x3edd8e, _0x1f0f3d.addUniqueNumber = function (_0x1fafd9) {
        var _0x2a2e5e = _0xa37ff3(_0x1fafd9);
        return _0x1fafd9.add(_0x2a2e5e), _0x2a2e5e;
      }, _0x1f0f3d.generateUniqueNumber = _0x3edd8e, Object.defineProperty(_0x1f0f3d, '__esModule', {
        'value': !![]
      });
    };
    if (typeof exports == 'object' && typeof module != 'undefined') _0x5f292e(exports);else typeof define == "function" && define.amd ? define(["exports"], _0x5f292e) : _0x5f292e(_0x566832 = {});
    _0x183e00 = function (_0x4d4329, _0x3a3b69) {
      'use strict';

      _0x4d4329.load = function (_0x1bf67c) {
        var _0x586855 = new Map([[0, function () {}]]),
          _0x330f09 = new Map([[0, function () {}]]),
          _0x380afa = new Map(),
          _0x3de84c = new Worker(_0x1bf67c);
        return _0x3de84c.addEventListener("message", function (_0x811138) {
          var _0x5eda25,
            _0x44b9ce = _0x811138.data;
          if ((_0x5eda25 = _0x44b9ce).method !== undefined && _0x5eda25.method === "call") {
            var _0x5c6e29 = _0x44b9ce.params,
              _0x1ef286 = _0x5c6e29.timerId,
              _0x5b3353 = _0x5c6e29.timerType;
            if (_0x5b3353 === 'interval') {
              var _0x41db23 = _0x586855.get(_0x1ef286);
              if (typeof _0x41db23 == "number") {
                var _0x7983c = _0x380afa.get(_0x41db23);
                if (_0x7983c === undefined || _0x7983c.timerId !== _0x1ef286 || _0x7983c.timerType !== _0x5b3353) throw Error("The timer is in an undefined state.");
              } else {
                if (_0x41db23 === undefined) throw Error("The timer is in an undefined state.");
                _0x41db23();
              }
            } else {
              if (_0x5b3353 === "timeout") {
                var _0x2b4f84 = _0x330f09.get(_0x1ef286);
                if (typeof _0x2b4f84 == "number") {
                  var _0x15af80 = _0x380afa.get(_0x2b4f84);
                  if (_0x15af80 === undefined || _0x15af80.timerId !== _0x1ef286 || _0x15af80.timerType !== _0x5b3353) throw Error("The timer is in an undefined state.");
                } else {
                  if (_0x2b4f84 === undefined) throw Error("The timer is in an undefined state.");
                  _0x2b4f84(), _0x330f09.delete(_0x1ef286);
                }
              }
            }
          } else {
            if ((_0x1a99cf = _0x44b9ce).error !== null || typeof _0x1a99cf.id != "number") throw Error(_0x44b9ce.error.message);
            var _0x1a99cf,
              _0x3726ec = _0x44b9ce.id,
              _0x1bd9db = _0x380afa.get(_0x3726ec);
            if (_0x1bd9db === undefined) throw Error("The timer is in an undefined state.");
            var _0x579e80 = _0x1bd9db.timerId,
              _0x9c6596 = _0x1bd9db.timerType;
            _0x380afa.delete(_0x3726ec), _0x9c6596 === "interval" ? _0x586855.delete(_0x579e80) : _0x330f09.delete(_0x579e80);
          }
        }), {
          'clearInterval': function (_0x307760) {
            var _0x13b6fc = _0x3a3b69.generateUniqueNumber(_0x380afa);
            _0x380afa.set(_0x13b6fc, {
              'timerId': _0x307760,
              'timerType': "interval"
            }), _0x586855.set(_0x307760, _0x13b6fc), _0x3de84c.postMessage({
              'id': _0x13b6fc,
              'method': "clear",
              'params': {
                'timerId': _0x307760,
                'timerType': "interval"
              }
            });
          },
          'clearTimeout': function (_0x206019) {
            var _0x70b0db = _0x3a3b69.generateUniqueNumber(_0x380afa);
            _0x380afa.set(_0x70b0db, {
              'timerId': _0x206019,
              'timerType': "timeout"
            }), _0x330f09.set(_0x206019, _0x70b0db), _0x3de84c.postMessage({
              'id': _0x70b0db,
              'method': 'clear',
              'params': {
                'timerId': _0x206019,
                'timerType': "timeout"
              }
            });
          },
          'setInterval': function (_0x3f0c33, _0x5ebc1b) {
            var _0x1cbadc = _0x3a3b69.generateUniqueNumber(_0x586855);
            return _0x586855.set(_0x1cbadc, function () {
              _0x3f0c33(), typeof _0x586855.get(_0x1cbadc) == 'function' && _0x3de84c.postMessage({
                'id': null,
                'method': 'set',
                'params': {
                  'delay': _0x5ebc1b,
                  'now': performance.now(),
                  'timerId': _0x1cbadc,
                  'timerType': "interval"
                }
              });
            }), _0x3de84c.postMessage({
              'id': null,
              'method': "set",
              'params': {
                'delay': _0x5ebc1b,
                'now': performance.now(),
                'timerId': _0x1cbadc,
                'timerType': "interval"
              }
            }), _0x1cbadc;
          },
          'setTimeout': function (_0x348ab7, _0xb86b42) {
            var _0x59f770 = _0x3a3b69.generateUniqueNumber(_0x330f09);
            return _0x330f09.set(_0x59f770, _0x348ab7), _0x3de84c.postMessage({
              'id': null,
              'method': "set",
              'params': {
                'delay': _0xb86b42,
                'now': performance.now(),
                'timerId': _0x59f770,
                'timerType': "timeout"
              }
            }), _0x59f770;
          }
        };
      }, Object.defineProperty(_0x4d4329, "__esModule", {
        'value': !![]
      });
    };
    if (typeof exports == "object" && typeof module != "undefined") _0x183e00(exports, require("fast-unique-numbers"));else typeof define == "function" && define.amd ? define(["exports", "fast-unique-numbers"], _0x183e00) : _0x183e00(_0x22a5e6 = {}, _0x566832);
    _0x222c43 = function (_0x12dfc1, _0x267e61) {
      'use strict';

      var _0x50a9f8,
        _0x949104 = null;
      function _0x3a72ac() {
        if (_0x949104 !== null) return _0x949104;
        var _0x1dc5de = new Blob(["(()=>{var e={67:(e,t,r)=>{var o,i;void 0===(i=\"function\"==typeof(o=function(){\"use strict\";var e=new Map,t=new Map,r=function(t){var r=e.get(t);if(void 0===r)throw new Error('There is no interval scheduled with the given id \"'.concat(t,'\".'));clearTimeout(r),e.delete(t)},o=function(e){var r=t.get(e);if(void 0===r)throw new Error('There is no timeout scheduled with the given id \"'.concat(e,'\".'));clearTimeout(r),t.delete(e)},i=function(e,t){var r,o=performance.now();return{expected:o+(r=e-Math.max(0,o-t)),remainingDelay:r}},n=function e(t,r,o,i){var n=performance.now();n>o?postMessage({id:null,method:\"call\",params:{timerId:r,timerType:i}}):t.set(r,setTimeout(e,o-n,t,r,o,i))},a=function(t,r,o){var a=i(t,o),s=a.expected,d=a.remainingDelay;e.set(r,setTimeout(n,d,e,r,s,\"interval\"))},s=function(e,r,o){var a=i(e,o),s=a.expected,d=a.remainingDelay;t.set(r,setTimeout(n,d,t,r,s,\"timeout\"))};addEventListener(\"message\",(function(e){var t=e.data;try{if(\"clear\"===t.method){var i=t.id,n=t.params,d=n.timerId,c=n.timerType;if(\"interval\"===c)r(d),postMessage({error:null,id:i});else{if(\"timeout\"!==c)throw new Error('The given type \"'.concat(c,'\" is not supported'));o(d),postMessage({error:null,id:i})}}else{if(\"set\"!==t.method)throw new Error('The given method \"'.concat(t.method,'\" is not supported'));var u=t.params,l=u.delay,p=u.now,m=u.timerId,v=u.timerType;if(\"interval\"===v)a(l,m,p);else{if(\"timeout\"!==v)throw new Error('The given type \"'.concat(v,'\" is not supported'));s(l,m,p)}}}catch(e){postMessage({error:{message:e.message},id:t.id,result:null})}}))})?o.call(t,r,t,e):o)||(e.exports=i)}},t={};function r(o){var i=t[o];if(void 0!==i)return i.exports;var n=t[o]={exports:{}};return e[o](n,n.exports,r),n.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{\"use strict\";r(67)})()})();"], {
            'type': 'application/javascript;\x20charset=utf-8'
          }),
          _0x197a47 = URL.createObjectURL(_0x1dc5de);
        return (_0x949104 = _0x50a9f8(_0x197a47)).setTimeout(function () {
          return URL.revokeObjectURL(_0x197a47);
        }, 0), _0x949104;
      }
      _0x50a9f8 = _0x267e61.load, _0x12dfc1.clearInterval = function (_0x4bc4d5) {
        return _0x3a72ac().clearInterval(_0x4bc4d5);
      }, _0x12dfc1.clearTimeout = function (_0x59b8ee) {
        return _0x3a72ac().clearTimeout(_0x59b8ee);
      }, _0x12dfc1.setInterval = function (_0x44664d, _0x4acabd) {
        return _0x3a72ac().setInterval(_0x44664d, _0x4acabd);
      }, _0x12dfc1.setTimeout = function (_0x17f308, _0xadeb8b) {
        return _0x3a72ac().setTimeout(_0x17f308, _0xadeb8b);
      }, Object.defineProperty(_0x12dfc1, "__esModule", {
        'value': !![]
      });
    };
    if (typeof exports == "object" && typeof module != "undefined") _0x222c43(exports, require('worker-timers-broker'));else typeof define == "function" && define.amd ? define(["exports", "worker-timers-broker"], _0x222c43) : _0x222c43(_0x4cd684 = {}, _0x22a5e6);
  })();
  const _0x2e3bbb = document.querySelectorAll("script"),
    _0x29eb39 = Array.from(_0x2e3bbb).filter(_0x28a123 => {
      const _0x43faab = _0x28a123.src;
      return _0x43faab && _0x43faab.includes("https://starve.io/js/") && !_0x43faab.includes("token.js") && !_0x43faab.includes("howler.js") && !_0x43faab.includes("jquery.js");
    }),
    _0x3b2dad = _0x29eb39[0].src;
  let _0x450959 = null,
    _0x1eec1d = [];
  const _0x370b8c = () => new Promise((_0xad0d85, _0x1b5454) => {
      const _0x159cc3 = indexedDB.open("crackSunrise", 1);
      _0x159cc3.onupgradeneeded = _0x49a540 => {
        const _0x1b04d8 = _0x49a540.target.result;
        !_0x1b04d8.objectStoreNames.contains("data") && _0x1b04d8.createObjectStore("data");
      }, _0x159cc3.onsuccess = _0x10c0e7 => _0xad0d85(_0x10c0e7.target.result), _0x159cc3.onerror = _0x1b5454;
    }),
    _0x213974 = async _0x45ea53 => new Promise(async _0xb97626 => {
      (await _0x370b8c()).transaction("data", "readonly").objectStore("data").get(_0x45ea53).onsuccess = _0x3c702d => _0xb97626(_0x3c702d.target.result);
    }),
    _0x513de1 = async (_0x2fc759, _0x210453) => new Promise(async _0x35a20a => {
      (await _0x370b8c()).transaction("data", 'readwrite').objectStore("data").put(_0x210453, _0x2fc759).onsuccess = _0x35a20a;
    });
  async function _0x1bd2e3(_0x45a4b0) {
    const _0x5119c9 = ['', '', '', '', ''];
    function _0x4a1906(_0x543d71) {
      if (!_0x543d71 || typeof _0x543d71 !== "object") return;
      if (_0x543d71.type === "SequenceExpression") {
        let _0x29f2f6, _0x4a349d;
        for (const _0x1fd608 of _0x543d71.expressions) {
          if (_0x1fd608.type === "AssignmentExpression" && _0x1fd608.right?.["value"] === "url('img/cursor1.png'), pointer") _0x29f2f6 = _0x1fd608;else _0x1fd608.type === "AssignmentExpression" && (_0x4a349d = _0x1fd608);
        }
        _0x29f2f6 && _0x4a349d?.["left"]?.["property"]?.["name"] && (_0x5119c9[0] = _0x4a349d.left.property.name);
      }
      _0x543d71.type === "AssignmentExpression" && _0x543d71.left?.["object"]?.["type"] === "ThisExpression" && _0x543d71.right?.["type"] === "ArrayExpression" && _0x543d71.right.elements.length === 9 && _0x543d71.right.elements.every(_0x566b9d => _0x566b9d?.['type'] === "ArrayExpression") && (_0x5119c9[1] = _0x543d71.left.property.name);
      if (_0x543d71.type === "AssignmentExpression" && _0x543d71.right?.['type'] === "ObjectExpression" && _0x543d71.left?.["object"]?.["type"] === "ThisExpression") for (const _0x10d72b of _0x543d71.right.properties) {
        const _0x56d822 = _0x10d72b.value?.["arguments"];
        if (Array.isArray(_0x56d822) && _0x56d822.some(_0x3313cf => _0x3313cf?.["value"] === "commandInput")) {
          _0x5119c9[2] = _0x543d71.left.property.name;
          break;
        }
      }
      _0x543d71.type === "AssignmentExpression" && _0x543d71.left?.["object"]?.['type'] === "ThisExpression" && _0x543d71.right?.["type"] === "UnaryExpression" && _0x543d71.right.argument?.["value"] === 1000000 && (_0x5119c9[3] = _0x543d71.left.property.name);
      if (_0x543d71.type === "AssignmentExpression" && _0x543d71.right?.["type"] === "ObjectExpression" && _0x543d71.left?.["object"]?.["type"] === "ThisExpression") for (const _0x409d8d of _0x543d71.right.properties) {
        const _0x5a7b9a = _0x409d8d.value?.['arguments'];
        if (Array.isArray(_0x5a7b9a) && _0x5a7b9a.some(_0x3b40ae => _0x3b40ae?.["value"] === "serverAddressBlock")) {
          _0x5119c9[4] = _0x543d71.left.property.name;
          break;
        }
      }
      for (const _0x2fb8a9 in _0x543d71) {
        const _0x5e0bf7 = _0x543d71[_0x2fb8a9];
        if (Array.isArray(_0x5e0bf7)) _0x5e0bf7.forEach(_0x4a1906);else _0x5e0bf7 && typeof _0x5e0bf7 === 'object' && _0x4a1906(_0x5e0bf7);
      }
    }
    return _0x4a1906(_0x45a4b0), _0x5119c9;
  }
  function _0x211f6e(_0x2e780f) {
    for (const _0x2c570c of _0x2e780f) {
      if (!_0x2c570c) continue;
      const _0xd75fc8 = _0x2c570c + '\x20';
      Object.defineProperty(Object.prototype, _0x2c570c, {
        'configurable': !![],
        'set'(_0x4e72b6) {
          this[_0xd75fc8] = _0x4e72b6, setTimeout(() => _0x1eec1d.push(this), 0);
        },
        'get'() {
          return this[_0xd75fc8];
        }
      });
    }
  }
  function _0x14bb9e() {
    const _0x1e4518 = new XMLHttpRequest();
    _0x1e4518.open("GET", _0x3b2dad, !![]), _0x1e4518.onreadystatechange = async () => {
      if (_0x1e4518.readyState !== 4 || _0x1e4518.status !== 200) return;
      _0x450959 = _0x1e4518;
      const _0x5bb984 = _0x3b2dad.match(/v=(\d+)/)?.[1],
        _0x7b5bae = await _0x213974("__ClientHandler__");
      let _0x26eace;
      if (_0x7b5bae && _0x7b5bae.version === _0x5bb984 && Array.isArray(_0x7b5bae.props)) _0x26eace = _0x7b5bae.props; else {
        const _0x3dcd35 = () => {
            const _0x2e1adb = document.createElement('style');
            _0x2e1adb.innerHTML = `
                #arct-loader-container {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(5, 5, 8, 0.95); z-index: 99999;
                    display: flex; justify-content: center; align-items: center;
                    font-family: 'Baloo Paaji 2', -apple-system, sans-serif;
                }
                .arct-box {
                    background: #090d16; padding: 30px; border-radius: 12px;
                    box-shadow: 0 0 30px rgba(0, 255, 204, 0.25), inset 0 0 15px rgba(0, 255, 204, 0.1);
                    text-align: center; width: 360px; border: 1px solid #00ffcc;
                }
                .arct-spinner {
                    border: 4px solid rgba(0, 255, 204, 0.1); border-top: 4px solid #00ffcc;
                    border-radius: 50%; width: 45px; height: 45px;
                    animation: arct-spin 0.8s linear infinite; margin: 0 auto 18px;
                    box-shadow: 0 0 15px #00ffcc;
                }
                .arct-progress-bg {
                    background: #111827; height: 8px; width: 100%; 
                    border-radius: 10px; margin: 18px 0; overflow: hidden;
                    border: 1px solid rgba(0, 255, 204, 0.2);
                }
                #arct-progress-bar {
                    background: #00ffcc; height: 100%; width: 0%; 
                    transition: width 0.4s ease-out; box-shadow: 0 0 12px #00ffcc, 0 0 25px #00ffcc;
                }
                @keyframes arct-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .arct-text { 
                    color: #ffffff; font-size: 20px; font-weight: bold; 
                    text-shadow: 0 0 10px rgba(0, 255, 204, 0.6); 
                    letter-spacing: 1px;
                }
                .arct-subtext { 
                    color: #00ffcc; font-size: 11px; margin-top: 6px; 
                    text-transform: uppercase; letter-spacing: 2px; opacity: 0.8;
                    text-shadow: 0 0 5px rgba(0, 255, 204, 0.4);
                }
            `;
            document.head.appendChild(_0x2e1adb);
            
            const _0x1ffa25 = `
                <div id="arct-loader-container">
                    <div class="arct-box">
                        <div class="arct-spinner"></div>
                        <div class="arct-text">ARCT CHEATS</div>
                        <div class="arct-progress-bg"><div id="arct-progress-bar"></div></div>
                        <div id="arct-status" class="arct-subtext">Initializing ARCT System...</div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML("beforeend", _0x1ffa25);
        };

        const _0x37b16f = () => document.getElementById('arct-loader-container')?.["remove"]();
        _0x3dcd35();

        const _0x5319d7 = ["ARCT Scopes...", "ARCT Logic...", "ARCT Nodes...", "ARCT Engine...", "ARCT Security...", "ARCT Ready!"];
        let _0x4c013a = 0;
        const _0x356c66 = document.getElementById('arct-progress-bar'),
            _0x3a8b1a = document.getElementById("arct-status"),
            _0x5b5cab = setInterval(() => {
                _0x4c013a += (99 - _0x4c013a) * 0.02, _0x356c66.style.width = _0x4c013a + '%';
                const _0x477f7e = Math.floor(_0x4c013a / 100 * _0x5319d7.length);
                _0x5319d7[_0x477f7e] && (_0x3a8b1a.innerText = _0x5319d7[_0x477f7e]);
            }, 800),
            _0x14a03d = await (await fetch(document.querySelector('script[src*="packages.js"]').src)).text(),
            _0x1f0586 = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x14a03d + "\n                    self.onmessage = async (e) => {\n                        try {\n                            const result = await Terser.minify(e.data, {\n                                compress: { passes: 1 },\n                                mangle: false\n                            });\n                            self.postMessage({ success: true, code: result.code });\n                        } catch (err) {\n                            self.postMessage({ success: false, error: err.message });\n                        }\n                    };\n                ",
            _0xed9b3c = new Worker(URL.createObjectURL(new Blob([_0x1f0586], {
                'type': "application/javascript"
            }))),
            _0x10a26f = _0x430694 => {
                return new Promise((_0x5080af, _0x683c64) => {
                    _0xed9b3c.onmessage = _0x2cbca3 => {
                        clearInterval(_0x5b5cab), _0x356c66.style.width = "100%", _0x3a8b1a.innerText = 'ARCT Ready!', setTimeout(() => {
                            _0x2cbca3.data.success ? _0x5080af(_0x2cbca3.data.code) : _0x683c64(_0x2cbca3.data.error);
                        }, 300);
                    }, _0xed9b3c.postMessage(_0x430694);
                });
            },
            _0x21924e = await _0x10a26f(_0x1e4518.responseText),
            _0x2969ff = acorn.parse(_0x21924e, {
                'ecmaVersion': 2020
            });
        _0x37b16f(), _0x26eace = await _0x1bd2e3(_0x2969ff), await _0x513de1("__ClientHandler__", {
            'version': _0x5bb984,
            'props': _0x26eace
        });
      }
      _0x211f6e(_0x26eace);
      const _0x79bf89 = document.createElement("script");
      _0x79bf89.src = "https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify.min.js", document.head.appendChild(_0x79bf89);
      localStorage.getItem('VoidStorage') && localStorage.removeItem("VoidStorage");
      localStorage.getItem("cto_version") && localStorage.removeItem("cto_version");
      localStorage.getItem('cto_cache') && localStorage.removeItem("cto_cache");
      localStorage.getItem('cto_prop') && localStorage.removeItem("cto_prop");
      localStorage.getItem('cto_code') && localStorage.removeItem("cto_code");
      localStorage.getItem("cto_id") && localStorage.removeItem("cto_id");
      localStorage.getItem("VOID") && localStorage.removeItem("VOID");
      localStorage.getItem('\x20\x20') && localStorage.removeItem('\x20\x20');
      localStorage.getItem('\x20') && localStorage.removeItem('\x20');
      let _0x3bc407,
        _0x97a36e,
        _0x3395bf,
        _0x7b38a2,
        _0x39ab1c,
        _0x2df435,
        _0x24c604,
        _0x3c4536,
        _0x477b40,
        _0xbe3a39,
        _0x1225af,
        _0xe2a98a,
        _0x5b218a,
        _0x59cdca = ![],
        _0x5d7ebd = ![],
        _0x159901 = ![],
        _0x29e555 = {},
        _0x116019 = null,
        _0x5abb16 = null,
        _0x708bf1 = ![],
        _0x28920c = ![],
        _0x4c6c55 = ![],
        _0x595c6a = ![],
        _0x2e00d9 = ![],
        _0x352145 = Infinity,
        _0x1d1dbe = 0,
        _0x4d6c3f = 0,
        _0x13a394 = 0,
        _0x10eff0 = 0,
        _0x45d552 = ![],
        _0x5e7c97 = ![],
        _0x17b401 = ![],
        _0x3f754d = 0,
        _0x2d957a = Date.now(),
        _0x4d0ecf = 0,
        _0xf0d15d = 0,
        _0x161dc9 = 0,
        _0x541fb9 = 0,
        _0xfb8a29 = 0,
        _0x40e32d = 0,
        _0x52e652 = 0;
      function _0x3d48c0() {
        const _0x5813a6 = Date.now();
        if (_0x5813a6 - _0x499bb4 < 5000) {
          _0x12a87d("#3b3b3b", "Please wait 5 seconds before using that!");
          return;
        } else _0x12a87d("#3b3b3b", "Sending request to Token Holder!"), _0x499bb4 = _0x5813a6;
        let _0x3bc846 = _0x53166f.websocket.url.split('?')[0],
          _0x1b5a90 = _0x73cd4e.localToken.Token,
          _0x3587ab = _0x73cd4e.localToken.TokenID,
          _0x57347f = 0,
          _0x42a94b,
          _0x343e44;
        switch (_0x73cd4e.tokenHolder.seedToPlace) {
          case "Berry Seed":
            _0x57347f = 206;
            break;
          case "Wheat Seed":
            _0x57347f = 225;
            break;
          case 'Pumpkin\x20Seed':
            _0x57347f = 290;
            break;
          case 'Carrot\x20Seed':
            _0x57347f = 314;
            break;
          case "Tomato Seed":
            _0x57347f = 316;
            break;
          case "Thornbush Seed":
            _0x57347f = 295;
            break;
          case 'Garlic\x20Seed':
            _0x57347f = 293;
            break;
          case "Watermelon Seed":
            _0x57347f = 318;
            break;
          default:
            _0x57347f = 0;
            break;
        }
        switch (_0x73cd4e.tokenHolder.craftId) {
          case "Golden Pitchfork":
            _0x42a94b = 100;
            break;
          case "Bands":
            _0x42a94b = 297;
            break;
          case "Dragon Arrows":
            _0x42a94b = 189;
            break;
          case "Reidite Wall":
            _0x42a94b = 327;
            break;
          case "Reidite Door":
            _0x42a94b = 328;
            break;
          case "Reidite Spike":
            _0x42a94b = 329;
            break;
          case "Reidite Spiked Door":
            _0x42a94b = 330;
            break;
          case 'Bed':
            _0x42a94b = 300;
            break;
          case "Bottle":
            _0x42a94b = 218;
            break;
          default:
            _0x42a94b = 0;
            break;
        }
        switch (_0x73cd4e.tokenHolder.recycleId) {
          case "Hood":
            _0x343e44 = 156;
            break;
          case "Saddle":
            _0x343e44 = 162;
            break;
          case 'Book':
            _0x343e44 = 46;
            break;
          case "Plot":
            _0x343e44 = 234;
            break;
          case 'WTT':
            _0x343e44 = 228;
            break;
          case 'Bed':
            _0x343e44 = 300;
            break;
          default:
            _0x343e44 = 0;
            break;
        }
        const _0x4e00c2 = {
          'server': _0x3bc846,
          'token': _0x1b5a90,
          'tokenid': _0x3587ab,
          'Settings': {
            'BlueCrown': _0x73cd4e.tokenHolder.bluecrown,
            'AutoFarm': {
              'Enabled': _0x73cd4e.tokenHolder.autofarm,
              'TLX': _0x73cd4e.AutoFarm.TLX,
              'TLY': _0x73cd4e.AutoFarm.TLY,
              'BRX': _0x73cd4e.AutoFarm.BRX,
              'BRY': _0x73cd4e.AutoFarm.BRY,
              'SX': _0x73cd4e.AutoFarm.SX,
              'SY': _0x73cd4e.AutoFarm.SY
            },
            'Whitelist': _0x73cd4e.AutoFarm.whitelist.split('\x20') || [],
            'AutoSeed': {
              'Enabled': _0x73cd4e.tokenHolder.autoseed,
              'seedToPlace': _0x57347f
            },
            'AutoCraftAndRecycle': {
              'Enabled': _0x73cd4e.tokenHolder.autocraft || _0x73cd4e.tokenHolder.autorecycle,
              'craftId': _0x42a94b,
              'recycleId': _0x343e44,
              'CraftEnabled': _0x73cd4e.tokenHolder.autocraft,
              'RecycleEnabled': _0x73cd4e.tokenHolder.autorecycle
            }
          }
        };
        _0x509bba && _0x509bba.send(_0x5a1a84(JSON.stringify([5, _0x4e00c2])));
      }
      let _0x73cd4e = {
        'darkMode': 0,
        'putToChest': 10,
        'pingDisplay': 0,
        'fpsDisplay': 1,
        'gaugeTimer': 1,
        'gaugePercentages': 1,
        'boxInfo': 1,
        'fireInfo': 1,
        'timePlayed': {
          'active': 0,
          'start': 0,
          'resetClock': !![]
        },
        'daysAlive': 1,
        'chestInfo': {
          'texture': 'Bright',
          'active': 1
        },
        'playerTimers': "Enemys",
        'smoothRoofs': 1,
        'joinsLeaves': 1,
        'menuOpacity': 0.5,
        'buildingInfo': 1,
        'playersOnTop': 1,
        'treasureChestOnTop': 1,
        'skinChanger': {
          'active': 0,
          'skin': 0
        },
        'bagChanger': {
          'active': 0,
          'bag': 0
        },
        'bookChanger': {
          'active': 0,
          'book': 0
        },
        'accChanger': {
          'active': 0,
          'acc': 0
        },
        'totemOnMap': {
          'active': 1,
          'x': 0,
          'y': 0
        },
        'deathOnMap': {
          'active': 1,
          'x': 0,
          'y': 0
        },
        'drawLeaderboardAllies': 1,
        'ZmaAutoCrown':0,
        'playerTracers': 1,
        'ColoredSpikes': {
          'texture': "Light",
          'active': 1
        },
        'vehicleOpacity': 0.5,
        'listEnabledHacks': {
          'mode': "Bottom Left"
        },
        'movementPredictor': 1,
        'blizzardAndSandstorm': 1,
        'Debugger': {
          'mode': "None"
        },
        'equipAfterPlace': {
          'active': 0
        },
        'Spectator': {
          'bind': "KeyV",
          'speed': 25
        },
        'DropSword': {
          'bind': "Numpad6"
        },
        'Roof': {
          'active': 1,
          'opacity': 0.5
        },
        'Hidden': {
          'active': ![],
          'bind': "Numpad6"
        },
        'AutoSteal': {
          'active': ![],
          'bind': "NONE"
        },
        'AutoCraft': {
          'active': ![],
          'bind': "KeyC"
        },
        'AutoExtPut': {
          'active': ![],
          'bind': "KeyU"
        },
        'AutoExtTake': {
          'active': ![],
          'bind': 'NONE'
        },
        'AutoBreadTake': {
          'active': ![],
          'bind': "NONE"
        },
        'AutoBreadPut': {
          'active': ![],
          'bind': 'KeyI'
        },
        'AutoRecycle': {
          'active': ![],
          'bind': "KeyE"
        },
        'SmartCraft': {
          'active': ![],
          'option': "Gold Spikes",
          'amount': 10,
          'bind': 'NONE'
        },
        'Xray': {
          'active': !![],
          'opacity': 0.5,
          'bind': "KeyZ"
        },
        'AutoWall': {
          'active': ![],
          'mode': "Normal",
          'bind': "Space"
        },
        'AutoSpike': {
          'active': ![],
          'mode': "Normal",
          'bind': 'KeyF',
          'speed': 4
        },
        'AutoCrown': {
          'active': ![],
          'bind': "NONE"
        },
        'AutoTotem': {
          'active': ![],
          'bind': "KeyT"
        },
        'AutoBuild': {
          'active': ![],
          'bind': "Numpad2",
          'mode': "Bridges"
        },
        'AutoFire': {
          'active': ![],
          'bind': 'Numpad3',
        },
        'Aimbot': {
          'active': ![],
          'bind': 'Numpad1',
          'angle': 0,
          'mode': "Only Attack",
          'rangeVisual': 0,
          'BowRange': 300
        },
        'AutoIce': {
          'active': 1
        },
        'AutoFurnace': {
          'active': 0,
          'bind': "Numpad5"
        },
        'AutoRespawn': {
          'active': 0
        },
        'AutoBook': {
          'active': 1
        },
        'ZmaAutoBottle': {
          'enabled': 0,
          'health': 30
        },
        'AutoEmerald': {
          'active': ![],
          'bind': "KeyM",
          'angle': 0
        },
        'AutoTame': {
          'active': ![],
          'bind': "NONE",
          'angle': 0
        },
        'AutoLand': {
          'active': 0
        },
        'AutoHat': {
          'active': 0
        },
        'AutoDiving': {
          'active': 0
        },
        'AutoUnlock': {
          'active': 0
        },
        'AutoSeed': {
          'active': 0
        },
        'AutoFarm': {
          'active': ![],
          'bind': "KeyH",
          'angle': 0,
          'TLX': 0,
          'TLY': 0,
          'BRX': 0,
          'BRY': 0,
          'SX': 0,
          'SY': 0,
          'whitelist': ''
        },
        'PathFinder': {
          'active': ![],
          'bind': 'KeyP',
          'End': {
            'x': -1,
            'y': -1
          },
          'inventory': 1,
          'lastKit': 0
        },
        'Translation': {
          'recievedLang': "English (American)",
          'sentLang': "English (American)",
          'translateSent': 0,
          'translateRecieved': 1
        },
        'ZmaRedGold': {
          'active': ![],
          'bind': "NONE"
        },
        'Tracers': {
          'Krakens': 1,
          'Sandworms': 1,
          'BabyDragons': 0,
          'BabyLavaDragons': 0,
          'BabyMammoths': 0,
          'Bears': 0,
          'Boars': 0,
          'Crabs': 0,
          'Dragons': 0,
          'FireMobs': 0,
          'Foxes': 0,
          'Hawks': 0,
          'KingCrabs': 0,
          'LavaDragons': 0,
          'Mammoths': 0,
          'Penguins': 0,
          'Piranhas': 0,
          'Rabbits': 0,
          'Spiders': 0,
          'Vultures': 0,
          'Wolfs': 0,
          'GoldenHens': 0,
          'GoldenChickens': 0,
          'Ocelots': 0,
          'Crocodiles': 0,
          'Parrots': 0
        },
        'canvasBrightness': 1,
        'localToken': {
          'TokenID': _0x307e7f("starve_token_id")
        },
        'showLeaderBoardLevels': 1,
        'increasedZoom': "Auto",
        'tokenHolder': {
          'autofarm': 0,
          'autoseed': 0,
          'autocraft': 0,
          'autorecycle': 0,
          'craftId': 0,
          'recycleId': 0,
          'seedToPlace': 0,
          'bluecrown': 0
        },
        
};
      const _0x122c9c = {
        'darkMode': 0,
        'putToChest': 1,
        'pingDisplay': 2,
        'fpsDisplay': 3,
        'gaugeTimer': 4,
        'gaugePercentages': 5,
        'boxInfo': 6,
        'fireInfo': 7,
        ["timePlayed.active"]: 8,
        ['timePlayed.start']: 9,
        ["timePlayed.resetClock"]: 10,
        'daysAlive': 11,
        ["chestInfo.texture"]: 12,
        ["chestInfo.active"]: 13,
        'playerTimers': 14,
        'smoothRoofs': 15,
        'joinsLeaves': 16,
        'menuOpacity': 17,
        'buildingInfo': 18,
        'playersOnTop': 19,
        ['skinChanger.active']: 20,
        ["skinChanger.skin"]: 21,
        ["bagChanger.active"]: 22,
        ['bagChanger.bag']: 23,
        ["bookChanger.active"]: 24,
        ["bookChanger.book"]: 25,
        ["accChanger.active"]: 26,
        ['accChanger.acc']: 27,
        ["totemOnMap.active"]: 28,
        ["totemOnMap.x"]: 29,
        ["totemOnMap.y"]: 30,
        ["deathOnMap.active"]: 31,
        ['deathOnMap.x']: 32,
        ['deathOnMap.y']: 33,
        'drawLeaderboardAllies': 34,
        'ZmaAutoCrown': 35,
        'playerTracers': 36,
        ['ColoredSpikes.texture']: 37,
        ['ColoredSpikes.active']: 38,
        'vehicleOpacity': 39,
        ["listEnabledHacks.mode"]: 40,
        'movementPredictor': 41,
        'blizzardAndSandstorm': 42,
        ["Debugger.mode"]: 43,
        ["Spectator.bind"]: 44,
        ["Spectator.speed"]: 45,
        ["DropSword.bind"]: 46,
        ["Roof.active"]: 47,
        ["Roof.opacity"]: 48,
        ["Hidden.active"]: 49,
        ["Hidden.bind"]: 50,
        ["AutoSteal.active"]: 0,
        ["AutoSteal.bind"]: 52,
        ["AutoCraft.active"]: 53,
        ["AutoCraft.bind"]: 54,
        ["AutoExtPut.active"]: 55,
        ['AutoExtPut.bind']: 56,
        ['AutoExtTake.active']: 0,
        ["AutoExtTake.bind"]: 0,
        ["AutoBreadTake.active"]: 59,
        ["AutoBreadTake.bind"]: 60,
        ['AutoBreadPut.active']: 61,
        ['AutoBreadPut.bind']: 62,
        ["AutoRecycle.active"]: 63,
        ["AutoRecycle.bind"]: 64,
        ["SmartCraft.active"]: 65,
        ["SmartCraft.option"]: 66,
        ['SmartCraft.amount']: 67,
        ["Xray.active"]: 68,
        ['Xray.opacity']: 69,
        ["Xray.bind"]: 70,
        ['AutoWall.active']: 71,
        ["AutoWall.mode"]: 72,
        ["AutoWall.bind"]: 73,
        ["AutoSpike.active"]: 74,
        ["AutoSpike.mode"]: 75,
        ['AutoSpike.bind']: 76,
        ["AutoSpike.speed"]: 77,
        ["AutoCrown.active"]: 78,
        ["AutoCrown.bind"]: 79,
        ["AutoTotem.active"]: 80,
        ['AutoTotem.bind']: 81,
        ['AutoBuild.active']: 82,
        ['AutoBuild.bind']: 83,
        ["AutoBuild.mode"]: 84,
        ["AutoFire.active"]: 85,
        ["AutoFire.bind"]: 86,
        ["Aimbot.active"]: 87,
        ["Aimbot.bind"]: 88,
        ["Aimbot.angle"]: 89,
        ["Aimbot.mode"]: 90,
        ["Aimbot.rangeVisual"]: 91,
        ["Aimbot.BowRange"]: 92,
        ["AutoIce.active"]: 93,
        ["AutoRespawn.active"]: 94,
        ["AutoBook.active"]: 95,
        ["ZmaAutoBottle.enabled"]: 96,
        ["ZmaAutoBottle.health"]: 97,
        ["AutoEmerald.active"]: 98,
        ['AutoEmerald.bind']: 99,
        ["AutoEmerald.angle"]: 100,
        ['AutoTame.active']: 101,
        ["AutoTame.bind"]: 102,
        ["AutoTame.angle"]: 103,
        ['AutoLand.active']: 104,
        ["AutoHat.active"]: 105,
        ["AutoDiving.active"]: 106,
        ["AutoUnlock.active"]: 107,
        ["AutoSeed.active"]: 108,
        ['AutoFarm.active']: 109,
        ["AutoFarm.bind"]: 110,
        ['AutoFarm.angle']: 111,
        ["AutoFarm.TLX"]: 112,
        ["AutoFarm.TLY"]: 113,
        ["AutoFarm.BRX"]: 114,
        ["AutoFarm.BRY"]: 115,
        ["AutoFarm.SX"]: 116,
        ["AutoFarm.SY"]: 117,
        ["PathFinder.active"]: 118,
        ["PathFinder.bind"]: 119,
        ["PathFinder.End.x"]: 120,
        ['PathFinder.End.y']: 121,
        ["PathFinder.inventory"]: 122,
        ['PathFinder.lastKit']: 123,
        ['Translation.recievedLang']: 124,
        ['Translation.sentLang']: 125,
        ["Translation.translateSent"]: 126,
        ['Translation.translateRecieved']: 127,
        ["ZmaRedGold.active"]: 128,
        ['ZmaRedGold.bind']: 129,
        ["Tracers.Krakens"]: 130,
        ["Tracers.Sandworms"]: 131,
        ["Tracers.BabyDragons"]: 132,
        ["Tracers.BabyLavaDragons"]: 133,
        ["Tracers.BabyMammoths"]: 134,
        ["Tracers.Bears"]: 135,
        ["Tracers.Boars"]: 136,
        ["Tracers.Crabs"]: 137,
        ["Tracers.Dragons"]: 138,
        ['Tracers.FireMobs']: 139,
        ["Tracers.Foxes"]: 140,
        ["Tracers.Hawks"]: 141,
        ['Tracers.KingCrabs']: 142,
        ["Tracers.LavaDragons"]: 143,
        ["Tracers.Mammoths"]: 144,
        ['Tracers.Penguins']: 145,
        ["Tracers.Piranhas"]: 146,
        ["Tracers.Rabbits"]: 147,
        ['Tracers.Spiders']: 148,
        ["Tracers.Vultures"]: 149,
        ["Tracers.Wolfs"]: 150,
        ['Tracers.GoldenHens']: 151,
        ["Tracers.GoldenChickens"]: 152,
        ["Tracers.Ocelots"]: 153,
        ["Tracers.Crocodiles"]: 154,
        ["Tracers.Parrots"]: 155,
        'canvasBrightness': 156,
        ['localToken.Token']: 157,
        ['localToken.TokenID']: 158,
        'showLeaderBoardLevels': 159,
        'increasedZoom': 160,
        ["market.wood"]: 161,
        ['market.stone']: 162,
        ["market.gold"]: 163,
        ["market.diamond"]: 164,
        ["market.amethyst"]: 165,
        ["market.reidite"]: 166,
        ["tokenHolder.autofarm"]: 167,
        ["tokenHolder.autoseed"]: 168,
        ["tokenHolder.autocraft"]: 169,
        ["tokenHolder.autorecycle"]: 170,
        ["tokenHolder.craftId"]: 171,
        ["tokenHolder.recycleId"]: 172,
        ["tokenHolder.seedToPlace"]: 173,
        ["AutoFarm.whitelist"]: 174,
        ["SmartCraft.bind"]: 175,
        ["tokenHolder.bluecrown"]: 176,
        ["AutoFurnace.active"]: 177,
        ["AutoFurnace.bind"]: 178,
        ["equipAfterPlace.active"]: 179,
        'treasureChestOnTop': 180
      };
      function _0xd119fc(_0x5577d3, _0x661406 = [], _0x4a5c62 = []) {
        for (const _0xaa58e9 in _0x5577d3) {
          const _0x3aa9a6 = _0x5577d3[_0xaa58e9],
            _0x205d1f = [..._0x661406, _0xaa58e9];
          typeof _0x3aa9a6 === "object" && _0x3aa9a6 !== null && !Array.isArray(_0x3aa9a6) ? _0xd119fc(_0x3aa9a6, _0x205d1f, _0x4a5c62) : _0x4a5c62.push(_0x205d1f.join('.'));
        }
        return _0x4a5c62;
      }
      function _0x4886c3(_0x3aaaa6) {
        const _0x46bd33 = [];
        function _0x1b5d85(_0x875e45, _0x16f0f0 = []) {
          for (const _0x53e716 in _0x875e45) {
            const _0x46c57c = _0x875e45[_0x53e716],
              _0x25db14 = [..._0x16f0f0, _0x53e716];
            if (typeof _0x46c57c === "object" && _0x46c57c !== null && !Array.isArray(_0x46c57c)) _0x1b5d85(_0x46c57c, _0x25db14);else {
              const _0x4f32ab = _0x25db14.join('.'),
                _0x1e67b2 = _0x122c9c[_0x4f32ab];
              _0x1e67b2 !== undefined && _0x46bd33.push([_0x1e67b2, _0x46c57c]);
            }
          }
        }
        return _0x1b5d85(_0x3aaaa6), _0x46bd33;
      }
      function _0x552271(_0x4fd9fd, _0x4c0438) {
        const _0x32832d = {},
          _0x137611 = {};
        for (const [_0x46b752, _0x4e46e3] of Object.entries(_0x4c0438)) {
          const _0x319a28 = _0x46b752.split('.');
          _0x32832d[_0x4e46e3] = _0x46b752, _0x137611[_0x4e46e3] = {
            'get': () => _0x319a28.reduce((_0x455945, _0x338264) => _0x455945?.[_0x338264], _0x4fd9fd),
            'set': _0xa329b4 => {
              const _0xd204ac = _0x319a28.pop(),
                _0x19d456 = _0x319a28.reduce((_0x566823, _0xec8bd) => _0x566823?.[_0xec8bd], _0x4fd9fd);
              _0x19d456 && _0xd204ac in _0x19d456 && (_0x19d456[_0xd204ac] = _0xa329b4);
            }
          };
        }
        return {
          'idToPath': _0x32832d,
          'valueRefs': _0x137611
        };
      }
      const {
        idToPath: _0x569c87,
        valueRefs: _0x5cf49a
      } = _0x552271(_0x73cd4e, _0x122c9c);
      function _0x4ec54b(_0x6a5563) {
        var _0xab5765 = '';
        for (var _0x3e4f5e = 0; _0x3e4f5e < _0x6a5563; _0x3e4f5e++) {
          _0xab5765 += String.fromCharCode(48 + Math.floor(Math.random() * 74));
        }
        return _0xab5765;
      }
      let _0x54270a = function () {},
        _0x35c51b = function () {},
        _0x5e72c8 = function () {},
        _0xce89d6 = class _0x50c18a {
          constructor(_0x3dc7de) {
            this.guiConfig = _0x3dc7de, this.guiTitle = 0, this.container = 0, this.customiseButton = 0, this.mainContent = 0, this.header = 0, this.secondOverlay = 0, this.guiButton = 0, this.overlay = 0, this.subfolderLabel = [], this.checkBoxLabel = [], this.rangeWrapper = [], this.rangeLabel = [], this.range = [], this.rangeValueDisplay = [], this.bindWrapper = [], this.bindLabel = [], this.bindButton = [], this.selectWrapper = [], this.selectLabel = [], this.select = [], this.buttonWrapper = [], this.button = [], this.textWrapper = [], this.textLabel = [], this.textInput = [], this.folderButton = [], this.realIndex = [], this.previousFolderName = null, this.cachedSavedValues = _0x4886c3(_0x73cd4e);
          }
          ["saveSettings"]() {
            const _0x3b9c88 = Date.now();
            _0x3b9c88 - _0x466018 < 100 && _0x524378 && clearTimeout(_0x524378), _0x466018 = _0x3b9c88, _0x524378 = _0x4cd684.setTimeout(() => {
              const _0x7fbb6f = _0x4886c3(_0x73cd4e);
              try {
                localStorage.setItem('settings_all', JSON.stringify(_0x7fbb6f));
              } catch (_0x51463e) {}
              this.cachedSavedValues = _0x7fbb6f, this.updateGuiValues?.();
            }, 100);
          }
          ["saveGuiSettings"]() {
            const _0xa05b40 = Object.keys(this.guiConfig).filter(_0x2aad53 => _0x2aad53 !== "folders" && _0x2aad53 !== "title"),
              _0x3d7f8d = _0xa05b40.map(_0x3b6bc1 => this.guiConfig[_0x3b6bc1]);
            localStorage.setItem("guiSettings", JSON.stringify(_0x3d7f8d));
          }
          ["xor"](_0x37c95d) {
            return Array.from(_0x37c95d).map(_0x1b2589 => String.fromCharCode(_0x1b2589.charCodeAt(0) ^ 1410065407)).join('');
          }
          ["updateGuiValues"]() {
            this.realIndex = 0;
            const _0x448228 = document.getElementById(this.xor("content"));
            if (!_0x448228) return _0x4cd684.setTimeout(() => {
              this.updateGuiValues();
            }, 500);
            Object.keys(this.guiConfig.folders).forEach(_0x596f95 => {
              this.guiConfig.folders[_0x596f95].forEach(_0x4a7c4c => {
                _0x4a7c4c.type === "subfolder" ? this.handleSubfolder(_0x448228, _0x4a7c4c.subfolder, _0x596f95) : (this.handleItem(_0x448228, _0x4a7c4c, _0x596f95, this.realIndex), this.realIndex++);
              });
            });
          }
          ["handleSubfolder"](_0x5f3765, _0x107f23, _0x31928b) {
            _0x107f23.forEach(_0x19c348 => {
              this.handleItem(_0x5f3765, _0x19c348, _0x31928b, this.realIndex), this.realIndex++;
            });
          }
          ["handleItem"](_0x41c6c5, _0xadebf1, _0xc75cf8, _0x390e32) {
            this.previousFolderName != _0xc75cf8 && (this.realIndex = 0, _0x390e32 = 0);
            this.previousFolderName = _0xc75cf8;
            if (_0xadebf1.type === "checkbox") {
              const _0x44abea = _0x41c6c5.querySelector("input[type=\"checkbox\"][id=\"" + this.xor(_0x390e32 + _0xc75cf8) + '\x22]');
              _0x44abea && (_0x44abea.checked = _0xadebf1.property ? _0xadebf1.object[_0xadebf1.property] : _0xadebf1.object);
            } else {
              if (_0xadebf1.type === "range") {
                const _0x6d8c4c = _0x41c6c5.querySelector("input[type=\"range\"][id=\"" + this.xor(_0x390e32 + _0xc75cf8) + '\x22]'),
                  _0x486ffc = _0x41c6c5.querySelector("input[type=\"number\"][id=\"" + this.xor(_0x390e32 + _0xc75cf8) + '\x22]');
                _0x6d8c4c && _0x486ffc && (_0x6d8c4c.value = _0xadebf1.property ? _0xadebf1.object[_0xadebf1.property] : _0xadebf1.object, _0x486ffc.value = _0xadebf1.property ? _0xadebf1.object[_0xadebf1.property] : _0xadebf1.object);
              } else {
                if (_0xadebf1.type === 'select') {
                  const _0x5d6487 = _0x41c6c5.querySelector("select[id=\"" + this.xor(_0x390e32 + _0xc75cf8) + '\x22]');
                  _0x5d6487 && (_0x5d6487.value = _0xadebf1.property ? _0xadebf1.object[_0xadebf1.property] : _0xadebf1.object);
                } else {
                  if (_0xadebf1.type === 'text') {
                    const _0x1e00f5 = _0x41c6c5.querySelector("input[type=\"text\"][id=\"" + this.xor(_0x390e32 + _0xc75cf8) + '\x22]');
                    _0x1e00f5 && (_0x1e00f5.value = _0xadebf1.property ? _0xadebf1.object[_0xadebf1.property] : _0xadebf1.object);
                  }
                }
              }
            }
          }
          ["build"]() {
            let _0x37db17 = this;
            const _0x3b24 = document.createElement("link");
            _0x3b24.href = "https://fonts.googleapis.com/css2?family=Baloo+Paaji&display=swap", _0x3b24.rel = "stylesheet", _0x3b24.onload = function () {
              const _0x6c6a21 = document.createElement('div');
              _0x37db17.container = _0x6c6a21, _0x6c6a21.id = _0x37db17.xor("gui"), _0x6c6a21.style.position = 'fixed', _0x6c6a21.style.width = _0x37db17.guiConfig.width + 'px', _0x6c6a21.style.height = _0x37db17.guiConfig.height + 'px', _0x6c6a21.style.backgroundColor = "transparent", _0x6c6a21.style.border = "8px solid rgb(11, 25, 50)", _0x6c6a21.style.borderRadius = "8px", _0x6c6a21.style.zIndex = '9999', _0x6c6a21.style.boxShadow = '0px\x206px\x2012px\x20rgba(0,\x200,\x200,\x200.4)', _0x6c6a21.style.display = "flex", _0x6c6a21.style.flexDirection = "column", _0x6c6a21.style.boxSizing = "border-box", _0x6c6a21.style.lineHeight = 1.5, _0x6c6a21.style.opacity = _0x37db17.guiConfig.opacity;
              if (_0x37db17.guiConfig.align == "left") _0x6c6a21.style.top = '0%', _0x6c6a21.style.left = '0%', _0x6c6a21.style.transform = "translate(0%, 0%)", _0x6c6a21.style.borderTopLeftRadius = "0px", _0x6c6a21.style.borderTopRightRadius = "8px";else {
                if (_0x37db17.guiConfig.align == "right") _0x6c6a21.style.top = '0%', _0x6c6a21.style.right = '0%', _0x6c6a21.style.transform = "translate(0%, 0%)", _0x6c6a21.style.borderTopLeftRadius = "8px", _0x6c6a21.style.borderTopRightRadius = "0px";else (_0x37db17.guiConfig.align == "middle" || _0x37db17.guiConfig.align == 'center') && (_0x6c6a21.style.top = "50%", _0x6c6a21.style.left = "50%", _0x6c6a21.style.transform = "translate(-50%, -50%)", _0x6c6a21.style.borderTopLeftRadius = '8px', _0x6c6a21.style.borderTopRightRadius = "8px");
              }
              _0x6c6a21.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", document.body.appendChild(_0x6c6a21);
              const _0x19c8ef = document.createElement('div');
              _0x37db17.guiTitle = _0x19c8ef, _0x19c8ef.id = _0x37db17.xor('guiTitle'), _0x19c8ef.textContent = _0x37db17.guiConfig.title, _0x19c8ef.style.backgroundColor = "rgb(11, 25, 50)", _0x19c8ef.style.color = "#ADD8E6", _0x19c8ef.style.fontSize = _0x37db17.guiConfig.fontSize + 8 + 'px', _0x19c8ef.style.padding = "12px", _0x19c8ef.style.textAlign = "left", _0x19c8ef.style.borderTopLeftRadius = "0px", _0x19c8ef.style.borderTopRightRadius = '0px', _0x19c8ef.style.marginBottom = '3px', _0x19c8ef.style.display = 'flex', _0x19c8ef.style.justifyContent = "space-between", _0x19c8ef.style.alignItems = "center", _0x6c6a21.appendChild(_0x19c8ef);
              let _0x3d3e12 = ![],
                _0x45a764,
                _0x3cb2cb;
              const _0x4bf973 = _0x6c6a21.querySelectorAll("input[type=\"range\"]");
              _0x4bf973.forEach(_0x268a3c => {
                _0x268a3c.addEventListener("mousedown", _0x20d6e5 => {
                  _0x20d6e5.stopPropagation();
                });
              }), _0x6c6a21.addEventListener('mousedown', _0x4e8667 => {
                if (!_0x4e8667.target.classList.contains("no-drag") && _0x4e8667.target.type !== "range" && _0x37db17.guiConfig.draggable) {
                  _0x3d3e12 = !![], _0x45a764 = _0x4e8667.clientX - _0x6c6a21.offsetLeft, _0x3cb2cb = _0x4e8667.clientY - _0x6c6a21.offsetTop;
                  _0x37db17.container && (_0x37db17.container.style.cursor = "grabbing");
                  const _0x295725 = {
                    'rangeWrapper': _0x37db17.rangeWrapper,
                    'rangeLabel': _0x37db17.rangeLabel,
                    'bindWrapper': _0x37db17.bindWrapper,
                    'selectWrapper': _0x37db17.selectWrapper,
                    'selectLabel': _0x37db17.selectLabel,
                    'buttonWrapper': _0x37db17.buttonWrapper,
                    'textWrapper': _0x37db17.textWrapper,
                    'textLabel': _0x37db17.textLabel
                  };
                  for (const [_0x48e636, _0x5c8b35] of Object.entries(_0x295725)) {
                    Array.isArray(_0x5c8b35) && _0x5c8b35.length > 0 && _0x5c8b35.forEach(_0x1480e7 => {
                      _0x1480e7 && (_0x1480e7.style.cursor = 'grabbing');
                    });
                  }
                }
              }), _0x6c6a21.addEventListener("mousemove", _0x434ff7 => {
                _0x3d3e12 && _0x37db17.guiConfig.draggable && (_0x6c6a21.style.left = _0x434ff7.clientX - _0x45a764 + 'px', _0x6c6a21.style.top = _0x434ff7.clientY - _0x3cb2cb + 'px');
              }), _0x6c6a21.addEventListener("mouseup", () => {
                if (!_0x37db17.guiConfig.draggable) return;
                _0x3d3e12 = ![];
                _0x37db17.container && (_0x37db17.container.style.cursor = "grab");
                const _0x5d4fc2 = {
                  'rangeWrapper': _0x37db17.rangeWrapper,
                  'rangeLabel': _0x37db17.rangeLabel,
                  'bindWrapper': _0x37db17.bindWrapper,
                  'selectWrapper': _0x37db17.selectWrapper,
                  'selectLabel': _0x37db17.selectLabel,
                  'buttonWrapper': _0x37db17.buttonWrapper,
                  'textWrapper': _0x37db17.textWrapper,
                  'textLabel': _0x37db17.textLabel
                };
                for (const [_0x1a70b4, _0x2d077e] of Object.entries(_0x5d4fc2)) {
                  Array.isArray(_0x2d077e) && _0x2d077e.length > 0 && _0x2d077e.forEach(_0xbcf67e => {
                    _0xbcf67e && (_0xbcf67e.style.cursor = "grab");
                  });
                }
              });
              const _0x50b7aa = document.createElement("div");
              _0x37db17.mainContent = _0x50b7aa, _0x50b7aa.style.display = 'flex', _0x50b7aa.style.height = _0x37db17.guiConfig.height - 85 + 'px', _0x50b7aa.style.borderRadius = "15px", _0x50b7aa.style.boxSizing = 'border-box', _0x50b7aa.style.lineHeight = 1.5, _0x6c6a21.appendChild(_0x50b7aa);
              const _0x57dc44 = document.createElement('div');
              _0x57dc44.id = _0x37db17.xor("sidebar"), _0x57dc44.style.width = "35%", _0x57dc44.style.color = "#ADD8E6", _0x57dc44.style.borderRadius = "8px", _0x57dc44.style.overflowY = 'auto', _0x57dc44.style.boxSizing = "border-box", _0x57dc44.style.lineHeight = 1.5, _0x57dc44.style.fontSize = _0x37db17.guiConfig.fontSize + 6 + 'px', _0x50b7aa.appendChild(_0x57dc44);
              const _0x1a1e00 = document.createElement('div');
              _0x1a1e00.id = _0x37db17.xor("content"), _0x1a1e00.style.width = "80%", _0x1a1e00.style.backgroundColor = "rgb(15, 29, 64)", _0x1a1e00.style.color = "#ADD8E6", _0x1a1e00.style.padding = "8px", _0x1a1e00.style.overflowY = "auto", _0x1a1e00.style.display = "flex", _0x1a1e00.style.flexDirection = "column", _0x1a1e00.style.borderRadius = "12px", _0x1a1e00.style.boxSizing = "border-box", _0x1a1e00.style.lineHeight = 1.5, _0x50b7aa.appendChild(_0x1a1e00);
              const _0x14a797 = document.createElement("button");
              _0x37db17.customiseButton = _0x14a797, _0x14a797.textContent = 'Personalized', _0x14a797.style.backgroundColor = "transparent", _0x14a797.style.color = "#ADD8E6", _0x14a797.style.border = "none", _0x14a797.style.borderRadius = "5px", _0x14a797.style.padding = "8px 12px", _0x14a797.style.cursor = "pointer", _0x14a797.style.marginLeft = 'auto', _0x14a797.style.fontSize = _0x37db17.guiConfig.fontSize + 'px', _0x14a797.style.fontFamily = "Baloo Paaji", _0x14a797.style.display = "flex", _0x14a797.style.alignItems = 'center';
              const _0x32104f = document.createElement("div");
              _0x5abb16 = _0x32104f, _0x37db17.secondOverlay = _0x32104f, _0x32104f.style.id = _0x37db17.xor("overlay"), _0x32104f.style.position = 'fixed', _0x32104f.style.backgroundColor = "transparent", _0x32104f.style.zIndex = "10000", _0x32104f.style.display = "none", _0x32104f.style.alignItems = "center", _0x32104f.style.justifyContent = 'center', _0x32104f.style.top = '0', _0x32104f.style.left = '0', _0x32104f.style.width = "100%", _0x32104f.style.height = "100%";
              let _0xfb09d6 = _0x3504c9 => {
                _0x3504c9.stopPropagation();
              };
              _0x32104f.addEventListener("mouseup", _0xfb09d6, ![]), _0x32104f.addEventListener("mousedown", _0xfb09d6, ![]), _0x32104f.addEventListener("keydown", _0xfb09d6, ![]), _0x32104f.addEventListener("keyup", _0xfb09d6, ![]);
              const _0x4920db = document.createElement("div");
              _0x4920db.style.backgroundColor = "rgb(15, 29, 64)", _0x4920db.style.padding = "20px", _0x4920db.style.borderRadius = "12px", _0x4920db.style.boxShadow = '0\x204px\x2016px\x20rgba(0,\x200,\x200,\x200.7)', _0x4920db.style.color = '#ADD8E6', _0x4920db.style.display = "flex", _0x4920db.style.flexDirection = "row", _0x4920db.style.width = "500px", _0x4920db.style.maxWidth = "90%";
              const _0x2d9aba = document.createElement("div");
              _0x2d9aba.style.flex = '1', _0x2d9aba.style.display = "flex", _0x2d9aba.style.flexDirection = 'column', _0x2d9aba.style.justifyContent = 'space-between';
              const _0x4b10e5 = document.createElement('h1');
              _0x4b10e5.textContent = 'Interface\x20Settings', _0x4b10e5.style.margin = '0', _0x4b10e5.style.fontSize = "20px", _0x4b10e5.style.marginBottom = "30px", _0x2d9aba.appendChild(_0x4b10e5);
              const _0x2caf89 = document.createElement("div");
              _0x116019 = _0x2caf89, _0x37db17.guiButton = _0x2caf89, _0x2caf89.style.display = _0x37db17.guiConfig.toggleGuiButton ? "flex" : "none", _0x2caf89.style.position = "fixed", _0x2caf89.style.top = '0', _0x2caf89.style.right = '0', _0x2caf89.style.width = '20px', _0x2caf89.style.height = "20px", _0x2caf89.style.backgroundColor = "transparent", _0x2caf89.style.cursor = "pointer", _0x2caf89.style.zIndex = '10000', _0x2caf89.style.opacity = "0.69", _0x2caf89.style.borderBottomLeftRadius = "4px", _0x2caf89.onmouseover = function () {
                _0x2caf89.style.opacity = '1';
              }, _0x2caf89.onmouseout = function () {
                _0x2caf89.style.opacity = "0.69";
              }, _0x2caf89.onclick = function () {
                const _0x1d88b8 = document.getElementById(_0x37db17.xor("gui")).style.display === "none";
                document.getElementById(_0x37db17.xor("gui")).style.display = _0x1d88b8 ? "flex" : "none", _0x37db17.secondOverlay.style.display = "none";
              }, _0x2caf89.addEventListener("mouseup", _0xfb09d6, ![]), _0x2caf89.addEventListener('mousedown', _0xfb09d6, ![]), _0x2caf89.addEventListener("keydown", _0xfb09d6, ![]), _0x2caf89.addEventListener("keyup", _0xfb09d6, ![]), document.body.appendChild(_0x2caf89);
              function _0x495cd9(_0x305e7c, _0x4ff984) {
                const _0x5ee8f7 = document.createElement('div');
                _0x5ee8f7.style.marginBottom = "16px", _0x5ee8f7.style.display = "flex";
                const _0x1c18fe = document.createElement('label');
                _0x1c18fe.textContent = _0x305e7c, _0x1c18fe.style.color = "#ADD8E6", _0x1c18fe.style.fontSize = "14px", _0x1c18fe.style.display = 'flex', _0x1c18fe.style.width = '100px', _0x1c18fe.style.alignItems = "center";
                const _0x1efffe = document.createElement("button");
                _0x1efffe.textContent = _0x37db17.guiConfig[_0x4ff984] || 'Set\x20Key\x20Bind', _0x1efffe.style.backgroundColor = 'transparent', _0x1efffe.style.color = "#ADD8E6", _0x1efffe.style.border = "none", _0x1efffe.style.borderRadius = "4px", _0x1efffe.style.padding = "2px 12px", _0x1efffe.style.cursor = "pointer", _0x1efffe.style.fontSize = "14px", _0x1efffe.style.fontFamily = 'Baloo\x20Paaji', _0x1efffe.style.height = '24px', _0x1efffe.addEventListener("click", () => {
                  _0x1efffe.textContent = "Press any key... (Escape to remove)", _0x1efffe.blur();
                  function _0x5e6de9(_0x28df4a) {
                    const _0x1b1f8a = _0x28df4a.code === "Escape" ? "NONE" : _0x28df4a.code;
                    _0x1efffe.textContent = _0x1b1f8a, _0x37db17.guiConfig[_0x4ff984] = _0x1b1f8a, document.removeEventListener("keydown", _0x5e6de9), _0x1efffe.blur();
                  }
                  document.addEventListener("keydown", _0x5e6de9);
                }), _0x5ee8f7.appendChild(_0x1c18fe), _0x5ee8f7.appendChild(_0x1efffe), _0x2d9aba.appendChild(_0x5ee8f7);
              }
              function _0x460a5c(_0x2170d7, _0x3e481d, _0x37da2e = 0.1, _0x3fb0a4 = 100, _0x5c9aa2 = 1, _0x2aa0c1 = 'px') {
                const _0x53c889 = document.createElement("div");
                _0x53c889.style.marginBottom = '16px', _0x53c889.style.display = "flex", _0x53c889.style.alignItems = 'center';
                const _0x488126 = document.createElement("label");
                _0x488126.textContent = _0x2170d7, _0x488126.style.color = "#ADD8E6", _0x488126.style.fontSize = "14px", _0x488126.style.width = "100px", _0x488126.style.height = "24px";
                const _0x143853 = document.createElement("input");
                _0x143853.type = "range", _0x143853.min = _0x37da2e, _0x143853.max = _0x3fb0a4, _0x143853.step = _0x5c9aa2, _0x143853.value = _0x37db17.guiConfig[_0x3e481d], _0x143853.style.flex = '1', _0x143853.style.marginRight = "10px", _0x143853.style.cursor = "pointer";
                const _0x679788 = document.createElement("span");
                _0x679788.textContent = _0x143853.value + _0x2aa0c1, _0x679788.style.color = "#ADD8E6", _0x679788.style.width = "10%", _0x143853.addEventListener("input", _0x31aadf => {
                  _0x37db17.guiConfig[_0x3e481d] = _0x31aadf.target.value, _0x679788.textContent = _0x31aadf.target.value + _0x2aa0c1, _0x6c6a21.style[_0x3e481d] = _0x31aadf.target.value + _0x2aa0c1, _0x37db17.mainContent.style.height = _0x37db17.guiConfig.height - 85 + 'px', _0x3e481d === "fontSize" && (_0x37db17.guiConfig[_0x3e481d] = parseInt(_0x31aadf.target.value, 10), _0x6c6a21.style.fontSize = _0x37db17.guiConfig[_0x3e481d] + 'px', _0x37db17.folderButton.length && _0x37db17.folderButton.forEach(_0x1cd1c5 => {
                    _0x1cd1c5.style.fontSize = _0x37db17.guiConfig.fontSize + 6 + 'px';
                  }), _0x37db17.guiTitle && (_0x37db17.guiTitle.style.fontSize = _0x37db17.guiConfig.fontSize + 8 + 'px'), _0x37db17.customiseButton && (_0x37db17.customiseButton.style.fontSize = _0x37db17.guiConfig.fontSize + 'px'), _0x37db17.header && (_0x37db17.header.style.fontSize = _0x37db17.guiConfig.fontSize + 4 + 'px'), _0x37db17.checkBoxLabel.length && _0x37db17.checkBoxLabel.forEach(_0x1c7286 => {
                    _0x1c7286.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px';
                  }), _0x37db17.subfolderLabel.length && _0x37db17.subfolderLabel.forEach(_0x2e9a7e => {
                    _0x2e9a7e.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px';
                  }), _0x37db17.rangeLabel.length && _0x37db17.rangeLabel.forEach(_0x5acbe6 => {
                    _0x5acbe6.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px';
                  }), _0x37db17.range.length && _0x37db17.range.forEach(_0x21c23b => {
                    _0x21c23b.style.height = _0x37db17.guiConfig.fontSize - 8 + 'px';
                  }), _0x37db17.rangeValueDisplay.length && _0x37db17.rangeValueDisplay.forEach(_0x3227dc => {
                    _0x3227dc.style.fontSize = _0x37db17.guiConfig.fontSize - 2 + 'px';
                  }), _0x37db17.bindLabel.length && _0x37db17.bindLabel.forEach(_0x1fcd82 => {
                    _0x1fcd82.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px';
                  }), _0x37db17.bindButton.length && _0x37db17.bindButton.forEach(_0x9be26d => {
                    _0x9be26d.style.fontSize = _0x37db17.guiConfig.fontSize - 2 + 'px', _0x9be26d.style.height = _0x37db17.guiConfig.fontSize + 10 + 'px';
                  }), _0x37db17.overlay.length && _0x37db17.overlay.forEach(_0x181b7f => {
                    _0x181b7f.style.fontSize = _0x37db17.guiConfig.fontSize + 6 + 'px';
                  }), _0x37db17.selectLabel.length && _0x37db17.selectLabel.forEach(_0x196d14 => {
                    _0x196d14.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px';
                  }), _0x37db17.select.length && _0x37db17.select.forEach(_0x1efb74 => {
                    _0x1efb74.style.fontSize = _0x37db17.guiConfig.fontSize - 2 + 'px', _0x1efb74.style.height = _0x37db17.guiConfig.fontSize + 10 + 'px';
                  }), _0x37db17.button.length && _0x37db17.button.forEach(_0x3e2ad2 => {
                    _0x3e2ad2.style.fontSize = _0x37db17.guiConfig.fontSize - 2 + 'px', _0x3e2ad2.style.height = _0x37db17.guiConfig.fontSize + 10 + 'px';
                  }), _0x37db17.textInput.length && _0x37db17.textInput.forEach(_0x39dfce => {
                    _0x39dfce.style.fontSize = _0x37db17.guiConfig.fontSize - 2 + 'px';
                  }), _0x37db17.textLabel.length && _0x37db17.textLabel.forEach(_0x3ed28e => {
                    _0x3ed28e.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px';
                  })), _0x143853.blur();
                }), _0x53c889.appendChild(_0x488126), _0x53c889.appendChild(_0x143853), _0x53c889.appendChild(_0x679788), _0x2d9aba.appendChild(_0x53c889);
              }
              function _0x306809(_0x3d257d, _0x4be77a, _0x430c17) {
                const _0x1512e4 = document.createElement("div");
                _0x1512e4.style.marginBottom = "16px", _0x1512e4.style.display = "flex";
                const _0x585053 = document.createElement("label");
                _0x585053.textContent = _0x3d257d, _0x585053.style.color = '#ADD8E6', _0x585053.style.fontSize = "14px", _0x585053.style.width = "100px", _0x585053.style.display = "flex", _0x585053.style.alignItems = "center";
                const _0xd77ce3 = document.createElement('select');
                _0xd77ce3.style.backgroundColor = "transparent", _0xd77ce3.style.fontSize = "14px", _0xd77ce3.style.fontFamily = 'Baloo\x20Paaji', _0xd77ce3.style.color = "#ADD8E6", _0xd77ce3.style.border = "none", _0xd77ce3.style.borderRadius = '4px', _0xd77ce3.style.padding = "0px 8px", _0xd77ce3.style.width = '100%', _0xd77ce3.style.height = "24px", _0xd77ce3.style.cursor = 'pointer', _0xd77ce3.style.flex = '1', _0x430c17.forEach(_0x148dd4 => {
                  const _0x21e5d4 = document.createElement("option");
                  _0x21e5d4.value = _0x148dd4.value, _0x21e5d4.textContent = _0x148dd4.text, _0xd77ce3.appendChild(_0x21e5d4);
                }), _0xd77ce3.value = _0x37db17.guiConfig[_0x4be77a], _0xd77ce3.addEventListener("change", _0x1452a6 => {
                  _0x37db17.guiConfig[_0x4be77a] = _0x1452a6.target.value;
                  if (_0x1452a6.target.value === "left") _0x6c6a21.style.top = '0%', _0x6c6a21.style.left = '0%', _0x6c6a21.style.right = '', _0x6c6a21.style.transform = '', _0x6c6a21.style.borderTopLeftRadius = "0px", _0x6c6a21.style.borderTopRightRadius = '8px', _0x37db17.guiButton.style.left = '0%', _0x37db17.guiButton.style.right = '', _0x2caf89.style.borderBottomLeftRadius = "0px", _0x2caf89.style.borderBottomRightRadius = "4px";else _0x1452a6.target.value === 'right' ? (_0x6c6a21.style.top = '0%', _0x6c6a21.style.right = '0%', _0x6c6a21.style.left = '', _0x6c6a21.style.transform = '', _0x6c6a21.style.borderTopLeftRadius = "8px", _0x6c6a21.style.borderTopRightRadius = "0px", _0x37db17.guiButton.style.right = '0%', _0x37db17.guiButton.style.left = '', _0x2caf89.style.borderBottomLeftRadius = "4px", _0x2caf89.style.borderBottomRightRadius = "0px") : (_0x6c6a21.style.top = "50%", _0x6c6a21.style.left = "50%", _0x6c6a21.style.transform = 'translate(-50%,\x20-50%)', _0x6c6a21.style.borderTopLeftRadius = "8px", _0x6c6a21.style.borderTopRightRadius = "8px", _0x37db17.guiButton.style.right = '0%', _0x37db17.guiButton.style.left = '', _0x2caf89.style.borderBottomLeftRadius = '4px', _0x2caf89.style.borderBottomRightRadius = '0px');
                  _0xd77ce3.blur();
                }), _0x1512e4.appendChild(_0x585053), _0x1512e4.appendChild(_0xd77ce3), _0x2d9aba.appendChild(_0x1512e4);
              }
              function _0x2babdc(_0x4ff189, _0x2c2b18) {
                const _0x47f76b = document.createElement("div");
                _0x47f76b.style.marginBottom = '16px', _0x47f76b.style.display = 'flex';
                const _0x50fd4d = document.createElement("label");
                _0x50fd4d.textContent = _0x4ff189, _0x50fd4d.style.color = '#ADD8E6', _0x50fd4d.style.fontSize = '14px', _0x50fd4d.style.display = "flex", _0x50fd4d.style.alignItems = "center", _0x50fd4d.style.width = "100px", _0x50fd4d.style.height = "24px";
                const _0x3eabc0 = document.createElement('input');
                _0x3eabc0.type = "checkbox", _0x3eabc0.checked = _0x37db17.guiConfig[_0x2c2b18], _0x3eabc0.addEventListener("change", _0x170066 => {
                  _0x37db17.guiConfig[_0x2c2b18] = _0x170066.target.checked;
                  if (!_0x37db17.guiConfig.draggable) {
                    if (_0x37db17.guiConfig.align === 'left') _0x37db17.guiButton.style.left = '0%', _0x37db17.guiButton.style.right = '', _0x2caf89.style.borderBottomLeftRadius = '0px', _0x2caf89.style.borderBottomRightRadius = '4px', _0x6c6a21.style.top = '0%', _0x6c6a21.style.left = '0%', _0x6c6a21.style.right = '', _0x6c6a21.style.transform = '', _0x6c6a21.style.borderTopLeftRadius = "0px", _0x6c6a21.style.borderTopRightRadius = "8px";else _0x37db17.guiConfig.align === 'right' ? (_0x37db17.guiButton.style.right = '0%', _0x37db17.guiButton.style.left = '', _0x2caf89.style.borderBottomLeftRadius = "4px", _0x2caf89.style.borderBottomRightRadius = "0px", _0x6c6a21.style.top = '0%', _0x6c6a21.style.right = '0%', _0x6c6a21.style.left = '', _0x6c6a21.style.transform = '', _0x6c6a21.style.borderTopLeftRadius = '8px', _0x6c6a21.style.borderTopRightRadius = "0px") : (_0x37db17.guiButton.style.right = '0%', _0x37db17.guiButton.style.left = '', _0x2caf89.style.borderBottomLeftRadius = '4px', _0x2caf89.style.borderBottomRightRadius = "0px", _0x6c6a21.style.top = "50%", _0x6c6a21.style.left = "50%", _0x6c6a21.style.transform = "translate(-50%, -50%)", _0x6c6a21.style.borderTopLeftRadius = '8px', _0x6c6a21.style.borderTopRightRadius = "8px");
                  }
                  _0x37db17.guiButton.style.display = _0x37db17.guiConfig.toggleGuiButton ? 'flex' : "none", _0x37db17.container.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : 'default';
                  const _0x2c08e8 = {
                    'rangeWrapper': _0x37db17.rangeWrapper,
                    'rangeLabel': _0x37db17.rangeLabel,
                    'bindWrapper': _0x37db17.bindWrapper,
                    'selectWrapper': _0x37db17.selectWrapper,
                    'selectLabel': _0x37db17.selectLabel,
                    'buttonWrapper': _0x37db17.buttonWrapper,
                    'textWrapper': _0x37db17.textWrapper,
                    'textLabel': _0x37db17.textLabel
                  };
                  for (const [_0x5d38f1, _0x27a074] of Object.entries(_0x2c08e8)) {
                    Array.isArray(_0x27a074) && _0x27a074.length > 0 && _0x27a074.forEach(_0x439e11 => {
                      _0x439e11 && (_0x439e11.style.cursor = _0x37db17.guiConfig.draggable ? 'grab' : 'default');
                    });
                  }
                }), _0x50fd4d.appendChild(_0x3eabc0), _0x47f76b.appendChild(_0x50fd4d), _0x47f76b.appendChild(_0x3eabc0), _0x2d9aba.appendChild(_0x47f76b);
              }
              _0x495cd9("Toggle GUI:", "toggleGuiKey"), _0x460a5c("Width:", 'width', 400, 1000, 10), _0x460a5c("Height:", 'height', 300, 1000, 10), _0x460a5c('Font\x20Size:', "fontSize", 10, 18, 1), _0x460a5c('Opacity:', "opacity", 0.1, 1, 0.01, ''), _0x306809("Align:", "align", [{
                'value': 'left',
                'text': 'Left'
              }, {
                'value': "center",
                'text': "Center"
              }, {
                'value': 'right',
                'text': "Right"
              }]), _0x2babdc("Gui Button:", "toggleGuiButton"), _0x2babdc('Draggable:', "draggable"), document.addEventListener("keydown", _0x394acf => {
                if (_0x394acf.code === _0x37db17.guiConfig.toggleGuiKey) {
                  const _0x4f2913 = document.getElementById(_0x37db17.xor('gui')).style.display === "none";
                  document.getElementById(_0x37db17.xor("gui")).style.display = _0x4f2913 ? "flex" : 'none', _0x37db17.secondOverlay.style.display = "none";
                }
              });
              const _0x352227 = document.createElement("button");
              _0x352227.style.fontFamily = "Baloo Paaji", _0x352227.textContent = "Close", _0x352227.style.marginTop = "20px", _0x352227.style.backgroundColor = "transparent", _0x352227.style.color = '#ADD8E6', _0x352227.style.border = "none", _0x352227.style.borderRadius = '4px', _0x352227.style.padding = '10px\x2016px', _0x352227.style.cursor = "pointer", _0x352227.style.fontSize = "14px", _0x352227.style.transition = "background-color 0.3s", _0x352227.addEventListener("mouseover", () => {
                _0x352227.style.backgroundColor = "transparent";
              }), _0x352227.addEventListener('mouseout', () => {
                _0x352227.style.backgroundColor = "transparent";
              }), _0x352227.addEventListener('click', () => {
                _0x37db17.secondOverlay.style.display = "none", _0x37db17.saveGuiSettings();
              }), _0x2d9aba.appendChild(_0x352227), _0x4920db.appendChild(_0x2d9aba), _0x32104f.appendChild(_0x4920db), document.body.appendChild(_0x32104f), _0x14a797.addEventListener("click", () => {
                _0x37db17.secondOverlay.style.display = "flex", _0x14a797.blur();
              }), _0x19c8ef.appendChild(_0x14a797);
              const _0x5787b3 = document.createElement("style");
              _0x5787b3.innerHTML = "div.checkbox-wrapper:hover input[type='checkbox']:not(:checked) { background: #2563eb; border-color: white; } div { font-family: 'Baloo Paaji', sans-serif; } input[type='checkbox'] { font-family: 'Baloo Paaji', sans-serif; } #" + _0x37db17.xor('sidebar') + " button { font-family: 'Baloo Paaji', sans-serif; } #" + _0x37db17.xor('sidebar') + " h3 { font-family: 'Baloo Paaji', sans-serif; } label { font-family: 'Baloo Paaji', sans-serif; } div::-webkit-scrollbar { width: 8px; border-radius: 15px; } div::-webkit-scrollbar-track { background: #2563eb; border-radius: 15px; } div::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 15px; border: 3.5px solid #60a5fa; } input[type='checkbox'] { appearance: none; width: 20px; height: 20px; border: 3px solid #2563eb; border-radius: 4px; outline: none; cursor: pointer; transition: background 0.2s, border-color 0.2s; } input[type='checkbox']:checked { background: #2563eb; border-color: #00ff00; } input[type='checkbox']:checked::after { content: ''; } * { user-select: none; } #" + _0x37db17.xor("sidebar") + " { background-color: rgb(15, 29, 64); padding: 8px; border-right: 3.5px solid transparent; display: flex; flex-direction: column; gap: 10px; } #" + _0x37db17.xor("sidebar") + " button { background-color: transparent; color: #93c5fd; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease; text-align: left; display: flex; align-items: center; gap: 12px; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25); position: relative; overflow: hidden; min-height: 30px; } #" + _0x37db17.xor("sidebar") + " button:hover { background-color: transparent; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4); } #" + _0x37db17.xor('sidebar') + '\x20button:active\x20{\x20transform:\x20scale(0.96);\x20box-shadow:\x200\x203px\x206px\x20rgba(0,\x200,\x200,\x200.25);\x20}\x20#' + _0x37db17.xor('sidebar') + " button.active { background-color: transparent; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4); outline: 3.5px solid #60a5fa; } #" + _0x37db17.xor("sidebar") + " button:before { content: ''; position: absolute; left: -50%; top: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 10%, #fff 40%); transition: opacity 0.5s, transform 0.5s; opacity: 0; transform: scale(0); z-index: 0; } #" + _0x37db17.xor("sidebar") + " button:hover:before { opacity: 1; transform: scale(1.2); } ", document.head.appendChild(_0x5787b3);
              function _0x5dec22(_0x12d5eb, _0x3a0541) {
                _0x37db17.checkBoxLabel = [], _0x37db17.subfolderLabel = [], _0x37db17.rangeWrapper = [], _0x37db17.rangeLabel = [], _0x37db17.range = [], _0x37db17.rangeValueDisplay = [], _0x37db17.bindWrapper = [], _0x37db17.bindLabel = [], _0x37db17.bindButton = [], _0x37db17.selectWrapper = [], _0x37db17.selectLabel = [], _0x37db17.select = [], _0x37db17.buttonWrapper = [], _0x37db17.button = [], _0x37db17.textWrapper = [], _0x37db17.textLabel = [], _0x37db17.textInput = [], _0x1a1e00.innerHTML = '';
                const _0x3cffb4 = document.createElement('h69');
                _0x37db17.header = _0x3cffb4, _0x3cffb4.textContent = _0x12d5eb, _0x3cffb4.style.color = "#ADD8E6", _0x3cffb4.style.marginTop = "0px", _0x3cffb4.style.marginBottom = "8px", _0x3cffb4.style.fontSize = _0x37db17.guiConfig.fontSize + 4 + 'px', _0x3cffb4.style.fontFamily = "Baloo Paaji", _0x3cffb4.style.padding = "10px 15px", _0x3cffb4.style.backgroundColor = "transparent", _0x3cffb4.style.borderRadius = '5px', _0x3cffb4.style.boxShadow = '0\x202px\x205px\x20rgba(0,\x200,\x200,\x200.3)', _0x1a1e00.appendChild(_0x3cffb4), _0x37db17.realIndex = 0;
                let _0x13ecd9 = 0;
                _0x3a0541[0] && _0x3a0541.forEach(_0x3a26d7 => {
                  _0x3a26d7.type === "subfolder" && (_0x37db17.realIndex--, _0x13ecd9 = _0x37db17.realIndex);
                  if (_0x3a26d7.type === 'checkbox') {
                    const _0x189173 = document.createElement("div");
                    _0x189173.className = 'checkbox-wrapper', _0x189173.style.marginLeft = '0px', _0x189173.style.marginBottom = '4px', _0x189173.style.display = "flex", _0x189173.style.alignItems = "center", _0x189173.style.backgroundColor = "transparent", _0x189173.style.padding = '2px\x2010px', _0x189173.style.borderRadius = '4px', _0x189173.style.transition = "background-color 0.3s", _0x189173.style.cursor = "pointer", _0x189173.style.lineHeight = 1.5, _0x189173.addEventListener("mouseenter", () => {
                      _0x189173.style.backgroundColor = "transparent";
                    }), _0x189173.addEventListener('mouseleave', () => {
                      _0x189173.style.backgroundColor = "transparent";
                    });
                    const _0x1a6e60 = document.createElement('label');
                    _0x37db17.checkBoxLabel.push(_0x1a6e60), _0x1a6e60.textContent = _0x3a26d7.label, _0x1a6e60.style.color = "#ADD8E6", _0x1a6e60.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px', _0x1a6e60.style.cursor = 'pointer', _0x1a6e60.style.flexGrow = '1';
                    const _0x54a14f = document.createElement("input");
                    _0x54a14f.type = "checkbox", _0x54a14f.checked = _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] : _0x3a26d7.object, _0x54a14f.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x54a14f.style.margin = "0px", _0x189173.addEventListener('click', _0x2458ce => {
                      _0x2458ce.target !== _0x54a14f && (_0x54a14f.checked = !_0x54a14f.checked, _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] = Number(_0x54a14f.checked) : _0x3a26d7.object = Number(_0x54a14f.checked), _0x3a26d7.onChange ? _0x3a26d7.onChange(Number(_0x54a14f.checked)) : undefined, _0x3a26d7.action ? _0x3a26d7.action(Number(_0x54a14f.checked)) : undefined, _0x37db17.updateGuiValues());
                    }), _0x54a14f.addEventListener("change", () => {
                      _0x54a14f.blur(), _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] = Number(_0x54a14f.checked) : _0x3a26d7.object = Number(_0x54a14f.checked), _0x3a26d7.onChange ? _0x3a26d7.onChange(Number(_0x54a14f.checked)) : undefined, _0x3a26d7.action ? _0x3a26d7.action(Number(_0x54a14f.checked)) : undefined, _0x37db17.updateGuiValues();
                    }), _0x189173.appendChild(_0x1a6e60), _0x189173.appendChild(_0x54a14f), _0x1a1e00.appendChild(_0x189173), _0x37db17.realIndex++, _0x13ecd9 = _0x37db17.realIndex;
                  } else {
                    if (_0x3a26d7.type === "range") {
                      const _0x259452 = document.createElement("div");
                      _0x37db17.rangeWrapper.push(_0x259452), _0x259452.style.marginLeft = "0px", _0x259452.style.marginBottom = '4px', _0x259452.style.backgroundColor = "transparent", _0x259452.style.padding = "10px 10px", _0x259452.style.borderRadius = "4px", _0x259452.style.transition = 'background-color\x200.3s', _0x259452.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x259452.addEventListener("mouseenter", () => {
                        _0x259452.style.backgroundColor = "transparent";
                      }), _0x259452.addEventListener("mouseleave", () => {
                        _0x259452.style.backgroundColor = "transparent";
                      });
                      const _0x40ffb0 = document.createElement("div");
                      _0x40ffb0.style.display = "flex", _0x40ffb0.style.justifyContent = "space-between", _0x40ffb0.style.alignItems = "center", _0x40ffb0.style.width = "100%", _0x40ffb0.style.marginBottom = "10px";
                      const _0x4159d0 = document.createElement("label");
                      _0x37db17.rangeLabel.push(_0x4159d0), _0x4159d0.textContent = '\x20' + _0x3a26d7.label, _0x4159d0.style.color = "#ADD8E6", _0x4159d0.style.fontSize = _0x37db17.guiConfig.fontSize + 2 - 2 + 'px', _0x4159d0.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x4159d0.style.flexShrink = '0';
                      const _0x115eb4 = document.createElement("input");
                      _0x37db17.rangeValueDisplay.push(_0x115eb4), _0x115eb4.type = 'number', _0x115eb4.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x115eb4.value = _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] : _0x3a26d7.object, _0x115eb4.min = _0x3a26d7.min, _0x115eb4.max = _0x3a26d7.max, _0x115eb4.step = _0x3a26d7.step || 1, _0x115eb4.style.width = "80px", _0x115eb4.style.color = "#ADD8E6", _0x115eb4.style.backgroundColor = "transparent", _0x115eb4.style.border = "3.5px solid transparent", _0x115eb4.style.borderRadius = "4px", _0x115eb4.style.fontSize = _0x37db17.guiConfig.fontSize - 2 - 2 + 'px', _0x115eb4.style.textAlign = 'center', _0x115eb4.style.paddingLeft = '10px', _0x115eb4.style.boxSizing = "border-box", _0x115eb4.style.padding = "0px 0px 0px 12px", _0x115eb4.style.lineHeight = 1.5, _0x115eb4.style.fontFamily = "Baloo Paaji", _0x115eb4.style.width = "25%", _0x115eb4.style.minHeight = "20px", _0x115eb4.style.flexShrink = '0', _0x40ffb0.appendChild(_0x4159d0), _0x40ffb0.appendChild(_0x115eb4);
                      const _0x4662bb = document.createElement("div");
                      _0x4662bb.style.width = "100%";
                      const _0x573c2c = document.createElement("input");
                      _0x37db17.range.push(_0x573c2c), _0x573c2c.type = 'range', _0x573c2c.min = _0x3a26d7.min, _0x573c2c.max = _0x3a26d7.max, _0x573c2c.step = _0x3a26d7.step || 1, _0x573c2c.value = _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] : _0x3a26d7.object, _0x573c2c.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x573c2c.style.width = '100%', _0x573c2c.style.borderRadius = "5px", _0x573c2c.style.outline = 'none', _0x573c2c.style.transition = 'background\x200.3s', _0x573c2c.style.cursor = "pointer", _0x573c2c.style.margin = '0px', _0x573c2c.style.minHeight = "6px", _0x573c2c.style.height = _0x37db17.guiConfig.fontSize - 8 - 2 + 'px', _0x4662bb.appendChild(_0x573c2c);
                      let _0x19dfeb = ![],
                        _0x2a86fc = _0x573c2c.value;
                      _0x573c2c.addEventListener("input", () => {
                        _0x573c2c.blur(), _0x115eb4.value = _0x573c2c.value;
                      }), _0x573c2c.addEventListener("mousedown", () => {
                        _0x19dfeb = !![];
                      }), _0x573c2c.addEventListener("mouseup", () => {
                        if (_0x19dfeb) {
                          _0x19dfeb = ![];
                          let _0x511f4f = Number(_0x115eb4.value);
                          _0x511f4f !== _0x2a86fc && (_0x2a86fc = _0x511f4f, _0x573c2c.value = _0x511f4f, _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] = Number(_0x573c2c.value) : _0x3a26d7.object = Number(_0x573c2c.value), _0x3a26d7.onChange && _0x3a26d7.onChange(_0x511f4f), _0x3a26d7.action && _0x3a26d7.action(_0x511f4f)), _0x37db17.updateGuiValues();
                        }
                      }), _0x115eb4.addEventListener('focusout', () => {
                        _0x115eb4.blur();
                        let _0x541f14 = Number(_0x115eb4.value);
                        _0x541f14 !== _0x2a86fc && (_0x2a86fc = _0x541f14, (isNaN(_0x541f14) || _0x541f14 < _0x3a26d7.min || _0x541f14 > _0x3a26d7.max) && (_0x541f14 = Number(_0x2a86fc)), _0x573c2c.value = _0x541f14, _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] = Number(_0x573c2c.value) : _0x3a26d7.object = Number(_0x573c2c.value), _0x3a26d7.onChange && _0x3a26d7.onChange(_0x541f14), _0x3a26d7.action && _0x3a26d7.action(_0x541f14), _0x37db17.updateGuiValues());
                      }), _0x115eb4.addEventListener('keyup', _0x22b7ff => {
                        _0x22b7ff.key === 'Enter' && _0x115eb4.blur();
                      }), _0x259452.appendChild(_0x40ffb0), _0x259452.appendChild(_0x4662bb), _0x1a1e00.appendChild(_0x259452);
                    } else {
                      if (_0x3a26d7.type === "bind") {
                        const _0x4eb6f5 = document.createElement("div");
                        _0x37db17.bindWrapper.push(_0x4eb6f5), _0x4eb6f5.style.marginLeft = "0px", _0x4eb6f5.style.display = 'flex', _0x4eb6f5.style.alignItems = 'center', _0x4eb6f5.style.marginBottom = "4px", _0x4eb6f5.style.backgroundColor = "transparent", _0x4eb6f5.style.padding = "2px 10px", _0x4eb6f5.style.borderRadius = '4px', _0x4eb6f5.style.transition = 'background-color\x200.3s', _0x4eb6f5.style.cursor = _0x37db17.guiConfig.draggable ? 'grab' : 'default', _0x4eb6f5.style.lineHeight = 1.5, _0x4eb6f5.addEventListener('mouseenter', () => {
                          _0x4eb6f5.style.backgroundColor = "transparent";
                        }), _0x4eb6f5.addEventListener("mouseleave", () => {
                          _0x4eb6f5.style.backgroundColor = "transparent";
                        });
                        const _0x4a8b76 = document.createElement("span");
                        _0x37db17.bindLabel.push(_0x4a8b76), _0x4a8b76.textContent = _0x3a26d7.label, _0x4a8b76.style.color = "#ADD8E6", _0x4a8b76.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px', _0x4a8b76.style.marginRight = '8px', _0x4a8b76.style.flexGrow = '1';
                        const _0x2b0c0d = document.createElement('div');
                        _0x37db17.bindButton.push(_0x2b0c0d), _0x2b0c0d.textContent = _0x3a26d7.buttonTextObject && _0x3a26d7.buttonTextProperty ? _0x3a26d7.buttonTextObject[_0x3a26d7.buttonTextProperty] : "Click Me", _0x2b0c0d.style.backgroundColor = "transparent", _0x2b0c0d.style.padding = "2px", _0x2b0c0d.style.color = "#ADD8E6", _0x2b0c0d.style.border = '3.5px\x20solid\x20#555', _0x2b0c0d.style.borderRadius = '4px', _0x2b0c0d.style.cursor = "pointer", _0x2b0c0d.style.minWidth = _0x6c6a21.width / 8 + 'px', _0x2b0c0d.style.minWidth = "20%", _0x2b0c0d.style.transition = "background 0.3s, transform 0.2s", _0x2b0c0d.style.fontSize = _0x37db17.guiConfig.fontSize - 2 + 'px', _0x2b0c0d.style.height = _0x37db17.guiConfig.fontSize + 10 + 'px', _0x2b0c0d.style.boxSizing = 'border-box', _0x2b0c0d.style.lineHeight = 1.5, _0x2b0c0d.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x2b0c0d.addEventListener("mouseenter", () => {
                          _0x2b0c0d.style.backgroundColor = "transparent";
                        }), _0x2b0c0d.addEventListener("mouseleave", () => {
                          _0x2b0c0d.style.backgroundColor = "transparent";
                        });
                        const _0x31baf0 = document.createElement("div");
                        _0x37db17.overlay = _0x31baf0, _0x31baf0.style.position = "absolute", _0x31baf0.style.top = '0', _0x31baf0.style.left = '0', _0x31baf0.style.width = '100%', _0x31baf0.style.height = '100%', _0x31baf0.style.backgroundColor = "transparent", _0x31baf0.style.display = "flex", _0x31baf0.style.justifyContent = 'center', _0x31baf0.style.alignItems = "center", _0x31baf0.style.color = "#ADD8E6", _0x31baf0.style.fontSize = _0x37db17.guiConfig.fontSize + 6 + 'px', _0x31baf0.style.textAlign = "center", _0x31baf0.style.zIndex = "9999", _0x31baf0.style.backdropFilter = "blur(5px)", _0x31baf0.style.display = 'none';
                        const _0x13ff0b = document.createElement("div");
                        _0x13ff0b.innerHTML = "Press any key:<br>Hold Escape to clear the bind (NONE)<br>Press Escape to cancel", _0x31baf0.appendChild(_0x13ff0b);
                        const _0x28b605 = document.getElementById(_0x37db17.xor("gui"));
                        _0x28b605.appendChild(_0x31baf0);
                        let _0x228f9b = null;
                        const _0x111e5b = _0x318926 => {
                            if (_0x318926.code === "Escape") _0x228f9b = _0x4cd684.setTimeout(() => {
                              _0x2b0c0d.textContent = "NONE", _0x3a26d7.buttonTextObject && _0x3a26d7.buttonTextProperty && (_0x3a26d7.buttonTextObject[_0x3a26d7.buttonTextProperty] = 'NONE'), _0x37db17.overlay.style.display = "none", document.removeEventListener("keydown", _0x111e5b), _0x3a26d7.onChange && _0x3a26d7.onChange(), _0x3a26d7.action && _0x3a26d7.action();
                            }, 250);else {
                              const _0x1e05e9 = _0x318926.code;
                              _0x2b0c0d.textContent = _0x1e05e9, _0x3a26d7.buttonTextObject && _0x3a26d7.buttonTextProperty && (_0x3a26d7.buttonTextObject[_0x3a26d7.buttonTextProperty] = _0x1e05e9), _0x37db17.overlay.style.display = 'none', document.removeEventListener("keydown", _0x111e5b), clearTimeout(_0x228f9b), _0x3a26d7.onChange && _0x3a26d7.onChange(), _0x3a26d7.action && _0x3a26d7.action();
                            }
                          },
                          _0x26f256 = _0x476e67 => {
                            _0x476e67.code === "Escape" && (clearTimeout(_0x228f9b), _0x37db17.overlay.style.display = "none", document.removeEventListener("keydown", _0x111e5b));
                          };
                        _0x2b0c0d.addEventListener('click', () => {
                          _0x37db17.overlay.style.display = 'flex', document.addEventListener("keydown", _0x111e5b), document.addEventListener("keyup", _0x26f256);
                        }), _0x4eb6f5.appendChild(_0x4a8b76), _0x4eb6f5.appendChild(_0x2b0c0d), _0x1a1e00.appendChild(_0x4eb6f5), _0x37db17.realIndex++, _0x13ecd9 = _0x37db17.realIndex;
                      } else {
                        if (_0x3a26d7.type === "select") {
                          const _0x3d2139 = document.createElement("div");
                          _0x37db17.selectWrapper.push(_0x3d2139), _0x3d2139.style.marginLeft = '0px', _0x3d2139.style.marginBottom = "4px", _0x3d2139.style.display = "flex", _0x3d2139.style.alignItems = "center", _0x3d2139.style.backgroundColor = "transparent", _0x3d2139.style.padding = '2px\x2010px', _0x3d2139.style.borderRadius = "4px", _0x3d2139.style.transition = "background-color 0.3s", _0x3d2139.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x3d2139.style.lineHeight = 1.5, _0x3d2139.addEventListener("mouseenter", () => {
                            _0x3d2139.style.backgroundColor = 'transparent';
                          }), _0x3d2139.addEventListener("mouseleave", () => {
                            _0x3d2139.style.backgroundColor = "transparent";
                          });
                          const _0x44ee41 = document.createElement("label");
                          _0x37db17.selectLabel.push(_0x44ee41), _0x44ee41.textContent = _0x3a26d7.label, _0x44ee41.style.color = "#ADD8E6", _0x44ee41.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px', _0x44ee41.style.cursor = _0x37db17.guiConfig.draggable ? 'grab' : "default", _0x44ee41.style.marginRight = "8px", _0x44ee41.style.flexGrow = '1', _0x44ee41.style.lineHeight = 1.5;
                          const _0xcf6e55 = document.createElement('select');
                          _0x37db17.select.push(_0xcf6e55), _0xcf6e55.style.backgroundColor = "transparent", _0xcf6e55.style.color = "#ADD8E6", _0xcf6e55.style.border = "3.5px solid transparent", _0xcf6e55.style.borderRadius = "4px", _0xcf6e55.style.fontSize = _0x37db17.guiConfig.fontSize - 2 + 'px', _0xcf6e55.style.cursor = "pointer", _0xcf6e55.style.width = "35%", _0xcf6e55.style.height = _0x37db17.guiConfig.fontSize + 10 + 'px', _0xcf6e55.style.marginLeft = "4px", _0xcf6e55.style.fontFamily = "Baloo Paaji", _0xcf6e55.style.lineHeight = 1.5, _0xcf6e55.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x3a26d7.options.forEach(_0x293c87 => {
                            const _0x4be21b = document.createElement("option");
                            _0x4be21b.value = _0x293c87, _0x4be21b.textContent = _0x293c87, _0xcf6e55.appendChild(_0x4be21b);
                          }), _0xcf6e55.value = _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] : _0x3a26d7.object, _0xcf6e55.addEventListener("change", () => {
                            _0xcf6e55.blur(), _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] = _0xcf6e55.value : _0x3a26d7.object = _0xcf6e55.value, _0x3a26d7.onChange ? _0x3a26d7.onChange(_0xcf6e55.value) : undefined, _0x3a26d7.action ? _0x3a26d7.action(_0xcf6e55.value) : undefined;
                          }), _0x3d2139.appendChild(_0x44ee41), _0x3d2139.appendChild(_0xcf6e55), _0x1a1e00.appendChild(_0x3d2139), _0x37db17.realIndex++, _0x13ecd9 = _0x37db17.realIndex;
                        } else {
                          if (_0x3a26d7.type === 'button') {
                            const _0x453847 = document.createElement("div");
                            _0x37db17.buttonWrapper.push(_0x453847), _0x453847.style.marginLeft = "0px", _0x453847.style.marginBottom = "4px", _0x453847.style.display = "flex", _0x453847.style.alignItems = "center", _0x453847.style.backgroundColor = "transparent", _0x453847.style.padding = "2px 10px", _0x453847.style.borderRadius = '4px', _0x453847.style.transition = "background-color 0.3s", _0x453847.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x453847.style.lineHeight = 1.5, _0x453847.addEventListener('mouseenter', () => {
                              _0x453847.style.backgroundColor = "transparent";
                            }), _0x453847.addEventListener("mouseleave", () => {
                              _0x453847.style.backgroundColor = "transparent";
                            });
                            const _0x1a4005 = document.createElement('button');
                            _0x37db17.button.push(_0x1a4005), _0x1a4005.textContent = _0x3a26d7.label, _0x1a4005.style.backgroundColor = 'transparent', _0x1a4005.style.color = '#ADD8E6', _0x1a4005.style.border = '3.5px\x20solid\x20#555', _0x1a4005.style.borderRadius = "4px", _0x1a4005.style.cursor = "pointer", _0x1a4005.style.minWidth = _0x6c6a21.width / 8 + 'px', _0x1a4005.style.transition = "background 0.3s, transform 0.2s", _0x1a4005.style.padding = "1px", _0x1a4005.style.flexGrow = '1', _0x1a4005.style.lineHeight = 1.5, _0x1a4005.style.fontSize = _0x37db17.guiConfig.fontSize - 2 + 'px', _0x1a4005.style.fontFamily = "Baloo Paaji", _0x1a4005.style.height = _0x37db17.guiConfig.fontSize + 10 + 'px', _0x1a4005.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x1a4005.addEventListener("mouseenter", () => {
                              _0x1a4005.style.backgroundColor = "transparent";
                            }), _0x1a4005.addEventListener("mouseleave", () => {
                              _0x1a4005.style.backgroundColor = "transparent";
                            }), _0x1a4005.addEventListener("click", () => {
                              _0x3a26d7.action ? _0x3a26d7.action() : undefined, _0x37db17.updateGuiValues();
                            }), _0x453847.appendChild(_0x1a4005), _0x1a1e00.appendChild(_0x453847), _0x37db17.realIndex++, _0x13ecd9 = _0x37db17.realIndex;
                          } else {
                            if (_0x3a26d7.type === "text") {
                              const _0x42f47f = document.createElement("div");
                              _0x37db17.textWrapper.push(_0x42f47f), _0x42f47f.style.marginLeft = "0px", _0x42f47f.style.marginBottom = '4px', _0x42f47f.style.display = "flex", _0x42f47f.style.alignItems = "center", _0x42f47f.style.backgroundColor = "transparent", _0x42f47f.style.padding = "2px 10px", _0x42f47f.style.borderRadius = '4px', _0x42f47f.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x42f47f.style.lineHeight = 1.5;
                              const _0x2d04eb = document.createElement('label');
                              _0x37db17.textLabel.push(_0x2d04eb), _0x2d04eb.textContent = _0x3a26d7.label, _0x2d04eb.style.color = '#ADD8E6', _0x2d04eb.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px', _0x2d04eb.style.marginRight = "8px", _0x2d04eb.style.flexGrow = '1', _0x2d04eb.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x2d04eb.style.lineHeight = 1.5;
                              const _0x581442 = document.createElement("input");
                              _0x37db17.textInput.push(_0x581442), _0x581442.type = "text", _0x581442.value = _0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] : _0x3a26d7.object, _0x581442.style.padding = "0px 0px 0px 4px", _0x581442.style.fontSize = _0x37db17.guiConfig.fontSize - 2 + 'px', _0x581442.style.border = "3.5px solid transparent", _0x581442.style.borderRadius = '4px', _0x581442.style.backgroundColor = "transparent", _0x581442.style.color = "#ADD8E6", _0x581442.style.lineHeight = 1.5, _0x581442.style.fontFamily = 'Baloo\x20Paaji', _0x581442.style.width = "40%", _0x581442.style.minHeight = '20px', _0x581442.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb);
                              let _0x232860 = _0x581442.value;
                              _0x581442.addEventListener("focus", () => {
                                _0x232860 = _0x581442.value;
                              });
                              const _0x3fc509 = () => {
                                const _0x4eee27 = _0x581442.value;
                                _0x4eee27 !== _0x232860 && (_0x3a26d7.property ? _0x3a26d7.object[_0x3a26d7.property] = _0x4eee27 : _0x3a26d7.object = _0x4eee27, _0x3a26d7.onChange ? _0x3a26d7.onChange(_0x4eee27) : undefined, _0x3a26d7.action ? _0x3a26d7.action(_0x4eee27) : undefined);
                              };
                              _0x581442.addEventListener("focusout", _0x3fc509), _0x581442.addEventListener("keyup", () => {
                                event.key === "Enter" && _0x581442.blur();
                              }), _0x42f47f.appendChild(_0x2d04eb), _0x42f47f.appendChild(_0x581442), _0x1a1e00.appendChild(_0x42f47f), _0x37db17.realIndex++, _0x13ecd9 = _0x37db17.realIndex;
                            } else {
                              if (_0x3a26d7.type === "subfolder") {
                                const _0x332660 = document.createElement('div');
                                _0x332660.style.marginLeft = "0px", _0x332660.style.backgroundColor = "transparent", _0x332660.style.padding = "0px", _0x332660.style.marginBottom = "4px", _0x332660.style.borderRadius = '4px', _0x332660.style.cursor = "pointer", _0x332660.style.lineHeight = "1.5", _0x332660.style.display = 'flex', _0x332660.style.flexDirection = "column";
                                const _0x48c67a = document.createElement("div");
                                _0x48c67a.style.flex = '1', _0x48c67a.style.display = "flex", _0x48c67a.style.alignItems = "center", _0x48c67a.style.padding = "2px 10px", _0x48c67a.style.transition = "background-color 0.3s", _0x48c67a.style.position = "relative", _0x48c67a.style.zIndex = '1', _0x48c67a.style.borderRadius = '4px';
                                const _0x41edd5 = document.createElement("label");
                                _0x37db17.subfolderLabel.push(_0x41edd5), _0x41edd5.textContent = _0x3a26d7.label, _0x41edd5.style.color = '#ADD8E6', _0x41edd5.style.fontSize = _0x37db17.guiConfig.fontSize + 2 + 'px', _0x41edd5.style.cursor = "pointer", _0x41edd5.style.flexGrow = '1', _0x48c67a.appendChild(_0x41edd5);
                                const _0x1ffe2a = document.createElement("span");
                                _0x1ffe2a.textContent = "▶", _0x1ffe2a.style.color = "transparent", _0x1ffe2a.style.width = "20px", _0x1ffe2a.style.height = "20px", _0x1ffe2a.style.borderRadius = "50%", _0x1ffe2a.style.display = "flex", _0x1ffe2a.style.alignItems = "center", _0x1ffe2a.style.justifyContent = 'center', _0x1ffe2a.style.fontSize = '25px', _0x1ffe2a.style.cursor = "pointer", _0x1ffe2a.style.transition = "background-color 0.3s, color 0.3s", _0x1ffe2a.style.marginLeft = "10px", _0x48c67a.appendChild(_0x1ffe2a);
                                const _0x3a13d6 = document.createElement("div");
                                _0x3a13d6.style.display = "none", _0x3a13d6.style.backgroundColor = "transparent", _0x3a13d6.style.borderRadius = "4px", _0x3a13d6.style.padding = '10px\x2010px\x206px\x200px';
                                const _0x47b390 = () => {
                                  const _0x265ca8 = _0x3a13d6.style.display === "block";
                                  _0x3a13d6.style.display = _0x265ca8 ? "none" : "block", _0x1ffe2a.textContent = _0x265ca8 ? "▶" : "▼";
                                };
                                _0x48c67a.addEventListener('click', _0x47b390), _0x332660.addEventListener('mouseenter', () => {
                                  _0x1ffe2a.style.color = "#ADD8E6";
                                }), _0x332660.addEventListener('mouseleave', () => {
                                  _0x1ffe2a.style.color = 'transparent';
                                }), _0x48c67a.addEventListener('mouseenter', () => {
                                  _0x48c67a.style.backgroundColor = "transparent";
                                }), _0x48c67a.addEventListener('mouseleave', () => {
                                  _0x48c67a.style.backgroundColor = 'transparent';
                                }), _0x332660.appendChild(_0x48c67a), _0x332660.appendChild(_0x3a13d6), _0x3a26d7.subfolder?.["forEach"](_0xe6467c => {
                                  _0x37db17.realIndex++, _0x13ecd9 = _0x37db17.realIndex;
                                  if (_0xe6467c.type === 'checkbox') {
                                    const _0x24cf47 = document.createElement('div');
                                    _0x24cf47.className = "checkbox-wrapper", _0x24cf47.style.marginLeft = '15px', _0x24cf47.style.marginBottom = '4px', _0x24cf47.style.display = "flex", _0x24cf47.style.alignItems = 'center', _0x24cf47.style.backgroundColor = 'transparent', _0x24cf47.style.padding = "2px 10px", _0x24cf47.style.borderRadius = '4px', _0x24cf47.style.transition = "background-color 0.3s", _0x24cf47.style.cursor = "pointer", _0x24cf47.style.lineHeight = 1.5, _0x24cf47.addEventListener("mouseenter", () => {
                                      _0x24cf47.style.backgroundColor = "transparent";
                                    }), _0x24cf47.addEventListener("mouseleave", () => {
                                      _0x24cf47.style.backgroundColor = 'transparent';
                                    });
                                    const _0x58794f = document.createElement("label");
                                    _0x37db17.checkBoxLabel.push(_0x58794f), _0x58794f.textContent = '\x20' + _0xe6467c.label, _0x58794f.style.color = "#ADD8E6", _0x58794f.style.fontSize = _0x37db17.guiConfig.fontSize + 2 - 2 + 'px', _0x58794f.style.cursor = "pointer", _0x58794f.style.flexGrow = '1';
                                    const _0x209291 = document.createElement("input");
                                    _0x209291.type = "checkbox", _0x209291.checked = _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] : _0xe6467c.object, _0x209291.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x209291.style.margin = "0px", _0x24cf47.addEventListener("click", _0x59428b => {
                                      _0x59428b.target !== _0x209291 && (_0x209291.checked = !_0x209291.checked, _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] = Number(_0x209291.checked) : _0xe6467c.object = Number(_0x209291.checked), _0xe6467c.onChange ? _0xe6467c.onChange(Number(_0x209291.checked)) : undefined, _0xe6467c.action ? _0xe6467c.action(Number(_0x209291.checked)) : undefined, _0x37db17.updateGuiValues());
                                    }), _0x209291.addEventListener('change', () => {
                                      _0x209291.blur(), _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] = Number(_0x209291.checked) : _0xe6467c.object = Number(_0x209291.checked), _0xe6467c.onChange ? _0xe6467c.onChange(Number(_0x209291.checked)) : undefined, _0xe6467c.action ? _0xe6467c.action(Number(_0x209291.checked)) : undefined, _0x37db17.updateGuiValues();
                                    }), _0x24cf47.appendChild(_0x58794f), _0x24cf47.appendChild(_0x209291), _0x3a13d6.appendChild(_0x24cf47);
                                  } else {
                                    if (_0xe6467c.type === 'range') {
                                      const _0x1eda99 = document.createElement("div");
                                      _0x37db17.rangeWrapper.push(_0x1eda99), _0x1eda99.style.marginLeft = "15px", _0x1eda99.style.marginBottom = "4px", _0x1eda99.style.backgroundColor = "transparent", _0x1eda99.style.padding = "10px 10px", _0x1eda99.style.borderRadius = '4px', _0x1eda99.style.transition = "background-color 0.3s", _0x1eda99.style.cursor = _0x37db17.guiConfig.draggable ? 'grab' : "default", _0x1eda99.addEventListener("mouseenter", () => {
                                        _0x1eda99.style.backgroundColor = 'transparent';
                                      }), _0x1eda99.addEventListener("mouseleave", () => {
                                        _0x1eda99.style.backgroundColor = "transparent";
                                      });
                                      const _0x2c7b0b = document.createElement('div');
                                      _0x2c7b0b.style.display = "flex", _0x2c7b0b.style.justifyContent = 'space-between', _0x2c7b0b.style.alignItems = "center", _0x2c7b0b.style.width = "100%", _0x2c7b0b.style.marginBottom = "10px";
                                      const _0x903e49 = document.createElement('label');
                                      _0x37db17.rangeLabel.push(_0x903e49), _0x903e49.textContent = '\x20' + _0xe6467c.label, _0x903e49.style.color = "#ADD8E6", _0x903e49.style.fontSize = _0x37db17.guiConfig.fontSize + 2 - 2 + 'px', _0x903e49.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x903e49.style.flexShrink = '0';
                                      const _0x32494 = document.createElement("input");
                                      _0x37db17.rangeValueDisplay.push(_0x32494), _0x32494.type = "number", _0x32494.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x32494.value = _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] : _0xe6467c.object, _0x32494.min = _0xe6467c.min, _0x32494.max = _0xe6467c.max, _0x32494.step = _0xe6467c.step || 1, _0x32494.style.width = "80px", _0x32494.style.color = "#ADD8E6", _0x32494.style.backgroundColor = "transparent", _0x32494.style.border = "3.5px solid transparent", _0x32494.style.borderRadius = "4px", _0x32494.style.fontSize = _0x37db17.guiConfig.fontSize - 2 - 2 + 'px', _0x32494.style.textAlign = "center", _0x32494.style.paddingLeft = '10px', _0x32494.style.boxSizing = 'border-box', _0x32494.style.padding = "0px 0px 0px 12px", _0x32494.style.lineHeight = 1.5, _0x32494.style.fontFamily = "Baloo Paaji", _0x32494.style.width = '25%', _0x32494.style.minHeight = '20px', _0x32494.style.flexShrink = '0', _0x2c7b0b.appendChild(_0x903e49), _0x2c7b0b.appendChild(_0x32494);
                                      const _0x4ae58c = document.createElement("div");
                                      _0x4ae58c.style.width = '100%';
                                      const _0x5157c8 = document.createElement('input');
                                      _0x37db17.range.push(_0x5157c8), _0x5157c8.type = "range", _0x5157c8.min = _0xe6467c.min, _0x5157c8.max = _0xe6467c.max, _0x5157c8.step = _0xe6467c.step || 1, _0x5157c8.value = _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] : _0xe6467c.object, _0x5157c8.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x5157c8.style.width = "100%", _0x5157c8.style.borderRadius = "5px", _0x5157c8.style.outline = "none", _0x5157c8.style.transition = 'background\x200.3s', _0x5157c8.style.cursor = "pointer", _0x5157c8.style.margin = "0px", _0x5157c8.style.minHeight = "6px", _0x5157c8.style.height = _0x37db17.guiConfig.fontSize - 8 - 2 + 'px', _0x4ae58c.appendChild(_0x5157c8);
                                      let _0x33c2a1 = ![],
                                        _0x4a09d8 = _0x5157c8.value;
                                      _0x5157c8.addEventListener("input", () => {
                                        _0x5157c8.blur(), _0x32494.value = _0x5157c8.value;
                                      }), _0x5157c8.addEventListener("mousedown", () => {
                                        _0x33c2a1 = !![];
                                      }), _0x5157c8.addEventListener("mouseup", () => {
                                        if (_0x33c2a1) {
                                          _0x33c2a1 = ![];
                                          let _0x20ca8e = Number(_0x32494.value);
                                          _0x20ca8e !== _0x4a09d8 && (_0x4a09d8 = _0x20ca8e, _0x5157c8.value = _0x20ca8e, _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] = Number(_0x5157c8.value) : _0xe6467c.object = Number(_0x5157c8.value), _0xe6467c.onChange && _0xe6467c.onChange(_0x20ca8e), _0xe6467c.action && _0xe6467c.action(_0x20ca8e)), _0x37db17.updateGuiValues();
                                        }
                                      }), _0x32494.addEventListener('focusout', () => {
                                        _0x32494.blur();
                                        let _0x2a12fa = Number(_0x32494.value);
                                        _0x2a12fa !== _0x4a09d8 && (_0x4a09d8 = _0x2a12fa, (isNaN(_0x2a12fa) || _0x2a12fa < _0xe6467c.min || _0x2a12fa > _0xe6467c.max) && (_0x2a12fa = Number(_0x4a09d8)), _0x5157c8.value = _0x2a12fa, _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] = Number(_0x5157c8.value) : _0xe6467c.object = Number(_0x5157c8.value), _0xe6467c.onChange && _0xe6467c.onChange(_0x2a12fa), _0xe6467c.action && _0xe6467c.action(_0x2a12fa), _0x37db17.updateGuiValues());
                                      }), _0x32494.addEventListener("keyup", _0x2ae7a7 => {
                                        _0x2ae7a7.key === "Enter" && _0x32494.blur();
                                      }), _0x1eda99.appendChild(_0x2c7b0b), _0x1eda99.appendChild(_0x4ae58c), _0x3a13d6.appendChild(_0x1eda99);
                                    } else {
                                      if (_0xe6467c.type === "bind") {
                                        const _0x2997a1 = document.createElement("div");
                                        _0x37db17.bindWrapper.push(_0x2997a1), _0x2997a1.style.marginLeft = "15px", _0x2997a1.style.display = 'flex', _0x2997a1.style.alignItems = 'center', _0x2997a1.style.marginBottom = "4px", _0x2997a1.style.backgroundColor = "transparent", _0x2997a1.style.padding = '2px\x2010px', _0x2997a1.style.borderRadius = "4px", _0x2997a1.style.transition = "background-color 0.3s", _0x2997a1.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x2997a1.style.lineHeight = 1.5, _0x2997a1.addEventListener("mouseenter", () => {
                                          _0x2997a1.style.backgroundColor = "transparent";
                                        }), _0x2997a1.addEventListener("mouseleave", () => {
                                          _0x2997a1.style.backgroundColor = "transparent";
                                        });
                                        const _0x526d2c = document.createElement("span");
                                        _0x37db17.bindLabel.push(_0x526d2c), _0x526d2c.textContent = '\x20' + _0xe6467c.label, _0x526d2c.style.color = "#ADD8E6", _0x526d2c.style.fontSize = _0x37db17.guiConfig.fontSize + 2 - 2 + 'px', _0x526d2c.style.marginRight = "8px", _0x526d2c.style.flexGrow = '1';
                                        const _0x145456 = document.createElement("div");
                                        _0x37db17.bindButton.push(_0x145456), _0x145456.textContent = _0xe6467c.buttonTextObject && _0xe6467c.buttonTextProperty ? _0xe6467c.buttonTextObject[_0xe6467c.buttonTextProperty] : "Click Me", _0x145456.style.backgroundColor = "transparent", _0x145456.style.padding = '2px', _0x145456.style.color = '#ADD8E6', _0x145456.style.border = "3.5px solid transparent", _0x145456.style.borderRadius = '4px', _0x145456.style.cursor = "pointer", _0x145456.style.minWidth = _0x6c6a21.width / 8 + 'px', _0x145456.style.minWidth = "20%", _0x145456.style.transition = "background 0.3s, transform 0.2s", _0x145456.style.fontSize = _0x37db17.guiConfig.fontSize - 2 - 2 + 'px', _0x145456.style.height = _0x37db17.guiConfig.fontSize + 10 - 2 + 'px', _0x145456.style.boxSizing = 'border-box', _0x145456.style.lineHeight = 1.5, _0x145456.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x145456.addEventListener('mouseenter', () => {
                                          _0x145456.style.backgroundColor = 'transparent';
                                        }), _0x145456.addEventListener("mouseleave", () => {
                                          _0x145456.style.backgroundColor = "transparent";
                                        });
                                        const _0x5b780f = document.createElement("div");
                                        _0x37db17.overlay = _0x5b780f, _0x5b780f.style.position = "absolute", _0x5b780f.style.top = '0', _0x5b780f.style.left = '0', _0x5b780f.style.width = '100%', _0x5b780f.style.height = '100%', _0x5b780f.style.backgroundColor = "rgba(0, 0, 0, 0.8)", _0x5b780f.style.display = 'flex', _0x5b780f.style.justifyContent = "center", _0x5b780f.style.alignItems = "center", _0x5b780f.style.color = "#ADD8E6", _0x5b780f.style.fontSize = _0x37db17.guiConfig.fontSize + 6 - 2 + 'px', _0x5b780f.style.textAlign = 'center', _0x5b780f.style.zIndex = "9999", _0x5b780f.style.backdropFilter = 'blur(5px)', _0x5b780f.style.display = "none";
                                        const _0x3ff7e4 = document.createElement('div');
                                        _0x3ff7e4.innerHTML = 'Press\x20any\x20key:<br>Hold\x20Escape\x20to\x20clear\x20the\x20bind\x20(NONE)<br>Press\x20Escape\x20to\x20cancel', _0x5b780f.appendChild(_0x3ff7e4);
                                        const _0x172678 = document.getElementById(_0x37db17.xor("gui"));
                                        _0x172678.appendChild(_0x5b780f);
                                        let _0x1e0400 = null;
                                        const _0x5f4a00 = _0x7f55b4 => {
                                            if (_0x7f55b4.code === "Escape") _0x1e0400 = _0x4cd684.setTimeout(() => {
                                              _0x145456.textContent = "NONE", _0xe6467c.buttonTextObject && _0xe6467c.buttonTextProperty && (_0xe6467c.buttonTextObject[_0xe6467c.buttonTextProperty] = "NONE"), _0x37db17.overlay.style.display = 'none', document.removeEventListener("keydown", _0x5f4a00), _0xe6467c.onChange && _0xe6467c.onChange(), _0xe6467c.action && _0xe6467c.action();
                                            }, 250);else {
                                              const _0x461a63 = _0x7f55b4.code;
                                              _0x145456.textContent = _0x461a63, _0xe6467c.buttonTextObject && _0xe6467c.buttonTextProperty && (_0xe6467c.buttonTextObject[_0xe6467c.buttonTextProperty] = _0x461a63), _0x37db17.overlay.style.display = "none", document.removeEventListener("keydown", _0x5f4a00), clearTimeout(_0x1e0400), _0xe6467c.onChange && _0xe6467c.onChange(), _0xe6467c.action && _0xe6467c.action();
                                            }
                                          },
                                          _0x19e8ef = _0x3ffc06 => {
                                            _0x3ffc06.code === 'Escape' && (clearTimeout(_0x1e0400), _0x37db17.overlay.style.display = "none", document.removeEventListener("keydown", _0x5f4a00));
                                          };
                                        _0x145456.addEventListener("click", () => {
                                          _0x37db17.overlay.style.display = 'flex', document.addEventListener('keydown', _0x5f4a00), document.addEventListener("keyup", _0x19e8ef);
                                        }), _0x2997a1.appendChild(_0x526d2c), _0x2997a1.appendChild(_0x145456), _0x3a13d6.appendChild(_0x2997a1);
                                      } else {
                                        if (_0xe6467c.type === "select") {
                                          const _0x2e5306 = document.createElement("div");
                                          _0x37db17.selectWrapper.push(_0x2e5306), _0x2e5306.style.marginLeft = "15px", _0x2e5306.style.marginBottom = "4px", _0x2e5306.style.display = "flex", _0x2e5306.style.alignItems = "center", _0x2e5306.style.backgroundColor = "transparent", _0x2e5306.style.padding = "2px 10px", _0x2e5306.style.borderRadius = "4px", _0x2e5306.style.transition = "background-color 0.3s", _0x2e5306.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x2e5306.style.lineHeight = 1.5, _0x2e5306.addEventListener('mouseenter', () => {
                                            _0x2e5306.style.backgroundColor = "transparent";
                                          }), _0x2e5306.addEventListener("mouseleave", () => {
                                            _0x2e5306.style.backgroundColor = "transparent";
                                          });
                                          const _0x695a04 = document.createElement("label");
                                          _0x37db17.selectLabel.push(_0x695a04), _0x695a04.textContent = '\x20' + _0xe6467c.label, _0x695a04.style.color = "#ADD8E6", _0x695a04.style.fontSize = _0x37db17.guiConfig.fontSize + 2 - 2 + 'px', _0x695a04.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x695a04.style.marginRight = "8px", _0x695a04.style.flexGrow = '1', _0x695a04.style.lineHeight = 1.5;
                                          const _0xde8c12 = document.createElement('select');
                                          _0x37db17.select.push(_0xde8c12), _0xde8c12.style.backgroundColor = "transparent", _0xde8c12.style.color = "#ADD8E6", _0xde8c12.style.border = "3.5px solid transparent", _0xde8c12.style.borderRadius = "4px", _0xde8c12.style.fontSize = _0x37db17.guiConfig.fontSize - 2 - 2 + 'px', _0xde8c12.style.cursor = "pointer", _0xde8c12.style.width = "35%", _0xde8c12.style.height = _0x37db17.guiConfig.fontSize + 10 - 2 + 'px', _0xde8c12.style.marginLeft = "4px", _0xde8c12.style.fontFamily = 'Baloo\x20Paaji', _0xde8c12.style.lineHeight = 1.5, _0xde8c12.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0xe6467c.options.forEach(_0x56710c => {
                                            const _0x59f32f = document.createElement("option");
                                            _0x59f32f.value = _0x56710c, _0x59f32f.textContent = _0x56710c, _0xde8c12.appendChild(_0x59f32f);
                                          }), _0xde8c12.value = _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] : _0xe6467c.object, _0xde8c12.addEventListener("change", () => {
                                            _0xde8c12.blur(), _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] = _0xde8c12.value : _0xe6467c.object = _0xde8c12.value, _0xe6467c.onChange ? _0xe6467c.onChange(_0xde8c12.value) : undefined, _0xe6467c.action ? _0xe6467c.action(_0xde8c12.value) : undefined;
                                          }), _0x2e5306.appendChild(_0x695a04), _0x2e5306.appendChild(_0xde8c12), _0x3a13d6.appendChild(_0x2e5306);
                                        } else {
                                          if (_0xe6467c.type === "button") {
                                            const _0x4cb4fc = document.createElement("div");
                                            _0x37db17.buttonWrapper.push(_0x4cb4fc), _0x4cb4fc.style.marginLeft = "15px", _0x4cb4fc.style.marginBottom = "4px", _0x4cb4fc.style.display = "flex", _0x4cb4fc.style.alignItems = 'center', _0x4cb4fc.style.backgroundColor = "transparent", _0x4cb4fc.style.padding = "2px 10px", _0x4cb4fc.style.borderRadius = "4px", _0x4cb4fc.style.transition = "background-color 0.3s", _0x4cb4fc.style.cursor = _0x37db17.guiConfig.draggable ? "grab" : "default", _0x4cb4fc.style.lineHeight = 1.5, _0x4cb4fc.addEventListener("mouseenter", () => {
                                              _0x4cb4fc.style.backgroundColor = "transparent";
                                            }), _0x4cb4fc.addEventListener("mouseleave", () => {
                                              _0x4cb4fc.style.backgroundColor = "transparent";
                                            });
                                            const _0x5a7e2a = document.createElement('button');
                                            _0x37db17.button.push(_0x5a7e2a), _0x5a7e2a.textContent = '\x20' + _0xe6467c.label, _0x5a7e2a.style.backgroundColor = "transparent", _0x5a7e2a.style.color = "#ADD8E6", _0x5a7e2a.style.border = "3.5px solid transparent", _0x5a7e2a.style.borderRadius = "4px", _0x5a7e2a.style.cursor = 'pointer', _0x5a7e2a.style.minWidth = _0x6c6a21.width / 8 + 'px', _0x5a7e2a.style.transition = "background 0.3s, transform 0.2s", _0x5a7e2a.style.padding = "1px", _0x5a7e2a.style.flexGrow = '1', _0x5a7e2a.style.lineHeight = 1.5, _0x5a7e2a.style.fontSize = _0x37db17.guiConfig.fontSize - 2 - 2 + 'px', _0x5a7e2a.style.fontFamily = "Baloo Paaji", _0x5a7e2a.style.height = _0x37db17.guiConfig.fontSize + 10 - 2 + 'px', _0x5a7e2a.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb), _0x5a7e2a.addEventListener("mouseenter", () => {
                                              _0x5a7e2a.style.backgroundColor = "#0000FF";
                                            }), _0x5a7e2a.addEventListener("mouseleave", () => {
                                              _0x5a7e2a.style.backgroundColor = "#0000FF";
                                            }), _0x5a7e2a.addEventListener('click', () => {
                                              _0xe6467c.action ? _0xe6467c.action() : undefined, _0x37db17.updateGuiValues();
                                            }), _0x4cb4fc.appendChild(_0x5a7e2a), _0x3a13d6.appendChild(_0x4cb4fc);
                                          } else {
                                            if (_0xe6467c.type === "text") {
                                              const _0x15edac = document.createElement("div");
                                              _0x37db17.textWrapper.push(_0x15edac), _0x15edac.style.marginLeft = "15px", _0x15edac.style.marginBottom = "4px", _0x15edac.style.display = "flex", _0x15edac.style.alignItems = "center", _0x15edac.style.backgroundColor = '#0000FF', _0x15edac.style.padding = "2px 10px", _0x15edac.style.borderRadius = "4px", _0x15edac.style.cursor = _0x37db17.guiConfig.draggable ? 'grab' : "default", _0x15edac.style.lineHeight = 1.5;
                                              const _0x239157 = document.createElement('label');
                                              _0x37db17.textLabel.push(_0x239157), _0x239157.textContent = '\x20' + _0xe6467c.label, _0x239157.style.color = "#ADD8E6", _0x239157.style.fontSize = _0x37db17.guiConfig.fontSize + 2 - 2 + 'px', _0x239157.style.marginRight = '8px', _0x239157.style.flexGrow = '1', _0x239157.style.cursor = _0x37db17.guiConfig.draggable ? 'grab' : 'default', _0x239157.style.lineHeight = 1.5;
                                              const _0x20fddf = document.createElement("input");
                                              _0x37db17.textInput.push(_0x20fddf), _0x20fddf.type = 'text', _0x20fddf.value = _0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] : _0xe6467c.object, _0x20fddf.style.padding = "0px 0px 0px 4px", _0x20fddf.style.fontSize = _0x37db17.guiConfig.fontSize - 2 - 2 + 'px', _0x20fddf.style.border = '3.5px\x20solid\x20#555', _0x20fddf.style.borderRadius = '4px', _0x20fddf.style.backgroundColor = "transparent", _0x20fddf.style.color = "#ADD8E6", _0x20fddf.style.lineHeight = 1.5, _0x20fddf.style.fontFamily = "Baloo Paaji", _0x20fddf.style.width = "40%", _0x20fddf.style.minHeight = '20px', _0x20fddf.id = _0x37db17.xor(_0x13ecd9 + _0x12d5eb);
                                              let _0x2e5db5 = _0x20fddf.value;
                                              _0x20fddf.addEventListener("focus", () => {
                                                _0x2e5db5 = _0x20fddf.value;
                                              });
                                              const _0x417b08 = () => {
                                                const _0x227dba = _0x20fddf.value;
                                                _0x227dba !== _0x2e5db5 && (_0xe6467c.property ? _0xe6467c.object[_0xe6467c.property] = _0x227dba : _0xe6467c.object = _0x227dba, _0xe6467c.onChange ? _0xe6467c.onChange(_0x227dba) : undefined, _0xe6467c.action ? _0xe6467c.action(_0x227dba) : undefined);
                                              };
                                              _0x20fddf.addEventListener("focusout", _0x417b08), _0x20fddf.addEventListener("keyup", () => {
                                                event.key === 'Enter' && _0x20fddf.blur();
                                              }), _0x15edac.appendChild(_0x239157), _0x15edac.appendChild(_0x20fddf), _0x3a13d6.appendChild(_0x15edac);
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }), _0x1a1e00.appendChild(_0x332660), _0x37db17.realIndex++, _0x13ecd9 = _0x37db17.realIndex;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                });
              }
              Object.keys(_0x37db17.guiConfig.folders).forEach(_0x462ec6 => {
                const _0x531dee = document.createElement("button");
                _0x37db17.folderButton.push(_0x531dee), _0x531dee.textContent = _0x462ec6, _0x531dee.style.backgroundColor = "transparent", _0x531dee.style.color = "#ADD8E6", _0x531dee.style.border = "none", _0x531dee.style.padding = "4px", _0x531dee.style.fontSize = _0x37db17.guiConfig.fontSize + 6 + 'px', _0x531dee.style.borderRadius = "3px", _0x531dee.style.cursor = "pointer", _0x531dee.addEventListener("click", () => {
                  _0x5dec22(_0x462ec6, _0x37db17.guiConfig.folders[_0x462ec6]), _0x531dee.blur();
                }), _0x57dc44.appendChild(_0x531dee);
              });
              if (Object.keys(_0x37db17.guiConfig.folders).length > 0) {
                const _0x1b4ebc = Object.keys(_0x37db17.guiConfig.folders)[0];
                _0x5dec22(_0x1b4ebc, _0x37db17.guiConfig.folders[_0x1b4ebc]);
              }
              const _0x1646e6 = document.querySelectorAll('#' + _0x37db17.xor("sidebar") + " button");
              _0x1646e6[0] ? _0x1646e6[0].classList.add("active") : undefined;
              _0x1646e6[0] ? _0x1646e6.forEach(_0x3a82e4 => {
                _0x3a82e4.addEventListener("click", function () {
                  _0x1646e6.forEach(_0x2d49bf => _0x2d49bf.classList.remove("active")), this.classList.add("active");
                });
              }) : undefined;
              const _0x2b970b = document.getElementById(_0x37db17.xor("gui")),
                _0x73fbd0 = _0x359e22 => {
                  _0x359e22.stopPropagation();
                };
              _0x2b970b.addEventListener("mouseup", _0x73fbd0, ![]), _0x2b970b.addEventListener("mousedown", _0x73fbd0, ![]), _0x2b970b.addEventListener("keydown", _0x73fbd0, ![]), _0x2b970b.addEventListener("keyup", _0x73fbd0, ![]);
            }, document.head.appendChild(_0x3b24);
          }
        },
        _0x22d54b = function () {},
        _0x125854 = function () {},
        _0x25c131 = function () {},
        _0x19c31e = function () {},
        _0x23118a = '',
        _0xa896c1 = null,
        _0x17a4f9 = ![],
        _0x5e28c6 = ![],
        _0x2112f6 = ![],
        _0x2dad3 = localStorage.devMode ?? ![];
      "1766465128165".includes('EXPIRY_DATE_PLACEHOLDER') && (_0x2dad3 = !![]);
      let _0x38c1ed = ![],
        _0x2eb52a = ![],
        _0x509bba = null,
        _0x5b2884,
        _0x1e0f9f = "websocket.network",
        _0x3cfdcb = ![],
        _0x36ff7a = 0,
        _0x1a0282 = 0,
        _0x517eda = 0,
        _0x977435 = 0,
        _0x9cb2d9 = 0,
        _0x53166f = {},
        _0x46233c = {},
        _0x45020e = {},
        gameWorld = {},
        _0x3b2ae4 = {},
        _0x57f7e4 = {};
      Object.defineProperties(window, {
        'v2600': {
          'get'() {
            return _0x53166f;
          }
        },
        'v2601': {
          'get'() {
            return _0x46233c;
          }
        },
        'v2602': {
          'get'() {
            return _0x45020e;
          }
        },
        'v2603': {
          'get'() {
            return gameWorld;
          }
        },
        'v2604': {
          'get'() {
            return _0x3b2ae4;
          }
        },
        'v2605': {
          'get'() {
            return _0x57f7e4;
          }
        }
      });
      let _0xbce881 = {
          'width': 0,
          'height': 0
        },
        _0x58c261 = {
          'LEADERBOARD': 388,
          'BIGMAP': 654
        },
        _0x4e5e95 = {},
        _0x357299 = null,
        _0x50734b,
        _0x198c45,
        _0x507512,
        _0x12d9aa,
        _0x5786cb,
        _0x40b9f1 = ![],
        _0x29b56c = ![],
        _0x2932f7 = 0,
        _0x1ed932 = 0,
        _0x1dc604 = 0,
        _0x51a8b0 = 0,
        _0x2b2f75 = 0,
        _0x169d08 = document.defaultView.Date.now(),
        _0x503ea5 = [],
        _0x1738a7 = [],
        _0xc7a873 = [],
        _0x38ee77 = [],
        _0x439412 = {},
        _0x52745a = !![],
        _0x49ad36 = !![],
        _0x4487ac = !![],
        _0x5bfa9a = !![],
        _0x3908cf = !![],
        _0xcdfe98 = 0,
        _0x14191c = 0,
        _0x275be4 = -1,
        _0x4dd090 = -1,
        _0x3effc6 = -1,
        _0x406b71 = Date.now(),
        _0x1a9396 = 0,
        _0x2a8f98 = 0,
        _0xa82954 = !![],
        _0xd0ee7a = ![],
        _0x50f91e = 0,
        _0x5ab05c = 0,
        _0x43966e = 0,
        _0xc6e4ef = {},
        _0x54b3b1 = '',
        _0x3a4970 = ![],
        _0x466018 = 0,
        _0x524378 = null,
        _0x451f8b = {},
        _0x499bb4 = 0,
        _0x4219f4 = ![],
        _0x29c840 = {
          'bag': undefined,
          'book': undefined,
          'acc': undefined,
          'skin': undefined
        },
        _0x4f9f49 = 0,
        _0x2179a8 = 0,
        _0x114a1d = 0,
        _0x3dcaab = 0,
        _0x4b1f89 = 0,
        _0x22b787 = {
          'Join': [],
          'Leave': [],
          'newPlayerInt': ![],
          'newPlayerToggle': ![],
          'killPlayerInt': ![],
          'killPlayerToggle': ![]
        },
        _0x1ca978 = {},
        _0x49dbee,
        _0x762cdd,
        _0x35acc3,
        _0x32535e;
      _0x49dbee = new Image(), _0x762cdd = new Image(), _0x35acc3 = new Image(), _0x32535e = new Image(), _0x58c261.WOOD_SPIKE_ALLY = new Image(), _0x58c261.STONE_SPIKE_ALLY = new Image(), _0x58c261.GOLD_SPIKE_ALLY = new Image(), _0x58c261.DIAMOND_SPIKE_ALLY = new Image(), _0x58c261.AMETHYST_SPIKE_ALLY = new Image(), _0x58c261.REIDITE_SPIKE_ALLY = new Image(), _0x58c261.WOOD_SPIKE_ENEMY = new Image(), _0x58c261.STONE_SPIKE_ENEMY = new Image(), _0x58c261.GOLD_SPIKE_ENEMY = new Image(), _0x58c261.DIAMOND_SPIKE_ENEMY = new Image(), _0x58c261.AMETHYST_SPIKE_ENEMY = new Image(), _0x58c261.REIDITE_SPIKE_ENEMY = new Image(), _0x58c261.WOOD_DOOR_ALLY = new Image(), _0x58c261.STONE_DOOR_ALLY = new Image(), _0x58c261.GOLD_DOOR_ALLY = new Image(), _0x58c261.DIAMOND_DOOR_ALLY = new Image(), _0x58c261.AMETHYST_DOOR_ALLY = new Image(), _0x58c261.REIDITE_DOOR_ALLY = new Image(), _0x58c261.WOOD_DOOR_ENEMY = new Image(), _0x58c261.STONE_DOOR_ENEMY = new Image(), _0x58c261.GOLD_DOOR_ENEMY = new Image(), _0x58c261.DIAMOND_DOOR_ENEMY = new Image(), _0x58c261.AMETHYST_DOOR_ENEMY = new Image(), _0x58c261.REIDITE_DOOR_ENEMY = new Image(), _0x58c261.SPIKED_WOOD_DOOR_ALLY = new Image(), _0x58c261.SPIKED_STONE_DOOR_ALLY = new Image(), _0x58c261.SPIKED_GOLD_DOOR_ALLY = new Image(), _0x58c261.SPIKED_DIAMOND_DOOR_ALLY = new Image(), _0x58c261.SPIKED_AMETHYST_DOOR_ALLY = new Image(), _0x58c261.SPIKED_REIDITE_DOOR_ALLY = new Image(), _0x58c261.SPIKED_WOOD_DOOR_ENEMY = new Image(), _0x58c261.SPIKED_STONE_DOOR_ENEMY = new Image(), _0x58c261.SPIKED_GOLD_DOOR_ENEMY = new Image(), _0x58c261.SPIKED_DIAMOND_DOOR_ENEMY = new Image(), _0x58c261.SPIKED_AMETHYST_DOOR_ENEMY = new Image(), _0x58c261.SPIKED_REIDITE_DOOR_ENEMY = new Image();
      function _0x1eeacd() {
        _0x49dbee.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/62.png", _0x762cdd.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/8.png";
      }
      function _0x2445ce() {
        if (_0x73cd4e.ColoredSpikes.texture == "Light") _0x58c261.WOOD_SPIKE_ALLY && (_0x58c261.WOOD_SPIKE_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/69.png", _0x58c261.STONE_SPIKE_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/65.png", _0x58c261.GOLD_SPIKE_ALLY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/54.png', _0x58c261.DIAMOND_SPIKE_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/38.png", _0x58c261.AMETHYST_SPIKE_ALLY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/3.png', _0x58c261.REIDITE_SPIKE_ALLY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/58.png', _0x58c261.WOOD_SPIKE_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/72.png", _0x58c261.STONE_SPIKE_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/68.png", _0x58c261.GOLD_SPIKE_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/57.png", _0x58c261.DIAMOND_SPIKE_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/41.png", _0x58c261.AMETHYST_SPIKE_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/6.png', _0x58c261.REIDITE_SPIKE_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/61.png", _0x58c261.WOOD_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/53.png", _0x58c261.STONE_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/50.png", _0x58c261.GOLD_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/47.png", _0x58c261.DIAMOND_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/45.png", _0x58c261.AMETHYST_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/42.png", _0x58c261.REIDITE_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/49.png", _0x58c261.WOOD_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/52.png", _0x58c261.STONE_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/51.png", _0x58c261.GOLD_DOOR_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/46.png', _0x58c261.DIAMOND_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/44.png", _0x58c261.AMETHYST_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/43.png", _0x58c261.REIDITE_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/48.png", _0x58c261.SPIKED_WOOD_DOOR_ALLY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/70.png', _0x58c261.SPIKED_STONE_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/66.png", _0x58c261.SPIKED_GOLD_DOOR_ALLY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/55.png', _0x58c261.SPIKED_DIAMOND_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/39.png", _0x58c261.SPIKED_AMETHYST_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/4.png", _0x58c261.SPIKED_REIDITE_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/59.png", _0x58c261.SPIKED_WOOD_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/71.png", _0x58c261.SPIKED_STONE_DOOR_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/67.png', _0x58c261.SPIKED_GOLD_DOOR_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/56.png', _0x58c261.SPIKED_DIAMOND_DOOR_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/40.png', _0x58c261.SPIKED_AMETHYST_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/5.png", _0x58c261.SPIKED_REIDITE_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/60.png");else _0x73cd4e.ColoredSpikes.texture == 'Dark' && _0x58c261.WOOD_SPIKE_ALLY && (_0x58c261.WOOD_SPIKE_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/34.png", _0x58c261.STONE_SPIKE_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/30.png", _0x58c261.GOLD_SPIKE_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/22.png", _0x58c261.DIAMOND_SPIKE_ALLY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/17.png', _0x58c261.AMETHYST_SPIKE_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/13.png", _0x58c261.REIDITE_SPIKE_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/26.png", _0x58c261.WOOD_SPIKE_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/37.png", _0x58c261.STONE_SPIKE_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/33.png", _0x58c261.GOLD_SPIKE_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/25.png", _0x58c261.DIAMOND_SPIKE_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/21.png', _0x58c261.AMETHYST_SPIKE_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/16.png', _0x58c261.REIDITE_SPIKE_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/29.png', _0x58c261.WOOD_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/53.png", _0x58c261.STONE_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/50.png", _0x58c261.GOLD_DOOR_ALLY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/47.png', _0x58c261.DIAMOND_DOOR_ALLY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/45.png', _0x58c261.AMETHYST_DOOR_ALLY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/42.png', _0x58c261.REIDITE_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/49.png", _0x58c261.WOOD_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/52.png", _0x58c261.STONE_DOOR_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/51.png', _0x58c261.GOLD_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/46.png", _0x58c261.DIAMOND_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/44.png", _0x58c261.AMETHYST_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/43.png", _0x58c261.REIDITE_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/48.png", _0x58c261.SPIKED_WOOD_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/35.png", _0x58c261.SPIKED_STONE_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/31.png", _0x58c261.SPIKED_GOLD_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/23.png", _0x58c261.SPIKED_DIAMOND_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/19.png", _0x58c261.SPIKED_AMETHYST_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/14.png", _0x58c261.SPIKED_REIDITE_DOOR_ALLY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/27.png", _0x58c261.SPIKED_WOOD_DOOR_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/36.png', _0x58c261.SPIKED_STONE_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/32.png", _0x58c261.SPIKED_GOLD_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/24.png", _0x58c261.SPIKED_DIAMOND_DOOR_ENEMY.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/20.png', _0x58c261.SPIKED_AMETHYST_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/15.png", _0x58c261.SPIKED_REIDITE_DOOR_ENEMY.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/28.png");
      }
      function _0x440a80() {
        if (_0x73cd4e.chestInfo.texture == "Bright") _0x35acc3.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/9.png", _0x32535e.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/12.png";else {
          if (_0x73cd4e.chestInfo.texture == "Light") _0x35acc3.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/1.png", _0x32535e.src = 'https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/2.png';else _0x73cd4e.chestInfo.texture == "Dark" && (_0x35acc3.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/10.png", _0x32535e.src = "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/11.png");
        }
      }
      const EntityIDs = {
        PLAYERS: 0,
        FIRE: 1,
        WORKBENCH: 2,
        SEED: 3,
        WALL: 4,
        SPIKE: 5,
        BIG_FIRE: 6,
        STONE_WALL: 7,
        GOLD_WALL: 8,
        DIAMOND_WALL: 9,
        WOOD_DOOR: 10,
        CHEST: 11,
        STONE_SPIKE: 12,
        GOLD_SPIKE: 13,
        DIAMOND_SPIKE: 14,
        STONE_DOOR: 15,
        GOLD_DOOR: 16,
        DIAMOND_DOOR: 17,
        FURNACE: 18,
        AMETHYST_WALL: 19,
        AMETHYST_SPIKE: 20,
        AMETHYST_DOOR: 21,
        RESURRECTION: 22,
        EMERALD_MACHINE: 23,
        EXTRACTOR_MACHINE_STONE: 24,
        EXTRACTOR_MACHINE_GOLD: 25,
        EXTRACTOR_MACHINE_DIAMOND: 26,
        EXTRACTOR_MACHINE_AMETHYST: 27,
        EXTRACTOR_MACHINE_REIDITE: 28,
        EXTRACTOR_MACHINE_EMERALD: 29,
        EXTRACTOR_MACHINE_COPPER: 30,
        EXTRACTOR_MACHINE_IRON: 31,
        EXTRACTOR_MACHINE_TOPAZ: 32,
        EXTRACTOR_MACHINE_SAPPHIRE: 33,
        EXTRACTOR_MACHINE_JADE: 34,
        EXTRACTOR_MACHINE_RUBY: 35,
        EXTRACTOR_MACHINE_COAL: 36,
        EXTRACTOR_MACHINE_AQUAMARINE: 37,
        TOTEM: 38,
        WHEAT_SEED: 40,
        WINDMILL: 41,
        BREAD_OVEN: 43,
        WELL: 44,
        PUMPKIN_SEED: 46,
        ROOF: 47,
        GARLIC_SEED: 48,
        THORNBUSH_SEED: 49,
        BED: 50,
        TOMATO_SEED: 52,
        CARROT_SEED: 53,
        WOOD_DOOR_SPIKE: 54,
        STONE_DOOR_SPIKE: 55,
        GOLD_DOOR_SPIKE: 56,
        DIAMOND_DOOR_SPIKE: 57,
        AMETHYST_DOOR_SPIKE: 58,
        REIDITE_WALL: 59,
        REIDITE_DOOR: 60,
        REIDITE_SPIKE: 61,
        REIDITE_DOOR_SPIKE: 62,
        WATERMELON_SEED: 63,
        ALOE_VERA_SEED: 64,
        WOLF: 71,
        SPIDER: 72,
        FOX: 73,
        BEAR: 74,
        DRAGON: 75,
        PIRANHA: 76,
        KRAKEN: 77,
        CRAB: 78,
        FLAME: 79,
        LAVA_DRAGON: 80,
        BOAR: 81,
        CRAB_BOSS: 82,
        BABY_DRAGON: 83,
        BABY_LAVA: 84,
        HAWK: 85,
        VULTURE: 86,
        SAND_WORM: 87,
        BABY_MAMMOTH: 88,
        MAMMOTH: 89,
        PARROT: 90,
        OCELOT: 91,
        CROCODILE: 92,
        GOLDEN_CHICKEN: 93,
        GOLDEN_HEN: 94,
        RABBIT: 96,
        TREASURE_CHEST: 97,
        DEAD_BOX: 98,
        THORNBUSH_MOB: 99,
        CRATE: 102,
        GIFT: 103,
        PENGUIN: 104,
        ALOE_VERA_MOB: 105
      };
      let _0xb60cf7 = 0;
      const _0x44c140 = {
        SWORD: 0,
        PICK: 1,
        FUR: 2,
        PICK_GOLD: 3,
        PICK_DIAMOND: 4,
        SWORD_GOLD: 5,
        SWORD_DIAMOND: 6,
        HAND: 7,
        PICK_WOOD: 8,
        PIRATE_SWORD: 9,
        EARMUFFS: 10,
        COAT: 11,
        WOOD_SPEAR: 12,
        SPEAR: 13,
        GOLD_SPEAR: 14,
        DIAMOND_SPEAR: 15,
        DRAGON_SPEAR: 16,
        LAVA_SPEAR: 17,
        CRAB_SPEAR: 18,
        EMERALD_SPEAR: 19,
        COPPER_SPEAR: 20,
        IRON_SPEAR: 21,
        TOPAZ_SPEAR: 22,
        SAPPHIRE_SPEAR: 23,
        JADE_SPEAR: 24,
        RUBY_SPEAR: 25,
        COAL_SPEAR: 26,
        AQUAMARINE_SPEAR: 27,
        REIDITE_SWORD: 28,
        DIAMOND_PROTECTION: 29,
        AMETHYST_PROTECTION: 30,
        REIDITE_PROTECTION: 31,
        EXPLORER_HAT: 32,
        PIRATE_HAT: 33,
        STONE_HELMET: 34,
        GOLD_HELMET: 35,
        DIAMOND_HELMET: 36,
        EMERALD_HELMET: 37,
        COPPER_HELMET: 38,
        IRON_HELMET: 39,
        TOPAZ_HELMET: 40,
        SAPPHIRE_HELMET: 41,
        JADE_HELMET: 42,
        RUBY_HELMET: 43,
        COAL_HELMET: 44,
        AQUAMARINE_HELMET: 45,
        BOOK: 46,
        BAG: 47,
        SWORD_AMETHYST: 48,
        PICK_AMETHYST: 49,
        PICK_REIDITE: 50,
        PICK_EMERALD: 51,
        PICK_COPPER: 52,
        PICK_IRON: 53,
        PICK_TOPAZ: 54,
        PICK_SAPPHIRE: 55,
        PICK_JADE: 56,
        PICK_RUBY: 57,
        PICK_COAL: 58,
        PICK_AQUAMARINE: 59,
        AMETHYST_SPEAR: 60,
        REIDITE_SPEAR: 61,
        HAMMER: 62,
        HAMMER_GOLD: 63,
        HAMMER_DIAMOND: 64,
        HAMMER_AMETHYST: 65,
        HAMMER_REIDITE: 66,
        CAP_SCARF: 67,
        CHRISTMAS_HAT: 68,
        ELF_HAT: 69,
        AMETHYST_HELMET: 70,
        REIDITE_HELMET: 71,
        SUPER_HAMMER: 72,
        HAMMER_EMERALD: 73,
        HAMMER_COPPER: 74,
        HAMMER_IRON: 75,
        HAMMER_TOPAZ: 76,
        HAMMER_SAPPHIRE: 77,
        HAMMER_JADE: 78,
        HAMMER_RUBY: 79,
        HAMMER_COAL: 80,
        HAMMER_AQUAMARINE: 81,
        SHOVEL: 82,
        SUPER_DIVING_SUIT: 83,
        DIVING_MASK: 84,
        WATERING_CAN_FULL: 85,
        SHOVEL_GOLD: 86,
        SHOVEL_DIAMOND: 87,
        SHOVEL_AMETHYST: 88,
        SHOVEL_REIDITE: 89,
        SHOVEL_EMERALD: 90,
        SHOVEL_COPPER: 91,
        SHOVEL_IRON: 92,
        SHOVEL_TOPAZ: 93,
        SHOVEL_SAPPHIRE: 94,
        SHOVEL_JADE: 95,
        SHOVEL_RUBY: 96,
        SHOVEL_COAL: 97,
        SHOVEL_AQUAMARINE: 98,
        PITCHFORK: 99,
        PITCHFORK2: 100,
        SPANNER: 101,
        MACHETE: 102,
        SWORD_WOOD: 103,
        WOOD_HELMET: 104,
        DRAGON_HELMET: 105,
        LAVA_HELMET: 106,
        CROWN_CRAB: 107,
        DRAGON_SWORD: 108,
        LAVA_SWORD: 109,
        SWORD_EMERALD: 110,
        SWORD_COPPER: 111,
        SWORD_IRON: 112,
        SWORD_TOPAZ: 113,
        SWORD_SAPPHIRE: 114,
        SWORD_JADE: 115,
        SWORD_RUBY: 116,
        SWORD_COAL: 117,
        SWORD_AQUAMARINE: 118,
        WOOD_BOW: 119,
        STONE_BOW: 120,
        GOLD_BOW: 121,
        DIAMOND_BOW: 122,
        AMETHYST_BOW: 123,
        REIDITE_BOW: 124,
        DRAGON_BOW: 125,
        EMERALD_BOW: 126,
        COPPER_BOW: 127,
        IRON_BOW: 128,
        TOPAZ_BOW: 129,
        SAPPHIRE_BOW: 130,
        JADE_BOW: 131,
        RUBY_BOW: 132,
        COAL_BOW: 133,
        AQUAMARINE_BOW: 134,
        WOOD_SHIELD: 135,
        STONE_SHIELD: 136,
        GOLD_SHIELD: 137,
        DIAMOND_SHIELD: 138,
        AMETHYST_SHIELD: 139,
        REIDITE_SHIELD: 140,
        EMERALD_SHIELD: 141,
        COPPER_SHIELD: 142,
        IRON_SHIELD: 143,
        TOPAZ_SHIELD: 144,
        SAPPHIRE_SHIELD: 145,
        JADE_SHIELD: 146,
        RUBY_SHIELD: 147,
        COAL_SHIELD: 148,
        AQUAMARINE_SHIELD: 149,
        CROWN_GREEN: 150,
        CROWN_ORANGE: 151,
        CROWN_BLUE: 152,
        TURBAN1: 153,
        TURBAN2: 154,
        PILOT_HELMET: 155,
        HOOD: 156,
        PEASANT: 157,
        WINTER_HOOD: 158,
        WINTER_PEASANT: 159,
        FLOWER_HAT: 160,
        FUR_HAT: 161,
        SADDLE: 162,
        WITCH: 163,
        NIMBUS: 164,
        WAND1: 165,
        WAND2: 166,
        WOOD_AXE: 167,
        STONE_AXE: 168,
        GOLD_AXE: 169,
        DIAMOND_AXE: 170,
        AMETHYST_AXE: 171,
        REIDITE_AXE: 172,
        EMERALD_AXE: 173,
        COPPER_AXE: 174,
        IRON_AXE: 175,
        TOPAZ_AXE: 176,
        SAPPHIRE_AXE: 177,
        JADE_AXE: 178,
        RUBY_AXE: 179,
        COAL_AXE: 180,
        AQUAMARINE_AXE: 181,
        FIREFLY: 182,
        WOOD_ARROW: 183,
        STONE_ARROW: 184,
        GOLD_ARROW: 185,
        DIAMOND_ARROW: 186,
        AMETHYST_ARROW: 187,
        REIDITE_ARROW: 188,
        DRAGON_ARROW: 189,
        EMERALD_ARROW: 190,
        COPPER_ARROW: 191,
        IRON_ARROW: 192,
        TOPAZ_ARROW: 193,
        SAPPHIRE_ARROW: 194,
        JADE_ARROW: 195,
        RUBY_ARROW: 196,
        COAL_ARROW: 197,
        AQUAMARINE_ARROW: 198,
        STONE: 199,
        WOOD: 200,
        PLANT: 201,
        GOLD: 202,
        DIAMOND: 203,
        FIRE: 204,
        WORKBENCH: 205,
        SEED: 206,
        MEAT: 207,
        COOKED_MEAT: 208,
        BIG_FIRE: 209,
        FURNACE: 210,
        PAPER: 211,
        AMETHYST: 212,
        AMETHYST_WALL: 213,
        AMETHYST_SPIKE: 214,
        AMETHYST_DOOR: 215,
        BRIDGE: 216,
        SAND: 217,
        BOTTLE_FULL: 218,
        randomshit1: 219,
        randomshit2: 220,
        BOTTLE_EMPTY: 221,
        KRAKEN_SKIN: 222,
        WATERING_CAN: 223,
        FLOUR: 224,
        WHEAT_SEED: 225,
        COOKIE: 226,
        WILD_WHEAT: 227,
        WINDMILL: 228,
        CAKE: 229,
        FOODFISH: 230,
        FOODFISH_COOKED: 231,
        SCALES: 232,
        GROUND: 233,
        PLOT: 234,
        ICE: 235,
        BREAD: 236,
        BREAD_OVEN: 237,
        SANDWICH: 238,
        FUR_WINTER: 239,
        BLUE_CORD: 240,
        LOCK: 241,
        DRAGON_HEART: 242,
        LAVA_HEART: 243,
        RESURRECTION: 244,
        EMERALD_MACHINE: 245,
        EXTRACTOR_MACHINE_STONE: 246,
        EXTRACTOR_MACHINE_GOLD: 247,
        EXTRACTOR_MACHINE_DIAMOND: 248,
        EXTRACTOR_MACHINE_AMETHYST: 249,
        EXTRACTOR_MACHINE_REIDITE: 250,
        EXTRACTOR_MACHINE_EMERALD: 251,
        EXTRACTOR_MACHINE_COPPER: 252,
        EXTRACTOR_MACHINE_IRON: 253,
        EXTRACTOR_MACHINE_TOPAZ: 254,
        EXTRACTOR_MACHINE_SAPPHIRE: 255,
        EXTRACTOR_MACHINE_JADE: 256,
        EXTRACTOR_MACHINE_RUBY: 257,
        EXTRACTOR_MACHINE_COAL: 258,
        EXTRACTOR_MACHINE_AQUAMARINE: 259,
        LOCKPICK: 260,
        TOTEM: 261,
        SPIKE: 262,
        CORD: 263,
        WALL: 264,
        STONE_WALL: 265,
        GOLD_WALL: 266,
        DIAMOND_WALL: 267,
        WOOD_DOOR: 268,
        CHEST: 269,
        STONE_SPIKE: 270,
        GOLD_SPIKE: 271,
        DIAMOND_SPIKE: 272,
        STONE_DOOR: 273,
        GOLD_DOOR: 274,
        DIAMOND_DOOR: 275,
        FUR_WOLF: 276,
        GEMME_GREEN: 277,
        GEMME_ORANGE: 278,
        GEMME_BLUE: 279,
        SPECIAL_FUR: 280,
        SPECIAL_FUR_2: 281,
        BUCKET_FULL: 282,
        BUCKET_EMPTY: 283,
        WELL: 284,
        SIGN: 285,
        DRAGON_CUBE: 286,
        DRAGON_ORB: 287,
        LAVA_CUBE: 288,
        LAVA_ORB: 289,
        PUMPKIN_SEED: 290,
        PUMPKIN: 291,
        ROOF: 292,
        GARLIC_SEED: 293,
        GARLIC: 294,
        THORNBUSH_SEED: 295,
        THORNBUSH: 296,
        BANDAGE: 297,
        CRAB_STICK: 298,
        CRAB_LOOT: 299,
        BED: 300,
        SUGAR_CAN: 301,
        CANDY: 302,
        GARLAND: 303,
        REIDITE: 304,
        FLAME: 305,
        COPPER: 306,
        IRON: 307,
        TOPAZ: 308,
        SAPPHIRE: 309,
        JADE: 310,
        RUBY: 311,
        COAL: 312,
        AQUAMARINE: 313,
        CARROT_SEED: 314,
        CARROT: 315,
        TOMATO_SEED: 316,
        TOMATO: 317,
        WATERMELON_SEED: 318,
        WATERMELON: 319,
        ALOE_VERA_SEED: 320,
        ALOE_VERA: 321,
        WOOD_DOOR_SPIKE: 322,
        STONE_DOOR_SPIKE: 323,
        GOLD_DOOR_SPIKE: 324,
        DIAMOND_DOOR_SPIKE: 325,
        AMETHYST_DOOR_SPIKE: 326,
        REIDITE_WALL: 327,
        REIDITE_DOOR: 328,
        REIDITE_SPIKE: 329,
        REIDITE_DOOR_SPIKE: 330,
        WOOD_TOWER: 331,
        PENGUIN_FEATHER: 332,
        BOAT: 333,
        SLED: 334,
        MOUNT_BOAR: 335,
        CRAB_BOSS: 336,
        BABY_DRAGON: 337,
        BABY_LAVA: 338,
        HAWK: 339,
        PLANE: 340,
        HAWK_FEATHER: 341,
        VULTURE_FEATHER: 342,
        CACTUS: 343,
        randomshit3: 344,
        PITCHFORK_PART: 345,
        PILOT_GLASSES: 346,
        FUR_BOAR: 347,
        SANDWORM_JUICE: 348,
        BABY_MAMMOTH: 349,
        FUR_MAMMOTH: 350,
        FUR_CROCODILE: 351,
        PARROT_FEATHER: 352,
        FUR_OCELOT: 353,
        PARROT: 354,
        VULTURE: 355,
        BANANA: 356,
        randomshit4: 357,
        GOLDEN_HEN: 358,
        STONE_BRIDGE: 359,
        STONE_ROOF: 360,
        WOODEN_WINDOW: 361,
        STONE_WINDOW: 362
      };
      let _0x1e5f09 = {
        'DELETE': 1,
        'HURT': 2,
        'COLD': 4,
        'HUNGER': 8,
        'ATTACK': 16,
        'WALK': 32,
        'IDLE': 64,
        'HEAL': 128,
        'WEB': 256
      };
      class _0x24149b {
        constructor(_0x1b08c8, _0x1de59e, _0x1ac22a) {
          this.canvas = document.createElement("canvas"), this.ctx = this.canvas.getContext('2d'), this.canvas.width = _0x1b08c8, this.canvas.height = _0x1de59e, this.buildType = _0x1ac22a;
        }
        ["drawText"](_0x537d25, _0x624a5, _0x3327f4, _0x3ee6ff) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), this.ctx.font = _0x624a5 + "px Baloo Paaji", this.ctx.strokeStyle = _0x3327f4;
          this.buildType == 3 ? this.ctx.fillStyle = (_0x537d25[1] & 16) >> 4 ? "red" : "green" : this.ctx.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB";
          this.ctx.lineWidth = 7;
          switch (this.buildType) {
            case 1:
              this.ctx.strokeText('x' + (_0x537d25 & 255), 15, 30), this.ctx.fillText('x' + (_0x537d25 & 255), 15, 30), this.ctx.strokeText('x' + ((_0x537d25 & 65280) >> 8), 15, 50), this.ctx.fillText('x' + ((_0x537d25 & 65280) >> 8), 15, 50), this.ctx.strokeText(Math.round((_0x537d25 & 255) / 2) * 10 / 60 >= 1 ? (Math.round((_0x537d25 & 255) / 2) * 10 / 60).toFixed(0) + 'm' : Math.round((_0x537d25 & 255) / 2) * 10 + 's', 15, 70), this.ctx.fillText(Math.round((_0x537d25 & 255) / 2) * 10 / 60 >= 1 ? (Math.round((_0x537d25 & 255) / 2) * 10 / 60).toFixed(0) + 'm' : Math.round((_0x537d25 & 255) / 2) * 10 + 's', 15, 70);
              break;
            case 2:
              this.ctx.strokeText('x' + (_0x537d25 & 31), 15, 30), this.ctx.fillText('x' + (_0x537d25 & 31), 15, 30), this.ctx.strokeText('x' + ((_0x537d25 & 992) >> 5), 15, 50), this.ctx.fillText('x' + ((_0x537d25 & 992) >> 5), 15, 50), this.ctx.strokeText('x' + ((_0x537d25 & 31744) >> 10), 15, 70), this.ctx.fillText('x' + ((_0x537d25 & 31744) >> 10), 15, 70), this.ctx.strokeText(Math.min(_0x537d25 & 31, (_0x537d25 & 992) >> 5) * 10 / 60 >= 1 ? (Math.min(_0x537d25 & 31, (_0x537d25 & 992) >> 5) * 10 / 60).toFixed(0) + 'm' : Math.min(_0x537d25 & 31, (_0x537d25 & 992) >> 5) * 10 + 's', 15, 90), this.ctx.fillText(Math.min(_0x537d25 & 31, (_0x537d25 & 992) >> 5) * 10 / 60 >= 1 ? (Math.min(_0x537d25 & 31, (_0x537d25 & 992) >> 5) * 10 / 60).toFixed(0) + 'm' : Math.min(_0x537d25 & 31, (_0x537d25 & 992) >> 5) * 10 + 's', 15, 90);
              break;
            case 3:
              this.ctx.strokeText(_0x537d25[0], 15, 40), this.ctx.fillText(_0x537d25[0], 15, 40), this.ctx.strokeText((_0x537d25[1] & 16) >> 4 ? "Locked" : "Unlocked", 15, 60), this.ctx.fillText((_0x537d25[1] & 16) >> 4 ? 'Locked' : "Unlocked", 15, 60), this.ctx.strokeText((_0x537d25[1] & 16) >> 4 ? _0x537d25[1] - 16 : _0x537d25[1], 15, 80), this.ctx.fillText((_0x537d25[1] & 16) >> 4 ? _0x537d25[1] - 16 : _0x537d25[1], 15, 80);
              break;
            case 4:
              this.ctx.strokeText('x' + _0x537d25, 15, _0x3ee6ff == "furnace" ? 30 : 40), this.ctx.fillText('x' + _0x537d25, 15, _0x3ee6ff == "furnace" ? 30 : 40);
              _0x3ee6ff == 'furnace' && (this.ctx.strokeText(_0x537d25 * 5 / 60 >= 1 ? (_0x537d25 * 5 / 60).toFixed(0) + 'm' : _0x537d25 * 5 + 's', 15, 50), this.ctx.fillText(_0x537d25 * 5 / 60 >= 1 ? (_0x537d25 * 5 / 60).toFixed(0) + 'm' : _0x537d25 * 5 + 's', 15, 50));
              ;
              break;
            default:
              _0x3ee6ff == "machine" ? (this.ctx.strokeText(_0x537d25[0], 15, 30), this.ctx.fillText(_0x537d25[0], 15, 30), _0x537d25[1] != '0k' && (this.ctx.strokeText(_0x537d25[1], 15, 50), this.ctx.fillText(_0x537d25[1], 15, 50))) : (this.ctx.strokeText(_0x537d25, 15, 40), this.ctx.fillText(_0x537d25, 15, 40));
              ;
              break;
          }
        }
      }
      let _0x27f07a = {
          'L': 0,
          'I': new _0x24149b(250, 70, 0),
          'E': ![]
        },
        _0xce91f3 = ['t', 'b', 'f', 's', 'g', 'd', 'a', 're', "plm", 'p', 'cs', 'c', 'm'],
        _0x2062ce = ["wtb", 'r', 'l'],
        _0x5c4a40 = [];
      function _0xfc75d3(_0x1743d6, _0x49e2c2, _0x5eac5e) {
        const _0x369048 = Math.floor(_0x1743d6.x / 100),
          _0x20e6ff = Math.floor(_0x1743d6.y / 100),
          _0x44b811 = Math.floor(_0x49e2c2.x / 100),
          _0x2fe7c9 = Math.floor(_0x49e2c2.y / 100),
          _0x586a8d = Math.abs(_0x369048 - _0x44b811),
          _0x3cda7e = Math.abs(_0x20e6ff - _0x2fe7c9);
        return _0x586a8d <= _0x5eac5e && _0x3cda7e <= _0x5eac5e;
      }
      function _0x5a1a84(_0x3174db) {
        _0x3174db = _0x3174db.toString();
        let _0x23e686 = '';
        for (let _0x1fe5c8 = 0; _0x1fe5c8 < _0x3174db.length; _0x1fe5c8++) {
          _0x23e686 += String.fromCharCode(_0x3174db.charCodeAt(_0x1fe5c8) ^ 6900);
        }
        return _0x23e686;
      }
      function _0x13547e(_0x570121) {
        const _0x3e6463 = [];
        _0x5c4a40 = [];
        for (let _0x49d606 = 0; _0x49d606 < _0x570121.length; _0x49d606++) {
          for (let _0xb5bc62 = 0; _0xb5bc62 < _0x570121[_0x49d606].length; _0xb5bc62++) {
            const _0x4713ad = _0x570121[_0x49d606][_0xb5bc62];
            if (!Array.isArray(_0x4713ad)) for (let _0x6945a6 in _0x4713ad) {
              if (_0x4713ad.hasOwnProperty(_0x6945a6)) {
                if (_0xce91f3.includes(_0x6945a6)) _0x3e6463.push([_0xb5bc62, _0x49d606, _0x6945a6]);else _0x2062ce.includes(_0x6945a6) && _0x5c4a40.push([_0xb5bc62, _0x49d606, _0x6945a6]);
              }
            }
          }
        }
        return _0x3e6463;
      }
      function _0x400e7e(_0x42ae11) {
        const _0x3c3b4a = document.defaultView.js_beautify(_0x42ae11),
          _0x18e852 = _0x3c3b4a.split('\x0a').length;
        return _0x18e852;
      }
      let _0x17aa18 = 0,
        _0x1581d1 = 0;
      function _0x12a87d(_0x258026, _0x401edb, _0x5a6888 = 0, _0x3626ca = null) {
        if (_0x5d7ebd) return;
        _0x59cdca && (_0x5d7ebd = !![]);
        if (document.visibilityState != 'visible') return;
        _0x17aa18 && _0x17aa18.style && _0x17aa18.style.opacity && document.body.removeChild(_0x17aa18);
        let _0x1d4717 = document.createElement("div");
        _0x17aa18 = _0x1d4717, _0x1d4717.style.userSelect = "none", _0x1d4717.style.position = "fixed", _0x1d4717.style.top = "20px", _0x1d4717.style.left = '50%', _0x1d4717.style.transform = "translateX(-50%)", _0x1d4717.style.padding = '10px\x2020px', _0x1d4717.style.backgroundColor = _0x258026, _0x1d4717.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)", _0x1d4717.style.zIndex = '1000', _0x1d4717.style.textAlign = 'left', _0x1d4717.style.color = "#fff", _0x1d4717.style.borderRadius = '10px', _0x1d4717.style.opacity = '0', _0x1d4717.style.transition = 'opacity\x200.3s';
        let _0x58b9d3 = document.createElement('p');
        _0x58b9d3.textContent = _0x401edb, _0x58b9d3.style.margin = '0', _0x58b9d3.style.fontSize = "18px", _0x58b9d3.style.fontFamily = 'Baloo\x20Paaji,\x20cursive', _0x58b9d3.style.textShadow = '0\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black', _0x1d4717.appendChild(_0x58b9d3);
        if (_0x5a6888 === 1) {
          let _0x3f9578 = document.createElement("div");
          _0x3f9578.style.marginTop = "10px", _0x3f9578.style.display = "flex", _0x3f9578.style.justifyContent = 'space-between';
          let _0x5db1af = document.createElement("button");
          _0x5db1af.textContent = 'Yes', _0x5db1af.style.flex = '1', _0x5db1af.style.marginRight = '5px', _0x5db1af.style.padding = '5px', _0x5db1af.style.border = "none", _0x5db1af.style.borderRadius = "5px", _0x5db1af.style.backgroundColor = "transparent", _0x5db1af.style.color = "#fff", _0x5db1af.style.cursor = "pointer", _0x5db1af.style.fontFamily = "Baloo Paaji, cursive", _0x5db1af.style.textShadow = "0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black", _0x5db1af.style.fontSize = "14px", _0x5db1af.addEventListener('click', () => {
            !_0x5d7ebd && _0x86c0c0(), _0x3626ca && _0x3626ca(!![]);
          });
          let _0x1751b0 = document.createElement("button");
          _0x1751b0.textContent = 'No', _0x1751b0.style.flex = '1', _0x1751b0.style.padding = "5px", _0x1751b0.style.border = 'none', _0x1751b0.style.borderRadius = '5px', _0x1751b0.style.backgroundColor = "#f44336", _0x1751b0.style.color = "#fff", _0x1751b0.style.cursor = 'pointer', _0x1751b0.style.fontFamily = 'Baloo\x20Paaji,\x20cursive', _0x1751b0.style.textShadow = '0\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black,\x200\x200\x203px\x20black', _0x1751b0.style.fontSize = "14px", _0x1751b0.addEventListener("click", () => {
            !_0x5d7ebd && _0x86c0c0(), _0x3626ca && _0x3626ca(![]);
          }), _0x3f9578.appendChild(_0x5db1af), _0x3f9578.appendChild(_0x1751b0), _0x1d4717.appendChild(_0x3f9578);
        } else {
          if (_0x5a6888 === 2) {
            let _0x4cd663 = document.createElement("input");
            _0x4cd663.type = "text", _0x4cd663.style.width = "100%", _0x4cd663.style.marginTop = '10px', _0x4cd663.style.padding = "5px", _0x4cd663.style.borderRadius = "5px", _0x4cd663.style.border = "1px solid #ddd", _0x4cd663.style.boxSizing = "border-box", _0x1d4717.appendChild(_0x4cd663), _0x4cd663.addEventListener("keydown", _0x547e0b => {
              if (_0x547e0b.key === "Enter") {
                let _0x19e653 = _0x4cd663.value;
                !_0x5d7ebd && _0x86c0c0(), _0x3626ca && _0x3626ca(_0x19e653);
              }
            });
          }
        }
        document.body.appendChild(_0x1d4717), _0x1d4717.style.opacity = '1';
        let _0x86c0c0 = () => {
          _0x1d4717 && _0x1d4717.style && _0x1d4717.style.opacity && (_0x1d4717.style.opacity = '0'), _0x1581d1 = _0x4cd684.setTimeout(() => {
            _0x17aa18 = 0, _0x1d4717 && _0x1d4717.style && _0x1d4717.style.opacity && document.body.removeChild(_0x1d4717);
          }, 300);
        };
        _0x5a6888 === 0 && !_0x5d7ebd && (_0x1581d1 = _0x4cd684.setTimeout(_0x86c0c0, 3700));
      }
      function _0x57c289(_0x1faf72) {
        switch (_0x1faf72) {
          case _0x44c140.SWORD:
          case _0x44c140.SWORD_GOLD:
          case _0x44c140.SWORD_DIAMOND:
          case _0x44c140.REIDITE_SWORD:
          case _0x44c140.SWORD_AMETHYST:
          case _0x44c140.SWORD_WOOD:
          case _0x44c140.DRAGON_SWORD:
          case _0x44c140.LAVA_SWORD:
          case _0x44c140.SWORD_EMERALD:
          case _0x44c140.SWORD_COPPER:
          case _0x44c140.SWORD_IRON:
          case _0x44c140.SWORD_TOPAZ:
          case _0x44c140.SWORD_SAPPHIRE:
          case _0x44c140.SWORD_JADE:
          case _0x44c140.SWORD_RUBY:
          case _0x44c140.SWORD_COAL:
          case _0x44c140.SWORD_AQUAMARINE:
            return 1;
          case _0x44c140.WOOD_SPEAR:
          case _0x44c140.SPEAR:
          case _0x44c140.GOLD_SPEAR:
          case _0x44c140.DIAMOND_SPEAR:
          case _0x44c140.DRAGON_SPEAR:
          case _0x44c140.LAVA_SPEAR:
          case _0x44c140.CRAB_SPEAR:
          case _0x44c140.EMERALD_SPEAR:
          case _0x44c140.COPPER_SPEAR:
          case _0x44c140.IRON_SPEAR:
          case _0x44c140.TOPAZ_SPEAR:
          case _0x44c140.SAPPHIRE_SPEAR:
          case _0x44c140.JADE_SPEAR:
          case _0x44c140.RUBY_SPEAR:
          case _0x44c140.COAL_SPEAR:
          case _0x44c140.AQUAMARINE_SPEAR:
          case _0x44c140.AMETHYST_SPEAR:
          case _0x44c140.REIDITE_SPEAR:
            return 2;
          case _0x44c140.WOOD_AXE:
          case _0x44c140.STONE_AXE:
          case _0x44c140.GOLD_AXE:
          case _0x44c140.DIAMOND_AXE:
          case _0x44c140.AMETHYST_AXE:
          case _0x44c140.REIDITE_AXE:
          case _0x44c140.EMERALD_AXE:
          case _0x44c140.COPPER_AXE:
          case _0x44c140.IRON_AXE:
          case _0x44c140.TOPAZ_AXE:
          case _0x44c140.SAPPHIRE_AXE:
          case _0x44c140.JADE_AXE:
          case _0x44c140.RUBY_AXE:
          case _0x44c140.COAL_AXE:
          case _0x44c140.AQUAMARINE_AXE:
            return 3;
          case _0x44c140.SUPER_HAMMER:
            return 4;
          case _0x44c140.PIRATE_SWORD:
            return 5;
          case _0x44c140.WOOD_BOW:
          case _0x44c140.STONE_BOW:
          case _0x44c140.GOLD_BOW:
          case _0x44c140.DIAMOND_BOW:
          case _0x44c140.AMETHYST_BOW:
          case _0x44c140.REIDITE_BOW:
          case _0x44c140.DRAGON_BOW:
          case _0x44c140.EMERALD_BOW:
          case _0x44c140.COPPER_BOW:
          case _0x44c140.IRON_BOW:
          case _0x44c140.TOPAZ_BOW:
          case _0x44c140.SAPPHIRE_BOW:
          case _0x44c140.JADE_BOW:
          case _0x44c140.RUBY_BOW:
          case _0x44c140.COAL_BOW:
          case _0x44c140.AQUAMARINE_BOW:
            return 6;
        }
      }
      function _0x4e4eb0(_0x1a8a33, _0xe55413) {
        const _0x451e11 = _0x1a8a33.x - _0xe55413.x,
          _0x2a8d90 = _0x1a8a33.y - _0xe55413.y;
        return Math.atan2(_0x2a8d90, _0x451e11);
      }
      function _0x4f84b6() {
        let _0x3c7ed5 = _0x73cd4e.Aimbot.mode == "Rabbit Chase" ? gameWorld.units[EntityIDs.RABBIT] : gameWorld.units[EntityIDs.PLAYERS],
          _0x8a6ba5 = gameWorld.fast_units[_0x57f7e4.uid],
          _0x5d6c44,
          _0x23ffcf = 550;
        for (let _0x1ac736 = 0; _0x1ac736 < _0x3c7ed5.length; _0x1ac736++) {
          if (!_0x194c5e(_0x3c7ed5[_0x1ac736][_0x57f7e4.pid]) || _0x73cd4e.Aimbot.mode == 'Rabbit\x20Chase') {
            if (_0x8a6ba5[_0x57f7e4.fly] == 0 && _0x3c7ed5[_0x1ac736][_0x57f7e4.fly] == 1 && _0x73cd4e.Aimbot.mode !== "Rabbit Chase") continue;else {
              if (_0x8a6ba5[_0x57f7e4.fly] == 1 && _0x3c7ed5[_0x1ac736][_0x57f7e4.fly] == 0 && _0x73cd4e.Aimbot.mode !== "Rabbit Chase") continue;else {
                if (_0x3c7ed5[_0x1ac736][_0x57f7e4.ghost]) continue;
              }
            }
            let _0x5c532d = _0x3e37f7(_0x8a6ba5, _0x3c7ed5[_0x1ac736]);
            _0x5c532d < _0x23ffcf && (_0x5d6c44 = _0x3c7ed5[_0x1ac736], _0x23ffcf = _0x5c532d);
          }
        }
        return [_0x5d6c44, _0x23ffcf];
      }
      async function _0x4d8667(_0x4a4879, ..._0xc216d1) {
        return await new Promise(async (_0x1a5828, _0x4afe21) => {
          try {
            await _0x4a4879(..._0xc216d1), _0x1a5828();
          } catch (_0x23cff3) {
            _0x4afe21(_0x23cff3);
          }
        });
      }
      let _0x30a5be = [],
        _0x37b62b = [];
      function _0x4d0bf5(_0x4c6e2d, _0x563e7a, _0x2e93a8) {
        for (let _0x34d6c2 = 0; _0x34d6c2 < _0x2e93a8.length; _0x34d6c2++) {
          const [_0x25cfdc, _0x59c5d8] = _0x2e93a8[_0x34d6c2];
          if (_0x25cfdc === _0x4c6e2d + _0x563e7a) return _0x59c5d8;
        }
        return null;
      }
      function _0x226553(_0x2022fd) {
        const _0xf247a8 = _0x2022fd.replace(new RegExp("function\\s*\\(\\s*\\)\\s*{", 'g'), ''),
          _0x4cf4c7 = new RegExp("[^\\s()]+\\s*\\(\\s*\\)", 'g'),
          _0x1c35ee = _0xf247a8.match(_0x4cf4c7);
        return _0x1c35ee ? _0x1c35ee.length : 0;
      }
      function _0x3744d6(_0xbd1ee0) {
        return _0xbd1ee0 = _0xbd1ee0.replace(new RegExp("\\\\(\\d{1,3})", 'g'), (_0x490cf4, _0x13d374) => String.fromCharCode(parseInt(_0x13d374, 8))), _0xbd1ee0 = _0xbd1ee0.replace(new RegExp("\\\\x([0-9A-Fa-f]{2})", 'g'), (_0x8d5b21, _0xcf9795) => String.fromCharCode(parseInt(_0xcf9795, 16))), _0xbd1ee0 = _0xbd1ee0.replace(new RegExp("\\\\u([\\dA-Fa-f]{4})", 'g'), (_0x208ebf, _0x3596fa) => String.fromCharCode(parseInt(_0x3596fa, 16))), _0xbd1ee0;
      }
      function _0x5a7493(_0x896a6b) {
        const _0x118ffe = new RegExp("['\"`]([^'\"`]+)['\"`]", 'g'),
          _0x57170a = [];
        let _0x4cd381;
        while ((_0x4cd381 = _0x118ffe.exec(_0x896a6b)) !== null) {
          _0x57170a.push(_0x4cd381[1]);
        }
        return _0x57170a;
      }
      function _0x30a934(_0x1f49cd, _0x5e83f1) {
        if (typeof _0x1f49cd === "object" && _0x1f49cd !== null) {
          const _0x28f98d = Object.keys(_0x5e83f1);
          return _0x28f98d.every(_0x22fb1b => {
            if (_0x22fb1b in _0x1f49cd) {
              if (_0x5e83f1[_0x22fb1b] === "any") return !![];
              return typeof _0x1f49cd[_0x22fb1b] === typeof _0x5e83f1[_0x22fb1b];
            }
            return ![];
          });
        }
        return ![];
      }
      function _0x255b02(_0x1c506b) {
        return Array.isArray(_0x1c506b) ? _0x1c506b.length : Object.keys(_0x1c506b).length;
      }
      function _0x4b7392(_0x53df61, _0x4d8363) {
        const _0x2e88be = _0x1f5c07(_0x53df61),
          _0x3ab73a = _0x1f5c07(_0x4d8363),
          _0x1ea35e = _0x2e88be.semicolon === _0x3ab73a.semicolon,
          _0x42c210 = _0x2e88be.slash === _0x3ab73a.slash,
          _0x3a0deb = _0x2e88be.equals === _0x3ab73a.equals,
          _0x5f23da = (_0x1ea35e ? 1 : 0) + (_0x42c210 ? 1 : 0) + (_0x3a0deb ? 1 : 0),
          _0x338289 = _0x5f23da / 3 * 100;
        let _0x43f2bb = 33;
        if (_0x338289 === 100) _0x43f2bb = 100;else _0x338289 >= 66 && (_0x43f2bb = 66);
        return _0x43f2bb;
      }
      function _0x1f5c07(_0x71cbf6) {
        const _0x67db05 = {
          'semicolon': 0,
          'slash': 0,
          'equals': 0
        };
        return _0x67db05.semicolon = (_0x71cbf6.match(new RegExp(';', 'g')) || []).length, _0x67db05.slash = (_0x71cbf6.match(new RegExp('\x5c/', 'g')) || []).length, _0x67db05.equals = (_0x71cbf6.match(new RegExp('=', 'g')) || []).length, _0x67db05;
      }
      function _0x373076(_0x3de7f4, _0x45ec23, _0x217033, _0xd037da, _0x95c75, _0xfb09ff, _0x283199, _0x19b483, _0x1a5104, _0x229f0b) {
        if (_0x45ec23.tryLoad === undefined || _0x45ec23.tryLoad() === 1) {
          if (_0x229f0b !== undefined) _0x45ec23.naturalWidth && _0x3de7f4.drawImage(_0x45ec23, _0x217033, _0xd037da, Math.max(1, _0x95c75), Math.max(1, _0xfb09ff), _0x283199, _0x19b483, _0x1a5104, _0x229f0b);else {
            if (_0xfb09ff !== undefined) _0x45ec23.naturalWidth && _0x3de7f4.drawImage(_0x45ec23, _0x217033, _0xd037da, _0x95c75, _0xfb09ff);else _0x45ec23.naturalWidth && _0x3de7f4.drawImage(_0x45ec23, _0x217033, _0xd037da);
          }
        }
      }
      function _0x307e7f(_0x2c6628) {
        const _0x5a17b0 = _0x2c6628 + '=',
          _0x4ca76c = decodeURIComponent(document.cookie),
          _0x5747ab = _0x4ca76c.split(';\x20');
        for (let _0x1ee81b = 0; _0x1ee81b < _0x5747ab.length; _0x1ee81b++) {
          let _0x3fdaab = _0x5747ab[_0x1ee81b].trim();
          if (_0x3fdaab.indexOf(_0x5a17b0) === 0) return _0x3fdaab.substring(_0x5a17b0.length, _0x3fdaab.length);
        }
        return null;
      }
      function _0x195483(_0x49c4e4, _0xa2b63a, _0x1863e6 = 7) {
        const _0x3a384f = new Date();
        _0x3a384f.setTime(_0x3a384f.getTime() + _0x1863e6 * 24 * 60 * 60 * 1000), document.cookie = '' + encodeURIComponent(_0x49c4e4) + '=' + encodeURIComponent(_0xa2b63a) + ';\x20expires=' + _0x3a384f.toUTCString() + ';\x20path=/';
      }
      function _0x43be69(_0xd77818, _0x377991, _0x23ffa5) {
        let _0x2376cd = document.createElement('canvas'),
          _0x337080 = _0x2376cd.getContext('2d');
        return _0x2376cd.width = _0xd77818 * 248, _0x2376cd.height = _0xd77818 * 247, _0x337080.save(), _0x337080.translate(_0xd77818 * 69.5, _0xd77818 * 145), _0x14e8de(_0x337080, _0xd77818 * -8.5, _0xd77818 * -63, _0xd77818 * 17, _0xd77818 * 127, _0xd77818 * 1), _0x337080.restore(), _0x993b50(_0x337080, _0x23ffa5[0]), _0x337080.save(), _0x337080.translate(_0xd77818 * 183, _0xd77818 * 145), _0x14e8de(_0x337080, _0xd77818 * -8, _0xd77818 * -63, _0xd77818 * 16, _0xd77818 * 126, _0xd77818 * 1), _0x337080.restore(), _0x993b50(_0x337080, _0x23ffa5[0]), _0x337080.save(), _0x337080.translate(_0xd77818 * 123.5, _0xd77818 * 62.5), _0x337080.rotate(6.28), _0x14e8de(_0x337080, _0xd77818 * -84.5, _0xd77818 * -25.5, _0xd77818 * 169, _0xd77818 * 51, _0xd77818 * 5), _0x337080.restore(), _0x993b50(_0x337080, _0x23ffa5[2], _0x23ffa5[1], _0xd77818 * 6), _0x337080.save(), _0x337080.translate(_0xd77818 * 123.5, _0xd77818 * 118), _0x337080.rotate(6.24), _0x14e8de(_0x337080, _0xd77818 * -85.5, _0xd77818 * -24, _0xd77818 * 169, _0xd77818 * 48, _0xd77818 * 5), _0x337080.restore(), _0x993b50(_0x337080, _0x23ffa5[3], _0x23ffa5[1], _0xd77818 * 6), _0x337080.save(), _0x337080.translate(_0xd77818 * 122, _0xd77818 * 177.5), _0x337080.rotate(6.32), _0x14e8de(_0x337080, _0xd77818 * -84, _0xd77818 * -23.5, _0xd77818 * 169, _0xd77818 * 47, _0xd77818 * 5), _0x337080.restore(), _0x993b50(_0x337080, _0x23ffa5[2], _0x23ffa5[1], _0xd77818 * 6), _0x337080.beginPath(), _0x337080.lineCap = 'round', _0x337080.lineJoin = "round", _0x337080.moveTo(_0xd77818 * 37, _0xd77818 * 157), _0x337080.bezierCurveTo(_0xd77818 * 49, _0xd77818 * 160, _0xd77818 * 49, _0xd77818 * 160, _0xd77818 * 61, _0xd77818 * 163), _0x337080.bezierCurveTo(_0xd77818 * 49.5, _0xd77818 * 165.5, _0xd77818 * 49.5, _0xd77818 * 165.5, _0xd77818 * 38, _0xd77818 * 168), _0x337080.closePath(), _0x993b50(_0x337080, _0x23ffa5[1]), _0x337080.beginPath(), _0x337080.lineCap = "round", _0x337080.lineJoin = 'round', _0x337080.moveTo(_0xd77818 * 205, _0xd77818 * 175), _0x337080.bezierCurveTo(_0xd77818 * 192.5, _0xd77818 * 180, _0xd77818 * 192.5, _0xd77818 * 180, _0xd77818 * 180, _0xd77818 * 185), _0x337080.bezierCurveTo(_0xd77818 * 193, _0xd77818 * 188, _0xd77818 * 193, _0xd77818 * 188, _0xd77818 * 206, _0xd77818 * 191), _0x337080.closePath(), _0x993b50(_0x337080, _0x23ffa5[1]), _0x2376cd;
      }
      function _0x7d7250(_0x529562, _0x1a1eb2, _0x2c418d) {
        let _0x108f3c = document.createElement("canvas"),
          _0x16425d = _0x108f3c.getContext('2d');
        return _0x108f3c.width = _0x529562 * 248, _0x108f3c.height = _0x529562 * 247, _0x16425d.save(), _0x16425d.translate(_0x529562 * 182, _0x529562 * 120), _0x14e8de(_0x16425d, _0x529562 * -8, _0x529562 * -67, _0x529562 * 16, _0x529562 * 134, _0x529562 * 1), _0x16425d.restore(), _0x993b50(_0x16425d, _0x2c418d[0]), _0x16425d.save(), _0x16425d.translate(_0x529562 * 68.5, _0x529562 * 127.5), _0x14e8de(_0x16425d, _0x529562 * -8.5, _0x529562 * -70.5, _0x529562 * 17, _0x529562 * 141, _0x529562 * 1), _0x16425d.restore(), _0x993b50(_0x16425d, _0x2c418d[0]), _0x16425d.save(), _0x16425d.translate(_0x529562 * 123.5, _0x529562 * 68), _0x14e8de(_0x16425d, _0x529562 * -82.5, _0x529562 * -24, _0x529562 * 165, _0x529562 * 48, _0x529562 * 4), _0x16425d.restore(), _0x993b50(_0x16425d, _0x2c418d[2], _0x2c418d[1], _0x529562 * 6), _0x16425d.save(), _0x16425d.translate(_0x529562 * 123, _0x529562 * 179.5), _0x14e8de(_0x16425d, _0x529562 * -83, _0x529562 * -24.5, _0x529562 * 166, _0x529562 * 49, _0x529562 * 4), _0x16425d.restore(), _0x993b50(_0x16425d, _0x2c418d[2], _0x2c418d[1], _0x529562 * 6), _0x16425d.save(), _0x16425d.translate(_0x529562 * 123.5, _0x529562 * 123.5), _0x16425d.rotate(6.24), _0x14e8de(_0x16425d, _0x529562 * -82.5, _0x529562 * -24.5, _0x529562 * 165, _0x529562 * 49, _0x529562 * 4), _0x16425d.restore(), _0x993b50(_0x16425d, _0x2c418d[3], _0x2c418d[1], _0x529562 * 6), _0x16425d.beginPath(), _0x16425d.lineCap = "round", _0x16425d.lineJoin = "round", _0x16425d.moveTo(_0x529562 * 204, _0x529562 * 112), _0x16425d.bezierCurveTo(_0x529562 * 149, _0x529562 * 121.5, _0x529562 * 96, _0x529562 * 130, _0x529562 * 94, _0x529562 * 131), _0x16425d.bezierCurveTo(_0x529562 * 149.5, _0x529562 * 127.5, _0x529562 * 149.5, _0x529562 * 127.5, _0x529562 * 205, _0x529562 * 124), _0x16425d.closePath(), _0x993b50(_0x16425d, _0x2c418d[1]), _0x108f3c;
      }
      function _0x2ec28b(_0x395bec, _0x31c630, _0x27fd26) {
        let _0x264428 = document.createElement('canvas'),
          _0x1ab0f6 = _0x264428.getContext('2d');
        return _0x264428.width = _0x395bec * 248, _0x264428.height = _0x395bec * 247, _0x1ab0f6.save(), _0x1ab0f6.translate(_0x395bec * 183, _0x395bec * 107), _0x14e8de(_0x1ab0f6, _0x395bec * -8, _0x395bec * -70.5, _0x395bec * 16, _0x395bec * 141, _0x395bec * 1), _0x1ab0f6.restore(), _0x993b50(_0x1ab0f6, _0x27fd26[0]), _0x1ab0f6.save(), _0x1ab0f6.translate(_0x395bec * 69.5, _0x395bec * 110), _0x14e8de(_0x1ab0f6, _0x395bec * -8.5, _0x395bec * -71, _0x395bec * 17, _0x395bec * 143, _0x395bec * 1), _0x1ab0f6.restore(), _0x993b50(_0x1ab0f6, _0x27fd26[0]), _0x1ab0f6.save(), _0x1ab0f6.translate(_0x395bec * 123.5, _0x395bec * 181), _0x14e8de(_0x1ab0f6, _0x395bec * -84.5, _0x395bec * -26, _0x395bec * 169, _0x395bec * 52, _0x395bec * 5), _0x1ab0f6.restore(), _0x993b50(_0x1ab0f6, _0x27fd26[2], _0x27fd26[1], _0x395bec * 6), _0x1ab0f6.beginPath(), _0x1ab0f6.lineCap = "round", _0x1ab0f6.lineJoin = "round", _0x1ab0f6.moveTo(_0x395bec * 41, _0x395bec * 95), _0x1ab0f6.bezierCurveTo(_0x395bec * 105, _0x395bec * 96, _0x395bec * 113, _0x395bec * 99, _0x395bec * 134, _0x395bec * 102), _0x1ab0f6.bezierCurveTo(_0x395bec * 147, _0x395bec * 106, _0x395bec * 173, _0x395bec * 100, _0x395bec * 207, _0x395bec * 105), _0x1ab0f6.bezierCurveTo(_0x395bec * 210, _0x395bec * 105, _0x395bec * 207, _0x395bec * 140, _0x395bec * 207, _0x395bec * 154), _0x1ab0f6.bezierCurveTo(_0x395bec * 123.5, _0x395bec * 151.5, _0x395bec * 123.5, _0x395bec * 151.5, _0x395bec * 40, _0x395bec * 149), _0x1ab0f6.bezierCurveTo(_0x395bec * 37, _0x395bec * 145, _0x395bec * 39, _0x395bec * 95, _0x395bec * 41, _0x395bec * 96), _0x1ab0f6.closePath(), _0x993b50(_0x1ab0f6, _0x27fd26[2], _0x27fd26[1], _0x395bec * 6), _0x1ab0f6.beginPath(), _0x1ab0f6.lineCap = 'round', _0x1ab0f6.lineJoin = 'round', _0x1ab0f6.moveTo(_0x395bec * 68, _0x395bec * 75), _0x1ab0f6.bezierCurveTo(_0x395bec * 54, _0x395bec * 72.5, _0x395bec * 54, _0x395bec * 72.5, _0x395bec * 40, _0x395bec * 70), _0x1ab0f6.bezierCurveTo(_0x395bec * 38, _0x395bec * 46, _0x395bec * 40, _0x395bec * 46, _0x395bec * 53, _0x395bec * 46), _0x1ab0f6.bezierCurveTo(_0x395bec * 201, _0x395bec * 41, _0x395bec * 201, _0x395bec * 41, _0x395bec * 201, _0x395bec * 42), _0x1ab0f6.bezierCurveTo(_0x395bec * 211, _0x395bec * 40, _0x395bec * 208, _0x395bec * 53, _0x395bec * 208, _0x395bec * 72), _0x1ab0f6.bezierCurveTo(_0x395bec * 209, _0x395bec * 91, _0x395bec * 210, _0x395bec * 96, _0x395bec * 194, _0x395bec * 94), _0x1ab0f6.bezierCurveTo(_0x395bec * 119, _0x395bec * 97, _0x395bec * 119, _0x395bec * 97, _0x395bec * 44, _0x395bec * 100), _0x1ab0f6.bezierCurveTo(_0x395bec * 39, _0x395bec * 99, _0x395bec * 40, _0x395bec * 96, _0x395bec * 40, _0x395bec * 80), _0x1ab0f6.bezierCurveTo(_0x395bec * 54, _0x395bec * 77.5, _0x395bec * 54, _0x395bec * 77.5, _0x395bec * 68, _0x395bec * 75), _0x1ab0f6.closePath(), _0x993b50(_0x1ab0f6, _0x27fd26[3], _0x27fd26[1], _0x395bec * 6), _0x264428;
      }
      function _0x3df2a8(_0x250acc, _0x4a2931, _0x4a027) {
        let _0x5c3921 = document.createElement("canvas"),
          _0x275af2 = _0x5c3921.getContext('2d');
        return _0x5c3921.width = _0x250acc * 248, _0x5c3921.height = _0x250acc * 247, _0x275af2.save(), _0x275af2.translate(_0x250acc * 123.5, _0x250acc * 62.5), _0x275af2.rotate(6.28), _0x275af2.rect(_0x250acc * -84.5, _0x250acc * -25.5, _0x250acc * 169, _0x250acc * 169), _0x275af2.restore(), _0x993b50(_0x275af2, _0x4a027[2]), _0x5c3921;
      }
      function _0x5d811b() {
        _0x58c261.ROOF = [[], [], [], []], _0x58c261.ROOF[0][0] = _0x20af5d(_0x43be69(0.59, !![], ["#0d1b1c", "#44301b", "#57442a", "#523e26"])), _0x58c261.ROOF[0][1] = _0x20af5d(_0x43be69(0.59, !![], ["#0c0c0d", "#062124", "#10373d", '#0f3333'])), _0x58c261.ROOF[1][0] = _0x20af5d(_0x7d7250(0.59, !![], ["#0d1b1c", '#44301b', "#57442a", "#523e26"])), _0x58c261.ROOF[1][1] = _0x20af5d(_0x7d7250(0.59, !![], ["#0c0c0d", "#062124", "#10373d", "#0f3333"])), _0x58c261.ROOF[2][0] = _0x20af5d(_0x2ec28b(0.59, !![], ["#0d1b1c", "#44301b", "#57442a", "#523e26"])), _0x58c261.ROOF[2][1] = _0x20af5d(_0x2ec28b(0.59, !![], ["#0c0c0d", "#062124", "#10373d", '#0f3333'])), _0x58c261.ROOF[3][0] = _0x20af5d(_0x3df2a8(0.59, !![], ['#0d1b1c', "#57442a", "#57442a", "#523e26"])), _0x58c261.ROOF[3][1] = _0x20af5d(_0x3df2a8(0.59, !![], ["#0c0c0d", "#10373d", "#10373d", "#0f3333"]));
      }
      _0x5d811b();
      function _0x194c5e(_0x1c163b) {
        if (_0x1c163b === _0x9cb2d9.id) return 1;
        for (let _0x42a6af = 0; _0x42a6af < _0x3b2ae4.WUB.length; _0x42a6af++) {
          if (_0x3b2ae4.WUB[_0x42a6af] == _0x1c163b) return 1;
        }
        return 0;
      }
      function _0x3e37f7(_0x75ef16, _0xa10696) {
        if (_0x75ef16 && _0xa10696) return Math.sqrt((_0x75ef16.x - _0xa10696.x) ** 2 + (_0x75ef16.y - _0xa10696.y) ** 2);
        return null;
      }
      function _0x57ab4c(_0x1fd9b0) {
        _0x507512.save(), _0x507512.translate(_0x3b2ae4.WUF.x + _0x1fd9b0.x, _0x3b2ae4.WUF.y + _0x1fd9b0.y), _0x507512.rotate(_0x1fd9b0.angle);
        let _0x311938, _0x4dcac4;
        if (_0x1fd9b0[_0x57f7e4.hit][_0x57f7e4.update]) {
          _0x1fd9b0[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.update]() && _0x1fd9b0[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.o] == ![] && (_0x1fd9b0[_0x57f7e4.hit][_0x57f7e4.update] = ![]);
          let _0x42bccb = _0xcdfe98 * ((1 - _0x1fd9b0[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.v]) * 600);
          _0x311938 = _0x42bccb * Math.sin(_0x1fd9b0[_0x57f7e4.hit].angle - _0x1fd9b0.angle), _0x4dcac4 = Math.cos(_0x1fd9b0[_0x57f7e4.hit].angle - _0x1fd9b0.angle) * _0x42bccb;
        } else _0x311938 = 0, _0x4dcac4 = 0;
        let _0x5244a1 = _0x58c261.ROOF[_0x73cd4e.smoothRoofs ? 3 : (_0x1fd9b0[_0x57f7e4.j] + _0x1fd9b0[_0x57f7e4.i] % 2) % 3][_0x57f7e4.time],
          _0x58f3cd = -1;
        if (_0x73cd4e.Roof.active) _0x507512.globalAlpha = Number(_0x73cd4e.Roof.opacity);else {
          let _0x173757 = gameWorld.fast_units[_0x57f7e4.uid];
          if (_0x173757 && _0x194c5e(_0x1fd9b0[_0x57f7e4.pid])) _0x3e37f7(_0x1fd9b0, _0x173757) < 550 ? _0x1fd9b0[_0x57f7e4.opacity] = Math.max(_0x1fd9b0[_0x57f7e4.opacity] - _0xcdfe98, 0.3) : _0x1fd9b0[_0x57f7e4.opacity] = Math.min(_0x1fd9b0[_0x57f7e4.opacity] + _0xcdfe98, 1);else _0x173757 && _0x3e37f7(_0x1fd9b0, _0x173757) < 150 ? _0x1fd9b0[_0x57f7e4.opacity] = Math.max(_0x1fd9b0[_0x57f7e4.opacity] - _0xcdfe98, 0.3) : _0x1fd9b0[_0x57f7e4.opacity] = Math.min(_0x1fd9b0[_0x57f7e4.opacity] + _0xcdfe98, 1);
          _0x58f3cd = _0x507512.globalAlpha, _0x507512.globalAlpha *= _0x1fd9b0[_0x57f7e4.opacity];
        }
        _0x373076(_0x507512, _0x5244a1, _0x5244a1.width / 2 + _0x311938, _0x5244a1.height / 2 + _0x4dcac4, -_0x5244a1.width, -_0x5244a1.height), _0x58f3cd != -1 && (_0x507512.globalAlpha = _0x58f3cd), _0x507512.restore();
      }
      function _0x5750a6(_0x4ad205) {
        _0x507512.save(), _0x507512.translate(_0x3b2ae4.WUF.x + _0x4ad205.x, _0x3b2ae4.WUF.y + _0x4ad205.y), _0x507512.rotate(_0x4ad205.angle);
        let _0x26ff3a, _0x22ab66;
        if (_0x4ad205[_0x57f7e4.hit][_0x57f7e4.update]) {
          _0x4ad205[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.update]() && _0x4ad205[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.o] == ![] && (_0x4ad205[_0x57f7e4.hit][_0x57f7e4.update] = ![]);
          let _0x1397a0 = _0xcdfe98 * ((1 - _0x4ad205[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.v]) * 600);
          _0x26ff3a = _0x1397a0 * Math.sin(_0x4ad205[_0x57f7e4.hit].angle - _0x4ad205.angle), _0x22ab66 = Math.cos(_0x4ad205[_0x57f7e4.hit].angle - _0x4ad205.angle) * _0x1397a0;
        } else _0x26ff3a = 0, _0x22ab66 = 0;
        let _0x2f4e4b;
        switch (_0x4ad205.type) {
          case EntityIDs.SPIKE:
            _0x2f4e4b = [_0x58c261.WOOD_SPIKE_ALLY, _0x58c261.WOOD_SPIKE_ENEMY];
            break;
          case EntityIDs.STONE_SPIKE:
            _0x2f4e4b = [_0x58c261.STONE_SPIKE_ALLY, _0x58c261.STONE_SPIKE_ENEMY];
            break;
          case EntityIDs.GOLD_SPIKE:
            _0x2f4e4b = [_0x58c261.GOLD_SPIKE_ALLY, _0x58c261.GOLD_SPIKE_ENEMY];
            break;
          case EntityIDs.DIAMOND_SPIKE:
            _0x2f4e4b = [_0x58c261.DIAMOND_SPIKE_ALLY, _0x58c261.DIAMOND_SPIKE_ENEMY];
            break;
          case EntityIDs.AMETHYST_SPIKE:
            _0x2f4e4b = [_0x58c261.AMETHYST_SPIKE_ALLY, _0x58c261.AMETHYST_SPIKE_ENEMY];
            break;
          case EntityIDs.REIDITE_SPIKE:
            _0x2f4e4b = [_0x58c261.REIDITE_SPIKE_ALLY, _0x58c261.REIDITE_SPIKE_ENEMY];
            break;
          default:
            break;
        }
        _0x2f4e4b = _0x194c5e(_0x4ad205[_0x57f7e4.pid]) ? _0x2f4e4b[0] : _0x2f4e4b[1], _0x373076(_0x507512, _0x2f4e4b, _0x2f4e4b.width / 2 + _0x26ff3a, _0x2f4e4b.height / 2 + _0x22ab66, -_0x2f4e4b.width, -_0x2f4e4b.height), _0x507512.restore();
      }
      function _0x26f78e(_0x3a0cf7) {
        _0x507512.save(), _0x507512.translate(_0x3b2ae4.WUF.x + _0x3a0cf7.x, _0x3b2ae4.WUF.y + _0x3a0cf7.y), _0x507512.rotate(_0x3a0cf7.angle);
        let _0xec0825, _0x270c5e;
        if (_0x3a0cf7[_0x57f7e4.hit][_0x57f7e4.update]) {
          _0x3a0cf7[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.update]() && _0x3a0cf7[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.o] == ![] && (_0x3a0cf7[_0x57f7e4.hit][_0x57f7e4.update] = ![]);
          let _0xe44dbb = _0xcdfe98 * ((1 - _0x3a0cf7[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.v]) * 600);
          _0xec0825 = _0xe44dbb * Math.sin(_0x3a0cf7[_0x57f7e4.hit].angle - _0x3a0cf7.angle), _0x270c5e = Math.cos(_0x3a0cf7[_0x57f7e4.hit].angle - _0x3a0cf7.angle) * _0xe44dbb;
        } else _0xec0825 = 0, _0x270c5e = 0;
        let _0x39d52e;
        switch (_0x3a0cf7.type) {
          case EntityIDs.WOOD_DOOR:
            _0x39d52e = [_0x58c261.WOOD_DOOR_ALLY, _0x58c261.WOOD_DOOR_ENEMY];
            break;
          case EntityIDs.STONE_DOOR:
            _0x39d52e = [_0x58c261.STONE_DOOR_ALLY, _0x58c261.STONE_DOOR_ENEMY];
            break;
          case EntityIDs.GOLD_DOOR:
            _0x39d52e = [_0x58c261.GOLD_DOOR_ALLY, _0x58c261.GOLD_DOOR_ENEMY];
            break;
          case EntityIDs.DIAMOND_DOOR:
            _0x39d52e = [_0x58c261.DIAMOND_DOOR_ALLY, _0x58c261.DIAMOND_DOOR_ENEMY];
            break;
          case EntityIDs.AMETHYST_DOOR:
            _0x39d52e = [_0x58c261.AMETHYST_DOOR_ALLY, _0x58c261.AMETHYST_DOOR_ENEMY];
            break;
          case EntityIDs.REIDITE_DOOR:
            _0x39d52e = [_0x58c261.REIDITE_DOOR_ALLY, _0x58c261.REIDITE_DOOR_ENEMY];
            break;
          case EntityIDs.WOOD_DOOR_SPIKE:
            _0x39d52e = [_0x58c261.SPIKED_WOOD_DOOR_ALLY, _0x58c261.SPIKED_WOOD_DOOR_ENEMY];
            break;
          case EntityIDs.STONE_DOOR_SPIKE:
            _0x39d52e = [_0x58c261.SPIKED_STONE_DOOR_ALLY, _0x58c261.SPIKED_STONE_DOOR_ENEMY];
            break;
          case EntityIDs.GOLD_DOOR_SPIKE:
            _0x39d52e = [_0x58c261.SPIKED_GOLD_DOOR_ALLY, _0x58c261.SPIKED_GOLD_DOOR_ENEMY];
            break;
          case EntityIDs.DIAMOND_DOOR_SPIKE:
            _0x39d52e = [_0x58c261.SPIKED_DIAMOND_DOOR_ALLY, _0x58c261.SPIKED_DIAMOND_DOOR_ENEMY];
            break;
          case EntityIDs.AMETHYST_DOOR_SPIKE:
            _0x39d52e = [_0x58c261.SPIKED_AMETHYST_DOOR_ALLY, _0x58c261.SPIKED_AMETHYST_DOOR_ENEMY];
            break;
          case EntityIDs.REIDITE_DOOR_SPIKE:
            _0x39d52e = [_0x58c261.SPIKED_REIDITE_DOOR_ALLY, _0x58c261.SPIKED_REIDITE_DOOR_ENEMY];
            break;
          default:
            break;
        }
        _0x39d52e = _0x194c5e(_0x3a0cf7[_0x57f7e4.pid]) ? _0x39d52e[0] : _0x39d52e[1], _0x373076(_0x507512, _0x39d52e, _0x39d52e.width / 2 + _0xec0825, _0x39d52e.height / 2 + _0x270c5e, -_0x39d52e.width, -_0x39d52e.height), _0x507512.restore();
      }
      function _0x548135(_0x213cb1, _0x16df28) {
        var _0x325b71,
          _0x16df28 = _0x16df28[_0x213cb1];
        const _0x5e01ef = _0x46233c.WTJ.items.find(_0xdceb44 => {
          if (_0xdceb44.name === _0x213cb1) return _0xdceb44;
        });
        let _0x19bd07;
        for (_0x325b71 in _0x5e01ef) {
          if (typeof _0x5e01ef[_0x325b71] == 'number' && _0x325b71 !== 'a' && _0x325b71 !== 'b' && _0x325b71 !== 'id') {
            _0x19bd07 = _0x325b71;
            break;
          }
        }
        return _0x5e01ef[_0x19bd07] = _0x16df28, _0x5e01ef;
      }
      function _0x2801de(_0x317d7f, _0x3403eb) {
        const _0x13fb80 = gameWorld.fast_units[_0x57f7e4.uid];
        if (!_0x13fb80) return;
        const _0x409a5d = _0x3b2ae4.WUF.x,
          _0x3c0306 = _0x3b2ae4.WUF.y;
        for (let _0x31dfc9 = 0; _0x31dfc9 < _0x317d7f.length; ++_0x31dfc9) {
          const _0x12c966 = _0x317d7f[_0x31dfc9];
          _0x507512.save(), _0x507512.strokeStyle = _0x3403eb, _0x507512.lineWidth = 3.5, _0x507512.beginPath(), _0x507512.moveTo(_0x409a5d + _0x13fb80.x, _0x3c0306 + _0x13fb80.y), _0x507512.lineTo(_0x409a5d + _0x12c966.x, _0x3c0306 + _0x12c966.y), _0x507512.stroke(), _0x507512.restore();
        }
      }
      function _0x2be69a() {
        return document.getElementById("chat_block").style.display == "inline-block" || document.getElementById('commandMainBox').style.display == "inline-block";
      }
      function _0x377afe(_0x57a4f3) {
        _0x2dad3 && console.context().log("Join Queued: " + _0x57a4f3 + 'ms');
        return new Promise(_0x1d4292 => _0x4cd684.setTimeout(_0x1d4292, _0x57a4f3));
        o;
      }
      function _0x3cca87(_0x4415d7, _0x21aa1d, _0x204748, _0xe6ac6e, _0xab1405, _0x11a323, _0x3da14d, _0x10f6d2, _0x289c6b, _0x5226a7, _0x177a09 = 0) {
        let _0x15cb21 = document.createElement('canvas'),
          _0x4daf1f = _0x15cb21.getContext('2d');
        _0x11a323 = !_0x11a323 ? 0 : _0x11a323 * _0x4415d7;
        let _0x49fb34, _0x1c6899;
        _0x49fb34 = Math.floor(_0x4415d7 * _0x204748), _0x4daf1f.font = _0x49fb34 + "px Baloo Paaji", _0x4daf1f.lineJoin = "round", _0x10f6d2 = _0x10f6d2 * _0x4415d7;
        let _0x3235c7 = _0x3da14d ? _0x10f6d2 * 2 : 0;
        return _0x289c6b ? _0x1c6899 = Math.min(_0x4daf1f.measureText(_0x21aa1d).width + _0x4415d7 * 2 + _0x3235c7, _0x289c6b) : _0x1c6899 = _0x4daf1f.measureText(_0x21aa1d).width + _0x4415d7 * 2 + _0x3235c7 + _0x177a09 * _0x4415d7 * 2, _0x49fb34 = (_0x49fb34 + _0x11a323 + _0x177a09) * _0x4415d7 + _0x3235c7, _0x15cb21.width = _0x1c6899, _0x15cb21.heigh = _0x49fb34, _0x3da14d && (_0x4daf1f.fillStyle = _0x3da14d, _0x14e8de(_0x4daf1f, 0, 0, _0x1c6899, _0x49fb34, _0x10f6d2 * 2), _0x4daf1f.fill(), _0x4daf1f.translate(_0x10f6d2, _0x10f6d2)), _0x4daf1f.textBaseline = "middle", _0x4daf1f.font = _0x204748 + "px Baloo Paaji", _0x4daf1f.lineJoin = "round", _0xab1405 && (_0x4daf1f.beginPath(), _0x4daf1f.fillStyle = _0xab1405, _0x4daf1f.fillText(_0x21aa1d, 0, _0x49fb34 / 2 + _0x11a323 - _0x3235c7 / 2, _0x1c6899)), _0x4daf1f.beginPath(), _0x5226a7 && (_0x4daf1f.strokeStyle = _0x5226a7, _0x4daf1f.lineWidth = _0x177a09, _0x4daf1f.strokeText(_0x21aa1d, _0x177a09, (_0x49fb34 - _0x3235c7) / 2, _0x1c6899)), _0x4daf1f.fillStyle = _0xe6ac6e, _0x4daf1f.fillText(_0x21aa1d, _0x177a09, (_0x49fb34 - _0x3235c7) / 2, _0x1c6899), _0x15cb21;
      }
      function _0x114157(_0x447281) {
        var _0x2f032e = document.createElement("canvas"),
          _0xda4b42 = _0x2f032e.getContext('2d'),
          _0x5ec49e = _0x447281 * 200,
          _0x4fb9db = _0x447281 * 270,
          _0x446e1d = _0x447281 * 8;
        _0x2f032e.width = _0x5ec49e, _0x2f032e.height = _0x4fb9db + 20, _0xda4b42.beginPath(), _0x14e8de(_0xda4b42, 0, 0, _0x447281 * 200, _0x4fb9db - _0x446e1d, _0x446e1d), _0xda4b42.globalAlpha = 1;
        var _0x3c2e90 = _0x3cca87(_0x447281, "Leaderboard", 25, "#FFF");
        return _0xda4b42.drawImage(_0x3c2e90, (_0x5ec49e - _0x3c2e90.width) / 2, _0x447281 * 5), _0x2f032e;
      }
      function _0x2f8222(_0x5dbb18) {
        if (_0x5dbb18 >= 3600) return (_0x5dbb18 / 3600).toFixed(2) + 'h';
        if (_0x5dbb18 >= 60) return (_0x5dbb18 / 60).toFixed(2) + 'm';
        return _0x5dbb18 + 's';
      }
      function _0x5cd8b5(_0x5a78d6 = 15) {
        const _0xb2ce4a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let _0x415e52 = '';
        for (let _0x5ee86a = 0; _0x5ee86a < _0x5a78d6; _0x5ee86a++) {
          const _0x284754 = Math.floor(Math.random() * _0xb2ce4a.length);
          _0x415e52 += _0xb2ce4a[_0x284754];
        }
        return _0x415e52;
      }
      function _0xeb3011(_0x4cd200) {
        if (typeof _0x4cd200 != "number") return '0';
        if (_0x4cd200 >= 10000) {
          var _0x5e9b69 = Math.floor(Math.log10(_0x4cd200)) - 2,
            _0x5e9b69 = Math.max(0, 3 - _0x5e9b69),
            _0x5e442e = Math.floor(_0x4cd200 / 1000).toString();
          if (_0x5e9b69) {
            for (var _0x6de3aa = (_0x5e442e += '.' + (_0x4cd200 % 1000 / 1000).toString().substring(2).substring(0, _0x5e9b69)).length - 1, _0x5bf59b = 0; _0x6de3aa > 0 && _0x5e442e[_0x6de3aa] == '0'; _0x6de3aa--) {
              _0x5bf59b++;
            }
            (_0x5e442e = _0x5e442e.substring(0, _0x5e442e.length - _0x5bf59b))[_0x5e442e.length - 1] == '.' && (_0x5e442e = _0x5e442e.substring(0, _0x5e442e.length - 1));
          }
          return _0x5e442e += 'k';
        }
        return _0x4cd200.toString();
      }
      function _0x19b8d5() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        for (let _0x5e616a = 0, _0x4f35ea = [...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_STONE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_GOLD], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_DIAMOND], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_AMETHYST], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_REIDITE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_EMERALD], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_COPPER], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_IRON], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_TOPAZ], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_SAPPHIRE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_JADE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_RUBY], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_COAL], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_AQUAMARINE]], _0x276ef2 = _0x4f35ea.length; _0x5e616a < _0x276ef2; _0x5e616a++) {
          let _0x4a09d1 = _0x4f35ea[_0x5e616a];
          _0x4a09d1[_0x57f7e4.update]();
        }
        for (let _0x17cda7 = 0, _0x305f40 = gameWorld.units[EntityIDs.BREAD_OVEN], _0xe0b066 = _0x305f40.length; _0x17cda7 < _0xe0b066; _0x17cda7++) {
          let _0x155ec0 = _0x305f40[_0x17cda7];
          _0x155ec0[_0x57f7e4.update]();
        }
        for (let _0x22293f = 0, _0x3a4a46 = gameWorld.units[EntityIDs.TOTEM], _0x5e7304 = _0x3a4a46.length; _0x22293f < _0x5e7304; _0x22293f++) {
          let _0xb7c375 = _0x3a4a46[_0x22293f];
          _0xb7c375[_0x57f7e4.update]();
        }
        for (let _0x39ce48 = 0, _0x26a000 = gameWorld.units[EntityIDs.WINDMILL], _0x22bb20 = _0x26a000.length; _0x39ce48 < _0x22bb20; _0x39ce48++) {
          let _0x9c0a9f = _0x26a000[_0x39ce48];
          _0x9c0a9f[_0x57f7e4.update]();
        }
        for (let _0xbe9d74 = 0, _0x3176a7 = gameWorld.units[EntityIDs.FURNACE], _0x23cab7 = _0x3176a7.length; _0xbe9d74 < _0x23cab7; _0xbe9d74++) {
          let _0x3acf9 = _0x3176a7[_0xbe9d74];
          _0x3acf9[_0x57f7e4.update]();
        }
        for (let _0x336add = 0, _0x2da75c = gameWorld.units[EntityIDs.WELL], _0x379b3b = _0x2da75c.length; _0x336add < _0x379b3b; _0x336add++) {
          let _0x2b5f64 = _0x2da75c[_0x336add];
          _0x2b5f64[_0x57f7e4.update]();
        }
        for (let _0xed1a20 = 0, _0x3b11d4 = gameWorld.units[EntityIDs.EMERALD_MACHINE], _0x34a71c = _0x3b11d4.length; _0xed1a20 < _0x34a71c; _0xed1a20++) {
          let _0x241abf = _0x3b11d4[_0xed1a20];
          _0x241abf[_0x57f7e4.update]();
        }
      }
      function _0x2ceebd() {
        !_0x73cd4e.Hidden.active ? (document.getElementById("shop_market").style.setProperty('opacity', Number(_0x73cd4e.menuOpacity)), document.getElementById("option_in_game").style.setProperty("opacity", Number(_0x73cd4e.menuOpacity)), document.getElementById("sure_delete").style.setProperty("opacity", Number(_0x73cd4e.menuOpacity)), document.getElementById('cancel_sure_delete').style.setProperty("opacity", Number(_0x73cd4e.menuOpacity)), document.getElementById("shop_starterkit").style.setProperty("opacity", Number(_0x73cd4e.menuOpacity)), document.getElementById("recipe_craft").style.setProperty("opacity", Number(_0x73cd4e.menuOpacity)), document.getElementById("home_craft").style.setProperty("opacity", Number(_0x73cd4e.menuOpacity)), document.getElementById("chronoquest").style.setProperty('opacity', Number(_0x73cd4e.menuOpacity)), document.getElementById("sign_window").style.setProperty("opacity", Number(_0x73cd4e.menuOpacity)), document.getElementById("team_box").style.setProperty('opacity', Number(_0x73cd4e.menuOpacity))) : (document.getElementById('shop_market').style.setProperty("opacity", 1), document.getElementById("option_in_game").style.setProperty("opacity", 1), document.getElementById("sure_delete").style.setProperty('opacity', 1), document.getElementById("cancel_sure_delete").style.setProperty("opacity", 1), document.getElementById('shop_starterkit').style.setProperty("opacity", 1), document.getElementById("recipe_craft").style.setProperty("opacity", 1), document.getElementById('home_craft').style.setProperty("opacity", 1), document.getElementById("chronoquest").style.setProperty("opacity", 1), document.getElementById("sign_window").style.setProperty("opacity", 1), document.getElementById("team_box").style.setProperty("opacity", 1));
      }
      function _0x53d5e4(_0x3dcc17) {
        _0x507512.save(), _0x507512.globalAlpha = !_0x73cd4e.Hidden.active && _0x2a8f98 ? Number(_0x73cd4e.vehicleOpacity) : 1, _0x3dcc17(), _0x507512.restore();
      }
      const _0x12f339 = {},
        _0x47cc93 = {};
      function _0x2e77bc(_0x25d9bd) {
        if (_0x73cd4e.Hidden.active || !_0x2a8f98) return;
        if (_0x25d9bd[_0x57f7e4.clothe] == _0x44c140.HOOD || _0x25d9bd[_0x57f7e4.clothe] == _0x44c140.WINTER_HOOD || _0x25d9bd[_0x57f7e4.ghost]) {
          _0x507512.save(), _0x507512.translate(_0x3b2ae4.WUF.x + _0x25d9bd.x, _0x3b2ae4.WUF.y + _0x25d9bd.y);
          const _0x38198e = _0x25d9bd[_0x57f7e4.pid],
            _0xcbe5be = Object.values(gameWorld.WTN[_0x38198e])[0],
            _0x128073 = gameWorld.WTN[_0x38198e].level,
            _0x4b012d = '' + _0x38198e + '_' + _0xcbe5be + '',
            _0x23fdb9 = '' + _0x38198e + "_level_" + _0x128073 + '';
          let _0x5d74fd = _0x12f339[_0x4b012d];
          !_0x5d74fd && (_0x5d74fd = _0x3cca87(1, _0xcbe5be, 20, _0x25d9bd[_0x57f7e4.dist_winter] > 0 ? "#187484" : "#FFF", '#ADD8E6', 2, null, null, 300), _0x12f339[_0x4b012d] = _0x5d74fd);
          let _0x4ab827 = Math.floor(-_0x5d74fd.width / 2),
            _0x5012a2 = Math.floor(-_0x5d74fd.height / 2 - 6);
          _0x507512.drawImage(_0x5d74fd, _0x4ab827, _0x5012a2);
          let _0x20cae5 = _0x47cc93[_0x23fdb9];
          !_0x20cae5 && (_0x20cae5 = _0x3cca87(1, '[' + _0x128073 + ']', 20, "#F9E8A2", "#ADD8E6", 2, null, null, 50), _0x47cc93[_0x23fdb9] = _0x20cae5);
          let _0x2d329a = _0x4ab827 + _0x5d74fd.width + 5;
          _0x128073 > 0 && _0x507512.drawImage(_0x20cae5, _0x2d329a, _0x5012a2), _0x507512.restore();
        }
      }
      function _0x192507(_0x4c2b66, _0x43235b, _0x63fb28) {
        if (_0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.PARROT && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.GOLDEN_HEN && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.BABY_DRAGON && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.BABY_LAVA && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.HAWK && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.PLANE && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.NIMBUS) _0x4c2b66[_0x57f7e4.tower] === 0 && (_0x4c2b66[_0x57f7e4.tower_fx] > 0.001 ? (_0x63fb28 = 1 + Math.min(1, Math.max(_0x4c2b66[_0x57f7e4.tower_fx], 0) / 100) * 0.18, _0x507512.save(), _0x507512.scale(_0x63fb28, _0x63fb28), _0x3b2ae4.WUF.x /= _0x63fb28, _0x3b2ae4.WUF.y /= _0x63fb28, _0x4c2b66.x /= _0x63fb28, _0x4c2b66.y /= _0x63fb28, _0x4c2b66.r.x /= _0x63fb28, _0x4c2b66.r.y /= _0x63fb28, _0x43235b(), _0x3b2ae4.WUF.x *= _0x63fb28, _0x3b2ae4.WUF.y *= _0x63fb28, _0x4c2b66.x *= _0x63fb28, _0x4c2b66.y *= _0x63fb28, _0x4c2b66.r.x *= _0x63fb28, _0x4c2b66.r.y *= _0x63fb28, _0x507512.restore()) : _0x43235b());else _0x4c2b66[_0x57f7e4.speed] <= 180 && (_0x63fb28 = 1 + Math.min(1, Math.max(_0x4c2b66[_0x57f7e4.vehicle_fx5] - 30, 0) / 180) * 0.35, _0x507512.save(), _0x507512.scale(_0x63fb28, _0x63fb28), _0x3b2ae4.WUF.x /= _0x63fb28, _0x3b2ae4.WUF.y /= _0x63fb28, _0x4c2b66.x /= _0x63fb28, _0x4c2b66.y /= _0x63fb28, _0x4c2b66.r.x /= _0x63fb28, _0x4c2b66.r.y /= _0x63fb28, _0x43235b(), _0x3b2ae4.WUF.x *= _0x63fb28, _0x3b2ae4.WUF.y *= _0x63fb28, _0x4c2b66.x *= _0x63fb28, _0x4c2b66.y *= _0x63fb28, _0x4c2b66.r.x *= _0x63fb28, _0x4c2b66.r.y *= _0x63fb28, _0x507512.restore());
        _0x4c2b66[_0x57f7e4.tower] === 1 && (_0x4c2b66[_0x57f7e4.speed] < 180 || _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.PARROT && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.GOLDEN_HEN && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.BABY_DRAGON && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.BABY_LAVA && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.NIMBUS && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.HAWK && _0x4c2b66[_0x57f7e4.vehicle] !== _0x44c140.PLANE) && (_0x63fb28 = 1 + Math.min(1, Math.max(_0x4c2b66[_0x57f7e4.tower_fx], 0) / 100) * 0.18, _0x507512.save(), _0x507512.scale(_0x63fb28, _0x63fb28), _0x3b2ae4.WUF.x /= _0x63fb28, _0x3b2ae4.WUF.y /= _0x63fb28, _0x4c2b66.x /= _0x63fb28, _0x4c2b66.y /= _0x63fb28, _0x4c2b66.r.x /= _0x63fb28, _0x4c2b66.r.y /= _0x63fb28, _0x43235b(), _0x3b2ae4.WUF.x *= _0x63fb28, _0x3b2ae4.WUF.y *= _0x63fb28, _0x4c2b66.x *= _0x63fb28, _0x4c2b66.y *= _0x63fb28, _0x4c2b66.r.x *= _0x63fb28, _0x4c2b66.r.y *= _0x63fb28, _0x507512.restore()), (_0x4c2b66[_0x57f7e4.vehicle] === _0x44c140.PARROT || _0x4c2b66[_0x57f7e4.vehicle] === _0x44c140.GOLDEN_HEN || _0x4c2b66[_0x57f7e4.vehicle] === _0x44c140.BABY_DRAGON || _0x4c2b66[_0x57f7e4.vehicle] === _0x44c140.BABY_LAVA || _0x4c2b66[_0x57f7e4.vehicle] === _0x44c140.NIMBUS || _0x4c2b66[_0x57f7e4.vehicle] === _0x44c140.HAWK || _0x4c2b66[_0x57f7e4.vehicle] === _0x44c140.PLANE) && _0x4c2b66[_0x57f7e4.speed] > 180 && (_0x63fb28 = 1 + Math.min(1, Math.max(_0x4c2b66[_0x57f7e4.vehicle_fx5] - 30, 0) / 180) * 0.35, _0x507512.save(), _0x507512.scale(_0x63fb28, _0x63fb28), _0x3b2ae4.WUF.x /= _0x63fb28, _0x3b2ae4.WUF.y /= _0x63fb28, _0x4c2b66.x /= _0x63fb28, _0x4c2b66.y /= _0x63fb28, _0x4c2b66.r.x /= _0x63fb28, _0x4c2b66.r.y /= _0x63fb28, _0x43235b(), _0x3b2ae4.WUF.x *= _0x63fb28, _0x3b2ae4.WUF.y *= _0x63fb28, _0x4c2b66.x *= _0x63fb28, _0x4c2b66.y *= _0x63fb28, _0x4c2b66.r.x *= _0x63fb28, _0x4c2b66.r.y *= _0x63fb28, _0x507512.restore());
      }
      function _0x1bd3c5(_0x544846, _0x160495, _0x44d295) {
        if (_0x544846[_0x57f7e4.vehicle] !== _0x44c140.PARROT && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.GOLDEN_HEN && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.BABY_DRAGON && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.BABY_LAVA && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.HAWK && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.PLANE && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.NIMBUS) _0x544846[_0x57f7e4.tower] === 0 && (_0x544846[_0x57f7e4.tower_fx] > 0.001 ? (_0x44d295 = 1 + Math.min(1, Math.max(_0x544846[_0x57f7e4.tower_fx], 0) / 100) * 0.18, _0x507512.save(), _0x507512.globalAlpha = Number(_0x73cd4e.vehicleOpacity), _0x507512.scale(_0x44d295, _0x44d295), _0x3b2ae4.WUF.x /= _0x44d295, _0x3b2ae4.WUF.y /= _0x44d295, _0x544846.x /= _0x44d295, _0x544846.y /= _0x44d295, _0x544846.r.x /= _0x44d295, _0x544846.r.y /= _0x44d295, _0x160495(), _0x3b2ae4.WUF.x *= _0x44d295, _0x3b2ae4.WUF.y *= _0x44d295, _0x544846.x *= _0x44d295, _0x544846.y *= _0x44d295, _0x544846.r.x *= _0x44d295, _0x544846.r.y *= _0x44d295, _0x507512.restore()) : _0x160495());else _0x544846[_0x57f7e4.speed] <= 180 && (_0x44d295 = 1 + Math.min(1, Math.max(_0x544846[_0x57f7e4.vehicle_fx5] - 30, 0) / 180) * 0.35, _0x507512.save(), _0x507512.globalAlpha = Number(_0x73cd4e.vehicleOpacity), _0x507512.scale(_0x44d295, _0x44d295), _0x3b2ae4.WUF.x /= _0x44d295, _0x3b2ae4.WUF.y /= _0x44d295, _0x544846.x /= _0x44d295, _0x544846.y /= _0x44d295, _0x544846.r.x /= _0x44d295, _0x544846.r.y /= _0x44d295, _0x160495(), _0x3b2ae4.WUF.x *= _0x44d295, _0x3b2ae4.WUF.y *= _0x44d295, _0x544846.x *= _0x44d295, _0x544846.y *= _0x44d295, _0x544846.r.x *= _0x44d295, _0x544846.r.y *= _0x44d295, _0x507512.restore());
        _0x544846[_0x57f7e4.tower] === 1 && (_0x544846[_0x57f7e4.speed] < 180 || _0x544846[_0x57f7e4.vehicle] !== _0x44c140.PARROT && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.GOLDEN_HEN && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.BABY_DRAGON && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.BABY_LAVA && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.NIMBUS && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.HAWK && _0x544846[_0x57f7e4.vehicle] !== _0x44c140.PLANE) && (_0x44d295 = 1 + Math.min(1, Math.max(_0x544846[_0x57f7e4.tower_fx], 0) / 100) * 0.18, _0x507512.save(), _0x507512.globalAlpha = Number(_0x73cd4e.vehicleOpacity), _0x507512.scale(_0x44d295, _0x44d295), _0x3b2ae4.WUF.x /= _0x44d295, _0x3b2ae4.WUF.y /= _0x44d295, _0x544846.x /= _0x44d295, _0x544846.y /= _0x44d295, _0x544846.r.x /= _0x44d295, _0x544846.r.y /= _0x44d295, _0x160495(), _0x3b2ae4.WUF.x *= _0x44d295, _0x3b2ae4.WUF.y *= _0x44d295, _0x544846.x *= _0x44d295, _0x544846.y *= _0x44d295, _0x544846.r.x *= _0x44d295, _0x544846.r.y *= _0x44d295, _0x507512.restore()), (_0x544846[_0x57f7e4.vehicle] === _0x44c140.PARROT || _0x544846[_0x57f7e4.vehicle] === _0x44c140.GOLDEN_HEN || _0x544846[_0x57f7e4.vehicle] === _0x44c140.BABY_DRAGON || _0x544846[_0x57f7e4.vehicle] === _0x44c140.BABY_LAVA || _0x544846[_0x57f7e4.vehicle] === _0x44c140.NIMBUS || _0x544846[_0x57f7e4.vehicle] === _0x44c140.HAWK || _0x544846[_0x57f7e4.vehicle] === _0x44c140.PLANE) && _0x544846[_0x57f7e4.speed] > 180 && (_0x44d295 = 1 + Math.min(1, Math.max(_0x544846[_0x57f7e4.vehicle_fx5] - 30, 0) / 180) * 0.35, _0x507512.save(), _0x507512.globalAlpha = Number(_0x73cd4e.vehicleOpacity), _0x507512.scale(_0x44d295, _0x44d295), _0x3b2ae4.WUF.x /= _0x44d295, _0x3b2ae4.WUF.y /= _0x44d295, _0x544846.x /= _0x44d295, _0x544846.y /= _0x44d295, _0x544846.r.x /= _0x44d295, _0x544846.r.y /= _0x44d295, _0x160495(), _0x3b2ae4.WUF.x *= _0x44d295, _0x3b2ae4.WUF.y *= _0x44d295, _0x544846.x *= _0x44d295, _0x544846.y *= _0x44d295, _0x544846.r.x *= _0x44d295, _0x544846.r.y *= _0x44d295, _0x507512.restore());
      }
      function _0x4aaf3c(_0x458cbb, _0x480735, _0x384109, _0x2e4018, _0x343223, _0x1d26b3, _0x52b8ac, _0x2b6aeb, _0xdfedfe, _0x23bb1b, _0x395c7a, _0x553715) {
        console.context().log(_0x458cbb, _0x480735, _0x2e4018, _0x343223, _0x1d26b3, _0x52b8ac, _0x2b6aeb, _0xdfedfe, _0x23bb1b, _0x395c7a, _0x553715);
        let _0x4d71f9 = 0;
        for (let _0x27f85b = 0; _0x27f85b < Object.keys(_0x480735).length; _0x27f85b++) {
          const _0x15d751 = Object.keys(_0x480735)[_0x27f85b],
            _0x553f17 = _0x480735[_0x15d751];
          if (_0x480735[_0x2e4018]) return _0x30a5be.push(_0x458cbb + _0x2e4018), _0x2dad3 ? console.context().log("%cAssigned %c\"" + _0x2e4018 + "\"%c To %c\"" + _0x2e4018 + '\x22:', "color: lime;", 'color:\x20yellow;', "color: lime;", "color: yellow;", [_0x480735[_0x2e4018]]) : null;
          if (typeof _0x343223 === 'function' && typeof _0x553f17 === "function" && !_0x30a5be.includes(_0x458cbb + _0x15d751)) {
            let _0x1e1263 = _0x400e7e(_0x553f17.toString());
            if (_0xdfedfe && _0x1e1263 != _0xdfedfe && _0xdfedfe != "any") continue;
            const _0x113f73 = _0x3744d6(_0x553f17.toString());
            let _0x1ca390 = _0x5a7493(_0x113f73);
            (_0x1ca390.toString().length > 300 || !_0x1ca390.length) && (_0x1ca390 = []);
            const _0x322dc4 = _0x1d26b3.some(_0x371795 => _0x1ca390.some(_0x2ba08c => _0x2ba08c.includes(_0x371795))) || _0x1ca390.length && _0x1d26b3[0] == "any",
              _0x17b0fa = _0x226553(_0x553f17.toString()),
              _0x557c38 = _0x553f17.length,
              _0x3cff1e = _0x553f17.toString().includes(_0x23bb1b);
            if ((_0x23bb1b && _0x23bb1b.length && _0x3cff1e || !_0x23bb1b || !_0x23bb1b.length || _0x23bb1b == "none") && (_0x322dc4 || !_0x1d26b3[0] && _0x322dc4 === 0) && (_0x557c38 === _0x52b8ac || _0x52b8ac == "any") && ((_0x2b6aeb || _0x2b6aeb == 0) && _0x17b0fa === _0x2b6aeb || !_0x2b6aeb && _0x2b6aeb != 0 || _0x2b6aeb == "any")) {
              let _0x66fbc0 = 25,
                _0x84e952 = _0x395c7a && _0x553f17 ? Math.abs(_0x395c7a.toString().length - _0x553f17.toString().length) : 0,
                _0x5d5e0c = _0x84e952 ? _0x84e952 > _0x66fbc0 ? 'orange' : "lime" : "lime";
              const _0x4f97a4 = _0x395c7a ? _0x4b7392(_0x395c7a.toString(), _0x553f17.toString()) : 100;
              _0x2dad3 && _0x4f97a4 < 100 && (_0x5d5e0c = "orange");
              _0x2dad3 && console.context().log("%cAssigned %c\"" + _0x2e4018 + "\"%c To %c\"" + _0x15d751 + '\x22:', "color: " + _0x5d5e0c + ';', "color: yellow;", "color: " + _0x5d5e0c + ';', "color: yellow;", _0x84e952 > _0x66fbc0 || _0x4f97a4 < 100 ? _0x553f17.toString() : [_0x553f17], 'L:', _0x1e1263, 'I', _0x27f85b);
              _0x2dad3 && _0x395c7a && _0x84e952 > _0x66fbc0 && _0x4f97a4 == 100 && console.context().log('%c[DIFFERENCE]\x20--------' + "▼".repeat(_0x2e4018.length) + "▼".repeat(_0x15d751.length) + '>', "color: red;", _0x395c7a, 'D:', _0x84e952);
              if (_0x4f97a4 < 100) {
                continue;
                _0x2dad3 && console.context().log("%c[COMPARISON] --------" + "▼".repeat(_0x2e4018.length) + "▼".repeat(_0x15d751.length) + '>', "color: red;", _0x395c7a, 'C:', _0x4f97a4);
              }
              Object.defineProperty(_0x384109, _0x2e4018, {
                'get'() {
                  return _0x480735[_0x15d751];
                },
                'set'(_0xb20e78) {
                  _0x480735[_0x15d751] = _0xb20e78;
                }
              }), _0x30a5be.push(_0x458cbb + _0x15d751), _0x37b62b.push([_0x458cbb + _0x2e4018, _0x27f85b]);
              return;
            }
          }
          if (Array.isArray(_0x553f17) && Array.isArray(_0x343223) && (_0x255b02(_0x553f17) === _0x1d26b3 || _0x1d26b3 == "any" || _0x52b8ac && _0x255b02(_0x553f17) > _0x1d26b3 && _0x255b02(_0x553f17) < _0x52b8ac) && !_0x30a5be.includes(_0x458cbb + _0x15d751)) {
            Object.defineProperty(_0x384109, _0x2e4018, {
              'get'() {
                return _0x480735[_0x15d751];
              },
              'set'(_0x212ba4) {
                _0x480735[_0x15d751] = _0x212ba4;
              }
            });
            _0x2dad3 && console.context().log('%cAssigned\x20%c\x22' + _0x2e4018 + "\"%c To %c\"" + _0x15d751 + '\x22:', "color: lime;", "color: yellow;", "color: lime;", 'color:\x20yellow;', _0x553f17);
            _0x30a5be.push(_0x458cbb + _0x15d751), _0x37b62b.push([_0x458cbb + _0x2e4018, _0x27f85b]);
            return;
          }
          if (!Array.isArray(_0x343223) && typeof _0x343223 === "object" && !Array.isArray(_0x553f17) && typeof _0x553f17 === "object" && _0x30a934(_0x553f17, _0x343223) && (_0x255b02(_0x553f17) === _0x1d26b3 || _0x1d26b3 == 'any') && !_0x30a5be.includes(_0x458cbb + _0x15d751)) {
            Object.defineProperty(_0x384109, _0x2e4018, {
              'get'() {
                return _0x480735[_0x15d751];
              },
              'set'(_0x13739a) {
                _0x480735[_0x15d751] = _0x13739a;
              }
            });
            _0x2dad3 && console.context().log("%cAssigned %c\"" + _0x2e4018 + "\"%c To %c\"" + _0x15d751 + '\x22:', "color: lime;", "color: yellow;", "color: lime;", 'color:\x20yellow;', _0x553f17);
            _0x30a5be.push(_0x458cbb + _0x15d751), _0x37b62b.push([_0x458cbb + _0x2e4018, _0x27f85b]);
            return;
          }
          if (typeof _0x343223 === "boolean" && typeof _0x553f17 === "boolean" && _0x553f17 === _0x343223 && !_0x30a5be.includes(_0x458cbb + _0x15d751)) {
            _0x553715 && _0x4d71f9++;
            if (_0x553715 && _0x553715 !== _0x4d71f9) continue;
            Object.defineProperty(_0x384109, _0x2e4018, {
              'get'() {
                return _0x480735[_0x15d751];
              },
              'set'(_0x42cb02) {
                _0x480735[_0x15d751] = _0x42cb02;
              }
            });
            _0x2dad3 && console.context().log("%cAssigned %c\"" + _0x2e4018 + "\"%c To %c\"" + _0x15d751 + '\x22:', "color: lime;", "color: yellow;", "color: lime;", 'color:\x20yellow;', _0x553f17);
            _0x30a5be.push(_0x458cbb + _0x15d751), _0x37b62b.push([_0x458cbb + _0x2e4018, _0x27f85b]);
            return;
          }
          if (typeof _0x343223 === "number" && typeof _0x553f17 === "number" && _0x553f17 === _0x343223 && !_0x30a5be.includes(_0x458cbb + _0x15d751) && _0x553f17 === _0x1d26b3) {
            _0x553715 && _0x4d71f9++;
            if (_0x553715 && _0x553715 !== _0x4d71f9) continue;
            Object.defineProperty(_0x384109, _0x2e4018, {
              'get'() {
                return _0x480735[_0x15d751];
              },
              'set'(_0x564fc8) {
                _0x480735[_0x15d751] = _0x564fc8;
              }
            });
            _0x2dad3 && console.context().log("%cAssigned %c\"" + _0x2e4018 + "\"%c To %c\"" + _0x15d751 + '\x22:', "color: lime;", "color: yellow;", "color: lime;", "color: yellow;", _0x553f17);
            _0x30a5be.push(_0x458cbb + _0x15d751), _0x37b62b.push([_0x458cbb + _0x2e4018, _0x27f85b]);
            return;
          }
        }
        _0x2dad3 && console.context().log("%cFailed To Assign: %c\"" + _0x2e4018 + "\"%c - No matching property found.", "color: red;", 'color:\x20yellow;', "color: red;");
      }
      function _0x47dd4c(_0x48b148, _0x2680a8, _0x4a7dd4, _0x30c3f6, _0x414702) {
        if (_0x2680a8[_0x30c3f6]) return;
        let _0x1549b2 = 0;
        for (const _0x1d5c72 in _0x2680a8) {
          if (_0x1549b2 === _0x414702) {
            _0x37b62b.push([_0x48b148 + _0x30c3f6, _0x414702]), _0x30a5be.push(_0x48b148 + _0x1d5c72), Object.defineProperty(_0x4a7dd4, _0x30c3f6, {
              'get'() {
                return _0x2680a8[_0x1d5c72];
              },
              'set'(_0x8c092f) {
                _0x2680a8[_0x1d5c72] = _0x8c092f;
              }
            });
            _0x2dad3 && (typeof _0x2680a8[_0x1d5c72] === "function" ? console.context().log('%cAssigned\x20%c\x22' + _0x30c3f6 + "\"%c To %c\"" + _0x1d5c72 + '\x22:', "color: lime;", 'color:\x20yellow;', 'color:\x20lime;', "color: yellow;", [_0x2680a8[_0x1d5c72]], 'L:', _0x400e7e(_0x2680a8[_0x1d5c72].toString()), 'I:', _0x414702) : console.context().log("%cAssigned %c\"" + _0x30c3f6 + "\"%c To %c\"" + _0x1d5c72 + '\x22:', 'color:\x20lime;', "color: yellow;", 'color:\x20lime;', 'color:\x20yellow;', _0x2680a8[_0x1d5c72]));
            return;
          }
          _0x1549b2++;
        }
        _0x2dad3 && console.context().log("%cFailed To Assign: %c\"" + _0x30c3f6 + "\"%c To Index: %c+" + _0x414702 + "%c With Object:", "color: red;", 'color:\x20yellow;', "color: red;", "color: yellow;", "color: red;", _0x2680a8);
      }
      function _0x20af5d(_0x4a0b10) {
        let _0x3c63d0 = new Image();
        return _0x3c63d0.src = _0x4a0b10.toDataURL("image/png"), _0x3c63d0.width = _0x4a0b10.width, _0x3c63d0.height = _0x4a0b10.height, _0x3c63d0.isLoaded = 1, _0x3c63d0;
      }
      function _0x993b50(_0x153bfc, _0x4daf20, _0x4c86e6, _0x515963) {
        _0x4daf20 && (_0x153bfc.fillStyle = _0x4daf20, _0x153bfc.fill()), _0x4c86e6 && (_0x153bfc.lineWidth = _0x515963, _0x153bfc.strokeStyle = _0x4c86e6, _0x153bfc.stroke());
      }
      function _0x14e8de(_0x18acfd, _0x53f80b, _0x6f6a83, _0x1490c4, _0x3023ba, _0x2bfa7f) {
        _0x1490c4 < _0x2bfa7f * 2 && (_0x2bfa7f = _0x1490c4 / 2), _0x3023ba < _0x2bfa7f * 2 && (_0x2bfa7f = _0x3023ba / 2), _0x2bfa7f < 0 && (_0x2bfa7f = 0), _0x18acfd.beginPath(), _0x18acfd.moveTo(_0x53f80b + _0x2bfa7f, _0x6f6a83), _0x18acfd.arcTo(_0x53f80b + _0x1490c4, _0x6f6a83, _0x53f80b + _0x1490c4, _0x6f6a83 + _0x3023ba, _0x2bfa7f), _0x18acfd.arcTo(_0x53f80b + _0x1490c4, _0x6f6a83 + _0x3023ba, _0x53f80b, _0x6f6a83 + _0x3023ba, _0x2bfa7f), _0x18acfd.arcTo(_0x53f80b, _0x6f6a83 + _0x3023ba, _0x53f80b, _0x6f6a83, _0x2bfa7f), _0x18acfd.arcTo(_0x53f80b, _0x6f6a83, _0x53f80b + _0x1490c4, _0x6f6a83, _0x2bfa7f), _0x18acfd.closePath();
      }
      function _0x43be69(_0x1c4a63, _0xc945ac, _0x3d278d) {
        let _0x2e6ad0 = document.createElement("canvas"),
          _0x587788 = _0x2e6ad0.getContext('2d');
        return _0x2e6ad0.width = _0x1c4a63 * 248, _0x2e6ad0.height = _0x1c4a63 * 247, _0x587788.save(), _0x587788.translate(_0x1c4a63 * 69.5, _0x1c4a63 * 145), _0x14e8de(_0x587788, _0x1c4a63 * -8.5, _0x1c4a63 * -63, _0x1c4a63 * 17, _0x1c4a63 * 127, _0x1c4a63 * 1), _0x587788.restore(), _0x993b50(_0x587788, _0x3d278d[0]), _0x587788.save(), _0x587788.translate(_0x1c4a63 * 183, _0x1c4a63 * 145), _0x14e8de(_0x587788, _0x1c4a63 * -8, _0x1c4a63 * -63, _0x1c4a63 * 16, _0x1c4a63 * 126, _0x1c4a63 * 1), _0x587788.restore(), _0x993b50(_0x587788, _0x3d278d[0]), _0x587788.save(), _0x587788.translate(_0x1c4a63 * 123.5, _0x1c4a63 * 62.5), _0x587788.rotate(6.28), _0x14e8de(_0x587788, _0x1c4a63 * -84.5, _0x1c4a63 * -25.5, _0x1c4a63 * 169, _0x1c4a63 * 51, _0x1c4a63 * 5), _0x587788.restore(), _0x993b50(_0x587788, _0x3d278d[2], _0x3d278d[1], _0x1c4a63 * 6), _0x587788.save(), _0x587788.translate(_0x1c4a63 * 123.5, _0x1c4a63 * 118), _0x587788.rotate(6.24), _0x14e8de(_0x587788, _0x1c4a63 * -85.5, _0x1c4a63 * -24, _0x1c4a63 * 169, _0x1c4a63 * 48, _0x1c4a63 * 5), _0x587788.restore(), _0x993b50(_0x587788, _0x3d278d[3], _0x3d278d[1], _0x1c4a63 * 6), _0x587788.save(), _0x587788.translate(_0x1c4a63 * 122, _0x1c4a63 * 177.5), _0x587788.rotate(6.32), _0x14e8de(_0x587788, _0x1c4a63 * -84, _0x1c4a63 * -23.5, _0x1c4a63 * 169, _0x1c4a63 * 47, _0x1c4a63 * 5), _0x587788.restore(), _0x993b50(_0x587788, _0x3d278d[2], _0x3d278d[1], _0x1c4a63 * 6), _0x587788.beginPath(), _0x587788.lineCap = "round", _0x587788.lineJoin = 'round', _0x587788.moveTo(_0x1c4a63 * 37, _0x1c4a63 * 157), _0x587788.bezierCurveTo(_0x1c4a63 * 49, _0x1c4a63 * 160, _0x1c4a63 * 49, _0x1c4a63 * 160, _0x1c4a63 * 61, _0x1c4a63 * 163), _0x587788.bezierCurveTo(_0x1c4a63 * 49.5, _0x1c4a63 * 165.5, _0x1c4a63 * 49.5, _0x1c4a63 * 165.5, _0x1c4a63 * 38, _0x1c4a63 * 168), _0x587788.closePath(), _0x993b50(_0x587788, _0x3d278d[1]), _0x587788.beginPath(), _0x587788.lineCap = "round", _0x587788.lineJoin = "round", _0x587788.moveTo(_0x1c4a63 * 205, _0x1c4a63 * 175), _0x587788.bezierCurveTo(_0x1c4a63 * 192.5, _0x1c4a63 * 180, _0x1c4a63 * 192.5, _0x1c4a63 * 180, _0x1c4a63 * 180, _0x1c4a63 * 185), _0x587788.bezierCurveTo(_0x1c4a63 * 193, _0x1c4a63 * 188, _0x1c4a63 * 193, _0x1c4a63 * 188, _0x1c4a63 * 206, _0x1c4a63 * 191), _0x587788.closePath(), _0x993b50(_0x587788, _0x3d278d[1]), _0x2e6ad0;
      }
      function _0x7d7250(_0x56cc7a, _0x272ab4, _0x998e8e) {
        let _0x2e80d0 = document.createElement('canvas'),
          _0x1a6cb4 = _0x2e80d0.getContext('2d');
        return _0x2e80d0.width = _0x56cc7a * 248, _0x2e80d0.height = _0x56cc7a * 247, _0x1a6cb4.save(), _0x1a6cb4.translate(_0x56cc7a * 182, _0x56cc7a * 120), _0x14e8de(_0x1a6cb4, _0x56cc7a * -8, _0x56cc7a * -67, _0x56cc7a * 16, _0x56cc7a * 134, _0x56cc7a * 1), _0x1a6cb4.restore(), _0x993b50(_0x1a6cb4, _0x998e8e[0]), _0x1a6cb4.save(), _0x1a6cb4.translate(_0x56cc7a * 68.5, _0x56cc7a * 127.5), _0x14e8de(_0x1a6cb4, _0x56cc7a * -8.5, _0x56cc7a * -70.5, _0x56cc7a * 17, _0x56cc7a * 141, _0x56cc7a * 1), _0x1a6cb4.restore(), _0x993b50(_0x1a6cb4, _0x998e8e[0]), _0x1a6cb4.save(), _0x1a6cb4.translate(_0x56cc7a * 123.5, _0x56cc7a * 68), _0x14e8de(_0x1a6cb4, _0x56cc7a * -82.5, _0x56cc7a * -24, _0x56cc7a * 165, _0x56cc7a * 48, _0x56cc7a * 4), _0x1a6cb4.restore(), _0x993b50(_0x1a6cb4, _0x998e8e[2], _0x998e8e[1], _0x56cc7a * 6), _0x1a6cb4.save(), _0x1a6cb4.translate(_0x56cc7a * 123, _0x56cc7a * 179.5), _0x14e8de(_0x1a6cb4, _0x56cc7a * -83, _0x56cc7a * -24.5, _0x56cc7a * 166, _0x56cc7a * 49, _0x56cc7a * 4), _0x1a6cb4.restore(), _0x993b50(_0x1a6cb4, _0x998e8e[2], _0x998e8e[1], _0x56cc7a * 6), _0x1a6cb4.save(), _0x1a6cb4.translate(_0x56cc7a * 123.5, _0x56cc7a * 123.5), _0x1a6cb4.rotate(6.24), _0x14e8de(_0x1a6cb4, _0x56cc7a * -82.5, _0x56cc7a * -24.5, _0x56cc7a * 165, _0x56cc7a * 49, _0x56cc7a * 4), _0x1a6cb4.restore(), _0x993b50(_0x1a6cb4, _0x998e8e[3], _0x998e8e[1], _0x56cc7a * 6), _0x1a6cb4.beginPath(), _0x1a6cb4.lineCap = "round", _0x1a6cb4.lineJoin = "round", _0x1a6cb4.moveTo(_0x56cc7a * 204, _0x56cc7a * 112), _0x1a6cb4.bezierCurveTo(_0x56cc7a * 149, _0x56cc7a * 121.5, _0x56cc7a * 96, _0x56cc7a * 130, _0x56cc7a * 94, _0x56cc7a * 131), _0x1a6cb4.bezierCurveTo(_0x56cc7a * 149.5, _0x56cc7a * 127.5, _0x56cc7a * 149.5, _0x56cc7a * 127.5, _0x56cc7a * 205, _0x56cc7a * 124), _0x1a6cb4.closePath(), _0x993b50(_0x1a6cb4, _0x998e8e[1]), _0x2e80d0;
      }
      function _0x2ec28b(_0x5b0d75, _0x138683, _0xa9480e) {
        let _0x13bc03 = document.createElement("canvas"),
          _0x15c722 = _0x13bc03.getContext('2d');
        return _0x13bc03.width = _0x5b0d75 * 248, _0x13bc03.height = _0x5b0d75 * 247, _0x15c722.save(), _0x15c722.translate(_0x5b0d75 * 183, _0x5b0d75 * 107), _0x14e8de(_0x15c722, _0x5b0d75 * -8, _0x5b0d75 * -70.5, _0x5b0d75 * 16, _0x5b0d75 * 141, _0x5b0d75 * 1), _0x15c722.restore(), _0x993b50(_0x15c722, _0xa9480e[0]), _0x15c722.save(), _0x15c722.translate(_0x5b0d75 * 69.5, _0x5b0d75 * 110), _0x14e8de(_0x15c722, _0x5b0d75 * -8.5, _0x5b0d75 * -71, _0x5b0d75 * 17, _0x5b0d75 * 143, _0x5b0d75 * 1), _0x15c722.restore(), _0x993b50(_0x15c722, _0xa9480e[0]), _0x15c722.save(), _0x15c722.translate(_0x5b0d75 * 123.5, _0x5b0d75 * 181), _0x14e8de(_0x15c722, _0x5b0d75 * -84.5, _0x5b0d75 * -26, _0x5b0d75 * 169, _0x5b0d75 * 52, _0x5b0d75 * 5), _0x15c722.restore(), _0x993b50(_0x15c722, _0xa9480e[2], _0xa9480e[1], _0x5b0d75 * 6), _0x15c722.beginPath(), _0x15c722.lineCap = 'round', _0x15c722.lineJoin = "round", _0x15c722.moveTo(_0x5b0d75 * 41, _0x5b0d75 * 95), _0x15c722.bezierCurveTo(_0x5b0d75 * 105, _0x5b0d75 * 96, _0x5b0d75 * 113, _0x5b0d75 * 99, _0x5b0d75 * 134, _0x5b0d75 * 102), _0x15c722.bezierCurveTo(_0x5b0d75 * 147, _0x5b0d75 * 106, _0x5b0d75 * 173, _0x5b0d75 * 100, _0x5b0d75 * 207, _0x5b0d75 * 105), _0x15c722.bezierCurveTo(_0x5b0d75 * 210, _0x5b0d75 * 105, _0x5b0d75 * 207, _0x5b0d75 * 140, _0x5b0d75 * 207, _0x5b0d75 * 154), _0x15c722.bezierCurveTo(_0x5b0d75 * 123.5, _0x5b0d75 * 151.5, _0x5b0d75 * 123.5, _0x5b0d75 * 151.5, _0x5b0d75 * 40, _0x5b0d75 * 149), _0x15c722.bezierCurveTo(_0x5b0d75 * 37, _0x5b0d75 * 145, _0x5b0d75 * 39, _0x5b0d75 * 95, _0x5b0d75 * 41, _0x5b0d75 * 96), _0x15c722.closePath(), _0x993b50(_0x15c722, _0xa9480e[2], _0xa9480e[1], _0x5b0d75 * 6), _0x15c722.beginPath(), _0x15c722.lineCap = "round", _0x15c722.lineJoin = "round", _0x15c722.moveTo(_0x5b0d75 * 68, _0x5b0d75 * 75), _0x15c722.bezierCurveTo(_0x5b0d75 * 54, _0x5b0d75 * 72.5, _0x5b0d75 * 54, _0x5b0d75 * 72.5, _0x5b0d75 * 40, _0x5b0d75 * 70), _0x15c722.bezierCurveTo(_0x5b0d75 * 38, _0x5b0d75 * 46, _0x5b0d75 * 40, _0x5b0d75 * 46, _0x5b0d75 * 53, _0x5b0d75 * 46), _0x15c722.bezierCurveTo(_0x5b0d75 * 201, _0x5b0d75 * 41, _0x5b0d75 * 201, _0x5b0d75 * 41, _0x5b0d75 * 201, _0x5b0d75 * 42), _0x15c722.bezierCurveTo(_0x5b0d75 * 211, _0x5b0d75 * 40, _0x5b0d75 * 208, _0x5b0d75 * 53, _0x5b0d75 * 208, _0x5b0d75 * 72), _0x15c722.bezierCurveTo(_0x5b0d75 * 209, _0x5b0d75 * 91, _0x5b0d75 * 210, _0x5b0d75 * 96, _0x5b0d75 * 194, _0x5b0d75 * 94), _0x15c722.bezierCurveTo(_0x5b0d75 * 119, _0x5b0d75 * 97, _0x5b0d75 * 119, _0x5b0d75 * 97, _0x5b0d75 * 44, _0x5b0d75 * 100), _0x15c722.bezierCurveTo(_0x5b0d75 * 39, _0x5b0d75 * 99, _0x5b0d75 * 40, _0x5b0d75 * 96, _0x5b0d75 * 40, _0x5b0d75 * 80), _0x15c722.bezierCurveTo(_0x5b0d75 * 54, _0x5b0d75 * 77.5, _0x5b0d75 * 54, _0x5b0d75 * 77.5, _0x5b0d75 * 68, _0x5b0d75 * 75), _0x15c722.closePath(), _0x993b50(_0x15c722, _0xa9480e[3], _0xa9480e[1], _0x5b0d75 * 6), _0x13bc03;
      }
      function _0x3df2a8(_0x569cd2, _0x2927ac, _0x240909) {
        let _0x3261d7 = document.createElement("canvas"),
          _0x4caf16 = _0x3261d7.getContext('2d');
        return _0x3261d7.width = _0x569cd2 * 248, _0x3261d7.height = _0x569cd2 * 247, _0x4caf16.save(), _0x4caf16.translate(_0x569cd2 * 123.5, _0x569cd2 * 62.5), _0x4caf16.rotate(6.28), _0x4caf16.rect(_0x569cd2 * -84.5, _0x569cd2 * -25.5, _0x569cd2 * 169, _0x569cd2 * 169), _0x4caf16.restore(), _0x993b50(_0x4caf16, _0x240909[2]), _0x3261d7;
      }
      function _0x5d811b() {
        _0x58c261.ROOF = [[], [], [], []], _0x58c261.ROOF[0][0] = _0x20af5d(_0x43be69(0.59, !![], ["#0d1b1c", "#44301b", "#57442a", "#523e26"])), _0x58c261.ROOF[0][1] = _0x20af5d(_0x43be69(0.59, !![], ['#0c0c0d', '#062124', "#10373d", "#0f3333"])), _0x58c261.ROOF[1][0] = _0x20af5d(_0x7d7250(0.59, !![], ["#0d1b1c", '#44301b', "#57442a", '#523e26'])), _0x58c261.ROOF[1][1] = _0x20af5d(_0x7d7250(0.59, !![], ['#0c0c0d', '#062124', "#10373d", '#0f3333'])), _0x58c261.ROOF[2][0] = _0x20af5d(_0x2ec28b(0.59, !![], ["#0d1b1c", "#44301b", '#57442a', "#523e26"])), _0x58c261.ROOF[2][1] = _0x20af5d(_0x2ec28b(0.59, !![], ['#0c0c0d', '#062124', '#10373d', "#0f3333"])), _0x58c261.ROOF[3][0] = _0x20af5d(_0x3df2a8(0.59, !![], ["#0d1b1c", "#57442a", "#57442a", '#523e26'])), _0x58c261.ROOF[3][1] = _0x20af5d(_0x3df2a8(0.59, !![], ["#0c0c0d", "#10373d", "#10373d", "#0f3333"]));
      }
      _0x5d811b();
      function _0x414c9a(_0x5812d5, _0x348d05, _0x4733b5, _0x243bc8) {
        _0x5812d5.beginPath(), _0x5812d5.arc(_0x348d05, _0x4733b5, _0x243bc8, 0, Math.PI * 2);
      }
      function _0x20af5d(_0x5df74d) {
        var _0x404eee = new Image();
        return _0x404eee.src = _0x5df74d.toDataURL("image/png"), _0x404eee.width = _0x5df74d.width, _0x404eee.height = _0x5df74d.height, _0x404eee.isLoaded = 1, _0x404eee;
      }
      function _0x569264() {
        _0x53166f.websocket !== _0x357299 && _0x53166f.websocket && (_0x357299 && _0x357299.close(), _0x54270a = _0x53166f.websocket.onopen.bind(_0x53166f.websocket), _0x35c51b = _0x53166f.websocket.send.bind(_0x53166f.websocket), _0x5e72c8 = _0x53166f.websocket.close.bind(_0x53166f.websocket), _0x357299 = _0x53166f.websocket, _0x53166f.websocket.close = function (_0x24f8e4) {
          !_0x2a8f98 && _0x53166f.websocket.readyState === 1 && _0x5e72c8();
        }, _0x53166f.websocket.onclose = function (_0x29105d) {
          _0x43966e && _0x46233c.WTG(_0x43966e), _0xc6e4ef = {}, _0x2a8f98 = 0, _0x2b2f75 = ![], _0x2eb52a = ![], _0x517eda.waiting = ![], _0x5e7c97 = ![];
        }, _0x53166f.websocket.onopen = function () {
          _0x5e7c97 = ![], _0xd0ee7a = !![], _0x3a4970 = 0, _0x3bc407 = _0x73cd4e.Aimbot.active, _0x97a36e = _0x73cd4e.AutoFarm.active, _0x3395bf = _0x73cd4e.AutoSpike.active, _0x7b38a2 = _0x73cd4e.AutoCraft.active, _0x39ab1c = _0x73cd4e.AutoRecycle.active, _0x2df435 = _0x73cd4e.AutoTotem.active, _0x24c604 = _0x40b9f1, _0x3c4536 = _0x73cd4e.AutoFire.active, _0x477b40 = _0x73cd4e.AutoBuild.active, _0xbe3a39 = _0x73cd4e.AutoSteal.active, _0x1225af = _0x73cd4e.SmartCraft.active, _0xe2a98a = _0x73cd4e.AutoSeed.active, _0x5b218a = _0x73cd4e.AutoEmerald.active, _0x73cd4e.Aimbot.active = ![], _0x73cd4e.AutoFarm.active = ![], _0x73cd4e.AutoSpike.active = ![], _0x73cd4e.AutoCraft.active = ![], _0x73cd4e.AutoRecycle.active = ![], _0x73cd4e.AutoTotem.active = ![], _0x40b9f1 = ![], _0x73cd4e.AutoFire.active = ![], _0x73cd4e.AutoBuild.active = ![], _0x73cd4e.AutoSteal.active = ![], _0x73cd4e.SmartCraft.active = ![], _0x73cd4e.AutoSeed.active = ![], _0x73cd4e.AutoEmerald.active = ![], _0x54270a();
        }, _0x53166f.websocket.send = function (_0x35d4dc) {
          if (_0x53166f.websocket.readyState !== 1 || _0x45d552) return;
          if (_0x2eb52a && (_0x4e5e95.build || _0x4e5e95.build == 0) && typeof _0x35d4dc === "string" && JSON.parse(_0x35d4dc)[0] != _0x4e5e95.camera && JSON.parse(_0x35d4dc)[0] != _0x4e5e95.build) return _0x35c51b(_0x35d4dc);
          if (typeof _0x35d4dc === "string") {
            let _0x86e08e = JSON.parse(_0x35d4dc);
            if (!_0x2a8f98 && _0x86e08e[0] != _0x45020e.WTM.input.value) return;else _0x2a8f98 = !![];
            !_0x4e5e95.camera && _0x4e5e95.camera != 0 && _0x86e08e && _0x86e08e.length == 3 && (_0x4e5e95.camera = _0x86e08e[0]);
            if (!_0x4e5e95.build && _0x4e5e95.build != 0) {
              if (_0x86e08e) {
                if (_0x86e08e.length == 4) {
                  _0x4e5e95.build = _0x86e08e[0];
                  return;
                }
              }
            }
            switch (_0x86e08e[0]) {
              case _0x4e5e95.build:
                _0xfb8a29 = _0x86e08e[1];
                if (_0x86e08e[1] === _0x44c140.TOTEM) {
                  let _0x5615ac = gameWorld.fast_units[_0x57f7e4.uid];
                  _0x73cd4e.totemOnMap.x = _0x5615ac.x / (gameWorld.__NW__ * 100), _0x73cd4e.totemOnMap.y = _0x5615ac.y / (gameWorld.__NH__ * 100);
                }
                ;
                _0x35c51b(JSON.stringify(_0x86e08e));
                break;
              case _0x4e5e95.camera:
                if (_0x53166f.websocket.readyState !== 1 || !_0x2eb52a) return;
                !_0x4e5e95.build && _0x4e5e95.build != 0 && _0x53166f.WQP();
                let _0xead30e = gameWorld.fast_units[_0x57f7e4.uid];
                _0x73cd4e.increasedZoom = 'Off';
                if (_0xead30e && _0xead30e.x && _0xead30e.y && !_0x5e7c97 && devicePixelRatio <= 0.6 && _0x73cd4e.increasedZoom == 'Auto') {
                  _0x5e7c97 = !![];
                  function _0x27d420() {
                    _0x17b401 = !![];
                    let _0x4c3caf = 0,
                      _0x34de99 = _0x4cd684.setInterval(() => {
                        if (_0x73cd4e.increasedZoom == "Off" || devicePixelRatio > 0.6 && _0x73cd4e.increasedZoom == "Auto") {
                          _0x5e7c97 = ![];
                          _0x34de99 && _0x4cd684.clearInterval(_0x34de99);
                          return;
                        }
                        let _0x4166da = gameWorld.fast_units[_0x57f7e4.uid];
                        if (!_0x4166da) {
                          _0x5e7c97 = ![], _0x17b401 = ![];
                          return;
                        }
                        _0x4c3caf >= 4 ? _0x4c3caf = 1 : _0x4c3caf += 1, _0x86e08e[1] = _0x4166da.x - (_0x4c3caf == 1 || _0x4c3caf == 4 ? 2100 : 0), _0x86e08e[2] = _0x4166da.y - (_0x4c3caf == 1 || _0x4c3caf == 2 ? 1400 : 0), _0x35c51b(JSON.stringify(_0x86e08e));
                      }, 250);
                  }
                  _0x27d420();
                } else {
                  let _0x3e4328 = gameWorld.fast_units[_0x57f7e4.uid];
                  if (_0x3e4328 && Math.floor(_0x3e4328.x / 100) <= 15) _0x86e08e[1] += 200, _0x86e08e[2] += 180;else _0x3e4328 && _0xbce881.width - Math.floor(_0x3e4328.x / 100) <= 15 ? (_0x86e08e[1] += 400, _0x86e08e[2] += 180) : (_0x86e08e[1] += 300, _0x86e08e[2] += 180);
                  return _0x35c51b(JSON.stringify(_0x86e08e));
                }
                return;
              case _0x45020e.WTM.input.value:
                _0x2a8f98 = 1, _0x2eb52a = !![], _0x86e08e[1] = 3840, _0x86e08e[2] = 2160, _0x86e08e[4] = _0x73cd4e.localToken.Token, _0x86e08e[5] = _0x73cd4e.localToken.TokenID, _0x73cd4e.Aimbot.active = _0x3bc407, _0x73cd4e.AutoFarm.active = _0x97a36e, _0x73cd4e.AutoSpike.active = _0x3395bf, _0x73cd4e.AutoCraft.active = _0x7b38a2, _0x73cd4e.AutoRecycle.active = _0x39ab1c, _0x73cd4e.AutoTotem.active = _0x2df435, _0x40b9f1 = _0x24c604, _0x73cd4e.AutoFire.active = _0x3c4536, _0x73cd4e.AutoBuild.active = _0x477b40, _0x73cd4e.AutoSteal.active = _0xbe3a39, _0x73cd4e.SmartCraft.active = _0x1225af, _0x73cd4e.AutoSeed.active = _0xe2a98a, _0x73cd4e.AutoEmerald.active = _0x5b218a;
                _0x2dad3 && console.context().log("Spawn Packet", _0x86e08e);
                return _0x35c51b(JSON.stringify(_0x86e08e));
              case 16:
                console.context().log(_0x86e08e);
                return _0x35c51b(JSON.stringify(_0x86e08e));
              default:
                return _0x35c51b(_0x35d4dc);
            }
          } else return _0x35c51b(_0x35d4dc);
        });
      }
      function _0x545a29() {
        const _0x47ade3 = setTimeout;
        setTimeout = function (_0x2d7115, _0x29d458, ..._0x39344b) {
          if (arguments.length === 0) throw new Error('TypeError:\x20Failed\x20to\x20execute\x20\x27setTimeout\x27\x20on\x20\x27Window\x27:\x201\x20argument\x20required,\x20but\x20only\x200\x20present.');
          return _0x29d458 === 33 && !_0x73cd4e.Hidden.active && (_0x29d458 = 0), _0x47ade3(_0x2d7115, _0x29d458, ..._0x39344b);
        }, setTimeout.toString = function () {
          return "setTimeout() { [native code] }";
        };
        let _0x4f7cff;
        setTimeout.toString.toString = (_0x4f7cff = function () {
          return 'function\x20toString()\x20{\x20[native\x20code]\x20}';
        }).toString = _0x4f7cff;
      }
      async function _0x123e88() {
        if (!_0x3cfdcb) for (let _0x123d7d = 0; _0x123d7d < _0x1eec1d.length; _0x123d7d++) {
          (_0x1eec1d[_0x123d7d].connect || _0x1eec1d[_0x123d7d].message || _0x1eec1d[_0x123d7d].ping || _0x1eec1d[_0x123d7d].timeout) && !_0x36ff7a && (_0x36ff7a = _0x1eec1d[_0x123d7d]), (_0x1eec1d[_0x123d7d].w || _0x1eec1d[_0x123d7d].transition) && !_0x977435 && (_0x977435 = _0x1eec1d[_0x123d7d]), (_0x1eec1d[_0x123d7d].waiting || _0x1eec1d[_0x123d7d].buttons || _0x1eec1d[_0x123d7d].unlock) && !_0x517eda && (_0x517eda = _0x1eec1d[_0x123d7d]), (_0x1eec1d[_0x123d7d].alert || _0x1eec1d[_0x123d7d].beta || _0x1eec1d[_0x123d7d].control) && !_0x9cb2d9 && (_0x9cb2d9 = _0x1eec1d[_0x123d7d]), _0x1eec1d[_0x123d7d].options && !_0x1a0282 && (_0x1a0282 = _0x1eec1d[_0x123d7d]);
        }
        if (_0x36ff7a && _0x1a0282 && _0x517eda && _0x977435 && _0x9cb2d9 && !_0x3cfdcb && document.defaultView.js_beautify) {
          _0x517eda.waiting = ![];
          let _0xd8a35 = performance.now();
          _0x3cfdcb = !![];
          _0x50734b && _0x4cd684.clearInterval(_0x50734b);
          _0x2dad3 && console.context().log("%cCLIENT", "color: blue; font-size: 18px;");
          _0x47dd4c("client", _0x36ff7a, _0x53166f, "websocket", 0), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WRZ", function () {}, [], 0, 3, 'any', "waiting"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, 'WSA', function () {}, [], 1, 0, 3, "none", "function(bandage){hiddenUser.bandage=bandage;}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSB", function () {}, [], 1, 0, 3, "none", 'function(blizzard){hiddenUser.blizzard=blizzard;}'), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSC", function () {}, [], 1, 0, 3, "none", "function(msg){this.new_alert(msg);}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSD", function () {}, [], 1, 0, 4, "none", "function(id){hiddenUser.auto_feed.delay=0;hiddenUser.craft.do_recycle(id);}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSE", function () {}, [], 1, 0, 4, "none", "function(id){hiddenUser.auto_feed.delay=0;hiddenUser.craft.do_craft(id);}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSF", function () {}, ['|'], 1, 0, 18, "none", 'function(msg){let\x20id=msg[1];let\x20players=hiddenWorld.players;players[id].nickname=msg[2];players[id].skin=msg[3];players[id].accessory=msg[4];players[id].baglook=msg[5];players[id].book=msg[6];players[id].crate=msg[7];players[id].dead=msg[8];players[id].level=msg[9];players[id].score=0;players[id].ldb_label=null;players[id].label=null;players[id].label_winter=null;players[id].alive=true;if(SHOW_ID===1)players[id].nickname+=\x22|\x22+id;}'), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSG", function () {}, [], 0, 0, 3, "stringify", "function(){this.socket[SENDWORD](WINDOW1[JSONWORD1].stringify([11]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSH", function () {}, [], 0, 0, 3, 'EMPTY', "function(){this.new_alert(LANG[TEXT.EMPTY]);}"), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WSI", function () {}, [], 1, 0, 4, "stringify", "function(id){this.socket[SENDWORD](WINDOW3[JSONWORD7].stringify([21,id]));hiddenUser.shop.open=false;}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSJ", function () {}, [], 7, 0, 9, "none", "function(life,food,cold,thirst,oxygen,warm,bandage){hiddenUser.gauges.l=life/100;hiddenUser.gauges.h=food/100;hiddenUser.gauges.c=cold/100;hiddenUser.gauges.t=thirst/100;hiddenUser.gauges.o=oxygen/100;hiddenUser.gauges.wa=warm/100;hiddenUser.bandage=bandage;}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSK", function () {}, [], 1, 0, 5, "none", "function(d){hiddenWorld.time=d;hiddenWorld.transition=true;audio.transition=1;}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, 'WSL', function () {}, [], 1, 0, 4, 'mode', "function(id){if(hiddenWorld.mode==WORLD.MODE_HUNGER_GAMES&&hiddenWorld.players[id].nickname!==\"spectator\")this.new_alert(hiddenWorld.players[id].nickname+LANG[TEXT.DEAD]);hiddenWorld.players[id].alive=false;}"), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WSM", function () {}, [], 1, 0, 4, "Uint16Array", "function(data){let ui16=new Uint16Array(data);player.cam.change(ui16[1],ui16[2]);}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, 'WSN', function () {}, [], 1, 0, 4, 'Uint16Array', "function(data){let ui16=new Uint16Array(data);hiddenUser.cam.change(ui16[1],ui16[2]);}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSO", function () {}, [], 0, 0, 3, 'stringify', "function(){this.socket[SENDWORD](WINDOW2[JSONWORD2].stringify([17,hiddenUser.resurrection.pid,hiddenUser.resurrection.iid,]));}"), _0x4aaf3c('client', _0x36ff7a, _0x53166f, 'WSP', function () {}, [], 2, 0, 3, "stringify", "function(windmill,n){this.socket[SENDWORD](WINDOW2[JSONWORD4].stringify([22,n,windmill.pid,windmill.iid]));}"), _0x47dd4c('client', _0x36ff7a, _0x53166f, "WSR", _0x4d0bf5('client', "WSP", _0x37b62b) + 1), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WSS", function () {}, [], 1, 0, 3, 'stringify', "function(bread_oven){this.socket[SENDWORD](WINDOW5[JSONWORD5].stringify([26,bread_oven.pid,bread_oven.iid]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSQ", function () {}, [], 1, 0, 3, "stringify", "function(quest){this.socket[SENDWORD](WINDOW5[JSONWORD8].stringify([27,quest]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WST", function () {}, [], 1, 0, 3, "stringify", "function(well){this.socket[SENDWORD](WINDOW4[JSONWORD2].stringify([30,well.pid,well.iid]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSU", function () {}, [], 2, 0, 3, "stringify", "function(extractor,n){this.socket[SENDWORD](WINDOW3[JSONWORD5].stringify([38,n,extractor.pid,extractor.iid,extractor.type,]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, 'WSV', function () {}, [], 2, 0, 3, 'stringify', "function (furnace,n) {this.socket[SENDWORD]( WINDOW3[JSONWORD5].stringify([12,n,furnace.pid,furnace.iid]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSW", function () {}, [], 3, 0, 3, 'stringify', "function(chest,id,n){this.socket[SENDWORD](WINDOW4[JSONWORD4].stringify([8,id,n,chest.pid,chest.iid]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSX", function () {}, [], 1, 0, 3, 'stringify', 'function(extractor){this.socket[SENDWORD](WINDOW5[JSONWORD5].stringify([12,extractor.pid,extractor.iid,extractor.type,]));}'), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WSY", function () {}, [], 1, 0, 3, "stringify", 'function(windmill){this.socket[SENDWORD](WINDOW5[JSONWORD5].stringify([23,\x20windmill.pid,\x20windmill.iid]));}'), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WSZ", function () {}, [], 1, 0, 3, 'stringify', "function(chest){this.socket[SENDWORD](WINDOW5[JSONWORD5].stringify([9, chest.pid, chest.iid]));}"), _0x4aaf3c('client', _0x36ff7a, _0x53166f, 'WQA', function () {}, [], 1, 0, 3, 'stringify', "function(chest){this.socket[SENDWORD](WINDOW6[JSONWORD6].stringify([15,chest.pid,chest.iid]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQB", function () {}, [], 1, 0, 3, 'stringify', "function(chest){this.socket[SENDWORD](WINDOW7[JSONWORD7].stringify([16,chest.iid]));}"), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WQC", function () {}, [], 1, 0, 3, "stringify", "function(kick){_this.socket[SENDWORD](WINDOW8[JSONWORD8].stringify([20,hiddenUser.totem.id,hiddenUser.team[kick]]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQD", function () {}, [], 0, 0, 3, 'stringify', "function(){_this.socket[SENDWORD](WINDOW9[JSONWORD9].stringify([18,hiddenUser.totem.pid,hiddenUser.totem.id]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQE", function () {}, [], 0, 0, 3, 'stringify', "function(){_this.socket[SENDWORD](WINDOW10[JSONWORD10].stringify([19]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "units", function () {}, [], 3, 1, "any", 'none'), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WQG", function () {}, [" ...", "... "], 1, 2, 'any', "none"), _0x47dd4c("client", _0x36ff7a, _0x53166f, 'WQH', _0x4d0bf5('client', "WQG", _0x37b62b) - 1), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQI", function () {}, [], 1, 1, 8, "none", 'function(id){if(hiddenUser.inv.max===hiddenUser.inv.can_select.length&&RECIPES[id].id2!==INV.BAG&&hiddenUser.inv.find_item(RECIPES[id].id2)==-1&&!hiddenUser.inv.free_place(RECIPES[id].r)){this.inv_full();return\x200;}this.socket[SENDWORD](WINDOW1[JSONWORD1].stringify([7,id]));return\x201;}'), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQJ", function () {}, [], 0, 0, 8, "none", "function () { hiddenUser.resurrection.open = false; hiddenUser.ghost.enabled = false; hiddenUser.ghost.delay = -1; hiddenUser.ghost.label = null; hiddenUser.ghost.sec = null; hiddenUser.ghost.now = -1; }"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, 'WQK', function () {}, [], 1, 2, 13, "none"), _0x4aaf3c('client', _0x36ff7a, _0x53166f, 'WQL', function () {}, [], 2, 1, 5, 'none', "function(id,n){hiddenUser.craft.preview=-1;hiddenUser.inv.decrease(id,n,hiddenUser.inv.find_item(id));hiddenUser.craft.update();}"), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WQM", function () {}, [], 0, 0, 3, "stringify", "function(){this.socket[SENDWORD](WINDOW2[JSONWORD2].stringify([31]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, 'WQN', function () {}, [], 1, 0, 3, "stringify", 'function(v){this.socket[SENDWORD](WINDOW3[JSONWORD3].stringify([32,v.val,v.id]));}'), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WQO", function () {}, [], 2, 0, 3, "stringify", 'function(id,symbol){this.socket[SENDWORD](WINDOW3[JSONWORD5].stringify([33,id,symbol]));}'), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQP", function () {}, [], 0, 0, 7, "stringify", "function(){let p=hiddenWorld.fast_units[hiddenUser.uid];if(p){let pi2=Math.PI*2;this.socket[SENDWORD](WINDOW3[JSONWORD3].stringify([10,hiddenUser.craft.preview,Math.floor((((p.angle+pi2)%pi2)*255)/pi2),hiddenUser.craft.mode,]));}}"), _0x47dd4c("client", _0x36ff7a, _0x53166f, 'WQR', _0x4d0bf5('client', "WQP", _0x37b62b) + 1), _0x4aaf3c('client', _0x36ff7a, _0x53166f, 'WQS', function () {}, [], 1, 0, 3, "stringify", 'function(id){this.socket[SENDWORD](WINDOW3[JSONWORD1].stringify([6,id]));}'), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WQQ", function () {}, [], 2, 0, 3, "stringify", "function(id,i){this.socket[SENDWORD](WINDOW1[JSONWORD7].stringify([29,id]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQT", function () {}, [], 0, 0, 3, "stringify", "function(){this.socket[SENDWORD](WINDOW2[JSONWORD2].stringify([14]));}"), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WQU", function () {}, [], 1, 0, 4, "stringify", "function(angle) {let pi2=Math.PI*2;this.socket[SENDWORD]( WINDOW3[JSONWORD3].stringify([4,Math.floor((((angle+pi2)%pi2)*255)/pi2),]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQV", function () {}, [], 1, 0, 4, "stringify", "function(angle){let pi2=Math.PI*2;this.socket[SENDWORD](WINDOW3[JSONWORD3].stringify([3,Math.floor((((angle+pi2)%pi2)*255)/pi2),]));}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQW", function () {}, [], 1, 0, 3, 'stringify', "function(move){this.socket[SENDWORD](WINDOW12[JSONWORD12].stringify([2,move]));}"), _0x47dd4c("client", _0x36ff7a, _0x53166f, 'WQX', _0x4d0bf5("client", "WQW", _0x37b62b) + 2), _0x4aaf3c('client', _0x36ff7a, _0x53166f, 'WQY', function () {}, [], 0, 2, 7, "none", 'function(){hiddenUser.reconnect.enabled=true;if(this._current_id!=this.socket._current_id)return;this._current_id++;this.socket.close();hiddenClient.connect();}'), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WQZ", function () {}, ["adsRefresh"], 2, 3, 17, "none"), _0x47dd4c('client', _0x36ff7a, _0x53166f, "WTA", _0x4d0bf5("client", 'WQZ', _0x37b62b) + 1), _0x47dd4c('client', _0x36ff7a, _0x53166f, "WTB", _0x4d0bf5("client", "WTA", _0x37b62b) + 3), _0x4aaf3c('client', _0x36ff7a, _0x53166f, "WTC", function () {}, [], 0, 1, 4, "none", "function(){this.timeout_number=0;this.connect_timeout();}"), _0x4aaf3c("client", _0x36ff7a, _0x53166f, "WTD", function () {}, [], 1, 1, 8, '++');
          _0x2dad3 && console.context().log("%cGAME", 'color:\x20blue;\x20font-size:\x2018px;')
          _0x4aaf3c("game", _0x1a0282, _0x46233c, "WTE", function () {}, [], 0, 29, "any", "options.button"), _0x4aaf3c("game", _0x1a0282, _0x46233c, "WSJ", {
            'translate': {
              'x': 0,
              'y': 0
            },
            'y': 0
          }, 4), _0x4aaf3c('game', _0x1a0282, _0x46233c, 'WTF', [], 350, 500), _0x4aaf3c("game", _0x1a0282, _0x46233c, "WTG", function () {}, ["team_box", "shop_starterkit", "home_craft", 'recipe_craft', 'option_in_game', 'sure_delete', 'cancel_sure_delete', 'chronoquest'], 1, 6), _0x4aaf3c("game", _0x1a0282, _0x46233c, "drawGame", function () {}, [], 0, 1, "any", "none", 'function(){draw_world_with_effect\x20();}'), _0x4aaf3c('game', _0x1a0282, _0x46233c, "WTI", {
            'translate': {
              'x': 0,
              'y': 0
            },
            'focus': function () {}
          }, 4), _0x4aaf3c("game", _0x1a0282, _0x46233c, "WTJ", {
            'open': ![],
            'select': function () {},
            'items': []
          }, 10);
          _0x2dad3 && console.context().log("%cUI", "color: blue; font-size: 18px;");
          _0x4aaf3c('ui', _0x517eda, _0x45020e, 'WTK', function () {}, [], 0, 2, 14, "check_ads"), _0x45020e.WTL = function () {
            return;
          }, _0x4aaf3c('ui', _0x517eda, _0x45020e, "WTM", {
            'id': "any",
            'style': 'any',
            'input': "any",
            'active': 0,
            'position': 0,
            'view': 0,
            'translate': {
              'x': 0,
              'y': 0
            }
          }, 7);
          _0x2dad3 && console.context().log("%cWORLD", "color: blue; font-size: 18px;");
          _0x4aaf3c("world", _0x977435, gameWorld, "WTN", [], 'any'), _0x4aaf3c("world", _0x977435, gameWorld, "units", [], "any"), _0x4aaf3c("world", _0x977435, gameWorld, "fast_units", [], "any"), _0x4d8667(_0x4aaf3c, "world", _0x977435, gameWorld, 'WTP', function () {}, ["any"], 1, 11, "any", 'none').then(() => {
            let _0x20bb93 = gameWorld.WTP.bind(_0x977435);
            gameWorld.WTP = function (_0x280b4a) {
              Object.keys(_0x280b4a).forEach((_0x399741, _0x14b770) => {
                _0x14b770 == 0 && (_0x57f7e4.width = _0x399741);
                _0x14b770 == 1 && (_0x57f7e4.height = _0x399741);
                if (_0x14b770 == 2) {
                  _0xbce881.source = _0x13547e(_0x280b4a[_0x399741]), _0xbce881.width = _0x280b4a[_0x57f7e4.width], _0xbce881.height = _0x280b4a[_0x57f7e4.height];
                  for (let _0x4dc32f = 0; _0x4dc32f < _0x280b4a[_0x57f7e4.width]; _0x4dc32f++) {
                    for (let _0x1515e6 = 0; _0x1515e6 < _0x280b4a[_0x57f7e4.height]; _0x1515e6++) {
                      if (_0x280b4a[_0x399741][_0x1515e6][_0x4dc32f]) {
                        if (_0x280b4a[_0x399741][_0x1515e6][_0x4dc32f].fod) _0x280b4a[_0x399741][_0x1515e6][_0x4dc32f].fod = undefined;else _0x280b4a[_0x399741][_0x1515e6][_0x4dc32f].fo && (_0x280b4a[_0x399741][_0x1515e6][_0x4dc32f].fo = undefined);
                      }
                    }
                  }
                }
                _0x20bb93(_0x280b4a);
              });
            };
          }), _0x47dd4c("world", _0x977435, gameWorld, 'WTR', _0x4d0bf5('world', "WTP", _0x37b62b) + 3), _0x47dd4c("world", _0x977435, gameWorld, 'WTS', _0x4d0bf5("world", "WTR", _0x37b62b) + 1);
          _0x2dad3 && console.context().log('%cUSER', "color: blue; font-size: 18px;");
          _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WSO", {}, 3), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WTQ", {}, 3), _0x4aaf3c('user', _0x9cb2d9, _0x3b2ae4, "WTT", {}, 5), _0x4aaf3c('user', _0x9cb2d9, _0x3b2ae4, "WTU", {}, 7), Object.keys(_0x3b2ae4.WTU).forEach((_0x1daf8f, _0x5e0316) => {
            _0x3b2ae4.WTU[_0x1daf8f] == -1 && (_0x57f7e4.iid = _0x1daf8f);
          }), _0x4aaf3c('user', _0x9cb2d9, _0x3b2ae4, 'WTV', {}, 6), _0x4aaf3c('user', _0x9cb2d9, _0x3b2ae4, 'WTW', {}, 2), _0x4aaf3c('user', _0x9cb2d9, _0x3b2ae4, "WTX", {}, 4), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WQK", {}, 5), _0x47dd4c('userGhost', _0x3b2ae4.WQK, _0x3b2ae4.WQK, 'WTY', 1), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WTZ", {}, 9), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, 'WUA', {
            'rotate': 'any',
            'enabled': "any"
          }, 2), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUB", [], 0), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUC", {}, 5), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUD", {}, 5), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUE", {}, 2), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUF", {}, 22), _0x47dd4c("userCam", _0x3b2ae4.WUF, _0x3b2ae4.WUF, "WUG", 12), _0x47dd4c("userCam", _0x3b2ae4.WUF, _0x3b2ae4.WUF, 'WUH', 13), _0x47dd4c("userCam", _0x3b2ae4.WUF, _0x3b2ae4.WUF, "WUI", 14), _0x47dd4c("userCam", _0x3b2ae4.WUF, _0x3b2ae4.WUF, 'WUJ', 15), _0x47dd4c('userCam', _0x3b2ae4.WUF, _0x3b2ae4.WUF, "WUK", 16), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUL", {}, 6), _0x47dd4c('userControl', _0x3b2ae4.WUL, _0x3b2ae4.WUL, "WUG", 5), _0x4aaf3c('user', _0x9cb2d9, _0x3b2ae4, 'WSJ', {}, 19), _0x47dd4c("userGauges", _0x3b2ae4.WSJ, _0x3b2ae4.WSJ, 'WUM', 0), _0x47dd4c("userGauges", _0x3b2ae4.WSJ, _0x3b2ae4.WSJ, 'WUN', 1), _0x47dd4c("userGauges", _0x3b2ae4.WSJ, _0x3b2ae4.WSJ, "WUO", 2), _0x47dd4c("userGauges", _0x3b2ae4.WSJ, _0x3b2ae4.WSJ, "WUP", 3), _0x47dd4c("userGauges", _0x3b2ae4.WSJ, _0x3b2ae4.WSJ, 'WUR', 4), _0x47dd4c('userGauges', _0x3b2ae4.WSJ, _0x3b2ae4.WSJ, "WUS", 5), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUQ", {
            'translate': {
              'x': 0,
              'y': 0
            },
            'sort': function () {}
          }, 7), _0x4aaf3c('ldb', _0x3b2ae4.WUQ, _0x3b2ae4.WUQ, "WUT", [], 0), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUU", {}, 11), _0x47dd4c("userInv", _0x3b2ae4.WUU, _0x3b2ae4.WUU, "WUV", 3), _0x47dd4c("userInv", _0x3b2ae4.WUU, _0x3b2ae4.WUU, "WUW", 4), _0x47dd4c("userInv", _0x3b2ae4.WUU, _0x3b2ae4.WUU, "WUX", 8), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUY", {
            'enabled': ![],
            'translate': {
              'x': 0,
              'y': 0
            },
            'set': function () {}
          }, "any"), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WUZ", {}, 18), _0x47dd4c('userCraft', _0x3b2ae4.WUZ, _0x3b2ae4.WUZ, "WVA", 3), _0x47dd4c("userCraft", _0x3b2ae4.WUZ, _0x3b2ae4.WUZ, "WVB", 4), _0x47dd4c('userCraft', _0x3b2ae4.WUZ, _0x3b2ae4.WUZ, "WUP", 10), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WVC", {
            'add': function () {}
          }, 5, "any", 'any', "none"), _0x47dd4c('userDesert', _0x3b2ae4.WVC, _0x3b2ae4.WVC, "WVD", 1), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WVE", {
            'add': function () {}
          }, 5, "any", "any", "none"), _0x47dd4c("userWinter", _0x3b2ae4.WVE, _0x3b2ae4.WVE, "WVD", 1), _0x4aaf3c("user", _0x9cb2d9, _0x3b2ae4, "WVF", 0, 0, "any", "any", "any", "any", "any", 4), _0x4aaf3c('user', _0x9cb2d9, _0x3b2ae4, "WVG", ![], ![], 'any', "any", "any", "any", "any", 2), _0x159901 = !![], _0x4cd684.setInterval(_0x569264, 100);
          _0x2dad3 && console.context().log("%cHooks Loaded --> " + (performance.now() - _0xd8a35).toFixed(2) + 'ms', "color: lightblue; font-size: 18px;");
          _0x2ea2af(), _0x198c45 = document.getElementById("game_canvas"), _0x507512 = _0x198c45.getContext('2d'), _0x12d9aa = _0x198c45.width / 2, _0x5786cb = _0x198c45.height / 2, _0x5a3092();
          for (let _0x47dacd in _0x1a0282) {
            if (_0x1a0282[_0x47dacd] && typeof _0x1a0282[_0x47dacd] === "object" && _0x1a0282[_0x47dacd].translate && _0x1a0282[_0x47dacd].translate.x === 0 && _0x1a0282[_0x47dacd].translate.y === 0) for (let _0x1fccfa in _0x1a0282[_0x47dacd]) {
              if (typeof _0x1a0282[_0x47dacd][_0x1fccfa] === "object" && _0x1a0282[_0x47dacd][_0x1fccfa].width === 200 && _0x1a0282[_0x47dacd][_0x1fccfa].height === 290) {
                _0x46233c.Leaderboard = _0x47dacd, _0x46233c.LeaderboardImage = _0x1fccfa;
                break;
              }
            }
          }
          let _0x3fb464 = _0x114157(1);
          _0x1a0282[_0x46233c.Leaderboard][_0x46233c.LeaderboardImage] = _0x3fb464;
          const _0x272c83 = _0x53166f.WQD.bind(_0x36ff7a);
          _0x53166f.WQD = function () {
            let _0x8caa0f = gameWorld.fast_units[_0x57f7e4.uid];
            return _0x73cd4e.totemOnMap.x = _0x8caa0f.x / (gameWorld.__NW__ * 100), _0x73cd4e.totemOnMap.y = _0x8caa0f.y / (gameWorld.__NH__ * 100), _0x272c83.apply(this, arguments);
          };
          const _0x197751 = _0x46233c.WTE.bind(_0x1a0282);
          function _0x2641ab() {
            let _0x398631 = _0x3b2ae4.WUQ,
              _0x2495a1 = _0x398631.WUT,
              _0x25f767 = gameWorld.WTN;
            for (let _0x59bfcc = 0; _0x59bfcc < _0x2495a1.length; _0x59bfcc++) {
              let _0x3d7ea0 = _0x25f767[_0x2495a1[_0x59bfcc]],
                _0x58abce = Object.values(_0x3d7ea0)[0],
                _0x2185da = Object.values(_0x3d7ea0)[13],
                _0xd699be = "blue",
                _0x3b23dd = _0x194c5e(_0x2495a1[_0x59bfcc]);
              if (gameWorld.mode === 1 && _0x58abce === "spectator" || !_0x3b23dd || _0x2495a1[_0x59bfcc] === _0x9cb2d9.id) continue;
              if (gameWorld.mode === 2 && _0x3d7ea0[_0x29c840.skin] === 29) continue;
              gameWorld.mode === 3 && _0x3d7ea0[_0x29c840.skin] === 28 ? _0xd699be = "#800080" : _0xd699be = 'blue', _0x507512.drawImage(_0x3cca87(1.5, '' + (_0x59bfcc + 1), 15, _0xd699be), 168 + _0x3b2ae4.WUY.translate.x, (_0x3b2ae4.WUY.translate.y - 64 + _0x59bfcc * 22) * 1), !_0x3d7ea0.ldb_label && (_0x3d7ea0.ldb_label = _0x3cca87(1.5, _0x58abce, 15, _0xd699be, undefined, undefined, undefined, undefined, 110)), _0x507512.drawImage(_0x3d7ea0.ldb_label, 187 + _0x3b2ae4.WUY.translate.x, (_0x3b2ae4.WUY.translate.y - 64 + _0x59bfcc * 22) * 1), _0x507512.drawImage(_0x3cca87(1.5, _0xeb3011(_0x2185da), 15, _0xd699be), 304 + _0x3b2ae4.WUY.translate.x, (_0x3b2ae4.WUY.translate.y - 64 + _0x59bfcc * 22) * 1);
            }
          }
          _0x46233c.WTE = function () {
            (window.Math.floor.toString() !== 'function\x20floor()\x20{\x20[native\x20code]\x20}' || window.Math.ceil.toString() !== 'function\x20ceil()\x20{\x20[native\x20code]\x20}') && (window.Math.floor = window.Math.floor, window.Math.ceil = window.Math.ceil);
            if (_0x73cd4e.Hidden.active) {
              let _0xddbb66 = gameWorld.fast_units[_0x57f7e4.uid],
                _0x5166ad = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
              _0xddbb66 && _0x5166ad && (_0xddbb66[_0x29c840.skin] != _0x3dcaab && (_0xddbb66[_0x29c840.skin] = _0x3dcaab), _0xddbb66[_0x29c840.bag] != _0x114a1d && (_0xddbb66[_0x29c840.bag] = _0x114a1d), _0xddbb66[_0x29c840.acc] != _0x2179a8 && (_0xddbb66[_0x29c840.acc] = _0x2179a8), _0xddbb66[_0x29c840.book] != _0x4f9f49 && (_0xddbb66[_0x29c840.book] = _0x4f9f49), _0x5166ad[_0x29c840.skin] != _0x3dcaab && (_0x5166ad[_0x29c840.skin] = _0x3dcaab), _0x5166ad[_0x29c840.bag] != _0x114a1d && (_0x5166ad[_0x29c840.bag] = _0x114a1d), _0x5166ad[_0x29c840.acc] != _0x2179a8 && (_0x5166ad[_0x29c840.acc] = _0x2179a8), _0x5166ad[_0x29c840.book] != _0x4f9f49 && (_0x5166ad[_0x29c840.book] = _0x4f9f49));
            } else {
              let _0x22113c = gameWorld.fast_units[_0x57f7e4.uid],
                _0x470023 = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
              _0x22113c && _0x470023 && _0x4b1f89 && (_0x22113c[_0x29c840.skin] != _0x73cd4e.skinChanger.skin && _0x73cd4e.skinChanger.active && (_0x22113c[_0x29c840.skin] = _0x73cd4e.skinChanger.skin), _0x22113c[_0x29c840.bag] != _0x73cd4e.bagChanger.bag && _0x73cd4e.bagChanger.active && (_0x22113c[_0x29c840.bag] = _0x73cd4e.bagChanger.bag), _0x22113c[_0x29c840.acc] != _0x73cd4e.accChanger.acc && _0x73cd4e.accChanger.active && (_0x22113c[_0x29c840.acc] = _0x73cd4e.accChanger.acc), _0x22113c[_0x29c840.book] != _0x73cd4e.bookChanger.book && _0x73cd4e.bookChanger.active && (_0x22113c[_0x29c840.book] = _0x73cd4e.bookChanger.book), _0x470023[_0x29c840.skin] != _0x73cd4e.skinChanger.skin && _0x73cd4e.skinChanger.active && (_0x470023[_0x29c840.skin] = _0x73cd4e.skinChanger.skin), _0x470023[_0x29c840.bag] != _0x73cd4e.bagChanger.bag && _0x73cd4e.bagChanger.active && (_0x470023[_0x29c840.bag] = _0x73cd4e.bagChanger.bag), _0x470023[_0x29c840.acc] != _0x73cd4e.accChanger.acc && _0x73cd4e.accChanger.active && (_0x470023[_0x29c840.acc] = _0x73cd4e.accChanger.acc), _0x470023[_0x29c840.book] != _0x73cd4e.bookChanger.book && _0x73cd4e.bookChanger.active && (_0x470023[_0x29c840.book] = _0x73cd4e.bookChanger.book));
            }
            _0x507512.beginPath();
            let _0x1273aa = _0x3b2ae4.WUY.translate.x;
            _0x14e8de(_0x507512, _0x73cd4e.showLeaderBoardLevels && !_0x73cd4e.Hidden.active ? _0x1273aa + 132 : _0x1273aa + 152, _0x3b2ae4.WUY.translate.y - 95, _0x73cd4e.showLeaderBoardLevels && !_0x73cd4e.Hidden.active ? 220 : 200, 262, 8), _0x507512.globalAlpha = 0.5, _0x993b50(_0x507512, "#1D6055"), _0x507512.globalAlpha = 1, _0x197751.apply(this, arguments);
            
_0x73cd4e.drawLeaderboardAllies && !_0x73cd4e.Hidden.active && _0x2641ab();

// --- ARCT RADAR РЕНДЕР (Рисуем зеленые точки поверх мини-карты) ---
if (window.arctAllies && !_0x73cd4e.Hidden.active && typeof gameWorld !== "undefined" && gameWorld.__NW__) {
    _0x507512.save();
    const _mTx = _0x46233c["WTI"]["translate"].x;
    const _mTy = _0x46233c["WTI"]["translate"].y + (_0x3b2ae4["WUU"].WUW["length"] > 0 ? -120 : -50);
    
    for (let id in window.arctAllies) {
        let p = window.arctAllies[id];
        if (!p.x || !p.y) continue;
        
        let rx = _mTx + (p.x / (gameWorld.__NW__ * 100)) * 193;
        let ry = _mTy + (p.y / (gameWorld.__NH__ * 100)) * 193;
        
        // 1. Рисуем зеленую точку
        _0x507512.fillStyle = "#00FF00";
        _0x507512.beginPath();
        _0x507512.arc(rx, ry, 5, 0, Math.PI * 2);
        _0x507512.fill();
        _0x507512.lineWidth = 1;
        _0x507512.strokeStyle = "#000000";
        _0x507512.stroke();

        // 2. Рисуем никнейм рядом с точкой
        if (p.name) {
            _0x507512.font = "10px 'Baloo Paaji', sans-serif";
            _0x507512.textAlign = "left";
            _0x507512.textBaseline = "middle";
            _0x507512.lineWidth = 2.5;
            _0x507512.strokeStyle = "#000000"; // Черная обводка для читаемости
            _0x507512.fillStyle = "#FFFFFF"; // Белый текст
            _0x507512.strokeText(p.name, rx + 8, ry);
            _0x507512.fillText(p.name, rx + 8, ry);
        }
    }
    _0x507512.restore();
}
// ------------------------------------------------------------------

            const _0x3c2413 = _0x73cd4e.totemOnMap.active && _0x73cd4e.totemOnMap.x != 0 && _0x73cd4e.totemOnMap.y != 0 && !_0x73cd4e.Hidden.active,
              _0x435de1 = _0x73cd4e.deathOnMap.active && _0x73cd4e.deathOnMap.x != 0 && _0x73cd4e.deathOnMap.y != 0 && !_0x73cd4e.Hidden.active;
            if (_0x3c2413 || _0x435de1) {
              _0x507512.save();
              const _0x1b7d94 = _0x3b2ae4.WUU.WUW.length > 0 ? -120 : -50,
                _0x4b935d = {
                  'x': _0x46233c.WTI.translate.x,
                  'y': _0x46233c.WTI.translate.y + _0x1b7d94
                };
              _0x3c2413 && (_0x507512.fillStyle = "blue", _0x414c9a(_0x507512, _0x4b935d.x + _0x73cd4e.totemOnMap.x * 193, _0x4b935d.y + _0x73cd4e.totemOnMap.y * 193, 4), _0x507512.fill());
              _0x435de1 && (_0x507512.fillStyle = "black", _0x414c9a(_0x507512, _0x4b935d.x + _0x73cd4e.deathOnMap.x * 193, _0x4b935d.y + _0x73cd4e.deathOnMap.y * 193, 4), _0x507512.fill());
              if (_0x3b2ae4.WVG) {
                const _0x5d871e = _0x3b2ae4.WUF.WUJ / 2 - 300,
                  _0x586002 = _0x3b2ae4.WUF.WUK / 2 - 300;
                _0x3c2413 && (_0x507512.fillStyle = 'blue', _0x414c9a(_0x507512, _0x5d871e + _0x73cd4e.totemOnMap.x * 600, _0x586002 + _0x73cd4e.totemOnMap.y * 600, 12), _0x507512.fill()), _0x435de1 && (_0x507512.fillStyle = "black", _0x414c9a(_0x507512, _0x5d871e + _0x73cd4e.deathOnMap.x * 600, _0x586002 + _0x73cd4e.deathOnMap.y * 600, 12), _0x507512.fill());
              }
              _0x507512.restore();
            }
          };
          const _0x1216fb = _0x507512.drawImage;
          _0x507512.drawImage = function (..._0x3bc91d) {
            if (_0x3bc91d.length === 0) throw new Error("TypeError: 3 arguments requires, but only 0 present.");
            return _0x73cd4e.Xray.active && _0x57f7e4.update && _0x46233c.WSJ.translate.y !== 0 && _0x46233c.WSJ.translate.x !== 0 && _0x53166f.websocket.readyState === 1 && (this.globalAlpha = _0x73cd4e.Xray.opacity), _0x1216fb.apply(this, _0x3bc91d);
          }, _0x507512.drawImage.toString = function () {
            return "drawImage() { [native code] }";
          };
          let _0x3ac6a9;
          _0x507512.drawImage.toString.toString = (_0x3ac6a9 = function () {
            return "function toString() { [native code] }";
          }).toString = _0x3ac6a9;
          async function _0xf08fdb(_0x560cb2, _0x4f984a, _0x195133, _0x34b37d = 10, _0x2b3eab = 100) {
            while (_0x560cb2[_0x4f984a] === 0 && _0x2b3eab > 0) {
              _0x2b3eab--, await new Promise(_0x29777d => _0x4cd684.setTimeout(_0x29777d, _0x34b37d));
            }
            return _0x2dad3 && console.context().log("Updated Data", _0x560cb2, _0x4f984a, _0x560cb2[_0x4f984a]), _0x195133();
          }
          let _0x47b085 = _0x53166f.WTB.bind(_0x36ff7a);
          _0x53166f.WTB = function (_0x5c8b58) {
            _0x4b1f89 = 0;
            _0x73cd4e.timePlayed.resetClock && (_0x73cd4e.timePlayed.start = Date.now(), _0x73cd4e.timePlayed.resetClock = ![]);
            _0x2dad3 && console.context().log(_0x5c8b58[4]);
            let _0x36721a = 10,
              _0x1a2b1f = 11,
              _0x5890ce = 12,
              _0x33353c = 13;
            _0x5c8b58[4].forEach(_0x593367 => {
              _0x593367.i === _0x5c8b58[9] && (_0x4f9f49 = _0x593367.b, _0x2179a8 = _0x593367.a, _0x114a1d = _0x593367.g, _0x3dcaab = _0x593367.s, _0x593367.b = _0x36721a, _0x593367.a = _0x1a2b1f, _0x593367.g = _0x5890ce, _0x33353c = _0x593367.s === 28 ? 28 : 13, _0x593367.s = _0x33353c);
            }), _0x1eeacd(), _0x2445ce(), _0x440a80(), _0x54b3b1 = _0x5c8b58[24], _0x5c8b58[24] = '', _0x57f7e4.blizzard = 0, _0x57f7e4.bandage = 0, _0x57f7e4.time = _0x5c8b58[5], _0x57f7e4.max_units = _0x5c8b58[7], _0x57f7e4.uid = _0x5c8b58[9] * _0x57f7e4.max_units;
            _0x9cb2d9 && (_0x3b2ae4.WUF.WUH = document.documentElement.clientWidth, _0x3b2ae4.WUF.WUI = document.documentElement.clientHeight);
            _0x1dc604 ? (_0x4cd684.clearInterval(_0x1dc604), _0x1dc604 = 0, _0x1ed932 = 0, _0x1dc604 = _0x4cd684.setInterval(_0x3aae24, 5000)) : _0x1dc604 = _0x4cd684.setInterval(_0x3aae24, 5000);
            _0x40b9f1 = 0, _0x169d08 = document.defaultView.Date.now(), _0x47b085(_0x5c8b58), _0x517eda.waiting = ![], _0xc6e4ef = {};
            _0x5c8b58[12] !== 0 && (_0x73cd4e.localToken.TokenID = _0x5c8b58[12].toString());
            gameWorld.__NW__ = _0x5c8b58[20], gameWorld.__NH__ = _0x5c8b58[21], _0xa896c1.saveSettings(), document.cookie = 'starve_token=' + _0x73cd4e.localToken.Token, document.cookie = "starve_token_id=" + _0x73cd4e.localToken.TokenID, _0x2ceebd();
            let _0xb0594e = gameWorld.WTN[_0x5c8b58[9]];
            for (let _0x4e56ca in _0xb0594e) {
              let _0x3cfa32 = _0xb0594e[_0x4e56ca];
              if (_0x3cfa32 === _0x33353c) _0x29c840.skin = _0x4e56ca, _0xb0594e[_0x4e56ca] = _0x3dcaab, _0xf08fdb(_0xb0594e, _0x4e56ca, async () => {
                let _0x39b43e = gameWorld.fast_units[_0x57f7e4.uid];
                while (!_0x39b43e) {
                  _0x39b43e = gameWorld.fast_units[_0x57f7e4.uid], await new Promise(_0x3886ff => _0x4cd684.setTimeout(_0x3886ff, 10));
                }
                _0x3dcaab = _0x39b43e[_0x4e56ca], _0x73cd4e.skinChanger.active && (_0xb0594e[_0x4e56ca] = _0x73cd4e.skinChanger.skin, _0x39b43e[_0x4e56ca] = _0x73cd4e.skinChanger.skin);
              });else {
                if (_0x3cfa32 === _0x5890ce) _0x29c840.bag = _0x4e56ca, _0xb0594e[_0x4e56ca] = _0x114a1d, _0xf08fdb(_0xb0594e, _0x4e56ca, async () => {
                  let _0xd6540e = gameWorld.fast_units[_0x57f7e4.uid];
                  while (!_0xd6540e) {
                    _0xd6540e = gameWorld.fast_units[_0x57f7e4.uid], await new Promise(_0xfa27fe => _0x4cd684.setTimeout(_0xfa27fe, 10));
                  }
                  _0x114a1d = _0xd6540e[_0x4e56ca], _0x73cd4e.bagChanger.active && (_0xb0594e[_0x4e56ca] = _0x73cd4e.bagChanger.bag, _0xd6540e[_0x4e56ca] = _0x73cd4e.bagChanger.bag);
                });else {
                  if (_0x3cfa32 === _0x1a2b1f) _0x29c840.acc = _0x4e56ca, _0xb0594e[_0x4e56ca] = _0x2179a8, _0xf08fdb(_0xb0594e, _0x4e56ca, async () => {
                    let _0x353750 = gameWorld.fast_units[_0x57f7e4.uid];
                    while (!_0x353750) {
                      _0x353750 = gameWorld.fast_units[_0x57f7e4.uid], await new Promise(_0x4078d0 => _0x4cd684.setTimeout(_0x4078d0, 10));
                    }
                    _0x2179a8 = _0x353750[_0x4e56ca], _0x73cd4e.accChanger.active && (_0xb0594e[_0x4e56ca] = _0x73cd4e.accChanger.acc, _0x353750[_0x4e56ca] = _0x73cd4e.accChanger.acc);
                  });else _0x3cfa32 === _0x36721a && (_0x29c840.book = _0x4e56ca, _0xb0594e[_0x4e56ca] = _0x4f9f49, _0xf08fdb(_0xb0594e, _0x4e56ca, async () => {
                    let _0x5bc637 = gameWorld.fast_units[_0x57f7e4.uid];
                    while (!_0x5bc637) {
                      _0x5bc637 = gameWorld.fast_units[_0x57f7e4.uid], await new Promise(_0x1302b7 => _0x4cd684.setTimeout(_0x1302b7, 10));
                    }
                    _0x4f9f49 = _0x5bc637[_0x4e56ca], _0x73cd4e.bookChanger.active && (_0xb0594e[_0x4e56ca] = _0x73cd4e.bookChanger.book, _0x5bc637[_0x4e56ca] = _0x73cd4e.bookChanger.book);
                  }));
                }
              }
            }
            _0x4cd684.setTimeout(() => {
              _0x4b1f89 = 1;
            }, 2500);
          };
          let _0x4f83bf = _0x53166f.WSA.bind(_0x36ff7a);
          _0x53166f.WSA = function (_0x3af61a) {
            _0x57f7e4.bandage = _0x3af61a, _0x4f83bf(_0x3af61a);
          };
          let _0x8a3af0 = _0x53166f.WSB.bind(_0x36ff7a);
          _0x53166f.WSB = function (_0x2b3343) {
            _0x57f7e4.blizzard = _0x2b3343, _0x8a3af0(_0x2b3343);
          }, _0x19c31e = _0x53166f.WQR.bind(_0x36ff7a), _0x53166f.WQR = function (_0x350bae, _0x22be1c) {
            let _0x1f4fac = gameWorld.fast_units[_0x57f7e4.uid];
            if (_0x1f4fac) {
              if (!_0x1f4fac[_0x57f7e4.fly]) {
                let _0x1a40ed = ![];
                switch (_0x350bae) {
                  case _0x44c140.PLANE:
                    _0x57f7e4.flyableEquiped = _0x44c140.PLANE, _0x1a40ed = !![];
                    break;
                  case _0x44c140.HAWK:
                    _0x57f7e4.flyableEquiped = _0x44c140.HAWK, _0x1a40ed = !![];
                    break;
                  case _0x44c140.BABY_DRAGON:
                    _0x57f7e4.flyableEquiped = _0x44c140.BABY_DRAGON, _0x1a40ed = !![];
                    break;
                  case _0x44c140.GOLDEN_HEN:
                    _0x57f7e4.flyableEquiped = _0x44c140.GOLDEN_HEN, _0x1a40ed = !![];
                    break;
                  case _0x44c140.PARROT:
                    _0x57f7e4.flyableEquiped = _0x44c140.PARROT, _0x1a40ed = !![];
                    break;
                  case _0x44c140.BABY_LAVA:
                    _0x57f7e4.flyableEquiped = _0x44c140.BABY_LAVA, _0x1a40ed = !![];
                    break;
                  case _0x44c140.NIMBUS:
                    _0x57f7e4.flyableEquiped = _0x44c140.NIMBUS, _0x1a40ed = !![];
                    break;
                  case _0x44c140.BOAT:
                    _0x57f7e4.flyableEquiped = _0x44c140.BOAT, _0x1a40ed = !![];
                    break;
                }
                if (_0x73cd4e.AutoHat.active) {
                  if (_0x1f4fac[_0x57f7e4.vehicle] != _0x57f7e4.flyableEquiped && _0x1a40ed) {
                    if (_0x57f7e4.flyableEquiped == _0x44c140.NIMBUS && _0x1f4fac[_0x57f7e4.clothe] != _0x44c140.WITCH) _0x53166f.WQR(_0x44c140.WITCH);else {
                      if (_0x57f7e4.flyableEquiped == _0x44c140.BOAT && _0x1f4fac[_0x57f7e4.clothe] != _0x44c140.PIRATE_HAT) _0x53166f.WQR(_0x44c140.PIRATE_HAT);else _0x57f7e4.flyableEquiped != _0x44c140.NIMBUS && _0x1f4fac[_0x57f7e4.clothe] != _0x44c140.PILOT_HELMET && _0x53166f.WQR(_0x44c140.PILOT_HELMET);
                    }
                  }
                }
              }
            }
            _0x19c31e(_0x350bae, _0x22be1c);
          };
          let _0x3ff627 = _0x53166f.WQJ.bind(_0x36ff7a);
          _0x53166f.WQJ = function () {
            if (_0x73cd4e.AutoCrown.active) {
              _0x3b2ae4.WUU.WUV[_0x44c140.CROWN_BLUE] && _0x19c31e(_0x44c140.CROWN_BLUE);
              let _0x5a4144 = 0;
              if (_0x3b2ae4.WUU.WUV[_0x44c140.HAMMER_REIDITE]) _0x5a4144 = _0x44c140.HAMMER_REIDITE;else {
                if (_0x3b2ae4.WUU.WUV[_0x44c140.HAMMER_AMETHYST]) _0x5a4144 = _0x44c140.HAMMER_AMETHYST;else {
                  if (_0x3b2ae4.WUU.WUV[_0x44c140.HAMMER_DIAMOND]) _0x5a4144 = _0x44c140.HAMMER_DIAMOND;else {
                    if (_0x3b2ae4.WUU.WUV[_0x44c140.HAMMER_GOLD]) _0x5a4144 = _0x44c140.HAMMER_GOLD;else _0x3b2ae4.WUU.WUV[_0x44c140.HAMMER] && (_0x5a4144 = _0x44c140.HAMMER);
                  }
                }
              }
              _0x5a4144 && _0x19c31e(_0x5a4144), _0x3ff627();
            } else _0x3ff627();
          };
          let _0x47c25c = _0x53166f.WQP.bind(_0x36ff7a);
          _0x53166f.WQP = function () {
            let _0x217852 = gameWorld.fast_units[_0x57f7e4.uid];
            _0x217852 && (_0x27f07a.E = !![]);
            switch (_0x3b2ae4.WUZ.WVB) {
              case _0x44c140.SEED:
                _0x10eff0 = _0x44c140.SEED;
                break;
              case _0x44c140.WHEAT_SEED:
                _0x10eff0 = _0x44c140.WHEAT_SEED;
                break;
              case _0x44c140.TOMATO_SEED:
                _0x10eff0 = _0x44c140.TOMATO_SEED;
                break;
              case _0x44c140.GARLIC_SEED:
                _0x10eff0 = _0x44c140.GARLIC_SEED;
                break;
              case _0x44c140.CARROT_SEED:
                _0x10eff0 = _0x44c140.CARROT_SEED;
                break;
              case _0x44c140.PUMPKIN_SEED:
                _0x10eff0 = _0x44c140.PUMPKIN_SEED;
                break;
              case _0x44c140.THORNBUSH_SEED:
                _0x10eff0 = _0x44c140.THORNBUSH_SEED;
                break;
              case _0x44c140.ALOE_VERA_SEED:
                _0x10eff0 = _0x44c140.ALOE_VERA_SEED;
                break;
            }
            _0x47c25c();
          };
          let _0x4c4f68 = _0x53166f.WSH.bind(_0x36ff7a);
          _0x53166f.WSH = function () {
            _0x4c4f68(), _0x73cd4e.AutoEmerald.active && (_0x13a394++, _0x13a394 > 2 && (_0x13a394 = 0));
          };
          let _0x3632c5 = _0x53166f.WSK.bind(_0x36ff7a);
          _0x53166f.WSK = function (_0x1dc5b2) {
            _0x57f7e4.time = _0x1dc5b2, _0x3632c5(_0x1dc5b2);
          }, _0x22d54b = _0x53166f.WQH.bind(_0x36ff7a), _0x53166f.WQH = function (_0x1afba1) {
            _0x54b3b1 = _0x1afba1;
          };
          let _0x4de55a = _0x53166f.WSW.bind(_0x36ff7a);
          _0x53166f.WSW = function (_0x45d25d, _0x376b99, _0x48cf30) {
            _0x48cf30 == 10 && (_0x48cf30 = Number(_0x73cd4e.putToChest));
            while (_0x48cf30 !== 0) {
              _0x48cf30 > 255 ? (_0x4de55a(_0x45d25d, _0x376b99, 255), _0x48cf30 -= 255) : (_0x4de55a(_0x45d25d, _0x376b99, _0x48cf30), _0x48cf30 = 0);
            }
          };
          let _0x56c719 = _0x53166f.WSN.bind(_0x36ff7a);
          _0x53166f.WSN = function (_0x5d7a7e) {
            let _0x41d03a = gameWorld.fast_units[_0x57f7e4.uid];
            if (_0x29b56c) return _0x1ed932 = document.defaultView.Date.now() - _0x2932f7, _0x29b56c = ![];else {
              if (!_0x41d03a) return _0x56c719(_0x5d7a7e);
            }
          };
          let _0x29aae2 = _0x53166f.WSJ.bind(_0x36ff7a);
          _0x53166f.WSJ = function (_0x268fa8, _0x4f21d4, _0x1e965a, _0x13d242, _0x51de32, _0x58819a, _0x5b8ec6) {
            (_0x3b2ae4.WSJ.WUO - _0x4f21d4 / 100).toFixed(2) == 0.01 ? _0x51a8b0 = 1 : _0x51a8b0 = 0, _0x169d08 = document.defaultView.Date.now(), !_0x2b2f75 ? _0x2b2f75 = !![] : _0x2b2f75 = ![], _0x29aae2(_0x268fa8, _0x4f21d4, _0x1e965a, _0x13d242, _0x51de32, _0x58819a, _0x5b8ec6);
          };
          let _0x5ebee0 = _0x53166f.WSL.bind(_0x36ff7a);
          _0x53166f.WSL = function (_0x2cdc01) {
            _0x5ebee0(_0x2cdc01), _0xc6e4ef[_0x2cdc01] && delete _0xc6e4ef[_0x2cdc01], _0x22b787.Leave.unshift([Object.values(gameWorld.WTN[_0x2cdc01])[0], Object.values(gameWorld.WTN[_0x2cdc01])[8]]), _0x22b787.Leave.length > 5 && _0x22b787.Leave.pop(), _0x22b787.killPlayerToggle = !![], clearTimeout(_0x22b787.killPlayerInt), _0x22b787.killPlayerInt = _0x4cd684.setTimeout(() => {
              _0x22b787.killPlayerToggle = ![];
            }, 10000);
          };
          let _0x36a2c6 = _0x53166f.WSF.bind(_0x36ff7a);
          _0x53166f.WSF = function (_0x95cede) {
            _0x36a2c6(_0x95cede), _0x4cd684.setTimeout(() => {
              _0xc6e4ef[_0x95cede[1]] = Date.now(), _0x22b787.Join.unshift([_0x95cede[2], gameWorld.WTN[_0x95cede[1]].level]), _0x22b787.Join.length > 5 && _0x22b787.Join.pop(), _0x22b787.newPlayerToggle = !![], clearTimeout(_0x22b787.newPlayerInt), _0x22b787.newPlayerInt = _0x4cd684.setTimeout(() => {
                _0x22b787.newPlayerToggle = ![];
              }, 10000);
            }, 1000);
          };
          const _0x36f802 = gameWorld.WTS.bind(_0x977435),
            _0x394b73 = new Map();
          gameWorld.WTS = function (_0x492f30) {
            if (devicePixelRatio <= 0.6 && _0x73cd4e.increasedZoom == 'Auto') return _0x394b73.set(_0x492f30);else {
              for (const [_0x553943] of _0x394b73) {
                _0x394b73.delete(_0x553943), _0x36f802(_0x553943);
              }
              return _0x36f802(_0x492f30);
            }
          };
          let _0x213b94 = _0x53166f.units.bind(_0x36ff7a);
          _0x53166f.units = function (_0x287d41, _0x5b1b85, _0x2ab5da) {
            let _0x51a4d7 = gameWorld.fast_units[_0x57f7e4.uid],
              _0x38232f = new Uint16Array(_0x287d41),
              _0xbb1aa5 = (_0x5b1b85.length - 2) / 20;
            for (let _0x388cf3 = 0; _0x388cf3 < _0xbb1aa5; _0x388cf3++) {
              let _0x74e6b1 = 2 + _0x388cf3 * 20,
                _0x434a5f = 1 + _0x388cf3 * 10,
                _0x32a4bf = _0x5b1b85[_0x74e6b1],
                _0xbea2cc = _0x38232f[_0x434a5f + 1],
                _0x40a2d9 = _0x38232f[_0x434a5f + 5],
                _0x3377d8 = _0x32a4bf * _0x57f7e4.max_units + _0x40a2d9,
                _0x5268ad = _0x38232f[_0x434a5f + 2],
                _0x2b0a5e = _0x38232f[_0x434a5f + 3],
                _0x271df4 = _0x38232f[_0x434a5f + 4],
                _0x3621cf = _0x38232f[_0x434a5f + 6],
                _0x4b4005 = _0x38232f[_0x434a5f + 7],
                _0x4f6f54 = _0x38232f[_0x434a5f + 8],
                _0x3660ac = _0x5b1b85[_0x74e6b1 + 1] / 255 * Math.PI * 2,
                _0x446882 = _0x38232f[_0x434a5f + 9],
                _0x17c7e8 = gameWorld.fast_units[_0x3377d8];
              !_0x52745a && _0x51a4d7 && _0x51a4d7[_0x57f7e4.pid] == _0x32a4bf && _0x5268ad === 0 && _0x17c7e8 && _0xbea2cc & _0x1e5f09.HEAL && (_0x2b2f75 = ![]);
              !_0x52745a && _0x17c7e8 && _0x17c7e8[_0x57f7e4.pid] && _0x5268ad === 0 && _0x17c7e8 && _0xbea2cc & _0x1e5f09.HEAL && (_0xc6e4ef[_0x17c7e8[_0x57f7e4.pid]] = Date.now());
              if (!gameWorld.fast_units[_0x3377d8]) {
                _0x9cb2d9 && _0x32a4bf === _0x9cb2d9.id && _0x27f07a.E && (_0x27f07a.I.drawText('L:' + _0x40a2d9, 30, "black", !_0x73cd4e.darkMode ? 'white' : "#BBB"), _0x27f07a.L = _0x40a2d9, _0x27f07a.E = ![]);
                continue;
              }
            }
            _0x287d41 = _0x38232f.buffer.slice(_0x38232f.byteOffset, _0x38232f.byteOffset + _0x38232f.byteLength), _0x213b94(_0x287d41, _0x5b1b85, _0x2ab5da);
          };
          let _0x281642 = _0x53166f.WQI.bind(_0x36ff7a);
          _0x53166f.WQI = function (_0x1cb92c) {
            let _0x1758cf = gameWorld.fast_units[_0x57f7e4.uid];
            _0x1758cf && _0x73cd4e.AutoBook && _0x1758cf.right != _0x44c140.BOOK && _0x3b2ae4.WUU.WUV[_0x44c140.BOOK] && _0x53166f.WQR(_0x44c140.BOOK), _0x275be4 = _0x1cb92c, _0x281642(_0x1cb92c);
          };
          let _0x2b11c7 = _0x53166f.WQQ.bind(_0x36ff7a);
          _0x53166f.WQQ = function (_0x2df21f) {
            _0x2b11c7(_0x2df21f), _0x4dd090 = _0x2df21f;
          };
          let _0x34f3ce = _0x53166f.WQV.bind(_0x36ff7a);
          _0x53166f.WQV = function (_0x2ef0bc) {
            if (_0x73cd4e.AutoFarm.angle && _0x73cd4e.AutoFarm.active) _0x2ef0bc = _0x73cd4e.AutoFarm.angle;else {
              if (_0x73cd4e.Aimbot.angle && _0x73cd4e.Aimbot.active) _0x2ef0bc = _0x73cd4e.Aimbot.angle;else {
                if (_0x73cd4e.AutoEmerald.angle && _0x73cd4e.AutoEmerald.active) _0x2ef0bc = _0x73cd4e.AutoEmerald.angle;else _0x73cd4e.AutoTame.angle && _0x73cd4e.AutoTame.active && (_0x2ef0bc = _0x73cd4e.AutoTame.angle);
              }
            }
            return _0x34f3ce(_0x2ef0bc);
          };
          let _0x3bcf24 = _0x53166f.WQU.bind(_0x36ff7a);
          _0x53166f.WQU = function (_0x15fd04) {
            if (_0x73cd4e.AutoFarm.angle && _0x73cd4e.AutoFarm.active) _0x15fd04 = _0x73cd4e.AutoFarm.angle;else {
              if (_0x73cd4e.Aimbot.angle && _0x73cd4e.Aimbot.active) _0x15fd04 = _0x73cd4e.Aimbot.angle;else {
                if (_0x73cd4e.AutoEmerald.angle && _0x73cd4e.AutoEmerald.active) _0x15fd04 = _0x73cd4e.AutoEmerald.angle;else _0x73cd4e.AutoTame.angle && _0x73cd4e.AutoTame.active && (_0x15fd04 = _0x73cd4e.AutoTame.angle);
              }
            }
            return _0x3bcf24(_0x15fd04);
          };
          let _0x192444 = _0x53166f.WTC.bind(_0x36ff7a);
          _0x53166f.WTC = async function () {
            if (!_0x3b2ae4.WUA.enabled && (_0x1a9396 || _0x2a8f98 || !_0x517eda.waiting) && !_0x45d552) return;
            if (Date.now() - _0x406b71 < 7500 && !_0x1a9396) {
              _0x1a9396 = 1, _0x517eda.waiting = !![];
              let _0x280aab = 7500 - (Date.now() - _0x406b71) < 10000 ? 7500 - (Date.now() - _0x406b71) : 2500;
              await _0x377afe(_0x280aab), _0x406b71 = Date.now(), _0x1a9396 = 0;
            }
            _0x45d552 = ![], _0x192444();
          };
          let _0xb062a5 = _0x53166f.WTD.bind(_0x36ff7a);
          _0x53166f.WTD = function (_0x1a1cf1) {
            return _0x73cd4e.timePlayed.resetClock = !![], _0xb062a5.apply(this, _0x1a1cf1);
          };
          let _0x2f790d = _0x53166f.WQZ.bind(_0x36ff7a);
          _0x53166f.WQZ = async function (..._0x568ee4) {
            _0x73cd4e.timePlayed.resetClock = !![], _0x73cd4e.totemOnMap.x = 0, _0x73cd4e.totemOnMap.y = 0;
            let _0x18be05 = gameWorld.fast_units[_0x57f7e4.uid];
            return _0x73cd4e.deathOnMap.x = _0x18be05.x / (gameWorld.__NW__ * 100), _0x73cd4e.deathOnMap.y = _0x18be05.y / (gameWorld.__NH__ * 100), _0x73cd4e.AutoRespawn.active ? (_0x517eda.waiting = ![], _0x45d552 = !![], _0x3b2ae4.alive = ![], await _0x377afe(500), _0x45020e.WTL(_0x1ca978.args1, _0x1ca978.args2)) : _0x2f790d.apply(this, _0x568ee4);
          }, _0x125854 = _0x53166f.WQX.bind(_0x36ff7a), _0x53166f.WQX = async function (_0x585c6b) {
            if (!_0x73cd4e.Translation.translateSent || document.visibilityState != "visible" || _0x73cd4e.Hidden.active) return _0x125854(_0x585c6b);
            let _0x9fa75 = _0x585c6b;
            if (_0x9fa75.length > 50 || _0x9fa75.length < 2) return _0x125854(_0x585c6b);
            let _0x510516 = _0x73cd4e.Translation.sentLang;
            switch (_0x510516) {
              case "Arabic":
                _0x510516 = 'ar';
                break;
              case "Bulgarian":
                _0x510516 = 'bg';
                break;
              case "Czech":
                _0x510516 = 'cs';
                break;
              case "Danish":
                _0x510516 = 'da';
                break;
              case "German":
                _0x510516 = 'de';
                break;
              case "Greek":
                _0x510516 = 'el';
                break;
              case "English (British)":
                _0x510516 = 'en-gb';
                break;
              case "English (American)":
                _0x510516 = "en-us";
                break;
              case "Spanish":
                _0x510516 = 'es';
                break;
              case "Estonian":
                _0x510516 = 'et';
                break;
              case "Finnish":
                _0x510516 = 'fi';
                break;
              case "French":
                _0x510516 = 'fr';
                break;
              case 'Hungarian':
                _0x510516 = 'hu';
                break;
              case 'Indonesian':
                _0x510516 = 'id';
                break;
              case 'Italian':
                _0x510516 = 'it';
                break;
              case "Japanese":
                _0x510516 = 'ja';
                break;
              case "Korean":
                _0x510516 = 'ko';
                break;
              case "Lithuanian":
                _0x510516 = 'lt';
                break;
              case "Latvian":
                _0x510516 = 'lv';
                break;
              case "Norwegian Bokmål":
                _0x510516 = 'nb';
                break;
              case "Dutch":
                _0x510516 = 'nl';
                break;
              case 'Polish':
                _0x510516 = 'pl';
                break;
              case "Portuguese (Brazilian)":
                _0x510516 = "pt-br";
                break;
              case "Portuguese (Other)":
                _0x510516 = "pt-pt";
                break;
              case "Romanian":
                _0x510516 = 'ro';
                break;
              case "Russian":
                _0x510516 = 'ru';
                break;
              case "Slovak":
                _0x510516 = 'sk';
                break;
              case "Slovenian":
                _0x510516 = 'sl';
                break;
              case "Swedish":
                _0x510516 = 'sv';
                break;
              case "Turkish":
                _0x510516 = 'tr';
                break;
              case "Ukrainian":
                _0x510516 = 'uk';
                break;
              case "Chinese (Simplifed)":
                _0x510516 = "zh-hans";
                break;
              case "Chinese (Traditional)":
                _0x510516 = "zh-hant";
                break;
              default:
                return;
            }
            _0x509bba && _0x509bba.readyState === 1 ? _0x509bba.send(_0x5a1a84(JSON.stringify([1, [_0x9fa75, _0x510516]]))) : _0x125854(_0x585c6b);
          }, _0x25c131 = _0x53166f.WQG.bind(_0x36ff7a), _0x53166f.WQG = async function (_0x35e6cf) {
            let _0x347fb7 = _0x35e6cf[2];
            const _0x35e83c = _0x347fb7.split('\x20');
            if (_0x35e83c[0] === "drop" && _0x73cd4e.AutoFarm.active && _0x73cd4e.AutoFarm.whitelist.includes(_0x35e6cf[1])) {
              const _0x131c7d = ['b', 'w', 'p', 'c', 'to', 'th', 'g', 'w'],
                _0x388aab = [_0x44c140.PLANT, _0x44c140.WILD_WHEAT, _0x44c140.PUMPKIN, _0x44c140.CARROT, _0x44c140.TOMATO, _0x44c140.THORNBUSH, _0x44c140.GARLIC, _0x44c140.WATERMELON];
              for (let _0x5e830e = 0; _0x5e830e < _0x388aab.length; _0x5e830e++) {
                const _0x2bafa6 = _0x388aab[_0x5e830e];
                if (!_0x3b2ae4.WUU.WUV[_0x2bafa6] || _0x3b2ae4.WUU.WUV[_0x2bafa6] <= 0 || !_0x35e83c.includes(_0x131c7d[_0x5e830e]) && !_0x35e83c.includes("all")) continue;
                _0x53166f.WQS(_0x2bafa6), await new Promise(_0x5af858 => _0x4cd684.setTimeout(_0x5af858, 1050));
              }
            }
            if (!_0x73cd4e.Translation.translateRecieved || document.visibilityState != "visible" || _0x73cd4e.Hidden.active) return _0x25c131(_0x35e6cf);
            if (_0x347fb7.length > 50 || _0x347fb7.length < 2) return _0x25c131(_0x35e6cf);
            let _0x3d70ea = _0x73cd4e.Translation.recievedLang;
            switch (_0x3d70ea) {
              case 'Arabic':
                _0x3d70ea = 'ar';
                break;
              case 'Bulgarian':
                _0x3d70ea = 'bg';
                break;
              case 'Czech':
                _0x3d70ea = 'cs';
                break;
              case 'Danish':
                _0x3d70ea = 'da';
                break;
              case 'German':
                _0x3d70ea = 'de';
                break;
              case "Greek":
                _0x3d70ea = 'el';
                break;
              case 'English\x20(British)':
                _0x3d70ea = "en-gb";
                break;
              case "English (American)":
                _0x3d70ea = "en-us";
                break;
              case "Spanish":
                _0x3d70ea = 'es';
                break;
              case "Estonian":
                _0x3d70ea = 'et';
                break;
              case "Finnish":
                _0x3d70ea = 'fi';
                break;
              case "French":
                _0x3d70ea = 'fr';
                break;
              case "Hungarian":
                _0x3d70ea = 'hu';
                break;
              case "Indonesian":
                _0x3d70ea = 'id';
                break;
              case "Italian":
                _0x3d70ea = 'it';
                break;
              case "Japanese":
                _0x3d70ea = 'ja';
                break;
              case "Korean":
                _0x3d70ea = 'ko';
                break;
              case "Lithuanian":
                _0x3d70ea = 'lt';
                break;
              case 'Latvian':
                _0x3d70ea = 'lv';
                break;
              case 'Norwegian\x20Bokmål':
                _0x3d70ea = 'nb';
                break;
              case "Dutch":
                _0x3d70ea = 'nl';
                break;
              case "Polish":
                _0x3d70ea = 'pl';
                break;
              case 'Portuguese\x20(Brazilian)':
                _0x3d70ea = 'pt-br';
                break;
              case "Portuguese (Other)":
                _0x3d70ea = 'pt-pt';
                break;
              case "Romanian":
                _0x3d70ea = 'ro';
                break;
              case "Russian":
                _0x3d70ea = 'ru';
                break;
              case 'Slovak':
                _0x3d70ea = 'sk';
                break;
              case 'Slovenian':
                _0x3d70ea = 'sl';
                break;
              case "Swedish":
                _0x3d70ea = 'sv';
                break;
              case "Turkish":
                _0x3d70ea = 'tr';
                break;
              case 'Ukrainian':
                _0x3d70ea = 'uk';
                break;
              case "Chinese (Simplifed)":
                _0x3d70ea = "zh-hans";
                break;
              case "Chinese (Traditional)":
                _0x3d70ea = 'zh-hant';
                break;
              default:
                return;
            }
            _0x509bba && _0x509bba.readyState === 1 ? _0x509bba.send(_0x5a1a84(JSON.stringify([2, [_0x35e6cf, _0x3d70ea]]))) : _0x25c131(_0x35e6cf);
          };
          let _0x37d400 = _0x46233c.drawGame;
          _0x46233c.drawGame = function () {
            _0x37d400();
            if (_0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0) return;
            !_0x73cd4e.Hidden.active && _0x5ddfe8();
          };
          let _0x1eea2f = _0x53166f.WRZ.bind(_0x36ff7a);
          _0x53166f.WRZ = function () {};
          let _0x176ad2 = _0x46233c.WTG.bind(_0x1a0282);
          _0x46233c.WTG = function (_0x6de626) {
            _0x43966e = _0x6de626;
            if (_0x53166f.websocket.readyState != 1) _0x43966e = 0, _0x176ad2(_0x6de626);else return;
          };
          let _0x3e8d41 = _0x53166f.WQY.bind(_0x36ff7a);
          _0x53166f.WQY = function () {
            _0x517eda.waiting = !![];
            if (_0x2a8f98 && (_0x53166f.websocket.readyState === 1 || _0x3b2ae4.WUA.enabled) || _0x73cd4e.AutoRespawn.active && _0x45d552) return;else {
              if (!_0x3a4970) {
                _0x2a8f98 = ![], _0x53166f.websocket.close(), _0x3b2ae4.WUA.enabled = !![], _0xd0ee7a = ![];
                if (_0xa82954) {
                  let _0x466d84 = 0,
                    _0x38c064 = 3;
                  return _0x3e8d41(), _0x50f91e = _0x4cd684.setInterval(() => {
                    if (_0x38c064 == _0x53166f.websocket.readyState && !_0xd0ee7a && _0x466d84 < 15) _0x466d84++;else {
                      if (_0x38c064 != _0x53166f.websocket.readyState && _0xd0ee7a) _0x50f91e && _0x4cd684.clearInterval(_0x50f91e);else _0x466d84 >= 15 && (_0x50f91e && _0x4cd684.clearInterval(_0x50f91e), _0x46233c.WTG(_0x45020e.WTK), _0x3d48c0());
                    }
                  }, 500), _0x45020e.WTL(_0x1ca978.args1, _0x1ca978.args2);
                } else _0x5ab05c = _0x4cd684.setInterval(() => {
                  if (_0xa82954) {
                    _0x5ab05c && _0x4cd684.clearInterval(_0x5ab05c);
                    let _0x280db8 = 0,
                      _0x30d39 = 3;
                    return _0x50f91e = _0x4cd684.setInterval(() => {
                      if (_0x30d39 == _0x53166f.websocket.readyState && !_0xd0ee7a && _0x280db8 < 15) _0x280db8++;else {
                        if (_0x30d39 != _0x53166f.websocket.readyState && _0xd0ee7a) _0x50f91e && _0x4cd684.clearInterval(_0x50f91e);else _0x280db8 >= 15 && (_0x50f91e && _0x4cd684.clearInterval(_0x50f91e), _0x46233c.WTG(_0x45020e.WTK), _0x3d48c0());
                      }
                    }, 500), _0x45020e.WTL(_0x1ca978.args1, _0x1ca978.args2);
                  }
                }, 1000);
              }
            }
          };
          let _0x124f5d = _0x53166f.WQT.bind(_0x36ff7a);
          _0x53166f.WQT = function () {
            !_0x2e00d9 && _0x124f5d();
          };
          let _0x2c7620 = _0x3b2ae4.WUF.WUG.bind(_0x3b2ae4.WUF);
          _0x3b2ae4.WUF.WUG = function () {
            if (_0x40b9f1 || _0x53166f.websocket.readyState != 1) return;else _0x2c7620();
          };
          function _0x5f4491(_0x2a4bc8) {
            let _0x15d3ea = new Uint8Array(new ArrayBuffer(_0x2a4bc8.length));
            for (let _0x5c7df4 = 0; _0x2a4bc8.length > _0x5c7df4; _0x5c7df4++) {
              _0x15d3ea[_0x5c7df4] = _0x2a4bc8[_0x5c7df4];
            }
            return _0x15d3ea;
          }
          let _0x3649a0 = _0x53166f.WQW.bind(_0x36ff7a);
          _0x53166f.WQW = function (_0x1ff71d) {
            if (_0x40b9f1 || _0x73cd4e.Aimbot.active && (_0x73cd4e.Aimbot.mode == 'Attack\x20&\x20Chase' || _0x73cd4e.Aimbot.move == 'Rabbit\x20Chase') && _0x1ff71d == 0 && _0x4d6c3f && _0x1d1dbe && !_0x3b2ae4.WUZ.WVA) return;else _0x3649a0(_0x1ff71d);
          };
          let _0x4c6100 = _0x3b2ae4.WUL.WUG.bind(_0x3b2ae4.WUL);
          _0x3b2ae4.WUL.WUG = function () {
            _0x4c6100();
            if (_0x73cd4e.Aimbot.active && _0x73cd4e.Aimbot.angle) {
              let _0x3a869e = gameWorld.fast_units[_0x57f7e4.uid];
              _0x3a869e && (_0x3a869e.angle = _0x73cd4e.Aimbot.angle, _0x3a869e[_0x57f7e4.nangle] = _0x73cd4e.Aimbot.angle);
            } else {
              if (_0x73cd4e.AutoFarm.active && _0x73cd4e.AutoFarm.angle) {
                let _0x36479d = gameWorld.fast_units[_0x57f7e4.uid];
                _0x36479d && (_0x36479d.angle = _0x73cd4e.AutoFarm.angle, _0x36479d[_0x57f7e4.nangle] = _0x73cd4e.AutoFarm.angle);
              } else {
                if (_0x73cd4e.AutoEmerald.active && _0x73cd4e.AutoEmerald.angle) {
                  let _0x29442a = gameWorld.fast_units[_0x57f7e4.uid];
                  _0x29442a && (_0x29442a.angle = _0x73cd4e.AutoEmerald.angle, _0x29442a[_0x57f7e4.nangle] = _0x73cd4e.AutoEmerald.angle);
                } else {
                  if (_0x73cd4e.AutoTame.active && _0x73cd4e.AutoTame.angle) {
                    let _0x1b5cee = gameWorld.fast_units[_0x57f7e4.uid];
                    _0x1b5cee && (_0x1b5cee.angle = _0x73cd4e.AutoTame.angle, _0x1b5cee[_0x57f7e4.nangle] = _0x73cd4e.AutoTame.angle);
                  }
                }
              }
            }
          };
          let _0x32a6b5 = _0x53166f.WSC.bind(_0x36ff7a);
          _0x53166f.WSC = function (_0x1f7c6e) {
            return _0x32a6b5(_0x1f7c6e);
          };
          let _0x149e69 = _0x53166f.WSD.bind(_0x36ff7a);
          _0x53166f.WSD = function (_0x3f4759) {
            return _0x149e69(_0x3f4759);
          };
          let _0x105795 = _0x53166f.WSE.bind(_0x36ff7a);
          _0x53166f.WSE = function (_0x52e82b) {
            return _0x105795(_0x52e82b);
          };
          let _0x575b3d = _0x53166f.WSG.bind(_0x36ff7a);
          _0x53166f.WSG = function (_0x3e5fa) {
            return _0x575b3d(_0x3e5fa);
          };
          let _0x3da2dc = _0x53166f.WSI.bind(_0x36ff7a);
          _0x53166f.WSI = function (_0x4fc9ef) {
            return _0x3da2dc(_0x4fc9ef);
          };
          let _0x1d3420 = _0x53166f.WSM.bind(_0x36ff7a);
          _0x53166f.WSM = function (_0x5084ad) {
            return _0x1d3420(_0x5084ad);
          };
          let _0x3f8b87 = _0x53166f.WSO.bind(_0x36ff7a);
          _0x53166f.WSO = function () {
            return _0x3f8b87();
          };
          let _0x1b2411 = _0x53166f.WSP.bind(_0x36ff7a);
          _0x53166f.WSP = function (_0x5904be, _0x25c8f7) {
            return _0x1b2411(_0x5904be, _0x25c8f7);
          };
          let _0x2ebf95 = _0x53166f.WSY.bind(_0x36ff7a);
          _0x53166f.WSY = function (_0x2d7acc, _0x18a67e) {
            return _0x2ebf95(_0x2d7acc, _0x18a67e);
          };
          let _0x1f414d = _0x53166f.WSR.bind(_0x36ff7a);
          _0x53166f.WSR = function (_0x5092c7, _0x3c3151, _0x48276f) {
            return _0x1f414d(_0x5092c7, _0x3c3151, _0x48276f);
          };
          let _0x55476b = _0x53166f.WSS.bind(_0x36ff7a);
          _0x53166f.WSS = function (_0x35904f) {
            return _0x55476b(_0x35904f);
          };
          let _0x695810 = _0x53166f.WSQ.bind(_0x36ff7a);
          _0x53166f.WSQ = function (_0x4c0715) {
            return _0x695810(_0x4c0715);
          };
          let _0x3c91cc = _0x53166f.WST.bind(_0x36ff7a);
          _0x53166f.WST = function (_0x5e7c62) {
            return _0x3c91cc(_0x5e7c62);
          };
          let _0x434ecc = _0x53166f.WSU.bind(_0x36ff7a);
          _0x53166f.WSU = function (_0x2ce4de, _0x323c89) {
            return _0x434ecc(_0x2ce4de, _0x323c89);
          };
          let _0x8ce072 = _0x53166f.WSV.bind(_0x36ff7a);
          _0x53166f.WSV = function (_0x818cc1, _0xca584b) {
            return _0x8ce072(_0x818cc1, _0xca584b);
          };
          let _0x3f6196 = _0x53166f.WSX.bind(_0x36ff7a);
          _0x53166f.WSX = function (_0x130e58) {
            return _0x3f6196(_0x130e58);
          };
          let _0x502ab4 = _0x53166f.WSZ.bind(_0x36ff7a);
          _0x53166f.WSZ = function (_0x43d789) {
            return _0x502ab4(_0x43d789);
          };
          let _0x31e95e = _0x53166f.WQA.bind(_0x36ff7a);
          _0x53166f.WQA = function (_0x5c918b) {
            return _0x31e95e(_0x5c918b);
          };
          let _0x382579 = _0x53166f.WQB.bind(_0x36ff7a);
          _0x53166f.WQB = function (_0x278308) {
            return _0x382579(_0x278308);
          };
          let _0x1b578e = _0x53166f.WQC.bind(_0x36ff7a);
          _0x53166f.WQC = function (_0x515d56) {
            return _0x1b578e(_0x515d56);
          };
          let _0x24ccb7 = _0x53166f.WQE.bind(_0x36ff7a);
          _0x53166f.WQE = function () {
            return _0x24ccb7();
          };
          let _0xdf349b = _0x53166f.WQK.bind(_0x36ff7a);
          _0x53166f.WQK = function (_0x5bef10) {
            return _0xdf349b(_0x5bef10);
          };
          let _0x24f9f8 = _0x53166f.WQL.bind(_0x36ff7a);
          _0x53166f.WQL = function (_0x4f1432, _0x396b34) {
            return _0x24f9f8(_0x4f1432, _0x396b34);
          };
          let _0x5e1bd8 = _0x53166f.WQM.bind(_0x36ff7a);
          _0x53166f.WQM = function () {
            return _0x5e1bd8();
          };
          let _0x554124 = _0x53166f.WQN.bind(_0x36ff7a);
          _0x53166f.WQN = function (_0x24349a) {
            return _0x554124(_0x24349a);
          };
          let _0x15311e = _0x53166f.WQO.bind(_0x36ff7a);
          _0x53166f.WQO = function (_0x11cee7, _0x5df85c) {
            return _0x15311e(_0x11cee7, _0x5df85c);
          };
          let _0xc66502 = _0x53166f.WQS.bind(_0x36ff7a);
          _0x53166f.WQS = function (_0x636982) {
            return _0xc66502(_0x636982);
          };
          let _0x3da529 = _0x53166f.WTA.bind(_0x36ff7a);
          _0x53166f.WTA = function () {
            return _0x3da529();
          }, window.addEventListener("offline", function () {
            _0xa82954 = ![], !_0x73cd4e.Hidden.active && _0x2a8f98 && _0x12a87d("red", 'Internet\x20disconnected.\x20Please\x20check\x20your\x20connection.');
          }), window.addEventListener("online", function () {
            _0xa82954 = !![], _0x509bba && _0x509bba.readyState === 1 && _0x509bba.close(), !_0x73cd4e.Hidden.active && _0x3b2ae4.WUA.enabled && _0x12a87d('green', 'Internet\x20reconnected.\x20Attempting\x20to\x20rejoin.');
          });
        }
      }
      function _0x2ea2af() {
        _0x451f8b = {
          'title': _0x2dad3 ? "[KubasMode]" : "ARCT cheats",
          'align': 'right',
          'toggleGuiKey': "NONE",
          'toggleGuiButton': !![],
          'draggable': !![],
          'fontSize': 18,
          'opacity': 0.8,
          'width': 880,
          'height': 630,
          'folders': {
            'Visuals': [{
              'type': 'checkbox',
              'label': 'Fps',
              'object': _0x73cd4e,
              'property': "fpsDisplay",
              'onChange': _0x3c06f1 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'checkbox',
              'label': "Days Alive",
              'object': _0x73cd4e,
              'property': "daysAlive",
              'onChange': _0x3edc95 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'checkbox',
              'label': 'Timer',
              'object': _0x73cd4e,
              'property': "gaugeTimer",
              'onChange': _0x5888cb => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "LeaderBoard Levels",
              'object': _0x73cd4e,
              'property': "showLeaderBoardLevels",
              'onChange': _0x3a505e => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'checkbox',
              'label': "Percentages",
              'object': _0x73cd4e,
              'property': "gaugePercentages",
              'onChange': _0x198410 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'checkbox',
              'label': "Joins & Leaves",
              'object': _0x73cd4e,
              'property': 'joinsLeaves',
              'onChange': _0x4c04f0 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Totem On Map",
              'object': _0x73cd4e.totemOnMap,
              'property': "active",
              'onChange': _0x5a8475 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'checkbox',
              'label': 'Death\x20On\x20Map',
              'object': _0x73cd4e.deathOnMap,
              'property': "active",
              'onChange': _0x1b061e => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': 'LeaderBoard\x20Allies',
              'object': _0x73cd4e,
              'property': "drawLeaderboardAllies",
              'onChange': _0x551530 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Player Tracers",
              'object': _0x73cd4e,
              'property': "playerTracers",
              'onChange': _0x18a04d => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Players On Top",
              'object': _0x73cd4e,
              'property': "playersOnTop",
              'onChange': _0x2fb375 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'checkbox',
              'label': 'Treasure\x20Chest\x20On\x20Top',
              'object': _0x73cd4e,
              'property': "treasureChestOnTop",
              'onChange': _0x4612e1 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Fire Info",
              'object': _0x73cd4e,
              'property': "fireInfo",
              'onChange': _0xa8e7b5 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Building Info",
              'object': _0x73cd4e,
              'property': 'buildingInfo',
              'onChange': _0x42507d => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Move Prediction",
              'object': _0x73cd4e,
              'property': 'movementPredictor',
              'onChange': _0xda521b => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Bliz And Storm",
              'object': _0x73cd4e,
              'property': "blizzardAndSandstorm",
              'onChange': _0x9a804a => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "select",
              'label': 'Show\x20Hacks',
              'object': _0x73cd4e.listEnabledHacks,
              'property': "mode",
              'options': ['Bottom\x20Left', 'Top\x20Left', 'Off'],
              'onChange': _0x454a3a => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "select",
              'label': 'Debugger',
              'object': _0x73cd4e.Debugger,
              'property': "mode",
              'options': ["None", "No Roofs/Bridges", "Player IDS", "All"],
              'onChange': _0xa03ea2 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'select',
              'label': "Player Timers",
              'object': _0x73cd4e,
              'property': "playerTimers",
              'options': ["All", "Enemys", "None"],
              'onChange': _0x297f1d => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "subfolder",
              'label': 'Chests',
              'subfolder': [{
                'type': "checkbox",
                'label': "Chest Info",
                'object': _0x73cd4e.chestInfo,
                'property': "active",
                'onChange': _0x1b1aff => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'select',
                'label': "Chest Textures",
                'object': _0x73cd4e.chestInfo,
                'property': "texture",
                'options': ["Bright", 'Light', "Dark"],
                'onChange': _0x101f72 => {
                  _0xa896c1.saveSettings(), _0x440a80();
                }
              }]
            }, {
              'type': "subfolder",
              'label': 'Spikes',
              'subfolder': [{
                'type': "checkbox",
                'label': 'Colored\x20Spikes',
                'object': _0x73cd4e.ColoredSpikes,
                'property': "active",
                'onChange': _0x1d2f91 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "select",
                'label': "Spike Textures",
                'object': _0x73cd4e.ColoredSpikes,
                'property': 'texture',
                'options': ["Light", "Dark"],
                'onChange': _0x46311e => {
                  _0xa896c1.saveSettings(), _0x2445ce();
                }
              }]
            }, {
              'type': "subfolder",
              'label': "Roofs",
              'subfolder': [{
                'type': 'checkbox',
                'label': "Smooth Roofs",
                'object': _0x73cd4e,
                'property': 'smoothRoofs',
                'onChange': _0x314385 => {
                  _0xa896c1.saveSettings(), _0x5d811b();
                }
              }, {
                'type': "checkbox",
                'label': "Opaque Roofs",
                'object': _0x73cd4e.Roof,
                'property': "active",
                'onChange': _0x21544d => {
                  _0xa896c1.saveSettings(), _0x5d811b();
                }
              }, {
                'type': "range",
                'label': "Roofs Opacity",
                'min': 0.1,
                'max': 1,
                'step': 0.1,
                'object': _0x73cd4e.Roof,
                'property': "opacity",
                'onChange': _0xd3f249 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': 'subfolder',
              'label': "Opacitys",
              'subfolder': [{
                'type': "range",
                'label': "Vehicles Opacity",
                'min': 0.1,
                'max': 1,
                'step': 0.1,
                'object': _0x73cd4e,
                'property': "vehicleOpacity",
                'onChange': _0x1b7a2c => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "range",
                'label': "Menus Opacity",
                'min': 0.1,
                'max': 1,
                'step': 0.1,
                'object': _0x73cd4e,
                'property': "menuOpacity",
                'onChange': _0x894e39 => {
                  _0xa896c1.saveSettings(), _0x2ceebd();
                }
              }]
            }, {
              'type': 'range',
              'label': "Brightness",
              'min': 0.5,
              'max': 1.5,
              'step': 0.1,
              'object': _0x73cd4e,
              'property': "canvasBrightness",
              'onChange': _0x439b3f => {
                _0xa896c1.saveSettings();
                const _0xf99e97 = document.getElementById("game_canvas");
                _0xf99e97.style.filter = "brightness(" + _0x73cd4e.canvasBrightness + ')';
              }
            }],
            'Tracers': [{
              'type': 'subfolder',
              'label': "Forest",
              'subfolder': [{
                'type': "checkbox",
                'label': "Boars",
                'object': _0x73cd4e.Tracers,
                'property': 'Boars',
                'onChange': _0x3a5e63 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'checkbox',
                'label': "Golden Chicken",
                'object': _0x73cd4e.Tracers,
                'property': "GoldenChickens",
                'onChange': _0x8287a2 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Golden Hen",
                'object': _0x73cd4e.Tracers,
                'property': "GoldenHens",
                'onChange': _0x42a7cd => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Hawks",
                'object': _0x73cd4e.Tracers,
                'property': "Hawks",
                'onChange': _0x5a25c2 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Rabbits",
                'object': _0x73cd4e.Tracers,
                'property': 'Rabbits',
                'onChange': _0x1b3827 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Spiders",
                'object': _0x73cd4e.Tracers,
                'property': 'Spiders',
                'onChange': _0x236a4b => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'checkbox',
                'label': "Wolfs",
                'object': _0x73cd4e.Tracers,
                'property': "Wolfs",
                'onChange': _0x3908e2 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': "subfolder",
              'label': "Jungle",
              'subfolder': [{
                'type': "checkbox",
                'label': "Ocelots",
                'object': _0x73cd4e.Tracers,
                'property': "Ocelots",
                'onChange': _0x5a73f5 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Crocodiles",
                'object': _0x73cd4e.Tracers,
                'property': "Crocodiles",
                'onChange': _0x119520 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Parrots",
                'object': _0x73cd4e.Tracers,
                'property': 'Parrots',
                'onChange': _0x373fa3 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': "subfolder",
              'label': "Lava",
              'subfolder': [{
                'type': "checkbox",
                'label': 'Baby\x20Lava\x20Dragons',
                'object': _0x73cd4e.Tracers,
                'property': 'BabyLavaDragons',
                'onChange': _0x321f00 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': 'Fire\x20Mobs',
                'object': _0x73cd4e.Tracers,
                'property': "FireMobs",
                'onChange': _0x3f0624 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': 'Lava\x20Dragons',
                'object': _0x73cd4e.Tracers,
                'property': "LavaDragons",
                'onChange': _0xf33f12 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': "subfolder",
              'label': "Ocean",
              'subfolder': [{
                'type': "checkbox",
                'label': "Krakens",
                'object': _0x73cd4e.Tracers,
                'property': "Krakens",
                'onChange': _0xc4a5f5 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Piranhas",
                'object': _0x73cd4e.Tracers,
                'property': 'Piranhas',
                'onChange': _0x372b80 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': "subfolder",
              'label': 'Sand',
              'subfolder': [{
                'type': "checkbox",
                'label': 'SandWorms',
                'object': _0x73cd4e.Tracers,
                'property': "Sandworms",
                'onChange': _0x4880d5 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': 'Crabs',
                'object': _0x73cd4e.Tracers,
                'property': "Crabs",
                'onChange': _0x380d5d => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "King Crabs",
                'object': _0x73cd4e.Tracers,
                'property': "KingCrabs",
                'onChange': _0x9857e6 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Vultures",
                'object': _0x73cd4e.Tracers,
                'property': "Vultures",
                'onChange': _0x2fb1b6 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': "subfolder",
              'label': "Winter",
              'subfolder': [{
                'type': "checkbox",
                'label': 'Baby\x20Dragons',
                'object': _0x73cd4e.Tracers,
                'property': "BabyDragons",
                'onChange': _0x5e2603 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'checkbox',
                'label': "Baby Mammoths",
                'object': _0x73cd4e.Tracers,
                'property': "BabyMammoths",
                'onChange': _0x276199 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': 'Bears',
                'object': _0x73cd4e.Tracers,
                'property': "Bears",
                'onChange': _0xa1ba03 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'checkbox',
                'label': 'Dragons',
                'object': _0x73cd4e.Tracers,
                'property': "Dragons",
                'onChange': _0x3791ab => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Foxes",
                'object': _0x73cd4e.Tracers,
                'property': "Foxes",
                'onChange': _0x209970 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'checkbox',
                'label': "Mammoths",
                'object': _0x73cd4e.Tracers,
                'property': "Mammoths",
                'onChange': _0x2c6369 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "checkbox",
                'label': "Penguins",
                'object': _0x73cd4e.Tracers,
                'property': "Penguins",
                'onChange': _0x1b3f78 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }],
            'Misc': [{
              'type': 'checkbox',
              'label': "Auto Book",
              'object': _0x73cd4e.AutoBook,
              'property': "active",
              'onChange': _0x1927b0 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Auto Ice",
              'object': _0x73cd4e.AutoIce,
              'property': "active",
              'onChange': _0x9265bc => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Auto Land",
              'object': _0x73cd4e.AutoLand,
              'property': "active",
              'onChange': _0x2f6d7d => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'checkbox',
              'label': 'Auto\x20Tame',
              'object': _0x73cd4e.AutoTame,
              'property': "active",
              'onChange': _0x3bdc45 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Auto Furnace",
              'object': _0x73cd4e.AutoFurnace,
              'property': "active",
              'onChange': _0x4455d5 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Auto Hat",
              'object': _0x73cd4e.AutoHat,
              'property': "active",
              'onChange': _0x32e26e => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'checkbox',
              'label': "Auto Diving",
              'object': _0x73cd4e.AutoDiving,
              'property': "active",
              'onChange': _0xea45a1 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Auto Unlock",
              'object': _0x73cd4e.AutoUnlock,
              'property': "active",
              'onChange': _0x2b90a3 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'checkbox',
              'label': 'Auto\x20Totem',
              'object': _0x73cd4e.AutoTotem,
              'property': "active",
              'onChange': _0x560a8c => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Auto Seed",
              'object': _0x73cd4e.AutoSeed,
              'property': 'active',
              'onChange': _0x196324 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Auto Crown",
              'object': _0x73cd4e.AutoCrown,
              'property': "active",
              'onChange': _0x36965f => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Extractor Put",
              'object': _0x73cd4e.AutoExtPut,
              'property': "active",
              'onChange': _0x4d5474 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "checkbox",
              'label': "Bread Put",
              'object': _0x73cd4e.AutoBreadPut,
              'property': "active",
              'onChange': _0x2e7c3c => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "subfolder",
              'label': "Aimbot Settings",
              'subfolder': [{
                'type': "checkbox",
                'label': 'Aimbot',
                'object': _0x73cd4e.Aimbot,
                'property': 'active',
                'onChange': _0x1cd8c1 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'checkbox',
                'label': "Show Range",
                'object': _0x73cd4e.Aimbot,
                'property': 'rangeVisual',
                'onChange': _0x4b92da => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "select",
                'label': "Attack Mode",
                'object': _0x73cd4e.Aimbot,
                'property': "mode",
                'options': ["Only Attack", "Attack & Chase", 'Rabbit\x20Chase'],
                'onChange': _0x319491 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "range",
                'label': "Bow Range",
                'min': 100,
                'max': 500,
                'step': 10,
                'object': _0x73cd4e.Aimbot,
                'property': "BowRange",
                'onChange': _0x4db8a9 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': 'subfolder',
              'label': 'Auto\x20Build\x20Settings',
              'subfolder': [{
                'type': "checkbox",
                'label': "Auto Build",
                'object': _0x73cd4e.AutoBuild,
                'property': "active",
                'onChange': _0xc519b9 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "select",
                'label': "Mode",
                'object': _0x73cd4e.AutoBuild,
                'property': "mode",
                'options': ['Bridges', 'Roofs', "Plots"],
                'onChange': _0x177cd0 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': "subfolder",
              'label': "Spectator Settings",
              'subfolder': [{
                'type': 'checkbox',
                'label': 'Spectator',
                'object': _0x40b9f1,
                'onChange': _0x3819bc => {
                  _0x40b9f1 = !_0x40b9f1;
                }
              }, {
                'type': 'range',
                'label': "Speed",
                'min': 10,
                'max': 100,
                'step': 5,
                'object': _0x73cd4e.Spectator,
                'property': "speed",
                'onChange': _0x51669c => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': 'range',
              'label': "Put To Chest",
              'min': 10,
              'max': 8000,
              'step': 1,
              'object': _0x73cd4e,
              'property': "putToChest",
              'onChange': _0x55104d => {
                _0xa896c1.saveSettings();
              }
            }],
            
            'Crafting': [{
              'type': 'subfolder',
              'label': "Auto Craft Settings",
              'subfolder': [{
                'type': 'checkbox',
                'label': "Auto Craft",
                'object': _0x73cd4e.AutoCraft,
                'property': "active",
                'onChange': _0x31f3a8 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "bind",
                'label': 'AutoCraft\x20Key:',
                'buttonTextObject': _0x73cd4e.AutoCraft,
                'buttonTextProperty': "bind",
                'onChange': _0x2494f8 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': "subfolder",
              'label': 'Auto\x20Recycle\x20Settings',
              'subfolder': [{
                'type': "checkbox",
                'label': "Auto Recycle",
                'object': _0x73cd4e.AutoRecycle,
                'property': "active",
                'onChange': _0x171497 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'bind',
                'label': "AutoRecycle Key:",
                'buttonTextObject': _0x73cd4e.AutoRecycle,
                'buttonTextProperty': "bind",
                'onChange': _0x3ea622 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': "subfolder",
              'label': "Smart Craft Settings",
              'subfolder': [{
                'type': "checkbox",
                'label': 'Smart\x20Craft',
                'object': _0x73cd4e.SmartCraft,
                'property': 'active',
                'onChange': _0x477958 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "bind",
                'label': "SmartCraft Key:",
                'buttonTextObject': _0x73cd4e.SmartCraft,
                'buttonTextProperty': "bind",
                'onChange': _0x3a0039 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'select',
                'label': "Craft Mode",
                'subOption': !![],
                'object': _0x73cd4e.SmartCraft,
                'property': "option",
                'options': ["Reidite Spike Doors", "Amethyst Spike Doors", "Reidite Walls", "Reidite Spikes", "Amethyst Spikes", "Diamond Spikes", 'Gold\x20Spikes', "Reidite Swords", "Reidite Spears", 'Reidite\x20Helmets', "Reidite Shields"],
                'onChange': _0x2b84b8 => {
                  _0xa896c1.saveSettings(), _0x3effc6 = -1;
                }
              }, {
                'type': 'range',
                'label': "Craft Amount",
                'subOption': !![],
                'min': 1,
                'max': 1000,
                'step': 1,
                'object': _0x73cd4e.SmartCraft,
                'property': "amount",
                'onChange': _0xf060fc => {
                  _0xa896c1.saveSettings();
                }
              }]
            }],
            'Spiking': [{
              'type': "subfolder",
              'label': 'Auto\x20Spike\x20Settings',
              'subfolder': [{
                'type': 'bind',
                'label': "AutoSpike Key:",
                'buttonTextObject': _0x73cd4e.AutoSpike,
                'buttonTextProperty': "bind",
                'onChange': _0x4b258d => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "select",
                'label': "AutoSpike Mode",
                'subOption': !![],
                'object': _0x73cd4e.AutoSpike,
                'property': "mode",
                'options': ['Normal', 'Hidden'],
                'onChange': _0x53df15 => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': 'subfolder',
              'label': 'Auto\x20Wall\x20Settings',
              'subfolder': [{
                'type': "bind",
                'label': "AutoWall Key:",
                'buttonTextObject': _0x73cd4e.AutoWall,
                'buttonTextProperty': 'bind',
                'onChange': _0x2f7ca7 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "select",
                'label': "AutoWall Mode",
                'subOption': !![],
                'object': _0x73cd4e.AutoWall,
                'property': "mode",
                'options': ["Normal", "Hidden"],
                'onChange': _0x1fe71b => {
                  _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': "range",
              'label': 'Hidden\x20Speed',
              'min': 0,
              'max': 10,
              'step': 1,
              'object': _0x73cd4e.AutoSpike,
              'property': "speed",
              'onChange': _0x2a2d8b => {
                _0xa896c1.saveSettings();
              }
            }],
'Farming': [{
              'type': "subfolder",
              'label': "Auto Farm Settings",
              'subfolder': [{
                'type': "checkbox",
                'label': "AutoFarm",
                'object': _0x73cd4e.AutoFarm,
                'property': 'active',
                'onChange': _0x5483af => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'bind',
                'label': "AutoFarm Key:",
                'buttonTextObject': _0x73cd4e.AutoFarm,
                'buttonTextProperty': "bind",
                'onChange': _0x13512b => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'text',
                'label': 'Allowed Players (IDs)',
                'object': _0x73cd4e.AutoFarm,
                'property': 'whitelist',
                'onChange': val => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'button',
                'label': 'Top\x20left\x20of\x20farm',
                'action': _0x1d3881 => {
                  let _0x3a2ba0 = gameWorld.fast_units[_0x57f7e4.uid];
                  _0x3a2ba0 && (_0x73cd4e.AutoFarm.TLX = _0x3a2ba0.x, _0x73cd4e.AutoFarm.TLY = _0x3a2ba0.y), _0xa896c1.saveSettings();
                }
              }, {
                'type': "button",
                'label': 'Bottom\x20right\x20of\x20farm',
                'action': _0x436091 => {
                  let _0x2c3b9d = gameWorld.fast_units[_0x57f7e4.uid];
                  _0x2c3b9d && (_0x73cd4e.AutoFarm.BRX = _0x2c3b9d.x, _0x73cd4e.AutoFarm.BRY = _0x2c3b9d.y), _0xa896c1.saveSettings();
                }
              }, {
                'type': "button",
                'label': "Safe Point",
                'action': _0x4e8c09 => {
                  let _0x102fde = gameWorld.fast_units[_0x57f7e4.uid];
                  _0x102fde && (_0x73cd4e.AutoFarm.SX = _0x102fde.x, _0x73cd4e.AutoFarm.SY = _0x102fde.y), _0xa896c1.saveSettings();
                }
              }]
            }, {
              'type': 'button',
              'label': 'drop b (Berries)',
              'action': () => {} // Нічого не робить, змінити не можна
            }, {
              'type': 'button',
              'label': 'drop w (Wheat)',
              'action': () => {}
            }, {
              'type': 'button',
              'label': 'drop p (Pumpkin)',
              'action': () => {}
            }, {
              'type': 'button',
              'label': 'drop c (Carrot)',
              'action': () => {}
            }, {
              'type': 'button',
              'label': 'drop to (Tomato)',
              'action': () => {}
            }, {
              'type': 'button',
              'label': 'drop th (Thornbush)',
              'action': () => {}
            }, {
              'type': 'button',
              'label': 'drop g (Garlic)',
              'action': () => {}
            }, {
              'type': 'button',
              'label': 'drop wm (Watermelon)',
              'action': () => {}
            }, {
              'type': 'button',
              'label': 'drop all',
              'action': () => {}
            }],
            'Binds': [{
              'type': "bind",
              'label': "Spectator Key:",
              'buttonTextObject': _0x73cd4e.Spectator,
              'buttonTextProperty': "bind",
              'onChange': _0x23e427 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': "DropSword Key:",
              'buttonTextObject': _0x73cd4e.DropSword,
              'buttonTextProperty': 'bind',
              'onChange': _0x33193b => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': 'bind',
              'label': "Xray Key:",
              'buttonTextObject': _0x73cd4e.Xray,
              'buttonTextProperty': 'bind',
              'onChange': _0x355268 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': "Hide Script Key:",
              'buttonTextObject': _0x73cd4e.Hidden,
              'buttonTextProperty': 'bind',
              'onChange': _0x2e9e78 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': 'AutoTame\x20Key:',
              'buttonTextObject': _0x73cd4e.AutoTame,
              'buttonTextProperty': "bind",
              'onChange': _0x128d49 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': 'Aimbot\x20Key:',
              'buttonTextObject': _0x73cd4e.Aimbot,
              'buttonTextProperty': "bind",
              'onChange': _0x465795 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': 'AutoFire\x20Key:',
              'buttonTextObject': _0x73cd4e.AutoFire,
              'buttonTextProperty': "bind",
              'onChange': _0x2eb889 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': "AutoBuild Key:",
              'buttonTextObject': _0x73cd4e.AutoBuild,
              'buttonTextProperty': 'bind',
              'onChange': _0x21bc73 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': "AutoCrown Key:",
              'buttonTextObject': _0x73cd4e.AutoCrown,
              'buttonTextProperty': "bind",
              'onChange': _0x49aa9f => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': 'AutoTotem\x20Key:',
              'buttonTextObject': _0x73cd4e.AutoTotem,
              'buttonTextProperty': "bind",
              'onChange': _0x29f6c4 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': "Bread Put Key:",
              'buttonTextObject': _0x73cd4e.AutoBreadPut,
              'buttonTextProperty': "bind",
              'onChange': _0x8343f2 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': 'AutoEmerald\x20Key:',
              'buttonTextObject': _0x73cd4e.AutoEmerald,
              'buttonTextProperty': 'bind',
              'onChange': _0x2f41e3 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': "Extractor Put Key:",
              'buttonTextObject': _0x73cd4e.AutoExtPut,
              'buttonTextProperty': "bind",
              'onChange': _0x485be4 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "bind",
              'label': "AutoFurnace:",
              'buttonTextObject': _0x73cd4e.AutoFurnace,
              'buttonTextProperty': 'bind',
              'onChange': _0x5e9ce7 => {
                _0xa896c1.saveSettings();
              }
            }],
            'Token': [{
              'type': 'text',
              'label': "Token",
              'object': _0x73cd4e.localToken,
              'property': "Token",
              'onChange': _0xb73b69 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "text",
              'label': "Token ID",
              'object': _0x73cd4e.localToken,
              'property': "TokenID",
              'onChange': _0x5bfc13 => {
                _0xa896c1.saveSettings();
              }
            }, {
              'type': "button",
              'label': "Generate Kit Token",
              'action': _0x23b494 => {
                const _0x2522d5 = _0x4ec54b(14);
                _0x73cd4e.localToken.Token = _0x2522d5, _0x195483('starve_token', _0x2522d5), _0xa896c1.saveSettings();
              }
            }, {
              'type': "button",
              'label': "Copy Token",
              'action': _0xd59d => {
                prompt("Copy this", "```Token: " + _0x73cd4e.localToken.Token + "\nTokenID: " + _0x73cd4e.localToken.TokenID + "```");
              }
            }, {
              'type': "button",
              'label': "Back To Lobby",
              'action': _0x4796d7 => {
                (_0x2a8f98 || _0x3b2ae4.WUA.enabled && _0x53166f.websocket.readyState != 1) && _0x12a87d("#3b3b3b", 'Are\x20you\x20sure\x20you\x20would\x20like\x20to\x20go\x20back\x20to\x20the\x20lobby?', 1, function (_0x3a2d3e) {
                  _0x3a2d3e && (_0x2a8f98 = 0, _0x3a4970 = 1, _0x53166f.websocket && _0x53166f.websocket.close(), _0x46233c.WTG(_0x45020e.WTK));
                });
              }
            }],
            'Shop': [
                {
                    'type': 'range',
                    'label': 'Wood Amount',
                    'min': 1, 'max': 10000, 'step': 1,
                    'object': _0x73cd4e,
                    'property': 'market.wood'
                }, {
                    'type': 'button',
                    'label': 'Buy Wood',
                    'action': () => {
                        window.arctSendBuyPacket(0, _0x73cd4e['market.wood'] || 100);
                    }
                },
                {
                    'type': 'range',
                    'label': 'Stone Amount',
                    'min': 1, 'max': 10000, 'step': 1,
                    'object': _0x73cd4e,
                    'property': 'market.stone'
                }, {
                    'type': 'button',
                    'label': 'Buy Stone',
                    'action': () => {
                        window.arctSendBuyPacket(1, _0x73cd4e['market.stone'] || 100);
                    }
                },
                {
                    'type': 'range',
                    'label': 'Gold Amount',
                    'min': 1, 'max': 10000, 'step': 1,
                    'object': _0x73cd4e,
                    'property': 'market.gold'
                }, {
                    'type': 'button',
                    'label': 'Buy Gold',
                    'action': () => {
                        window.arctSendBuyPacket(2, _0x73cd4e['market.gold'] || 100);
                    }
                },
                {
                    'type': 'range',
                    'label': 'Diamond Amount',
                    'min': 1, 'max': 10000, 'step': 1,
                    'object': _0x73cd4e,
                    'property': 'market.diamond'
                }, {
                    'type': 'button',
                    'label': 'Buy Diamond',
                    'action': () => {
                        window.arctSendBuyPacket(3, _0x73cd4e['market.diamond'] || 100);
                    }
                },
                {
                    'type': 'range',
                    'label': 'Amethyst Amount',
                    'min': 1, 'max': 10000, 'step': 1,
                    'object': _0x73cd4e,
                    'property': 'market.amethyst'
                }, {
                    'type': 'button',
                    'label': 'Buy Amethyst',
                    'action': () => {
                        window.arctSendBuyPacket(4, _0x73cd4e['market.amethyst'] || 100);
                    }
                },
                {
                    'type': 'range',
                    'label': 'Reidite Amount',
                    'min': 1, 'max': 10000, 'step': 1,
                    'object': _0x73cd4e,
                    'property': 'market.reidite'
                }, {
                    'type': 'button',
                    'label': 'Buy Reidite',
                    'action': () => {
                        window.arctSendBuyPacket(5, _0x73cd4e['market.reidite'] || 100);
                    }
                }
            ],
            'Skin\x20Changer': [{
              'type': 'subfolder',
              'label': 'Skin',
              'subfolder': [{
                'type': "checkbox",
                'label': 'Skin\x20Changer',
                'object': _0x73cd4e.skinChanger,
                'property': "active",
                'onChange': _0x2e7b16 => {
                  _0xa896c1.saveSettings();
                  let _0x103a2f = gameWorld.fast_units[_0x57f7e4.uid],
                    _0x96ab95 = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
                  _0x103a2f && _0x29c840.skin && (_0x103a2f[_0x29c840.skin] = _0x73cd4e.skinChanger.active ? _0x73cd4e.skinChanger.skin : _0x3dcaab, _0x96ab95[_0x29c840.skin] = _0x103a2f[_0x29c840.skin]);
                }
              }, {
                'type': 'range',
                'label': "Skin ID",
                'min': 0,
                'max': 270,
                'step': 1,
                'object': _0x73cd4e.skinChanger,
                'property': "skin",
                'onChange': _0x295f0a => {
                  _0xa896c1.saveSettings();
                  let _0x1a7eaf = gameWorld.fast_units[_0x57f7e4.uid],
                    _0x3b0aae = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
                  _0x1a7eaf && _0x29c840.skin && _0x73cd4e.skinChanger.active && (_0x1a7eaf[_0x29c840.skin] = _0x73cd4e.skinChanger.skin, _0x3b0aae[_0x29c840.skin] = _0x1a7eaf[_0x29c840.skin]);
                }
              }]
            }, {
              'type': "subfolder",
              'label': "Accessories",
              'subfolder': [{
                'type': "checkbox",
                'label': "Accessories Changer",
                'object': _0x73cd4e.accChanger,
                'property': 'active',
                'onChange': _0xc559e9 => {
                  _0xa896c1.saveSettings();
                  let _0x5a97ff = gameWorld.fast_units[_0x57f7e4.uid],
                    _0x2564cf = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
                  _0x5a97ff && _0x29c840.acc && (_0x5a97ff[_0x29c840.acc] = _0x73cd4e.accChanger.active ? _0x73cd4e.accChanger.acc : _0x2179a8, _0x2564cf[_0x29c840.acc] = _0x5a97ff[_0x29c840.acc]);
                }
              }, {
                'type': 'range',
                'label': "Accessories ID",
                'min': 0,
                'max': 120,
                'step': 1,
                'object': _0x73cd4e.accChanger,
                'property': "acc",
                'onChange': _0x16db3f => {
                  _0xa896c1.saveSettings();
                  let _0x6c1bb9 = gameWorld.fast_units[_0x57f7e4.uid],
                    _0x2fef6b = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
                  _0x6c1bb9 && _0x29c840.acc && _0x73cd4e.accChanger.active && (_0x6c1bb9[_0x29c840.acc] = _0x73cd4e.accChanger.acc, _0x2fef6b[_0x29c840.acc] = _0x6c1bb9[_0x29c840.acc]);
                }
              }]
            }, {
              'type': 'subfolder',
              'label': "Bag",
              'subfolder': [{
                'type': 'checkbox',
                'label': "Bag Changer",
                'object': _0x73cd4e.bagChanger,
                'property': "active",
                'onChange': _0x22a537 => {
                  _0xa896c1.saveSettings();
                  let _0x59055f = gameWorld.fast_units[_0x57f7e4.uid],
                    _0x33aa2b = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
                  _0x59055f && _0x29c840.bag && (_0x59055f[_0x29c840.bag] = _0x73cd4e.bagChanger.active ? _0x73cd4e.bagChanger.bag : _0x114a1d, _0x33aa2b[_0x29c840.bag] = _0x59055f[_0x29c840.bag]);
                }
              }, {
                'type': "range",
                'label': "Bag ID",
                'min': 0,
                'max': 81,
                'step': 1,
                'object': _0x73cd4e.bagChanger,
                'property': 'bag',
                'onChange': _0x1a90d4 => {
                  _0xa896c1.saveSettings();
                  let _0x51a3f1 = gameWorld.fast_units[_0x57f7e4.uid],
                    _0x52b1d7 = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
                  _0x51a3f1 && _0x29c840.bag && _0x73cd4e.bagChanger.active && (_0x51a3f1[_0x29c840.bag] = _0x73cd4e.bagChanger.bag, _0x52b1d7[_0x29c840.bag] = _0x51a3f1[_0x29c840.bag]);
                }
              }]
            }, {
              'type': "subfolder",
              'label': 'Book',
              'subfolder': [{
                'type': "checkbox",
                'label': "Book Changer",
                'object': _0x73cd4e.bookChanger,
                'property': 'active',
                'onChange': _0x3bcfba => {
                  _0xa896c1.saveSettings();
                  let _0x5a746a = gameWorld.fast_units[_0x57f7e4.uid],
                    _0x2d3826 = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
                  _0x5a746a && _0x29c840.book && (_0x5a746a[_0x29c840.book] = _0x73cd4e.bookChanger.active ? _0x73cd4e.bookChanger.book : _0x4f9f49, _0x2d3826[_0x29c840.book] = _0x5a746a[_0x29c840.book]);
                }
              }, {
                'type': "range",
                'label': "Book ID",
                'min': 0,
                'max': 49,
                'step': 1,
                'object': _0x73cd4e.bookChanger,
                'property': "book",
                'onChange': _0xbdffbd => {
                  _0xa896c1.saveSettings();
                  let _0x37482d = gameWorld.fast_units[_0x57f7e4.uid],
                    _0xc10a5a = gameWorld.WTN[_0x57f7e4.uid / _0x57f7e4.max_units];
                  _0x37482d && _0x29c840.book && _0x73cd4e.bookChanger.active && (_0x37482d[_0x29c840.book] = _0x73cd4e.bookChanger.book, _0xc10a5a[_0x29c840.book] = _0x37482d[_0x29c840.book]);
                }
              }]
            }, {
              'type': 'subfolder',
              'label': 'Radar Settings',
              'subfolder': [{
                'type': 'button',
                'label': 'Set Radar Name',
                'action': _0xRadarBtn => {
                  let currentName = localStorage.getItem('arct_radar_name') || "";
                  let newName = prompt("Enter Radar Name (max 15 chars):", currentName);
                  if (newName !== null && newName.trim() !== "") {
                    localStorage.setItem('arct_radar_name', newName.trim());
                  }
                }
              }]
            }, {
              'type': 'subfolder',
              'label': "Market",
              'subfolder': [{
                'type': 'range',
                'label': "Berries Amount",
                'min': 0,
                'max': 999,
                'step': 1,
                'object': _0x73cd4e.market,
                'property': "wood",
                'onChange': _0x21b417 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'button',
                'label': "Convert Berries",
                'action': _0x263410 => {
                  let _0x4bfe4f = 83,
                    _0x4a63f8 = _0x73cd4e.market.wood,
                    _0x359d6a = Math.floor(_0x4a63f8 / _0x4bfe4f),
                    _0x43b67d = _0x4a63f8 - _0x359d6a * _0x4bfe4f;
                  _0x73cd4e.market.wood = _0x4bfe4f;
                  for (let _0x2345f9 = 0; _0x2345f9 < _0x359d6a > 0 ? _0x359d6a : 0; _0x2345f9++) {
                    _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("wood", _0x73cd4e.market));
                  }
                  _0x73cd4e.market.wood = _0x43b67d < _0x3b2ae4.WUU.WUV[_0x44c140.PLANT] ? _0x43b67d : _0x3b2ae4.WUU.WUV[_0x44c140.PLANT], _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("wood", _0x73cd4e.market)), _0x73cd4e.market.wood = _0x4a63f8;
                }
              }, {
                'type': "range",
                'label': "Pumpkin Amount",
                'min': 0,
                'max': 999,
                'step': 1,
                'object': _0x73cd4e.market,
                'property': "stone",
                'onChange': _0x4f1481 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "button",
                'label': "Convert Pumpkin",
                'action': _0x30a81b => {
                  let _0x5b3876 = 62,
                    _0xd0db6b = _0x73cd4e.market.stone,
                    _0xbf24c5 = Math.floor(_0xd0db6b / _0x5b3876),
                    _0x17d2e0 = _0xd0db6b - _0xbf24c5 * _0x5b3876;
                  _0x73cd4e.market.stone = _0x5b3876;
                  for (let _0x24767e = 0; _0x24767e < _0xbf24c5 > 0 ? _0xbf24c5 : 0; _0x24767e++) {
                    _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("stone", _0x73cd4e.market));
                  }
                  _0x73cd4e.market.stone = _0x17d2e0 < _0x3b2ae4.WUU.WUV[_0x44c140.PLANT] ? _0x17d2e0 : _0x3b2ae4.WUU.WUV[_0x44c140.PLANT], _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("stone", _0x73cd4e.market)), _0x73cd4e.market.stone = _0xd0db6b;
                }
              }, {
                'type': 'range',
                'label': "Bread Amount",
                'min': 0,
                'max': 999,
                'step': 1,
                'object': _0x73cd4e.market,
                'property': 'gold',
                'onChange': _0x1d1bd0 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "button",
                'label': "Convert Bread",
                'action': _0x124b84 => {
                  let _0x26f37d = 41,
                    _0xe48f59 = _0x73cd4e.market.gold,
                    _0x27236f = Math.floor(_0xe48f59 / _0x26f37d),
                    _0x383e91 = _0xe48f59 - _0x27236f * _0x26f37d;
                  _0x73cd4e.market.gold = _0x26f37d;
                  for (let _0x70d0d4 = 0; _0x70d0d4 < _0x27236f > 0 ? _0x27236f : 0; _0x70d0d4++) {
                    _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("gold", _0x73cd4e.market));
                  }
                  _0x73cd4e.market.gold = _0x383e91 < _0x3b2ae4.WUU.WUV[_0x44c140.PLANT] ? _0x383e91 : _0x3b2ae4.WUU.WUV[_0x44c140.PLANT], _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("gold", _0x73cd4e.market)), _0x73cd4e.market.gold = _0xe48f59;
                }
              }, {
                'type': "range",
                'label': "Carrot Amount",
                'min': 0,
                'max': 999,
                'step': 1,
                'object': _0x73cd4e.market,
                'property': "diamond",
                'onChange': _0x5619b4 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': "button",
                'label': 'Convert\x20Carrot',
                'action': _0x32da54 => {
                  let _0x668013 = 252,
                    _0x2a6a7a = _0x73cd4e.market.diamond,
                    _0xd5a182 = Math.floor(_0x2a6a7a / _0x668013),
                    _0x3858ad = _0x2a6a7a - _0xd5a182 * _0x668013;
                  _0x73cd4e.market.diamond = _0x668013;
                  for (let _0x4d3cc4 = 0; _0x4d3cc4 < _0xd5a182 > 0 ? _0xd5a182 : 0; _0x4d3cc4++) {
                    _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("diamond", _0x73cd4e.market));
                  }
                  _0x73cd4e.market.diamond = _0x3858ad < _0x3b2ae4.WUU.WUV[_0x44c140.PLANT] ? _0x3858ad : _0x3b2ae4.WUU.WUV[_0x44c140.PLANT], _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("diamond", _0x73cd4e.market)), _0x73cd4e.market.diamond = _0x2a6a7a;
                }
              }, {
                'type': "range",
                'label': 'Tomato\x20Amount',
                'min': 0,
                'max': 999,
                'step': 1,
                'object': _0x73cd4e.market,
                'property': "amethyst",
                'onChange': _0x1461c7 => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'button',
                'label': "Convert Tomato",
                'action': _0x52df01 => {
                  let _0x8d4e7f = 248,
                    _0x20a5ae = _0x73cd4e.market.amethyst,
                    _0x624370 = Math.floor(_0x20a5ae / _0x8d4e7f),
                    _0x2f4295 = _0x20a5ae - _0x624370 * _0x8d4e7f;
                  _0x73cd4e.market.amethyst = _0x8d4e7f;
                  for (let _0x1fdb54 = 0; _0x1fdb54 < _0x624370 > 0 ? _0x624370 : 0; _0x1fdb54++) {
                    _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("amethyst", _0x73cd4e.market));
                  }
                  _0x73cd4e.market.amethyst = _0x2f4295 < _0x3b2ae4.WUU.WUV[_0x44c140.PLANT] ? _0x2f4295 : _0x3b2ae4.WUU.WUV[_0x44c140.PLANT], _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("amethyst", _0x73cd4e.market)), _0x73cd4e.market.amethyst = _0x20a5ae;
                }
              }, {
                'type': "range",
                'label': "Thornbush Amount",
                'min': 0,
                'max': 999,
                'step': 1,
                'object': _0x73cd4e.market,
                'property': "reidite",
                'onChange': _0xdc882e => {
                  _0xa896c1.saveSettings();
                }
              }, {
                'type': 'button',
                'label': "Convert Thornbush",
                'action': _0x1f5a79 => {
                  let _0x54ee7b = 240,
                    _0x5808a8 = _0x73cd4e.market.reidite,
                    _0x305180 = Math.floor(_0x5808a8 / _0x54ee7b),
                    _0x3e6338 = _0x5808a8 - _0x305180 * _0x54ee7b;
                  _0x73cd4e.market.reidite = _0x54ee7b;
                  for (let _0x59ba77 = 0; _0x59ba77 < _0x305180 > 0 ? _0x305180 : 0; _0x59ba77++) {
                    _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("reidite", _0x73cd4e.market));
                  }
                  _0x73cd4e.market.reidite = _0x3e6338 < _0x3b2ae4.WUU.WUV[_0x44c140.PLANT] ? _0x3e6338 : _0x3b2ae4.WUU.WUV[_0x44c140.PLANT], _0x53166f.websocket && _0x53166f.websocket.readyState === 1 && _0x53166f.WQN(_0x548135("reidite", _0x73cd4e.market)), _0x73cd4e.market.reidite = _0x5808a8;
                }
              }]
            }]
          }
        };
        let _0xbf4bc9;
        const _0x2fa324 = localStorage.getItem("guiSettings");
        _0xbf4bc9 = _0x2fa324 ? JSON.parse(_0x2fa324) : null;
        Array.isArray(_0xbf4bc9) && _0xbf4bc9.length && (_0x451f8b.align = _0xbf4bc9[0], _0x451f8b.toggleGuiKey = _0xbf4bc9[1], _0x451f8b.toggleGuiButton = _0xbf4bc9[2], _0x451f8b.draggable = _0xbf4bc9[3], _0x451f8b.fontSize = _0xbf4bc9[4], _0x451f8b.opacity = _0xbf4bc9[5], _0x451f8b.width = _0xbf4bc9[6], _0x451f8b.height = _0xbf4bc9[7]);
        async function _0x40e97d(_0xae0415) {
          if (!_0xae0415 || !_0xae0415.length) try {
            const _0x2f13c2 = localStorage.getItem('settings_all');
            _0x2f13c2 ? _0xae0415 = JSON.parse(_0x2f13c2) : _0xae0415 = [];
          } catch (_0x192834) {
            console.context().log("Failed to parse settings_all", _0x192834), _0xae0415 = [];
          }
          const _0x20e900 = _0xd119fc(_0x73cd4e),
            _0x349bed = _0x20e900.filter(_0x1724ad => !(_0x1724ad in _0x122c9c)),
            _0x1c4986 = Object.keys(_0x122c9c).filter(_0x51ef68 => !_0x20e900.includes(_0x51ef68));
          if (_0x349bed.length || _0x1c4986.length) {
            _0x2dad3 ? (console.context().log("Missing from map:", _0x349bed), console.context().log("Extra in map:", _0x1c4986), alert("[SettingsIDS]: Missing SettingsIDS For Some Settings (Check Console)")) : alert("[SETTINGS]: Failed To Load");
            return;
          }
          _0xae0415.length ? _0xae0415.forEach(([_0x388568, _0x30f088]) => {
            _0x5cf49a[_0x388568] && _0x5cf49a[_0x388568].set(_0x30f088);
          }) : _0xa896c1.saveSettings();
          _0x73cd4e.timePlayed.resetClock = !![], _0x73cd4e.Hidden.active = ![];
          _0x307e7f("starve_token") !== _0x73cd4e.localToken.Token && _0x195483("starve_token", _0x73cd4e.localToken.Token);
          (_0x73cd4e.localToken.Token === "null" || !_0x73cd4e.localToken.Token || _0x73cd4e.localToken.Token.length < 14) && (console.context().log(_0x73cd4e.localToken.Token), _0xa896c1.saveSettings());
          _0x307e7f('starve_token_id') !== _0x73cd4e.localToken.TokenID && _0x195483('starve_token_id', _0x73cd4e.localToken.TokenID);
          _0x1eeacd(), _0x440a80(), _0x2445ce();
          const _0x438e1b = document.getElementById("game_canvas");
          _0x438e1b && (_0x438e1b.style.filter = 'brightness(' + _0x73cd4e.canvasBrightness + ')');
        }
        _0xa896c1 = new _0xce89d6(_0x451f8b), _0x40e97d(), _0xa896c1.build(), _0x13e2be();
      }
      function _0x27b821() {
        Object.defineProperty = Object.defineProperty, _0x4cd684.setTimeout(() => {
          _0x17a4f9 = !![];
        }, 1000), _0x50734b = _0x4cd684.setInterval(() => {
          _0x123e88();
        }, 0);
      }
      function _0x140275() {
        if (_0x73cd4e.Hidden.active || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.showLeaderBoardLevels) {
          const _0x2e2330 = () => {
            const _0x3d6a0b = [];
            return _0x3b2ae4.WUQ.WUT.forEach(_0x13c566 => {
              const _0x5909f0 = gameWorld.WTN[_0x13c566];
              _0x3d6a0b.push(_0x5909f0.level);
            }), _0x3d6a0b;
          };
          let _0x7c0e84 = _0x3b2ae4.WUY.translate.y - 48;
          _0x2e2330().forEach(_0x14d420 => {
            _0x14d420 > 0 && (_0x507512.strokeStyle = "#ADD8E6", _0x507512.fillStyle = '#f9e8a2', _0x507512.lineWidth = 1, _0x507512.font = "15px Baloo Paaji", _0x14d420 >= 10 ? _0x507512.fillText('[' + _0x14d420 + ']', _0x3b2ae4.WUY.translate.x + 137, _0x7c0e84) : _0x507512.fillText('[' + _0x14d420 + ']', _0x3b2ae4.WUY.translate.x + 141, _0x7c0e84)), _0x7c0e84 += 22;
          });
        }
        if (_0x73cd4e.listEnabledHacks.mode != "Off" && !_0x73cd4e.Hidden.active) {
          if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
          let _0x202c38 = _0x73cd4e.listEnabledHacks.mode == "Bottom Left" ? document.defaultView.innerHeight - 25 : 25;
          for (let _0x2dc5ea in _0x73cd4e) {
            _0x73cd4e[_0x2dc5ea].active && _0x73cd4e[_0x2dc5ea].bind && (_0x507512.save(), _0x507512.font = "18px Baloo Paaji", _0x507512.strokeStyle = "black", _0x507512.lineWidth = 7, _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB", _0x507512.strokeText(_0x2dc5ea, 15, _0x202c38), _0x507512.fillText(_0x2dc5ea, 15, _0x202c38), _0x507512.restore(), _0x73cd4e.listEnabledHacks.mode == 'Bottom\x20Left' ? _0x202c38 -= 20 : _0x202c38 += 20);
          }
        }
      }
      function _0x5ddfe8() {
        let _0x1f266a = gameWorld.fast_units[_0x57f7e4.uid];
        for (let _0x15062a = 0; _0x15062a < gameWorld.units[EntityIDs.PLAYERS].length; _0x15062a++) {
          let _0x3a7ce6 = gameWorld.units[EntityIDs.PLAYERS][_0x15062a];
          Object.keys(_0x3a7ce6).forEach((_0x1a055a, _0x3c100c) => {
            _0x3c100c == 1 && (_0x57f7e4.pid = _0x1a055a), _0x3c100c == 6 && (_0x57f7e4.nangle = _0x1a055a), _0x3c100c == 12 && (_0x57f7e4.speed = _0x1a055a), _0x3c100c == 21 && (_0x57f7e4.dist_winter = _0x1a055a), _0x3c100c == 31 && (_0x57f7e4.tower = _0x1a055a), _0x3c100c == 34 && (_0x57f7e4.fly = _0x1a055a), _0x3c100c == 36 && (_0x57f7e4.draw = _0x1a055a), _0x3c100c == 37 && (_0x57f7e4.draw_vehicle = _0x1a055a), _0x3c100c == 42 && (_0x57f7e4.vehicle_fx5 = _0x1a055a), _0x3c100c == 43 && (_0x57f7e4.tower_fx = _0x1a055a), _0x3c100c == 44 && (_0x57f7e4.hit = _0x1a055a), _0x3c100c == 63 && (_0x57f7e4.vehicle = _0x1a055a), _0x3c100c == 65 && (_0x57f7e4.clothe = _0x1a055a), _0x3c100c == 66 && (_0x57f7e4.ghost = _0x1a055a), typeof _0x3a7ce6[_0x1a055a] === "function" && (_0x57f7e4.update = _0x1a055a), _0x1f266a && (_0x57f7e4.flyableEquiped = _0x1f266a[_0x57f7e4.vehicle]);
          });
        }
        if (_0x4487ac || _0x5bfa9a) for (let _0x32900f = 0; gameWorld.units[EntityIDs.CHEST].length > _0x32900f; _0x32900f++) {
          let _0xd97d46 = gameWorld.units[EntityIDs.CHEST][_0x32900f];
          if (_0x4487ac) {
            if (!_0x57f7e4.hit || !_0xd97d46 || !_0xd97d46[_0x57f7e4.hit]) continue;
            Object.keys(_0xd97d46[_0x57f7e4.hit]).forEach((_0x53b33b, _0x5a0035) => {
              if (_0x5a0035 === 0) {
                _0x57f7e4.anim = _0x53b33b;
                const _0x3fead8 = _0xd97d46[_0x57f7e4.hit][_0x57f7e4.anim];
                if (!_0x3fead8) return;
                const _0x2e27c4 = Object.keys(_0x3fead8);
                _0x57f7e4.o = _0x2e27c4[0], _0x57f7e4.v = _0x2e27c4[1], _0x4487ac = ![];
              }
            });
          }
          if (_0x5bfa9a) {
            const _0x52adc7 = (_0xd97d46.action | 0) / 2 - 1,
              _0x2e59b7 = _0x46233c.WTF[_0x52adc7];
            if (_0x52adc7 < 0 || !_0x2e59b7 || !_0x2e59b7.info) continue;
            Object.keys(_0x2e59b7.info).forEach((_0x57e815, _0x114bbb) => {
              if (_0x114bbb === 2) {
                _0x57f7e4.img = _0x57e815;
                const _0x37f71c = _0x2e59b7.info[_0x57e815]?.[0];
                if (!_0x37f71c) return;
                const _0x3d644a = Object.keys(_0x37f71c)[3];
                _0x3d644a && (_0x57f7e4.src = _0x3d644a, _0x5bfa9a = ![]);
              }
            });
          }
        }
        if (_0x3908cf) for (let _0x4b51cc = 0, _0x4712f7 = [...gameWorld.units[EntityIDs.ROOF]], _0x5e053d = _0x4712f7.length; _0x4b51cc < _0x5e053d; _0x4b51cc++) {
          let _0x4f4e9b = _0x4712f7[_0x4b51cc];
          _0x4f4e9b && (Object.keys(_0x4f4e9b).forEach((_0x5988ac, _0x28c1db) => {
            _0x28c1db == 15 && (_0x57f7e4.j = _0x5988ac), _0x28c1db == 16 && (_0x57f7e4.i = _0x5988ac), _0x28c1db == 18 && (_0x57f7e4.opacity = _0x5988ac), _0x3908cf = ![];
          }), Object.keys(_0x4f4e9b[_0x57f7e4.hit]).forEach((_0x3e1ced, _0x3f616b) => {
            _0x3f616b == 0 && (_0x57f7e4.anim = _0x3e1ced, Object.keys(_0x4f4e9b[_0x57f7e4.hit][_0x57f7e4.anim]).forEach((_0x3602dd, _0x41736b) => {
              _0x41736b == 0 && (_0x57f7e4.o = _0x3602dd), _0x41736b == 1 && (_0x57f7e4.v = _0x3602dd), _0x4487ac = ![];
            }));
          }));
        }
        if (_0x73cd4e.smoothRoofs || _0x73cd4e.Roof.active) for (let _0x37f78d = 0, _0x15d541 = [...gameWorld.units[EntityIDs.ROOF]], _0x4642d4 = _0x15d541.length; _0x37f78d < _0x4642d4; _0x37f78d++) {
          let _0x334093 = _0x15d541[_0x37f78d];
          if (!_0x334093.checked) try {
            !_0x439412.drawRoof && (_0x439412.drawRoof = _0x334093[_0x57f7e4.draw]), _0x334093[_0x57f7e4.draw] = function (_0x2b52fa) {
              if (!_0x73cd4e.Hidden.active && (_0x73cd4e.smoothRoofs || _0x73cd4e.Roof.active)) return _0x57ab4c(_0x334093);else _0x439412.drawRoof.call(this, _0x2b52fa);
            }, _0x334093.checked = !![];
          } catch (_0x1b0c2a) {
            console.context().log("Failed To Bind Roof Drawing", _0x1b0c2a);
          }
        }
        if (_0x73cd4e.ColoredSpikes.active) {
          try {
            for (let _0x434467 = 0, _0x450df0 = [...gameWorld.units[EntityIDs.WOOD_DOOR], ...gameWorld.units[EntityIDs.STONE_DOOR], ...gameWorld.units[EntityIDs.GOLD_DOOR], ...gameWorld.units[EntityIDs.DIAMOND_DOOR], ...gameWorld.units[EntityIDs.AMETHYST_DOOR], ...gameWorld.units[EntityIDs.REIDITE_DOOR], ...gameWorld.units[EntityIDs.WOOD_DOOR_SPIKE], ...gameWorld.units[EntityIDs.STONE_DOOR_SPIKE], ...gameWorld.units[EntityIDs.GOLD_DOOR_SPIKE], ...gameWorld.units[EntityIDs.DIAMOND_DOOR_SPIKE], ...gameWorld.units[EntityIDs.AMETHYST_DOOR_SPIKE], ...gameWorld.units[EntityIDs.REIDITE_DOOR_SPIKE]], _0x4eee2d = _0x450df0.length; _0x434467 < _0x4eee2d; _0x434467++) {
              let _0x8761a1 = _0x450df0[_0x434467];
              if (_0x8761a1) {
                _0x4487ac && Object.keys(_0x8761a1[_0x57f7e4.hit]).forEach((_0x1790d3, _0x576c79) => {
                  _0x576c79 == 0 && (_0x57f7e4.anim = _0x1790d3, Object.keys(_0x8761a1[_0x57f7e4.hit][_0x57f7e4.anim]).forEach((_0x2e4b99, _0x24c6bb) => {
                    _0x24c6bb == 0 && (_0x57f7e4.o = _0x2e4b99), _0x24c6bb == 1 && (_0x57f7e4.v = _0x2e4b99), _0x4487ac = ![];
                  }));
                });
                if (!_0x8761a1.checked) try {
                  !_0x439412.drawDoor && (_0x439412.drawDoor = _0x8761a1[_0x57f7e4.draw]), _0x8761a1[_0x57f7e4.draw] = function (_0x1f1067) {
                    return _0x73cd4e.ColoredSpikes.active && !(_0x8761a1.info & 1) && !_0x73cd4e.Hidden.active ? _0x26f78e(_0x8761a1) : _0x439412.drawDoor.call(this, _0x1f1067);
                  }, _0x8761a1.checked = !![];
                } catch (_0x4a30ab) {
                  console.context().log("Failed To Bind Door Drawing", _0x4a30ab);
                }
              }
            }
          } catch (_0x1c6663) {
            console.context().log("Failed To Define Door Drawing", _0x1c6663);
          }
          try {
            for (let _0x5ea373 = 0, _0x58cdc2 = [...gameWorld.units[EntityIDs.SPIKE], ...gameWorld.units[EntityIDs.STONE_SPIKE], ...gameWorld.units[EntityIDs.GOLD_SPIKE], ...gameWorld.units[EntityIDs.DIAMOND_SPIKE], ...gameWorld.units[EntityIDs.AMETHYST_SPIKE], ...gameWorld.units[EntityIDs.REIDITE_SPIKE]], _0x1672a0 = _0x58cdc2.length; _0x5ea373 < _0x1672a0; _0x5ea373++) {
              let _0x516d45 = _0x58cdc2[_0x5ea373];
              if (_0x516d45) {
                _0x4487ac && Object.keys(_0x516d45[_0x57f7e4.hit]).forEach((_0x2c1172, _0x4e8094) => {
                  _0x4e8094 == 0 && (_0x57f7e4.anim = _0x2c1172, Object.keys(_0x516d45[_0x57f7e4.hit][_0x57f7e4.anim]).forEach((_0x2e33ac, _0x20a5ff) => {
                    _0x20a5ff == 0 && (_0x57f7e4.o = _0x2e33ac), _0x20a5ff == 1 && (_0x57f7e4.v = _0x2e33ac), _0x4487ac = ![];
                  }));
                });
                if (!_0x516d45.checked) try {
                  !_0x439412.drawSpike && (_0x439412.drawSpike = _0x516d45[_0x57f7e4.draw]), _0x516d45[_0x57f7e4.draw] = function (_0x4f7192) {
                    return _0x73cd4e.ColoredSpikes.active && !_0x73cd4e.Hidden.active ? _0x5750a6(_0x516d45) : _0x439412.drawSpike.call(this, _0x4f7192);
                  }, _0x516d45.checked = !![];
                } catch (_0x4227ec) {
                  console.context().log("Failed To Bind Spike Drawing", _0x4227ec);
                }
              }
            }
          } catch (_0x2f820e) {
            console.context().log("Failed To Define Spike Drawing");
          }
        }
        if (_0x73cd4e.buildingInfo) {
          try {
            for (let _0x440918 = 0, _0xc900f6 = [...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_STONE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_GOLD], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_DIAMOND], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_AMETHYST], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_REIDITE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_EMERALD], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_COPPER], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_IRON], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_TOPAZ], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_SAPPHIRE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_JADE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_RUBY], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_COAL], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_AQUAMARINE]], _0x42d716 = _0xc900f6.length; _0x440918 < _0x42d716; _0x440918++) {
              let _0x5d416f = _0xc900f6[_0x440918];
              _0x5d416f && (!_0x5d416f.img && (_0x5d416f.img = new _0x24149b(90, 90, 1), _0x5d416f.info && _0x5d416f.img.drawText(_0x5d416f.info, 18, "black"), _0x5d416f[_0x57f7e4.update] = function () {
                _0x5d416f.info && _0x5d416f.img.drawText(_0x5d416f.info, 18, "black");
              }), _0x5d416f.info && (_0x507512.save(), _0x507512.drawImage(_0x5d416f.img.canvas, _0x3b2ae4.WUF.x + _0x5d416f.x - 30, _0x3b2ae4.WUF.y + _0x5d416f.y - 40), _0x507512.restore()));
            }
          } catch (_0x50098c) {
            console.context().log("Failed To Draw Extractor Building Info", _0x50098c);
          }
          try {
            for (let _0x25ca65 = 0, _0x26bd81 = gameWorld.units[EntityIDs.BREAD_OVEN], _0x390ec5 = _0x26bd81.length; _0x25ca65 < _0x390ec5; _0x25ca65++) {
              let _0x17723b = _0x26bd81[_0x25ca65];
              _0x17723b && (!_0x17723b.img && (_0x17723b.img = new _0x24149b(90, 90, 2), _0x17723b.info && _0x17723b.img.drawText(_0x17723b.info, 18, "black"), _0x17723b[_0x57f7e4.update] = function () {
                _0x17723b.info && _0x17723b.img.drawText(_0x17723b.info, 18, "black");
              }), _0x17723b.info && (_0x507512.save(), _0x507512.drawImage(_0x17723b.img.canvas, _0x3b2ae4.WUF.x + _0x17723b.x - 33, _0x3b2ae4.WUF.y + _0x17723b.y - 47), _0x507512.restore()));
            }
          } catch (_0x5e4a76) {
            console.context().log('Failed\x20To\x20Draw\x20Bread\x20Oven\x20Building\x20Info', _0x5e4a76);
          }
          try {
            for (let _0x4352d8 = 0, _0x402ba0 = gameWorld.units[EntityIDs.TOTEM], _0x3949d4 = _0x402ba0.length; _0x4352d8 < _0x3949d4; _0x4352d8++) {
              let _0x44b243 = _0x402ba0[_0x4352d8];
              _0x44b243 && (!_0x44b243.img && (_0x44b243.img = new _0x24149b(200, 100, 3), _0x44b243.info && _0x44b243.img.drawText(['[' + Object.values(gameWorld.WTN[_0x44b243[_0x57f7e4.pid]])[0] + ']', _0x44b243.info], 18, "black"), _0x44b243[_0x57f7e4.update] = function () {
                _0x44b243.info && _0x44b243.img.drawText(['[' + Object.values(gameWorld.WTN[_0x44b243[_0x57f7e4.pid]])[0] + ']', _0x44b243.info], 18, "black");
              }), _0x44b243.info && (_0x507512.save(), _0x507512.drawImage(_0x44b243.img.canvas, _0x3b2ae4.WUF.x + _0x44b243.x - 45, _0x3b2ae4.WUF.y + _0x44b243.y - 45), _0x507512.restore()));
            }
          } catch (_0xd8e8ff) {
            console.context().log("Failed To Draw Totem Building Info", _0xd8e8ff);
          }
          try {
            for (let _0x49e8b9 = 0, _0x5d923e = gameWorld.units[EntityIDs.WINDMILL], _0x44d01c = _0x5d923e.length; _0x49e8b9 < _0x44d01c; _0x49e8b9++) {
              let _0x40fe43 = _0x5d923e[_0x49e8b9];
              _0x40fe43 && (!_0x40fe43.img && (_0x40fe43.img = new _0x24149b(90, 90, 1), _0x40fe43.info && _0x40fe43.img.drawText(_0x40fe43.info, 18, "black"), _0x40fe43[_0x57f7e4.update] = function () {
                _0x40fe43.info && _0x40fe43.img.drawText(_0x40fe43.info, 18, "black");
              }), _0x40fe43.info && (_0x507512.save(), _0x507512.drawImage(_0x40fe43.img.canvas, _0x3b2ae4.WUF.x + _0x40fe43.x - 30, _0x3b2ae4.WUF.y + _0x40fe43.y - 40), _0x507512.restore()));
            }
          } catch (_0xe508c9) {
            console.context().log("Failed To Draw Windmill Building Info", _0xe508c9);
          }
          try {
            for (let _0x4ec6f8 = 0, _0x310832 = gameWorld.units[EntityIDs.FURNACE], _0xecfd0d = _0x310832.length; _0x4ec6f8 < _0xecfd0d; _0x4ec6f8++) {
              let _0x267a29 = _0x310832[_0x4ec6f8];
              if (_0x267a29) {
                if (!_0x267a29.img) {
                  _0x267a29.img = new _0x24149b(90, 70, 4);
                  _0x267a29.info && _0x267a29.img.drawText(_0x267a29.info, 18, 'black', "furnace");
                  let _0x197918 = _0x267a29[_0x57f7e4.update];
                  _0x267a29[_0x57f7e4.update] = function () {
                    return _0x267a29.info && _0x267a29.img.drawText(_0x267a29.info, 18, 'black', "furnace"), _0x197918.apply(this, arguments);
                  };
                }
                _0x267a29.info && _0x507512.save(), _0x507512.drawImage(_0x267a29.img.canvas, _0x3b2ae4.WUF.x + _0x267a29.x - 30, _0x3b2ae4.WUF.y + _0x267a29.y - 33), _0x507512.restore();
              }
            }
          } catch (_0x1fb54f) {
            console.context().log("Failed To Draw Furnace Building Info", _0x1fb54f);
          }
          try {
            for (let _0x4c2255 = 0, _0x4416c5 = gameWorld.units[EntityIDs.WELL], _0x45e314 = _0x4416c5.length; _0x4c2255 < _0x45e314; _0x4c2255++) {
              let _0x1c1bc9 = _0x4416c5[_0x4c2255];
              _0x1c1bc9 && (!_0x1c1bc9.img && (_0x1c1bc9.img = new _0x24149b(90, 70, 4), _0x1c1bc9.info && _0x1c1bc9.img.drawText(_0x1c1bc9.info, 18, "black"), _0x1c1bc9[_0x57f7e4.update] = function () {
                _0x1c1bc9.info && _0x1c1bc9.img.drawText(_0x1c1bc9.info, 18, 'black');
              }), _0x1c1bc9.info && (_0x507512.save(), _0x507512.drawImage(_0x1c1bc9.img.canvas, _0x3b2ae4.WUF.x + _0x1c1bc9.x - 30, _0x3b2ae4.WUF.y + _0x1c1bc9.y - 33), _0x507512.restore()));
            }
          } catch (_0x4224b8) {
            console.context().log('Failed\x20To\x20Draw\x20Well\x20Well\x20Info', _0x4224b8);
          }
          try {
            for (let _0x3028b0 = 0, _0x50e23d = gameWorld.units[EntityIDs.EMERALD_MACHINE], _0x20b4b8 = _0x50e23d.length; _0x3028b0 < _0x20b4b8; _0x3028b0++) {
              let _0x108025 = _0x50e23d[_0x3028b0];
              _0x108025 && (!_0x108025.img && (_0x108025.img = new _0x24149b(200, 60, 0), _0x108025.score = Object.values(gameWorld.WTN[_0x108025[_0x57f7e4.pid]])[13], _0x108025.img.drawText(['[' + Object.values(gameWorld.WTN[_0x108025[_0x57f7e4.pid]])[0] + ']', Object.values(gameWorld.WTN[_0x108025[_0x57f7e4.pid]])[13] / 1000 + 'k'], 18, "black", 'machine'), _0x108025[_0x57f7e4.update] = function () {
                _0x108025.info && _0x108025.img.drawText(['[' + Object.values(gameWorld.WTN[_0x108025[_0x57f7e4.pid]])[0] + ']', Object.values(gameWorld.WTN[_0x108025[_0x57f7e4.pid]])[13] / 1000 + 'k'], 18, 'black', "machine");
              }), _0x108025.info && (_0x108025.score != Object.values(gameWorld.WTN[_0x108025[_0x57f7e4.pid]])[13] && _0x108025[_0x57f7e4.update](), _0x507512.save(), _0x507512.drawImage(_0x108025.img.canvas, _0x3b2ae4.WUF.x + _0x108025.x - 55, _0x3b2ae4.WUF.y + _0x108025.y - 35), _0x507512.restore()));
            }
          } catch (_0x23a0b4) {
            console.context().log('Failed\x20To\x20Draw\x20Emerald\x20Machine\x20Info', _0x23a0b4);
          }
        }
        if (_0x73cd4e.chestInfo.active) for (let _0x3b154b = 0; gameWorld.units[EntityIDs.CHEST].length > _0x3b154b; _0x3b154b++) {
          let _0x1217a2 = gameWorld.units[EntityIDs.CHEST][_0x3b154b];
          if (!_0x1217a2.checked) {
            !_0x439412.drawChest && (_0x439412.drawChest = _0x1217a2[_0x57f7e4.draw]);
            try {
              _0x1217a2[_0x57f7e4.draw] = function () {
                if (_0x73cd4e.chestInfo.active && !_0x73cd4e.Hidden.active) return;else return _0x439412.drawChest.call(this);
              }, _0x1217a2.checked = !![];
            } catch (_0x1b3e9c) {
              console.context().log("Failed To Bind Chest Drawing", _0x1b3e9c);
            }
          }
          try {
            if (_0x73cd4e.chestInfo.active) {
              _0x507512.save(), _0x507512.translate(_0x3b2ae4.WUF.x + _0x1217a2.x, _0x3b2ae4.WUF.y + _0x1217a2.y), _0x507512.rotate(_0x1217a2.angle);
              let _0x30d31a = 0,
                _0x390660 = 0;
              if (_0x1217a2[_0x57f7e4.hit][_0x57f7e4.update]) {
                _0x1217a2[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.update]() && _0x1217a2[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.o] == ![] && (_0x1217a2[_0x57f7e4.hit][_0x57f7e4.update] = ![]);
                let _0x146d49 = (1 - _0x1217a2[_0x57f7e4.hit][_0x57f7e4.anim][_0x57f7e4.v]) * _0xcdfe98 * 600;
                _0x30d31a = Math.cos(_0x1217a2[_0x57f7e4.hit].angle - _0x1217a2.angle) * _0x146d49, _0x390660 = Math.sin(_0x1217a2[_0x57f7e4.hit].angle - _0x1217a2.angle) * _0x146d49;
              }
              let _0x24fbca = _0x1217a2.lock ? _0x32535e : _0x35acc3;
              _0x373076(_0x507512, _0x24fbca, _0x24fbca.width / 2 + _0x30d31a, _0x24fbca.height / 2 + _0x390660, -_0x24fbca.width, -_0x24fbca.height), _0x507512.restore();
            }
          } catch (_0x52e44a) {
            console.context().log('Failed\x20To\x20Draw\x20Ally\x20Chest\x20Images', _0x52e44a);
          }
          if (_0x1217a2.action && _0x1217a2.info && _0x73cd4e.chestInfo.active) try {
            _0x507512.save(), _0x507512.globalAlpha = 0.9;
            let _0x318080 = _0x46233c.WTF[_0x1217a2.action / 2 - 1] ? _0x46233c.WTF[_0x1217a2.action / 2 - 1].info[_0x57f7e4.img][0] : ![];
            if (_0x318080 && _0x318080.src) _0x373076(_0x507512, _0x318080, _0x3b2ae4.WUF.x + _0x1217a2.x + 25, _0x3b2ae4.WUF.y + _0x1217a2.y + 15, -_0x46233c.WTF[_0x1217a2.action / 2 - 1].info.width + 25, -_0x46233c.WTF[_0x1217a2.action / 2 - 1].info.height + 25), _0x507512.globalAlpha = 1, _0x507512.font = "18px Baloo Paaji", _0x507512.strokeStyle = 'black', _0x507512.lineWidth = 7, _0x507512.strokeText('x' + _0x1217a2.info, _0x3b2ae4.WUF.x + _0x1217a2.x - 32, _0x3b2ae4.WUF.y + _0x1217a2.y + 20), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB", _0x507512.fillText('x' + _0x1217a2.info, _0x3b2ae4.WUF.x + _0x1217a2.x - 32, _0x3b2ae4.WUF.y + _0x1217a2.y + 20);else {
              if (!_0x46233c.WTF[_0x1217a2.action / 2 - 1]) continue;
              let _0x29d61c = new Image();
              _0x29d61c.src = _0x46233c.WTF[_0x1217a2.action / 2 - 1].info[_0x57f7e4.img][0][_0x57f7e4.src], _0x46233c.WTF[_0x1217a2.action / 2 - 1].info[_0x57f7e4.img][0] = _0x29d61c;
            }
            _0x507512.restore();
          } catch (_0x3f1cd7) {
            console.context().log("Failed To Draw Chest Images", _0x3f1cd7);
          }
        }
        if (_0x73cd4e.fireInfo) try {
          for (let _0x47cecd = 0, _0x4e6950 = [...gameWorld.units[EntityIDs.FIRE], ...gameWorld.units[EntityIDs.BIG_FIRE]], _0x3efe8f = _0x4e6950.length; _0x47cecd < _0x3efe8f; _0x47cecd++) {
            let _0x180879 = _0x4e6950[_0x47cecd];
            if (_0x180879) {
              if (!_0x180879.time && _0x180879.time != 0) {
                if (_0x180879.type === EntityIDs.BIG_FIRE) _0x180879.time = 360;else _0x180879.type === EntityIDs.FIRE && _0x180879.info === 0 ? _0x180879.time = 120 : _0x180879.time = 120;
                _0x4cd684.setInterval(() => {
                  _0x180879.time = (_0x180879.time - 0.1).toFixed(1);
                }, 100);
              }
              _0x507512.save(), _0x507512.font = "18px Baloo Paaji", _0x507512.strokeStyle = "black", _0x507512.lineWidth = 7, _0x507512.textAlign = "center", _0x507512.strokeText(_0x180879.time + 's', _0x3b2ae4.WUF.x + _0x180879.x, _0x3b2ae4.WUF.y + _0x180879.y + 5), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB", _0x507512.fillText(_0x180879.time + 's', _0x3b2ae4.WUF.x + _0x180879.x, _0x3b2ae4.WUF.y + _0x180879.y + 5), _0x507512.restore();
            }
          }
        } catch (_0x3cbee9) {
          console.context().log("Failed To Draw Fire Info", _0x3cbee9);
        }
        if (_0x73cd4e.treasureChestOnTop) {
          for (let _0x84bb0b = 0; _0x38ee77.length > _0x84bb0b; _0x84bb0b++) {
            let _0x4d73e2 = _0x38ee77[_0x84bb0b];
            _0x4d73e2[0](_0x4d73e2[1], _0x4d73e2[2]);
          }
          _0x38ee77.length && (_0x38ee77 = []);
          for (let _0x27ada7 = 0, _0xdadfcf = gameWorld.units[EntityIDs.TREASURE_CHEST], _0x3d64cc = _0xdadfcf.length; _0x27ada7 < _0x3d64cc; _0x27ada7++) {
            let _0x3a55a0 = _0xdadfcf[_0x27ada7];
            if (!_0x3a55a0.checked) {
              !_0x439412.drawTreasure && (_0x439412.drawTreasure = _0x3a55a0[_0x57f7e4.draw]);
              try {
                _0x3a55a0[_0x57f7e4.draw] = function (_0x31ae61, _0x2efbef) {
                  if (_0x73cd4e.treasureChestOnTop && !_0x73cd4e.Hidden.active) return _0x38ee77.push([_0x439412.drawTreasure.bind(_0x3a55a0), _0x31ae61, _0x2efbef]);else _0x439412.drawTreasure.call(this, _0x31ae61, _0x2efbef);
                }, _0x3a55a0.checked = !![];
              } catch (_0x49666a) {
                console.context().log("Failed To Bind Treasure Drawing", _0x49666a);
              }
            }
          }
        }
        if (![]) {
          for (let _0x16ec7c = 0; _0xc7a873.length > _0x16ec7c; _0x16ec7c++) {
            let _0x3953f0 = _0xc7a873[_0x16ec7c];
            _0x3953f0[0](_0x3953f0[1], _0x3953f0[2]);
          }
          _0xc7a873.length && (_0xc7a873 = []);
          try {
            let _0x1f8091 = [...gameWorld.units[EntityIDs.DEAD_BOX], ...gameWorld.units[EntityIDs.CRATE], ...gameWorld.units[EntityIDs.GIFT]];
            for (let _0x3cd228 = 0, _0x1b7eb3 = _0x1f8091.length; _0x3cd228 < _0x1b7eb3; _0x3cd228++) {
              let _0x138a54 = _0x1f8091[_0x3cd228];
              if (!_0x138a54.checked) {
                !_0x439412.drawCrate && (_0x439412.drawCrate = _0x138a54[_0x57f7e4.draw]);
                try {
                  _0x138a54[_0x57f7e4.draw] = function (_0x3e81b9, _0x450e87) {
                    if (_0x73cd4e.boxInfo && !_0x73cd4e.Hidden.active) return _0xc7a873.push([_0x439412.drawCrate.bind(_0x138a54), _0x3e81b9, _0x450e87]);
                    else _0x439412.drawCrate.call(this, _0x3e81b9, _0x450e87);
                  }; 
                  _0x138a54.checked = !![];
                } catch (_0x1a52a5) {
                  console.context().log("Failed To Bind Box Drawing", _0x1a52a5);
                }
              }
              if (_0x138a54) {
                let _0x5ed77c;
                // Оригинальная длинная проверка (оставил как было, чтобы точно работало)
                if (_0x138a54.type === EntityIDs.DEAD_BOX && (_0x138a54.info == 55 || _0x138a54.info == 56 || _0x138a54.info == 57 || _0x138a54.info == 72 || _0x138a54.info == 58 || _0x138a54.info == 74 || _0x138a54.info == 64 || _0x138a54.info == 66 || _0x138a54.info == 65 || _0x138a54.info == 63 || _0x138a54.info == 73 || _0x138a54.info == 71 || _0x138a54.info == 68 || _0x138a54.info == 60 || _0x138a54.info == 59 || _0x138a54.info == 62 || _0x138a54.info == 61 || _0x138a54.info == 69 || _0x138a54.info == 67 || _0x138a54.info == 70 || _0x138a54.info == 75 || _0x138a54.info == 82 || _0x138a54.info == 83 || _0x138a54.info == 79 || _0x138a54.info == 80 || _0x138a54.info == 81)) {
                    _0x5ed77c = !![];
                } else {
                    _0x5ed77c = ![];
                }
                
                if (!_0x138a54.time && _0x138a54.time != 0) {
                  if (_0x138a54.type === EntityIDs.CRATE) _0x138a54.time = 16;
                  else if (_0x138a54.type === EntityIDs.GIFT) _0x138a54.time = 500;
                  else if (_0x138a54.type === EntityIDs.DEAD_BOX && !_0x5ed77c) _0x138a54.time = 240;
                  else _0x138a54.time = 28;
                  
                  // ЗАПЛАТКА ОТ УТЕЧЕК: Проверяем, есть ли уже интервал, чтобы не плодить их
                  if (!_0x138a54._timerSet) {
                      _0x138a54._timerSet = true;
                      _0x4cd684.setInterval(() => {
                        if (Number(_0x138a54.time) > 0) {
                            _0x138a54.time = (_0x138a54.time - 0.1).toFixed(1);
                        }
                      }, 100);
                  }
                }
                
                !_0x138a54.hits && _0x138a54.hits != 0 && (_0x138a54.hits = 0);
                if (_0x138a54.action != 0 && !_0x138a54.hitActive) {
                    _0x138a54.hits++;
                    _0x138a54.hitActive = 1;
                } else if (_0x138a54.action == 0) {
                    _0x138a54.hitActive = 0;
                }
                
                let boxName = _0x138a54.type === EntityIDs.CRATE ? "Drop Box" : _0x138a54.type === EntityIDs.GIFT ? 'Gift Box' : _0x138a54.type === EntityIDs.DEAD_BOX && !_0x5ed77c ? 'Dead Box' : "Animal Box";
                
                _0x507512.save();
                _0x507512.font = "18px Baloo Paaji";
                _0x507512.strokeStyle = 'black';
                _0x507512.lineWidth = 7;
                _0x507512.textAlign = "center";
                
                // Обводка
                _0x507512.strokeText(boxName, _0x3b2ae4.WUF.x + _0x138a54.x, _0x3b2ae4.WUF.y + _0x138a54.y - 10);
                _0x507512.strokeText("Hits: " + _0x138a54.hits, _0x3b2ae4.WUF.x + _0x138a54.x, _0x3b2ae4.WUF.y + _0x138a54.y + 10);
                _0x507512.strokeText('Time: ' + _0x138a54.time + 's', _0x3b2ae4.WUF.x + _0x138a54.x, _0x3b2ae4.WUF.y + _0x138a54.y + 30);
                
                // Текст
                _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB";
                _0x507512.fillText(boxName, _0x3b2ae4.WUF.x + _0x138a54.x, _0x3b2ae4.WUF.y + _0x138a54.y - 10);
                _0x507512.fillText('Hits: ' + _0x138a54.hits, _0x3b2ae4.WUF.x + _0x138a54.x, _0x3b2ae4.WUF.y + _0x138a54.y + 10);
                _0x507512.fillText("Time: " + _0x138a54.time + 's', _0x3b2ae4.WUF.x + _0x138a54.x, _0x3b2ae4.WUF.y + _0x138a54.y + 30);
                
                _0x507512.restore();
              }
            }
          } catch (_0x5cf2f6) {
            console.context().log("Failed To Draw Box Info", _0x5cf2f6);
          }
        }
        if (_0x73cd4e.playersOnTop || _0x73cd4e.playerTracers) {
          if (_0x73cd4e.playersOnTop) {
            for (let _0x3fdfdc = 0; _0x1738a7.length > _0x3fdfdc; _0x3fdfdc++) {
              let _0x37c00a = _0x1738a7[_0x3fdfdc];
              _0x1bd3c5(_0x37c00a[0], _0x37c00a[1]);
            }
            _0x1738a7.length && (_0x1738a7 = []);
          }
          if (_0x73cd4e.playersOnTop) {
            for (let _0xe2fcf4 = 0; _0x503ea5.length > _0xe2fcf4; _0xe2fcf4++) {
              let _0x42d080 = _0x503ea5[_0xe2fcf4];
              _0x192507(_0x42d080[0], _0x42d080[1]), _0x2e77bc(_0x42d080[0]);
            }
            _0x503ea5.length && (_0x503ea5 = []);
          }
          for (let _0x2acdcf = 0; _0x2acdcf < gameWorld.units[EntityIDs.PLAYERS].length; _0x2acdcf++) {
            let _0x117284 = gameWorld.units[EntityIDs.PLAYERS][_0x2acdcf];
            if (!_0x117284.checked) {
              let _0x428cb8 = _0x117284[_0x57f7e4.draw],
                _0x440231 = _0x117284[_0x57f7e4.draw_vehicle],
                _0x5ea4d3 = _0x117284[_0x57f7e4.update];
              try {
                _0x117284[_0x57f7e4.draw] = function () {
                  !_0x73cd4e.Hidden.active && _0x2e77bc(_0x117284);
                  if (!_0x73cd4e.playersOnTop || _0x73cd4e.Hidden.active) return _0x428cb8.call(this);else _0x503ea5.push([_0x117284, _0x428cb8.bind(_0x117284)]);
                }, _0x117284[_0x57f7e4.draw_vehicle] = function () {
                  if (!_0x73cd4e.playersOnTop || _0x73cd4e.Hidden.active) return _0x53d5e4(_0x440231.bind(_0x117284));else _0x1738a7.push([_0x117284, _0x440231.bind(_0x117284)]);
                }, _0x117284[_0x57f7e4.update] = function () {
                  _0x5ea4d3.call(this);
                  if (_0x117284[_0x57f7e4.ghost] && ((60 - (Date.now() - _0x117284.ghostTime) / 1000).toFixed(1) < 0 || !_0x117284.ghostTime)) _0x117284.ghostTime = Date.now();else !_0x117284[_0x57f7e4.ghost] && (_0x117284.ghostTime = null);
                }, _0x117284.checked = !![];
              } catch (_0x5b69c5) {
                console.context().log("Failed To Bind Player Functions", _0x5b69c5);
              }
            }
            _0x117284.ghostTime > 0 && (_0x1f266a[_0x57f7e4.pid] == _0x117284[_0x57f7e4.pid] && (_0x117284.ghostTime = _0x3b2ae4.WQK.WTY), _0x507512.save(), _0x507512.font = "30px Baloo Paaji", _0x507512.strokeStyle = "black", _0x507512.lineWidth = 7, _0x507512.strokeText((60 - (Date.now() - _0x117284.ghostTime) / 1000).toFixed(1), _0x3b2ae4.WUF.x + _0x117284.x - 25, _0x3b2ae4.WUF.y + _0x117284.y + 20), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB", _0x507512.fillText((60 - (Date.now() - _0x117284.ghostTime) / 1000).toFixed(1), _0x3b2ae4.WUF.x + _0x117284.x - 25, _0x3b2ae4.WUF.y + _0x117284.y + 20), _0x507512.restore());
            _0x73cd4e.playerTracers && _0x1f266a && _0x1f266a[_0x57f7e4.pid] != _0x117284[_0x57f7e4.pid] && (_0x507512.strokeStyle = _0x194c5e(_0x117284[_0x57f7e4.pid]) ? "#66ff00" : '#ff2e2e', _0x507512.lineWidth = 3.5, _0x507512.beginPath(), _0x507512.moveTo(_0x3b2ae4.WUF.x + _0x1f266a.x, _0x3b2ae4.WUF.y + _0x1f266a.y), _0x507512.lineTo(_0x3b2ae4.WUF.x + _0x117284.x, _0x3b2ae4.WUF.y + _0x117284.y), _0x507512.stroke());
            if (_0x73cd4e.playerTimers != 'None' && _0x1f266a) {
              if (_0x73cd4e.playerTimers == "Enemys") {
                const _0x2fed10 = _0x194c5e(_0x117284[_0x57f7e4.pid]);
                if (_0x2fed10) continue;
              }
              _0x1f266a[_0x57f7e4.pid] == _0x117284[_0x57f7e4.pid] && !_0x2b2f75 && (_0xc6e4ef[_0x1f266a[_0x57f7e4.pid]] = _0x169d08);
              if (_0xc6e4ef[_0x117284[_0x57f7e4.pid]]) {
                let _0x3d580a = 10 - (Date.now() - _0xc6e4ef[_0x117284[_0x57f7e4.pid]]) / 1000;
                while (_0x3d580a <= 0) {
                  _0xc6e4ef[_0x117284[_0x57f7e4.pid]] += 10000, _0x3d580a = 10 - (Date.now() - _0xc6e4ef[_0x117284[_0x57f7e4.pid]]) / 1000;
                }
                _0x507512.save(), _0x507512.font = "25px Baloo Paaji", _0x507512.strokeStyle = "black", _0x507512.lineWidth = 7.5, _0x507512.strokeText(_0x3d580a.toFixed(1), _0x3b2ae4.WUF.x + _0x117284.x - 15, _0x3b2ae4.WUF.y + _0x117284.y + 40), _0x507512.fillStyle = _0x3d580a >= 7.5 ? '#FF0000' : _0x3d580a >= 5 ? "#FFA500" : _0x3d580a >= 2.5 ? "#FFFF00" : "#00FF00", _0x507512.fillText(_0x3d580a.toFixed(1), _0x3b2ae4.WUF.x + _0x117284.x - 15, _0x3b2ae4.WUF.y + _0x117284.y + 40), _0x507512.restore();
              }
            }
          }
        }
        try {
          const _0x22f318 = [{
              'name': 'Krakens',
              'setting': "Krakens",
              'units': gameWorld.units[EntityIDs.KRAKEN]
            }, {
              'name': "Sand Worms",
              'setting': 'Sandworms',
              'units': gameWorld.units[EntityIDs.SAND_WORM]
            }, {
              'name': 'Baby\x20Dragons',
              'setting': "BabyDragons",
              'units': gameWorld.units[EntityIDs.BABY_DRAGON]
            }, {
              'name': 'Baby\x20Lavas',
              'setting': "BabyLavaDragons",
              'units': gameWorld.units[EntityIDs.BABY_LAVA]
            }, {
              'name': "Baby Mammoths",
              'setting': 'BabyMammoths',
              'units': gameWorld.units[EntityIDs.BABY_MAMMOTH]
            }, {
              'name': "Bears",
              'setting': "Bears",
              'units': gameWorld.units[EntityIDs.BEAR]
            }, {
              'name': "Boars",
              'setting': "Boars",
              'units': gameWorld.units[EntityIDs.BOAR]
            }, {
              'name': "Crabs",
              'setting': 'Crabs',
              'units': gameWorld.units[EntityIDs.CRAB]
            }, {
              'name': "Dragons",
              'setting': "Dragons",
              'units': gameWorld.units[EntityIDs.DRAGON]
            }, {
              'name': "Flames",
              'setting': "FireMobs",
              'units': gameWorld.units[EntityIDs.FLAME]
            }, {
              'name': "Foxs",
              'setting': "Foxes",
              'units': gameWorld.units[EntityIDs.FOX]
            }, {
              'name': "Hawks",
              'setting': "Hawks",
              'units': gameWorld.units[EntityIDs.HAWK]
            }, {
              'name': 'Crab\x20Boss',
              'setting': "KingCrabs",
              'units': gameWorld.units[EntityIDs.CRAB_BOSS]
            }, {
              'name': "Lava Dragons",
              'setting': "LavaDragons",
              'units': gameWorld.units[EntityIDs.LAVA_DRAGON]
            }, {
              'name': "Mammoths",
              'setting': "Mammoths",
              'units': gameWorld.units[EntityIDs.MAMMOTH]
            }, {
              'name': "Penguins",
              'setting': "Penguins",
              'units': gameWorld.units[EntityIDs.PENGUIN]
            }, {
              'name': "Piranhas",
              'setting': 'Piranhas',
              'units': gameWorld.units[EntityIDs.PIRANHA]
            }, {
              'name': 'Rabbits',
              'setting': "Rabbits",
              'units': gameWorld.units[EntityIDs.RABBIT]
            }, {
              'name': 'Spiders',
              'setting': "Spiders",
              'units': gameWorld.units[EntityIDs.SPIDER]
            }, {
              'name': "Vultures",
              'setting': "Vultures",
              'units': gameWorld.units[EntityIDs.VULTURE]
            }, {
              'name': "Wolfs",
              'setting': 'Wolfs',
              'units': gameWorld.units[EntityIDs.WOLF]
            }, {
              'name': "Crocodiles",
              'setting': 'Crocodiles',
              'units': gameWorld.units[EntityIDs.CROCODILE]
            }, {
              'name': 'Golden\x20Chickens',
              'setting': "GoldenChickens",
              'units': gameWorld.units[EntityIDs.GOLDEN_CHICKEN]
            }, {
              'name': "Golden Hens",
              'setting': "GoldenHens",
              'units': gameWorld.units[EntityIDs.GOLDEN_HEN]
            }, {
              'name': "Ocelots",
              'setting': "Ocelots",
              'units': gameWorld.units[EntityIDs.OCELOT]
            }, {
              'name': 'Parrots',
              'setting': "Parrots",
              'units': gameWorld.units[EntityIDs.PARROT]
            }],
            _0x26ee55 = window.innerHeight / 2,
            _0x3da839 = 25;
          _0x507512.font = "18px Baloo Paaji", _0x507512.textAlign = "left", _0x507512.textBaseline = "middle";
          let _0xec9050 = 0;
          for (let _0x40ace5 = 0; _0x40ace5 < _0x22f318.length; _0x40ace5++) {
            const {
              name: _0x580a95,
              setting: _0x594280,
              units: _0x294524
            } = _0x22f318[_0x40ace5];
            if (_0x73cd4e.Tracers[_0x594280] && _0x294524 && _0x294524.length > 0) {
              const _0x147732 = _0x26ee55 + _0xec9050 * _0x3da839,
                _0x39d620 = '' + _0x580a95 + ':\x20' + _0x294524.length;
              _0x507512.save(), _0x507512.strokeStyle = "black", _0x507512.lineWidth = 7, _0x507512.strokeText(_0x39d620, 0, _0x147732), _0x507512.fillStyle = !_0x73cd4e.darkMode ? 'white' : "#BBB", _0x507512.fillText(_0x39d620, 0, _0x147732), _0x507512.restore(), _0xec9050++;
            }
          }
        } catch (_0x2f5dca) {
          console.context().log("Failed To Draw Tracer Animal Counts", _0x2f5dca);
        }
        try {
          _0x73cd4e.Tracers.Krakens && gameWorld.units[EntityIDs.KRAKEN] && _0x2801de(gameWorld.units[EntityIDs.KRAKEN], '#000000'), _0x73cd4e.Tracers.Sandworms && gameWorld.units[EntityIDs.SAND_WORM] && _0x2801de(gameWorld.units[EntityIDs.SAND_WORM], '#000000'), _0x73cd4e.Tracers.BabyDragons && gameWorld.units[EntityIDs.BABY_DRAGON] && _0x2801de(gameWorld.units[EntityIDs.BABY_DRAGON], "#949494"), _0x73cd4e.Tracers.BabyLavaDragons && gameWorld.units[EntityIDs.BABY_LAVA] && _0x2801de(gameWorld.units[EntityIDs.BABY_LAVA], "#660000"), _0x73cd4e.Tracers.BabyMammoths && gameWorld.units[EntityIDs.BABY_MAMMOTH] && _0x2801de(gameWorld.units[EntityIDs.BABY_MAMMOTH], "#949494"), _0x73cd4e.Tracers.Bears && gameWorld.units[EntityIDs.BEAR] && _0x2801de(gameWorld.units[EntityIDs.BEAR], "#949494"), _0x73cd4e.Tracers.Boars && gameWorld.units[EntityIDs.BOAR] && _0x2801de(gameWorld.units[EntityIDs.BOAR], "#007512"), _0x73cd4e.Tracers.Crabs && gameWorld.units[EntityIDs.CRAB] && _0x2801de(gameWorld.units[EntityIDs.CRAB], "#948f00"), _0x73cd4e.Tracers.Dragons && gameWorld.units[EntityIDs.DRAGON] && _0x2801de(gameWorld.units[EntityIDs.DRAGON], "#949494"), _0x73cd4e.Tracers.FireMobs && gameWorld.units[EntityIDs.FLAME] && _0x2801de(gameWorld.units[EntityIDs.FLAME], '#660000'), _0x73cd4e.Tracers.Foxes && gameWorld.units[EntityIDs.FOX] && _0x2801de(gameWorld.units[EntityIDs.FOX], "#949494"), _0x73cd4e.Tracers.Hawks && gameWorld.units[EntityIDs.HAWK] && _0x2801de(gameWorld.units[EntityIDs.HAWK], "#007512"), _0x73cd4e.Tracers.KingCrabs && gameWorld.units[EntityIDs.CRAB_BOSS] && _0x2801de(gameWorld.units[EntityIDs.CRAB_BOSS], '#948f00'), _0x73cd4e.Tracers.LavaDragons && gameWorld.units[EntityIDs.LAVA_DRAGON] && _0x2801de(gameWorld.units[EntityIDs.LAVA_DRAGON], "#660000"), _0x73cd4e.Tracers.Mammoths && gameWorld.units[EntityIDs.MAMMOTH] && _0x2801de(gameWorld.units[EntityIDs.MAMMOTH], '#949494'), _0x73cd4e.Tracers.Penguins && gameWorld.units[EntityIDs.PENGUIN] && _0x2801de(gameWorld.units[EntityIDs.PENGUIN], "#949494"), _0x73cd4e.Tracers.Piranhas && gameWorld.units[EntityIDs.PIRANHA] && _0x2801de(gameWorld.units[EntityIDs.PIRANHA], "#000c78"), _0x73cd4e.Tracers.Rabbits && gameWorld.units[EntityIDs.RABBIT] && _0x2801de(gameWorld.units[EntityIDs.RABBIT], "#007512"), _0x73cd4e.Tracers.Spiders && gameWorld.units[EntityIDs.SPIDER] && _0x2801de(gameWorld.units[EntityIDs.SPIDER], "#007512"), _0x73cd4e.Tracers.Vultures && gameWorld.units[EntityIDs.VULTURE] && _0x2801de(gameWorld.units[EntityIDs.VULTURE], "#948f00"), _0x73cd4e.Tracers.Wolfs && gameWorld.units[EntityIDs.WOLF] && _0x2801de(gameWorld.units[EntityIDs.WOLF], "#007512"), _0x73cd4e.Tracers.Crocodiles && gameWorld.units[EntityIDs.CROCODILE] && _0x2801de(gameWorld.units[EntityIDs.CROCODILE], "#003c12"), _0x73cd4e.Tracers.GoldenChickens && gameWorld.units[EntityIDs.GOLDEN_CHICKEN] && _0x2801de(gameWorld.units[EntityIDs.GOLDEN_CHICKEN], "#007512"), _0x73cd4e.Tracers.GoldenHens && gameWorld.units[EntityIDs.GOLDEN_HEN] && _0x2801de(gameWorld.units[EntityIDs.GOLDEN_HEN], '#007512'), _0x73cd4e.Tracers.Ocelots && gameWorld.units[EntityIDs.OCELOT] && _0x2801de(gameWorld.units[EntityIDs.OCELOT], "#003c12"), _0x73cd4e.Tracers.Parrots && gameWorld.units[EntityIDs.PARROT] && _0x2801de(gameWorld.units[EntityIDs.PARROT], "#003c12");
        } catch (_0x5da578) {
          console.context().log("Failed To Draw Animal Tracers", _0x5da578);
        }
        if (_0x73cd4e.movementPredictor) try {
          for (let _0x340718 = 0, _0x3ba5bf = [...gameWorld.units[EntityIDs.PARROT], ...gameWorld.units[EntityIDs.GOLDEN_HEN], ...gameWorld.units[EntityIDs.DEAD_BOX], ...gameWorld.units[EntityIDs.TREASURE_CHEST], ...gameWorld.units[EntityIDs.CRATE], ...gameWorld.units[EntityIDs.PENGUIN], ...gameWorld.units[EntityIDs.FOX], ...gameWorld.units[EntityIDs.BEAR], ...gameWorld.units[EntityIDs.PIRANHA], ...gameWorld.units[EntityIDs.CRAB], ...gameWorld.units[EntityIDs.FLAME], ...gameWorld.units[EntityIDs.LAVA_DRAGON], ...gameWorld.units[EntityIDs.BOAR], ...gameWorld.units[EntityIDs.CRAB_BOSS], ...gameWorld.units[EntityIDs.BABY_DRAGON], ...gameWorld.units[EntityIDs.BABY_LAVA], ...gameWorld.units[EntityIDs.BABY_MAMMOTH], ...gameWorld.units[EntityIDs.MAMMOTH], ...gameWorld.units[EntityIDs.PLAYERS], ...gameWorld.units[EntityIDs.RABBIT], ...gameWorld.units[EntityIDs.SAND_WORM], ...gameWorld.units[EntityIDs.WOLF], ...gameWorld.units[EntityIDs.SPIDER], ...gameWorld.units[EntityIDs.HAWK], ...gameWorld.units[EntityIDs.VULTURE], ...gameWorld.units[EntityIDs.DRAGON], ...gameWorld.units[EntityIDs.KRAKEN]], _0x317508 = _0x3ba5bf.length; _0x340718 < _0x317508; ++_0x340718) {
            let _0x2ab050 = _0x3ba5bf[_0x340718];
            (_0x2ab050.x != _0x2ab050.r.x || _0x2ab050.y != _0x2ab050.r.y) && (_0x507512.save(), _0x507512.beginPath(), _0x507512.lineWidth = 3.5, _0x507512.moveTo(_0x3b2ae4.WUF.x + _0x2ab050.x, _0x3b2ae4.WUF.y + _0x2ab050.y), _0x507512.lineTo(_0x3b2ae4.WUF.x + _0x2ab050.r.x, _0x3b2ae4.WUF.y + _0x2ab050.r.y), _0x507512.strokeStyle = "#ff2e2e", _0x507512.stroke(), _0x507512.restore());
          }
        } catch (_0x207a3f) {
          console.context().log("Failed To Draw Entity Health Or Movement Predictor Info", _0x207a3f);
        }
        if (_0x73cd4e.Debugger.mode != 'None') try {
          _0x507512.save(), _0x507512.font = "18px Baloo Paaji", _0x507512.strokeStyle = "black", _0x507512.lineWidth = 4, _0x507512.fillStyle = !_0x73cd4e.darkMode ? 'white' : "#BBB", _0x507512.globalAlpha = 0.8;
          for (let _0x34d3c7 = 0; _0x34d3c7 < gameWorld.units.length; _0x34d3c7++) {
            let _0x24c4c2 = gameWorld.units[_0x34d3c7];
            if (typeof _0x24c4c2 == 'object') {
              if (_0x24c4c2.length == 0) continue;
              for (let _0xcd9142 = 0; _0xcd9142 < _0x24c4c2.length; _0xcd9142++) {
                let _0x4ada7b = _0x24c4c2[_0xcd9142];
                if (_0x73cd4e.Debugger.mode == "No Roofs/Bridges") {
                  if (_0x4ada7b.type == 30) continue;
                }
                if (_0x73cd4e.Debugger.mode == "No Roofs/Bridges") {
                  if (_0x4ada7b.type == 38) continue;
                }
                let _0x43ea44 = _0x3b2ae4.WUF.x + _0x4ada7b.x - 150,
                  _0x28a17a = _0x3b2ae4.WUF.y + _0x4ada7b.y - 30 + 15,
                  _0x272785 = _0x3b2ae4.WUF.y + _0x4ada7b.y - 30;
                _0x73cd4e.Debugger.mode == "All" || _0x73cd4e.Debugger.mode == "No Roofs/Bridges" ? (_0x4ada7b.type != 0 && _0x507512.strokeText(Object.values(gameWorld.WTN[_0x4ada7b[_0x57f7e4.pid]])[0], _0x43ea44 + 100, _0x272785), _0x4ada7b.type != 0 && _0x507512.fillText(Object.values(gameWorld.WTN[_0x4ada7b[_0x57f7e4.pid]])[0], _0x43ea44 + 100, _0x272785), _0x4ada7b.type == 0 && _0x507512.strokeText('ID:\x20' + _0x4ada7b[_0x57f7e4.pid], _0x43ea44 + 100, _0x28a17a), _0x4ada7b.type == 0 && _0x507512.fillText("ID: " + _0x4ada7b[_0x57f7e4.pid], _0x43ea44 + 100, _0x28a17a), _0x4ada7b.type == 0 && _0x507512.strokeText("X: " + _0x4ada7b.x, _0x43ea44 + 100, _0x28a17a + 15), _0x4ada7b.type == 0 && _0x507512.fillText('X:\x20' + _0x4ada7b.x, _0x43ea44 + 100, _0x28a17a + 15), _0x4ada7b.type == 0 && _0x507512.strokeText("Y: " + _0x4ada7b.y, _0x43ea44 + 100, _0x28a17a + 30), _0x4ada7b.type == 0 && _0x507512.fillText("Y: " + _0x4ada7b.y, _0x43ea44 + 100, _0x28a17a + 30), _0x4ada7b.type != 0 && _0x4ada7b[_0x57f7e4.pid] != 0 && _0x507512.strokeText('ID:\x20' + _0x4ada7b[_0x57f7e4.pid], _0x43ea44 + 100, _0x28a17a), _0x4ada7b.type != 0 && _0x4ada7b[_0x57f7e4.pid] != 0 && _0x507512.fillText("ID: " + _0x4ada7b[_0x57f7e4.pid], _0x43ea44 + 100, _0x28a17a), _0x4ada7b.type != 0 && _0x507512.strokeText('Type:\x20' + _0x4ada7b.type, _0x43ea44 + 100, _0x28a17a + 15), _0x4ada7b.type != 0 && _0x507512.fillText("Type: " + _0x4ada7b.type, _0x43ea44 + 100, _0x28a17a + 15)) : (_0x507512.lineWidth = 10, _0x4ada7b[_0x57f7e4.pid] < 10 ? (_0x4ada7b.type == 0 && _0x507512.strokeText(_0x4ada7b[_0x57f7e4.pid], _0x43ea44 + 145, _0x28a17a + 22), _0x4ada7b.type == 0 && _0x507512.fillText(_0x4ada7b[_0x57f7e4.pid], _0x43ea44 + 145, _0x28a17a + 22)) : (_0x4ada7b.type == 0 && _0x507512.strokeText(_0x4ada7b[_0x57f7e4.pid], _0x43ea44 + 139, _0x28a17a + 22), _0x4ada7b.type == 0 && _0x507512.fillText(_0x4ada7b[_0x57f7e4.pid], _0x43ea44 + 139, _0x28a17a + 22)));
              }
            }
          }
          _0x507512.restore();
        } catch (_0x2594b8) {
          console.context().log('Failed\x20To\x20Use\x20Debugger', _0x2594b8);
        }
        if (_0x73cd4e.blizzardAndSandstorm || _0x27f07a.I.canvas) {
          _0x507512.save();
          let _0x1eb00c = 0;
          _0x3b2ae4.WUY.enabled && (_0x1eb00c += 70);
          _0x57f7e4.bandage > 0 && (_0x1eb00c += 70);
          if (_0x57f7e4.blizzard == 1) _0x1eb00c += 70;else (_0x3b2ae4.WSJ.WUM < 0.25 || _0x3b2ae4.WSJ.WUO < 0.25 || _0x3b2ae4.WSJ.WUP < 0.25 || _0x3b2ae4.WSJ.WUR < 0.25 || _0x3b2ae4.WSJ.WUS < 0.25) && (_0x1eb00c += 70);
          _0x3b2ae4.WVE.WVD && _0x73cd4e.blizzardAndSandstorm && _0x762cdd.naturalWidth && (_0x507512.drawImage(_0x762cdd, _0x3b2ae4.WUY.translate.x, _0x3b2ae4.WUY.translate.y + _0x1eb00c), _0x1eb00c += 70);
          _0x3b2ae4.WVC.WVD && _0x73cd4e.blizzardAndSandstorm && _0x49dbee.naturalWidth && (_0x507512.drawImage(_0x49dbee, _0x3b2ae4.WUY.translate.x, _0x3b2ae4.WUY.translate.y + _0x1eb00c), _0x1eb00c += 70);
          _0x27f07a.I.canvas && (_0x507512.drawImage(_0x27f07a.I.canvas, _0x3b2ae4.WUY.translate.x, _0x3b2ae4.WUY.translate.y + _0x1eb00c), _0x27f07a.L && (_0x1eb00c += 50));
          let _0x16e3fc = gameWorld.units[EntityIDs.BED];
          if (_0x16e3fc.length) {
            if (_0x1f266a) try {
              for (let _0x4419d0 = 0; _0x4419d0 < _0x16e3fc.length; _0x4419d0++) {
                let _0xb91f54 = _0x3e37f7(_0x1f266a, _0x16e3fc[_0x4419d0]);
                if (_0xb91f54) {
                  if (_0xb91f54 <= 35 || _0xb91f54 <= 36 && _0x51a8b0) {
                    _0x507512.font = '30px\x20Baloo\x20Paaji', _0x507512.strokeStyle = "black", _0x507512.lineWidth = 7, _0x507512.strokeText('B', _0x3b2ae4.WUY.translate.x + 20, _0x3b2ae4.WUY.translate.y + _0x1eb00c + 20), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB", _0x507512.fillText('B', _0x3b2ae4.WUY.translate.x + 20, _0x3b2ae4.WUY.translate.y + _0x1eb00c + 20);
                    break;
                  }
                }
              }
            } catch (_0x5972d4) {
              console.context().log("Failed To Show Bed Info", _0x5972d4);
            }
          }
          _0x507512.restore();
        }
        _0x73cd4e.fpsDisplay && (_0x507512.save(), _0x507512.font = "30px Baloo Paaji", _0x507512.lineWidth = !_0x73cd4e.darkMode ? 7 : 7.5, _0x507512.strokeStyle = 'black', _0x507512.strokeText(_0x3f754d, _0x3b2ae4.WUY.translate.x + -120, _0x3b2ae4.WUY.translate.y + -50), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB", _0x507512.fillText(_0x3f754d, _0x3b2ae4.WUY.translate.x + -120, _0x3b2ae4.WUY.translate.y + -50), _0x507512.restore());
        _0x73cd4e.pingDisplay && _0x1ed932 && (_0x507512.save(), _0x507512.font = '30px\x20Baloo\x20Paaji', _0x507512.strokeStyle = "black", _0x507512.lineWidth = !_0x73cd4e.darkMode ? 7 : 7.5, _0x507512.strokeText(_0x1ed932 + 'ms', _0x3b2ae4.WUY.translate.x + -120, _0x3b2ae4.WUY.translate.y + (_0x73cd4e.fpsDisplay ? -20 : -50)), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB", _0x507512.fillText(_0x1ed932 + 'ms', _0x3b2ae4.WUY.translate.x + -120, _0x3b2ae4.WUY.translate.y + (_0x73cd4e.fpsDisplay ? -20 : -50)), _0x507512.restore());
        _0x73cd4e.daysAlive && (_0x507512.save(), _0x507512.font = "30px Baloo Paaji", _0x507512.lineWidth = !_0x73cd4e.darkMode ? 7 : 7.5, _0x507512.strokeStyle = 'black', _0x507512.strokeText('' + _0x3b2ae4.WVF + " Day" + (_0x3b2ae4.WVF > 1 ? 's' : ''), _0x3b2ae4.WUY.translate.x + -120, _0x3b2ae4.WUY.translate.y + 10 + (_0x73cd4e.fpsDisplay ? 0 : -30) + (_0x73cd4e.pingDisplay && _0x1ed932 ? 0 : -30)), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#BBB", _0x507512.fillText('' + _0x3b2ae4.WVF + " Day" + (_0x3b2ae4.WVF > 1 ? 's' : ''), _0x3b2ae4.WUY.translate.x + -120, _0x3b2ae4.WUY.translate.y + 10 + (_0x73cd4e.fpsDisplay ? 0 : -30) + (_0x73cd4e.pingDisplay && _0x1ed932 ? 0 : -30)), _0x507512.restore());
        _0x73cd4e.timePlayed.active && (_0x507512.save(), _0x507512.font = "30px Baloo Paaji", _0x507512.lineWidth = !_0x73cd4e.darkMode ? 7 : 7.5, _0x507512.strokeStyle = "black", _0x507512.strokeText(_0x2f8222(Math.round((Date.now() - _0x73cd4e.timePlayed.start) / 1000)), _0x3b2ae4.WUY.translate.x + -120, _0x3b2ae4.WUY.translate.y + 40 + (_0x73cd4e.fpsDisplay ? 0 : -30) + (_0x73cd4e.pingDisplay && _0x1ed932 ? 0 : -30) + (_0x73cd4e.daysAlive ? 0 : -30)), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : '#BBB', _0x507512.fillText(_0x2f8222(Math.round((Date.now() - _0x73cd4e.timePlayed.start) / 1000)), _0x3b2ae4.WUY.translate.x + -120, _0x3b2ae4.WUY.translate.y + 40 + (_0x73cd4e.fpsDisplay ? 0 : -30) + (_0x73cd4e.pingDisplay && _0x1ed932 ? 0 : -30) + (_0x73cd4e.daysAlive ? 0 : -30)), _0x507512.restore());
        let _0xe6cb63 = _0x3b2ae4.WUU.WUW.length > 0 ? -75 : 0;
        (_0x3b2ae4.WTZ.open || _0x3b2ae4.WTX.open && _0x3b2ae4.WUU.WUX(_0x44c140.WOOD) != -1 || _0x3b2ae4.WTT.open && _0x3b2ae4.WUU.WUX(_0x44c140.WILD_WHEAT) != -1 || _0x3b2ae4.WTU.open && _0x3b2ae4.WUU.WUX(_0x44c140.WOOD) != -1 || _0x3b2ae4.WTQ.open && _0x3b2ae4.WUU.WUX(_0x44c140.BUCKET_FULL) != -1 || _0x3b2ae4.WTV.open && (_0x3b2ae4.WUU.WUX(_0x44c140.WOOD) != -1 || _0x3b2ae4.WUU.WUX(_0x44c140.FLOUR) != -1)) && (_0xe6cb63 -= 50);
        _0x73cd4e.gaugeTimer && (_0x507512.save(), _0x507512.translate((document.documentElement.clientWidth - 950) / 2, _0xe6cb63), _0x507512.font = "30px Baloo Paaji", _0x507512.strokeStyle = "black", _0x507512.lineWidth = !_0x73cd4e.darkMode ? 5 : 7.5, _0x507512.strokeText((5 - (Date.now() - _0x169d08) / 1000).toFixed(1), _0x46233c.WSJ.translate.x + 455, _0x46233c.WSJ.translate.y + 35), _0x507512.fillStyle = _0x2b2f75 ? "#54a34e" : 'red', _0x507512.fillText((5 - (Date.now() - _0x169d08) / 1000).toFixed(1), _0x46233c.WSJ.translate.x + 455, _0x46233c.WSJ.translate.y + 35), _0x507512.restore());
        _0x73cd4e.gaugePercentages && (_0x507512.save(), _0x507512.translate((document.documentElement.clientWidth - 950) / 2, _0xe6cb63), _0x507512.font = '30px\x20Baloo\x20Paaji', _0x507512.strokeStyle = !_0x73cd4e.darkMode ? "#c12819" : 'black', _0x507512.lineWidth = !_0x73cd4e.darkMode ? 5 : 7.5, _0x507512.strokeText(Math.floor(_0x3b2ae4.WSJ.WUO * 100) + '%', 345, _0x46233c.WSJ.translate.y + 10), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#c12819", _0x507512.fillText(Math.floor(_0x3b2ae4.WSJ.WUO * 100) + '%', 345, _0x46233c.WSJ.translate.y + 10), _0x507512.font = '30px\x20Baloo\x20Paaji', _0x507512.strokeStyle = !_0x73cd4e.darkMode ? Math.floor(_0x3b2ae4.WSJ.WUM * 100) + (100 - Math.floor(_0x3b2ae4.WSJ.WUS * 100)) <= 100 ? "#4f9db2" : "#9c4036" : "black", _0x507512.strokeText(Math.floor(_0x3b2ae4.WSJ.WUM * 100) + (100 - Math.floor(_0x3b2ae4.WSJ.WUS * 100)) + '%', 575, _0x46233c.WSJ.translate.y + 10), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#4f9db2", _0x507512.fillText(Math.floor(_0x3b2ae4.WSJ.WUM * 100) + (100 - Math.floor(_0x3b2ae4.WSJ.WUS * 100)) + '%', 575, _0x46233c.WSJ.translate.y + 10), _0x507512.font = "30px Baloo Paaji", _0x507512.strokeStyle = !_0x73cd4e.darkMode ? "#004b87" : "black", _0x507512.strokeText(Math.floor(_0x3b2ae4.WSJ.WUP * 100) + '%', 805, _0x46233c.WSJ.translate.y + 10), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#004b87", _0x507512.fillText(Math.floor(_0x3b2ae4.WSJ.WUP * 100) + '%', 805, _0x46233c.WSJ.translate.y + 10), _0x507512.font = "30px Baloo Paaji", _0x507512.strokeStyle = !_0x73cd4e.darkMode ? '#54a34e' : "black", _0x507512.strokeText(Math.floor(_0x3b2ae4.WSJ.WUN * 100) + '%', 95, _0x46233c.WSJ.translate.y + 10), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#54a34e", _0x507512.fillText(Math.floor(_0x3b2ae4.WSJ.WUN * 100) + '%', 95, _0x46233c.WSJ.translate.y + 10), Math.floor(_0x3b2ae4.WSJ.WUR * 100) != 100 && (_0x507512.font = "30px Baloo Paaji", _0x507512.strokeStyle = !_0x73cd4e.darkMode ? "#004b87" : "black", _0x507512.strokeText(Math.floor(_0x3b2ae4.WSJ.WUR * 100) + '%', 465, _0x46233c.WSJ.translate.y - 30), _0x507512.fillStyle = !_0x73cd4e.darkMode ? "white" : "#4f9db2", _0x507512.fillText(Math.floor(_0x3b2ae4.WSJ.WUR * 100) + '%', 465, _0x46233c.WSJ.translate.y - 30)), _0x507512.restore());
        if (_0x73cd4e.Aimbot.active && _0x73cd4e.Aimbot.rangeVisual) {
          let _0x4cbf96 = gameWorld.fast_units[_0x57f7e4.uid];
          if (!_0x4cbf96) return;
          _0x507512.save(), _0x507512.globalAlpha = 0.3, _0x507512.lineWidth = 3.5;
          const _0x1bb83e = Math.PI * 2;
          _0x507512.strokeStyle = _0x352145 <= 133 ? "#54a34e" : 'red', _0x507512.beginPath(), _0x507512.arc(_0x3b2ae4.WUF.x + _0x4cbf96.x, _0x3b2ae4.WUF.y + _0x4cbf96.y, 133, 0, _0x1bb83e), _0x507512.stroke(), _0x507512.strokeStyle = _0x352145 <= 203 ? '#54a34e' : "red", _0x507512.beginPath(), _0x507512.arc(_0x3b2ae4.WUF.x + _0x4cbf96.x, _0x3b2ae4.WUF.y + _0x4cbf96.y, 203, 0, _0x1bb83e), _0x507512.stroke(), _0x57c289(_0x4cbf96.right) == 6 && (_0x507512.strokeStyle = _0x352145 <= _0x73cd4e.BowRange ? "#54a34e" : "red", _0x507512.beginPath(), _0x507512.arc(_0x3b2ae4.cam.x + _0x4cbf96.x, _0x3b2ae4.cam.y + _0x4cbf96.y, _0x73cd4e.BowRange, 0, _0x1bb83e), _0x507512.stroke()), _0x507512.restore();
        }
        if (_0x73cd4e.joinsLeaves) {
          let _0x1ab4cb = 400;
          if (_0x22b787.newPlayerToggle) {
            _0x507512.save(), _0x507512.font = "18px Baloo Paaji", _0x507512.strokeStyle = 'black', _0x507512.lineWidth = 7, _0x507512.fillStyle = "green";
            for (let _0x883629 = 0; _0x883629 < _0x22b787.Join.length; _0x883629++) {
              _0x507512.strokeText(_0x22b787.Join[_0x883629][0], 0, _0x1ab4cb), _0x507512.fillText(_0x22b787.Join[_0x883629][0], 0, _0x1ab4cb);
              let _0x47883d = _0x507512.measureText(_0x22b787.Join[_0x883629][0]).width + 10;
              _0x507512.fillStyle = "yellow", _0x507512.strokeText('[' + _0x22b787.Join[_0x883629][1] + ']', _0x47883d, _0x1ab4cb), _0x507512.fillText('[' + _0x22b787.Join[_0x883629][1] + ']', _0x47883d, _0x1ab4cb), _0x507512.fillStyle = 'green', _0x1ab4cb += 20;
            }
            _0x507512.restore();
          }
          if (_0x22b787.killPlayerToggle) {
            _0x507512.save(), _0x507512.font = "18px Baloo Paaji", _0x507512.strokeStyle = "black", _0x507512.lineWidth = 7, _0x507512.fillStyle = "red";
            for (let _0x24aa3d = 0; _0x24aa3d < _0x22b787.Leave.length; _0x24aa3d++) {
              _0x507512.strokeText(_0x22b787.Leave[_0x24aa3d][0], 0, _0x1ab4cb), _0x507512.fillText(_0x22b787.Leave[_0x24aa3d][0], 0, _0x1ab4cb);
              let _0x586f32 = _0x507512.measureText(_0x22b787.Leave[_0x24aa3d][0]).width + 10;
              _0x507512.fillStyle = "yellow", _0x507512.strokeText('[' + _0x22b787.Leave[_0x24aa3d][1] + ']', _0x586f32, _0x1ab4cb), _0x507512.fillText('[' + _0x22b787.Leave[_0x24aa3d][1] + ']', _0x586f32, _0x1ab4cb), _0x507512.fillStyle = 'red', _0x1ab4cb += 20;
            }
            _0x507512.restore();
          }
        }
      }
      function _0x3aae24() {
        if (!_0x53166f.websocket || _0x53166f.websocket.readyState != 1 || !_0x2a8f98) return;
        _0x53166f.WTA(), !_0x40b9f1 && (_0x2932f7 = document.defaultView.Date.now(), _0x29b56c = !![], _0x53166f.WSG());
      }
      function _0x5a3092() {
        if (_0x198c45 && _0x507512) {
          let _0x115187 = document.defaultView.devicePixelRatio || 1,
            _0x305451 = _0x507512.webkitBackingStorePixelRatio || _0x507512.mozBackingStorePixelRatio || _0x507512.msBackingStorePixelRatio || _0x507512.oBackingStorePixelRatio || _0x507512.backingStorePixelRatio || 1;
          _0x198c45.width != document.defaultView.innerWidth && (_0x198c45.width = document.defaultView.innerWidth);
          _0x198c45.height != document.defaultView.innerHeight && (_0x198c45.height = document.defaultView.innerHeight);
          let _0x45e3b5 = _0x198c45.width,
            _0x1caddb = _0x198c45.height,
            _0x2784c7,
            _0x2ed9db = document.getElementById("input_ratio").value * (_0x115187 / _0x305451);
          _0x2ed9db === -1 ? _0x2784c7 = _0x115187 / _0x305451 : _0x2784c7 = _0x2ed9db, _0x198c45.width = _0x45e3b5 * _0x2784c7, _0x198c45.height = _0x1caddb * _0x2784c7, _0x198c45.style.width = _0x45e3b5 + 'px', _0x198c45.style.height = _0x1caddb + 'px', _0x507512.scale(_0x2784c7, _0x2784c7), _0x9cb2d9 && (_0x3b2ae4.WUF.WUH = document.documentElement.clientWidth, _0x3b2ae4.WUF.WUI = document.documentElement.clientHeight, _0x3b2ae4.WUF.WUJ = _0x45e3b5, _0x3b2ae4.WUF.WUK = _0x1caddb);
        }
      }
      document.defaultView.addEventListener("resize", function (_0x4ac3d2) {
        if (!_0x3cfdcb) return;
        _0x4cd684.setTimeout(() => {
          _0x5a3092();
        }, 0);
      });
      function _0x24549d() {
        let _0x240bc2 = null,
          _0x131d3a = null,
          _0x36ee28 = null,
          _0x2ad62d = 100 - Math.round(_0x3b2ae4.WSJ.WUO * 100);
        _0x3b2ae4.WSJ.WUP < 0.45 && _0x3b2ae4.WUU.WUV[_0x44c140.BOTTLE_FULL] && (_0x161dc9 = _0x3b2ae4.WUZ.WVA, _0x53166f.WQR(_0x44c140.BOTTLE_FULL), _0x3b2ae4.WUZ.WVA = _0x161dc9);
        if (_0x3b2ae4.WUU.WUV[_0x44c140.PLANT]) _0x240bc2 = _0x44c140.PLANT, _0x131d3a = 10, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else {
          if (_0x3b2ae4.WUU.WUV[_0x44c140.GARLIC]) _0x240bc2 = _0x44c140.GARLIC, _0x131d3a = 14, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else {
            if (_0x3b2ae4.WUU.WUV[_0x44c140.CRAB_STICK]) _0x240bc2 = _0x44c140.CRAB_STICK, _0x131d3a = 20, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else {
              if (_0x3b2ae4.WUU.WUV[_0x44c140.PUMPKIN]) _0x240bc2 = _0x44c140.PUMPKIN, _0x131d3a = 30, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else {
                if (_0x3b2ae4.WUU.WUV[_0x44c140.TOMATO]) _0x240bc2 = _0x44c140.TOMATO, _0x131d3a = 16, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else {
                  if (_0x3b2ae4.WUU.WUV[_0x44c140.CARROT]) _0x240bc2 = _0x44c140.CARROT, _0x131d3a = 20, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else {
                    if (_0x3b2ae4.WUU.WUV[_0x44c140.WATERMELON]) _0x240bc2 = _0x44c140.WATERMELON, _0x131d3a = 15, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else {
                      if (_0x3b2ae4.WUU.WUV[_0x44c140.BREAD]) _0x240bc2 = _0x44c140.BREAD, _0x131d3a = 15, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else {
                        if (_0x3b2ae4.WUU.WUV[_0x44c140.COOKED_MEAT]) _0x240bc2 = _0x44c140.COOKED_MEAT, _0x131d3a = 35, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else {
                          if (_0x3b2ae4.WUU.WUV[_0x44c140.FOODFISH_COOKED]) _0x240bc2 = _0x44c140.FOODFISH_COOKED, _0x131d3a = 35, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a);else _0x3b2ae4.WUU.WUV[_0x44c140.CRAB_LOOT] ? (_0x240bc2 = _0x44c140.CRAB_LOOT, _0x131d3a = 10, _0x36ee28 = Math.floor(_0x2ad62d / _0x131d3a)) : _0x36ee28 = 0;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (_0x36ee28 >= 1) {
          let _0x5a97fb = _0x3b2ae4.WUU.WUV[_0x240bc2] || 0;
          _0x36ee28 = Math.min(_0x36ee28, _0x5a97fb), _0x3b2ae4.WSJ.WUO = _0x3b2ae4.WSJ.WUO + _0x131d3a / 100 * _0x36ee28;
          for (let _0x3b18cf = 0; _0x3b18cf < _0x36ee28; _0x3b18cf++) {
            _0x53166f.WQR(_0x240bc2);
          }
        }
      }
      function _0x1d1201() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        _0x541fb9 = 0;
        if (_0x3b2ae4.WSJ.WUM + (1 - _0x3b2ae4.WSJ.WUS) >= 2 && !_0x3b2ae4.WUZ.WVA && _0x73cd4e.AutoIce.active) {
          let _0x1cbbc5 = gameWorld.fast_units[_0x57f7e4.uid];
          _0x3b2ae4.WUU.WUV[_0x44c140.ICE] && (_0x161dc9 = _0x3b2ae4.WUZ.WVB, _0x53166f.WQR(_0x44c140.ICE), _0x3b2ae4.WUZ.WVB = _0x161dc9);
        }
        _0x3b2ae4.WSJ.WUP < 0.45 && !_0x3b2ae4.WUZ.WVA && _0x3b2ae4.WUU.WUV[_0x44c140.BOTTLE_FULL] && (_0x161dc9 = _0x3b2ae4.WUZ.WVA, _0x53166f.WQR(_0x44c140.BOTTLE_FULL), _0x3b2ae4.WUZ.WVA = _0x161dc9);
        if (_0x3b2ae4.WSJ.WUO < 0.45 && !_0x3b2ae4.WUZ.WVA) {
          let _0x3f3ac9 = 0;
          _0x161dc9 = _0x3b2ae4.WUZ.WVA;
          if (_0x3b2ae4.WUU.WUV[_0x44c140.PLANT]) _0x3f3ac9 = 10, _0x53166f.WQR(_0x44c140.PLANT);else {
            if (_0x3b2ae4.WUU.WUV[_0x44c140.GARLIC]) _0x3f3ac9 = 14, _0x53166f.WQR(_0x44c140.GARLIC);else {
              if (_0x3b2ae4.WUU.WUV[_0x44c140.CRAB_STICK]) _0x3f3ac9 = 20, _0x53166f.WQR(_0x44c140.CRAB_STICK);else {
                if (_0x3b2ae4.WUU.WUV[_0x44c140.PUMPKIN]) _0x3f3ac9 = 30, _0x53166f.WQR(_0x44c140.PUMPKIN);else {
                  if (_0x3b2ae4.WUU.WUV[_0x44c140.TOMATO]) _0x3f3ac9 = 16, _0x53166f.WQR(_0x44c140.TOMATO);else {
                    if (_0x3b2ae4.WUU.WUV[_0x44c140.CARROT]) _0x3f3ac9 = 20, _0x53166f.WQR(_0x44c140.CARROT);else {
                      if (_0x3b2ae4.WUU.WUV[_0x44c140.WATERMELON]) _0x3f3ac9 = 15, _0x53166f.WQR(_0x44c140.WATERMELON);else {
                        if (_0x3b2ae4.WUU.WUV[_0x44c140.COOKED_MEAT]) _0x3f3ac9 = 35, _0x53166f.WQR(_0x44c140.COOKED_MEAT);else {
                          if (_0x3b2ae4.WUU.WUV[_0x44c140.FOODFISH_COOKED]) _0x3f3ac9 = 35, _0x53166f.WQR(_0x44c140.FOODFISH_COOKED);else {
                            if (_0x3b2ae4.WUU.WUV[_0x44c140.BREAD]) _0x3f3ac9 = 15, _0x53166f.WQR(_0x44c140.BREAD);else {
                              if (_0x3b2ae4.WUU.WUV[_0x44c140.COOKIE]) _0x3f3ac9 = 50, _0x53166f.WQR(_0x44c140.COOKIE);else {
                                if (_0x3b2ae4.WUU.WUV[_0x44c140.SANDWICH]) _0x3f3ac9 = 100, _0x53166f.WQR(_0x44c140.SANDWICH);else {
                                  if (_0x3b2ae4.WUU.WUV[_0x44c140.CAKE]) _0x3f3ac9 = 100, _0x53166f.WQR(_0x44c140.CAKE);else _0x3b2ae4.WUU.WUV[_0x44c140.CRAB_LOOT] && (_0x3f3ac9 = 10, _0x53166f.WQR(_0x44c140.CRAB_LOOT));
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          _0x3b2ae4.WUZ.WVA = _0x161dc9;
        }
      }
      function _0x1f1430() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.AutoSteal.active) for (let _0x172bb9 = 0; gameWorld.units[EntityIDs.CHEST].length > _0x172bb9; _0x172bb9++) {
          let _0x357994 = gameWorld.units[EntityIDs.CHEST][_0x172bb9],
            _0x5ad580 = gameWorld.fast_units[_0x57f7e4.uid];
          if (_0x5ad580) {
            _0x357994.ally = _0x9cb2d9.id === _0x357994[_0x57f7e4.pid] || _0x194c5e(_0x357994[_0x57f7e4.pid]);
            if (_0x357994.ally || !_0x357994.lock) {
              if (_0x5ad580 && _0x3e37f7(_0x5ad580, _0x357994) < 300 && !_0x3b2ae4.WUZ.WVA) {
                if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
                _0x357994[_0x57f7e4.iid] = _0x357994.id, _0x53166f.WSZ(_0x357994);
              }
            }
          }
        }
      }
      function _0x575045() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.AutoSpike.active) {
          let _0x560b63 = gameWorld.fast_units[_0x57f7e4.uid],
            _0x10f0f5;
          if (_0x3b2ae4.WUU.WUV[_0x44c140.REIDITE_SPIKE]) _0x10f0f5 = _0x44c140.REIDITE_SPIKE;else {
            if (_0x3b2ae4.WUU.WUV[_0x44c140.AMETHYST_SPIKE]) _0x10f0f5 = _0x44c140.AMETHYST_SPIKE;else {
              if (_0x3b2ae4.WUU.WUV[_0x44c140.DIAMOND_SPIKE]) _0x10f0f5 = _0x44c140.DIAMOND_SPIKE;else {
                if (_0x3b2ae4.WUU.WUV[_0x44c140.GOLD_SPIKE]) _0x10f0f5 = _0x44c140.GOLD_SPIKE;else {
                  if (_0x3b2ae4.WUU.WUV[_0x44c140.STONE_SPIKE]) _0x10f0f5 = _0x44c140.STONE_SPIKE;else {
                    if (_0x3b2ae4.WUU.WUV[_0x44c140.SPIKE]) _0x10f0f5 = _0x44c140.SPIKE;else _0x3b2ae4.WUU.WUV[_0x44c140.WALL] ? _0x10f0f5 = _0x44c140.WALL : _0x10f0f5 = -1;
                  }
                }
              }
            }
          }
          if (_0x10f0f5 == -1 || !_0x560b63 || _0x3b2ae4.WUZ.WVA) return;
          let _0x2ebb24 = Math.PI * 2,
            _0x48ff50;
          switch (_0x73cd4e.AutoSpike.mode) {
            case 'Normal':
              _0x48ff50 = Math.floor((_0x560b63.angle + _0x2ebb24) % _0x2ebb24 * 255 / _0x2ebb24);
              if (_0x48ff50) {
                for (let _0x58e7ab = 0; _0x58e7ab < 6; _0x58e7ab++) {
                  _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x10f0f5, (_0x58e7ab * 4 + _0x48ff50) % 255, 0])), _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x10f0f5, (_0x48ff50 - _0x58e7ab * 4 + 255) % 255, 0]));
                }
                _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x10f0f5, _0x48ff50 % 255, 0]));
              }
              ;
              break;
            case "Hidden":
              _0x3b2ae4.WUZ.WVB != _0x10f0f5 && Date.now() - _0x4c6c55 > Math.floor(Math.random() * 250) + 250 && _0x53166f.WQR(_0x10f0f5);
              if (Number(_0x73cd4e.AutoSpike.speed) > 0) {
                let _0x4b2f72 = Number(_0x73cd4e.AutoSpike.speed) * 20,
                  _0x5b0e10 = Math.floor(Math.random() * _0x4b2f72) + _0x4b2f72 / 2;
                _0x4cd684.setTimeout(() => {
                  _0x3b2ae4.WUZ.WVB == _0x10f0f5 && (_0x53166f.WQP(), _0x4c6c55 = Date.now());
                }, _0x5b0e10);
              } else _0x3b2ae4.WUZ.WVB == _0x10f0f5 && (_0x53166f.WQP(), _0x4c6c55 = Date.now());
              ;
              break;
            default:
              break;
          }
        } else !_0x73cd4e.AutoSpike.active && _0x4c6c55 && (_0x4c6c55 = 0, _0x3b2ae4.WUZ.WVB = -1);
      }
      function _0x10d518() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.AutoWall.active) {
          let _0x3fd409 = gameWorld.fast_units[_0x57f7e4.uid],
            _0x20504d;
          if (_0x3b2ae4.WUU.WUV[_0x44c140.WALL]) _0x20504d = _0x44c140.WALL;else {
            if (_0x3b2ae4.WUU.WUV[_0x44c140.STONE_WALL]) _0x20504d = _0x44c140.STONE_WALL;else {
              if (_0x3b2ae4.WUU.WUV[_0x44c140.GOLD_WALL]) _0x20504d = _0x44c140.GOLD_WALL;else {
                if (_0x3b2ae4.WUU.WUV[_0x44c140.DIAMOND_WALL]) _0x20504d = _0x44c140.DIAMOND_WALL;else {
                  if (_0x3b2ae4.WUU.WUV[_0x44c140.AMETHYST_WALL]) _0x20504d = _0x44c140.AMETHYST_WALL;else _0x3b2ae4.WUU.WUV[_0x44c140.REIDITE_WALL] ? _0x20504d = _0x44c140.REIDITE_WALL : _0x20504d = -1;
                }
              }
            }
          }
          if (_0x20504d == -1 || !_0x3fd409 || _0x3b2ae4.WUZ.WVA) return;
          let _0x30f0ae = Math.PI * 2,
            _0xd7c6ce;
          switch (_0x73cd4e.AutoWall.mode) {
            case "Normal":
              _0xd7c6ce = Math.floor((_0x3fd409.angle + _0x30f0ae) % _0x30f0ae * 255 / _0x30f0ae);
              if (_0xd7c6ce) {
                for (let _0x2e2fcb = 0; _0x2e2fcb < 6; _0x2e2fcb++) {
                  _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x20504d, (_0x2e2fcb * 4 + _0xd7c6ce) % 255, 0])), _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x20504d, (_0xd7c6ce - _0x2e2fcb * 4 + 255) % 255, 0]));
                }
                _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x20504d, _0xd7c6ce % 255, 0]));
              }
              ;
              break;
            case "Hidden":
              _0x3b2ae4.WUZ.WVB != _0x20504d && Date.now() - _0x28920c > Math.floor(Math.random() * 250) + 250 && _0x53166f.WQR(_0x20504d);
              if (Number(_0x73cd4e.AutoSpike.speed) > 0) {
                let _0x560423 = Number(_0x73cd4e.AutoSpike.speed) * 20,
                  _0x1b491d = Math.floor(Math.random() * _0x560423) + _0x560423 / 2;
                _0x4cd684.setTimeout(() => {
                  _0x3b2ae4.WUZ.WVB == _0x20504d && (_0x53166f.WQP(), _0x28920c = Date.now());
                }, _0x1b491d);
              } else _0x3b2ae4.WUZ.WVB == _0x20504d && (_0x53166f.WQP(), _0x28920c = Date.now());
              ;
              break;
            default:
              break;
          }
        } else !_0x73cd4e.AutoWall.active && _0x28920c && (_0x28920c = 0, _0x3b2ae4.WUZ.WVB = -1);
      }
      function _0x5145fc() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.AutoFire.active) {
          let _0x3f6048 = gameWorld.fast_units[_0x57f7e4.uid];
          if (!_0x3f6048 || _0x3b2ae4.WUZ.WVA || !_0x3b2ae4.WUU.WUV[_0x44c140.FIRE] && !_0x3b2ae4.WUU.WUV[_0x44c140.BIG_FIRE]) return;
          let _0x2cc956 = Math.PI * 2,
            _0x595617 = Math.floor((_0x3f6048.angle + _0x2cc956) % _0x2cc956 * 255 / _0x2cc956);
          _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x44c140.FIRE, _0x595617, 0])), _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x44c140.BIG_FIRE, _0x595617, 0]));
        }
      }
      function _0x36d541() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        let _0x35e07f = gameWorld.fast_units[_0x57f7e4.uid];
        if (_0x73cd4e.AutoCraft.active) {
          if (!_0x35e07f) return;
          if (_0x3b2ae4.WUZ.WVA) return;
          _0x24549d(), _0x275be4 != -1 && _0x53166f.WQI(_0x275be4);
        }
      }
      function _0x7673b7() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        let _0x360ca2 = gameWorld.fast_units[_0x57f7e4.uid];
        if (_0x73cd4e.AutoRecycle.active) {
          if (!_0x360ca2) return;
          if (_0x3b2ae4.WUZ.WVA) return;
          _0x24549d(), _0x4dd090 != -1 && _0x53166f.WQQ(_0x4dd090);
        }
      }
      let lastExtractorTakeTime = 0;
      // --- НАШ УМНЫЙ АВТОСБОР (Интегрированный в контекст чита) ---
      function _0xarctAutotake() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        
        // Проверяем, включено ли что-то в нашем меню
        if (typeof _0x73cd4e === 'undefined' || !_0x73cd4e.ArctSmartMain) return;
        if (!_0x73cd4e.ArctSmartMain.ext && !_0x73cd4e.ArctSmartMain.bread && !_0x73cd4e.ArctSmartMain.steal) return;

        let player = gameWorld.fast_units[_0x57f7e4.uid];
        if (!player) return;

        // Используем оригинальный ключ игрока из настроек чита
        const pidKey = _0x57f7e4.playerIdKey || _0x57f7e4.pid || "playerId";

        try {
          // 1. Умные Экстракторы (24 - 37)
          if (_0x73cd4e.ArctSmartMain.ext) {
            for (let type = 24; type <= 37; type++) {
              let list = gameWorld.units[type];
              if (!list || !Array.isArray(list)) continue;
              for (let i = 0; i < list.length; i++) {
                let ext = list[i];
                if (!ext || ext.x === undefined) continue;
                if (Math.hypot(player.x - ext.x, player.y - ext.y) < 300) {
                  if (((Number(ext.info) & 65280) >> 8) > 0) {
                    let pid = ext[pidKey], iid = ext.id;
                    if (pid !== undefined && iid !== undefined) {
                      _0x53166f.websocket.send(JSON.stringify([12, pid, iid, type]));
                    }
                  }
                }
              }
            }
          }

          // 2. Умный Хлеб (Мельницы 41 и Печи 43)
          if (_0x73cd4e.ArctSmartMain.bread) {
            let mills = gameWorld.units[41];
            if (mills && Array.isArray(mills)) {
              for (let j = 0; j < mills.length; j++) {
                let mill = mills[j];
                if (!mill || mill.x === undefined) continue;
                if (Math.hypot(player.x - mill.x, player.y - mill.y) < 300) {
                  if (((Number(mill.info) & 65280) >> 8) > 0) {
                    let pid = mill[pidKey], iid = mill.id;
                    if (pid !== undefined && iid !== undefined) {
                      _0x53166f.websocket.send(JSON.stringify([1, pid, iid]));
                    }
                  }
                }
              }
            }

            let furnaces = gameWorld.units[43];
            if (furnaces && Array.isArray(furnaces)) {
              for (let j = 0; j < furnaces.length; j++) {
                let furnace = furnaces[j];
                if (!furnace || furnace.x === undefined) continue;
                if (Math.hypot(player.x - furnace.x, player.y - furnace.y) < 300) {
                  if (((Number(furnace.info) & 31744) >> 10) > 0) {
                    let pid = furnace[pidKey], iid = furnace.id;
                    if (pid !== undefined && iid !== undefined) {
                      _0x53166f.websocket.send(JSON.stringify([28, pid, iid]));
                    }
                  }
                }
              }
            }
          }

          // 3. Умные Сундуки (11) - С автовзломом
          if (_0x73cd4e.ArctSmartMain.steal) {
            let chests = gameWorld.units[11];
            if (chests && Array.isArray(chests)) {
              for (let k = 0; k < chests.length; k++) {
                let chest = chests[k];
                if (!chest || chest.x === undefined) continue;
                if (Math.hypot(player.x - chest.x, player.y - chest.y) < 300) {
                  let pid = chest[pidKey], iid = chest.id;
                  if (pid !== undefined && iid !== undefined) {
                    if (chest.lock === 1) {
                      _0x53166f.websocket.send(JSON.stringify([17, pid, iid]));
                      _0x53166f.websocket.send(JSON.stringify([18, pid, iid]));
                    } else if (chest.action !== 0) {
                      _0x53166f.websocket.send(JSON.stringify([18, pid, iid]));
                    }
                  }
                }
              }
            }
          }
        } catch (e) {}
      }

function _0x470946() {
    if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
    let _0x392ad4 = gameWorld.fast_units[_0x57f7e4.uid];
    if (!_0x392ad4) return;
    
    if (_0x73cd4e.AutoExtTake.active || _0x73cd4e.AutoExtPut.active || _0x73cd4e.AutoSteal.active) {
        try {
            let _0x148bae = [
                ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_STONE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_GOLD], 
                ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_DIAMOND], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_AMETHYST], 
                ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_REIDITE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_EMERALD], 
                ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_COPPER], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_IRON], 
                ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_TOPAZ], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_SAPPHIRE], 
                ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_JADE], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_RUBY], 
                ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_COAL], ...gameWorld.units[EntityIDs.EXTRACTOR_MACHINE_AQUAMARINE]
            ];
            
            for (let _0x1dc368 = 0; _0x1dc368 < _0x148bae.length; _0x1dc368++) {
                let _0x1256f2 = _0x148bae[_0x1dc368];
                if (_0x1256f2 && _0x3e37f7(_0x392ad4, _0x1256f2) < 300) {
                    _0x1256f2[_0x57f7e4.iid] = _0x1256f2.id;
                    
                    // Авто-сбор через рабочий метод WSV (пакет 12 с правильным WINDOW3)
                    if (_0x73cd4e.AutoExtTake.active || _0x73cd4e.AutoSteal.active) {
                        let now = Date.now();
                        if (now - lastExtractorTakeTime > 1500) {
                            lastExtractorTakeTime = now;
                            if (typeof _0x53166f.WSV === 'function') {
                                _0x53166f.WSV(_0x1256f2, 1);
                            }
                        }
                    }
                    
                    // Авто-загрузка
                    if (_0x73cd4e.AutoExtPut.active && (_0x1256f2.info & 255) < 255) {
                        _0x53166f.WSU(_0x1256f2, 255);
                    }
                }
            }
        } catch(err) {
            console.error("Ошибка в AutoExtTake:", err);
        }
    }
}
      function _0xa17fac() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        let _0x9ecb06 = gameWorld.units[EntityIDs.BREAD_OVEN];
        for (let _0x4398c6 = 0; _0x4398c6 < _0x9ecb06.length; _0x4398c6++) {
          if (_0x73cd4e.AutoBreadTake.active || _0x73cd4e.AutoBreadPut.active || _0x73cd4e.AutoSteal.active) {
            let _0x340ac7 = gameWorld.fast_units[_0x57f7e4.uid],
              _0x3f1318 = _0x9ecb06[_0x4398c6];
            _0x340ac7 && (console.context().log(_0x3f1318), _0x3e37f7(_0x340ac7, _0x3f1318) < 300 && (console.context().log(_0x3f1318), _0x3f1318[_0x57f7e4.iid] = _0x3f1318.id, _0x73cd4e.AutoBreadPut.active && (_0x53166f.WSR(_0x3f1318, 31, 0), _0x53166f.WSR(_0x3f1318, 0, 31)), (_0x73cd4e.AutoBreadTake.active || _0x73cd4e.AutoSteal.active) && _0x53166f.WSS(_0x3f1318)));
          }
        }
        let _0x33081e = gameWorld.units[EntityIDs.WINDMILL];
        for (let _0x1ba084 = 0; _0x1ba084 < _0x33081e.length; _0x1ba084++) {
          if (_0x73cd4e.AutoBreadTake.active || _0x73cd4e.AutoBreadPut.active || _0x73cd4e.AutoSteal.active) {
            let _0x1aa36e = gameWorld.fast_units[_0x57f7e4.uid];
            _0x1aa36e && _0x3e37f7(_0x1aa36e, _0x33081e[_0x1ba084]) < 300 && (_0x33081e[_0x1ba084][_0x57f7e4.iid] = _0x33081e[_0x1ba084].id, _0x73cd4e.AutoBreadPut.active && _0x53166f.WSP(_0x33081e[_0x1ba084], 255), (_0x73cd4e.AutoBreadTake.active || _0x73cd4e.AutoSteal.active) && _0x53166f.WSY(_0x33081e[_0x1ba084], 255));
          }
        }
      }
      let _0x1b4746 = 0,
        _0x5794ed = ![],
        _0x594fdd = 0;
      function _0x2120c9() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.SmartCraft.active) {
          if (_0x3b2ae4.WUZ.WVA) return;
          _0x24549d();
          let _0x23c8ae = [];
          switch (_0x73cd4e.SmartCraft.option) {
            case "Reidite Spike Doors":
              _0x23c8ae = [[_0x44c140.WOOD_DOOR, _0x44c140.WOOD_DOOR], [_0x44c140.STONE_DOOR, _0x44c140.STONE_DOOR], [_0x44c140.GOLD_DOOR, _0x44c140.GOLD_DOOR], [_0x44c140.DIAMOND_DOOR, _0x44c140.DIAMOND_DOOR], [_0x44c140.AMETHYST_DOOR, _0x44c140.AMETHYST_DOOR], [_0x44c140.REIDITE_DOOR, _0x44c140.REIDITE_DOOR], [_0x44c140.REIDITE_DOOR_SPIKE, _0x44c140.REIDITE_DOOR_SPIKE]];
              break;
            case 'Amethyst\x20Spike\x20Doors':
              _0x23c8ae = [[_0x44c140.WOOD_DOOR, _0x44c140.WOOD_DOOR], [_0x44c140.STONE_DOOR, _0x44c140.STONE_DOOR], [_0x44c140.GOLD_DOOR, _0x44c140.GOLD_DOOR], [_0x44c140.DIAMOND_DOOR, _0x44c140.DIAMOND_DOOR], [_0x44c140.AMETHYST_DOOR, _0x44c140.AMETHYST_DOOR], [_0x44c140.AMETHYST_DOOR_SPIKE, _0x44c140.AMETHYST_DOOR_SPIKE]];
              break;
            case 'Reidite\x20Walls':
              _0x23c8ae = [[_0x44c140.WALL, _0x44c140.WALL], [_0x44c140.STONE_WALL, _0x44c140.STONE_WALL], [_0x44c140.GOLD_WALL, _0x44c140.GOLD_WALL], [_0x44c140.DIAMOND_WALL, _0x44c140.DIAMOND_WALL], [_0x44c140.AMETHYST_WALL, _0x44c140.AMETHYST_WALL], [_0x44c140.REIDITE_WALL, _0x44c140.REIDITE_WALL]];
              break;
            case "Reidite Spikes":
              _0x23c8ae = [[_0x44c140.WALL, _0x44c140.WALL], [_0x44c140.STONE_WALL, _0x44c140.STONE_WALL], [_0x44c140.GOLD_WALL, _0x44c140.GOLD_WALL], [_0x44c140.DIAMOND_WALL, _0x44c140.DIAMOND_WALL], [_0x44c140.AMETHYST_WALL, _0x44c140.AMETHYST_WALL], [_0x44c140.REIDITE_WALL, _0x44c140.REIDITE_WALL], [_0x44c140.REIDITE_SPIKE, _0x44c140.REIDITE_SPIKE]];
              break;
            case 'Amethyst\x20Spikes':
              _0x23c8ae = [[_0x44c140.WALL, _0x44c140.WALL], [_0x44c140.STONE_WALL, _0x44c140.STONE_WALL], [_0x44c140.GOLD_WALL, _0x44c140.GOLD_WALL], [_0x44c140.DIAMOND_WALL, _0x44c140.DIAMOND_WALL], [_0x44c140.AMETHYST_WALL, _0x44c140.AMETHYST_WALL], [_0x44c140.AMETHYST_SPIKE, _0x44c140.AMETHYST_SPIKE]];
              break;
            case "Diamond Spikes":
              _0x23c8ae = [[_0x44c140.WALL, _0x44c140.WALL], [_0x44c140.STONE_WALL, _0x44c140.STONE_WALL], [_0x44c140.GOLD_WALL, _0x44c140.GOLD_WALL], [_0x44c140.DIAMOND_WALL, _0x44c140.DIAMOND_WALL], [_0x44c140.DIAMOND_SPIKE, _0x44c140.DIAMOND_SPIKE]];
              break;
            case "Gold Spikes":
              _0x23c8ae = [[_0x44c140.WALL, _0x44c140.WALL], [_0x44c140.STONE_WALL, _0x44c140.STONE_WALL], [_0x44c140.GOLD_WALL, _0x44c140.GOLD_WALL], [_0x44c140.GOLD_SPIKE, _0x44c140.GOLD_SPIKE]];
              break;
            case "Reidite Swords":
              _0x23c8ae = [[_0x44c140.SWORD_WOOD, _0x44c140.SWORD_WOOD], [_0x44c140.SWORD, _0x44c140.SWORD], [_0x44c140.SWORD_GOLD, _0x44c140.SWORD_GOLD], [_0x44c140.SWORD_DIAMOND, _0x44c140.SWORD_DIAMOND], [_0x44c140.SWORD_AMETHYST, _0x44c140.SWORD_AMETHYST], [_0x44c140.REIDITE_SWORD, _0x44c140.REIDITE_SWORD]];
              break;
            case 'Reidite\x20Spears':
              _0x23c8ae = [[_0x44c140.WOOD_SPEAR, _0x44c140.WOOD_SPEAR], [_0x44c140.SPEAR, _0x44c140.SPEAR], [_0x44c140.GOLD_SPEAR, _0x44c140.GOLD_SPEAR], [_0x44c140.DIAMOND_SPEAR, _0x44c140.DIAMOND_SPEAR], [_0x44c140.AMETHYST_SPEAR, _0x44c140.AMETHYST_SPEAR], [_0x44c140.REIDITE_SPEAR, _0x44c140.REIDITE_SPEAR]];
              break;
            case "Reidite Helmets":
              _0x23c8ae = [[_0x44c140.WOOD_HELMET, _0x44c140.WOOD_HELMET], [_0x44c140.STONE_HELMET, _0x44c140.STONE_HELMET], [_0x44c140.GOLD_HELMET, _0x44c140.GOLD_HELMET], [_0x44c140.DIAMOND_HELMET, _0x44c140.DIAMOND_HELMET], [_0x44c140.AMETHYST_HELMET, _0x44c140.AMETHYST_HELMET], [_0x44c140.REIDITE_HELMET, _0x44c140.REIDITE_HELMET]];
              break;
            case "Reidite Shields":
              _0x23c8ae = [[_0x44c140.WOOD_SHIELD, _0x44c140.WOOD_SHIELD], [_0x44c140.STONE_SHIELD, _0x44c140.STONE_SHIELD], [_0x44c140.GOLD_SHIELD, _0x44c140.GOLD_SHIELD], [_0x44c140.DIAMOND_SHIELD, _0x44c140.DIAMOND_SHIELD], [_0x44c140.AMETHYST_SHIELD, _0x44c140.AMETHYST_SHIELD], [_0x44c140.REIDITE_SHIELD, _0x44c140.REIDITE_SHIELD]];
              break;
            default:
              break;
          }
          if (!_0x5794ed) {
            _0x5794ed = !![];
            if (_0x3b2ae4.WUU.WUV[_0x23c8ae[_0x23c8ae.length - 1][1]]) {
              let _0x4dbf72 = _0x3b2ae4.WUU.WUV[_0x23c8ae[_0x23c8ae.length - 1][1]];
              _0x594fdd = _0x4dbf72 + Number(_0x73cd4e.SmartCraft.amount);
            } else _0x594fdd = Number(_0x73cd4e.SmartCraft.amount);
          }
          _0x1b4746 = 0;
          for (let _0x5c82a0 = 0; _0x5c82a0 < _0x23c8ae.length; _0x5c82a0++) {
            _0x23c8ae[_0x5c82a0][0] == _0x3effc6 && _0x5c82a0 != _0x23c8ae.length - 1 && (_0x1b4746 = _0x5c82a0 + 1);
          }
          if (_0x1b4746 == 0) for (let _0x3e0865 = 0; _0x3e0865 < _0x23c8ae.length; _0x3e0865++) {
            _0x3b2ae4.WUU.WUV[_0x23c8ae[_0x3e0865][1]] && _0x3e0865 != _0x23c8ae.length - 1 && (_0x1b4746 = _0x3e0865 + 1);
          }
          if (_0x3b2ae4.WUU.WUV[_0x23c8ae[_0x23c8ae.length - 1][1]] >= _0x594fdd) {
            _0x73cd4e.SmartCraft.active = ![];
            return;
          }
          _0x53166f.WQI(_0x23c8ae[_0x1b4746][0], 1);
        } else !_0x73cd4e.SmartCraft.active && (_0x5794ed = ![], _0x594fdd = 0);
      }
      function _0x6ad0dd() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        let _0x5d45af = gameWorld.fast_units[_0x57f7e4.uid];
        if (!_0x5d45af) return;
        if (_0x5d45af[_0x57f7e4.ghost]) {
          let _0x3aee33 = gameWorld.units[EntityIDs.RESURRECTION];
          if (_0x3aee33.length) {
            let _0x341370 = ![];
            for (let _0xf11fc2 = 0; _0xf11fc2 < _0x3aee33.length; _0xf11fc2++) {
              if (_0x3e37f7(_0x3aee33[_0xf11fc2], _0x5d45af) <= 100) {
                _0x341370 = !![];
                if (!_0x5d45af[_0x57f7e4.ghost] || !_0x73cd4e.AutoCrown.active || _0x3b2ae4.WUE.wait && !_0x53166f.websocket.url.includes("community")) continue;
                _0x3b2ae4.WSO[_0x57f7e4.pid] = _0x3aee33[_0xf11fc2][_0x57f7e4.pid], _0x3b2ae4.WSO[_0x57f7e4.iid] = _0x3aee33[_0xf11fc2].id, _0x53166f.WSO();
              }
            }
            if (_0x341370 && _0x5d45af[_0x57f7e4.ghost]) _0x3b2ae4.WQK.enabled = !![];else !_0x341370 && (_0x3b2ae4.WQK.enabled = ![]);
          }
        } else _0x3b2ae4.WQK.enabled && (_0x3b2ae4.WQK.enabled = ![]);
      }
      function _0x18210d() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        let _0x142792 = gameWorld.fast_units[_0x57f7e4.uid];
        if (!_0x142792) return;
        let _0xcb66d2 = gameWorld.units[EntityIDs.TOTEM];
        for (let _0xe0692e = 0; _0xe0692e < _0xcb66d2.length; _0xe0692e++) {
          _0x73cd4e.AutoTotem.active && !_0x3b2ae4.WUD.wait && _0x3b2ae4.WUB.length === 0 && !((_0xcb66d2[_0xe0692e].info & 16) >> 4) && _0xcb66d2[_0xe0692e].info < 8 && _0x3e37f7(_0xcb66d2[_0xe0692e], _0x142792) < 300 && (_0x3b2ae4.WUD[_0x57f7e4.pid] = _0xcb66d2[_0xe0692e][_0x57f7e4.pid], _0x3b2ae4.WUD.id = _0xcb66d2[_0xe0692e].id, _0x53166f.WQD());
        }
      }
      function _0x58b203() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        let _0x836028 = gameWorld.fast_units[_0x57f7e4.uid];
        if (_0x73cd4e.AutoBuild.active) {
          if (_0x3b2ae4.WUZ.WVA || !_0x836028) return;
          if (_0x73cd4e.AutoBuild.mode == "Bridges" && _0x3b2ae4.WUU.WUV[_0x44c140.BRIDGE]) {
            let _0x37bdca = Math.PI * 2,
              _0x36d526 = Math.floor((_0x836028.angle + _0x37bdca) % _0x37bdca * 255 / _0x37bdca);
            _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x44c140.BRIDGE, _0x36d526, 0]));
          }
          if (_0x73cd4e.AutoBuild.mode == "Plots" && _0x3b2ae4.WUU.WUV[_0x44c140.PLOT]) {
            let _0x411ade = Math.PI * 2,
              _0x5c6063 = Math.floor((_0x836028.angle + _0x411ade) % _0x411ade * 255 / _0x411ade);
            _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x44c140.PLOT, _0x5c6063, 0]));
          }
          if (_0x73cd4e.AutoBuild.mode == "Roofs" && _0x3b2ae4.WUU.WUV[_0x44c140.ROOF]) {
            let _0x1e9874 = Math.PI * 2,
              _0x42bc19 = Math.floor((_0x836028.angle + _0x1e9874) % _0x1e9874 * 255 / _0x1e9874);
            _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x44c140.ROOF, _0x42bc19, 0]));
          }
        }
      }
      let _0x5ab5c9 = 0,
        _0x2faeb5 = 0;
      function _0x8f2eab(_0x1d7f62) {
        let _0x2a0dc0 = Math.PI * 2,
          _0x45a33a = Math.floor((_0x1d7f62 + _0x2a0dc0) % _0x2a0dc0 * 360 / _0x2a0dc0),
          _0xb2ab22 = 0;
        switch (Math.round(_0x45a33a / 45)) {
          case 0:
            _0xb2ab22 = 2;
            break;
          case 1:
            _0xb2ab22 = 6;
            break;
          case 2:
            _0xb2ab22 = 4;
            break;
          case 3:
            _0xb2ab22 = 5;
            break;
          case 4:
            _0xb2ab22 = 1;
            break;
          case 5:
            _0xb2ab22 = 9;
            break;
          case 6:
            _0xb2ab22 = 8;
            break;
          case 7:
            _0xb2ab22 = 10;
            break;
          case 8:
            _0xb2ab22 = 2;
            break;
        }
        if (_0xb2ab22 == _0x2faeb5) {
          _0x5ab5c9++;
          if (_0x5ab5c9 > 1) return;else (function (dir) {
            const keys = {
              1: 'a',
              2: 'd',
              4: 's',
              8: 'w'
            };
            const keyCodes = {
              1: 65,
              2: 68,
              4: 83,
              8: 87
            };

            // Release all keys
            ['w', 'a', 's', 'd'].forEach(k => {
              const code = k.toUpperCase().charCodeAt(0);
              const ev = new KeyboardEvent('keyup', {
                key: k,
                code: 'Key' + k.toUpperCase(),
                keyCode: code,
                which: code,
                bubbles: true,
                cancelable: true
              });
              window.dispatchEvent(ev);
              document.dispatchEvent(ev);
              document.body.dispatchEvent(ev);
              document.documentElement.dispatchEvent(ev);
            });
            if (dir === 0) return;

            // Press keys based on direction bitmask (inversé)
            [1, 2, 4, 8].forEach(bit => {
              if (dir & bit) {
                const k = keys[bit];
                const code = keyCodes[bit];
                const ev = new KeyboardEvent('keydown', {
                  key: k,
                  code: 'Key' + k.toUpperCase(),
                  keyCode: code,
                  which: code,
                  bubbles: true,
                  cancelable: true
                });
                window.dispatchEvent(ev);
                document.dispatchEvent(ev);
                document.body.dispatchEvent(ev);
                document.documentElement.dispatchEvent(ev);
              }
            });
          })(_0xb2ab22), _0x2faeb5 = _0xb2ab22;
        } else _0x5ab5c9 = 0, function (dir) {
          const keys = {
            1: 'a',
            2: 'd',
            4: 's',
            8: 'w'
          };
          const keyCodes = {
            1: 65,
            2: 68,
            4: 83,
            8: 87
          };

          // Release all keys
          ['w', 'a', 's', 'd'].forEach(k => {
            const code = k.toUpperCase().charCodeAt(0);
            const ev = new KeyboardEvent('keyup', {
              key: k,
              code: 'Key' + k.toUpperCase(),
              keyCode: code,
              which: code,
              bubbles: true,
              cancelable: true
            });
            window.dispatchEvent(ev);
            document.dispatchEvent(ev);
            document.body.dispatchEvent(ev);
            document.documentElement.dispatchEvent(ev);
          });
          if (dir === 0) return;

          // Press keys based on direction bitmask (inversé)
          [1, 2, 4, 8].forEach(bit => {
            if (dir & bit) {
              const k = keys[bit];
              const code = keyCodes[bit];
              const ev = new KeyboardEvent('keydown', {
                key: k,
                code: 'Key' + k.toUpperCase(),
                keyCode: code,
                which: code,
                bubbles: true,
                cancelable: true
              });
              window.dispatchEvent(ev);
              document.dispatchEvent(ev);
              document.body.dispatchEvent(ev);
              document.documentElement.dispatchEvent(ev);
            }
          });
        }(_0xb2ab22), _0x2faeb5 = _0xb2ab22;
      }
      let _0x171940 = ![],
        _0x2260d7 = 0;
      function _0x63023() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.Aimbot.active) {
          let _0x1c7ae1 = gameWorld.fast_units[_0x57f7e4.uid];
          if (!_0x1c7ae1) {
            if (_0x171940) return _0x171940 = ![], _0x2e00d9 = ![], _0x53166f.WQT();else return;
          }
          const _0x1823aa = _0x4f84b6(),
            _0x5d61f1 = _0x1823aa[0];
          _0x352145 = _0x1823aa[1];
          if (!_0x5d61f1) {
            _0x4d6c3f = 0, _0x73cd4e.Aimbot.angle = 0;
            if (_0x171940) return _0x171940 = ![], _0x2e00d9 = ![], _0x53166f.WQT();else return;
          } else _0x4d6c3f = 1;
          const _0x49623d = _0x4e4eb0({
            'x': _0x5d61f1.r.x + _0x3b2ae4.WUF.x,
            'y': _0x5d61f1.r.y + _0x3b2ae4.WUF.y
          }, {
            'x': _0x1c7ae1.r.x + _0x3b2ae4.WUF.x,
            'y': _0x1c7ae1.r.y + _0x3b2ae4.WUF.y
          });
          if (!_0x49623d && _0x49623d != 0) {
            _0x73cd4e.Aimbot.angle = 0;
            if (_0x171940) return _0x171940 = ![], _0x2e00d9 = ![], _0x53166f.WQT();else return;
          }
          const _0x26b29d = _0x57c289(_0x1c7ae1.right);
          _0x26b29d ? _0x1d1dbe = _0x26b29d : _0x1d1dbe = 0;
          const _0x5c277e = [133, 203, 110, 120, 143, _0x73cd4e.Aimbot.BowRange][_0x26b29d - 1] || 0;
          if (!_0x5c277e) {
            _0x73cd4e.Aimbot.angle = 0;
            if (_0x171940) return _0x171940 = ![], _0x2e00d9 = ![], _0x53166f.WQT();else return;
          }
          (_0x73cd4e.Aimbot.mode == 'Attack\x20&\x20Chase' || _0x73cd4e.Aimbot.mode == "Rabbit Chase") && _0x8f2eab(_0x49623d);
          const _0xe5099f = _0x352145 <= _0x5c277e,
            _0xec650d = !_0xe5099f && _0x352145 <= _0x5c277e + 0;
          (_0xec650d || !_0xe5099f) && _0x171940 && (_0x171940 = ![], _0x2e00d9 = ![], _0x53166f.WQT());
          if (_0xe5099f || _0xec650d) {
            if (_0x73cd4e.Aimbot.angle == _0x49623d) {
              _0x2260d7++;
              if (_0x2260d7 > 1) return;
            } else _0x2260d7 = 0;
          }
          if (_0xe5099f) _0x2e00d9 = !![], _0x171940 = !![], _0x73cd4e.Aimbot.angle = _0x49623d, _0x53166f.WQU(_0x49623d);else {
            if (_0xec650d) _0x73cd4e.Aimbot.angle = _0x49623d, _0x53166f.WQU(_0x49623d);else _0x73cd4e.Aimbot.angle && (_0x73cd4e.Aimbot.angle = 0);
          }
        } else {
          if (_0x171940) return _0x171940 = ![], _0x2e00d9 = ![], _0x53166f.WQT();
        }
      }
      function _0x37f007() {
        if (!_0x53166f.websocket || _0x53166f.websocket.readyState !== 1 || !_0x2a8f98 || _0x52745a || !_0x73cd4e.ZmaAutoCrown || !_0x53166f.websocket.url.includes("community")) return;
        let _0x189f08 = gameWorld.fast_units[_0x57f7e4.uid];
        if (!_0x189f08) return;
        if (Math.floor(_0x3b2ae4.WSJ.WUN * 100) != 100 && _0x3b2ae4.WUU.WUV[_0x44c140.CROWN_GREEN] && _0x189f08[_0x57f7e4.clothe] != _0x44c140.CROWN_GREEN && (5 - (Date.now() - _0x169d08) / 1000).toFixed(1) <= (_0x1ed932 ? (_0x1ed932 + 100) / 1000 : 0.3) && !_0x595c6a && _0x2b2f75) _0x595c6a = !![], _0xf0d15d = _0x189f08[_0x57f7e4.clothe], _0x53166f.WQR(_0x44c140.CROWN_GREEN);else _0x189f08[_0x57f7e4.clothe] == _0x44c140.CROWN_GREEN && ((5 - (Date.now() - _0x169d08) / 1000).toFixed(1) > (_0x1ed932 ? (_0x1ed932 + 100) / 1000 : 0.3) || (5 - (Date.now() - _0x169d08) / 1000).toFixed(1) < (_0x1ed932 ? (_0x1ed932 - 100) / 1000 : 0)) && _0x595c6a && (_0x595c6a = ![], _0xf0d15d != 0 && _0x53166f.WQR(_0xf0d15d));
      }
      function _0x403abc() {
        if (!_0x53166f.websocket || _0x53166f.websocket.readyState !== 1 || !_0x2a8f98 || !_0x73cd4e.ZmaAutoBottle.enabled || !_0x53166f.websocket.url.includes("community")) return;
        let _0x31fb78 = gameWorld.fast_units[_0x57f7e4.uid];
        if (!_0x31fb78) return;
        if (!_0x4d0ecf && _0x3b2ae4.WUU.WUV[_0x44c140.BOTTLE_FULL] && Math.floor(_0x3b2ae4.WSJ.WUN * 100) <= Number(_0x73cd4e.ZmaAutoBottle.health)) _0x4d0ecf = !![], _0x53166f.WQR(_0x44c140.BOTTLE_FULL);else _0x4d0ecf && Math.floor(_0x3b2ae4.WSJ.WUN * 100) > Number(_0x73cd4e.ZmaAutoBottle.health) && (_0x4d0ecf = ![]);
      }
      function _0x11f4e2() {
        if (!_0x53166f.websocket || _0x53166f.websocket.readyState !== 1 || !_0x2a8f98 || !_0x73cd4e.ZmaRedGold.active || !_0x53166f.websocket.url.includes('community')) return;
        let _0x52ef99 = gameWorld.fast_units[_0x57f7e4.uid];
        if (!_0x52ef99) return;
        for (let _0x1c51f4 = 0; gameWorld.units[EntityIDs.CHEST].length > _0x1c51f4; _0x1c51f4++) {
          for (let _0x442ab8 = 0; _0x3b2ae4.WUU.WUV.length > _0x442ab8; _0x442ab8++) {
            _0x3b2ae4.WUU.WUV[_0x442ab8] && (_0x442ab8 == _0x44c140.REIDITE || _0x442ab8 == _0x44c140.GOLD) && _0x3e37f7(_0x52ef99, gameWorld.units[EntityIDs.CHEST][_0x1c51f4]) < 150 && (gameWorld.units[EntityIDs.CHEST][_0x1c51f4].ally = _0x9cb2d9.id === gameWorld.units[EntityIDs.CHEST][_0x1c51f4][_0x57f7e4.pid] || _0x194c5e(gameWorld.units[EntityIDs.CHEST][_0x1c51f4][_0x57f7e4.pid]), (gameWorld.units[EntityIDs.CHEST][_0x1c51f4].ally || !gameWorld.units[EntityIDs.CHEST][_0x1c51f4].lock) && (gameWorld.units[EntityIDs.CHEST][_0x1c51f4][_0x57f7e4.iid] = gameWorld.units[EntityIDs.CHEST][_0x1c51f4].id, _0x53166f.WSW(gameWorld.units[EntityIDs.CHEST][_0x1c51f4], _0x442ab8, 255)));
          }
        }
      }
      function _0x141315() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        let _0xfb25da = gameWorld.fast_units[_0x57f7e4.uid];
        if (_0x73cd4e.AutoSeed.active && _0x3b2ae4.WUU.WUV[_0x10eff0]) {
          if (_0x3b2ae4.WUZ.WVA || !_0xfb25da) return;
          for (let _0x4b9018 = 0; _0x4b9018 < 26; _0x4b9018++) {
            _0x53166f.websocket.send(JSON.stringify([_0x4e5e95.build, _0x10eff0, _0x4b9018 * 10, 1]));
          }
        }
      }
      function _0x55cfc7() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.AutoFarm.active) {
          let _0x5b5d3f = gameWorld.fast_units[_0x57f7e4.uid];
          if (!_0x5b5d3f) return;
          let _0x147baf = {
            'Object': null,
            'Distance': -1,
            'Function': 0
          };
          var _0x425aee = {
            'x': _0x73cd4e.AutoFarm.TLX,
            'y': _0x73cd4e.AutoFarm.TLY,
            'width': _0x73cd4e.AutoFarm.BRX - _0x73cd4e.AutoFarm.TLX,
            'height': _0x73cd4e.AutoFarm.BRY - _0x73cd4e.AutoFarm.TLY
          };
          for (var _0x3645a4 = 0, _0xa306e6 = [...gameWorld.units[EntityIDs.SEED], ...gameWorld.units[EntityIDs.PUMPKIN_SEED], ...gameWorld.units[EntityIDs.GARLIC_SEED], ...gameWorld.units[EntityIDs.THORNBUSH_SEED], ...gameWorld.units[EntityIDs.CARROT_SEED], ...gameWorld.units[EntityIDs.TOMATO_SEED], ...gameWorld.units[EntityIDs.WATERMELON_SEED], ...gameWorld.units[EntityIDs.ALOE_VERA_SEED], ...gameWorld.units[EntityIDs.WHEAT_SEED]], _0x1cdb5d = _0xa306e6.length, _0x35dcf5 = null, _0x32c191 = null; _0x3645a4 < _0x1cdb5d; ++_0x3645a4) {
            _0x35dcf5 = _0xa306e6[_0x3645a4];
            if (!_0x35dcf5.info || _0x35dcf5.info === 10) continue;
            if (!_0x3b2ae4.WUU.WUV[_0x44c140.WATERING_CAN_FULL] && _0x35dcf5.info === 16) continue;
            _0x425aee.x < _0x35dcf5.x - 50 + 100 && _0x425aee.x + _0x425aee.width > _0x35dcf5.x - 50 && _0x425aee.y < _0x35dcf5.y - 50 + 100 && _0x425aee.y + _0x425aee.height > _0x35dcf5.y - 50 && (_0x32c191 = (_0x5b5d3f.x - _0x35dcf5.x) ** 2 + (_0x5b5d3f.y - _0x35dcf5.y) ** 2, (_0x147baf.Distance === -1 || _0x32c191 < _0x147baf.Distance) && (_0x147baf.Distance = _0x32c191, _0x147baf.Object = _0x35dcf5));
          }
          let _0x2d4f1d = _0x3b2ae4.WSJ.WUM + (1 - _0x3b2ae4.WSJ.WUS) <= 0.1 && _0x53166f.websocket.url.includes("experimental");
          if (_0x147baf.Object && Math.floor(_0x3b2ae4.WSJ.WUN * 100) > 80 && !_0x2d4f1d) {
            _0x147baf.Distance = _0x3e37f7(_0x5b5d3f, _0x147baf.Object);
            switch (_0x147baf.Object.info) {
              case 16:
              case 17:
              case 18:
              case 19:
                if (_0x3b2ae4.WUU.WUV[_0x44c140.WATERING_CAN_FULL]) _0x5b5d3f.right !== _0x44c140.WATERING_CAN_FULL && _0x53166f.WQR(_0x44c140.WATERING_CAN_FULL), _0x147baf.Function = 1;else {
                  if (_0x3b2ae4.WUU.WUV[_0x44c140.PITCHFORK]) _0x5b5d3f.right !== _0x44c140.PITCHFORK && _0x53166f.WQR(_0x44c140.PITCHFORK);else _0x3b2ae4.WUU.WUV[_0x44c140.PITCHFORK2] && _0x5b5d3f.right !== _0x44c140.PITCHFORK2 && _0x53166f.WQR(_0x44c140.PITCHFORK2);
                  _0x147baf.Function = 2;
                }
                ;
                break;
              case 1:
              case 2:
              case 3:
                if (_0x3b2ae4.WUU.WUV[_0x44c140.PITCHFORK]) _0x5b5d3f.right !== _0x44c140.PITCHFORK && _0x53166f.WQR(_0x44c140.PITCHFORK);else _0x3b2ae4.WUU.WUV[_0x44c140.PITCHFORK2] && _0x5b5d3f.right !== _0x44c140.PITCHFORK2 && _0x53166f.WQR(_0x44c140.PITCHFORK2);
                ;
                _0x147baf.Function = 2;
                break;
            }
            let _0x56830f = {
                'x': _0x5b5d3f.x - _0x147baf.Object.x,
                'y': _0x5b5d3f.y - _0x147baf.Object.y
              },
              _0x2b8d4a = {
                'x': Math.abs(_0x5b5d3f.x - _0x147baf.Object.x),
                'y': Math.abs(_0x5b5d3f.y - _0x147baf.Object.y)
              },
              _0x193f82 = 0;
            _0x2b8d4a.x > 50 && (_0x56830f.x > 0 && (_0x193f82 += 1), _0x56830f.x < 0 && (_0x193f82 += 2));
            _0x2b8d4a.y > 50 && (_0x56830f.y > 0 && (_0x193f82 += 8), _0x56830f.y < 0 && (_0x193f82 += 4));
            if (_0x193f82 == 0) {
              _0x541fb9++;
              if (_0x541fb9 == 5) {
                let _0x293873 = [1, 2, 4, 8];
                _0x193f82 += _0x293873[Math.floor(Math.random() * 4)];
              }
            }
            (function (dir) {
              const keys = {
                1: 'a',
                2: 'd',
                4: 's',
                8: 'w'
              };
              const keyCodes = {
                1: 65,
                2: 68,
                4: 83,
                8: 87
              };

              // Release all keys
              ['w', 'a', 's', 'd'].forEach(k => {
                const code = k.toUpperCase().charCodeAt(0);
                const ev = new KeyboardEvent('keyup', {
                  key: k,
                  code: 'Key' + k.toUpperCase(),
                  keyCode: code,
                  which: code,
                  bubbles: true,
                  cancelable: true
                });
                window.dispatchEvent(ev);
                document.dispatchEvent(ev);
                document.body.dispatchEvent(ev);
                document.documentElement.dispatchEvent(ev);
              });
              if (dir === 0) return;

              // Press keys based on direction bitmask (inversé)
              [1, 2, 4, 8].forEach(bit => {
                if (dir & bit) {
                  const k = keys[bit];
                  const code = keyCodes[bit];
                  const ev = new KeyboardEvent('keydown', {
                    key: k,
                    code: 'Key' + k.toUpperCase(),
                    keyCode: code,
                    which: code,
                    bubbles: true,
                    cancelable: true
                  });
                  window.dispatchEvent(ev);
                  document.dispatchEvent(ev);
                  document.body.dispatchEvent(ev);
                  document.documentElement.dispatchEvent(ev);
                }
              });
            })(_0x193f82), _0x2b8d4a.x < (_0x147baf.Function === 1 ? 120 : 300) && _0x2b8d4a.y < (_0x147baf.Function === 1 ? 120 : 300) && (_0x73cd4e.AutoFarm.angle = _0x4e4eb0(_0x147baf.Object, _0x5b5d3f), _0x73cd4e.AutoFarm.angle && (_0x53166f.WQU(_0x73cd4e.AutoFarm.angle), _0x53166f.WQT()));
          } else {
            let _0x3012c3 = {
                'x': _0x5b5d3f.x - _0x73cd4e.AutoFarm.SX,
                'y': _0x5b5d3f.y - _0x73cd4e.AutoFarm.SY
              },
              _0x41c9ee = {
                'x': Math.abs(_0x5b5d3f.x - _0x73cd4e.AutoFarm.SX),
                'y': Math.abs(_0x5b5d3f.y - _0x73cd4e.AutoFarm.SY)
              },
              _0x1a6b8b = 0;
            _0x41c9ee.x > 30 && (_0x3012c3.x > 0 && (_0x1a6b8b += 1), _0x3012c3.x < 0 && (_0x1a6b8b += 2));
            _0x41c9ee.y > 30 && (_0x3012c3.y > 0 && (_0x1a6b8b += 8), _0x3012c3.y < 0 && (_0x1a6b8b += 4));
            (function (dir) {
              const keys = {
                1: 'a',
                2: 'd',
                4: 's',
                8: 'w'
              };
              const keyCodes = {
                1: 65,
                2: 68,
                4: 83,
                8: 87
              };

              // Release all keys
              ['w', 'a', 's', 'd'].forEach(k => {
                const code = k.toUpperCase().charCodeAt(0);
                const ev = new KeyboardEvent('keyup', {
                  key: k,
                  code: 'Key' + k.toUpperCase(),
                  keyCode: code,
                  which: code,
                  bubbles: true,
                  cancelable: true
                });
                window.dispatchEvent(ev);
                document.dispatchEvent(ev);
                document.body.dispatchEvent(ev);
                document.documentElement.dispatchEvent(ev);
              });
              if (dir === 0) return;

              // Press keys based on direction bitmask (inversé)
              [1, 2, 4, 8].forEach(bit => {
                if (dir & bit) {
                  const k = keys[bit];
                  const code = keyCodes[bit];
                  const ev = new KeyboardEvent('keydown', {
                    key: k,
                    code: 'Key' + k.toUpperCase(),
                    keyCode: code,
                    which: code,
                    bubbles: true,
                    cancelable: true
                  });
                  window.dispatchEvent(ev);
                  document.dispatchEvent(ev);
                  document.body.dispatchEvent(ev);
                  document.documentElement.dispatchEvent(ev);
                }
              });
            })(_0x1a6b8b);
            if (_0x2d4f1d) {
              if (_0x3b2ae4.WUU.WUV[_0x44c140.PITCHFORK]) _0x5b5d3f.right !== _0x44c140.PITCHFORK && _0x53166f.WQR(_0x44c140.PITCHFORK);else _0x3b2ae4.WUU.WUV[_0x44c140.PITCHFORK2] && _0x5b5d3f.right !== _0x44c140.PITCHFORK2 && _0x53166f.WQR(_0x44c140.PITCHFORK2);
              _0x73cd4e.AutoFarm.angle = _0x4e4eb0({
                'x': _0x73cd4e.AutoFarm.SX,
                'y': _0x73cd4e.AutoFarm.SY
              }, _0x5b5d3f), _0x73cd4e.AutoFarm.angle && (_0x53166f.WQU(_0x73cd4e.AutoFarm.angle), _0x53166f.WQT());
            }
          }
        }
      }
      function _0x822321() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.PathFinder.active) {
          let _0x5ccb5f = gameWorld.fast_units[_0x57f7e4.uid];
          if (!_0x5ccb5f) return;
          _0x53166f.websocket.url.includes("experimental") && _0x3b2ae4.WUU.WUV[_0x44c140.BOAT] && _0x5ccb5f[_0x57f7e4.vehicle] != _0x44c140.BOAT && _0x53166f.WQR(_0x44c140.BOAT);
          findpath({
            'x': Math.round(_0x5ccb5f.x / 100),
            'y': Math.round(_0x5ccb5f.y / 100)
          }, _0x73cd4e.PathFinder.End);
          let _0x484e93 = {
            'x': _0x73cd4e.PathFinder.End.x * 100,
            'y': _0x73cd4e.PathFinder.End.y * 100
          };
          _0x3e37f7(_0x5ccb5f, _0x484e93) < 1000 && lastChosenKit != -1 && _0x73cd4e.lastKit && chooseKit(lastChosenKit);
          if (_0x73cd4e.PathFinder.inventory) {
            if (_0x3e37f7(_0x5ccb5f, _0x484e93) < 300) for (let _0x16fb3c = 0; gameWorld.units[EntityIDs.CHEST].length > _0x16fb3c; _0x16fb3c++) {
              for (let _0x4e36f8 = 0; _0x3b2ae4.WUU.WUV.length > _0x4e36f8; _0x4e36f8++) {
                if (_0x3b2ae4.WUU.WUV[_0x4e36f8]) {
                  if (_0x3e37f7(_0x5ccb5f, gameWorld.units[EntityIDs.CHEST][_0x16fb3c]) < 150) {
                    gameWorld.units[EntityIDs.CHEST][_0x16fb3c].ally = _0x9cb2d9.id === gameWorld.units[EntityIDs.CHEST][_0x16fb3c][_0x57f7e4.pid] || _0x194c5e(gameWorld.units[EntityIDs.CHEST][_0x16fb3c][_0x57f7e4.pid]);
                    if (gameWorld.units[EntityIDs.CHEST][_0x16fb3c].ally || !gameWorld.units[EntityIDs.CHEST][_0x16fb3c].lock) {
                      gameWorld.units[EntityIDs.CHEST][_0x16fb3c][_0x57f7e4.iid] = gameWorld.units[EntityIDs.CHEST][_0x16fb3c].id, _0x53166f.WSW(gameWorld.units[EntityIDs.CHEST][_0x16fb3c], _0x4e36f8, 255);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
      function _0xa9a345() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.AutoEmerald.active) {
          let _0x557944 = gameWorld.fast_units[_0x57f7e4.uid];
          if (!_0x557944) return;
          let _0x4ac6bf = ![];
          _0x53166f.websocket.url.includes('experimental') ? _0x4ac6bf = [[28750, 3018], [29563, 3273], [29519, 2750]] : _0x4ac6bf = [[21550, 29718], [21963, 29773], [21919, 29350]];
          if (!_0x4ac6bf) return;
          let _0xc8a5be = {
              'x': _0x4ac6bf[_0x13a394][0],
              'y': _0x4ac6bf[_0x13a394][1]
            },
            _0x2b927b = {
              'x': _0x557944.x - _0xc8a5be.x,
              'y': _0x557944.y - _0xc8a5be.y
            },
            _0xef7e3f = {
              'x': Math.abs(_0x557944.x - _0xc8a5be.x),
              'y': Math.abs(_0x557944.y - _0xc8a5be.y)
            },
            _0x34fc58 = 0;
          _0xef7e3f.x > 60 && (_0x2b927b.x > 0 && (_0x34fc58 += 1), _0x2b927b.x < 0 && (_0x34fc58 += 2));
          _0xef7e3f.y > 60 && (_0x2b927b.y > 0 && (_0x34fc58 += 8), _0x2b927b.y < 0 && (_0x34fc58 += 4));
          (function (dir) {
            const keys = {
              1: 'a',
              2: 'd',
              4: 's',
              8: 'w'
            };
            const keyCodes = {
              1: 65,
              2: 68,
              4: 83,
              8: 87
            };

            // Release all keys
            ['w', 'a', 's', 'd'].forEach(k => {
              const code = k.toUpperCase().charCodeAt(0);
              const ev = new KeyboardEvent('keyup', {
                key: k,
                code: 'Key' + k.toUpperCase(),
                keyCode: code,
                which: code,
                bubbles: true,
                cancelable: true
              });
              window.dispatchEvent(ev);
              document.dispatchEvent(ev);
              document.body.dispatchEvent(ev);
              document.documentElement.dispatchEvent(ev);
            });
            if (dir === 0) return;

            // Press keys based on direction bitmask (inversé)
            [1, 2, 4, 8].forEach(bit => {
              if (dir & bit) {
                const k = keys[bit];
                const code = keyCodes[bit];
                const ev = new KeyboardEvent('keydown', {
                  key: k,
                  code: 'Key' + k.toUpperCase(),
                  keyCode: code,
                  which: code,
                  bubbles: true,
                  cancelable: true
                });
                window.dispatchEvent(ev);
                document.dispatchEvent(ev);
                document.body.dispatchEvent(ev);
                document.documentElement.dispatchEvent(ev);
              }
            });
          })(_0x34fc58);
          if (_0xef7e3f.x < 100 && _0xef7e3f.y < 100) {
            let _0x4a7428 = 0;
            switch (_0x13a394) {
              case 0:
                _0x53166f.WQU(_0x4a7428 = -3.683671385973914);
                break;
              case 1:
                _0x53166f.WQU(_0x4a7428 = -5.2852676407451815);
                break;
              case 2:
                _0x53166f.WQU(_0x4a7428 = -0.948637781672212);
                break;
            }
            _0x53166f.WQT(), _0x73cd4e.AutoEmerald.angle = _0x4a7428;
          }
        }
      }
      let _0x4f9ddb = ![],
        _0x6f80b1 = Date.now();
      function _0x526c43() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.AutoLand.active) {
          let _0xdbfeac = gameWorld.fast_units[_0x57f7e4.uid];
          if (!_0xdbfeac) return;
          if (!_0xdbfeac[_0x57f7e4.fly] && _0xdbfeac[_0x57f7e4.vehicle] == _0x57f7e4.flyableEquiped && _0x4f9ddb) {
            let _0x2e3708 = Math.sqrt(Math.abs(_0xdbfeac.x - _0xdbfeac.r.x) ** 2 + Math.abs(_0xdbfeac.y - _0xdbfeac.r.y) ** 2);
            _0x2e3708 <= 50 && _0xdbfeac[_0x57f7e4.speed] < 50 && (_0xdbfeac[_0x57f7e4.speed] >= 30 || _0xdbfeac[_0x57f7e4.speed] < 1) && Date.now() - _0x6f80b1 >= (_0x1ed932 ? _0x1ed932 + 150 : 300) && (_0x6f80b1 = Date.now(), _0x53166f.WQR(_0x57f7e4.flyableEquiped));
          } else {
            if (_0xdbfeac[_0x57f7e4.vehicle] != _0x57f7e4.flyableEquiped) _0x4f9ddb = ![];else {
              if (_0xdbfeac[_0x57f7e4.fly]) _0x4f9ddb = !![];else _0xdbfeac[_0x57f7e4.vehicle] == _0x44c140.BOAT && _0xdbfeac[_0x57f7e4.speed] > 50 && (_0x4f9ddb = !![]);
            }
          }
        }
      }
      let _0x36cbec = ![],
        _0x7f2fc1 = ![],
        _0x3cfffb = [],
        _0x26b0ff = {
          'x': 0,
          'y': 0
        };
      function _0x1aff1e() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.AutoDiving.active) {
          let _0x408ea3 = gameWorld.fast_units[_0x57f7e4.uid];
          !_0x3b2ae4.WUZ.WUP && !_0x7f2fc1 && (_0x36cbec = ![]);
          if (_0x408ea3) {
            _0x7f2fc1 = ![];
            for (let _0x2c3778 = 0; _0x3cfffb.length > _0x2c3778; _0x2c3778++) {
              if (Math.floor(_0x408ea3.r.x / 100) == _0x3cfffb[_0x2c3778][0] && Math.floor(_0x408ea3.r.y / 100) == _0x3cfffb[_0x2c3778][1]) {
                _0x7f2fc1 = !![];
                break;
              }
            }
            if (_0x408ea3[_0x57f7e4.clothe] != _0x44c140.DIVING_MASK && _0x408ea3[_0x57f7e4.clothe] != _0x44c140.SUPER_DIVING_SUIT && (!_0x3b2ae4.WUE.wait || _0x53166f.websocket.url.includes("community")) && !_0x36cbec && (_0x3b2ae4.WUZ.WUP || _0x7f2fc1) && (_0x408ea3[_0x57f7e4.vehicle] != _0x57f7e4.flyableEquiped || _0x57f7e4.flyableEquiped == 0) && (!_0x3b2ae4.WUE.wait || _0x53166f.websocket.url.includes("community"))) {
              _0x36cbec = !![];
              if (_0x3b2ae4.WUU.WUV[_0x44c140.SUPER_DIVING_SUIT]) _0x53166f.WQR(_0x44c140.SUPER_DIVING_SUIT);else _0x3b2ae4.WUU.WUV[_0x44c140.DIVING_MASK] && _0x53166f.WQR(_0x44c140.DIVING_MASK);
            } else (_0x408ea3[_0x57f7e4.clothe] == _0x44c140.DIVING_MASK || _0x408ea3[_0x57f7e4.clothe] == _0x44c140.SUPER_DIVING_SUIT && !_0x36cbec && (_0x3b2ae4.WUZ.WUP || _0x7f2fc1) && (_0x408ea3[_0x57f7e4.vehicle] != _0x57f7e4.flyableEquiped || _0x57f7e4.flyableEquiped == 0) && (!_0x3b2ae4.WUE.wait || _0x53166f.websocket.url.includes("community"))) && (_0x36cbec = !![]);
          }
          if (_0x408ea3) {
            if (_0x26b0ff.x != Math.floor(_0x408ea3.x / 100) || _0x26b0ff.y != Math.floor(_0x408ea3.y / 100)) {
              _0x3cfffb = [], _0x26b0ff.x = Math.floor(_0x408ea3.x / 100), _0x26b0ff.y = Math.floor(_0x408ea3.y / 100);
              for (let _0xe3781d = 0; _0x5c4a40.length > _0xe3781d; _0xe3781d++) {
                let _0x4af95e = _0x3e37f7({
                  'x': Math.floor(_0x408ea3.r.x / 100),
                  'y': Math.floor(_0x408ea3.r.y / 100)
                }, {
                  'x': _0x5c4a40[_0xe3781d][0],
                  'y': _0x5c4a40[_0xe3781d][1]
                });
                _0x4af95e < 2 && _0x3cfffb.push(_0x5c4a40[_0xe3781d]);
              }
            }
          }
        }
      }
      function _0x473864() {
        if (_0x73cd4e.AutoFurnace.active) {
          if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
          let _0x52eb82 = gameWorld.fast_units[_0x57f7e4.uid];
          if (!_0x52eb82) return;
          let _0x3194c8 = gameWorld.units[EntityIDs.FURNACE];
          if (_0x3194c8.length) for (let _0xf5da6b = 0; _0xf5da6b < _0x3194c8.length; _0xf5da6b++) {
            _0x3e37f7(_0x3194c8[_0xf5da6b], _0x52eb82) <= 150 && (_0x3194c8[_0xf5da6b][_0x57f7e4.iid] = _0x3194c8[_0xf5da6b].id, _0x53166f.WSV(_0x3194c8[_0xf5da6b], 255));
          }
        }
      }
      function _0x1a822c() {
        if (_0x73cd4e.AutoTame.active) {
          if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
          let _0x2a31dc = gameWorld.fast_units[_0x57f7e4.uid];
          if (!_0x2a31dc) return;
          if (_0x3b2ae4.WUU.WUV[_0x44c140.SADDLE] && !_0x2a31dc[_0x57f7e4.fly]) {
            let _0x4504f1 = 0,
              _0x5b592e = 0;
            for (let _0x361b3b = 0, _0x47e3ff = [...gameWorld.units[EntityIDs.PARROT], ...gameWorld.units[EntityIDs.GOLDEN_CHICKEN], ...gameWorld.units[EntityIDs.BABY_DRAGON], ...gameWorld.units[EntityIDs.BABY_LAVA], ...gameWorld.units[EntityIDs.BABY_MAMMOTH], ...gameWorld.units[EntityIDs.CRAB_BOSS], ...gameWorld.units[EntityIDs.HAWK]]; _0x361b3b < _0x47e3ff.length; _0x361b3b++) {
              let _0x31c6ec = _0x47e3ff[_0x361b3b];
              _0x3e37f7(_0x2a31dc, _0x31c6ec) < 150 && (_0x4504f1++, (_0x31c6ec.info & 1) === 0 && (_0x73cd4e.AutoTame.angle = _0x4e4eb0(_0x31c6ec, _0x2a31dc), _0x5b592e++));
            }
            if (!_0x5b592e) _0x73cd4e.AutoTame.angle = 0, _0x3b2ae4.WUU.WUV[_0x44c140.EXPLORER_HAT] && _0x2a31dc[_0x57f7e4.clothe] != _0x44c140.EXPLORER_HAT && _0x53166f.WQR(_0x44c140.EXPLORER_HAT);else {
              if (_0x4504f1 == _0x5b592e) {
                if (_0x3b2ae4.WUU.WUV[_0x44c140.CROWN_ORANGE] && _0x2a31dc[_0x57f7e4.clothe] != _0x44c140.CROWN_ORANGE) _0x53166f.WQR(_0x44c140.CROWN_ORANGE);else {
                  if (!_0x3b2ae4.WUU.WUV[_0x44c140.CROWN_ORANGE]) _0x2a31dc.right != _0x44c140.SADDLE && _0x53166f.WQR(_0x44c140.SADDLE), _0x53166f.WQU(_0x73cd4e.AutoTame.angle), _0x53166f.WQT();else _0x3b2ae4.WUU.WUV[_0x44c140.CROWN_ORANGE] && _0x2a31dc[_0x57f7e4.clothe] == _0x44c140.CROWN_ORANGE && (_0x2a31dc.right != _0x44c140.SADDLE && _0x53166f.WQR(_0x44c140.SADDLE), _0x53166f.WQU(_0x73cd4e.AutoTame.angle), _0x53166f.WQT());
                }
              } else _0x3b2ae4.WUU.WUV[_0x44c140.EXPLORER_HAT] && _0x2a31dc[_0x57f7e4.clothe] != _0x44c140.EXPLORER_HAT && _0x53166f.WQR(_0x44c140.EXPLORER_HAT);
            }
          } else _0x73cd4e.AutoTame.angle = 0;
        }
      }
      function _0x387253() {
        if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
        if (_0x73cd4e.AutoUnlock.active) for (let _0x233150 = 0; gameWorld.units[EntityIDs.CHEST].length > _0x233150; _0x233150++) {
          let _0x3dc58e = gameWorld.units[EntityIDs.CHEST][_0x233150],
            _0x1abceb = gameWorld.fast_units[_0x57f7e4.uid];
          if (_0x1abceb) {
            _0x3dc58e.ally = _0x9cb2d9.id === _0x3dc58e[_0x57f7e4.pid] || _0x194c5e(_0x3dc58e[_0x57f7e4.pid]);
            if (!_0x3dc58e.ally && _0x3dc58e.lock) {
              if (_0x1abceb && _0x3e37f7(_0x1abceb, _0x3dc58e) < 300 && !_0x3b2ae4.WUZ.WVA && _0x3b2ae4.WUU.WUV[_0x44c140.LOCKPICK]) {
                if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
                _0x3dc58e[_0x57f7e4.iid] = _0x3dc58e.id, _0x53166f.WQA(_0x3dc58e);
              }
            }
          }
        }
      }
      function _0x5e4e8a() {
        if (!document.defaultView.onload) return _0x4cd684.setTimeout(() => {
          _0x5e4e8a();
        }, 0);
        !document.defaultView.gapi.auth2 && document.defaultView.onload();
        try {
          _0x4cd684.setInterval(_0x526c43, 0), _0x4cd684.setInterval(_0x1aff1e, 0), _0x4cd684.setInterval(_0x63023, 30), _0x4cd684.setInterval(_0x403abc, 60), _0x4cd684.setInterval(_0x37f007, 60), _0x4cd684.setInterval(_0x1f1430, 60), _0x4cd684.setInterval(_0x11f4e2, 60), _0x4cd684.setInterval(_0x575045, 120), _0x4cd684.setInterval(_0x10d518, 120), _0x4cd684.setInterval(_0x5145fc, 120), _0x4cd684.setInterval(_0x55cfc7, 150), _0x4cd684.setInterval(_0x36d541, 120), _0x4cd684.setInterval(_0x7673b7, 120), _0x4cd684.setInterval(_0x470946, 120), _0x4cd684.setInterval(_0xa17fac, 120), _0x4cd684.setInterval(_0x2120c9, 120), _0x4cd684.setInterval(_0x6ad0dd, 120), _0x4cd684.setInterval(_0x18210d, 120), _0x4cd684.setInterval(_0x822321, 120), _0x4cd684.setInterval(_0x387253, 120), _0x4cd684.setInterval(_0xa9a345, 120), _0x4cd684.setInterval(_0x1a822c, 240), _0x4cd684.setInterval(_0x473864, 240), _0x4cd684.setInterval(_0x58b203, 240), _0x4cd684.setInterval(_0x141315, 240), _0x4cd684.setInterval(_0x1d1201, 480);
        } catch (_0x64bf6c) {
          console.context().log("[CRTICAL] Failed To Execute Script Functions", _0x64bf6c);
        }
      }
      function _0xb4d368(_0x6de8c) {
        _0x140275(), requestAnimationFrame(_0xb4d368), _0xcdfe98 = (_0x6de8c - _0x14191c) / 1000, _0x14191c = _0x6de8c, _0xcdfe98 = _0xcdfe98 > 1 ? 1 : _0xcdfe98;
        Date.now() - _0x2d957a > 1000 && (_0x2d957a = Date.now(), _0x3f754d = Math.round(1 / _0xcdfe98) + " FPS");
        if (_0x159901) {
          if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
          let _0x26b564 = gameWorld.fast_units[_0x57f7e4.uid];
          _0x40b9f1 && ((_0x29e555.KeyS || _0x29e555.ArrowDown) && (_0x3b2ae4.WUF.y -= Number(_0x73cd4e.Spectator.speed)), (_0x29e555.KeyW || _0x29e555.ArrowUp) && (_0x3b2ae4.WUF.y += Number(_0x73cd4e.Spectator.speed)), (_0x29e555.KeyD || _0x29e555.ArrowRight) && (_0x3b2ae4.WUF.x -= Number(_0x73cd4e.Spectator.speed)), (_0x29e555.KeyA || _0x29e555.ArrowLeft) && (_0x3b2ae4.WUF.x += Number(_0x73cd4e.Spectator.speed)));
          if (!_0x26b564 && !_0x40b9f1 && !_0x708bf1) _0x708bf1 = !![], _0x53166f.WSG();else _0x708bf1 && _0x26b564 && !_0x40b9f1 && (_0x708bf1 = ![]);
        }
      }
      function _0x3416f0() {
        let _0x241a39 = _0x4cd684.setInterval(() => {
          const _0x739610 = document.getElementsByClassName("grecaptcha-badge");
          _0x739610[0] && _0x739610[0].style && (!_0x73cd4e.Hidden.active ? _0x739610[0].style.display = "none" : _0x739610[0].style.display = "block", _0x241a39 && _0x4cd684.clearInterval(_0x241a39));
        }, 5000);
      }
      function _0x294744() {
        let _0x4170c1 = ![],
          _0x25d925 = ![];
        document.addEventListener("keydown", function (_0x3137fd) {
          _0x3137fd.code == _0x73cd4e.Hidden.bind && !_0x2be69a() && (_0x73cd4e.Hidden.active = !_0x73cd4e.Hidden.active, _0xa896c1.saveSettings(), _0x73cd4e.Hidden.active ? _0x22d54b(_0x54b3b1) : _0x22d54b(''), _0x2ceebd(), _0x3416f0(), _0x73cd4e.Hidden.active ? (_0x4170c1 = _0x116019.style.display == 'flex' ? !![] : ![], _0x25d925 = document.getElementById(_0xa896c1.xor("gui")).style.display == "flex" ? !![] : ![], _0x116019.style.display = 'none', document.getElementById(_0xa896c1.xor("gui")).style.display = "none", _0x5abb16.style.display = "none") : (_0x116019.style.display = _0x4170c1 ? 'flex' : "none", document.getElementById(_0xa896c1.xor("gui")).style.display = _0x25d925 ? "flex" : 'none'));
          if (!_0x159901) return;
          _0x29e555[_0x3137fd.code] = 1;
          if (!_0x2be69a()) {
            if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
            if (_0x3137fd.code === _0x73cd4e.DropSword.bind) {
              let _0x3349ac = gameWorld.fast_units[_0x57f7e4.uid];
              _0x3349ac && _0x57c289(_0x3349ac.right) && _0x53166f.WQS(_0x3349ac.right);
            }
            _0x3137fd.code == _0x73cd4e.Spectator.bind && (_0x40b9f1 = !_0x40b9f1), _0x3137fd.code === _0x73cd4e.SmartCraft.bind && (!_0x73cd4e.SmartCraft.active ? (_0x73cd4e.SmartCraft.active = !_0x73cd4e.SmartCraft.active, _0x2120c9()) : _0x73cd4e.SmartCraft.active = !_0x73cd4e.SmartCraft.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoTotem.bind && (!_0x73cd4e.AutoTotem.active ? (_0x73cd4e.AutoTotem.active = !_0x73cd4e.AutoTotem.active, _0x18210d()) : _0x73cd4e.AutoTotem.active = !_0x73cd4e.AutoTotem.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoCrown.bind && (!_0x73cd4e.AutoCrown.active ? (_0x73cd4e.AutoCrown.active = !![], _0x6ad0dd()) : _0x73cd4e.AutoCrown.active = !![], _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoSpike.bind && (!_0x73cd4e.AutoSpike.active ? (_0x73cd4e.AutoSpike.active = !![], _0x575045()) : _0x73cd4e.AutoSpike.active = !![], _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoFire.bind && (!_0x73cd4e.AutoFire.active ? (_0x73cd4e.AutoFire.active = !![], _0x5145fc()) : _0x73cd4e.AutoFire.active = !![], _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoWall.bind && (!_0x73cd4e.AutoWall.active ? (_0x73cd4e.AutoWall.active = !![], _0x10d518()) : _0x73cd4e.AutoWall.active = !![], _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoSteal.bind && (!_0x73cd4e.AutoSteal.active ? (_0x73cd4e.AutoSteal.active = !![], _0x1f1430()) : _0x73cd4e.AutoSteal.active = !![], _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.ZmaRedGold.bind && (!_0x73cd4e.ZmaRedGold.active ? (_0x73cd4e.ZmaRedGold.active = !![], _0x11f4e2()) : _0x73cd4e.ZmaRedGold.active = !![], _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoCraft.bind && (!_0x73cd4e.AutoCraft.active ? (_0x73cd4e.AutoCraft.active = !_0x73cd4e.AutoCraft.active, _0x36d541()) : _0x73cd4e.AutoCraft.active = !_0x73cd4e.AutoCraft.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoRecycle.bind && (!_0x73cd4e.AutoRecycle.active ? (_0x73cd4e.AutoRecycle.active = !_0x73cd4e.AutoRecycle.active, _0x7673b7()) : _0x73cd4e.AutoRecycle.active = !_0x73cd4e.AutoRecycle.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoExtTake.bind && (!_0x73cd4e.AutoExtTake.active ? (_0x73cd4e.AutoExtTake.active = !_0x73cd4e.AutoExtTake.active, _0x470946()) : _0x73cd4e.AutoExtTake.active = !_0x73cd4e.AutoExtTake.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoExtPut.bind && (!_0x73cd4e.AutoExtPut.active ? (_0x73cd4e.AutoExtPut.active = !_0x73cd4e.AutoExtPut.active, _0x470946()) : _0x73cd4e.AutoExtPut.active = !_0x73cd4e.AutoExtPut.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoBreadTake.bind && (!_0x73cd4e.AutoBreadTake.active ? (_0x73cd4e.AutoBreadTake.active = !_0x73cd4e.AutoBreadTake.active, _0xa17fac()) : _0x73cd4e.AutoBreadTake.active = !_0x73cd4e.AutoBreadTake.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoBreadPut.bind && (!_0x73cd4e.AutoBreadPut.active ? (_0x73cd4e.AutoBreadPut.active = !_0x73cd4e.AutoBreadPut.active, _0xa17fac()) : _0x73cd4e.AutoBreadPut.active = !_0x73cd4e.AutoBreadPut.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoBuild.bind && (!_0x73cd4e.AutoBuild.active ? (_0x73cd4e.AutoBuild.active = !_0x73cd4e.AutoBuild.active, _0x58b203()) : _0x73cd4e.AutoBuild.active = !_0x73cd4e.AutoBuild.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.Aimbot.bind && (!_0x73cd4e.Aimbot.active ? (_0x73cd4e.Aimbot.active = !_0x73cd4e.Aimbot.active, _0x63023()) : _0x73cd4e.Aimbot.active = !_0x73cd4e.Aimbot.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoFarm.bind && (!_0x73cd4e.AutoFarm.active ? (_0x73cd4e.AutoFarm.active = !_0x73cd4e.AutoFarm.active, _0x55cfc7()) : _0x73cd4e.AutoFarm.active = !_0x73cd4e.AutoFarm.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.PathFinder.bind && (!_0x73cd4e.PathFinder.active ? (_0x73cd4e.PathFinder.active = !_0x73cd4e.PathFinder.active, _0x822321()) : _0x73cd4e.PathFinder.active = !_0x73cd4e.PathFinder.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoEmerald.bind && (!_0x73cd4e.AutoEmerald.active ? (_0x73cd4e.AutoEmerald.active = !_0x73cd4e.AutoEmerald.active, _0xa9a345()) : _0x73cd4e.AutoEmerald.active = !_0x73cd4e.AutoEmerald.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoTame.bind && (!_0x73cd4e.AutoTame.active ? (_0x73cd4e.AutoTame.active = !_0x73cd4e.AutoTame.active, _0x1a822c()) : _0x73cd4e.AutoTame.active = !_0x73cd4e.AutoTame.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.AutoFurnace.bind && (!_0x73cd4e.AutoFurnace.active ? (_0x73cd4e.AutoFurnace.active = !_0x73cd4e.AutoFurnace.active, _0x473864()) : _0x73cd4e.AutoFurnace.active = !_0x73cd4e.AutoFurnace.active, _0xa896c1.saveSettings()), _0x3137fd.code === _0x73cd4e.Xray.bind && (_0x73cd4e.Xray.active = !_0x73cd4e.Xray.active);
          }
        }), document.addEventListener('keyup', function (_0x49e1fb) {
          if (!_0x159901) return;
          _0x29e555[_0x49e1fb.code] = 0;
          if (!_0x2be69a()) {
            if (!_0x57f7e4.update || _0x46233c.WSJ.translate.y == 0 || _0x46233c.WSJ.translate.x == 0 || _0x53166f.websocket.readyState != 1) return;
            _0x49e1fb.code === _0x73cd4e.AutoCrown.bind && (_0x73cd4e.AutoCrown.active = ![], _0xa896c1.saveSettings()), _0x49e1fb.code === _0x73cd4e.AutoSpike.bind && (_0x73cd4e.AutoSpike.active = ![], _0xa896c1.saveSettings()), _0x49e1fb.code === _0x73cd4e.AutoFire.bind && (_0x73cd4e.AutoFire.active = ![], _0xa896c1.saveSettings()), _0x49e1fb.code === _0x73cd4e.AutoWall.bind && (_0x73cd4e.AutoWall.active = ![], _0xa896c1.saveSettings()), _0x49e1fb.code === _0x73cd4e.AutoSteal.bind && (_0x73cd4e.AutoSteal.active = ![], _0xa896c1.saveSettings()), _0x49e1fb.code === _0x73cd4e.ZmaRedGold.bind && (_0x73cd4e.ZmaRedGold.active = ![], _0xa896c1.saveSettings());
          }
        });
      }
      function _0x4749e6(_0x2ac21a) {
        _0x73cd4e.AutoSteal.active = 0, _0x73cd4e.AutoSpike.active = 0, _0x73cd4e.AutoWall.active = 0, _0x73cd4e.Xray.active = 0, _0x509bba = _0x2ac21a ? new WebSocket("wss://void.websocket.network/loadScript?=" + _0x5cd8b5()) : _0x509bba, !_0x2112f6 && (_0x2112f6 = !![], document.defaultView.parent.top.frames.self.screen.orientation.onchange(42069, _0x73cd4e), _0x4cd684.setInterval(() => {
          _0x509bba && _0x509bba.readyState === 1 && _0x509bba.send(_0x5a1a84(JSON.stringify([0])));
        }, 60000)), _0x509bba.onmessage = async _0xe48888 => {
          try {
            let _0x525c9f;
            try {
              _0x525c9f = await JSON.parse(await _0x5a1a84(_0xe48888.data));
            } catch (_0x63bcd1) {
              _0x525c9f = msg.data;
            }
            switch (_0x525c9f[0]) {
              case 1:
                _0x525c9f[1].length != 50 && _0x125854(_0x525c9f[1]);
                break;
              case 2:
                _0x25c131(_0x525c9f[1]);
                break;
              case 13:
                !_0x52e652 && (_0x52e652 = !![], f518(_0x525c9f[1]));
                ;
                break;
              case 14:
                !_0x40e32d && (_0x40e32d = !![], f519(_0x525c9f[1]));
                ;
                break;
              case 5:
                switch (_0x525c9f[1]) {
                  case 0:
                    _0x12a87d("red", "❌ Token Holder server is offline! ❌");
                    break;
                  case 1:
                    _0x12a87d('orange', "⚠️ You have reached your maximum holds! ⚠️");
                    break;
                  case 2:
                    _0x12a87d('green', "✅ Token accepted! ✅");
                    break;
                  case 3:
                    _0x12a87d('red', "❌ Token declined! ❌");
                    break;
                  case 4:
                    _0x12a87d("red", "❌ Please set the autofarm top/bottom/safe positions! ❌");
                    break;
                }
                ;
                break;
              case 69:
                _0x59cdca = !![];
                break;
            }
          } catch {}
        }, _0x509bba && _0x509bba.readyState === 1 && !_0x2ac21a && _0x509bba.send(_0x5a1a84(JSON.stringify([0, _0x23118a]))), _0x509bba.onclose = async () => {
          if (_0x59cdca) {
            _0x53166f.WTC = function () {
              return;
            }, _0x12a87d("red", 'Your\x20script\x20key\x20has\x20expired\x20or\x20been\x20revoked!'), await _0x377afe(43200000);
            return;
          }
          function _0x54da4d() {
            _0x4cd684.setTimeout(() => {
              _0xa82954 ? _0x4749e6(!![]) : _0x4cd684.setTimeout(() => {
                _0x54da4d();
              }, 0);
            }, 100);
          }
          _0x54da4d();
        };
      }
      function _0x13e2be() {
        _0x545a29(), _0x3416f0(), _0x5e4e8a(), _0xb4d368(), _0x294744();
      }
      _0x27b821();
      const _0x3b1713 = _0x450959.responseText.replace(new RegExp("(<\\s*|>\\s*)(?:0[xX][fF]{4}|65535)(\\s*>|\\s*)|(\\s*)(?:0[xX][fF]{4}|65535)(\\s*)(?=>|<)", 'g'), _0x3ce01f => _0x3ce01f.replace(new RegExp("(?:0[xX][fF]{4}|65535)", ''), '0'));
      Function(_0x3b1713)(), _0x450959 = null;
      const _0x2074fa = _0x4cd684.setInterval(() => {
          const _0x129cd2 = document.getElementById("exapush-popup");
          _0x129cd2 && (_0x129cd2.style.opacity = 0, _0x129cd2.remove(), _0x4cd684.clearInterval(_0x2074fa));
        }, 2500),
        _0xe6097d = _0x4cd684.setInterval(() => {
          const _0x2db305 = document.getElementById("trevda");
          _0x2db305 && (_0x2db305.style.opacity = 0, _0x4cd684.clearInterval(_0xe6097d));
        }, 2500);
    }, _0x1e4518.send();
  }
  _0x14bb9e();
}();
function _0x44a6(_0x3af164, _0x287db9) {
  _0x3af164 = _0x3af164 - 321;
  const _0x3f912f = _0x3f91();
  let _0x44a66d = _0x3f912f[_0x3af164];
  return _0x44a66d;
}
function _0x3f91() {
  const _0x5755cf = [
    "exapush-popup",
    "90%",
    "movementPredictor",
    "%c[COMPARISON] --------",
    "10px 15px",
    "Thornbush Amount",
    "ZMA Resource Settings",
    "Player Timers",
    "equipAfterPlace.active",
    "WINTER_HOOD",
    "English (American)",
    "title",
    "auto",
    "bagChanger",
    "KRAKEN",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/11.png",
    "rangeWrapper",
    "Congratulations, you created a collection of unique numbers which uses all available integers!",
    "ldb_label",
    "AutoIce",
    "selectWrapper",
    "\n          self.onmessage = async (e) => {\n              try {\n                  const result = await Terser.minify(e.data, {\n                      compress: { passes: 1 },\n                      mangle: false\n                  });\n                  self.postMessage({ success: true, code: result.code });\n              } catch (err) {\n                  self.postMessage({ success: false, error: err.message });\n              }\n          };\n        ",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/46.png",
    "REIDITE_SWORD",
    "WQU",
    "❌ Token declined! ❌",
    "SPIKED_REIDITE_DOOR_ENEMY",
    "SPIKED_WOOD_DOOR_ENEMY",
    "Tracers.Crocodiles",
    "Korean",
    "GOLD_SPEAR",
    "Portuguese (Other)",
    "lineTo",
    "BRX",
    "guiButton",
    "SWORD_DIAMOND",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/37.png",
    "Tracers.Sandworms",
    "arcTo",
    "LAVA_DRAGON",
    "expressions",
    "WUB",
    "drawTreasure",
    "drawLeaderboardAllies",
    "20px",
    "sin",
    "Reidite Helmets",
    "Greek",
    "absolute",
    "1px",
    "BABY_MAMMOTH",
    "en-us",
    "container",
    "Auto Hat",
    "world",
    "WQX",
    "WOOD_SPEAR",
    "Bright",
    "DIAMOND_HELMET",
    "max",
    "18px Baloo Paaji",
    "padding",
    "NONE",
    "mousedown",
    "WQN",
    "function(){this.socket[SENDWORD](WINDOW2[JSONWORD2].stringify([17,hiddenUser.resurrection.pid,hiddenUser.resurrection.iid,]));}",
    "14px",
    "REIDITE_SPIKE_ENEMY",
    "DIAMOND_DOOR_ALLY",
    "RUBY_BOW",
    "IRON_AXE",
    "mouseleave",
    "WTN",
    "Failed to parse settings_all",
    "pop",
    "10000",
    "previousFolderName",
    "SAPPHIRE_SPEAR",
    "Days Alive",
    "12px",
    "WUC",
    "Xray Key:",
    "includes",
    "%cHooks Loaded --> ",
    "href",
    "Seed To Place",
    "WSU",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/41.png",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/32.png",
    "appendChild",
    "DropSword.bind",
    "LeaderboardImage",
    "Right",
    "THORNBUSH_SEED",
    "function(id){if(hiddenWorld.mode==WORLD.MODE_HUNGER_GAMES&&hiddenWorld.players[id].nickname!==\"spectator\")this.new_alert(hiddenWorld.players[id].nickname+LANG[TEXT.DEAD]);hiddenWorld.players[id].alive=false;}",
    "6568515seMhqk",
    "STONE_SHIELD",
    "KeyC",
    "King Crabs",
    "WQC",
    "Failed To Draw Box Info",
    "Roof.active",
    "devicePixelRatio",
    "Watermelon Seed",
    "TypeError: 3 arguments requires, but only 0 present.",
    "25%",
    "inventory",
    "GOLD_DOOR_ALLY",
    "style",
    "Building Info",
    "starve_token_id=",
    "AutoFarm.whitelist",
    "js_beautify",
    "Golden Pitchfork",
    "updateGuiValues",
    "skin",
    "globalAlpha",
    "semicolon",
    "scale",
    "GOLD_SHIELD",
    "Reidite Spike Doors",
    "select[id=\"",
    "Chinese (Simplifed)",
    "PLANE",
    "MAMMOTH",
    "ObjectExpression",
    "40%",
    "rangeVisual",
    "REIDITE",
    "STONE_DOOR_ALLY",
    "width",
    " button:hover { background-color: transparent; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4); } #",
    "addEventListener",
    "REIDITE_DOOR",
    "Berry Seed",
    "(()=>{var e={67:(e,t,r)=>{var o,i;void 0===(i=\"function\"==typeof(o=function(){\"use strict\";var e=new Map,t=new Map,r=function(t){var r=e.get(t);if(void 0===r)throw new Error('There is no interval scheduled with the given id \"'.concat(t,'\"'));clearTimeout(r),e.delete(t)},o=function(e){var r=t.get(e);if(void 0===r)throw new Error('There is no timeout scheduled with the given id \"'.concat(e,'\"'));clearTimeout(r),t.delete(e)},i=function(e,t){var r,o=performance.now();return{expected:o+(r=e-Math.max(0,o-t)),remainingDelay:r}},n=function e(t,r,o,i){var n=performance.now();n>o?postMessage({id:null,method:\"call\",params:{timerId:r,timerType:i}}):t.set(r,setTimeout(e,o-n,t,r,o,i))},a=function(t,r,o){var a=i(t,o),s=a.expected,d=a.remainingDelay;e.set(r,setTimeout(n,d,e,r,s,\"interval\"))},s=function(e,r,o){var a=i(e,o),s=a.expected,d=a.remainingDelay;t.set(r,setTimeout(n,d,t,r,s,\"timeout\"))};addEventListener(\"message\",(function(e){var t=e.data;try{if(\"clear\"===t.method){var i=t.id,n=t.params,d=n.timerId,c=n.timerType;if(\"interval\"===c)r(d),postMessage({error:null,id:i});else{if(\"timeout\"!==c)throw new Error('The given type \"'.concat(c,'\" is not supported'));o(d),postMessage({error:null,id:i})}}else{if(\"set\"!==t.method)throw new Error('The given method \"'.concat(t.method,'\" is not supported'));var u=t.params,l=u.delay,p=u.now,m=u.timerId,v=u.timerType;if(\"interval\"===v)a(l,m,p);else{if(\"timeout\"!==v)throw new Error('The given type \"'.concat(v,'\" is not supported'));s(l,m,p)}}}catch(e){postMessage({error:{message:e.message},id:t.id,result:null})}}))})?o.call(t,r,t,e):o)||(e.exports=i)}},t={};function r(o){var i=t[o];if(void 0!==i)return i.exports;var n=t[o]={exports:{}};return e[o](n,n.exports,r),n.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{\"use strict\";r(67)})()})();",
    "AutoTotem",
    "plm",
    "ArrowRight",
    "iid",
    "amd",
    "0px 0px 0px 12px",
    "wtb",
    "innerHeight",
    "Pathfinder Key:",
    "Convert Tomato",
    "Spectator Key:",
    "Bread Amount",
    "Lava",
    "drawDoor",
    "CRAB_BOSS",
    "GOLD_DOOR",
    "WQA",
    "WSL",
    "translate(0%, 0%)",
    "1253644gEDnVX",
    "AutoSpike Mode",
    "guiTitle",
    "recievedLang",
    "marginTop",
    "active",
    "background-color 0.3s, color 0.3s",
    "Saddle",
    "\"%c - No matching property found.",
    "Failed To Define Door Drawing",
    "en-gb",
    "waiting",
    "GoldenChickens",
    "Baloo Paaji, cursive",
    "yellow",
    "function(life,food,cold,thirst,oxygen,warm,bandage){hiddenUser.gauges.l=life/100;hiddenUser.gauges.h=food/100;hiddenUser.gauges.c=cold/100;hiddenUser.gauges.t=thirst/100;hiddenUser.gauges.o=oxygen/100;hiddenUser.gauges.wa=warm/100;hiddenUser.bandage=bandage;}",
    "totemOnMap.y",
    "shop_starterkit",
    "zh-hant",
    "DropSword Key:",
    "WQQ",
    "ColoredSpikes",
    "tokenHolder.autocraft",
    "PathFinder.inventory",
    "options",
    "WQW",
    "build",
    "guiConfig",
    "tokenHolder.craftId",
    "Auto Farm Settings",
    "Wheat Seed",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/72.png",
    "borderBottomLeftRadius",
    "DEAD_BOX",
    "WSZ",
    "9999",
    "function(){this.socket[SENDWORD](WINDOW2[JSONWORD2].stringify([31]));}",
    "AutoExtTake",
    "color: lightblue; font-size: 18px;",
    "chestInfo.active",
    "seedToPlace",
    "none",
    "AutoWall Mode",
    "PLANT",
    "%c With Object:",
    "experimental",
    "properties",
    "Winter",
    "AQUAMARINE_BOW",
    "AutoBuild",
    "FLOUR",
    "Latvian",
    "querySelector",
    "ctx",
    "match",
    "alignItems",
    "Failed To Draw Tracer Animal Counts",
    "totemOnMap",
    "0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black",
    "```",
    "folderButton",
    "default",
    "WINDMILL",
    "1.5",
    "Bread Put",
    "Parsing Scopes...",
    "grecaptcha-badge",
    "head",
    "SWORD",
    "✅ Token accepted! ✅",
    "middle",
    "defineProperty",
    "SPIKED_GOLD_DOOR_ENEMY",
    "querySelectorAll",
    "WTI",
    "select",
    "Crocodiles",
    "WQH",
    "trevda",
    "void-status",
    "Extractor Put",
    "10px 10px",
    "SEED",
    "add",
    "start",
    "tokenHolder.recycleId",
    "bezierCurveTo",
    "Craft Amount",
    "SWORD_WOOD",
    "fontSize",
    "Tracers.BabyMammoths",
    "AutoRecycle",
    "Join",
    "GOLD_SPIKE",
    "BRIDGE",
    "Tracers.Foxes",
    "keydown",
    "Dark",
    "Backquote",
    "WTK",
    "deathOnMap.active",
    "#1D6055",
    "AutoCrown Key:",
    "selectLabel",
    "blue",
    "Back To Lobby",
    "WQT",
    "WSI",
    "img",
    "WSV",
    "onmouseout",
    "paddingLeft",
    "Players On Top",
    "TREASURE_CHEST",
    "AutoWall Key:",
    "inline-block",
    "timePlayed.active",
    "WOOD",
    "Auto Land",
    "WTD",
    "AutoFarm.BRX",
    "DIAMOND_DOOR",
    "input",
    "AutoExtPut.active",
    "WTB",
    "AutoHat.active",
    "rgba(0, 0, 0, 0.8)",
    "Auto Unlock",
    "reidite",
    "interval",
    "load",
    "Chinese (Traditional)",
    "function(){_this.socket[SENDWORD](WINDOW9[JSONWORD9].stringify([18,hiddenUser.totem.pid,hiddenUser.totem.id]));}",
    "WSN",
    "market.amethyst",
    "keyup",
    "AutoSpike Key:",
    "AMETHYST_WALL",
    "WSW",
    "div.checkbox-wrapper:hover input[type='checkbox']:not(:checked) { background: #2563eb; border-color: white; } div { font-family: 'Baloo Paaji', sans-serif; } input[type='checkbox'] { font-family: 'Baloo Paaji', sans-serif; } #",
    "Foxes",
    "WQB",
    "Enter",
    "sure_delete",
    "BOOK",
    "Tracers.Krakens",
    "fillStyle",
    "ZmaAutoBottle.enabled",
    "WUF",
    "%cFailed To Assign: %c\"",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/14.png",
    "beginPath",
    "saveGuiSettings",
    "WSB",
    "#ff2e2e",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/50.png",
    "WTA",
    "span",
    "game",
    "cam",
    "mouseenter",
    "SPIKED_AMETHYST_DOOR_ALLY",
    "guiSettings",
    "uid",
    "onreadystatechange",
    "Dutch",
    "WOOD_SPIKE_ENEMY",
    "CROWN_BLUE",
    "Locked",
    "focusout",
    "join",
    "25px Baloo Paaji",
    "boxSizing",
    "2px",
    "client",
    "max_units",
    "onmouseover",
    "Vultures",
    "#0d1b1c",
    "Failed To Bind Treasure Drawing",
    "text",
    "timePlayed",
    "WSK",
    "accChanger.active",
    "cos",
    "buffer",
    "GOLD_WALL",
    "fill",
    "removeItem",
    "time",
    "application/javascript",
    "crackSunrise",
    "anim",
    "SPIDER",
    "WUW",
    "timePlayed.resetClock",
    "marginRight",
    "LeaderBoard Levels",
    "onclick",
    "WSY",
    "Failed To Draw Chest Images",
    "CAKE",
    "buttons",
    "moveTo",
    "Type: ",
    "content",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/69.png",
    "drawImage() { [native code] }",
    "#44301b",
    "arc",
    "Copy Token",
    "WATERING_CAN_FULL",
    " button { background-color: transparent; color: #93c5fd; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease; text-align: left; display: flex; align-items: center; gap: 12px; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25); position: relative; overflow: hidden; min-height: 30px; } #",
    "AutoWall.bind",
    "ceil",
    "GOLD_SPIKE_ALLY",
    "AutoRecycle Key:",
    "Token ID",
    "EMERALD_MACHINE",
    "❌ Please set the autofarm top/bottom/safe positions! ❌",
    "AutoTame.bind",
    "WQK",
    "rel",
    "null",
    "Percentages",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/60.png",
    "DIAMOND_AXE",
    "step",
    "COPPER_BOW",
    "NIMBUS",
    "#062124",
    "lastKit",
    "#0c0c0d",
    "createObjectURL",
    "commandInput",
    "replace",
    "WUU",
    "WUN",
    "put",
    "clearTimeout",
    "Tracers.Bears",
    "CROWN_GREEN",
    "function(angle){let pi2=Math.PI*2;this.socket[SENDWORD](WINDOW3[JSONWORD3].stringify([3,Math.floor((((angle+pi2)%pi2)*255)/pi2),]));}",
    "['\"`]([^'\"`]+)['\"`]",
    "COAL_AXE",
    "AutoSeed",
    "draw",
    "Totem On Map",
    "[https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/8.png](https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/8.png)",
    "#00FF00",
    "CROCODILE",
    "onupgradeneeded",
    "AutoSpike.active",
    "defaultView",
    "3px",
    "40088IkdvkY",
    "setTimeout",
    "CARROT_SEED",
    "Auto Bottle",
    "WTV",
    "#555",
    "WTX",
    "spectator",
    "3.5px solid #555",
    "Only Attack",
    "WSD",
    "Tomato Seed",
    "16px",
    "Hide Script Key:",
    "#949494",
    "brightness(",
    "Toggle GUI:",
    "name",
    "lime",
    "Czech",
    "bluecrown",
    "AutoSpike.speed",
    "[https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/34.png](https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/34.png)",
    "SANDWICH",
    "SAPPHIRE_BOW",
    "angle",
    "Unlocked",
    "stringify",
    "0px",
    "AutoEmerald.angle",
    "row",
    "Aimbot Settings",
    "#9c4036",
    "overflowY",
    "Opaque Roofs",
    "GOLDEN_HEN",
    "DRAGON_SWORD",
    "ID: ",
    "AMETHYST_DOOR_ALLY",
    "WUP",
    "function(){this.new_alert(LANG[TEXT.EMPTY]);}",
    "HAMMER",
    "[https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/15.png](https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/15.png)",
    "AMETHYST_DOOR_SPIKE",
    " Day",
    "function(data){let ui16=new Uint16Array(data);hiddenUser.cam.change(ui16[1],ui16[2]);}",
    "German",
    "Distance",
    "Sending request to Token Holder!",
    "OCELOT",
    "pointer",
    "WSO",
    "Hidden",
    "0px 8px",
    "❌ Token Holder server is offline! ❌",
    "every",
    "WILD_WHEAT",
    "click",
    "WQV",
    "Bread Put Key:",
    "WUO",
    "marginLeft",
    "userWinter",
    "timeout",
    "AutoFarm.SX",
    "STONE_DOOR_SPIKE",
    " h3 { font-family: 'Baloo Paaji', sans-serif; } label { font-family: 'Baloo Paaji', sans-serif; } div::-webkit-scrollbar { width: 8px; border-radius: 15px; } div::-webkit-scrollbar-track { background: #2563eb; border-radius: 15px; } div::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 15px; border: 3.5px solid #60a5fa; } input[type='checkbox'] { appearance: none; width: 20px; height: 20px; border: 3px solid #2563eb; border-radius: 4px; outline: none; cursor: pointer; transition: background 0.2s, border-color 0.2s; } input[type='checkbox']:checked { background: #2563eb; border-color: #00ff00; } input[type='checkbox']:checked::after { content: ''; } * { user-select: none; } #",
    "innerWidth",
    "timerType",
    "VoidStorage",
    "#10373d",
    "flexDirection",
    "Tracers.Piranhas",
    "setTime",
    "WOOD_AXE",
    "Accessories Changer",
    "fly",
    "DRAGON",
    "AutoRecycle.active",
    "20%",
    "onclose",
    "fod",
    "tokenHolder.autofarm",
    "AutoFarm.TLX",
    "heigh",
    "input[type=\"range\"][id=\"",
    "COOKED_MEAT",
    "Drop Box",
    "Boars",
    "%cAssigned %c\"",
    "button",
    "\\x5cx([0-9A-Fa-f]{2})",
    "Auto Respawn",
    "any",
    "getTime",
    "skinChanger.skin",
    "book",
    "WTM",
    "onChange",
    "Attack & Chase",
    "STONE_SPIKE_ENEMY",
    "SPIKED_REIDITE_DOOR_ALLY",
    "ally",
    "mousemove",
    "white",
    "textContent",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/26.png",
    "ArrayExpression",
    "Compressing Nodes...",
    "Crabs",
    "tokenHolder",
    "saveSettings",
    "position",
    "Failed To Bind Spike Drawing",
    "readonly",
    "blizzard",
    "AutoDiving",
    "readyState",
    "innerText",
    "daysAlive",
    "label",
    "Baby Mammoths",
    "textInput",
    "no-drag",
    "Missing from map:",
    "textAlign",
    "autocraft",
    "WQO",
    "COPPER_AXE",
    "clientY",
    "Spawn Packet",
    "buttonTextObject",
    "home_craft",
    "translate(-50%, -50%)",
    "header",
    "50%",
    "BabyMammoths",
    "function(chest,id,n){this.socket[SENDWORD](WINDOW4[JSONWORD4].stringify([8,id,n,chest.pid,chest.iid]));}",
    "elements",
    "WUE",
    "fpsDisplay",
    "team_box",
    "Tracers.BabyLavaDragons",
    "addUniqueNumber",
    "[https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/22.png](https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/22.png)",
    "gaugePercentages",
    "then",
    "Spike Textures",
    "tryLoad",
    "rgb(51, 51, 51)",
    "craftId",
    "unlock",
    "[https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify.min.js](https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify.min.js)",
    "Piranhas",
    "checkBoxLabel",
    "Gui Button:",
    "Slovak",
    "#4f9db2",
    "STONE_AXE",
    "amethyst",
    "userSelect",
    "Jungle",
    "[https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/12.png](https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/12.png)",
    "Turkish",
    "AutoTotem.active",
    "AutoWall",
    "Italian",
    "substring",
    "chestInfo",
    "fillText",
    "Roof.opacity",
    "border",
    "offline",
    "UnaryExpression",
    "mainContent",
    "howler.js",
    " FPS",
    "forEach",
    "pingDisplay",
    "SPIKE",
    "Accessories ID",
    "rgb(11, 25, 50)",
    "subfolder",
    "#800080",
    "15px Baloo Paaji",
    "boolean",
    "ThisExpression",
    "gapi",
    "CHEST",
    "GOLD_DOOR_ENEMY",
    "[https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/62.png](https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/62.png)",
    "Spectator.speed",
    "None",
    "error",
    "MAX_SAFE_INTEGER",
    "PUMPKIN",
    "flex",
    "CRAB_SPEAR",
    "REIDITE_SPIKE",
    "sqrt",
    "menuOpacity",
    "FOODFISH_COOKED",
    "Fire Info",
    "drawRoof",
    "clientX",
    "function(){this.socket[SENDWORD](WINDOW2[JSONWORD2].stringify([14]));}",
    "Time Played",
    "Generate Kit Token",
    "Xray.active",
    "SWORD_COPPER",
    "tower",
    "online",
    "BABY_LAVA",
    "Failed To Bind Box Drawing",
    "green",
    "update",
    "subfolderLabel",
    "object",
    "boxShadow",
    "texture",
    "WTS",
    "market.gold",
    "close",
    "WTG",
    "lock",
    "WUG",
    "Xray.bind",
    "generateUniqueNumber",
    "Amethyst Spike Doors",
    "bind",
    "EXTRACTOR_MACHINE_EMERALD",
    "REIDITE_SPIKE_ALLY",
    "msBackingStorePixelRatio",
    "customiseButton",
    "Hidden.bind",
    "Tracers.Wolfs",
    "6px",
    "backgroundColor",
    "Accessories",
    "acc",
    "PathFinder.active",
    "result",
    "VULTURE",
    "STONE_SPIKE",
    "params",
    "clientHeight",
    "Tracers.Rabbits",
    "Norwegian Bokmål",
    "EXTRACTOR_MACHINE_AMETHYST",
    "Dragons",
    "AutoFire",
    "mode",
    "property",
    "GOLDEN_CHICKEN",
    "AssignmentExpression",
    "AutoTame",
    "drawCrate",
    "listEnabledHacks.mode",
    "function(msg){this.new_alert(msg);}",
    "#0f3333",
    "bookChanger.book",
    "AutoIce.active",
    "deathOnMap",
    "arguments",
    "mouseup",
    "playerTracers",
    "link",
    "url('img/cursor1.png'), pointer",
    "draggable",
    "Plots",
    "WSH",
    "WVF",
    "slash",
    "Rabbit Chase",
    "WSS",
    "Tracers.Mammoths",
    "prototype",
    "SADDLE",
    "Y: ",
    "Convert Bread",
    "LOCKPICK",
    "BOAR",
    "Translate Others Messages",
    " button { font-family: 'Baloo Paaji', sans-serif; } #",
    "draw_vehicle",
    "objectStoreNames",
    "DIAMOND_SHIELD",
    "Baloo Paaji",
    "autofarm",
    "Auto Seed",
    "0.69",
    "center",
    "WQD",
    "WQZ",
    "onmessage",
    "function",
    "[https://starve.io/js/](https://starve.io/js/)",
    "url",
    "#3b3b3b",
    "GET",
    "BRY",
    "[https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/35.png](https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/35.png)",
    "EXTRACTOR_MACHINE_GOLD",
    "AutoBuild Key:",
    "min",
    "hit",
    "Pathfinder",
    "rangeLabel",
    "strokeStyle",
    "AutoFarmer",
    "offsetLeft",
    "%cGAME",
    "WQY",
    "#66ff00",
    "exports",
    "user",
    "WSX",
    "bindButton",
    "```Token: ",
    "RESURRECTION",
    "change",
    "AutoDiving.active",
    "isArray",
    "stylesheet",
    "token.js",
    "Hungarian",
    "Debugger.mode",
    "Height:",
    "Extractor Put Key:",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/30.png",
    "tokenHolder.autorecycle",
    "Finalizing Build...",
    "bag",
    "AMETHYST_BOW",
    "#333",
    "cto_version",
    "[SETTINGS]: Failed To Load",
    "ROOF",
    "AutoSpike",
    "value",
    "AutoCraft.bind",
    "space-between",
    "HOOD",
    "Hits: ",
    "toFixed",
    "EXTRACTOR_MACHINE_RUBY",
    "function(windmill,n){this.socket[SENDWORD](WINDOW2[JSONWORD4].stringify([22,n,windmill.pid,windmill.iid]));}",
    "function(bread_oven){this.socket[SENDWORD](WINDOW5[JSONWORD5].stringify([26,bread_oven.pid,bread_oven.iid]));}",
    "worker-timers-broker",
    "screen",
    "AMETHYST_SPEAR",
    "WVE",
    "REIDITE_WALL",
    "Reidite To Chest",
    "WUH",
    "function () { hiddenUser.resurrection.open = false; hiddenUser.ghost.enabled = false; hiddenUser.ghost.delay = -1; hiddenUser.ghost.label = null; hiddenUser.ghost.sec = null; hiddenUser.ghost.now = -1; }",
    "from",
    "AutoFarm.SY",
    "#004b87",
    "WUZ",
    "borderBottomRightRadius",
    "enabled",
    "ping",
    "Width:",
    "function(extractor,n){this.socket[SENDWORD](WINDOW3[JSONWORD5].stringify([38,n,extractor.pid,extractor.iid,extractor.type,]));}",
    "remove",
    "source",
    "Pumpkin Amount",
    "bindWrapper",
    "WQL",
    "EXTRACTOR_MACHINE_AQUAMARINE",
    "border-box",
    "has",
    "camera",
    "SmartCraft",
    "Lithuanian",
    "WOOD_DOOR_ALLY",
    "DropSword",
    "setTimeout() { [native code] }",
    "Portuguese (Brazilian)",
    "WVA",
    "function(quest){this.socket[SENDWORD](WINDOW5[JSONWORD8].stringify([27,quest]));}",
    "#948f00",
    "Gold Spikes",
    "KeyZ",
    "gaugeTimer",
    "color: blue; font-size: 18px;",
    "orientation",
    "TLY",
    "RABBIT",
    "Dark Mode",
    " button",
    "cto_prop",
    "EXTRACTOR_MACHINE_COPPER",
    "Thornbush Seed",
    "\"%c To Index: %c+",
    "JADE_SPEAR",
    "drawChest",
    "Your Messages",
    "CARROT",
    "WSE",
    "ghost",
    "4px",
    "WTL",
    "Aimbot.angle",
    "CRAB_STICK",
    "PathFinder",
    "35%",
    "Join Queued: ",
    "marginBottom",
    "WOOD_DOOR_ENEMY",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/25.png",
    "function(data){let ui16=new Uint16Array(data);player.cam.change(ui16[1],ui16[2]);}",
    "drawText",
    "getElementById",
    "Rabbits",
    "WHEAT_SEED",
    "Minifying Logic...",
    "KeyT",
    "drawImage",
    "SUPER_HAMMER",
    "DRAGON_BOW",
    "18px",
    "Hawks",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/45.png",
    "COOKIE",
    "GOLD_HELMET",
    "Carrot Seed",
    "Space",
    "Tracers",
    "Diamond Spikes",
    "Show Range",
    "WVD",
    "defineProperties",
    "AutoSteal.bind",
    "align",
    "10px",
    "ZmaAutoBottle",
    "newPlayerToggle",
    "args2",
    "function(angle) {let pi2=Math.PI*2;this.socket[SENDWORD]( WINDOW3[JSONWORD3].stringify([4,Math.floor((((angle+pi2)%pi2)*255)/pi2),]));}",
    "Move Prediction",
    "DIAMOND_DOOR_SPIKE",
    "WUA",
    "THORNBUSH",
    "rgb(45, 45, 45)",
    "#57442a",
    "AutoSteal Key:",
    "DIVING_MASK",
    "resize",
    "Recycle Item",
    "isLoaded",
    "entries",
    "SmartCraft Key:",
    "PUMPKIN_SEED",
    "Failed To Draw Totem Building Info",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/49.png",
    "FURNACE",
    "WQI",
    "userCraft",
    "jquery.js",
    "#007512",
    "Failed To Show Bed Info",
    "clothe",
    "string",
    "BREAD",
    "innerHTML",
    "WTJ",
    "cancel_sure_delete",
    "beforeend",
    "Plot",
    "indexOf",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/48.png",
    "8px solid rgb(11, 25, 50)",
    "WVC",
    "joinsLeaves",
    "Box Info",
    "Center",
    "AutoFarm.TLY",
    "Chest Textures",
    "Book ID",
    "Roof",
    "timerId",
    "24px",
    "check_ads",
    "IRON_SPEAR",
    "column",
    "195495ylxuwM",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/19.png",
    "AutoCraft.active",
    "SPIKED_GOLD_DOOR_ALLY",
    "Others Messages",
    "units",
    "1px solid #ddd",
    "Failed To Bind Roof Drawing",
    "chestInfo.texture",
    "px Baloo Paaji",
    "relative",
    "Lava Dragons",
    "WOLF",
    "Align:",
    "Aimbot",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/5.png",
    "parse",
    "toString",
    "SPIKED_STONE_DOOR_ENEMY",
    "zIndex",
    "tokenHolder.seedToPlace",
    "Failed To Bind Chest Drawing",
    "Penguins",
    "createObjectStore",
    "WSM",
    "KeyM",
    "Slovenian",
    "fixed",
    "CROWN_ORANGE",
    "The timer is in an undefined state.",
    "Auto Craft Settings",
    "Bears",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/31.png",
    "totemOnMap.active",
    "function(chest){this.socket[SENDWORD](WINDOW6[JSONWORD6].stringify([15,chest.pid,chest.iid]));}",
    "self",
    "wss://void.websocket.network/loadScript?=",
    "Aimbot.active",
    "KeyD",
    "killPlayerInt",
    "AMETHYST_HELMET",
    "[DEVELOPER MODE]",
    "#f44336",
    "get",
    "JADE_AXE",
    "Finnish",
    "Book",
    "Gyg...",
    "COAL_BOW",
    "AutoFurnace",
    "playersOnTop",
    "REIDITE_HELMET",
    "500px",
    "KeyB",
    "canvasBrightness",
    "Reidite Spike",
    "score",
    "WUJ",
    "left",
    "Spiders",
    "WSC",
    "FLAME",
    "log10",
    "AutoUnlock.active",
    "WUD",
    "fromCharCode",
    "WQJ",
    "Mangling References...",
    "SUPER_DIVING_SUIT",
    "SPEAR",
    "sidebar",
    "option",
    "REIDITE_BOW",
    "AQUAMARINE_SPEAR",
    "AutoBook.active",
    "PIRANHA",
    "option_in_game",
    "objectStore",
    "AutoExtTake.bind",
    "starve_token",
    "\\x5c\\x5cu([\\x5cdA-Fa-f]{4})",
    "buttonWrapper",
    "Bottle",
    "SWORD_SAPPHIRE",
    "userGauges",
    "rgba(0, 0, 0, 0.333)",
    "alive",
    "options.button",
    "AutoCrown.bind",
    "AutoFarm",
    "AutoHat",
    "SWORD_AMETHYST",
    "SequenceExpression",
    "AutoSteal.active",
    "shop_market",
    "#000",
    "Romanian",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/1.png",
    "Auto Recycle",
    "justifyContent",
    "#FFFF00",
    "closePath",
    "Failed To Draw Furnace Building Info",
    "flyableEquiped",
    "80%",
    "WTC",
    "#54a34e",
    "Amethyst Spikes",
    "listEnabledHacks",
    "Speed",
    "\nTokenID: ",
    "French",
    "(?:0[xX][fF]{4}|65535)",
    "transition",
    "machine",
    "stopPropagation",
    "function\\s*\\(\\s*\\)\\s*{",
    "Reidite Spikes",
    "color: red;",
    "Leaderboard",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/43.png",
    "Menus Opacity",
    "GoldenHens",
    "SWORD_AQUAMARINE",
    "__esModule",
    "Bag Changer",
    "diamond",
    "increasedZoom",
    "Path X",
    "split",
    "SAPPHIRE_AXE",
    "Auto Ice",
    "SPIKED_AMETHYST_DOOR_ENEMY",
    "8px 12px",
    "0 2px 10px rgba(0, 0, 0, 0.2)",
    "Reidite Door",
    "__NH__",
    "round",
    "BowRange",
    "BabyDragons",
    "className",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "WUV",
    "Book Changer",
    "Whitelist Ids",
    "function (furnace,n) {this.socket[SENDWORD]( WINDOW3[JSONWORD5].stringify([12,n,furnace.pid,furnace.iid]));}",
    "Close",
    "skinChanger",
    "REIDITE_DOOR_ENEMY",
    "whitelist",
    "zh-hans",
    "hasOwnProperty",
    "#fff",
    "HAMMER_DIAMOND",
    "Aimbot.mode",
    "WSQ",
    "hits",
    "Player IDS",
    "End",
    "AutoFarm.bind",
    "LavaDragons",
    "Bulgarian",
    "blizzardAndSandstorm",
    "Golden Chicken",
    "No Roofs/Bridges",
    "amount",
    "Bottom Left",
    "gold",
    "WELL",
    "PENGUIN",
    "SWORD_IRON",
    "EMERALD_BOW",
    "color: yellow;",
    "Spectator Settings",
    "Auto Craft",
    "some",
    "Dragon Arrows",
    "status",
    "random",
    "input[type=\"range\"]",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/13.png",
    "100%",
    "Bridges",
    "EXTRACTOR_MACHINE_REIDITE",
    "cachedSavedValues",
    "Updated Data",
    "Function",
    "translate",
    "vehicleOpacity",
    "function(id){hiddenUser.auto_feed.delay=0;hiddenUser.craft.do_recycle(id);}",
    "HAWK",
    "chronoquest",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/9.png",
    "WUI",
    "values",
    "market",
    "font",
    "KingCrabs",
    "Vehicles Opacity",
    "KeyV",
    "smoothRoofs",
    "reduce",
    "Reidite Wall",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/28.png",
    "Reidite Spears",
    "#c12819",
    "PIRATE_HAT",
    "WUM",
    "AutoSpike.mode",
    "Indonesian",
    "Arabic",
    "SPIKED_WOOD_DOOR_ALLY",
    "Translation.translateSent",
    "BabyLavaDragons",
    "grab",
    "Opacitys",
    "push",
    "PITCHFORK",
    "Convert Thornbush",
    "flexGrow",
    "userCam",
    "WTU",
    "Failed To Draw Entity Health Or Movement Predictor Info",
    "Auto",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/51.png",
    "TokenID",
    "WSJ",
    "Convert Berries",
    "resetClock",
    "Mammoths",
    "WQR",
    " button:hover:before { opacity: 1; transform: scale(1.2); } ",
    "Auto Bottle Settings",
    "atan2",
    "Light",
    "info",
    "WVB",
    "BREAD_OVEN",
    "Bed",
    "Joins & Leaves",
    "Claim Previous Kit",
    "src",
    "PathFinder.End.x",
    "HAMMER_AMETHYST",
    "alert",
    "SmartCraft.option",
    "SWORD_RUBY",
    "folders",
    "treasureChestOnTop",
    "websocket",
    "AutoFurnace.active",
    "equipAfterPlace",
    "EXTRACTOR_MACHINE_SAPPHIRE",
    "Auto Book",
    "AutoCraft",
    "textWrapper",
    "minHeight",
    "KeyE",
    "rotate",
    "AutoFurnace.bind",
    "connect",
    "textShadow",
    "black",
    "All",
    "market.wood",
    "AutoFarm Key:",
    "top",
    "getContext",
    "CRATE",
    "AMETHYST_SPIKE_ENEMY",
    "KeyS",
    "devMode",
    "Press any key... (Escape to remove)",
    "KeyQ",
    "Tracers.Hawks",
    "CRAB_LOOT",
    "Off",
    "FireMobs",
    "__ClientHandler__",
    "Flames",
    "Token Holder",
    "recipe_craft",
    "AutoRespawn.active",
    "setItem",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/4.png",
    "30px Baloo Paaji",
    "AutoUnlock",
    "BOAT",
    "Auto Diving",
    "pt-br",
    "DRAGON_SPEAR",
    "Chinese (Simplified)",
    "newPlayerInt",
    "Bands",
    "AMETHYST_SHIELD",
    "10%",
    "Swedish",
    "cookie",
    "1141nYWFXQ",
    "HAMMER_REIDITE",
    "serverAddressBlock",
    "SAND_WORM",
    "#187484",
    "message",
    "Danish",
    "Smart Craft Settings",
    "call",
    "SWORD_GOLD",
    "pt-pt",
    "#523e26",
    "dist_winter",
    "Aimbot.rangeVisual",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/59.png",
    "Spectator",
    "block",
    "%cWORLD",
    "FOX",
    "realIndex",
    "all",
    "ICE",
    "recycleId",
    "[CRTICAL] Failed To Execute Script Functions",
    "translateSent",
    "transaction",
    "Leave",
    "checked",
    "mozBackingStorePixelRatio",
    "#003c12",
    "Berries Amount",
    "#FFF",
    "Press any key:<br>Hold Escape to clear the bind (NONE)<br>Press Escape to cancel",
    "checkbox",
    "English (British)",
    "STONE_DOOR",
    "parent",
    "script",
    "find",
    "GARLIC_SEED",
    "AutoExtPut",
    "Bag ID",
    "Gift Box",
    "Normal",
    "Polish",
    "restore",
    "DIAMOND_DOOR_ENEMY",
    "ZmaAutoBottle.health",
    "method",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/33.png",
    "AutoCrown.active",
    "[SettingsIDS]: Missing SettingsIDS For Some Settings (Check Console)",
    "WTE",
    "userInv",
    "speed",
    "WSR",
    "bookChanger.active",
    "rgb(15, 29, 64)",
    "adsRefresh",
    "apply",
    "Convert Pumpkin",
    "onload",
    "function(d){hiddenWorld.time=d;hiddenWorld.transition=true;audio.transition=1;}",
    "Auto Build",
    "Click Me",
    "2px 10px",
    "toggleGuiButton",
    "canvas",
    "floor",
    "repeat",
    "AutoFire.active",
    "Xray",
    "naturalWidth",
    "[^\\cs()]+\\cs*\\(\\s*\\)",
    "DIAMOND_WALL",
    "WUX",
    "clearInterval",
    "filter",
    "ArrowDown",
    "backingStorePixelRatio",
    "function(id){this.socket[SENDWORD](WINDOW3[JSONWORD7].stringify([21,id]));hiddenUser.shop.open=false;}",
    "AMETHYST_SPIKE",
    "ZmaAutoCrown",
    "WUY",
    "function toString() { [native code] }",
    "range",
    "save",
    "Skin ID",
    "translateRecieved",
    "autorecycle",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/66.png",
    "equals",
    "margin",
    "EMERALD_AXE",
    "Bow Range",
    "cursor",
    "function(kick){_this.socket[SENDWORD](WINDOW8[JSONWORD8].stringify([20,hiddenUser.totem.id,hiddenUser.team[kick]]));}",
    "Bliz And Storm",
    "Animal Box",
    "function(id){hiddenUser.auto_feed.delay=0;hiddenUser.craft.do_craft(id);}",
    "cto_code",
    "revokeObjectURL",
    "secondOverlay",
    "input[type=\"checkbox\"][id=\"",
    "onsuccess",
    "WTZ",
    "HEAL",
    "AutoTame.angle",
    "input_ratio",
    "stone",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/47.png",
    "SmartCraft.active",
    "handleSubfolder",
    "outline",
    "AutoEmerald",
    "Give To Chest",
    "function(bandage){hiddenUser.bandage=bandage;}",
    "Failed To Draw Windmill Building Info",
    "Safe Point",
    "WUT",
    "PITCHFORK2",
    "function(){this.socket[SENDWORD](WINDOW1[JSONWORD1].stringify([11]));}",
    "EXTRACTOR_MACHINE_STONE",
    "oBackingStorePixelRatio",
    "STONE_WALL",
    "WQS",
    "Craft Item",
    "onopen",
    "AutoCrown",
    "documentElement",
    "TOPAZ_SPEAR",
    "BED",
    "GARLIC",
    "%cUI",
    "Parrots",
    "Aimbot.BowRange",
    "WTF",
    "GOLD_AXE",
    "cto_id",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/38.png",
    "Auto Furnace",
    "clientWidth",
    "EXTRACTOR_MACHINE_JADE",
    "30px",
    "SWORD_EMERALD",
    "TOMATO",
    "AutoFire.bind",
    "starve_token_id",
    "bagChanger.active",
    "WOOD_SPIKE_ALLY",
    "measureText",
    "input[type=\"number\"][id=\"",
    "Uint16Array",
    "STONE_HELMET",
    "mouseover",
    "borderRadius",
    "HAMMER_GOLD",
    "Put To Chest",
    "fireInfo",
    "AMETHYST_SPIKE_ALLY",
    "AutoBook",
    "Ocelots",
    "SmartCraft.bind",
    "lineCap",
    "WSF",
    "BIG_FIRE",
    "BOTTLE_FULL",
    "image/png",
    "WUL",
    "Tracers.Boars",
    "Tracers.BabyDragons",
    "game_canvas",
    "Tracers.GoldenChickens",
    "function(chest){this.socket[SENDWORD](WINDOW5[JSONWORD5].stringify([9, chest.pid, chest.iid]));}",
    "Market",
    "function(){this.timeout_number=0;this.connect_timeout();}",
    "EXTRACTOR_MACHINE_TOPAZ",
    "getItem",
    "blur",
    "Health",
    "#444",
    "AutoLand",
    "_level_",
    "clear",
    "getElementsByClassName",
    "drop",
    "autoseed",
    "... ",
    "Pathfinder Settings",
    "checkbox-wrapper",
    "REIDITE_SPEAR",
    "div",
    "height",
    "WTT",
    "ghostTime",
    "WQG",
    "https://fonts.googleapis.com/css2?family=Baloo+Paaji&display=swap",
    "offsetTop",
    "AutoBuild.mode",
    "function(id,i){this.socket[SENDWORD](WINDOW1[JSONWORD7].stringify([29,id]));}",
    "AutoFarm.BRY",
    "1766465128165",
    "Forest",
    "overlay",
    "Tracers.Vultures",
    "webkitBackingStorePixelRatio",
    "Hidden.active",
    "Sand Worms",
    "borderTopRightRadius",
    "xor",
    "#4CAF50",
    "sign_window",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/27.png",
    "Ukrainian",
    "Auto Steal",
    " button.active { background-color: transparent; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4); outline: 3.5px solid #60a5fa; } #",
    "blur(5px)",
    "argument",
    "Tracers.Parrots",
    "function(move){this.socket[SENDWORD](WINDOW12[JSONWORD12].stringify([2,move]));}",
    "AutoRespawn",
    "opacity",
    "orange",
    "items",
    "Tracers.Crabs",
    "WALL",
    "#660000",
    "websocket.network",
    "AutoEmerald.active",
    "Debugger",
    "undefined",
    "background-color 0.3s",
    "set",
    "TLX",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/61.png",
    "ALOE_VERA_SEED",
    "args1",
    "right",
    "Date",
    "__NW__",
    "bindLabel",
    "bookChanger",
    "health",
    "function(well){this.socket[SENDWORD](WINDOW4[JSONWORD2].stringify([30,well.pid,well.iid]));}",
    "PARROT",
    "Japanese",
    "Carrot Amount",
    "delete",
    "DIAMOND_SPIKE",
    "Estonian",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/57.png",
    "playerTimers",
    "function(){_this.socket[SENDWORD](WINDOW10[JSONWORD10].stringify([19]));}",
    "Roofs",
    "GIFT",
    "WUR",
    "STONE_SPIKE_ALLY",
    "Reidite Shields",
    "killPlayerToggle",
    "Failed To Bind Player Functions",
    "WUS",
    "setInterval",
    "Reidite Spiked Door",
    "responseText",
    "removeChild",
    "WUK",
    "Spectator.bind",
    "borderTopLeftRadius",
    "Escape",
    "15px",
    "contains",
    "REIDITE_DOOR_ALLY",
    "TOTEM",
    "2px 12px",
    "\\x5c\\x5c(\\x5cd{1,3})",
    "WRZ",
    "WSA",
    "lineJoin",
    "market.diamond",
    "(<\\s*|>\\s*)(?:0[xX][fF]{4}|65535)(\\s*>|\\s*)|(\\s*)(?:0[xX][fF]{4}|65535)(\\s*)(?=>|<)",
    "lineWidth",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/68.png",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/53.png",
    "unshift",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/65.png",
    "Extractor Take Key:",
    "minWidth",
    "level",
    "function(){let p=hiddenWorld.fast_units[hiddenUser.uid];if(p){let pi2=Math.PI*2;this.socket[SENDWORD](WINDOW3[JSONWORD3].stringify([10,hiddenUser.craft.preview,Math.floor((((p.angle+pi2)%pi2)*255)/pi2),hiddenUser.craft.mode,]));}}",
    "Player Tracers",
    "GOLD_SPIKE_ENEMY",
    "success",
    "focus",
    "now",
    "25bNsmis",
    " button:before { content: ''; position: absolute; left: -50%; top: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 10%, transparent 40%); transition: opacity 0.5s, transform 0.5s; opacity: 0; transform: scale(0); z-index: 0; } #",
    "Enemys",
    "target",
    "8px",
    "REIDITE_SHIELD",
    "Tracers.LavaDragons",
    "Foxs",
    "open",
    "send",
    "Russian",
    "gui",
    "WTR",
    "SPIKED_STONE_DOOR_ALLY",
    "data",
    "hitActive",
    "type",
    "Blue Crown Alt",
    "#2a2a2a",
    "PLAYERS",
    "Spanish",
    "AutoSeed.active",
    "AMETHYST_DOOR",
    "#000c78",
    "vehicle",
    "postMessage",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/52.png",
    "WOOD_HELMET",
    "ZmaRedGold",
    "BEAR",
    "wait",
    "Craft Mode",
    "wood",
    "boxInfo",
    "Attack Mode",
    "WSG",
    "setProperty",
    "TOMATO_SEED",
    "Extra in map:",
    "WITCH",
    "tokenHolder.bluecrown",
    "slice",
    "STONE_DOOR_ENEMY",
    "strokeText",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/24.png",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/10.png",
    "buttonTextProperty",
    "SWORD_COAL",
    "size",
    "buildType",
    "766080UyhOkj",
    "100px",
    "grabbing",
    "maxWidth",
    "totemOnMap.x",
    "#BBB",
    "nangle",
    "toggleGuiKey",
    "FIRE",
    "#F9E8A2",
    "drawSpike",
    "body",
    "lineHeight",
    "Failed To Draw Animal Tracers",
    "Math",
    "buildingInfo",
    "Tracers.Ocelots",
    "Sandworms",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/23.png",
    "PathFinder.bind",
    "0px 0px 0px 4px",
    "Wolfs",
    "WOOD_DOOR",
    "VOID",
    "community",
    "Time: ",
    "visible",
    "rgb(55, 55, 55)",
    "insertAdjacentHTML",
    "color: ",
    "color",
    "Golden Hen",
    "Bag",
    "Please wait 5 seconds before using that!",
    "ARCT cheat",
    "Golden Hens",
    "keys",
    "textLabel",
    "\"%c To %c\"",
    "flexShrink",
    "classList",
    "PILOT_HELMET",
    "WTP",
    "input[type=\"text\"][id=\"",
    "KeyH",
    "visibilityState",
    "GOLD_DOOR_SPIKE",
    "drawGame",
    "Brightness",
    "Reidite Walls",
    "5px",
    "darkMode",
    "bandage",
    "CRAB",
    "AutoBreadPut",
    "market.reidite",
    "AutoWall.mode",
    "ArrowLeft",
    "%cCLIENT",
    "Krakens",
    "pid",
    "log",
    "AutoRecycle.bind",
    "rangeValueDisplay",
    "putToChest",
    "transform",
    "AutoSteal",
    "2887536QfVDTS",
    "Key:",
    "fontFamily",
    "stroke",
    "function(id,n){hiddenUser.craft.preview=-1;hiddenUser.inv.decrease(id,n,hiddenUser.inv.find_item(id));hiddenUser.craft.update();}",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/42.png",
    "function(chest){this.socket[SENDWORD](WINDOW7[JSONWORD7].stringify([16,chest.iid]));}",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/39.png",
    "charCodeAt",
    "Smooth Roofs",
    "showLeaderBoardLevels",
    "sentLang",
    "REIDITE_DOOR_SPIKE",
    "background 0.3s, transform 0.2s",
    "handleItem",
    "createElement",
    "80px",
    "AMETHYST_DOOR_ENEMY",
    "JADE_BOW",
    "WQM",
    "PLOT",
    "EXTRACTOR_MACHINE_DIAMOND",
    "WUQ",
    "TOPAZ_AXE",
    "Reidite Swords",
    "#FFA500",
    "AutoBreadTake.active",
    "SPIKED_DIAMOND_DOOR_ALLY",
    "SPIKED_DIAMOND_DOOR_ENEMY",
    "⚠️ You have reached your maximum holds! ⚠️",
    "vehicle_fx5",
    "code",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/44.png",
    "Copy this",
    "tower_fx",
    "DIAMOND_SPEAR",
    "Object",
    "furnace",
    "Tracers.Dragons",
    "WVG",
    "localToken",
    "AutoBreadTake",
    "X: ",
    "Roofs Opacity",
    "red",
    "WST",
    "Auto Crown",
    "cto_cache",
    "Failed To Draw Extractor Building Info",
    "translateX(-50%)",
    "frames",
    "chat_block",
    "WQP",
    "exec",
    "EXPLORER_HAT",
    "BABY_DRAGON",
    "context",
    "length",
    "WOOD_DOOR_SPIKE",
    "Equip After Place",
    "Chest Info",
    "Translation",
    "tokenHolder.autoseed",
    "action",
    "Mode",
    "Failed To Bind Door Drawing",
    "Token",
    "68970DjvdAf",
    "DIAMOND_SPIKE_ENEMY",
    "abs",
    "display",
    " ...",
    "Failed To Define Spike Drawing",
    "number",
    "Ocean",
    "WATERMELON",
    "ZmaRedGold.active",
    "key",
    "fast_units",
    "Hood",
    "AutoFurnace:",
    "WQE",
    "DIAMOND_SPIKE_ALLY",
    "backdropFilter",
    "Aimbot.bind",
    "WSP",
    "color: lime;",
    "https://raw.githubusercontent.com/shwtdev/Void_V6/refs/heads/main/71.png",
    "removeEventListener",
    "WTQ",
    "AutoBreadTake.bind",
    "fast-unique-numbers",
    "EXTRACTOR_MACHINE_IRON",
    "accChanger",
    "Failed To Draw Fire Info"
  ];
  _0x3f91 = function () {
    return _0x5755cf;
  };
  return _0x3f91();
}


/* --- ARCT Cheats: Ally Radar & Inventory Module (Integrated) --- */
window.arctAllies = {};
(function() {
    function initRadar() {
        try {
            console.log("%c[ARCT Radar] Фоновый модуль с инвентарем запущен!", "color: lime;");
            const ws = new WebSocket('wss://mazurenok.duckdns.org');
            
            ws.onopen = () => console.log("%c[ARCT Radar] Подключено к серверу!", "color: lime;");
            
            ws.onmessage = (e) => {
                try { window.arctAllies = JSON.parse(e.data); } catch(err){}
            };
            
            setInterval(() => {
                if (ws.readyState === WebSocket.OPEN && window.v2603 && window.v2605 && window.v2605.uid) {
                    const me = window.v2603.fast_units[window.v2605.uid];
                    if (me) {
                        // 1. Берем ник из памяти браузера или из игры
                        let savedName = localStorage.getItem('arct_radar_name');
                        let myName = (savedName && savedName.trim() !== "") ? savedName.trim() : "";
                        if (myName === "") {
                            let nickInput = document.getElementById('nickname');
                            if (nickInput && nickInput.value && nickInput.value.trim() !== "") {
                                myName = nickInput.value.trim();
                            } else {
                                myName = "ARCT";
                            }
                        }

                        // 2. Отправляем позицию и ник (старый рабочий функционал)
                        ws.send(JSON.stringify({ type: 'pos', x: me.x, y: me.y, name: myName }));

                        // 3. Отправляем инвентарь отдельным пакетом (новая функция, не ломающая старое)
                        let myInventory = {};
                        try {
                            let invObj = window.v2604 && window.v2604.WUU ? window.v2604.WUU.WUV : null;
                            if (invObj) {
                                for (let itemId in invObj) {
                                    if (invObj[itemId] > 0) {
                                        myInventory[itemId] = invObj[itemId];
                                    }
                                }
                            }
                        } catch(err) {}

                        ws.send(JSON.stringify({ type: 'inv', inv: myInventory }));
                    }
                }
            }, 500);
        } catch(e){}
    }

    setTimeout(initRadar, 3000);
})();
// --- ARCT WEBSOCKET SHOP HANDLER (Вставити в самий кінець коду) ---
(function() {
    window.arctSendBuyPacket = async function(itemIndex, totalAmount) {
        let sock = window.v2600;
        if (!sock || !sock.websocket) {
            for (let k in window) {
                if (window[k] && typeof window[k] === 'object' && window[k].websocket && window[k].websocket.readyState === 1) {
                    sock = window[k]; break;
                }
            }
        }
        
        if (!sock || !sock.websocket || sock.websocket.readyState !== 1) return;

        if (totalAmount > 10000) totalAmount = 10000;
        if (totalAmount <= 0) return;

        let remaining = totalAmount;

        while (remaining > 0) {
            let batch = remaining > 83 ? 80 : remaining;
            
            // Відправляємо пакет через сокет [39, кількість, ID_предмета]
            let packet = [39, batch, itemIndex];
            WebSocket.prototype.send.call(sock.websocket, JSON.stringify(packet));
            
            remaining -= batch;
            
            if (remaining > 0) {
                await new Promise(r => setTimeout(r, 100)); 
            }
        }
    };
})();
